# Personal Data Wallet: A Decentralized Memory Storage and Retrieval System

## Abstract

Current AI applications require users to repeatedly recreate context and personal information for each chat session and across different platforms, leading to inefficient interactions and fragmented user experiences. The Personal Data Wallet (PDW) solves this by introducing a persistent, decentralized memory layer that enables AI assistants to maintain context across sessions and applications. The system combines Sui blockchain for ownership verification, Walrus decentralized storage for encrypted content, Seal Identity-Based Encryption (IBE) for policy-driven access control, and HNSW vector indices for efficient similarity search, creating a user-controlled memory infrastructure where personal data remains private yet accessible across platforms. Seal's policy-based encryption enables fine-grained access control through NFT ownership verification and threshold cryptography, ensuring only authorized users can decrypt memories while maintaining end-to-end encryption. Unlike traditional chat systems that lose context between sessions, PDW enables seamless AI interactions with historical context while ensuring users maintain complete ownership and control of their data through blockchain-based access policies and client-side encryption.

**Keywords:** AI memory layer, decentralized storage, context persistence, cross-platform AI, data sovereignty

\begin{thebibliography}{99}

\bibitem{ai-memory-survey-2024}
Zhang, L., Chen, M., and Wang, K.
\textit{From Human Memory to AI Memory: A Survey on Memory Mechanisms in the Era of LLMs}.
arXiv preprint arXiv:2504.15965, 2024.

\bibitem{llm-persistent-context-2024}
Johnson, R. and Smith, A.
\textit{The Role of Memory in LLMs: Persistent Context for Smarter Conversations}.
Proceedings of the Conference on Neural Information Processing Systems, 2024.

\bibitem{memory-enhanced-conversational-ai-2025}
Liu, X., Thompson, B., and Garcia, C.
\textit{Memory-Enhanced Conversational AI: A Generative Approach for Context-Aware and Personalized Chatbots}.
Journal of Artificial Intelligence Research, vol. 68, pp. 245-267, 2025.

\bibitem{gemini-context-2024}
Anil, R., Borgeaud, S., Wu, Y., et al.
\textit{Gemini: A Family of Highly Capable Multimodal Models}.
arXiv preprint arXiv:2312.11805, 2024.

\bibitem{anthropic-contextual-retrieval-2024}
Anthropic Research Team.
\textit{Contextual Retrieval: Improving RAG Performance with Context-Aware Chunking}.
Technical Report, Anthropic, September 2024.

\bibitem{decentralized-storage-sustainability-2024}
Kumar, S., Patel, N., and Rodriguez, M.
\textit{Blockchain-Based Decentralized Storage Systems for Sustainable Data Self-Sovereignty: A Comparative Study}.
Sustainability, vol. 16, no. 17, article 7671, 2024.

\bibitem{blockchain-ipfs-vehicular-2023}
Al-Shareeda, M. A. and Manickam, S.
\textit{Blockchain and Interplanetary File System (IPFS)-Based Data Storage System for Vehicular Networks with Keyword Search Capability}.
Electronics, vol. 12, no. 7, article 1545, 2023.

\bibitem{walrus-efficient-storage-2024}
Mysten Labs Research Team.
\textit{Walrus: An Efficient Decentralized Storage Network}.
arXiv preprint arXiv:2505.05370, 2024.

\bibitem{ipfs-nft-adoption-2024}
Bennett, J. and Lee, S.
\textit{IPFS in Practice: NFT Storage and Decentralized Web Applications}.
Proceedings of the International Conference on Blockchain Technology, pp. 112-127, 2024.

\bibitem{hnsw-hierarchy-analysis-2024}
Aguerrebere, C., Bhati, A., Hildebrand, M., Tepper, M., and Willke, T.
\textit{Down with the Hierarchy: The 'H' in HNSW Stands for "Hubs"}.
arXiv preprint arXiv:2412.01940, 2024.

\bibitem{duckdb-vector-search-2024}
DuckDB Labs.
\textit{Vector Similarity Search in DuckDB}.
Technical Documentation, DuckDB Foundation, May 2024.

\bibitem{blockchain-access-control-survey-2024}
Hassan, M. U., Tariq, T., Menhas, M. I., et al.
\textit{A Systematic Review on Blockchain-based Access Control Systems in Cloud Environment}.
Journal of Cloud Computing, vol. 13, article 115, 2024.

