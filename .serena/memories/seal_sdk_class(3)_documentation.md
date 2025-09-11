---

# Seal SDK Technical Document - Part 1: Classes (I - Z, continued) - Updated for `@mysten/sui`

Continuing our exhaustive breakdown of the `@mysten/seal` SDK's classes, this section provides in-depth details on their hierarchy, purpose, constructors, methods, and practical use cases. All code examples and references have been updated to use the latest `@mysten/sui` package, replacing the deprecated `@mysten/sui.js`.

---

## 12. InvalidKeyServerError

The `InvalidKeyServerError` is a base `InternalError` class for issues specifically related to the configuration or behavior of the Seal key servers. This error indicates that there's a problem with one or more of the key servers that the `SealClient` is configured to use, preventing proper interaction with them.

*   **Hierarchy**: `Error` -> `SealError` -> `InternalError` -> `InvalidKeyServerError`

*   **Description**:
    When an `InvalidKeyServerError` (or one of its more specific subclasses like `InvalidKeyServerVersionError`) is thrown, it signifies that the `SealClient` cannot establish a reliable, compliant connection or interaction with a key server. This is considered an `InternalError` because it typically stems from misconfiguration *within* the SDK's understanding of the key server network, rather than a direct issue with user data or permissions. Possible reasons include:
    *   A configured key server is unreachable or offline.
    *   A key server is responding with unexpected data formats.
    *   A key server's object ID or other identifying information is incorrect on-chain.
    *   General communication failures that are not explicitly `SealAPIError` (which covers HTTP response errors).

    Developers should verify their `KeyServerConfig` objects and the status of the configured key servers if they encounter this error.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A descriptive message indicating the specific issue with the key server.

*   **Methods**:
    `InvalidKeyServerError` inherits all methods from its parent classes and introduces no new methods.

*   **Use Case (Debugging key server configuration or reachability)**:

    ```typescript
    import { SealClient, InvalidKeyServerError, KeyServerConfig, SealClientOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function initializeClientWithCustomKeyServers(keyServers: KeyServerConfig[]) {
        let client: SealClient | null = null;
        try {
            const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
            const options: SealClientOptions = {
                network: 'testnet',
                client: suiClient,
                keyServers: keyServers, // Use custom (potentially problematic) key servers
            };
            client = new SealClient(options);
            console.log('SealClient initialized successfully with custom key servers.');
            return client;
        } catch (error) {
            if (error instanceof InvalidKeyServerError) {
                console.error(`Invalid Key Server Error: ${error.message}`);
                console.error(`  This indicates a problem with one of the configured key servers.`);
                console.error(`  Please verify their hostnames, object IDs, and ensure they are reachable and functioning correctly.`);
                console.error(error.stack);
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during client initialization: ${error.name} - ${error.message}`);
            }
        }
        return client;
    }

    // Example Usage
    const validKeyServers = [
        { hostname: 'key.mystenlabs.com', objectId: '0x...', protocol: 'https' as const }
    ];
    // initializeClientWithCustomKeyServers(validKeyServers);

    const invalidKeyServers = [
        { hostname: 'non-existent-server.com', objectId: '0x12345', protocol: 'https' as const } // Simulates unreachable server
    ];
    // initializeClientWithCustomKeyServers(invalidKeyServers); // This might lead to InvalidKeyServerError
    ```

---

## 13. InvalidKeyServerObjectIdError

The `InvalidKeyServerObjectIdError` is a specific `UserError` that occurs when the provided or configured Sui Object ID for a key server is syntactically incorrect, does not refer to an existing object on the blockchain, or refers to an object that is not a valid Seal Key Server.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidKeyServerObjectIdError`

*   **Description**:
    This error indicates a problem with the developer's configuration, specifically the `objectId` field within a `KeyServerConfig`. The `SealClient` relies on these Object IDs to find and verify the on-chain representation of the key servers. If the ID is invalid, the client cannot properly interact with the decentralized aspects of the Seal protocol.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message explaining that the provided key server object ID is invalid.

*   **Methods**:
    `InvalidKeyServerObjectIdError` inherits all methods from its parent classes and does not introduce new ones.

