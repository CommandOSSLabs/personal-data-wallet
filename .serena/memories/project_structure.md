# Project Structure

## Root Directory Layout
```
personal_data_wallet/
├── app/                    # Next.js frontend application
├── backend/               # Python FastAPI backend
├── serena/               # Serena coding agent toolkit
├── sui-contract/         # Sui blockchain smart contracts
├── scripts/              # Setup and utility scripts
├── documentation.md      # Project documentation
├── mysten-sui-documentation.md
├── walrus-knowledge.md
├── package.json          # Frontend dependencies
├── docker-compose.yml    # Container orchestration
└── README.MD            # Main project documentation
```

## Personal Data Wallet Structure

### Frontend (`app/`)
```
app/
├── components/
│   ├── auth/            # Authentication components
│   ├── chat/            # Chat interface components
│   ├── sidebar/         # Navigation components
│   └── ui/             # Reusable UI components
├── hooks/              # TanStack Query hooks
├── lib/                # API client and utilities
├── providers/          # React context providers
├── types/              # TypeScript type definitions
├── globals.css         # Global styles
├── layout.tsx          # Root layout component
└── page.tsx           # Main page component
```

### Backend (`backend/`)
```
backend/
├── services/           # Core business logic
│   ├── classifier.py      # Intent classification
│   ├── embeddings.py      # Vector embedding generation
│   ├── graph_extractor.py # Knowledge graph extraction
│   ├── memory_manager.py  # Memory orchestration
│   ├── sui_client.py      # Sui blockchain integration
│   ├── vector_store.py    # HNSW vector search
│   └── walrus_client.py   # Walrus storage client
├── data/               # Persistent data storage
├── config.py           # Configuration management
├── main.py            # FastAPI application entry
├── models.py          # Pydantic data models
└── requirements.txt   # Python dependencies
```

## Serena Structure (`serena/`)

### Core Framework
```
serena/src/
├── serena/             # Main agent framework
│   ├── agent.py           # Central orchestrator (SerenaAgent)
│   ├── config/            # Configuration system
│   │   ├── context_mode.py    # Context/mode management
│   │   └── serena_config.py   # Core configuration
│   ├── tools/             # Tool implementations
│   │   ├── file_tools.py      # File system operations
│   │   ├── symbol_tools.py    # Symbol-based editing
│   │   ├── memory_tools.py    # Project knowledge
│   │   └── workflow_tools.py  # Meta-operations
│   └── resources/         # Configuration templates
│       ├── config/        # YAML configurations
│       └── dashboard/     # Web dashboard assets
└── solidlsp/           # Language Server integration
    ├── ls.py              # Unified LSP wrapper
    ├── language_servers/  # LSP implementations
    └── lsp_protocol_handler/ # LSP protocol handling
```

### Configuration Hierarchy
```
serena/src/serena/resources/config/
├── contexts/           # Tool sets for environments
│   ├── agent.yml          # Agent context
│   ├── desktop-app.yml    # Desktop application
│   └── ide-assistant.yml  # IDE integration
├── modes/              # Operational patterns
│   ├── editing.yml        # Editing mode
│   ├── interactive.yml    # Interactive mode
│   ├── planning.yml       # Planning mode
│   └── one-shot.yml      # One-shot mode
└── prompt_templates/   # Jinja2 templates
```

### Language Support
```
serena/src/solidlsp/language_servers/
├── python/             # Python LSP (Pyright/Jedi)
├── typescript/         # TypeScript LSP
├── java/              # Eclipse JDT LS
├── rust/              # Rust Analyzer
├── go/                # Gopls
├── csharp/            # OmniSharp/C# LSP
├── php/               # Intelephense
├── elixir/            # Elixir LS
├── clojure/           # Clojure LSP
├── terraform/         # Terraform LS
└── kotlin/            # Kotlin LSP
```

### Testing Structure
```
serena/test/
├── resources/repos/    # Test repositories for each language
├── serena/            # Serena agent tests
└── solidlsp/          # Language server tests
    ├── python/
    ├── typescript/
    └── [other languages]/
```

## Smart Contract Structure (`sui-contract/`)
```
sui-contract/
├── sources/           # Move source files
│   └── memory_wallet.move # Main contract
├── tests/            # Move test files
├── Move.toml         # Project manifest
└── README.md        # Contract documentation
```

## Key Configuration Files
- **Frontend**: `package.json`, `tsconfig.json`, `tailwind.config.js`
- **Backend**: `requirements.txt`, `config.py`, `.env.example`
- **Serena**: `pyproject.toml`, `CLAUDE.md`, various YAML configs
- **Containers**: `docker-compose.yml`, `Dockerfile.frontend`
- **Blockchain**: `Move.toml` for Sui contracts