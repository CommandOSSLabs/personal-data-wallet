

# **An Architectural Deep Dive: Secure, Decentralized Vector Embeddings on Sui**

## **Section 1: Executive Summary**

This report provides a comprehensive analysis of a novel architecture for secure vector embedding storage and retrieval. The system synergistically combines the Sui blockchain as a control plane, Walrus decentralized storage as a data plane, and an off-chain compute plane for processing, all secured by Mysten Labs' Seal for programmable, on-chain-verified access control. This architecture is designed to address the critical challenge of enabling large-scale, efficient similarity search on vector data while upholding stringent privacy and security guarantees, a paramount concern in the age of generative AI and data-intensive applications.

The core value proposition of this architecture lies in its ability to perform efficient, large-scale similarity searches on non-sensitive metadata while guaranteeing that the core, high-value vector embeddings remain encrypted and accessible only to authorized users. This is achieved through an innovative, privacy-preserving, two-stage query process. The system first identifies potentially relevant data through a rapid, off-chain search on public metadata, and only then initiates a secure, on-chain-verified process to retrieve and decrypt the sensitive payload. This bifurcation of concerns allows the system to achieve performance comparable to centralized solutions without sacrificing the core tenets of user sovereignty and data confidentiality.

The architecture is built upon four key technological pillars, each a state-of-the-art component within the Web3 ecosystem:

* **Sui:** The Sui blockchain serves as the on-chain control plane, leveraging its unique object-centric data model and low-latency transaction processing to manage ownership records and pointers to off-chain data with high efficiency and verifiability.1  
* **HNSW (Hierarchical Navigable Small World):** This powerful Approximate Nearest Neighbor (ANN) search algorithm is employed in an off-chain "memory layer" to create a highly efficient, searchable index of metadata vectors. HNSW enables logarithmic-time similarity searches, making the system scalable to billions of entries.2  
* **Walrus with Quilt:** Walrus provides a decentralized, highly available, and integrity-verifiable storage layer for large data blobs, such as the encrypted vector embeddings and the HNSW index files themselves.4 Its unique Quilt format optimizes the storage of many small files, significantly reducing costs and overhead, which is crucial for managing complex index structures.5  
* **Seal (Identity-Based Encryption):** Developed by Mysten Labs, Seal provides the critical security layer. It revolutionizes access control by using Identity-Based Encryption (IBE) to link decryption capabilities directly to verifiable on-chain conditions defined in Move smart contracts. This allows for fine-grained, programmable, and transparent access policies enforced by a decentralized network of key servers.6

This document is intended for technical leaders, system architects, and senior engineers who are evaluating advanced data management and security solutions in the Web3 space. It meticulously dissects the system's components, their interactions, and the underlying cryptographic and distributed systems principles. The analysis aims to provide the necessary depth to inform strategic technology decisions, guide system design, and showcase the potential of a cohesively designed, Web3-native technology stack.

## **Section 2: Architectural Overview & Core Principles**

A thorough understanding of this architecture begins with deconstructing its constituent parts and the fundamental principles that govern their interaction. The system is logically partitioned into three distinct operational planes, each with a specialized role, working in concert to deliver a secure and performant vector search experience.

### **Deconstructing the System Diagram**

The provided architectural diagram illustrates a sophisticated interplay between on-chain and off-chain components, which can be categorized into three planes of operation:

* **Sui Control Plane:** This is the on-chain, authoritative layer. It consists of the Vector Index Contract, a Move smart contract package deployed on the Sui blockchain. Its role is not merely to store data but to serve as the immutable source of truth for ownership, data pointers, and the access control policies that govern the data. It is the system's anchor of trust and verifiability.8  
* **Off-Chain Compute Plane:** This is the high-performance "workhorse" of the system, responsible for all computationally intensive and latency-sensitive tasks that are ill-suited for a blockchain environment. This plane comprises three key services: the Client Application that initiates requests, the Embedding Service that transforms raw text into vector embeddings using machine learning models, and the Indexer & Query Node that builds and queries the metadata index.8  
* **Walrus Data Plane:** This is the decentralized persistence layer designed for storing large, unstructured data blobs. In this architecture, it is responsible for storing two critical types of data: the serialized HNSW index files generated by the indexer and, most importantly, the encrypted vector embedding blobs themselves. It ensures data is highly available, durable, and retrievable via content-addressable identifiers.4

### **Fundamental Principle: Separation of Search and Retrieval**

The architecture is founded upon a crucial design pattern: the strict separation of the fast, unencrypted search over low-sensitivity metadata from the secure, permissioned retrieval of high-sensitivity encrypted data.8 This principle is the cornerstone of the system's ability to simultaneously offer privacy, performance, and cost-effectiveness.

The metadata, which is either non-sensitive or pseudo-anonymized, is indexed off-chain using the HNSW algorithm. This allows the Indexer & Query Node to perform rapid similarity searches without any interaction with the blockchain or the need for complex cryptographic operations. This search process can be scaled horizontally using standard cloud computing resources, just like a conventional web service.

The core data—the valuable vector embeddings—remains encrypted at all times within the Walrus data plane. It is only after a relevant item has been identified through the metadata search that the system initiates the second stage: a secure retrieval process. This second stage involves the client proving its right to access the specific data blob by interacting with the Seal protocol, which in turn verifies the client's authorization against immutable rules defined on the Sui control plane. This separation ensures that computationally expensive decryption and on-chain verification are only performed for a small, targeted subset of data that the user has already identified as potentially valuable.

### **High-Level Process Flows**

The architecture's operations can be understood through two primary workflows:

