# Eco Coin and Donations Smart Contracts

This repository contains two Solidity smart contracts used to reward donations with an ERC20 token.

## Setup

Install dependencies and run the tests with the following commands:

```bash
npm install
npx hardhat test
```

## Deployment

Deploy the contracts to the network of your choice:

```bash
npx hardhat run scripts/deploy.js --network <network>
```

The deploy script creates `EcoCoin` and `DonationContract` and transfers ownership of the token to the donation contract so it can mint new tokens.

## Contracts

### EcoCoin.sol

* ERC20 token named **ECO Coin** with symbol `ECO`.
* Maximum supply is set on deployment.
* Only the owner can mint new tokens.

### DonationContract.sol

* Records donations for a set of predefined foundations.
* Donors receive 10 ECO for every ether donated.
* Ether transfers use the `call` pattern for safety.
* The owner can withdraw any ether held by the contract.
* Ownership can be transferred using `transferOwnership`.
