#!/usr/bin/env python3
"""
Verify that IBE identities are actually different by comparing full strings
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.seal_encryption import SealEncryptionService

seal_service = SealEncryptionService()

# Create policies for each category
categories = ["work", "personal", "personal_interests"]
owner = "0xd3342a30a1e09546b83fda6a4d72dd1801a379d1620e596d104ca91917b007ad"

identities = []

print("Generating full IBE identities:")
for i, category in enumerate(categories):
    policy = seal_service.generate_access_policy(
        user_address=owner,
        category=category,
        additional_policies=[f"quilt:test_quilt", "vector_embedding:true"]
    )
    
    object_id = f"quilt_vector_vector_{i+1}"
    ibe_identity = seal_service.create_ibe_identity(policy, object_id)
    
    identities.append(ibe_identity)
    
    print(f"\n{category.upper()} IBE Identity:")
    print(f"Length: {len(ibe_identity)} characters")
    print(f"Full hex: {ibe_identity}")
    
    # Decode to see the actual content
    try:
        decoded = bytes.fromhex(ibe_identity).decode('utf-8')
        print(f"Decoded: {decoded}")
    except Exception as e:
        print(f"Decode error: {e}")

print(f"\n{'='*60}")
print("COMPARISON:")
print(f"Identity 1 == Identity 2: {identities[0] == identities[1]}")
print(f"Identity 1 == Identity 3: {identities[0] == identities[2]}")
print(f"Identity 2 == Identity 3: {identities[1] == identities[2]}")

if identities[0] == identities[1]:
    print("\nERROR: Identities are identical when they should be different!")
else:
    print("\nSUCCESS: Identities are different as expected!")
    
    # Show the differences
    print("\nFirst 100 characters comparison:")
    for i, identity in enumerate(identities):
        print(f"Identity {i+1}: {identity[:100]}...")
    
    print("\nLast 100 characters comparison:")
    for i, identity in enumerate(identities):
        print(f"Identity {i+1}: ...{identity[-100:]}")