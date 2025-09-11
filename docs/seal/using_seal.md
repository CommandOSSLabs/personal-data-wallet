
The "Using Seal" documentation provides a comprehensive guide for both dapp developers and key server operators on how to implement and manage Seal for encryption and decryption.

**For Dapp Developers**
*   **Access Control Management**: Developers can define `seal_approve*` functions in their Move modules to control access to keys. These functions should be non-public `entry` functions and abort if access is not granted. They are evaluated on full nodes using `dry_run_transaction_block` RPC calls, meaning changes to on-chain state may take time to propagate, and developers should avoid relying on frequently changing state or invariants dependent on transaction order within a checkpoint.
*   **Encryption**: The recommended method is to use the Seal SDK.
    *   Apps select key servers, either a fixed set or dynamically. Key servers are referenced by their `KeyServer` object ID on-chain.
    *   The SDK can verify if a provided URL corresponds to the claimed key server to prevent impersonation.
    *   `SealClient` objects are created for selected key servers, with each server assigned a weight for decryption threshold calculations.
    *   The `encrypt` method takes a threshold, package ID, access policy ID, and data to encrypt, returning an encrypted object and a symmetric key. The symmetric key can be used for disaster recovery via the CLI.
    *   Encryption does not hide message size, so padding is recommended for sensitive size information.
    *   Seal supports encrypting ephemeral symmetric keys, allowing separate management of the key and encrypted content.
*   **Decryption**:
    *   Requires creating a `SessionKey` object, which the user must sign in their wallet to grant time-limited access to decryption keys.
    *   The `decrypt` function on the `SealClient` requires the encrypted data, the `SessionKey`, and a `Transaction` object that invokes the `seal_approve*` functions.
    *   The `SealClient` caches keys to optimize performance. `fetchKeys` can be used for batch decryption of multiple keys.
    *   On-chain decryption is supported in Move using the `seal::bf_hmac_encryption` package, allowing encrypted objects to be used in on-chain logic (e.g., auctions, voting). It currently only works with HMAC-CTR mode.
    *   Testnet `PACKAGE_ID` for on-chain decryption is `0x4614e5da0136ee7d464992ddd3719d388ae2bfdb48dfec6d9ad579f87341f2e1`, and Mainnet is `0xbfc8d50ed03d52864779e5bc9bd2a9e0417a03c42830d3757c99289c779967b7`.
*   **Optimizing Performance**: Recommendations include reusing `SealClient` and `SessionKey` instances, disabling key server verification when not needed, including fully specified objects in PTBs, avoiding unnecessary key retrievals, and using `fetchKeys()` for batch decryption.

**For Key Server Operators**
*   Key servers can operate in **Open mode** or **Permissioned mode**.
*   **Open Mode**: Accepts decryption requests for any on-chain package using a single master key. This mode is for testing or best-effort services.
    *   Requires generating a BLS master key pair using `seal-cli genkey`.
    *   The key server must be registered on-chain using `sui client call --function create_and_transfer_v1` with the server name, URL, derivation index (0), and master public key.
    *   The key server is started by setting `MASTER_KEY` and `CONFIG_PATH` environment variables and running `cargo run --bin key-server` (or using Docker).
*   **Permissioned Mode**: Restricts access to explicitly allowlisted packages, with each client having a dedicated master key. This mode is recommended for B2B deployments.
    *   Requires generating a master seed using `seal-cli gen-seed`.
    *   The configuration file should set `server_mode` to `!Permissioned` and initially have empty `client_configs`.
    *   Clients are registered by calling `create_and_transfer_v1` with an unassigned derived public key (obtained by starting the server, which will log these keys), and then adding an entry to the config file for each client, specifying `client_master_key: !Derived` with a `derivation_index` and the `key_server_object_id`.
    *   **Export and Import Keys**: Client keys can be exported using `seal-cli derive-key` and imported by another key server by transferring the key server object on-chain and updating its URL. The new server config will then use `client_master_key: !Imported` with an environment variable for the key.
*   **Infrastructure Requirements**: Seal key servers are lightweight and stateless, allowing for horizontal scaling behind a load balancer. They require access to a trusted Sui Full node. Master keys (or seeds) must be stored securely using KMS or vaults. An API gateway or reverse proxy is recommended for HTTPS, rate limiting, authentication, and usage tracking. Prometheus-compatible metrics are exposed on port 9184, and a health check endpoint is on port 2024.
*   **CORS Configuration**: Recommended CORS headers include `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, OPTIONS`, and `Access-Control-Allow-Headers: Request-Id, Client-Sdk-Type, Client-Sdk-Version`, with additional headers for API keys if required.

**The CLI**
*   The `seal-cli` tool provides commands for `genkey` (generate key pairs), `encrypt-aes`, `symmetric-decrypt`, `extract` (user secret keys), and `decrypt`.
*   Examples demonstrate encrypting a message using public keys and decrypting it using either the symmetric key or a combination of extracted user secret keys and the encrypted object.
*   The `parse` command can be used to view the content of an encrypted object in a human-readable format.