# Task Completion Checklist

## Personal Data Wallet Tasks

### Frontend Changes
- [ ] **Code Quality**
  - [ ] Run `npm run lint` and fix any ESLint errors
  - [ ] Verify TypeScript compilation with `npm run build`
  - [ ] Check responsive design on different screen sizes
  - [ ] Test component functionality manually

- [ ] **Testing**
  - [ ] Test API integration endpoints
  - [ ] Verify chat interface functionality
  - [ ] Check loading states and error handling
  - [ ] Validate form inputs and user interactions

### Backend Changes
- [ ] **Code Quality**
  - [ ] Verify Python type hints are comprehensive
  - [ ] Check Pydantic model validation
  - [ ] Review error handling and logging
  - [ ] Confirm async/await patterns are correct

- [ ] **API Testing**
  - [ ] Test `/health` endpoint: `curl http://localhost:8000/health`
  - [ ] Test `/ingest` endpoint with sample data
  - [ ] Test `/query` endpoint with various queries
  - [ ] Check `/memory/{user_id}/stats` endpoint

### Full Stack Integration
- [ ] **Services**
  - [ ] Verify Docker services are running: `docker-compose ps`
  - [ ] Check service logs: `docker-compose logs -f backend`
  - [ ] Test frontend-backend communication
  - [ ] Validate Redis connectivity

## Serena Tasks

### **CRITICAL - Always Run These Commands**
- [ ] **`uv run poe format`** (ONLY allowed formatting command)
- [ ] **`uv run poe type-check`** (ONLY allowed type checking command)
- [ ] **`uv run poe test`** (Run with appropriate markers if needed)

### Code Quality Checks
- [ ] **Type Safety**
  - [ ] All functions have proper type hints
  - [ ] MyPy passes without errors or warnings
  - [ ] Pydantic models are properly validated
  - [ ] No `Any` types without justification

- [ ] **Tool Development**
  - [ ] New tools inherit from `Tool` base class
  - [ ] Parameter validation is implemented
  - [ ] Tool registration is updated in appropriate contexts
  - [ ] Documentation strings are complete

### Language Server Integration
- [ ] **LSP Testing**
  - [ ] Language server starts without errors
  - [ ] Symbol finding works correctly
  - [ ] Symbol editing operations succeed
  - [ ] Error recovery mechanisms function

- [ ] **Multi-language Support**
  - [ ] Test with appropriate language markers: `uv run poe test -m "python or go"`
  - [ ] Verify language-specific functionality
  - [ ] Check test repository integration

### Configuration & Memory
- [ ] **Project Setup**
  - [ ] `.serena/project.yml` is properly configured
  - [ ] Memory files are accessible and readable
  - [ ] Context/mode configurations are valid
  - [ ] MCP server starts successfully: `uv run serena-mcp-server`

## Cross-Project Validation

### Integration Testing
- [ ] **Both Systems Running**
  - [ ] Personal Data Wallet services operational
  - [ ] Serena MCP server accessible
  - [ ] No port conflicts between services
  - [ ] Resource usage within acceptable limits

- [ ] **Documentation**
  - [ ] README files are updated if changes affect setup
  - [ ] Code comments are clear and accurate
  - [ ] API documentation reflects any changes
  - [ ] Configuration examples are current

## Deployment Readiness

### Production Checklist
- [ ] **Environment Configuration**
  - [ ] All required environment variables are documented
  - [ ] No hardcoded secrets or API keys
  - [ ] Production-ready configuration templates
  - [ ] Docker builds complete successfully

- [ ] **Security Review**
  - [ ] Input validation is comprehensive
  - [ ] Authentication/authorization is properly implemented
  - [ ] Sensitive data is properly protected
  - [ ] API endpoints have appropriate rate limiting

## Pre-Commit Final Steps
1. **Run all formatting and type checking commands**
2. **Execute comprehensive test suite**
3. **Manually test affected functionality**
4. **Verify documentation is current**
5. **Check that no secrets are committed**
6. **Ensure all services start cleanly**

## Emergency Debugging
If something breaks:
- Check Docker service logs: `docker-compose logs -f [service]`
- Verify port availability: Windows: `netstat -an | findstr :[port]`
- Restart language servers if Serena tools fail
- Check `.env` configuration for missing variables
- Validate Python virtual environment activation