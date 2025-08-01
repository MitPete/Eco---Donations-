// For public testing, we'll use a free testnet like Sepolia
// This allows users to test without running a local node

const networks = {
  // Local development
  localhost: {
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    name: "Hardhat Local"
  },

  // Public testnet for easier testing
  sepolia: {
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    name: "Sepolia Testnet"
  }
};

// For now, let's create a simple demo mode
const demoContracts = {
  ecoCoin: "0x1234567890123456789012345678901234567890", // Demo address
  donationContract: "0x0987654321098765432109876543210987654321", // Demo address
  chainId: 31337
};

module.exports = { networks, demoContracts };
