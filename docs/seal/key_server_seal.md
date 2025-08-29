
The content of the webpage "https://github.com/MystenLabs/seal/blob/main/Pricing.md#verified-key-servers" details the Seal pricing model, focusing on "Verified key servers". Seal supports a decentralized network of independent key servers, allowing builders to choose providers for their encryption and decryption configurations. Each key server provider sets its own pricing and rate limits, which builders can evaluate based on their application needs. The documentation lists verified providers with links to their configuration, terms, and pricing.

Key servers operate in two modes: "Open" and "Permissioned". An "Open" mode key server allows anyone to request keys for any access policy package using a shared master key, suitable for public or trial use. A "Permissioned" mode key server restricts access to approved access policy packages, each with a dedicated master key, and supports key server rotation or switching, designed for dedicated or commercial use.

For the Testnet, several key servers are available in "Open" mode for experimentation, development, and testing, with a source-based rate limit that cannot be changed. These include:
*   **Mysten Labs:** `mysten-testnet-1` (Object Id: `0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75`, URL: `https://seal-key-server-testnet-1.mystenlabs.com`) and `mysten-testnet-2` (Object Id: `0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8`, URL: `https://seal-key-server-testnet-2.mystenlabs.com`).
*   **Ruby Nodes:** "Open" mode (URL: `https://seal-testnet.api.rubynodes.io`, Object Id: `0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2`) and "Permissioned" mode (URL: `https://starter-eu-central-1.api.rubynodes.io`, requires provider contact for client configuration).
*   **NodeInfra:** "Open" mode (URL: `https://open-seal-testnet.nodeinfra.com`, Object Id: `0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007`) and "Permissioned" mode (URL: `https://seal-testnet.nodeinfra.com`, requires provider contact).
*   **Studio Mirai:** "Open" mode (URL: `https://open.key-server-testnet.seal.mirai.cloud`, Object Id: `0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2`) and "Permissioned" mode (URL: `https://private.key-server.testnet.seal.mirai.cloud`, requires provider contact).
*   **Overclock:** "Open" mode (URL: `https://seal-testnet-open.overclock.run`, Object Id: `0x9c949e53c36ab7a9c484ed9e8b43267a77d4b8d70e79aa6b39042e3d4c434105`) and "Permissioned" mode (URL: `https://seal-testnet-permissioned.overclock.run`, requires provider contact).
*   **H2O Nodes:** "Open" mode (URL: `https://seal-open.sui-testnet.h2o-nodes.com`, Object Id: `0x39cef09b24b667bc6ed54f7159d82352fe2d5dd97ca9a5beaa1d21aa774f25a2`) and "Permissioned" mode (URL: `https://seal-permissioned.sui-testnet.h2o-nodes.com`, requires provider contact).
*   **Triton One:** "Open" mode (URL: `https://seal.testnet.sui.rpcpool.com`, Object Id: `0x4cded1abeb52a22b6becb42a91d3686a4c901cf52eee16234214d0b5b2da4c46`) and "Permissioned" mode (URL: `https://seal.testnet.sui.rpcpool.com/private`, requires provider contact).

It is important to note that Testnet key servers are for developer testing only and do not guarantee availability, SLAs, or long-term key persistence. Users should avoid encrypting data they expect to access reliably in the future with these servers. The URL for a key server may change, but the `Object Id` remains the source of truth for the latest URL.

Information regarding Mainnet key servers is listed as "Coming soon".




