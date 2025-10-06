# Seal Access Control Flow Diagram

This diagram shows the comprehensive cross-context access control system implemented in the seal_access_control.move file.

```mermaid
graph TD
    %% Main Entities
    subgraph "Main Components"
        AR[AccessRegistry]
        MW[Main Wallet]
        CW1[Context Wallet 1]
        CW2[Context Wallet 2]
        APP1[App 1]
        APP2[App 2]
    end

    %% Data Storage
    subgraph "Registry Storage"
        OWNERS[owners: content_id -> address]
        PERMS[permissions: key -> AccessPermission]
        CTXOWNERS[context_owners: context_id -> address]
        CTXPERMS[context_permissions: key -> AccessPermission]
        CTXWALLETS[context_wallets: address -> ContextWalletInfo]
        CONTENT_CTX[content_contexts: content_id -> context_wallet]
        ALLOWLIST[wallet_allowlist: key -> WalletAllowlistEntry]
    end

    %% Seal Approve Decision Flow
    subgraph "seal_approve Decision Tree"
        START[seal_approve called]
        PARSE[Parse content_id from bytes]
        CHECK_OWNER[Verify tx sender owns content]

        %% Context Wallet Path
        CHECK_CONTENT_CTX{Content has context wallet?}
        GET_CTX_WALLET[Get context wallet from content_contexts]
        VERIFY_CTX_OWNER[Verify main wallet owns context wallet]
        SAME_WALLET{requesting_wallet == context_wallet?}
        CHECK_ALLOWLIST[Check wallet allowlist permissions]
        CHECK_READ_SCOPE[Check read scope allowlist]
        CHECK_WRITE_SCOPE[Check write scope allowlist]
        CHECK_APP_HINT[Check legacy context permission via app_hint]

        %% Legacy Context Path
        EXTRACT_CTX[Extract context_id from content_id]
        VERIFY_LEGACY_OWNER[Verify sender owns context]
        OWNER_ACCESS{requesting_wallet == owner?}
        CHECK_LEGACY_PERM[Check legacy context permission]

        %% Results
        APPROVE[Access Approved ✓]
        DENY[Access Denied - abort ENoAccess]
    end

    %% Main Flow
    START --> PARSE
    PARSE --> CHECK_OWNER
    CHECK_OWNER --> CHECK_CONTENT_CTX

    %% Context Wallet Path
    CHECK_CONTENT_CTX -->|Yes| GET_CTX_WALLET
    GET_CTX_WALLET --> VERIFY_CTX_OWNER
    VERIFY_CTX_OWNER --> SAME_WALLET
    SAME_WALLET -->|Yes| APPROVE
    SAME_WALLET -->|No| CHECK_READ_SCOPE
    CHECK_READ_SCOPE -->|Has Permission| APPROVE
    CHECK_READ_SCOPE -->|No Permission| CHECK_WRITE_SCOPE
    CHECK_WRITE_SCOPE -->|Has Permission| APPROVE
    CHECK_WRITE_SCOPE -->|No Permission| CHECK_APP_HINT
    CHECK_APP_HINT -->|Has Permission| APPROVE
    CHECK_APP_HINT -->|No Permission| DENY

    %% Legacy Context Path
    CHECK_CONTENT_CTX -->|No| EXTRACT_CTX
    EXTRACT_CTX --> VERIFY_LEGACY_OWNER
    VERIFY_LEGACY_OWNER --> OWNER_ACCESS
    OWNER_ACCESS -->|Yes| APPROVE
    OWNER_ACCESS -->|No| CHECK_LEGACY_PERM
    CHECK_LEGACY_PERM -->|Has Permission| APPROVE
    CHECK_LEGACY_PERM -->|No Permission| DENY

    %% Entity Relationships
    MW -.->|owns| CW1
    MW -.->|owns| CW2
    CW1 -.->|used by| APP1
    CW2 -.->|used by| APP2

    %% Registry Connections
    AR --> OWNERS
    AR --> PERMS
    AR --> CTXOWNERS
    AR --> CTXPERMS
    AR --> CTXWALLETS
    AR --> CONTENT_CTX
    AR --> ALLOWLIST

    %% Permission Types
    subgraph "Permission Types"
        subgraph "Content-Level Permissions"
            CP1[Direct content access]
            CP2[Granted via grant_access]
            CP3[Time-based expiration]
        end

        subgraph "Context-Level Permissions"
            CLP1[Cross-context access]
            CLP2[App-to-context permissions]
            CLP3[Legacy context support]
        end

        subgraph "Wallet Allowlist Permissions"
            WAP1[Wallet-to-wallet access]
            WAP2[Scope-based permissions]
            WAP3[Hierarchical wallet system]
        end
    end

    %% Access Control Flow
    subgraph "Cross-Context Access Flow"
        REQ[Access Request]
        VALIDATE[Validate Request]
        CHECK_TYPE{Permission Type?}

        %% Content Level
        CONTENT_CHECK[Check Content Ownership]
        CONTENT_PERM[Check Content Permissions]

        %% Context Level
        CONTEXT_CHECK[Check Context Ownership]
        CONTEXT_PERM[Check Cross-Context Permissions]

        %% Wallet Level
        WALLET_CHECK[Check Wallet Relationship]
        WALLET_PERM[Check Wallet Allowlist]

        FINAL_DECISION{Grant Access?}
        GRANT[Access Granted]
        REJECT[Access Rejected]
    end

    REQ --> VALIDATE
    VALIDATE --> CHECK_TYPE
    CHECK_TYPE -->|Content| CONTENT_CHECK
    CHECK_TYPE -->|Context| CONTEXT_CHECK
    CHECK_TYPE -->|Wallet| WALLET_CHECK

    CONTENT_CHECK --> CONTENT_PERM
    CONTEXT_CHECK --> CONTEXT_PERM
    WALLET_CHECK --> WALLET_PERM

    CONTENT_PERM --> FINAL_DECISION
    CONTEXT_PERM --> FINAL_DECISION
    WALLET_PERM --> FINAL_DECISION

    FINAL_DECISION -->|Yes| GRANT
    FINAL_DECISION -->|No| REJECT

    %% Wallet Hierarchy
    subgraph "Hierarchical Wallet System"
        MAIN_WALLET[Main Wallet<br/>Controls all contexts]

        subgraph "Context Wallets"
            CTX_WALLET_1[Context Wallet 1<br/>derivation_index: 0<br/>app_hint: "medical"]
            CTX_WALLET_2[Context Wallet 2<br/>derivation_index: 1<br/>app_hint: "social"]
            CTX_WALLET_3[Context Wallet 3<br/>derivation_index: 2<br/>app_hint: "finance"]
        end

        MAIN_WALLET -->|derives| CTX_WALLET_1
        MAIN_WALLET -->|derives| CTX_WALLET_2
        MAIN_WALLET -->|derives| CTX_WALLET_3

        CTX_WALLET_1 -.->|can grant access to| CTX_WALLET_2
        CTX_WALLET_1 -.->|can grant access to| CTX_WALLET_3
        CTX_WALLET_2 -.->|can grant access to| CTX_WALLET_3
    end

    %% Access Patterns
    subgraph "Access Patterns"
        subgraph "Same Context Access"
            SCA1[App accesses own context]
            SCA2[Automatic approval]
        end

        subgraph "Cross Context Access"
            CCA1[App requests different context]
            CCA2[Check explicit permissions]
            CCA3[Check wallet allowlist]
            CCA4[Check legacy permissions]
        end

        subgraph "Owner Access"
            OA1[Main wallet accesses any context]
            OA2[Automatic approval]
        end
    end

    %% Events
    subgraph "Event System"
        EV1[ContextWalletRegistered]
        EV2[CrossContextAccessChanged]
        EV3[WalletAllowlistChanged]
        EV4[ContentRegistered]
        EV5[AccessChanged]
    end

    %% Styling
    classDef entityStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef decisionStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef approveStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef denyStyle fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef storageStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class MW,CW1,CW2,APP1,APP2,AR entityStyle
    class CHECK_CONTENT_CTX,SAME_WALLET,OWNER_ACCESS,CHECK_TYPE,FINAL_DECISION decisionStyle
    class APPROVE,GRANT approveStyle
    class DENY,REJECT denyStyle
    class OWNERS,PERMS,CTXOWNERS,CTXPERMS,CTXWALLETS,CONTENT_CTX,ALLOWLIST storageStyle
```

