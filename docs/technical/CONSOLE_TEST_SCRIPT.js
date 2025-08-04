// 🧪 Quick Wallet Management Test Script
// Copy and paste this into the browser console on the donate page

console.log('🚀 Starting Wallet Management Test...');

// Test 1: Check if required functions are available
console.log('\n📋 Test 1: Function Availability');
console.log('✓ ethers available:', typeof ethers !== 'undefined');
console.log('✓ organizationCategories available:', typeof organizationCategories !== 'undefined');
console.log('✓ organizations available:', typeof organizations !== 'undefined');
console.log('✓ getOrganizationWalletAddress available:', typeof getOrganizationWalletAddress !== 'undefined');
console.log('✓ sendDonation available:', typeof sendDonation !== 'undefined');

// Test 2: Check organization data
console.log('\n📊 Test 2: Organization Data');
if (typeof organizationCategories !== 'undefined') {
  console.log('Categories loaded:', Object.keys(organizationCategories));
}
if (typeof organizations !== 'undefined') {
  console.log('Organizations loaded:', Object.keys(organizations));
}

// Test 3: Test wallet creation (simulation)
console.log('\n🔑 Test 3: Wallet Creation Simulation');
try {
  if (typeof ethers !== 'undefined') {
    const testWallet = ethers.Wallet.createRandom();
    console.log('✅ Wallet creation successful');
    console.log('Test wallet address:', testWallet.address);
    console.log('Address length:', testWallet.address.length);
    console.log('Starts with 0x:', testWallet.address.startsWith('0x'));
  } else {
    console.log('❌ ethers.js not available');
  }
} catch (error) {
  console.log('❌ Wallet creation failed:', error.message);
}

// Test 4: Check localStorage data
console.log('\n💾 Test 4: LocalStorage Data');
const orgWallets = localStorage.getItem('organizationWallets');
const secureWallets = localStorage.getItem('secureOrgWallets');
const donations = localStorage.getItem('donations');

console.log('Organization wallets stored:', orgWallets ? 'Yes' : 'No');
console.log('Secure wallets stored:', secureWallets ? 'Yes' : 'No');
console.log('Donations recorded:', donations ? 'Yes' : 'No');

if (orgWallets) {
  const wallets = JSON.parse(orgWallets);
  console.log('Stored wallet count:', Object.keys(wallets).length);
  console.log('Wallet addresses:', Object.values(wallets));
}

if (donations) {
  const donationList = JSON.parse(donations);
  console.log('Total donations:', donationList.length);
  if (donationList.length > 0) {
    console.log('Latest donation:', donationList[donationList.length - 1]);
  }
}

// Test 5: Form elements check
console.log('\n📝 Test 5: Form Elements');
const categorySelect = document.getElementById('category');
const organizationSelect = document.getElementById('organization');
const amountInput = document.getElementById('amount');
const donationForm = document.getElementById('donationForm');

console.log('Category select found:', categorySelect ? 'Yes' : 'No');
console.log('Organization select found:', organizationSelect ? 'Yes' : 'No');
console.log('Amount input found:', amountInput ? 'Yes' : 'No');
console.log('Donation form found:', donationForm ? 'Yes' : 'No');

if (categorySelect) {
  console.log('Category options count:', categorySelect.options.length);
}

// Test 6: MetaMask availability
console.log('\n🦊 Test 6: MetaMask Connection');
console.log('ethereum object available:', typeof ethereum !== 'undefined');

if (typeof ethereum !== 'undefined') {
  ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      console.log('Connected accounts:', accounts.length);
      if (accounts.length > 0) {
        console.log('Active account:', accounts[0]);
      }
    })
    .catch(error => {
      console.log('MetaMask error:', error.message);
    });
}

// Test 7: Simulate organization selection
console.log('\n🎯 Test 7: Organization Selection Simulation');
if (categorySelect && organizationSelect) {
  // Simulate selecting ocean category
  categorySelect.value = 'ocean';
  categorySelect.dispatchEvent(new Event('change'));

  setTimeout(() => {
    console.log('After category selection:');
    console.log('Organization options:', organizationSelect.options.length);

    if (organizationSelect.options.length > 1) {
      // Select first organization
      organizationSelect.selectedIndex = 1;
      organizationSelect.dispatchEvent(new Event('change'));
      console.log('Selected organization:', organizationSelect.value);
    }
  }, 1000);
}

// Test 8: Check foundation card functionality
console.log('\n🎨 Test 8: Foundation Cards');
const foundationCards = document.querySelectorAll('.foundation-card');
console.log('Foundation cards found:', foundationCards.length);

if (foundationCards.length > 0) {
  console.log('First card data-foundation:', foundationCards[0].getAttribute('data-foundation'));

  // Test clicking first card
  console.log('Simulating click on first foundation card...');
  foundationCards[0].click();

  setTimeout(() => {
    console.log('After card click:');
    console.log('Category value:', categorySelect ? categorySelect.value : 'N/A');
    console.log('Card has selected class:', foundationCards[0].classList.contains('selected'));
  }, 500);
}

console.log('\n🎉 Test Complete! Check results above.');
console.log('\n💡 Next Steps:');
console.log('1. If any tests failed, check for JavaScript errors');
console.log('2. Try making a small test donation (0.01 ETH)');
console.log('3. Check admin dashboard for wallet creation');
console.log('4. Monitor console during donation process');
