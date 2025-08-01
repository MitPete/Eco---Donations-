const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AutoDonation", function () {
  let autoDonation, donation, ecoCoin, owner, user1, user2, foundation1, foundation2;

  beforeEach(async function () {
    [owner, user1, user2, foundation1, foundation2] = await ethers.getSigners();

    // Deploy EcoCoin
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const maxSupply = ethers.utils.parseEther("1000000");
    ecoCoin = await EcoCoin.deploy(maxSupply);
    await ecoCoin.deployed();

    // Deploy Donation Contract
    const DonationContract = await ethers.getContractFactory("DonationContract");
    donation = await DonationContract.deploy(
      ecoCoin.address,
      foundation1.address,
      foundation2.address,
      ethers.constants.AddressZero, // No third foundation for testing
      ethers.constants.AddressZero,
      ethers.constants.AddressZero
    );
    await donation.deployed();

    // Deploy AutoDonation
    const AutoDonation = await ethers.getContractFactory("AutoDonationService");
    autoDonation = await AutoDonation.deploy(donation.address, ecoCoin.address);
    await autoDonation.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct donation and eco coin addresses", async function () {
      expect(await autoDonation.donationContract()).to.equal(donation.address);
      expect(await autoDonation.ecoToken()).to.equal(ecoCoin.address);
    });

    it("Should set the owner correctly", async function () {
      expect(await autoDonation.owner()).to.equal(owner.address);
    });
  });

  describe("Fixed Amount Subscription", function () {
    it("Should allow users to subscribe to fixed amount auto-donations", async function () {
      const fixedAmount = ethers.utils.parseEther("0.01");
      const monthlyLimit = ethers.utils.parseEther("1.0");
      const minTransactionValue = ethers.utils.parseEther("0.1");

      await autoDonation.connect(user1).subscribeFixedAmount(
        fixedAmount,
        0, // Foundation index
        monthlyLimit,
        minTransactionValue
      );

      const userSettings = await autoDonation.userSettings(user1.address);
      expect(userSettings.isActive).to.be.true;
      expect(userSettings.donationAmount).to.equal(fixedAmount);
      expect(userSettings.usePercentage).to.be.false;
      expect(userSettings.monthlyLimit).to.equal(monthlyLimit);
      expect(userSettings.minTransactionValue).to.equal(minTransactionValue);
    });

    it("Should reject zero donation amount", async function () {
      await expect(
        autoDonation.connect(user1).subscribeFixedAmount(
          0,
          0,
          ethers.utils.parseEther("1.0"),
          ethers.utils.parseEther("0.1")
        )
      ).to.be.revertedWith("Donation amount must be greater than 0");
    });

    it("Should reject zero monthly limit", async function () {
      await expect(
        autoDonation.connect(user1).subscribeFixedAmount(
          ethers.utils.parseEther("0.01"),
          0,
          0,
          ethers.utils.parseEther("0.1")
        )
      ).to.be.revertedWith("Monthly limit must be greater than 0");
    });
  });

  describe("Percentage Subscription", function () {
    it("Should allow users to subscribe to percentage-based auto-donations", async function () {
      const donationPercentage = 50; // 0.5%
      const monthlyLimit = ethers.utils.parseEther("1.0");
      const minTransactionValue = ethers.utils.parseEther("0.1");
      const maxSingleDonation = ethers.utils.parseEther("0.05");

      await autoDonation.connect(user1).subscribePercentage(
        donationPercentage,
        0,
        monthlyLimit,
        minTransactionValue,
        maxSingleDonation
      );

      const userSettings = await autoDonation.userSettings(user1.address);
      expect(userSettings.isActive).to.be.true;
      expect(userSettings.donationPercentage).to.equal(donationPercentage);
      expect(userSettings.usePercentage).to.be.true;
      expect(userSettings.maxSingleDonation).to.equal(maxSingleDonation);
    });

    it("Should reject percentage greater than 10000 (100%)", async function () {
      await expect(
        autoDonation.connect(user1).subscribePercentage(
          10001, // > 100%
          0,
          ethers.utils.parseEther("1.0"),
          ethers.utils.parseEther("0.1"),
          ethers.utils.parseEther("0.05")
        )
      ).to.be.revertedWith("Percentage cannot exceed 100%");
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to add authorized triggers", async function () {
      await autoDonation.connect(owner).addAuthorizedTrigger(user1.address);
      expect(await autoDonation.authorizedTriggers(user1.address)).to.be.true;
    });

    it("Should allow owner to remove authorized triggers", async function () {
      await autoDonation.connect(owner).addAuthorizedTrigger(user1.address);
      await autoDonation.connect(owner).removeAuthorizedTrigger(user1.address);
      expect(await autoDonation.authorizedTriggers(user1.address)).to.be.false;
    });

    it("Should reject non-owner trying to add authorized triggers", async function () {
      await expect(
        autoDonation.connect(user1).addAuthorizedTrigger(user2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Auto-Donation Triggering", function () {
    beforeEach(async function () {
      // Setup user with fixed amount subscription
      await autoDonation.connect(user1).subscribeFixedAmount(
        ethers.utils.parseEther("0.01"),
        0,
        ethers.utils.parseEther("1.0"),
        ethers.utils.parseEther("0.1")
      );

      // Authorize owner to trigger
      await autoDonation.connect(owner).addAuthorizedTrigger(owner.address);
    });

    it("Should trigger auto-donation for eligible users", async function () {
      const transactionValue = ethers.utils.parseEther("0.5");
      const donationAmount = ethers.utils.parseEther("0.01");

      await expect(
        autoDonation.connect(owner).triggerAutoDonation(
          user1.address,
          transactionValue,
          { value: donationAmount }
        )
      ).to.emit(autoDonation, "AutoDonationTriggered");

      const totalDonated = await autoDonation.totalAutoDonated(user1.address);
      expect(totalDonated).to.equal(donationAmount);
    });

    it("Should reject unauthorized trigger attempts", async function () {
      await expect(
        autoDonation.connect(user2).triggerAutoDonation(
          user1.address,
          ethers.utils.parseEther("0.5"),
          { value: ethers.utils.parseEther("0.01") }
        )
      ).to.be.revertedWith("Not authorized to trigger auto-donations");
    });

    it("Should reject triggering for inactive users", async function () {
      await autoDonation.connect(user1).unsubscribe();

      await expect(
        autoDonation.connect(owner).triggerAutoDonation(
          user1.address,
          ethers.utils.parseEther("0.5"),
          { value: ethers.utils.parseEther("0.01") }
        )
      ).to.be.revertedWith("User not subscribed to auto-donations");
    });
  });

  describe("Unsubscribe", function () {
    it("Should allow users to unsubscribe", async function () {
      // First subscribe
      await autoDonation.connect(user1).subscribeFixedAmount(
        ethers.utils.parseEther("0.01"),
        0,
        ethers.utils.parseEther("1.0"),
        ethers.utils.parseEther("0.1")
      );

      // Then unsubscribe
      await autoDonation.connect(user1).unsubscribe();

      const userSettings = await autoDonation.userSettings(user1.address);
      expect(userSettings.isActive).to.be.false;
    });

    it("Should emit unsubscribe event", async function () {
      await autoDonation.connect(user1).subscribeFixedAmount(
        ethers.utils.parseEther("0.01"),
        0,
        ethers.utils.parseEther("1.0"),
        ethers.utils.parseEther("0.1")
      );

      await expect(autoDonation.connect(user1).unsubscribe())
        .to.emit(autoDonation, "UserUnsubscribed")
        .withArgs(user1.address);
    });
  });

  describe("Monthly Limits", function () {
    it("Should track monthly spending correctly", async function () {
      const donationAmount = ethers.utils.parseEther("0.01");

      await autoDonation.connect(user1).subscribeFixedAmount(
        donationAmount,
        0,
        ethers.utils.parseEther("1.0"),
        ethers.utils.parseEther("0.1")
      );

      await autoDonation.connect(owner).addAuthorizedTrigger(owner.address);

      await autoDonation.connect(owner).triggerAutoDonation(
        user1.address,
        ethers.utils.parseEther("0.5"),
        { value: donationAmount }
      );

      const userSettings = await autoDonation.userSettings(user1.address);
      expect(userSettings.currentMonthSpent).to.equal(donationAmount);
    });

    it("Should prevent donations exceeding monthly limit", async function () {
      const donationAmount = ethers.utils.parseEther("1.1"); // Exceeds 1.0 ETH limit

      await autoDonation.connect(user1).subscribeFixedAmount(
        donationAmount,
        0,
        ethers.utils.parseEther("1.0"), // 1.0 ETH monthly limit
        ethers.utils.parseEther("0.1")
      );

      await autoDonation.connect(owner).addAuthorizedTrigger(owner.address);

      await expect(
        autoDonation.connect(owner).triggerAutoDonation(
          user1.address,
          ethers.utils.parseEther("0.5"),
          { value: donationAmount }
        )
      ).to.be.revertedWith("Would exceed monthly limit");
    });
  });
});
