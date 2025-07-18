// frontend/main.js
// Load ethers from CDN
const ethers = window.ethers;

// Guard to check if ethers is loaded
if (!ethers) {
  console.error('Ethers library not loaded. Please ensure the CDN script is loaded before this script.');
}

// Load contracts configuration
let contracts;

async function loadContracts() {
  try {
    const response = await fetch('./contracts.json?v=' + Date.now());
    contracts = await response.json();
    console.log('Loaded contracts from contracts.json:', contracts);
  } catch (error) {
    console.error('Failed to load contracts:', error);
    contracts = {
      ecoCoin: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      donationContract: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      chainId: 31337
    };
    console.log('Using fallback contracts:', contracts);
  }
}

// Initialize variables
let browserProvider, signer;
let RPC_URL, ecoCoinAddress, donationAddress, chainIdExpected;
let rpcProvider;
let ecoWrite, donateWrite;
let foundationChartInstance = null;

// Initialize the application
async function initializeApp() {
  await loadContracts();

  console.log('%c[Eco-Donations] Ethers v' + ethers.version, 'color:green;');
  console.log('[main] Loaded contracts:', contracts);

  /* ───────── CONFIG ───────── */
  // Support both local and testnet
  const isLocal = contracts.chainId === 31337;
  RPC_URL = isLocal ? 'http://localhost:8545' : 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
  ecoCoinAddress = contracts.ecoCoin;
  donationAddress = contracts.donationContract;
  chainIdExpected = contracts.chainId.toString();

  /* ───────── PROVIDERS ───────── */
  rpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL); // read-only
}

/* ───────── ABIs ───────── */
const ecoCoinAbi = ['function balanceOf(address) view returns (uint256)'];
const donationAbi = [
  'function donate(uint8,string) payable',
  'event DonationMade(uint8 f,address sender,uint amount,string msg_)',
  'event TokenBalanceUpdated(address donor,uint256 balance)'
];

/* ───────── HELPERS ───────── */
const names = ['Save The Oceans', 'Protect The Rainforest', 'Protect The Sequoias', 'Clean Energy'];

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
  if (!window.ethereum) {
    alert('MetaMask not detected. Please install MetaMask extension.');
    return;
  }

  try {
    // Get current network
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    const currentChainIdDecimal = parseInt(currentChainId, 16);

    console.log('Current Chain ID:', currentChainIdDecimal);
    console.log('Expected Chain ID:', chainIdExpected);

    // Check if we're on the correct network
    if (currentChainIdDecimal.toString() !== chainIdExpected) {
      const isLocal = contracts.chainId === 31337;
      const networkName = isLocal ? 'Hardhat Local (31337)' : 'Sepolia Testnet (11155111)';

      if (isLocal) {
        alert(`Please switch MetaMask to ${networkName}.\n\nNetwork Details:\n- RPC URL: http://127.0.0.1:8545\n- Chain ID: 31337\n- Currency: ETH`);
      } else {
        alert(`Please switch MetaMask to ${networkName}.`);
      }
      return;
    }

    browserProvider = new ethers.providers.Web3Provider(window.ethereum);
    await browserProvider.send('eth_requestAccounts', []);
    signer = await browserProvider.getSigner();

    await ensureContract(donationAddress, rpcProvider);

    donateWrite = new ethers.Contract(donationAddress, donationAbi, signer);
    ecoWrite = new ethers.Contract(ecoCoinAddress, ecoCoinAbi, signer);

    donateWrite.on('TokenBalanceUpdated', (donor, bal) => {
      signer.getAddress().then(a => {
        if (a.toLowerCase() === donor.toLowerCase())
          document.getElementById('walletBalance').textContent =
            ethers.utils.formatEther(bal) + ' ECO';
      });
    });

    const addr = await signer.getAddress();
    localStorage.setItem('walletAddress', addr);

    document.getElementById('connectButton').textContent = clip(addr);
    document.getElementById('connectButton').classList.add('connected');
    document.getElementById('walletAddress').textContent = clip(addr);

    await updateBalance();

    // Reload history if we're on the history page
    if (window.location.pathname.includes('history')) {
      await loadHistory();
    }

    // Load dashboard data if on the dashboard page
    if (window.location.pathname.includes('dashboard')) {
      await loadDashboard();
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    alert('Failed to connect wallet. Please try again.');
  }
}

/* ───────── PERSIST WALLET CONNECTION ───────── */
async function reconnectWallet() {
  const savedAddress = localStorage.getItem('walletAddress');
  console.log('[reconnectWallet] Saved address:', savedAddress);

  if (savedAddress && window.ethereum) {
    try {
      browserProvider = new ethers.providers.Web3Provider(window.ethereum);
      signer = await browserProvider.getSigner();

      const addr = await signer.getAddress();
      console.log('[reconnectWallet] Retrieved address:', addr);      if (addr.toLowerCase() === savedAddress.toLowerCase()) {
        // Ensure contracts are deployed before initializing
        await ensureContract(donationAddress, browserProvider);

        // Initialize contract instances
        donateWrite = new ethers.Contract(donationAddress, donationAbi, signer);
        ecoWrite = new ethers.Contract(ecoCoinAddress, ecoCoinAbi, signer);

        // Set up event listener for token balance updates
        donateWrite.on('TokenBalanceUpdated', (donor, bal) => {
          signer.getAddress().then(a => {
            if (a.toLowerCase() === donor.toLowerCase())
              document.getElementById('walletBalance').textContent =
                ethers.utils.formatEther(bal) + ' ECO';
          });
        });

        // Update UI
        document.getElementById('connectButton').textContent = clip(addr);
        document.getElementById('connectButton').classList.add('connected');
        document.getElementById('walletAddress').textContent = clip(addr);

        await updateBalance();
        console.log('[reconnectWallet] Wallet reconnected successfully:', addr);
      } else {
        console.warn('[reconnectWallet] Address mismatch. Clearing saved address.');
        localStorage.removeItem('walletAddress');
      }
    } catch (error) {
      console.error('[reconnectWallet] Error reconnecting wallet:', error);
    }
  } else {
    console.warn('[reconnectWallet] No saved address or Ethereum provider detected.');
  }
}

window.addEventListener('load', reconnectWallet);

/* ───────── BALANCE ───────── */
async function updateBalance() {
  if (!signer) return;
  const bal = await ecoWrite.balanceOf(await signer.getAddress());
  document.getElementById('walletBalance').textContent =
    ethers.utils.formatEther(bal) + ' ECO';
}

