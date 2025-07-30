from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    openai_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    sui_network: str = "testnet"
    sui_rpc_url: str = "https://fullnode.testnet.sui.io:443"
    walrus_publisher_url: str = "https://publisher.walrus-testnet.walrus.space"
    redis_url: str = "redis://localhost:6379"
    log_level: str = "INFO"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()