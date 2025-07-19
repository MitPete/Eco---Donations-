# Eco Donations Platform

Eco Donations is a full-stack dApp for making Ethereum-based donations to environmental foundations, rewarding donors with ECO tokens, and tracking impact transparently on-chain.

## Features

- **Unified, Modern Frontend**: Professional UI with a single CSS file for all pages, fully responsive and cross-browser compatible (Chrome, Safari, etc).
- **Donation System**: Donate ETH to featured foundations and earn ECO tokens.
- **Partner Foundations**: Discover and support ocean, rainforest, sequoia, and clean energy projects.
- **Dashboard**: View your ECO balance, donation stats, and badges.
- **Donation History**: Track your past donations and impact.
- **Smart Contracts**: Secure, audited Solidity contracts for ERC20 ECO token and donation logic.
- **MetaMask Integration**: Connect your wallet, send transactions, and view balances.
- **Local Ethers.js**: CSP-compliant, no external dependencies for blockchain interactions.

## Tech Stack

- **Frontend**: HTML, CSS (`frontend/styles.css`), JavaScript (modules, ethers.js)
- **Smart Contracts**: Solidity, Hardhat
- **Backend/Server**: Static file server (Python HTTP server recommended for local dev)

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/MitPete/Eco---Donations-
cd Eco---Donations-
npm install
```

### 2. Run Local Server

```bash
cd frontend
python3 -m http.server 8000
```

Visit [http://localhost:8000/index.html](http://localhost:8000/index.html) in your browser.

### 3. Deploy Contracts (Optional)

```bash
npx hardhat run scripts/deploy.js --network <network>
```

### 4. Use the dApp

- Connect your wallet (MetaMask recommended)
- Make donations, earn ECO tokens, and view your history and stats

## File Structure

- `frontend/` — All frontend code and assets
  - `index.html`, `donate.html`, `history.html`, `dashboard.html`, `foundation.html`
  - `styles.css` — Unified, modern CSS
  - `main.js`, `ethers.umd.min.js` — App logic and blockchain integration
- `contracts/` — Solidity smart contracts
  - `EcoCoin.sol`, `Donation.sol`
- `scripts/` — Deployment scripts
- `test/` — Contract tests

## Contributing

Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

## License

MIT

---

For more details, see the architecture and cleanup reports in `frontend/ARCHITECTURE.md` and `frontend/CLEANUP_REPORT.md`.
