package auth

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"shieldblock/internal/metrics"

	"github.com/valkey-io/valkey-go"
)

type Policy struct {
	BlockedCategories uint32
}

type User struct {
	Hash   string
	Policy Policy
}

type DB struct {
	client valkey.Client
}

func NewDB(client valkey.Client) *DB {
	return &DB{client: client}
}

func (db *DB) GetUser(hash string) (*User, error) {
	atomic.AddUint64(&metrics.Global.AuthLookups, 1)

	val, err := db.client.Do(context.Background(), db.client.B().Get().Key(hash).Build()).ToString()
	if err != nil {
		if valkey.IsValkeyNil(err) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	var policy uint32
	if _, err := fmt.Sscanf(val, "%d", &policy); err != nil {
		policy = 1
	}

	return &User{
		Hash: hash,
		Policy: Policy{BlockedCategories: policy},
	}, nil
}

type cacheEntry struct {
	user      *User
	expiresAt time.Time
}

type Cache struct {
	db    *DB
	cache map[string]cacheEntry
	mu    sync.RWMutex
	ttl   time.Duration
}

func NewCache(db *DB, ttl time.Duration) *Cache {
	c := &Cache{
		db:    db,
		cache: make(map[string]cacheEntry),
		ttl:   ttl,
	}

	// Memory Leak Fix: Background cleanup of expired users
	go c.cleanupWorker()
	return c
}

func (c *Cache) cleanupWorker() {
	ticker := time.NewTicker(c.ttl)
	for range ticker.C {
		now := time.Now()
		c.mu.Lock()
		for hash, entry := range c.cache {
			if now.After(entry.expiresAt) {
				delete(c.cache, hash)
			}
		}
		c.mu.Unlock()
	}
}

func (c *Cache) GetUser(hash string) (*User, error) {
	c.mu.RLock()
	entry, exists := c.cache[hash]
	c.mu.RUnlock()

	if exists && time.Now().Before(entry.expiresAt) {
		atomic.AddUint64(&metrics.Global.AuthCacheHits, 1)
		return entry.user, nil
	}

	atomic.AddUint64(&metrics.Global.AuthCacheMisses, 1)
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