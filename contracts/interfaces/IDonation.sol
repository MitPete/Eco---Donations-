// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

/**
 * @title IDonation
 * @dev Interface for the Donation contract
 */
interface IDonation {
    enum Foundation {
        SaveTheOceans,
        ProtectTheRainforest,
        ProtectTheSequoias,
        CleanEnergy
    }

    // Events
    event DonationReceived(
        uint256 indexed donationId,
        address indexed donor,
        Foundation indexed foundation,
        uint256 amount,
        uint256 ecoTokensEarned
    );

    event FoundationAddressUpdated(
        Foundation indexed foundation,
        address indexed oldAddress,
        address indexed newAddress
    );

    event EmergencyWithdrawal(
        address indexed admin,
        uint256 amount,
        string reason
    );

    // Core functions
    function donate(
        Foundation foundation,
        string calldata message
    ) external payable;

    function setFoundationAddress(
        Foundation foundation,
        address newAddress
    ) external;

    function getFoundationAddress(
        Foundation foundation
    ) external view returns (address);

    function getDonationHistory(
        address donor
    ) external view returns (uint256[] memory);

    function getDonationDetails(
        uint256 donationId
    )
        external
        view
        returns (
            address donor,
            Foundation foundation,
            uint256 amount,
            uint256 timestamp,
            string memory message
        );

    function getTotalDonations() external view returns (uint256);

    function getTotalDonationsByFoundation(
        Foundation foundation
    ) external view returns (uint256);

    function emergencyWithdraw(uint256 amount, string calldata reason) external;

    function pause() external;

    function unpause() external;
}
