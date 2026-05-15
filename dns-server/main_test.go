package main

import (
	"net"
	"testing"

	"github.com/miekg/dns"
)

type mockResponseWriter struct {
	msg *dns.Msg
}

func (m *mockResponseWriter) LocalAddr() net.Addr                { return &net.IPAddr{} }
func (m *mockResponseWriter) RemoteAddr() net.Addr               { return &net.IPAddr{} }
func (m *mockResponseWriter) WriteMsg(msg *dns.Msg) error        { m.msg = msg; return nil }
func (m *mockResponseWriter) Write([]byte) (int, error)          { return 0, nil }
func (m *mockResponseWriter) Close() error                       { return nil }
func (m *mockResponseWriter) TsigStatus() error                  { return nil }
func (m *mockResponseWriter) TsigTimersOnly(bool)                {}
func (m *mockResponseWriter) Hijack()                            {}
func (m *mockResponseWriter) WriteString(string) (int, error)    { return 0, nil }

func TestNormalizeDomain(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{name: "adds trailing dot", in: "Example.COM", want: "example.com."},
		{name: "keeps trailing dot", in: "Example.COM.", want: "example.com."},
		{name: "root domain", in: ".", want: "."},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := normalizeDomain(tt.in)
			if got != tt.want {
				t.Fatalf("normalizeDomain(%q) = %q, want %q", tt.in, got, tt.want)
			}
		})
	}
}

func TestIsBlocked(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want bool
	}{
		{name: "exact blocked", in: "ads.google.com", want: true},
		{name: "subdomain blocked via parent", in: "track.doubleclick.net", want: true},
		{name: "not blocked", in: "example.org", want: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := isBlocked(tt.in)
			if got != tt.want {
				t.Fatalf("isBlocked(%q) = %v, want %v", tt.in, got, tt.want)
			}
		})
	}
}

func TestBlockedRR(t *testing.T) {
	aQ := dns.Question{Name: "ads.google.com.", Qtype: dns.TypeA, Qclass: dns.ClassINET}
	aRR := blockedRR(aQ)
	if aRR == nil {
		t.Fatal("blockedRR(TypeA) returned nil")
	}
	if got := aRR.String(); got != "ads.google.com.\t60\tIN\tA\t0.0.0.0" {
		t.Fatalf("unexpected A RR: %q", got)
	}

	aaaaQ := dns.Question{Name: "ads.google.com.", Qtype: dns.TypeAAAA, Qclass: dns.ClassINET}
	aaaaRR := blockedRR(aaaaQ)
	if aaaaRR == nil {
		t.Fatal("blockedRR(TypeAAAA) returned nil")
	}
	if got := aaaaRR.String(); got != "ads.google.com.\t60\tIN\tAAAA\t::" {
		t.Fatalf("unexpected AAAA RR: %q", got)
	}

	txtQ := dns.Question{Name: "ads.google.com.", Qtype: dns.TypeTXT, Qclass: dns.ClassINET}
	if rr := blockedRR(txtQ); rr != nil {
		t.Fatalf("blockedRR(TypeTXT) = %v, want nil", rr)
	}
}

func TestHandleDNSBlockedQueryReturnsSinkholeAnswer(t *testing.T) {
	req := new(dns.Msg)
	req.SetQuestion("ads.google.com.", dns.TypeA)

	w := &mockResponseWriter{}
	handleDNS(w, req)

	if w.msg == nil {
		t.Fatal("expected response message to be written")
	}
	if w.msg.Id != req.Id {
		t.Fatalf("response ID mismatch: got %d, want %d", w.msg.Id, req.Id)
	}
	if w.msg.Rcode != dns.RcodeSuccess {
		t.Fatalf("rcode = %d, want %d", w.msg.Rcode, dns.RcodeSuccess)
	}
	if len(w.msg.Answer) != 1 {
		t.Fatalf("answer count = %d, want 1", len(w.msg.Answer))
	}
	if got := w.msg.Answer[0].String(); got != "ads.google.com.\t60\tIN\tA\t0.0.0.0" {
		t.Fatalf("unexpected sinkhole answer: %q", got)
	}
}
