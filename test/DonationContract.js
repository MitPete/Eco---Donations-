const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationContract", function () {
  let ecoCoin, donation, owner;
  let foundations;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    [owner, ...foundations] = signers;
    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const maxSupply = ethers.utils.parseEther("1000000");
    ecoCoin = await EcoCoin.deploy(maxSupply);
    await ecoCoin.deployed();

    const DonationContract = await ethers.getContractFactory("DonationContract");
    donation = await DonationContract.deploy(
      ecoCoin.address,
      foundations[0].address,
      foundations[1].address,
      foundations[2].address,
      foundations[3].address
    );
    await donation.deployed();

    // transfer token ownership so the contract can mint
    await ecoCoin.transferOwnership(donation.address);
  });

  it("processes donations and mints tokens", async function () {
    const donor = foundations[4];
    const amount = ethers.utils.parseEther("1");

    await expect(
      donation.connect(donor).donate(0, "test message", { value: amount })
    ).to.emit(donation, "DonationMade");

    expect(await ecoCoin.balanceOf(donor.address)).to.equal(
      ethers.utils.parseEther("10")
    );
    expect(await donation.foundationDonations(0)).to.equal(amount);
  });

  it("allows owner to withdraw", async function () {
    // send ether to the contract
    await owner.sendTransaction({ to: donation.address, value: ethers.utils.parseEther("1") });
    const before = await ethers.provider.getBalance(owner.address);
    const tx = await donation.withdraw();
    await tx.wait();
    const after = await ethers.provider.getBalance(owner.address);
    expect(after).to.be.gt(before);
  });

  it("transfers ownership", async function () {
    const newOwner = foundations[4];
    await donation.transferOwnership(newOwner.address);
    expect(await donation.owner()).to.equal(newOwner.address);
  });
});
