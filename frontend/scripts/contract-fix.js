// Contract Fix - Handles contract interaction improvements
(function() {
    'use strict';

    // Fix for MetaMask connection issues
    function fixMetaMaskConnection() {
        if (typeof window.ethereum !== 'undefined') {
            // Handle chain changed
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('Chain changed to:', chainId);
                window.location.reload();
            });

            // Handle accounts changed
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('Accounts changed:', accounts);
                if (accounts.length === 0) {
                    console.log('MetaMask is locked or the user has not connected any accounts');
                } else {
                    console.log('Connected account:', accounts[0]);
                }
            });
        }
    }

    // Contract interaction error handling
    function handleContractErrors(error) {
        console.error('Contract interaction error:', error);

        if (error.code === 4001) {
            console.log('User rejected the transaction');
            return 'Transaction was rejected by user';
        } else if (error.code === -32603) {
            console.log('Internal JSON-RPC error');
            return 'Internal error occurred';
        } else {
            return 'Unknown error occurred';
        }
    }

    // Expose functions globally
    window.ContractFix = {
        fixMetaMaskConnection,
        handleContractErrors
    };

    // Auto-initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixMetaMaskConnection);
    } else {
        fixMetaMaskConnection();
    }
})();
