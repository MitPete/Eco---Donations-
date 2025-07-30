// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EcoCoin - SECURITY HARDENED VERSION
 * @dev Ultra-secure ERC20 token with comprehensive protections
 */
contract EcoCoin is ERC20, Pausable, Ownable, ReentrancyGuard {
    
    // SECURITY: Immutable core addresses
    address public immutable donationContract;
    address public immutable multiSigWallet;
    
    // SECURITY: Supply controls
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MINT_RATE_LIMIT = 100000 * 10**18; // Max mint per call
    
    // SECURITY: Rate limiting for minting
    mapping(address => uint256) public lastMintTime;
    mapping(address => uint256) public dailyMintAmount;
    mapping(address => uint256) public lastMintReset;
    
    uint256 public constant MINT_INTERVAL = 1 minutes;
    uint256 public constant DAILY_MINT_LIMIT = 1000000 * 10**18;
    
    // Authorized minters
    mapping(address => bool) public authorizedMinters;
    
    // SECURITY: Enhanced events
    event MinterAuthorized(address indexed minter, bool status);
    event SecurityAlert(string message, address indexed account);
    event MintRateLimit(address indexed minter, uint256 amount);
    
    modifier onlyAuthorizedMinter() {
        require(
            authorizedMinters[msg.sender] || 
            msg.sender == donationContract || 
            msg.sender == owner(),
            "Unauthorized minter"
        );
        _;
    }
    
    modifier mintRateLimit(uint256 amount) {
        require(
            block.timestamp >= lastMintTime[msg.sender] + MINT_INTERVAL,
            "Mint rate limit exceeded"
        );
        
        // Reset daily counter if needed
        if (block.timestamp >= lastMintReset[msg.sender] + 1 days) {
            dailyMintAmount[msg.sender] = 0;
            lastMintReset[msg.sender] = block.timestamp;
        }
        
        require(
            dailyMintAmount[msg.sender] + amount <= DAILY_MINT_LIMIT,
            "Daily mint limit exceeded"
        );
        _;
    }

    constructor(
        address _donationContract,
        address _multiSigWallet
    ) ERC20("EcoCoin", "ECO") {
        require(_donationContract != address(0), "Invalid donation contract");
        require(_multiSigWallet != address(0), "Invalid MultiSig wallet");
        
        donationContract = _donationContract;
        multiSigWallet = _multiSigWallet;
        
        // Authorize core contracts
        authorizedMinters[_donationContract] = true;
        authorizedMinters[_multiSigWallet] = true;
    }
    
    /**
     * @dev SECURITY HARDENED: Mint function with comprehensive protections
     */
    function mint(address to, uint256 amount)
        external
        onlyAuthorizedMinter
        whenNotPaused
        nonReentrant
        mintRateLimit(amount)
    {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be positive");
        require(amount <= MINT_RATE_LIMIT, "Amount exceeds mint limit");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        // SECURITY: Update state before minting
        lastMintTime[msg.sender] = block.timestamp;
        dailyMintAmount[msg.sender] += amount;
        
        _mint(to, amount);
        
        // Emit security event for large mints
        if (amount > MINT_RATE_LIMIT / 10) {
            emit SecurityAlert("Large mint detected", msg.sender);
        }
    }
    
    /**
     * @dev SECURITY: Burn function with validation
     */
    function burn(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev SECURITY: Burn from address with allowance check
     */
    function burnFrom(address account, uint256 amount) external nonReentrant {
        require(account != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be positive");
        
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "Burn amount exceeds allowance");
        
        _approve(account, msg.sender, currentAllowance - amount);
        _burn(account, amount);
    }
    
    /**
     * @dev Set authorized minter status
     */
    function setAuthorizedMinter(address minter, bool status)
        external
        onlyOwner
    {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = status;
        emit MinterAuthorized(minter, status);
    }
    
    /**
     * @dev Emergency pause
     */
    function emergencyPause() external {
        require(
            msg.sender == owner() || msg.sender == multiSigWallet,
            "Unauthorized"
        );
        _pause();
        emit SecurityAlert("Emergency pause activated", msg.sender);
    }
    
    /**
     * @dev Emergency unpause
     */
    function emergencyUnpause() external {
        require(
            msg.sender == owner() || msg.sender == multiSigWallet,
            "Unauthorized"
        );
        _unpause();
        emit SecurityAlert("Emergency pause deactivated", msg.sender);
    }
    
    /**
     * @dev Override transfer to add pause functionality
     */
    function transfer(address to, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to add pause functionality
     */
    function transferFrom(address from, address to, uint256 amount)
        public
        override
        whenNotPaused
        returns (bool)
    {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Check if address can mint
     */
    function canMint(address minter, uint256 amount) external view returns (bool) {
        if (!authorizedMinters[minter] && minter != donationContract && minter != owner()) {
            return false;
        }
        
        if (block.timestamp < lastMintTime[minter] + MINT_INTERVAL) {
            return false;
        }
        
        if (totalSupply() + amount > MAX_SUPPLY) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get remaining daily mint limit
     */
    function getRemainingDailyMintLimit(address minter) external view returns (uint256) {
        if (block.timestamp >= lastMintReset[minter] + 1 days) {
            return DAILY_MINT_LIMIT;
        }
        return DAILY_MINT_LIMIT - dailyMintAmount[minter];
    }
}
