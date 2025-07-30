# Development Guidelines

## Core Principles

### Personal Data Wallet
- **User-Centric Design**: Prioritize intuitive chat interface and user experience
- **Decentralized Architecture**: Maintain blockchain-first approach for data ownership
- **AI-First Processing**: Leverage intelligent classification and knowledge extraction
- **Real-time Responsiveness**: Ensure fast API responses and smooth UI interactions

### Serena
- **Token Efficiency**: Minimize context usage through intelligent code reading
- **Symbol-Based Operations**: Prefer semantic editing over line-based modifications  
- **Language Agnostic**: Maintain consistent interface across 13+ supported languages
- **Tool Composability**: Design tools that work together seamlessly

## Design Patterns & Architecture

### Personal Data Wallet Patterns

#### Service Layer Pattern
```python
# Each major function is isolated in services/
services/
├── classifier.py      # Intent classification logic
├── memory_manager.py  # Orchestrates memory operations
├── vector_store.py    # Vector search operations
└── graph_extractor.py # Knowledge graph extraction
```

#### API-First Design
- RESTful endpoints with clear responsibilities
- Comprehensive input validation using Pydantic
- Async/await for non-blocking operations
- Structured error responses

#### State Management (Frontend)
- TanStack Query for server state management
- React hooks for component-level state
- Context providers for global state (auth, configuration)

### Serena Patterns

#### Tool-Based Architecture
```python
class CustomTool(Tool):
    """All tools inherit from base Tool class"""
    
    def execute(self, **params) -> ToolResult:
        # Implement tool logic
        pass
        
    def get_param_schema(self) -> Dict:
        # Define parameter validation
        pass
```

#### LSP Abstraction Pattern
- Unified interface across different language servers
- Automatic server lifecycle management
- Graceful error recovery and restart mechanisms
- Caching for performance optimization

#### Configuration-Driven Behavior
- YAML-based configuration with Jinja2 templating
- Context/mode system for different operational patterns
- Project-specific settings with inheritance

## Security Guidelines

### Data Protection
- **Never commit secrets**: Use `.env` files and environment variables
- **Input validation**: Comprehensive validation on all API inputs
- **Authentication**: Implement proper auth flows for production
- **Blockchain security**: Follow Sui smart contract best practices

### Code Security
- **Type safety**: Comprehensive type hints prevent runtime errors
- **Error handling**: Graceful degradation without information leakage
- **Resource limits**: Prevent memory leaks and excessive resource usage

## Performance Optimization

### Personal Data Wallet
- **Vector Search**: Use HNSW for efficient similarity search
- **Caching**: Redis for frequently accessed data
- **Async Processing**: Non-blocking API operations
- **Database Optimization**: Efficient graph and vector storage

### Serena
- **Lazy Loading**: Load symbol information only when needed
- **Intelligent Caching**: Cache LSP responses and symbol metadata
- **Minimal Context**: Read only necessary code sections
- **Parallel Operations**: Concurrent tool execution where possible

## Testing Strategy

### Comprehensive Coverage
- **Unit Tests**: Individual function and class testing
- **Integration Tests**: End-to-end workflow validation
- **Language Tests**: Serena's multi-language support validation
- **Snapshot Tests**: Symbolic editing operation verification

### Test Organization
```
test/
├── unit/              # Isolated component tests
├── integration/       # Cross-component tests
├── resources/         # Test data and repositories
└── snapshots/         # Expected output snapshots
```

## Error Handling & Logging

### Structured Logging
- Use structured logging with appropriate levels
- Include context information (user_id, operation_type)
- Separate sensitive information from logs
- Performance metrics and timing information

### Error Recovery
- **Graceful Degradation**: Systems continue operating with reduced functionality
- **Automatic Retry**: Transient failures are retried with backoff
- **User Feedback**: Clear error messages for user actions
- **Development Debugging**: Detailed error information in development mode

## Documentation Standards

### Code Documentation
- **Docstrings**: Comprehensive function and class documentation
- **Type Hints**: Complete type annotations for all functions
- **Comments**: Explain complex business logic and algorithms
- **Examples**: Include usage examples for complex APIs

### Project Documentation
- **README Files**: Clear setup and usage instructions
- **API Documentation**: Comprehensive endpoint documentation
- **Architecture Docs**: High-level system design documentation
- **Troubleshooting**: Common issues and solutions

## Development Workflow

### Code Changes
1. **Understand Context**: Use Serena's symbolic tools to understand codebase
2. **Minimal Changes**: Make focused, incremental modifications
3. **Test Early**: Test changes throughout development
4. **Documentation**: Update documentation as changes are made

### Review Process
1. **Self Review**: Check code against guidelines before sharing
2. **Automated Checks**: Ensure all linting and type checking passes
3. **Manual Testing**: Verify functionality works as expected
4. **Security Review**: Check for potential security issues

## Integration Patterns

### Personal Data Wallet + Serena
- Serena can analyze and modify Personal Data Wallet code
- Both systems use similar Python patterns and tooling
- Shared development environment and Docker configuration
- Complementary functionality: coding assistance + memory management

### External Integrations
- **Blockchain**: Sui RPC and Walrus storage APIs
- **AI Services**: Google Generative AI and OpenAI APIs
- **Development Tools**: LSP servers, Docker, Redis
- **Frontend**: Next.js build system and deployment tools