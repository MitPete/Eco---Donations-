const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet", function () {
  let multiSigWallet, owner, owner2, owner3, nonOwner, recipient;
  const requiredConfirmations = 2;

  beforeEach(async function () {
    [owner, owner2, owner3, nonOwner, recipient] = await ethers.getSigners();

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    multiSigWallet = await MultiSigWallet.deploy(
      [owner.address, owner2.address, owner3.address],
      requiredConfirmations
    );
    await multiSigWallet.deployed();

    // Fund the wallet for testing
    await owner.sendTransaction({
      to: multiSigWallet.address,
      value: ethers.utils.parseEther("10")
    });
  });

  describe("Deployment", function () {
    it("Should set the correct owners", async function () {
      expect(await multiSigWallet.getOwners()).to.deep.equal([
        owner.address,
        owner2.address,
        owner3.address
      ]);
    });

    it("Should set the correct required confirmations", async function () {
      expect(await multiSigWallet.numConfirmationsRequired()).to.equal(requiredConfirmations);
    });

    it("Should reject deployment with no owners", async function () {
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

      await expect(
        MultiSigWallet.deploy([], 1)
      ).to.be.revertedWith("owners required");
    });

    it("Should reject deployment with invalid required confirmations", async function () {
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

      await expect(
        MultiSigWallet.deploy([owner.address], 2) // More confirmations than owners
      ).to.be.revertedWith("invalid number of required confirmations");
    });

    it("Should reject duplicate owners", async function () {
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

      await expect(
        MultiSigWallet.deploy([owner.address, owner.address], 1)
      ).to.be.revertedWith("owner not unique");
    });
  });

  describe("Transaction Submission", function () {
    it("Should allow owners to submit transactions", async function () {
      const value = ethers.utils.parseEther("1");
      const data = "0x";

      await expect(
        multiSigWallet.connect(owner).submitTransaction(recipient.address, value, data)
      ).to.emit(multiSigWallet, "SubmitTransaction")
        .withArgs(owner.address, 0, recipient.address, value, data);

      const txCount = await multiSigWallet.getTransactionCount();
      expect(txCount).to.equal(1);
    });

    it("Should reject transaction submission from non-owners", async function () {
      const value = ethers.utils.parseEther("1");
      const data = "0x";

      await expect(
        multiSigWallet.connect(nonOwner).submitTransaction(recipient.address, value, data)
      ).to.be.revertedWith("not owner");
    });

    it("Should auto-confirm transaction for submitter", async function () {
      const value = ethers.utils.parseEther("1");
      const data = "0x";

      await multiSigWallet.connect(owner).submitTransaction(recipient.address, value, data);

      const isConfirmed = await multiSigWallet.isConfirmed(0, owner.address);
      expect(isConfirmed).to.be.true;
    });
  });

  describe("Transaction Confirmation", function () {
    beforeEach(async function () {
      // Submit a transaction
      await multiSigWallet.connect(owner).submitTransaction(
        recipient.address,
        ethers.utils.parseEther("1"),
        "0x"
      );
    });

    it("Should allow owners to confirm transactions", async function () {
      await expect(
        multiSigWallet.connect(owner2).confirmTransaction(0)
      ).to.emit(multiSigWallet, "ConfirmTransaction")
        .withArgs(owner2.address, 0);

      const isConfirmed = await multiSigWallet.isConfirmed(0, owner2.address);
      expect(isConfirmed).to.be.true;
    });

    it("Should reject confirmation from non-owners", async function () {
      await expect(
        multiSigWallet.connect(nonOwner).confirmTransaction(0)
      ).to.be.revertedWith("not owner");
    });

    it("Should reject double confirmation from same owner", async function () {
      await multiSigWallet.connect(owner2).confirmTransaction(0);

      await expect(
        multiSigWallet.connect(owner2).confirmTransaction(0)
      ).to.be.revertedWith("tx already confirmed");
    });

    it("Should reject confirmation of non-existent transaction", async function () {
      await expect(
        multiSigWallet.connect(owner2).confirmTransaction(999)
      ).to.be.revertedWith("tx does not exist");
    });

    it("Should reject confirmation of executed transaction", async function () {
      // Get enough confirmations and execute
      await multiSigWallet.connect(owner2).confirmTransaction(0);
      await multiSigWallet.connect(owner).executeTransaction(0);

      await expect(
        multiSigWallet.connect(owner3).confirmTransaction(0)
      ).to.be.revertedWith("tx already executed");
    });
  });

  describe("Transaction Execution", function () {
    beforeEach(async function () {
      // Submit and get one confirmation (from submitter)
      await multiSigWallet.connect(owner).submitTransaction(
        recipient.address,
        ethers.utils.parseEther("1"),
        "0x"
      );
    });

    it("Should execute transaction with enough confirmations", async function () {
      // Get second confirmation
      await multiSigWallet.connect(owner2).confirmTransaction(0);

      const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);

      await expect(
        multiSigWallet.connect(owner).executeTransaction(0)
      ).to.emit(multiSigWallet, "ExecuteTransaction")
        .withArgs(owner.address, 0);

      const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
      expect(recipientBalanceAfter.sub(recipientBalanceBefore)).to.equal(
        ethers.utils.parseEther("1")
      );

      const transaction = await multiSigWallet.getTransaction(0);
      expect(transaction.executed).to.be.true;
    });

    it("Should reject execution without enough confirmations", async function () {
      await expect(
        multiSigWallet.connect(owner).executeTransaction(0)
      ).to.be.revertedWith("cannot execute tx");
    });

    it("Should reject execution from non-owners", async function () {
      await multiSigWallet.connect(owner2).confirmTransaction(0);

      await expect(
        multiSigWallet.connect(nonOwner).executeTransaction(0)
      ).to.be.revertedWith("not owner");
    });

    it("Should reject execution of already executed transaction", async function () {
      await multiSigWallet.connect(owner2).confirmTransaction(0);
      await multiSigWallet.connect(owner).executeTransaction(0);

      await expect(
        multiSigWallet.connect(owner).executeTransaction(0)
      ).to.be.revertedWith("tx already executed");
    });

    it("Should handle failed transaction execution", async function () {
      // Create a transaction that will fail (send more ETH than available)
      await multiSigWallet.connect(owner).submitTransaction(
        recipient.address,
        ethers.utils.parseEther("100"), // More than wallet balance
        "0x"
      );

      await multiSigWallet.connect(owner2).confirmTransaction(1);

      await expect(
        multiSigWallet.connect(owner).executeTransaction(1)
      ).to.be.revertedWith("tx failed");
    });
  });

  describe("Confirmation Revocation", function () {
    beforeEach(async function () {
      await multiSigWallet.connect(owner).submitTransaction(
        recipient.address,
        ethers.utils.parseEther("1"),
        "0x"
      );
      await multiSigWallet.connect(owner2).confirmTransaction(0);
    });

    it("Should allow owners to revoke confirmations", async function () {
      await expect(
        multiSigWallet.connect(owner2).revokeConfirmation(0)
      ).to.emit(multiSigWallet, "RevokeConfirmation")
        .withArgs(owner2.address, 0);

      const isConfirmed = await multiSigWallet.isConfirmed(0, owner2.address);
      expect(isConfirmed).to.be.false;
    });

    it("Should reject revocation from non-owners", async function () {
      await expect(
        multiSigWallet.connect(nonOwner).revokeConfirmation(0)
      ).to.be.revertedWith("not owner");
    });

    it("Should reject revocation of non-confirmed transaction", async function () {
      await expect(
        multiSigWallet.connect(owner3).revokeConfirmation(0)
      ).to.be.revertedWith("tx not confirmed");
    });

    it("Should reject revocation of executed transaction", async function () {
      await multiSigWallet.connect(owner).executeTransaction(0);

      await expect(
        multiSigWallet.connect(owner2).revokeConfirmation(0)
      ).to.be.revertedWith("tx already executed");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await multiSigWallet.connect(owner).submitTransaction(
        recipient.address,
        ethers.utils.parseEther("1"),
        "0x"
      );
      await multiSigWallet.connect(owner2).confirmTransaction(0);
    });

    it("Should return correct transaction count", async function () {
      expect(await multiSigWallet.getTransactionCount()).to.equal(1);
    });

    it("Should return correct transaction details", async function () {
      const transaction = await multiSigWallet.getTransaction(0);
      expect(transaction.to).to.equal(recipient.address);
      expect(transaction.value).to.equal(ethers.utils.parseEther("1"));
      expect(transaction.data).to.equal("0x");
      expect(transaction.executed).to.be.false;
      expect(transaction.numConfirmations).to.equal(2);
    });

    it("Should return correct owners list", async function () {
      const owners = await multiSigWallet.getOwners();
      expect(owners).to.deep.equal([owner.address, owner2.address, owner3.address]);
    });

    it("Should check confirmation status correctly", async function () {
      expect(await multiSigWallet.isConfirmed(0, owner.address)).to.be.true;
      expect(await multiSigWallet.isConfirmed(0, owner2.address)).to.be.true;
      expect(await multiSigWallet.isConfirmed(0, owner3.address)).to.be.false;
    });
  });

  describe("ETH Deposits", function () {
    it("Should accept ETH deposits", async function () {
      const depositAmount = ethers.utils.parseEther("5");

      await expect(
        owner.sendTransaction({
          to: multiSigWallet.address,
          value: depositAmount
        })
      ).to.emit(multiSigWallet, "Deposit")
        .withArgs(owner.address, depositAmount);

      const balance = await ethers.provider.getBalance(multiSigWallet.address);
      expect(balance).to.equal(ethers.utils.parseEther("15")); // 10 + 5
    });
  });
});
