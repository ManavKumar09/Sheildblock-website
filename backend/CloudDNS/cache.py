import os
import logging

import valkey
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_client: valkey.Valkey | None = None


def get_valkey() -> valkey.Valkey | None:
    global _client
    if _client is None:
        try:
            _client = valkey.Valkey(
                host=os.getenv("VALKEY_HOST", "localhost"),
                port=int(os.getenv("VALKEY_PORT", "6379")),
                decode_responses=True,
            )
            _client.ping()
        except Exception as e:
            logger.error(f"Failed to connect to Valkey: {str(e)}")
            return None
    return _client


def set_config_bitmask(config_hash: str, bitmask: int) -> bool:
    client = get_valkey()
    if client is None:
        logger.warning("Valkey client unavailable, cannot set config bitmask")
        return False
    try:
        client.set(config_hash, str(bitmask))
        return True
    except Exception as e:
        logger.error(f"Failed to set config bitmask: {str(e)}")
        return False


def get_config_bitmask(config_hash: str) -> int | None:
    client = get_valkey()
    if client is None:
        logger.warning("Valkey client unavailable, cannot get config bitmask")
        return None
    try:
        value = client.get(config_hash)
        return int(value) if value is not None else None
    except Exception as e:
        logger.error(f"Failed to get config bitmask: {str(e)}")
        return None


def delete_config_bitmask(config_hash: str) -> bool:
    client = get_valkey()
    if client is None:
        logger.warning("Valkey client unavailable, cannot delete config bitmask")
        return False
    try:
        client.delete(config_hash)
        return True
    except Exception as e:
        logger.error(f"Failed to delete config bitmask: {str(e)}")
        return False
