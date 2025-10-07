module pdw::seal_access_control {
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::address;
    use std::string::{Self, String};

    // ========== Constants ==========
    const ENotOwner: u64 = 0;
    const ENoAccess: u64 = 1;
    const EInvalidAccessLevel: u64 = 3;
    const EInvalidTimestamp: u64 = 5;
    const EWalletNotRegistered: u64 = 9;
    const EAllowlistNotFound: u64 = 10;
    const EInvalidScope: u64 = 11;
    const EContextWalletExists: u64 = 12;
    const EContentAlreadyRegistered: u64 = 13;

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
        context_wallet: address,
        owner: address,
        timestamp: u64,
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
        /// Maps context wallet address -> metadata
        context_wallets: Table<address, ContextWalletInfo>,
        /// Maps content_id -> context wallet address (wallet-based contexts)
        content_contexts: Table<String, address>,
        /// Maps (requester_wallet, target_wallet, scope) -> WalletAllowlistEntry
        wallet_allowlist: Table<vector<u8>, WalletAllowlistEntry>,
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

    /// SEAL-compliant access approval function with wallet-based access control
    /// Must be entry function that aborts on access denial (per SEAL requirements)
    ///
    /// Flow:
    /// 1. Self-access: Owner can always decrypt their own content
    /// 2. Content must be registered to a context wallet
    /// 3. Context wallet owner verification
    /// 4. Same context: If requesting wallet = context wallet, grant access
    /// 5. Wallet allowlist: Check if requester has allowlist permission for read/write scope
    ///
    /// @param id: Content identifier (SEAL key ID)
    /// @param requesting_wallet: Wallet requesting access
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

        // ✅ SELF-ACCESS: Owner can always decrypt their own content
        if (requesting_wallet == owner) {
            return
        };

        // Parse the key ID to extract content identifier
        assert!(id.length() == 32, EInvalidTimestamp);
        let content_id = bytes_to_hex_string(id);

        // Content MUST be registered to a context wallet
        let content_id_lookup = clone_string(&content_id);
        assert!(table::contains(&registry.content_contexts, content_id_lookup), EWalletNotRegistered);

        let content_id_for_borrow = clone_string(&content_id);
        let context_wallet = *table::borrow(&registry.content_contexts, content_id_for_borrow);

        // Verify context wallet is registered and owned by the transaction sender
        assert!(table::contains(&registry.context_wallets, context_wallet), EWalletNotRegistered);
        let info = table::borrow(&registry.context_wallets, context_wallet);
        assert!(info.main_wallet == owner, ENotOwner);

        // ✅ SAME CONTEXT: Context wallet can access its own content
        if (context_wallet == requesting_wallet) {
            return
        };

        // ✅ WALLET ALLOWLIST: Check read scope
        let read_scope = default_read_scope();
        if (has_active_wallet_allowlist(registry, requesting_wallet, context_wallet, &read_scope, clock)) {
            return
        };

        // ✅ WALLET ALLOWLIST: Check write scope
        let write_scope = default_write_scope();
        if (has_active_wallet_allowlist(registry, requesting_wallet, context_wallet, &write_scope, clock)) {
            return
        };

        // ❌ No access granted
        abort ENoAccess
    }

    // ========== Content Registration ==========

    /// Register encrypted content against a context wallet address
    /// This is the ONLY way to register content in the wallet-based system
    ///
    /// @param registry: Mutable reference to the shared AccessRegistry
    /// @param content_id: Unique identifier for the content being registered
    /// @param context_wallet: The context wallet that owns this content
    /// @param clock: Reference to the global clock for timestamp
    /// @param ctx: Transaction context
    public entry fun register_content(
        registry: &mut AccessRegistry,
        content_id: String,
        context_wallet: address,
        clock: &Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let timestamp = clock::timestamp_ms(clock);

        // Verify context wallet exists and is owned by sender
        assert!(table::contains(&registry.context_wallets, context_wallet), EWalletNotRegistered);
        let context_info = table::borrow(&registry.context_wallets, context_wallet);
        assert!(context_info.main_wallet == owner, ENotOwner);

        // Ensure content hasn't been registered before
        let content_check_key = clone_string(&content_id);
        assert!(!table::contains(&registry.content_contexts, content_check_key), EContentAlreadyRegistered);

        // Register content to context wallet
        let content_map_add_key = clone_string(&content_id);
        table::add(&mut registry.content_contexts, content_map_add_key, context_wallet);

        event::emit(ContentRegistered {
            content_id,
            context_wallet,
            owner,
            timestamp,
        });
    }

    /// Register a hierarchical context wallet that is derived from the main wallet
    ///
    /// @param registry: Mutable reference to the shared AccessRegistry
    /// @param context_wallet: Address of the derived context wallet
    /// @param derivation_index: Derivation path index used to generate this wallet
    /// @param app_hint: Optional hint about which app this context belongs to
    /// @param clock: Reference to the global clock for timestamp
    /// @param ctx: Transaction context
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

        // Ensure context wallet hasn't been registered before
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

    /// Grant wallet-based allowlist access between two context wallets
    ///
    /// @param registry: Mutable reference to the shared AccessRegistry
    /// @param requester_wallet: Wallet that will be granted access
    /// @param target_wallet: Wallet whose content will be accessible
    /// @param scope: Access scope ("read" or "write")
    /// @param access_level: Access level ("read" or "write")
    /// @param expires_at: Expiration timestamp in milliseconds
    /// @param clock: Reference to the global clock
    /// @param ctx: Transaction context
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

        // Verify target wallet exists and is owned by sender
        assert!(table::contains(&registry.context_wallets, target_wallet), EWalletNotRegistered);
        let context_info = table::borrow(&registry.context_wallets, target_wallet);
        assert!(context_info.main_wallet == owner, ENotOwner);

        // Validate scope
        assert!(!string::is_empty(&scope), EInvalidScope);

        // Validate access level
        let access_bytes = *string::as_bytes(&access_level);
        assert!(
            access_bytes == ACCESS_LEVEL_READ ||
            access_bytes == ACCESS_LEVEL_WRITE,
            EInvalidAccessLevel
        );

        // Validate expiration
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

        // Remove old entry if exists
        let remove_key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope_for_key);
        if (table::contains(&registry.wallet_allowlist, remove_key)) {
            let _old_entry = table::remove(&mut registry.wallet_allowlist, remove_key);
        };

        // Add new entry
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
    ///
    /// @param registry: Mutable reference to the shared AccessRegistry
    /// @param requester_wallet: Wallet to revoke access from
    /// @param target_wallet: Wallet whose content access is being revoked
    /// @param scope: Access scope being revoked
    /// @param ctx: Transaction context
    public entry fun revoke_wallet_allowlist_access(
        registry: &mut AccessRegistry,
        requester_wallet: address,
        target_wallet: address,
        scope: String,
        ctx: &mut tx_context::TxContext
    ) {
        let owner = tx_context::sender(ctx);

        // Verify target wallet exists and is owned by sender
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

    /// Check if a context wallet exists and get its info
    ///
    /// @param registry: Reference to the AccessRegistry
    /// @param context_wallet: The context wallet address to check
    /// @return (exists, main_wallet, derivation_index, registered_at)
    public fun get_context_wallet_info(
        registry: &AccessRegistry,
        context_wallet: address
    ): (bool, address, u64, u64) {
        if (table::contains(&registry.context_wallets, context_wallet)) {
            let info = table::borrow(&registry.context_wallets, context_wallet);
            (true, info.main_wallet, info.derivation_index, info.registered_at)
        } else {
            (false, @0x0, 0, 0)
        }
    }

    /// Check if content is registered and get its context wallet
    ///
    /// @param registry: Reference to the AccessRegistry
    /// @param content_id: The content identifier
    /// @return (exists, context_wallet)
    public fun get_content_context(
        registry: &AccessRegistry,
        content_id: String
    ): (bool, address) {
        if (table::contains(&registry.content_contexts, content_id)) {
            let context_wallet = *table::borrow(&registry.content_contexts, content_id);
            (true, context_wallet)
        } else {
            (false, @0x0)
        }
    }

    /// Check if wallet allowlist entry exists and is active
    ///
    /// @param registry: Reference to the AccessRegistry
    /// @param requester_wallet: Requesting wallet address
    /// @param target_wallet: Target wallet address
    /// @param scope: Access scope
    /// @param clock: Reference to the Clock
    /// @return (exists, is_active, access_level, expires_at)
    public fun check_wallet_allowlist(
        registry: &AccessRegistry,
        requester_wallet: address,
        target_wallet: address,
        scope: String,
        clock: &Clock
    ): (bool, bool, String, u64) {
        let key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope);
        if (table::contains(&registry.wallet_allowlist, key)) {
            let borrow_key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope);
            let entry = table::borrow(&registry.wallet_allowlist, borrow_key);
            let current_time = clock::timestamp_ms(clock);
            let is_active = entry.expires_at > current_time;
            (true, is_active, entry.access_level, entry.expires_at)
        } else {
            (false, false, string::utf8(b""), 0)
        }
    }

    // ========== Audit Logging ==========

    /// Log access attempt (can be called by Seal integration)
    ///
    /// @param content_id: The content being accessed
    /// @param access_type: Type of access attempted
    /// @param success: Whether the access was successful
    /// @param clock: Reference to the Clock
    /// @param ctx: Transaction context
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

    /// Clean up expired wallet allowlist entry
    /// This is a maintenance function that can be called by anyone
    ///
    /// @param registry: Mutable reference to the AccessRegistry
    /// @param requester_wallet: Requesting wallet address
    /// @param target_wallet: Target wallet address
    /// @param scope: Access scope
    /// @param clock: Reference to the Clock
    /// @param ctx: Transaction context
    public entry fun cleanup_expired_allowlist(
        registry: &mut AccessRegistry,
        requester_wallet: address,
        target_wallet: address,
        scope: String,
        clock: &clock::Clock,
        ctx: &mut tx_context::TxContext
    ) {
        let key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope);
        if (table::contains(&registry.wallet_allowlist, key)) {
            let borrow_key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope);
            let entry = table::borrow(&registry.wallet_allowlist, borrow_key);
            let current_time = clock::timestamp_ms(clock);

            if (entry.expires_at <= current_time) {
                let remove_key = build_wallet_allowlist_key(requester_wallet, target_wallet, &scope);
                let old_entry = table::remove(&mut registry.wallet_allowlist, remove_key);

                event::emit(WalletAllowlistChanged {
                    requester_wallet,
                    target_wallet,
                    scope,
                    access_level: old_entry.access_level,
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

    fun clone_option_string(opt: &option::Option<String>): option::Option<String> {
        if (option::is_some(opt)) {
            let value_ref = option::borrow(opt);
            option::some<String>(clone_string(value_ref))
        } else {
            option::none<String>()
        }
    }

    fun build_wallet_allowlist_key(requesting_wallet: address, target_wallet: address, scope: &String): vector<u8> {
        let mut key = address::to_bytes(requesting_wallet);
        let target_bytes = address::to_bytes(target_wallet);
        vector::append(&mut key, target_bytes);
        vector::push_back(&mut key, 58); // ':' separator
        let scope_bytes = string::as_bytes(scope);
        let mut i = 0;
        let scope_len = vector::length(scope_bytes);
        while (i < scope_len) {
            vector::push_back(&mut key, *vector::borrow(scope_bytes, i));
            i = i + 1;
        };
        key
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
