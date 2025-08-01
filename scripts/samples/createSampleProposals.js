// Script to create sample proposals for testing governance UI
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Get governance contract
  const governanceAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const EcoGovernance = await ethers.getContractAt("EcoGovernance", governanceAddress);

  console.log("Creating sample proposals...");

  // Sample proposals
  const proposals = [
    {
      description: "Add Ocean Conservation Foundation to approved foundations list",
      duration: 7 * 24 * 60 * 60 // 7 days
    },
    {
      description: "Increase platform fee from 1% to 2% to fund development",
      duration: 14 * 24 * 60 * 60 // 14 days
    },
    {
      description: "Enable governance token staking rewards program",
      duration: 10 * 24 * 60 * 60 // 10 days
    },
    {
      description: "Launch carbon offset verification partnership",
      duration: 5 * 24 * 60 * 60 // 5 days
    }
  ];

  for (let i = 0; i < proposals.length; i++) {
    try {
      const tx = await EcoGovernance.createProposal(
        proposals[i].description,
        proposals[i].duration
      );
      await tx.wait();
      console.log(`✅ Created proposal ${i + 1}: ${proposals[i].description}`);
    } catch (error) {
      console.error(`❌ Failed to create proposal ${i + 1}:`, error.message);
    }
  }

  console.log("\n🎉 Sample proposals created successfully!");
  console.log("You can now view them in the governance interface.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
