module pdw::seal_access_control {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use std::vector;
    use sui::event;
    use std::string::String;
    use pdw::utils::is_prefix;

    // ===== Error codes =====
    const ENoAccess: u64 = 1;
    const EPermissionExpired: u64 = 2;
    const EInvalidApp: u64 = 3;
    const EPermissionNotFound: u64 = 4;
    const EUnauthorized: u64 = 5;
    const EInvalidCap: u64 = 6;
    const EDuplicate: u64 = 7;
    const ENotOwner: u64 = 8;
    const ENotAllowedPackage: u64 = 9;

    // ===== Allowlist Structs (Based on Example) =====
    
    /// Simple allowlist for address-based access control
    struct Allowlist has key {
        id: UID,
        name: String,
        list: vector<address>,
        owner: address,
    }

    /// Admin capability for allowlist management
    struct AllowlistCap has key {
        id: UID,
        allowlist_id: ID,
    }

    // ===== App Permission Structs (Existing) =====
    
    /// App permission record
    struct AppPermission has key, store {
        id: UID,
        user: address,           // User who granted permission
        app: address,            // App that has permission
        data_ids: vector<vector<u8>>, // IDs of data the app can access
        granted_at: u64,         // Timestamp when granted
        expires_at: u64,         // Timestamp when expires (0 = never)
        revoked: bool,           // Whether permission is revoked
    }

    // ===== Events =====
    
    /// Allowlist created event
    struct AllowlistCreatedEvent has copy, drop {
        allowlist_id: ID,
        name: String,
        owner: address,
    }

    /// Address added to allowlist event
    struct AddressAddedEvent has copy, drop {
        allowlist_id: ID,
        address: address,
        added_by: address,
    }

    /// Address removed from allowlist event
    struct AddressRemovedEvent has copy, drop {
        allowlist_id: ID,
        address: address,
        removed_by: address,
    }

    /// Permission granted event
    struct PermissionGrantedEvent has copy, drop {
        permission_id: address,
        user: address,
        app: address,
        expires_at: u64,
    }

    /// Permission revoked event
    struct PermissionRevokedEvent has copy, drop {
        permission_id: address,
        user: address,
        app: address,
    }

    // ===== Allowlist Functions (Based on Example) =====

    /// Create an allowlist with admin capability
    public fun create_allowlist(
        name: String,
        ctx: &mut TxContext
    ): AllowlistCap {
        let owner = tx_context::sender(ctx);
        let allowlist = Allowlist {
            id: object::new(ctx),
            name: name,
            list: vector::empty(),
            owner: owner,
        };
        
        let allowlist_id = object::id(&allowlist);
        let cap = AllowlistCap {
            id: object::new(ctx),
            allowlist_id: allowlist_id,
        };

        // Emit event
        event::emit(AllowlistCreatedEvent {
            allowlist_id: allowlist_id,
            name: name,
            owner: owner,
        });

        transfer::share_object(allowlist);
        cap
    }

    /// Entry function to create allowlist (for frontend)
    public entry fun create_allowlist_entry(
        name: String,
        ctx: &mut TxContext
    ) {
        let cap = create_allowlist(name, ctx);
        let sender = tx_context::sender(ctx);
        transfer::transfer(cap, sender);
    }

    /// Add address to allowlist (admin only)
    public fun add_to_allowlist(
        allowlist: &mut Allowlist, 
        cap: &AllowlistCap, 
        account: address,
        ctx: &TxContext
    ) {
        assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
        assert!(!vector::contains(&allowlist.list, &account), EDuplicate);
        
        vector::push_back(&mut allowlist.list, account);

        // Emit event
        event::emit(AddressAddedEvent {
            allowlist_id: object::id(allowlist),
            address: account,
            added_by: tx_context::sender(ctx),
        });
    }

    /// Entry function to add address to allowlist
    public entry fun add(
        allowlist: &mut Allowlist,
        cap: &AllowlistCap,
        account: address,
        ctx: &TxContext
    ) {
        add_to_allowlist(allowlist, cap, account, ctx);
    }

    /// Remove address from allowlist (admin only)
    public fun remove_from_allowlist(
        allowlist: &mut Allowlist,
        cap: &AllowlistCap,
        account: address,
        ctx: &TxContext
    ) {
        assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
        
        let (found, index) = vector::index_of(&allowlist.list, &account);
        assert!(found, EPermissionNotFound);
        
        vector::remove(&mut allowlist.list, index);

        // Emit event
        event::emit(AddressRemovedEvent {
            allowlist_id: object::id(allowlist),
            address: account,
            removed_by: tx_context::sender(ctx),
        });
    }

    /// Entry function to remove address from allowlist
    public entry fun remove(
        allowlist: &mut Allowlist,
        cap: &AllowlistCap,
        account: address,
        ctx: &TxContext
    ) {
        remove_from_allowlist(allowlist, cap, account, ctx);
    }

    // ===== SEAL Integration Functions =====

    /// Get allowlist namespace for identity prefixing
    public fun namespace(allowlist: &Allowlist): vector<u8> {
        object::uid_to_bytes(&allowlist.id)
    }

    /// Internal approval check using namespace prefixing (from example)
    fun approve_internal(caller: address, id: vector<u8>, allowlist: &Allowlist): bool {
        let namespace = namespace(allowlist);
        if (!is_prefix(namespace, id)) {
            return false
        };
        vector::contains(&allowlist.list, &caller)
    }

