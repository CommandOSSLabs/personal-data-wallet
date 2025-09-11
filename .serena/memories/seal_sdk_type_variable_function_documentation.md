---

# Seal SDK Technical Document - Part 3: Type Aliases, Variables, and Functions - Updated for `@mysten/sui`

This section concludes our detailed technical document on the `@mysten/seal` SDK, covering its essential type aliases, variables, and standalone functions. All code examples and references have been updated to use the latest `@mysten/sui` package, replacing the deprecated `@mysten/sui.js`.

---

## Part 3: Type Aliases

Type aliases in TypeScript provide a way to give a new name to an existing type. In the Seal SDK, they are used to simplify complex type signatures and define expected interfaces for interoperability.

### 1. ExportedSessionKey

The `ExportedSessionKey` type alias defines the structure for a serializable representation of a `SessionKey`. This format is useful for storing a session key (e.g., in local storage or a database) and later re-instantiating it without needing to generate a new one or re-authenticate with the user's primary wallet.

*   **Definition**:
    ```typescript
    type ExportedSessionKey = {
        publicKey: string; // Base64 encoded public key
        secretKey: string; // Base64 encoded secret key
        expiry: number;    // Expiration timestamp in milliseconds since Unix epoch
    };
    ```

*   **Properties**:
    *   `publicKey`: `string`
        *   **Description**: The public key component of the session key pair, typically encoded in Base64 or a similar string format for easy storage and transmission.
    *   `secretKey`: `string`
        *   **Description**: The secret (private) key component of the session key pair, also typically encoded in Base64. This is the sensitive part that must be kept secure.
    *   `expiry`: `number`
        *   **Description**: A Unix timestamp (in milliseconds) indicating when the session key will expire. After this time, the key should no longer be used for authorization, and a new one should be generated.

*   **Use Case**:
    Persisting a `SessionKey` across browser sessions or application restarts.

    ```typescript
    import { SessionKey, ExportedSessionKey } from '@mysten/seal';
    import { Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function saveAndLoadSessionKey(senderAddress: string) {
        // 1. Create a new SessionKey
        const newSessionKey = await SessionKey.new({ sender: senderAddress, expiry: Date.now() + 3600 * 1000 }); // Expires in 1 hour
        console.log("New Session Key created.");

        // 2. Export the session key for storage
        const exportedKey: ExportedSessionKey = {
            publicKey: newSessionKey.getPublicKey().toBase64(), // Assuming toBase64 method exists
            secretKey: newSessionKey.secretKey.toBase64(), // Assuming secretKey is accessible and has toBase64
            expiry: newSessionKey.expiry,
        };
        localStorage.setItem('mySessionKey', JSON.stringify(exportedKey));
        console.log("Session Key saved to localStorage.");

        // 3. Later, load and re-instantiate the session key
        const storedKeyJson = localStorage.getItem('mySessionKey');
        if (storedKeyJson) {
            const loadedExportedKey: ExportedSessionKey = JSON.parse(storedKeyJson);
            const loadedSessionKey = new SessionKey({
                sessionKey: loadedExportedKey,
                sender: senderAddress,
            });

            if (!loadedSessionKey.isExpired()) {
                console.log("Session Key loaded and is still valid.");
                // Use loadedSessionKey for operations
            } else {
                console.log("Session Key loaded but has expired. Need to generate a new one.");
                // Clear expired key and prompt for new one
                localStorage.removeItem('mySessionKey');
            }
        }
    }

    // Example Usage
    // const userKeypair = Ed25519Keypair.generate();
    // saveAndLoadSessionKey(userKeypair.getPublicKey().toSuiAddress());
    ```

### 2. SealCompatibleClient

The `SealCompatibleClient` type alias defines the minimum interface that a Sui client must implement to be compatible with the `SealClient`. This ensures that the `SealClient` can perform necessary signing operations (for personal messages and transaction blocks) through the provided client instance.

