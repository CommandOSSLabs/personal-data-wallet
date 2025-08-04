# SEAL Key Server Setup for MVP

This guide will help you set up your own SEAL key server in open mode for testing the Personal Data Wallet MVP.

## Prerequisites

1. Rust toolchain installed
2. Access to Sui testnet/devnet
3. SEAL CLI tools

## Step 1: Generate Master Key

First, generate a BLS master key pair for your key server:

```bash
# Clone the SEAL repository (if not already done)
git clone https://github.com/MystenLabs/seal-sdk.git
cd seal-sdk

# Build the SEAL CLI
cargo build --bin seal-cli

# Generate master key
cargo run --bin seal-cli genkey
```

This will output:
```
Master key: <MASTER_KEY>
Public key: <MASTER_PUBKEY>
```

**IMPORTANT**: Save these values securely! The master key is needed to run the key server.

## Step 2: Register Key Server On-Chain

Register your key server on the Sui blockchain:

```bash
# Make sure you have Sui CLI configured for testnet
sui client switch --env testnet

# Register the key server
sui client call \
  --function create_and_transfer_v1 \
  --module key_server \
  --package 0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26 \
  --args "PDW-MVP-KeyServer" "http://localhost:2024" 0 "<MASTER_PUBKEY>"
```

This will output:
```
Object of type key_server::KeyServer <KEY_SERVER_OBJECT_ID>
Object of type key_server::Cap <KEY_SERVER_CAP_ID>
```

Save the `KEY_SERVER_OBJECT_ID` - you'll need it for configuration.

## Step 3: Create Key Server Configuration

Create a file `key-server-config.yaml`:

```yaml
# Key server configuration for open mode
server_mode: !Open

# Network configuration
network: testnet  # or devnet

# Server settings
server:
  host: "0.0.0.0"
  port: 2024

# Your key server object ID from step 2
key_server_object_id: "<KEY_SERVER_OBJECT_ID>"

# Sui RPC configuration
sui_rpc_url: "https://fullnode.testnet.sui.io:443"

# Logging
log_level: "info"

# Metrics (optional)
metrics:
  enabled: true
  port: 9184
```

## Step 4: Run the Key Server

### Option A: Run with Cargo

```bash
# Set environment variables
export CONFIG_PATH=./key-server-config.yaml
export MASTER_KEY=<MASTER_KEY>

# Run the key server
cargo run --bin key-server
```

### Option B: Run with Docker

Create a `Dockerfile` if not exists:

```dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release --bin key-server

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/key-server /usr/local/bin/
EXPOSE 2024 9184
CMD ["key-server"]
```

Build and run:

```bash
# Build Docker image
docker build -t pdw-seal-key-server .

# Run the container
docker run -d \
  --name pdw-key-server \
  -p 2024:2024 \
  -p 9184:9184 \
  -v $(pwd)/key-server-config.yaml:/config/key-server-config.yaml \
  -e CONFIG_PATH=/config/key-server-config.yaml \
  -e MASTER_KEY=<MASTER_KEY> \
  pdw-seal-key-server
```

## Step 5: Verify Key Server is Running

Check that your key server is running:

```bash
# Health check
curl http://localhost:2024/health

# Service info
curl http://localhost:2024/v1/service

# Metrics (if enabled)
curl http://localhost:9184
```

## Step 6: Update Personal Data Wallet Configuration

Update your `.env` file to use your key server:

```env
# SEAL configuration
SEAL_NETWORK=testnet
SEAL_OPEN_MODE=true
SEAL_THRESHOLD=1  # For MVP testing with single key server
SEAL_KEY_SERVER_IDS=<KEY_SERVER_OBJECT_ID>
```

## Security Considerations for MVP

Since this is for MVP testing:

1. **Use testnet/devnet only** - Never use these keys on mainnet
2. **Keep master key secure** - Store in environment variable or secure vault
3. **Restrict access** - Use firewall rules to limit who can access the key server
4. **Monitor logs** - Check for any suspicious activity
5. **Regular backups** - Backup the master key and configuration

## Troubleshooting

### Key server won't start
- Check that the master key is correct
- Verify the configuration file path
- Ensure ports 2024 and 9184 are not in use

### Can't register on-chain
- Ensure you have SUI tokens for gas
- Verify you're on the correct network
- Check that the package ID is correct

### Encryption/decryption fails
- Verify the key server object ID in your app matches the registered one
- Check key server logs for errors
- Ensure the key server URL is accessible from your app

## Quick Start Script

Save this as `setup-key-server.sh`:

```bash
#!/bin/bash

echo "🔐 SEAL Key Server Setup for PDW MVP"
echo "===================================="

# Generate keys
echo "Generating master key..."
KEYS=$(cargo run --bin seal-cli genkey 2>&1)
MASTER_KEY=$(echo "$KEYS" | grep "Master key:" | cut -d' ' -f3)
MASTER_PUBKEY=$(echo "$KEYS" | grep "Public key:" | cut -d' ' -f3)

echo "Master key: $MASTER_KEY"
echo "Public key: $MASTER_PUBKEY"

# Save to .env file
echo "" >> .env
echo "# SEAL Key Server" >> .env
echo "SEAL_MASTER_KEY=$MASTER_KEY" >> .env
echo "SEAL_MASTER_PUBKEY=$MASTER_PUBKEY" >> .env

echo ""
echo "✅ Keys generated and saved to .env"
echo ""
echo "Next steps:"
echo "1. Register on-chain with the public key"
echo "2. Update key-server-config.yaml with the object ID"
echo "3. Run: CONFIG_PATH=./key-server-config.yaml MASTER_KEY=$MASTER_KEY cargo run --bin key-server"
```

Make it executable: `chmod +x setup-key-server.sh`