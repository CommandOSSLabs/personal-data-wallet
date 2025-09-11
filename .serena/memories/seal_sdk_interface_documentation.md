Okay, let's regenerate the "Part 2: Interfaces" section of the technical document, ensuring all references are updated to the `@mysten/sui` package.

---

# Seal SDK Technical Document - Part 2: Interfaces - Updated for `@mysten/sui`

This section provides a comprehensive overview of the interfaces within the `@mysten/seal` SDK. Interfaces define the structure of configuration objects and parameters passed to various SDK methods, ensuring type safety and clarity in usage. All code examples and references have been updated to use the latest `@mysten/sui` package, replacing the deprecated `@mysten/sui.js`.

---

## 1. DecryptOptions

The `DecryptOptions` interface defines the configuration parameters required for the `SealClient.decrypt()` method. It specifies the encrypted data to be decrypted, the identity associated with that data, and optional settings for authorization and consistency checking.

*   **Definition**:
    ```typescript
    interface DecryptOptions {
        encryptedObject: EncryptedObject;
        identity: string;
        sessionKey?: SessionKey;
        checkConsistency?: boolean;
    }
    ```

*   **Properties**:
    *   `encryptedObject`: `EncryptedObject` (Required)
        *   **Description**: The object containing the encrypted data (ciphertext), ephemeral public key, and metadata, as returned by the `SealClient.encrypt()` method or retrieved from storage. This is the primary input to be transformed back into plaintext.
        *   **Type**: `EncryptedObject` (a variable/type alias defined in the SDK, representing the structured encrypted output).
    *   `identity`: `string` (Required)
        *   **Description**: A unique string identifier that represents the "identity" under which the data was originally encrypted. This `identity` is crucial for the Seal protocol to determine the correct on-chain access policy and to request the appropriate decryption shares from the key servers.
    *   `sessionKey`: `SessionKey` (Optional)
        *   **Description**: An instance of a `SessionKey` that provides the necessary authorization for the decryption request. If the Seal policy for the `identity` requires a signed request (i.e., authenticated access), this `sessionKey` must be provided and valid. If omitted, the request might proceed if the policy allows anonymous access, but it's generally required for protected content.
    *   `checkConsistency`: `boolean` (Optional)
        *   **Description**: A flag that, when set to `true`, instructs the `SealClient` to perform an additional verification step. After collecting enough decryption shares from key servers, it checks if all shares consistently lead to the same plaintext. This is vital for applications where the integrity and unambiguous nature of the decrypted output are paramount (e.g., decentralized voting systems where everyone *must* agree on the decrypted result). If inconsistencies are detected, a `DecryptionError` is thrown. Defaults to `false`.