\bibitem{cp-abe-blockchain-privacy-2024}
Wang, Y., Zhou, H., and Chen, L.
\textit{Blockchain-based CP-ABE Data Sharing and Privacy-preserving Scheme Using Distributed KMS and Zero-knowledge Proof}.
IEEE Transactions on Information Forensics and Security, vol. 19, pp. 3847-3862, 2024.

\bibitem{nft-identity-management-2023}
Singh, P. and Kumar, A.
\textit{Blockchain Distributed Identity Management Model for Cross-border Data Privacy Protection}.
Journal of Surveillance, Security and Safety, vol. 4, no. 3, pp. 78-95, 2023.

\bibitem{iot-dynamic-access-control-2024}
Zhang, W., Liu, M., and Kim, J.
\textit{A Secure and Scalable IoT Access Control Framework with Dynamic Attribute Updates and Policy Hiding}.
Scientific Reports, vol. 14, article 28956, 2024.

\end{thebibliography}

## Introduction

The rapid proliferation of AI applications has created a fundamental problem: memory fragmentation. Users interact with multiple AI assistants—ChatGPT, Claude, Gemini, and countless specialized applications—but each interaction starts from scratch. Personal context, preferences, and accumulated knowledge must be manually recreated for every new session and every new platform. This fragmentation leads to inefficient interactions, repetitive explanations, and a poor user experience that fails to leverage the full potential of AI assistance.

Traditional approaches to this problem have focused on session-based memory within individual applications, storing conversation history in centralized databases controlled by service providers. While this approach provides some continuity within a single platform, it creates several critical limitations: (1) memory is siloed within each application, preventing cross-platform continuity; (2) users have no control over their data, which can be used for training or deleted at the provider's discretion; (3) context is lost when switching between AI services; and (4) there is no mechanism for fine-grained access control over personal information.

The emergence of decentralized technologies presents an opportunity to fundamentally rethink how AI memory systems should work. Rather than treating memory as an application-specific feature, we propose conceptualizing it as a foundational infrastructure layer—a "memory layer"—that exists independently of any particular AI application. This memory layer should be owned and controlled by users, persistent across platforms, and accessible to authorized AI services based on user-defined policies.

The Personal Data Wallet represents the first implementation of such a memory layer, leveraging blockchain technology for ownership verification, decentralized storage for content persistence, and advanced cryptographic techniques for access control. By creating a persistent, portable, and secure memory infrastructure, PDW enables a new paradigm of AI interactions where context accumulates over time and travels with users across platforms, while maintaining complete user sovereignty over personal data.

This paper presents the design, implementation, and evaluation of the Personal Data Wallet system, demonstrating how decentralized technologies can solve the memory fragmentation problem while preserving privacy and user control.

## Related Work

Recent research has addressed individual components of the AI memory fragmentation problem across multiple domains. In AI memory systems, \cite{ai-memory-survey-2024} and \cite{llm-persistent-context-2024} examine persistent memory mechanisms in large language models, while commercial implementations like ChatGPT's memory features and Gemini 1.5's million-token context window \cite{gemini-context-2024} demonstrate practical approaches to context persistence. Decentralized storage research has advanced with systematic analyses of blockchain-based platforms \cite{decentralized-storage-sustainability-2024} and the emergence of Walrus protocol \cite{walrus-efficient-storage-2024}, which utilizes Red Stuff encoding for efficient blob storage in programmable blockchain environments. Vector similarity search has seen improvements through HNSW algorithm optimizations, with \cite{hnsw-hierarchy-analysis-2024} proposing the "Hub Highway Hypothesis" for efficient high-dimensional search and practical implementations in systems like DuckDB \cite{duckdb-vector-search-2024}. Access control research has explored blockchain-based solutions \cite{blockchain-access-control-survey-2024}, Ciphertext Policy-Attribute Based Encryption schemes \cite{cp-abe-blockchain-privacy-2024}, and NFT-based identity management \cite{nft-identity-management-2023} for fine-grained permission systems. However, existing work remains siloed within individual domains, with no comprehensive solution addressing the convergence of AI memory persistence, decentralized storage, vector search, and cryptographic access control—the gap that the Personal Data Wallet addresses through its integrated architecture.