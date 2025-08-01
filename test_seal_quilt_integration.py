#!/usr/bin/env python3
"""
Comprehensive Test Script for Seal Encryption + Walrus Quilt Storage
Tests the complete workflow of encrypting data and storing it as Quilt blobs
Then retrieves and decrypts the data successfully
"""

import asyncio
import json
import logging
import sys
import time
import traceback
import aiohttp
import base64
from datetime import datetime
from typing import Dict, List, Optional
import os

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services.walrus_client import WalrusClient
from backend.models import ALRIQuiltBlob as QuiltBlob

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'test_seal_quilt_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)

logger = logging.getLogger(__name__)

class Colors:
    """Terminal colors for better output visibility"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_section(title: str):
    """Print a colored section header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}{Colors.ENDC}")

def print_success(message: str):
    """Print success message in green"""
    print(f"{Colors.OKGREEN}[OK] {message}{Colors.ENDC}")

def print_error(message: str):
    """Print error message in red"""
    print(f"{Colors.FAIL}[ERROR] {message}{Colors.ENDC}")

def print_info(message: str):
    """Print info message in blue"""
    print(f"{Colors.OKBLUE}[INFO] {message}{Colors.ENDC}")

def print_warning(message: str):
    """Print warning message in yellow"""
    print(f"{Colors.WARNING}[WARN] {message}{Colors.ENDC}")

