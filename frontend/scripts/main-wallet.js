// Main Wallet Integration Script
(function() {
    'use strict';

    let walletConnected = false;
    let userAccount = null;
    let provider = null;
    let signer = null;

    // Initialize wallet connection
    async function initWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                provider = new ethers.providers.Web3Provider(window.ethereum);

                // Check if already connected
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    userAccount = accounts[0];
                    signer = provider.getSigner();
                    walletConnected = true;
                    updateUI();
                }
            } catch (error) {
                console.error('Error initializing wallet:', error);
            }
        }
    }

    // Connect wallet
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                if (accounts.length > 0) {
                    userAccount = accounts[0];
                    provider = new ethers.providers.Web3Provider(window.ethereum);
                    signer = provider.getSigner();
                    walletConnected = true;
                    updateUI();
                    console.log('Wallet connected:', userAccount);
                }
            } catch (error) {
                console.error('Error connecting wallet:', error);
                if (window.ContractFix) {
                    const errorMessage = window.ContractFix.handleContractErrors(error);
                    alert(errorMessage);
                }
            }
        } else {
            alert('MetaMask is not installed. Please install MetaMask to use this dApp.');
        }
    }

    // Disconnect wallet
    function disconnectWallet() {
        walletConnected = false;
        userAccount = null;
        provider = null;
        signer = null;
        updateUI();
        console.log('Wallet disconnected');
    }

    // Update UI based on wallet connection status
    function updateUI() {
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const userAddress = document.getElementById('userAddress');

        if (connectBtn) {
            if (walletConnected) {
                connectBtn.textContent = 'Disconnect Wallet';
                connectBtn.onclick = disconnectWallet;
            } else {
                connectBtn.textContent = 'Connect Wallet';
                connectBtn.onclick = connectWallet;
            }
        }

        if (walletInfo && userAddress) {
            if (walletConnected) {
                walletInfo.style.display = 'block';
                userAddress.textContent = `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
            } else {
                walletInfo.style.display = 'none';
            }
        }

        // Update other UI elements that depend on wallet connection
        const donateButtons = document.querySelectorAll('.donate-btn, .quick-donate-btn');
        donateButtons.forEach(btn => {
            if (walletConnected) {
                btn.disabled = false;
                btn.textContent = btn.dataset.originalText || btn.textContent;
            } else {
                btn.disabled = true;
                if (!btn.dataset.originalText) {
                    btn.dataset.originalText = btn.textContent;
                }
                btn.textContent = 'Connect Wallet First';
            }
        });
    }

    // Get current wallet state
    function getWalletState() {
        return {
            connected: walletConnected,
            account: userAccount,
            provider: provider,
            signer: signer
        };
    }

    // Expose functions globally
    window.MainWallet = {
        initWallet,
        connectWallet,
        disconnectWallet,
        getWalletState,
        updateUI
    };

    // Auto-initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWallet);
    } else {
        initWallet();
    }

    // Add event listeners for wallet buttons
    document.addEventListener('DOMContentLoaded', function() {
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', function() {
                if (walletConnected) {
                    disconnectWallet();
                } else {
                    connectWallet();
                }
            });
        }
    });
})();
