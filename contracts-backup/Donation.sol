// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./EcoCoin.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DonationContract
 * @dev Enhanced donation contract with pausable functionality and security features
 * Includes multi-signature support for critical operations
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

    EcoCoin public eco;
    address public multiSigWallet;
    mapping(Foundation => address) public foundationAddresses;
    mapping(uint256 => Foundation) private _tokenFoundation;
    mapping(uint256 => uint256) private _donationAmounts; // Track donation amounts per token
    string[4] private _uris; // one URI per foundation
    uint256 public nextId = 1;
    uint256 public totalDonations;
    uint256 public minimumDonation = 0.001 ether; // Minimum donation amount

    // Foundation verification
    mapping(Foundation => bool) public verifiedFoundations;

    event DonationMade(Foundation f, address sender, uint amount, string msg_);
    event TokenBalanceUpdated(address donor, uint256 bal);
    event FoundationUpdated(Foundation f, address oldAddr, address newAddr);
    event MinimumDonationUpdated(uint256 oldAmount, uint256 newAmount);
    event EmergencyPause(address indexed account);
    event EmergencyUnpause(address indexed account);
    event FoundationVerified(Foundation f);
    event FoundationUnverified(Foundation f);

    modifier onlyMultiSigOrOwner() {
        require(
            msg.sender == multiSigWallet || msg.sender == owner(),
            "Only MultiSig or Owner"
        );
        _;
    }

    modifier validFoundation(Foundation f) {
        require(verifiedFoundations[f], "Foundation not verified");
        require(
            foundationAddresses[f] != address(0),
            "Invalid foundation address"
        );
        _;
    }

    constructor(
        address ecoAddr,
        address oceansAddr,
        address rainAddr,
        address sequoiasAddr,
        address energyAddr
    ) ERC721("Eco Donation Badge", "ECO-BADGE") {
        require(ecoAddr != address(0), "Invalid EcoCoin address");
        eco = EcoCoin(ecoAddr);

        // Set foundation addresses
        foundationAddresses[Foundation.SaveTheOceans] = oceansAddr;
        foundationAddresses[Foundation.ProtectTheRainforest] = rainAddr;
        foundationAddresses[Foundation.ProtectTheSequoias] = sequoiasAddr;
        foundationAddresses[Foundation.CleanEnergy] = energyAddr;

        // Verify foundations
        verifiedFoundations[Foundation.SaveTheOceans] = true;
        verifiedFoundations[Foundation.ProtectTheRainforest] = true;
        verifiedFoundations[Foundation.ProtectTheSequoias] = true;
        verifiedFoundations[Foundation.CleanEnergy] = true;

        // Set badge URIs (all foundations return the Oceans badge for now)
        _uris[0] = "/badges/oceans.json";
        _uris[1] = "/badges/oceans.json";
        _uris[2] = "/badges/oceans.json";
        _uris[3] = "/badges/oceans.json";
    }

    /**
     * @dev Set the multi-signature wallet address
     * @param _multiSigWallet Address of the multi-sig wallet
     */
    function setMultiSigWallet(address _multiSigWallet) external onlyOwner {
        require(_multiSigWallet != address(0), "Invalid address");
        multiSigWallet = _multiSigWallet;
    }

    /**
     * @dev Update foundation address (requires multi-sig)
     */
    function updateFoundationAddress(
        Foundation f,
        address newAddr
    ) external onlyMultiSigOrOwner {
        require(newAddr != address(0), "Invalid address");
        address oldAddr = foundationAddresses[f];
        foundationAddresses[f] = newAddr;
        emit FoundationUpdated(f, oldAddr, newAddr);
    }

    /**
     * @dev Verify or unverify a foundation
     */
    function setFoundationVerification(
        Foundation f,
        bool verified
    ) external onlyMultiSigOrOwner {
        verifiedFoundations[f] = verified;
        if (verified) {
            emit FoundationVerified(f);
        } else {
            emit FoundationUnverified(f);
        }
    }

    /**
     * @dev Update minimum donation amount
     */
    function setMinimumDonation(
        uint256 _minimumDonation
    ) external onlyMultiSigOrOwner {
        uint256 oldAmount = minimumDonation;
        minimumDonation = _minimumDonation;
        emit MinimumDonationUpdated(oldAmount, _minimumDonation);
    }

    /**
     * @dev Main donation function
     */
    function donate(
        Foundation f,
        string calldata message
    ) external payable whenNotPaused nonReentrant validFoundation(f) {
        require(msg.value >= minimumDonation, "Donation below minimum");

        // Mint ECO tokens (10x the ETH amount)
        eco.mintTokens(msg.sender, msg.value * 10);
        emit TokenBalanceUpdated(msg.sender, eco.balanceOf(msg.sender));

        // Transfer funds to foundation
        (bool success, ) = payable(foundationAddresses[f]).call{
            value: msg.value
        }("");
        require(success, "Foundation transfer failed");

        // Mint NFT badge
        uint256 id = nextId++;
        _safeMint(msg.sender, id);
        _tokenFoundation[id] = f;
        _donationAmounts[id] = msg.value;

        // Update total donations
        totalDonations += msg.value;

        emit DonationMade(f, msg.sender, msg.value, message);
    }

    /**
     * @dev Special donation function for auto-donations (accepts donor address)
     */
    function donateOnBehalf(
        Foundation f,
        string calldata message,
        address donor
    ) external payable whenNotPaused nonReentrant validFoundation(f) {
        require(msg.value >= minimumDonation, "Donation below minimum");
        require(donor != address(0), "Invalid donor address");

        // Mint ECO tokens for the actual donor
        eco.mintTokens(donor, msg.value * 10);
        emit TokenBalanceUpdated(donor, eco.balanceOf(donor));

        // Transfer funds to foundation
        (bool success, ) = payable(foundationAddresses[f]).call{
            value: msg.value
        }("");
        require(success, "Foundation transfer failed");

        // Mint NFT badge for the donor
        uint256 id = nextId++;
        _safeMint(donor, id);
        _tokenFoundation[id] = f;
        _donationAmounts[id] = msg.value;

        // Update total donations
        totalDonations += msg.value;

        emit DonationMade(f, donor, msg.value, message);
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
     * @dev Get donation amount for a specific token
     */
    function getDonationAmount(
        uint256 tokenId
    ) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _donationAmounts[tokenId];
    }

    /**
     * @dev Get foundation for a specific token
     */
    function getTokenFoundation(
        uint256 tokenId
    ) external view returns (Foundation) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenFoundation[tokenId];
    }

    /**
     * @dev Override tokenURI to return foundation-specific URIs
     */
    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_exists(id), "Token does not exist");
        return _uris[uint8(_tokenFoundation[id])];
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
     * @dev Get contract statistics
     */
    function getStats()
        external
        view
        returns (
            uint256 totalDonationsAmount,
            uint256 totalTokensMinted,
            uint256 nextTokenId,
            bool isPaused
        )
    {
        return (totalDonations, nextId - 1, nextId, paused());
    }

    /**
     * @dev Get contract version for upgrades
     */
    function version() external pure returns (string memory) {
        return "2.0.0";
    }

    /**
     * @dev Fallback receive function
     */
    receive() external payable {
        // Reject direct payments to prevent accidental loss of funds
        revert("Use donate() function");
    }
}
