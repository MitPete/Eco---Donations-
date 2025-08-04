# 🧪 Testing Guide: Wallet Management System

> **Complete testing procedures to verify the "Bridging the Gap" wallet management functionality**

## 🎯 Testing Overview

This guide covers testing all aspects of the wallet management system:

- Automatic wallet creation
- Donation processing and splitting
- Admin dashboard functionality
- Organization notifications
- Error handling and edge cases

## 🔧 Pre-Testing Setup

### 1. **Environment Requirements**

```bash
# Ensure server is running
cd /Users/petermichell/Eco---Donations-/frontend
python3 -m http.server 8890

# Open testing URLs
http://localhost:8890/public/donate.html
http://localhost:8890/public/admin-organizations.html
```

### 2. **MetaMask Setup**

- Ensure MetaMask is installed and connected
- Use test network (Localhost 8545 or Sepolia)
- Have some test ETH available (0.1+ ETH recommended)

### 3. **Browser Console**

- Open Developer Tools (F12)
- Monitor Console tab for debug messages
- Watch for success/error indicators

## 🧪 Test Scenarios

### **Test 1: Basic Donation Flow**

#### **Objective**: Verify complete donation process creates organization wallet

#### **Steps**:

1. **Open Donation Page**

   ```
   http://localhost:8890/public/donate.html
   ```

2. **Select Foundation Card**

   - Click on "Save The Oceans" card
   - Verify card gets selected (green border + checkmark)
   - Check console for: `🎯 Foundation card clicked: 0 -> Category: ocean`

3. **Select Organization**

   - Verify category dropdown shows "Ocean Conservation"
   - Select an organization from dropdown
   - Verify organization details appear

4. **Enter Donation Amount**

   - Enter amount: `0.05` ETH
   - Add message: "Test donation for wallet creation"

5. **Submit Donation**

   - Click "Donate Now"
   - Check console for debug messages:
     ```
     🚀 Starting donation process...
     📝 Donation details: {category: "ocean", organizationId: "ocean_conservancy", amount: 0.05, organization: "Ocean Conservancy"}
     👤 User wallet: 0x...
     🆕 Creating new wallet for Ocean Conservancy (if first donation)
     ✅ Created wallet for Ocean Conservancy: 0x...
     💰 Amount breakdown: {total: 0.05, platformFee: 0.0015, toOrganization: 0.0485}
     ```

6. **Approve MetaMask Transactions**

   - First transaction: 0.0485 ETH to organization
   - Second transaction: 0.0015 ETH to platform

7. **Verify Success**
   - Look for success toast: "Successfully donated X ETH to [Organization]!"
   - Form should reset
   - Console should show: `✅ Donation completed successfully!`

#### **Expected Results**:

- ✅ Wallet automatically created for organization
- ✅ Two transactions processed (97% + 3% split)
- ✅ Donation recorded in localStorage
- ✅ Organization notified

---

### **Test 2: Admin Dashboard Verification**

#### **Objective**: Confirm wallet appears in admin dashboard

#### **Steps**:

1. **Open Admin Dashboard**

   ```
   http://localhost:8890/public/admin-organizations.html
   ```

2. **Check Statistics**

   - Total Organizations: Should be 1+
   - Total Wallets: Should be 1+
   - Total ETH Balance: Should show your donation amount
   - Check console for: `✅ Organizations initialized with categories:`

3. **Verify Wallet Table**

   - Organization name should appear
   - Wallet address should be displayed
   - Balance should show donation amount (minus gas)
   - Status should be "Active"

4. **Test Individual Wallet Actions**

   - Click "View" button - should show wallet details
   - Click "Convert" button - should show conversion dialog
   - Click "Notify" button - should show notification sent

5. **Test Wallet Management Tools**
   - Select organization in dropdown
   - Click "Check Balance" - should display current balance
   - Try conversion tools (simulation only)

#### **Expected Results**:

- ✅ Organization appears in wallet table
- ✅ Correct balance displayed
- ✅ All management tools functional

---

### **Test 3: Multiple Organizations**

#### **Objective**: Test wallet creation for different organizations

#### **Steps**:

1. **Donate to Different Foundation**

   - Select "Protect The Rainforest" card
   - Choose different organization
   - Make another test donation (0.03 ETH)

2. **Verify Separate Wallets**

   - Check admin dashboard shows 2 organizations
   - Verify each has unique wallet address
   - Confirm separate balances

3. **Test Batch Operations**
   - In admin dashboard, select multiple organizations
   - Test batch conversion tools
   - Verify notification system

#### **Expected Results**:

- ✅ Each organization gets unique wallet
- ✅ Balances tracked separately
- ✅ Batch operations work correctly

---

### **Test 4: Error Handling**

#### **Objective**: Verify system handles errors gracefully

#### **Steps**:

1. **Test Validation Errors**

   - Try donating without selecting category
   - Try donating without selecting organization
   - Try donating with 0 amount
   - Verify error messages appear

2. **Test Wallet Connection Issues**

   - Disconnect MetaMask
   - Try to donate
   - Verify proper error handling

3. **Test Network Issues**
   - Switch to wrong network
   - Try donation
   - Verify network error handling

#### **Expected Results**:

- ✅ Clear error messages for all validation failures
- ✅ Graceful handling of wallet connection issues
- ✅ Network error detection and messaging

