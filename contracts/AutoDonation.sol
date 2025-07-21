// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Donation.sol";

contract AutoDonationService {
    DonationContract public donationContract;

    struct AutoDonationSettings {
        bool isActive;
        uint256 donationAmount; // Fixed amount in wei per transaction
        uint256 donationPercentage; // Percentage * 100 (e.g., 50 = 0.5%)
        DonationContract.Foundation preferredFoundation;
        uint256 monthlyLimit; // Maximum auto-donations per month in wei
        uint256 currentMonthSpent; // Amount spent this month
        uint256 lastResetMonth; // Month when counter was last reset
        bool usePercentage; // true = use percentage, false = use fixed amount
        uint256 minTransactionValue; // Only auto-donate if transaction >= this value
    }

    mapping(address => AutoDonationSettings) public userSettings;
    mapping(address => uint256) public totalAutoDonated;
    mapping(address => uint256) public autoTransactionCount;

    // Events
    event AutoDonationSubscribed(
        address indexed user,
        uint256 amount,
        uint256 percentage,
        DonationContract.Foundation foundation
    );
    event AutoDonationTriggered(
        address indexed user,
        uint256 donationAmount,
        DonationContract.Foundation foundation,
        uint256 transactionValue
    );
    event AutoDonationSettingsUpdated(address indexed user);
    event AutoDonationUnsubscribed(address indexed user);

    constructor(address _donationContract) {
        donationContract = DonationContract(payable(_donationContract));
    }

    // Subscribe to auto-donations with fixed amount
    function subscribeFixedAmount(
        uint256 _donationAmount,
        DonationContract.Foundation _foundation,
        uint256 _monthlyLimit,
        uint256 _minTransactionValue
    ) external {
        require(_donationAmount > 0, "Donation amount must be > 0");
        require(_monthlyLimit >= _donationAmount, "Monthly limit too low");

        AutoDonationSettings storage settings = userSettings[msg.sender];
        settings.isActive = true;
        settings.donationAmount = _donationAmount;
        settings.donationPercentage = 0;
        settings.preferredFoundation = _foundation;
        settings.monthlyLimit = _monthlyLimit;
        settings.usePercentage = false;
        settings.minTransactionValue = _minTransactionValue;
        settings.lastResetMonth = getCurrentMonth();
        settings.currentMonthSpent = 0;

        emit AutoDonationSubscribed(
            msg.sender,
            _donationAmount,
            0,
            _foundation
        );
    }

    // Subscribe to auto-donations with percentage
    function subscribePercentage(
        uint256 _donationPercentage, // e.g., 50 = 0.5%
        DonationContract.Foundation _foundation,
        uint256 _monthlyLimit,
        uint256 _minTransactionValue
    ) external {
        require(
            _donationPercentage > 0 && _donationPercentage <= 1000,
            "Invalid percentage"
        ); // Max 10%

        AutoDonationSettings storage settings = userSettings[msg.sender];
        settings.isActive = true;
        settings.donationAmount = 0;
        settings.donationPercentage = _donationPercentage;
        settings.preferredFoundation = _foundation;
        settings.monthlyLimit = _monthlyLimit;
        settings.usePercentage = true;
        settings.minTransactionValue = _minTransactionValue;
        settings.lastResetMonth = getCurrentMonth();
        settings.currentMonthSpent = 0;

        emit AutoDonationSubscribed(
            msg.sender,
            0,
            _donationPercentage,
            _foundation
        );
    }

    // Main function: trigger auto-donation based on transaction value
    function triggerAutoDonation(uint256 transactionValue) external payable {
        AutoDonationSettings storage settings = userSettings[msg.sender];

        require(settings.isActive, "Auto-donation not active");
        require(
            transactionValue >= settings.minTransactionValue,
            "Transaction below minimum"
        );

        // Reset monthly counter if needed
        uint256 currentMonth = getCurrentMonth();
        if (currentMonth != settings.lastResetMonth) {
            settings.currentMonthSpent = 0;
            settings.lastResetMonth = currentMonth;
        }

        // Calculate donation amount
        uint256 donationAmount;
        if (settings.usePercentage) {
            donationAmount =
                (transactionValue * settings.donationPercentage) /
                10000;
        } else {
            donationAmount = settings.donationAmount;
        }

        // Check monthly limit
        require(
            settings.currentMonthSpent + donationAmount <=
                settings.monthlyLimit,
            "Monthly limit exceeded"
        );

        // Check user sent enough ETH
        require(
            msg.value >= donationAmount,
            "Insufficient ETH for auto-donation"
        );

        // Update tracking
        settings.currentMonthSpent += donationAmount;
        totalAutoDonated[msg.sender] += donationAmount;
        autoTransactionCount[msg.sender]++;

        // Make the donation on behalf of the user
        donationContract.donateOnBehalf{value: donationAmount}(
            settings.preferredFoundation,
            "Auto-donation",
            msg.sender
        );

        // Return excess ETH
        if (msg.value > donationAmount) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - donationAmount
            }("");
            require(success, "Failed to return excess ETH");
        }

        emit AutoDonationTriggered(
            msg.sender,
            donationAmount,
            settings.preferredFoundation,
            transactionValue
        );
    }

    // Convenient subscribe function that handles both fixed and percentage
    function subscribe(
        uint256 _donationAmount,
        uint256 _donationPercentage,
        uint256 _monthlyLimit,
        DonationContract.Foundation _foundation
    ) external {
        require(_monthlyLimit > 0, "Monthly limit must be > 0");

        if (_donationAmount > 0) {
            // Fixed amount subscription
            require(
                _donationPercentage == 0,
                "Cannot set both amount and percentage"
            );
            require(_monthlyLimit >= _donationAmount, "Monthly limit too low");

            AutoDonationSettings storage settings = userSettings[msg.sender];
            settings.isActive = true;
            settings.donationAmount = _donationAmount;
            settings.donationPercentage = 0;
            settings.preferredFoundation = _foundation;
            settings.monthlyLimit = _monthlyLimit;
            settings.usePercentage = false;
            settings.minTransactionValue = 0;
            settings.lastResetMonth = getCurrentMonth();
            settings.currentMonthSpent = 0;

            emit AutoDonationSubscribed(
                msg.sender,
                _donationAmount,
                0,
                _foundation
            );
        } else if (_donationPercentage > 0) {
            // Percentage subscription
            require(_donationPercentage <= 1000, "Invalid percentage"); // Max 10%

            AutoDonationSettings storage settings = userSettings[msg.sender];
            settings.isActive = true;
            settings.donationAmount = 0;
            settings.donationPercentage = _donationPercentage;
            settings.preferredFoundation = _foundation;
            settings.monthlyLimit = _monthlyLimit;
            settings.usePercentage = true;
            settings.minTransactionValue = 0;
            settings.lastResetMonth = getCurrentMonth();
            settings.currentMonthSpent = 0;

            emit AutoDonationSubscribed(
                msg.sender,
                0,
                _donationPercentage,
                _foundation
            );
        } else {
            revert("Must specify either amount or percentage");
        }
    }

    // Update existing subscription settings
    function updateSettings(
        uint256 _donationAmount,
        uint256 _donationPercentage,
        uint256 _monthlyLimit,
        DonationContract.Foundation _foundation
    ) external {
        require(userSettings[msg.sender].isActive, "No active subscription");
        require(_monthlyLimit > 0, "Monthly limit must be > 0");

        if (_donationAmount > 0) {
            require(
                _donationPercentage == 0,
                "Cannot set both amount and percentage"
            );
            require(_monthlyLimit >= _donationAmount, "Monthly limit too low");

            AutoDonationSettings storage settings = userSettings[msg.sender];
            settings.donationAmount = _donationAmount;
            settings.donationPercentage = 0;
            settings.preferredFoundation = _foundation;
            settings.monthlyLimit = _monthlyLimit;
            settings.usePercentage = false;

            emit AutoDonationSettingsUpdated(msg.sender);
        } else if (_donationPercentage > 0) {
            require(_donationPercentage <= 1000, "Invalid percentage");

            AutoDonationSettings storage settings = userSettings[msg.sender];
            settings.donationAmount = 0;
            settings.donationPercentage = _donationPercentage;
            settings.preferredFoundation = _foundation;
            settings.monthlyLimit = _monthlyLimit;
            settings.usePercentage = true;

            emit AutoDonationSettingsUpdated(msg.sender);
        } else {
            revert("Must specify either amount or percentage");
        }
    }

    // Pause/unpause auto-donations
    function setActive(bool _active) external {
        userSettings[msg.sender].isActive = _active;
        if (!_active) {
            emit AutoDonationUnsubscribed(msg.sender);
        }
    }

    // Unsubscribe completely
    function unsubscribe() external {
        delete userSettings[msg.sender];
        emit AutoDonationUnsubscribed(msg.sender);
    }

    // View functions
    function getUserSettings(
        address user
    ) external view returns (AutoDonationSettings memory) {
        return userSettings[user];
    }

    function getRemainingMonthlyAllowance(
        address user
    ) external view returns (uint256) {
        AutoDonationSettings storage settings = userSettings[user];
        uint256 currentMonth = getCurrentMonth();

        if (currentMonth != settings.lastResetMonth) {
            return settings.monthlyLimit;
        }

        if (settings.currentMonthSpent >= settings.monthlyLimit) {
            return 0;
        }

        return settings.monthlyLimit - settings.currentMonthSpent;
    }

    function previewDonationAmount(
        address user,
        uint256 transactionValue
    ) external view returns (uint256) {
        AutoDonationSettings storage settings = userSettings[user];

        if (
            !settings.isActive ||
            transactionValue < settings.minTransactionValue
        ) {
            return 0;
        }

        if (settings.usePercentage) {
            return (transactionValue * settings.donationPercentage) / 10000;
        } else {
            return settings.donationAmount;
        }
    }

    // Helper function to get current month (for monthly limits)
    function getCurrentMonth() private view returns (uint256) {
        return (block.timestamp / 30 days);
    }

    // Emergency functions for contract owner
    function emergencyPause(address user) external {
        require(msg.sender == donationContract.owner(), "Only owner");
        userSettings[user].isActive = false;
    }

    // Get user statistics for dashboard
    function getUserStats(
        address user
    )
        external
        view
        returns (
            uint256 totalDonated,
            uint256 donationCount,
            uint256 monthlyDonated,
            uint256 lastDonation
        )
    {
        AutoDonationSettings storage settings = userSettings[user];

        // For now, return basic stats. In a production version, you'd want to
        // track these in storage or events for more accurate historical data
        totalDonated = settings.currentMonthSpent; // Simplified for demo
        donationCount = settings.isActive ? 1 : 0; // Simplified for demo
        monthlyDonated = settings.currentMonthSpent;
        lastDonation = block.timestamp; // Simplified for demo

        return (totalDonated, donationCount, monthlyDonated, lastDonation);
    }

    // Calculate auto-donation amount based on transaction value
    function calculateDonationAmount(
        address user,
        uint256 transactionValue
    ) external view returns (uint256) {
        AutoDonationSettings storage settings = userSettings[user];

        if (
            !settings.isActive ||
            transactionValue < settings.minTransactionValue
        ) {
            return 0;
        }

        if (settings.usePercentage) {
            return (transactionValue * settings.donationPercentage) / 10000;
        } else {
            return settings.donationAmount;
        }
    }
}
