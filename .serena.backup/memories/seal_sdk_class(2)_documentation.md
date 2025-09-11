---

# Seal SDK Technical Document - Part 1: Classes (G-I) - Updated for `@mysten/sui`



## 7. InconsistentKeyServersError

The `InconsistentKeyServersError` is a critical error type indicating a significant issue in the distributed key server system. It is thrown when the responses from the various key servers, particularly during operations requiring a threshold of consensus (like fetching key shares), are not in agreement. This can signal a problem with the integrity or coordination of the key servers.

*   **Hierarchy**: `Error` -> `SealError` -> `InternalError` -> `InconsistentKeyServersError`

*   **Description**:
    This error is a subtype of `InternalError`, suggesting that the problem lies within the Seal protocol's interaction with the key server network rather than a direct user input error. When a client requests key shares or performs an operation that relies on aggregated responses from multiple key servers (e.g., `fetchKeys`), the SDK expects a consistent outcome from a majority of the servers. If different servers return conflicting information for the same operation, it points to:
    *   **Malicious Servers**: One or more key servers might be compromised and returning incorrect data.
    *   **Synchronization Issues**: Key servers might have fallen out of sync regarding their state or the shared secret.
    *   **Network Partition**: A temporary network issue causing servers to receive different requests or respond with outdated data.

    This error is severe because it undermines the trust model of the threshold encryption system. When this error occurs, it's generally not recoverable by simply retrying; it often requires intervention on the key server side or a re-evaluation of the trusted key server list.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating the inconsistency. The SDK typically provides a default message like "Key servers returned inconsistent responses."

*   **Methods**:
    `InconsistentKeyServersError` inherits all methods from its parent classes and does not introduce new ones. Its significance lies solely in its specific type and the severe implications it carries.

*   **Use Case (Handling key server inconsistencies)**:

    ```typescript
    import { SealClient, SessionKey, InconsistentKeyServersError, SealError } from '@mysten/seal';
    import { SuiClient, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function attemptKeyFetchWithConsistencyCheck(
        sealClient: SealClient,
        sessionKey: SessionKey,
        identity: string
    ) {
        try {
            console.log(`Fetching keys for identity: ${identity}...`);
            await sealClient.fetchKeys({
                identities: [identity],
                sessionKey: sessionKey,
                // encryptedObjects: [] // Can also specify encrypted objects
            });
            console.log(`Keys fetched successfully.`);
        } catch (error) {
            if (error instanceof InconsistentKeyServersError) {
                console.error(`CRITICAL: Inconsistent responses from key servers detected!`);
                console.error(`  Reason: ${error.message}`);
                console.error(`  This indicates a severe issue with the integrity or coordination of the Seal key servers.`);
                console.error(`  Further operations reliant on these key servers might be unreliable.`);
                console.error(error.stack);
                // An application might:
                // 1. Alert an administrator.
                // 2. Fall back to a read-only mode if data cannot be guaranteed.
                // 3. Warn the user that the service is experiencing issues.
                // 4. Prevent further sensitive operations.
            } else if (error instanceof SealError) {
                console.error(`A general Seal SDK error occurred: ${error.name} - ${error.message}`);
            } else {
                console.error(`An unexpected error occurred:`, error);
            }
        }
    }

    // Example Usage (assuming sealClient and a valid sessionKey are initialized)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const sessionKey = await SessionKey.new({ sender: keypair.getPublicKey().toSuiAddress() });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });
    // attemptKeyFetchWithConsistencyCheck(sealClient, sessionKey, "critical-document-access");
    ```

---

## 8. InternalError

The `InternalError` class serves as a base for errors that originate from unexpected conditions or logical failures within the Seal SDK's internal operations, rather than from invalid user input or external API communication problems (which are typically covered by `UserError` or `SealAPIError`).

*   **Hierarchy**: `Error` -> `SealError` -> `InternalError`

*   **Description**:
    When an `InternalError` or one of its subclasses is thrown, it usually points to a bug in the SDK itself, an unexpected state, or an unhandled scenario during cryptographic computations or data processing. These errors are generally not recoverable by modifying user input or retrying; they often indicate a need for a fix in the SDK's codebase.

    Subclasses of `InternalError` provide more specific context about the nature of the internal failure (e.g., `InconsistentKeyServersError`, `InvalidGetObjectError`, `InvalidKeyServerError`).

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message describing the internal error.

*   **Methods**:
    `InternalError` inherits all methods from its parent classes (`Error`, `SealError`) and does not define new methods.

