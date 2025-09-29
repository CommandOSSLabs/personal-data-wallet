module pdw::memory {
    use std::string::{Self, String};
    use sui::vec_map::{Self, VecMap};

    // Events
    public struct MemoryCreated has copy, drop {
        id: object::ID,
        owner: address,
        category: String,
        vector_id: u64
    }

    public struct MemoryIndexUpdated has copy, drop {
        id: object::ID,
        owner: address,
        version: u64,
        index_blob_id: String,
        graph_blob_id: String
    }

    public struct MemoryMetadataUpdated has copy, drop {
        memory_id: object::ID,
        metadata_blob_id: String,
        embedding_dimension: u64
    }

    // Custom metadata struct for memory objects (inspired by Walrus metadata.move)
    public struct MemoryMetadata has drop, store {
        // Content identification
        content_type: String,
        content_size: u64,
        content_hash: String,
        
        // Memory classification
        category: String,
        topic: String,
        importance: u8, // 1-10 scale
        
        // Vector embedding (768 dimensions)
        embedding_blob_id: String, // Points to serialized embedding on Walrus
        embedding_dimension: u64,  // Should be 768 for Gemini embeddings
        
        // Temporal metadata
        created_timestamp: u64,
        updated_timestamp: u64,
        
        // Additional metadata using VecMap (extensible)
        custom_metadata: VecMap<String, String>
    }

    // Points to the HNSW index and Knowledge Graph files on Walrus
    public struct MemoryIndex has key {
        id: object::UID,
        owner: address,
        version: u64,
        index_blob_id: String, // Pointer to index.hnsw
        graph_blob_id: String  // Pointer to graph.json
    }

    // A simple on-chain record of an encrypted memory with rich metadata
    public struct Memory has key {
        id: object::UID,
        owner: address,
        category: String,
        vector_id: u64, // Links to the HNSW index ID
        blob_id: String, // Pointer to the encrypted content on Walrus
        metadata: MemoryMetadata // Rich metadata with embeddings
    }

    // Error codes
    const ENonOwner: u64 = 0;
    const EInvalidVersion: u64 = 1;
    const EInvalidEmbeddingDimension: u64 = 2;
    const EInvalidImportance: u64 = 3;

    /// Create a new memory index for a user
    public entry fun create_memory_index(
        index_blob_id: vector<u8>,
        graph_blob_id: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let id = object::new(ctx);
        let object_id = object::uid_to_inner(&id);
        
        let memory_index = MemoryIndex {
            id,
            owner,
            version: 1,
            index_blob_id: string::utf8(index_blob_id),
            graph_blob_id: string::utf8(graph_blob_id)
        };

        // Emit event
        sui::event::emit(MemoryIndexUpdated {
            id: object_id,
            owner,
            version: 1,
            index_blob_id: string::utf8(index_blob_id),
            graph_blob_id: string::utf8(graph_blob_id)
        });

        transfer::transfer(memory_index, owner);
    }

    /// Update an existing memory index with new blob IDs
    public entry fun update_memory_index(
        memory_index: &mut MemoryIndex,
        expected_version: u64,
        new_index_blob_id: vector<u8>,
        new_graph_blob_id: vector<u8>,
        ctx: &tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == memory_index.owner, ENonOwner);
        assert!(expected_version == memory_index.version, EInvalidVersion);
        
        // Update the blob IDs
        memory_index.index_blob_id = string::utf8(new_index_blob_id);
        memory_index.graph_blob_id = string::utf8(new_graph_blob_id);
        
        // Increment the version
        memory_index.version = memory_index.version + 1;

        // Emit event
        sui::event::emit(MemoryIndexUpdated {
            id: object::uid_to_inner(&memory_index.id),
            owner: memory_index.owner,
            version: memory_index.version,
            index_blob_id: memory_index.index_blob_id,
            graph_blob_id: memory_index.graph_blob_id
        });
    }

    /// Create metadata struct with embedding
    public fun create_memory_metadata(
        content_type: vector<u8>,
        content_size: u64,
        content_hash: vector<u8>,
        category: vector<u8>,
        topic: vector<u8>,
        importance: u8,
        embedding_blob_id: vector<u8>,
        embedding_dimension: u64,
        created_timestamp: u64
    ): MemoryMetadata {
        // Validate importance scale (1-10)
        assert!(importance >= 1 && importance <= 10, EInvalidImportance);
        
        // Validate embedding dimension (should be 768 for Gemini)
        assert!(embedding_dimension == 768, EInvalidEmbeddingDimension);
        
        MemoryMetadata {
            content_type: string::utf8(content_type),
            content_size,
            content_hash: string::utf8(content_hash),
            category: string::utf8(category),
            topic: string::utf8(topic),
            importance,
            embedding_blob_id: string::utf8(embedding_blob_id),
            embedding_dimension,
            created_timestamp,
            updated_timestamp: created_timestamp,
            custom_metadata: vec_map::empty()
        }
    }

    /// Create a new memory record with rich metadata
    public entry fun create_memory_record(
        category: vector<u8>,
        vector_id: u64,
        blob_id: vector<u8>,
        // Metadata parameters
        content_type: vector<u8>,
        content_size: u64,
        content_hash: vector<u8>,
        topic: vector<u8>,
        importance: u8,
        embedding_blob_id: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let id = object::new(ctx);
        let object_id = object::uid_to_inner(&id);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        // Create metadata
        let metadata = create_memory_metadata(
            content_type,
            content_size,
            content_hash,
            category,
            topic,
            importance,
            embedding_blob_id,
            768, // Gemini embedding dimension
            timestamp
        );
        
        let memory = Memory {
            id,
            owner,
            category: string::utf8(category),
            vector_id,
            blob_id: string::utf8(blob_id),
            metadata
        };

        // Emit event
        sui::event::emit(MemoryCreated {
            id: object_id,
            owner,
            category: string::utf8(category),
            vector_id
        });

        // Emit metadata event
        sui::event::emit(MemoryMetadataUpdated {
            memory_id: object_id,
            metadata_blob_id: string::utf8(embedding_blob_id),
            embedding_dimension: 768
        });

        transfer::transfer(memory, owner);
    }

    /// Update metadata for an existing memory
    public entry fun update_memory_metadata(
        memory: &mut Memory,
        new_topic: vector<u8>,
        new_importance: u8,
        ctx: &tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == memory.owner, ENonOwner);
        assert!(new_importance >= 1 && new_importance <= 10, EInvalidImportance);
        
        // Update metadata
        memory.metadata.topic = string::utf8(new_topic);
        memory.metadata.importance = new_importance;
        memory.metadata.updated_timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        // Emit metadata update event
        sui::event::emit(MemoryMetadataUpdated {
            memory_id: object::uid_to_inner(&memory.id),
            metadata_blob_id: memory.metadata.embedding_blob_id,
            embedding_dimension: memory.metadata.embedding_dimension
        });
    }

    /// Add custom metadata field
    public entry fun add_custom_metadata(
        memory: &mut Memory,
        key: vector<u8>,
        value: vector<u8>,
        ctx: &tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == memory.owner, ENonOwner);
        
        vec_map::insert(&mut memory.metadata.custom_metadata, 
                       string::utf8(key), 
                       string::utf8(value));
        
        memory.metadata.updated_timestamp = tx_context::epoch_timestamp_ms(ctx);
    }

    /// Delete a memory record 
    public entry fun delete_memory_record(
        memory: Memory,
        ctx: &tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == memory.owner, ENonOwner);

        // Emit deletion event
        sui::event::emit(MemoryCreated {
            id: object::uid_to_inner(&memory.id),
            owner: memory.owner,
            category: memory.category,
            vector_id: memory.vector_id
        });

        // Delete the memory object
        let Memory { id, owner: _, category: _, vector_id: _, blob_id: _, metadata: _ } = memory;
        object::delete(id);
    }

    // Accessor functions for MemoryIndex
    public fun get_index_blob_id(memory_index: &MemoryIndex): &String {
        &memory_index.index_blob_id
    }

    public fun get_graph_blob_id(memory_index: &MemoryIndex): &String {
        &memory_index.graph_blob_id
    }

    public fun get_version(memory_index: &MemoryIndex): u64 {
        memory_index.version
    }

    // Accessor functions for Memory
    public fun get_memory_blob_id(memory: &Memory): &String {
        &memory.blob_id
    }

    public fun get_memory_vector_id(memory: &Memory): u64 {
        memory.vector_id
    }

    public fun get_memory_category(memory: &Memory): &String {
        &memory.category
    }

    // Accessor functions for MemoryMetadata
    public fun get_metadata(memory: &Memory): &MemoryMetadata {
        &memory.metadata
    }

    public fun get_embedding_blob_id(metadata: &MemoryMetadata): &String {
        &metadata.embedding_blob_id
    }

    public fun get_content_type(metadata: &MemoryMetadata): &String {
        &metadata.content_type
    }

    public fun get_content_size(metadata: &MemoryMetadata): u64 {
        metadata.content_size
    }

    public fun get_topic(metadata: &MemoryMetadata): &String {
        &metadata.topic
    }

    public fun get_importance(metadata: &MemoryMetadata): u8 {
        metadata.importance
    }

    public fun get_created_timestamp(metadata: &MemoryMetadata): u64 {
        metadata.created_timestamp
    }

    public fun get_updated_timestamp(metadata: &MemoryMetadata): u64 {
        metadata.updated_timestamp
    }

    public fun get_custom_metadata(metadata: &MemoryMetadata): &VecMap<String, String> {
        &metadata.custom_metadata
    }
}