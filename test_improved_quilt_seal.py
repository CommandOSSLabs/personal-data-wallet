#!/usr/bin/env python3
"""
Improved Quilt and Seal Integration Test
Tests the enhanced WalrusClient with proper Quilt handling
"""

import asyncio
import json
import logging
import sys
import time
import base64
import aiohttp
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
        logging.FileHandler(f'test_improved_quilt_seal_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
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

def print_section(title: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}{Colors.ENDC}")

def print_success(message: str):
    print(f"{Colors.OKGREEN}[OK] {message}{Colors.ENDC}")

def print_error(message: str):
    print(f"{Colors.FAIL}[ERROR] {message}{Colors.ENDC}")

def print_info(message: str):
    print(f"{Colors.OKBLUE}[INFO] {message}{Colors.ENDC}")

def print_warning(message: str):
    print(f"{Colors.WARNING}[WARN] {message}{Colors.ENDC}")

class ImprovedQuiltSealTester:
    """Improved test suite for Quilt and Seal integration"""
    
    def __init__(self):
        self.walrus_client = None
        self.seal_service_url = "http://localhost:8080"
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
        print_section("IMPROVED QUILT + SEAL INTEGRATION SETUP")
        try:
            # Initialize Walrus client
            self.walrus_client = WalrusClient()
            print_success("Enhanced Walrus client initialized successfully")
            
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
    
    async def test_basic_quilt_operations(self):
        """Test basic Quilt operations with enhanced client"""
        print_section("ENHANCED QUILT OPERATIONS TEST")
        
        try:
            # Create test blobs
            test_blobs = []
            for i in range(3):
                blob_data = f"Enhanced test blob {i}: {json.dumps({'index': i, 'timestamp': datetime.now().isoformat(), 'test_type': 'basic_quilt'})}".encode('utf-8')
                test_blobs.append(QuiltBlob(
                    identifier=f"enhanced_test_blob_{i:03d}",
                    data=blob_data,
                    metadata={
                        "type": "enhanced_test_blob",
                        "index": str(i),
                        "size": str(len(blob_data)),
                        "test_run": datetime.now().isoformat(),
                        "test_version": "improved"
                    }
                ))
            
            print_info(f"Prepared {len(test_blobs)} test blobs for enhanced quilt storage")
            
            # Store as quilt
            print_info("Storing blobs as enhanced quilt...")
            quilt_response = await self.walrus_client.store_quilt(test_blobs, epochs=30)
            
            if quilt_response and quilt_response.quilt_id:
                print_success(f"Enhanced quilt stored successfully!")
                print_info(f"  Quilt ID: {quilt_response.quilt_id}")
                print_info(f"  Total patches: {len(quilt_response.patches)}")
                print_info(f"  Total cost: {quilt_response.total_cost}")
                
                # Wait for propagation
                if quilt_response.patches:
                    first_identifier = quilt_response.patches[0].identifier
                    print_info("Waiting for quilt propagation...")
                    propagated = await self.walrus_client.wait_for_quilt_propagation(
                        quilt_response.quilt_id, 
                        first_identifier, 
                        max_wait_seconds=180
                    )
                    
                    if propagated:
                        print_success("Quilt propagated successfully!")
                    else:
                        print_warning("Quilt propagation timeout - continuing with retrieval attempt")
                
                # Test enhanced retrieval
                print_info("Testing enhanced quilt blob retrieval...")
                retrieved_blobs = await self.walrus_client.retrieve_all_blobs_from_quilt(quilt_response)
                
                # Verify data integrity
                success_count = 0
                for original_blob in test_blobs:
                    if original_blob.identifier in retrieved_blobs:
                        retrieved_data = retrieved_blobs[original_blob.identifier]
                        if retrieved_data == original_blob.data:
                            print_success(f"  {original_blob.identifier}: Data integrity verified")
                            success_count += 1
                        else:
                            print_error(f"  {original_blob.identifier}: Data integrity check failed")
                    else:
                        print_error(f"  {original_blob.identifier}: Blob not retrieved")
                
                success_rate = success_count / len(test_blobs)
                print_info(f"Enhanced quilt test success rate: {success_rate:.2%} ({success_count}/{len(test_blobs)})")
                
                return success_rate >= 0.8  # 80% threshold
            else:
                print_error("Failed to store enhanced quilt")
                return False
                
        except Exception as e:
            print_error(f"Enhanced quilt operations test failed: {e}")
            return False
    
    async def test_seal_quilt_integration_improved(self):
        """Test improved Seal + Quilt integration"""
        print_section("IMPROVED SEAL + QUILT INTEGRATION TEST")
        
        try:
            encrypted_blobs = []
            encryption_metadata = []
            
            # Step 1: Encrypt all test data using Seal
            async with aiohttp.ClientSession() as session:
                for data_name, test_info in self.test_data.items():
                    print_info(f"Encrypting {data_name} with Seal...")
                    
                    # Encrypt data
                    encrypt_request = {
                        "data": test_info["data"].hex(),
                        "identity": test_info["identity"],
                        "policy": test_info["policy"]
                    }
                    
                    async with session.post(
                        f"{self.seal_service_url}/encrypt",
                        json=encrypt_request,
                        headers={"Content-Type": "application/json"}
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            if result.get("success"):
                                # Create QuiltBlob with encrypted data
                                encrypted_data = base64.b64decode(result["encrypted_data"])
                                
                                encrypted_blob = QuiltBlob(
                                    identifier=f"improved_seal_encrypted_{data_name}_{int(time.time())}",
                                    data=encrypted_data,
                                    metadata={
                                        "type": "improved_seal_encrypted_data",
                                        "category": data_name,
                                        "identity": test_info["identity"],
                                        "owner": test_info["policy"]["owner"],
                                        "encryption_timestamp": result["timestamp"],
                                        "servers_used": str(result["servers_used"]),
                                        "original_size": str(len(test_info["data"])),
                                        "encrypted_size": str(len(encrypted_data)),
                                        "sdk_version": "improved_integration",
                                        "content_type": "application/octet-stream"
                                    }
                                )
                                
                                encrypted_blobs.append(encrypted_blob)
                                encryption_metadata.append({
                                    "blob_id": encrypted_blob.identifier,
                                    "identity": test_info["identity"],
                                    "encrypted_data": result["encrypted_data"],
                                    "original_data": test_info["data"]
                                })
                                
                                print_success(f"  Prepared improved encrypted blob: {encrypted_blob.identifier}")
                            else:
                                print_error(f"  Encryption failed: {result.get('error', 'Unknown error')}")
                                return False
                        else:
                            error_text = await response.text()
                            print_error(f"  HTTP {response.status}: {error_text}")
                            return False
            
            print_info(f"Prepared {len(encrypted_blobs)} improved encrypted blobs for Quilt storage")
            
            # Step 2: Store encrypted blobs as quilt
            print_info("Storing improved encrypted blobs as Walrus Quilt...")
            quilt_response = await self.walrus_client.store_quilt(encrypted_blobs, epochs=50)
            
            if quilt_response and quilt_response.quilt_id:
                print_success(f"Improved encrypted Quilt stored successfully!")
                print_info(f"  Quilt ID: {quilt_response.quilt_id}")
                print_info(f"  Total patches: {len(quilt_response.patches)}")
                
                # Step 3: Wait for propagation
                if quilt_response.patches:
                    first_identifier = quilt_response.patches[0].identifier
                    print_info("Waiting for improved encrypted quilt propagation...")
                    propagated = await self.walrus_client.wait_for_quilt_propagation(
                        quilt_response.quilt_id, 
                        first_identifier, 
                        max_wait_seconds=180
                    )
                
                # Step 4: Retrieve and verify encrypted blobs
                print_info("Retrieving and verifying improved encrypted blobs from Quilt...")
                retrieved_blobs = await self.walrus_client.retrieve_all_blobs_from_quilt(quilt_response)
                
                # Step 5: Decrypt and verify
                verification_results = []
                
                async with aiohttp.ClientSession() as session:
                    for metadata in encryption_metadata:
                        blob_id = metadata["blob_id"]
                        
                        if blob_id in retrieved_blobs:
                            retrieved_encrypted_data = retrieved_blobs[blob_id]
                            print_success(f"    Retrieved {len(retrieved_encrypted_data)} bytes for {blob_id}")
                            
                            # Convert back to base64 for decryption service
                            encrypted_data_b64 = base64.b64encode(retrieved_encrypted_data).decode('utf-8')
                            
                            # Decrypt the retrieved data
                            print_info(f"    Decrypting retrieved data for {blob_id}...")
                            decrypt_request = {
                                "encrypted_data": encrypted_data_b64,
                                "identity": metadata["identity"],
                                "decryption_key": "development_key"  # In development mode
                            }
                            
                            async with session.post(
                                f"{self.seal_service_url}/decrypt",
                                json=decrypt_request,
                                headers={"Content-Type": "application/json"}
                            ) as response:
                                if response.status == 200:
                                    result = await response.json()
                                    if result.get("success"):
                                        # Convert hex back to bytes
                                        decrypted_data = bytes.fromhex(result["decrypted_data"])
                                        
                                        # Verify against original
                                        if decrypted_data == metadata["original_data"]:
                                            print_success(f"    Improved end-to-end verification successful for {blob_id}")
                                            verification_results.append(True)
                                        else:
                                            print_error(f"    Data integrity check failed for {blob_id}")
                                            verification_results.append(False)
                                    else:
                                        print_error(f"    Decryption failed: {result.get('error', 'Unknown error')}")
                                        verification_results.append(False)
                                else:
                                    error_text = await response.text()
                                    print_error(f"    HTTP {response.status}: {error_text}")
                                    verification_results.append(False)
                        else:
                            print_error(f"    Failed to retrieve blob: {blob_id}")
                            verification_results.append(False)
                
                success_rate = sum(verification_results) / len(verification_results) if verification_results else 0
                print_info(f"Improved end-to-end verification success rate: {success_rate:.2%} ({sum(verification_results)}/{len(verification_results)})")
                
                return success_rate >= 0.8, {
                    "quilt_id": quilt_response.quilt_id,
                    "encrypted_blobs": encryption_metadata,
                    "verification_results": verification_results
                }
            else:
                print_error("Failed to store improved encrypted Quilt")
                return False, None
                
        except Exception as e:
            print_error(f"Improved Seal + Quilt integration test failed: {e}")
            return False, None
    
    async def cleanup(self):
        """Clean up resources"""
        if self.walrus_client:
            await self.walrus_client.close()
            print_info("Enhanced Walrus client closed")

async def run_improved_tests():
    """Run all improved test suites"""
    print_section("IMPROVED QUILT + SEAL INTEGRATION TEST SUITE")
    print_info(f"Test started at: {datetime.now().isoformat()}")
    print_info("Using improved WalrusClient with enhanced Quilt handling")
    
    test_results = {
        "enhanced_quilt_operations": False,
        "improved_seal_quilt_integration": False
    }
    
    tester = ImprovedQuiltSealTester()
    quilt_info = None
    
    try:
        # Setup
        await tester.setup()
        
        # Test 1: Enhanced Quilt operations
        print_info("Running enhanced Quilt operations test...")
        test_results["enhanced_quilt_operations"] = await tester.test_basic_quilt_operations()
        
        # Test 2: Improved Seal + Quilt integration
        print_info("Running improved Seal + Quilt integration test...")
        integration_success, quilt_data = await tester.test_seal_quilt_integration_improved()
        test_results["improved_seal_quilt_integration"] = integration_success
        quilt_info = quilt_data
        
    except Exception as e:
        print_error(f"Test suite crashed: {e}")
    finally:
        await tester.cleanup()
    
    # Print final results
    print_section("IMPROVED TEST RESULTS SUMMARY")
    
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
        print_success("IMPROVED TEST SUITE PASSED - Enhanced Quilt + Seal integration working excellently!")
    elif success_rate >= 0.7:
        print_warning("IMPROVED TEST SUITE PARTIAL - Most functionality working with enhancements")
    else:
        print_error("IMPROVED TEST SUITE FAILED - Check enhanced implementation")
    
    if quilt_info:
        print_section("IMPROVED ENCRYPTED QUILT INFORMATION")
        print_info(f"Quilt ID: {quilt_info['quilt_id']}")
        print_info(f"Encrypted blobs stored: {len(quilt_info['encrypted_blobs'])}")
        for blob in quilt_info['encrypted_blobs']:
            print_info(f"  - {blob['blob_id']} (identity: {blob['identity']})")
    
    print_info(f"Test completed at: {datetime.now().isoformat()}")
    
    return test_results, quilt_info

if __name__ == "__main__":
    try:
        results, quilt_data = asyncio.run(run_improved_tests())
        
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
        sys.exit(3)