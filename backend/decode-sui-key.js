const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');
const { decodeSuiPrivateKey } = require('@mysten/sui.js/cryptography');

// The exported private key from sui keytool
const exportedKey = 'suiprivkey1qp0f8lavfvndyru7e2v4rrtevlnmzemsppudkgc6s8grz9v7y4p4sp905g6';

try {
  // Decode the Sui private key
  const { secretKey } = decodeSuiPrivateKey(exportedKey);
  
  // Convert to hex format for the .env file
  const hexPrivateKey = '0x' + Buffer.from(secretKey).toString('hex');
  
  // Create keypair to verify
  const keypair = Ed25519Keypair.fromSecretKey(secretKey);
  const address = keypair.getPublicKey().toSuiAddress();
  
  console.log('Decoded Private Key Information:');
  console.log('================================');
  console.log('Address:', address);
  console.log('Expected:', '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15');
  console.log('Match:', address === '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15');
  console.log('\nPrivate Key (hex format for .env):');
  console.log(hexPrivateKey);
  console.log('\nUpdate your backend/.env file:');
  console.log('SUI_ADMIN_PRIVATE_KEY=' + hexPrivateKey);
  
} catch (error) {
  console.error('Error decoding key:', error.message);
}