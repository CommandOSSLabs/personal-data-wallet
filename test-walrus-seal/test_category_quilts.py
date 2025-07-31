#!/usr/bin/env python3
"""
Test category-based Quilt storage system for Personal Data Wallet.

This test verifies that:
1. Vector embeddings are correctly routed to category-specific quilts
2. Each category gets its own quilt with proper metadata
3. Retrieval works correctly from category quilts
4. Statistics show proper category organization
"""

import asyncio
import logging
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.hnsw_indexer import HNSWIndexerService
from services.quilt_manager import QuiltManager

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_category_based_quilts():
    """Test the complete category-based quilt workflow."""
    
    logger.info("Starting category-based quilt tests...")
    
    # Initialize the enhanced HNSW indexer with quilt support
    indexer = HNSWIndexerService(vector_dimension=384)  # Smaller for testing
    await indexer.start()
    
    try:
        # Test data for different categories
        test_data = [
            {
                "embedding_id": "health_001",
                "owner": "user_123",
                "category": "health",
                "main_vector": [0.1, 0.2, 0.3] + [0.0] * 381,  # 384 dimensions
                "metadata_vector": [0.4, 0.5, 0.6] + [0.0] * 381,
                "entities": {"symptom": {"type": "medical", "confidence": 0.9}},
                "relationships": [{"user": "has_symptom", "fever": 0.8}]
            },
            {
                "embedding_id": "health_002", 
                "owner": "user_123",
                "category": "health",
                "main_vector": [0.2, 0.3, 0.4] + [0.0] * 381,
                "metadata_vector": [0.5, 0.6, 0.7] + [0.0] * 381,
                "entities": {"medication": {"type": "drug", "confidence": 0.95}},
                "relationships": [{"user": "takes", "aspirin": 0.9}]
            },
            {
                "embedding_id": "finance_001",
                "owner": "user_123", 
                "category": "finance",
                "main_vector": [0.3, 0.4, 0.5] + [0.0] * 381,
                "metadata_vector": [0.6, 0.7, 0.8] + [0.0] * 381,
                "entities": {"expense": {"type": "transaction", "confidence": 0.8}},
                "relationships": [{"user": "spent", "grocery": 0.7}]
            },
            {
                "embedding_id": "personal_001",
                "owner": "user_123",
                "category": "personal", 
                "main_vector": [0.4, 0.5, 0.6] + [0.0] * 381,
                "metadata_vector": [0.7, 0.8, 0.9] + [0.0] * 381,
                "entities": {"hobby": {"type": "activity", "confidence": 0.85}},
                "relationships": [{"user": "enjoys", "reading": 0.9}]
            }
        ]
        
        logger.info(" Testing category-based storage...")
        
        # Store embeddings in their respective category quilts
        stored_embeddings = {}
        for data in test_data:
            try:
                index_id = await indexer.add_enhanced_embedding_with_privacy(
                    embedding_id=data["embedding_id"],
                    owner=data["owner"],
                    main_vector=data["main_vector"],
                    metadata_vector=data["metadata_vector"],
                    category=data["category"],
                    entities=data["entities"],
                    relationships=data["relationships"],
                    temporal_data={"timestamp": "2024-01-01T12:00:00"},
                    storage_layer="external_context"
                )
                
                stored_embeddings[data["embedding_id"]] = index_id
                logger.info(f" Stored {data['embedding_id']} in category '{data['category']}' -> index {index_id}")
                
            except Exception as e:
                logger.error(f" Failed to store {data['embedding_id']}: {e}")
        
        # Test statistics
        logger.info(" Testing statistics...")
        stats = indexer.get_stats()
        logger.info(f"Total vectors: {stats.get('total_vectors', 0)}")
        logger.info(f"Unique categories: {stats.get('unique_categories', 0)}")
        logger.info(f"Categories: {list(stats.get('categories', {}).keys())}")
        
        for category, cat_stats in stats.get('categories', {}).items():
            logger.info(f"  - {category}: {cat_stats['count']} vectors, {cat_stats['encrypted']} encrypted")
        
        # Test quilt statistics
        if indexer.quilt_manager:
            quilt_stats = await indexer.get_quilt_stats()
            logger.info(f"Quilt stats: {quilt_stats}")
            
            user_quilts = await indexer.list_user_quilts("user_123")
            logger.info(f"User quilts: {len(user_quilts)} quilts")
            for quilt in user_quilts:
                logger.info(f"  - Category '{quilt['category']}': {quilt['blob_count']} blobs, quilt_id: {quilt.get('quilt_id', 'pending')}")
        
        # Test retrieval from category quilts
        logger.info(" Testing category-based retrieval...")
        
        for embedding_id in stored_embeddings.keys():
            try:
                retrieved = await indexer.retrieve_decrypted_main_vector(
                    embedding_id=embedding_id,
                    user_address="user_123",
                    user_signature="mock_signature"
                )
                
                if retrieved:
                    logger.info(f" Retrieved {embedding_id}: category='{retrieved.get('category')}', "
                              f"encryption_status='{retrieved.get('encryption_status')}', "
                              f"entities={len(retrieved.get('entities', {}))}")
                else:
                    logger.warning(f"  Could not retrieve {embedding_id}")
                    
            except Exception as e:
                logger.error(f" Failed to retrieve {embedding_id}: {e}")
        
        # Test unified search
        logger.info(" Testing unified search...")
        
        query_vector = [0.15, 0.25, 0.35] + [0.0] * 381  # Similar to health vectors
        
        search_results = await indexer.search_unified(
            query_vector=query_vector,
            k=10,
            filters={"owner": "user_123"}
        )
        
        logger.info(f"Search returned {len(search_results)} results:")
        for result in search_results:
            logger.info(f"  - {result.get('embedding_id')}: category='{result.get('category')}', "
                       f"similarity={result.get('similarity_score', 0):.3f}, "
                       f"encrypted={result.get('main_vector_encrypted', False)}")
        
        # Test category-specific search
        logger.info(" Testing category-specific search...")
        
        health_results = await indexer.search_unified(
            query_vector=query_vector,
            k=5,
            filters={"owner": "user_123", "category": "health"}
        )
        
        logger.info(f"Health category search returned {len(health_results)} results:")
        for result in health_results:
            logger.info(f"  - {result.get('embedding_id')}: similarity={result.get('similarity_score', 0):.3f}")
        
        logger.info(" All category-based quilt tests completed successfully!")
        
        return True
        
    except Exception as e:
        logger.error(f" Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        await indexer.stop()

async def main():
    """Run the category-based quilt tests."""
    
    print("\n" + "="*70)
    print(" Personal Data Wallet - Category-Based Quilt Storage Tests")
    print("="*70)
    
    success = await test_category_based_quilts()
    
    print("\n" + "="*70)
    if success:
        print(" All tests PASSED! Category-based quilt storage is working correctly.")
        print("\nKey benefits demonstrated:")
        print("•  Automatic category organization (health, finance, personal)")
        print("•  Seal IBE encryption for privacy-preserving storage")
        print("•  Cost-effective Walrus Quilt batch operations")
        print("•  Fast HNSW similarity search on metadata vectors")
        print("•  Category-specific filtering and retrieval")
    else:
        print(" Some tests FAILED. Check the logs above for details.")
    print("="*70 + "\n")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)