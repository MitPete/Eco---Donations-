const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 TESTNET DEPLOYMENT CHECKER");
    console.log("============================");
    
    // Check network
    const network = hre.network.name;
    console.log("📡 Network:", network);
    
    if (network === 'sepolia') {
        console.log("✅ Connected to Sepolia testnet");
        
        // Check deployer balance
        const [deployer] = await ethers.getSigners();
        const balance = await deployer.getBalance();
        
        console.log("👤 Deployer:", deployer.address);
        console.log("💰 Balance:", ethers.utils.formatEther(balance), "ETH");
        
        if (balance.gt(ethers.utils.parseEther("0.1"))) {
            console.log("✅ Sufficient balance for deployment");
        } else {
            console.log("⚠️  Low balance - get testnet ETH from faucet");
        }
    } else {
        console.log("ℹ️  Not connected to testnet");
    }
    
    // Check environment variables
    console.log("\n🔧 Environment Check:");
    console.log("SEPOLIA_RPC_URL:", process.env.SEPOLIA_RPC_URL ? "✅ Set" : "❌ Missing");
    console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✅ Set" : "❌ Missing");
    console.log("ETHERSCAN_API_KEY:", process.env.ETHERSCAN_API_KEY ? "✅ Set" : "❌ Missing");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
