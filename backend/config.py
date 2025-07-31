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
        
        # Deployed Sui Contract Addresses
        self.sui_package_id: str = "0x0954cc34e86fd95fd34ee36abc835958b3716cc1e471a75ca2d9b18e4b5d3540"
        self.memory_wallet_admin_cap: str = "0x3b81d21511c1d4fb20c7296e8a6599bcc3e717ea3ad5b4eddaf3305e9654fd5a"
        self.vector_registry_id: str = "0x40f65b6522c34812350ffd2186f329dd1efd55e95417c39a20dcb7f5e8911462"
        self.vector_index_admin_cap: str = "0x7ad1945abb64212c38c64720f1b6ac7eaf9a33e94a33f4bd59c7447b83ad7a2e"
        self.chat_session_registry_id: str = "0xb4ee02cc5fa5e4be99ae13f356dfd6fa42e7864e3d506a5a9b90add185eccbff"
        self.chat_sessions_admin_cap: str = "0x66d645b0081ddee2f57ed25578c5bcd2521b7abd32e96d1dca5e932b02bef6a5"

settings = Settings()