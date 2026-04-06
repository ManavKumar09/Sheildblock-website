package main

import (
	"log"
	"strings"

	"github.com/miekg/dns"
)

var blocklist = []string{
	"ads.google.com.",
	"doubleclick.net.",
}

const upstream = "1.1.1.1:53"

func normalizeDomain(name string) string {
	n := strings.ToLower(name)
	if !strings.HasSuffix(n, ".") {
		n += "."
	}
	return n
}

func isBlocked(name string) bool {
	domain := normalizeDomain(name)
	for _, blocked := range blocklist {
		b := normalizeDomain(blocked)
		suffix := "." + strings.TrimSuffix(b, ".") + "."
		if domain == b || strings.HasSuffix(domain, suffix) {
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
		resp, err := dns.Exchange(r, upstream)
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

	server := &dns.Server{
		Addr: ":5000",
		Net:  "udp",
	}

	log.Println("DNS server running on :5000")
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
