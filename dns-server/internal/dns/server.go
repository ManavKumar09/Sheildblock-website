package dns

import (
	"crypto/tls"
	"encoding/binary"
	"io"
	"log"
	"net"
	"strings"
	"sync/atomic"
	"time"

	"shieldblock/internal/analytics"
	"shieldblock/internal/auth"
	"shieldblock/internal/filter"
	"shieldblock/internal/metrics"

	"github.com/miekg/dns"
)

const MAX_LENGTH = 2 * 1024

type Server struct {
	authCache *auth.Cache
	analytics *analytics.DB
	blocklist *filter.Blocklist
	upstream  string
	valkey    valkey.Client
}

func NewServer(authCache *auth.Cache, an *analytics.DB, bl *filter.Blocklist, upstream string, vc valkey.Client) *Server {
	return &Server{
		authCache: authCache,
		analytics: an,
		blocklist: bl,
		upstream:  upstream,
		valkey:    vc,
	}
}

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

	for {
		conn.SetReadDeadline(time.Now().Add(15 * time.Second))
		
		lengthBuf := make([]byte, 2)
		if _, err := io.ReadFull(conn, lengthBuf); err != nil {
			if err != io.EOF && err != io.ErrUnexpectedEOF {
				log.Println("length read error:", err)
			}
			return
		}

		length := binary.BigEndian.Uint16(lengthBuf)
		if length > MAX_LENGTH {
			log.Println("packet too large:", length)
			return
		}

		dataBuf := make([]byte, length)
		if _, err := io.ReadFull(conn, dataBuf); err != nil {
			log.Println("dns packet read error:", err)
			return
		}

		s.handleQuery(conn, user, dataBuf)
	}
}

func (s *Server) handleQuery(conn net.Conn, user *auth.User, data []byte) {
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

	// NEW: Check domain against user's specific bitmask policy
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
		// Forward upstream
		c := new(dns.Client)
		c.Net = "tcp-tls"
		c.Timeout = 5 * time.Second

		r, _, err := c.Exchange(msg, s.upstream)
		if err != nil {
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

	// 2. Publish Binary Packet to Valkey (Non-blocking)
	go func() {
		packet := encode(user.Hash, domain, isBlocked)
		err := s.valkey.Do(context.Background(), s.valkey.B().Publish().Channel("live_dns_logs").Message(string(packet)).Build()).Error()
		if err != nil {
			log.Println("valkey publish error:", err)
		}
	}()

	// Respond to client
	respBytes, err := respMsg.Pack()
	if err == nil {
		lenBuf := make([]byte, 2)
		binary.BigEndian.PutUint16(lenBuf, uint16(len(respBytes)))
		conn.Write(lenBuf)
		conn.Write(respBytes)
	}
}