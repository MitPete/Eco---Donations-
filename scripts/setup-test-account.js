const hre = require("hardhat");

async function main() {
    // Get the contracts
    const donation = await hre.ethers.getContractAt(
        "DonationContract",
        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    );

    // Get signers
    const [user] = await hre.ethers.getSigners();

    // Make a donation with ETH
    console.log(`Making donation from ${user.address}`);
    const donationAmount = hre.ethers.utils.parseEther("1.0"); // 1 ETH
    const msg = "Test donation";

    // Create transaction with both value and message
    const tx = await donation.donate(0, msg, {
        value: donationAmount,
        gasLimit: 500000 // Set manual gas limit
    });
    await tx.wait();

    console.log(`✅ Donated ${hre.ethers.utils.formatEther(donationAmount)} ETH`);

    // Get ECO token contract
    const eco = await hre.ethers.getContractAt(
        "EcoCoin",
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    );

    // Get ECO balance
    const balance = await eco.balanceOf(user.address);
    console.log(`💰 Current ECO balance: ${hre.ethers.utils.formatEther(balance)} ECO`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