* **Data Ingestion:** A client application sends raw text to the embedding service. The resulting vector is then encrypted client-side using Seal. The client then initiates an on-chain transaction to the Vector Index Contract to register the new data, storing a pointer to the encrypted blob on Walrus. This on-chain transaction emits an event that notifies the off-chain Indexer & Query Node to update its HNSW index with the new metadata. The indexer then stores its updated index file on Walrus.  
* **Data Querying:** A client application sends a query vector to the Indexer & Query Node, which performs a fast HNSW search on the metadata and returns a list of identifiers for the most similar items. The client then selects an item and initiates the Seal decryption process. This involves constructing a transaction to prove access rights to the on-chain Vector Index Contract, which is validated by Seal's key servers. Upon successful validation, the client receives the decryption key, fetches the encrypted blob from Walrus, and decrypts it locally.

The selection of components within this architecture is not arbitrary; it represents a purpose-built, Web3-native stack where each part is designed to work in synergy. While a generic architecture might attempt to combine disparate elements like Ethereum for control, Arweave for storage, and a centralized Key Management Service (KMS) for security, this system leverages a tightly integrated suite of tools primarily from the Mysten Labs and Sui ecosystem.9 Sui's object model is uniquely suited for managing the ownership and state of the data pointers.1 Walrus is a storage protocol purpose-built for the high-integrity blob storage this system requires, going beyond simple file pinning.4 Most critically, Seal is explicitly designed to use Sui's Move language as the foundation for its on-chain access control policies, creating a seamless link between the security layer and the control plane.6 This tight integration yields significant performance, security, and developer experience advantages over a more heterogeneous and loosely coupled stack. The result is a system where the components are not just connected but are deeply complementary.

## **Section 3: The Sui Control Plane: On-Chain Logic and State Management**

The Sui Control Plane is the authoritative core of the architecture, providing the on-chain foundation for data ownership, location, and access policy. It leverages the unique features of the Sui blockchain and the Move programming language to create a robust and efficient management layer that governs the entire system.

### **The Vector Index Contract: More Than a Pointer Store**

At the heart of the control plane is the Vector Index Contract, a custom Move package deployed on the Sui blockchain.8 Its primary function is to manage the on-chain state associated with each secure vector embedding. This goes far beyond simply storing a list of pointers. By leveraging Sui's object-centric data model, the contract defines a custom data structure—a struct that can be thought of as a

SecureEmbeddingPointer object.1

This custom object, defined with the necessary key and store abilities to be treated as a persistent on-chain asset, would contain several critical fields.1 These include the address of the object's owner, a content-addressable identifier pointing to the corresponding encrypted data blob on Walrus (e.g., its hash), and potentially the unencrypted metadata vector itself or a hash of it for integrity checks.

Sui's architecture offers distinct advantages for managing these objects. If an object is owned by a single address, transactions that modify it can often bypass the more complex consensus process required for shared objects, resulting in very low latency and high throughput.10 This is ideal for use cases where users manage their own private data sets. For scenarios involving data shared among multiple users, the object can be designated as a shared object, in which case Sui's consensus mechanism ensures safe, concurrent access. This flexibility allows the architecture to cater to a wide range of applications, from personal AI assistants to collaborative data platforms.

### **Communicating Off-Chain: The Notify Mechanism and Sui Events**

The "Notify" arrow in the architecture diagram, pointing from the Vector Index Contract to the Indexer & Query Node, represents a critical communication channel between the on-chain and off-chain worlds. This link is implemented using Sui's native event system.8

When a transaction successfully interacts with the Vector Index Contract—for instance, to add a new embedding—the Move code can emit a custom event using the event::emit\<MyEvent\>(...) function call.13 This event is a structured piece of data that is immutably recorded on the blockchain as part of the transaction's effects. The event can contain all the necessary information for the off-chain indexer, such as the newly created object's ID and its associated metadata vector.

The Indexer & Query Node runs an off-chain service that subscribes to this specific event type from the Sui network's RPC endpoints.14 This is a common pattern in blockchain development, where off-chain indexers listen for on-chain events to keep their own state synchronized.15 Specialized tools like

sui-events-indexer can even automate the generation of the necessary boilerplate code, creating a ready-to-use service that consumes these events and populates a database or, in this case, an in-memory index.13 This event-driven mechanism is highly efficient and reliable, ensuring that the off-chain compute plane is always aware of relevant changes happening on the control plane.

### **Atomicity and Composability with Programmable Transaction Blocks (PTBs)**

A key feature of Sui that enhances the robustness of the control plane is the Programmable Transaction Block (PTB). A PTB allows a client to compose up to 1024 individual operations into a single, atomic transaction that either succeeds or fails as a whole.10

This is immensely powerful for the data ingestion process. A client can construct a single PTB that performs multiple related actions atomically. For example, a PTB could: 1\) call the Vector Index Contract to create the new SecureEmbeddingPointer object, 2\) transfer ownership of a related capability object to the user, and 3\) interact with another on-chain protocol, such as a decentralized identity system. This atomicity guarantees that the on-chain state is never left in an inconsistent or intermediate state, which is a critical property for complex applications. Furthermore, the Seal protocol itself relies on the evaluation of PTBs to verify access rights, making PTBs a foundational element for both data management and security in this architecture.6

The role of the Sui control plane extends beyond simple data management; it functions as a sovereign anchor for the digital identity and access policies of the off-chain data. The on-chain object, with its explicit owner, establishes a clear, cryptographically secure link between a user's wallet and their data. The access control logic itself is embodied in another on-chain object—the Seal Move package identified by its PkgId.6 Consequently, all critical information about a piece of data—who owns it, where it is stored, and, most importantly, the rules governing how it can be accessed—is rooted in the Sui blockchain's immutable and publicly verifiable state. This design elevates the blockchain from a mere database to a comprehensive identity and policy enforcement layer. The off-chain components, such as the Indexer and the Seal Key Servers, are powerful but ultimately subservient to this on-chain truth. They execute computationally intensive tasks, but the fundamental rules of engagement are dictated and arbitrated on-chain, fulfilling a core promise of Web3 architecture.17

