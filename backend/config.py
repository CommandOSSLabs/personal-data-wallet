from pydantic_settings import BaseSettings
from typing import Optional, List
import os

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

class Settings(BaseSettings):
    # API Keys
    openai_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    
    # Sui Configuration
    sui_network: str = "testnet"
    sui_rpc_url: str = "https://fullnode.testnet.sui.io:443"
    
    # Walrus Configuration
    walrus_publisher_url: str = "https://publisher.walrus-testnet.walrus.space"
    walrus_aggregator_url: str = "https://aggregator.walrus-testnet.walrus.space"
    
    # Seal Encryption Configuration (Quilt/Seal specific)
    seal_service_url: str = "http://localhost:8080"
    use_real_seal: bool = True  # Set to True for production Seal integration
    seal_threshold: int = 1  # 1-out-of-2 threshold for testnet
    seal_verify_key_servers: bool = False  # Set to True in production
    
    # Legacy Seal servers (for backward compatibility)
    seal_servers: List[str] = []
    
    # Testnet Key Server Object IDs (to be updated with real values)
    seal_key_server_1: Optional[str] = None
    seal_key_server_2: Optional[str] = None
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    
    # Logging
    log_level: str = "INFO"
    
    # HNSW Indexer Configuration
    index_backup_interval: int = 3600  # 1 hour in seconds
    sui_event_poll_interval: int = 5   # 5 seconds
    
    # Deployed Sui Contract Addresses (from main branch)
    sui_package_id: str = "0x0954cc34e86fd95fd34ee36abc835958b3716cc1e471a75ca2d9b18e4b5d3540"
    memory_wallet_admin_cap: str = "0x3b81d21511c1d4fb20c7296e8a6599bcc3e717ea3ad5b4eddaf3305e9654fd5a"
    vector_registry_id: str = "0x40f65b6522c34812350ffd2186f329dd1efd55e95417c39a20dcb7f5e8911462"
    vector_index_admin_cap: str = "0x7ad1945abb64212c38c64720f1b6ac7eaf9a33e94a33f4bd59c7447b83ad7a2e"
    chat_session_registry_id: str = "0xb4ee02cc5fa5e4be99ae13f356dfd6fa42e7864e3d506a5a9b90add185eccbff"
    chat_sessions_admin_cap: str = "0x66d645b0081ddee2f57ed25578c5bcd2521b7abd32e96d1dca5e932b02bef6a5"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()