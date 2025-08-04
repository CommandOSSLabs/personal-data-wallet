import { SessionKey, SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, toHEX } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';

async function debugSealFlow() {
  console.log('===============================================');
  console.log('Debugging Complete SEAL Flow');
  console.log('===============================================\n');

  const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  const CUSTOM_PACKAGE_ID = '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
  
  // Create test keypairs
  const userKeypair = new Ed25519Keypair();
  const userAddress = userKeypair.getPublicKey().toSuiAddress();
  const appKeypair = new Ed25519Keypair();
  const appAddress = appKeypair.getPublicKey().toSuiAddress();
  
  console.log('User Address:', userAddress);
  console.log('App Address:', appAddress);
  console.log('');

  try {
    // Initialize clients
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
    const sealClient = new SealClient({
      suiClient,
      serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({
        objectId: id,
        weight: 1,
      })),
    });

    // Step 1: Create identity for app-based encryption
    console.log('1. Creating identity for app-based encryption...');
    const identityString = `app:${userAddress}:${appAddress}`;
    const packageIdBytes = fromHEX(SEAL_PACKAGE_ID);
    const identityBytes = new TextEncoder().encode(identityString);
    const fullIdentity = new Uint8Array(packageIdBytes.length + identityBytes.length);
    fullIdentity.set(packageIdBytes, 0);
    fullIdentity.set(identityBytes, packageIdBytes.length);
    const identityHex = toHEX(fullIdentity);
    console.log('   Identity string:', identityString);
    console.log('   Identity hex:', identityHex);

    // Step 2: Encrypt data
    console.log('\n2. Encrypting data...');
    const testData = 'Secret data for app access';
    const dataBytes = new TextEncoder().encode(testData);
    
    const { encryptedObject, key: backupKey } = await sealClient.encrypt({
      threshold: 2,
      packageId: SEAL_PACKAGE_ID,
      id: identityHex,
      data: dataBytes,
    });
    
    console.log('   ✓ Data encrypted');
    console.log('   Encrypted size:', encryptedObject.length, 'bytes');
    console.log('   Backup key:', toHEX(backupKey));

    // Step 3: Create SessionKey for app
    console.log('\n3. Creating SessionKey for app...');
    const sessionKey = new SessionKey({
      address: appAddress,
      packageId: SEAL_PACKAGE_ID,
      ttlMin: 10,
      suiClient: suiClient,
    });
    
    const message = sessionKey.getPersonalMessage();
    console.log('   Personal message length:', message.length);
    console.log('   Personal message (hex):', Buffer.from(message).toString('hex'));

    // Step 4: App signs the message
    console.log('\n4. App signing personal message...');
    const { signature } = await appKeypair.signPersonalMessage(message);
    console.log('   ✓ Message signed');
    console.log('   Signature:', signature);

    // Step 5: Set signature on SessionKey
    console.log('\n5. Setting signature on SessionKey...');
    try {
      sessionKey.setPersonalMessageSignature(signature);
      console.log('   ✓ Signature set successfully');
    } catch (error: any) {
      console.log('   ✗ Failed to set signature:', error.message);
      return;
    }

    // Step 6: Build transaction for app-based approval
    console.log('\n6. Building transaction for seal_approve_app...');
    const tx = new Transaction();
    tx.moveCall({
      target: `${CUSTOM_PACKAGE_ID}::seal_access_control::seal_approve_app`,
      arguments: [
        tx.pure.vector("u8", fromHEX(identityHex)),
        tx.pure.address(appAddress),
      ],
    });
    
    const txBytes = await tx.build({ 
      client: suiClient, 
      onlyTransactionKind: true 
    });
    console.log('   ✓ Transaction built');
    console.log('   Transaction bytes length:', txBytes.length);

    // Step 7: Attempt to decrypt
    console.log('\n7. Attempting to decrypt...');
    try {
      const decryptedBytes = await sealClient.decrypt({
        data: encryptedObject,
        sessionKey,
        txBytes,
      });
      
      const decryptedText = new TextDecoder().decode(decryptedBytes);
      console.log('   ✓ Decryption successful!');
      console.log('   Decrypted text:', decryptedText);
    } catch (error: any) {
      console.log('   ✗ Decryption failed:', error.message);
      console.log('   Error stack:', error.stack);
    }

    // Step 8: Test session key caching issue
    console.log('\n8. Testing with fresh SessionKey (simulating API flow)...');
    const sessionKey2 = new SessionKey({
      address: appAddress,
      packageId: SEAL_PACKAGE_ID,
      ttlMin: 10,
      suiClient: suiClient,
    });
    
    const message2 = sessionKey2.getPersonalMessage();
    const { signature: signature2 } = await appKeypair.signPersonalMessage(message2);
    
    console.log('   Messages match:', Buffer.from(message).equals(Buffer.from(message2)));
    console.log('   Signatures match:', signature === signature2);
    
    try {
      sessionKey2.setPersonalMessageSignature(signature2);
      console.log('   ✓ Signature set on fresh SessionKey');
      
      const decryptedBytes2 = await sealClient.decrypt({
        data: encryptedObject,
        sessionKey: sessionKey2,
        txBytes,
      });
      
      console.log('   ✓ Decryption with fresh SessionKey successful!');
    } catch (error: any) {
      console.log('   ✗ Fresh SessionKey decrypt failed:', error.message);
    }

  } catch (error: any) {
    console.error('\nError:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the debug script
if (require.main === module) {
  debugSealFlow().catch(console.error);
}

export { debugSealFlow };