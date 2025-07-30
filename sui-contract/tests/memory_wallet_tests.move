#[test_only]
module personal_data_wallet::memory_wallet_tests {
    use personal_data_wallet::memory_wallet;
    use sui::test_scenario::{Self, Scenario};
    use sui::object;
    use std::string;

    #[test]
    fun test_create_memory_object() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        
        // Initialize the module
        {
            let ctx = test_scenario::ctx(&mut scenario);
            memory_wallet::init_for_testing(ctx);
        };

        // Create memory object
        test_scenario::next_tx(&mut scenario, user);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            memory_wallet::create_memory_object(ctx);
        };

        // Verify memory object was created
        test_scenario::next_tx(&mut scenario, user);
        {
            let memory_object = test_scenario::take_from_sender<memory_wallet::MemoryObject>(&scenario);
            
            // Check ownership
            assert!(memory_wallet::is_owner(&memory_object, user), 0);
            
            // Check initial state
            assert!(string::is_empty(&memory_wallet::get_vector_cert(&memory_object)), 1);
            assert!(string::is_empty(&memory_wallet::get_graph_cert(&memory_object)), 2);
            
            test_scenario::return_to_sender(&scenario, memory_object);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_ingest_memory() {
        let user = @0xA;
        let mut scenario = test_scenario::begin(user);
        
        // Initialize and create memory object
        {
            let ctx = test_scenario::ctx(&mut scenario);
            memory_wallet::init_for_testing(ctx);
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            memory_wallet::create_memory_object(ctx);
        };

        // Test ingestion
        test_scenario::next_tx(&mut scenario, user);
        {
            let memory_object = test_scenario::take_from_sender<memory_wallet::MemoryObject>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let graph_json = b"{'nodes': ['flight', 'Tokyo'], 'edges': []}";
            let vector_data = b"vector_data_placeholder";
            
            memory_wallet::ingest(&memory_object, *graph_json, *vector_data, ctx);
            
            test_scenario::return_to_sender(&scenario, memory_object);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_finalize_update() {
        let user = @0xA;
        let admin = @0xB;
        let mut scenario = test_scenario::begin(admin);
        
        // Initialize as admin
        {
            let ctx = test_scenario::ctx(&mut scenario);
            memory_wallet::init_for_testing(ctx);
        };

        // Create memory object as user
        test_scenario::next_tx(&mut scenario, user);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            memory_wallet::create_memory_object(ctx);
        };

        // Finalize update as admin
        test_scenario::next_tx(&mut scenario, admin);
        {
            let mut memory_object = test_scenario::take_from_address<memory_wallet::MemoryObject>(&scenario, user);
            let admin_cap = test_scenario::take_from_sender<memory_wallet::AdminCap>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let vector_cert = b"vector_cert_123";
            let graph_cert = b"graph_cert_456";
            
            memory_wallet::finalize_update(&mut memory_object, *vector_cert, *graph_cert, &admin_cap, ctx);
            
            // Verify certificates are updated
            assert!(!string::is_empty(&memory_wallet::get_vector_cert(&memory_object)), 0);
            assert!(!string::is_empty(&memory_wallet::get_graph_cert(&memory_object)), 1);
            
            test_scenario::return_to_address(&scenario, user, memory_object);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = memory_wallet::ENotOwner)]
    fun test_ingest_not_owner() {
        let user = @0xA;
        let other_user = @0xB;
        let mut scenario = test_scenario::begin(user);
        
        // Initialize and create memory object as user
        {
            let ctx = test_scenario::ctx(&mut scenario);
            memory_wallet::init_for_testing(ctx);
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let ctx = test_scenario::ctx(&mut scenario);
            memory_wallet::create_memory_object(ctx);
        };

        // Try to ingest as different user (should fail)
        test_scenario::next_tx(&mut scenario, other_user);
        {
            let memory_object = test_scenario::take_from_address<memory_wallet::MemoryObject>(&scenario, user);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let graph_json = b"test";
            let vector_data = b"test";
            
            memory_wallet::ingest(&memory_object, *graph_json, *vector_data, ctx);
            
            test_scenario::return_to_address(&scenario, user, memory_object);
        };

        test_scenario::end(scenario);
    }
}