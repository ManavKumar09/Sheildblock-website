package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/miekg/dns"
)

var blocklist = map[string]bool{
	"ads.google.com.":  true,
	"doubleclick.net.": true,
}

const forwardToCloudflare = "1.1.1.1:53"

func normalizeDomain(name string) string {
	n := strings.ToLower(name)
	if !strings.HasSuffix(n, ".") {
		n += "."
	}
	return n
}

func isBlocked(name string) bool {
	domain := normalizeDomain(name)
	if blocklist[domain] {
		return true
	}

	labels := strings.Split(strings.TrimSuffix(domain, "."), ".")
	for i := 1; i < len(labels); i++ {
		parent := strings.Join(labels[i:], ".") + "."
		if blocklist[parent] {
			return true
		}
	}
	return false
}

func blockedRR(q dns.Question) dns.RR {
	switch q.Qtype {
	case dns.TypeAAAA:
		rr, err := dns.NewRR(q.Name + " 60 IN AAAA ::")
		if err != nil {
			return nil
		}
		return rr
	case dns.TypeA:
		rr, err := dns.NewRR(q.Name + " 60 IN A 0.0.0.0")
		if err != nil {
			return nil
		}
		return rr
	default:
		return nil
	}
}

func handleDNS(w dns.ResponseWriter, r *dns.Msg) {
	msg := new(dns.Msg)
	msg.SetReply(r)

	for _, q := range r.Question {
		domain := q.Name

		if isBlocked(domain) {
			log.Println("BLOCKED:", domain)

			if rr := blockedRR(q); rr != nil {
				msg.Answer = append(msg.Answer, rr)
			}
			continue
		}
	}

	if len(msg.Answer) == 0 {
		log.Println("FORWARD:", r.Question)
		resp, err := dns.Exchange(r, forwardToCloudflare)
		if err != nil {
			log.Println("UPSTREAM ERROR:", err)
			msg.Rcode = dns.RcodeServerFailure
			_ = w.WriteMsg(msg)
			return
		}
		resp.Id = r.Id
		_ = w.WriteMsg(resp)
		return
	}

	w.WriteMsg(msg)
}

func main() {
	dns.HandleFunc(".", handleDNS)

	udpServer := &dns.Server{
		Addr: ":8053",
		Net:  "udp",
	}
	tcpServer := &dns.Server{
		Addr: ":8053",
		Net:  "tcp",
	}

	errCh := make(chan error, 2)

	go func() {
		log.Println("DNS server listening on UDP :8053")
		if err := udpServer.ListenAndServe(); err != nil {
			errCh <- fmt.Errorf("udp server error: %w", err)
		}
	}()

	go func() {
		log.Println("DNS server listening on TCP :8053")
		if err := tcpServer.ListenAndServe(); err != nil {
			errCh <- fmt.Errorf("tcp server error: %w", err)
		}
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-sigCh:
		log.Printf("received signal %s, shutting down", sig)
		if err := udpServer.Shutdown(); err != nil {
			log.Printf("udp shutdown error: %v", err)
		}
		if err := tcpServer.Shutdown(); err != nil {
			log.Printf("tcp shutdown error: %v", err)
		}
	case err := <-errCh:
		log.Fatal(err)
	}
}