*   **Definition**:
    ```typescript
    type SealCompatibleClient = {
        signPersonalMessage: (args: { message: Uint8Array }) => Promise<any>;
        signTransactionBlock: (args: { transactionBlock: any }) => Promise<any>;
    };
    ```

*   **Properties (Methods)**:
    *   `signPersonalMessage`: `(args: { message: Uint8Array }) => Promise<any>`
        *   **Description**: A method that takes an object with a `message` (as `Uint8Array`) and returns a promise that resolves to the signature. This is used for off-chain authentication challenges or proving ownership.
        *   **Compatibility**: This method signature aligns with `SuiClient.signPersonalMessage` from `@mysten/sui`.
    *   `signTransactionBlock`: `(args: { transactionBlock: any }) => Promise<any>`
        *   **Description**: A method that takes an object with a `transactionBlock` (which can be a `TransactionBlock` instance or its serialized bytes) and returns a promise that resolves to the signature and potentially the serialized transaction block bytes. This is used for authorizing on-chain operations.
        *   **Compatibility**: This method signature aligns with `SuiClient.signTransactionBlock` from `@mysten/sui`.

*   **Use Case**:
    Ensuring that any custom Sui client or wallet adapter can be seamlessly integrated with the `SealClient`. The `SuiClient` from `@mysten/sui` naturally implements this interface.

    ```typescript
    import { SealClient, SealCompatibleClient, SealClientOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    // SuiClient from @mysten/sui naturally implements SealCompatibleClient
    const mySuiClient: SuiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });

    // You can directly use SuiClient as the compatible client
    const sealOptions: SealClientOptions = {
        network: 'testnet',
        client: mySuiClient, // SuiClient fits the SealCompatibleClient type
    };

    const sealClient = new SealClient(sealOptions);
    console.log("SealClient initialized with SuiClient.");

    // If you had a custom client that wrapped SuiClient:
    class MyCustomWalletClient implements SealCompatibleClient {
        constructor(private suiClient: SuiClient) {}

        async signPersonalMessage(args: { message: Uint8Array }): Promise<any> {
            console.log("MyCustomWalletClient: Signing personal message...");
            return this.suiClient.signPersonalMessage(args);
        }

        async signTransactionBlock(args: { transactionBlock: any }): Promise<any> {
            console.log("MyCustomWalletClient: Signing transaction block...");
            return this.suiClient.signTransactionBlock(args);
        }
    }

    const customWalletClient = new MyCustomWalletClient(mySuiClient);
    const sealOptionsCustom: SealClientOptions = {
        network: 'testnet',
        client: customWalletClient, // MyCustomWalletClient also fits the type
    };
    const sealClientCustom = new SealClient(sealOptionsCustom);
    console.log("SealClient initialized with Custom Wallet Client.");
    ```

---

## Part 4: Variables

This section describes the key variable (or structured type) that represents encrypted data within the Seal SDK.

### 1. EncryptedObject

The `EncryptedObject` is a structured type that represents data after it has been encrypted by the `SealClient.encrypt()` method. This object contains all the necessary components (ciphertext, ephemeral public key, and metadata) required for later decryption by an authorized party. It is designed to be stored on any decentralized or centralized storage solution.

