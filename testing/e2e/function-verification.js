const { expect } = require("chai");
const { ethers } = require("hardhat");
const { DeploymentHelpers } = require("../utils/deployment-helpers");

describe("🔍 Function Verification Tests", function () {
  let contracts, accounts;

  before(async function () {
    console.log("🏗️ Setting up contracts for function verification...");

    const signers = await ethers.getSigners();
    const deploymentResult = await DeploymentHelpers.deployCompleteEcosystem(signers);

    contracts = deploymentResult.contracts;
    accounts = deploymentResult.accounts;

    console.log("✅ Contracts deployed for verification");
  });

  it("Should verify DonationContract functions", async function () {
    console.log("\n📋 DonationContract available functions:");
    console.log("- donate function signature:", contracts.donation.interface.getFunction("donate"));

    // Test with correct Foundation enum
    const donationAmount = ethers.utils.parseEther("1.0");
    const foundation = 0; // SaveTheOceans
    const message = "Test donation";

    console.log("🧪 Testing donation with Foundation enum...");
    const tx = await contracts.donation.connect(accounts.owner).donate(foundation, message, {
      value: donationAmount
    });
    await tx.wait();
    console.log("✅ Donation successful");
  });

  it("Should verify AutoDonationContract functions", async function () {
    console.log("\n📋 AutoDonationContract available functions:");
    console.log("- setupAutoDonation exists:", typeof contracts.autoDonation.setupAutoDonation === 'function');

    // Test setup auto donation
    const setupTx = await contracts.autoDonation.connect(accounts.owner).setupAutoDonation(
      ethers.utils.parseEther("0.1"), // donation amount
      0, // foundation (SaveTheOceans)
      86400, // frequency (1 day)
      ethers.utils.parseEther("1.0") // max per trigger
    );
    await setupTx.wait();
    console.log("✅ Auto donation setup successful");
  });

  it("Should verify EcoCoin functions", async function () {
    console.log("\n📋 EcoCoin available functions:");
    console.log("- mint exists:", typeof contracts.ecoCoin.mint === 'function');
    console.log("- MAX_SUPPLY exists:", typeof contracts.ecoCoin.MAX_SUPPLY === 'function');

    const maxSupply = await contracts.ecoCoin.MAX_SUPPLY();
    console.log("- MAX_SUPPLY value:", ethers.utils.formatEther(maxSupply));

    // Test minting (owner should be authorized)
    const mintAmount = ethers.utils.parseEther("100");
    const mintTx = await contracts.ecoCoin.connect(accounts.owner).mint(accounts.owner.address, mintAmount);
    await mintTx.wait();
    console.log("✅ Minting successful");
  });

  it("Should verify MultiSigWallet functions", async function () {
    console.log("\n📋 MultiSigWallet available functions:");
    console.log("- submitTransaction exists:", typeof contracts.multiSigWallet.submitTransaction === 'function');
    console.log("- getTransaction exists:", typeof contracts.multiSigWallet.getTransaction === 'function');

    // Fund the multisig
    await accounts.owner.sendTransaction({
      to: contracts.multiSigWallet.address,
      value: ethers.utils.parseEther("5.0")
    });

    // Submit a transaction
    const submitTx = await contracts.multiSigWallet.connect(accounts.owner).submitTransaction(
      accounts.foundations[0].address,
      ethers.utils.parseEther("1.0"),
      "0x"
    );
    const receipt = await submitTx.wait();

    const event = receipt.events.find(e => e.event === "SubmitTransaction");
    const txIndex = event.args.txIndex;
    console.log("📝 Transaction submitted with index:", txIndex.toString());

    // Get transaction details
    const transaction = await contracts.multiSigWallet.getTransaction(txIndex);
    console.log("📋 Transaction confirmations:", transaction.numConfirmations.toString());
    console.log("✅ MultiSig functions working");
  });
});