/* ───────── DONATE ───────── */
async function sendDonation(ev) {
  ev.preventDefault();
  if (!donateWrite) { alert('Connect wallet first'); return false; }

  const f   = +document.getElementById('foundation').value;
  const msg = document.getElementById('message').value;
  const val = document.getElementById('amount').value;
  if (!val || Number(val) <= 0) { alert('Enter a valid amount'); return false; }

  const tx = await donateWrite.donate(f, msg, { value: ethers.utils.parseEther(val) });
  document.getElementById('txStatus').textContent = 'Waiting for confirmation…';
  await tx.wait();
  document.getElementById('txStatus').textContent = '✅ Donation confirmed!';
  await updateBalance();

  // Calculate ECO coins received
  const ecoCoins = (Number(val) * 10).toFixed(2);

  // Show modal with donation details
  const modal = document.getElementById('donationModal');
  const modalMessage = document.getElementById('modalMessage');
  modalMessage.innerHTML = `Thank you for donating to <strong>${names[f]}</strong>!<br>
    You have received <strong>${ecoCoins} ECO Coins</strong> for your contribution.`;
  modal.style.display = 'flex';

  // Close modal function
  window.closeModal = function() {
    modal.style.display = 'none';
  };

  // Refresh history on all pages after donation
  if (window.location.pathname.includes('history')) {
    await loadHistory();
  }

  // Show link to history page after donation
  setTimeout(() => {
    const currentStatus = document.getElementById('txStatus');
    if (currentStatus && currentStatus.textContent.includes('confirmed')) {
      currentStatus.innerHTML = '✅ Donation confirmed! <a href="history.html" style="color: #2e7d32; text-decoration: underline;">View your impact →</a>';
    }
  }, 1000);

  /* Remove 3-D coin spinner & thanks */
  const box = document.getElementById('badgeContainer');
  box.innerHTML = '';
  return false;
}

/* ───────── HISTORY ───────── */
async function loadHistory() {
  // Ensure app is initialized first
  if (!contracts || !rpcProvider) {
    console.log('[loadHistory] Initializing app first...');
    await initializeApp();
  }

  await ensureContract(donationAddress, rpcProvider);

  const read = new ethers.Contract(donationAddress, donationAbi, rpcProvider);

  // Get all the elements
  const mineTB = document.querySelector('#personalTable tbody');
  const allTB = document.querySelector('#donationTable tbody');
  const walletPrompt = document.getElementById('walletPrompt');
  const personalTable = document.getElementById('personalTable');
  const foundationStats = document.getElementById('foundationStats');
  const topDonorsList = document.getElementById('topDonorsList');

  // Stats elements
  const totalDonationsValue = document.getElementById('totalDonationsValue');
  const yourImpactValue = document.getElementById('yourImpactValue');
  const ecoCoinsValue = document.getElementById('ecoCoinsValue');
  const rankValue = document.getElementById('rankValue');

  if (!allTB) return;

  // Clear existing content
  if (mineTB) mineTB.innerHTML = '';
  allTB.innerHTML = '';
  if (foundationStats) foundationStats.innerHTML = '';
  if (topDonorsList) topDonorsList.innerHTML = '';

  /* fetch events → derive everything */
  const evs = await read.queryFilter(read.filters.DonationMade(), 0);
  console.log('[loadHistory] events:', evs.length);

  const sums = {};                     // per-donor
  const foundationT = [ethers.BigNumber.from(0), ethers.BigNumber.from(0), ethers.BigNumber.from(0), ethers.BigNumber.from(0)]; // per-foundation totals
  let totalDonations = ethers.BigNumber.from(0);
  let userDonations = ethers.BigNumber.from(0);
  let userDonationCount = 0;

  // Get current user address if wallet is connected
  let me = null;
  if (signer) {
    try {
      me = (await signer.getAddress()).toLowerCase();
    } catch (error) {
      console.log('[loadHistory] Wallet not connected or error getting address:', error);
    }
  }

  // Show/hide wallet prompt and personal table
  if (walletPrompt && personalTable) {
    if (me) {
      walletPrompt.style.display = 'none';
      personalTable.style.display = 'table';
    } else {
      walletPrompt.style.display = 'block';
      personalTable.style.display = 'none';
    }
  }

  // Process events
  evs.forEach((e, index) => {
    if (!e.args) {
      console.warn('[loadHistory] Skipping event with undefined args:', e);
      return;
    }

    const { f, sender, amount, msg_ } = e.args;
    foundationT[f] = foundationT[f].add(amount);
    totalDonations = totalDonations.add(amount);
    sums[sender] = (sums[sender] || ethers.BigNumber.from(0)).add(amount);

    // Simulate date for display (in a real app, you'd get this from the block timestamp)
    const donationDate = new Date(Date.now() - (evs.length - index) * 24 * 60 * 60 * 1000);
    const formattedDate = donationDate.toLocaleDateString();

    // Add to all donations table
    allTB.insertAdjacentHTML('beforeend', `
      <tr>
        <td><a href="foundation.html?id=${f}" class="foundation-link">${names[f]}</a></td>
        <td>${clip(sender)}</td>
        <td><strong>${parseFloat(ethers.utils.formatEther(amount)).toFixed(3)} ETH</strong></td>
        <td>${msg_}</td>
        <td>${formattedDate}</td>
      </tr>
    `);

    // Add to personal donations if it's the user's donation
    if (me && sender.toLowerCase() === me && mineTB) {
      userDonations = userDonations.add(amount);
      userDonationCount++;
      mineTB.insertAdjacentHTML('beforeend', `
        <tr>
          <td><a href="foundation.html?id=${f}" class="foundation-link">${names[f]}</a></td>
          <td><strong>${parseFloat(ethers.utils.formatEther(amount)).toFixed(3)} ETH</strong></td>
          <td>${msg_}</td>
          <td>${formattedDate}</td>
        </tr>
      `);
    }
  });

  // Update stats
  if (totalDonationsValue) {
    totalDonationsValue.textContent = `${parseFloat(ethers.utils.formatEther(totalDonations)).toFixed(2)} ETH`;
  }

  if (yourImpactValue) {
    yourImpactValue.textContent = me ? `${parseFloat(ethers.utils.formatEther(userDonations)).toFixed(3)} ETH` : 'Connect Wallet';
  }

  if (ecoCoinsValue) {
    const ecoCoins = me ? parseFloat(ethers.utils.formatEther(userDonations)) * 10 : 0;
    ecoCoinsValue.textContent = me ? `${ecoCoins.toFixed(0)} ECO` : 'Connect Wallet';
  }

  // Calculate user rank
  if (rankValue && me) {
    const sortedDonors = Object.entries(sums).sort(([,a], [,b]) => b > a ? 1 : -1);
    const userRank = sortedDonors.findIndex(([addr]) => addr.toLowerCase() === me) + 1;
    rankValue.textContent = userRank > 0 ? `#${userRank}` : '#--';
  } else if (rankValue) {
    rankValue.textContent = 'Connect Wallet';
  }

  // Render foundation stats
  if (foundationStats) {
    const totalETH = parseFloat(ethers.utils.formatEther(totalDonations));
    foundationT.forEach((wei, i) => {
      const amount = parseFloat(ethers.utils.formatEther(wei));
      const percentage = totalETH > 0 ? ((amount / totalETH) * 100).toFixed(1) : 0;

      foundationStats.insertAdjacentHTML('beforeend', `
        <div class="foundation-stat">
          <div class="foundation-name">${names[i]}</div>
          <div class="foundation-amount">${amount.toFixed(2)} ETH</div>
          <div class="foundation-percentage">${percentage}% of total</div>
        </div>
      `);
    });
  }

  // Render top donors
  if (topDonorsList) {
    Object.entries(sums)
      .sort(([,a], [,b]) => b > a ? 1 : -1)
      .slice(0, 5)
      .forEach(([addr, tot], index) => {
        const isCurrentUser = me && addr.toLowerCase() === me;
        const displayAddr = isCurrentUser ? 'You' : clip(addr);
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

        topDonorsList.insertAdjacentHTML('beforeend', `
          <div class="donor-item ${isCurrentUser ? 'current-user' : ''}">
            <div class="donor-rank ${rankClass}">${index + 1}</div>
            <div class="donor-info">
              <div class="donor-address">${displayAddr}</div>
              <div class="donor-amount">${parseFloat(ethers.utils.formatEther(tot)).toFixed(3)} ETH</div>
            </div>
          </div>
        `);
      });
  }
}

