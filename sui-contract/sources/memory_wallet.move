module personal_data_wallet::memory_wallet {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;

    // Error codes
    const ENotOwner: u64 = 1;
    const EInvalidCertificate: u64 = 2;

    // Struct representing a user's complete memory
    struct MemoryObject has key, store {
        id: UID,
        owner: address,
        vector_index_cert: String, // Pointer to HNSW index blob on Walrus
        graph_cert: String,        // Pointer to knowledge graph JSON blob on Walrus
        creation_time: u64,
        last_updated: u64,
    }

    // Admin capability for managing the system
    struct AdminCap has key {
        id: UID,
    }

    // Events
    struct IngestionRequested has copy, drop {
        user: address,
        memory_object_id: address,
        graph_json: String,
        vector_length: u64,
        timestamp: u64,
    }

    struct MemoryUpdated has copy, drop {
        user: address,
        memory_object_id: address,
        vector_cert: String,
        graph_cert: String,
        timestamp: u64,
    }

    struct MemoryObjectCreated has copy, drop {
        user: address,
        memory_object_id: address,
        timestamp: u64,
    }

    // Initialize the module - creates admin capability
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // Create a new MemoryObject for a user
    public entry fun create_memory_object(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let memory_object = MemoryObject {
            id: object::new(ctx),
            owner: sender,
            vector_index_cert: string::utf8(b""),
            graph_cert: string::utf8(b""),
            creation_time: tx_context::epoch_timestamp_ms(ctx),
            last_updated: tx_context::epoch_timestamp_ms(ctx),
        };

        let memory_object_id = object::uid_to_address(&memory_object.id);

        // Emit creation event
        event::emit(MemoryObjectCreated {
            user: sender,
            memory_object_id,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        transfer::transfer(memory_object, sender);
    }

    // Ingest new memory data - triggers processing pipeline
    public entry fun ingest(
        memory_object: &MemoryObject,
        graph_json: vector<u8>,
        vector_data: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify ownership
        assert!(memory_object.owner == sender, ENotOwner);

        let graph_string = string::utf8(graph_json);
        let memory_object_id = object::uid_to_address(&memory_object.id);

        // Emit ingestion requested event for backend to process
        event::emit(IngestionRequested {
            user: sender,
            memory_object_id,
            graph_json: graph_string,
            vector_length: vector::length(&vector_data),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Finalize memory update with Walrus certificates (only callable by backend service)
    public entry fun finalize_update(
        memory_object: &mut MemoryObject,
        vector_cert: vector<u8>,
        graph_cert: vector<u8>,
        _admin_cap: &AdminCap,
        ctx: &mut TxContext
    ) {
        let vector_cert_string = string::utf8(vector_cert);
        let graph_cert_string = string::utf8(graph_cert);

        // Validate certificates are not empty
        assert!(!string::is_empty(&vector_cert_string), EInvalidCertificate);
        assert!(!string::is_empty(&graph_cert_string), EInvalidCertificate);

        // Update the memory object
        memory_object.vector_index_cert = vector_cert_string;
        memory_object.graph_cert = graph_cert_string;
        memory_object.last_updated = tx_context::epoch_timestamp_ms(ctx);

        let memory_object_id = object::uid_to_address(&memory_object.id);

        // Emit update event
        event::emit(MemoryUpdated {
            user: memory_object.owner,
            memory_object_id,
            vector_cert: vector_cert_string,
            graph_cert: graph_cert_string,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Get memory object information (public view function)
    public fun get_memory_info(memory_object: &MemoryObject): (address, String, String, u64, u64) {
        (
            memory_object.owner,
            memory_object.vector_index_cert,
            memory_object.graph_cert,
            memory_object.creation_time,
            memory_object.last_updated
        )
    }

    // Check if memory object is owned by specific address
    public fun is_owner(memory_object: &MemoryObject, user: address): bool {
        memory_object.owner == user
    }

    // Get the owner of a memory object
    public fun get_owner(memory_object: &MemoryObject): address {
        memory_object.owner
    }

    // Get vector certificate
    public fun get_vector_cert(memory_object: &MemoryObject): String {
        memory_object.vector_index_cert
    }

    // Get graph certificate
    public fun get_graph_cert(memory_object: &MemoryObject): String {
        memory_object.graph_cert
    }

    // Get last updated timestamp
    public fun get_last_updated(memory_object: &MemoryObject): u64 {
        memory_object.last_updated
    }

    // Transfer admin capability (for admin management)
    public entry fun transfer_admin_cap(admin_cap: AdminCap, new_admin: address) {
        transfer::transfer(admin_cap, new_admin);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}