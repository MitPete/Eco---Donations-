// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IEcoCoin
 * @dev Interface for the EcoCoin token contract
 */
interface IEcoCoin is IERC20 {
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TransferRestrictionUpdated(bool restricted);

    // Core functions
    function mint(address to, uint256 amount, string calldata reason) external;

    function burn(uint256 amount, string calldata reason) external;

    function burnFrom(
        address from,
        uint256 amount,
        string calldata reason
    ) external;

    // Access control
    function addMinter(address minter) external;

    function removeMinter(address minter) external;

    function isMinter(address account) external view returns (bool);

    // Transfer restrictions
    function setTransferRestriction(bool restricted) external;

    function isTransferRestricted() external view returns (bool);

    // Token information
    function getTokenDetails()
        external
        view
        returns (
            string memory name,
            string memory symbol,
            uint8 decimals,
            uint256 totalSupply,
            uint256 maxSupply
        );

    // Governance
    function getVotingPower(address account) external view returns (uint256);

    function delegate(address delegatee) external;

    function getCurrentVotes(address account) external view returns (uint256);

    function getPriorVotes(
        address account,
        uint256 blockNumber
    ) external view returns (uint256);
}
