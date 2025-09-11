SEAL INTEGRATION GUIDE

# Seal integration Development Guidelines 
## Setup
- Language coding is Typescript for frontend/backend and Move for Move package
- Must read seal_sdk_documentation ( part 1,2,3,4,5)
- Read seal_example_app to understand how to use Seal SDK
- Read seal_example_move to understand the Move package for Seal
- Read backend and frontend to understand the current implementation

## Implementation
- Follow project_workflow.md to understand the Workflow of this project best
- Implement Move package of Seal, based on example Move package, The idea of Allowlist is to let other dApp can access, but only the owner can call the function to decrypt the encrypted data by signing the transaction to approve. Add test function for Move package
- Implement Seal Client, modify the current implementation and refine based on document of Seal, Seal Client is in backend, frontend is only to call API, such as sign transactions, encrypt button, decrypt button.
- use grep tools to search error when build Move package, Publish The Move package after testing successfully, copy Package ID to .env 
- Do not create new document, only when i requested
- Do not create new jest testing function, only when i asked
- Seal Open Mode is for Future works, right now we work on Seal Client


## Development Philosophy

- **Simplicity**: Write simple, straightforward code
- **Readability**: Make code easy to understand
- **Performance**: Consider performance without sacrificing readability
- **Maintainability**: Write code that's easy to update
- **Testability**: Ensure code is testable
- **Reusability**: Create reusable components and functions
- **Less Code = Less Debt**: Minimize code footprint

## Coding Best Practices

- **Early Returns**: Use to avoid nested conditions
- **Descriptive Names**: Use clear variable/function names (prefix handlers with "handle")
- **Constants Over Functions**: Use constants where possible
- **DRY Code**: Don't repeat yourself
- **Functional Style**: Prefer functional, immutable approaches when not verbose
- **Minimal Changes**: Only modify code related to the task at hand
- **Function Ordering**: Define composing functions before their components
- **TODO Comments**: Mark issues in existing code with "TODO:" prefix
- **Simplicity**: Prioritize simplicity and readability over clever solutions
- **Build Iteratively** Start with minimal functionality and verify it works before adding complexity
- **Run Tests**: Test your code frequently with realistic inputs and validate outputs
- **Build Test Environments**: Create testing environments for components that are difficult to validate directly
- **Functional Code**: Use functional and stateless approaches where they improve clarity
- **Clean logic**: Keep core logic clean and push implementation details to the edges
- **File Organsiation**: Balance file organization with simplicity - use an appropriate number of files for the project scale
