const { ethers } = require("ethers");

async function addSampleDonations() {
  // Connect to the local Hardhat node
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

  // Contract addresses from the deployment
  const donationAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // ABI for the donate function
  const donationAbi = [
    "function donate(uint8 foundation, string memory message) external payable"
  ];

  // Use different accounts for variety
  const accounts = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Account 0
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Account 1
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // Account 2
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"  // Account 3
  ];

  const sampleDonations = [
    { foundation: 0, amount: "0.5", message: "Save our oceans! 🌊" },
    { foundation: 1, amount: "1.0", message: "Protect the rainforest 🌳" },
    { foundation: 2, amount: "0.3", message: "Ancient trees need our help 🌲" },
    { foundation: 3, amount: "0.8", message: "Clean energy for the future ⚡" },
    { foundation: 0, amount: "0.2", message: "Every drop counts 💧" },
    { foundation: 1, amount: "1.5", message: "Green future starts now 🌱" },
    { foundation: 2, amount: "0.7", message: "Preserve nature's giants 🦆" },
    { foundation: 3, amount: "0.4", message: "Solar power! ☀️" }
  ];

  console.log("Adding sample donations...");

  for (let i = 0; i < sampleDonations.length; i++) {
    const donation = sampleDonations[i];
    const accountIndex = i % accounts.length;

    try {
      const wallet = new ethers.Wallet(accounts[accountIndex], provider);
      const contract = new ethers.Contract(donationAddress, donationAbi, wallet);

      console.log(`Donation ${i + 1}: ${donation.amount} ETH to ${donation.foundation} from account ${accountIndex}`);

      const tx = await contract.donate(
        donation.foundation,
        donation.message,
        { value: ethers.utils.parseEther(donation.amount) }
      );

      await tx.wait();
      console.log(`✅ Donation ${i + 1} confirmed!`);

      // Small delay to avoid nonce issues
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Error with donation ${i + 1}:`, error.message);
    }
  }

  console.log("Sample donations completed!");
}

addSampleDonations().catch(console.error);