/* ───────── DASHBOARD ───────── */
async function loadDashboard() {
  await ensureContract(donationAddress, rpcProvider);

  const read = new ethers.Contract(donationAddress, donationAbi, rpcProvider);

  const donationTable = document.querySelector('#donationTable tbody');
  const ecoBalance = document.getElementById('ecoBalance');
  const totalDonationsElem = document.getElementById('totalDonations');
  const topFoundationElem = document.getElementById('topFoundation');

  if (!donationTable || !ecoBalance || !totalDonationsElem || !topFoundationElem) return;

  donationTable.innerHTML = '';
  ecoBalance.textContent = 'Loading...';
  totalDonationsElem.textContent = '0';
  topFoundationElem.textContent = 'N/A';

  // Fetch donation events
  const evs = await read.queryFilter(read.filters.DonationMade(), 0);
  console.log('[loadDashboard] events:', evs.length);

  let totalDonations = ethers.BigNumber.from(0);
  const foundationTotals = [ethers.BigNumber.from(0), ethers.BigNumber.from(0), ethers.BigNumber.from(0), ethers.BigNumber.from(0)];

  evs.forEach(e => {
    if (!e.args) return;
    const { f, amount, msg_ } = e.args;
    foundationTotals[f] = foundationTotals[f].add(amount);
    totalDonations = totalDonations.add(amount);

    donationTable.insertAdjacentHTML('beforeend', `
      <tr><td>${names[f]}</td><td>${ethers.utils.formatEther(amount)}</td><td>${msg_}</td></tr>`);
    });

  // Update total donations and top foundation
  totalDonationsElem.textContent = ethers.utils.formatEther(totalDonations);
  const topFoundationIndex = foundationTotals.indexOf(Math.max(...foundationTotals));
  topFoundationElem.textContent = names[topFoundationIndex];

  // Update ECO coin balance
  if (signer) {
    const balance = await ecoWrite.balanceOf(await signer.getAddress());
    ecoBalance.textContent = `${ethers.utils.formatEther(balance)} ECO`;
  } else {
    ecoBalance.textContent = 'Connect your wallet to see your balance';
  }

  // Load and display donation trends chart
  const ctx = document.getElementById('donationChart').getContext('2d');
  const donationData = evs.map(e => ({
    date: new Date(e.blockNumber * 1000), // Simulated date for demo purposes
    amount: parseFloat(ethers.utils.formatEther(e.args.amount))
  }));

  const groupedData = donationData.reduce((acc, { date, amount }) => {
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[month] = (acc[month] || 0) + amount;
    return acc;
  }, {});

  const labels = Object.keys(groupedData);
  const data = Object.values(groupedData);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Monthly Donations (ETH)',
        data,
        backgroundColor: 'rgba(46, 125, 50, 0.7)',
        borderColor: 'rgba(46, 125, 50, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/* ───────── FOUNDATION PROFILE ───────── */
async function loadFoundationProfile() {
  console.log('[loadFoundationProfile] Function triggered');

  const urlParams = new URLSearchParams(window.location.search);
  const foundationId = parseInt(urlParams.get('id'), 10);
  if (isNaN(foundationId) || foundationId < 0 || foundationId > 3) {
    alert('Invalid foundation specified.');
    return;
  }

  await ensureContract(donationAddress, rpcProvider);

  const read = new ethers.Contract(donationAddress, donationAbi, rpcProvider);
  const missions = [
    {
      short: 'Protect marine life and clean our oceans for future generations.',
      detailed: `Save The Oceans is dedicated to preserving marine ecosystems and protecting the biodiversity of our oceans. Our mission encompasses removing plastic pollution, protecting endangered marine species, supporting sustainable fishing practices, and restoring coral reefs. We work with coastal communities worldwide to implement conservation programs that ensure healthy oceans for generations to come.

Key Focus Areas:
• Marine plastic pollution cleanup and prevention
• Coral reef restoration and protection
• Endangered species conservation (whales, dolphins, sea turtles)
• Sustainable fishing and aquaculture practices
• Ocean acidification research and mitigation
• Coastal ecosystem preservation

Impact: Over 50,000 tons of plastic removed from oceans, 15 marine protected areas established, and 200+ species conservation programs active worldwide.`
    },
    {
      short: 'Preserve the rainforest and its biodiversity.',
      detailed: `Protect The Rainforest focuses on conserving the world's most biodiverse ecosystems. We work to prevent deforestation, support indigenous communities, and promote sustainable land use practices that protect these vital carbon sinks while supporting local economies.`
    },
    {
      short: 'Safeguard the majestic sequoias and old-growth forests.',
      detailed: `Protect The Sequoias is committed to preserving ancient forest ecosystems and the world's largest trees. Our conservation efforts protect these natural monuments while promoting forest health through scientific research and community engagement.`
    },
    {
      short: 'Promote clean and renewable energy sources.',
      detailed: `Clean Energy initiative accelerates the transition to sustainable energy systems. We support solar, wind, and other renewable technologies while advocating for policies that reduce carbon emissions and combat climate change.`
    }
  ];

  const foundationTitleElem = document.getElementById('foundationTitle');
  const foundationMissionElem = document.getElementById('foundationMission');
  const donationTable = document.querySelector('#donationTable tbody');
  const totalDonationsElem = document.getElementById('totalDonations');
  const donorCountElem = document.getElementById('donorCount');
  const averageDonationElem = document.getElementById('averageDonation');

  if (!foundationTitleElem || !foundationMissionElem || !donationTable || !totalDonationsElem || !donorCountElem || !averageDonationElem) return;

  console.log('[loadFoundationProfile] Foundation ID:', foundationId);

  if (foundationId < 0 || foundationId >= names.length) {
    alert('Invalid foundation specified.');
    return;
  }

  foundationTitleElem.textContent = names[foundationId];
  foundationMissionElem.innerHTML = missions[foundationId].detailed;

  // Show foundation-specific impact cards
  showFoundationSpecificImpacts(foundationId);

  // Fetch donation events for the selected foundation
  const evs = await read.queryFilter(read.filters.DonationMade(), 0);
  console.log(`[loadFoundationProfile] All events:`, evs);

  const filteredEvents = evs.filter(e => {
    if (!e.args) return false;
    console.log(`[loadFoundationProfile] Event foundation ID: ${e.args.f}, looking for: ${foundationId}`);
    return parseInt(e.args.f) === foundationId;
  });
  console.log(`[loadFoundationProfile] Filtered events for foundation ${foundationId}:`, filteredEvents);

  let totalDonations = ethers.BigNumber.from(0);
  const donors = new Set();
  const donationData = [];

  if (filteredEvents.length === 0) {
    console.warn(`[loadFoundationProfile] No filtered events found for foundation ${foundationId}. Check filtering logic.`);
  }

  filteredEvents.forEach(e => {
    const { sender, amount, msg_ } = e.args;
    console.log(`[loadFoundationProfile] Processing donation: ${ethers.utils.formatEther(amount)} ETH from ${sender}`);
    totalDonations = totalDonations.add(amount);
    donors.add(sender);

    donationData.push({
      date: new Date(e.blockNumber * 1000), // Simulated date for demo purposes
      amount: parseFloat(ethers.utils.formatEther(amount))
    });

    donationTable.insertAdjacentHTML('beforeend', `
      <tr><td>${clip(sender)}</td><td>${ethers.utils.formatEther(amount)}</td><td>${msg_}</td></tr>`);
  });

  console.log(`[loadFoundationProfile] Total donations: ${ethers.utils.formatEther(totalDonations)} ETH, Donors: ${donors.size}`);

  // Update metrics
  const totalEthDonated = parseFloat(ethers.utils.formatEther(totalDonations));
  totalDonationsElem.textContent = totalEthDonated.toFixed(2);
  donorCountElem.textContent = donors.size;
  averageDonationElem.textContent = (donationData.length > 0
    ? parseFloat(ethers.utils.formatEther(totalDonations / BigInt(donationData.length))).toFixed(3)
    : '0.000');

  // Calculate and animate impact metrics
  calculateAndDisplayImpact(totalEthDonated, foundationId);

  // Populate the donation trends chart
  const ctx = document.getElementById('donationChart');

  if (!ctx) {
    console.error('[loadFoundationProfile] Chart canvas element not found');
    return;
  }

  console.log(`[loadFoundationProfile] Donation data length: ${donationData.length}`);
  console.log(`[loadFoundationProfile] Donation data:`, donationData);

  // Check if Chart.js is available
  if (typeof Chart === 'undefined') {
    console.error('[loadFoundationProfile] Chart.js library not loaded');
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Chart.js library failed to load</div>';
    }
    return;
  }

  // Ensure canvas has proper dimensions
  const chartContainer = document.querySelector('.chart-container');
  if (chartContainer) {
    chartContainer.style.height = '400px';
    chartContainer.style.position = 'relative';
  }

  ctx.width = ctx.offsetWidth;
  ctx.height = 400;

  const chartContext = ctx.getContext('2d');

  // Destroy previous chart instance if it exists
  if (foundationChartInstance) {
    foundationChartInstance.destroy();
    foundationChartInstance = null;
  }

  // Remove any existing empty state
  const emptyStateDiv = chartContainer?.querySelector('.empty-state');
  if (emptyStateDiv) {
    emptyStateDiv.remove();
  }

  if (donationData.length === 0) {
    console.log('[loadFoundationProfile] No donation data, creating empty state chart');

    try {
      foundationChartInstance = new Chart(chartContext, {
        type: 'line',
        data: {
          labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
          datasets: [{
            label: 'Sample Donations (ETH)',
            data: [0.1, 0.25, 0.15, 0.3, 0.2],
            backgroundColor: 'rgba(200, 200, 200, 0.1)',
            borderColor: 'rgba(200, 200, 200, 0.5)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(200, 200, 200, 0.5)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: '#999'
              }
            },
            tooltip: {
              enabled: false
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#999'
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#999',
                callback: function(value) {
                  return value + ' ETH';
                }
              }
            }
          }
        }
      });

      console.log('[loadFoundationProfile] Empty state chart created');

      // Add empty state overlay
      if (!chartContainer.querySelector('.empty-state-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'empty-state-overlay';
        overlay.innerHTML = `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 10; background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px;">
            <i class="fas fa-chart-line" style="font-size: 32px; color: #ddd; margin-bottom: 10px;"></i>
            <h4 style="color: #666; margin: 5px 0;">No Donations Yet</h4>
            <p style="color: #999; margin: 0; font-size: 14px;">Sample data shown above</p>
          </div>
        `;
        chartContainer.appendChild(overlay);
      }

    } catch (error) {
      console.error('[loadFoundationProfile] Error creating empty state chart:', error);
      chartContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: #999;">Failed to create chart: ${error.message}</div>`;
    }
    return;
  }

  console.log('[loadFoundationProfile] Creating chart with real donation data');

  // Sort data by date to ensure chronological order
  donationData.sort((a, b) => a.date - b.date);

  const chartLabels = donationData.map((d, index) => `Donation ${index + 1}`);
  const chartData = donationData.map(d => d.amount);

  console.log('[loadFoundationProfile] Chart Labels:', chartLabels);
  console.log('[loadFoundationProfile] Chart Data:', chartData);

  try {
    foundationChartInstance = new Chart(chartContext, {
      type: 'line',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Donations (ETH)',
          data: chartData,
          backgroundColor: 'rgba(40, 199, 111, 0.1)',
          borderColor: 'rgb(40, 199, 111)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(40, 199, 111)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#333',
              font: {
                size: 14,
                weight: '600'
              },
              padding: 20
            }
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgb(40, 199, 111)',
            borderWidth: 2,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                return `Amount: ${context.parsed.y.toFixed(3)} ETH`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#666',
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: '#666',
              font: { size: 12 },
              callback: function(value) {
                return value.toFixed(2) + ' ETH';
              }
            }
          }
        }
      }
    });

    console.log('[loadFoundationProfile] Real data chart created successfully:', foundationChartInstance);

  } catch (error) {
    console.error('[loadFoundationProfile] Error creating real data chart:', error);
    chartContainer.innerHTML = `<div style="text-align: center; padding: 40px; color: #999;">Failed to create chart: ${error.message}</div>`;
  }
}

