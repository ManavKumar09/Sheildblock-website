#!/usr/bin/env bash
# ============================================================================
# update-blocklists.sh
# Downloads and processes HaGeZi DNS blocklists into ShieldBlock categories.
#
# Each domain is normalized to FQDN format (trailing dot, lowercase) for
# exact matching against DNS queries from miekg/dns.
#
# Usage: ./scripts/update-blocklists.sh [data_dir]
#   data_dir defaults to ./data
# ============================================================================

set -euo pipefail

DATA_DIR="${1:-$(dirname "$0")/../data}"
DATA_DIR="$(cd "$DATA_DIR" && pwd)"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

GITHUB_RAW="https://raw.githubusercontent.com/hagezi/dns-blocklists/main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*" >&2; }

# ============================================================================
# normalize_domains <input_file> <output_file>
#
# Processes a raw domain list into exact-match FQDN format:
#   1. Strips comments (lines starting with #) and empty lines
#   2. Removes any leading/trailing whitespace
#   3. Lowercases everything
#   4. Appends trailing dot (.) if missing (FQDN for miekg/dns)
#   5. Removes duplicates
#   6. Sorts for deterministic output
# ============================================================================
normalize_domains() {
    local input="$1"
    local output="$2"

    grep -v '^\s*#' "$input" \
        | grep -v '^\s*$' \
        | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' \
        | tr '[:upper:]' '[:lower:]' \
        | sed '/\.$/! s/$/./' \
        | sort -u \
        > "$output"
}

# ============================================================================
# download_list <url> <output_file>
# Downloads a single list file. Returns 0 on success, 1 on failure.
# ============================================================================
download_list() {
    local url="$1"
    local output="$2"

    if curl -fsSL --retry 3 --retry-delay 2 --max-time 120 -o "$output" "$url"; then
        return 0
    else
        err "Failed to download: $url"
        return 1
    fi
}

# ============================================================================
# download_and_merge <output_file> <url1> [url2] [url3] ...
# Downloads multiple lists, concatenates them, then normalizes.
# ============================================================================
download_and_merge() {
    local final_output="$1"
    shift
    local merged="$TMP_DIR/merged_$(basename "$final_output")"

    > "$merged"  # truncate

    for url in "$@"; do
        local tmp_file="$TMP_DIR/dl_$(echo "$url" | md5sum | cut -d' ' -f1)"
        if download_list "$url" "$tmp_file"; then
            cat "$tmp_file" >> "$merged"
        else
            warn "Skipping failed download: $url"
        fi
    done

    normalize_domains "$merged" "$final_output"
    local count
    count=$(wc -l < "$final_output")
    log "$(basename "$final_output"): $count domains"
}

echo ""
echo "========================================="
echo " ShieldBlock Blocklist Updater"
echo " Target: $DATA_DIR"
echo "========================================="
echo ""

# ---------------------------------------------------------------------------
# 1. Ads — HaGeZi Multi PRO (domains format)
#    ~472K domains covering ads, affiliate, metrics, telemetry
# ---------------------------------------------------------------------------
log "Downloading Ads list (Multi PRO)..."
download_and_merge "$DATA_DIR/hagezi_ads.txt" \
    "$GITHUB_RAW/domains/pro.txt"

# ---------------------------------------------------------------------------
# 2. Malware — HaGeZi Threat Intelligence Feeds Medium
#    ~411K domains covering malware, C2, cryptojacking, scam, spam
# ---------------------------------------------------------------------------
log "Downloading Malware list (TIF Medium)..."
download_and_merge "$DATA_DIR/hagezi_malware.txt" \
    "$GITHUB_RAW/wildcard/tif.medium-onlydomains.txt"

# ---------------------------------------------------------------------------
# 3. Adult — HaGeZi NSFW
#    ~80K domains blocking adult content
# ---------------------------------------------------------------------------
log "Downloading Adult list (NSFW)..."
download_and_merge "$DATA_DIR/hagezi_adult.txt" \
    "$GITHUB_RAW/wildcard/nsfw-onlydomains.txt"

# ---------------------------------------------------------------------------
# 4. Tracking — HaGeZi Native Trackers (combined)
#    Windows/Office + Apple + Samsung + Amazon
# ---------------------------------------------------------------------------
log "Downloading Tracking list (Native Trackers: Win/Office + Apple + Samsung + Amazon)..."
download_and_merge "$DATA_DIR/hagezi_tracking.txt" \
    "$GITHUB_RAW/domains/native.winoffice.txt" \
    "$GITHUB_RAW/domains/native.apple.txt" \
    "$GITHUB_RAW/domains/native.samsung.txt" \
    "$GITHUB_RAW/domains/native.amazon.txt"

# ---------------------------------------------------------------------------
# 5. Phishing — HaGeZi Fake + Pop-Up Ads
#    ~15K fake + ~50K popupads = ~65K domains
# ---------------------------------------------------------------------------
log "Downloading Phishing list (Fake + Pop-Up Ads)..."
download_and_merge "$DATA_DIR/hagezi_phishing.txt" \
    "$GITHUB_RAW/wildcard/fake-onlydomains.txt" \
    "$GITHUB_RAW/wildcard/popupads-onlydomains.txt"

# ---------------------------------------------------------------------------
# 6. Social — HaGeZi Social Networks
#    ~889 domains (Facebook, Instagram, TikTok, X, Snapchat, etc.)
# ---------------------------------------------------------------------------
log "Downloading Social list (Social Networks)..."
download_and_merge "$DATA_DIR/hagezi_social.txt" \
    "$GITHUB_RAW/wildcard/social-onlydomains.txt"

echo ""
echo "========================================="
echo " Download complete!"
echo ""
echo " File summary:"
for f in "$DATA_DIR"/hagezi_*.txt; do
    count=$(wc -l < "$f")
    printf "   %-30s %'d domains\n" "$(basename "$f")" "$count"
done
echo ""
echo " All domains are in FQDN format (trailing dot, lowercase)"
echo " Ready for exact matching against miekg/dns queries."
echo "========================================="
