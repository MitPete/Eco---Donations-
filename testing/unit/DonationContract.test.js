const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationContract", function () {
  let ecoCoin, donation, owner, multiSigWallet, treasuryAddress;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    [owner, multiSigWallet, treasuryAddress] = signers;

    // Deploy DonationContract first with placeholder EcoCoin address
    const DonationContract = await ethers.getContractFactory("DonationContract");
    const uris = [
      "https://example.com/ocean.json",
      "https://example.com/forest.json",
      "https://example.com/wildlife.json",
      "https://example.com/climate.json"
    ];

    donation = await DonationContract.deploy(
      multiSigWallet.address, // Use valid address as placeholder
      multiSigWallet.address,
      treasuryAddress.address,
      uris
    );
    await donation.deployed();

    // Now deploy EcoCoin with the actual donation contract address
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    ecoCoin = await EcoCoin.deploy(donation.address, multiSigWallet.address);
    await ecoCoin.deployed();

    // Update the donation contract to use the real EcoCoin
    // This would normally be done through a proper upgrade mechanism
    // For testing, we'll need to deploy a new donation contract with correct EcoCoin
    const DonationContract2 = await ethers.getContractFactory("DonationContract");
    donation = await DonationContract2.deploy(
      ecoCoin.address,
      multiSigWallet.address,
      treasuryAddress.address,
      uris
    );
    await donation.deployed();

    // Authorize the donation contract to mint tokens
    await ecoCoin.setAuthorizedMinter(donation.address, true);

    // Set up foundation addresses (required for donations to work)
    const [, , , foundation1, foundation2, foundation3, foundation4] = await ethers.getSigners();
    await donation.setFoundationAddress(0, foundation1.address); // Ocean cleanup
    await donation.setFoundationAddress(1, foundation2.address); // Forest preservation
    await donation.setFoundationAddress(2, foundation3.address); // Wildlife protection
    await donation.setFoundationAddress(3, foundation4.address); // Climate action
  });

  it("processes donations and mints tokens", async function () {
    const [, , , donor] = await ethers.getSigners();
    const amount = ethers.utils.parseEther("1");

    const tx = donation.connect(donor).donate(0, "test message", { value: amount });
    await expect(tx).to.emit(donation, "DonationMade");

    // Check that ECO tokens were minted (10x the NET donation amount after fees)
    // Platform fee is 3.00% (300 basis points), so net amount is 97% of donation
    const platformFee = amount.mul(300).div(10000); // 3.00%
    const netAmount = amount.sub(platformFee);
    const expectedEcoAmount = netAmount.mul(10);
    expect(await ecoCoin.balanceOf(donor.address)).to.equal(expectedEcoAmount);
  });

  it("allows treasury fee withdrawal", async function () {
    // Make a donation first to generate fees
    const [, , , donor] = await ethers.getSigners();
    const amount = ethers.utils.parseEther("1");
    await donation.connect(donor).donate(0, "test message", { value: amount });

    // Check contract balance before withdrawal
    const contractBalance = await ethers.provider.getBalance(donation.address);
    expect(contractBalance).to.be.gt(0);

    // Try to withdraw treasury fees (only owner can do this)
    const withdrawAmount = ethers.utils.parseEther("0.01");
    const tx = donation.connect(owner).withdrawTreasuryFees(treasuryAddress.address, withdrawAmount);
    await expect(tx).to.not.be.reverted;
  });

  it("transfers ownership", async function () {
    const [, , , , newOwner] = await ethers.getSigners();
    await donation.transferOwnership(newOwner.address);
    expect(await donation.owner()).to.equal(newOwner.address);
  });
});