*   **Use Case**:
    Decrypting a document that requires specific access permissions.

    ```typescript
    import { SealClient, DecryptOptions, EncryptedObject, SessionKey } from '@mysten/seal';
    import { SuiClient, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function decryptDocument(
        sealClient: SealClient,
        docId: string,
        encryptedDoc: EncryptedObject,
        userSessionKey: SessionKey
    ) {
        try {
            console.log(`Attempting to decrypt document '${docId}'...`);

            const decryptOptions: DecryptOptions = {
                encryptedObject: encryptedDoc,
                identity: docId,
                sessionKey: userSessionKey,
                checkConsistency: true, // Ensure all key servers agree on the decryption
            };

            const decryptedBytes = await sealClient.decrypt(decryptOptions);
            const decryptedContent = new TextDecoder().decode(decryptedBytes);
            console.log("Document decrypted successfully:\n", decryptedContent);
            return decryptedContent;

        } catch (error) {
            console.error(`Failed to decrypt document '${docId}':`, error);
            // Handle specific errors like NoAccessError, DecryptionError, etc.
            if (error instanceof Error) {
                console.error(`Error details: ${error.name}: ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage (assuming you have an initialized SealClient and SessionKey)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const senderAddress = keypair.getPublicKey().toSuiAddress();
    // const sessionKey = await SessionKey.new({ sender: senderAddress });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // // Placeholder for a previously encrypted document
    // const exampleEncryptedDoc: EncryptedObject = {
    //     ciphertext: new Uint8Array([/* ... */]),
    //     ephemeralPublicKey: '...',
    //     metadata: { /* ... */ }
    // };
    // decryptDocument(sealClient, "my-private-diary-entry-2023", exampleEncryptedDoc, sessionKey);
    ```

---

## 2. EncryptOptions

The `EncryptOptions` interface specifies the parameters required for the `SealClient.encrypt()` method. It dictates what data to encrypt and under which identity the encryption should be performed, along with optional authorization details.

*   **Definition**:
    ```typescript
    interface EncryptOptions {
        plaintext: Uint8Array;
        identity: string;
        sessionKey?: SessionKey;
    }
    ```

*   **Properties**:
    *   `plaintext`: `Uint8Array` (Required)
        *   **Description**: The raw data (as a byte array) that needs to be encrypted. This is the sensitive information that will be protected by the Seal protocol.
    *   `identity`: `string` (Required)
        *   **Description**: A string identifier that represents the "identity" or namespace under which this data will be encrypted. This `identity` is crucial because it links the encrypted data to a specific on-chain Seal policy. Decryption will only be possible if the decrypting party satisfies the conditions of the policy associated with this `identity`.
    *   `sessionKey`: `SessionKey` (Optional)
        *   **Description**: An instance of a `SessionKey` used for authorizing the encryption request to the key servers. While some Seal deployments might allow anonymous encryption, providing a valid `sessionKey` is generally recommended or required, especially if the policy involves creator-specific logic or if key servers need to rate-limit/authenticate encryption requests.

*   **Use Case**:
    Encrypting user-generated content before storing it on decentralized storage.

    ```typescript
    import { SealClient, EncryptOptions, SessionKey } from '@mysten/seal';
    import { SuiClient, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function encryptUserData(
        sealClient: SealClient,
        dataToEncrypt: string,
        userId: string,
        userSessionKey: SessionKey
    ) {
        try {
            console.log(`Encrypting data for user '${userId}'...`);
            const plaintextBytes = new TextEncoder().encode(dataToEncrypt);

            const encryptOptions: EncryptOptions = {
                plaintext: plaintextBytes,
                identity: `user-data-${userId}`, // Example identity format
                sessionKey: userSessionKey,
            };

            const { encryptedObject, symmetricKey } = await sealClient.encrypt(encryptOptions);

            console.log("Data encrypted successfully.");
            console.log("Encrypted Object (ready for storage):", encryptedObject);
            // It's generally not recommended to log symmetricKey in production due to its sensitivity.
            // console.log("Symmetric Key (for backup/local use):", symmetricKey);
            
            // Store `encryptedObject` in a decentralized storage solution (e.g., IPFS)
            return { encryptedObject, symmetricKey };

        } catch (error) {
            console.error(`Failed to encrypt data for user '${userId}':`, error);
            if (error instanceof Error) {
                console.error(`Error details: ${error.name}: ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage (assuming you have an initialized SealClient and SessionKey)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const senderAddress = keypair.getPublicKey().toSuiAddress();
    // const sessionKey = await SessionKey.new({ sender: senderAddress });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // encryptUserData(sealClient, "This is my top secret user profile info.", senderAddress, sessionKey);
    ```

---

## 3. FetchKeysOptions

The `FetchKeysOptions` interface defines the parameters for the `SealClient.fetchKeys()` method. This method allows applications to proactively fetch and cache decryption keys for one or more identities or encrypted objects, improving the performance of subsequent decryption operations.

*   **Definition**:
    ```typescript
    interface FetchKeysOptions {
        identities?: string[];
        encryptedObjects?: EncryptedObject[];
        sessionKey?: SessionKey;
    }
    ```

*   **Properties**:
    *   `identities`: `string[]` (Optional)
        *   **Description**: An array of string identifiers. The `SealClient` will attempt to fetch decryption keys for each specified identity. This is useful when you know the identities of content a user might access but don't yet have the specific `EncryptedObject`s (e.g., an inbox of message IDs).
    *   `encryptedObjects`: `EncryptedObject[]` (Optional)
        *   **Description**: An array of `EncryptedObject`s. The `SealClient` will extract the `identity` from each object and attempt to fetch the corresponding decryption keys. This is useful when you have the encrypted data upfront and want to prepare for their decryption.
        *   **Note**: You can provide either `identities` or `encryptedObjects`, or both. The client will attempt to fetch keys for all unique identities derived from these inputs.
    *   `sessionKey`: `SessionKey` (Optional)
        *   **Description**: An instance of a `SessionKey` to authorize the key fetching requests. As with `encrypt` and `decrypt`, providing a valid `sessionKey` is often required by key server policies for authenticated access to keys.

*   **Use Case**:
    Pre-loading decryption keys for a user's dashboard that displays multiple encrypted items.

    ```typescript
    import { SealClient, FetchKeysOptions, EncryptedObject, SessionKey } from '@mysten/seal';
    import { SuiClient, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function preLoadDecryptionKeys(
        sealClient: SealClient,
        activeUserSessionKey: SessionKey,
        documentIdentities: string[],
        recentEncryptedItems: EncryptedObject[] // Assume these are fetched from storage
    ) {
        try {
            console.log("Pre-fetching decryption keys...");

            const fetchOptions: FetchKeysOptions = {
                identities: documentIdentities,
                encryptedObjects: recentEncryptedItems,
                sessionKey: activeUserSessionKey,
            };

            await sealClient.fetchKeys(fetchOptions);
            console.log("Decryption keys pre-loaded into cache successfully.");
            // Now, subsequent `decrypt` calls for these items/identities will be faster
            // as the required key shares are already local.

        } catch (error) {
            console.error("Failed to pre-load decryption keys:", error);
            if (error instanceof Error) {
                console.error(`Error details: ${error.name}: ${error.message}`);
            }
        }
    }

    // Example Usage (assuming you have an initialized SealClient and SessionKey)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const senderAddress = keypair.getPublicKey().toSuiAddress();
    // const sessionKey = await SessionKey.new({ sender: senderAddress });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // const myDocumentIds = ["doc-123", "report-xyz"];
    // const myRecentEncryptedItems: EncryptedObject[] = [
    //     /* ... actual EncryptedObject instances ... */
    //     // e.g., { ciphertext: new Uint8Array([1,2,3]), ephemeralPublicKey: '...', metadata: { identity: 'item-A' } },
    //     // { ciphertext: new Uint8Array([4,5,6]), ephemeralPublicKey: '...', metadata: { identity: 'item-B' } },
    // ];
    // preLoadDecryptionKeys(sealClient, sessionKey, myDocumentIds, myRecentEncryptedItems);
    ```

---

## 4. GetDerivedKeysOptions

The `GetDerivedKeysOptions` interface specifies the parameters for the `SealClient.getDerivedKeys()` method. This method allows direct retrieval of derived key shares *from the client's local cache*. It does not trigger new network requests to key servers.

*   **Definition**:
    ```typescript
    interface GetDerivedKeysOptions {
        services: string[];
        threshold: number;
    }
    ```

*   **Properties**:
    *   `services`: `string[]` (Required)
        *   **Description**: An array of string identifiers, where each string is typically the object ID of a Seal key server. The client will look for derived key shares associated with these specific services in its local cache.
    *   `threshold`: `number` (Required)
        *   **Description**: A positive integer specifying the minimum number of derived key shares that must be successfully retrieved from the cache (and be consistent, if implied) for the operation to be considered successful. If fewer than `threshold` shares are found, an `InvalidThresholdError` might be thrown. This corresponds to the `t` in a *t-out-of-n* threshold scheme.

*   **Use Case**:
    For advanced debugging or auditing scenarios where direct access to the individual derived key shares cached by the client is needed, typically *after* a successful `fetchKeys` or `decrypt` operation has populated the cache.

    ```typescript
    import { SealClient, GetDerivedKeysOptions } from '@mysten/seal';
    import { SuiClient } => '@mysten/sui'; // Updated import

    async function inspectCachedKeys(
        sealClient: SealClient,
        relevantKeyServerIds: string[],
        minRequiredKeys: number
    ) {
        try {
            console.log("Attempting to retrieve derived keys from cache...");

            // First, ensure some keys are in the cache (e.g., by calling fetchKeys previously)
            // await sealClient.fetchKeys(...);

            const getOptions: GetDerivedKeysOptions = {
                services: relevantKeyServerIds,
                threshold: minRequiredKeys,
            };

            const derivedKeysMap = await sealClient.getDerivedKeys(getOptions);

            console.log(`Successfully retrieved ${derivedKeysMap.size} derived keys from cache.`);
            derivedKeysMap.forEach((key, serviceId) => {
                console.log(`  Service ${serviceId}: Key = ${new Uint8Array(key).slice(0, 8)}...`); // Log first 8 bytes
            });
            return derivedKeysMap;

        } catch (error) {
            console.error("Failed to retrieve derived keys from cache:", error);
            if (error instanceof Error) {
                console.error(`Error details: ${error.name}: ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage (assuming you have an initialized SealClient)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const sealClient = new SealClient({ network: 'testnet', client: suiClient });

    // Assuming these are the object IDs of your configured key servers
    // const myKeyServerObjectIds = Array.from(sealClient.getKeyServers().values()).map(ks => ks.objectId);
    // inspectCachedKeys(sealClient, myKeyServerObjectIds, 2); // Requires at least 2 keys in cache
    ```

---

## 5. KeyServerConfig

The `KeyServerConfig` interface defines the structure for configuring individual Seal key servers that the `SealClient` will communicate with. Each object in an array of `KeyServerConfig` represents one key server in the decentralized network.

*   **Definition**:
    ```typescript
    interface KeyServerConfig {
        hostname: string;
        objectId: string;
        protocol: "https";
    }
    ```

*   **Properties**:
    *   `hostname`: `string` (Required)
        *   **Description**: The domain name or IP address where the key server's API is hosted (e.g., `key.mystenlabs.com`). This is used by the `SealClient` to make HTTP requests to the key server.
    *   `objectId`: `string` (Required)
        *   **Description**: The Sui Object ID of the on-chain representation of this key server. This ID is used by the `SealClient` to verify the key server's authenticity and to link it to the appropriate on-chain Seal policies and public keys. It must be a valid 0x-prefixed Sui object address.
    *   `protocol`: `"https"` (Required)
        *   **Description**: The communication protocol to use when connecting to the key server. Currently, `https` is the only supported and recommended protocol for secure communication.

*   **Use Case**:
    Manually configuring a `SealClient` with a specific set of trusted key servers, overriding the default allowlisted servers. This is common in development, testing, or private network deployments.

    ```typescript
    import { SealClient, KeyServerConfig } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function initializeClientWithCustomKeyServers() {
        // Define your custom key server configurations
        const customKeyServers: KeyServerConfig[] = [
            {
                hostname: "my-test-keyserver-1.example.com",
                objectId: "0x0000000000000000000000000000000000000000000000000000000000000001", // Placeholder
                protocol: "https"
            },
            {
                hostname: "my-test-keyserver-2.example.com",
                objectId: "0x0000000000000000000000000000000000000000000000000000000000000002", // Placeholder
                protocol: "https"
            },
        ];

        try {
            const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
            const sealClient = new SealClient({
                network: 'testnet', // Must match the network where key server objects are deployed
                client: suiClient,
                keyServers: customKeyServers, // Provide your custom configurations
            });
            console.log("SealClient initialized with custom key servers.");
            console.log("Configured servers:", Array.from(sealClient.getKeyServers().values()));
            return sealClient;
        } catch (error) {
            console.error("Failed to initialize SealClient with custom key servers:", error);
            // Handle specific errors like InvalidKeyServerError, InvalidKeyServerObjectIdError
            if (error instanceof Error) {
                console.error(`Error details: ${error.name}: ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage
    // initializeClientWithCustomKeyServers();
    ```

---

## 6. SealClientExtensionOptions

The `SealClientExtensionOptions` interface defines the parameters for the static factory method `SealClient.asClientExtension()`. This method is designed to facilitate the integration of the `SealClient`'s capabilities into broader client contexts, such as a Sui wallet adapter or a generic SDK client that supports extensions.

*   **Definition**:
    ```typescript
    interface SealClientExtensionOptions {
        rpcClient: JsonRpcProvider; // From @mysten/sui/client
        sealClient: SealClient;
    }
    ```

*   **Properties**:
    *   `rpcClient`: `JsonRpcProvider` (Required)
        *   **Description**: An instance of a Sui JSON-RPC provider (e.g., from `@mysten/sui/client`). This allows the extended client context to access Sui blockchain data and functionalities directly. The `SealClient` itself uses the `SealCompatibleClient` provided in its own constructor for signing, but this `rpcClient` might be used by the higher-level client that the `SealClient` is extending.
    *   `sealClient`: `SealClient` (Required)
        *   **Description**: An already initialized instance of the `SealClient`. This is the core Seal functionality that is being "extended" into the broader client.

*   **Use Case**:
    Registering Seal capabilities with a wallet adapter or a custom Sui client that has a plugin/extension system, allowing dApp developers to call Seal methods directly from their existing client object (e.g., `suiWallet.seal.encrypt(...)`).

    ```typescript
    import { SealClient, SealClientExtensionOptions } from '@mysten/seal';
    import { SuiClient, JsonRpcProvider } from '@mysten/sui/client'; // Updated import

    // --- Simulate a "CustomSuiClient" that supports extensions ---
    class CustomSuiClient extends SuiClient {
        // A placeholder for an extension mechanism
        seal: SealClient | undefined; // Property to hold the SealClient extension

        registerExtension(extensionConfig: any) {
            console.log("Registering extension...");
            // In a real scenario, this might add methods to `this.seal` or similar.
            this.seal = extensionConfig.sealClient; // Example: directly expose sealClient
            console.log("Extension registered. You can now access Seal methods via .seal");
        }
    }
    // -----------------------------------------------------------

    async function integrateSealIntoCustomClient() {
        const rpcProvider = new JsonRpcProvider('https://fullnode.testnet.sui.io/');
        const customSuiClient = new CustomSuiClient({ url: 'https://fullnode.testnet.sui.io/' });

        // Initialize your SealClient
        const mySealClient = new SealClient({
            network: 'testnet',
            client: customSuiClient, // Pass the CustomSuiClient instance
        });

        // Prepare the extension options
        const extensionOptions: SealClientExtensionOptions = {
            rpcClient: rpcProvider,
            sealClient: mySealClient,
        };

        // Get the extension object (asClientExtension is a static method)
        const sealExtension = SealClient.asClientExtension(extensionOptions);

        // Register the extension with your custom client
        customSuiClient.registerExtension(sealExtension);

        console.log("SealClient should now be accessible via customSuiClient.seal");

        // Example: Now you can call seal methods through the custom client
        // const message = new TextEncoder().encode("Hello via extended client!");
        // const encrypted = await customSuiClient.seal.encrypt({ plaintext: message, identity: "extended-id" });
        // console.log("Encrypted via extended client:", encrypted);
    }

    // Example Usage
    // integrateSealIntoCustomClient();
    ```

---

## 7. SealClientOptions

The `SealClientOptions` interface defines the mandatory and optional configuration parameters required to instantiate a new `SealClient`. This is the fundamental interface for setting up the Seal SDK in your application, connecting it to the correct Sui network and providing necessary client dependencies.

*   **Definition**:
    ```typescript
    interface SealClientOptions {
        client: SealCompatibleClient; // From @mysten/sui/client or similar
        keyServers?: KeyServerConfig[];
        network: "mainnet" | "testnet" | "devnet";
    }
    ```

*   **Properties**:
    *   `client`: `SealCompatibleClient` (Required)
        *   **Description**: An instance of a client that implements the `SealCompatibleClient` type alias. This client is responsible for signing operations (like personal messages or transaction blocks) required by the `SealClient` for authentication and on-chain interactions. Typically, this will be an instance of `@mysten/sui/client/SuiClient` or a similar wallet/client provider.
    *   `keyServers`: `KeyServerConfig[]` (Optional)
        *   **Description**: An array of `KeyServerConfig` objects. These define the specific Seal key servers that the `SealClient` will communicate with. If this property is omitted, the `SealClient` will automatically default to a pre-defined list of allowlisted (trusted) key servers for the specified `network`. Providing custom `keyServers` is common for testing, local development, or specific enterprise deployments.
    *   `network`: `"mainnet"` | `"testnet"` | `"devnet"` (Required)
        *   **Description**: The Sui network environment the `SealClient` should operate on. This is critical for connecting to the correct on-chain Seal policies and, if `keyServers` are not explicitly provided, for selecting the correct default allowlisted key servers. Supported values are `"mainnet"`, `"testnet"`, and `"devnet"`.

*   **Use Case**:
    Initializing the `SealClient` at the start of your application to prepare for all subsequent Seal operations.

    ```typescript
    import { SealClient, SealClientOptions, getAllowlistedKeyServers } from '@mysten/seal';
    import { SuiClient, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function initializeMySealApp() {
        try {
            // 1. Initialize your Sui Client (e.g., wallet connection)
            const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
            
            // For signing, in a real app this would come from a connected wallet.
            // For demonstration, we'll use a local keypair.
            const userKeypair = Ed25519Keypair.generate(); 
            const senderAddress = userKeypair.getPublicKey().toSuiAddress();
            console.log("Using sender address:", senderAddress);

            // 2. Define SealClient options
            const sealOptions: SealClientOptions = {
                network: 'testnet', // Specify the network
                client: suiClient,   // Provide the SuiClient for signing and RPC
                // Optional: you could provide custom keyServers here,
                // otherwise, it uses getAllowlistedKeyServers internally for the network.
                // keyServers: getAllowlistedKeyServers('testnet'),
            };

            // 3. Create the SealClient instance
            const sealClient = new SealClient(sealOptions);
            console.log("SealClient initialized successfully.");

            // Now, you can use `sealClient` for encryption, decryption, etc.
            // Example: Create a session key
            const sessionKey = await sealClient.newSessionKey({ sender: senderAddress });
            console.log("SessionKey created:", sessionKey.getPublicKey().toSuiAddress());

            return sealClient;

        } catch (error) {
            console.error("Failed to initialize SealClient:", error);
            // Handle specific initialization errors, e.g., InvalidClientOptionsError, UnsupportedNetworkError
            if (error instanceof Error) {
                console.error(`Error details: ${error.name}: ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage
    // initializeMySealApp();
    ```