## **Section 4: The Walrus Data Plane: Decentralized and Efficient Blob Storage**

The Walrus Data Plane serves as the decentralized persistence layer for the architecture, tasked with the secure and reliable storage of large data blobs. It is specifically designed to provide high levels of data integrity and availability, making it a suitable foundation for storing the system's most valuable assets: the encrypted vector embeddings and the HNSW index files.

### **Walrus Fundamentals: High-Integrity Decentralized Storage**

Walrus is not a simple decentralized file storage network or a content pinning service; it is an advanced decentralized storage system engineered for high-integrity and high-availability blob storage.4 It is designed to provide strong guarantees about the durability and correctness of stored data, which is essential for enterprise-grade applications.

At the heart of Walrus is the **RedStuff protocol**, a novel two-dimensional erasure coding scheme.4 Traditional replication-based storage systems achieve durability by storing multiple full copies of the data, which is expensive. Erasure coding, by contrast, breaks data into fragments and adds mathematically derived parity fragments. The original data can be reconstructed from a subset of these fragments. RedStuff enhances this with a two-dimensional approach that provides robust security and availability with a relatively low storage overhead (a 4.5x replication factor).18 A key innovation of RedStuff is its "self-healing" property: if a storage node loses its data fragment, it can efficiently reconstruct it by communicating with other nodes in the network. This process requires bandwidth proportional only to the size of the lost fragment, not the entire blob, making the system highly resilient to the constant churn of nodes joining and leaving the network.18 This focus on provable data availability and integrity distinguishes Walrus from more basic decentralized storage solutions and makes it a reliable choice for this architecture.

### **Special Focus: The Quilt Format for Optimized Storage**

A significant challenge in many data-intensive applications is the efficient management of a large number of small files. The Indexer & Query Node in this architecture produces HNSW index files. A large, complex HNSW graph can be composed of multiple files representing different layers and metadata segments. Storing each of these small files individually on a decentralized storage network can be highly inefficient, as each file incurs significant storage and transaction overhead.5

Walrus addresses this problem directly with its **Quilt** format, a native batch storage solution.5 Quilt allows an application to bundle up to approximately 660 small files into a single logical storage unit, the "Quilt." This process dramatically reduces the per-file overhead, leading to substantial cost savings in both the WAL storage token and the SUI gas fees associated with the on-chain storage transaction.5 Leading projects in the Sui ecosystem are already leveraging Quilt to optimize their storage architecture for precisely this reason.5

Critically, the efficiency gains from batching do not compromise retrieval performance. A client can access an individual file (referred to as a "patch") within a Quilt without needing to download the entire bundle.5 This feature is vital for the query process. For example, during an HNSW search, the query node may only need to load specific layers of the index into memory. Quilt allows it to do so efficiently, providing the cost savings of batching with the low-latency, individual access of traditional file storage.

### **Interaction with the Control Plane**

The interaction between the Walrus Data Plane and the Sui Control Plane is straightforward and decoupled. The Vector Index Contract on Sui does not store the data blobs themselves; it only stores a content-addressable identifier for each blob, such as its SHA-256 hash.8 When a client needs to retrieve a data blob (e.g., an encrypted embedding), it first queries the Sui object to get this identifier. It then uses this identifier to request the blob directly from the decentralized network of Walrus storage nodes. This decoupled design keeps the Sui blockchain light and fast, offloading the burden of large data storage to the specialized Walrus network.

The introduction of the Quilt format is more than just a cost-saving measure; it is a key enabler for building complex, sharded data architectures at scale. While Quilt is often marketed for simple use cases like storing NFT collections or chat logs 5, its application to HNSW index files reveals a more profound utility. A common strategy for scaling vector search to billions of items is to shard the index—that is, to break one massive index into hundreds or thousands of smaller, independent indexes. Managing this vast number of sharded index files would be an operational and financial nightmare using a traditional one-file-per-transaction storage model. Quilt provides a native, API-driven solution to manage these shards as a single logical unit while retaining the ability to access each shard individually. It effectively abstracts away the complexity of managing a large set of related files. This indicates that the architecture was designed from the ground up with massive scale in mind. The system's architects anticipated the "many small file" problem that arises from advanced indexing techniques and incorporated a purpose-built solution to address it, making large-scale index sharding not just a theoretical possibility but an operationally and economically viable strategy.

## **Section 5: The Off-Chain Compute Plane: Embedding, Indexing, and Querying**

The Off-Chain Compute Plane is the engine of the architecture, performing the computationally intensive tasks of data processing, indexing, and querying. It operates outside the constraints of the blockchain to provide the speed and scalability necessary for a modern AI application, while remaining tethered to the on-chain control plane for rules and state.

### **Part A: The Embedding Service**

The journey of data into the system begins at the Embedding Service. This component's function is to receive raw, unstructured data—in this case, text—from the Client Application and transform it into a high-dimensional numerical vector, known as an embedding.8 This transformation is accomplished using a pre-trained machine learning model, such as a sentence-transformer from the BERT family.

The choice of embedding model is a critical system parameter, as it defines the semantic space in which all similarity comparisons will be made. A well-chosen model will place texts with similar meanings close to each other in the high-dimensional vector space, enabling effective semantic search.20 This process is relegated to an off-chain service because ML model inference is a computationally demanding task, involving large matrix multiplications that are entirely unsuitable for execution within a blockchain's virtual machine. The service acts as a specialized microservice, focused solely on this transformation.

