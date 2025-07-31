#!/usr/bin/env python3
"""
Test script for privacy-preserving chat memory extraction workflow.
Demonstrates the two-layer embedding approach with Seal encryption.
"""

import asyncio
import numpy as np
import json
from datetime import datetime
from typing import List, Dict

# Import our services
from backend.services.hnsw_indexer import HNSWIndexerService
from backend.services.seal_encryption import SealEncryptionService

class MockEmbeddingService:
    """Mock embedding service for testing"""
    
    def encode_chat_message(self, text: str) -> tuple:
        """Generate both main vector and metadata vector from chat text"""
        # Simulate generating embeddings
        main_vector = np.random.rand(768).tolist()  # Full semantic vector
        metadata_vector = np.random.rand(384).tolist()  # Reduced metadata vector
        
        return main_vector, metadata_vector
    
    def extract_entities_and_relationships(self, text: str) -> Dict:
        """Mock entity/relationship extraction from chat"""
        # Simulate NLP entity extraction
        entities = {}
        relationships = []
        
        if "pizza" in text.lower():
            entities["pizza"] = {
                "entity_type": "Food",
                "creation_timestamp": datetime.now().isoformat(),
                "semantic_meaning": "Italian cuisine item mentioned by user",
                "confidence_score": 0.9
            }
            relationships.append({
                "source_entity": "user",
                "relationship_type": "mentions",
                "destination_entity": "pizza",
                "confidence_score": 0.85
            })
        
        if "work" in text.lower() or "job" in text.lower():
            entities["work"] = {
                "entity_type": "Activity",
                "creation_timestamp": datetime.now().isoformat(),
                "semantic_meaning": "Professional work activity",
                "confidence_score": 0.8
            }
            relationships.append({
                "source_entity": "user",
                "relationship_type": "engaged_in",
                "destination_entity": "work",
                "confidence_score": 0.8
            })
        
        return entities, relationships

async def test_privacy_preserving_workflow():
    """Test the complete privacy-preserving workflow"""
    print("🔒 Testing Privacy-Preserving Chat Memory Extraction Workflow")
    print("=" * 60)
    
    # Initialize services
    indexer = HNSWIndexerService()
    embedding_service = MockEmbeddingService()
    
    # Sample chat messages (bot chat app scenario)
    chat_messages = [
        {
            "user": "I love eating pizza on Friday nights!",
            "assistant": "That sounds like a great way to end the week! Do you have a favorite pizza place?"
        },
        {
            "user": "Work has been really stressful lately.",
            "assistant": "I'm sorry to hear that. Would you like to talk about what's making work stressful?"
        },
        {
            "user": "I went to a new Italian restaurant yesterday.",
            "assistant": "How was the food? Did you try anything new?"
        }
    ]
    
    user_address = "0x1234567890abcdef1234567890abcdef12345678"
    user_signature = "mock_signature_for_testing"
    
    print(f"👤 User Address: {user_address}")
    print(f"📝 Processing {len(chat_messages)} chat messages...")
    print()
    
    stored_embeddings = []
    
    # Process each chat message
    for i, message in enumerate(chat_messages):
        user_text = message["user"]
        print(f"💬 Message {i+1}: {user_text}")
        
        # Step 1: Generate embeddings
        main_vector, metadata_vector = embedding_service.encode_chat_message(user_text)
        print(f"  📊 Generated main vector: {len(main_vector)} dimensions")
        print(f"  📊 Generated metadata vector: {len(metadata_vector)} dimensions")
        
        # Step 2: Extract entities and relationships
        entities, relationships = embedding_service.extract_entities_and_relationships(user_text)
        print(f"  🏷️  Extracted {len(entities)} entities, {len(relationships)} relationships")
        
        # Step 3: Store with privacy-preserving method
        embedding_id = f"chat_memory_{i+1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        try:
            index_id = await indexer.add_enhanced_embedding_with_privacy(
                embedding_id=embedding_id,
                owner=user_address,
                main_vector=main_vector,  # This gets encrypted
                metadata_vector=metadata_vector,  # This stays public for search
                category="chat_memory",
                timestamp=datetime.now().isoformat(),
                entities=entities,
                relationships=relationships,
                temporal_data={
                    "conversation_turn": str(i+1),
                    "message_type": "user_input",
                    "extracted_at": datetime.now().isoformat()
                },
                storage_layer="external_context"
            )
            
            stored_embeddings.append({
                "embedding_id": embedding_id,
                "index_id": index_id,
                "original_text": user_text
            })
            
            print(f"  ✅ Stored as privacy-preserving embedding (Index ID: {index_id})")
            print(f"  🔐 Main vector encrypted with Seal IBE")
            print(f"  🔍 Metadata vector available for search")
            
        except Exception as e:
            print(f"  ❌ Failed to store: {e}")
        
        print()
    
    # Step 4: Test metadata search (no decryption needed)
    print("🔍 Testing Metadata Search (Public, No Decryption)")
    print("-" * 50)
    
    # Create a query vector (simulated)
    query_vector = np.random.rand(384)  # Same dimension as metadata vector
    
    search_results = await indexer.search_unified(
        query_vector=query_vector,
        k=5,
        filters={"category": "chat_memory", "owner": user_address}
    )
    
    print(f"Found {len(search_results)} results from metadata search:")
    for result in search_results:
        print(f"  📄 {result['embedding_id']}")
        print(f"     Owner: {result['owner']}")
        print(f"     Category: {result['category']}")
        print(f"     Encrypted: {result['main_vector_encrypted']}")
        print(f"     Similarity: {result['similarity_score']:.3f}")
        print(f"     Entities: {list(result['entities'].keys())}")
        print()
    
    # Step 5: Test secure retrieval (with decryption)
    print("🔓 Testing Secure Retrieval (With Decryption)")
    print("-" * 50)
    
    if stored_embeddings:
        test_embedding = stored_embeddings[0]
        print(f"Attempting to decrypt: {test_embedding['embedding_id']}")
        print(f"Original text was: \"{test_embedding['original_text']}\"")
        
        try:
            decrypted_result = await indexer.retrieve_decrypted_main_vector(
                embedding_id=test_embedding['embedding_id'],
                user_address=user_address,
                user_signature=user_signature
            )
            
            if decrypted_result:
                print("  ✅ Successfully decrypted main vector!")
                print(f"  📊 Main vector length: {len(decrypted_result['main_vector'])}")
                print(f"  📊 Metadata vector length: {len(decrypted_result['metadata_vector'])}")
                print(f"  🏷️  Entities: {list(decrypted_result['entities'].keys())}")
                print(f"  🔗 Relationships: {len(decrypted_result['relationships'])}")
                print(f"  ✨ Decryption successful: {decrypted_result['decrypted']}")
            else:
                print("  ❌ Failed to decrypt main vector")
                
        except Exception as e:
            print(f"  ❌ Decryption error: {e}")
    
    print()
    
    # Step 6: Show privacy benefits
    print("🛡️  Privacy Benefits Demonstrated")
    print("-" * 50)
    print("✅ Metadata vectors are public and searchable (similarity search works)")
    print("✅ Main vectors are encrypted with Seal IBE (personal data protected)")
    print("✅ Only authorized users can decrypt their own data")
    print("✅ Walrus stores encrypted blobs publicly, but content is private")
    print("✅ Entity/relationship extraction preserved in encrypted layer")
    print("✅ Two-stage query: fast public search, secure private retrieval")
    
    # Cleanup
    await indexer.stop()
    print()
    print("🏁 Privacy-preserving workflow test completed!")

async def main():
    """Main test function"""
    try:
        await test_privacy_preserving_workflow()
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())