*   **Use Case (Catching and reporting internal SDK issues)**:

    ```typescript
    import { SealClient, InternalError, SealError } from '@mysten/seal';

    async function performComplexSealOperation(sealClient: SealClient, someInput: any) {
        try {
            // ... complex logic involving SealClient interactions ...
            // This example simulates an internal error for demonstration.
            if (someInput === "problematic_config") {
                // In a real scenario, an InternalError would be thrown by the SDK itself
                throw new InternalError("Simulated internal error due to problematic config.");
            }
            console.log("Complex operation successful.");
        } catch (error) {
            if (error instanceof InternalError) {
                console.error(`An Internal Seal SDK error occurred: ${error.name}`);
                console.error(`  Details: ${error.message}`);
                console.error(`  This indicates an unexpected issue within the SDK.`);
                console.error(`  Please consider reporting this to Mysten Labs.`);
                console.error(error.stack); // Essential for debugging internal errors
                // For production applications, you might log this error to an error tracking system.
            } else if (error instanceof SealError) {
                console.error(`A more general Seal SDK error occurred: ${error.name} - ${error.message}`);
            } else {
                console.error(`An unexpected non-Seal error occurred:`, error);
            }
        }
    }

    // Example Usage
    // const mySealClient = new SealClient({ /* ...options... */ });
    // performComplexSealOperation(mySealClient, "normal_data");
    // performComplexSealOperation(mySealClient, "problematic_config"); // Simulate error
    ```

---

## 9. InvalidCiphertextError

The `InvalidCiphertextError` is thrown when the `SealClient` attempts to decrypt data, but the provided ciphertext (part of the `EncryptedObject`) is found to be malformed, corrupted, or otherwise structurally invalid according to the Seal protocol's expectations.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidCiphertextError`

*   **Description**:
    This error falls under `UserError` because it usually implies that the data being fed into the decryption process is not a valid `EncryptedObject` generated by Seal. Possible causes include:
    *   **Data Corruption**: The `EncryptedObject` was somehow altered after encryption (e.g., during storage or transmission).
    *   **Incorrect Format**: The input object is not an `EncryptedObject` or does not conform to the expected cryptographic structure (e.g., missing ephemeral public key, malformed ciphertext bytes).
    *   **Non-Seal Data**: Attempting to decrypt data that was not encrypted using the Seal SDK.

    When this error occurs, it's crucial to verify the source and integrity of the `EncryptedObject` being passed to the `decrypt` method.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message describing why the ciphertext was deemed invalid.

*   **Methods**:
    `InvalidCiphertextError` inherits all methods from its parent classes and does not define new ones.

*   **Use Case (Handling corrupted or invalid encrypted data)**:

    ```typescript
    import { SealClient, InvalidCiphertextError, DecryptOptions, EncryptedObject } from '@mysten/seal';

    async function safeDecrypt(sealClient: SealClient, options: DecryptOptions) {
        try {
            console.log(`Attempting decryption...`);
            const decrypted = await sealClient.decrypt(options);
            console.log(`Decryption successful:`, new TextDecoder().decode(decrypted));
        } catch (error) {
            if (error instanceof InvalidCiphertextError) {
                console.error(`Invalid Ciphertext Error: ${error.message}`);
                console.error(`The provided encrypted data appears to be corrupted or malformed.`);
                console.error(`  Please verify the source and integrity of the EncryptedObject.`);
                // You might prompt the user to re-upload the data, or fetch a fresh copy.
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during decryption: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example Usage
    // const mySealClient = new SealClient({ /* ...options... */ });
    // const validEncryptedObject = { /* ... a properly formed EncryptedObject ... */ };
    // const malformedEncryptedObject = {
    //     ciphertext: new Uint8Array([1, 2, 3]), // Too short, invalid format
    //     ephemeralPublicKey: 'invalid_key',
    //     metadata: { /* ... */ }
    // };

    // safeDecrypt(mySealClient, { encryptedObject: validEncryptedObject, identity: 'test-id' });
    // safeDecrypt(mySealClient, { encryptedObject: malformedEncryptedObject, identity: 'test-id' });
    ```

---

## 10. InvalidClientOptionsError

