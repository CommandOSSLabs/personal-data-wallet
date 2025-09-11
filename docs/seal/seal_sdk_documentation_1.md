

# Seal SDK Technical Document - Part 1: Classes (A-F) - Updated for `@mysten/sui`

This document provides an in-depth look at the classes available in the `@mysten/seal` SDK, focusing on their purpose, hierarchy, constructors, methods, and typical use cases. All code examples and references have been updated to use the latest `@mysten/sui` package, replacing the deprecated `@mysten/sui.js`.

---

## 1. SealError

The `SealError` class serves as the foundational base class for all custom errors thrown by the `@mysten/seal` SDK. All specific error types within the SDK inherit directly or indirectly from `SealError`. This provides a consistent way to catch any error originating from the Seal SDK, allowing for robust error handling in applications.

*   **Hierarchy**: `Error` -> `SealError`

*   **Description**:
    When an operation within the Seal SDK encounters an issue that prevents it from completing successfully, a `SealError` (or one of its more specific subclasses) is thrown. By inheriting from JavaScript's native `Error` object, `SealError` instances automatically include a stack trace, which is invaluable for debugging.

    The primary purpose of `SealError` is to provide a common type for all SDK-related exceptions, making it easy to distinguish them from other application or system errors.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A human-readable description of the error. This message will be set as the `message` property of the `Error` instance.

*   **Methods**:
    As a base class, `SealError` primarily inherits methods from the standard JavaScript `Error` object. It does not introduce new methods of its own.

    *   `toString()`: Returns a string representation of the error. (Inherited from `Error`).
    *   `name`: `string` - The name of the error. For `SealError`, this will typically be "SealError" unless overridden by a subclass. (Inherited from `Error`).
    *   `message`: `string` - The error message provided in the constructor. (Inherited from `Error`).
    *   `stack`: `string` (Optional) - A stack trace that indicates where the error occurred. This property is implementation-specific and may not be available in all environments. (Inherited from `Error`).

*   **Use Case (Catching all Seal-related errors)**:

    ```typescript
    import { SealClient, SealError, DecryptionError } from '@mysten/seal';

    async function performSealOperation(sealClient: SealClient, someData: Uint8Array, identity: string) {
      try {
        const encryptedObject = await sealClient.encrypt({ plaintext: someData, identity });
        console.log('Data encrypted successfully:', encryptedObject);

        const decryptedData = await sealClient.decrypt({ encryptedObject, identity });
        console.log('Data decrypted successfully:', decryptedData);

      } catch (error) {
        // Check if the error is specifically a SealError
        if (error instanceof SealError) {
          console.error('A Seal SDK error occurred:', error.name, error.message);
          // You can also check for specific subclasses if needed
          if (error instanceof DecryptionError) {
            console.error('Decryption specifically failed.');
          }
          // Log the full stack for debugging
          console.error(error.stack);
        } else {
          // Handle other types of errors
          console.error('An unexpected non-Seal error occurred:', error);
        }
      }
    }

    // Example usage (assuming sealClient is initialized)
    // performSealOperation(mySealClient, new TextEncoder().encode("secret"), "my-identity");
    ```

---

## 2. SealAPIError

The `SealAPIError` class is a specialized `SealError` that specifically signifies an error encountered during an API call to a Seal key server. It provides additional context about the HTTP response, including the status code and the server's response body, which are crucial for diagnosing issues with key server communication.

*   **Hierarchy**: `Error` -> `SealError` -> `SealAPIError`

*   **Description**:
    When the `SealClient` communicates with a key server (e.g., to fetch keys or request encryption shares) and the server responds with an error status (e.g., 4xx or 5xx), a `SealAPIError` is thrown. This error is designed to encapsulate the details of that HTTP error, making it easier for developers to understand why a key server request failed.

