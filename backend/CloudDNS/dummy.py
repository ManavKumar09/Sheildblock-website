import cache

def main():
    print("Setting up dummy configurations in Valkey...")
    
    # We will use a fixed dummy hash so it's easy to test against your frontend
    dummy_hash = "a1b2c3d4e5f678901234567890123456789012345678901234567890abcd"
    dummy_bitmask = 3 # Represents Ads (1) + Malware (2)
    
    # 1. Set the config bitmask in the cache
    success = cache.set_config_bitmask(dummy_hash, dummy_bitmask)
    if success:
        print(f"Success: Successfully set config in Valkey: {dummy_hash[:8]}... -> {dummy_bitmask}")
    else:
        print("Failed: Failed to set config in Valkey. Is it running?")

if __name__ == "__main__":
    main()