---

### **Test 5: Data Persistence**

#### **Objective**: Verify data persists across browser sessions

#### **Steps**:

1. **Make Test Donation**

   - Complete full donation flow
   - Note organization wallet and balance

2. **Refresh Browser**

   - Reload admin dashboard
   - Verify wallet still appears
   - Confirm balance is maintained

3. **Check LocalStorage**
   - Open Developer Tools > Application > Local Storage
   - Verify keys exist:
     - `organizationWallets`
     - `secureOrgWallets`
     - `donations`
     - `orgNotifications`

#### **Expected Results**:

- ✅ Data persists across refreshes
- ✅ LocalStorage contains expected data
- ✅ No data loss occurs

---

## 🔍 Debugging Common Issues

### **Issue: "Organizations not loading"**

```javascript
// Check in console:
console.log("organizationCategories:", organizationCategories);
console.log("organizations:", organizations);

// If undefined, check:
// 1. organizations.js file loading correctly
// 2. Script path is correct: src="organizations.js"
// 3. No JavaScript errors blocking execution
```

### **Issue: "Wallet creation failing"**

```javascript
// Check in console:
console.log("ethers available:", typeof ethers);
console.log("Wallet creation test:", ethers.Wallet.createRandom());

// If failing:
// 1. Verify ethers.js is loaded
// 2. Check for console errors
// 3. Ensure sufficient gas for transactions
```

### **Issue: "MetaMask not connecting"**

```javascript
// Check in console:
console.log("ethereum available:", typeof ethereum);
console.log("accounts:", await ethereum.request({ method: "eth_accounts" }));

// If failing:
// 1. Ensure MetaMask is installed
// 2. Check if site is connected in MetaMask
// 3. Try reconnecting wallet
```

### **Issue: "Admin dashboard empty"**

```javascript
// Check localStorage:
console.log("Stored wallets:", localStorage.getItem("organizationWallets"));
console.log("Secure wallets:", localStorage.getItem("secureOrgWallets"));
console.log("Donations:", localStorage.getItem("donations"));

// If empty:
// 1. Complete donation flow first
// 2. Check for JavaScript errors
// 3. Verify data is being stored correctly
```

## 📊 Testing Checklist

### **Core Functionality**

- [ ] Foundation card selection works
- [ ] Organization dropdown populates
- [ ] Donation form validation works
- [ ] Wallet auto-creation functions
- [ ] Transaction splitting (97/3) works
- [ ] MetaMask integration functional
- [ ] Success/error messages display
- [ ] Data persists in localStorage

### **Admin Dashboard**

- [ ] Organization list displays
- [ ] Wallet addresses shown
- [ ] Balances calculated correctly
- [ ] Management tools functional
- [ ] Statistics update correctly
- [ ] Batch operations work
- [ ] Notification system functions

### **Error Handling**

- [ ] Form validation catches errors
- [ ] Wallet connection errors handled
- [ ] Network errors managed
- [ ] Transaction failures handled gracefully
- [ ] Clear error messages displayed

### **Data Integrity**

- [ ] Donations recorded accurately
- [ ] Wallet addresses stored securely
- [ ] Balance calculations correct
- [ ] Data persists across sessions
- [ ] No data corruption occurs

## 🚀 Advanced Testing

### **Load Testing**

```javascript
// Test multiple rapid donations
for (let i = 0; i < 5; i++) {
  setTimeout(() => {
    // Simulate donation process
    console.log(`Test donation ${i + 1}`);
  }, i * 1000);
}
```

### **Security Testing**

```javascript
// Test wallet security
console.log(
  "Private keys encrypted:",
  JSON.parse(localStorage.getItem("secureOrgWallets"))
);

// Verify no sensitive data exposed
console.log(
  "Public wallet data:",
  JSON.parse(localStorage.getItem("organizationWallets"))
);
```

### **Performance Testing**

```javascript
// Test with many organizations
console.time("Dashboard Load");
loadOrganizationWallets();
console.timeEnd("Dashboard Load");
```

## 📋 Production Readiness Checklist

Before deploying to production:

- [ ] All tests pass consistently
- [ ] Error handling comprehensive
- [ ] Security measures implemented
- [ ] Performance optimized
- [ ] Data backup procedures in place
- [ ] Monitoring systems configured
- [ ] User documentation complete

---

## 🎯 Test Results Template

Use this template to document your testing results:

```markdown
## Test Session: [Date]

### Environment

- Browser: [Chrome/Firefox/Safari]
- MetaMask Version: [X.X.X]
- Network: [Localhost/Sepolia/Mainnet]
- Test ETH Available: [Amount]

### Test Results

- [ ] Donation Flow: [Pass/Fail] - [Notes]
- [ ] Wallet Creation: [Pass/Fail] - [Notes]
- [ ] Admin Dashboard: [Pass/Fail] - [Notes]
- [ ] Error Handling: [Pass/Fail] - [Notes]
- [ ] Data Persistence: [Pass/Fail] - [Notes]

### Issues Found

1. [Issue description]
   - Severity: [High/Medium/Low]
   - Steps to reproduce: [Details]
   - Expected vs Actual: [Description]

### Recommendations

- [List of improvements or fixes needed]
```

---

_This testing guide ensures the wallet management system works correctly and handles edge cases appropriately._
