# Phase 2D: Update Import Paths - Implementation Plan

**Start Date**: October 7, 2025  
**Status**: 🚀 **READY TO START**  
**Previous Phase**: Phase 2C Complete ✅

---

## 🎯 **Objective**

Update import paths across the codebase to use the new directory structure from Phase 2A and Phase 2B, ensuring consistency and removing any remaining legacy import patterns.

---

## 📋 **Tasks**

### **Step 1: Audit Current Import Patterns**
- [ ] Search for imports from old locations
- [ ] Identify services still using legacy paths
- [ ] Identify tests using legacy paths
- [ ] Document all import patterns

### **Step 2: Update Service Imports**
- [ ] Update services to import from `infrastructure/`
- [ ] Update services to import from `core/types/`
- [ ] Update services to import from `services/`
- [ ] Verify no circular dependencies

### **Step 3: Update Test Imports**
- [ ] Update test files to use new paths
- [ ] Update test utilities
- [ ] Verify test helpers use correct imports

### **Step 4: Update Example Imports**
- [ ] Update example files
- [ ] Update documentation code samples
- [ ] Verify examples still work

### **Step 5: Verify Build**
- [ ] Run TypeScript build
- [ ] Check for any import errors
- [ ] Verify zero compilation errors

### **Step 6: Run Tests**
- [ ] Run full test suite
- [ ] Verify test pass rate maintained (≥88%)
- [ ] Check for any import-related failures

### **Step 7: Commit Changes**
- [ ] Git add all changes
- [ ] Commit with descriptive message
- [ ] Update progress documentation

---

## 🔍 **Import Patterns to Update**

### **From Phase 2A (Core Types)**

**Old Pattern**:
```typescript
import { ContextWallet, MainWallet } from '../types';
import { PDWConfig } from '../types/index';
```

**New Pattern**:
```typescript
import { ContextWallet, MainWallet } from '../core/types';
import { PDWConfig } from '../core/types';
```

### **From Phase 2B (Infrastructure)**

**Old Pattern**:
```typescript
import { SealService } from '../security/SealService';
import { SuiService } from '../blockchain/SuiService';
import { WalrusStorageService } from '../storage/WalrusStorageService';
import { GeminiAIService } from '../services/GeminiAIService';
```

**New Pattern**:
```typescript
import { SealService } from '../infrastructure/seal';
import { SuiService } from '../infrastructure/sui';
import { WalrusStorageService } from '../infrastructure/walrus';
import { GeminiAIService } from '../infrastructure/ai';
```

---

## 📊 **Success Criteria**

| Criterion | Target |
|-----------|--------|
| All imports updated | ✅ |
| No legacy import paths | ✅ |
| TypeScript errors | 0 |
| Test pass rate | ≥88% |
| Build successful | ✅ |
| No circular dependencies | ✅ |

---

## 🎯 **Expected Impact**

**Code Consistency**:
- All imports use new directory structure
- Clear import patterns
- Easier to understand code organization

**Maintainability**:
- Consistent import paths
- Easier to refactor in future
- Better IDE autocomplete

**No Breaking Changes**:
- Backward compatibility maintained via barrel exports
- Public API unchanged
- Consumers not affected

---

## 🚀 **Implementation Strategy**

### **Phase 1: Discovery**
1. Search for all import statements
2. Categorize by source directory
3. Identify files needing updates

### **Phase 2: Update Imports**
1. Update service files first
2. Update test files second
3. Update examples last

### **Phase 3: Verification**
1. Build TypeScript
2. Run tests
3. Verify no regressions

---

## 🔧 **Search Commands**

```bash
# Find imports from old locations
grep -r "from '../types'" src/
grep -r "from '../security'" src/
grep -r "from '../blockchain'" src/
grep -r "from '../storage'" src/

# Find imports in tests
grep -r "from '../src/types'" test/
grep -r "from '../src/security'" test/
grep -r "from '../src/blockchain'" test/
grep -r "from '../src/storage'" test/
```

---

**Ready to begin Phase 2D!** 🎯