*   **Constructor**:
    `constructor(message: string, status: number, response: unknown)`
    *   `message`: `string` - A descriptive message indicating what went wrong with the API call.
    *   `status`: `number` - The HTTP status code returned by the key server (e.g., 400, 403, 500).
    *   `response`: `unknown` - The raw response body received from the key server. This can be a string, a JSON object, or any other data type depending on the server's error format. It's typed as `unknown` to allow for flexibility, so you might need to cast it or check its type.

*   **Properties**:
    In addition to the standard `Error` properties (`name`, `message`, `stack`), `SealAPIError` adds:
    *   `status`: `number` - The HTTP status code of the server's error response.
    *   `response`: `unknown` - The body of the HTTP response from the key server.

*   **Methods**:
    `SealAPIError` does not introduce new methods beyond what is inherited from `Error` and `SealError`. Its value lies in its additional properties.

*   **Use Case (Handling key server communication errors)**:

    ```typescript
    import { SealClient, SealAPIError, KeyServerConfig, SessionKey } from '@mysten/seal';
    import { SuiClient, Ed25519Keypair } from '@mysten/sui'; // Updated import

    async function fetchKeysWithErrorHandler(
        sealClient: SealClient,
        sessionKey: SessionKey,
        identity: string
    ) {
        try {
            console.log(`Attempting to fetch keys for identity: ${identity}`);
            await sealClient.fetchKeys({
                identities: [identity],
                sessionKey: sessionKey,
                // encryptedObjects: [] // Can also specify encrypted objects
            });
            console.log(`Keys fetched successfully for ${identity}.`);
        } catch (error) {
            if (error instanceof SealAPIError) {
                console.error(`SealAPIError encountered during key fetch:`);
                console.error(`  Message: ${error.message}`);
                console.error(`  Status Code: ${error.status}`);
                console.error(`  Server Response:`, error.response);

                // Specific handling based on status code
                if (error.status === 403) {
                    console.error('Access Denied: The session key or policy does not grant access.');
                    // Potentially re-authenticate or notify user
                } else if (error.status >= 500) {
                    console.error('Server Error: The key server encountered an internal issue.');
                    // Consider retrying or notifying operations team
                }
            } else if (error instanceof SealError) {
                console.error('A general Seal SDK error occurred:', error.name, error.message);
            } else {
                console.error('An unexpected error occurred:', error);
            }
        }
    }

    // Example setup (assuming SuiClient and keypair/sessionKey are initialized)
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const keypair = Ed25519Keypair.generate();
    // const senderAddress = keypair.getPublicKey().toSuiAddress();
    // const sessionKey = await SessionKey.new({ sender: senderAddress });
    // const sealClient = new SealClient({
    //     network: 'testnet',
    //     client: suiClient,
    //     // keyServers: getAllowlistedKeyServers('testnet') // Or custom key servers
    // });
    // fetchKeysWithErrorHandler(sealClient, sessionKey, "some-protected-data-id");
    ```

---

## 3. DecryptionError

The `DecryptionError` class signifies that a decryption operation failed. This error is typically thrown when the `SealClient.decrypt()` method cannot successfully recover the original plaintext from an `EncryptedObject`, even after fetching keys.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `DecryptionError`

