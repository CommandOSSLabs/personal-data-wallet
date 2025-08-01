#!/usr/bin/env python3
"""
Debug script to see actual Walrus response format
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

async def debug_walrus_response():
    print("🔍 Debug: Testing Walrus response format")
    
    client = WalrusClient()
    
    # Create a simple test blob
    test_blobs = [
        QuiltBlob(
            identifier="debug_blob_001",
            data=b"Debug test data for Walrus response analysis",
            metadata={"type": "debug", "timestamp": datetime.now().isoformat()}
        )
    ]
    
    print(f"📦 Storing debug quilt with {len(test_blobs)} blob...")
    
    try:
        quilt_response = await client.store_quilt(test_blobs, epochs=5)
        
        if quilt_response:
            print(f"✅ Quilt stored successfully!")
            print(f"   Quilt ID: {quilt_response.quilt_id}")
            print(f"   Patches: {len(quilt_response.patches)}")
            
            if quilt_response.patches:
                for i, patch in enumerate(quilt_response.patches):
                    print(f"   Patch {i}: ID={patch.patch_id}, Identifier={patch.identifier}, Size={patch.size}")
            else:
                print("   ⚠️ No patches in response")
        else:
            print("❌ Failed to store quilt")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(debug_walrus_response())