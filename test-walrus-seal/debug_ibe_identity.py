#!/usr/bin/env python3
"""
Debug script to decode the IBE identities and see why they're the same
"""

def decode_hex_identity(hex_string):
    """Decode hex IBE identity to see the actual content"""
    try:
        # Take just the first part to see the pattern
        decoded = bytes.fromhex(hex_string[:100]).decode('utf-8')
        return decoded
    except Exception as e:
        return f"Error decoding: {e}"

# The IBE identity from the test
ibe_identity = "6f776e65723a30786433333432613330613165303935343662"

print("Decoding IBE identity:")
print(f"Hex: {ibe_identity}")
print(f"Decoded: {decode_hex_identity(ibe_identity)}")

# Let's also create test policies to see what should be different
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.seal_encryption import SealEncryptionService

seal_service = SealEncryptionService()

# Create policies for each category
categories = ["work", "personal", "personal_interests"]
owner = "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"

print("\nGenerating policies for each category:")
for i, category in enumerate(categories):
    policy = seal_service.generate_access_policy(
        user_address=owner,
        category=category,
        additional_policies=[f"quilt:test_quilt", "vector_embedding:true"]
    )
    
    object_id = f"quilt_vector_vector_{i+1}"
    ibe_identity = seal_service.create_ibe_identity(policy, object_id)
    
    print(f"\nCategory: {category}")
    print(f"Policy hash: {policy['policy_hash']}")
    print(f"Object ID: {object_id}")
    print(f"IBE Identity (hex): {ibe_identity[:50]}...")
    print(f"IBE Identity (decoded): {decode_hex_identity(ibe_identity)[:100]}...")