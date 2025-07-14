// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./EcoCoin.sol";

contract DonationContract {
    address public owner;
    EcoCoin public ecoCoinInstance;

    struct Donation {
        address sender;
        uint256 amount;
        string message;
    }

    enum Foundation {
        SaveTheOceans,
        ProtectTheRainforest,
        ProtectTheSequoias,
        CleanEnergy
    }

    mapping(Foundation => uint256) public foundationDonations;
    mapping(Foundation => Donation[]) public foundationDonationHistory;
    mapping(Foundation => address) public foundationAddresses;

    event DonationMade(
        Foundation foundation,
        address sender,
        uint256 amount,
        string message
    );

    event TokenBalanceUpdated(address indexed donor, uint256 balance);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    constructor(address _ecoCoinAddress, address saveTheOceansAddress, address protectTheRainforestAddress, address protectTheSequoiasAddress, address cleanEnergyAddress) {
        owner = msg.sender;
        ecoCoinInstance = EcoCoin(_ecoCoinAddress);

        // Set the addresses of the foundations
        foundationAddresses[Foundation.SaveTheOceans] = saveTheOceansAddress;
        foundationAddresses[Foundation.ProtectTheRainforest] = protectTheRainforestAddress;
        foundationAddresses[Foundation.ProtectTheSequoias] = protectTheSequoiasAddress;
        foundationAddresses[Foundation.CleanEnergy] = cleanEnergyAddress;
    }

    function donate(Foundation foundation, string memory message) public payable {
        require(msg.value > 0, "Donation amount must be greater than 0");

        // Mint tokens to the donor's address
        ecoCoinInstance.mintTokens(msg.sender, msg.value * 10);

        // Get the updated token balance for the donor
        uint256 donorBalance = ecoCoinInstance.balanceOf(msg.sender);

        emit TokenBalanceUpdated(msg.sender, donorBalance);

        address foundationAddress = foundationAddresses[foundation];

        require(foundationAddress != address(0), "Invalid foundation");

        // Transfer the donation amount to the foundation using call pattern
        (bool success, ) = payable(foundationAddress).call{value: msg.value}("");
        require(success, "Transfer failed");

        // Update the donation history
        foundationDonations[foundation] += msg.value;
        foundationDonationHistory[foundation].push(
            Donation({
                sender: msg.sender,
                amount: msg.value,
                message: message
            })
        );

        emit DonationMade(foundation, msg.sender, msg.value, message);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function updateEcoCoinAddress(address _ecoCoinAddress) public onlyOwner {
        ecoCoinInstance = EcoCoin(_ecoCoinAddress);
    }
}