*   **Definition**:
    (Note: While listed as a "Variable" in the Typedoc, it's conceptually a structured type/interface that is exported.)
    ```typescript
    type EncryptedObject = {
        ciphertext: Uint8Array;
        ephemeralPublicKey: string; // Base64 encoded
        metadata: {
            identity: string;
            // Other protocol-specific metadata might be here
        };
        // Other fields might be present depending on Seal protocol version
    };
    ```

*   **Properties**:
    *   `ciphertext`: `Uint8Array`
        *   **Description**: The actual encrypted bytes of the original plaintext. This is the core encrypted data.
    *   `ephemeralPublicKey`: `string`
        *   **Description**: A public key generated specifically for this encryption operation. It's ephemeral because it's unique to this particular encryption instance. It's typically Base64 encoded for string representation. This key is part of the cryptographic scheme (e.g., ECIES) used to derive shared secrets for decryption.
    *   `metadata`: `{ identity: string; /* ... */ }`
        *   **Description**: An object containing additional information about the encrypted data.
            *   `identity`: `string` - The identifier under which the data was encrypted, linking it to a specific Seal policy. This is crucial for decryption.
            *   Other metadata fields might be present depending on the Seal protocol version or specific use cases, providing context for decryption.

*   **Use Case**:
    Storing encrypted data on a decentralized file storage system like IPFS or Arweave, or within a Sui object.

    ```typescript
    import { SealClient, EncryptedObject, SessionKey } from '@mysten/seal';
    import { SuiClient, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function encryptAndStoreData(sealClient: SealClient, userSessionKey: SessionKey, content: string, contentId: string) {
        const plaintext = new TextEncoder().encode(content);
        const { encryptedObject } = await sealClient.encrypt({
            plaintext: plaintext,
            identity: contentId,
            sessionKey: userSessionKey,
        });

        console.log("Encrypted Object created:", encryptedObject);

        // --- Simulate storing the EncryptedObject ---
        // In a real application, you would upload `encryptedObject` to IPFS, Arweave, etc.
        // For demonstration, we'll just log it.
        const jsonString = JSON.stringify({
            ciphertext: Array.from(encryptedObject.ciphertext), // Convert Uint8Array to array for JSON
            ephemeralPublicKey: encryptedObject.ephemeralPublicKey,
            metadata: encryptedObject.metadata,
        });
        console.log("Encrypted Object (JSON for storage):", jsonString.substring(0, 200) + "..."); // Truncate for display

        // --- Simulate retrieving and decrypting ---
        // Later, when retrieving from storage:
        const retrievedJson = JSON.parse(jsonString);
        const retrievedEncryptedObject: EncryptedObject = {
            ciphertext: new Uint8Array(retrievedJson.ciphertext),
            ephemeralPublicKey: retrievedJson.ephemeralPublicKey,
            metadata: retrievedJson.metadata,
        };

        console.log("\nAttempting to decrypt retrieved object...");
        const decryptedBytes = await sealClient.decrypt({
            encryptedObject: retrievedEncryptedObject,
            identity: contentId,
            sessionKey: userSessionKey,
        });
        console.log("Decrypted content:", new TextDecoder().decode(decryptedBytes));
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const senderAddress = keypair.getPublicKey().toSuiAddress();
    // const sessionKey = await SessionKey.new({ sender: senderAddress });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // encryptAndStoreData(sealClient, sessionKey, "This is my secret diary entry for today.", "diary-entry-2023-10-27");
    ```

---

## Part 5: Functions

This section details the standalone utility functions provided by the `@mysten/seal` SDK. These functions offer specific functionalities that complement the core `SealClient` operations.

### 1. getAllowlistedKeyServers

The `getAllowlistedKeyServers` function provides a convenient way to retrieve the default, officially recognized, and trusted Seal key server configurations for a given Sui network. This is the recommended way to configure `SealClient` if you don't need to specify custom key servers.

*   **Signature**:
    `getAllowlistedKeyServers(network: "mainnet" | "testnet" | "devnet"): KeyServerConfig[]`

*   **Parameters**:
    *   `network`: `"mainnet"` | `"testnet"` | `"devnet"` (Required)
        *   **Description**: The name of the Sui network for which to retrieve the allowlisted key server configurations. The function returns the list of servers officially supported for that specific network.

*   **Returns**: `KeyServerConfig[]`
    *   **Description**: An array of `KeyServerConfig` objects, each representing a trusted key server with its hostname, on-chain object ID, and protocol.

*   **Throws**: `UnsupportedNetworkError` if the provided `network` string is not one of the supported values.

*   **Use Case**:
    Initializing the `SealClient` with the default, trusted key servers for a specific Sui network.

    ```typescript
    import { SealClient, getAllowlistedKeyServers } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function initializeClientWithDefaults(network: "mainnet" | "testnet" | "devnet") {
        try {
            const suiClient = new SuiClient({ url: `https://fullnode.${network}.sui.io/` }); // Adjust RPC URL based on network
            
            // Get the default key servers for the specified network
            const defaultKeyServers = getAllowlistedKeyServers(network);
            console.log(`Default key servers for ${network}:`, defaultKeyServers);

            const sealClient = new SealClient({
                network: network,
                client: suiClient,
                keyServers: defaultKeyServers, // Use the allowlisted servers
            });
            console.log(`SealClient initialized for ${network} using default key servers.`);
            return sealClient;
        } catch (error) {
            console.error(`Failed to initialize SealClient for ${network}:`, error);
            if (error instanceof Error) {
                console.error(`Error details: ${error.name}: ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage
    // initializeClientWithDefaults('testnet');
    // initializeClientWithDefaults('mainnet');
    // initializeClientWithDefaults('invalid-network' as any); // This will throw UnsupportedNetworkError
    ```

### 2. toMajorityError

The `toMajorityError` function is a utility designed to process an array of `SealAPIError` instances (typically collected from multiple key server responses) and return a single, representative `SealError`. This is particularly useful in threshold-based systems where multiple servers might respond, and you need to understand the most common reason for failure across the network.

*   **Signature**:
    `toMajorityError(errors: SealAPIError[]): SealError`

*   **Parameters**:
    *   `errors`: `SealAPIError[]` (Required)
        *   **Description**: An array of `SealAPIError` objects, each representing an error response from a different key server.

*   **Returns**: `SealError`
    *   **Description**: A single `SealError` instance. The function analyzes the input errors to find the most frequently occurring error type or status code.
        *   If a clear majority error is found (e.g., most servers returned `403 NoAccessError`), it returns an instance of that specific error.
        *   If there's no clear majority or the errors are highly diverse, it might return a more general error like `InconsistentKeyServersError` or `GeneralError`, indicating a complex or unresolvable failure state across the key server network.

*   **Use Case**:
    Consolidating error messages from multiple key server responses into a single, actionable error for the application to handle. This simplifies error reporting and user feedback.

    ```typescript
    import { SealAPIError, toMajorityError, NoAccessError, InconsistentKeyServersError } from '@mysten/seal';

    function processKeyServerErrors(apiErrors: SealAPIError[]) {
        if (apiErrors.length === 0) {
            console.log("No API errors to process.");
            return;
        }

        console.log("Processing API errors:", apiErrors.map(e => `${e.status} - ${e.message}`));

        try {
            const consolidatedError = toMajorityError(apiErrors);
            console.error("Consolidated Error:", consolidatedError.name, consolidatedError.message);

            if (consolidatedError instanceof NoAccessError) {
                console.error("Action: User does not have access. Prompt for permissions or re-authentication.");
            } else if (consolidatedError instanceof InconsistentKeyServersError) {
                console.error("Action: Key servers are inconsistent. This is a critical infrastructure issue.");
            } else {
                console.error("Action: General API error. Check network or server status.");
            }
        } catch (error) {
            console.error("Error during error consolidation:", error);
        }
    }

    // Example Usage:
    // Simulate various key server errors
    const simulatedErrors1: SealAPIError[] = [
        new SealAPIError("Access denied by policy", 403, { code: "NO_ACCESS" }),
        new SealAPIError("Access denied by policy", 403, { code: "NO_ACCESS" }),
        new SealAPIError("Internal server error", 500, { code: "SERVER_ERROR" }),
    ];
    processKeyServerErrors(simulatedErrors1); // Should consolidate to NoAccessError

    const simulatedErrors2: SealAPIError[] = [
        new SealAPIError("Invalid identity", 400, { code: "INVALID_IDENTITY" }),
        new SealAPIError("Network timeout", 504, { code: "TIMEOUT" }),
        new SealAPIError("Bad request", 400, { code: "BAD_REQUEST" }),
    ];
    processKeyServerErrors(simulatedErrors2); // Might consolidate to InvalidParameterError or InconsistentKeyServersError
    ```