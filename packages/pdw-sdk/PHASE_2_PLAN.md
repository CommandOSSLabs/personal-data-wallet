# Phase 2: Directory Restructuring - Implementation Plan

**Start Date**: October 7, 2025  
**Status**: 🚀 IN PROGRESS  
**Goal**: Organize remaining services into logical directory structure

---

## 🎯 **Objectives**

1. Create clean separation of concerns with dedicated directories
2. Move domain models to `core/`
3. Move external integrations to `infrastructure/`
4. Consolidate utilities to `utils/`
5. Maintain backward compatibility during transition

---

## 📋 **Phase 2 Breakdown**

### **Phase 2A: Create Core Directory** ⏳
**Goal**: Centralize domain models, types, and interfaces

**Tasks**:
1. Create `src/core/` directory structure
2. Move `src/types/` → `src/core/types/`
3. Create `src/core/interfaces/` for service contracts
4. Create `src/core/models/` for domain entities
5. Update all imports to use new paths
6. Create barrel exports for backward compatibility

**Expected Impact**:
- Better separation of domain logic
- Clearer type organization
- Easier to find domain models

---

### **Phase 2B: Create Infrastructure Directory** ⏳
**Goal**: Isolate external service integrations

**Tasks**:
1. Create `src/infrastructure/` directory
2. Move Walrus integration → `infrastructure/walrus/`
3. Move Sui blockchain utilities → `infrastructure/sui/`
4. Move Gemini AI integration → `infrastructure/ai/`
5. Move SEAL encryption → `infrastructure/seal/`
6. Update service dependencies
7. Create infrastructure barrel exports

**Files to Move**:
- `src/storage/WalrusStorageService.ts` → `infrastructure/walrus/`
- `src/storage/StorageManager.ts` → `infrastructure/walrus/`
- `src/blockchain/SuiService.ts` → `infrastructure/sui/`
- `src/blockchain/BlockchainManager.ts` → `infrastructure/sui/`
- `src/services/GeminiAIService.ts` → `infrastructure/ai/`
- `src/services/EmbeddingService.ts` → `infrastructure/ai/`
- `src/security/SealService.ts` → `infrastructure/seal/`
- `src/services/EncryptionService.ts` → `infrastructure/seal/`

**Expected Impact**:
- Clear boundary between business logic and external services
- Easier to swap implementations
- Better testability with mocked infrastructure

---

### **Phase 2C: Consolidate Utilities** ⏳
**Goal**: Single location for all helper functions

**Tasks**:
1. Audit existing utility functions across codebase
2. Create `src/utils/` directory structure
3. Move helper functions to appropriate util modules
4. Remove duplicate utility functions
5. Create utility barrel exports

**Utility Categories**:
- `utils/crypto/` - Cryptographic helpers
- `utils/validation/` - Input validation
- `utils/formatting/` - Data formatting
- `utils/errors/` - Error handling utilities
- `utils/async/` - Async/promise helpers

**Expected Impact**:
- No more scattered utility functions
- Easier to find and reuse helpers
- Reduced code duplication

---

### **Phase 2D: Update Import Paths** ⏳
**Goal**: Ensure all imports use new directory structure

**Tasks**:
1. Update service imports to use new paths
2. Update test imports
3. Update example imports
4. Update client extension imports
5. Run full test suite to verify
6. Update documentation with new import patterns

**Expected Impact**:
- Consistent import patterns
- No broken imports
- All tests passing

---

## 📁 **Target Directory Structure**

```
src/
├── core/                    # Domain models and types
│   ├── types/              # TypeScript type definitions
│   ├── interfaces/         # Service contracts
│   ├── models/             # Domain entities
│   └── index.ts            # Core barrel export
│
├── infrastructure/          # External service integrations
│   ├── walrus/             # Walrus storage integration
│   ├── sui/                # Sui blockchain integration
│   ├── ai/                 # Gemini AI integration
│   ├── seal/               # SEAL encryption integration
│   └── index.ts            # Infrastructure barrel export
│
├── services/                # Business logic services (already consolidated)
│   ├── StorageService.ts
│   ├── MemoryService.ts
│   ├── QueryService.ts
│   └── ...
│
├── utils/                   # Helper functions and utilities
│   ├── crypto/             # Cryptographic utilities
│   ├── validation/         # Validation helpers
│   ├── formatting/         # Formatting utilities
│   ├── errors/             # Error handling
│   └── index.ts            # Utils barrel export
│
├── client/                  # PersonalDataWallet extension
├── generated/               # Auto-generated Move bindings
├── wallet/                  # Wallet management
├── graph/                   # Knowledge graph
├── vector/                  # Vector operations
└── index.ts                 # Main entry point
```

---

## 🎯 **Success Criteria**

### **Code Organization**:
- ✅ All domain types in `core/`
- ✅ All external integrations in `infrastructure/`
- ✅ All utilities in `utils/`
- ✅ Clear separation of concerns

### **Quality Gates**:
- ✅ Zero TypeScript compilation errors
- ✅ All tests passing (maintain 88.6%+ pass rate)
- ✅ No breaking changes to public API
- ✅ Backward compatibility maintained

### **Documentation**:
- ✅ Updated import examples
- ✅ Architecture diagram updated
- ✅ Migration guide for consumers

---

## 📊 **Expected Impact**

### **Code Quality**:
- **Maintainability**: ⬆️ Easier to navigate codebase
- **Testability**: ⬆️ Better separation for mocking
- **Reusability**: ⬆️ Clear utility organization

### **Developer Experience**:
- **Onboarding**: ⬆️ Clearer project structure
- **Debugging**: ⬆️ Easier to locate code
- **Refactoring**: ⬆️ Safer to make changes

### **Package Size**:
- **Reduction**: ~50-100KB (removing duplicate utilities)
- **Tree-shaking**: Better with clear module boundaries

---

## 🚀 **Implementation Order**

1. **Phase 2A**: Create Core Directory (Day 1)
   - Low risk, high value
   - Establishes foundation for other phases

2. **Phase 2B**: Create Infrastructure Directory (Day 2)
   - Medium risk, high value
   - Clear separation of external dependencies

3. **Phase 2C**: Consolidate Utilities (Day 3)
   - Low risk, medium value
   - Cleanup and deduplication

4. **Phase 2D**: Update Import Paths (Day 4)
   - High risk, high value
   - Requires careful testing

---

## ⚠️ **Risks & Mitigation**

### **Risk 1: Breaking Changes**
- **Mitigation**: Create barrel exports for backward compatibility
- **Mitigation**: Maintain old import paths temporarily

### **Risk 2: Test Failures**
- **Mitigation**: Update tests incrementally
- **Mitigation**: Run tests after each sub-phase

### **Risk 3: Import Circular Dependencies**
- **Mitigation**: Use dependency injection patterns
- **Mitigation**: Keep infrastructure separate from services

---

## 📝 **Next Steps**

1. ✅ Create this implementation plan
2. ⏳ Start Phase 2A: Create Core Directory
3. ⏳ Move types and interfaces
4. ⏳ Update imports
5. ⏳ Verify tests pass
6. ⏳ Continue to Phase 2B

---

**Phase 2: Directory Restructuring - READY TO START** 🚀


