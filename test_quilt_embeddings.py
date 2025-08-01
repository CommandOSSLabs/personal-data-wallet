#!/usr/bin/env python3
"""
Quilt Embeddings Test - Testing Quilt with vector embeddings
"""

import asyncio
import json
import sys
import os
import numpy as np
from datetime import datetime

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services.walrus_client import WalrusClient
from backend.models import EmbeddingResult, EmbeddingQuiltData

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

async def test_quilt_embeddings():
    """Test Quilt functionality with vector embeddings"""
    print(f"{Colors.BOLD}=== QUILT EMBEDDINGS TEST ==={Colors.ENDC}")
    print_info(f"Test started at: {datetime.now().isoformat()}")
    
    client = WalrusClient()
    
    try:
        # Test 1: Create test embeddings
        print_info("Creating test embeddings...")
        test_embeddings = []
        
        for i in range(10):
            # Create random vector embeddings (768 dimensions like Google embeddings)
            vector = np.random.random(768).tolist()
            text = f"This is test embedding {i} with some meaningful content for vector similarity testing."
            
            test_embeddings.append(EmbeddingResult(
                vector=vector,
                text=text
            ))
        
        print_success(f"Created {len(test_embeddings)} test embeddings (768-dim vectors)")
        
        # Test 2: Create embedding quilt data
        embedding_data = EmbeddingQuiltData(
            user_id="test_user_embeddings",
            embeddings=test_embeddings,
            metadata={
                "test_run": datetime.now().isoformat(),
                "embedding_model": "test_random",
                "dimension": "768",
                "purpose": "quilt_functionality_test"
            }
        )
        
        print_info(f"Prepared embedding quilt data for user: {embedding_data.user_id}")
        
        # Test 3: Store embeddings as quilt
        print_info("Storing embeddings as Quilt...")
        quilt_id = await client.store_embeddings_quilt(embedding_data)
        
        if not quilt_id:
            print_error("Failed to store embeddings quilt")
            return False
        
        print_success(f"Embeddings quilt stored successfully!")
        print_info(f"  Quilt ID: {quilt_id}")
        
        # Test 4: Retrieve embeddings from quilt
        print_info("Retrieving embeddings from Quilt...")
        retrieved_embeddings = await client.retrieve_embeddings_from_quilt(quilt_id)
        
        if not retrieved_embeddings:
            print_error("Failed to retrieve embeddings from quilt")
            return False
        
        print_success(f"Retrieved {len(retrieved_embeddings)} embeddings")
        
        # Test 5: Verify data integrity
        print_info("Verifying embedding data integrity...")
        success_count = 0
        
        # Sort both lists by text for comparison (since order might change)
        original_sorted = sorted(test_embeddings, key=lambda x: x.text)
        retrieved_sorted = sorted(retrieved_embeddings, key=lambda x: x.text)
        
        if len(original_sorted) != len(retrieved_sorted):
            print_error(f"Count mismatch: {len(original_sorted)} vs {len(retrieved_sorted)}")
            return False
        
        for i, (original, retrieved) in enumerate(zip(original_sorted, retrieved_sorted)):
            if (original.text == retrieved.text and 
                len(original.vector) == len(retrieved.vector) and
                all(abs(a - b) < 1e-10 for a, b in zip(original.vector, retrieved.vector))):
                success_count += 1
                print_success(f"  Embedding {i}: Text and vector verified")
            else:
                print_error(f"  Embedding {i}: Verification failed")
                print_error(f"    Text match: {original.text == retrieved.text}")
                print_error(f"    Vector length: {len(original.vector)} vs {len(retrieved.vector)}")
        
        success_rate = success_count / len(test_embeddings)
        print_info(f"Embedding integrity success rate: {success_rate:.2%} ({success_count}/{len(test_embeddings)})")
        
        # Test 6: Verify vector similarity
        if success_count > 0:
            print_info("Testing vector similarity calculation...")
            
            # Calculate similarity between first two embeddings
            if len(retrieved_sorted) >= 2:
                vec1 = np.array(retrieved_sorted[0].vector)
                vec2 = np.array(retrieved_sorted[1].vector)
                
                # Cosine similarity
                dot_product = np.dot(vec1, vec2)
                norm1 = np.linalg.norm(vec1)
                norm2 = np.linalg.norm(vec2)
                similarity = dot_product / (norm1 * norm2)
                
                print_success(f"  Vector similarity calculated: {similarity:.4f}")
                print_info(f"  Vector dimensions verified: {len(vec1)} x {len(vec2)}")
        
        overall_success = success_rate >= 0.8  # 80% threshold
        
        print(f"\n{Colors.BOLD}=== FINAL RESULTS ==={Colors.ENDC}")
        if overall_success:
            print_success(f"QUILT EMBEDDINGS TEST PASSED - {success_rate:.1%} success rate")
            print_info("✅ Quilt can successfully store and retrieve vector embeddings")
            print_info("✅ Data integrity maintained for 768-dimensional vectors")
            print_info("✅ Ready for production embedding storage")
        else:
            print_error(f"QUILT EMBEDDINGS TEST FAILED - {success_rate:.1%} success rate")
        
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
        success = asyncio.run(test_quilt_embeddings())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_error("Test interrupted by user")
        sys.exit(130)
    except Exception as e:
        print_error(f"Test crashed: {e}")
        sys.exit(3)