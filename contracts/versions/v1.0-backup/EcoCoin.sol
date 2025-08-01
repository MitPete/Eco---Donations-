// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title EcoCoin
 * @dev Enhanced ERC20 token with pausable functionality and security features
 * Includes multi-signature support for critical operations
 */
contract EcoCoin is ERC20, Ownable, Pausable, ReentrancyGuard {
    uint256 public maxSupply;
    uint256 public totalMintedSupply;

    // Multi-signature wallet for admin operations
    address public multiSigWallet;

    // Authorized minters (donation contracts)
    mapping(address => bool) public authorizedMinters;

    // Events for better transparency
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event MultiSigWalletUpdated(
        address indexed oldWallet,
        address indexed newWallet
    );
    event EmergencyPause(address indexed account);
    event EmergencyUnpause(address indexed account);

    modifier onlyMinter() {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        _;
    }

    modifier onlyMultiSigOrOwner() {
        require(
            msg.sender == multiSigWallet || msg.sender == owner(),
            "Only MultiSig or Owner"
        );
        _;
    }

    constructor(uint256 _maxSupply) ERC20("ECO Coin", "ECO") {
        maxSupply = _maxSupply;
        totalMintedSupply = 0;
    }

    /**
     * @dev Set the multi-signature wallet address
     * @param _multiSigWallet Address of the multi-sig wallet
     */
    function setMultiSigWallet(address _multiSigWallet) external onlyOwner {
        require(_multiSigWallet != address(0), "Invalid address");
        address oldWallet = multiSigWallet;
        multiSigWallet = _multiSigWallet;
        emit MultiSigWalletUpdated(oldWallet, _multiSigWallet);
    }

    /**
     * @dev Add authorized minter (donation contracts)
     * @param _minter Address to authorize for minting
     */
    function addMinter(address _minter) external onlyMultiSigOrOwner {
        require(_minter != address(0), "Invalid address");
        require(!authorizedMinters[_minter], "Already authorized");
        authorizedMinters[_minter] = true;
        emit MinterAdded(_minter);
    }

    /**
     * @dev Remove authorized minter
     * @param _minter Address to remove minting authorization
     */
    function removeMinter(address _minter) external onlyMultiSigOrOwner {
        require(authorizedMinters[_minter], "Not authorized");
        authorizedMinters[_minter] = false;
        emit MinterRemoved(_minter);
    }

    /**
     * @dev Mint tokens to account (only authorized minters)
     * @param account Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mintTokens(
        address account,
        uint256 amount
    ) external onlyMinter whenNotPaused nonReentrant {
        require(account != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(totalSupply() + amount <= maxSupply, "Exceeds maximum supply");

        _mint(account, amount);
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
     * @dev Override _mint to track total minted supply and add pause check
     */
    function _mint(address account, uint256 amount) internal virtual override {
        require(
            totalMintedSupply + amount <= maxSupply,
            "Exceeds maximum supply"
        );
        super._mint(account, amount);
        totalMintedSupply += amount;
    }

    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "Token transfers are paused");
    }

    /**
     * @dev Get contract version for upgrades
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }
}
