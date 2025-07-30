# Project Overview

This repository contains two complementary applications:

## 1. Personal Data Wallet
**Purpose**: A decentralized, self-organizing memory layer for LLMs with blockchain-based ownership and data integrity.

**Key Features**:
- Intent classification (facts, queries, conversation)
- Knowledge graph extraction from natural language
- Vector embeddings for semantic search
- Sui blockchain integration for ownership
- Walrus storage for immutable data blobs
- Real-time chat interface with React/Next.js

**Architecture**:
- **Frontend**: Next.js 14 with TypeScript, TanStack Query, Tailwind CSS
- **Backend**: Python FastAPI with intelligent processing services
- **Blockchain**: Sui smart contracts + Walrus storage
- **AI/ML**: Sentence transformers, HNSW vector search, entity extraction

## 2. Serena
**Purpose**: A powerful coding agent toolkit that turns LLMs into fully-featured agents working directly on codebases.

**Key Features**:
- Semantic code retrieval and editing tools
- Language Server Protocol (LSP) integration
- Symbol-level code manipulation (13+ languages)
- Model Context Protocol (MCP) server
- Project memory and knowledge persistence
- Context/mode-based workflow customization

**Architecture**:
- **Core**: Python 3.11 with semantic analysis tools
- **Languages**: Multi-language support via LSP
- **Integration**: MCP server for AI agent integration
- **Memory**: Markdown-based project knowledge system

Both projects work synergistically - Serena provides the coding infrastructure while Personal Data Wallet demonstrates advanced LLM memory management.