function calculateAndDisplayImpact(totalEthDonated, foundationId) {
  // This is a placeholder function.
  // In a real app, you'd have logic to calculate impact based on donation amount.
  console.log(`Calculating impact for foundation ${foundationId} with total donation of ${totalEthDonated} ETH.`);
  // Example: animate counters with dummy data
  const metrics = {
    metric1: totalEthDonated * 10,
    metric2: totalEthDonated * 5,
    metric3: totalEthDonated * 20,
    metric4: totalEthDonated * 2
  };
  // animateImpactCounters(metrics, foundationId);
}

// Donation impact calculator for foundation profile
function calculateImpactPreview() {
  const donationInput = document.getElementById('donationAmount');
  const impactPreview = document.getElementById('impactPreview');
  const previewResults = document.getElementById('previewResults');

  const amount = parseFloat(donationInput.value) || 0;

  if (amount <= 0) {
    alert('Please enter a valid donation amount');
    return;
  }

  // Get current foundation ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const foundationId = parseInt(urlParams.get('id'), 10) || 0;

  // Foundation-specific impact conversion rates (per 1 ETH donated)
  const impactRates = [
    { // Save The Oceans (ID: 0)
      plasticRemoved: 15,
      marineLifeSaved: 50,
      oceanAreaCleaned: 2.5,
      carbonOffset: 8
    },
    { // Protect The Rainforest (ID: 1)
      treesPlanted: 200,
      forestPreserved: 5,
      wildlifeProtected: 75,
      carbonOffset: 12
    },
    { // Protect The Sequoias (ID: 2)
      acresProtected: 8,
      oldGrowthSaved: 3,
      wildlifeHabitat: 15,
      carbonOffset: 20
    },
    { // Clean Energy (ID: 3)
      solarPanelsInstalled: 25,
      cleanEnergyGenerated: 100,
      co2Prevented: 35,
      housespowered: 12
    }
  ];

  const rates = impactRates[foundationId] || impactRates[0];

  let resultsHTML = '<div class="preview-results">';

  if (foundationId === 0) { // Save The Oceans
    resultsHTML += `
      <div class="preview-metric">
        <span class="preview-value">${(amount * rates.plasticRemoved).toFixed(1)}</span>
        <span class="preview-label">Tons Plastic Removed</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${Math.floor(amount * rates.marineLifeSaved)}</span>
        <span class="preview-label">Marine Animals Protected</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${(amount * rates.oceanAreaCleaned).toFixed(1)}</span>
        <span class="preview-label">km² Ocean Cleaned</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${(amount * rates.carbonOffset).toFixed(1)}</span>
        <span class="preview-label">Tons CO₂ Offset</span>
      </div>
    `;
  } else if (foundationId === 1) { // Protect The Rainforest
    resultsHTML += `
      <div class="preview-metric">
        <span class="preview-value">${Math.floor(amount * rates.treesPlanted)}</span>
        <span class="preview-label">Trees Planted</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${(amount * rates.forestPreserved).toFixed(1)}</span>
        <span class="preview-label">Hectares Preserved</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${Math.floor(amount * rates.wildlifeProtected)}</span>
        <span class="preview-label">Wildlife Protected</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${(amount * rates.carbonOffset).toFixed(1)}</span>
        <span class="preview-label">Tons CO₂ Offset</span>
      </div>
    `;
  } else if (foundationId === 2) { // Protect The Sequoias
    resultsHTML += `
      <div class="preview-metric">
        <span class="preview-value">${(amount * rates.acresProtected).toFixed(1)}</span>
        <span class="preview-label">Acres Protected</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${Math.floor(amount * rates.oldGrowthSaved)}</span>
        <span class="preview-label">Ancient Trees Saved</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${Math.floor(amount * rates.wildlifeHabitat)}</span>
        <span class="preview-label">Species Supported</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${(amount * rates.carbonOffset).toFixed(1)}</span>
        <span class="preview-label">Tons CO₂ Offset</span>
      </div>
    `;
  } else { // Clean Energy
    resultsHTML += `
      <div class="preview-metric">
        <span class="preview-value">${Math.floor(amount * rates.solarPanelsInstalled)}</span>
        <span class="preview-label">Solar Panels</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${Math.floor(amount * rates.cleanEnergyGenerated)}</span>
        <span class="preview-label">MWh Clean Energy</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${(amount * rates.co2Prevented).toFixed(1)}</span>
        <span class="preview-label">Tons CO₂ Prevented</span>
      </div>
      <div class="preview-metric">
        <span class="preview-value">${Math.floor(amount * rates.housespowered)}</span>
        <span class="preview-label">Homes Powered</span>
      </div>
    `;
  }

  resultsHTML += '</div>';
  previewResults.innerHTML = resultsHTML;
  impactPreview.style.display = 'block';

  // Add animation to the preview
  impactPreview.style.opacity = '0';
  impactPreview.style.transform = 'translateY(20px)';
  setTimeout(() => {
    impactPreview.style.transition = 'all 0.3s ease';
    impactPreview.style.opacity = '1';
    impactPreview.style.transform = 'translateY(0)';
  }, 50);
}

