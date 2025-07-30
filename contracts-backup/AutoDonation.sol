// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Donation.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AutoDonationService
 * @dev Enhanced auto-donation service with security features and multi-sig support
 * Allows users to set up automatic donations based on transaction values or fixed amounts
 */
contract AutoDonationService is Pausable, ReentrancyGuard, Ownable {
    DonationContract public donationContract;
    address public multiSigWallet;

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
        uint256 maxSingleDonation; // Maximum amount for a single auto-donation
        uint256 createdAt; // When subscription was created
        uint256 lastDonationTime; // Timestamp of last donation
    }

    mapping(address => AutoDonationSettings) public userSettings;
    mapping(address => uint256) public totalAutoDonated;
    mapping(address => uint256) public autoTransactionCount;
    mapping(address => bool) public authorizedTriggers; // Addresses that can trigger donations

    // Rate limiting
    mapping(address => uint256) public lastTriggerTime;
    uint256 public constant MIN_TRIGGER_INTERVAL = 1 minutes; // Prevent spam

    // Global limits
    uint256 public maxMonthlyLimit = 100 ether; // Maximum monthly limit per user
    uint256 public maxPercentage = 1000; // Maximum 10%
    uint256 public maxSingleDonation = 10 ether; // Maximum single donation

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
    event AuthorizedTriggerAdded(address indexed trigger);
    event AuthorizedTriggerRemoved(address indexed trigger);
    event EmergencyPause(address indexed account);
    event EmergencyUnpause(address indexed account);
    event GlobalLimitsUpdated(
        uint256 monthlyLimit,
        uint256 percentage,
        uint256 singleDonation
    );

    modifier onlyMultiSigOrOwner() {
        require(
            msg.sender == multiSigWallet || msg.sender == owner(),
            "Only MultiSig or Owner"
        );
        _;
    }

    modifier onlyAuthorizedTrigger() {
        require(
            authorizedTriggers[msg.sender] ||
                msg.sender == owner() ||
                msg.sender == multiSigWallet,
            "Not authorized trigger"
        );
        _;
    }

    modifier rateLimited(address user) {
        require(
            block.timestamp >= lastTriggerTime[user] + MIN_TRIGGER_INTERVAL,
            "Rate limit exceeded"
        );
        lastTriggerTime[user] = block.timestamp;
        _;
    }

    constructor(address _donationContract) {
        require(
            _donationContract != address(0),
            "Invalid donation contract address"
        );
        donationContract = DonationContract(payable(_donationContract));
    }

    /**
     * @dev Set the multi-signature wallet address
     */
    function setMultiSigWallet(address _multiSigWallet) external onlyOwner {
        require(_multiSigWallet != address(0), "Invalid address");
        multiSigWallet = _multiSigWallet;
    }

    /**
     * @dev Add authorized trigger address
     */
    function addAuthorizedTrigger(
        address _trigger
    ) external onlyMultiSigOrOwner {
        require(_trigger != address(0), "Invalid address");
        authorizedTriggers[_trigger] = true;
        emit AuthorizedTriggerAdded(_trigger);
    }

    /**
     * @dev Remove authorized trigger address
     */
    function removeAuthorizedTrigger(
        address _trigger
    ) external onlyMultiSigOrOwner {
        authorizedTriggers[_trigger] = false;
        emit AuthorizedTriggerRemoved(_trigger);
    }

    /**
     * @dev Update global limits
     */
    function updateGlobalLimits(
        uint256 _maxMonthlyLimit,
        uint256 _maxPercentage,
        uint256 _maxSingleDonation
    ) external onlyMultiSigOrOwner {
        require(_maxPercentage <= 2000, "Percentage too high"); // Max 20%
        require(_maxMonthlyLimit <= 1000 ether, "Monthly limit too high");
        require(
            _maxSingleDonation <= 100 ether,
            "Single donation limit too high"
        );

        maxMonthlyLimit = _maxMonthlyLimit;
        maxPercentage = _maxPercentage;
        maxSingleDonation = _maxSingleDonation;

        emit GlobalLimitsUpdated(
            _maxMonthlyLimit,
            _maxPercentage,
            _maxSingleDonation
        );
    }

    /**
     * @dev Subscribe to auto-donations with fixed amount
     */
    function subscribeFixedAmount(
        uint256 _donationAmount,
        DonationContract.Foundation _foundation,
        uint256 _monthlyLimit,
        uint256 _minTransactionValue
    ) external whenNotPaused {
        require(_donationAmount > 0, "Donation amount must be > 0");
        require(
            _donationAmount <= maxSingleDonation,
            "Donation amount too high"
        );
        require(_monthlyLimit >= _donationAmount, "Monthly limit too low");
        require(
            _monthlyLimit <= maxMonthlyLimit,
            "Monthly limit exceeds maximum"
        );

        AutoDonationSettings storage settings = userSettings[msg.sender];
        settings.isActive = true;
        settings.donationAmount = _donationAmount;
        settings.donationPercentage = 0;
        settings.preferredFoundation = _foundation;
        settings.monthlyLimit = _monthlyLimit;
        settings.usePercentage = false;
        settings.minTransactionValue = _minTransactionValue;
        settings.maxSingleDonation = _donationAmount;
        settings.lastResetMonth = getCurrentMonth();
        settings.currentMonthSpent = 0;
        settings.createdAt = block.timestamp;

        emit AutoDonationSubscribed(
            msg.sender,
            _donationAmount,
            0,
            _foundation
        );
    }

    /**
     * @dev Subscribe to auto-donations with percentage
     */
    function subscribePercentage(
        uint256 _donationPercentage, // e.g., 50 = 0.5%
        DonationContract.Foundation _foundation,
        uint256 _monthlyLimit,
        uint256 _minTransactionValue,
        uint256 _maxSingleDonation
    ) external whenNotPaused {
        require(
            _donationPercentage > 0 && _donationPercentage <= maxPercentage,
            "Invalid percentage"
        );
        require(
            _monthlyLimit <= maxMonthlyLimit,
            "Monthly limit exceeds maximum"
        );
        require(
            _maxSingleDonation <= maxSingleDonation,
            "Single donation limit too high"
        );

        AutoDonationSettings storage settings = userSettings[msg.sender];
        settings.isActive = true;
        settings.donationAmount = 0;
        settings.donationPercentage = _donationPercentage;
        settings.preferredFoundation = _foundation;
        settings.monthlyLimit = _monthlyLimit;
        settings.usePercentage = true;
        settings.minTransactionValue = _minTransactionValue;
        settings.maxSingleDonation = _maxSingleDonation;
        settings.lastResetMonth = getCurrentMonth();
        settings.currentMonthSpent = 0;
        settings.createdAt = block.timestamp;

        emit AutoDonationSubscribed(
            msg.sender,
            0,
            _donationPercentage,
            _foundation
        );
    }

    /**
     * @dev Main function: trigger auto-donation based on transaction value
     */
    function triggerAutoDonation(
        address user,
        uint256 transactionValue
    )
        external
        payable
        whenNotPaused
        nonReentrant
        onlyAuthorizedTrigger
        rateLimited(user)
    {
        AutoDonationSettings storage settings = userSettings[user];

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
            // Apply max single donation limit
            if (donationAmount > settings.maxSingleDonation) {
                donationAmount = settings.maxSingleDonation;
            }
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
        settings.lastDonationTime = block.timestamp;
        totalAutoDonated[user] += donationAmount;
        autoTransactionCount[user]++;

        // Make the donation on behalf of the user
        donationContract.donateOnBehalf{value: donationAmount}(
            settings.preferredFoundation,
            "Auto-donation",
            user
        );

        // Return excess ETH
        if (msg.value > donationAmount) {
            (bool success, ) = payable(msg.sender).call{
                value: msg.value - donationAmount
            }("");
            require(success, "Failed to return excess ETH");
        }

        emit AutoDonationTriggered(
            user,
            donationAmount,
            settings.preferredFoundation,
            transactionValue
        );
    }

    /**
     * @dev Update existing subscription settings
     */
    function updateSettings(
        uint256 _donationAmount,
        uint256 _donationPercentage,
        uint256 _monthlyLimit,
        DonationContract.Foundation _foundation,
        uint256 _maxSingleDonation
    ) external whenNotPaused {
        require(userSettings[msg.sender].isActive, "No active subscription");
        require(
            _monthlyLimit > 0 && _monthlyLimit <= maxMonthlyLimit,
            "Invalid monthly limit"
        );

        if (_donationAmount > 0) {
            require(
                _donationPercentage == 0,
                "Cannot set both amount and percentage"
            );
            require(
                _donationAmount <= maxSingleDonation,
                "Donation amount too high"
            );
            require(_monthlyLimit >= _donationAmount, "Monthly limit too low");

            AutoDonationSettings storage settings = userSettings[msg.sender];
            settings.donationAmount = _donationAmount;
            settings.donationPercentage = 0;
            settings.preferredFoundation = _foundation;
            settings.monthlyLimit = _monthlyLimit;
            settings.usePercentage = false;
            settings.maxSingleDonation = _donationAmount;

            emit AutoDonationSettingsUpdated(msg.sender);
        } else if (_donationPercentage > 0) {
            require(_donationPercentage <= maxPercentage, "Invalid percentage");
            require(
                _maxSingleDonation <= maxSingleDonation,
                "Single donation limit too high"
            );

            AutoDonationSettings storage settings = userSettings[msg.sender];
            settings.donationAmount = 0;
            settings.donationPercentage = _donationPercentage;
            settings.preferredFoundation = _foundation;
            settings.monthlyLimit = _monthlyLimit;
            settings.usePercentage = true;
            settings.maxSingleDonation = _maxSingleDonation;

            emit AutoDonationSettingsUpdated(msg.sender);
        } else {
            revert("Must specify either amount or percentage");
        }
    }

    /**
     * @dev Pause/unpause auto-donations
     */
    function setActive(bool _active) external {
        userSettings[msg.sender].isActive = _active;
        if (!_active) {
            emit AutoDonationUnsubscribed(msg.sender);
        }
    }

    /**
     * @dev Unsubscribe completely
     */
    function unsubscribe() external {
        delete userSettings[msg.sender];
        emit AutoDonationUnsubscribed(msg.sender);
    }

    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyMultiSigOrOwner {
        _pause();
        emit EmergencyPause(msg.sender);
    }

    /**
     * @dev Emergency unpause function
     */
    function emergencyUnpause() external onlyMultiSigOrOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }

    /**
     * @dev Emergency pause user's auto-donations
     */
    function emergencyPauseUser(address user) external onlyMultiSigOrOwner {
        userSettings[user].isActive = false;
        emit AutoDonationUnsubscribed(user);
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

        uint256 donationAmount;
        if (settings.usePercentage) {
            donationAmount =
                (transactionValue * settings.donationPercentage) /
                10000;
            if (donationAmount > settings.maxSingleDonation) {
                donationAmount = settings.maxSingleDonation;
            }
        } else {
            donationAmount = settings.donationAmount;
        }

        return donationAmount;
    }

    /**
     * @dev Get user statistics for dashboard
     */
    function getUserStats(
        address user
    )
        external
        view
        returns (
            uint256 totalDonated,
            uint256 donationCount,
            uint256 monthlyDonated,
            uint256 lastDonation,
            bool isActive
        )
    {
        AutoDonationSettings storage settings = userSettings[user];

        return (
            totalAutoDonated[user],
            autoTransactionCount[user],
            settings.currentMonthSpent,
            settings.lastDonationTime,
            settings.isActive
        );
    }

    /**
     * @dev Get global service statistics
     */
    function getServiceStats()
        external
        view
        returns (
            uint256 totalUsers,
            uint256 activeUsers,
            uint256 totalDonationsProcessed,
            bool isPaused
        )
    {
        // Note: In production, you'd want to track these in storage
        // This is a simplified implementation for demo purposes
        return (0, 0, 0, paused()); // Simplified for demo
    }

    /**
     * @dev Get global limits
     */
    function getGlobalLimits()
        external
        view
        returns (
            uint256 monthlyLimit,
            uint256 percentage,
            uint256 singleDonation
        )
    {
        return (maxMonthlyLimit, maxPercentage, maxSingleDonation);
    }

    /**
     * @dev Helper function to get current month (for monthly limits)
     */
    function getCurrentMonth() private view returns (uint256) {
        return (block.timestamp / 30 days);
    }

    /**
     * @dev Emergency withdrawal function (multi-sig only)
     */
    function emergencyWithdraw() external onlyMultiSigOrOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(
            multiSigWallet != address(0) ? multiSigWallet : owner()
        ).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get contract version
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }

    /**
     * @dev Fallback receive function
     */
    receive() external payable {
        // Accept ETH for auto-donations
    }
}
