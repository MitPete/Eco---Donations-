// Temporary fix - hardcode the correct contract addresses
const CORRECT_CONTRACTS = {
  ecoCoin: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  donationContract: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  chainId: 31337
};

// Override the contracts object
window.addEventListener('load', function() {
  if (typeof window.contracts === 'undefined') {
    window.contracts = CORRECT_CONTRACTS;
  }
});

console.log('Contract override loaded:', CORRECT_CONTRACTS);
