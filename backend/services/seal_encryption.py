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
    Now connects to real Seal TypeScript service instead of simulation.
    """
    
    def __init__(self):
        # Real Seal service configuration
        self.seal_service_url = getattr(settings, 'seal_service_url', 'http://localhost:8080')
        self.use_real_seal = getattr(settings, 'use_real_seal', False)
        self.threshold = getattr(settings, 'seal_threshold', 1)  # 1-out-of-2 for testnet
        self.client = httpx.AsyncClient(timeout=60.0)
        
        # Legacy settings for backward compatibility
        self.seal_servers = getattr(settings, 'seal_servers', [])
        
        logger.info(f"Initialized Seal service: {'REAL' if self.use_real_seal else 'SIMULATION'} mode")
        if self.use_real_seal:
            logger.info(f"Seal service URL: {self.seal_service_url}")
    
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
            
            if self.use_real_seal:
                # Use real Seal encryption via TypeScript service
                encrypted_data = await self._real_seal_encryption(data, ibe_identity, policy)
                algorithm = "Seal_IBE"
                status = "production"
            else:
                # Use simulation for development/testing
                encrypted_data = await self._simulate_seal_encryption(data, ibe_identity)
                algorithm = "IBE_Simulated"
                status = "simulated"
            
            return {
                "encrypted_data": encrypted_data,
                "ibe_identity": ibe_identity,
                "policy": policy,
                "encryption_metadata": {
                    "algorithm": algorithm,
                    "servers_used": self.threshold + 1,  # Threshold + 1 servers
                    "threshold": self.threshold,
                    "timestamp": datetime.now().isoformat(),
                    "status": status
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to encrypt data: {e}")
            raise
    
    async def _real_seal_encryption(self, data: bytes, ibe_identity: str, policy: Dict) -> str:
        """
        Encrypt data using real Seal IBE via TypeScript service.
        """
        try:
            # Prepare request for Seal service
            request_data = {
                "data": data.hex(),  # Convert to hex for JSON transport
                "identity": ibe_identity,
                "policy": policy
            }
            
            # Call TypeScript Seal service
            response = await self.client.post(
                f"{self.seal_service_url}/encrypt",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    logger.info(f"Seal encryption successful for identity: {ibe_identity}")
                    return result["encrypted_data"]
                else:
                    raise Exception(f"Seal service error: {result.get('error', 'Unknown error')}")
            else:
                raise Exception(f"Seal service HTTP error: {response.status_code} - {response.text}")
                
        except httpx.TimeoutException:
            logger.error("Seal service timeout")
            raise Exception("Seal encryption service timeout")
        except httpx.ConnectError:
            logger.error("Cannot connect to Seal service")
            raise Exception("Cannot connect to Seal encryption service. Make sure it's running.")
        except Exception as e:
            logger.error(f"Real Seal encryption failed: {e}")
            raise
    
    async def _simulate_seal_encryption(self, data: bytes, ibe_identity: str) -> str:
        """
        Simulate Seal encryption for development/testing.
        """
        # Simple simulation: base64 encode with identity hash
        identity_hash = hashlib.sha256(ibe_identity.encode()).hexdigest()[:16]
        combined = identity_hash.encode() + data
        encrypted = base64.b64encode(combined).decode()
        logger.debug(f"Simulated encryption for identity: {ibe_identity}")
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
            if self.use_real_seal:
                # Use real Seal key request via TypeScript service
                return await self._real_key_request(ibe_identity, sui_ptb, user_signature)
            else:
                # Use simulation for development/testing
                return await self._simulate_key_request(ibe_identity, sui_ptb, user_signature)
                
        except Exception as e:
            logger.error(f"Failed to request decryption key: {e}")
            raise
    
    async def _real_key_request(self, ibe_identity: str, sui_ptb: Dict, user_signature: str) -> Dict:
        """
        Request decryption key from real Seal service.
        """
        try:
            # Prepare request for Seal servers
            request_data = {
                "ibe_identity": ibe_identity,
                "sui_ptb": sui_ptb,
                "signature": user_signature,
                "timestamp": datetime.now().isoformat()
            }
            
            # Call TypeScript Seal service
            response = await self.client.post(
                f"{self.seal_service_url}/request-key",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    logger.info(f"Seal key request successful for identity: {ibe_identity}")
                    return {
                        "decryption_key": result["decryption_key"],
                        "key_metadata": result["metadata"]
                    }
                else:
                    raise Exception(f"Seal service error: {result.get('error', 'Unknown error')}")
            elif response.status_code == 403:
                raise Exception("Access denied: invalid access policy or signature")
            else:
                raise Exception(f"Seal service HTTP error: {response.status_code} - {response.text}")
                
        except httpx.TimeoutException:
            logger.error("Seal service timeout during key request")
            raise Exception("Seal key request service timeout")
        except httpx.ConnectError:
            logger.error("Cannot connect to Seal service for key request")
            raise Exception("Cannot connect to Seal encryption service for key request")
        except Exception as e:
            logger.error(f"Real Seal key request failed: {e}")
            raise
    
    async def _simulate_key_request(self, ibe_identity: str, sui_ptb: Dict, user_signature: str) -> Dict:
        """
        Simulate key request for development/testing.
        """
        # Simple simulation: generate deterministic key from identity
        key_material = hashlib.sha256(ibe_identity.encode()).hexdigest()
        
        return {
            "decryption_key": key_material,
            "key_metadata": {
                "ibe_identity": ibe_identity,
                "servers_contacted": 2,
                "threshold_met": True,
                "timestamp": datetime.now().isoformat(),
                "status": "simulated"
            }
        }
    
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
            if self.use_real_seal:
                # Use real Seal decryption via TypeScript service
                return await self._real_seal_decryption(encrypted_data, decryption_key, ibe_identity)
            else:
                # Use simulation for development/testing
                return await self._simulate_seal_decryption(encrypted_data, decryption_key, ibe_identity)
                
        except Exception as e:
            logger.error(f"Failed to decrypt data: {e}")
            raise
    
    async def _real_seal_decryption(self, encrypted_data: str, decryption_key: str, ibe_identity: str) -> bytes:
        """
        Decrypt data using real Seal service.
        """
        try:
            # Prepare request for Seal service
            request_data = {
                "encrypted_data": encrypted_data,
                "decryption_key": decryption_key,
                "identity": ibe_identity
            }
            
            # Call TypeScript Seal service
            response = await self.client.post(
                f"{self.seal_service_url}/decrypt",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    logger.info(f"Seal decryption successful for identity: {ibe_identity}")
                    # Convert hex back to bytes
                    return bytes.fromhex(result["decrypted_data"])
                else:
                    raise Exception(f"Seal service error: {result.get('error', 'Unknown error')}")
            else:
                raise Exception(f"Seal service HTTP error: {response.status_code} - {response.text}")
                
        except httpx.TimeoutException:
            logger.error("Seal service timeout during decryption")
            raise Exception("Seal decryption service timeout")
        except httpx.ConnectError:
            logger.error("Cannot connect to Seal service for decryption")
            raise Exception("Cannot connect to Seal encryption service for decryption")
        except Exception as e:
            logger.error(f"Real Seal decryption failed: {e}")
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
                logger.debug(f"Simulated decryption for identity: {ibe_identity}")
                return original_data
            else:
                raise ValueError("Invalid encrypted data or identity")
                
        except Exception as e:
            logger.error(f"Decryption simulation failed: {e}")
            raise
    
    async def health_check(self) -> Dict:
        """
        Check health of Seal service.
        """
        try:
            if self.use_real_seal:
                # Check real Seal service
                response = await self.client.get(f"{self.seal_service_url}/health")
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "status": result.get("status", "unknown"),
                        "service": "real_seal",
                        "url": self.seal_service_url,
                        "info": result
                    }
                else:
                    return {
                        "status": "unhealthy",
                        "service": "real_seal",
                        "error": f"HTTP {response.status_code}"
                    }
            else:
                # Simulation is always healthy
                return {
                    "status": "healthy",
                    "service": "simulated_seal",
                    "note": "Using simulation mode"
                }
                
        except Exception as e:
            return {
                "status": "unhealthy",
                "service": "real_seal" if self.use_real_seal else "simulated_seal",
                "error": str(e)
            }
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    def get_service_info(self) -> Dict:
        """Get information about the Seal service configuration."""
        return {
            "seal_service_url": self.seal_service_url,
            "use_real_seal": self.use_real_seal,
            "threshold": self.threshold,
            "encryption_algorithm": "Seal_IBE" if self.use_real_seal else "IBE_Simulated",
            "status": "production" if self.use_real_seal else "simulated"
        }
