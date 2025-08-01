// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SecurityConfig
 * @dev Centralized security configuration for all contracts
 */
contract SecurityConfig is Ownable, Pausable {
    // Security parameters
    struct SecurityParams {
        uint256 maxTransactionAmount;
        uint256 dailyWithdrawLimit;
        uint256 emergencyPauseDelay;
        bool requireMultiSigForCritical;
        address multiSigWallet;
    }

    SecurityParams public securityParams;

    // Emergency contacts
    mapping(address => bool) public emergencyResponders;

    // Security events
    event SecurityParamsUpdated(SecurityParams newParams);
    event EmergencyResponderUpdated(address responder, bool status);
    event SecurityAlert(string message, address indexed triggeredBy);

    constructor(address _multiSigWallet) {
        require(_multiSigWallet != address(0), "Invalid multisig address");

        securityParams = SecurityParams({
            maxTransactionAmount: 100 ether,
            dailyWithdrawLimit: 1000 ether,
            emergencyPauseDelay: 24 hours,
            requireMultiSigForCritical: true,
            multiSigWallet: _multiSigWallet
        });

        emergencyResponders[msg.sender] = true;
        emergencyResponders[_multiSigWallet] = true;
    }

    function updateSecurityParams(
        SecurityParams calldata _newParams
    ) external onlyOwner whenNotPaused {
        require(_newParams.multiSigWallet != address(0), "Invalid multisig");
        securityParams = _newParams;
        emit SecurityParamsUpdated(_newParams);
    }

    function setEmergencyResponder(
        address _responder,
        bool _status
    ) external onlyOwner {
        emergencyResponders[_responder] = _status;
        emit EmergencyResponderUpdated(_responder, _status);
    }

    function triggerSecurityAlert(
        string calldata _message
    ) external whenNotPaused {
        require(emergencyResponders[msg.sender], "Not authorized");
        emit SecurityAlert(_message, msg.sender);
    }

    /**
     * @dev Pause the contract - only owner
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract - only owner
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