class SealQuiltTester:
    """Test suite for Seal encryption + Walrus Quilt storage"""
    
    def __init__(self):
        self.walrus_client = None
        self.seal_service_url = "http://localhost:8081"
        self.test_data = {
            "personal_note": {
                "data": b"This is my personal note about a secret meeting with Alice at the coffee shop.",
                "identity": "user_personal_notes_123",
                "policy": {"owner": "0x1234567890abcdef1234567890abcdef12345678", "category": "personal"}
            },
            "financial_data": {
                "data": json.dumps({
                    "account": "checking_001",
                    "balance": 15750.50,
                    "transactions": [
                        {"date": "2024-01-01", "amount": -45.67, "desc": "Coffee shop"},
                        {"date": "2024-01-02", "amount": 2000.00, "desc": "Salary deposit"}
                    ]
                }).encode('utf-8'),
                "identity": "user_financial_data_456",
                "policy": {"owner": "0x1234567890abcdef1234567890abcdef12345678", "category": "financial"}
            },
            "medical_records": {
                "data": json.dumps({
                    "patient_id": "P12345",
                    "doctor": "Dr. Smith",
                    "diagnosis": "Annual checkup - all normal",
                    "medications": ["Vitamin D", "Multivitamin"],
                    "next_appointment": "2024-06-15"
                }).encode('utf-8'),
                "identity": "user_medical_records_789",
                "policy": {"owner": "0x1234567890abcdef1234567890abcdef12345678", "category": "medical"}
            }
        }
        
    async def setup(self):
        """Initialize services"""
        print_section("SEAL + QUILT INTEGRATION SETUP")
        try:
            # Initialize Walrus client
            self.walrus_client = WalrusClient()
            print_success("Walrus client initialized successfully")
            
            # Test Seal service connection
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.seal_service_url}/health") as response:
                    if response.status == 200:
                        health_data = await response.json()
                        print_success(f"Seal service is healthy: {health_data['service']}")
                        print_info(f"Key servers: {health_data['keyServers']}")
                        print_info(f"Threshold: {health_data['threshold']}")
                        print_info(f"Network: {health_data['network']}")
                    else:
                        raise Exception(f"Seal service health check failed: {response.status}")
                        
        except Exception as e:
            print_error(f"Setup failed: {e}")
            raise
    
    async def encrypt_data(self, data: bytes, identity: str, policy: dict) -> dict:
        """Encrypt data using Seal service"""
        try:
            # Convert bytes to hex for JSON transport
            data_hex = data.hex()
            
            encrypt_request = {
                "data": data_hex,
                "identity": identity,
                "policy": policy
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.seal_service_url}/encrypt",
                    json=encrypt_request,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get("success"):
                            return {
                                "encrypted_data": result["encrypted_data"],
                                "servers_used": result["servers_used"],
                                "identity": identity,
                                "policy": policy,
                                "timestamp": result["timestamp"]
                            }
                        else:
                            raise Exception(f"Encryption failed: {result.get('error', 'Unknown error')}")
                    else:
                        error_text = await response.text()
                        raise Exception(f"HTTP {response.status}: {error_text}")
                        
        except Exception as e:
            print_error(f"Encryption failed: {e}")
            raise
    
    async def decrypt_data(self, encrypted_data: str, identity: str) -> bytes:
        """Decrypt data using Seal service"""
        try:
            decrypt_request = {
                "encrypted_data": encrypted_data,
                "identity": identity,
                "decryption_key": "development_key"  # In development mode
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.seal_service_url}/decrypt",
                    json=decrypt_request,
                    headers={"Content-Type": "application/json"}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get("success"):
                            # Convert hex back to bytes
                            decrypted_hex = result["decrypted_data"]
                            return bytes.fromhex(decrypted_hex)
                        else:
                            raise Exception(f"Decryption failed: {result.get('error', 'Unknown error')}")
                    else:
                        error_text = await response.text()
                        raise Exception(f"HTTP {response.status}: {error_text}")
                        
        except Exception as e:
            print_error(f"Decryption failed: {e}")
            raise
    
    async def test_seal_encryption_basic(self):
        """Test basic Seal encryption/decryption workflow"""
        print_section("BASIC SEAL ENCRYPTION TEST")
        
        try:
            test_results = []
            
            for data_name, test_info in self.test_data.items():
                print_info(f"Testing encryption for: {data_name}")
                
                # Step 1: Encrypt the data
                print_info(f"  Encrypting {len(test_info['data'])} bytes...")
                encryption_result = await self.encrypt_data(
                    test_info["data"], 
                    test_info["identity"], 
                    test_info["policy"]
                )
                
                print_success(f"  Data encrypted successfully")
                print_info(f"  Servers used: {encryption_result['servers_used']}")
                print_info(f"  Encrypted data length: {len(encryption_result['encrypted_data'])}")
                
                # Step 2: Decrypt the data
                print_info(f"  Decrypting data...")
                decrypted_data = await self.decrypt_data(
                    encryption_result["encrypted_data"],
                    encryption_result["identity"]
                )
                
                # Step 3: Verify data integrity
                if decrypted_data == test_info["data"]:
                    print_success(f"  Data integrity verified for {data_name}")
                    test_results.append(True)
                else:
                    print_error(f"  Data integrity check failed for {data_name}")
                    print_error(f"    Original length: {len(test_info['data'])}")
                    print_error(f"    Decrypted length: {len(decrypted_data)}")
                    test_results.append(False)
                
                print_info(f"  Completed test for {data_name}")
                print("")
            
            success_rate = sum(test_results) / len(test_results) if test_results else 0
            print_info(f"Seal encryption test success rate: {success_rate:.2%} ({sum(test_results)}/{len(test_results)})")
            
            return all(test_results)
            
        except Exception as e:
            print_error(f"Basic Seal encryption test failed: {e}")
            traceback.print_exc()
            return False
    
    async def test_encrypted_quilt_storage(self):
        """Test storing encrypted data as Walrus Quilt blobs"""
        print_section("ENCRYPTED QUILT STORAGE TEST")
        
        try:
            encrypted_blobs = []
            encryption_metadata = []
            
            # Step 1: Encrypt all test data and prepare for Quilt storage
            for data_name, test_info in self.test_data.items():
                print_info(f"Encrypting and preparing {data_name} for Quilt storage...")
                
                # Encrypt the data
                encryption_result = await self.encrypt_data(
                    test_info["data"], 
                    test_info["identity"], 
                    test_info["policy"]
                )
                
                # Create QuiltBlob with encrypted data
                encrypted_blob = QuiltBlob(
                    identifier=f"encrypted_{data_name}_{int(time.time())}",
                    data=base64.b64decode(encryption_result["encrypted_data"]),  # Convert from base64 to bytes
                    metadata={
                        "type": "encrypted_data",
                        "category": test_info["policy"]["category"],
                        "owner": test_info["policy"]["owner"],
                        "identity": encryption_result["identity"],
                        "encryption_timestamp": encryption_result["timestamp"],
                        "servers_used": str(encryption_result["servers_used"]),
                        "original_size": str(len(test_info["data"])),
                        "encrypted_size": str(len(base64.b64decode(encryption_result["encrypted_data"]))),
                        "content_type": "application/octet-stream"
                    }
                )
                
                encrypted_blobs.append(encrypted_blob)
                encryption_metadata.append({
                    "blob_id": encrypted_blob.identifier,
                    "identity": encryption_result["identity"],
                    "encrypted_data": encryption_result["encrypted_data"],
                    "original_data": test_info["data"]
                })
                
                print_success(f"  Prepared encrypted blob: {encrypted_blob.identifier}")
            
            print_info(f"Prepared {len(encrypted_blobs)} encrypted blobs for Quilt storage")
            
            # Step 2: Store encrypted blobs as Quilt
            print_info("Storing encrypted blobs as Walrus Quilt...")
            quilt_response = await self.walrus_client.store_quilt(encrypted_blobs, epochs=30)
            
            if quilt_response and quilt_response.quilt_id:
                print_success(f"Encrypted Quilt stored successfully!")
                print_info(f"  Quilt ID: {quilt_response.quilt_id}")
                print_info(f"  Total patches: {len(quilt_response.patches)}")
                print_info(f"  Total cost: {quilt_response.total_cost}")
                
                # Step 3: Retrieve and verify each encrypted blob
                print_info("Retrieving and verifying encrypted blobs from Quilt...")
                verification_results = []
                
                for i, metadata in enumerate(encryption_metadata):
                    blob_id = metadata["blob_id"]
                    print_info(f"  Retrieving blob: {blob_id}")
                    
                    # Retrieve encrypted data from Quilt
                    retrieved_encrypted_data = await self.walrus_client.retrieve_from_quilt_by_id(
                        quilt_response.quilt_id, 
                        blob_id
                    )
                    
                    if retrieved_encrypted_data:
                        print_success(f"    Retrieved {len(retrieved_encrypted_data)} bytes")
                        
                        # Convert back to base64 for decryption service
                        encrypted_data_b64 = base64.b64encode(retrieved_encrypted_data).decode('utf-8')
                        
                        # Decrypt the retrieved data
                        print_info(f"    Decrypting retrieved data...")
                        decrypted_data = await self.decrypt_data(
                            encrypted_data_b64,
                            metadata["identity"]
                        )
                        
                        # Verify against original
                        if decrypted_data == metadata["original_data"]:
                            print_success(f"    Data integrity verified for {blob_id}")
                            verification_results.append(True)
                        else:
                            print_error(f"    Data integrity check failed for {blob_id}")
                            verification_results.append(False)
                    else:
                        print_error(f"    Failed to retrieve blob: {blob_id}")
                        verification_results.append(False)
                
                success_rate = sum(verification_results) / len(verification_results) if verification_results else 0
                print_info(f"End-to-end verification success rate: {success_rate:.2%} ({sum(verification_results)}/{len(verification_results)})")
                
                return all(verification_results), {
                    "quilt_id": quilt_response.quilt_id,
                    "encrypted_blobs": encryption_metadata,
                    "verification_results": verification_results
                }
            else:
                print_error("Failed to store encrypted Quilt")
                return False, None
                
        except Exception as e:
            print_error(f"Encrypted Quilt storage test failed: {e}")
            traceback.print_exc()
            return False, None
    
    async def test_access_control_simulation(self):
        """Test access control with different user identities"""
        print_section("ACCESS CONTROL SIMULATION TEST")
        
        try:
            # Test data with different owners
            user1_data = b"User 1's private financial information"
            user2_data = b"User 2's confidential medical records"
            
            # Encrypt data for different users
            user1_encryption = await self.encrypt_data(
                user1_data,
                "user1_private_data",
                {"owner": "0x1111111111111111111111111111111111111111", "category": "private"}
            )
            
            user2_encryption = await self.encrypt_data(
                user2_data,
                "user2_confidential_data", 
                {"owner": "0x2222222222222222222222222222222222222222", "category": "confidential"}
            )
            
            print_success("Encrypted data for both users")
            
            # Try to decrypt User 1's data as User 1 (should work)
            user1_decrypted = await self.decrypt_data(
                user1_encryption["encrypted_data"],
                user1_encryption["identity"]
            )
            
            if user1_decrypted == user1_data:
                print_success("User 1 can decrypt their own data")
            else:
                print_error("User 1 decryption failed")
                return False
            
            # Try to decrypt User 2's data as User 2 (should work)
            user2_decrypted = await self.decrypt_data(
                user2_encryption["encrypted_data"], 
                user2_encryption["identity"]
            )
            
            if user2_decrypted == user2_data:
                print_success("User 2 can decrypt their own data")
            else:
                print_error("User 2 decryption failed")
                return False
            
            print_info("Access control simulation completed successfully")
            print_warning("Note: In development mode, cross-user access control is not strictly enforced")
            
            return True
            
        except Exception as e:
            print_error(f"Access control simulation failed: {e}")
            traceback.print_exc()
            return False
    
    async def cleanup(self):
        """Clean up resources"""
        if self.walrus_client:
            await self.walrus_client.close()
            print_info("Walrus client closed")

