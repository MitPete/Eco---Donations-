// frontend/src/main.js

import { ethers } from 'ethers';
import contracts from './contracts.json';

console.log('%c[Eco-Donations] Ethers v' + ethers.version, 'color:green;');
console.log('[main] Loaded contracts:', contracts);

// ───────── CONFIG (from your deploy script) ─────────
const donationContractAddress = contracts.donationContract;
const ecoCoinAddress          = contracts.ecoCoin;

// ───────── ABIs ─────────
const ecoCoinAbi = [
  'function balanceOf(address) view returns (uint256)'
];

const donationAbi = [
  'function donate(uint8,string) payable',
  'function foundationDonations(uint8) view returns (uint256)',
  'event DonationMade(uint8 indexed foundation,address indexed sender,uint256 amount,string message)',
  'event TokenBalanceUpdated(address indexed donor,uint256 balance)'
];

// ───────── helper to decode logs ─────────
const I              = new ethers.Interface(donationAbi);
const DONATION_TOPIC = I.getEvent('DonationMade').topicHash;

// ───────── STATE ─────────
let provider, signer, donationContract, ecoCoinContract;
const clip = a => a.slice(0, 6) + '...' + a.slice(-4);

// ───────── Update ECO balance in header ─────────
async function updateBalance() {
  if (!signer) return;
  if (!ecoCoinContract) {
    ecoCoinContract = new ethers.Contract(ecoCoinAddress, ecoCoinAbi, provider);
  }
  const addr = await signer.getAddress();
  let bal;
  try {
    bal = await ecoCoinContract.balanceOf(addr);
  } catch (err) {
    console.warn('[updateBalance] balanceOf failed →', err);
    bal = 0n;
  }
  document.getElementById('walletAddress').textContent = clip(addr);
  document.getElementById('walletBalance').textContent = ethers.formatEther(bal) + ' ECO';
}

// ───────── Auto-detect wallet on page load ─────────
if (window.ethereum) {
  provider = new ethers.BrowserProvider(window.ethereum);
  provider.send('eth_accounts', []).then(async accts => {
    if (accts.length) {
      signer = await provider.getSigner();
      donationContract = new ethers.Contract(donationContractAddress, donationAbi, signer);
      const btn = document.getElementById('connectButton');
      if (btn) {
        btn.textContent = 'Wallet Connected';
        btn.classList.add('connected');
      }
      updateBalance();
    }
  }).catch(console.error);
}

// ───────── connectWallet (called by your “Connect Wallet” button) ─────────
async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask not detected');
    return;
  }
  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer   = await provider.getSigner();
  donationContract = new ethers.Contract(donationContractAddress, donationAbi, signer);

  const btn = document.getElementById('connectButton');
  if (btn) {
    btn.textContent = 'Wallet Connected';
    btn.classList.add('connected');
  }

  // Listen for on-chain token‐mint events
  donationContract.on('TokenBalanceUpdated', (donor, bal) => {
    signer.getAddress().then(a => {
      if (a.toLowerCase() === donor.toLowerCase()) {
        document.getElementById('walletBalance').textContent =
          ethers.formatEther(bal) + ' ECO';
      }
    });
  });

  updateBalance();
  console.log('[connectWallet] ready');
}

// ───────── sendDonation (called by your form’s onsubmit) ─────────
async function sendDonation(ev) {
  ev?.preventDefault();
  if (!donationContract) {
    alert('Connect wallet first');
    return false;
  }

  const f   = document.getElementById('foundation').value;
  const msg = document.getElementById('message').value;
  const val = document.getElementById('amount').value;
  if (!val || Number(val) <= 0) {
    alert('Enter a valid amount');
    return false;
  }

  console.log('[sendDonation] →', val, 'ETH, foundation', f);
  const tx = await donationContract.donate(f, msg, {
    value: ethers.parseEther(val)
  });
  console.log('[sendDonation] tx', tx.hash);
  document.getElementById('txStatus').textContent = 'Waiting for confirmation…';
  await tx.wait();
  console.log('[sendDonation] confirmed', tx.hash);
  document.getElementById('txStatus').textContent = '✅ Donation confirmed!';
  updateBalance();

  // If you’re on history.html, re-load immediately
  if (document.getElementById('donationTable')) {
    loadHistory();
  }
  return false;
}

// ───────── loadHistory (called on history.html onload) ─────────
async function loadHistory() {
  const tableBody = document.querySelector('#donationTable tbody');
  if (!tableBody) return;  // only on history.html

  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  const contract = new ethers.Contract(donationContractAddress, donationAbi, provider);

  const names      = ['Save The Oceans','Protect The Rainforest','Protect The Sequoias','Clean Energy'];
  const totalsUL   = document.getElementById('totals');
  const topUL      = document.getElementById('topDonors');
  const personalTB = document.querySelector('#personalTable tbody');

  // clear existing
  [totalsUL, topUL, personalTB, tableBody].forEach(el => el && (el.innerHTML = ''));

  // 1) foundation totals
  for (let i=0; i<names.length; i++) {
    const wei = await contract.foundationDonations(i);
    const li  = document.createElement('li');
    li.textContent = `${names[i]}: ${ethers.formatEther(wei)} ETH`;
    totalsUL.appendChild(li);
  }

  // 2) grab raw logs, decode
  const logs = await provider.getLogs({
    address:   donationContractAddress,
    fromBlock: 0,
    toBlock:   'latest',
    topics:    [ DONATION_TOPIC ]
  });
  console.log('[loadHistory] raw logs found:', logs.length);

  const me = (await provider.send('eth_accounts', []))[0]?.toLowerCase() ?? null;
  const sums = {};

  logs.forEach(log => {
    let d;
    try {
      d = I.parseLog(log);
    } catch (err) {
      console.warn('[loadHistory] skipped log →', err.message);
      return;
    }
    const { foundation, sender, amount, message } = d.args;
    const idx   = Number(foundation);
    const donor = sender.toLowerCase();
    sums[donor] = (sums[donor] || 0n) + amount;

    const mkRow = cells => {
      const tr = document.createElement('tr');
      cells.forEach(t => {
        const td = document.createElement('td');
        td.textContent = t;
        tr.appendChild(td);
      });
      return tr;
    };

    // append to "All Donations"
    tableBody.appendChild(mkRow([
      names[idx],
      sender,
      ethers.formatEther(amount),
      message
    ]));

    // and to your personal table
    if (donor === me && personalTB) {
      personalTB.appendChild(mkRow([
        names[idx],
        ethers.formatEther(amount),
        message
      ]));
    }
  });

  // 3) top donors
  Object.entries(sums)
    .sort(([,a],[,b]) => (b > a ? 1 : -1))
    .slice(0,5)
    .forEach(([addr, tot]) => {
      const li = document.createElement('li');
      li.textContent = `${clip(addr)}: ${ethers.formatEther(tot)} ETH`;
      topUL.appendChild(li);
    });
}

// ───────── expose to your HTML buttons/forms ─────────
window.connectWallet = connectWallet;
window.sendDonation  = sendDonation;
window.loadHistory   = loadHistory;
