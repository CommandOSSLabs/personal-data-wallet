module pdw::chat_sessions {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};
    use std::vector;

    // Events
    struct ChatSessionCreated has copy, drop {
        id: ID,
        owner: address,
        model_name: String
    }

    struct MessageAdded has copy, drop {
        session_id: ID,
        role: String,
        content_preview: String
    }

    struct SessionSummaryUpdated has copy, drop {
        session_id: ID,
        summary_preview: String
    }
    
    struct SessionDeleted has copy, drop {
        id: ID,
        owner: address
    }

    // A single message in a chat
    struct Message has store, copy, drop {
        role: String,   // "user" or "assistant"
        content: String
    }

    // The complete chat session, with a summary field
    struct ChatSession has key {
        id: UID,
        owner: address,
        model_name: String,
        messages: vector<Message>,
        summary: String // Starts empty, filled upon session completion
    }

    // Error codes
    const ENonOwner: u64 = 0;

    /// Create a new chat session
    public entry fun create_session(
        model_name: vector<u8>,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        let id = object::new(ctx);
        let object_id = object::uid_to_inner(&id);
        
        let session = ChatSession {
            id,
            owner,
            model_name: string::utf8(model_name),
            messages: vector::empty<Message>(),
            summary: string::utf8(b"")
        };

        // Emit event
        sui::event::emit(ChatSessionCreated {
            id: object_id,
            owner,
            model_name: string::utf8(model_name)
        });

        transfer::transfer(session, owner);
    }

    /// Add a message to an existing chat session
    public entry fun add_message_to_session(
        session: &mut ChatSession,
        role: vector<u8>,
        content: vector<u8>,
        ctx: &TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == session.owner, ENonOwner);
        
        let message = Message {
            role: string::utf8(role),
            content: string::utf8(content)
        };

        vector::push_back(&mut session.messages, message);

        // Create a preview of the content (first 32 chars)
        let preview_len = if (string::length(&message.content) > 32) { 32 } else { string::length(&message.content) };
        let preview = string::substring(&message.content, 0, preview_len);

        // Emit event
        sui::event::emit(MessageAdded {
            session_id: object::uid_to_inner(&session.id),
            role: message.role,
            content_preview: preview
        });
    }

    /// Delete a chat session
    public entry fun delete_session(
        session: ChatSession,
        ctx: &TxContext
    ) {
        let ChatSession { id, owner, model_name: _, messages: _, summary: _ } = session;
        
        let sender = tx_context::sender(ctx);
        assert!(sender == owner, ENonOwner);
        
        let object_id = object::uid_to_inner(&id);
        
        // Emit event before deleting
        sui::event::emit(SessionDeleted {
            id: object_id,
            owner
        });
        
        // Delete the object by unpacking it completely
        object::delete(id);
    }

    /// Save a summary for the chat session (typically when session is complete)
    public entry fun save_session_summary(
        session: &mut ChatSession,
        summary: vector<u8>,
        ctx: &TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == session.owner, ENonOwner);
        
        session.summary = string::utf8(summary);

        // Create a preview of the summary (first 64 chars)
        let preview_len = if (string::length(&session.summary) > 64) { 64 } else { string::length(&session.summary) };
        let preview = string::substring(&session.summary, 0, preview_len);

        // Emit event
        sui::event::emit(SessionSummaryUpdated {
            session_id: object::uid_to_inner(&session.id),
            summary_preview: preview
        });
    }

    // Accessor functions
    public fun get_messages(session: &ChatSession): &vector<Message> {
        &session.messages
    }

    public fun get_summary(session: &ChatSession): &String {
        &session.summary
    }

    public fun get_owner(session: &ChatSession): address {
        session.owner
    }

    public fun get_model_name(session: &ChatSession): &String {
        &session.model_name
    }
}