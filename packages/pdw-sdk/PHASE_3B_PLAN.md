# Phase 3B: Clean Public API - Implementation Plan

**Start Date**: October 7, 2025  
**Status**: 🚀 **READY TO START**  
**Previous Phase**: Phase 3A Complete ✅

---

## 🎯 **Objective**

Clean up the public API by removing legacy exports, simplifying the export structure, and improving tree-shaking to reduce bundle size and improve developer experience.

---

## 📋 **Tasks**

### **Step 1: Audit Current Public Exports**
- [ ] Review `src/index.ts` exports
- [ ] Identify all exported modules
- [ ] Categorize exports (core, services, infrastructure, utils, legacy)
- [ ] Document current export structure

### **Step 2: Identify Legacy Exports**
- [ ] Find deprecated barrel exports
- [ ] Identify unused exports
- [ ] List exports from old directory structure
- [ ] Document breaking changes

### **Step 3: Create Clean Export Structure**
- [ ] Group exports by category
- [ ] Create sub-exports for better organization
- [ ] Remove legacy compatibility exports
- [ ] Simplify main index.ts

### **Step 4: Update Package.json Exports**
- [ ] Define explicit export paths
- [ ] Add subpath exports
- [ ] Configure TypeScript paths
- [ ] Improve tree-shaking support

### **Step 5: Remove Deprecated Directories**
- [ ] Remove old barrel exports (types/, blockchain/, storage/, security/)
- [ ] Keep only new structure (core/, infrastructure/, services/, utils/)
- [ ] Update any remaining internal references
- [ ] Verify no broken imports

### **Step 6: Build and Test**
- [ ] Run TypeScript build
- [ ] Run test suite
- [ ] Verify zero compilation errors
- [ ] Verify test pass rate maintained (≥88%)

### **Step 7: Commit Changes**
- [ ] Git add all changes
- [ ] Commit with descriptive message
- [ ] Update progress documentation

---

## 🔍 **Current Export Structure Analysis**

Let me first audit what's currently exported from `src/index.ts`.

---

## 📊 **Success Criteria**

| Criterion | Target |
|-----------|--------|
| Legacy exports removed | ✅ |
| Public API simplified | ✅ |
| Export structure organized | ✅ |
| Tree-shaking improved | ✅ |
| TypeScript errors | 0 |
| Test pass rate | ≥88% |
| Bundle size reduced | -5% to -10% |

---

## 🎯 **Expected Impact**

### **Developer Experience**
- Clearer import paths
- Better IDE autocomplete
- Easier to find what you need
- Reduced confusion

### **Bundle Size**
- Better tree-shaking
- Smaller production bundles
- Faster load times
- Reduced memory usage

### **Maintainability**
- Cleaner codebase
- Easier to add new exports
- Clear export organization
- No legacy baggage

---

## ⚠️ **Breaking Changes**

This phase will introduce breaking changes for consumers using old import paths.

### **Removed Exports**
- Barrel exports from `types/` (use `core/types/` instead)
- Barrel exports from `blockchain/` (use `infrastructure/sui/` instead)
- Barrel exports from `storage/` (use `infrastructure/walrus/` instead)
- Barrel exports from `security/` (use `infrastructure/seal/` instead)

### **Migration Path**

**Before** (deprecated):
```typescript
import { ContextWallet } from '@personal-data-wallet/sdk/types';
import { SealService } from '@personal-data-wallet/sdk/security';
import { SuiService } from '@personal-data-wallet/sdk/blockchain';
```

**After** (new):
```typescript
import { ContextWallet } from '@personal-data-wallet/sdk/core/types';
import { SealService } from '@personal-data-wallet/sdk/infrastructure/seal';
import { SuiService } from '@personal-data-wallet/sdk/infrastructure/sui';
```

---

## 🚀 **Implementation Steps**

1. Audit current exports in `src/index.ts`
2. Categorize exports by module
3. Remove legacy barrel exports
4. Simplify main index.ts
5. Update package.json exports
6. Build and test
7. Commit changes

---

**Ready to begin Phase 3B!** 🎯

