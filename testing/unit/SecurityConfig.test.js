const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SecurityConfig", function () {
  let securityConfig, multiSigWallet, owner, emergencyResponder, nonAuthorized;

  beforeEach(async function () {
    [owner, emergencyResponder, nonAuthorized] = await ethers.getSigners();

    // Deploy MultiSigWallet first
    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    multiSigWallet = await MultiSigWallet.deploy(
      [owner.address, emergencyResponder.address],
      2
    );
    await multiSigWallet.deployed();

    // Deploy SecurityConfig
    const SecurityConfig = await ethers.getContractFactory("SecurityConfig");
    securityConfig = await SecurityConfig.deploy(multiSigWallet.address);
    await securityConfig.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct multisig wallet address", async function () {
      const params = await securityConfig.securityParams();
      expect(params.multiSigWallet).to.equal(multiSigWallet.address);
    });

    it("Should set default security parameters", async function () {
      const params = await securityConfig.securityParams();
      expect(params.maxTransactionAmount).to.equal(ethers.utils.parseEther("100"));
      expect(params.dailyWithdrawLimit).to.equal(ethers.utils.parseEther("1000"));
      expect(params.emergencyPauseDelay).to.equal(86400); // 24 hours in seconds
      expect(params.requireMultiSigForCritical).to.be.true;
    });

    it("Should set owner as emergency responder", async function () {
      expect(await securityConfig.emergencyResponders(owner.address)).to.be.true;
    });

    it("Should set multisig wallet as emergency responder", async function () {
      expect(await securityConfig.emergencyResponders(multiSigWallet.address)).to.be.true;
    });

    it("Should reject deployment with zero multisig address", async function () {
      const SecurityConfig = await ethers.getContractFactory("SecurityConfig");

      await expect(
        SecurityConfig.deploy(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid multisig address");
    });

    it("Should set owner correctly", async function () {
      expect(await securityConfig.owner()).to.equal(owner.address);
    });
  });

  describe("Security Parameters Management", function () {
    it("Should allow owner to update security parameters", async function () {
      const newParams = {
        maxTransactionAmount: ethers.utils.parseEther("200"),
        dailyWithdrawLimit: ethers.utils.parseEther("2000"),
        emergencyPauseDelay: 48 * 3600, // 48 hours
        requireMultiSigForCritical: false,
        multiSigWallet: multiSigWallet.address
      };

      await expect(
        securityConfig.connect(owner).updateSecurityParams(newParams)
      ).to.emit(securityConfig, "SecurityParamsUpdated")
        .withArgs([
          newParams.maxTransactionAmount,
          newParams.dailyWithdrawLimit,
          newParams.emergencyPauseDelay,
          newParams.requireMultiSigForCritical,
          newParams.multiSigWallet
        ]);

      const updatedParams = await securityConfig.securityParams();
      expect(updatedParams.maxTransactionAmount).to.equal(newParams.maxTransactionAmount);
      expect(updatedParams.dailyWithdrawLimit).to.equal(newParams.dailyWithdrawLimit);
      expect(updatedParams.emergencyPauseDelay).to.equal(newParams.emergencyPauseDelay);
      expect(updatedParams.requireMultiSigForCritical).to.equal(newParams.requireMultiSigForCritical);
    });

    it("Should reject parameter updates from non-owners", async function () {
      const newParams = {
        maxTransactionAmount: ethers.utils.parseEther("200"),
        dailyWithdrawLimit: ethers.utils.parseEther("2000"),
        emergencyPauseDelay: 48 * 3600,
        requireMultiSigForCritical: false,
        multiSigWallet: multiSigWallet.address
      };

      await expect(
        securityConfig.connect(nonAuthorized).updateSecurityParams(newParams)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject parameter updates with invalid multisig address", async function () {
      const newParams = {
        maxTransactionAmount: ethers.utils.parseEther("200"),
        dailyWithdrawLimit: ethers.utils.parseEther("2000"),
        emergencyPauseDelay: 48 * 3600,
        requireMultiSigForCritical: false,
        multiSigWallet: ethers.constants.AddressZero
      };

      await expect(
        securityConfig.connect(owner).updateSecurityParams(newParams)
      ).to.be.revertedWith("Invalid multisig");
    });
  });

  describe("Emergency Responder Management", function () {
    it("Should allow owner to add emergency responders", async function () {
      await expect(
        securityConfig.connect(owner).setEmergencyResponder(emergencyResponder.address, true)
      ).to.emit(securityConfig, "EmergencyResponderUpdated")
        .withArgs(emergencyResponder.address, true);

      expect(await securityConfig.emergencyResponders(emergencyResponder.address)).to.be.true;
    });

    it("Should allow owner to remove emergency responders", async function () {
      // First add the responder
      await securityConfig.connect(owner).setEmergencyResponder(emergencyResponder.address, true);

      // Then remove
      await expect(
        securityConfig.connect(owner).setEmergencyResponder(emergencyResponder.address, false)
      ).to.emit(securityConfig, "EmergencyResponderUpdated")
        .withArgs(emergencyResponder.address, false);

      expect(await securityConfig.emergencyResponders(emergencyResponder.address)).to.be.false;
    });

    it("Should reject emergency responder changes from non-owners", async function () {
      await expect(
        securityConfig.connect(nonAuthorized).setEmergencyResponder(emergencyResponder.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Security Alerts", function () {
    beforeEach(async function () {
      // Add emergency responder
      await securityConfig.connect(owner).setEmergencyResponder(emergencyResponder.address, true);
    });

    it("Should allow emergency responders to trigger security alerts", async function () {
      const alertMessage = "Suspicious activity detected";

      await expect(
        securityConfig.connect(emergencyResponder).triggerSecurityAlert(alertMessage)
      ).to.emit(securityConfig, "SecurityAlert")
        .withArgs(alertMessage, emergencyResponder.address);
    });

    it("Should allow owner to trigger security alerts", async function () {
      const alertMessage = "System maintenance required";

      await expect(
        securityConfig.connect(owner).triggerSecurityAlert(alertMessage)
      ).to.emit(securityConfig, "SecurityAlert")
        .withArgs(alertMessage, owner.address);
    });

    it("Should reject security alerts from unauthorized users", async function () {
      const alertMessage = "Unauthorized alert attempt";

      await expect(
        securityConfig.connect(nonAuthorized).triggerSecurityAlert(alertMessage)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should allow multisig wallet to trigger security alerts", async function () {
      const alertMessage = "Multisig initiated alert";

      // Note: In a real scenario, this would be called through the multisig execution
      // For testing, we verify the multisig address is authorized
      expect(await securityConfig.emergencyResponders(multiSigWallet.address)).to.be.true;
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow owner to pause the contract", async function () {
      await securityConfig.connect(owner).pause();
      expect(await securityConfig.paused()).to.be.true;
    });

    it("Should allow owner to unpause the contract", async function () {
      await securityConfig.connect(owner).pause();
      await securityConfig.connect(owner).unpause();
      expect(await securityConfig.paused()).to.be.false;
    });

    it("Should reject pause from non-owners", async function () {
      await expect(
        securityConfig.connect(nonAuthorized).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject unpause from non-owners", async function () {
      await securityConfig.connect(owner).pause();

      await expect(
        securityConfig.connect(nonAuthorized).unpause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent security alerts when paused", async function () {
      await securityConfig.connect(owner).pause();

      await expect(
        securityConfig.connect(owner).triggerSecurityAlert("Alert while paused")
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should prevent parameter updates when paused", async function () {
      await securityConfig.connect(owner).pause();

      const newParams = {
        maxTransactionAmount: ethers.utils.parseEther("200"),
        dailyWithdrawLimit: ethers.utils.parseEther("2000"),
        emergencyPauseDelay: 48 * 3600,
        requireMultiSigForCritical: false,
        multiSigWallet: multiSigWallet.address
      };

      await expect(
        securityConfig.connect(owner).updateSecurityParams(newParams)
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Access Control", function () {
    it("Should correctly identify owners", async function () {
      expect(await securityConfig.owner()).to.equal(owner.address);
    });

    it("Should allow ownership transfer", async function () {
      await securityConfig.connect(owner).transferOwnership(emergencyResponder.address);
      expect(await securityConfig.owner()).to.equal(emergencyResponder.address);
    });

    it("Should reject ownership transfer from non-owners", async function () {
      await expect(
        securityConfig.connect(nonAuthorized).transferOwnership(emergencyResponder.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Integration with MultiSig", function () {
    it("Should reference the correct multisig wallet", async function () {
      const params = await securityConfig.securityParams();
      expect(params.multiSigWallet).to.equal(multiSigWallet.address);
    });

    it("Should maintain multisig as emergency responder", async function () {
      expect(await securityConfig.emergencyResponders(multiSigWallet.address)).to.be.true;
    });

    it("Should allow updating multisig address", async function () {
      // Deploy new multisig
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
      const newMultiSig = await MultiSigWallet.deploy([owner.address], 1);
      await newMultiSig.deployed();

      const newParams = {
        maxTransactionAmount: ethers.utils.parseEther("100"),
        dailyWithdrawLimit: ethers.utils.parseEther("1000"),
        emergencyPauseDelay: 86400,
        requireMultiSigForCritical: true,
        multiSigWallet: newMultiSig.address
      };

      await securityConfig.connect(owner).updateSecurityParams(newParams);

      const updatedParams = await securityConfig.securityParams();
      expect(updatedParams.multiSigWallet).to.equal(newMultiSig.address);
    });
  });

  describe("Security Parameter Validation", function () {
    it("Should validate reasonable transaction limits", async function () {
      const params = await securityConfig.securityParams();
      expect(params.maxTransactionAmount).to.be.gt(0);
      expect(params.dailyWithdrawLimit).to.be.gt(0);
      expect(params.emergencyPauseDelay).to.be.gt(0);
    });

    it("Should maintain logical parameter relationships", async function () {
      const params = await securityConfig.securityParams();
      // Daily limit should typically be higher than single transaction limit
      expect(params.dailyWithdrawLimit).to.be.gte(params.maxTransactionAmount);
    });
  });
});
