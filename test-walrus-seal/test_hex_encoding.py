#!/usr/bin/env python3
"""
Simple test to verify hex encoding fix for Seal IBE identity.
"""

import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.seal_encryption import SealEncryptionService

def test_hex_encoding():
    print("Testing hex encoding for IBE identity...")
    
    # Initialize service
    seal_service = SealEncryptionService()
    
    # Create test policy
    policy = seal_service.generate_access_policy(
        user_address="test-user-123",
        category="personal",
        additional_policies=["test_policy"]
    )
    
    print(f"Policy: {policy}")
    
    # Create IBE identity
    embedding_id = "real_memory_test-user-123_1753951026838"
    ibe_identity = seal_service.create_ibe_identity(policy, embedding_id)
    
    print(f"IBE Identity (hex): {ibe_identity}")
    
    # Decode to verify
    try:
        decoded = bytes.fromhex(ibe_identity).decode('utf-8')
        print(f"Decoded Identity: {decoded}")
        print("SUCCESS Hex encoding/decoding works correctly!")
        return True
    except Exception as e:
        print(f"ERROR Hex encoding failed: {e}")
        return False

if __name__ == "__main__":
    success = test_hex_encoding()
    sys.exit(0 if success else 1)