module pdw::seal_access_control {
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::string::{Self, String};

    // ========== Constants ==========
    const ENotOwner: u64 = 0;
    const ENoAccess: u64 = 1;
    const EContentNotFound: u64 = 2;
    const EInvalidAccessLevel: u64 = 3;
    const EInvalidTimestamp: u64 = 5;
    
    /// Access levels - these are the ONLY valid values
    /// Use exactly these strings when calling access functions
    const ACCESS_LEVEL_READ: vector<u8> = b"read";
    const ACCESS_LEVEL_WRITE: vector<u8> = b"write";

    // ========== Events ==========
    
    /// Event emitted when the access registry is created
    public struct RegistryCreated has copy, drop {
        registry_id: object::ID,
        creator: address,
    }
    
    /// Event emitted when content is registered
    public struct ContentRegistered has copy, drop {
        content_id: String,
        owner: address,
        timestamp: u64,
    }
    
    /// Event emitted when access is granted or revoked
    public struct AccessChanged has copy, drop {
        content_id: String,
        recipient: address,
        access_level: String,
        granted: bool, // true for grant, false for revoke
        expires_at: u64,
        granted_by: address,
    }
    
    // ========== Structs ==========
    
    /// Access control registry for managing permissions
    public struct AccessRegistry has key {
        id: object::UID,
        /// Maps content_id -> owner address
        owners: Table<String, address>,
        /// Maps (content_id, user_address) -> AccessPermission
        permissions: Table<vector<u8>, AccessPermission>,
    }

    /// Individual access permission
    public struct AccessPermission has store, drop, copy {
        access_level: String, // "read" or "write"
        granted_at: u64,
        expires_at: u64,
        granted_by: address,
    }

    /// Access log entry for audit trail
    public struct AccessLog has key, store {
        id: object::UID,
        content_id: String,
        requester: address,
        access_type: String,
        timestamp: u64,
        success: bool,
    }

    // ========== Initialization ==========
    
    /// Initialize the access control registry
    /// Called automatically on package publication
    /// Emits RegistryCreated event for tracking
    fun init(ctx: &mut tx_context::TxContext) {
        let registry_id = object::new(ctx);
        let registry_inner_id = object::uid_to_inner(&registry_id);
        let creator = tx_context::sender(ctx);
        
        let registry = AccessRegistry {
            id: registry_id,
            owners: table::new(ctx),
            permissions: table::new(ctx),
        };
        
        // Emit event for tracking registry creation
        event::emit(RegistryCreated {
            registry_id: registry_inner_id,
            creator,
        });
        
        transfer::share_object(registry);
    }

    // ========== Public Functions for Seal Integration ==========
    
    /// SEAL-compliant access approval function
    /// Must be entry function that aborts on access denial (per SEAL requirements)
    /// Key ID format: [package_id][content_id] for this implementation
    entry fun seal_approve(
        id: vector<u8>,
        registry: &AccessRegistry,
        clock: &Clock,
        ctx: &TxContext
    ) {
        let requester = tx_context::sender(ctx);
        
        // Parse the key ID to extract content identifier
        // The id comes as raw address bytes from SEAL (fromHex), convert to address string
        // Address bytes are 32 bytes long, convert to hex string with 0x prefix
        assert!(id.length() == 32, EInvalidTimestamp); // Address must be 32 bytes
        
        let mut hex_string = vector::empty<u8>();
        vector::push_back(&mut hex_string, 48); // '0'
        vector::push_back(&mut hex_string, 120); // 'x'
        
        let mut i = 0;
        while (i < 32) {
            let byte = *vector::borrow(&id, i);
            let high = byte / 16;
            let low = byte % 16;
            // Convert to hex chars: 0-9 = 48-57, a-f = 97-102
            vector::push_back(&mut hex_string, if (high < 10) { 48 + high } else { 87 + high });
            vector::push_back(&mut hex_string, if (low < 10) { 48 + low } else { 87 + low });
            i = i + 1;
        };
        
        let content_id = string::utf8(hex_string);
        
        // Check if requester is the content owner (always has full access)
        if (table::contains(&registry.owners, content_id)) {
            let owner = *table::borrow(&registry.owners, content_id);
            if (owner == requester) {
                return // Owner always has access - function succeeds
            };
            
            // Check if the app has been granted permission by the user (OAuth-style)
            let key = build_permission_key(content_id, requester);
            if (table::contains(&registry.permissions, key)) {
                let permission = table::borrow(&registry.permissions, key);
                
                // Check if permission is still valid (not expired)
                let current_time = clock::timestamp_ms(clock);
                if (permission.expires_at > current_time) {
                    // Grant access for valid permission
                    return
                }
            }
        };
        
        // If we reach here, access is denied - abort per SEAL requirements
        abort ENoAccess
    }

    // ========== Content Registration ==========
    
    /// Register encrypted content with an owner
    /// Emits ContentRegistered event for tracking
    /// 
    /// @param registry: Mutable reference to the shared AccessRegistry
    /// @param content_id: Unique identifier for the content being registered
    /// @param clock: Reference to the global clock for timestamp
    /// @param ctx: Transaction context
    public entry fun register_content(
        registry: &mut AccessRegistry,
        content_id: String,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        
        // Ensure content hasn't been registered before
        assert!(!table::contains(&registry.owners, content_id), EContentNotFound);
        
        table::add(&mut registry.owners, content_id, owner);
        
        // Emit event for tracking
        event::emit(ContentRegistered {
            content_id,
            owner,
            timestamp,
        });
    }

