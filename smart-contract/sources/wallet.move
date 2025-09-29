/// Wallet management module for Personal Data Wallet
/// 
/// This module provides core wallet identity management including:
/// - Main wallet creation and management
/// - App-specific context wallet creation
/// - Context ID derivation for app isolation
module pdw::wallet {
    use sui::event;
    use std::string::{Self, String};
    use sui::hash;
    use sui::bcs;

    /// Error constants
    const EInvalidAppId: u64 = 1;
    const EWalletAlreadyExists: u64 = 2;

    /// Main wallet identity for users
    /// Each user should have exactly one MainWallet
    public struct MainWallet has key, store {
        id: UID,
        owner: address,
        created_at: u64,
        context_salt: vector<u8>,
        version: u64,
    }

    /// App-specific context wallet
    /// Users can have multiple ContextWallets for different apps
    public struct ContextWallet has key, store {
        id: UID,
        app_id: String,
        owner: address,
        main_wallet_id: address,
        policy_ref: Option<String>,
        created_at: u64,
        permissions: vector<String>,
    }

    /// Registry to track main wallets by owner
    public struct WalletRegistry has key {
        id: UID,
        wallets: vector<address>, // MainWallet object IDs
    }

    /// Events
    public struct MainWalletCreated has copy, drop {
        wallet_id: address,
        owner: address,
        created_at: u64,
    }

    public struct ContextWalletCreated has copy, drop {
        wallet_id: address,
        app_id: String,
        owner: address,
        main_wallet_id: address,
        created_at: u64,
    }

    /// Initialize the wallet registry (called once during package deployment)
    fun init(ctx: &mut TxContext) {
        let registry = WalletRegistry {
            id: object::new(ctx),
            wallets: vector::empty(),
        };
        transfer::share_object(registry);
    }

    /// Create a new main wallet for a user
    /// Each user should call this once to establish their identity
    public fun create_main_wallet(ctx: &mut TxContext): MainWallet {
        let owner = tx_context::sender(ctx);
        let wallet_id = object::new(ctx);
        let wallet_address = object::uid_to_address(&wallet_id);
        
        // Generate a random salt for context derivation
        let context_salt = generate_context_salt(owner, tx_context::epoch(ctx));
        
        let wallet = MainWallet {
            id: wallet_id,
            owner,
            created_at: tx_context::epoch(ctx),
            context_salt,
            version: 1,
        };

        // Emit event
        event::emit(MainWalletCreated {
            wallet_id: wallet_address,
            owner,
            created_at: tx_context::epoch(ctx),
        });

        wallet
    }

    /// Create a context wallet for a specific app
    /// Links to the user's main wallet for identity verification
    public fun create_context_wallet(
        main_wallet: &MainWallet,
        app_id: String,
        ctx: &mut TxContext
    ): ContextWallet {
        // Validate app_id is not empty
        assert!(!string::is_empty(&app_id), EInvalidAppId);
        
        let owner = tx_context::sender(ctx);
        let wallet_id = object::new(ctx);
        let wallet_address = object::uid_to_address(&wallet_id);
        
        // Verify the caller owns the main wallet
        assert!(main_wallet.owner == owner, EWalletAlreadyExists);
        
        let context_wallet = ContextWallet {
            id: wallet_id,
            app_id: app_id,
            owner,
            main_wallet_id: object::uid_to_address(&main_wallet.id),
            policy_ref: std::option::none(),
            created_at: tx_context::epoch(ctx),
            permissions: vector::empty(),
        };

        // Emit event
        event::emit(ContextWalletCreated {
            wallet_id: wallet_address,
            app_id: context_wallet.app_id,
            owner,
            main_wallet_id: context_wallet.main_wallet_id,
            created_at: tx_context::epoch(ctx),
        });

        context_wallet
    }

    /// Derive a deterministic context ID for app isolation
    /// Uses: hash(owner_address || app_id || context_salt)
    public fun derive_context_id(
        main_wallet: &MainWallet,
        app_id: String
    ): address {
        let mut data = bcs::to_bytes(&main_wallet.owner);
        vector::append(&mut data, bcs::to_bytes(&app_id));
        vector::append(&mut data, main_wallet.context_salt);
        
        let hash_bytes = hash::keccak256(&data);
        sui::address::from_bytes(hash_bytes)
    }

    /// Update policy reference for a context wallet
    public fun set_policy_ref(
        context_wallet: &mut ContextWallet,
        policy_ref: String,
        ctx: &TxContext
    ) {
        // Verify caller owns the wallet
        assert!(context_wallet.owner == tx_context::sender(ctx), EWalletAlreadyExists);
        context_wallet.policy_ref = std::option::some(policy_ref);
    }

    /// Add permission to context wallet
    public fun add_permission(
        context_wallet: &mut ContextWallet,
        permission: String,
        ctx: &TxContext
    ) {
        // Verify caller owns the wallet
        assert!(context_wallet.owner == tx_context::sender(ctx), EWalletAlreadyExists);
        vector::push_back(&mut context_wallet.permissions, permission);
    }

    /// Generate context salt for deterministic context ID derivation
    fun generate_context_salt(owner: address, epoch: u64): vector<u8> {
        let mut data = bcs::to_bytes(&owner);
        vector::append(&mut data, bcs::to_bytes(&epoch));
        vector::append(&mut data, b"pdw_context_salt");
        hash::keccak256(&data)
    }

    // === View Functions ===

    /// Get main wallet details
    public fun get_main_wallet_info(wallet: &MainWallet): (address, address, u64, u64) {
        (
            object::uid_to_address(&wallet.id),
            wallet.owner,
            wallet.created_at,
            wallet.version
        )
    }

    /// Get context wallet details
    public fun get_context_wallet_info(wallet: &ContextWallet): (address, String, address, address, u64) {
        (
            object::uid_to_address(&wallet.id),
            wallet.app_id,
            wallet.owner,
            wallet.main_wallet_id,
            wallet.created_at
        )
    }

    /// Check if context wallet has specific permission
    public fun has_permission(wallet: &ContextWallet, permission: String): bool {
        vector::contains(&wallet.permissions, &permission)
    }

    /// Get all permissions for context wallet
    public fun get_permissions(wallet: &ContextWallet): vector<String> {
        wallet.permissions
    }

    /// Get policy reference
    public fun get_policy_ref(wallet: &ContextWallet): Option<String> {
        wallet.policy_ref
    }

    /// Get context salt from main wallet
    public fun get_context_salt(wallet: &MainWallet): vector<u8> {
        wallet.context_salt
    }

    // === Test Functions (only available in test builds) ===
    #[test_only]
    public fun test_create_main_wallet_for_testing(ctx: &mut TxContext): MainWallet {
        create_main_wallet(ctx)
    }

    #[test_only]
    public fun test_create_context_wallet_for_testing(
        main_wallet: &MainWallet,
        app_id: String,
        ctx: &mut TxContext
    ): ContextWallet {
        create_context_wallet(main_wallet, app_id, ctx)
    }
}