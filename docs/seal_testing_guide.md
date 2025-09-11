# 🧪 Seal Implementation Testing Guide

## 🚀 **Quick Start Testing**

### **1. Start the Backend**
```bash
cd backend
npm install
npm run start:dev
```

### **2. Start the Frontend**
```bash
cd ../app  # or wherever your Next.js app is
npm install
npm run dev
```

### **3. Access the Application**
- Main app: http://localhost:3000
- Permissions page: http://localhost:3000/permissions

---

## 🔐 **Feature Testing Checklist**

### **✅ Session Management Testing**

#### **Test Session Creation**
```bash
# Test session request
curl -X POST http://localhost:3000/api/seal/session/request \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "ttlMinutes": 30
  }'
```

#### **Test Session Verification**
```bash
# Test session verification (use sessionId from above)
curl -X POST http://localhost:3000/api/seal/session/verify/SESSION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "signature": "mock_signature_for_testing"
  }'
```

### **✅ Time-lock Encryption Testing**

#### **Test Time-lock Encryption**
```bash
# Encrypt content with 1-hour time-lock
curl -X POST http://localhost:3000/api/seal/timelock/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a secret message for the future!",
    "unlockTime": "'$(date -d '+1 hour' -Iseconds)'",
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

#### **Test Time-lock Status Check**
```bash
# Check if content can be decrypted (use encryptedData from above)
curl -X POST http://localhost:3000/api/seal/timelock/check \
  -H "Content-Type: application/json" \
  -d '{
    "encryptedData": "ENCRYPTED_DATA_FROM_ABOVE"
  }'
```

### **✅ Allowlist Management Testing**

#### **Test Allowlist Creation**
```bash
# Create a new allowlist
curl -X POST http://localhost:3000/api/seal/allowlist \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Family Allowlist",
    "description": "Family members access",
    "addresses": [
      "0x1234567890abcdef1234567890abcdef12345678",
      "0xabcdef1234567890abcdef1234567890abcdef12"
    ],
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

#### **Test Get User Allowlists**
```bash
# Get all allowlists for a user
curl -X GET http://localhost:3000/api/seal/allowlist/0x1234567890abcdef1234567890abcdef12345678
```

### **✅ Role Management Testing**

#### **Test Role Creation**
```bash
# Create a custom role
curl -X POST http://localhost:3000/api/seal/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Content Manager",
    "description": "Can manage content but not users",
    "permissions": ["read", "write", "encrypt", "decrypt"],
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

#### **Test Role Assignment**
```bash
# Assign role to user (use roleId from above)
curl -X POST http://localhost:3000/api/seal/roles/ROLE_ID/assign \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "ROLE_ID",
    "userAddress": "0xabcdef1234567890abcdef1234567890abcdef12",
    "assignedBy": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

#### **Test Permission Check**
```bash
# Check if user has specific permission
curl -X POST http://localhost:3000/api/seal/roles/check-permission \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0xabcdef1234567890abcdef1234567890abcdef12",
    "permission": "decrypt"
  }'
```

### **✅ Analytics Testing**

#### **Test User Analytics**
```bash
# Get analytics for a user
curl -X GET http://localhost:3000/api/seal/analytics/0x1234567890abcdef1234567890abcdef12345678
```

#### **Test System Health**
```bash
# Check system health
curl -X GET http://localhost:3000/api/seal/analytics/health
```

#### **Test Event Logging**
```bash
# Log a test event
curl -X POST http://localhost:3000/api/seal/analytics/event \
  -H "Content-Type: application/json" \
  -d '{
    "type": "encryption",
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "metadata": {
      "identityId": "test_memory_123",
      "type": "self"
    },
    "duration": 250,
    "success": true
  }'
```

---

## 🖥️ **Frontend UI Testing**

### **1. Authentication Flow**
1. Connect wallet in main app
2. Navigate to permissions page
3. Verify Seal authentication component appears
4. Test session creation and verification

### **2. Access Control Manager**
1. Go to "Access Control" tab
2. Create a new policy:
   - Test self-access policy
   - Test allowlist policy with multiple addresses
   - Test timelock policy with future date
3. Toggle policy active/inactive status
4. Delete a policy

### **3. Time-lock Manager**
1. Go to "Time-locked Content" tab
2. Create a time-locked memory:
   - Use suggested time (1 hour from now)
   - Use custom time
   - Test with past time (should fail)
3. View locked content (should show countdown)
4. Wait for unlock or create with past time to test decryption

### **4. Enhanced Memory Interface**
1. Navigate to memory management
2. Verify encryption status indicators
3. Test manual decryption
4. Check statistics dashboard
5. Test filtering by encryption status

---

## 🐛 **Common Issues & Solutions**

### **Issue: "Browser not installed" Error**
```bash
# Install Playwright browsers
cd backend
npx playwright install
```

### **Issue: "Session key not found" Error**
- Ensure you've created a session first
- Check session hasn't expired (default 30 minutes)
- Verify user address matches exactly

### **Issue: "Invalid Sui address" Error**
- Ensure addresses start with "0x"
- Ensure addresses are exactly 66 characters long
- Use valid hex characters only

### **Issue: Time-lock "not yet expired" Error**
- Check unlock time is in the future when encrypting
- Verify current time vs unlock time
- Test with past unlock time for immediate access

### **Issue: Frontend components not loading**
- Check console for JavaScript errors
- Verify all dependencies are installed
- Ensure backend is running on correct port

---

## 📊 **Expected Test Results**

### **Successful Session Creation**
```json
{
  "sessionId": "session_1234567890_abcdef",
  "personalMessage": "Sign this message to authenticate...",
  "expiresAt": "2024-01-01T12:00:00.000Z",
  "ttlMinutes": 30
}
```

### **Successful Time-lock Encryption**
```json
{
  "success": true,
  "encryptedData": "base64_encoded_encrypted_content",
  "identityId": "timelock_1704110400000_abc123",
  "unlockTime": 1704110400000,
  "unlockTimeISO": "2024-01-01T12:00:00.000Z"
}
```

### **Successful Role Creation**
```json
{
  "id": "role_1234567890_abcdef",
  "name": "Content Manager",
  "description": "Can manage content but not users",
  "permissions": ["read", "write", "encrypt", "decrypt"],
  "owner": "0x1234567890abcdef1234567890abcdef12345678",
  "isActive": true,
  "memberCount": 0,
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

---

## 🎯 **Performance Testing**

### **Load Testing Session APIs**
```bash
# Test multiple concurrent session requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/seal/session/request \
    -H "Content-Type: application/json" \
    -d "{\"userAddress\": \"0x123456789${i}abcdef1234567890abcdef12345678\", \"ttlMinutes\": 30}" &
done
wait
```

### **Memory Usage Testing**
```bash
# Monitor memory usage during batch operations
# Check system metrics endpoint
curl -X GET http://localhost:3000/api/seal/analytics/system/metrics
```

---

## ✅ **Testing Completion Checklist**

- [ ] All backend APIs respond correctly
- [ ] Frontend components load without errors
- [ ] Session management works end-to-end
- [ ] Time-lock encryption/decryption functions
- [ ] Allowlist creation and management works
- [ ] Role assignment and permission checking works
- [ ] Analytics and monitoring collect data
- [ ] Error handling works as expected
- [ ] Performance is acceptable under load
- [ ] UI is responsive and user-friendly

---

## 🎉 **Ready for Production!**

Once all tests pass, your Seal implementation is ready for production deployment! 🚀🔐✨
