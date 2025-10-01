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
    const EInvalidAppId: u64 = 6;
    const EInvalidContextId: u64 = 7;
    const EContextNotFound: u64 = 8;
    
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
    
    /// Event emitted when context is registered
    public struct ContextRegistered has copy, drop {
        context_id: String,
        app_id: String,
        owner: address,
        timestamp: u64,
    }
    
    /// Event emitted when cross-context access is granted or revoked
    public struct CrossContextAccessChanged has copy, drop {
        source_context_id: String,
        requesting_app_id: String,
        access_level: String,
        granted: bool,
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
        /// Maps context_id -> owner address (for context-level ownership)
        context_owners: Table<String, address>,
        /// Maps (context_id, app_id) -> AccessPermission (for cross-context access)
        context_permissions: Table<vector<u8>, AccessPermission>,
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
            context_owners: table::new(ctx),
            context_permissions: table::new(ctx),
        };
        
        // Emit event for tracking registry creation
        event::emit(RegistryCreated {
            registry_id: registry_inner_id,
            creator,
        });
        
        transfer::share_object(registry);
    }

    // ========== Public Functions for Seal Integration ==========
    
    /// SEAL-compliant access approval function with cross-context support
    /// Must be entry function that aborts on access denial (per SEAL requirements)
    /// 
    /// Flow:
    /// 1. User owns all data (verified via tx_context::sender)
    /// 2. Apps can access their own context without permission
    /// 3. Apps need explicit permission to access other contexts
    /// 
    /// @param id: Content identifier (SEAL key ID)
    /// @param requesting_app_id: App requesting access (must match actual calling app)
    /// @param registry: Access control registry
    /// @param clock: Clock for timestamp validation
    /// @param ctx: Transaction context
    entry fun seal_approve(
        id: vector<u8>,
        requesting_app_id: String,
        registry: &AccessRegistry,
        clock: &Clock,
        ctx: &TxContext
    ) {
        let owner = tx_context::sender(ctx);
        
        // Validate app_id is not empty
        assert!(!string::is_empty(&requesting_app_id), EInvalidAppId);
        
        // Parse the key ID to extract content identifier
        // The id comes as raw address bytes from SEAL (fromHex), convert to address string
        assert!(id.length() == 32, EInvalidTimestamp);
        
        let content_id = bytes_to_hex_string(id);
        
        // Extract context_id from content_id (format: "context_id:content_suffix")
        let context_id = extract_context_id(&content_id);
        
        // Verify owner owns this context
        assert!(table::contains(&registry.context_owners, context_id), EContextNotFound);
        let context_owner = *table::borrow(&registry.context_owners, context_id);
        assert!(context_owner == owner, ENotOwner);
        
        // Check if requesting_app is accessing its own context (auto-grant)
        if (is_own_context(&context_id, &requesting_app_id)) {
            return // App can always access its own context
        };
        
        // Check if requesting_app has cross-context permission
        let key = build_context_permission_key(&context_id, &requesting_app_id);
        if (table::contains(&registry.context_permissions, key)) {
            let permission = table::borrow(&registry.context_permissions, key);
            let current_time = clock::timestamp_ms(clock);
            
            if (permission.expires_at > current_time) {
                return // Valid permission - grant access
            }
        };
        
        // Access denied - abort per SEAL requirements
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

    /// Register a context wallet for an app
    /// Called when an app creates a context wallet for a user
    /// 
    /// @param registry: Mutable reference to the shared AccessRegistry
    /// @param context_id: Unique identifier for the context (derived from MainWallet)
    /// @param app_id: Application identifier
    /// @param clock: Reference to the global clock for timestamp
    /// @param ctx: Transaction context
    public entry fun register_context(
        registry: &mut AccessRegistry,
        context_id: String,
        app_id: String,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);
        
        // Validate inputs
        assert!(!string::is_empty(&context_id), EInvalidContextId);
        assert!(!string::is_empty(&app_id), EInvalidAppId);
        
        // Ensure context hasn't been registered before
        assert!(!table::contains(&registry.context_owners, context_id), EContextNotFound);
        
        table::add(&mut registry.context_owners, context_id, owner);
        
        // Emit event for tracking
        event::emit(ContextRegistered {
            context_id,
            app_id,
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

    /// Grant cross-context access: Allow requesting_app to access source_context data
    /// User must own the source context
    /// 
    /// Example: User grants Social App permission to read Medical App context
    /// 
    /// @param registry: Mutable reference to the shared AccessRegistry
    /// @param requesting_app_id: App that will access the data
    /// @param source_context_id: Context being accessed
    /// @param access_level: "read" or "write"
    /// @param expires_at: Expiration timestamp in milliseconds
    /// @param clock: Reference to the global clock
    /// @param ctx: Transaction context
    public entry fun grant_cross_context_access(
        registry: &mut AccessRegistry,
        requesting_app_id: String,
        source_context_id: String,
        access_level: String,
        expires_at: u64,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        
        // Validate inputs
        assert!(!string::is_empty(&requesting_app_id), EInvalidAppId);
        assert!(!string::is_empty(&source_context_id), EInvalidContextId);
        
        // Verify sender owns the source context
        assert!(table::contains(&registry.context_owners, source_context_id), EContextNotFound);
        let context_owner = *table::borrow(&registry.context_owners, source_context_id);
        assert!(context_owner == owner, ENotOwner);
        
        // Validate access level
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
            granted_at: current_time,
            expires_at,
            granted_by: owner,
        };
        
        // Store permission: (source_context_id, requesting_app_id) -> Permission
        let key = build_context_permission_key(&source_context_id, &requesting_app_id);
        if (table::contains(&registry.context_permissions, key)) {
            let _old_permission = table::remove(&mut registry.context_permissions, key);
        };
        table::add(&mut registry.context_permissions, key, permission);
        
        // Emit event for tracking
        event::emit(CrossContextAccessChanged {
            source_context_id,
            requesting_app_id,
            access_level,
            granted: true,
            expires_at,
            granted_by: owner,
        });
    }
    
    /// Revoke cross-context access from an app
    /// 
    /// @param registry: Mutable reference to the shared AccessRegistry
    /// @param requesting_app_id: App to revoke access from
    /// @param source_context_id: Context to revoke access to
    /// @param ctx: Transaction context
    public entry fun revoke_cross_context_access(
        registry: &mut AccessRegistry,
        requesting_app_id: String,
        source_context_id: String,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        
        // Verify sender owns the source context
        assert!(table::contains(&registry.context_owners, source_context_id), EContextNotFound);
        let context_owner = *table::borrow(&registry.context_owners, source_context_id);
        assert!(context_owner == owner, ENotOwner);
        
        // Remove permission if it exists
        let key = build_context_permission_key(&source_context_id, &requesting_app_id);
        if (table::contains(&registry.context_permissions, key)) {
            let old_permission = table::remove(&mut registry.context_permissions, key);
            
            // Emit event for tracking
            event::emit(CrossContextAccessChanged {
                source_context_id,
                requesting_app_id,
                access_level: old_permission.access_level,
                granted: false,
                expires_at: 0,
                granted_by: owner,
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
    
    /// Build a unique key for context permission storage
    /// Combines context_id with app_id to create composite key
    /// 
    /// @param context_id: The context identifier
    /// @param app_id: The application identifier
    /// @return: A unique byte vector for this context-app combination
    fun build_context_permission_key(context_id: &String, app_id: &String): vector<u8> {
        let mut key = *string::as_bytes(context_id);
        vector::push_back(&mut key, 58); // ':' separator
        vector::append(&mut key, *string::as_bytes(app_id));
        key
    }
    
    /// Extract context_id from content_id
    /// Format: "context_id:content_suffix" -> "context_id"
    /// 
    /// @param content_id: Full content identifier
    /// @return: Context portion of the identifier
    fun extract_context_id(content_id: &String): String {
        let bytes = string::as_bytes(content_id);
        let mut i = 0;
        let len = vector::length(bytes);
        
        // Find the first ':' separator
        while (i < len) {
            if (*vector::borrow(bytes, i) == 58) { // ':' character
                // Extract substring from 0 to i
                let mut context_bytes = vector::empty<u8>();
                let mut j = 0;
                while (j < i) {
                    vector::push_back(&mut context_bytes, *vector::borrow(bytes, j));
                    j = j + 1;
                };
                return string::utf8(context_bytes)
            };
            i = i + 1;
        };
        
        // If no separator found, return the whole string as context_id
        *content_id
    }
    
    /// Check if app is accessing its own context
    /// Context IDs are formatted as: hash(owner + app_id + salt)
    /// For simplicity, we check if context_id contains app_id
    /// 
    /// @param context_id: Context identifier
    /// @param app_id: Application identifier
    /// @return: True if this is the app's own context
    fun is_own_context(context_id: &String, app_id: &String): bool {
        // In practice, the context_id is derived deterministically from app_id
        // For now, we use a simple string matching approach
        // TODO: Improve this with proper context derivation validation
        string::as_bytes(context_id) == string::as_bytes(app_id) ||
        contains_substring(string::as_bytes(context_id), string::as_bytes(app_id))
    }
    
    /// Helper function to check if haystack contains needle
    fun contains_substring(haystack: &vector<u8>, needle: &vector<u8>): bool {
        let haystack_len = vector::length(haystack);
        let needle_len = vector::length(needle);
        
        if (needle_len > haystack_len) {
            return false
        };
        
        let mut i = 0;
        while (i <= haystack_len - needle_len) {
            let mut j = 0;
            let mut found = true;
            
            while (j < needle_len) {
                if (*vector::borrow(haystack, i + j) != *vector::borrow(needle, j)) {
                    found = false;
                    break
                };
                j = j + 1;
            };
            
            if (found) {
                return true
            };
            
            i = i + 1;
        };
        
        false
    }
    
    /// Convert bytes to hex string with 0x prefix
    /// Used for SEAL ID parsing
    /// 
    /// @param bytes: Raw bytes to convert
    /// @return: Hex string representation with 0x prefix
    fun bytes_to_hex_string(bytes: vector<u8>): String {
        let mut hex_string = vector::empty<u8>();
        vector::push_back(&mut hex_string, 48); // '0'
        vector::push_back(&mut hex_string, 120); // 'x'
        
        let mut i = 0;
        let len = vector::length(&bytes);
        while (i < len) {
            let byte = *vector::borrow(&bytes, i);
            let high = byte / 16;
            let low = byte % 16;
            // Convert to hex chars: 0-9 = 48-57, a-f = 97-102
            vector::push_back(&mut hex_string, if (high < 10) { 48 + high } else { 87 + high });
            vector::push_back(&mut hex_string, if (low < 10) { 48 + low } else { 87 + low });
            i = i + 1;
        };
        
        string::utf8(hex_string)
    }
}