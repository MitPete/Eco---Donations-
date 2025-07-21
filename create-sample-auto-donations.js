const { ethers } = require('hardhat');

async function createSampleAutoDonations() {
  console.log('🎯 Creating sample auto-donation subscriptions...');

  try {
    // Get contract addresses
    const contracts = require('./frontend/src/contracts.json');

    // Get contract instances
    const AutoDonationService = await ethers.getContractAt('AutoDonationService', contracts.autoDonationService);

    // Get signers (test accounts)
    const [owner, user1, user2, user3] = await ethers.getSigners();

    console.log(`📍 AutoDonationService at: ${contracts.autoDonationService}`);
    console.log(`👤 Creating subscriptions for test accounts...`);

    // User 1: Fixed amount subscription
    console.log('Creating subscription for User 1...');
    const user1AutoService = AutoDonationService.connect(user1);
    await user1AutoService.subscribe(
      ethers.utils.parseEther('0.001'), // Fixed amount: 0.001 ETH
      0, // No percentage
      ethers.utils.parseEther('0.1'), // Monthly limit: 0.1 ETH
      0  // Ocean Cleanup
    );
    console.log('✅ User 1 subscribed to auto-donation (Fixed: 0.001 ETH)');

    // User 2: Percentage-based subscription
    console.log('Creating subscription for User 2...');
    const user2AutoService = AutoDonationService.connect(user2);
    await user2AutoService.subscribe(
      0, // No fixed amount
      150, // 1.5% percentage
      ethers.utils.parseEther('0.2'), // Monthly limit: 0.2 ETH
      1  // Reforestation
    );
    console.log('✅ User 2 subscribed to auto-donation (Percentage: 1.5%)');

    // User 3: Another fixed amount subscription
    console.log('Creating subscription for User 3...');
    const user3AutoService = AutoDonationService.connect(user3);
    await user3AutoService.subscribe(
      ethers.utils.parseEther('0.002'), // Fixed amount: 0.002 ETH
      0, // No percentage
      ethers.utils.parseEther('0.05'), // Monthly limit: 0.05 ETH
      2  // Wildlife Conservation
    );
    console.log('✅ User 3 subscribed to auto-donation (Fixed: 0.002 ETH)');

    // Trigger some auto-donations to create activity
    console.log('\\n💰 Triggering sample auto-donations...');

    // User 1 triggers with a transaction (fixed amount: 0.001 ETH)
    await user1AutoService.triggerAutoDonation(
      ethers.utils.parseEther('0.1'), // transaction value (for calculation)
      { value: ethers.utils.parseEther('0.001') } // ETH to send for donation
    );
    console.log('✅ User 1 triggered auto-donation');

    // User 2 triggers with a transaction (percentage-based: 1.5% of 0.2 ETH = 0.003 ETH)
    const txValue = ethers.utils.parseEther('0.2');
    const donationAmount = txValue.mul(150).div(10000); // 1.5%
    await user2AutoService.triggerAutoDonation(
      txValue, // transaction value
      { value: donationAmount } // ETH to send for donation
    );
    console.log('✅ User 2 triggered auto-donation');

    // Get final stats
    console.log('\\n📊 Final Statistics:');
    try {
      const user1Settings = await user1AutoService.getUserSettings(user1.address);
      const user2Settings = await user2AutoService.getUserSettings(user2.address);
      const user3Settings = await user3AutoService.getUserSettings(user3.address);

      console.log(`User 1 - Monthly donated: ${ethers.utils.formatEther(user1Settings.currentMonthSpent || 0)} ETH`);
      console.log(`User 2 - Monthly donated: ${ethers.utils.formatEther(user2Settings.currentMonthSpent || 0)} ETH`);
      console.log(`User 3 - Monthly donated: ${ethers.utils.formatEther(user3Settings.currentMonthSpent || 0)} ETH`);
    } catch (error) {
      console.log('Could not fetch final stats:', error.message);
    }

    console.log('\\n🎉 Sample auto-donations created successfully!');
    console.log('\\n💡 Test addresses:');
    console.log(`User 1: ${user1.address}`);
    console.log(`User 2: ${user2.address}`);
    console.log(`User 3: ${user3.address}`);

  } catch (error) {
    console.error('❌ Error creating sample auto-donations:', error);
  }
}

createSampleAutoDonations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