*   **Use Case (Validating key server object IDs in configuration)**:

    ```typescript
    import { SealClient, InvalidKeyServerObjectIdError, KeyServerConfig } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    function configureSealClient(keyServers: KeyServerConfig[]) {
        try {
            const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
            const client = new SealClient({
                network: 'testnet',
                client: suiClient,
                keyServers: keyServers,
            });
            console.log('SealClient configured successfully.');
            return client;
        } catch (error) {
            if (error instanceof InvalidKeyServerObjectIdError) {
                console.error(`Invalid Key Server Object ID Error: ${error.message}`);
                console.error(`  Please check the 'objectId' in your KeyServerConfig.`);
                console.error(`  Ensure it's a valid Sui Object ID and corresponds to a deployed Seal Key Server contract.`);
            } else if (error instanceof Error) {
                console.error(`Failed to configure SealClient: ${error.name} - ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage
    // Valid object ID (placeholder)
    const validConfig = [{ hostname: 'key.example.com', objectId: '0x0000000000000000000000000000000000000000000000000000000000000001', protocol: 'https' as const }];
    // configureSealClient(validConfig);

    // Invalid object ID (too short)
    const invalidConfig1 = [{ hostname: 'key.example.com', objectId: '0xabc', protocol: 'https' as const }];
    // configureSealClient(invalidConfig1);

    // Invalid object ID (syntactically correct but non-existent or wrong type)
    const invalidConfig2 = [{ hostname: 'key.example.com', objectId: '0x000000000000000000000000000000000000000000000000000000000000beef', protocol: 'https' as const }];
    // configureSealClient(invalidConfig2);
    ```

---

## 14. InvalidKeyServerVersionError

The `InvalidKeyServerVersionError` is an `InternalError` that occurs when the `SealClient` attempts to communicate with a key server whose protocol version is incompatible with the SDK's version. This means the key server might be running an older or newer version of the Seal protocol that the current SDK cannot properly understand or interact with.

*   **Hierarchy**: `Error` -> `SealError` -> `InternalError` -> `InvalidKeyServerError` -> `InvalidKeyServerVersionError`

*   **Description**:
    This error is a specific type of `InvalidKeyServerError`. It highlights a version mismatch between the client and the server. When this error is thrown, it typically suggests:
    *   The client SDK is outdated and needs to be updated to support the key server's newer protocol.
    *   The key server is outdated and needs to be upgraded to match the client SDK's expectations.
    *   A misconfiguration where a testnet client is trying to connect to a mainnet key server (or vice-versa) that happens to be running a different protocol version.

    This error prevents successful communication and operations, as the data formats or API endpoints might have changed between versions.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating the version incompatibility.

*   **Methods**:
    `InvalidKeyServerVersionError` inherits all methods from its parent classes and does not introduce new ones.

*   **Use Case (Addressing key server version compatibility issues)**:

    ```typescript
    import { SealClient, InvalidKeyServerVersionError } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function attemptSealOperation(sealClient: SealClient, someData: Uint8Array, identity: string) {
        try {
            console.log('Attempting Seal operation...');
            await sealClient.encrypt({ plaintext: someData, identity });
            console.log('Operation successful.');
        } catch (error) {
            if (error instanceof InvalidKeyServerVersionError) {
                console.error(`Key Server Version Mismatch Error: ${error.message}`);
                console.error(`  The key server you are connecting to uses an incompatible Seal protocol version.`);
                console.error(`  Action required: Ensure your '@mysten/seal' SDK is up-to-date, or verify that the key server is running a compatible version.`);
                // You might display a user-friendly message suggesting they update their application or contact support.
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during Seal operation: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage (assuming sealClient is initialized and configured to talk to a key server)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });
    // attemptSealOperation(sealClient, new TextEncoder().encode("hello"), "my-id");
    ```

---

## 15. InvalidMVRNameError

The `InvalidMVRNameError` is a `UserError` thrown when a Multi-Version Routine (MVR) name provided to a Seal SDK function is invalid. MVRs are used to reference specific versions of cryptographic routines or policies defined on-chain.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidMVRNameError`

*   **Description**:
    This error indicates that a string meant to identify a Multi-Version Routine does not conform to the expected format or refers to a non-existent MVR. MVRs allow for secure updates and evolution of cryptographic primitives and access policies without requiring all encrypted data to be re-encrypted. Providing an incorrect MVR name would prevent the SDK from finding the correct routine to perform encryption or decryption.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating that the MVR name is invalid.

*   **Methods**:
    `InvalidMVRNameError` inherits all methods from its parent classes and does not introduce new ones.

*   **Use Case (Validating MVR names in policy definitions or encryption options)**:

    ```typescript
    import { SealClient, InvalidMVRNameError, EncryptOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function encryptWithMVR(sealClient: SealClient, plaintext: Uint8Array, identity: string, mvrName: string) {
        try {
            console.log(`Attempting to encrypt with MVR: ${mvrName}`);
            // In a real scenario, EncryptOptions might include an 'mvrName' property.
            // For now, let's simulate where this error might arise if mvrName was an internal parameter.
            if (mvrName === "bad-mvr-name" || !mvrName.startsWith("seal_v")) { // Example validation
                throw new InvalidMVRNameError(`MVR name '${mvrName}' is not a valid format.`);
            }

            // A more realistic scenario would be if the SDK validates this during interaction
            // with the policy on-chain or key servers.
            const encryptedObject = await sealClient.encrypt({ plaintext, identity /*, mvrName: mvrName */ });
            console.log('Encryption successful with MVR.');
        } catch (error) {
            if (error instanceof InvalidMVRNameError) {
                console.error(`Invalid MVR Name Error: ${error.message}`);
                console.error(`  Please ensure the Multi-Version Routine name is correct and supported.`);
                console.error(`  Consult the Seal documentation for valid MVR naming conventions.`);
            } else if (error instanceof Error) {
                console.error(`An error occurred during encryption: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });
    // const plaintext = new TextEncoder().encode("data");

    // encryptWithMVR(sealClient, plaintext, "user-data", "seal_v1_encrypt"); // Example of a valid-looking MVR name
    // encryptWithMVR(sealClient, plaintext, "user-data", "bad-mvr-name"); // Simulates an invalid MVR name
    ```

---

## 16. InvalidPackageError

The `InvalidPackageError` is an `InternalError` indicating that a Sui package object, which the Seal SDK attempted to fetch or interact with, is either corrupted, malformed, or does not conform to the expected structure of a valid Seal-related Move package (e.g., a policy package).

*   **Hierarchy**: `Error` -> `SealError` -> `InternalError` -> `InvalidPackageError`

*   **Description**:
    Similar to `InvalidGetObjectError`, this error points to issues with on-chain data retrieval and validation, specifically concerning Sui packages. The Seal protocol relies on deployed Move packages for defining access policies and cryptographic routines. If these packages cannot be correctly interpreted by the SDK, operations depending on them will fail. Potential causes:
    *   The package ID used internally is incorrect or points to a non-existent package.
    *   The fetched package's byte code or structure is corrupted.
    *   The package, while valid on Sui, doesn't contain the expected modules or functions required by Seal.

    This error suggests a problem with the deployed Seal infrastructure on the Sui network or the SDK's ability to parse it.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message explaining why the package was deemed invalid.

*   **Methods**:
    `InvalidPackageError` inherits all methods from its parent classes and does not introduce new ones.

*   **Use Case (Troubleshooting on-chain package validation)**:

    ```typescript
    import { SealClient, InvalidPackageError, InternalError } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function checkSealPolicyPackage(sealClient: SealClient, packageId: string) {
        try {
            console.log(`Verifying Seal policy package: ${packageId}`);
            // Internally, SealClient verifies associated packages.
            // Simulate a failure for demonstration.
            if (packageId === "0xINVALID_PACKAGE_ID_STRUCTURE") {
                throw new InvalidPackageError(`Simulated: Package ${packageId} is structurally invalid.`);
            }
            // A real internal SDK call that could trigger this:
            // await sealClient.someInternalPolicyVerification(packageId);
            console.log(`Package ${packageId} appears valid for Seal operations.`);
        } catch (error) {
            if (error instanceof InvalidPackageError) {
                console.error(`Invalid Package Error: ${error.message}`);
                console.error(`  This indicates a problem with an on-chain Move package required by Seal.`);
                console.error(`  Verify the package ID and its integrity on the Sui network. It might be corrupted or not a valid Seal package.`);
                console.error(error.stack);
            } else if (error instanceof InternalError) {
                console.error(`A more general Internal Seal SDK error: ${error.name} - ${error.message}`);
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // checkSealPolicyPackage(sealClient, "0xVALID_SEAL_PACKAGE_ID");
    // checkSealPolicyPackage(sealClient, "0xINVALID_PACKAGE_ID_STRUCTURE"); // Simulates an invalid package
    ```

---

## 17. InvalidParameterError

The `InvalidParameterError` is a broad `UserError` indicating that one or more arguments provided to a Seal SDK function were invalid, either in type, format, or value, preventing the function from executing correctly.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidParameterError`

*   **Description**:
    This is one of the most common errors developers might encounter if inputs to SDK functions do not meet the expected requirements. It covers a wide range of issues, such as:
    *   Passing `null` or `undefined` to a required parameter.
    *   Providing a string when a `Uint8Array` is expected.
    *   Numeric parameters being out of valid range (e.g., a negative threshold).
    *   Invalid format for an `identity` string.

    When this error is thrown, the developer should review the function's signature and the documentation for its parameters to ensure correct usage.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A detailed message specifying which parameter was invalid and why.

*   **Methods**:
    `InvalidParameterError` inherits all methods from its parent classes and does not introduce new methods.

*   **Use Case (Validating function inputs)**:

    ```typescript
    import { SealClient, InvalidParameterError, EncryptOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function safeEncrypt(sealClient: SealClient, options: EncryptOptions) {
        try {
            console.log('Attempting encryption...');
            if (!options.plaintext || options.plaintext.length === 0) {
                throw new InvalidParameterError("Plaintext cannot be empty.");
            }
            if (typeof options.identity !== 'string' || options.identity.trim() === '') {
                throw new InvalidParameterError("Identity must be a non-empty string.");
            }

            const { encryptedObject } = await sealClient.encrypt(options);
            console.log('Encryption successful.');
            return encryptedObject;
        } catch (error) {
            if (error instanceof InvalidParameterError) {
                console.error(`Invalid Parameter Error: ${error.message}`);
                console.error(`  Please check the arguments passed to the function.`);
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during encryption: ${error.name} - ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // Valid call
    const validPlaintext = new TextEncoder().encode("My secret data.");
    // safeEncrypt(sealClient, { plaintext: validPlaintext, identity: "user-alice" });

    // Invalid call (empty plaintext)
    // safeEncrypt(sealClient, { plaintext: new Uint8Array(), identity: "user-bob" });

    // Invalid call (invalid identity type)
    // safeEncrypt(sealClient, { plaintext: validPlaintext, identity: null as any });
    ```

---

## 18. InvalidPersonalMessageSignatureError

The `InvalidPersonalMessageSignatureError` is a `UserError` thrown when a cryptographic signature provided for a "personal message" is found to be invalid or does not correctly verify against the associated public key and message content.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidPersonalMessageSignatureError`

*   **Description**:
    In the context of Seal, personal messages might be signed by a user or a `SessionKey` to prove ownership or authorization for certain actions. This error indicates a failure in that cryptographic verification step. Possible causes:
    *   The signature itself is malformed.
    *   The message content that was signed does not match the content being verified.
    *   The public key used for verification is incorrect.
    *   The signature algorithm used is incompatible.

    This error suggests a problem with how the signature was generated or how it's being presented for verification.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating that the personal message signature is invalid.

*   **Methods**:
    `InvalidPersonalMessageSignatureError` inherits all methods from its parent classes and does not introduce new ones.

*   **Use Case (Troubleshooting personal message authentication)**:

    ```typescript
    import { SessionKey, InvalidPersonalMessageSignatureError } from '@mysten/seal';
    import { Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function verifyPersonalMessage(sessionKey: SessionKey, message: Uint8Array, signature: Uint8Array) {
        try {
            console.log('Attempting to verify personal message signature...');
            // In a real SDK scenario, a verification method would internally handle this.
            // For demonstration, let's simulate the check.
            const verified = await sessionKey.getPublicKey().verify(message, signature);
            if (!verified) {
                throw new InvalidPersonalMessageSignatureError("Signature does not match message and public key.");
            }
            console.log('Personal message signature verified successfully.');
        } catch (error) {
            if (error instanceof InvalidPersonalMessageSignatureError) {
                console.error(`Invalid Personal Message Signature Error: ${error.message}`);
                console.error(`  The signature provided for the personal message is invalid.`);
                console.error(`  Ensure the message, signature, and public key are all correct and unchanged.`);
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during verification: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage
    // const keypair = Ed25519Keypair.generate();
    // const senderAddress = keypair.getPublicKey().toSuiAddress();
    // const sessionKey = await SessionKey.new({ secretKey: keypair.getSecretKey(), sender: senderAddress });
    // const message = new TextEncoder().encode("Hello Seal!");

    // const goodSignature = await sessionKey.signPersonalMessage(message);
    // await verifyPersonalMessage(sessionKey, message, goodSignature);

    // const badSignature = new Uint8Array(goodSignature.length).fill(0); // A corrupted signature
    // await verifyPersonalMessage(sessionKey, message, badSignature);
    ```

---

## 19. InvalidPTBError

The `InvalidPTBError` is a `UserError` indicating that a Programmable Transaction Block (PTB) provided to the Seal SDK (or generated by it and found to be invalid) is malformed, syntactically incorrect, or logically unsound according to Sui's rules or Seal's expectations.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidPTBError`

*   **Description**:
    Seal operations might involve constructing or interacting with Programmable Transaction Blocks, especially for on-chain policy enforcement or key server interactions that require Sui transactions. This error is thrown when a PTB fails validation. Causes could include:
    *   Incorrect transaction kind or arguments within the PTB.
    *   Invalid object IDs referenced within the PTB.
    *   Attempts to sign or execute a PTB that is inherently invalid according to Sui's transaction rules.
    *   A PTB that doesn't adhere to the specific structure required for Seal-related on-chain operations.

    Developers should meticulously review the structure of any PTBs they are constructing or passing to the SDK when this error arises.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message detailing why the PTB was deemed invalid.

*   **Methods**:
    `InvalidPTBError` inherits all methods from its parent classes and does not introduce new ones.

*   **Use Case (Troubleshooting invalid Programmable Transaction Blocks)**:

    ```typescript
    import { SealClient, InvalidPTBError, SessionKey } from '@mysten/seal';
    import { SuiClient, TransactionBlock, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function executeSealRelatedPTB(sealClient: SealClient, sessionKey: SessionKey, ptb: TransactionBlock) {
        try {
            console.log('Attempting to sign and execute PTB...');
            // In a real scenario, the SDK might build a PTB internally or take one as input
            // For demonstration, let's simulate an invalid PTB scenario.
            if (ptb.blockData.transactions.length === 0) {
                 throw new InvalidPTBError("PTB must contain at least one transaction.");
            }

            const { signature, transactionBlockBytes } = await sessionKey.signTransactionBlock(ptb);

            // In a real app, you'd then submit the transaction to Sui.
            // const txResult = await suiClient.executeTransactionBlock({
            //     transactionBlock: transactionBlockBytes,
            //     signature,
            //     options: { showEffects: true, showEvents: true },
            // });
            console.log('PTB successfully signed (and would be executed).');
        } catch (error) {
            if (error instanceof InvalidPTBError) {
                console.error(`Invalid PTB Error: ${error.message}`);
                console.error(`  The Programmable Transaction Block provided is invalid or malformed.`);
                console.error(`  Review the PTB's structure and contents against Sui's transaction rules and Seal's requirements.`);
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during PTB processing: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const sessionKey = await SessionKey.new({ sender: keypair.getPublicKey().toSuiAddress() });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // Valid PTB example (simple transfer)
    // const validPtB = new TransactionBlock();
    // validPtB.transferObjects([validPtB.gas], validPtB.pure("0x2", "address"));
    // executeSealRelatedPTB(sealClient, sessionKey, validPtB);

    // Invalid PTB example (empty)
    // const invalidPtB = new TransactionBlock();
    // executeSealRelatedPTB(sealClient, sessionKey, invalidPtB);
    ```

---

## 20. InvalidSDKVersionError

The `InvalidSDKVersionError` is a base `UserError` for issues related to the version of the Seal SDK being used. It acts as a parent for more specific version-related errors like `DeprecatedSDKVersionError`.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidSDKVersionError`

*   **Description**:
    This error class is used when the SDK detects that its own version is somehow problematic for current operations or compatibility with key servers and on-chain policies. It's a `UserError` because the solution typically involves the developer updating their SDK package.

    While `DeprecatedSDKVersionError` specifically indicates an older, no-longer-supported version, `InvalidSDKVersionError` could theoretically encompass other version-related issues, such as future compatibility checks or detecting a malformed version string in internal checks (though `DeprecatedSDKVersionError` is the most common child).

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message detailing the SDK version issue.

*   **Methods**:
    `InvalidSDKVersionError` inherits all methods from its parent classes and does not introduce new methods.

*   **Use Case (Generic handling of SDK version issues)**:

    ```typescript
    import { SealClient, InvalidSDKVersionError, DeprecatedSDKVersionError } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function initializeAndHandleVersion(clientOptions: any) {
        let client: SealClient | null = null;
        try {
            client = new SealClient(clientOptions);
            console.log('SealClient initialized.');
        } catch (error) {
            if (error instanceof InvalidSDKVersionError) {
                console.error(`SDK Version Problem: ${error.message}`);
                console.error(`  Your current @mysten/seal SDK version may be incompatible.`);
                console.error(`  Please consider updating to the latest stable version.`);
                if (error instanceof DeprecatedSDKVersionError) {
                    console.error("  Specifically, this version is deprecated and should be updated promptly for security and functionality.");
                }
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during initialization: ${error.name} - ${error.message}`);
            }
        }
        return client;
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // // Simulating options that might trigger the error (actual SDK behavior determines this)
    // const clientOptions = { network: 'testnet', client: suiClient };
    // initializeAndHandleVersion(clientOptions);
    ```

---

## 21. InvalidSessionKeySignatureError

The `InvalidSessionKeySignatureError` is a `UserError` thrown when a cryptographic signature provided by or related to a `SessionKey` is found to be invalid. This means the signature does not correctly verify against the message it claims to sign and the `SessionKey`'s public key.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidSessionKeySignatureError`

*   **Description**:
    Session keys are crucial for authorizing operations in Seal without requiring the user's primary wallet signature for every action. They sign messages or transaction blocks on behalf of the user. This error specifically indicates that a signature generated by (or claimed to be from) a `SessionKey` is cryptographically incorrect. Potential causes include:
    *   **Tampering**: The signature or the signed message has been altered after signing.
    *   **Incorrect Key**: The signature was generated by a different key than the one being used for verification.
    *   **Software Bug**: A bug in the application's signature generation or verification logic.
    *   **Network Issue**: Data corruption during transmission of the signature or message.

    When this error occurs, it directly impacts the ability to authenticate actions performed with the `SessionKey`.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message detailing why the session key signature was deemed invalid.

*   **Methods**:
    `InvalidSessionKeySignatureError` inherits all methods from its parent classes and introduces no new methods.

*   **Use Case (Handling problematic session key signatures)**:

    ```typescript
    import { SealClient, SessionKey, InvalidSessionKeySignatureError, EncryptedObject } from '@mysten/seal';
    import { Ed25519Keypair } from '@mysten/sui'; // Updated import
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function authorizeAndDecrypt(
        sealClient: SealClient,
        sessionKey: SessionKey,
        encryptedObject: EncryptedObject,
        identity: string
    ) {
        try {
            console.log('Attempting decryption with session key authorization...');
            // The SDK will internally use the sessionKey to sign requests to key servers.
            // If the signature generated by the sessionKey or verified by the key server is invalid,
            // this error could be thrown.
            const decryptedData = await sealClient.decrypt({
                encryptedObject: encryptedObject,
                identity: identity,
                sessionKey: sessionKey,
            });
            console.log('Decryption successful:', new TextDecoder().decode(decryptedData));
        } catch (error) {
            if (error instanceof InvalidSessionKeySignatureError) {
                console.error(`Invalid Session Key Signature Error: ${error.message}`);
                console.error(`  The signature provided by the session key is invalid.`);
                console.error(`  This could mean the session key is compromised, or there's a problem with signature generation/verification.`);
                // Prompt user to generate a new session key, re-login, or investigate tampering.
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage (assuming valid encryptedObject and sealClient setup)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const senderAddress = keypair.getPublicKey().toSuiAddress();
    // const sessionKey = await SessionKey.new({ sender: senderAddress });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // // Simulate an invalid session key or signature (highly complex to do externally, usually internal SDK check)
    // // For demonstration, if we had a way to provide a broken sessionKey:
    // // const brokenSessionKey = { ...sessionKey, sign: () => { throw new Error("Simulated bad signature"); } };
    // // authorizeAndDecrypt(sealClient, brokenSessionKey, myEncryptedObject, "doc-id");
    // // In most cases, this error is thrown by the SDK's internal verification logic.
    ```

---

## 22. InvalidThresholdError

The `InvalidThresholdError` is a `UserError` thrown when a cryptographic threshold value provided is incorrect. In threshold encryption, the threshold specifies the minimum number of participants (e.g., key servers) required to collectively perform an operation (like decryption).

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidThresholdError`

*   **Description**:
    This error indicates that the provided `threshold` value does not meet the necessary mathematical or logical constraints. Typically, a valid threshold `t` must satisfy `1 <= t <= n`, where `n` is the total number of participants or shares. Common reasons for this error include:
    *   `threshold` is less than 1 (meaning no shares are needed, which defeats the purpose).
    *   `threshold` is greater than the total number of available shares or key servers (making the operation impossible).
    *   `threshold` is not an integer.

    Correctly setting the threshold is crucial for the security and liveness properties of the threshold encryption scheme.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message detailing why the threshold value was invalid.

*   **Methods**:
    `InvalidThresholdError` inherits all methods from its parent classes and does not introduce new methods.

*   **Use Case (Ensuring valid threshold values)**:

    ```typescript
    import { SealClient, InvalidThresholdError, GetDerivedKeysOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function getKeysWithThreshold(
        sealClient: SealClient,
        serviceObjectIds: string[],
        threshold: number
    ) {
        try {
            console.log(`Attempting to get derived keys with threshold: ${threshold}`);
            const derivedKeys = await sealClient.getDerivedKeys({
                services: serviceObjectIds,
                threshold: threshold,
            });
            console.log(`Successfully retrieved ${derivedKeys.size} derived keys.`);
        } catch (error) {
            if (error instanceof InvalidThresholdError) {
                console.error(`Invalid Threshold Error: ${error.message}`);
                console.error(`  The specified threshold (${threshold}) is invalid.`);
                console.error(`  Ensure it is a positive integer not exceeding the total number of available services.`);
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage (assuming a configured SealClient and some service object IDs)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });
    // const someServiceIds = ['0xservice1', '0xservice2', '0xservice3'];

    // // Valid threshold (e.g., 2 out of 3)
    // getKeysWithThreshold(sealClient, someServiceIds, 2);

    // // Invalid threshold (too high)
    // getKeysWithThreshold(sealClient, someServiceIds, 5); // Will throw InvalidThresholdError

    // // Invalid threshold (zero)
    // getKeysWithThreshold(sealClient, someServiceIds, 0); // Will throw InvalidThresholdError
    ```

---

## 23. InvalidUserSignatureError

The `InvalidUserSignatureError` is a `UserError` thrown when a cryptographic signature, typically from the user's primary wallet (e.g., for signing a session key or an initial authorization), is found to be invalid. This is distinct from `InvalidPersonalMessageSignatureError` which covers a broader range of signed messages, but the underlying cause is similar: a signature verification failure.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidUserSignatureError`

*   **Description**:
    When the SDK performs an operation that requires a signature directly from the user's wallet (e.g., signing a `SessionKey` for a long-lived session), this error is thrown if the provided signature cannot be verified against the user's public key and the signed content. This suggests:
    *   The user's signature was corrupted during transmission.
    *   The content that was signed locally does not match what the server or SDK is trying to verify.
    *   A mismatch between the public key and the signature.

    This error directly impacts the ability to establish user authentication or authorize critical on-chain operations.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message detailing why the user's signature was invalid.

*   **Methods**:
    `InvalidUserSignatureError` inherits all methods from its parent classes and does not introduce new methods.

*   **Use Case (Handling user authentication failures)**:

    ```typescript
    import { SessionKey, InvalidUserSignatureError } from '@mysten/seal';
    import { Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function createSessionKeyWithUserAuth(userKeypair: Ed25519Keypair, senderAddress: string) {
        try {
            console.log('Attempting to create a new session key with user authentication...');
            // SessionKey.new requires the user's sender address, and internally might rely on
            // a signature for certain key server interactions.
            const sessionKey = await SessionKey.new({ sender: senderAddress /*, optional: userSignature */ });
            console.log('Session Key created successfully.');
            return sessionKey;
        } catch (error) {
            if (error instanceof InvalidUserSignatureError) {
                console.error(`Invalid User Signature Error: ${error.message}`);
                console.error(`  The signature provided by the user's wallet is invalid.`);
                console.error(`  Please ensure the user's wallet is correctly connected and providing valid signatures.`);
                // Prompt user to reconnect wallet, sign again, or troubleshoot their wallet.
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred: ${error.name} - ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage
    // const userKeypair = Ed25519Keypair.generate(); // Simulates user's wallet keypair
    // const senderAddress = userKeypair.getPublicKey().toSuiAddress();
    // createSessionKeyWithUserAuth(userKeypair, senderAddress);
    ```

---

## 24. NoAccessError

The `NoAccessError` is thrown when the Seal key servers explicitly deny access to a requested resource (e.g., decryption keys for a specific identity). This indicates that the current user or `SessionKey` lacks the necessary permissions according to the on-chain Seal policy.

*   **Hierarchy**: `Error` -> `SealError` -> `NoAccessError`

*   **Description**:
    This error is a direct result of the decentralized access control policies enforced by Seal. When a `fetchKeys` or `decrypt` request is made, the key servers consult the on-chain policy associated with the `identity`. If the authenticated user or `SessionKey` does not satisfy the conditions defined in that policy (e.g., they are not a member of a required group, they don't hold a specific NFT, or a time-lock has not expired), the request is rejected, and `NoAccessError` is thrown.

    This is a critical error for access-controlled applications and should be handled by informing the user why access was denied and, if possible, guiding them on how to gain access (e.g., "You need to purchase this NFT to view this content").

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message explaining that access was denied.

*   **Methods**:
    `NoAccessError` inherits all methods from its parent classes and introduces no new methods.

*   **Use Case (Handling denied access by policy)**:

    ```typescript
    import { SealClient, SessionKey, NoAccessError, EncryptedObject, DecryptOptions } from '@mysten/seal';
    import { SuiClient, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function tryAccessProtectedContent(
        sealClient: SealClient,
        sessionKey: SessionKey,
        encryptedContent: EncryptedObject,
        contentIdentity: string
    ) {
        try {
            console.log(`Attempting to access protected content for identity: ${contentIdentity}`);
            const decryptedData = await sealClient.decrypt({
                encryptedObject: encryptedContent,
                identity: contentIdentity,
                sessionKey: sessionKey,
            });
            console.log('Access granted. Decrypted content:', new TextDecoder().decode(decryptedData));
        } catch (error) {
            if (error instanceof NoAccessError) {
                console.error(`Access Denied: ${error.message}`);
                console.error(`  You do not have the required permissions to decrypt this content.`);
                console.error(`  Please check the access policy for '${contentIdentity}' on the Sui blockchain.`);
                // Display a user-friendly message, e.g.:
                // "You need to own the 'PremiumMembershipNFT' to view this article."
                // "This content will unlock after [timestamp]."
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during access attempt: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage (assuming valid encryptedContent and sealClient setup)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const senderAddress = keypair.getPublicKey().toSuiAddress();
    // const sessionKey = await SessionKey.new({ sender: senderAddress });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // // Assume 'private-doc-id' has a policy that 'senderAddress' does not meet
    // // tryAccessProtectedContent(sealClient, sessionKey, myEncryptedObject, "private-doc-id");
    ```

---

## 25. SealClient

The `SealClient` is the primary and most important class in the `@mysten/seal` SDK. It serves as the main interface for applications to interact with the Seal protocol, facilitating client-side encryption, decryption, and key management operations. It abstracts away the complexities of threshold cryptography and communication with Seal key servers.

*   **Hierarchy**: (No inheritance from custom SealError classes, it's a core functional class)

*   **Description**:
    The `SealClient` is designed to be the central point for developers needing to integrate decentralized secrets management into their Sui applications. It bridges your application with the on-chain Seal policies and the off-chain key servers. Key responsibilities include:
    *   **Encryption**: Taking plaintext and an identity, and returning an `EncryptedObject`.
    *   **Decryption**: Taking an `EncryptedObject` and an identity, fetching necessary shares from key servers, and reconstructing the plaintext.
    *   **Key Management**: Caching public and derived keys, and coordinating with key servers.
    *   **Authorization**: Utilizing `SessionKey` instances to authorize requests to key servers.
    *   **Network Interaction**: Handling communication with Sui RPC for on-chain policy checks and with Seal key servers for cryptographic operations.

*   **Constructor**:
    `constructor(options: SealClientOptions)`
    *   **`options: SealClientOptions`**: A required object that configures the client's behavior and dependencies.
        *   `options.client`: `SealCompatibleClient` (Required) - An instance of a Sui client (e.g., `@mysten/sui/client/SuiClient`) that can sign personal messages and transaction blocks. This is used by the `SealClient` for on-chain interactions and user authentication.
        *   `options.network`: `"mainnet"` | `"testnet"` | `"devnet"` (Required) - Specifies which Sui network the client will operate on. This determines the default set of allowlisted key servers and relevant on-chain IDs.
        *   `options.keyServers`: `KeyServerConfig[]` (Optional) - An array of `KeyServerConfig` objects. If provided, these custom key servers will be used. If omitted, the `SealClient` will automatically use the default allowlisted key servers for the specified `network`.

*   **Methods**:

    *   ### `decrypt(namedParameters: DecryptOptions): Promise<Uint8Array>`
        Decrypts an encrypted object back into its original plaintext bytes.
        *   **Parameters**: `namedParameters: DecryptOptions`
            *   `namedParameters.encryptedObject`: `EncryptedObject` - The encrypted data blob to decrypt.
            *   `namedParameters.identity`: `string` - The identifier under which the data was encrypted, corresponding to a Seal policy.
            *   `namedParameters.sessionKey`: `SessionKey` (Optional) - An authorized `SessionKey` to prove access rights to the key servers. If not provided, the client might attempt to use a default or assume anonymous access if the policy allows.
            *   `namedParameters.checkConsistency`: `boolean` (Optional) - Defaults to `false`. If `true`, the SDK will perform an extra check to ensure that all successfully retrieved decryption shares are consistent. This is crucial for applications where a single, agreed-upon plaintext is required (e.g., voting). If inconsistencies are found, a `DecryptionError` will be thrown.
        *   **Returns**: `Promise<Uint8Array>` - A promise that resolves to the decrypted plaintext as a `Uint8Array`.
        *   **Throws**: `DecryptionError`, `NoAccessError`, `InvalidCiphertextError`, `SealAPIError`, `InconsistentKeyServersError`, `ExpiredSessionKeyError`, and other `SealError` subclasses.
        *   **Use Case**: Retrieving confidential user data, unlocking gated content, or revealing sealed bids.
            ```typescript
            const decryptedSecret = await sealClient.decrypt({
                encryptedObject: myEncryptedSecret,
                identity: "my-vault-id",
                sessionKey: myActiveSessionKey,
                checkConsistency: true,
            });
            console.log("Decrypted secret:", new TextDecoder().decode(decryptedSecret));
            ```

    *   ### `encrypt(namedParameters: EncryptOptions): Promise<{ encryptedObject: EncryptedObject; symmetricKey: Uint8Array; }>`
        Encrypts a plaintext message under a specified identity, making it decryptable only by those authorized by the identity's on-chain Seal policy.
        *   **Parameters**: `namedParameters: EncryptOptions`
            *   `namedParameters.plaintext`: `Uint8Array` - The data to be encrypted.
            *   `namedParameters.identity`: `string` - The identifier (e.g., a Sui object ID or a custom string) that will be associated with the encrypted data and its access policy.
            *   `namedParameters.sessionKey`: `SessionKey` (Optional) - An authorized `SessionKey`. Used to sign the encryption request if required by key server policies.
        *   **Returns**: `Promise<{ encryptedObject: EncryptedObject; symmetricKey: Uint8Array; }>` - A promise that resolves to an object containing:
            *   `encryptedObject`: The `EncryptedObject` structure ready for storage.
            *   `symmetricKey`: The ephemeral 256-bit symmetric key used for this specific encryption. This key is returned for backup or immediate local use, but should be handled with extreme care as it bypasses the Seal access control if compromised.
        *   **Throws**: `SealAPIError`, `InvalidParameterError`, and other `SealError` subclasses.
        *   **Use Case**: Storing sensitive user data on decentralized storage, creating encrypted messages, or protecting private NFT metadata.
            ```typescript
            const message = new TextEncoder().encode("Hello, confidential world!");
            const { encryptedObject, symmetricKey } = await sealClient.encrypt({
                plaintext: message,
                identity: "my-private-chat-id-123",
                sessionKey: myActiveSessionKey,
            });
            // Store encryptedObject in IPFS, Arweave, etc.
            console.log("Encrypted object stored:", encryptedObject);
            // symmetricKey should be carefully secured or discarded after use.
            ```

    *   ### `fetchKeys(namedParameters: FetchKeysOptions): Promise<void>`
        Fetches and caches decryption keys from the configured key servers for specified identities and/or encrypted objects. This method is crucial for performance, as it allows for batch fetching of keys rather than fetching them individually per decryption.
        *   **Parameters**: `namedParameters: FetchKeysOptions`
            *   `namedParameters.identities`: `string[]` (Optional) - An array of string identifiers. The `SealClient` will attempt to fetch decryption keys for each specified identity.
            *   `namedParameters.encryptedObjects`: `EncryptedObject[]` (Optional) - An array of `EncryptedObject`s for which to pre-fetch keys. The client extracts identities from these objects.
            *   `namedParameters.sessionKey`: `SessionKey` (Optional) - An authorized `SessionKey` for the requests.
        *   **Returns**: `Promise<void>` - A promise that resolves when the key fetching and caching process is complete.
        *   **Throws**: `SealAPIError`, `NoAccessError`, `InconsistentKeyServersError`, `TooManyFailedFetchKeyRequestsError`, and other `SealError` subclasses.
        *   **Use Case**: Loading an inbox of encrypted messages, preparing for decryption of multiple files, or pre-warming the client's key cache for a user session.
            ```typescript
            // On app startup or user login
            await sealClient.fetchKeys({
                identities: ["user-vault-id", "project-docs-id"],
                sessionKey: myActiveSessionKey,
            });
            // Now subsequent decrypt calls for these identities will be faster.
            ```

    *   ### `getDerivedKeys(namedParameters: GetDerivedKeysOptions): Promise<Map<string, Uint8Array>>`
        Retrieves already derived keys from the client's internal cache. This method does **not** fetch keys from key servers; it only returns keys that have already been successfully obtained via `fetchKeys` or during a prior `decrypt` call.
        *   **Parameters**: `namedParameters: GetDerivedKeysOptions`
            *   `namedParameters.services`: `string[]` - An array of "service object IDs" (which are typically the `objectId` of the key server or related on-chain service) for which to retrieve derived keys.
            *   `namedParameters.threshold`: `number` - The minimum number of derived keys (from the `services` list) that must be available in the cache for the operation to be considered successful. If fewer than `threshold` keys are found, an `InvalidThresholdError` might be thrown. This corresponds to the `t` in a *t-out-of-n* threshold scheme.
        *   **Returns**: `Promise<Map<string, Uint8Array>>` - A promise that resolves to a Map where keys are service object IDs (`string`) and values are the derived key shares (`Uint8Array`).
        *   **Throws**: `InvalidThresholdError` if the threshold is invalid, or if fewer than `threshold` keys are available.
        *   **Use Case**: Advanced scenarios where an application needs direct access to the derived key shares for debugging, auditing, or custom cryptographic operations (though generally discouraged unless truly necessary for specific protocol extensions).
            ```typescript
            // After a successful fetchKeys or decrypt operation
            const keyServerIds = sealClient.getKeyServers().keys(); // Get IDs of all configured key servers
            try {
                const derivedKeyShares = await sealClient.getDerivedKeys({
                    services: Array.from(keyServerIds),
                    threshold: 2 // Assuming a 2-out-of-N threshold
                });
                console.log("Derived key shares obtained:", derivedKeyShares);
            } catch (e) {
                console.error("Could not get enough derived keys from cache:", e);
            }
            ```

    *   ### `getKeyServers(): Map<string, KeyServerConfig>`
        Retrieves the map of key servers currently configured and known by the `SealClient`.
        *   **Parameters**: None.
        *   **Returns**: `Map<string, KeyServerConfig>` - A map where keys are the hostnames (`string`) of the key servers and values are their `KeyServerConfig` objects.
        *   **Throws**: None.
        *   **Use Case**: Inspecting the client's configuration, debugging, or dynamically updating UI based on available key servers.
            ```typescript
            const configuredKeyServers = sealClient.getKeyServers();
            console.log("Configured Key Servers:");
            configuredKeyServers.forEach((config, hostname) => {
                console.log(`  ${hostname}: Object ID = ${config.objectId}, Protocol = ${config.protocol}`);
            });
            ```

    *   ### `getPublicKeys(services: string[]): Promise<Map<string, Uint8Array>>`
        Retrieves the public keys for the specified Seal key server services. If the public keys are not already in the client's cache, they will be fetched from the key servers themselves.
        *   **Parameters**: `services: string[]` - An array of "service object IDs" (typically the `objectId` of key servers) for which to retrieve public keys.
        *   **Returns**: `Promise<Map<string, Uint8Array>>` - A promise that resolves to a Map where keys are the service object IDs (`string`) and values are the public keys (`Uint8Array`) of those services.
        *   **Throws**: `SealAPIError`, `InvalidKeyServerError`, and other `SealError` subclasses if fetching fails.
        *   **Use Case**: For advanced protocol interactions or auditing where the public keys of the key servers are needed (e.g., verifying server-side operations, constructing new cryptographic schemes that interact with Seal).
            ```typescript
            const myKeyServerObjectIds = ['0xservice1', '0xservice2']; // From your configuration
            const serverPublicKeys = await sealClient.getPublicKeys(myKeyServerObjectIds);
            console.log("Key Server Public Keys:", serverPublicKeys);
            ```

    *   ### `static asClientExtension(options: SealClientExtensionOptions): { sealClient: SealClient; }`
        A static factory method to create an object that can register the `SealClient` as an extension to a compatible client (e.g., a Sui Wallet Adapter).
        *   **Parameters**: `options: SealClientExtensionOptions`
            *   `options.rpcClient`: `JsonRpcProvider` - The RPC provider instance from a compatible Sui client.
            *   `options.sealClient`: `SealClient` - The initialized `SealClient` instance to be registered as an extension.
        *   **Returns**: `{ sealClient: SealClient; }` - An object containing the `SealClient` instance, structured in a way that allows it to be integrated as an extension.
        *   **Throws**: No specific errors documented here, but underlying initialization errors could occur.
        *   **Use Case**: Integrating Seal functionality directly into existing Sui wallet or client contexts, allowing dApps to seamlessly call Seal methods through a unified client object.
            ```typescript
            import { JsonRpcProvider } from '@mysten/sui/client'; // Updated import

            // Assuming `suiClient` is your SuiClient instance
            // and `mySealClient` is an initialized SealClient instance
            // This is a pattern for some wallet adapters to register new capabilities.
            // For example, if your client library supports a `registerExtension` method:
            // suiClient.registerExtension(SealClient.asClientExtension({
            //     rpcClient: suiClient.rpc, // Assuming SuiClient exposes its RPC provider via .rpc
            //     sealClient: mySealClient,
            // }));
            // After registration, you might access it like: suiClient.seal.encrypt(...)
            ```

---

## 26. SessionKey

The `SessionKey` class represents a temporary, client-side cryptographic key pair (an ephemeral key) used for signing operations on behalf of a user. It's designed to provide a more convenient and efficient way to authorize requests to Seal key servers and other on-chain interactions without constantly prompting the user's primary wallet.

*   **Hierarchy**: (No inheritance from custom SealError classes, it's a core functional class)

*   **Description**:
    `SessionKey` instances are crucial for user experience in Seal-enabled applications. Instead of requiring the user to sign every single API request to key servers (which can be numerous during a session), a `SessionKey` is created once (often with an initial signature from the user's main wallet) and then used for subsequent authorizations until it expires.
    Key features:
    *   **Ephemeral Nature**: They have a limited lifespan (`expiry`).
    *   **Delegated Authority**: They act on behalf of a `sender` (the user's address).
    *   **Signing Capabilities**: They can sign personal messages and transaction blocks.

*   **Constructor**:
    `constructor(namedParameters: { sessionKey: ExportedSessionKey; sender: string })`
    *   **`namedParameters.sessionKey: ExportedSessionKey`**: An object containing the public key, secret key, and expiry of an already existing session key. This is typically used to re-instantiate a `SessionKey` from a stored or passed-around `ExportedSessionKey`.
    *   **`namedParameters.sender: string`**: The Sui address of the user (the owner) on whose behalf this session key will operate.

*   **Methods**:

    *   ### `getPublicKey(): PublicKey`
        Retrieves the public key associated with this session key.
        *   **Parameters**: None.
        *   **Returns**: `PublicKey` - The public key object, typically from `@mysten/sui/cryptography`.
        *   **Use Case**: For internal SDK verification or for displaying the session key's public address (though typically less relevant to the end-user than their main wallet address).
            ```typescript
            const pubKey = mySessionKey.getPublicKey();
            console.log("Session Key Public Address:", pubKey.toSuiAddress());
            ```

    *   ### `isExpired(): boolean`
        Checks if the session key has passed its expiry time.
        *   **Parameters**: None.
        *   **Returns**: `boolean` - `true` if the session key's expiry timestamp is in the past, `false` otherwise.
        *   **Use Case**: Proactively checking session key validity before making authenticated requests to avoid `ExpiredSessionKeyError`.
            ```typescript
            if (mySessionKey.isExpired()) {
                console.log("Session key has expired. Please refresh your session.");
                // Prompt re-authentication
            } else {
                console.log("Session key is still active.");
            }
            ```

    *   ### `static new(namedParameters: { secretKey?: Uint8Array; sender: string; expiry?: number }): Promise<SessionKey>`
        A static factory method to create a *new* `SessionKey` instance. This is the primary way to generate a fresh session key.
        *   **Parameters**: `namedParameters`
            *   `namedParameters.secretKey`: `Uint8Array` (Optional) - The raw bytes of a secret key to use. If not provided, a new random secret key will be generated internally.
            *   `namedParameters.sender`: `string` (Required) - The Sui address of the user who owns this session key.
            *   `namedParameters.expiry`: `number` (Optional) - The expiry timestamp for the session key, in milliseconds since the Unix epoch. If not provided, a default expiry (e.g., 24 hours from creation) is typically used.
        *   **Returns**: `Promise<SessionKey>` - A promise that resolves to the newly created `SessionKey` instance.
        *   **Throws**: `InvalidParameterError` if `sender` is invalid, etc.
        *   **Use Case**: User login flows where a session needs to be established, or for creating short-lived, single-use keys.
            ```typescript
            const userAddress = '0x...'; // User's main Sui address
            const twoHoursLater = Date.now() + (2 * 60 * 60 * 1000);
            const newSessionKey = await SessionKey.new({
                sender: userAddress,
                expiry: twoHoursLater,
            });
            console.log("New Session Key created with expiry:", new Date(newSessionKey.expiry));
            ```

    *   ### `sign(bytes: Uint8Array): Promise<Uint8Array>`
        Signs a raw byte array with the session key. This is a low-level signing method.
        *   **Parameters**: `bytes: Uint8Array` - The byte array to sign.
        *   **Returns**: `Promise<Uint8Array>` - A promise that resolves to the signature as a `Uint8Array`.
        *   **Throws**: `ExpiredSessionKeyError` if expired.
        *   **Use Case**: Internal SDK usage for signing requests, or for advanced scenarios requiring custom message signing beyond standard PTBs or personal messages.
            ```typescript
            const dataToSign = new TextEncoder().encode("Prove I am using this session.");
            const signature = await mySessionKey.sign(dataToSign);
            console.log("Raw data signature:", signature);
            ```

    *   ### `signPersonalMessage(message: Uint8Array): Promise<Uint8Array>`
        Signs a personal message (as a byte array) with the session key. These messages are typically used for off-chain authentication challenges.
        *   **Parameters**: `message: Uint8Array` - The message bytes to sign.
        *   **Returns**: `Promise<Uint8Array>` - A promise that resolves to the signature.
        *   **Throws**: `ExpiredSessionKeyError` if expired.
        *   **Use Case**: Proving ownership of the session key or confirming user intent for off-chain actions.
            ```typescript
            const loginChallenge = new TextEncoder().encode("Login to dapp.xyz at " + Date.now());
            const signature = await mySessionKey.signPersonalMessage(loginChallenge);
            // Send signature to a backend for verification
            ```

    *   ### `signTransactionBlock(transactionBlock: Uint8Array | TransactionBlock): Promise<{ signature: Uint8Array; transactionBlockBytes: Uint8Array; }>`
        Signs a Sui `TransactionBlock` (either as a serialized byte array or a `TransactionBlock` object) with the session key.
        *   **Parameters**: `transactionBlock: Uint8Array | TransactionBlock` - The transaction block to sign.
        *   **Returns**: `Promise<{ signature: Uint8Array; transactionBlockBytes: Uint8Array; }>` - A promise that resolves to an object containing:
            *   `signature`: The signature for the transaction block.
            *   `transactionBlockBytes`: The serialized bytes of the transaction block that were signed.
        *   **Throws**: `ExpiredSessionKeyError` if expired, `InvalidPTBError` if the transaction block is malformed.
        *   **Use Case**: Authorizing on-chain operations (like interacting with a Move contract that updates a Seal policy) without prompting the user's wallet for every transaction.
            ```typescript
            import { TransactionBlock } from '@mysten/sui'; // Updated import
            const tx = new TransactionBlock();
            tx.moveCall({
                target: '0x...::my_module::some_action',
                arguments: [tx.pure('hello')],
            });

            const { signature, transactionBlockBytes } = await mySessionKey.signTransactionBlock(tx);
            // Now you can submit this signed transaction to a Sui RPC endpoint
            // await suiClient.executeTransactionBlock({ transactionBlock: transactionBlockBytes, signature, ... });
            ```

    *   ### `toHeader(): string`
        Converts the session key into a string format suitable for use in an HTTP `Authorization` header.
        *   **Parameters**: None.
        *   **Returns**: `string` - A string in the format "Bearer [base64_encoded_session_key_data]".
        *   **Throws**: `ExpiredSessionKeyError` if expired.
        *   **Use Case**: Authenticating requests to Seal key servers or other backend services that expect session key authorization in an HTTP header.
            ```typescript
            const authHeader = mySessionKey.toHeader();
            // Example usage with fetch:
            // fetch('https://key.mystenlabs.com/api', {
            //     headers: { 'Authorization': authHeader }
            // });
            ```

---

## 27. TooManyFailedFetchKeyRequestsError

The `TooManyFailedFetchKeyRequestsError` is an `InternalError` indicating that the `SealClient` repeatedly failed to fetch keys from the key servers, exceeding an internal retry limit or encountering persistent issues.

*   **Hierarchy**: `Error` -> `SealError` -> `InternalError` -> `TooManyFailedFetchKeyRequestsError`

*   **Description**:
    This error typically signals a systemic problem with the key server infrastructure or network connectivity, rather than a single transient failure. The SDK employs retry mechanisms for robust communication. If these retries are exhausted without success, this error is thrown. It suggests that:
    *   Multiple key servers are unreachable or consistently failing.
    *   There's a prolonged network outage affecting communication with the key servers.
    *   The `SealClient` is experiencing configuration issues that prevent it from reaching *any* functional key server after multiple attempts.

    This error indicates that key fetching is currently impossible for a sustained period.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating that too many fetch key requests failed.

*   **Methods**:
    `TooManyFailedFetchKeyRequestsError` inherits all methods from its parent classes and introduces no new methods.

*   **Use Case (Handling persistent key server unavailability)**:

    ```typescript
    import { SealClient, TooManyFailedFetchKeyRequestsError, SealError, FetchKeysOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function attemptKeySync(sealClient: SealClient, fetchOptions: FetchKeysOptions) {
        try {
            console.log('Attempting to synchronize keys...');
            await sealClient.fetchKeys(fetchOptions);
            console.log('Keys synchronized successfully.');
        } catch (error) {
            if (error instanceof TooManyFailedFetchKeyRequestsError) {
                console.error(`CRITICAL: Too many failed key fetch requests!`);
                console.error(`  Reason: ${error.message}`);
                console.error(`  This indicates a prolonged issue reaching or getting valid responses from key servers.`);
                console.error(`  Decryption operations will likely fail until this is resolved.`);
                console.error(error.stack);
                // Alert system administrators, put application in limited mode, or inform the user about service disruption.
            } else if (error instanceof SealError) {
                console.error(`A specific Seal SDK error occurred during key sync: ${error.name} - ${error.message}`);
            } else {
                console.error(`An unexpected error occurred:`, error);
            }
        }
    }

    // Example Usage (assuming sealClient and sessionKey are set up)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });
    // const mySessionKey = await SessionKey.new({ sender: '0x...' });
    // attemptKeySync(sealClient, { identities: ["some-identity"], sessionKey: mySessionKey });
    ```

---

## 28. UnsupportedFeatureError

The `UnsupportedFeatureError` is thrown when an attempted operation or a requested feature is not supported by the current version of the Seal protocol, the connected key servers, or the SDK itself.

*   **Hierarchy**: `Error` -> `SealError` -> `UnsupportedFeatureError`

*   **Description**:
    This error indicates a mismatch between the application's intent and the capabilities of the Seal infrastructure it's interacting with. This could be due to:
    *   **Outdated Key Servers**: The key servers you are connected to do not yet support a newly introduced Seal feature.
    *   **SDK-Server Mismatch**: The SDK version supports a feature, but the key servers on the chosen `network` do not.
    *   **Experimental Features**: Attempting to use a feature that is still under development and not yet fully rolled out.

    When this error occurs, developers might need to check the compatibility matrix for the Seal SDK and key servers, or adjust their application logic if a feature is not universally available.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message detailing the unsupported feature.

*   **Methods**:
    `UnsupportedFeatureError` inherits all methods from its parent classes and introduces no new methods.

*   **Use Case (Handling feature compatibility)**:

    ```typescript
    import { SealClient, UnsupportedFeatureError, SealError } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function tryExperimentalEncryption(sealClient: SealClient, plaintext: Uint8Array, identity: string) {
        try {
            console.log('Attempting encryption with potential experimental feature...');
            // Imagine 'experimentalMVR' is a feature flag or a specific MVR name
            // that older key servers might not support.
            // This is a simulated trigger for the error.
            if (identity === "experimental-policy" && sealClient.getKeyServers().size < 3) { // Simplified check
                throw new UnsupportedFeatureError("Policy requires advanced feature not supported by all key servers.");
            }

            const { encryptedObject } = await sealClient.encrypt({ plaintext, identity });
            console.log('Encryption successful, feature supported.');
            return encryptedObject;
        } catch (error) {
            if (error instanceof UnsupportedFeatureError) {
                console.error(`Unsupported Feature Error: ${error.message}`);
                console.error(`  The requested Seal feature is not supported by the current setup.`);
                console.error(`  Consider updating your SDK or ensuring connected key servers support this feature.`);
            } else if (error instanceof SealError) {
                console.error(`A general Seal SDK error occurred: ${error.name} - ${error.message}`);
            } else {
                console.error(`An unexpected error occurred:`, error);
            }
            return null;
        }
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });
    // const myPlaintext = new TextEncoder().encode("Experimental data.");

    // // This might work if features are supported
    // tryExperimentalEncryption(sealClient, myPlaintext, "standard-policy");
    // // This might trigger the error if 'experimental-policy' implies an unsupported feature
    // tryExperimentalEncryption(sealClient, myPlaintext, "experimental-policy");
    ```

---

## 29. UnsupportedNetworkError

The `UnsupportedNetworkError` is a `UserError` thrown when the `SealClient` is initialized with a Sui network that is not supported by the `@mysten/seal` SDK.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `UnsupportedNetworkError`

*   **Description**:
    The Seal SDK is designed to work with specific Sui networks (e.g., `mainnet`, `testnet`, `devnet`) where the necessary Seal contracts and key server infrastructure are deployed. If a developer attempts to use the `SealClient` with an unrecognized or unsupported network string, this error is thrown during initialization. This prevents the client from attempting to connect to non-existent or incompatible Seal environments.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating that the specified network is unsupported.

*   **Methods**:
    `UnsupportedNetworkError` inherits all methods from its parent classes and introduces no new methods.

*   **Use Case (Ensuring client is initialized with a supported network)**:

    ```typescript
    import { SealClient, UnsupportedNetworkError, SealClientOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    function createSealClientForNetwork(network: string) {
        let client: SealClient | null = null;
        try {
            const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' }); // Assuming testnet for suiClient
            const options: SealClientOptions = {
                network: network as 'mainnet' | 'testnet' | 'devnet', // Type assertion for demo
                client: suiClient,
            };
            client = new SealClient(options);
            console.log(`SealClient initialized for network: ${network}`);
        } catch (error) {
            if (error instanceof UnsupportedNetworkError) {
                console.error(`Unsupported Network Error: ${error.message}`);
                console.error(`  The network '${network}' is not supported by the Seal SDK.`);
                console.error(`  Please use 'mainnet', 'testnet', or 'devnet'.`);
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred: ${error.name} - ${error.message}`);
            }
        }
        return client;
    }

    // Example Usage
    // createSealClientForNetwork('testnet'); // Should work
    // createSealClientForNetwork('localnet'); // Will throw UnsupportedNetworkError
    // createSealClientForNetwork('invalid-network'); // Will throw UnsupportedNetworkError
    ```

---

## 30. UnsupportedPackageIdError

The `UnsupportedPackageIdError` is a `UserError` thrown when the SDK encounters a Sui package ID that it does not recognize or support in a context where a specific Seal-related package is expected (e.g., a policy package or a core Seal framework package).

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `UnsupportedPackageIdError`

*   **Description**:
    This error indicates that an on-chain package, while potentially valid on Sui, is not part of the recognized and supported Seal ecosystem. This could happen if:
    *   A custom `KeyServerConfig` points to an incorrect or non-Seal package.
    *   The client is somehow trying to interact with a policy defined in a non-standard or deprecated Seal package.
    *   The on-chain environment (e.g., a testnet where custom deployments are done) contains a Seal package that the SDK doesn't officially support.

    This error directs the developer to ensure that the on-chain components they are interacting with are officially supported and correctly configured Seal packages.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating that the package ID is unsupported.

*   **Methods**:
    `UnsupportedPackageIdError` inherits all methods from its parent classes and introduces no new methods.

*   **Use Case (Ensuring interaction with official Seal packages)**:

    ```typescript
    import { SealClient, UnsupportedPackageIdError } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function initializeClientWithSpecificPackage(packageId: string) {
        let client: SealClient | null = null;
        try {
            const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
            // Simulate how an unsupported package ID might be detected internally
            // e.g., if a custom config leads to a non-standard policy package
            if (packageId === "0xDEADBEEF") {
                throw new UnsupportedPackageIdError(`Package ID '${packageId}' is not a recognized Seal package.`);
            }

            // In a real scenario, this error might be thrown internally during
            // SealClient's validation of its dependencies.
            client = new SealClient({
                network: 'testnet',
                client: suiClient,
                // A custom key server referencing this package might trigger it
                // keyServers: [{ hostname: 'custom.com', objectId: packageId, protocol: 'https' }]
            });
            console.log(`SealClient initialized with assumed support for package: ${packageId}`);
        } catch (error) {
            if (error instanceof UnsupportedPackageIdError) {
                console.error(`Unsupported Package ID Error: ${error.message}`);
                console.error(`  The Seal SDK does not support operations with package ID '${packageId}'.`);
                console.error(`  Please ensure you are using official or recognized Seal component package IDs.`);
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred: ${error.name} - ${error.message}`);
            }
        }
        return client;
    }

    // Example Usage
    // initializeClientWithSpecificPackage("0xVALID_SEAL_POLICY_PACKAGE_ID");
    // initializeClientWithSpecificPackage("0xDEADBEEF"); // Simulate an unsupported package ID
    ```

---

## 31. UserError

The `UserError` class is a general base class for all errors that are caused by invalid input, incorrect configuration, or actions taken by the user of the Seal SDK (the developer or end-user).

*   **Hierarchy**: `Error` -> `SealError` -> `UserError`

*   **Description**:
    `UserError` acts as a parent for a wide range of more specific, client-side preventable errors such as `InvalidParameterError`, `ExpiredSessionKeyError`, `InvalidClientOptionsError`, `UnsupportedNetworkError`, etc. When an instance of `UserError` (or its subclass) is thrown, it suggests that the application or developer needs to adjust their inputs, configurations, or logic. These errors are generally recoverable by correcting the provided data or parameters.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A general message indicating the user-related error.

*   **Methods**:
    `UserError` inherits all methods from its parent classes and introduces no new methods.

*   **Use Case (Catching all user-related errors for graceful handling)**:

    ```typescript
    import { SealClient, UserError, SealError } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function performOperationWithUserInputs(sealClient: SealClient, someUserInput: any) {
        try {
            // Simulate an operation that could lead to various UserErrors
            if (someUserInput.identity === "") {
                throw new UserError("Identity cannot be empty.");
            }
            if (!someUserInput.data || someUserInput.data.length === 0) {
                throw new UserError("Data to process cannot be empty.");
            }
            // ... Actual Seal operation using someUserInput ...
            console.log("Operation successful with user inputs.");
        } catch (error) {
            if (error instanceof UserError) {
                console.error(`A User Error occurred: ${error.name}`);
                console.error(`  Problem: ${error.message}`);
                console.error(`  Please check your application's inputs or configuration.`);
                // Here, you might show a specific error message to the end-user
                // based on the `error.name` or `error.message`.
            } else if (error instanceof SealError) {
                console.error(`A non-user-related Seal SDK error occurred: ${error.name} - ${error.message}`);
            } else {
                console.error(`An unexpected non-Seal error occurred:`, error);
            }
        }
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // performOperationWithUserInputs(sealClient, { identity: "valid-id", data: new Uint8Array([1,2,3]) });
    // performOperationWithUserInputs(sealClient, { identity: "", data: new Uint8Array([1,2,3]) }); // Empty identity
    // performOperationWithUserInputs(sealClient, { identity: "valid-id", data: null }); // Null data
    ```