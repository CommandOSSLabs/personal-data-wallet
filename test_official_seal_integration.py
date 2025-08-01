#!/usr/bin/env python3
"""
Official Seal Integration Test using @mysten/seal SDK
Tests the complete workflow using the proper Seal TypeScript SDK
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
        logging.FileHandler(f'test_official_seal_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
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

class OfficialSealTester:
    """Test suite using official @mysten/seal SDK"""
    
    def __init__(self):
        self.walrus_client = None
        self.seal_service_js_file = None
        self.test_data = {
            "personal_note": b"This is my personal note about a secret meeting with Alice.",
            "financial_data": json.dumps({
                "account": "checking_001", 
                "balance": 15750.50,
                "transactions": [{"date": "2024-01-01", "amount": -45.67, "desc": "Coffee"}]
            }).encode('utf-8'),
            "medical_records": json.dumps({
                "patient_id": "P12345",
                "doctor": "Dr. Smith", 
                "diagnosis": "Annual checkup - all normal"
            }).encode('utf-8')
        }
        
    async def setup(self):
        """Initialize services and create Seal test file"""
        print_section("OFFICIAL SEAL SDK SETUP")
        try:
            # Initialize Walrus client
            self.walrus_client = WalrusClient()
            print_success("Walrus client initialized successfully")
            
            # Create JavaScript test file using official Seal SDK
            await self.create_seal_test_script()
            print_success("Created official Seal SDK test script")
                        
        except Exception as e:
            print_error(f"Setup failed: {e}")
            raise
    
    async def create_seal_test_script(self):
        """Create a Node.js script using the official @mysten/seal SDK"""
        seal_script = '''
import { SealClient } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, toHEX } from '@mysten/sui/utils';

class OfficialSealService {
    constructor() {
        // Initialize Sui client for testnet
        this.suiClient = new SuiClient({ 
            url: 'https://fullnode.testnet.sui.io:443'
        });
        
        // Configure key servers using testnet servers
        const serverConfigs = [
            {
                objectId: '0x781389fae54633649d78b731b708c5b363cf7fa4753a48997d4f6f82d5cc5b98', // Ruby Nodes
                weight: 1
            },
            {
                objectId: '0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007', // NodeInfra  
                weight: 1
            }
        ];
        
        // Initialize Seal client
        this.sealClient = new SealClient({
            suiClient: this.suiClient,
            serverConfigs,
            verifyKeyServers: false // Set to false for testnet development
        });
        
        console.log('Official Seal client initialized with testnet key servers');
    }
    
    async encrypt(data, packageId, identity) {
        try {
            console.log(`Encrypting ${data.length} bytes with identity: ${identity}`);
            
            // Convert hex string to Uint8Array if needed
            const dataBytes = typeof data === 'string' ? fromHEX(data) : new Uint8Array(data);
            const packageIdBytes = fromHEX(packageId);
            const identityBytes = fromHEX(identity);
            
            // Encrypt using official Seal client
            const result = await this.sealClient.encrypt({
                threshold: 1, // Use threshold of 1 for testing
                packageId: packageIdBytes,
                id: identityBytes, 
                data: dataBytes
            });
            
            console.log('Encryption successful');
            return {
                success: true,
                encryptedObject: Array.from(result.encryptedObject),
                key: Array.from(result.key),
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Encryption failed:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    async decrypt(encryptedObject, key, packageId, identity, userSignature) {
        try {
            console.log(`Decrypting ${encryptedObject.length} bytes`);
            
            // Create session key for decryption
            const keypair = new Ed25519Keypair(); // For testing - in production use actual user keypair
            const packageIdBytes = fromHEX(packageId);
            
            const sessionKey = await this.sealClient.createSessionKey({
                address: keypair.getPublicKey().toSuiAddress(),
                packageId: packageIdBytes,
                ttlMin: 10 // 10 minutes TTL
            });
            
            // Simulate signing the session key message
            const message = sessionKey.getPersonalMessage();
            const { signature } = await keypair.signPersonalMessage(message);
            sessionKey.setPersonalMessageSignature(signature);
            
            // Decrypt the data
            const decrypted = await this.sealClient.decrypt({
                encryptedObject: new Uint8Array(encryptedObject),
                sessionKey
            });
            
            console.log('Decryption successful');
            return {
                success: true,
                decryptedData: Array.from(decrypted),
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Decryption failed:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    async healthCheck() {
        try {
            // Check Sui client connection
            await this.suiClient.getLatestSuiSystemState();
            
            return {
                success: true,
                status: 'healthy',
                keyServers: 2,
                network: 'testnet',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                status: 'unhealthy', 
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const service = new OfficialSealService();
    const command = process.argv[2];
    
    switch (command) {
        case 'health':
            service.healthCheck().then(result => {
                console.log(JSON.stringify(result, null, 2));
                process.exit(result.success ? 0 : 1);
            });
            break;
            
        case 'encrypt':
            const data = process.argv[3];
            const packageId = process.argv[4] || '0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26';
            const identity = process.argv[5] || '0x01234567890abcdef';
            
            service.encrypt(data, packageId, identity).then(result => {
                console.log(JSON.stringify(result, null, 2));
                process.exit(result.success ? 0 : 1);
            });
            break;
            
        case 'decrypt':
            const encryptedObject = JSON.parse(process.argv[3]);
            const key = JSON.parse(process.argv[4]);
            const pkgId = process.argv[5] || '0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26';
            const id = process.argv[6] || '0x01234567890abcdef';
            const signature = process.argv[7] || 'test_signature';
            
            service.decrypt(encryptedObject, key, pkgId, id, signature).then(result => {
                console.log(JSON.stringify(result, null, 2));
                process.exit(result.success ? 0 : 1);
            });
            break;
            
        default:
            console.log('Usage: node seal_service.js <health|encrypt|decrypt> [args...]');
            process.exit(1);
    }
}

export { OfficialSealService };
'''
        
        seal_service_dir = os.path.join(os.getcwd(), 'seal-service')
        seal_script_path = os.path.join(seal_service_dir, 'seal_service.js')
        with open(seal_script_path, 'w') as f:
            f.write(seal_script)
        
        self.seal_service_js_file = seal_script_path
        
    async def test_official_seal_health(self):
        """Test health check with official Seal SDK"""
        print_section("OFFICIAL SEAL HEALTH CHECK")
        
        try:
            import subprocess
            seal_service_dir = os.path.join(os.getcwd(), 'seal-service')
            seal_script_path = os.path.join(seal_service_dir, 'seal_service.js')
            
            result = subprocess.run([
                'node', seal_script_path, 'health'
            ], capture_output=True, text=True, cwd=seal_service_dir)
            
            if result.returncode == 0:
                health_data = json.loads(result.stdout)
                if health_data.get('success'):
                    print_success(f"Seal health check passed: {health_data['status']}")
                    print_info(f"Key servers: {health_data['keyServers']}")
                    print_info(f"Network: {health_data['network']}")
                    return True
                else:
                    print_error(f"Health check failed: {health_data.get('error')}")
                    return False
            else:
                print_error(f"Health check process failed: {result.stderr}")
                return False
                
        except Exception as e:
            print_error(f"Health check failed: {e}")
            return False
    
    async def test_official_seal_encryption(self):
        """Test encryption/decryption with official Seal SDK"""
        print_section("OFFICIAL SEAL ENCRYPTION TEST")
        
        try:
            import subprocess
            test_results = []
            
            for data_name, data_bytes in self.test_data.items():
                print_info(f"Testing encryption for: {data_name}")
                
                # Convert data to hex for command line
                data_hex = data_bytes.hex()
                package_id = '0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26'
                identity = f'0x{data_name}_test_identity'
                
                # Test encryption
                print_info(f"  Encrypting {len(data_bytes)} bytes...")
                seal_service_dir = os.path.join(os.getcwd(), 'seal-service')
                seal_script_path = os.path.join(seal_service_dir, 'seal_service.js')
                
                encrypt_result = subprocess.run([
                    'node', seal_script_path, 'encrypt', data_hex, package_id, identity
                ], capture_output=True, text=True, cwd=seal_service_dir)
                
                if encrypt_result.returncode == 0:
                    encrypt_data = json.loads(encrypt_result.stdout)
                    if encrypt_data.get('success'):
                        print_success(f"  Encryption successful for {data_name}")
                        print_info(f"  Encrypted size: {len(encrypt_data['encryptedObject'])} bytes")
                        
                        # Test decryption
                        print_info(f"  Decrypting data...")
                        decrypt_result = subprocess.run([
                            'node', seal_script_path, 'decrypt',
                            json.dumps(encrypt_data['encryptedObject']),
                            json.dumps(encrypt_data['key']),
                            package_id, identity, 'test_signature'
                        ], capture_output=True, text=True, cwd=seal_service_dir)
                        
                        if decrypt_result.returncode == 0:
                            decrypt_data = json.loads(decrypt_result.stdout)
                            if decrypt_data.get('success'):
                                decrypted_bytes = bytes(decrypt_data['decryptedData'])
                                if decrypted_bytes == data_bytes:
                                    print_success(f"  Data integrity verified for {data_name}")
                                    test_results.append(True)
                                else:
                                    print_error(f"  Data integrity check failed for {data_name}")
                                    print_error(f"    Original: {len(data_bytes)} bytes")
                                    print_error(f"    Decrypted: {len(decrypted_bytes)} bytes")
                                    test_results.append(False)
                            else:
                                print_error(f"  Decryption failed: {decrypt_data.get('error')}")
                                test_results.append(False)
                        else:
                            print_error(f"  Decryption process failed: {decrypt_result.stderr}")
                            test_results.append(False)
                    else:
                        print_error(f"  Encryption failed: {encrypt_data.get('error')}")
                        test_results.append(False)
                else:
                    print_error(f"  Encryption process failed: {encrypt_result.stderr}")
                    test_results.append(False)
                
                print("")
            
            success_rate = sum(test_results) / len(test_results) if test_results else 0
            print_info(f"Official Seal encryption test success rate: {success_rate:.2%} ({sum(test_results)}/{len(test_results)})")
            
            return all(test_results)
            
        except Exception as e:
            print_error(f"Official Seal encryption test failed: {e}")
            traceback.print_exc()
            return False
    
    async def test_encrypted_quilt_storage_official(self):
        """Test storing encrypted data as Walrus Quilt using official Seal"""
        print_section("ENCRYPTED QUILT STORAGE WITH OFFICIAL SEAL")
        
        try:
            import subprocess
            encrypted_blobs = []
            encryption_metadata = []
            
            # Step 1: Encrypt all test data using official Seal
            for data_name, data_bytes in self.test_data.items():
                print_info(f"Encrypting {data_name} with official Seal...")
                
                data_hex = data_bytes.hex()
                package_id = '0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26'
                identity = f'0x{data_name}_quilt_test'
                
                # Encrypt using official Seal
                seal_service_dir = os.path.join(os.getcwd(), 'seal-service')
                seal_script_path = os.path.join(seal_service_dir, 'seal_service.js')
                
                encrypt_result = subprocess.run([
                    'node', seal_script_path, 'encrypt', data_hex, package_id, identity
                ], capture_output=True, text=True, cwd=seal_service_dir)
                
                if encrypt_result.returncode == 0:
                    encrypt_data = json.loads(encrypt_result.stdout)
                    if encrypt_data.get('success'):
                        # Create QuiltBlob with encrypted data
                        encrypted_bytes = bytes(encrypt_data['encryptedObject'])
                        
                        encrypted_blob = QuiltBlob(
                            identifier=f"seal_encrypted_{data_name}_{int(time.time())}",
                            data=encrypted_bytes,
                            metadata={
                                "type": "seal_encrypted_data",
                                "category": data_name,
                                "package_id": package_id,
                                "identity": identity,
                                "encryption_timestamp": encrypt_data["timestamp"],
                                "original_size": str(len(data_bytes)),
                                "encrypted_size": str(len(encrypted_bytes)),
                                "sdk_version": "official_mysten_seal",
                                "content_type": "application/octet-stream"
                            }
                        )
                        
                        encrypted_blobs.append(encrypted_blob)
                        encryption_metadata.append({
                            "blob_id": encrypted_blob.identifier,
                            "encrypted_object": encrypt_data['encryptedObject'],
                            "key": encrypt_data['key'],
                            "package_id": package_id,
                            "identity": identity,
                            "original_data": data_bytes
                        })
                        
                        print_success(f"  Prepared encrypted blob: {encrypted_blob.identifier}")
                    else:
                        print_error(f"  Encryption failed: {encrypt_data.get('error')}")
                        return False, None
                else:
                    print_error(f"  Encryption process failed: {encrypt_result.stderr}")
                    return False, None
            
            print_info(f"Prepared {len(encrypted_blobs)} encrypted blobs for Quilt storage")
            
            # Step 2: Store encrypted blobs as Quilt
            print_info("Storing encrypted blobs as Walrus Quilt...")
            quilt_response = await self.walrus_client.store_quilt(encrypted_blobs, epochs=30)
            
            if quilt_response and quilt_response.quilt_id:
                print_success(f"Encrypted Quilt stored successfully!")
                print_info(f"  Quilt ID: {quilt_response.quilt_id}")
                print_info(f"  Total patches: {len(quilt_response.patches)}")
                
                # Step 3: Retrieve and verify encrypted blobs
                print_info("Retrieving and verifying encrypted blobs from Quilt...")
                verification_results = []
                
                for metadata in encryption_metadata:
                    blob_id = metadata["blob_id"]
                    print_info(f"  Retrieving blob: {blob_id}")
                    
                    # Retrieve encrypted data from Quilt
                    retrieved_encrypted_data = await self.walrus_client.retrieve_from_quilt_by_id(
                        quilt_response.quilt_id, 
                        blob_id
                    )
                    
                    if retrieved_encrypted_data:
                        print_success(f"    Retrieved {len(retrieved_encrypted_data)} bytes")
                        
                        # Decrypt using official Seal
                        print_info(f"    Decrypting with official Seal...")
                        decrypt_result = subprocess.run([
                            'node', seal_script_path, 'decrypt',
                            json.dumps(list(retrieved_encrypted_data)),
                            json.dumps(metadata['key']),
                            metadata['package_id'],
                            metadata['identity'],
                            'test_signature'
                        ], capture_output=True, text=True, cwd=seal_service_dir)
                        
                        if decrypt_result.returncode == 0:
                            decrypt_data = json.loads(decrypt_result.stdout)
                            if decrypt_data.get('success'):
                                decrypted_bytes = bytes(decrypt_data['decryptedData'])
                                if decrypted_bytes == metadata['original_data']:
                                    print_success(f"    End-to-end verification successful for {blob_id}")
                                    verification_results.append(True)
                                else:
                                    print_error(f"    Data integrity check failed for {blob_id}")
                                    verification_results.append(False)
                            else:
                                print_error(f"    Decryption failed: {decrypt_data.get('error')}")
                                verification_results.append(False)
                        else:
                            print_error(f"    Decryption process failed: {decrypt_result.stderr}")
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
    
    async def cleanup(self):
        """Clean up resources"""
        if self.walrus_client:
            await self.walrus_client.close()
            print_info("Walrus client closed")
        
        # Clean up temporary Seal service file
        if self.seal_service_js_file and os.path.exists(self.seal_service_js_file):
            os.remove(self.seal_service_js_file)
            print_info("Temporary Seal service file cleaned up")

async def run_official_seal_tests():
    """Run all official Seal tests"""
    print_section("OFFICIAL SEAL SDK INTEGRATION TEST SUITE")
    print_info(f"Test started at: {datetime.now().isoformat()}")
    print_info("Using official @mysten/seal SDK")
    
    test_results = {
        "official_seal_health": False,
        "official_seal_encryption": False,
        "encrypted_quilt_storage_official": False
    }
    
    tester = OfficialSealTester()
    quilt_info = None
    
    try:
        # Setup
        await tester.setup()
        
        # Test 1: Health check
        test_results["official_seal_health"] = await tester.test_official_seal_health()
        
        # Test 2: Encryption/decryption
        test_results["official_seal_encryption"] = await tester.test_official_seal_encryption()
        
        # Test 3: Encrypted Quilt storage
        storage_success, quilt_data = await tester.test_encrypted_quilt_storage_official()
        test_results["encrypted_quilt_storage_official"] = storage_success
        quilt_info = quilt_data
        
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
        print_success("TEST SUITE PASSED - Official Seal integration working perfectly!")
    elif success_rate >= 0.7:
        print_warning("TEST SUITE PARTIAL - Most functionality working")
    else:
        print_error("TEST SUITE FAILED - Check logs for issues")
    
    if quilt_info:
        print_section("ENCRYPTED QUILT INFORMATION")
        print_info(f"Quilt ID: {quilt_info['quilt_id']}")
        print_info(f"Encrypted blobs stored: {len(quilt_info['encrypted_blobs'])}")
        for blob in quilt_info['encrypted_blobs']:
            print_info(f"  - {blob['blob_id']} (identity: {blob['identity']})")
    
    print_info(f"Test completed at: {datetime.now().isoformat()}")
    
    return test_results, quilt_info

if __name__ == "__main__":
    try:
        results, quilt_data = asyncio.run(run_official_seal_tests())
        
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