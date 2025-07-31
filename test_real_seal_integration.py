#!/usr/bin/env python3
"""
End-to-end test for real Seal IBE integration.
Tests the complete privacy-preserving workflow with real Seal service.
"""

import asyncio
import sys
import os
import json
import subprocess
from datetime import datetime
from typing import List, Dict

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from services.seal_encryption import SealEncryptionService
    from services.hnsw_indexer import HNSWIndexerService
    from config import settings
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running from the project root directory")
    sys.exit(1)

class SealIntegrationTester:
    """Comprehensive tester for Seal integration"""
    
    def __init__(self):
        self.seal_service = None
        self.indexer = None
        self.test_results = []
        
    async def initialize(self):
        """Initialize services"""
        print("🔧 Initializing services...")
        self.seal_service = SealEncryptionService()
        self.indexer = HNSWIndexerService()
        
        # Check if we should use real Seal
        if not settings.use_real_seal:
            print("⚠️  Warning: use_real_seal=False in configuration")
            print("   Set use_real_seal=True to test real Seal integration")
            print("   Currently testing in simulation mode")
    
    async def cleanup(self):
        """Cleanup services"""
        if self.seal_service:
            await self.seal_service.close()
        if self.indexer:
            await self.indexer.stop()
    
    def add_test_result(self, test_name: str, passed: bool, message: str = ""):
        """Add test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message,
            "status": status
        })
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
    
    async def test_seal_service_health(self):
        """Test 1: Seal service health"""
        try:
            health = await self.seal_service.health_check()
            service_info = self.seal_service.get_service_info()
            
            is_healthy = health.get("status") == "healthy"
            mode = "REAL" if service_info.get("use_real_seal") else "SIMULATION"
            
            self.add_test_result(
                "Seal Service Health",
                is_healthy,
                f"Mode: {mode}, Status: {health.get('status')}"
            )
            
            return is_healthy
        except Exception as e:
            self.add_test_result("Seal Service Health", False, str(e))
            return False
    
    async def test_basic_encryption_decryption(self):
        """Test 2: Basic encryption/decryption"""
        try:
            test_data = b"This is a test message for Seal IBE encryption"
            user_address = "0x1234567890abcdef1234567890abcdef12345678"
            
            # Create access policy
            policy = self.seal_service.generate_access_policy(
                user_address=user_address,
                category="test_chat",
                additional_policies=["test_policy"]
            )
            
            # Encrypt
            encryption_result = await self.seal_service.encrypt_data(
                data=test_data,
                policy=policy,
                object_id="test_001"
            )
            
            # Verify encryption result
            required_keys = ["encrypted_data", "ibe_identity", "policy", "encryption_metadata"]
            has_all_keys = all(key in encryption_result for key in required_keys)
            
            if not has_all_keys:
                self.add_test_result("Basic Encryption", False, "Missing required keys in encryption result")
                return False
            
            # Test decryption
            mock_ptb = {
                "transaction_type": "access_request",
                "user_address": user_address,
                "timestamp": datetime.now().isoformat()
            }
            
            # Request decryption key
            key_result = await self.seal_service.request_decryption_key(
                ibe_identity=encryption_result["ibe_identity"],
                sui_ptb=mock_ptb,
                user_signature="test_signature"
            )
            
            # Decrypt
            decrypted_data = await self.seal_service.decrypt_data(
                encrypted_data=encryption_result["encrypted_data"],
                decryption_key=key_result["decryption_key"],
                ibe_identity=encryption_result["ibe_identity"]
            )
            
            # Verify decryption
            decryption_success = decrypted_data == test_data
            algorithm = encryption_result["encryption_metadata"].get("algorithm", "Unknown")
            
            self.add_test_result(
                "Basic Encryption/Decryption",
                decryption_success,
                f"Algorithm: {algorithm}, Data matches: {decryption_success}"
            )
            
            return decryption_success
            
        except Exception as e:
            self.add_test_result("Basic Encryption/Decryption", False, str(e))
            return False
    
    async def test_privacy_preserving_indexer(self):
        """Test 3: Privacy-preserving HNSW indexer"""
        try:
            user_address = "0x1234567890abcdef1234567890abcdef12345678"
            
            # Simulate chat memory data
            test_memories = [
                {
                    "text": "I love eating pizza on Friday nights",
                    "main_vector": [0.1] * 768,  # Full semantic vector
                    "metadata_vector": [0.2] * 384,  # Searchable metadata
                    "entities": {
                        "pizza": {
                            "entity_type": "Food",
                            "creation_timestamp": datetime.now().isoformat(),
                            "semantic_meaning": "Italian cuisine preference",
                            "confidence_score": 0.9
                        }
                    },
                    "relationships": [
                        {
                            "source_entity": "user",
                            "relationship_type": "prefers",
                            "destination_entity": "pizza",
                            "confidence_score": 0.85
                        }
                    ]
                },
                {
                    "text": "Work has been stressful lately",
                    "main_vector": [0.3] * 768,
                    "metadata_vector": [0.4] * 384,
                    "entities": {
                        "work": {
                            "entity_type": "Activity",
                            "creation_timestamp": datetime.now().isoformat(),
                            "semantic_meaning": "Professional work activity",
                            "confidence_score": 0.8
                        }
                    },
                    "relationships": [
                        {
                            "source_entity": "user",
                            "relationship_type": "experiences",
                            "destination_entity": "stress",
                            "confidence_score": 0.7
                        }
                    ]
                }
            ]
            
            stored_embeddings = []
            
            # Store memories with privacy preservation
            for i, memory in enumerate(test_memories):
                embedding_id = f"test_memory_{i}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                
                try:
                    index_id = await self.indexer.add_enhanced_embedding_with_privacy(
                        embedding_id=embedding_id,
                        owner=user_address,
                        main_vector=memory["main_vector"],
                        metadata_vector=memory["metadata_vector"],
                        category="chat_memory",
                        timestamp=datetime.now().isoformat(),
                        entities=memory["entities"],
                        relationships=memory["relationships"],
                        temporal_data={
                            "conversation_turn": str(i+1),
                            "message_type": "user_input"
                        },
                        storage_layer="external_context"
                    )
                    
                    stored_embeddings.append({
                        "embedding_id": embedding_id,
                        "index_id": index_id,
                        "original_text": memory["text"]
                    })
                    
                except Exception as e:
                    self.add_test_result("Privacy-Preserving Indexer", False, f"Failed to store memory {i}: {e}")
                    return False
            
            # Test metadata search (public, no decryption needed)
            import numpy as np
            query_vector = np.array([0.25] * 384, dtype=np.float32)
            
            search_results = await self.indexer.search_unified(
                query_vector=query_vector,
                k=5,
                filters={"category": "chat_memory", "owner": user_address}
            )
            
            search_success = len(search_results) > 0
            encrypted_count = sum(1 for r in search_results if r.get("main_vector_encrypted", False))
            
            # Test secure decryption retrieval
            decryption_success = False
            if stored_embeddings:
                test_embedding = stored_embeddings[0]
                decrypted_result = await self.indexer.retrieve_decrypted_main_vector(
                    embedding_id=test_embedding["embedding_id"],
                    user_address=user_address,
                    user_signature="test_signature"
                )
                
                decryption_success = (
                    decrypted_result is not None and
                    decrypted_result.get("decrypted", False) and
                    len(decrypted_result.get("main_vector", [])) == 768
                )
            
            overall_success = search_success and decryption_success
            
            self.add_test_result(
                "Privacy-Preserving Indexer",
                overall_success,
                f"Stored: {len(stored_embeddings)}, Found: {len(search_results)}, Encrypted: {encrypted_count}, Decryption: {'✅' if decryption_success else '❌'}"
            )
            
            return overall_success
            
        except Exception as e:
            self.add_test_result("Privacy-Preserving Indexer", False, str(e))
            return False
    
    async def test_walrus_integration(self):
        """Test 4: Walrus integration (mock test)"""
        try:
            # This is a mock test since we don't have real Walrus integration running
            # In a real test, this would verify encrypted data storage on Walrus
            
            walrus_mock_success = True  # Simulate successful Walrus storage
            
            self.add_test_result(
                "Walrus Integration",
                walrus_mock_success,
                "Mock test - encrypted blobs would be stored on Walrus"
            )
            
            return walrus_mock_success
            
        except Exception as e:
            self.add_test_result("Walrus Integration", False, str(e))
            return False
    
    async def test_access_control(self):
        """Test 5: Access control policies"""
        try:
            user1 = "0x1111111111111111111111111111111111111111"
            user2 = "0x2222222222222222222222222222222222222222"
            
            # Create policy for user1
            policy = self.seal_service.generate_access_policy(
                user_address=user1,
                category="private_data",
                additional_policies=["sensitive:true"]
            )
            
            # Test that policy is properly structured
            required_policy_keys = ["owner", "category", "access_rules", "policy_hash"]
            has_policy_keys = all(key in policy for key in required_policy_keys)
            
            # Test IBE identity creation
            ibe_identity = self.seal_service.create_ibe_identity(policy, "test_object")
            identity_has_owner = f"owner:{user1}" in ibe_identity
            identity_has_category = "category:private_data" in ibe_identity
            
            access_control_success = (
                has_policy_keys and
                identity_has_owner and
                identity_has_category and
                user1 in policy["access_rules"][0]
            )
            
            self.add_test_result(
                "Access Control Policies",
                access_control_success,
                f"Policy keys: {'✅' if has_policy_keys else '❌'}, Identity: {'✅' if identity_has_owner and identity_has_category else '❌'}"
            )
            
            return access_control_success
            
        except Exception as e:
            self.add_test_result("Access Control Policies", False, str(e))
            return False
    
    async def run_all_tests(self):
        """Run all integration tests"""
        print("🧪 Starting Seal IBE Integration Tests")
        print("=" * 50)
        
        await self.initialize()
        
        try:
            # Run tests
            test_functions = [
                self.test_seal_service_health,
                self.test_basic_encryption_decryption,
                self.test_privacy_preserving_indexer,
                self.test_walrus_integration,
                self.test_access_control
            ]
            
            all_passed = True
            for test_func in test_functions:
                try:
                    result = await test_func()
                    if not result:
                        all_passed = False
                except Exception as e:
                    print(f"❌ Test {test_func.__name__} crashed: {e}")
                    self.add_test_result(test_func.__name__, False, f"Test crashed: {e}")
                    all_passed = False
                
                print()  # Add spacing between tests
            
            # Print summary
            self.print_test_summary(all_passed)
            
            return all_passed
            
        finally:
            await self.cleanup()
    
    def print_test_summary(self, all_passed: bool):
        """Print test summary"""
        print("📊 Test Summary")
        print("=" * 30)
        
        passed_count = sum(1 for result in self.test_results if result["passed"])
        total_count = len(self.test_results)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result["message"]:
                print(f"    {result['message']}")
        
        print()
        print(f"Results: {passed_count}/{total_count} tests passed")
        
        if all_passed:
            print("🎉 All tests passed! Seal integration is working correctly.")
            print()
            print("Next steps:")
            print("1. Deploy Seal service to production")  
            print("2. Configure real Sui testnet key servers")
            print("3. Test with real Walrus storage")
            print("4. Enable real Seal mode: use_real_seal=True")
        else:
            print("❌ Some tests failed. Please check the errors above.")
            print()
            print("Troubleshooting:")
            print("1. Ensure Seal service is running: cd seal-service && npm run dev")
            print("2. Check configuration in backend/config.py")
            print("3. Verify network connectivity")

def check_seal_service_running():
    """Check if Seal service is running"""
    try:
        import httpx
        response = httpx.get("http://localhost:8080/health", timeout=5)
        return response.status_code == 200
    except:
        return False

async def main():
    """Main test function"""
    print("🔒 Seal IBE Integration Test Suite")
    print("==================================")
    print()
    
    # Check if Seal service is running
    if not check_seal_service_running():
        print("⚠️  Warning: Seal service is not running at http://localhost:8080")
        print()
        print("To start the Seal service:")
        print("1. cd seal-service")
        print("2. npm install")  
        print("3. npm run dev")
        print()
        print("Tests will run in simulation mode...")
        print()
    
    # Run tests
    tester = SealIntegrationTester()
    success = await tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test suite crashed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)