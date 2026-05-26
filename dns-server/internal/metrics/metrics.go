package metrics

import (
	"encoding/json"
	"log"
	"net/http"
	"sync/atomic"
)

type Counters struct {
	TotalQueries    uint64 `json:"total_queries"`
	BlockedQueries  uint64 `json:"blocked_queries"`
	AuthLookups     uint64 `json:"auth_lookups"`
	AuthCacheHits   uint64 `json:"auth_cache_hits"`
	AuthCacheMisses uint64 `json:"auth_cache_misses"`
}

var Global Counters

// ReadyCheck is set by main after dependencies are initialized.
// It should return nil if all external deps (Valkey, ClickHouse) are healthy.
var ReadyCheck func() error

func StartServer(addr string) {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	mux.HandleFunc("/readyz", func(w http.ResponseWriter, r *http.Request) {
		if ReadyCheck == nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("readiness check not configured"))
			return
		}
		if err := ReadyCheck(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(err.Error()))
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	mux.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		m := Counters{
			TotalQueries:    atomic.LoadUint64(&Global.TotalQueries),
			BlockedQueries:  atomic.LoadUint64(&Global.BlockedQueries),
			AuthLookups:     atomic.LoadUint64(&Global.AuthLookups),
			AuthCacheHits:   atomic.LoadUint64(&Global.AuthCacheHits),
			AuthCacheMisses: atomic.LoadUint64(&Global.AuthCacheMisses),
		}
		json.NewEncoder(w).Encode(m)
	})

	go func() {
		log.Printf("Metrics server listening on %s", addr)
		if err := http.ListenAndServe(addr, mux); err != nil {
			log.Fatalf("Metrics server failed: %v", err)
		}
	}()
}