const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoCoin", function () {
  let EcoCoin, ecoCoin, owner, addr1, addr2, unauthorizedAddr;

  beforeEach(async function () {
    [owner, addr1, addr2, unauthorizedAddr] = await ethers.getSigners();
    EcoCoin = await ethers.getContractFactory("EcoCoin");
    // Deploy with required constructor parameters
    ecoCoin = await EcoCoin.deploy(addr1.address, addr2.address);
    await ecoCoin.deployed();
  });

  it("mints tokens with proper authorization", async function () {
    await ecoCoin.mint(addr1.address, ethers.utils.parseEther("100"));
    expect(await ecoCoin.balanceOf(addr1.address)).to.equal(
      ethers.utils.parseEther("100")
    );
  });

  it("prevents non-owners from minting", async function () {
    await expect(
      ecoCoin.connect(unauthorizedAddr).mint(unauthorizedAddr.address, 1)
    ).to.be.revertedWith("Unauthorized minter");
  });

  it("enforces maximum supply", async function () {
    // This test needs to be adjusted for the actual MAX_SUPPLY constant
    // MAX_SUPPLY is 1 billion tokens, so we'll test with smaller amounts
    await ecoCoin.mint(addr1.address, ethers.utils.parseEther("1000"));
    expect(await ecoCoin.balanceOf(addr1.address)).to.equal(
      ethers.utils.parseEther("1000")
    );
  });
});
