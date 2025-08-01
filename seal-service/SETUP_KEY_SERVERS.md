# Seal Key Server Setup Guide

## Option 1: Use Existing Testnet Key Servers (Recommended for Testing)

Mysten Labs operates testnet key servers. To find them:

1. **Check Sui Explorer for Seal package objects:**
   - Go to https://testnet.suivision.xyz/ 
   - Search for package ID: `0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26` (example from docs)
   - Look for `key_server::KeyServer` objects

2. **Query via Sui CLI:**
   ```bash
   # Install Sui CLI if not already installed
   cargo install --git https://github.com/MystenLabs/sui.git --branch testnet sui
   
   # Query for KeyServer objects
   sui client object <PACKAGE_ID>
   ```

3. **Use GraphQL API:**
   ```bash
   curl -X POST https://sui-testnet.mystenlabs.com/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "query { objects(filter: {type: \"key_server::KeyServer\"}) { nodes { address } } }"}'
   ```

## Option 2: Set Up Your Own Key Server

### Prerequisites
- Sui CLI installed and configured for testnet
- Rust development environment
- Domain/server for hosting the key server

### Step 1: Generate Keys
```bash
# Generate master key for derivation
openssl rand -hex 32 > master_key.txt

# Derive public key for index 0 (first client)
# Use your key derivation method to get PUBKEY_0
```

### Step 2: Deploy Key Server Object
```bash
sui client call --function create_and_transfer_v1 \
  --module key_server \
  --package 0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26 \
  --args "myserver" https://your-domain.com 0 <PUBKEY_0>
```

This outputs:
- `KEY_SERVER_OBJECT_ID_0`: Your key server object ID
- `KEY_SERVER_CAP_ID_0`: Management capability object

### Step 3: Run Key Server Software
1. Clone the Seal repository:
   ```bash
   git clone https://github.com/MystenLabs/seal.git
   cd seal
   ```

2. Create config file:
   ```yaml
   # config.yaml
   - name: "myserver"
     client_master_key: !Derived
       derivation_index: 0
     key_server_object_id: "<KEY_SERVER_OBJECT_ID_0>"
     package_ids:
       - "<PACKAGE_ID>"
   ```

3. Start the key server:
   ```bash
   cargo run --bin key-server -- --config config.yaml
   ```

## Configuration for Our TypeScript Service

Once you have key server object IDs, update `.env`:

```bash
# For 1-out-of-1 setup (single server)
SEAL_THRESHOLD=1
SEAL_KEY_SERVER_1=<KEY_SERVER_OBJECT_ID_0>

# For 1-out-of-2 setup (two servers, need one)
SEAL_THRESHOLD=1
SEAL_KEY_SERVER_1=<KEY_SERVER_OBJECT_ID_0>
SEAL_KEY_SERVER_2=<KEY_SERVER_OBJECT_ID_1>

# For 2-out-of-2 setup (two servers, need both - most secure)
SEAL_THRESHOLD=2
SEAL_KEY_SERVER_1=<KEY_SERVER_OBJECT_ID_0>
SEAL_KEY_SERVER_2=<KEY_SERVER_OBJECT_ID_1>
```

## Quick Start for Development

For immediate testing without setting up real key servers:

1. **Use Development Mode (Current Setup):**
   - Service runs with simulated encryption
   - No real key servers needed
   - Perfect for integration testing

2. **Start the service:**
   ```bash
   cd seal-service
   npm run build
   npm start
   ```

3. **Test the endpoints:**
   ```bash
   # Health check
   curl http://localhost:8080/health
   
   # Test encryption
   curl -X POST http://localhost:8080/encrypt \
     -H "Content-Type: application/json" \
     -d '{"data": "48656c6c6f", "identity": "test", "policy": {"owner": "0x123"}}'
   ```

## Production Recommendations

- **Use 2-out-of-2 threshold** for maximum security
- **Set up multiple independent key servers** across different infrastructure
- **Enable key server verification** (`SEAL_VERIFY_KEY_SERVERS=true`)
- **Use proper SSL/TLS** for all communications
- **Monitor key server availability** and health

## Troubleshooting

- **"Threshold greater than servers"**: Check your `.env` configuration
- **"Cannot connect to key server"**: Verify server URLs and network connectivity
- **"Invalid object ID"**: Ensure key server objects exist on the correct network
- **Development mode warnings**: Expected when using placeholder server IDs