import os
from typing import Optional

# Try to load dotenv if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # If dotenv is not available, try to load .env manually
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

class Settings:
    """Simple settings class that reads from environment variables."""

    def __init__(self):
        self.openai_api_key: Optional[str] = os.getenv('OPENAI_API_KEY')
        self.google_api_key: Optional[str] = os.getenv('GOOGLE_API_KEY')
        self.sui_network: str = os.getenv('SUI_NETWORK', 'testnet')
        self.sui_rpc_url: str = os.getenv('SUI_RPC_URL', 'https://fullnode.testnet.sui.io:443')
        self.walrus_publisher_url: str = os.getenv('WALRUS_PUBLISHER_URL', 'https://publisher.walrus-testnet.walrus.space')
        self.redis_url: str = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.log_level: str = os.getenv('LOG_LEVEL', 'INFO')

        # Additional settings for the new services
        self.walrus_aggregator_url: str = os.getenv('WALRUS_AGGREGATOR_URL', 'https://aggregator.walrus-testnet.walrus.space')
        self.seal_servers: list = [
            "https://seal-server-1.example.com",
            "https://seal-server-2.example.com",
            "https://seal-server-3.example.com"
        ]
        self.seal_threshold: int = 2
        self.index_backup_interval: int = 3600  # 1 hour
        self.sui_event_poll_interval: int = 5   # 5 seconds

settings = Settings()