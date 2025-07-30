const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ECO Donations - Platform Fee Testing", function () {
    let donation, eco, multiSig, treasury;
    let owner, user1, user2, foundationAddr;

    const PLATFORM_FEE_PERCENTAGE = 300; // 3%
    const FEE_DENOMINATOR = 10000;

    beforeEach(async function () {
        [owner, user1, user2, foundationAddr, treasury] = await ethers.getSigners();

        // Deploy MultiSigWallet
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        multiSig = await MultiSigWallet.deploy([owner.address], 1);
        await multiSig.deployed();

        // Deploy EcoCoin
        const EcoCoin = await ethers.getContractFactory("EcoCoin");
        eco = await EcoCoin.deploy(multiSig.address);
        await eco.deployed();

        // Deploy Donation contract with treasury address
        const Donation = await ethers.getContractFactory("DonationContract");
        const uris = [
            "ipfs://ocean-uri",
            "ipfs://rainforest-uri",
            "ipfs://sequoia-uri",
            "ipfs://energy-uri"
        ];

        donation = await Donation.deploy(
            eco.address,
            multiSig.address,
            treasury.address,  // Treasury address for fee collection
            uris
        );
        await donation.deployed();

        // Set up foundation address
        await donation.setFoundationAddress(0, foundationAddr.address); // SaveTheOceans

        // Authorize donation contract to mint ECO tokens
        await eco.authorizeMinter(donation.address, true);
    });

    describe("Platform Fee Implementation", function () {
        it("Should calculate 3% platform fee correctly", async function () {
            const donationAmount = ethers.utils.parseEther("1.0"); // 1 ETH
            const expectedFee = donationAmount.mul(PLATFORM_FEE_PERCENTAGE).div(FEE_DENOMINATOR);
            const expectedNetDonation = donationAmount.sub(expectedFee);

            const [fee, netDonation] = await donation.calculatePlatformFee(donationAmount);

            expect(fee).to.equal(expectedFee);
            expect(netDonation).to.equal(expectedNetDonation);
            expect(fee).to.equal(ethers.utils.parseEther("0.03")); // 3% of 1 ETH = 0.03 ETH
        });

        it("Should collect 3% platform fee on donation", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");
            const expectedFee = ethers.utils.parseEther("0.03");
            const expectedNetDonation = ethers.utils.parseEther("0.97");

            // Record initial balances
            const initialTreasuryBalance = await treasury.getBalance();
            const initialFoundationBalance = await foundationAddr.getBalance();
            const initialContractBalance = await ethers.provider.getBalance(donation.address);

            // Make donation
            const tx = await donation.connect(user1).donate(0, "Test donation", {
                value: donationAmount
            });
            const receipt = await tx.wait();

            // Check platform fee was collected
            expect(await donation.totalFeesCollected()).to.equal(expectedFee);

            // Check foundation received net donation (97%)
            const finalFoundationBalance = await foundationAddr.getBalance();
            expect(finalFoundationBalance.sub(initialFoundationBalance)).to.equal(expectedNetDonation);

            // Check treasury received platform fee (3%)
            const finalTreasuryBalance = await treasury.getBalance();
            expect(finalTreasuryBalance.sub(initialTreasuryBalance)).to.equal(expectedFee);

            // Check events were emitted
            const feeEvent = receipt.events.find(e => e.event === "PlatformFeeCollected");
            expect(feeEvent.args.donor).to.equal(user1.address);
            expect(feeEvent.args.feeAmount).to.equal(expectedFee);
            expect(feeEvent.args.donationAmount).to.equal(expectedNetDonation);
        });

        it("Should track total donations as net amount (after fees)", async function () {
            const donationAmount = ethers.utils.parseEther("2.0");
            const expectedNetDonation = ethers.utils.parseEther("1.94"); // 97% of 2 ETH

            await donation.connect(user1).donate(0, "First donation", {
                value: donationAmount
            });

            expect(await donation.totalDonations()).to.equal(expectedNetDonation);

            // Make second donation
            await donation.connect(user2).donate(0, "Second donation", {
                value: donationAmount
            });

            expect(await donation.totalDonations()).to.equal(expectedNetDonation.mul(2));
        });

        it("Should mint ECO tokens based on net donation amount", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");
            const expectedNetDonation = ethers.utils.parseEther("0.97");
            const expectedEcoTokens = expectedNetDonation.mul(10); // 10x multiplier

            await donation.connect(user1).donate(0, "Test donation", {
                value: donationAmount
            });

            const ecoBalance = await eco.balanceOf(user1.address);
            expect(ecoBalance).to.equal(expectedEcoTokens);
        });

        it("Should store net donation amount in NFT", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");
            const expectedNetDonation = ethers.utils.parseEther("0.97");

            await donation.connect(user1).donate(0, "Test donation", {
                value: donationAmount
            });

            const [foundation, amount] = await donation.getDonationDetails(1);
            expect(foundation).to.equal(0); // SaveTheOceans
            expect(amount).to.equal(expectedNetDonation);
        });
    });

    describe("Treasury Management", function () {
        beforeEach(async function () {
            // Make some donations to collect fees
            await donation.connect(user1).donate(0, "Donation 1", {
                value: ethers.utils.parseEther("1.0")
            });
            await donation.connect(user2).donate(0, "Donation 2", {
                value: ethers.utils.parseEther("2.0")
            });
        });

        it("Should allow MultiSig to withdraw treasury fees", async function () {
            const totalFees = await donation.totalFeesCollected();
            const initialOwnerBalance = await owner.getBalance();

            const tx = await donation.withdrawTreasuryFees(owner.address, totalFees);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

            const finalOwnerBalance = await owner.getBalance();
            expect(finalOwnerBalance.add(gasUsed).sub(initialOwnerBalance)).to.equal(totalFees);

            // Check event was emitted
            const withdrawalEvent = receipt.events.find(e => e.event === "TreasuryWithdrawal");
            expect(withdrawalEvent.args.recipient).to.equal(owner.address);
            expect(withdrawalEvent.args.amount).to.equal(totalFees);
        });

        it("Should prevent non-MultiSig from withdrawing fees", async function () {
            const totalFees = await donation.totalFeesCollected();

            await expect(
                donation.connect(user1).withdrawTreasuryFees(user1.address, totalFees)
            ).to.be.revertedWith("Unauthorized: MultiSig or Owner only");
        });

        it("Should prevent withdrawal of more than available balance", async function () {
            const contractBalance = await ethers.provider.getBalance(donation.address);
            const excessiveAmount = contractBalance.add(ethers.utils.parseEther("1.0"));

            await expect(
                donation.withdrawTreasuryFees(owner.address, excessiveAmount)
            ).to.be.revertedWith("Insufficient contract balance");
        });

        it("Should return correct treasury balance", async function () {
            const expectedFees = ethers.utils.parseEther("0.09"); // 3% of 3 ETH total donations
            const treasuryBalance = await donation.getTreasuryBalance();

            expect(treasuryBalance).to.equal(expectedFees);
        });
    });

    describe("Edge Cases and Security", function () {
        it("Should handle very small donations correctly", async function () {
            const smallDonation = ethers.utils.parseEther("0.001"); // Minimum donation
            const expectedFee = smallDonation.mul(PLATFORM_FEE_PERCENTAGE).div(FEE_DENOMINATOR);
            const expectedNetDonation = smallDonation.sub(expectedFee);

            await donation.connect(user1).donate(0, "Small donation", {
                value: smallDonation
            });

            expect(await donation.totalFeesCollected()).to.equal(expectedFee);

            const [foundation, amount] = await donation.getDonationDetails(1);
            expect(amount).to.equal(expectedNetDonation);
        });

        it("Should handle maximum donations correctly", async function () {
            const maxDonation = ethers.utils.parseEther("100"); // Maximum donation
            const expectedFee = maxDonation.mul(PLATFORM_FEE_PERCENTAGE).div(FEE_DENOMINATOR);
            const expectedNetDonation = maxDonation.sub(expectedFee);

            await donation.connect(user1).donate(0, "Max donation", {
                value: maxDonation
            });

            expect(await donation.totalFeesCollected()).to.equal(expectedFee);
            expect(expectedFee).to.equal(ethers.utils.parseEther("3.0")); // 3% of 100 ETH

            const [foundation, amount] = await donation.getDonationDetails(1);
            expect(amount).to.equal(expectedNetDonation);
        });

        it("Should maintain fee precision for various amounts", async function () {
            const testAmounts = [
                ethers.utils.parseEther("0.1"),
                ethers.utils.parseEther("1.5"),
                ethers.utils.parseEther("10.0"),
                ethers.utils.parseEther("50.0")
            ];

            for (let i = 0; i < testAmounts.length; i++) {
                const amount = testAmounts[i];
                const [fee, netDonation] = await donation.calculatePlatformFee(amount);

                // Verify fee + netDonation equals original amount
                expect(fee.add(netDonation)).to.equal(amount);

                // Verify fee is exactly 3%
                const expectedFee = amount.mul(PLATFORM_FEE_PERCENTAGE).div(FEE_DENOMINATOR);
                expect(fee).to.equal(expectedFee);
            }
        });

        it("Should work correctly with donateOnBehalf function", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");
            const expectedFee = ethers.utils.parseEther("0.03");
            const expectedNetDonation = ethers.utils.parseEther("0.97");

            const initialTreasuryBalance = await treasury.getBalance();

            await donation.connect(user1).donateOnBehalf(
                0,
                "Donation on behalf",
                user2.address,
                { value: donationAmount }
            );

            // Check fee collection
            expect(await donation.totalFeesCollected()).to.equal(expectedFee);

            // Check treasury received fee
            const finalTreasuryBalance = await treasury.getBalance();
            expect(finalTreasuryBalance.sub(initialTreasuryBalance)).to.equal(expectedFee);

            // Check beneficiary received NFT and ECO tokens
            expect(await donation.ownerOf(1)).to.equal(user2.address);

            const expectedEcoTokens = expectedNetDonation.mul(10);
            expect(await eco.balanceOf(user2.address)).to.equal(expectedEcoTokens);
        });
    });

    describe("Fee Transparency and Analytics", function () {
        it("Should provide clear fee breakdown", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");

            const [fee, netDonation] = await donation.calculatePlatformFee(donationAmount);

            // Verify transparency - fee should be exactly 3%
            const feePercentage = fee.mul(10000).div(donationAmount);
            expect(feePercentage).to.equal(PLATFORM_FEE_PERCENTAGE);

            // Verify net donation is 97%
            const netPercentage = netDonation.mul(10000).div(donationAmount);
            expect(netPercentage).to.equal(FEE_DENOMINATOR - PLATFORM_FEE_PERCENTAGE);
        });

        it("Should track cumulative fees correctly", async function () {
            const donations = [
                ethers.utils.parseEther("1.0"),
                ethers.utils.parseEther("2.5"),
                ethers.utils.parseEther("0.5")
            ];

            let expectedTotalFees = ethers.BigNumber.from(0);

            for (let i = 0; i < donations.length; i++) {
                await donation.connect(user1).donate(0, `Donation ${i+1}`, {
                    value: donations[i]
                });

                const expectedFee = donations[i].mul(PLATFORM_FEE_PERCENTAGE).div(FEE_DENOMINATOR);
                expectedTotalFees = expectedTotalFees.add(expectedFee);

                expect(await donation.totalFeesCollected()).to.equal(expectedTotalFees);
            }
        });
    });
});
