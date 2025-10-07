# Migration Guide - Personal Data Wallet SDK

**Version**: 1.0.0  
**Date**: October 7, 2025  
**Status**: Refactoring Complete ✅

---

## 📋 **Overview**

This guide helps you migrate from the old directory structure to the new, cleaner organization introduced in SDK v1.0.0.

**Good News**: All old import paths still work! We've maintained backward compatibility via barrel exports with deprecation warnings.

---

## 🔄 **What Changed**

### **Directory Reorganization**

**Old Structure** (deprecated):
```
src/
├── types/          # ❌ Deprecated
├── blockchain/     # ❌ Deprecated
├── storage/        # ❌ Deprecated
├── security/       # ❌ Deprecated
└── services/       # Mixed organization
```

**New Structure** (recommended):
```
src/
├── core/
│   ├── types/      # ✅ Core domain types
│   └── interfaces/ # ✅ Service interfaces
├── infrastructure/
│   ├── walrus/     # ✅ Walrus storage
│   ├── sui/        # ✅ Sui blockchain
│   ├── ai/         # ✅ Gemini AI
│   └── seal/       # ✅ SEAL encryption
├── services/       # ✅ All 14 business logic services
└── utils/          # ✅ Utilities
```

---

## 🚀 **Migration Steps**

### **Step 1: Update Type Imports**

**Before** (deprecated):
```typescript
import { ContextWallet, MainWallet } from '@personal-data-wallet/sdk/types';
import { PDWConfig } from '@personal-data-wallet/sdk/types';
```

**After** (recommended):
```typescript
import { ContextWallet, MainWallet } from '@personal-data-wallet/sdk/core/types';
import { PDWConfig } from '@personal-data-wallet/sdk/core/types';
```

**Or** (main export):
```typescript
import { ContextWallet, MainWallet, PDWConfig } from '@personal-data-wallet/sdk';
```

---

### **Step 2: Update Infrastructure Imports**

#### **Walrus Storage**

**Before** (deprecated):
```typescript
import { WalrusStorageService, StorageManager } from '@personal-data-wallet/sdk/storage';
```

**After** (recommended):
```typescript
import { WalrusStorageService, StorageManager } from '@personal-data-wallet/sdk/infrastructure/walrus';
```

**Or** (main export):
```typescript
import { WalrusStorageService, StorageManager } from '@personal-data-wallet/sdk';
```

#### **Sui Blockchain**

**Before** (deprecated):
```typescript
import { SuiService, BlockchainManager } from '@personal-data-wallet/sdk/blockchain';
```

**After** (recommended):
```typescript
import { SuiService, BlockchainManager } from '@personal-data-wallet/sdk/infrastructure/sui';
```

**Or** (main export):
```typescript
import { SuiService, BlockchainManager } from '@personal-data-wallet/sdk';
```

#### **SEAL Encryption**

**Before** (deprecated):
```typescript
import { SealService } from '@personal-data-wallet/sdk/security';
```

**After** (recommended):
```typescript
import { SealService } from '@personal-data-wallet/sdk/infrastructure/seal';
```

**Or** (main export):
```typescript
import { SealService } from '@personal-data-wallet/sdk';
```

---

### **Step 3: Use New Service Exports**

All 14 services are now exported from the main package:

```typescript
import {
  StorageService,
  EmbeddingService,
  GeminiAIService,
  QueryService,
  ClassifierService,
  MemoryIndexService,
  ViewService,
  TransactionService,
  BatchService,
  ChatService,
  CrossContextPermissionService,
  MemoryService,
  VectorService
} from '@personal-data-wallet/sdk';
```

---

### **Step 4: Use Core Interfaces**

New in v1.0.0 - standardized service interfaces:

```typescript
import {
  IService,
  BaseService,
  ILogger,
  IServiceMetrics,
  ServiceState,
  ServiceHealth,
  ConsoleLogger
} from '@personal-data-wallet/sdk';
```

