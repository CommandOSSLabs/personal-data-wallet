# @mysten/sui TypeScript SDK Documentation

## Overview
The @mysten/sui package is the official TypeScript SDK for the Sui blockchain platform developed by Mysten Labs. It provides comprehensive tools for building decentralized applications, interacting with Move smart contracts, and leveraging Sui's unique features.

## Installation

### Standard Installation
```sh
npm install @mysten/sui
```

### Experimental Version
```sh
npm install @mysten/sui@experimental
```

## Key Features

### Core Functionality
- **Sui TypeScript SDK**: Complete toolkit for blockchain interactions
- **Move Smart Contract Integration**: Native support for Sui's Move programming language
- **Digital Asset Management**: Tools for managing NFTs and fungible tokens
- **Transaction Building**: Comprehensive transaction construction utilities
- **Object Management**: Sui's unique object-oriented data model support

### Advanced Features
- **zkLogin Integration**: Zero-knowledge authentication system
- **GraphQL Support**: Query blockchain data efficiently
- **Local Development Tools**: Run and test against local Sui networks
- **Testing Utilities**: End-to-end testing capabilities
- **gRPC Client Support**: High-performance blockchain communication
- **Seal SDK**: Decentralized secrets management service using threshold encryption and on-chain access control

## Seal SDK - Decentralized Secrets Management

### Overview
Seal is a decentralized secrets management (DSM) service built on Sui blockchain that enables secure encryption and access control for sensitive data. It combines client-side encryption with blockchain-based access control to provide a comprehensive data protection solution.

**Architecture Components:**
- **Secret Sharing Mechanism**: Uses "t-out-of-n" threshold encryption model
- **Client-Side Encryption (CSE)**: Encrypts data with multiple public keys
- **Blockchain Access Control**: Leverages Sui for controlling decryption key access
- **Off-chain Key Servers**: Provides identity-based private key generation

**Current Status:** Testnet phase with TypeScript SDK, Rust and Move implementations

### Core Features
- **Threshold Encryption**: Requires multiple key servers to decrypt data
- **Programmable Access Control**: Custom approval logic via Move functions
- **Key Server Management**: Support for open and permissioned modes
- **Session-based Decryption**: Secure key retrieval with wallet signatures

### Developer Workflow

#### 1. Encryption Process
```typescript
// Create a SealClient
const client = new SealClient();

// Encrypt data with access control
const { encryptedObject, key } = await client.encrypt({
  threshold: 2,                    // Number of key servers required
  packageId: fromHEX(packageId),   // Move package ID
  id: fromHEX(id),                 // Access control ID
  data,                            // Data to encrypt
});
```

#### 2. Decryption Process
```typescript
// Create session key
const sessionKey = new SessionKey();

// User approves access via wallet signature
// Build transaction invoking seal_approve* functions

// Decrypt data
const decryptedData = await client.decrypt({
  sessionKey,
  encryptedObject,
  key
});
```

### Best Practices
- **Access Policy Design**: Carefully design approval functions for security
- **Key Server Selection**: Choose reliable key servers for threshold
- **Minimize Requests**: Reduce key retrieval calls for efficiency
- **Server Verification**: Verify key servers when using permissioned mode

### Use Cases
- **Secure Personal Data Storage**: Protect user data with programmable access control
- **Controlled Content Sharing**: Share content with specific access requirements
- **Private Messaging**: End-to-end encrypted communication with conditional access
- **Secure Voting Mechanisms**: Implement voting systems with privacy guarantees
- **MEV-resilient Trading**: Protect trading strategies from front-running
- **Time-locked Content**: Release data based on temporal or blockchain conditions

### Installation
```sh
# Install via npm
npm install @mysten/seal
```

### Important Limitations
- **Not a traditional KMS**: Not designed for wallet keys or highly sensitive credentials
- **Not privacy preservation**: Not a general privacy technology like zero-knowledge proofs
- **Testnet Only**: Currently in testing phase, not recommended for production sensitive data
- **Access Control Dependency**: Security depends on proper Move contract implementation

