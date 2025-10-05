module pdw::seal_access_control {
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::address;
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
    const EWalletNotRegistered: u64 = 9;
    const EAllowlistNotFound: u64 = 10;
    const EInvalidScope: u64 = 11;
    const EContextWalletExists: u64 = 12;
    
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

    /// Event emitted when a hierarchical context wallet is registered
    public struct ContextWalletRegistered has copy, drop {
        main_wallet: address,
        context_wallet: address,
        derivation_index: u64,
        scope_hint: option::Option<String>,
        timestamp: u64,
    }

    /// Event emitted when wallet allowlist grants or revocations occur
    public struct WalletAllowlistChanged has copy, drop {
        requester_wallet: address,
        target_wallet: address,
        scope: String,
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
        /// Maps context wallet address -> metadata
        context_wallets: Table<address, ContextWalletInfo>,
        /// Maps content_id -> context wallet address (wallet-based contexts)
        content_contexts: Table<String, address>,
        /// Maps (requester_wallet, target_wallet, scope) -> WalletAllowlistEntry
        wallet_allowlist: Table<vector<u8>, WalletAllowlistEntry>,
    }

    /// Individual access permission
    public struct AccessPermission has store, drop, copy {
        access_level: String, // "read" or "write"
        granted_at: u64,
        expires_at: u64,
        granted_by: address,
    }

    /// Information about a derived context wallet owned by a main wallet
    public struct ContextWalletInfo has store, drop, copy {
        main_wallet: address,
        derivation_index: u64,
        registered_at: u64,
        app_hint: option::Option<String>,
    }

    /// Allowlist entry granting wallet-based access to a context wallet
    public struct WalletAllowlistEntry has store, drop, copy {
        scope: String,
        access_level: String,
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
            context_wallets: table::new(ctx),
            content_contexts: table::new(ctx),
            wallet_allowlist: table::new(ctx),
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
        requesting_wallet: address,
        registry: &AccessRegistry,
        clock: &Clock,
        ctx: &TxContext
    ) {
        let owner = tx_context::sender(ctx);

        // Parse the key ID to extract content identifier
        assert!(id.length() == 32, EInvalidTimestamp);

        let content_id = bytes_to_hex_string(id);

        let mut processed = false;
        let content_id_lookup = clone_string(&content_id);
        if (table::contains(&registry.content_contexts, content_id_lookup)) {
            let content_id_for_borrow = clone_string(&content_id);
            let context_wallet = *table::borrow(&registry.content_contexts, content_id_for_borrow);

            assert!(table::contains(&registry.context_wallets, context_wallet), EWalletNotRegistered);
            let info = table::borrow(&registry.context_wallets, context_wallet);
            assert!(info.main_wallet == owner, ENotOwner);

            if (context_wallet == requesting_wallet) {
                return
            };

            let read_scope = default_read_scope();
            if (has_active_wallet_allowlist(registry, requesting_wallet, context_wallet, &read_scope, clock)) {
                return
            };
            let write_scope = default_write_scope();
            if (has_active_wallet_allowlist(registry, requesting_wallet, context_wallet, &write_scope, clock)) {
                return
            };

            if (option::is_some(&info.app_hint)) {
                let context_id = extract_context_id(&content_id);
                let app_hint_ref = option::borrow(&info.app_hint);
                if (has_legacy_context_permission(registry, &context_id, app_hint_ref, clock)) {
                    return
                }
            };

            processed = true;
        };

        if (!processed) {
            let context_id = extract_context_id(&content_id);
            let context_id_lookup = clone_string(&context_id);
            assert!(table::contains(&registry.context_owners, context_id_lookup), EContextNotFound);
            let context_id_for_borrow = clone_string(&context_id);
            let context_owner = *table::borrow(&registry.context_owners, context_id_for_borrow);
            assert!(context_owner == owner, ENotOwner);

            if (requesting_wallet == owner) {
                return
            };

            let legacy_app = wallet_to_string(requesting_wallet);
            if (has_legacy_context_permission(registry, &context_id, &legacy_app, clock)) {
                return
            };
        };

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

    /// Register encrypted content against a context wallet address
    public entry fun register_content_v2(
        registry: &mut AccessRegistry,
        content_id: String,
        context_wallet: address,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        assert!(table::contains(&registry.context_wallets, context_wallet), EWalletNotRegistered);
        let context_info = table::borrow(&registry.context_wallets, context_wallet);
        assert!(context_info.main_wallet == owner, ENotOwner);

    let content_owner_lookup = clone_string(&content_id);
        assert!(!table::contains(&registry.owners, content_owner_lookup), EContentNotFound);

    let content_owner_key = clone_string(&content_id);
        table::add(&mut registry.owners, content_owner_key, owner);

    let content_map_key = clone_string(&content_id);
        assert!(!table::contains(&registry.content_contexts, content_map_key), EContentNotFound);

    let content_map_add_key = clone_string(&content_id);
        table::add(&mut registry.content_contexts, content_map_add_key, context_wallet);

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

    /// Register a hierarchical context wallet that is derived from the main wallet
    public entry fun register_context_wallet(
        registry: &mut AccessRegistry,
        context_wallet: address,
        derivation_index: u64,
        app_hint: String,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let main_wallet = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        assert!(!table::contains(&registry.context_wallets, context_wallet), EContextWalletExists);

        let hint_option = if (string::is_empty(&app_hint)) {
            option::none<String>()
        } else {
            option::some<String>(clone_string(&app_hint))
        };

        let info = ContextWalletInfo {
            main_wallet,
            derivation_index,
            registered_at: timestamp,
            app_hint: hint_option,
        };

        let scope_hint = clone_option_string(&info.app_hint);

        table::add(&mut registry.context_wallets, context_wallet, info);

        event::emit(ContextWalletRegistered {
            main_wallet,
            context_wallet,
            derivation_index,
            scope_hint,
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

    /// Grant wallet-based allowlist access between two context wallets
    public entry fun grant_wallet_allowlist_access(
        registry: &mut AccessRegistry,
        requester_wallet: address,
        target_wallet: address,
        scope: String,
        access_level: String,
        expires_at: u64,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        assert!(table::contains(&registry.context_wallets, target_wallet), EWalletNotRegistered);
        let context_info = table::borrow(&registry.context_wallets, target_wallet);
        assert!(context_info.main_wallet == owner, ENotOwner);

        assert!(!string::is_empty(&scope), EInvalidScope);

        let access_bytes = *string::as_bytes(&access_level);
        assert!(
            access_bytes == ACCESS_LEVEL_READ ||
            access_bytes == ACCESS_LEVEL_WRITE,
            EInvalidAccessLevel
        );

        assert!(expires_at > current_time, EInvalidTimestamp);

            let scope_for_key = clone_string(&scope);
            let scope_for_event = clone_string(&scope);
            let access_for_event = clone_string(&access_level);

        let entry = WalletAllowlistEntry {
            scope,
            access_level,
            granted_at: current_time,
            expires_at,
            granted_by: owner,
        };

        let remove_key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope_for_key);
        if (table::contains(&registry.wallet_allowlist, remove_key)) {
            let _old_entry = table::remove(&mut registry.wallet_allowlist, remove_key);
        };

        let add_key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope_for_key);
        table::add(&mut registry.wallet_allowlist, add_key, entry);

        event::emit(WalletAllowlistChanged {
            requester_wallet,
            target_wallet,
            scope: scope_for_event,
            access_level: access_for_event,
            granted: true,
            expires_at,
            granted_by: owner,
        });
    }

    /// Revoke wallet-based allowlist access
    public entry fun revoke_wallet_allowlist_access(
        registry: &mut AccessRegistry,
        requester_wallet: address,
        target_wallet: address,
        scope: String,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);

        assert!(table::contains(&registry.context_wallets, target_wallet), EWalletNotRegistered);
        let context_info = table::borrow(&registry.context_wallets, target_wallet);
        assert!(context_info.main_wallet == owner, ENotOwner);

        let key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope);
        if (table::contains(&registry.wallet_allowlist, key)) {
            let remove_key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope);
            let entry = table::remove(&mut registry.wallet_allowlist, remove_key);

            event::emit(WalletAllowlistChanged {
                requester_wallet,
                target_wallet,
                scope,
                access_level: entry.access_level,
                granted: false,
                expires_at: 0,
                granted_by: owner,
            });
        } else {
            abort EAllowlistNotFound
        }
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

    fun default_read_scope(): String {
        string::utf8(b"read")
    }

    fun default_write_scope(): String {
        string::utf8(b"write")
    }

    fun clone_string(value: &String): String {
        let bytes = string::as_bytes(value);
        let mut buffer = vector::empty<u8>();
        let mut i = 0;
        let len = vector::length(bytes);
        while (i < len) {
            vector::push_back(&mut buffer, *vector::borrow(bytes, i));
            i = i + 1;
        };
        string::utf8(buffer)
    }

    fun wallet_to_string(wallet: address): String {
        let bytes = address::to_bytes(wallet);
        bytes_to_hex_string(bytes)
    }

    fun has_active_wallet_allowlist(
        registry: &AccessRegistry,
        requesting_wallet: address,
        target_wallet: address,
        scope: &String,
        clock: &clock::Clock
    ): bool {
        let key = build_wallet_allowlist_key(requesting_wallet, target_wallet, scope);
        if (table::contains(&registry.wallet_allowlist, key)) {
            let borrow_key = build_wallet_allowlist_key(requesting_wallet, target_wallet, scope);
            let entry = table::borrow(&registry.wallet_allowlist, borrow_key);
            let current_time = clock::timestamp_ms(clock);
            if (entry.expires_at > current_time) {
                return true
            }
        };
        false
    }

    fun has_legacy_context_permission(
        registry: &AccessRegistry,
        context_id: &String,
        app_id: &String,
        clock: &clock::Clock
    ): bool {
        let key = build_context_permission_key(context_id, app_id);
        if (table::contains(&registry.context_permissions, key)) {
            let borrow_key = build_context_permission_key(context_id, app_id);
            let permission = table::borrow(&registry.context_permissions, borrow_key);
            let current_time = clock::timestamp_ms(clock);
            if (permission.expires_at > current_time) {
                return true
            }
        };
        false
    }

    fun clone_option_string(opt: &option::Option<String>): option::Option<String> {
        if (option::is_some(opt)) {
            let value_ref = option::borrow(opt);
            option::some<String>(clone_string(value_ref))
        } else {
            option::none<String>()
        }
    }
    
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

    fun build_wallet_allowlist_key(requesting_wallet: address, target_wallet: address, scope: &String): vector<u8> {
        let mut key = address::to_bytes(requesting_wallet);
        let target_bytes = address::to_bytes(target_wallet);
        vector::append(&mut key, target_bytes);
        vector::push_back(&mut key, 58);
        let scope_bytes = string::as_bytes(scope);
        let mut i = 0;
        let scope_len = vector::length(scope_bytes);
        while (i < scope_len) {
            vector::push_back(&mut key, *vector::borrow(scope_bytes, i));
            i = i + 1;
        };
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