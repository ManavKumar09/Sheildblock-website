package dns

import (
	"context"
	"crypto/tls"
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"net"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"shieldblock/internal/analytics"
	"shieldblock/internal/auth"
	"shieldblock/internal/filter"
	"shieldblock/internal/metrics"

	"github.com/miekg/dns"
	"github.com/valkey-io/valkey-go"
)

const (
	MAX_LENGTH       = 2 * 1024
	maxWorkers       = 8     // Max parallel queries per connection
	upstreamPoolSize = 16    // Reusable upstream TLS connections
	valkeyBufSize    = 10000 // Bounded Valkey publish buffer
	valkeyTimeout    = 2 * time.Second
	upstreamTimeout  = 5 * time.Second
	writeTimeout     = 5 * time.Second
)

type Server struct {
	authCache    *auth.Cache
	analytics    *analytics.DB
	blocklist    *filter.Blocklist
	upstream     string
	valkey       valkey.Client
	upstreamPool chan *dns.Conn  // Reusable upstream connections
	valkeyEvents chan []byte     // Bounded publish channel
}

func NewServer(authCache *auth.Cache, an *analytics.DB, bl *filter.Blocklist, upstream string, vc valkey.Client) *Server {
	s := &Server{
		authCache:    authCache,
		analytics:    an,
		blocklist:    bl,
		upstream:     upstream,
		valkey:       vc,
		upstreamPool: make(chan *dns.Conn, upstreamPoolSize),
		valkeyEvents: make(chan []byte, valkeyBufSize),
	}

	go s.valkeyPublisher()
	return s
}

// ── Upstream Connection Pool ──

func (s *Server) dialUpstream() (*dns.Conn, error) {
	return dns.DialTimeout("tcp-tls", s.upstream, upstreamTimeout)
}

func (s *Server) getUpstreamConn() (*dns.Conn, error) {
	select {
	case c := <-s.upstreamPool:
		return c, nil
	default:
		return s.dialUpstream()
	}
}

func (s *Server) putUpstreamConn(c *dns.Conn) {
	select {
	case s.upstreamPool <- c:
	default:
		c.Close() // Pool full, discard
	}
}

func (s *Server) exchangeUpstream(msg *dns.Msg) (*dns.Msg, error) {
	for i := 0; i < 3; i++ { // Try up to 3 times to account for multiple stale connections
		conn, err := s.getUpstreamConn()
		if err != nil {
			return nil, err
		}

		conn.SetDeadline(time.Now().Add(upstreamTimeout))

		if err := conn.WriteMsg(msg); err != nil {
			conn.Close()
			continue // connection likely closed by upstream, retry
		}

		resp, err := conn.ReadMsg()
		if err != nil {
			conn.Close()
			continue // connection likely closed by upstream, retry
		}

		if resp.Id != msg.Id {
			conn.Close()
			return nil, fmt.Errorf("upstream response ID mismatch: sent %d, got %d", msg.Id, resp.Id)
		}

		s.putUpstreamConn(conn)
		return resp, nil
	}

	return nil, fmt.Errorf("upstream request failed after retries")
}

// ── Bounded Valkey Publisher ──

func (s *Server) valkeyPublisher() {
	for packet := range s.valkeyEvents {
		ctx, cancel := context.WithTimeout(context.Background(), valkeyTimeout)
		err := s.valkey.Do(ctx, s.valkey.B().Publish().Channel("live_dns_logs").Message(string(packet)).Build()).Error()
		cancel()
		if err != nil {
			log.Println("valkey publish error:", err)
		}
	}
}

// ── Binary Packet Encoding ──

// encode maps your binary packet structure
func encode(hash string, domain string, isBlocked bool) []byte {
	domainBytes := []byte(domain)
	buf := make([]byte, 60+1+2+len(domainBytes))

	// Pad or truncate hash to exactly 60 bytes
	hashBytes := []byte(hash)
	if len(hashBytes) > 60 {
		hashBytes = hashBytes[:60]
	}
	copy(buf[0:60], hashBytes)

	if isBlocked {
		buf[60] = 1
	} else {
		buf[60] = 0
	}

	binary.BigEndian.PutUint16(buf[61:63], uint16(len(domainBytes)))
	copy(buf[63:], domainBytes)

	return buf
}

// ── Connection Handler (Phase 5: Connection-Scoped Auth) ──

