# Eco Coin and Donations Smart Contracts
This repository contains two Solidity smart contracts: EcoCoin.sol and DonationContract.sol. Below are the details and usage instructions for each contract.

# EcoCoin.sol
EcoCoin.sol is an ERC20 token contract representing Eco Coin (ECO). It extends the OpenZeppelin ERC20 contract and includes functionality for minting tokens, setting maximum supply, and allowing the contract owner to withdraw funds.

# Contract Details:
Name: Eco Coin
Symbol: ECO
Inheritance: ERC20
Owner: The deployer of the contract is set as the initial owner.
Max Supply: The maximum supply of ECO tokens is set during deployment.
Usage:
Mint Tokens:

Use the mintTokens(address account, uint256 amount) function to mint new tokens to a specified account.

Tokens can only be minted if the total supply (including the new minted amount) does not exceed the maximum supply.
Withdraw Funds:

The contract owner can withdraw funds using the withdraw() function.
Only the contract owner can initiate fund withdrawal.

Smart Contract Code: EcoCoin.sol

# DonationContract.sol 
DonationContract.sol is a contract managing donations made to various foundations. It utilizes the Eco Coin (ECO) token to record donations and maintains a donation history for different foundations.

# Contract Details:
Donation Foundations: SaveTheOceans, ProtectTheRainforest, ProtectTheSequoias, CleanEnergy
Functions:
Donate: Make a donation to a specific foundation with an optional message. Tokens are minted to the donor's address based on the donation amount.
Withdraw: The contract owner can withdraw collected donations.
Update Eco Coin Address: The contract owner can update the address of the Eco Coin contract.
Usage:
Make a Donation:

Use the donate(Foundation foundation, string memory message) function to make a donation to one of the predefined foundations.
Donors receive ECO tokens based on their donation amount. The donation amount is multiplied by 10 to calculate the token amount.
Withdraw Funds:

The contract owner can withdraw collected donation funds using the withdraw() function.
Update Eco Coin Address:

The contract owner can update the Eco Coin contract address using the updateEcoCoinAddress(address _ecoCoinAddress) function.
Smart Contract Code: DonationContract.sol
Feel free to deploy these contracts to your preferred Ethereum network and integrate them into your decentralized application (DApp) or blockchain project. If you have any questions or need further assistance, please refer to the provided contract code or reach out to the contract developers.