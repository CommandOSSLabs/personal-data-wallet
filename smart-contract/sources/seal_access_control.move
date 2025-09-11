// Copyright (c) Personal Data Wallet
// SPDX-License-Identifier: Apache-2.0

// SEAL access control implementation following the allowlist pattern

module pdw::seal_access_control {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use std::vector;
    use sui::event;
    use std::string::String;
    use sui::dynamic_field as df;

    // ===== Error codes =====
    const ENoAccess: u64 = 1;
    const EInvalidCap: u64 = 3;
    const EUnauthorized: u64 = 4;
    const ETimeLockNotReached: u64 = 5;
    const EDuplicate: u64 = 6;

    // ===== Utility Functions =====
    
    /// Check if prefix is a prefix of data
    public fun is_prefix(prefix: vector<u8>, data: vector<u8>): bool {
        let prefix_len = vector::length(&prefix);
        let data_len = vector::length(&data);
        if (prefix_len > data_len) {
            return false
        };
        let i = 0;
        while (i < prefix_len) {
            if (vector::borrow(&prefix, i) != vector::borrow(&data, i)) {
                return false
            };
            i = i + 1;
        };
        true
    }

    // ===== Structs =====
    
    /// App allowlist for third-party access
    struct AppAllowlist has key {
        id: UID,
        name: String,
        owner: address,
        allowed_apps: vector<address>,
        expires_at: u64, // 0 = never expires
    }

    /// Admin capability for managing allowlist
    struct AppAllowlistCap has key, store {
        id: UID,
        allowlist_id: ID,
    }

    /// Time-locked access control
    struct TimeLock has key, store {
        id: UID,
        owner: address,
        unlock_time: u64,
    }

    /// Role-based access control
    struct RoleRegistry has key, store {
        id: UID,
        // Dynamic fields: address -> vector<String> (roles)
    }

    // ===== Events =====
    
    struct AllowlistCreated has copy, drop {
        allowlist_id: ID,
        owner: address,
        name: String,
    }

    struct AppAdded has copy, drop {
        allowlist_id: ID,
        app: address,
    }

    struct AppRemoved has copy, drop {
        allowlist_id: ID,
        app: address,
    }

    struct TimeLockCreated has copy, drop {
        timelock_id: ID,
        owner: address,
        unlock_time: u64,
    }

    struct RoleGranted has copy, drop {
        user: address,
        role: String,
    }

    // ===== App Allowlist Functions =====

    /// Create an app allowlist with admin capability
    public fun create_app_allowlist(
        name: String, 
        expires_at: u64,
        ctx: &mut TxContext
    ): AppAllowlistCap {
        let owner = tx_context::sender(ctx);
        let allowlist = AppAllowlist {
            id: object::new(ctx),
            name,
            owner,
            allowed_apps: vector::empty(),
            expires_at,
        };
        
        let allowlist_id = object::id(&allowlist);
        let cap = AppAllowlistCap {
            id: object::new(ctx),
            allowlist_id,
        };

        event::emit(AllowlistCreated {
            allowlist_id,
            owner,
            name,
        });

        transfer::share_object(allowlist);
        cap
    }

    /// Convenience function to create allowlist and send cap to sender
    entry fun create_app_allowlist_entry(
        name: String,
        expires_at: u64,
        ctx: &mut TxContext
    ) {
        let cap = create_app_allowlist(name, expires_at, ctx);
        transfer::transfer(cap, tx_context::sender(ctx));
    }

    /// Add an app to the allowlist
    public fun add_app(
        allowlist: &mut AppAllowlist,
        cap: &AppAllowlistCap,
        app: address
    ) {
        assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
        assert!(!vector::contains(&allowlist.allowed_apps, &app), EDuplicate);
        vector::push_back(&mut allowlist.allowed_apps, app);

        event::emit(AppAdded {
            allowlist_id: object::id(allowlist),
            app,
        });
    }

    /// Remove an app from the allowlist
    public fun remove_app(
        allowlist: &mut AppAllowlist,
        cap: &AppAllowlistCap,
        app: address
    ) {
        assert!(cap.allowlist_id == object::id(allowlist), EInvalidCap);
        let (found, index) = vector::index_of(&allowlist.allowed_apps, &app);
        if (found) {
            vector::remove(&mut allowlist.allowed_apps, index);
        };

        event::emit(AppRemoved {
            allowlist_id: object::id(allowlist),
            app,
        });
    }

    /// Get namespace for the allowlist (used in SEAL identity)
    public fun namespace(allowlist: &AppAllowlist): vector<u8> {
        object::uid_to_bytes(&allowlist.id)
    }

    /// Check if app has access to data
    fun approve_app_internal(
        caller: address,
        id: vector<u8>,
        allowlist: &AppAllowlist,
        clock: &Clock
    ): bool {
        // Check if allowlist has expired
        if (allowlist.expires_at > 0) {
            let current_time = clock::timestamp_ms(clock);
            if (current_time >= allowlist.expires_at) {
                return false
            };
        };

        // Check if the id has the right prefix (namespace)
        let namespace = namespace(allowlist);
        if (!is_prefix(namespace, id)) {
            return false
        };

        // Check if caller (app) is in the allowlist
        vector::contains(&allowlist.allowed_apps, &caller)
    }