### **Part B: The Memory Layer & HNSW**

Once embeddings are created, they need to be indexed for efficient search. For high-dimensional data, performing an exact nearest neighbor search—calculating the distance from a query vector to every other vector in the dataset—is computationally prohibitive. The time complexity of such a search is linear, O(N), which does not scale to millions or billions of items.2 The solution is to use an Approximate Nearest Neighbor (ANN) algorithm, which trades a small, often negligible amount of accuracy for a massive improvement in search speed.

This architecture employs the Hierarchical Navigable Small World (HNSW) algorithm, a graph-based ANN technique that consistently delivers state-of-the-art performance in terms of speed and recall.2 HNSW organizes the data points (metadata vectors) into a multi-layered graph structure that functions like a multi-resolution map.20

* **Layered Structure:** The graph is hierarchical. The topmost layer is very sparse and contains long-range links that connect distant parts of the data space, akin to a highway system. Each subsequent layer becomes progressively denser, with shorter-range links that provide finer-grained navigation, like local city streets.3 If a node exists on a given layer, it also exists on all layers below it.  
* **Search Process:** A search begins at a pre-defined entry point in the sparse top layer. The algorithm greedily traverses the graph, always moving to the neighbor closest to the query vector. When it reaches a point where no neighbor is closer, it "zooms in" by dropping down to the next, denser layer and continues the greedy search. This coarse-to-fine traversal allows the algorithm to quickly navigate to the correct region of the graph without having to evaluate every point, resulting in a highly efficient search with (poly)logarithmic complexity, O(logN).2

The Indexer & Query Node would implement this using a standard, highly optimized library such as FAISS (developed by Meta AI), the original authors' hnswlib, or a custom implementation tailored for the system's needs.2 The project documentation also mentions the potential integration of the

mem0 SDK, which could provide a more managed and feature-rich "memory layer" for these operations.8

The performance of an HNSW index is not a fixed property but a result of carefully tuned parameters that balance trade-offs between index construction time, memory usage, search speed, and accuracy (recall). Understanding these parameters is crucial for any technical stakeholder aiming to optimize the system.

| Parameter | Description | Impact of Increasing the Value |
| :---- | :---- | :---- |
| M | The number of neighbors connected to each node during index construction. | Increases index build time and memory usage. Improves recall (accuracy). |
| efConstruction | The size of the dynamic candidate list during index construction. | Significantly increases index build time. Leads to a higher quality index with better recall. |
| efSearch | The size of the dynamic candidate list during search. | Increases search latency. Significantly improves recall (accuracy). |
| mL | Normalization factor for the random layer assignment probability. | Higher values increase the probability of nodes being inserted into higher layers, making the graph sparser at the top. |

### **Part C: The Indexer & Query Node**

This Python service is the central hub of the off-chain plane, orchestrating both the indexing of new data and the handling of search queries.8 It has two primary responsibilities:

1. **Indexing:** The node runs a persistent service that listens for Notify events emitted by the Vector Index Contract on the Sui Control Plane.13 When it receives an event signaling the addition of a new vector, it extracts the associated metadata vector and inserts it into the HNSW graph that it holds in memory. To ensure durability, the node periodically serializes the entire HNSW index structure and saves it to the Walrus Data Plane, likely using the Quilt format to efficiently bundle the index files.5  
2. **Querying:** The node exposes a standard API endpoint (e.g., a REST or gRPC API) for the Client Application. When it receives a query vector, it executes the HNSW search algorithm on its in-memory index. The search returns a ranked list of identifiers corresponding to the top-k most similar metadata vectors. These identifiers are then sent back to the client, concluding the first stage of the query process.

This component's design aligns with established architectural patterns for blockchain indexers.15 It acts as a specialized, high-performance read cache that is kept in sync with the on-chain state through an event-driven mechanism. By doing so, it decouples the fast read path (querying) from the slower, more deliberate write path (on-chain transactions), which is a classic strategy for building scalable blockchain applications.

## **Section 6: The Security Layer: Mysten Labs' Seal and Identity-Based Encryption**

The security of the entire architecture hinges on Mysten Labs' Seal, a decentralized secrets management service that provides robust, programmable encryption and access control. Seal moves beyond traditional key management systems by deeply integrating with the Sui blockchain to enforce access policies in a transparent and verifiable manner.

### **Core Concept: Identity-Based Encryption (IBE)**

Seal's cryptographic foundation is Identity-Based Encryption (IBE).6 To understand its significance, it is useful to contrast it with traditional Public Key Infrastructure (PKI). In PKI, a user's public key is a large, random-looking string of numbers, and a certificate authority is needed to bind this key to a real-world identity. In an IBE scheme, any arbitrary string can function as a public key. This could be a human-readable identifier like an email address or, more powerfully, a programmatic identifier derived from on-chain data.6

In an IBE system, a trusted entity called a Private Key Generator (PKG) holds a single "master secret key." Using this master secret, the PKG can generate the unique private key corresponding to any given public key (identity string). Seal leverages this paradigm by using IBE as a Key Encapsulation Mechanism (KEM). The IBE scheme is used to encrypt a small, symmetric data encryption key (DEK). This DEK is then used with a standard symmetric cipher, or Data Encapsulation Mechanism (DEM), to encrypt the actual large data blob (the vector embedding). This hybrid approach combines the flexible keying of IBE with the efficiency of symmetric encryption.6

### **The Seal Paradigm: On-Chain Policy, Off-Chain Enforcement**

