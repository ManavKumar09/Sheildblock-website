package filter

import (
	"bufio"
	"log"
	"os"
	"strings"
	"sync"
	"time"
)

// Define your categories as powers of 2 (Bits)
const (
	Ads      uint32 = 1 << 0 // Bit 0 (Value: 1)
	Malware  uint32 = 1 << 1 // Bit 1 (Value: 2)
	Adult    uint32 = 1 << 2 // Bit 2 (Value: 4)
	Tracking uint32 = 1 << 3 // Bit 3 (Value: 8)
	Phishing uint32 = 1 << 4 // Bit 4 (Value: 16)
	Social   uint32 = 1 << 5 // Bit 5 (Value: 32)
)

type Category struct {
	Name     string
	Bitmask  uint32
	FilePath string
	Domains  map[string]struct{} // Zero-allocation map for millions of entries
}

type Blocklist struct {
	categories []Category
	mu         sync.RWMutex
}

func NewBlocklist(dataDir string) *Blocklist {
	bl := &Blocklist{
		categories: []Category{
			{Name: "Ads", Bitmask: 1, FilePath: dataDir + "/hagezi_ads.txt", Domains: make(map[string]struct{})},
			{Name: "Malware", Bitmask: 2, FilePath: dataDir + "/hagezi_malware.txt", Domains: make(map[string]struct{})},
			{Name: "Adult", Bitmask: 4, FilePath: dataDir + "/hagezi_adult.txt", Domains: make(map[string]struct{})},
			{Name: "Tracking", Bitmask: 8, FilePath: dataDir + "/hagezi_tracking.txt", Domains: make(map[string]struct{})},
			{Name: "Phishing", Bitmask: 16, FilePath: dataDir + "/hagezi_phishing.txt", Domains: make(map[string]struct{})},
			{Name: "Social", Bitmask: 32, FilePath: dataDir + "/hagezi_social.txt", Domains: make(map[string]struct{})},
		},
	}

	bl.ReloadAll() // Initial load

	// Start background worker to hot-reload lists every 24 hours
	go bl.hotReloadWorker(24 * time.Hour)

	return bl
}

// ReloadAll reads the text files from disk and hot-swaps the maps safely.
func (bl *Blocklist) ReloadAll() {
	for i, cat := range bl.categories {
		newMap, err := loadListFromFile(cat.FilePath)
		if err != nil {
			log.Printf("Failed to load blocklist '%s' from %s: %v", cat.Name, cat.FilePath, err)
			continue
		}

		// Lock only for the microsecond it takes to swap the pointer
		bl.mu.Lock()
		bl.categories[i].Domains = newMap
		bl.mu.Unlock()

		log.Printf("Loaded %d domains into %s category", len(newMap), cat.Name)
	}
}

func (bl *Blocklist) hotReloadWorker(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		log.Println("Starting scheduled blocklist hot-reload...")
		bl.ReloadAll()
	}
}

// loadListFromFile parses a standard domain list (one domain per line).
func loadListFromFile(filepath string) (map[string]struct{}, error) {
	file, err := os.Open(filepath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	domains := make(map[string]struct{})
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Skip empty lines and comments (HaGeZi lists usually use # for comments)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// miekg/dns unpacks domain names with a trailing dot (FQDN).
		// We must ensure our map keys also have the trailing dot for O(1) matching.
		if !strings.HasSuffix(line, ".") {
			line += "."
		}

		domains[strings.ToLower(line)] = struct{}{}
	}

	return domains, scanner.Err()
}

// Check evaluates the domain against the user's specific bitmask policy.
// It walks up the domain hierarchy for wildcard-style matching:
//
//	"www.m.facebook.com." → "m.facebook.com." → "facebook.com."
//
// This is necessary because some HaGeZi lists (social, NSFW, fake, etc.)
// only contain root domains, expecting the DNS tool to match all subdomains.
// The domains/ format lists include explicit subdomain entries (www., m., etc.),
// but the wildcard/-onlydomains format does not.
func (bl *Blocklist) Check(domain string, userPolicy uint32) (bool, string) {
	bl.mu.RLock()
	defer bl.mu.RUnlock()

	domain = strings.ToLower(domain)

	for _, cat := range bl.categories {
		// If the user's policy includes this category's bit
		if (userPolicy & cat.Bitmask) != 0 {
			// Walk up the domain hierarchy:
			// "www.facebook.com." → "facebook.com." → "com."
			// Typically 3-4 map lookups per category (O(label_count)).
			for check := domain; check != ""; {
				if _, exists := cat.Domains[check]; exists {
					return true, cat.Name
				}
				// Strip the leftmost label: "www.facebook.com." → "facebook.com."
				dot := strings.IndexByte(check, '.')
				if dot == -1 || dot+1 >= len(check) {
					break
				}
				check = check[dot+1:]
			}
		}
	}

	return false, ""
}
