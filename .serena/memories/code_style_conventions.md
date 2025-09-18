# Code Style and Conventions

## TypeScript Configuration

### Frontend (Next.js)
- **Target**: ES5
- **Module**: ESNext with bundler resolution
- **Strict Mode**: Enabled (`strict: true`)
- **Path Aliases**: `@/*` maps to root directory
- **JSX**: Preserve for Next.js processing

### Backend (NestJS)
- **Target**: ES2023 
- **Module**: NodeNext with NodeNext resolution
- **Decorators**: Enabled (required for NestJS)
- **Strict Null Checks**: Enabled
- **No Implicit Any**: Disabled (allows gradual typing)
- **Source Maps**: Enabled

## Code Formatting

### Prettier Configuration (Backend)
```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

### ESLint Rules

#### Backend Specific
- TypeScript ESLint recommended rules
- Prettier integration for consistent formatting
- Relaxed rules:
  - `@typescript-eslint/no-explicit-any`: off
  - `@typescript-eslint/no-floating-promises`: warn
  - `@typescript-eslint/no-unsafe-argument`: warn

## NestJS Conventions

### Module Structure
- Each feature in its own module (chat, memory, storage)
- Standard NestJS architecture:
  - Controllers: Handle HTTP requests
  - Services: Business logic
  - DTOs: Data Transfer Objects with class-validator
  - Entities: TypeORM database models

### Decorators Usage
- `@Module()`: Define modules
- `@Controller()`: Define controllers with route prefix
- `@Injectable()`: Mark services for dependency injection
- `@Get()`, `@Post()`, etc.: HTTP method decorators
- Validation: `@IsString()`, `@IsOptional()`, etc.

### Global Configuration
- Global prefix: `/api`
- Validation pipe with whitelist and transform
- CORS enabled for all origins
- Port: 8000 (default) or from PORT env

## React/Next.js Conventions

### Component Structure
- Functional components with TypeScript
- Custom hooks in `app/hooks/`
- Services for API calls in `app/services/`
- Type definitions in `app/types/`

### State Management
- TanStack Query for server state
- React hooks for local state
- Mantine hooks for UI state

### UI Components
- Mantine UI as primary component library
- Tailwind for utility styling
- Consistent use of Mantine's theme system

## File Naming
- **Components**: PascalCase (e.g., `ChatInterface.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useSuiAuth.ts`)
- **Services**: camelCase (e.g., `memoryService.ts`)
- **Types**: PascalCase for interfaces/types
- **Utilities**: camelCase

## Import Order (Suggested)
1. External libraries
2. Internal modules/components
3. Types/interfaces
4. Styles

## Git Conventions
- Clear, descriptive commit messages
- Feature branches for new features
- Main branch for stable code

## Security Best Practices
- Never commit `.env` files
- Use environment variables for secrets
- Validate all user inputs
- Sanitize data before storage
- CORS configuration in production

## Testing Approach
- Jest for unit tests
- Test files with `.spec.ts` suffix
- Tests located next to source files
- Coverage reports available

## Documentation
- JSDoc comments for complex functions
- README files for modules when needed
- API documentation via Swagger (backend)
- Type definitions serve as documentation