async def run_comprehensive_seal_quilt_tests():
    """Run all test suites"""
    print_section("SEAL + WALRUS QUILT INTEGRATION TEST SUITE")
    print_info(f"Test started at: {datetime.now().isoformat()}")
    print_info(f"Python version: {sys.version}")
    print_info(f"Working directory: {os.getcwd()}")
    
    test_results = {
        "seal_basic_encryption": False,
        "encrypted_quilt_storage": False,
        "access_control_simulation": False
    }
    
    tester = SealQuiltTester()
    quilt_info = None
    
    try:
        # Setup
        await tester.setup()
        
        # Test 1: Basic Seal encryption
        test_results["seal_basic_encryption"] = await tester.test_seal_encryption_basic()
        
        # Test 2: Encrypted Quilt storage
        storage_success, quilt_data = await tester.test_encrypted_quilt_storage()
        test_results["encrypted_quilt_storage"] = storage_success
        quilt_info = quilt_data
        
        # Test 3: Access control simulation
        test_results["access_control_simulation"] = await tester.test_access_control_simulation()
        
    except Exception as e:
        print_error(f"Test suite crashed: {e}")
        traceback.print_exc()
    finally:
        await tester.cleanup()
    
    # Print final results
    print_section("TEST RESULTS SUMMARY")
    
    passed_tests = sum(test_results.values())
    total_tests = len(test_results)
    success_rate = passed_tests / total_tests if total_tests > 0 else 0
    
    print_info(f"Overall Results: {passed_tests}/{total_tests} tests passed ({success_rate:.1%})")
    print("")
    
    for test_name, result in test_results.items():
        status_icon = "[OK]" if result else "[FAIL]"
        status_color = Colors.OKGREEN if result else Colors.FAIL
        print(f"{status_color}{status_icon} {test_name.replace('_', ' ').title()}{Colors.ENDC}")
    
    print("")
    if success_rate >= 0.9:
        print_success("TEST SUITE PASSED - Seal + Quilt integration is working perfectly!")
    elif success_rate >= 0.7:
        print_warning("TEST SUITE PARTIAL - Most functionality working, check failed tests")
    else:
        print_error("TEST SUITE FAILED - Major issues detected, check logs")
    
    if quilt_info:
        print_section("ENCRYPTED QUILT INFORMATION")
        print_info(f"Quilt ID: {quilt_info['quilt_id']}")
        print_info(f"Encrypted blobs stored: {len(quilt_info['encrypted_blobs'])}")
        for blob in quilt_info['encrypted_blobs']:
            print_info(f"  - {blob['blob_id']} (identity: {blob['identity']})")
    
    print_info(f"Test completed at: {datetime.now().isoformat()}")
    print_info("Check the log file for detailed information")
    
    return test_results, quilt_info

if __name__ == "__main__":
    try:
        # Run the comprehensive test suite
        results, quilt_data = asyncio.run(run_comprehensive_seal_quilt_tests())
        
        # Exit with appropriate code
        passed_tests = sum(results.values())
        total_tests = len(results)
        
        if passed_tests == total_tests:
            sys.exit(0)  # All tests passed
        elif passed_tests >= total_tests * 0.8:
            sys.exit(1)  # Most tests passed, minor issues
        else:
            sys.exit(2)  # Major issues detected
            
    except KeyboardInterrupt:
        print_warning("\nTest interrupted by user")
        sys.exit(130)
    except Exception as e:
        print_error(f"Test suite crashed: {e}")
        traceback.print_exc()
        sys.exit(3)