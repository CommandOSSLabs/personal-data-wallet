#!/bin/bash

# SEAL Key Server Local Setup Script for Personal Data Wallet MVP
# This script helps you set up and run a SEAL key server locally

echo "🔐 SEAL Key Server Local Setup for PDW MVP"
echo "=========================================="
echo ""

# Configuration
SEAL_SDK_DIR="../seal-sdk"
CONFIG_FILE="./config/seal-key-server-config.yaml"
ENV_FILE=".env"

# Step 1: Clone SEAL SDK if not exists
if [ ! -d "$SEAL_SDK_DIR" ]; then
    echo "📦 Cloning SEAL SDK..."
    cd ..
    git clone https://github.com/MystenLabs/seal-sdk.git
    cd personal_data_wallet/backend
else
    echo "✓ SEAL SDK already exists at $SEAL_SDK_DIR"
fi

# Step 2: Build SEAL CLI
echo ""
echo "🔨 Building SEAL CLI tools..."
cd $SEAL_SDK_DIR
cargo build --bin seal-cli --release
cd -

# Step 3: Generate master key if not exists
if [ -z "$SEAL_MASTER_KEY" ]; then
    echo ""
    echo "🔑 Generating master key pair..."
    
    # Run genkey and capture output
    GENKEY_OUTPUT=$($SEAL_SDK_DIR/target/release/seal-cli genkey 2>&1)
    
    # Extract master key and public key
    MASTER_KEY=$(echo "$GENKEY_OUTPUT" | grep "Master key:" | awk '{print $3}')
    MASTER_PUBKEY=$(echo "$GENKEY_OUTPUT" | grep "Public key:" | awk '{print $3}')
    
    if [ -z "$MASTER_KEY" ] || [ -z "$MASTER_PUBKEY" ]; then
        echo "❌ Failed to generate keys. Output:"
        echo "$GENKEY_OUTPUT"
        exit 1
    fi
    
    echo "✓ Generated master key: ${MASTER_KEY:0:20}..."
    echo "✓ Generated public key: ${MASTER_PUBKEY:0:20}..."
    
    # Save to .env file
    echo "" >> $ENV_FILE
    echo "# SEAL Key Server Configuration" >> $ENV_FILE
    echo "SEAL_MASTER_KEY=$MASTER_KEY" >> $ENV_FILE
    echo "SEAL_MASTER_PUBKEY=$MASTER_PUBKEY" >> $ENV_FILE
    
    echo "✓ Keys saved to $ENV_FILE"
else
    echo "✓ Using existing master key from environment"
    MASTER_KEY=$SEAL_MASTER_KEY
    MASTER_PUBKEY=$SEAL_MASTER_PUBKEY
fi

# Step 4: Register key server on-chain
echo ""
echo "📝 Registering key server on-chain..."
echo ""
echo "Run this command to register your key server:"
echo ""
echo "sui client call \\"
echo "  --function create_and_transfer_v1 \\"
echo "  --module key_server \\"
echo "  --package 0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26 \\"
echo "  --args \"PDW-Local-KeyServer\" \"http://localhost:2024\" 0 \"$MASTER_PUBKEY\""
echo ""
echo "After running, you'll get:"
echo "- KEY_SERVER_OBJECT_ID: Save this!"
echo "- KEY_SERVER_CAP_ID: Save this too!"
echo ""
read -p "Press Enter after you've registered the key server and have the OBJECT_ID..."

# Step 5: Get the object ID
echo ""
read -p "Enter your KEY_SERVER_OBJECT_ID: " KEY_SERVER_OBJECT_ID

if [ -z "$KEY_SERVER_OBJECT_ID" ]; then
    echo "❌ KEY_SERVER_OBJECT_ID is required!"
    exit 1
fi

# Save to .env
echo "SEAL_KEY_SERVER_OBJECT_ID=$KEY_SERVER_OBJECT_ID" >> $ENV_FILE
echo "SEAL_KEY_SERVER_IDS=$KEY_SERVER_OBJECT_ID" >> $ENV_FILE

# Step 6: Create configuration directory
mkdir -p ./config

# Step 7: Create key server config
echo ""
echo "📄 Creating key server configuration..."
cat > $CONFIG_FILE << EOF
# SEAL Key Server Configuration for Open Mode
server_mode: !Open

# Network configuration
network: testnet

# Server settings
server:
  host: "0.0.0.0"
  port: 2024

# Your key server object ID
key_server_object_id: "$KEY_SERVER_OBJECT_ID"

# Sui RPC configuration
sui_rpc_url: "https://fullnode.testnet.sui.io:443"

# Logging
log_level: "info"

# Metrics
metrics:
  enabled: true
  port: 9184
EOF

echo "✓ Configuration created at $CONFIG_FILE"

# Step 8: Create run script
echo ""
echo "📝 Creating run script..."
cat > run-seal-key-server.sh << 'EOF'
#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required variables
if [ -z "$SEAL_MASTER_KEY" ]; then
    echo "❌ SEAL_MASTER_KEY not found in environment!"
    echo "Please run seal-key-server-local-setup.sh first"
    exit 1
fi

echo "🚀 Starting SEAL Key Server..."
echo "  Network: testnet"
echo "  Port: 2024"
echo "  Metrics: http://localhost:9184"
echo "  Health: http://localhost:2024/health"
echo ""

# Run the key server
cd ../seal-sdk
CONFIG_PATH=../personal_data_wallet/backend/config/seal-key-server-config.yaml \
MASTER_KEY=$SEAL_MASTER_KEY \
cargo run --release --bin key-server
EOF

chmod +x run-seal-key-server.sh

echo "✓ Run script created"

# Step 9: Update .env for the application
echo ""
echo "📝 Updating application configuration..."
echo "" >> $ENV_FILE
echo "# SEAL Integration Configuration" >> $ENV_FILE
echo "SEAL_NETWORK=testnet" >> $ENV_FILE
echo "SEAL_OPEN_MODE=true" >> $ENV_FILE
echo "SEAL_THRESHOLD=1" >> $ENV_FILE
echo "SEAL_SESSION_TTL_MIN=60" >> $ENV_FILE

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "  - Master key: Saved in .env"
echo "  - Public key: $MASTER_PUBKEY"
echo "  - Object ID: $KEY_SERVER_OBJECT_ID"
echo "  - Config: $CONFIG_FILE"
echo ""
echo "🚀 To run the key server:"
echo "  ./run-seal-key-server.sh"
echo ""
echo "🧪 To test the key server:"
echo "  curl http://localhost:2024/health"
echo ""
echo "📱 Your app is now configured to use this key server!"