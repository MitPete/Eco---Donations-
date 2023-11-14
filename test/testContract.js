// testEcoCoin.js
const { expect } = require("chai");



describe("EcoCoin Deployment", function () {
  it("Should deploy EcoCoin contract with the correct initial state", async function () {
    const [owner] = await ethers.getSigners();
    const maxSupply = ethers.utils.parseEther("1000000"); // 1,000,000 ECO (adjust as needed)

    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const ecoCoinInstance = await EcoCoin.deploy(maxSupply);
    await ecoCoinInstance.deployed();

    // Check if the contract is deployed and has the correct initial state
    expect(ecoCoinInstance.address).to.not.equal(null);
    expect(await ecoCoinInstance.maxSupply()).to.equal(maxSupply);
    expect(await ecoCoinInstance.owner()).to.equal(owner.address);
  });
  it("Should set the max supply correctly", async function () {
    const [owner] = await ethers.getSigners();
    const newMaxSupply = ethers.utils.parseEther("2000000"); // Set a new max supply

    const EcoCoin = await ethers.getContractFactory("EcoCoin");
    const ecoCoinInstance = await EcoCoin.deploy(newMaxSupply);
    await ecoCoinInstance.deployed();

    // Check if the max supply is set correctly
    expect(await ecoCoinInstance.maxSupply()).to.equal(newMaxSupply);
  });
  describe("EcoCoin mintTokens function", function () {
    it("Should allow the owner to mint tokens", async function () {
      const [owner] = await ethers.getSigners();
      const maxSupply = ethers.utils.parseEther("1000000"); // 1,000,000 ECO (adjust as needed)
  
      const EcoCoin = await ethers.getContractFactory("EcoCoin");
      const ecoCoinInstance = await EcoCoin.deploy(maxSupply);
      await ecoCoinInstance.deployed();
  
      // Mint tokens
      const mintAmount = ethers.utils.parseEther("100");
      await ecoCoinInstance.mintTokens(owner.address, mintAmount);
  
      // Check if the tokens were minted correctly
      expect(await ecoCoinInstance.balanceOf(owner.address)).to.equal(mintAmount);
    });

    describe("EcoCoin totalSupply and totalMintedSupply", function () {
      it("Should update totalSupply and totalMintedSupply after minting tokens", async function () {
        const [owner] = await ethers.getSigners();
        const maxSupply = ethers.utils.parseEther("1000000"); // 1,000,000 ECO (adjust as needed)
    
        const EcoCoin = await ethers.getContractFactory("EcoCoin");
        const ecoCoinInstance = await EcoCoin.deploy(maxSupply);
        await ecoCoinInstance.deployed();
    
        // Mint some tokens
        const mintAmount = ethers.utils.parseEther("100");
        await ecoCoinInstance.mintTokens(owner.address, mintAmount);
    
        // Check if totalSupply and totalMintedSupply are correctly updated
        expect(await ecoCoinInstance.totalSupply()).to.equal(mintAmount);
        expect(await ecoCoinInstance.getTotalMintedSupply()).to.equal(mintAmount);
      });
    });
  
    it("Should not allow non-owners to mint tokens", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const maxSupply = ethers.utils.parseEther("1000000"); // 1,000,000 ECO (adjust as needed)
  
      const EcoCoin = await ethers.getContractFactory("EcoCoin");
      const ecoCoinInstance = await EcoCoin.deploy(maxSupply);
      await ecoCoinInstance.deployed();
  
      // Try to mint tokens from a non-owner account
      const mintAmount = ethers.utils.parseEther("100");
      await expect(ecoCoinInstance.connect(addr1).mintTokens(addr1.address, mintAmount)).to.be.revertedWith("Only the owner can mint tokens");
    });
    describe("EcoCoin maxSupply limit", function () {
      it("Should not allow minting tokens that would exceed maxSupply", async function () {
        const [owner] = await ethers.getSigners();
        const maxSupply = ethers.utils.parseEther("1000000"); // 1,000,000 ECO (adjust as needed)
    
        const EcoCoin = await ethers.getContractFactory("EcoCoin");
        const ecoCoinInstance = await EcoCoin.deploy(maxSupply);
        await ecoCoinInstance.deployed();
    
        // Try to mint tokens that would exceed maxSupply
        const mintAmount = ethers.utils.parseEther("1000001"); // 1,000,001 ECO
        await expect(ecoCoinInstance.mintTokens(owner.address, mintAmount)).to.be.revertedWith("Total supply cannot exceed maximum supply");
      });
    });
  });
});


  

  describe("DonationContract", function () {
    let owner, donor, addr1, addr2, addr3, addr4, ecoCoinInstance, donationContractInstance;
    const maxSupply = ethers.utils.parseEther("1000000"); // 1,000,000 ECO (adjust as needed)
  
    beforeEach(async function () {
      [owner, donor, addr1, addr2, addr3, addr4] = await ethers.getSigners();
  
      const EcoCoin = await ethers.getContractFactory("EcoCoin");
      ecoCoinInstance = await EcoCoin.deploy(maxSupply);
      await ecoCoinInstance.deployed();
  
      const DonationContract = await ethers.getContractFactory("DonationContract");
      donationContractInstance = await DonationContract.deploy(ecoCoinInstance.address, addr1.address, addr2.address, addr3.address, addr4.address);
      await donationContractInstance.deployed();
    });
  
    describe("Deployment", function () {
      it("Should deploy with the correct owner", async function () {
        expect(await donationContractInstance.owner()).to.equal(owner.address);
      });
  
      it("Should deploy with the correct EcoCoin instance", async function () {
        expect(await donationContractInstance.ecoCoinInstance()).to.equal(ecoCoinInstance.address);
      });
    });
  //To DO: Update this test case to check if the correct addresses are set
    describe("donate function", function () {
      it("Should correctly mint tokens", async function () {
        const donateAmount = ethers.utils.parseEther("1");
        await donationContractInstance.connect(donor).donate(0, "Donation made", { value: donateAmount });
        expect(await ecoCoinInstance.balanceOf(donor.address)).to.equal(donateAmount.mul(10));
      });
  
      //To Do:Update this test case to make sure it aligns with the contract 
      it("Should correctly transfer donation", async function () {
        const donateAmount = ethers.utils.parseEther("1");
        await donationContractInstance.connect(donor).donate(0, "Donation made", { value: donateAmount });
        expect(await ethers.provider.getBalance(donationContractInstance.address)).to.equal(0);
        expect(await ethers.provider.getBalance(owner.address)).to.equal(donateAmount);
      });
    });
  });