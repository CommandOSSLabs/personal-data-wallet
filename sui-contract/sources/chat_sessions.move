module personal_data_wallet::chat_sessions {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;

    // Error codes
    const ENotOwner: u64 = 1;
    const ESessionNotFound: u64 = 2;
    const EInvalidMessage: u64 = 3;

    // Struct representing a chat message
    public struct ChatMessage has store, copy, drop {
        id: String,
        content: String,
        message_type: String, // "user" or "assistant"
        timestamp: u64,
    }

    // Struct representing a chat session
    public struct ChatSession has key, store {
        id: UID,
        owner: address,
        title: String,
        messages: vector<ChatMessage>,
        created_at: u64,
        updated_at: u64,
        message_count: u64,
    }

    // Registry to track all chat sessions for efficient querying
    public struct ChatSessionRegistry has key {
        id: UID,
        total_sessions: u64,
        active_sessions: u64,
    }

    // Admin capability
    public struct AdminCap has key {
        id: UID,
    }

    // Events
    public struct SessionCreated has copy, drop {
        session_id: address,
        owner: address,
        title: String,
        timestamp: u64,
    }

    public struct MessageAdded has copy, drop {
        session_id: address,
        message_id: String,
        owner: address,
        message_type: String,
        timestamp: u64,
    }

    public struct SessionUpdated has copy, drop {
        session_id: address,
        owner: address,
        new_title: String,
        timestamp: u64,
    }

    public struct SessionDeleted has copy, drop {
        session_id: address,
        owner: address,
        timestamp: u64,
    }

    // Initialize the module
    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        
        let registry = ChatSessionRegistry {
            id: object::new(ctx),
            total_sessions: 0,
            active_sessions: 0,
        };
        
        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(registry);
    }

    // Create a new chat session
    public entry fun create_session(
        registry: &mut ChatSessionRegistry,
        title: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let title_string = string::utf8(title);
        
        let session = ChatSession {
            id: object::new(ctx),
            owner: sender,
            title: title_string,
            messages: vector::empty(),
            created_at: tx_context::epoch_timestamp_ms(ctx),
            updated_at: tx_context::epoch_timestamp_ms(ctx),
            message_count: 0,
        };

        let session_id = object::uid_to_address(&session.id);
        
        // Update registry
        registry.total_sessions = registry.total_sessions + 1;
        registry.active_sessions = registry.active_sessions + 1;

        // Emit event
        event::emit(SessionCreated {
            session_id,
            owner: sender,
            title: title_string,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });

        transfer::transfer(session, sender);
    }

    // Add a message to a chat session
    public entry fun add_message(
        session: &mut ChatSession,
        message_id: vector<u8>,
        content: vector<u8>,
        message_type: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(session.owner == sender, ENotOwner);
        
        let message = ChatMessage {
            id: string::utf8(message_id),
            content: string::utf8(content),
            message_type: string::utf8(message_type),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        };
        
        vector::push_back(&mut session.messages, message);
        session.message_count = session.message_count + 1;
        session.updated_at = tx_context::epoch_timestamp_ms(ctx);
        
        let session_id = object::uid_to_address(&session.id);
        
        event::emit(MessageAdded {
            session_id,
            message_id: string::utf8(message_id),
            owner: sender,
            message_type: string::utf8(message_type),
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Update session title
    public entry fun update_session_title(
        session: &mut ChatSession,
        new_title: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(session.owner == sender, ENotOwner);
        
        let new_title_string = string::utf8(new_title);
        session.title = new_title_string;
        session.updated_at = tx_context::epoch_timestamp_ms(ctx);
        
        let session_id = object::uid_to_address(&session.id);
        
        event::emit(SessionUpdated {
            session_id,
            owner: sender,
            new_title: new_title_string,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
    }

    // Delete a chat session
    public entry fun delete_session(
        session: ChatSession,
        registry: &mut ChatSessionRegistry,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(session.owner == sender, ENotOwner);
        
        let session_id = object::uid_to_address(&session.id);
        
        // Update registry
        registry.active_sessions = registry.active_sessions - 1;
        
        event::emit(SessionDeleted {
            session_id,
            owner: sender,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
        
        let ChatSession { 
            id, 
            owner: _, 
            title: _, 
            messages: _, 
            created_at: _, 
            updated_at: _, 
            message_count: _ 
        } = session;
        
        object::delete(id);
    }

    // Get session information (public view function)
    public fun get_session_info(session: &ChatSession): (
        address,     // owner
        String,      // title
        u64,         // message_count
        u64,         // created_at
        u64          // updated_at
    ) {
        (
            session.owner,
            session.title,
            session.message_count,
            session.created_at,
            session.updated_at
        )
    }

    // Get session messages
    public fun get_messages(session: &ChatSession): vector<ChatMessage> {
        session.messages
    }

    // Get registry statistics
    public fun get_registry_stats(registry: &ChatSessionRegistry): (u64, u64) {
        (registry.total_sessions, registry.active_sessions)
    }

    // Check if session is owned by specific address
    public fun is_owner(session: &ChatSession, user: address): bool {
        session.owner == user
    }

    // Get session owner
    public fun get_owner(session: &ChatSession): address {
        session.owner
    }

    // Get session title
    public fun get_title(session: &ChatSession): String {
        session.title
    }

    // Get message count
    public fun get_message_count(session: &ChatSession): u64 {
        session.message_count
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