// Show appropriate impact cards based on foundation ID
function showFoundationSpecificImpacts(foundationId) {
  // Hide all impact cards first
  const impactCards = document.querySelectorAll('.impact-card');
  impactCards.forEach(card => card.style.display = 'none');

  // Show foundation-specific impacts
  const classNames = ['oceans-impact', 'rainforest-impact', 'sequoias-impact', 'energy-impact'];
  const targetClass = classNames[foundationId] || classNames[0];

  const targetCards = document.querySelectorAll(`.${targetClass}`);
  targetCards.forEach(card => {
    card.style.display = 'flex';
    card.style.animation = 'fadeInUp 0.6s ease forwards';
  });
}

function animateImpactCounters(metrics, foundationId) {
  const impactElements = {
    0: ['plasticRemoved', 'marineLifeSaved', 'oceanAreaCleaned', 'carbonOffset'],
    1: ['treesPlanted', 'forestPreserved', 'wildlifeProtected', 'carbonOffset'],
    2: ['acresProtected', 'oldGrowthSaved', 'wildlifeHabitat', 'carbonOffset'],
    3: ['solarPanelsInstalled', 'cleanEnergyGenerated', 'co2Prevented', 'housespowered']
  };

  const elementIds = impactElements[foundationId] || impactElements[0];
  const metricKeys = Object.keys(metrics);

  elementIds.forEach((elementId, index) => {
    const element = document.getElementById(elementId);
    if (!element || !metricKeys[index]) return;

    const finalValue = metrics[metricKeys[index]];
    const isDecimal = finalValue.toString().includes('.');

    animateValue(element, 0, parseFloat(finalValue), 1500, isDecimal);
  });
}

function animateValue(element, start, end, duration, isDecimal = false) {
  const range = end - start;
  const increment = range / (duration / 16); // 60fps
  let current = start;

  // Add glowing effect during animation
  element.classList.add('animating');

  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
      element.classList.remove('animating');
    }

    element.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

    // Add pulse effect during animation
    if (current < end) {
      element.style.transform = 'scale(1.05)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 100);
    }
  }, 16);

  // Add completion effect
  setTimeout(() => {
    if (current >= end) {
      element.style.animation = 'bounce 0.6s ease';
      setTimeout(() => {
        element.style.animation = '';
      }, 600);
    }
  }, duration);
}

function updateImpactExplanation(foundationId, rates) {
  const explanations = [
    `Every 1 ETH donated enables our teams to remove ${rates.plasticRemoved} tons of plastic, protect ${rates.marineLifeSaved} marine animals, clean ${rates.oceanAreaCleaned} km² of ocean area, and offset ${rates.carbonOffset} tons of CO₂ through our restoration projects.`,
    `Every 1 ETH donated allows us to plant ${rates.treesPlanted} trees, preserve ${rates.forestPreserved} hectares of rainforest, protect ${rates.wildlifeProtected} wild animals, and offset ${rates.carbonOffset} tons of CO₂.`,
    `Every 1 ETH donated helps us protect ${rates.acresProtected} acres of old-growth forest, save ${rates.oldGrowthSaved} ancient sequoia trees, support habitat for ${rates.wildlifeHabitat} species, and offset ${rates.carbonOffset} tons of CO₂.`,
    `Every 1 ETH donated funds ${rates.solarPanelsInstalled} solar panel installations, generates ${rates.cleanEnergyGenerated} MWh of clean energy, prevents ${rates.co2Prevented} tons of CO₂ emissions, and powers ${rates.housespowered} homes for a month.`
  ];

  const explanationElement = document.querySelector('.impact-explanation p');
  if (explanationElement) {
    explanationElement.innerHTML = `<i class="fas fa-info-circle"></i> <strong>How we calculate impact:</strong> ${explanations[foundationId] || explanations[0]}`;
  }
}

