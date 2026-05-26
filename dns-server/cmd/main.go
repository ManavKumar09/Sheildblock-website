package main

import (
	"context"
	"crypto/tls"
	"flag"
	"fmt"
	"log"
	"time"

	"shieldblock/internal/analytics"
	"shieldblock/internal/auth"
	"shieldblock/internal/dns"
	"shieldblock/internal/filter"
	"shieldblock/internal/metrics"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/valkey-io/valkey-go"
)

func main() {
	certFile := flag.String("tls-cert", "/etc/letsencrypt/live/dns.shieldblock.in/fullchain.pem", "Path to the TLS certificate")
	keyFile := flag.String("tls-key", "/etc/letsencrypt/live/dns.shieldblock.in/privkey.pem", "Path to the TLS private key")
	valkeyAddr := flag.String("valkey-addr", "127.0.0.1:6379", "Valkey server address")
	chAddr := flag.String("clickhouse-addr", "172.31.43.17:9000", "Clickhouse server address")
	dataDir := flag.String("data-dir", "~/data", "Path to the data directory")
	flag.Parse()

	// 1. Init Metrics Server
	metrics.StartServer("127.0.0.1:8080")

	// 2. Init Valkey
	valkeyClient, err := valkey.NewClient(valkey.ClientOption{InitAddress: []string{*valkeyAddr}})
	if err != nil {
		log.Fatal(err)
	}
	defer valkeyClient.Close()

	// 3. Init Clickhouse
	chConn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{*chAddr},
		Auth: clickhouse.Auth{
			Database: "app",
			Username: "admin",
			Password: "admin123",
		},
	})
	if err != nil {
		log.Fatal(err)
	}
	defer chConn.Close()

	// 4. Initialize Core Components
	authDB := auth.NewDB(valkeyClient)
	authCache := auth.NewCache(authDB, 5*time.Minute)
	analyticsDB := analytics.NewDB(chConn)
	blocklist := filter.NewBlocklist(*dataDir)

	// 5. Wire Readiness Check (Valkey + ClickHouse health)
	metrics.ReadyCheck = func() error {
		if err := valkeyClient.Do(context.Background(), valkeyClient.B().Ping().Build()).Error(); err != nil {
			return fmt.Errorf("valkey: %w", err)
		}
		if err := chConn.Ping(context.Background()); err != nil {
			return fmt.Errorf("clickhouse: %w", err)
		}
		return nil
	}

	server := dns.NewServer(authCache, analyticsDB, blocklist, "1.1.1.1:853", valkeyClient)

	// 5. Start DoT Listener
	cert, err := tls.LoadX509KeyPair(*certFile, *keyFile)
	if err != nil {
		log.Fatal("Failed to load TLS cert/key:", err)
	}

	config := &tls.Config{Certificates: []tls.Certificate{cert}}
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
		go server.HandleConnection(conn)
	}
}
