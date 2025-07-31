from pydantic_settings import BaseSettings
from typing import Optional, List

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
    
    # Seal Encryption Configuration
    seal_service_url: str = "http://localhost:8080"
    use_real_seal: bool = False  # Set to True for production Seal integration
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
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()