require('dotenv').config();
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');

const privateKey = process.env.SUI_ADMIN_PRIVATE_KEY;
console.log('Private key from env:', privateKey);

try {
  // Clean up the private key and ensure it's in the right format
  let cleanKey = privateKey.replace(/\s+/g, ''); // Remove any whitespace
  
  if (!cleanKey.startsWith('0x')) {
    cleanKey = '0x' + cleanKey;
  }
  
  // Ensure it's the right length after removing 0x prefix
  const keyBuffer = Buffer.from(cleanKey.replace('0x', ''), 'hex');
  console.log('Key buffer length:', keyBuffer.length);
  
  const adminKeypair = Ed25519Keypair.fromSecretKey(keyBuffer);
  const adminAddress = adminKeypair.getPublicKey().toSuiAddress();
  console.log('Admin address:', adminAddress);
  console.log('\nExpected address:', '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15');
  console.log('Addresses match:', adminAddress === '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15');
} catch (error) {
  console.error('Error:', error.message);
}