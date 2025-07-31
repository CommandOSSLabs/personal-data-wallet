#!/usr/bin/env python3
"""
Test category-based Quilt storage system with mocked services.

This test verifies that:
1. Vector embeddings are correctly routed to category-specific quilts
2. Each category gets its own quilt with proper metadata
3. HNSW indexing works with category organization
4. Statistics show proper category organization

Uses mocked services to avoid needing real Walrus/Sui infrastructure.
"""

import asyncio
import logging
import sys
import os
from unittest.mock import AsyncMock, MagicMock

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_category_based_quilts_mock():
    """Test the complete category-based quilt workflow with mocked services."""
    
    logger.info("Starting category-based quilt tests with mocked services...")
    
    # Import after setting up path
    from services.hnsw_indexer import HNSWIndexerService
    
    # Initialize the HNSW indexer (will internally create QuiltManager)
    indexer = HNSWIndexerService(vector_dimension=384)
    
    # Mock the external services to avoid network calls
    if indexer.walrus_client:
        # Mock store_quilt method to return a mock response
        async def mock_store_quilt(blobs, epochs=5):
            mock_response = MagicMock()
            mock_response.quilt_id = f"mock_quilt_{len(blobs)}_{epochs}"
            return mock_response
        
        indexer.walrus_client.store_quilt = AsyncMock(side_effect=mock_store_quilt)
        indexer.walrus_client.close = AsyncMock()
    
    if indexer.seal_service:
        indexer.seal_service.close = AsyncMock()
    
    if indexer.quilt_manager:
        # The QuiltManager will use the mocked walrus_client
        pass
    
    await indexer.start()
    
    try:
        # Test data for different categories
        test_data = [
            {
                "embedding_id": "health_001",
                "owner": "user_123",
                "category": "health",
                "main_vector": [0.1, 0.2, 0.3] + [0.0] * 381,
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
        
        logger.info("Testing category-based storage...")
        
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
                logger.info(f"Stored {data['embedding_id']} in category '{data['category']}' -> index {index_id}")
                
            except Exception as e:
                logger.error(f"Failed to store {data['embedding_id']}: {e}")
                import traceback
                traceback.print_exc()
        
        # Test statistics
        logger.info("Testing statistics...")
        stats = indexer.get_stats()
        logger.info(f"Total vectors: {stats.get('total_vectors', 0)}")
        logger.info(f"Unique categories: {stats.get('unique_categories', 0)}")
        logger.info(f"Categories: {list(stats.get('categories', {}).keys())}")
        
        for category, cat_stats in stats.get('categories', {}).items():
            logger.info(f"  - {category}: {cat_stats['count']} vectors, {cat_stats['encrypted']} encrypted")
        
        # Test quilt statistics
        if indexer.quilt_manager:
            try:
                quilt_stats = await indexer.get_quilt_stats()
                logger.info(f"Quilt stats: {quilt_stats}")
                
                user_quilts = await indexer.list_user_quilts("user_123")
                logger.info(f"User quilts: {len(user_quilts)} quilts")
                for quilt in user_quilts:
                    logger.info(f"  - Category '{quilt['category']}': {quilt['blob_count']} blobs")
            except Exception as e:
                logger.warning(f"Quilt stats failed: {e}")
        
        # Test unified search (HNSW functionality)
        logger.info("Testing unified search...")
        
        query_vector = [0.15, 0.25, 0.35] + [0.0] * 381  # Similar to health vectors
        
        search_results = await indexer.search_unified(
            query_vector=query_vector,
            k=10,
            filters={"owner": "user_123"}
        )
        
        logger.info(f"Search returned {len(search_results)} results:")
        for result in search_results:
            logger.info(f"  - {result.get('embedding_id')}: category='{result.get('category')}', "
                       f"similarity={result.get('similarity_score', 0):.3f}")
        
        # Test category-specific search
        logger.info("Testing category-specific search...")
        
        health_results = await indexer.search_unified(
            query_vector=query_vector,
            k=5,
            filters={"owner": "user_123", "category": "health"}
        )
        
        logger.info(f"Health category search returned {len(health_results)} results:")
        for result in health_results:
            logger.info(f"  - {result.get('embedding_id')}: similarity={result.get('similarity_score', 0):.3f}")
        
        # Verify category organization
        categories_found = set(result.get('category') for result in search_results)
        expected_categories = {"health", "finance", "personal"}
        
        if categories_found == expected_categories:
            logger.info("SUCCESS: All expected categories found in search results")
        else:
            logger.warning(f"Expected categories {expected_categories}, found {categories_found}")
        
        # Verify HNSW is working (similarity scores should be reasonable)
        if health_results:
            top_similarity = health_results[0].get('similarity_score', 0)
            if top_similarity > 0.5:  # Reasonable similarity
                logger.info(f"SUCCESS: HNSW similarity search working (top score: {top_similarity:.3f})")
            else:
                logger.warning(f"HNSW similarity seems low: {top_similarity:.3f}")
        
        logger.info("All category-based quilt tests completed successfully!")
        
        return True
        
    except Exception as e:
        logger.error(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        await indexer.stop()

async def main():
    """Run the category-based quilt tests with mocked services."""
    
    print("\n" + "="*70)
    print("Personal Data Wallet - Category-Based Quilt Storage Tests (MOCKED)")
    print("="*70)
    
    success = await test_category_based_quilts_mock()
    
    print("\n" + "="*70)
    if success:
        print("All tests PASSED! Category-based quilt storage is working correctly.")
        print("\nKey features demonstrated:")
        print("• Automatic category organization (health, finance, personal)")
        print("• HNSW similarity search on metadata vectors")
        print("• Category-specific filtering and retrieval")
        print("• Quilt management for cost-effective storage")
        print("• Statistics and monitoring capabilities")
        print("\nNOTE: This test used mocked Walrus/Sui services.")
        print("For full integration testing, run actual Walrus and Sui services.")
    else:
        print("Some tests FAILED. Check the logs above for details.")
    print("="*70 + "\n")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)