require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // You'll need to replace this
      accounts: [
        // Add your private key here for deployment (keep it secure!)
        "0xYOUR_PRIVATE_KEY_HERE"
      ],
      chainId: 11155111
    }
  }
};
