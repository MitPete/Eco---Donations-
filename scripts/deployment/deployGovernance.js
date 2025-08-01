const hre = require("hardhat");

async function main() {
  // Get addresses from previous deployments
  const ecoCoinAddress = require('../frontend/contracts.json').ecoCoin;

  // Deploy EcoGovernance
  const EcoGovernance = await hre.ethers.getContractFactory("EcoGovernance");
  const governance = await EcoGovernance.deploy(ecoCoinAddress);
  await governance.deployed();

  console.log("EcoGovernance deployed to:", governance.address);

  // Optionally, update contracts.json
  const fs = require('fs');
  const contracts = require('../frontend/contracts.json');
  contracts.governance = governance.address;
  fs.writeFileSync(
    './frontend/contracts.json',
    JSON.stringify(contracts, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