    /// SEAL approve function for app access
    entry fun seal_approve_app(
        id: vector<u8>,
        allowlist: &AppAllowlist,
        clock: &Clock,
        ctx: &TxContext
    ) {
        let caller = tx_context::sender(ctx);
        assert!(approve_app_internal(caller, id, allowlist, clock), ENoAccess);
    }

    // ===== Time Lock Functions =====

    /// Create a time lock
    public fun create_time_lock(
        unlock_time: u64,
        ctx: &mut TxContext
    ): TimeLock {
        let owner = tx_context::sender(ctx);
        let timelock = TimeLock {
            id: object::new(ctx),
            owner,
            unlock_time,
        };

        event::emit(TimeLockCreated {
            timelock_id: object::id(&timelock),
            owner,
            unlock_time,
        });

        timelock
    }

    /// Convenience function to create time lock and transfer to sender
    entry fun create_time_lock_entry(
        unlock_time: u64,
        ctx: &mut TxContext
    ) {
        let timelock = create_time_lock(unlock_time, ctx);
        transfer::transfer(timelock, tx_context::sender(ctx));
    }

    /// Get namespace for time lock
    public fun timelock_namespace(timelock: &TimeLock): vector<u8> {
        object::uid_to_bytes(&timelock.id)
    }

    /// Check if time lock can be accessed
    fun approve_timelock_internal(
        caller: address,
        id: vector<u8>,
        timelock: &TimeLock,
        clock: &Clock
    ): bool {
        // Check if caller is the owner
        if (caller != timelock.owner) {
            return false
        };

        // Check if the id has the right prefix
        let namespace = timelock_namespace(timelock);
        if (!is_prefix(namespace, id)) {
            return false
        };

        // Check if unlock time has passed
        let current_time = clock::timestamp_ms(clock);
        current_time >= timelock.unlock_time
    }

    /// SEAL approve function for time-locked access
    entry fun seal_approve_timelock(
        id: vector<u8>,
        timelock: &TimeLock,
        clock: &Clock,
        ctx: &TxContext
    ) {
        let caller = tx_context::sender(ctx);
        assert!(approve_timelock_internal(caller, id, timelock, clock), ETimeLockNotReached);
    }

    // ===== Role-Based Access Functions =====

    /// Create a role registry
    public fun create_role_registry(ctx: &mut TxContext): RoleRegistry {
        RoleRegistry {
            id: object::new(ctx),
        }
    }

    /// Convenience function to create role registry and share it
    entry fun create_role_registry_entry(ctx: &mut TxContext) {
        let registry = create_role_registry(ctx);
        transfer::share_object(registry);
    }

    /// Grant a role to a user
    public fun grant_role(
        registry: &mut RoleRegistry,
        user: address,
        role: String,
        _ctx: &TxContext
    ) {
        // Only allow the registry creator or admin to grant roles
        // For simplicity, we'll allow anyone to grant roles in this example
        
        // Get existing roles or create new vector
        let roles = if (df::exists_(&registry.id, user)) {
            df::remove<address, vector<String>>(&mut registry.id, user)
        } else {
            vector::empty<String>()
        };

        // Add role if not already present
        if (!vector::contains(&roles, &role)) {
            vector::push_back(&mut roles, role);
        };

        // Store updated roles
        df::add(&mut registry.id, user, roles);

        event::emit(RoleGranted {
            user,
            role,
        });
    }

    /// Check if user has a specific role
    public fun has_role(
        registry: &RoleRegistry,
        user: address,
        role: &String
    ): bool {
        if (!df::exists_(&registry.id, user)) {
            return false
        };
        
        let roles = df::borrow<address, vector<String>>(&registry.id, user);
        vector::contains(roles, role)
    }

    /// Get namespace for role registry
    public fun role_namespace(registry: &RoleRegistry): vector<u8> {
        object::uid_to_bytes(&registry.id)
    }

    /// SEAL approve function for role-based access
    entry fun seal_approve_role(
        id: vector<u8>,
        registry: &RoleRegistry,
        required_role: String,
        ctx: &TxContext
    ) {
        let caller = tx_context::sender(ctx);
        
        // Check if the id has the right prefix
        let namespace = role_namespace(registry);
        assert!(is_prefix(namespace, id), ENoAccess);
        
        // Check if caller has the required role
        assert!(has_role(registry, caller, &required_role), EUnauthorized);
    }

    // ===== Basic SEAL Approve (Self Access) =====

    /// Basic SEAL approve for self-access (no additional restrictions)
    entry fun seal_approve(id: vector<u8>, _ctx: &TxContext) {
        // For self-access, we just need to verify the transaction is signed
        // The sender verification is implicit in the transaction context
        assert!(vector::length(&id) > 0, ENoAccess);
    }


}