The most innovative aspect of Seal is how it decentralizes the role of the PKG, splitting its function into on-chain policy definition and off-chain enforcement. This creates a system where access control is not determined by an opaque, centralized server but by transparent, auditable code on the Sui blockchain.6

1. **On-Chain Access Policies:** A developer defines access control rules by writing a standard Move package and deploying it to Sui. This package must expose a specific function, such as seal\_approve, which contains the authorization logic.6 The "identity" used for encryption is programmatically bound to this package's on-chain address (  
   PkgId). For example, an identity might be constructed as the string \[PkgId\]\[user\_address\]\[timestamp\]. The logic within the seal\_approve function would then verify if the requester is indeed the user\_address and if the current on-chain time is past the timestamp. This allows for incredibly flexible and expressive policies, such as token-gated access (checking if a user holds a specific NFT), time-locks, or allowlists.26  
2. **Off-Chain Key Servers:** These are lightweight services that each hold a share of the IBE master secret key. When a user wants to decrypt a piece of data, they request the corresponding private key from one or more of these servers. Crucially, the key server **does not** make the access decision itself. Instead, the user must provide a valid Programmable Transaction Block (PTB) along with their request. The key server takes this PTB and validates it against a trusted Sui full node in a read-only context. If the PTB executes successfully—meaning the seal\_approve function returns true—the server considers the request authorized. Only then will it use its master secret to generate the requested private key and return it to the user.6

### **Distributing Trust: Threshold Encryption and Decentralization**

Relying on a single key server would reintroduce a central point of failure and trust. Seal is explicitly designed to mitigate this risk through a t-out-of-n threshold encryption model.7 When encrypting data, a user can split the secret across

n independent key servers such that any t of them must collaborate to reconstruct the decryption key. This model provides two powerful guarantees:

* **Privacy:** The data remains confidential as long as fewer than t of the key servers are compromised or collude.  
* **Liveness:** The data remains accessible and recoverable as long as at least t of the key servers are online and operational.

This framework allows users to distribute their trust across multiple entities, which may be operated by different organizations in different legal jurisdictions.6 This decentralization is a core tenet of the system's design. The architecture also envisions that a single logical key server could itself be implemented by a Multi-Party Computation (MPC) committee, further enhancing security by ensuring no single machine ever holds the complete master secret.7

### **Storage Agnosticism and Synergy with Walrus**

Seal is designed to be storage-agnostic. It provides an encryption and access control layer that can secure data stored anywhere, whether on-chain or off-chain, on Walrus or any other system.7 However, its combination with Walrus creates a particularly powerful and cohesive solution for building secure, decentralized applications. This synergy is aptly summarized by the phrase: "Think of Seal as the lock, and Walrus as the vault".11 Together, they form a complete pipeline for managing the lifecycle of sensitive data in a decentralized environment.

The intricate flow of information between the client, the on-chain policy, and the off-chain key server is the heart of Seal's security model. The following table breaks down this process step-by-step.

| Step | Actor | Action | Purpose |
| :---- | :---- | :---- | :---- |
| 1 | Client | Constructs a Programmable Transaction Block (PTB) that satisfies the seal\_approve logic in the on-chain Move package. | To create a verifiable, on-chain proof of authorization. |
| 2 | Client | Signs a request containing the IBE identity and the PTB, and sends it to a Seal Key Server. | To formally request the decryption key for the specific data. |
| 3 | Seal Key Server | Receives the request and connects to a trusted Sui Full Node. | To prepare for on-chain validation. |
| 4 | Seal Key Server | Executes the client's PTB in a read-only context against the Sui blockchain state. | To verify if the client meets the on-chain access control conditions defined in the seal\_approve function. |
| 5 | Seal Key Server | If PTB execution succeeds, uses its IBE Master Secret Key to derive the private key for the requested identity. | To generate the one-time decryption key. |
| 6 | Seal Key Server | Encrypts the derived private key (using a public key provided by the client in the request) and returns it. | To securely deliver the decryption key only to the original requester. |
| 7 | Client | Decrypts the response to get the IBE private key. | To obtain the final key needed to decrypt the data blob. |

## **Section 7: End-to-End Process Flows**

To fully appreciate how the individual components of the architecture work together, it is instructive to walk through the two primary end-to-end process flows: adding a new vector to the system and executing a secure query to retrieve it.

### **Flow 1: Adding a New Vector (A Step-by-Step Walkthrough)**

This flow describes the entire data ingestion pipeline, from raw text to a securely stored and indexed embedding.

1. **Client Application \- Text Submission:** A user interacts with the Client Application, submitting a piece of raw text they wish to embed and store securely. The application forwards this text to the Embedding Service.  
2. **Embedding Service \- Vectorization:** The Embedding Service processes the raw text using its sentence-transformer model. It generates the high-dimensional vector embedding. It may generate a single vector or separate vectors for metadata and the main data, returning them to the Client Application.8  
3. **Client Application \- Encryption with Seal:** The client now prepares the main data vector for secure storage. It initiates the Seal encryption process. This involves selecting an access control policy (which corresponds to a specific Move package PkgId on Sui) and constructing the IBE identity string. The client then uses the public keys of its chosen t-out-of-n Seal servers to perform the IBE encryption, securely wrapping the key needed to encrypt the vector blob.6  
4. **Client Application \- Storage on Walrus:** The client takes the resulting encrypted data blob and uploads it to the Walrus decentralized storage network. In return, it receives a unique, content-addressable identifier (e.g., a hash) for the blob. This identifier serves as a permanent and verifiable pointer to the data.  
5. **Client Application \- On-Chain Registration:** With the data securely stored, the client constructs and submits a Programmable Transaction Block (PTB) to the Sui blockchain. This PTB invokes a function on the Vector Index Contract. The function call creates a new on-chain object that records the essential information: the owner's address, the Walrus hash of the encrypted blob, and the unencrypted metadata vector associated with it.  
6. **Sui Control Plane \- Event Emission:** The transaction is processed by the Sui network. The Vector Index Contract successfully executes, creating the new object. As part of its logic, it emits an EmbeddingAdded event. This event contains the new object's ID and its metadata vector, making the change publicly visible to any interested off-chain party.13  
7. **Indexer & Query Node \- Index Update:** The Indexer & Query Node, which is continuously listening for events from the Sui network, detects the EmbeddingAdded event. It parses the event data, extracts the metadata vector, and inserts it into its in-memory HNSW index. To ensure persistence and disaster recovery, the node periodically serializes its entire HNSW index structure and saves it as a Quilt blob on Walrus, overwriting the previous version.5

