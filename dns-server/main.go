package main

import (
	"context"
	"crypto/tls"
	"encoding/binary"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/miekg/dns"
	"github.com/valkey-io/valkey-go"
)

const MAX_LENGTH = 2 * 1024

// --- Metrics (Phase 3) ---
type Metrics struct {
	TotalQueries    uint64 `json:"total_queries"`
	BlockedQueries  uint64 `json:"blocked_queries"`
	AuthLookups     uint64 `json:"auth_lookups"`
	AuthCacheHits   uint64 `json:"auth_cache_hits"`
	AuthCacheMisses uint64 `json:"auth_cache_misses"`
}

var metrics Metrics

// --- Analytics (Phase 3) ---
type AnalyticsEvent struct {
	UserHash  string        `json:"user_hash"`
	Domain    string        `json:"domain"`
	Blocked   bool          `json:"blocked"`
	Latency   time.Duration `json:"latency"`
	Timestamp time.Time     `json:"timestamp"`
}

type AnalyticsDB struct {
	conn driver.Conn
}

func NewAnalyticsDB(conn driver.Conn) *AnalyticsDB {
	// Initialize table
	err := conn.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS dns_queries (
			user_hash String,
			domain String,
			blocked UInt8,
			latency_ms UInt64,
			timestamp DateTime
		) ENGINE = MergeTree()
		ORDER BY (timestamp, user_hash)
	`)
	if err != nil {
		log.Println("clickhouse init error:", err)
	}

	return &AnalyticsDB{
		conn: conn,
	}
}

func bToU8(b bool) uint8 {
	if b {
		return 1
	}
	return 0
}

// Write performs direct analytical DB writes (Phase 3)
func (db *AnalyticsDB) Write(event AnalyticsEvent) {
	err := db.conn.Exec(context.Background(), `
		INSERT INTO dns_queries (user_hash, domain, blocked, latency_ms, timestamp)
		VALUES (?, ?, ?, ?, ?)
	`, event.UserHash, event.Domain, bToU8(event.Blocked), event.Latency.Milliseconds(), event.Timestamp)

	if err != nil {
		log.Println("clickhouse insert error:", err)
	}
}

// --- Auth (Phase 3 & 4) ---
type Policy struct {
	BlockedCategories uint32
}

type User struct {
	Hash   string
	Policy Policy
}

type AuthDB struct {
	client valkey.Client
}

func NewAuthDB(client valkey.Client) *AuthDB {
	return &AuthDB{client: client}
}

// GetUser performs an authentication DB lookup
func (db *AuthDB) GetUser(hash string) (*User, error) {
	atomic.AddUint64(&metrics.AuthLookups, 1)

	// Fetch policy from Valkey
	val, err := db.client.Do(context.Background(), db.client.B().Get().Key(hash).Build()).ToString()
	if err != nil {
		if valkey.IsValkeyNil(err) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	var policy uint32
	if _, err := fmt.Sscanf(val, "%d", &policy); err != nil {
		policy = 1 // default policy if parsing fails
	}

	return &User{
		Hash: hash,
		Policy: Policy{
			BlockedCategories: policy,
		},
	}, nil
}

type cacheEntry struct {
	user      *User
	expiresAt time.Time
}

// AuthCache implements Phase 4: Authentication Cache
type AuthCache struct {
	db    *AuthDB
	cache map[string]cacheEntry
	mu    sync.RWMutex
	ttl   time.Duration
}

func NewAuthCache(db *AuthDB, ttl time.Duration) *AuthCache {
	return &AuthCache{
		db:    db,
		cache: make(map[string]cacheEntry),
		ttl:   ttl,
	}
}

func (c *AuthCache) GetUser(hash string) (*User, error) {
	c.mu.RLock()
	entry, exists := c.cache[hash]
	c.mu.RUnlock()

	if exists && time.Now().Before(entry.expiresAt) {
		atomic.AddUint64(&metrics.AuthCacheHits, 1)
		return entry.user, nil
	}

	atomic.AddUint64(&metrics.AuthCacheMisses, 1)
	user, err := c.db.GetUser(hash)
	if err != nil {
		return nil, err
	}

	c.mu.Lock()
	c.cache[hash] = cacheEntry{
		user:      user,
		expiresAt: time.Now().Add(c.ttl),
	}
	c.mu.Unlock()

	return user, nil
}

// --- Filter (Phase 2) ---
type Blocklist struct {
	domains map[string]bool
	mu      sync.RWMutex
}

func NewBlocklist() *Blocklist {
	bl := &Blocklist{
		domains: make(map[string]bool),
	}
	// Phase 2: Basic exact-match blocking domains
	bl.domains["ads.example.com."] = true
	bl.domains["tracker.example.com."] = true
	bl.domains["malware.example.com."] = true
	bl.domains["doubleclick.net."] = true
	return bl
}

func (bl *Blocklist) IsBlocked(domain string) bool {
	bl.mu.RLock()
	defer bl.mu.RUnlock()
	return bl.domains[domain]
}

// --- Server & Upstream (Phase 1, 3, 5) ---
type DNSServer struct {
	authCache *AuthCache
	analytics *AnalyticsDB
	blocklist *Blocklist
	upstream  string
}

func NewDNSServer(authCache *AuthCache, analytics *AnalyticsDB, blocklist *Blocklist, upstream string) *DNSServer {
	return &DNSServer{
		authCache: authCache,
		analytics: analytics,
		blocklist: blocklist,
		upstream:  upstream,
	}
}

func (s *DNSServer) handleConnection(conn net.Conn) {
	defer conn.Close()

	tlsConn, ok := conn.(*tls.Conn)
	if !ok {
		log.Println("not a tls connection")
		return
	}

	// Phase 5: Authenticate during TLS handshake
	if err := tlsConn.Handshake(); err != nil {
		log.Println("tls handshake error:", err)
		return
	}

	state := tlsConn.ConnectionState()
	sni := state.ServerName

	// Extract user hash from SNI (e.g. hash.dns.shieldblock.in)
	var userHash string
	parts := strings.Split(sni, ".")
	if len(parts) > 0 && parts[0] != "" {
		userHash = parts[0]
	} else {
		userHash = "anonymous"
	}

	// Phase 5: Connection-Scoped Authentication
	// Lookup policy once per connection and store in connection context
	user, err := s.authCache.GetUser(userHash)
	if err != nil {
		log.Println("auth error:", err)
		return
	}

	log.Printf("Connection established & authenticated - SNI: %s, User: %s", sni, user.Hash)

	// Process queries sequentially (Parallel processing is Phase 6)
	for {
		// Read packet length
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

		// Read packet data
		dataBuf := make([]byte, length)
		if _, err := io.ReadFull(conn, dataBuf); err != nil {
			log.Println("dns packet read error:", err)
			return
		}

		s.handleQuery(conn, user, dataBuf)
	}
}

func (s *DNSServer) handleQuery(conn net.Conn, user *User, data []byte) {
	start := time.Now()
	atomic.AddUint64(&metrics.TotalQueries, 1)

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

	// Phase 2: Basic DNS Filtering
	isBlocked := s.blocklist.IsBlocked(domain)

	var respMsg *dns.Msg

	if isBlocked {
		atomic.AddUint64(&metrics.BlockedQueries, 1)
		respMsg = new(dns.Msg)
		respMsg.SetReply(msg)
		// Return 0.0.0.0
		rr, _ := dns.NewRR(q.Name + " 3600 IN A 0.0.0.0")
		respMsg.Answer = append(respMsg.Answer, rr)
	} else {
		// Phase 1: Forward upstream via DoT
		c := new(dns.Client)
		c.Net = "tcp-tls"
		c.Timeout = 5 * time.Second

		// Note: Phase 1 is Minimal DNS-over-TLS Forwarder
		r, _, err := c.Exchange(msg, s.upstream)
		if err != nil {
			log.Println("upstream exchange error:", err)
			respMsg = new(dns.Msg)
			respMsg.SetRcode(msg, dns.RcodeServerFailure)
		} else {
			respMsg = r
		}
	}

	// Phase 3: Direct Analytics Writes
	// This happens inside the hot path as described in the bottleneck
	s.analytics.Write(AnalyticsEvent{
		UserHash:  user.Hash,
		Domain:    domain,
		Blocked:   isBlocked,
		Latency:   time.Since(start),
		Timestamp: time.Now(),
	})

	// Pack and send response
	respBytes, err := respMsg.Pack()
	if err != nil {
		log.Println("dns pack error:", err)
		return
	}

	lenBuf := make([]byte, 2)
	binary.BigEndian.PutUint16(lenBuf, uint16(len(respBytes)))

	if _, err := conn.Write(lenBuf); err != nil {
		log.Println("write length error:", err)
		return
	}
	if _, err := conn.Write(respBytes); err != nil {
		log.Println("write response error:", err)
		return
	}
}

// --- Startup & Metrics Server (Phase 3) ---
func startMetricsServer() {
	mux := http.NewServeMux()

	// basic /healthz
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// basic /readyz
	mux.HandleFunc("/readyz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("READY"))
	})

	// internal metrics
	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		m := Metrics{
			TotalQueries:    atomic.LoadUint64(&metrics.TotalQueries),
			BlockedQueries:  atomic.LoadUint64(&metrics.BlockedQueries),
			AuthLookups:     atomic.LoadUint64(&metrics.AuthLookups),
			AuthCacheHits:   atomic.LoadUint64(&metrics.AuthCacheHits),
			AuthCacheMisses: atomic.LoadUint64(&metrics.AuthCacheMisses),
		}
		json.NewEncoder(w).Encode(m)
	})

	go func() {
		log.Println("Metrics server listening on :8080")
		if err := http.ListenAndServe(":8080", mux); err != nil {
			log.Fatalf("Metrics server failed: %v", err)
		}
	}()
}

func main() {
	certFile := flag.String("tls-cert", "server.crt", "Path to the TLS certificate")
	keyFile := flag.String("tls-key", "server.key", "Path to the TLS private key")
	valkeyAddr := flag.String("valkey-addr", "127.0.0.1:6379", "Valkey server address")
	chAddr := flag.String("clickhouse-addr", "127.0.0.1:9000", "Clickhouse server address")
	flag.Parse()

	// Valkey Client
	valkeyClient, err := valkey.NewClient(valkey.ClientOption{InitAddress: []string{*valkeyAddr}})
	if err != nil {
		log.Fatal(err)
	}
	defer valkeyClient.Close()

	// Clickhouse Client
	chConn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{*chAddr},
		Auth: clickhouse.Auth{
			Database: "default",
			Username: "default",
			Password: "",
		},
	})
	if err != nil {
		log.Fatal(err)
	}
	defer chConn.Close()

	// Initialize components
	authDB := NewAuthDB(valkeyClient)
	authCache := NewAuthCache(authDB, 5*time.Minute)
	analytics := NewAnalyticsDB(chConn)
	blocklist := NewBlocklist()

	// 1.1.1.1:853 is Cloudflare's DoT service
	server := NewDNSServer(authCache, analytics, blocklist, "1.1.1.1:853")

	startMetricsServer()

	// Phase 1: DoT server on :853 with valid TLS cert
	cert, err := tls.LoadX509KeyPair(*certFile, *keyFile)
	if err != nil {
		log.Fatal("Failed to load TLS cert/key:", err)
	}

	config := &tls.Config{
		Certificates: []tls.Certificate{cert},
	}

	listener, err := tls.Listen("tcp", ":853", config)
	if err != nil {
		log.Fatal("Failed to start DoT listener:", err)
	}
	defer listener.Close()

	log.Println("ShieldBlock DoT server listening on :853")

	for {
		conn, err := listener.Accept()
		if err != nil {
			log.Println("accept error:", err)
			continue
		}

		go server.handleConnection(conn)
	}
}