---

## 📊 **Import Path Reference**

### **Complete Migration Table**

| Old Path | New Path | Main Export | Status |
|----------|----------|-------------|--------|
| `@pdw/sdk/types` | `@pdw/sdk/core/types` | ✅ | Deprecated |
| `@pdw/sdk/blockchain` | `@pdw/sdk/infrastructure/sui` | ✅ | Deprecated |
| `@pdw/sdk/storage` | `@pdw/sdk/infrastructure/walrus` | ✅ | Deprecated |
| `@pdw/sdk/security` | `@pdw/sdk/infrastructure/seal` | ✅ | Deprecated |
| N/A | `@pdw/sdk/core/interfaces` | ✅ | New |
| N/A | `@pdw/sdk/services/*` | ✅ | New |

---

## ⚡ **Quick Migration Script**

Use this script to automatically update your imports:

```bash
# Find and replace deprecated imports
find . -name "*.ts" -type f -exec sed -i \
  -e "s|from '@personal-data-wallet/sdk/types'|from '@personal-data-wallet/sdk/core/types'|g" \
  -e "s|from '@personal-data-wallet/sdk/blockchain'|from '@personal-data-wallet/sdk/infrastructure/sui'|g" \
  -e "s|from '@personal-data-wallet/sdk/storage'|from '@personal-data-wallet/sdk/infrastructure/walrus'|g" \
  -e "s|from '@personal-data-wallet/sdk/security'|from '@personal-data-wallet/sdk/infrastructure/seal'|g" \
  {} +
```

---

## 🎯 **Recommended Approach**

### **Option 1: Gradual Migration** (Recommended)
1. Keep using old imports (they still work)
2. Update imports file-by-file as you touch code
3. Use IDE warnings to guide migration
4. No rush - backward compatibility maintained

### **Option 2: Immediate Migration**
1. Run the migration script above
2. Test your application thoroughly
3. Update all imports at once
4. Faster but requires more testing

### **Option 3: Main Export Only**
1. Import everything from main package
2. Simplest approach
3. Slightly larger bundle (less tree-shaking)
4. Best for small applications

---

## 🔍 **Breaking Changes**

### **None!** ✅

All old import paths still work via barrel exports. This is a **non-breaking** refactoring.

### **Deprecation Warnings**

You'll see JSDoc deprecation warnings in your IDE:

```typescript
/**
 * @deprecated Import from '@personal-data-wallet/sdk/core/types' instead
 */
```

These are informational only - your code will continue to work.

---

## 📚 **New Features in v1.0.0**

### **1. Service Interfaces**

All services now implement standard interfaces:

```typescript
import { BaseService, IService } from '@personal-data-wallet/sdk';

class MyService extends BaseService {
  // Automatic lifecycle management
  // Built-in metrics tracking
  // Consistent logging
}
```

### **2. Better Organization**

Clear separation of concerns:
- **Core**: Domain types and interfaces
- **Infrastructure**: External integrations
- **Services**: Business logic
- **Utils**: Utilities

### **3. Improved Tree-Shaking**

Better bundle size optimization with explicit exports.

---

## 🆘 **Need Help?**

### **Common Issues**

**Issue**: TypeScript can't find module
```
Cannot find module '@personal-data-wallet/sdk/core/types'
```

**Solution**: Make sure you're using SDK v1.0.0 or later:
```bash
npm install @personal-data-wallet/sdk@latest
```

---

**Issue**: Deprecation warnings in IDE

**Solution**: Update your imports to use new paths (see migration table above)

---

## 📞 **Support**

- **GitHub Issues**: https://github.com/CommandOSSLabs/personal-data-wallet/issues
- **Documentation**: See `docs/` directory
- **Examples**: See `examples/` directory

---

**Migration Guide Version**: 1.0.0  
**Last Updated**: October 7, 2025  
**Backward Compatibility**: ✅ Maintained

