// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EcoCoin is ERC20 {
    address payable public owner;
    uint256 public maxSupply;
    uint256 public totalMintedSupply;

    constructor(uint256 _maxSupply) ERC20("ECO Coin", "ECO") {
        owner = payable(msg.sender);
        maxSupply = _maxSupply;
    }

    function mintTokens(address account, uint256 amount) external {
    require(msg.sender == owner, "Only the owner can mint tokens");
    require(totalSupply() + amount <= maxSupply, "Total supply cannot exceed maximum supply");
    _mint(account, amount);
    emit Transfer(address(0), account, amount);
}

    function withdraw() public {
        require(msg.sender == owner, "Only contract owner can withdraw funds");
        uint256 balance = address(this).balance;
        owner.transfer(balance);
    }

    function _mint(address account, uint256 amount) internal virtual override {
        require(totalMintedSupply + amount <= maxSupply, "Total supply cannot exceed maximum supply");
        super._mint(account, amount);
        totalMintedSupply += amount;
    }

    function getTotalMintedSupply() public view returns (uint256) {
    return totalMintedSupply;
}
}