### **Flow 2: Executing a Secure Query (The Two-Stage Process)**

This flow demonstrates the core privacy-preserving query mechanism, separating the initial search from the final, permissioned retrieval.

1. Stage 1 \- Metadata Search (Fast and Unencrypted):  
   a. Client Application \- Query Submission: A user enters a search query (as text) into the Client Application. The application sends this text to the Embedding Service (or uses a local model) to convert it into a query vector. This vector is then sent to the Indexer & Query Node.  
   b. Indexer & Query Node \- HNSW Search: The Indexer & Query Node receives the query vector and performs an HNSW search against its in-memory metadata index. This search is extremely fast, as it operates on unencrypted data and does not involve any blockchain interaction. The node returns a ranked list of the object IDs corresponding to the top-k most similar metadata vectors found in the index.8  
2. Stage 2 \- Secure Retrieval and Decryption (Permissioned and Verifiable):  
   a. Client Application \- Object Data Retrieval: The user selects a result from the list returned by the indexer. The Client Application now has the Sui object ID for the desired item. It queries the Sui blockchain for the full data of this object. The response from Sui includes the Walrus hash of the encrypted data blob and the Seal policy identity associated with it.  
   b. Client Application \- Requesting the Decryption Key: The client now initiates the Seal decryption flow as detailed in Section 6, Table 2\. It constructs a PTB designed to successfully execute the seal\_approve function for the given object, thereby proving its access rights. It sends this PTB in a signed request to the necessary number of Seal Key Servers. The servers validate the PTB against the Sui blockchain and, if successful, return the IBE private key required for decryption.  
   c. Client Application \- Fetching Encrypted Data: Concurrently or sequentially, the client uses the Walrus hash it retrieved from the Sui object to request the encrypted data blob directly from the Walrus storage network.  
   d. Client Application \- Final Decryption: With both the encrypted data blob from Walrus and the IBE private key from Seal in its possession, the Client Application can now perform the final decryption. It uses the IBE key to unlock the blob, revealing the original, high-value vector embedding for use within the application.

This two-stage process elegantly solves the dilemma of balancing performance and privacy. The "heavy lifting" of searching through a massive dataset is offloaded to a fast, off-chain indexer, while the "heavy security" of cryptographic decryption and on-chain access control is reserved for only the specific items the user has expressed interest in.

## **Section 8: Synthesis, Analysis, and Recommendations**

This architecture represents a sophisticated, forward-looking approach to managing sensitive AI-related data in a decentralized environment. By carefully composing best-in-class components from the Sui ecosystem, it achieves a compelling balance of performance, security, and user sovereignty. A holistic analysis reveals its strengths, potential challenges, and ideal use cases.

### **Security Posture Analysis**

The security model is arguably the architecture's most significant strength, offering multiple layers of protection.

* **Strengths:**  
  * **End-to-End Encryption:** The core data (vector embeddings) is encrypted client-side and remains encrypted at rest on Walrus and in transit. It is only ever decrypted on the authorized user's client machine.  
  * **Decentralized and Transparent Policies:** Access control logic is not hidden within a centralized service's private infrastructure. It is defined in open, auditable Move smart contracts on the Sui blockchain, allowing anyone to verify the rules of access.6  
  * **Distributed Trust:** The t-out-of-n threshold design for Seal Key Servers eliminates the single point of failure and trust inherent in centralized KMS solutions. An attacker must compromise a threshold number of independent servers to breach data privacy.7  
  * **User Sovereignty:** The model fundamentally places control in the hands of the data owner. The owner's on-chain assets and identity dictate access, not a platform's policy.  
* **Threat Vectors & Mitigations:**  
  * **Compromised Seal Key Server:** The primary mitigation is the t-out-of-n threshold model. For a 2-out-of-3 configuration, an attacker would need to compromise two independent servers to gain the ability to generate decryption keys. The risk is proportional to the threshold t chosen by the user.  
  * **Vulnerable Move Contract:** A bug or logical flaw in the seal\_approve function of the on-chain access policy could be exploited to grant unauthorized access. This risk is mitigated by the public and transparent nature of on-chain code, which allows for rigorous security audits. However, a critical trust assumption exists for upgradeable packages: a malicious package owner could upgrade the contract to a version with a backdoor.6 Users must trust the governance process of the packages they use.  
  * **Client-Side Vulnerabilities:** As encryption and decryption occur on the client, the security of the end-user's machine is paramount. Malware, phishing attacks, or a compromised Client Application could lead to the exposure of private keys and decrypted data. This is an inherent challenge in any client-side security model.

### **Performance & Scalability Analysis**

The architecture is designed for high performance and scalability by intelligently separating on-chain and off-chain workloads.

