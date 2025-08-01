// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19; // Updated to latest stable version

import "./EcoCoin.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DonationContract - SECURITY HARDENED VERSION
 * @dev Ultra-secure donation contract with comprehensive protections
 */
contract DonationContract is
    ERC721URIStorage,
    Pausable,
    ReentrancyGuard,
    Ownable
{
    enum Foundation {
        SaveTheOceans,
        ProtectTheRainforest,
        ProtectTheSequoias,
        CleanEnergy
    }

    // SECURITY: Immutable core addresses
    EcoCoin public immutable eco;
    address public immutable multiSigWallet;
    address public immutable treasuryAddress; // Platform fee collection

    mapping(Foundation => address) public foundationAddresses;
    mapping(uint256 => Foundation) private _tokenFoundation;
    mapping(uint256 => uint256) private _donationAmounts;
    mapping(Foundation => bool) public verifiedFoundations;

    // SECURITY: Rate limiting
    mapping(address => uint256) public lastDonationTime;
    mapping(address => uint256) public dailyDonationAmount;
    mapping(address => uint256) public lastDailyReset;

    string[4] private _uris;
    uint256 public nextId = 1;
    uint256 public totalDonations;
    uint256 public totalFeesCollected;

    // SECURITY: Enhanced limits and controls
    uint256 public constant MIN_DONATION = 0.001 ether;
    uint256 public constant MAX_DONATION = 100 ether;
    uint256 public constant RATE_LIMIT_INTERVAL = 1 minutes;
    uint256 public constant DAILY_LIMIT = 1000 ether;

    // PLATFORM ECONOMICS: Fee structure
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 300; // 3.00% (300 basis points)
    uint256 public constant FEE_DENOMINATOR = 10000; // For precise percentage calculations

    // SECURITY: Enhanced events for monitoring
    event DonationMade(
        Foundation indexed f,
        address indexed sender,
        uint256 amount,
        string message
    );
    event TokenBalanceUpdated(address indexed donor, uint256 balance);
    event FoundationUpdated(
        Foundation indexed f,
        address oldAddr,
        address newAddr
    );
    event SecurityAlert(string message, address indexed account);
    event RateLimitTriggered(address indexed account, uint256 amount);
    event EmergencyPause(address indexed account);
    event PlatformFeeCollected(
        address indexed donor,
        uint256 feeAmount,
        uint256 donationAmount
    );
    event TreasuryWithdrawal(address indexed recipient, uint256 amount);

    modifier onlyMultiSigOrOwner() {
        require(
            msg.sender == multiSigWallet || msg.sender == owner(),
            "Unauthorized: MultiSig or Owner only"
        );
        _;
    }

    modifier rateLimited() {
        require(
            block.timestamp >=
                lastDonationTime[msg.sender] + RATE_LIMIT_INTERVAL,
            "Rate limit: Too many donations"
        );
        _;
    }

    modifier dailyLimitCheck(uint256 amount) {
        // Reset daily counter if needed
        if (block.timestamp >= lastDailyReset[msg.sender] + 1 days) {
            dailyDonationAmount[msg.sender] = 0;
            lastDailyReset[msg.sender] = block.timestamp;
        }

        require(
            dailyDonationAmount[msg.sender] + amount <= DAILY_LIMIT,
            "Daily limit exceeded"
        );
        _;
    }

    constructor(
        address _eco,
        address _multiSigWallet,
        address _treasuryAddress,
        string[4] memory uris
    ) ERC721("EcoDonationNFT", "EDONFT") {
        require(_eco != address(0), "Invalid ECO token address");
        require(_multiSigWallet != address(0), "Invalid MultiSig address");
        require(_treasuryAddress != address(0), "Invalid treasury address");

        eco = EcoCoin(_eco);
        multiSigWallet = _multiSigWallet;
        treasuryAddress = _treasuryAddress;
        _uris = uris;

        // Initialize verified foundations
        verifiedFoundations[Foundation.SaveTheOceans] = true;
        verifiedFoundations[Foundation.ProtectTheRainforest] = true;
        verifiedFoundations[Foundation.ProtectTheSequoias] = true;
        verifiedFoundations[Foundation.CleanEnergy] = true;
    }

    /**
     * @dev SECURITY HARDENED: Main donation function with comprehensive protections and 3% platform fee
     */
    function donate(
        Foundation f,
        string calldata message_
    )
        external
        payable
        whenNotPaused
        nonReentrant
        rateLimited
        dailyLimitCheck(msg.value)
    {
        require(msg.value >= MIN_DONATION, "Donation below minimum");
        require(msg.value <= MAX_DONATION, "Donation exceeds maximum");
        require(verifiedFoundations[f], "Foundation not verified");
        require(bytes(message_).length <= 500, "Message too long");

        // PLATFORM ECONOMICS: Calculate 3% platform fee
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENTAGE) /
            FEE_DENOMINATOR;
        uint256 donationAmount = msg.value - platformFee;

        // SECURITY: Update state before external calls
        lastDonationTime[msg.sender] = block.timestamp;
        dailyDonationAmount[msg.sender] += msg.value;
        totalDonations += donationAmount; // Track net donations (after fee)
        totalFeesCollected += platformFee;

        // Get foundation address safely
        address foundationAddr = foundationAddresses[f];
        require(foundationAddr != address(0), "Foundation address not set");

        // SECURITY: Transfer donation amount to foundation (97% of total)
        (bool foundationSuccess, ) = payable(foundationAddr).call{
            value: donationAmount,
            gas: 2300
        }("");
        require(foundationSuccess, "Foundation transfer failed");

        // SECURITY: Keep platform fee in contract for later withdrawal
        // (Platform fee stays in contract balance for treasury management)

        // Mint NFT based on net donation amount
        uint256 tokenId = nextId++;
        _tokenFoundation[tokenId] = f;
        _donationAmounts[tokenId] = donationAmount; // Store net donation amount
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uris[uint256(f)]);

        // Mint ECO tokens (10x the net donation amount)
        uint256 ecoAmount = donationAmount * 10;
        eco.mint(msg.sender, ecoAmount);

        emit DonationMade(f, msg.sender, donationAmount, message_);
        emit PlatformFeeCollected(msg.sender, platformFee, donationAmount);
        emit TokenBalanceUpdated(msg.sender, eco.balanceOf(msg.sender));
    }

    /**
     * @dev SECURITY ENHANCED: Donation on behalf with additional validation and 3% platform fee
     */
    function donateOnBehalf(
        Foundation f,
        string calldata message_,
        address beneficiary
    )
        external
        payable
        whenNotPaused
        nonReentrant
        rateLimited
        dailyLimitCheck(msg.value)
    {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(msg.value >= MIN_DONATION, "Donation below minimum");
        require(msg.value <= MAX_DONATION, "Donation exceeds maximum");
        require(verifiedFoundations[f], "Foundation not verified");

        // PLATFORM ECONOMICS: Calculate 3% platform fee
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENTAGE) /
            FEE_DENOMINATOR;
        uint256 donationAmount = msg.value - platformFee;

        // SECURITY: Update state first
        lastDonationTime[msg.sender] = block.timestamp;
        dailyDonationAmount[msg.sender] += msg.value;
        totalDonations += donationAmount;
        totalFeesCollected += platformFee;

        address foundationAddr = foundationAddresses[f];
        require(foundationAddr != address(0), "Foundation address not set");

        // SECURITY: Transfer donation amount to foundation (97% of total)
        (bool foundationSuccess, ) = payable(foundationAddr).call{
            value: donationAmount,
            gas: 2300
        }("");
        require(foundationSuccess, "Foundation transfer failed");

        // SECURITY: Keep platform fee in contract for later withdrawal
        // (Platform fee stays in contract balance for treasury management)

        // Mint to beneficiary based on net donation
        uint256 tokenId = nextId++;
        _tokenFoundation[tokenId] = f;
        _donationAmounts[tokenId] = donationAmount;
        _safeMint(beneficiary, tokenId);
        _setTokenURI(tokenId, _uris[uint256(f)]);

        // Mint ECO tokens to beneficiary based on net donation
        uint256 ecoAmount = donationAmount * 10;
        eco.mint(beneficiary, ecoAmount);

        emit DonationMade(f, beneficiary, donationAmount, message_);
        emit PlatformFeeCollected(msg.sender, platformFee, donationAmount);
        emit TokenBalanceUpdated(beneficiary, eco.balanceOf(beneficiary));
    }

    /**
     * @dev PLATFORM ECONOMICS: Withdraw collected fees (MultiSig only)
     */
    function withdrawTreasuryFees(
        address payable recipient,
        uint256 amount
    ) external onlyMultiSigOrOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(
            address(this).balance >= amount,
            "Insufficient contract balance"
        );

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Treasury withdrawal failed");

        emit TreasuryWithdrawal(recipient, amount);
    }

    /**
     * @dev PLATFORM ECONOMICS: Get current treasury balance in contract
     */
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev PLATFORM ECONOMICS: Get platform fee calculation for amount
     */
    function calculatePlatformFee(
        uint256 donationAmount
    ) external pure returns (uint256 fee, uint256 netDonation) {
        fee = (donationAmount * PLATFORM_FEE_PERCENTAGE) / FEE_DENOMINATOR;
        netDonation = donationAmount - fee;
        return (fee, netDonation);
    }

    /**
     * @dev SECURITY: Set foundation address with validation
     */
    function setFoundationAddress(
        Foundation f,
        address addr
    ) external onlyMultiSigOrOwner {
        require(addr != address(0), "Invalid foundation address");
        require(addr != address(this), "Cannot be contract address");

        address oldAddr = foundationAddresses[f];
        foundationAddresses[f] = addr;

        emit FoundationUpdated(f, oldAddr, addr);
    }

    /**
     * @dev SECURITY: Foundation verification
     */
    function setFoundationVerification(
        Foundation f,
        bool verified
    ) external onlyMultiSigOrOwner {
        verifiedFoundations[f] = verified;
        emit SecurityAlert(
            verified ? "Foundation verified" : "Foundation unverified",
            msg.sender
        );
    }

    /**
     * @dev Emergency pause
     */
    function emergencyPause() external onlyMultiSigOrOwner {
        _pause();
        emit EmergencyPause(msg.sender);
        emit SecurityAlert("Emergency pause activated", msg.sender);
    }

    /**
     * @dev Emergency unpause
     */
    function emergencyUnpause() external onlyMultiSigOrOwner {
        _unpause();
        emit SecurityAlert("Emergency pause deactivated", msg.sender);
    }

    /**
     * @dev Get donation details for NFT
     */
    function getDonationDetails(
        uint256 tokenId
    ) external view returns (Foundation foundation, uint256 amount) {
        require(_exists(tokenId), "Token does not exist");
        return (_tokenFoundation[tokenId], _donationAmounts[tokenId]);
    }

    /**
     * @dev Check if user can donate (rate limit check)
     */
    function canDonate(address user) external view returns (bool) {
        return block.timestamp >= lastDonationTime[user] + RATE_LIMIT_INTERVAL;
    }

    /**
     * @dev Get remaining daily limit for user
     */
    function getRemainingDailyLimit(
        address user
    ) external view returns (uint256) {
        if (block.timestamp >= lastDailyReset[user] + 1 days) {
            return DAILY_LIMIT;
        }
        return DAILY_LIMIT - dailyDonationAmount[user];
    }

    // SECURITY: Handle direct ETH transfers (for platform fees)
    receive() external payable {
        // Allow contract to receive ETH for platform fee collection
        // Only emit alert for unexpected direct transfers
        if (msg.value > 0) {
            emit SecurityAlert("Direct ETH transfer received", msg.sender);
        }
    }

    fallback() external payable {
        emit SecurityAlert("Fallback function called", msg.sender);
        revert("Function not found");
    }
}