    // ========== Access Management ==========
    
    /// Grant access to another user
    public entry fun grant_access(
        registry: &mut AccessRegistry,
        recipient: address,
        content_id: String,
        access_level: String,
        expires_at: u64,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify sender is owner
        assert!(table::contains(&registry.owners, content_id), ENotOwner);
        let owner = *table::borrow(&registry.owners, content_id);
        assert!(owner == sender, ENotOwner);
        
        // Validate access level using constants
        let access_bytes = *string::as_bytes(&access_level);
        assert!(
            access_bytes == ACCESS_LEVEL_READ || 
            access_bytes == ACCESS_LEVEL_WRITE,
            EInvalidAccessLevel
        );
        
        // Ensure expiration is in the future
        let current_time = clock::timestamp_ms(clock);
        assert!(expires_at > current_time, EInvalidTimestamp);
        
        // Create permission
        let permission = AccessPermission {
            access_level,
            granted_at: clock::timestamp_ms(clock),
            expires_at,
            granted_by: sender,
        };
        
        // Store permission
        let key = build_permission_key(content_id, recipient);
        if (table::contains(&registry.permissions, key)) {
            let _old_permission = table::remove(&mut registry.permissions, key);
            // Permission is dropped automatically
        };
        table::add(&mut registry.permissions, key, permission);
        
        // Emit event for tracking
        event::emit(AccessChanged {
            content_id,
            recipient,
            access_level,
            granted: true,
            expires_at,
            granted_by: sender,
        });
    }
    
    /// Revoke access from a user
    public entry fun revoke_access(
        registry: &mut AccessRegistry,
        recipient: address,
        content_id: String,
        ctx: &mut tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify sender is owner
        assert!(table::contains(&registry.owners, content_id), ENotOwner);
        let owner = *table::borrow(&registry.owners, content_id);
        assert!(owner == sender, ENotOwner);
        
        // Remove permission and emit event if it existed
        let key = build_permission_key(content_id, recipient);
        if (table::contains(&registry.permissions, key)) {
            let old_permission = table::remove(&mut registry.permissions, key);
            
            // Emit event for tracking
            event::emit(AccessChanged {
                content_id,
                recipient,
                access_level: old_permission.access_level,
                granted: false,
                expires_at: 0, // No expiration for revocation
                granted_by: sender,
            });
        };
    }

    // ========== View Functions ==========
    
    /// Check if a user has access (for off-chain queries)
    public fun check_access(
        registry: &AccessRegistry,
        user: address,
        content_id: String,
        clock: &clock::Clock
    ): bool {
        // Check if user is owner
        if (table::contains(&registry.owners, content_id)) {
            let owner = *table::borrow(&registry.owners, content_id);
            if (owner == user) {
                return true
            };
            
            // Check permissions
            let key = build_permission_key(content_id, user);
            if (table::contains(&registry.permissions, key)) {
                let permission = table::borrow(&registry.permissions, key);
                let current_time = clock::timestamp_ms(clock);
                if (permission.expires_at > current_time) {
                    return true
                }
                // Permission has expired but we can't modify in a view function
                // The expired permission will need to be cleaned up in a separate transaction
            }
        };
        
        false
    }

    /// Get permission details
    public fun get_permission(
        registry: &AccessRegistry,
        user: address,
        content_id: String
    ): (String, u64, u64) {
        let key = build_permission_key(content_id, user);
        assert!(table::contains(&registry.permissions, key), ENoAccess);
        
        let permission = table::borrow(&registry.permissions, key);
        (permission.access_level, permission.granted_at, permission.expires_at)
    }

    // ========== Audit Logging ==========
    
    /// Log access attempt (can be called by Seal integration)
    public entry fun log_access(
        content_id: String,
        access_type: String,
        success: bool,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let log = AccessLog {
            id: object::new(ctx),
            content_id,
            requester: tx_context::sender(ctx),
            access_type,
            timestamp: clock::timestamp_ms(clock),
            success,
        };
        transfer::transfer(log, tx_context::sender(ctx));
    }

    // ========== Maintenance Functions ==========
    
    /// Clean up expired permissions for a specific content_id and user
    /// This is a maintenance function that can be called by anyone
    public entry fun cleanup_expired_permission(
        registry: &mut AccessRegistry,
        content_id: String,
        user: address,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let key = build_permission_key(content_id, user);
        if (table::contains(&registry.permissions, key)) {
            let permission = table::borrow(&registry.permissions, key);
            let current_time = clock::timestamp_ms(clock);
            
            if (permission.expires_at <= current_time) {
                let old_permission = table::remove(&mut registry.permissions, key);
                
                // Emit event for tracking cleanup
                event::emit(AccessChanged {
                    content_id,
                    recipient: user,
                    access_level: old_permission.access_level,
                    granted: false,
                    expires_at: 0,
                    granted_by: tx_context::sender(ctx),
                });
            }
        }
    }
    
    // ========== Helper Functions ==========
    
    /// Build a unique key for permission storage
    /// Combines content_id bytes with user address bytes to create a unique identifier
    /// 
    /// @param content_id: The content identifier
    /// @param user: The user's address
    /// @return: A unique byte vector for this content-user combination
    fun build_permission_key(content_id: String, user: address): vector<u8> {
        let mut key = *string::as_bytes(&content_id);
        let user_bytes = sui::address::to_bytes(user);
        vector::append(&mut key, user_bytes);
        key
    }
}