/* ───────── HOME PAGE ───────── */
async function loadHomePage() {
  try {
    const filter = { fromBlock: 0, toBlock: 'latest' };
    const events = await rpcProvider.getLogs({
      address: donationAddress,
      topics: ['0x' + ethers.utils.id('DonationMade(uint8,address,uint256,string)').slice(2)],
      ...filter
    });

    const processedEvents = events.map(log => {
      const [foundation, sender, amount, message] = ethers.utils.defaultAbiCoder.decode(
        ['uint8', 'address', 'uint256', 'string'],
        log.data
      );
      return {
        foundation: Number(foundation),
        sender: sender.toLowerCase(),
        amount: Number(ethers.utils.formatEther(amount)),
        message,
        txHash: log.transactionHash
      };
    });

    // Calculate stats
    const totalDonated = processedEvents.reduce((sum, event) => sum + event.amount, 0);
    const uniqueDonors = new Set(processedEvents.map(e => e.sender)).size;
    const totalEcoMinted = totalDonated * 10; // 10 ECO per 1 ETH
    const carbonOffset = totalDonated * 2.5; // Estimate: 2.5 tons CO2 per ETH

    // Foundation breakdown
    const foundationTotals = [0, 0, 0, 0];
    processedEvents.forEach(event => {
      foundationTotals[event.foundation] += event.amount;
    });

    // Impact calculations
    const oceanImpact = foundationTotals[0] * 12; // 12 tons plastic per ETH
    const forestImpact = foundationTotals[1] * 500; // 500 acres per ETH
    const energyImpact = foundationTotals[3] * 800; // 800 MWh per ETH

    // Foundation project counts (simulated)
    const foundationProjects = [
      Math.floor(foundationTotals[0] * 3) + 1, // Oceans
      Math.floor(foundationTotals[1] * 2) + 1, // Forest
      Math.floor(foundationTotals[2] * 4) + 1, // Sequoia
      Math.floor(foundationTotals[3] * 2) + 1  // Energy
    ];

    // Update KPI elements
    const kpiElements = [
      { id: 'kpiTotalDonated', value: totalDonated.toFixed(2), suffix: ' ETH' },
      { id: 'kpiCarbon', value: carbonOffset.toFixed(1), suffix: ' tons' },
      { id: 'kpiDonors', value: uniqueDonors },
      { id: 'kpiEcoMinted', value: totalEcoMinted.toFixed(0) }
    ];

    kpiElements.forEach(({ id, value, suffix = '' }) => {
      const element = document.getElementById(id);
      if (element) {
        animateValue(element, 0, parseFloat(value), 2000, suffix);
      }
    });

    // Update impact metrics
    const impactElements = [
      { id: 'oceanImpact', value: oceanImpact.toFixed(0) },
      { id: 'forestImpact', value: forestImpact.toFixed(0) },
      { id: 'energyImpact', value: energyImpact.toFixed(0) }
    ];

    impactElements.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        animateValue(element, 0, parseFloat(value), 2000);
      }
    });

    // Update foundation badges with better formatting
    const badgeElements = [
      { id: 'badge-oceans', value: foundationTotals[0] },
      { id: 'badge-forest', value: foundationTotals[1] },
      { id: 'badge-sequoia', value: foundationTotals[2] },
      { id: 'badge-energy', value: foundationTotals[3] }
    ];

    badgeElements.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = `${value.toFixed(2)} ETH Raised`;
      }
    });

    // Update foundation project counts
    const projectElements = [
      { id: 'oceans-projects', value: foundationProjects[0] },
      { id: 'forest-projects', value: foundationProjects[1] },
      { id: 'sequoia-projects', value: foundationProjects[2] },
      { id: 'energy-projects', value: foundationProjects[3] }
    ];

    projectElements.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        animateValue(element, 0, value, 1500);
      }
    });

    // Update foundation impact stats
    const impactStats = [
      { id: 'oceans-impact', value: oceanImpact.toFixed(0) },
      { id: 'forest-impact', value: forestImpact.toFixed(0) },
      { id: 'sequoia-impact', value: Math.floor(foundationTotals[2] * 1000) }, // Trees
      { id: 'energy-impact', value: energyImpact.toFixed(0) }
    ];

    impactStats.forEach(({ id, value }) => {
      const element = document.getElementById(id);
      if (element) {
        animateValue(element, 0, parseFloat(value), 1500);
      }
    });

    console.log('✅ Home page data loaded successfully');
  } catch (error) {
    console.error('❌ Error loading home page data:', error);
  }
}

// Animate value function for smooth number transitions
function animateValue(element, start, end, duration, suffix = '') {
  const startTime = performance.now();
  const range = end - start;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = start + (range * easeOutQuart);

    element.textContent = Math.floor(currentValue).toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ───────── VIDEO CONTROLS ───────── */
// Control hero video to avoid shaky ending
function setupHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (video) {
    video.addEventListener('loadedmetadata', function() {
      // Get video duration and subtract 2 seconds
      const videoDuration = video.duration;
      const cutoffTime = videoDuration - 2; // Remove last 2 seconds

      console.log(`Video duration: ${videoDuration}s, will loop at: ${cutoffTime}s`);

      // Set up time monitoring
      video.addEventListener('timeupdate', function() {
        if (video.currentTime >= cutoffTime) {
          video.currentTime = 0; // Reset to beginning
        }
      });
    });

    // Handle loading errors
    video.addEventListener('error', function(e) {
      console.warn('Hero video failed to load:', e);
    });
  }
}

// Quick donate function
function quickDonate(amount) {
  // Pre-fill donation form with amount
  const amountInput = document.getElementById('amount');
  if (amountInput) {
    amountInput.value = amount.toString();
  }

  // Navigate to donate page if not already there
  if (!window.location.pathname.includes('donate.html')) {
    window.location.href = `donate.html?amount=${amount}`;
  } else {
    // If already on donate page, just update the amount
    if (amountInput) {
      amountInput.focus();
    }
  }
}

// Prefill donation form based on URL parameters
function prefillDonationForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const amount = urlParams.get('amount');
  const foundation = urlParams.get('foundation');

  if (amount) {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
      amountInput.value = amount;
    }
  }

  if (foundation) {
    const foundationSelect = document.getElementById('foundation');
    if (foundationSelect) {
      foundationSelect.value = foundation;
    }
  }
}

// Initialize video controls when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
  setupHeroVideo();

  // Check if we're on the home page
  if (window.location.pathname === '/index.html' || window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    loadHomePage();
  }
});

