// frontend/main.js
import { ethers } from 'ethers';
import contracts from './src/contracts.json';

console.log('%c[Eco-Donations] Ethers v' + ethers.version, 'color:green;');
console.log('[main] Loaded contracts:', contracts);

/* ───────── CONFIG ───────── */
const RPC_URL                 = 'http://localhost:8545';
const ecoCoinAddress          = contracts.ecoCoin;
const donationAddress         = contracts.donationContract;
const chainIdExpected         = contracts.chainId.toString();

/* ───────── PROVIDERS ───────── */
let browserProvider, signer;                       // MetaMask (writes)
const rpcProvider = new ethers.JsonRpcProvider(RPC_URL); // read-only

/* ───────── ABIs ───────── */
const ecoCoinAbi = ['function balanceOf(address) view returns (uint256)'];
const donationAbi = [
  'function donate(uint8,string) payable',
  'event DonationMade(uint8 indexed foundation,address indexed sender,uint256 amount,string message)',
  'event TokenBalanceUpdated(address indexed donor,uint256 balance)'
];

/* ───────── HELPERS ───────── */
const clip = a => a.slice(0, 6) + '...' + a.slice(-4);
let ecoWrite, donateWrite;

/* Byte-code sanity check */
async function ensureContract(addr, provider) {
  if (await provider.getCode(addr) === '0x') {
    alert(
      '⚠️  Contract not found on this chain.\n\n' +
      'Run:\n  npx hardhat node\n  npx hardhat run scripts/deploy.js --network localhost\n' +
      'then refresh.'
    );
    throw new Error('No byte-code at ' + addr);
  }
}

/* ───────── CONNECT WALLET ───────── */
async function connectWallet() {
  if (!window.ethereum) { alert('MetaMask not detected'); return; }
  if (window.ethereum.networkVersion !== chainIdExpected) {
    alert('Switch MetaMask to Localhost 31337 and retry.'); return;
  }

  browserProvider = new ethers.BrowserProvider(window.ethereum);
  await browserProvider.send('eth_requestAccounts', []);
  signer       = await browserProvider.getSigner();

  await ensureContract(donationAddress, rpcProvider);

  donateWrite  = new ethers.Contract(donationAddress, donationAbi, signer);
  ecoWrite     = new ethers.Contract(ecoCoinAddress,  ecoCoinAbi,  signer);

  donateWrite.on('TokenBalanceUpdated', (donor, bal) => {
    signer.getAddress().then(a => {
      if (a.toLowerCase() === donor.toLowerCase())
        document.getElementById('walletBalance').textContent =
          ethers.formatEther(bal) + ' ECO';
    });
  });

  const addr = await signer.getAddress();
  document.getElementById('connectButton').textContent  = clip(addr);
  document.getElementById('connectButton').classList.add('connected');
  document.getElementById('walletAddress').textContent  = clip(addr);

  await updateBalance();
}

/* ───────── BALANCE ───────── */
async function updateBalance() {
  if (!signer) return;
  const bal = await ecoWrite.balanceOf(await signer.getAddress());
  document.getElementById('walletBalance').textContent =
    ethers.formatEther(bal) + ' ECO';
}

/* ───────── DONATE ───────── */
async function sendDonation(ev) {
  ev.preventDefault();
  if (!donateWrite) { alert('Connect wallet first'); return false; }

  const f   = +document.getElementById('foundation').value;
  const msg = document.getElementById('message').value;
  const val = document.getElementById('amount').value;
  if (!val || Number(val) <= 0) { alert('Enter a valid amount'); return false; }

  const tx = await donateWrite.donate(f, msg, { value: ethers.parseEther(val) });
  document.getElementById('txStatus').textContent = 'Waiting for confirmation…';
  await tx.wait();
  document.getElementById('txStatus').textContent = '✅ Donation confirmed!';
  await updateBalance();

  /* 3-D coin spinner & thanks */
  const box = document.getElementById('badgeContainer');
  box.innerHTML = `
    <p style="font-weight:600;color:#2e7d32">
      🎉 Thank you for your donation! 🎉
    </p>
    <div class="eco-coin">
      <div class="oval"><div class="inner-oval front">
        <span class="coin-icon">🍃</span>
        <span class="coin-label">ECO&nbsp;COIN</span>
      </div></div>
      <div class="coin__edge"></div>
      <div class="oval-back"><div class="inner-oval back">
        <span class="coin-icon-back">🍃</span>
      </div></div>
    </div>`;

  const edge = box.querySelector('.coin__edge');
  if (edge) {
    const n = +getComputedStyle(edge.parentElement).getPropertyValue('--edge');
    edge.innerHTML = Array.from({ length: n }, (_, i) => `<div style="--i:${i}"></div>`).join('');
  }
  return false;
}

/* ───────── HISTORY ───────── */
async function loadHistory() {
  await ensureContract(donationAddress, rpcProvider);

  const read = new ethers.Contract(donationAddress, donationAbi, rpcProvider);
  const names = ['Save The Oceans','Protect The Rainforest','Protect The Sequoias','Clean Energy'];

  const totals = document.getElementById('totals');
  const top    = document.getElementById('topDonors');
  const mineTB = document.querySelector('#personalTable tbody');
  const allTB  = document.querySelector('#donationTable tbody');
  if (!totals || !top || !allTB) return;

  totals.innerHTML = ''; top.innerHTML=''; if (mineTB) mineTB.innerHTML=''; allTB.innerHTML='';

  /* fetch events → derive everything */
  const evs  = await read.queryFilter(read.filters.DonationMade(), 0n, 'latest');
  console.log('[loadHistory] events:', evs.length);

  const sums        = {};                     // per-donor
  const foundationT = [0n,0n,0n,0n];          // per-foundation totals
  const me = signer ? (await signer.getAddress()).toLowerCase() : null;

  evs.forEach(e => {
    const { foundation, sender, amount, message } = e.args;
    foundationT[foundation] += amount;
    sums[sender]            = (sums[sender] || 0n) + amount;

    allTB.insertAdjacentHTML('beforeend', `
      <tr><td>${names[foundation]}</td><td>${sender}</td>
          <td>${ethers.formatEther(amount)}</td><td>${message}</td></tr>`);

    if (me && sender.toLowerCase() === me && mineTB) {
      mineTB.insertAdjacentHTML('beforeend', `
        <tr><td>${names[foundation]}</td>
            <td>${ethers.formatEther(amount)}</td><td>${message}</td></tr>`);
    }
  });

  /* render totals */
  foundationT.forEach((wei, i) => {
    totals.insertAdjacentHTML('beforeend',
      `<li>${names[i]}: ${ethers.formatEther(wei)} ETH</li>`);
  });

  /* render top 5 donors */
  Object.entries(sums)
    .sort(([,a],[,b]) => b > a ? 1 : -1)
    .slice(0,5)
    .forEach(([addr, tot]) => {
      top.insertAdjacentHTML('beforeend',
        `<li>${clip(addr)}: ${ethers.formatEther(tot)} ETH</li>`);
    });
}

/* ───────── EXPORT TO WINDOW ───────── */
window.connectWallet = connectWallet;
window.sendDonation  = sendDonation;
window.loadHistory   = loadHistory;