* **Bottlenecks:** The primary source of user-perceived latency in the query process is the sequential nature of its two stages. Stage 1 (HNSW search) is extremely fast, typically taking milliseconds. Stage 2 (secure retrieval) involves several network round-trips: one to Sui to fetch the object data, one or more to the Seal Key Server(s) for key derivation (which itself involves an on-chain read), and one to Walrus to fetch the data blob. The Seal key request, with its on-chain validation step, is likely the most significant contributor to latency in Stage 2\.  
* **Scalability:**  
  * **Read/Query Scalability:** The read path is highly scalable. The Indexer & Query Node is a standard stateless service that can be replicated and placed behind a load balancer to handle a massive volume of incoming queries. For extremely large datasets, the HNSW index itself can be sharded into multiple smaller indexes, a strategy made operationally and economically feasible by Walrus's Quilt format for managing the resulting file sets.  
  * **Write/Ingestion Scalability:** The write throughput is ultimately gated by the capacity of the Sui blockchain to process the on-chain registration transactions and the ability of the off-chain indexer to consume the event stream without falling behind. Sui's architecture is designed for high throughput, but this remains the upper bound for the system's ingestion rate.

### **Operational Complexity**

Deploying and maintaining this architecture is a non-trivial undertaking. It is a distributed system composed of multiple interacting services.

* **Deployment:** An organization would need to deploy and manage the Indexer & Query Node and the Embedding Service. If they choose not to rely on third-party Seal providers, they would also need to deploy and, more importantly, secure their own Seal Key Servers.  
* **Key Management:** The operational burden of securing the IBE master secret keys for Seal servers is immense. These keys are the foundation of the security model and must be protected with the highest level of operational security, potentially involving hardware security modules (HSMs) or secure enclaves.  
* **Monitoring and Maintenance:** Each component—the on-chain contract, the off-chain services, and the interaction with the public Sui and Walrus networks—requires robust monitoring to ensure health, performance, and security.

### **Comparative Analysis & Recommendations**

When compared to alternative approaches, the unique value proposition of this architecture becomes clear.

* **vs. Centralized Solutions (e.g., Pinecone \+ AWS KMS):** Centralized solutions offer simplicity and ease of use but at the cost of transparency and user control. In a centralized model, access policies are opaque rules within the provider's system, and the user must place absolute trust in the provider not to access their data. The proposed architecture offers superior decentralization, verifiable on-chain policies, and true user sovereignty. The trade-off is a significant increase in operational complexity.  
* **vs. Fully On-Chain Solutions:** Attempting to perform vector search directly on a blockchain is currently computationally infeasible due to the "curse of dimensionality" and would be prohibitively expensive in terms of gas fees. This hybrid model represents a pragmatic and highly effective compromise, leveraging the blockchain for what it does best (enforcing rules and ownership) and off-chain systems for what they do best (heavy computation).

**Recommendations:**

This architecture is exceptionally well-suited for a new generation of decentralized applications that require both high-performance data processing and uncompromising security and user control. It is particularly recommended for:

1. **Verifiable, Programmable Access Control:** Use cases where access rules are dynamic and need to be transparently enforced. Examples include token-gated AI services, exclusive content for NFT holders, data DAOs where access is governed by on-chain voting, and secure data marketplaces.  
2. **User Sovereignty over Sensitive Data:** Applications where users, not the platform, must retain ultimate control over their personal or sensitive data. This includes decentralized social media, secure messaging applications, and platforms for managing private health or identity documents.  
3. **High-Performance, Privacy-Preserving Search:** Any system that needs to provide fast semantic search over millions or billions of items but cannot expose the underlying data. This is relevant for confidential enterprise search, private AI assistants, and research platforms dealing with sensitive information.

Organizations considering this architecture should perform a careful cost-benefit analysis, weighing the significant advantages in security, decentralization, and user trust against the non-trivial operational commitment required to deploy and manage it. For those building the next wave of truly decentralized, data-intensive applications, this architecture provides a powerful and compelling blueprint for success.

#### **Nguồn trích dẫn**

