const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ECO Platform - 3% Fee Integration Tests", function () {
    let donation, eco, multiSig;
    let owner, user1, user2, foundationAddr, treasury;

    const PLATFORM_FEE_PERCENTAGE = 300; // 3%
    const FEE_DENOMINATOR = 10000;

    beforeEach(async function () {
        [owner, user1, user2, foundationAddr, treasury] = await ethers.getSigners();

        // Deploy MultiSigWallet
        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        multiSig = await MultiSigWallet.deploy([owner.address], 1);
        await multiSig.deployed();

        // Deploy original EcoCoin (which works with our hardened donation contract)
        const EcoCoin = await ethers.getContractFactory("contracts/EcoCoin.sol:EcoCoin");
        const maxSupply = ethers.utils.parseUnits("1000000000", 18); // 1 billion tokens
        eco = await EcoCoin.deploy(maxSupply);
        await eco.deployed();

        // Deploy Donation-Hardened contract with treasury address
        const Donation = await ethers.getContractFactory("contracts/Donation-Hardened.sol:DonationContract");
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
        await eco.addMinter(donation.address);
    });

    describe("Core Platform Fee Functionality", function () {
        it("Should implement 3% platform fee correctly", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");
            const expectedFee = ethers.utils.parseEther("0.03"); // 3% of 1 ETH
            const expectedNetDonation = ethers.utils.parseEther("0.97"); // 97% of 1 ETH

            // Record initial balances
            const initialFoundationBalance = await foundationAddr.getBalance();

            // Make donation
            const tx = await donation.connect(user1).donate(0, "Test donation", {
                value: donationAmount
            });

            // Verify foundation received net donation (97%)
            const finalFoundationBalance = await foundationAddr.getBalance();
            expect(finalFoundationBalance.sub(initialFoundationBalance)).to.equal(expectedNetDonation);

            // Verify contract holds platform fee (3%)
            const contractBalance = await ethers.provider.getBalance(donation.address);
            expect(contractBalance).to.equal(expectedFee);

            // Verify total fees tracked correctly
            expect(await donation.totalFeesCollected()).to.equal(expectedFee);

            // Verify ECO tokens minted based on net donation
            const expectedEcoTokens = expectedNetDonation.mul(10);
            expect(await eco.balanceOf(user1.address)).to.equal(expectedEcoTokens);
        });

        it("Should allow treasury fee withdrawal by MultiSig", async function () {
            // Make donations to collect fees
            await donation.connect(user1).donate(0, "Donation 1", {
                value: ethers.utils.parseEther("1.0")
            });
            await donation.connect(user2).donate(0, "Donation 2", {
                value: ethers.utils.parseEther("2.0")
            });

            const totalFees = await donation.totalFeesCollected();
            const initialOwnerBalance = await owner.getBalance();

            // Withdraw fees to owner address
            const tx = await donation.withdrawTreasuryFees(owner.address, totalFees);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

            // Verify owner received the fees
            const finalOwnerBalance = await owner.getBalance();
            expect(finalOwnerBalance.add(gasUsed).sub(initialOwnerBalance)).to.equal(totalFees);

            // Verify fees were reset
            expect(await donation.getTreasuryBalance()).to.equal(0);
        });

        it("Should prevent unauthorized treasury withdrawals", async function () {
            // Make donation to collect fees
            await donation.connect(user1).donate(0, "Test donation", {
                value: ethers.utils.parseEther("1.0")
            });

            const totalFees = await donation.totalFeesCollected();

            // Try to withdraw as non-MultiSig user
            await expect(
                donation.connect(user1).withdrawTreasuryFees(user1.address, totalFees)
            ).to.be.revertedWith("Unauthorized: MultiSig or Owner only");
        });

        it("Should calculate fees precisely for various amounts", async function () {
            const testAmounts = [
                ethers.utils.parseEther("0.1"),   // 0.1 ETH
                ethers.utils.parseEther("1.5"),   // 1.5 ETH
                ethers.utils.parseEther("10.0"),  // 10 ETH
                ethers.utils.parseEther("50.0")   // 50 ETH
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

        it("Should work with donateOnBehalf function", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");
            const expectedFee = ethers.utils.parseEther("0.03");
            const expectedNetDonation = ethers.utils.parseEther("0.97");

            await donation.connect(user1).donateOnBehalf(
                0,
                "Donation on behalf",
                user2.address,
                { value: donationAmount }
            );

            // Check fee collection in contract
            expect(await donation.totalFeesCollected()).to.equal(expectedFee);

            // Check contract holds fee
            const contractBalance = await ethers.provider.getBalance(donation.address);
            expect(contractBalance).to.equal(expectedFee);

            // Check beneficiary owns NFT
            expect(await donation.ownerOf(1)).to.equal(user2.address);

            // Check beneficiary received ECO tokens
            const expectedEcoTokens = expectedNetDonation.mul(10);
            expect(await eco.balanceOf(user2.address)).to.equal(expectedEcoTokens);
        });
    });

    describe("Platform Economics Validation", function () {
        it("Should maintain proper revenue split (97% foundation, 3% platform)", async function () {
            const donations = [
                ethers.utils.parseEther("1.0"),
                ethers.utils.parseEther("2.5"),
                ethers.utils.parseEther("0.5")
            ];

            const users = [user1, user2, owner]; // Use different users to avoid rate limiting

            let totalDonated = ethers.BigNumber.from(0);
            let totalFeesExpected = ethers.BigNumber.from(0);
            let totalNetExpected = ethers.BigNumber.from(0);

            const initialFoundationBalance = await foundationAddr.getBalance();

            for (let i = 0; i < donations.length; i++) {
                await donation.connect(users[i]).donate(0, `Test donation ${i}`, {
                    value: donations[i]
                });

                totalDonated = totalDonated.add(donations[i]);
                totalFeesExpected = totalFeesExpected.add(donations[i].mul(300).div(10000));
                totalNetExpected = totalNetExpected.add(donations[i].mul(9700).div(10000));
            }

            // Verify foundation received net amount (97% total)
            const finalFoundationBalance = await foundationAddr.getBalance();
            expect(finalFoundationBalance.sub(initialFoundationBalance)).to.equal(totalNetExpected);

            // Verify contract holds platform fees (3% total)
            const contractBalance = await ethers.provider.getBalance(donation.address);
            expect(contractBalance).to.equal(totalFeesExpected);

            // Verify totals add up (foundation + contract = total donated)
            const totalReceived = finalFoundationBalance.sub(initialFoundationBalance).add(contractBalance);
            expect(totalReceived).to.equal(totalDonated);
        });

        it("Should emit proper events for fee tracking", async function () {
            const donationAmount = ethers.utils.parseEther("1.0");
            const expectedFee = ethers.utils.parseEther("0.03");
            const expectedNetDonation = ethers.utils.parseEther("0.97");

            const tx = await donation.connect(user1).donate(0, "Test donation", {
                value: donationAmount
            });
            const receipt = await tx.wait();

            // Check PlatformFeeCollected event
            const feeEvent = receipt.events.find(e => e.event === "PlatformFeeCollected");
            expect(feeEvent).to.not.be.undefined;
            expect(feeEvent.args.donor).to.equal(user1.address);
            expect(feeEvent.args.feeAmount).to.equal(expectedFee);
            expect(feeEvent.args.donationAmount).to.equal(expectedNetDonation);
        });
    });
});
