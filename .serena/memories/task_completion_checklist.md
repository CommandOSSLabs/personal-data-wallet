# Task Completion Checklist

When completing any development task in this project, follow these steps:

## Before Starting
1. Understand the task requirements
2. Review relevant existing code
3. Check current branch and git status

## During Development
1. Follow existing code patterns and conventions
2. Use TypeScript types properly
3. Implement error handling
4. Add necessary validation (especially for user inputs)

## After Implementation

### Code Quality Checks

#### Frontend
```bash
npm run lint          # Run ESLint on frontend code
npm run build         # Ensure production build succeeds
```

#### Backend
```bash
cd backend
npm run lint          # Fix any linting issues
npm run format        # Format code with Prettier
npm run build         # Ensure NestJS builds successfully
npm run test          # Run unit tests if applicable
```

### Testing
1. Test functionality locally
2. Check for console errors
3. Verify API endpoints work correctly
4. Test error cases and edge cases

### Final Verification
1. Review all changes with `git diff`
2. Ensure no sensitive data in code
3. Check imports are used and necessary
4. Remove any debug console.logs
5. Verify TypeScript has no errors

### Common Issues to Check
- [ ] No hardcoded values that should be in environment variables
- [ ] API calls have proper error handling
- [ ] Loading states are handled in UI
- [ ] Database migrations created if schema changed
- [ ] No commented-out code left behind
- [ ] New dependencies are necessary and documented

## Git Commit (When Requested)
1. Stage appropriate files
2. Write clear commit message
3. Include reference to issue/feature if applicable

## Deployment Considerations
- Environment variables configured
- Database migrations ready
- API endpoints documented
- Performance impact considered