*   **Description**:
    `DecryptionError` is a specific type of `UserError` (indicating it's often related to issues with user-provided data or access rights) that pinpoints a failure in the final decryption step. This can occur for several reasons, such as:
    *   The provided `EncryptedObject` is corrupted or malformed.
    *   The fetched decryption shares are inconsistent (if `checkConsistency` is true).
    *   The decryption keys retrieved were incorrect or insufficient.
    *   Underlying cryptographic failures during the decryption process.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A human-readable message explaining why decryption failed.

*   **Methods**:
    `DecryptionError` inherits its methods from `Error`, `SealError`, and `UserError`. It does not define any new methods. Its primary role is to provide a distinct type for decryption-specific failures.

*   **Use Case (Handling specific decryption failures)**:

    ```typescript
    import { SealClient, DecryptionError, EncryptedObject } from '@mysten/seal';

    async function attemptDecryption(
        sealClient: SealClient,
        encryptedObj: EncryptedObject,
        identity: string
    ) {
        try {
            console.log(`Attempting to decrypt data for identity: ${identity}`);
            const decrypted = await sealClient.decrypt({
                encryptedObject: encryptedObj,
                identity: identity,
                checkConsistency: true // Important for robust applications
            });
            console.log(`Decryption successful. Decrypted data:`, new TextDecoder().decode(decrypted));
            return decrypted;
        } catch (error) {
            if (error instanceof DecryptionError) {
                console.error(`Decryption failed specifically: ${error.message}`);
                console.error(`Possible causes: Corrupted ciphertext, inconsistent key shares, or incorrect identity.`);
                // You might prompt the user to re-check their data or access permissions.
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during decryption: ${error.name} - ${error.message}`);
            }
            return null;
        }
    }

    // Example Usage (assuming sealClient and a valid encryptedObject are available)
    // const myEncryptedObject = { /* ... properties of EncryptedObject ... */ };
    // attemptDecryption(mySealClient, myEncryptedObject, "my-private-document");
    ```

---

## 4. DeprecatedSDKVersionError

The `DeprecatedSDKVersionError` class is thrown when the `SealClient` detects that the version of the Seal SDK being used is no longer supported or is deprecated. This is a critical error as it implies potential security vulnerabilities or incompatibility issues with the latest Seal protocol or key server versions.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `InvalidSDKVersionError` -> `DeprecatedSDKVersionError`

*   **Description**:
    This error is a specific subtype of `InvalidSDKVersionError`, which itself is a `UserError`. It explicitly indicates that the SDK version is considered deprecated. Developers encountering this error should update their `@mysten/seal` package to the latest version to ensure compatibility, security, and access to the newest features.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating that the SDK version is deprecated. The SDK typically provides a default informative message.

*   **Methods**:
    `DeprecatedSDKVersionError` inherits all methods from its parent classes (`Error`, `SealError`, `UserError`, `InvalidSDKVersionError`) and introduces no new methods.

*   **Use Case (Handling deprecated SDK versions)**:

    ```typescript
    import { SealClient, DeprecatedSDKVersionError, SealClientOptions } from '@mysten/seal';
    import { SuiClient } from '@mysten/sui'; // Updated import

    async function initializeSealClientSafely(options: SealClientOptions) {
        let client: SealClient | null = null;
        try {
            client = new SealClient(options);
            console.log('SealClient initialized successfully.');
            // Proceed with Seal operations
        } catch (error) {
            if (error instanceof DeprecatedSDKVersionError) {
                console.error(`CRITICAL ERROR: Your Seal SDK version is deprecated!`);
                console.error(`  Reason: ${error.message}`);
                console.error(`  Please update your @mysten/seal package to the latest version immediately.`);
                // You might want to halt application execution or redirect the user to an update page.
            } else if (error instanceof Error) {
                console.error(`Failed to initialize SealClient: ${error.name} - ${error.message}`);
            }
        }
        return client;
    }

    // Example Usage
    // const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io/' });
    // const clientOptions = {
    //     network: 'testnet',
    //     client: suiClient,
    //     // keyServers: [...] // Optional
    // };
    // const mySealClient = await initializeSealClientSafely(clientOptions);
    // if (mySealClient) {
    //     // Use mySealClient
    // }
    ```

---

## 5. ExpiredSessionKeyError

The `ExpiredSessionKeyError` is thrown when a `SessionKey` that is being used for an operation has exceeded its predefined expiry timestamp. Session keys are designed to have a limited lifespan for security reasons.

*   **Hierarchy**: `Error` -> `SealError` -> `UserError` -> `ExpiredSessionKeyError`

*   **Description**:
    This error is a specific `UserError` that indicates the authorization provided (via the `SessionKey`) is no longer valid due to its expiration. When this error occurs, the application should typically prompt the user to re-authenticate or generate a new `SessionKey`.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A message indicating that the session key has expired.

*   **Methods**:
    `ExpiredSessionKeyError` inherits methods from its parent classes and does not introduce new ones. The relevant check for a session key's expiry is often done via the `SessionKey.isExpired()` method.

*   **Use Case (Handling expired session keys)**:

    ```typescript
    import { SealClient, SessionKey, ExpiredSessionKeyError, EncryptedObject } from '@mysten/seal';

    async function performAuthorizedOperation(
        sealClient: SealClient,
        sessionKey: SessionKey,
        encryptedObj: EncryptedObject,
        identity: string
    ) {
        try {
            // It's good practice to check expiry before making a call, but the SDK will also error
            if (sessionKey.isExpired()) {
                throw new ExpiredSessionKeyError("Session key is already expired locally.");
            }

            console.log('Attempting decryption with session key...');
            const decrypted = await sealClient.decrypt({
                encryptedObject: encryptedObj,
                identity: identity,
                sessionKey: sessionKey,
            });
            console.log('Operation successful:', new TextDecoder().decode(decrypted));
        } catch (error) {
            if (error instanceof ExpiredSessionKeyError) {
                console.error(`Session key expired: ${error.message}`);
                console.warn('Please generate a new session key or re-authenticate.');
                // Trigger UI flow for re-authentication
            } else if (error instanceof Error) {
                console.error(`An unexpected error occurred during authorized operation: ${error.name} - ${error.message}`);
            }
        }
    }

    // Example: (Assuming sealClient, encryptedObj, and a potentially expired sessionKey are available)
    // const mySessionKey = await SessionKey.new({ sender: '0x...', expiry: Date.now() - 3600000 }); // An hour ago
    // performAuthorizedOperation(mySealClient, mySessionKey, myEncryptedObject, "some-identity");
    ```

---

## 6. GeneralError

The `GeneralError` class serves as a catch-all for unexpected or unclassified errors that occur within the Seal SDK. It's used when a more specific error type is not applicable or has not been defined for a particular failure scenario.

*   **Hierarchy**: `Error` -> `SealError` -> `GeneralError`

*   **Description**:
    While the Seal SDK strives to provide specific error types for common failure modes (like network errors, invalid parameters, or decryption failures), there might be edge cases or internal issues that don't fit into those categories. `GeneralError` provides a fallback for such situations, ensuring that an error is still thrown with a standard structure. When encountering a `GeneralError`, it often indicates an unexpected state or a bug within the SDK itself, or an unforeseen interaction.

*   **Constructor**:
    `constructor(message?: string)`
    *   `message`: `string` (Optional) - A general message describing the unexpected error.

*   **Methods**:
    `GeneralError` inherits methods from `Error` and `SealError` and does not define any new methods.

*   **Use Case (Generic error handling fallback)**:

    ```typescript
    import { SealClient, GeneralError, SealError } from '@mysten/seal';

    async function trySomethingUnexpected(sealClient: SealClient, trickyInput: any) {
        try {
            // Imagine an internal SDK call that could throw a GeneralError
            // (e.g., due to an unexpected response format from a new key server version not fully handled)
            // For demonstration, let's simulate a scenario that might lead to it
            // In real code, you wouldn't explicitly throw GeneralError unless in testing/debugging.
            if (trickyInput === "trigger_general_error") {
                throw new GeneralError("An unforeseen internal problem occurred with tricky input.");
            }

            console.log("Operation completed without general error.");
        } catch (error) {
            if (error instanceof GeneralError) {
                console.error(`Caught a GeneralError: ${error.message}`);
                console.error(`This indicates an unexpected internal issue. Please report this with details if persistent.`);
                console.error(error.stack); // Crucial for diagnosing general errors
            } else if (error instanceof SealError) {
                console.error(`Caught a more specific SealError: ${error.name} - ${error.message}`);
            } else {
                console.error(`Caught an entirely unknown error:`, error);
            }
        }
    }

    // Example Usage
    // const mySealClient = new SealClient({ /* ...options... */ });
    // trySomethingUnexpected(mySealClient, "normal_input");
    // trySomethingUnexpected(mySealClient, "trigger_general_error"); // Simulate unexpected behavior
    ```