// Utility function to clip wallet addresses
function clip(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Make functions globally available
window.connectWallet = connectWallet;
window.sendDonation = sendDonation;
window.loadHistory = loadHistory;
window.loadDashboard = loadDashboard;
window.loadFoundationProfile = loadFoundationProfile;
window.loadHomePage = loadHomePage;
window.quickDonate = quickDonate;
window.prefillDonationForm = prefillDonationForm;
window.calculateImpactPreview = calculateImpactPreview;
window.selectFoundation = selectFoundation;
window.loadFoundationProfileData = loadFoundationProfileData;
window.loadFoundationDonationData = loadFoundationDonationData;
window.initializeFoundationPage = initializeFoundationPage;
window.showDefaultFoundationState = showDefaultFoundationState;
window.initializeDonationPage = initializeDonationPage;
window.clip = clip;

// Foundation selection and profile management
function selectFoundation(foundationId) {
  console.log('[selectFoundation] Foundation selected:', foundationId);

  // Update URL with selected foundation
  const url = new URL(window.location);
  url.searchParams.set('id', foundationId);
  history.pushState({}, '', url);

  // Hide foundation selection and show profile
  const foundationSelection = document.querySelector('.foundation-selection');
  const foundationProfile = document.querySelector('.foundation-profile');

  if (foundationSelection) {
    foundationSelection.style.display = 'none';
  }

  if (foundationProfile) {
    foundationProfile.style.display = 'block';
  }

  // Highlight selected foundation card
  const foundationCards = document.querySelectorAll('.foundation-card');
  foundationCards.forEach(card => card.classList.remove('selected'));

  const selectedCard = document.querySelector(`[data-foundation="${foundationId}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  // Load foundation profile data
  loadFoundationProfileData(foundationId);
}

async function loadFoundationProfileData(foundationId) {
  console.log('[loadFoundationProfileData] Loading data for foundation:', foundationId);

  // Foundation data
  const foundationData = [
    {
      name: 'Save The Oceans',
      mission: 'Save The Oceans is dedicated to preserving marine ecosystems and protecting the biodiversity of our oceans. Our mission encompasses removing plastic pollution, protecting endangered marine species, supporting sustainable fishing practices, and restoring coral reefs.',
      impactCards: [
        { icon: 'fas fa-trash', title: 'Plastic Removed', value: '0', unit: 'Tons', id: 'plasticRemoved' },
        { icon: 'fas fa-fish', title: 'Marine Life Saved', value: '0', unit: 'Animals', id: 'marineLifeSaved' },
        { icon: 'fas fa-water', title: 'Ocean Area Cleaned', value: '0', unit: 'km²', id: 'oceanAreaCleaned' },
        { icon: 'fas fa-leaf', title: 'Carbon Offset', value: '0', unit: 'Tons CO₂', id: 'carbonOffset' }
      ]
    },
    {
      name: 'Protect The Rainforest',
      mission: 'Protect The Rainforest focuses on conserving the world\'s most biodiverse ecosystems. We work to prevent deforestation, support indigenous communities, and promote sustainable land use practices that protect these vital carbon sinks.',
      impactCards: [
        { icon: 'fas fa-tree', title: 'Trees Planted', value: '0', unit: 'Trees', id: 'treesPlanted' },
        { icon: 'fas fa-seedling', title: 'Forest Preserved', value: '0', unit: 'Acres', id: 'forestPreserved' },
        { icon: 'fas fa-paw', title: 'Wildlife Protected', value: '0', unit: 'Animals', id: 'wildlifeProtected' },
        { icon: 'fas fa-leaf', title: 'Carbon Offset', value: '0', unit: 'Tons CO₂', id: 'carbonOffset' }
      ]
    },
    {
      name: 'Protect The Sequoias',
      mission: 'Protect The Sequoias is committed to preserving ancient forest ecosystems and the world\'s largest trees. Our conservation efforts protect these natural monuments while promoting forest health through scientific research.',
      impactCards: [
        { icon: 'fas fa-mountain', title: 'Acres Protected', value: '0', unit: 'Acres', id: 'acresProtected' },
        { icon: 'fas fa-tree', title: 'Old Growth Saved', value: '0', unit: 'Trees', id: 'oldGrowthSaved' },
        { icon: 'fas fa-home', title: 'Wildlife Habitat', value: '0', unit: 'km²', id: 'wildlifeHabitat' },
        { icon: 'fas fa-leaf', title: 'Carbon Offset', value: '0', unit: 'Tons CO₂', id: 'carbonOffset' }
      ]
    },
    {
      name: 'Clean Energy',
      mission: 'Clean Energy initiative accelerates the transition to sustainable energy systems. We support solar, wind, and other renewable technologies while advocating for policies that reduce carbon emissions.',
      impactCards: [
        { icon: 'fas fa-solar-panel', title: 'Solar Panels', value: '0', unit: 'Installed', id: 'solarPanelsInstalled' },
        { icon: 'fas fa-bolt', title: 'Clean Energy', value: '0', unit: 'MWh', id: 'cleanEnergyGenerated' },
        { icon: 'fas fa-smog', title: 'CO₂ Prevented', value: '0', unit: 'Tons', id: 'co2Prevented' },
        { icon: 'fas fa-home', title: 'Houses Powered', value: '0', unit: 'Homes', id: 'housespowered' }
      ]
    }
  ];

  const foundation = foundationData[foundationId];
  if (!foundation) {
    console.error('[loadFoundationProfileData] Foundation not found:', foundationId);
    return;
  }

  // Update foundation title and mission
  const foundationTitle = document.getElementById('foundationTitle');
  const foundationMission = document.getElementById('foundationMission');
  const foundationHero = document.getElementById('foundationHero');
  const foundationDonateButton = document.getElementById('foundationDonateButton');

  if (foundationTitle) {
    foundationTitle.textContent = foundation.name;
  }

  if (foundationMission) {
    foundationMission.textContent = foundation.mission;
  }

  // Update hero section theme
  if (foundationHero) {
    const heroClasses = ['oceans', 'rainforest', 'sequoias', 'energy'];
    foundationHero.classList.remove(...heroClasses);
    foundationHero.classList.add(heroClasses[foundationId]);
  }

  // Update donate button link
  if (foundationDonateButton) {
    foundationDonateButton.href = `donate.html?foundation=${foundationId}`;
  }

  // Update impact cards
  const impactGrid = document.getElementById('impactGrid');
  if (impactGrid) {
    impactGrid.innerHTML = '';
    foundation.impactCards.forEach(card => {
      impactGrid.innerHTML += `
        <div class="impact-card">
          <div class="impact-card__icon">
            <i class="${card.icon}"></i>
          </div>
          <div class="impact-card__content">
            <div class="impact-card__value" id="${card.id}">${card.value}</div>
            <div class="impact-card__label">${card.title}</div>
            <div class="impact-card__unit">${card.unit}</div>
          </div>
        </div>
      `;
    });
  }

  // Load donation data and update metrics
  await loadFoundationDonationData(foundationId);
}

async function loadFoundationDonationData(foundationId) {
  console.log('[loadFoundationDonationData] Loading donation data for foundation:', foundationId);

  try {
    // Ensure contracts are loaded
    await ensureContract(donationAddress, rpcProvider);

    const read = new ethers.Contract(donationAddress, donationAbi, rpcProvider);

    // Fetch donation events for the selected foundation
    const evs = await read.queryFilter(read.filters.DonationMade(), 0);
    console.log(`[loadFoundationDonationData] All events:`, evs);

    const filteredEvents = evs.filter(e => {
      if (!e.args) return false;
      return parseInt(e.args.f) === foundationId;
    });

    console.log(`[loadFoundationDonationData] Filtered events for foundation ${foundationId}:`, filteredEvents);

    let totalDonations = ethers.BigNumber.from(0);
    const donors = new Set();
    const recentDonations = [];

    // Process donation events
    filteredEvents.forEach(e => {
      const { sender, amount, msg_ } = e.args;
      console.log(`[loadFoundationDonationData] Processing donation: ${ethers.utils.formatEther(amount)} ETH from ${sender}`);

      totalDonations = totalDonations.add(amount);
      donors.add(sender);

      recentDonations.push({
        sender,
        amount: ethers.utils.formatEther(amount),
        message: msg_,
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // Random time in last 7 days
      });
    });

    // Sort by timestamp (newest first)
    recentDonations.sort((a, b) => b.timestamp - a.timestamp);

    // Update metrics
    const totalEthDonated = parseFloat(ethers.utils.formatEther(totalDonations));
    const averageDonation = filteredEvents.length > 0 ? totalEthDonated / filteredEvents.length : 0;

    const totalDonationsElem = document.getElementById('totalDonations');
    const donorCountElem = document.getElementById('donorCount');
    const averageDonationElem = document.getElementById('averageDonation');

    if (totalDonationsElem) totalDonationsElem.textContent = totalEthDonated.toFixed(2);
    if (donorCountElem) donorCountElem.textContent = donors.size;
    if (averageDonationElem) averageDonationElem.textContent = averageDonation.toFixed(3);

    // Update recent donations
    const recentDonationsElem = document.getElementById('recentDonations');
    if (recentDonationsElem) {
      recentDonationsElem.innerHTML = '';

      if (recentDonations.length === 0) {
        recentDonationsElem.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-heart"></i>
            <h3>No donations yet</h3>
            <p>Be the first to support this foundation!</p>
          </div>
        `;
      } else {
        recentDonations.slice(0, 5).forEach(donation => {
          const timeAgo = Math.floor((Date.now() - donation.timestamp) / (1000 * 60 * 60 * 24));
          recentDonationsElem.innerHTML += `
            <div class="donation-item">
              <div class="donation-item__info">
                <div class="donation-item__sender">${clip(donation.sender)}</div>
                <div class="donation-item__message">${donation.message}</div>
                <div class="donation-item__time">${timeAgo} day${timeAgo !== 1 ? 's' : ''} ago</div>
              </div>
              <div class="donation-item__amount">${parseFloat(donation.amount).toFixed(3)} ETH</div>
            </div>
          `;
        });
      }
    }

    // Calculate and animate impact metrics
    calculateFoundationImpact(totalEthDonated, foundationId);

  } catch (error) {
    console.error('[loadFoundationDonationData] Error loading donation data:', error);
  }
}