1. The Sui Smart Contracts Platform, truy cập vào tháng 7 29, 2025, [https://docs.sui.io/paper/sui.pdf](https://docs.sui.io/paper/sui.pdf)  
2. Hierarchical navigable small world \- Wikipedia, truy cập vào tháng 7 29, 2025, [https://en.wikipedia.org/wiki/Hierarchical\_navigable\_small\_world](https://en.wikipedia.org/wiki/Hierarchical_navigable_small_world)  
3. Hierarchical Navigable Small Worlds (HNSW) \- Pinecone, truy cập vào tháng 7 29, 2025, [https://www.pinecone.io/learn/series/faiss/hnsw/](https://www.pinecone.io/learn/series/faiss/hnsw/)  
4. Walrus: An Efficient Decentralized Storage Network \- arXiv, truy cập vào tháng 7 29, 2025, [https://arxiv.org/html/2505.05370v2](https://arxiv.org/html/2505.05370v2)  
5. Next Walrus Evolution: Quilt Redefines Small File Storage at Scale, truy cập vào tháng 7 29, 2025, [https://www.walrus.xyz/blog/introducing-quilt](https://www.walrus.xyz/blog/introducing-quilt)  
6. seal/Design.md at main · MystenLabs/seal \- GitHub, truy cập vào tháng 7 29, 2025, [https://github.com/MystenLabs/seal/blob/main/Design.md](https://github.com/MystenLabs/seal/blob/main/Design.md)  
7. MystenLabs/seal \- GitHub, truy cập vào tháng 7 29, 2025, [https://github.com/MystenLabs/seal](https://github.com/MystenLabs/seal)  
8. Project Documentation: Secure Vector Embeddings on Sui  
9. Mysten Labs \- Shaping the Future of the Internet, truy cập vào tháng 7 29, 2025, [https://www.mystenlabs.com/](https://www.mystenlabs.com/)  
10. Code in Move \[4\] — Sui Move Basics | by Thouny | The Sui Stack \- Medium, truy cập vào tháng 7 29, 2025, [https://medium.com/the-sui-stack/code-in-move-4-sui-move-basics-76c21cc0df1c](https://medium.com/the-sui-stack/code-in-move-4-sui-move-basics-76c21cc0df1c)  
11. From Public to Private: Rethinking Web3 Data Security \- Walrus.xyz, truy cập vào tháng 7 29, 2025, [https://www.walrus.xyz/blog/seal-decentralized-storage-encryption](https://www.walrus.xyz/blog/seal-decentralized-storage-encryption)  
12. My first experience with Move Smart Contracts \- Part 1 \- Decipher Club, truy cập vào tháng 7 29, 2025, [https://www.decipherclub.com/my-first-experience-with-move-smart-contracts/](https://www.decipherclub.com/my-first-experience-with-move-smart-contracts/)  
13. Sui Events Indexer. Check out the open-source repo here… | by buidly \- Medium, truy cập vào tháng 7 29, 2025, [https://medium.com/@buidly.tech/sui-events-indexer-cc26d47cd882](https://medium.com/@buidly.tech/sui-events-indexer-cc26d47cd882)  
14. suidouble/suidouble: Set of provider, package and object classes for javascript representation of Sui Move smart contracts. Use same code for publishing, upgrading, integration testing, interaction with smart contracts and integration in browser web3 dapps \- GitHub, truy cập vào tháng 7 29, 2025, [https://github.com/suidouble/suidouble](https://github.com/suidouble/suidouble)  
15. 0xPolygon/chain-indexer-framework \- GitHub, truy cập vào tháng 7 29, 2025, [https://github.com/0xPolygon/chain-indexer-framework](https://github.com/0xPolygon/chain-indexer-framework)  
16. Beyond Nodes Polling | Modern Blockchain Indexing Solutions | by Rock'n'Block \- Medium, truy cập vào tháng 7 29, 2025, [https://rocknblock.medium.com/beyond-nodes-polling-modern-blockchain-indexing-solutions-6f231c5d7412](https://rocknblock.medium.com/beyond-nodes-polling-modern-blockchain-indexing-solutions-6f231c5d7412)  
17. The Rise of the Blockchain Architect \- Fireblocks, truy cập vào tháng 7 29, 2025, [https://www.fireblocks.com/blog/the-rise-of-the-blockchain-architect/](https://www.fireblocks.com/blog/the-rise-of-the-blockchain-architect/)  
18. Walrus: An Efficient Decentralized Storage Network \- arXiv, truy cập vào tháng 7 29, 2025, [https://arxiv.org/abs/2505.05370](https://arxiv.org/abs/2505.05370)  
19. Walrus Protocol launches Quilt bulk storage solution, reducing storage costs \- Binance, truy cập vào tháng 7 29, 2025, [https://www.binance.com/square/post/27366419640089](https://www.binance.com/square/post/27366419640089)  
20. HNSW indexing in Vector Databases: Simple explanation and code | by Will Tai \- Medium, truy cập vào tháng 7 29, 2025, [https://medium.com/@wtaisen/hnsw-indexing-in-vector-databases-simple-explanation-and-code-3ef59d9c1920](https://medium.com/@wtaisen/hnsw-indexing-in-vector-databases-simple-explanation-and-code-3ef59d9c1920)  
21. Understanding vector search and HNSW index with pgvector \- Neon, truy cập vào tháng 7 29, 2025, [https://neon.com/blog/understanding-vector-search-and-hnsw-index-with-pgvector](https://neon.com/blog/understanding-vector-search-and-hnsw-index-with-pgvector)  
22. What is a Hierarchical Navigable Small World \- MongoDB, truy cập vào tháng 7 29, 2025, [https://www.mongodb.com/resources/basics/hierarchical-navigable-small-world](https://www.mongodb.com/resources/basics/hierarchical-navigable-small-world)  
23. HNSW Algorithm: Efficiently Searching Vector Databases | by Ajay Mallya | Medium, truy cập vào tháng 7 29, 2025, [https://medium.com/@amallya0523/hnsw-algorithm-efficiently-searching-vector-databases-9276a934393d](https://medium.com/@amallya0523/hnsw-algorithm-efficiently-searching-vector-databases-9276a934393d)  
24. Part 3: From Block to APIs: Building Indexers on ChainStack \- Coinbase, truy cập vào tháng 7 29, 2025, [https://www.coinbase.com/blog/part-3-from-block-to-apis-building-indexers-on-chainstack](https://www.coinbase.com/blog/part-3-from-block-to-apis-building-indexers-on-chainstack)  
25. Indexer Architecture Overview \- Blockscout Docs, truy cập vào tháng 7 29, 2025, [https://docs.blockscout.com/setup/information-and-settings/indexer-architecture-overview](https://docs.blockscout.com/setup/information-and-settings/indexer-architecture-overview)  
26. Exploring SEAL \- Sui's Innovative Decentralized Data Security Solution \- Gate.io, truy cập vào tháng 7 29, 2025, [https://www.gate.com/learn/articles/exploring-seal-sui-s-innovative-decentralized-data-security-solution/8279](https://www.gate.com/learn/articles/exploring-seal-sui-s-innovative-decentralized-data-security-solution/8279)  
27. Seal | Decentralized secrets management, truy cập vào tháng 7 29, 2025, [https://seal.mystenlabs.com/](https://seal.mystenlabs.com/)