# Phase 2B: Create Infrastructure Directory - PLAN

**Start Date**: October 7, 2025  
**Status**: 🚀 STARTING  
**Goal**: Organize external integrations into dedicated infrastructure directory

---

## 🎯 **Objective**

Move external service integrations (Walrus, Sui, Gemini AI, SEAL) into a dedicated `src/infrastructure/` directory to improve separation of concerns and code organization.

---

## 📋 **Tasks**

### **1. Create Infrastructure Directory Structure**

```
src/infrastructure/
├── walrus/          # Walrus storage integration
│   ├── WalrusStorageService.ts
│   ├── StorageManager.ts
│   └── index.ts
├── sui/             # Sui blockchain integration
│   ├── SuiService.ts
│   ├── BlockchainManager.ts
│   └── index.ts
├── ai/              # Gemini AI integration
│   ├── GeminiAIService.ts
│   ├── EmbeddingService.ts
│   └── index.ts
├── seal/            # SEAL encryption integration
│   ├── SealService.ts
│   ├── EncryptionService.ts
│   └── index.ts
└── index.ts         # Infrastructure barrel export
```

### **2. Move Files to Infrastructure**

**Walrus Integration**:
- `src/storage/WalrusStorageService.ts` → `src/infrastructure/walrus/WalrusStorageService.ts`
- `src/storage/StorageManager.ts` → `src/infrastructure/walrus/StorageManager.ts`

**Sui Blockchain**:
- `src/blockchain/SuiService.ts` → `src/infrastructure/sui/SuiService.ts`
- `src/blockchain/BlockchainManager.ts` → `src/infrastructure/sui/BlockchainManager.ts`

**Gemini AI**:
- `src/services/GeminiAIService.ts` → `src/infrastructure/ai/GeminiAIService.ts`
- `src/services/EmbeddingService.ts` → `src/infrastructure/ai/EmbeddingService.ts`

**SEAL Encryption**:
- `src/security/SealService.ts` → `src/infrastructure/seal/SealService.ts`
- `src/services/EncryptionService.ts` → `src/infrastructure/seal/EncryptionService.ts`

### **3. Create Barrel Exports**

Create `index.ts` files in each subdirectory:
- `src/infrastructure/walrus/index.ts`
- `src/infrastructure/sui/index.ts`
- `src/infrastructure/ai/index.ts`
- `src/infrastructure/seal/index.ts`
- `src/infrastructure/index.ts` (main barrel)

### **4. Update Import Paths**

Update imports across the codebase:
- Services importing from `../storage/`, `../blockchain/`, `../security/`
- Tests importing infrastructure services
- Main `src/index.ts` exports

### **5. Create Backward Compatibility Layer**

Update old directories to re-export from infrastructure:
- `src/storage/index.ts` → re-export from `infrastructure/walrus`
- `src/blockchain/index.ts` → re-export from `infrastructure/sui`
- `src/security/` → re-export from `infrastructure/seal`

### **6. Verify Build & Tests**

- Run `npm run build` - ensure zero TypeScript errors
- Run `npm test` - ensure test pass rate maintained (≥88%)
- Verify backward compatibility

---

## 📊 **Expected Impact**

### **Code Organization**:
- 8 files moved to infrastructure/
- Clear separation: business logic vs external integrations
- Improved discoverability

### **Code Reduction**:
- Estimated: ~200-400 lines via consolidation
- Barrel exports replace duplicate code

### **Quality Gates**:
- ✅ Zero TypeScript errors
- ✅ Test pass rate ≥88%
- ✅ Backward compatibility maintained
- ✅ All builds successful

---

## 🔧 **Implementation Steps**

1. ✅ Create infrastructure directory structure
2. ⏳ Copy files to infrastructure subdirectories
3. ⏳ Create barrel exports
4. ⏳ Update import paths in services
5. ⏳ Update import paths in tests
6. ⏳ Create backward compatibility layer
7. ⏳ Run build verification
8. ⏳ Run test suite
9. ⏳ Commit changes

---

## 🎯 **Success Criteria**

- [ ] Infrastructure directory exists with proper structure
- [ ] All 8 files moved successfully
- [ ] Barrel exports created
- [ ] All imports updated
- [ ] Zero TypeScript errors
- [ ] Test pass rate ≥88%
- [ ] Backward compatibility verified

---

**Phase 2B: READY TO START** 🚀

