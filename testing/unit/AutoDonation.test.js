const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AutoDonation", function () {
  let autoDonation, donation, ecoCoin, owner, user1, user2, multiSigWallet, treasuryAddress;

  beforeEach(async function () {
    [owner, user1, user2, multiSigWallet, treasuryAddress] = await ethers.getSigners();

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

    // Deploy EcoCoin with correct parameters
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    ecoCoin = await EcoCoin.deploy(donation.address, multiSigWallet.address);
    await ecoCoin.deployed();

    // Deploy new DonationContract with correct EcoCoin
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

    // Deploy AutoDonation with correct contract name and parameters
    const AutoDonation = await ethers.getContractFactory("AutoDonationContract");
    autoDonation = await AutoDonation.deploy(
      donation.address,
      ecoCoin.address,
      multiSigWallet.address
    );
    await autoDonation.deployed();

    // Set up foundation addresses (required for donations to work)
    const [, , , , , foundation1, foundation2, foundation3, foundation4] = await ethers.getSigners();
    await donation.setFoundationAddress(0, foundation1.address); // Ocean cleanup
    await donation.setFoundationAddress(1, foundation2.address); // Forest preservation
    await donation.setFoundationAddress(2, foundation3.address); // Wildlife protection
    await donation.setFoundationAddress(3, foundation4.address); // Climate action
  });

  describe("Deployment", function () {
    it("Should set the correct donation and eco coin addresses", async function () {
      expect(await autoDonation.donationContract()).to.equal(donation.address);
      expect(await autoDonation.ecoCoin()).to.equal(ecoCoin.address);
    });

    it("Should set the owner correctly", async function () {
      expect(await autoDonation.owner()).to.equal(owner.address);
    });
  });

  describe("Auto-Donation Setup", function () {
    it("Should allow users to setup auto-donations", async function () {
      const donationAmount = ethers.utils.parseEther("0.1");
      const frequency = 86400; // 1 day
      const maxPerTrigger = ethers.utils.parseEther("0.2");

      await expect(
        autoDonation.connect(user1).setupAutoDonation(
          donationAmount,
          0, // Foundation index 0 (Ocean cleanup)
          frequency,
          maxPerTrigger
        )
      ).to.not.be.reverted;

      const userSettings = await autoDonation.getUserSettings(user1.address);
      expect(userSettings.donationAmount).to.equal(donationAmount);
      expect(userSettings.isActive).to.be.true;
    });

    it("Should reject donation amount too small", async function () {
      const donationAmount = ethers.utils.parseEther("0.0001"); // Below MIN_DONATION
      const frequency = 86400;
      const maxPerTrigger = ethers.utils.parseEther("0.2");

      await expect(
        autoDonation.connect(user1).setupAutoDonation(
          donationAmount,
          0,
          frequency,
          maxPerTrigger
        )
      ).to.be.revertedWith("Donation too small");
    });

    it("Should reject frequency too high", async function () {
      const donationAmount = ethers.utils.parseEther("0.1");
      const frequency = 3600; // 1 hour, below MIN_FREQUENCY of 1 day
      const maxPerTrigger = ethers.utils.parseEther("0.2");

      await expect(
        autoDonation.connect(user1).setupAutoDonation(
          donationAmount,
          0,
          frequency,
          maxPerTrigger
        )
      ).to.be.revertedWith("Frequency too high");
    });
  });

  describe("Authorization Management", function () {
    it("Should allow owner to set authorized triggers", async function () {
      await expect(
        autoDonation.connect(owner).setAuthorizedTrigger(user1.address, true)
      ).to.not.be.reverted;

      expect(await autoDonation.authorizedTriggers(user1.address)).to.be.true;
    });

    it("Should reject non-owner trying to set authorized triggers", async function () {
      await expect(
        autoDonation.connect(user1).setAuthorizedTrigger(user2.address, true)
      ).to.be.revertedWith("Unauthorized: MultiSig or Owner only");
    });
  });

  describe("User Settings Management", function () {
    beforeEach(async function () {
      const donationAmount = ethers.utils.parseEther("0.1");
      const frequency = 86400;
      const maxPerTrigger = ethers.utils.parseEther("0.2");

      await autoDonation.connect(user1).setupAutoDonation(
        donationAmount,
        0,
        frequency,
        maxPerTrigger
      );
    });

    it("Should allow users to update donation amount", async function () {
      const newAmount = ethers.utils.parseEther("0.2");

      await expect(
        autoDonation.connect(user1).updateDonationAmount(newAmount)
      ).to.not.be.reverted;

      const userSettings = await autoDonation.getUserSettings(user1.address);
      expect(userSettings.donationAmount).to.equal(newAmount);
    });

    it("Should allow users to unsubscribe", async function () {
      await expect(
        autoDonation.connect(user1).unsubscribe()
      ).to.emit(autoDonation, "AutoDonationUnsubscribed")
      .withArgs(user1.address);
    });

    it("Should check if user can trigger donation", async function () {
      // Move time forward to pass the frequency requirement
      await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
      await ethers.provider.send("evm_mine");

      const canTrigger = await autoDonation.canTriggerDonation(user1.address);
      expect(canTrigger).to.be.true;
    });
  });
});
