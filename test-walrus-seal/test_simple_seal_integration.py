#!/usr/bin/env python3
"""
Simple Seal IBE Integration Test (No Unicode)
Tests the complete flow with deployed Package ID
"""

import sys
import asyncio
import json
from datetime import datetime

# Add the backend directory to Python path
sys.path.append('backend')

try:
    from services.seal_encryption import SealEncryptionService
    from config import settings
    print("Successfully imported Seal encryption service")
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running from the project root directory")
    sys.exit(1)

async def test_seal_service():
    """Test basic Seal service functionality"""
    print("\n=== Testing Seal Service ===")
    
    # Initialize service
    seal_service = SealEncryptionService()
    
    try:
        # Test 1: Health check
        print("1. Testing service health...")
        health = await seal_service.health_check()
        print(f"   Health status: {health.get('status', 'unknown')}")
        
        if health.get('status') != 'healthy':
            print("   ERROR: Seal service is not healthy")
            return False
        
        # Test 2: Service info
        print("2. Getting service info...")
        info = seal_service.get_service_info()
        print(f"   Using real Seal: {info.get('use_real_seal', False)}")
        print(f"   Network: {info.get('network', 'unknown')}")
        
        # Test 3: Basic encryption
        print("3. Testing encryption...")
        test_data = b"Hello, this is a test message for Seal IBE encryption!"
        user_address = "0x1234567890abcdef1234567890abcdef12345678"
        
        # Generate access policy
        policy = seal_service.generate_access_policy(
            user_address=user_address,
            category="test_data",
            additional_policies=["test:true"]
        )
        print(f"   Generated policy for user: {user_address}")
        
        # Encrypt data
        encryption_result = await seal_service.encrypt_data(
            data=test_data,
            policy=policy,
            object_id="test_object_001"
        )
        
        print(f"   Encryption result keys: {list(encryption_result.keys())}")
        print(f"   IBE identity: {encryption_result.get('ibe_identity', 'unknown')}")
        
        # Test 4: Request decryption key
        print("4. Testing decryption key request...")
        mock_ptb = {
            "transaction_type": "access_request",
            "user_address": user_address,
            "timestamp": datetime.now().isoformat()
        }
        
        key_result = await seal_service.request_decryption_key(
            ibe_identity=encryption_result["ibe_identity"],
            sui_ptb=mock_ptb,
            user_signature="test_signature_123"
        )
        
        print(f"   Key request result keys: {list(key_result.keys())}")
        
        # Test 5: Decrypt data
        print("5. Testing decryption...")
        decrypted_data = await seal_service.decrypt_data(
            encrypted_data=encryption_result["encrypted_data"],
            decryption_key=key_result["decryption_key"],
            ibe_identity=encryption_result["ibe_identity"]
        )
        
        # Verify decryption
        decryption_matches = decrypted_data == test_data
        print(f"   Decryption matches original: {decryption_matches}")
        
        if decryption_matches:
            print("   SUCCESS: Complete encryption/decryption cycle works!")
            return True
        else:
            print("   ERROR: Decrypted data does not match original")
            return False
            
    except Exception as e:
        print(f"   ERROR: Test failed with exception: {e}")
        return False
    finally:
        await seal_service.close()

async def test_package_id():
    """Test that we're using the real deployed Package ID"""
    print("\n=== Testing Package ID Configuration ===")
    
    try:
        # Check if package ID file exists
        import os
        package_id_file = "DEPLOYED_PACKAGE_ID.txt"
        if os.path.exists(package_id_file):
            with open(package_id_file, 'r') as f:
                content = f.read()
                print("Package ID file found:")
                for line in content.split('\n')[:6]:  # Show first 6 lines
                    if line.strip():
                        print(f"   {line}")
        
        # Check TypeScript service configuration
        seal_client_file = "seal-service/src/seal-client.ts"
        if os.path.exists(seal_client_file):
            with open(seal_client_file, 'r') as f:
                content = f.read()
                if "0x0b11c3a0bf3228955c9adc443934e0f231d34f97f53c1a00a9e36db230e447bc" in content:
                    print("   SUCCESS: TypeScript service is using real Package ID")
                    return True
                else:
                    print("   ERROR: TypeScript service is not using real Package ID")
                    return False
        else:
            print("   ERROR: TypeScript seal-client.ts not found")
            return False
            
    except Exception as e:
        print(f"   ERROR: Package ID test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("*** Seal IBE Integration Test Suite ***")
    print("Testing with real deployed Package ID")
    print("=" * 50)
    
    # Check configuration
    print(f"Configuration: use_real_seal = {settings.use_real_seal}")
    
    if not settings.use_real_seal:
        print("WARNING: use_real_seal is False - testing in simulation mode")
    
    # Run tests
    tests = [
        ("Package ID Configuration", test_package_id),
        ("Seal Service Integration", test_seal_service)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\nRunning: {test_name}")
        try:
            result = await test_func()
            results.append((test_name, result))
            status = "PASS" if result else "FAIL"
            print(f"Result: {status}")
        except Exception as e:
            print(f"CRASH: {test_name} crashed with: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    total = len(results)
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\nSUCCESS: All tests passed!")
        print("Seal IBE integration is working with the deployed Package ID")
    else:
        print("\nFAILURE: Some tests failed")
        print("Check the errors above and verify:")
        print("1. Seal service is running on port 8080")
        print("2. Package ID is correctly configured")
        print("3. Network connectivity is working")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"\nTest suite crashed: {e}")