### Development Status & Roadmap
**Current Capabilities:**
- TypeScript SDK available
- Testnet deployment ready
- Basic threshold encryption

**Future Enhancements:**
- Multi-party computation key servers
- Server-side encryption support
- Digital Rights Management (DRM) integration
- Backward compatibility maintenance

### Community & Support
- **Discord**: Join Sui Discord for community discussions
- **GitHub**: Open source repository for contributions
- **Documentation**: Comprehensive guides and API references

## Development Setup

### Repository Structure
The Mysten Labs TypeScript SDKs use a monorepo architecture with:
- **Package Manager**: pnpm (required)
- **Build System**: Turbo for efficient builds
- **Testing**: Unit and E2E tests with Docker testcontainers
- **Linting**: ESLint and Prettier configuration

### Initial Setup
```sh
# Install dependencies (requires pnpm)
pnpm install

# Build all packages
pnpm turbo build
# or
pnpm build
```

### Development Commands
```sh
# Run unit tests
pnpm test

# Run E2E tests (requires Docker)
pnpm test:e2e

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Local Network Setup
Start a comprehensive local Sui network with all services:
```sh
cargo run --bin sui -- start --with-faucet --force-regenesis --with-indexer --pg-port 5432 --pg-db-name sui_indexer_v2 --with-graphql
```

Basic local network:
```sh
cargo run --bin sui -- start --with-faucet --force-regenesis
```

### Testing
Generate example data for testing:
```sh
pnpm --filter @mysten/sui test:e2e
```

Run the test validator with indexer:
```sh
RUST_LOG="consensus=off" ./target/debug/sui-test-validator --with-indexer
```

## CLI Commands

### Installation Verification
```sh
sui --version
```

### Client Initialization
```sh
sui client
```

### Network Connection Options
- **Testnet**: Default connection for development
- **Mainnet**: Production network
- **Local Network**: For development and testing

## Development Tools

### Package Management
```sh
# Install dependencies
pnpm install

# Build documentation
pnpm build

# Start development server
pnpm start
```

### Database Setup (for Indexer)
```sh
# PostgreSQL setup
brew install postgresql@15
brew services start postgresql@version

# Create database
psql -U postgres
CREATE DATABASE sui_indexer_v2;

# Run migrations
diesel setup --database-url="postgres://postgres:postgrespw@localhost:5432/sui_indexer_v2"
```

## Core Components

### Object Model
Sui uses a unique object-oriented data model where:
- All data is represented as objects
- Objects have unique IDs and ownership
- Move smart contracts operate on these objects

### Transaction System
- **Programmable Transactions**: Compose multiple operations
- **Gas Management**: Efficient fee structure
- **Parallel Execution**: High throughput transaction processing

### Move Programming Language
- **Resource-oriented**: Safe asset management
- **Formal verification**: Mathematical proof of correctness
- **Object-centric**: Native object model integration

## GraphQL Integration

### Setup
Requires running indexer and GraphQL server:
```sh
sui start --with-graphql --with-indexer
```

Default GraphQL endpoint: `127.0.0.1:9125`

### Configuration Options
```
--with-graphql[=<PORT>]  # Start GraphQL server (default: 9125)
--with-indexer[=<PORT>]  # Start indexer (default: 9124) 
--with-faucet[=<PORT>]   # Start faucet (default: 9123)
```

## zkLogin Authentication

### Installation
```sh
npm install @mysten/sui  # Standard version includes zkLogin
```

### Key Features
- Zero-knowledge proof authentication
- OAuth provider integration
- Privacy-preserving identity verification
- Seamless wallet creation

## Testing Framework

### Unit Testing
```move
#[test_only]
fun test_sword_create() {
    use sui::test_scenario;
    let owner = @0x1;
    let scenario = test_scenario::begin(owner);
    // Test implementation
    test_scenario::end(scenario);
}
```

### Integration Testing
```sh
# Run end-to-end tests
pnpm --filter @mysten/sui test:e2e

