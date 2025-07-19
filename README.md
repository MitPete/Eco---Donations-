# Eco Donations Platform

Eco Donations is a full-stack decentralized application (dApp) for making Ethereum-based donations to environmental foundations. Donors are rewarded with ECO tokens, and all activity is tracked transparently on-chain.

## Project Architecture

- **Smart Contracts (Solidity, Hardhat):**
  - `EcoCoin.sol`: ERC20 token contract for ECO Coin. Only the owner (DonationContract) can mint new tokens. Maximum supply is set at deployment.
  - `Donation.sol`: Manages donations to predefined foundations, records donor history, and mints ECO tokens as rewards. Ether is transferred securely using the `call` pattern.
- **Frontend (HTML, CSS, JS):**
  - Modern, unified UI for donation, history, dashboard, and foundation pages.
  - Connects to Ethereum via MetaMask and local ethers.js (CSP-compliant).
  - Displays donation forms, history, stats, badges, and partner foundations.
- **Deployment Scripts:**
  - Hardhat scripts for deploying contracts and transferring ownership.
- **Testing:**
  - Automated tests for smart contracts using Hardhat and Mocha/Chai.

## Features

- Donate ETH to featured environmental foundations.
- Earn ECO tokens for every donation (10 ECO per ETH).
- View donation history and impact.
- Dashboard for ECO balance, badges, and stats.
- Discover and support partner foundations.
- Secure, transparent blockchain transactions.
- Unified, modern frontend with responsive design and cross-browser support.

## Tech Stack

- **Smart Contracts:** Solidity, Hardhat
- **Frontend:** HTML, CSS (`frontend/styles.css`), JavaScript (modules, ethers.js)
- **Server:** Static file server (Python HTTP server recommended for local dev)

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/MitPete/Eco---Donations-
cd Eco---Donations-
npm install
```

### 2. Run Local Frontend Server

```bash
cd frontend
python3 -m http.server 8000
```

Visit [http://localhost:8000/index.html](http://localhost:8000/index.html) in your browser.

### 3. Deploy Smart Contracts

```bash
npx hardhat run scripts/deploy.js --network <network>
```

This deploys EcoCoin and DonationContract, and sets up ownership for minting.

### 4. Run Tests

```bash
npx hardhat test
```

### 5. Use the dApp

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
- `artifacts/` — Compiled contract artifacts
- `cache/` — Hardhat build cache

## Contributing

Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

## License

MIT

---

For more details, see the architecture and cleanup reports in `frontend/ARCHITECTURE.md` and `frontend/CLEANUP_REPORT.md`.
