// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "./Donation.sol";
import "./EcoCoin.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AutoDonationContract - SECURITY ENHANCED VERSION
 * @dev Enhanced auto-donation contract with improved security measures
 * - Added pull-over-push pattern for refunds
 * - Enhanced reentrancy protection
 * - Improved access controls
 */
contract AutoDonationContract is Pausable, ReentrancyGuard, Ownable {
    DonationContract public donationContract;
    EcoCoin public ecoCoin;
    address public multiSigWallet;

    struct AutoDonationSettings {
        uint256 donationAmount;
        DonationContract.Foundation preferredFoundation;
        uint256 frequency; // in seconds
        uint256 lastDonation;
        bool isActive;
        uint256 maxDonationPerTrigger;
        uint256 totalDonated;
    }

    mapping(address => AutoDonationSettings) public userSettings;
    mapping(address => bool) public authorizedTriggers;
    mapping(address => uint256) public pendingRefunds; // SECURITY FIX: Pull pattern for refunds

    uint256 public constant MIN_DONATION = 0.001 ether;
    uint256 public constant MAX_DONATION = 10 ether;
    uint256 public constant MIN_FREQUENCY = 1 days;
    uint256 public constant MAX_FREQUENCY = 365 days;

    // SECURITY: Enhanced events for monitoring
    event AutoDonationTriggered(
        address indexed user,
        uint256 amount,
        DonationContract.Foundation foundation,
        uint256 triggerValue
    );
    event AutoDonationSettingsUpdated(address indexed user);
    event AutoDonationUnsubscribed(address indexed user);
    event RefundQueued(address indexed user, uint256 amount);
    event RefundClaimed(address indexed user, uint256 amount);
    event EmergencyPause(address indexed account);
    event SecurityAlert(string message, address indexed account);

    modifier onlyMultiSigOrOwner() {
        require(
            msg.sender == multiSigWallet || msg.sender == owner(),
            "Unauthorized: MultiSig or Owner only"
        );
        _;
    }

    modifier onlyAuthorizedTrigger() {
        require(
            authorizedTriggers[msg.sender] ||
                msg.sender == owner() ||
                msg.sender == multiSigWallet,
            "Unauthorized trigger"
        );
        _;
    }

    constructor(
        address payable _donationContract,
        address _ecoCoin,
        address _multiSigWallet
    ) {
        require(_donationContract != address(0), "Invalid donation contract");
        require(_ecoCoin != address(0), "Invalid ECO coin contract");
        require(_multiSigWallet != address(0), "Invalid multisig wallet");

        donationContract = DonationContract(_donationContract);
        ecoCoin = EcoCoin(_ecoCoin);
        multiSigWallet = _multiSigWallet;
    }

    /**
     * @dev SECURITY ENHANCED: Setup auto-donation with comprehensive validation
     */
    function setupAutoDonation(
        uint256 _donationAmount,
        DonationContract.Foundation _foundation,
        uint256 _frequency,
        uint256 _maxPerTrigger
    ) external payable whenNotPaused {
        require(_donationAmount >= MIN_DONATION, "Donation too small");
        require(_donationAmount <= MAX_DONATION, "Donation too large");
        require(_frequency >= MIN_FREQUENCY, "Frequency too high");
        require(_frequency <= MAX_FREQUENCY, "Frequency too low");
        require(_maxPerTrigger >= _donationAmount, "Max per trigger too low");
        require(_maxPerTrigger <= MAX_DONATION, "Max per trigger too high");

        AutoDonationSettings storage settings = userSettings[msg.sender];
        settings.donationAmount = _donationAmount;
        settings.preferredFoundation = _foundation;
        settings.frequency = _frequency;
        settings.lastDonation = block.timestamp;
        settings.isActive = true;
        settings.maxDonationPerTrigger = _maxPerTrigger;

        emit AutoDonationSettingsUpdated(msg.sender);
    }

    /**
     * @dev SECURITY ENHANCED: Trigger auto-donation with pull pattern for refunds
     */
    function triggerAutoDonation(
        address user,
        uint256 transactionValue
    ) external payable onlyAuthorizedTrigger whenNotPaused nonReentrant {
        AutoDonationSettings storage settings = userSettings[user];
        require(settings.isActive, "Auto-donation not active");
        require(
            block.timestamp >= settings.lastDonation + settings.frequency,
            "Too early for next donation"
        );

        uint256 donationAmount = settings.donationAmount;
        require(msg.value >= donationAmount, "Insufficient ETH sent");
        require(
            donationAmount <= settings.maxDonationPerTrigger,
            "Exceeds max per trigger"
        );

        // SECURITY FIX: Update state before external calls
        settings.lastDonation = block.timestamp;
        settings.totalDonated += donationAmount;

        // Make donation through the donation contract
        donationContract.donateOnBehalf{value: donationAmount}(
            settings.preferredFoundation,
            "Auto-donation",
            user
        );

        // SECURITY FIX: Queue refunds instead of direct transfer
        if (msg.value > donationAmount) {
            uint256 refundAmount = msg.value - donationAmount;
            pendingRefunds[msg.sender] += refundAmount;
            emit RefundQueued(msg.sender, refundAmount);
        }

        emit AutoDonationTriggered(
            user,
            donationAmount,
            settings.preferredFoundation,
            transactionValue
        );
    }

    /**
     * @dev SECURITY ENHANCEMENT: Pull pattern for claiming refunds
     */
    function claimRefund() external nonReentrant {
        uint256 refundAmount = pendingRefunds[msg.sender];
        require(refundAmount > 0, "No refund available");

        // SECURITY: Update state before external call
        pendingRefunds[msg.sender] = 0;

        // SECURITY: Use transfer instead of call for simpler refunds
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        if (!success) {
            // If transfer fails, restore the pending refund
            pendingRefunds[msg.sender] = refundAmount;
            emit SecurityAlert("Refund transfer failed", msg.sender);
            revert("Refund transfer failed");
        }

        emit RefundClaimed(msg.sender, refundAmount);
    }

    /**
     * @dev Get user's auto-donation settings
     */
    function getUserSettings(
        address user
    ) external view returns (AutoDonationSettings memory) {
        return userSettings[user];
    }

    /**
     * @dev Update donation amount with validation
     */
    function updateDonationAmount(uint256 _newAmount) external {
        require(_newAmount >= MIN_DONATION, "Amount too small");
        require(_newAmount <= MAX_DONATION, "Amount too large");
        require(userSettings[msg.sender].isActive, "No active subscription");

        AutoDonationSettings storage settings = userSettings[msg.sender];
        settings.donationAmount = _newAmount;

        emit AutoDonationSettingsUpdated(msg.sender);
    }

    /**
     * @dev Update frequency with validation
     */
    function updateFrequency(uint256 _newFrequency) external {
        require(_newFrequency >= MIN_FREQUENCY, "Frequency too high");
        require(_newFrequency <= MAX_FREQUENCY, "Frequency too low");
        require(userSettings[msg.sender].isActive, "No active subscription");

        AutoDonationSettings storage settings = userSettings[msg.sender];
        settings.frequency = _newFrequency;

        emit AutoDonationSettingsUpdated(msg.sender);
    }

    /**
     * @dev Toggle auto-donation active status
     */
    function setActiveStatus(bool _active) external {
        userSettings[msg.sender].isActive = _active;
        if (!_active) {
            emit AutoDonationUnsubscribed(msg.sender);
        }
    }

    /**
     * @dev Completely remove auto-donation settings
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
    }

    /**
     * @dev Set authorized trigger addresses
     */
    function setAuthorizedTrigger(
        address _trigger,
        bool _authorized
    ) external onlyMultiSigOrOwner {
        require(_trigger != address(0), "Invalid trigger address");
        authorizedTriggers[_trigger] = _authorized;
    }

    /**
     * @dev Emergency withdrawal function (multisig only)
     */
    function emergencyWithdraw(
        uint256 amount
    ) external onlyMultiSigOrOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = payable(multiSigWallet).call{value: amount}("");
        require(success, "Emergency withdrawal failed");

        emit SecurityAlert("Emergency withdrawal executed", msg.sender);
    }

    /**
     * @dev Check if user can trigger auto-donation
     */
    function canTriggerDonation(address user) external view returns (bool) {
        AutoDonationSettings memory settings = userSettings[user];
        return (settings.isActive &&
            block.timestamp >= settings.lastDonation + settings.frequency);
    }

    // SECURITY: Prevent accidental ETH sends
    receive() external payable {
        emit SecurityAlert("Direct ETH transfer received", msg.sender);
        revert("Use triggerAutoDonation function");
    }

    fallback() external payable {
        emit SecurityAlert("Fallback function called", msg.sender);
        revert("Function not found");
    }
}