func (s *Server) HandleConnection(conn net.Conn) {
	defer conn.Close()

	tlsConn, ok := conn.(*tls.Conn)
	if !ok {
		log.Println("not a tls connection")
		return
	}

	if err := tlsConn.Handshake(); err != nil {
		log.Println("tls handshake error:", err)
		return
	}

	sni := tlsConn.ConnectionState().ServerName
	var userHash string
	parts := strings.Split(sni, ".")
	if len(parts) > 0 && parts[0] != "" {
		userHash = parts[0]
	} else {
		userHash = "anonymous"
	}

	user, err := s.authCache.GetUser(userHash)
	if err != nil {
		log.Println("auth error:", err)
		return
	}

	log.Printf("Connection established - SNI: %s, User: %s", sni, user.Hash)

	// Phase 7: Single writer goroutine prevents TCP write interleaving.
	// All workers send assembled response bytes here; one goroutine writes them
	// to the socket sequentially so DNS-over-TLS framing is never corrupted.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	responses := make(chan []byte, maxWorkers)
	writerDone := make(chan struct{})
	go func() {
		defer close(writerDone)
		for resp := range responses {
			conn.SetWriteDeadline(time.Now().Add(writeTimeout))
			if _, err := conn.Write(resp); err != nil {
				log.Println("write error:", err)
				cancel() // Signal reader + workers to stop
				for range responses {
				} // Drain channel
				return
			}
		}
	}()

	// Phase 6: Bounded parallel query processing.
	// Semaphore limits concurrent goroutines to maxWorkers per connection,
	// preventing goroutine explosion while utilizing multicore concurrency.
	sem := make(chan struct{}, maxWorkers)
	var wg sync.WaitGroup

	for {
		select {
		case <-ctx.Done():
			goto cleanup
		default:
		}

		conn.SetReadDeadline(time.Now().Add(15 * time.Second))

		lengthBuf := make([]byte, 2)
		if _, err := io.ReadFull(conn, lengthBuf); err != nil {
			if err != io.EOF && err != io.ErrUnexpectedEOF {
				log.Println("length read error:", err)
			}
			break
		}

		length := binary.BigEndian.Uint16(lengthBuf)
		if length > MAX_LENGTH {
			log.Println("packet too large:", length)
			break
		}

		dataBuf := make([]byte, length)
		if _, err := io.ReadFull(conn, dataBuf); err != nil {
			log.Println("dns packet read error:", err)
			break
		}

		select {
		case sem <- struct{}{}: // Acquire worker slot
		case <-ctx.Done():
			goto cleanup
		}

		wg.Add(1)
		go func(data []byte) {
			defer func() { <-sem; wg.Done() }()
			s.handleQuery(ctx, responses, user, data)
		}(dataBuf)
	}

cleanup:
	wg.Wait()
	close(responses)
	<-writerDone
}

// ── Query Handler ──

func (s *Server) handleQuery(ctx context.Context, responses chan<- []byte, user *auth.User, data []byte) {
	start := time.Now()
	atomic.AddUint64(&metrics.Global.TotalQueries, 1)

	msg := new(dns.Msg)
	if err := msg.Unpack(data); err != nil {
		log.Println("dns unpack error:", err)
		return
	}

	if len(msg.Question) == 0 {
		return
	}

	q := msg.Question[0]
	domain := strings.ToLower(q.Name)
	recordType := dns.TypeToString[q.Qtype] // Gets "A", "AAAA", "MX", etc.

	// Check domain against user's specific bitmask policy
	isBlocked, filterName := s.blocklist.Check(domain, user.Policy.BlockedCategories)

	var respMsg *dns.Msg

	if isBlocked {
		atomic.AddUint64(&metrics.Global.BlockedQueries, 1)
		respMsg = new(dns.Msg)
		respMsg.SetReply(msg)
		// Return 0.0.0.0 for blocked queries
		if q.Qtype == dns.TypeA {
			rr, _ := dns.NewRR(q.Name + " 3600 IN A 0.0.0.0")
			respMsg.Answer = append(respMsg.Answer, rr)
		} else if q.Qtype == dns.TypeAAAA {
			rr, _ := dns.NewRR(q.Name + " 3600 IN AAAA ::")
			respMsg.Answer = append(respMsg.Answer, rr)
		}
	} else {
		// Forward upstream via connection pool
		r, err := s.exchangeUpstream(msg)
		if err != nil {
			log.Println("upstream error:", err)
			respMsg = new(dns.Msg)
			respMsg.SetRcode(msg, dns.RcodeServerFailure)
		} else {
			respMsg = r
		}
	}

	latency := float32(time.Since(start).Microseconds()) / 1000.0 // Accurate MS float

	// 1. Send to ClickHouse Batch Worker
	s.analytics.Write(analytics.Event{
		Timestamp:      time.Now(),
		ConfigHash:     user.Hash,
		Domain:         domain,
		RecordType:     recordType,
		IsBlocked:      isBlocked,
		ResponseTimeMS: latency,
		BlocklistName:  filterName,
	})

	// 2. Publish to Valkey via bounded channel (replaces unbounded goroutines)
	packet := encode(user.Hash, domain, isBlocked)
	select {
	case s.valkeyEvents <- packet:
	default:
		log.Println("valkey publish buffer full, dropping event")
	}

	// 3. Send response through single writer (prevents TCP stream corruption)
	respBytes, err := respMsg.Pack()
	if err != nil {
		log.Println("dns pack error:", err)
		return
	}

	// Assemble length prefix + body into single buffer for atomic write
	buf := make([]byte, 2+len(respBytes))
	binary.BigEndian.PutUint16(buf[:2], uint16(len(respBytes)))
	copy(buf[2:], respBytes)

	select {
	case responses <- buf:
	case <-ctx.Done():
	}
}
