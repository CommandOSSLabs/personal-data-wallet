# SEAL Access Control - Deployment Information

## Testnet Deployment

**Deployment Date**: 2025-09-09  
**Network**: Sui Testnet  
**Deployer**: `0x8b382bc24d601e3986bd973b6941b1940ab0ae0a899c293380781e92808c2adb`

### Package Information
- **Package ID**: `0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60`
- **Transaction Digest**: `7QwUueGNK4VKP5kbEznwnzfPWoc3MTh1RKYYZ4TtBZG8`
- **Upgrade Cap ID**: `0xee515e2d93b386cbd557aa51ba5a3294e476bce7cf035e3b91f52437a9161509`
- **Version**: 1
- **Gas Cost**: 49.76 SUI

### Deployed Modules
1. **seal_access_control** - Main SEAL access control implementation
2. **memory** - Memory management for personal data
3. **chat_sessions** - Chat session management

### SEAL Access Control Functions

#### Entry Functions (Callable from transactions)
- `seal_approve(id: vector<u8>)` - Basic self-access approval
- `seal_approve_app(id: vector<u8>, allowlist: &AppAllowlist, clock: &Clock)` - App-based access
- `seal_approve_timelock(id: vector<u8>, timelock: &TimeLock, clock: &Clock)` - Time-locked access
- `seal_approve_role(id: vector<u8>, registry: &RoleRegistry, required_role: String)` - Role-based access

#### Management Functions
- `create_app_allowlist_entry(name: String, expires_at: u64)` - Create app allowlist
- `create_time_lock_entry(unlock_time: u64)` - Create time lock
- `create_role_registry_entry()` - Create role registry

### Integration with Backend

The backend SEAL service has been configured with the deployed package ID:
```typescript
// backend/src/infrastructure/seal/seal.service.ts
private readonly packageId = '0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60';
```

### Usage Examples

#### 1. Self Access (Basic)
```bash
sui client call \
  --package 0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60 \
  --module seal_access_control \
  --function seal_approve \
  --args "vector<u8>[116,101,115,116,95,105,100]"
```

#### 2. Create App Allowlist
```bash
sui client call \
  --package 0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60 \
  --module seal_access_control \
  --function create_app_allowlist_entry \
  --args "My App Allowlist" 0
```

#### 3. Create Time Lock
```bash
sui client call \
  --package 0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60 \
  --module seal_access_control \
  --function create_time_lock_entry \
  --args 1704067200000
```

### Explorer Links

- **Package**: https://testnet.suivision.xyz/package/0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60
- **Transaction**: https://testnet.suivision.xyz/txblock/7QwUueGNK4VKP5kbEznwnzfPWoc3MTh1RKYYZ4TtBZG8
- **Upgrade Cap**: https://testnet.suivision.xyz/object/0xee515e2d93b386cbd557aa51ba5a3294e476bce7cf035e3b91f52437a9161509

### Next Steps

1. ✅ **Deploy Move Package** - COMPLETED
2. 🔄 **Implement SessionKey Management** - IN PROGRESS
3. ⏳ **Add Frontend Integration** - PENDING
4. ⏳ **Create Management APIs** - PENDING
5. ⏳ **Testing & Production** - PENDING

### Environment Variables

Add these to your backend `.env` file:
```env
SEAL_PACKAGE_ID=0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60
SEAL_NETWORK=testnet
SEAL_THRESHOLD=2
```

### Security Notes

- The upgrade capability is held by the deployer address
- All access control objects use capability-based admin controls
- Namespace validation ensures data isolation between different access control objects
- Time locks use the Sui Clock object for tamper-proof time validation