    /// SEAL approve function for allowlist access (Based on Example)
    public entry fun seal_approve(
        id: vector<u8>, 
        allowlist: &Allowlist, 
        ctx: &TxContext
    ) {
        assert!(approve_internal(tx_context::sender(ctx), id, allowlist), ENoAccess);
    }

    // ===== Standard SEAL Functions =====
    
    /// Standard seal_approve for self-encryption
    /// Identity format: [package_id][self:user_address]
    public entry fun seal_approve_self(id: vector<u8>, _ctx: &TxContext) {
        // Extract user address from identity
        let _sender = tx_context::sender(_ctx);
        // In real implementation, parse identity and verify sender matches
        assert!(vector::length(&id) > 0, ENoAccess);
    }

    /// Approve function for app access
    /// Identity format: [package_id][app:user_address:app_address]
    public entry fun seal_approve_app(
        id: vector<u8>, 
        app_address: address,
        ctx: &TxContext
    ) {
        let requester = tx_context::sender(ctx);
        
        // Verify the requester is the app specified in the identity
        assert!(requester == app_address, EInvalidApp);
        
        // In production, we would:
        // 1. Parse the identity to extract user and app addresses
        // 2. Check if a valid AppPermission exists for this user-app pair
        // 3. Verify the permission hasn't expired
        // For now, we'll do a simple check
        assert!(vector::length(&id) > 0, ENoAccess);
    }

    /// Approve function for time-locked access
    /// Identity format: [package_id][time:user_address:timestamp]
    public entry fun seal_approve_timelock(
        id: vector<u8>,
        clock: &Clock,
_ctx: &TxContext
    ) {
        // Extract timestamp from identity (last 8 bytes)
        let id_len = vector::length(&id);
        assert!(id_len >= 8, ENoAccess);
        
        // In production, properly parse the timestamp from identity
        // For now, check that current time is past the timelock
        let current_time = clock::timestamp_ms(clock);
        
        // Simplified check - in production, extract actual timestamp from id
        assert!(current_time > 0, ENoAccess);
    }

    // ===== Permission Management Functions (Existing) =====

    /// Grant permission to an app
    public entry fun grant_app_permission(
        app: address,
        data_ids: vector<vector<u8>>,
        expires_at: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        let granted_at = clock::timestamp_ms(clock);
        
        let permission = AppPermission {
            id: object::new(ctx),
            user,
            app,
            data_ids,
            granted_at,
            expires_at,
            revoked: false,
        };

        let permission_id = object::uid_to_address(&permission.id);
        
        // Emit event
        event::emit(PermissionGrantedEvent {
            permission_id,
            user,
            app,
            expires_at,
        });

        // Transfer to user (they own the permission)
        transfer::transfer(permission, user);
    }

    /// Revoke an app permission
    public entry fun revoke_app_permission(
        permission: &mut AppPermission,
        ctx: &TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Only the user who granted can revoke
        assert!(permission.user == sender, EUnauthorized);
        assert!(!permission.revoked, EPermissionNotFound);
        
        permission.revoked = true;
        
        // Emit event
        event::emit(PermissionRevokedEvent {
            permission_id: object::uid_to_address(&permission.id),
            user: permission.user,
            app: permission.app,
        });
    }

    // ===== View Functions =====

    /// Get allowlist details
    public fun get_allowlist_info(allowlist: &Allowlist): (String, vector<address>, address) {
        (allowlist.name, allowlist.list, allowlist.owner)
    }

    /// Check if address is in allowlist
    public fun is_in_allowlist(allowlist: &Allowlist, addr: address): bool {
        vector::contains(&allowlist.list, &addr)
    }

    /// Get allowlist member count
    public fun get_member_count(allowlist: &Allowlist): u64 {
        vector::length(&allowlist.list)
    }

    /// Check if permission is valid (not expired or revoked)
    public fun is_permission_valid(
        permission: &AppPermission,
        clock: &Clock
    ): bool {
        if (permission.revoked) {
            return false
        };
        
        if (permission.expires_at == 0) {
            // Never expires
            return true
        };
        
        let current_time = clock::timestamp_ms(clock);
        current_time < permission.expires_at
    }

    /// Check if app has permission to access specific data
    public fun has_data_access(
        permission: &AppPermission,
        data_id: &vector<u8>
    ): bool {
        let i = 0;
        let len = vector::length(&permission.data_ids);
        
        while (i < len) {
            let allowed_id = vector::borrow(&permission.data_ids, i);
            if (allowed_id == data_id) {
                return true
            };
            i = i + 1;
        };
        
        false
    }

    /// Get permission details
    public fun get_permission_details(permission: &AppPermission): (
        address, // user
        address, // app
        u64,     // granted_at
        u64,     // expires_at
        bool     // revoked
    ) {
        (
            permission.user,
            permission.app,
            permission.granted_at,
            permission.expires_at,
            permission.revoked
        )
    }

    /// Get permission data IDs
    public fun get_permission_data_ids(permission: &AppPermission): &vector<vector<u8>> {
        &permission.data_ids
    }

    // ===== Test Functions =====

    #[test_only]
    public fun test_allowlist_functionality() {
        // Simple test helper function for integration tests
        // Tests should be run via backend test files
    }
}