# Run with test validator
sui-test-validator --with-indexer
```

## Move Smart Contract Development

### Basic Module Structure
```move
module 0x0::example {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    struct EXAMPLE has drop {} // One-time witness
    
    // Module initializer
    fun init(otw: EXAMPLE, ctx: &mut TxContext) {
        // Initialization logic
    }
}
```

### Object Creation
```move
public fun create_object(ctx: &mut TxContext): MyObject {
    MyObject { id: object::new(ctx) }
}
```

## Network Configuration

### Sui CLI Options
```
sui start [OPTIONS]

Key Options:
--network.config <CONFIG_DIR>     # Config directory
--force-regenesis                 # Fresh state each run
--with-graphql[=<PORT>]          # GraphQL server (9125)
--with-faucet[=<PORT>]           # Faucet service (9123)
--with-indexer[=<PORT>]          # Indexer service (9124)
--fullnode-rpc-port <PORT>       # RPC port (9000)
--pg-port <PG_PORT>              # PostgreSQL port (5432)
--pg-db-name <PG_DB_NAME>        # Database name
--epoch-duration-ms <MS>         # Epoch duration
```

## Performance and Monitoring

### Logging
Enable structured JSON logging:
```sh
export SUI_JSON_SPAN_LOGS=1
```

### Observability
- **Metrics**: Built-in performance metrics
- **Tracing**: Distributed request tracing
- **Health Checks**: Service status monitoring

## Production Deployment

### Full Node Setup
```sh
# Download genesis blob
wget https://github.com/MystenLabs/sui-genesis/raw/main/branch-name/genesis.blob

# Start full node
docker compose up fullnode -d
docker compose logs fullnode -f
```

### Validator Setup
```sh
# Build from source
git clone git@github.com:MystenLabs/sui.git && cd sui
git checkout testnet
cargo build --bin sui
export SUI_BINARY="$(pwd)/target/debug/sui"
```

## Common Patterns

### Object Transfer
```move
use sui::transfer;

public fun transfer_object(obj: MyObject, recipient: address) {
    transfer::public_transfer(obj, recipient);
}
```

### Event Emission
```move
use sui::event;

public fun emit_event(data: EventData) {
    event::emit(data);
}
```

### Capability-based Access Control
```move
struct AdminCap has key, store { id: UID }

public fun admin_function(_: &AdminCap, ctx: &mut TxContext) {
    // Admin-only functionality
}
```

## Security Best Practices

### Safe Object Handling
- Always validate object ownership
- Use capability patterns for access control
- Implement proper error handling

### Resource Management
- Follow Move's resource safety rules
- Prevent resource leaks
- Use proper object lifecycle management

### Testing Security
- Test edge cases thoroughly
- Validate all input parameters
- Test failure scenarios

## Community and Resources

### Documentation
- **Move Book**: Comprehensive Move language guide
- **Sui Documentation**: Official platform documentation
- **API References**: Complete SDK documentation

### Development Tools
- **Sui Explorer**: Blockchain explorer
- **Sui Wallet**: Browser extension wallet
- **IDE Extensions**: Move language support

### Support Channels
- **GitHub**: Issues and discussions
- **Discord**: Community support
- **Forum**: Technical discussions

## Version Management

### Installing Specific Versions
```sh
# Using suiup (recommended)
suiup install sui@testnet

# Using Homebrew
brew install sui

# Using Chocolatey (Windows)
choco install sui
```

### Version Verification
```sh
sui --version
```

This documentation represents the comprehensive capabilities of the @mysten/sui TypeScript SDK as of the latest available information, providing developers with everything needed to build sophisticated applications on the Sui blockchain platform.