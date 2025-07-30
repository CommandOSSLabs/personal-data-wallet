# Tech Stack

## Personal Data Wallet

### Frontend
- **Framework**: Next.js 14.0.4 with React 18
- **Language**: TypeScript 5 with strict mode
- **Styling**: Tailwind CSS 3.3.0 with typography plugin
- **State Management**: TanStack Query 5.0.0 for server state
- **UI Components**: Lucide React icons, custom cyber-themed components
- **Markdown**: react-markdown with syntax highlighting

### Backend  
- **Framework**: FastAPI 0.104.1 with Python 3.11+
- **Server**: Uvicorn with async support
- **Data Models**: Pydantic 2.5.0 for validation
- **AI/ML Stack**:
  - sentence-transformers 2.2.2 for embeddings
  - hnswlib 0.8.0 for vector search
  - scikit-learn 1.3.2 for ML utilities
  - networkx 3.2.1 for graph operations
- **Storage**: Redis 5.0.1 for caching
- **External APIs**: Google Generative AI 0.8.3

### Blockchain
- **Smart Contracts**: Sui Move language
- **Storage**: Walrus decentralized blob storage
- **Integration**: Custom Sui client with RPC communication

## Serena

### Core Framework
- **Language**: Python 3.11 (strict version requirement)
- **Package Manager**: uv for dependency management
- **Architecture**: Async-first with LSP integration

### Key Dependencies
- **LSP Integration**: Custom language server implementations
- **Web Framework**: Flask 3.0.0 for dashboard
- **Configuration**: PyYAML 6.0.2 + Ruamel.YAML for config files
- **Templates**: Jinja2 3.1.6 for prompt templating
- **Validation**: Pydantic 2.10.6 for data models
- **AI Integration**: Anthropic 0.54.0, MCP 1.5.0

### Development Tools
- **Type Checking**: MyPy 1.16.1 with strict settings
- **Formatting**: Black with Jupyter support
- **Testing**: Pytest 8.0.2 with snapshot testing
- **Task Runner**: Poethepoet 0.20.0 for command orchestration

## Infrastructure
- **Containerization**: Docker + Docker Compose
- **Development**: Hot reloading for both frontend and backend
- **Environment**: .env configuration management