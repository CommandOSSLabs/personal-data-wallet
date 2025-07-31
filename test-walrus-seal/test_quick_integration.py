#!/usr/bin/env python3
"""
Quick integration test to verify the integrated system is working.
"""

import asyncio
import sys
import os
import numpy as np

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.hnsw_indexer import HNSWIndexerService

async def quick_test():
    print('Testing basic integration...')
    indexer = HNSWIndexerService()
    print('SUCCESS HNSWIndexerService initialized')
    
    try:
        # Test vector storage
        test_vector = [0.1] * 768
        metadata_vector = [0.2] * 768
        
        embedding_id = await indexer.add_enhanced_embedding_with_privacy(
            embedding_id='test_integration_001',
            owner='test-user-123',
            main_vector=test_vector,
            metadata_vector=metadata_vector,
            category='integration_test',
            entities={'test': {'entity_type': 'Test', 'creation_timestamp': '2025-01-01T00:00:00', 'semantic_meaning': 'Test entity', 'confidence_score': 1.0}},
            relationships=[],
            temporal_data={'test': 'data'},
            storage_layer='external_context'
        )
        
        print(f'SUCCESS Stored test embedding with ID: {embedding_id}')
        
        # Test search
        query_vector = np.array([0.15] * 768, dtype=np.float32)
        results = await indexer.search_unified(query_vector, k=5)
        
        print(f'SUCCESS Search returned {len(results)} results')
        for result in results:
            print(f'  - {result.get("embedding_id", "unknown")}: similarity={result.get("similarity", 0):.3f}')
        
        await indexer.stop()
        print('SUCCESS Integration test completed successfully!')
        return True
        
    except Exception as e:
        print(f'ERROR Integration test failed: {e}')
        await indexer.stop()
        return False

if __name__ == "__main__":
    success = asyncio.run(quick_test())
    sys.exit(0 if success else 1)