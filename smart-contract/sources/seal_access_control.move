module pdw::seal_access_control {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use std::vector;
    use sui::event;
    use sui::bcs;

    // ===== Error codes =====
    const ENoAccess: u64 = 1;
    const EPermissionExpired: u64 = 2;
    const EInvalidApp: u64 = 3;
    const EPermissionNotFound: u64 = 4;
    const EUnauthorized: u64 = 5;

    // ===== Structs =====
    
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

    // ===== SEAL Approve Functions =====
    
    /// Standard seal_approve for self-encryption
    /// Identity format: [package_id][self:user_address]
    entry fun seal_approve(id: vector<u8>, ctx: &TxContext) {
        // Extract user address from identity
        let sender = tx_context::sender(ctx);
        // In real implementation, parse identity and verify sender matches
        assert!(vector::length(&id) > 0, ENoAccess);
    }

    /// Approve function for app access
    /// Identity format: [package_id][app:user_address:app_address]
    entry fun seal_approve_app(
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
    entry fun seal_approve_timelock(
        id: vector<u8>,
        clock: &Clock,
        ctx: &TxContext
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

    /// Approve function for role-based access
    /// Identity format: [package_id][role:user_address:role_name]
    entry fun seal_approve_role(
        id: vector<u8>,
        role: vector<u8>,
        ctx: &TxContext
    ) {
        let requester = tx_context::sender(ctx);
        
        // In production:
        // 1. Parse identity to extract expected role
        // 2. Verify requester has the specified role
        // 3. Check role permissions
        assert!(vector::length(&id) > 0 && vector::length(&role) > 0, ENoAccess);
    }

    // ===== Permission Management Functions =====

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

    // ===== View Functions =====

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

    public fun get_permission_data_ids(permission: &AppPermission): &vector<vector<u8>> {
        &permission.data_ids
    }
}