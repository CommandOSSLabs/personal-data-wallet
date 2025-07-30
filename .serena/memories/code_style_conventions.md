# Code Style & Conventions

## Personal Data Wallet

### Frontend (TypeScript/React)
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS with utility classes
- **File Structure**: 
  - Components in `app/components/` with feature-based organization
  - Hooks in `app/hooks/` for reusable logic
  - Types in `app/types/` for shared interfaces
- **Naming**: 
  - PascalCase for components (`ChatInterface.tsx`)
  - camelCase for functions and variables
  - kebab-case for file names when not components

### Backend (Python)
- **Python Version**: 3.11+ required
- **Style**: PEP 8 compliance (handled by Black formatter)
- **Type Hints**: Comprehensive type annotations required
- **Models**: Pydantic models for data validation
- **Services**: Feature-based service organization in `services/`
- **Configuration**: Environment-based with `.env` files

## Serena

### Python Code Style
- **Formatting**: Black with Jupyter support (strict enforcement)
- **Type Checking**: MyPy with strict settings - **NEVER SKIP TYPE CHECKING**
- **Code Organization**:
  - Tools in `src/serena/tools/` with base class inheritance
  - Language servers in `src/solidlsp/language_servers/`
  - Configuration in `src/serena/config/`
- **Naming Conventions**:
  - Snake_case for functions, variables, modules
  - PascalCase for classes
  - UPPER_CASE for constants
  - Leading underscore for private methods

### Key Patterns
- **Tool Development**: All tools must inherit from `Tool` base class
- **Language Support**: Each language needs server class + test repository + test suite  
- **Configuration**: YAML-based with Jinja2 templating
- **Error Handling**: Graceful degradation with automatic LSP server restart
- **Memory System**: Markdown-based storage with contextual retrieval

## Shared Conventions

### Git & Documentation
- **Commit Messages**: Conventional commits format preferred
- **Documentation**: Markdown with clear structure
- **README Files**: Comprehensive setup and usage instructions

### Testing
- **Personal Data Wallet**: API testing with curl, integration testing
- **Serena**: Pytest with markers, snapshot testing for symbolic operations
- **Coverage**: Aim for comprehensive test coverage of core functionality

### Security
- **Environment Variables**: Never commit secrets to repository
- **API Keys**: Use `.env` files and environment-based configuration
- **Input Validation**: Strict validation using Pydantic models

### Development Workflow
1. **Code Changes**: Make incremental, focused changes
2. **Format & Type Check**: Use project-specific commands
3. **Test**: Run relevant test suites
4. **Validate**: Manual testing of affected functionality
5. **Document**: Update documentation as needed

## Performance Considerations
- **Serena**: Token-efficient code reading with symbolic tools
- **Personal Data Wallet**: Async processing, vector search optimization
- **Both**: Memory management and resource cleanup