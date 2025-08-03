module pdw::memory {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};

    // Events
    struct MemoryCreated has copy, drop {
        id: ID,
        owner: address,
        category: String,
        vector_id: u64
    }

    struct MemoryIndexUpdated has copy, drop {
        id: ID,
        owner: address,
        version: u64,
        index_blob_id: String,
        graph_blob_id: String
    }

    // Points to the HNSW index and Knowledge Graph files on Walrus
    struct MemoryIndex has key {
        id: UID,
        owner: address,
        version: u64,
        index_blob_id: String, // Pointer to index.hnsw
        graph_blob_id: String  // Pointer to graph.json
    }

    // A simple on-chain record of an encrypted memory
    struct Memory has key {
        id: UID,
        owner: address,
        category: String,
        vector_id: u64, // Links to the HNSW index ID
        blob_id: String // Pointer to the encrypted content on Walrus
    }

    // Error codes
    const ENonOwner: u64 = 0;
    const EInvalidVersion: u64 = 1;

    /// Create a new memory index for a user
    public entry fun create_memory_index(
        index_blob_id: vector<u8>,
        graph_blob_id: vector<u8>,
        ctx: &mut TxContext
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
        ctx: &TxContext
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

    /// Create a new memory record
    public entry fun create_memory_record(
        category: vector<u8>,
        vector_id: u64,
        blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let id = object::new(ctx);
        let object_id = object::uid_to_inner(&id);
        
        let memory = Memory {
            id,
            owner,
            category: string::utf8(category),
            vector_id,
            blob_id: string::utf8(blob_id)
        };

        // Emit event
        sui::event::emit(MemoryCreated {
            id: object_id,
            owner,
            category: string::utf8(category),
            vector_id
        });

        transfer::transfer(memory, owner);
    }

    // Accessor functions
    public fun get_index_blob_id(memory_index: &MemoryIndex): &String {
        &memory_index.index_blob_id
    }

    public fun get_graph_blob_id(memory_index: &MemoryIndex): &String {
        &memory_index.graph_blob_id
    }

    public fun get_version(memory_index: &MemoryIndex): u64 {
        memory_index.version
    }

    public fun get_memory_blob_id(memory: &Memory): &String {
        &memory.blob_id
    }

    public fun get_memory_vector_id(memory: &Memory): u64 {
        memory.vector_id
    }

    public fun get_memory_category(memory: &Memory): &String {
        &memory.category
    }
}