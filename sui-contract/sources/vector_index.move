module personal_data_wallet::vector_index {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;

    // Error codes
    const ENotOwner: u64 = 1;
    const EInvalidVector: u64 = 2;
    const EInvalidWalrusHash: u64 = 3;

    // Struct representing a vector embedding entry in the index
    public struct VectorEmbedding has key, store {
        id: UID,
        owner: address,
        walrus_hash: String,           // Hash of encrypted main vector on Walrus
        metadata_vector: vector<u64>,  // Unencrypted metadata vector for search (scaled to u64)
        category: String,              // Category for organization
        ibe_identity: String,          // IBE identity for decryption
        policy_hash: String,           // Access policy hash
        creation_time: u64,
        last_accessed: u64,
    }

    // Registry to track all embeddings for efficient querying
    public struct VectorRegistry has key {
        id: UID,
        total_embeddings: u64,
        categories: vector<String>,
    }

    // Admin capability for managing the system
    public struct AdminCap has key {
        id: UID,
    }

    // Events
    public struct EmbeddingAdded has copy, drop {
        embedding_id: address,
        owner: address,
        walrus_hash: String,
        metadata_vector: vector<u64>,
        category: String,
        ibe_identity: String,
        timestamp: u64,
    }

    public struct EmbeddingAccessed has copy, drop {
        embedding_id: address,
        accessor: address,
        timestamp: u64,
    }

    public struct EmbeddingRemoved has copy, drop {
        embedding_id: address,
        owner: address,
        timestamp: u64,
    }

    // Initialize the module
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        let registry = VectorRegistry {
            id: object::new(ctx),
            total_embeddings: 0,
            categories: vector::empty(),
        };
        
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(registry);
    }

    // Add a new vector embedding to the index
    public entry fun add_embedding(
        registry: &mut VectorRegistry,
        walrus_hash: vector<u8>,
        metadata_vector: vector<u64>,
        category: vector<u8>,
        ibe_identity: vector<u8>,
        policy_hash: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate inputs
        assert!(!vector::is_empty(&walrus_hash), EInvalidWalrusHash);
        assert!(!vector::is_empty(&metadata_vector), EInvalidVector);
        
        let walrus_hash_string = string::utf8(walrus_hash);
        let category_string = string::utf8(category);
        let ibe_identity_string = string::utf8(ibe_identity);
        let policy_hash_string = string::utf8(policy_hash);
        
        let embedding = VectorEmbedding {
            id: object::new(ctx),
            owner: sender,
            walrus_hash: walrus_hash_string,
            metadata_vector,
            category: category_string,
            ibe_identity: ibe_identity_string,
            policy_hash: policy_hash_string,
            creation_time: tx_context::epoch_timestamp_ms(ctx),
            last_accessed: tx_context::epoch_timestamp_ms(ctx),
        };

        let embedding_id = object::uid_to_address(&embedding.id);
        
        // Update registry
        registry.total_embeddings = registry.total_embeddings + 1;
        
        // Add category if not exists
        if (!vector::contains(&registry.categories, &category_string)) {
            vector::push_back(&mut registry.categories, category_string);
        };

        // Emit event for indexer
        event::emit(EmbeddingAdded {
            embedding_id,
            owner: sender,
            walrus_hash: walrus_hash_string,
            metadata_vector,
            category: category_string,
            ibe_identity: ibe_identity_string,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        transfer::transfer(embedding, sender);
    }

    // Update last accessed time when embedding is retrieved
    public entry fun mark_accessed(
        embedding: &mut VectorEmbedding,
        ctx: &mut TxContext
    ) {
        let accessor = tx_context::sender(ctx);
        embedding.last_accessed = tx_context::epoch_timestamp_ms(ctx);
        
        let embedding_id = object::uid_to_address(&embedding.id);
        
        event::emit(EmbeddingAccessed {
            embedding_id,
            accessor,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Remove an embedding (only by owner)
    public entry fun remove_embedding(
        embedding: VectorEmbedding,
        registry: &mut VectorRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(embedding.owner == sender, ENotOwner);
        
        let embedding_id = object::uid_to_address(&embedding.id);
        
        // Update registry
        registry.total_embeddings = registry.total_embeddings - 1;
        
        event::emit(EmbeddingRemoved {
            embedding_id,
            owner: sender,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
        
        let VectorEmbedding { 
            id, 
            owner: _, 
            walrus_hash: _, 
            metadata_vector: _, 
            category: _, 
            ibe_identity: _, 
            policy_hash: _, 
            creation_time: _, 
            last_accessed: _ 
        } = embedding;
        
        object::delete(id);
    }

    // Get embedding information (public view function)
    public fun get_embedding_info(embedding: &VectorEmbedding): (
        address,     // owner
        String,      // walrus_hash
        vector<u64>, // metadata_vector
        String,      // category
        String,      // ibe_identity
        String,      // policy_hash
        u64,         // creation_time
        u64          // last_accessed
    ) {
        (
            embedding.owner,
            embedding.walrus_hash,
            embedding.metadata_vector,
            embedding.category,
            embedding.ibe_identity,
            embedding.policy_hash,
            embedding.creation_time,
            embedding.last_accessed
        )
    }

    // Get registry statistics
    public fun get_registry_stats(registry: &VectorRegistry): (u64, vector<String>) {
        (registry.total_embeddings, registry.categories)
    }

    // Check if embedding is owned by specific address
    public fun is_owner(embedding: &VectorEmbedding, user: address): bool {
        embedding.owner == user
    }

    // Get embedding owner
    public fun get_owner(embedding: &VectorEmbedding): address {
        embedding.owner
    }

    // Get walrus hash
    public fun get_walrus_hash(embedding: &VectorEmbedding): String {
        embedding.walrus_hash
    }

    // Get metadata vector
    public fun get_metadata_vector(embedding: &VectorEmbedding): vector<u64> {
        embedding.metadata_vector
    }

    // Get category
    public fun get_category(embedding: &VectorEmbedding): String {
        embedding.category
    }

    // Get IBE identity
    public fun get_ibe_identity(embedding: &VectorEmbedding): String {
        embedding.ibe_identity
    }

    // Transfer admin capability
    public entry fun transfer_admin_cap(admin_cap: AdminCap, new_admin: address) {
        transfer::transfer(admin_cap, new_admin);
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