The `InvalidClientOptionsError` is thrown specifically when the `SealClient` constructor is called with an `options` object that is incomplete, contains invalid values, or does not meet the necessary configuration requirements.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidClientOptionsError`

*   **Description**:
    This is a `UserError` because the problem lies with how the developer has initialized the `SealClient`. Proper initialization is crucial for the SDK to function correctly and securely. Examples of invalid options might include:
    *   Missing required properties (e.g., `client` or `network`).
    *   Invalid values for properties (e.g., `network` being an unrecognized string).
    *   Incorrectly formatted `keyServers` configuration.

    When this error occurs, developers should review the `SealClientOptions` interface documentation and ensure all required properties are provided with valid values.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A specific message detailing which option was invalid or why the options were considered invalid.

*   **Methods**:
    `InvalidClientOptionsError` inherits all methods from its parent classes and does not introduce new ones.

*   **Use Case (Ensuring correct SealClient initialization)**:

    ```typescript
    import { SealClient, InvalidClientOptionsError, SealClientOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function createSealClient(options: SealClientOptions) {
        let client: SealClient | null = null;
        try {
            client = new SealClient(options);
            console.log('SealClient initialized successfully.');
        } catch (error) {
            if (error instanceof InvalidClientOptionsError) {
                console.error(`Invalid SealClient Options: ${error.message}`);
                console.error(`Please check the provided options against the SealClientOptions interface.`);
                // Guide the developer on what might be wrong, e.g.:
                if (!options.client) console.error("  Hint: 'client' property (SuiClient instance) is missing.");
                if (!options.network) console.error("  Hint: 'network' property (e.g., 'testnet') is missing or invalid.");
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during client creation: ${error.name} - ${error.message}`);
            }
        }
        return client;
    }

    // Example Usage
    const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });

    // Valid configuration
    const validOptions: SealClientOptions = {
        network: 'testnet',
        client: suiClient,
    };
    createSealClient(validOptions);

    // Invalid configuration (missing client)
    const invalidOptions1: any = {
        network: 'devnet',
        // client is missing
    };
    createSealClient(invalidOptions1);

    // Invalid configuration (unrecognized network)
    const invalidOptions2: any = {
        network: 'unsupported-network',
        client: suiClient,
    };
    createSealClient(invalidOptions2);
    ```

---

## 11. InvalidGetObjectError

The `InvalidGetObjectError` is an `InternalError` typically thrown when the SDK attempts to retrieve an object (e.g., a Sui object representing a key server or a policy) using the provided RPC client, but the object fetched is invalid or malformed, or the RPC call itself fails in an unexpected way that can't be attributed to a network or access issue.

*   **Hierarchy**: `Error` -> `SealError` -> `InternalError` -> `InvalidGetObjectError`

*   **Description**:
    This error indicates a problem during the process of fetching on-chain data that the Seal SDK relies on. It's an internal error because the application's immediate input is typically not the cause; rather, it's an issue with the interaction between the SDK and the underlying Sui RPC client or the state of the on-chain object itself. Possible scenarios:
    *   The RPC response for `getObject` is malformed.
    *   The object ID points to something that isn't a valid Sui object.
    *   The fetched object's structure doesn't match what the Seal SDK expects (e.g., a key server object doesn't have the expected fields).

    This error suggests a discrepancy between what the SDK expects to find on-chain and what it actually receives.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message detailing why the object retrieval failed or why the fetched object was deemed invalid.

*   **Methods**:
    `InvalidGetObjectError` inherits all methods from its parent classes and does not define new ones.

*   **Use Case (Debugging issues with on-chain object fetching)**:

    ```typescript
    import { SealClient, InvalidGetObjectError, InternalError } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function checkKeyServerObject(sealClient: SealClient, keyServerObjectId: string) {
        try {
            console.log(`Verifying key server object: ${keyServerObjectId}`);
            // Internally, SealClient will fetch the key server object details.
            // Simulate a failure for demonstration.
            if (keyServerObjectId === "0xBAD_OBJECT_ID") {
                throw new InvalidGetObjectError(`Simulated: Object 0xBAD_OBJECT_ID is invalid or malformed.`);
            }

            // A real call that might trigger this error
            // await someSealInternalMethodThatFetchesObject(sealClient, keyServerObjectId);

            console.log(`Key server object ${keyServerObjectId} appears valid.`);
        } catch (error) {
            if (error instanceof InvalidGetObjectError) {
                console.error(`Invalid Get Object Error: ${error.message}`);
                console.error(`  This suggests an issue with fetching or interpreting an on-chain object (e.g., a key server object).`);
                console.error(`  Please verify if the object ID is correct and if the object exists and is well-formed on chain.`);
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
    // const mySealClient = new SealClient({ network: 'testnet', client: suiClient });

    // checkKeyServerObject(mySealClient, "0xVALID_KEY_SERVER_OBJECT_ID");
    // checkKeyServerObject(mySealClient, "0xBAD_OBJECT_ID"); // Simulates an invalid object
    ```