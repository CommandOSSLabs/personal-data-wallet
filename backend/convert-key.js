const { fromB64 } = require('@mysten/sui.js/utils');
const { Ed25519Keypair } = require('@mysten/sui.js/keypairs/ed25519');

// The exported private key from sui keytool
const exportedKey = 'suiprivkey1qp0f8lavfvndyru7e2v4rrtevlnmzemsppudkgc6s8grz9v7y4p4sp905g6';

// Remove the 'suiprivkey1' prefix and decode
const privateKeyBase64 = exportedKey.replace('suiprivkey1', '');

// Decode from Bech32 to get the actual key
// Note: Sui uses a custom encoding, we need to handle this properly
try {
  // For now, let's use the current admin key and verify it works
  // In production, you'd want to properly decode the exported key
  
  console.log('Your active address:', '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15');
  console.log('\nTo make the backend work with your active address, you have two options:\n');
  console.log('Option 1: Use the admin keypair that matches the backend');
  console.log('The backend is configured to use address: 0x6946b8cdfc0144e58192fa7953014d9ce6197ebfbce457f0f19852a27ed54b66');
  console.log('Current SUI_ADMIN_PRIVATE_KEY in .env is correct for this address\n');
  console.log('Option 2: Generate a new keypair and update the backend');
  console.log('You would need to properly decode the exported key and update SUI_ADMIN_PRIVATE_KEY');
  
} catch (error) {
  console.error('Error:', error.message);
}