# SDK Cleanup Plan

## Overview
This document tracks legacy files and duplicates that need to be removed after all refactoring is complete and all tests are passing.

## Status: IN PROGRESS
- **Created**: 2025-02-10
- **Last Updated**: 2025-02-10
- **Purpose**: Document cleanup tasks after test refactoring and import consolidation

---

## 1. Duplicate EmbeddingService Files 🔴 HIGH PRIORITY

### Problem
Two separate `EmbeddingService` implementations exist, causing TypeScript type conflicts.

### Files
- **KEEP**: `src/services/EmbeddingService.ts` (9653 bytes, improved version)
  - Has NODE_ENV checks for console logging
  - Has input validation
  - Updated on 2025-02-10 1:4x PM
  - Currently used by all production code

- **REMOVE**: `src/embedding/EmbeddingService.ts` (9205 bytes, old version)
  - Missing NODE_ENV checks
  - Missing input validation improvements
  - Older timestamp: 2025-02-10 12:xx PM
  - No longer imported by any files (migration complete)

### Resolution Status
✅ **Import Migration Complete** (2025-02-10):
- Updated 9 files to use improved version:
  1. GraphService.ts
  2. StorageService.ts
  3. MemoryIndexService.ts
  4. QueryService.ts
  5. VectorManager.ts
  6. AdvancedSearchService.ts
  7. MemoryPipeline.ts
  8. MemoryRetrievalService.ts
  9. BatchManager.ts

⏸️ **Pending**: Delete `src/embedding/EmbeddingService.ts` after final verification

### Action Items
- [ ] Run full test suite to ensure no regressions
- [ ] Search codebase for ANY remaining imports of `../embedding/EmbeddingService`
- [ ] Delete `src/embedding/EmbeddingService.ts`
- [ ] Check if `src/embedding/` directory has other files
- [ ] Delete entire `src/embedding/` directory if empty

---

## 2. Test File Cleanup 🟡 MEDIUM PRIORITY

### Mock Test Backups
Created during refactoring process as safety backups:

- `test/services/ClassifierService.test.ts.bak` (if exists)
- `test/services/GeminiAIService.test.ts.bak` (if exists)
- `test/services/GraphService.test.ts.bak` (if exists)

### Deleted Tests (Already Removed)
✅ `test/services/KnowledgeGraphManager.test.ts` - Deleted 2025-02-10 (670 lines of mock tests)
  - Replaced with: `test/services/KnowledgeGraphManager.integration.test.ts` (16/16 passing)

### Action Items
- [ ] Search for `*.bak` files in test/ directory
- [ ] Verify no other `.mock.test.ts` files exist
- [ ] Delete all backup files after confirming new tests pass

---

## 3. Legacy Service Files 🟢 LOW PRIORITY

### Storage Services (Already Cleaned)
✅ **Resolved**: Storage service duplication was cleaned up in previous consolidation phase:
- **KEEP**: `src/services/StorageService.ts` (production service)
- **REMOVED**: `src/storage/WalrusService.ts`, `src/storage/WalrusStorageService.ts`, `src/storage/StorageManager.ts` (deprecated)

### Potential Other Duplicates
Need to verify:
- Check for duplicate service files in `src/services/` vs other directories
- Check for unused utility files

### Action Items
- [ ] Run grep search for duplicate class definitions across src/
- [ ] Identify any other legacy implementations
- [ ] Document findings here before deletion

---

## 4. Documentation Updates 📝

### Files to Update After Cleanup
- [ ] `README.md` - Update import examples if they reference old paths
- [ ] `.github/copilot-instructions.md` - Remove references to deleted files
- [ ] `package.json` - Check if any scripts reference deleted paths
- [ ] `tsconfig.json` - Remove any path mappings to deleted directories

---

## 5. Verification Checklist ✅

Before executing any deletions:

### Pre-Deletion Verification
- [ ] All tests passing (currently: 98/98 production tests)
- [ ] Build successful with zero TypeScript errors
- [ ] No remaining imports of files to be deleted
- [ ] Backup of codebase created (git commit)

### Post-Deletion Verification
- [ ] Run full test suite: `npm test`
- [ ] Run build: `npm run build`
- [ ] Run type check: `npm run type-check` (if available)
- [ ] Check for broken imports: grep search for deleted file paths
- [ ] Verify documentation accuracy

---

## 6. Execution Timeline

### Phase 1: Immediate (After Test Refactoring Complete)
1. Delete `src/embedding/EmbeddingService.ts`
2. Delete `src/embedding/` directory if empty
3. Delete `*.bak` test files

### Phase 2: After Full Test Suite Green (All Tests Passing)
1. Remove test backup files
2. Update documentation
3. Final verification

### Phase 3: Final Cleanup (Before Next Release)
1. Search for any other duplicates discovered during development
2. Update changelog
3. Tag cleanup commit

---

## Notes

### Why Keep Improved Version?
The `src/services/EmbeddingService.ts` version is superior because:
- **Better Error Handling**: Wrapped console logs in NODE_ENV checks (4 locations)
- **Input Validation**: Added validation for empty inputs
- **More Recent**: Modified 1 hour later than old version
- **Production Ready**: Used by all current services

### Import Pattern Migration Completed
✅ **Old Pattern** (REMOVED): `import { EmbeddingService } from '../embedding/EmbeddingService'`
✅ **New Pattern** (CURRENT): `import { EmbeddingService } from '../services/EmbeddingService'` or `'./EmbeddingService'`

---

## Questions Before Deletion

1. **Are there any external packages importing the old path?**
   - Check package exports in `package.json`
   - Check if any examples reference old paths

2. **Are there any type references in `.d.ts` files?**
   - Search for type imports from old paths

3. **Are there any webpack/bundler configs referencing old paths?**
   - Check build configurations

---

## Completion Criteria

This cleanup is complete when:
- ✅ Zero duplicate service files exist
- ✅ Zero backup test files exist
- ✅ All tests passing (98/98+)
- ✅ Build successful with zero errors
- ✅ Documentation updated to reflect new structure
- ✅ No references to deleted files in codebase

---

## Contact
If you have questions about this cleanup plan, refer to the refactoring discussion in:
- `.github/copilot-instructions.md` - Test Refactoring Status section
- Git commit history for context on why files were duplicated