function calculateFoundationImpact(totalEthDonated, foundationId) {
  console.log(`[calculateFoundationImpact] Calculating impact for foundation ${foundationId} with ${totalEthDonated} ETH`);

  // Foundation-specific impact conversion rates (per 1 ETH donated)
  const impactRates = [
    { // Save The Oceans (ID: 0)
      plasticRemoved: 15,
      marineLifeSaved: 50,
      oceanAreaCleaned: 2.5,
      carbonOffset: 8
    },
    { // Protect The Rainforest (ID: 1)
      treesPlanted: 200,
      forestPreserved: 5,
      wildlifeProtected: 75,
      carbonOffset: 12
    },
    { // Protect The Sequoias (ID: 2)
      acresProtected: 8,
      oldGrowthSaved: 3,
      wildlifeHabitat: 15,
      carbonOffset: 20
    },
    { // Clean Energy (ID: 3)
      solarPanelsInstalled: 25,
      cleanEnergyGenerated: 100,
      co2Prevented: 35,
      housespowered: 12
    }
  ];

  const rates = impactRates[foundationId] || impactRates[0];

  // Calculate impact values
  const impactValues = {};
  Object.keys(rates).forEach(key => {
    impactValues[key] = (totalEthDonated * rates[key]).toFixed(1);
  });

  // Animate impact counters
  Object.keys(impactValues).forEach(key => {
    const element = document.getElementById(key);
    if (element) {
      animateValue(element, 0, parseFloat(impactValues[key]), 1500, true);
    }
  });
}

function initializeFoundationPage() {
  console.log('[initializeFoundationPage] Initializing foundation page');

  // Check if there's a foundation ID in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const foundationId = urlParams.get('id');

  if (foundationId !== null) {
    const id = parseInt(foundationId, 10);
    if (!isNaN(id) && id >= 0 && id <= 3) {
      console.log('[initializeFoundationPage] Loading foundation from URL:', id);
      selectFoundation(id);
      return;
    }
  }

  // If no valid foundation ID in URL, show default state
  console.log('[initializeFoundationPage] No valid foundation ID in URL, showing default state');
  showDefaultFoundationState();
}

function showDefaultFoundationState() {
  console.log('[showDefaultFoundationState] Showing default foundation state');

  // Clear URL parameters
  const url = new URL(window.location);
  url.searchParams.delete('id');
  history.pushState({}, '', url);

  // Show the foundation selection section
  const foundationSelection = document.querySelector('.foundation-selection');
  const foundationProfile = document.querySelector('.foundation-profile');

  if (foundationSelection) {
    foundationSelection.style.display = 'block';
  }

  if (foundationProfile) {
    foundationProfile.style.display = 'none';
  }

  // Clear selected state from foundation cards
  const foundationCards = document.querySelectorAll('.foundation-card');
  foundationCards.forEach(card => card.classList.remove('selected'));

  // Update hero section
  const foundationTitle = document.getElementById('foundationTitle');
  const foundationHero = document.getElementById('foundationHero');

  if (foundationTitle) {
    foundationTitle.textContent = 'Environmental Foundations';
  }

  if (foundationHero) {
    const heroClasses = ['oceans', 'rainforest', 'sequoias', 'energy'];
    foundationHero.classList.remove(...heroClasses);
  }
}

function initializeDonationPage() {
  console.log('[initializeDonationPage] Initializing donation page');

  // Check for foundation parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const foundationParam = urlParams.get('foundation');

  if (foundationParam !== null) {
    const foundationId = parseInt(foundationParam, 10);
    if (!isNaN(foundationId) && foundationId >= 0 && foundationId <= 3) {
      console.log('[initializeDonationPage] Pre-selecting foundation:', foundationId);

      const foundationSelect = document.getElementById('foundation');
      if (foundationSelect) {
        foundationSelect.value = foundationId;

        // Trigger change event to update any related UI
        const changeEvent = new Event('change');
        foundationSelect.dispatchEvent(changeEvent);
      }
    }
  }
}
