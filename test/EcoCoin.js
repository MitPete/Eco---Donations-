const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EcoCoin", function () {
  let EcoCoin, ecoCoin, owner, addr1;
  const maxSupply = ethers.utils.parseEther("1000");

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    EcoCoin = await ethers.getContractFactory("EcoCoin");
    ecoCoin = await EcoCoin.deploy(maxSupply);
    await ecoCoin.deployed();
  });

  it("mints tokens up to max supply", async function () {
    await ecoCoin.mintTokens(addr1.address, ethers.utils.parseEther("100"));
    expect(await ecoCoin.balanceOf(addr1.address)).to.equal(
      ethers.utils.parseEther("100")
    );
  });

  it("prevents non-owners from minting", async function () {
    await expect(
      ecoCoin.connect(addr1).mintTokens(addr1.address, 1)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("enforces maximum supply", async function () {
    await ecoCoin.mintTokens(addr1.address, ethers.utils.parseEther("1000"));
    await expect(
      ecoCoin.mintTokens(addr1.address, 1)
    ).to.be.revertedWith("Total supply cannot exceed maximum supply");
  });
});
