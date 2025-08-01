#!/usr/bin/env python3
"""
Focused Quilt Test - Testing only Quilt functionality
"""

import asyncio
import json
import sys
import os
from datetime import datetime

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services.walrus_client import WalrusClient
from backend.models import ALRIQuiltBlob as QuiltBlob

class Colors:
    OKGREEN = '\033[92m'
    FAIL = '\033[91m'
    OKBLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_success(message: str):
    print(f"{Colors.OKGREEN}[OK] {message}{Colors.ENDC}")

def print_error(message: str):
    print(f"{Colors.FAIL}[ERROR] {message}{Colors.ENDC}")

def print_info(message: str):
    print(f"{Colors.OKBLUE}[INFO] {message}{Colors.ENDC}")

async def test_quilt_functionality():
    """Test focused Quilt functionality"""
    print(f"{Colors.BOLD}=== FOCUSED QUILT TEST ==={Colors.ENDC}")
    print_info(f"Test started at: {datetime.now().isoformat()}")
    
    client = WalrusClient()
    
    try:
        # Test 1: Create test blobs
        print_info("Creating test blobs...")
        test_blobs = []
        for i in range(5):
            blob_data = json.dumps({
                "index": i,
                "message": f"Quilt test blob number {i}",
                "timestamp": datetime.now().isoformat(),
                "data": f"Some test data for blob {i}" * 10  # Make it larger
            }).encode('utf-8')
            
            test_blobs.append(QuiltBlob(
                identifier=f"quilt_test_blob_{i:03d}",
                data=blob_data,
                metadata={
                    "type": "focused_test",
                    "index": str(i),
                    "size": str(len(blob_data)),
                    "test_run": datetime.now().isoformat()
                }
            ))
        
        print_success(f"Created {len(test_blobs)} test blobs")
        
        # Test 2: Store as Quilt
        print_info("Storing blobs as Quilt...")
        quilt_response = await client.store_quilt(test_blobs, epochs=10)
        
        if not quilt_response or not quilt_response.quilt_id:
            print_error("Failed to store Quilt")
            return False
        
        print_success(f"Quilt stored successfully!")
        print_info(f"  Quilt ID: {quilt_response.quilt_id}")
        print_info(f"  Patches: {len(quilt_response.patches)}")
        print_info(f"  Cost: {quilt_response.total_cost}")
        
        # Print patch details
        for i, patch in enumerate(quilt_response.patches):
            print_info(f"  Patch {i}: {patch.identifier} -> {patch.patch_id}")
        
        # Test 3: Wait for propagation
        if quilt_response.patches:
            first_identifier = quilt_response.patches[0].identifier
            print_info("Waiting for Quilt propagation...")
            propagated = await client.wait_for_quilt_propagation(
                quilt_response.quilt_id, 
                first_identifier,
                max_wait_seconds=120
            )
            
            if propagated:
                print_success("Quilt propagated successfully!")
            else:
                print_error("Quilt propagation timeout")
                return False
        
        # Test 4: Retrieve all blobs
        print_info("Retrieving all blobs from Quilt...")
        retrieved_blobs = await client.retrieve_all_blobs_from_quilt(quilt_response)
        
        print_info(f"Retrieved {len(retrieved_blobs)} blobs")
        
        # Test 5: Verify data integrity
        print_info("Verifying data integrity...")
        success_count = 0
        
        for original_blob in test_blobs:
            if original_blob.identifier in retrieved_blobs:
                retrieved_data = retrieved_blobs[original_blob.identifier]
                if retrieved_data == original_blob.data:
                    print_success(f"  {original_blob.identifier}: Data verified")
                    success_count += 1
                else:
                    print_error(f"  {original_blob.identifier}: Data mismatch")
                    print_error(f"    Original size: {len(original_blob.data)}")
                    print_error(f"    Retrieved size: {len(retrieved_data)}")
            else:
                print_error(f"  {original_blob.identifier}: Not retrieved")
        
        success_rate = success_count / len(test_blobs)
        print_info(f"Data integrity success rate: {success_rate:.2%} ({success_count}/{len(test_blobs)})")
        
        # Test 6: Individual retrieval methods
        print_info("Testing individual retrieval methods...")
        
        if quilt_response.patches:
            first_patch = quilt_response.patches[0]
            
            # Test patch ID retrieval
            if first_patch.patch_id:
                print_info(f"Testing patch ID retrieval: {first_patch.patch_id}")
                patch_data = await client.retrieve_from_quilt_by_patch_id(first_patch.patch_id)
                if patch_data:
                    print_success("  Patch ID retrieval successful")
                else:
                    print_error("  Patch ID retrieval failed")
            
            # Test quilt ID + identifier retrieval
            print_info(f"Testing quilt ID + identifier retrieval: {first_patch.identifier}")
            quilt_data = await client.retrieve_from_quilt_by_id(
                quilt_response.quilt_id, 
                first_patch.identifier
            )
            if quilt_data:
                print_success("  Quilt ID + identifier retrieval successful")
            else:
                print_error("  Quilt ID + identifier retrieval failed")
        
        overall_success = success_rate >= 0.8  # 80% threshold
        
        print(f"\n{Colors.BOLD}=== FINAL RESULTS ==={Colors.ENDC}")
        if overall_success:
            print_success(f"QUILT TEST PASSED - {success_rate:.1%} success rate")
        else:
            print_error(f"QUILT TEST FAILED - {success_rate:.1%} success rate")
        
        return overall_success
        
    except Exception as e:
        print_error(f"Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        await client.close()
        print_info("Client closed")

if __name__ == "__main__":
    try:
        success = asyncio.run(test_quilt_functionality())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_error("Test interrupted by user")
        sys.exit(130)
    except Exception as e:
        print_error(f"Test crashed: {e}")
        sys.exit(3)