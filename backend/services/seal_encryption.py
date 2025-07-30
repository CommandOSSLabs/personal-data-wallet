import httpx
import json
import hashlib
import base64
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import logging
from config import settings

logger = logging.getLogger(__name__)

class SealEncryptionService:
    """
    Service for integrating with Seal encryption for secure vector storage.
    Implements IBE (Identity-Based Encryption) with access control policies.
    """
    
    def __init__(self):
        self.seal_servers = getattr(settings, 'seal_servers', [
            "https://seal-server-1.example.com",
            "https://seal-server-2.example.com", 
            "https://seal-server-3.example.com"
        ])
        self.threshold = getattr(settings, 'seal_threshold', 2)  # t-out-of-n threshold
        self.client = httpx.AsyncClient(timeout=30.0)
    
    def generate_access_policy(self, 
                             user_address: str, 
                             category: str = "general",
                             additional_policies: List[str] = None) -> Dict:
        """
        Generate access control policy for the data.
        
        Args:
            user_address: Sui address of the data owner
            category: Category of the memory (affects access policy)
            additional_policies: Additional access control rules
            
        Returns:
            Access policy dictionary
        """
        base_policy = {
            "owner": user_address,
            "category": category,
            "timestamp": datetime.now().isoformat(),
            "access_rules": [
                f"owner:{user_address}",  # Owner always has access
                f"category:{category}"    # Category-based access
            ]
        }
        
        if additional_policies:
            base_policy["access_rules"].extend(additional_policies)
        
        # Generate policy hash for IBE identity
        policy_string = json.dumps(base_policy, sort_keys=True)
        policy_hash = hashlib.sha256(policy_string.encode()).hexdigest()
        base_policy["policy_hash"] = policy_hash
        
        return base_policy
    
    def create_ibe_identity(self, policy: Dict, object_id: str = None) -> str:
        """
        Create IBE identity string from access policy and object ID.
        
        Args:
            policy: Access control policy
            object_id: Optional object ID for uniqueness
            
        Returns:
            IBE identity string
        """
        identity_components = [
            f"owner:{policy['owner']}",
            f"category:{policy['category']}",
            f"policy:{policy['policy_hash']}"
        ]
        
        if object_id:
            identity_components.append(f"object:{object_id}")
        
        identity = "|".join(identity_components)
        return identity
    
    async def encrypt_data(self, 
                          data: bytes, 
                          policy: Dict,
                          object_id: str = None) -> Dict:
        """
        Encrypt data using Seal IBE encryption.
        
        Args:
            data: Raw data to encrypt
            policy: Access control policy
            object_id: Optional object ID
            
        Returns:
            Dictionary containing encrypted data and metadata
        """
        try:
            # Create IBE identity
            ibe_identity = self.create_ibe_identity(policy, object_id)
            
            # For now, simulate Seal encryption
            # In production, this would call actual Seal servers
            encrypted_data = await self._simulate_seal_encryption(data, ibe_identity)
            
            return {
                "encrypted_data": encrypted_data,
                "ibe_identity": ibe_identity,
                "policy": policy,
                "encryption_metadata": {
                    "algorithm": "IBE",
                    "servers_used": len(self.seal_servers),
                    "threshold": self.threshold,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to encrypt data: {e}")
            raise
    
    async def _simulate_seal_encryption(self, data: bytes, ibe_identity: str) -> str:
        """
        Simulate Seal encryption for development/testing.
        In production, this would interact with actual Seal servers.
        """
        # Simple simulation: base64 encode with identity hash
        identity_hash = hashlib.sha256(ibe_identity.encode()).hexdigest()[:16]
        combined = identity_hash.encode() + data
        encrypted = base64.b64encode(combined).decode()
        return encrypted
    
    async def request_decryption_key(self, 
                                   ibe_identity: str,
                                   sui_ptb: Dict,
                                   user_signature: str) -> Dict:
        """
        Request IBE private key from Seal servers for decryption.
        
        Args:
            ibe_identity: IBE identity string
            sui_ptb: Sui Programmable Transaction Block proving access rights
            user_signature: User's signature on the request
            
        Returns:
            Dictionary containing decryption key and metadata
        """
        try:
            # Prepare request for Seal servers
            request_data = {
                "ibe_identity": ibe_identity,
                "sui_ptb": sui_ptb,
                "signature": user_signature,
                "timestamp": datetime.now().isoformat()
            }
            
            # For now, simulate key retrieval
            # In production, this would contact actual Seal servers
            decryption_key = await self._simulate_key_retrieval(request_data)
            
            return {
                "decryption_key": decryption_key,
                "key_metadata": {
                    "ibe_identity": ibe_identity,
                    "servers_contacted": len(self.seal_servers),
                    "threshold_met": True,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to request decryption key: {e}")
            raise
    
    async def _simulate_key_retrieval(self, request_data: Dict) -> str:
        """
        Simulate key retrieval from Seal servers.
        In production, this would contact actual Seal servers.
        """
        # Simple simulation: generate deterministic key from identity
        key_material = hashlib.sha256(
            request_data["ibe_identity"].encode()
        ).hexdigest()
        return key_material
    
    async def decrypt_data(self, 
                          encrypted_data: str,
                          decryption_key: str,
                          ibe_identity: str) -> bytes:
        """
        Decrypt data using IBE private key.
        
        Args:
            encrypted_data: Encrypted data from Walrus
            decryption_key: IBE private key from Seal servers
            ibe_identity: IBE identity used for encryption
            
        Returns:
            Decrypted raw data
        """
        try:
            # For now, simulate decryption
            # In production, this would use actual IBE decryption
            decrypted_data = await self._simulate_seal_decryption(
                encrypted_data, decryption_key, ibe_identity
            )
            
            return decrypted_data
            
        except Exception as e:
            logger.error(f"Failed to decrypt data: {e}")
            raise
    
    async def _simulate_seal_decryption(self, 
                                      encrypted_data: str,
                                      decryption_key: str,
                                      ibe_identity: str) -> bytes:
        """
        Simulate Seal decryption for development/testing.
        """
        try:
            # Reverse the simulation encryption
            combined = base64.b64decode(encrypted_data.encode())
            identity_hash = hashlib.sha256(ibe_identity.encode()).hexdigest()[:16]
            
            # Remove the identity hash prefix
            if combined.startswith(identity_hash.encode()):
                original_data = combined[len(identity_hash.encode()):]
                return original_data
            else:
                raise ValueError("Invalid encrypted data or identity")
                
        except Exception as e:
            logger.error(f"Decryption simulation failed: {e}")
            raise
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    def get_service_info(self) -> Dict:
        """Get information about the Seal service configuration."""
        return {
            "seal_servers": len(self.seal_servers),
            "threshold": self.threshold,
            "encryption_algorithm": "IBE",
            "status": "simulated"  # Change to "production" when using real Seal
        }
