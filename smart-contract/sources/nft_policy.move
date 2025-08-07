// SPDX-License-Identifier: Apache-2.0
module pdw::nft_policy {
    use sui::vec_set::{Self, VecSet};
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};

    // === Utility Function ===

    public fun is_prefix(prefix: vector<u8>, data: vector<u8>): bool {
        let prefix_len = vector::length(&prefix);
        let data_len = vector::length(&data);
        if (prefix_len > data_len) {
            return false
        };
        let mut i = 0;
        while (i < prefix_len) {
            if (vector::borrow(&prefix, i) != vector::borrow(&data, i)) {
                return false
            };
            i = i + 1;
        };
        true
    }

    const ENoAccess: u64 = 1;
    const EInvalidCap: u64 = 2;

    public struct NftPolicy has key, store {
        id: UID,
        required_nft_types: VecSet<String>,
        description: String,
    }

    public struct NftPolicyCap has key, store {
        id: UID,
        policy_id: ID,
    }

    // The user must pass in the NFT type as a string.
    fun approve_internal(nft_type: String, id: vector<u8>, policy: &NftPolicy): bool {
        let policy_id = object::id(policy);
        let namespace = object::id_to_bytes(&policy_id);
        if (!is_prefix(namespace, id)) {
            return false
        };
        vec_set::contains(&policy.required_nft_types, &nft_type)
    }

    public entry fun seal_approve(nft_type: String, id: vector<u8>, policy: &NftPolicy) {
        assert!(approve_internal(nft_type, id, policy), ENoAccess);
    }

    public entry fun create_nft_policy(
        initial_nft_type: String,
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        let policy = NftPolicy {
            id: object::new(ctx),
            required_nft_types: vec_set::singleton(initial_nft_type),
            description: string::utf8(description),
        };
        let cap = NftPolicyCap {
            id: object::new(ctx),
            policy_id: object::id(&policy),
        };
        transfer::public_share_object(policy);
        transfer::public_transfer(cap, tx_context::sender(ctx));
    }

    public entry fun add_nft_type(
        cap: &NftPolicyCap,
        policy: &mut NftPolicy,
        new_nft_type: String
    ) {
        assert!(cap.policy_id == object::id(policy), EInvalidCap);
        vec_set::insert(&mut policy.required_nft_types, new_nft_type);
    }

    public entry fun remove_nft_type(
        cap: &NftPolicyCap,
        policy: &mut NftPolicy,
        nft_type_to_remove: String
    ) {
        assert!(cap.policy_id == object::id(policy), EInvalidCap);
        vec_set::remove(&mut policy.required_nft_types, &nft_type_to_remove);
    }
}