## Key Components Explained

### 1. Main Entities
- **AccessRegistry**: Central registry storing all permissions and relationships
- **Main Wallet**: User's primary wallet that controls all context wallets
- **Context Wallets**: Derived wallets for specific app contexts
- **Apps**: Applications that request access to data

### 2. Storage Tables
- **owners**: Maps content to owner addresses
- **permissions**: Content-level access permissions
- **context_owners**: Maps contexts to owner addresses
- **context_permissions**: Cross-context access permissions
- **context_wallets**: Metadata for hierarchical context wallets
- **content_contexts**: Maps content to its context wallet
- **wallet_allowlist**: Wallet-to-wallet access permissions

### 3. Access Control Decision Flow
The `seal_approve` function implements a sophisticated decision tree:
1. **Content with Context Wallet**: Checks wallet allowlist and app hints
2. **Legacy Context**: Falls back to traditional context-based permissions
3. **Owner Access**: Main wallet has automatic access to all contexts
4. **Cross-Context**: Requires explicit permissions between contexts

### 4. Permission Types
- **Content-Level**: Direct permissions on specific content
- **Context-Level**: App-to-context cross-access permissions
- **Wallet Allowlist**: Hierarchical wallet-based permissions with scopes

### 5. Hierarchical Wallet System
- Main wallet derives multiple context wallets
- Each context wallet has a derivation index and optional app hint
- Context wallets can grant access to other context wallets
- Supports scoped permissions (read/write) with expiration times

This system provides a comprehensive, secure, and flexible access control mechanism that supports both traditional content-based permissions and modern hierarchical wallet-based access patterns.