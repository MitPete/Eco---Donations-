// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./EcoCoin.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DonationContract is ERC721URIStorage {
    enum Foundation {
        SaveTheOceans,
        ProtectTheRainforest,
        ProtectTheSequoias,
        CleanEnergy
    }

    EcoCoin public eco;
    address public owner;
    mapping(Foundation => address) public foundationAddresses;
    mapping(uint256 => Foundation) private _tokenFoundation;
    string[4] private _uris; // one URI per foundation
    uint256 public nextId = 1;

    event DonationMade(Foundation f, address sender, uint amount, string msg_);
    event TokenBalanceUpdated(address donor, uint256 bal);

    constructor(
        address ecoAddr,
        address oceansAddr,
        address rainAddr,
        address sequoiasAddr,
        address energyAddr
    ) ERC721("Eco Donation Badge", "ECO-BADGE") {
        owner = msg.sender;
        eco = EcoCoin(ecoAddr);

        foundationAddresses[Foundation.SaveTheOceans] = oceansAddr;
        foundationAddresses[Foundation.ProtectTheRainforest] = rainAddr;
        foundationAddresses[Foundation.ProtectTheSequoias] = sequoiasAddr;
        foundationAddresses[Foundation.CleanEnergy] = energyAddr;

        // for now EVERY foundation returns the Oceans badge
        _uris[0] = "/badges/oceans.json";
        _uris[1] = "/badges/oceans.json";
        _uris[2] = "/badges/oceans.json";
        _uris[3] = "/badges/oceans.json";
    }

    function donate(Foundation f, string calldata message) external payable {
        require(msg.value > 0, "Send ETH");
        eco.mintTokens(msg.sender, msg.value * 10);
        emit TokenBalanceUpdated(msg.sender, eco.balanceOf(msg.sender));

        (bool ok, ) = payable(foundationAddresses[f]).call{value: msg.value}(
            ""
        );
        require(ok, "Transfer failed");

        uint256 id = nextId++;
        _safeMint(msg.sender, id);
        _tokenFoundation[id] = f;

        emit DonationMade(f, msg.sender, msg.value, message);
    }

    // Special donation function for auto-donations (accepts donor address)
    function donateOnBehalf(
        Foundation f,
        string calldata message,
        address donor
    ) external payable {
        require(msg.value > 0, "Send ETH");
        require(donor != address(0), "Invalid donor address");

        eco.mintTokens(donor, msg.value * 10);
        emit TokenBalanceUpdated(donor, eco.balanceOf(donor));

        (bool ok, ) = payable(foundationAddresses[f]).call{value: msg.value}(
            ""
        );
        require(ok, "Transfer failed");

        uint256 id = nextId++;
        _safeMint(donor, id);
        _tokenFoundation[id] = f;

        emit DonationMade(f, donor, msg.value, message);
    }

    // every tokenId returns URI based on its foundation
    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_exists(id), "no token");
        return _uris[uint8(_tokenFoundation[id])];
    }

    receive() external payable {}
}
