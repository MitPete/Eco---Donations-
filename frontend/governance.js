// Enhanced Governance JavaScript
const ethers = window.ethers;
let contracts;
let governanceAddress;
let governanceContract;
let ecoCoinAddress;
let ecoCoinContract;
let rpcProvider;
let userAccount;

// Initialize governance functionality
async function initializeGovernance() {
  try {
    await loadGovernanceContracts();
    initializeTabs();
    await updateHeroStats();
    await loadProposals();
    await loadVotingHistory();

    // Check if wallet is connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      userAccount = window.ethereum.selectedAddress;
      await updateUserVotingPower();
    }
  } catch (error) {
    console.error('Failed to initialize governance:', error);
    showError('Failed to load governance data');
  }
}

async function loadGovernanceContracts() {
  const response = await fetch('./contracts.json?v=' + Date.now());
  contracts = await response.json();
  governanceAddress = contracts.governance;
  ecoCoinAddress = contracts.ecoCoin;
  rpcProvider = new ethers.providers.JsonRpcProvider(
    contracts.chainId === 31337 ? 'http://localhost:8545' : 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'
  );

  governanceContract = new ethers.Contract(governanceAddress, [
    'function proposalCount() view returns (uint256)',
    'function getProposal(uint256) view returns (string,uint256,uint256,uint256,bool)',
    'function vote(uint256,bool)',
    'function createProposal(string,uint256)',
    'function executeProposal(uint256)',
    'function hasVoted(uint256,address) view returns (bool)'
  ], rpcProvider);

  ecoCoinContract = new ethers.Contract(ecoCoinAddress, [
    'function balanceOf(address) view returns (uint256)',
    'function totalSupply() view returns (uint256)'
  ], rpcProvider);
}

// Tab functionality
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// Update hero statistics
async function updateHeroStats() {
  try {
    const proposalCount = await governanceContract.proposalCount();
    const totalSupply = await ecoCoinContract.totalSupply();

    document.getElementById('totalProposals').textContent = proposalCount.toString();
    document.getElementById('totalVoters').textContent = '2,847'; // Mock data

    if (userAccount) {
      await updateUserVotingPower();
    }
  } catch (error) {
    console.error('Failed to update hero stats:', error);
  }
}

async function updateUserVotingPower() {
  try {
    const balance = await ecoCoinContract.balanceOf(userAccount);
    const votingPower = ethers.utils.formatEther(balance);
    document.getElementById('votingPower').textContent = Math.floor(parseFloat(votingPower)).toLocaleString();
  } catch (error) {
    console.error('Failed to update voting power:', error);
    document.getElementById('votingPower').textContent = '0';
  }
}

// Load and display proposals
async function loadProposals() {
  const proposalsList = document.getElementById('proposalsList');

  try {
    const count = await governanceContract.proposalCount();

    if (count.eq(0)) {
      proposalsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🗳️</div>
          <h3>No Active Proposals</h3>
          <p>Be the first to create a proposal and shape the future of Eco Donations!</p>
        </div>
      `;
      return;
    }

    proposalsList.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const [desc, votesFor, votesAgainst, deadline, executed] = await governanceContract.getProposal(i);
      const proposalCard = await createProposalCard(i, desc, votesFor, votesAgainst, deadline, executed);
      proposalsList.appendChild(proposalCard);
    }
  } catch (error) {
    console.error('Failed to load proposals:', error);
    proposalsList.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Failed to Load Proposals</h3>
        <p>Please check your connection and try again.</p>
      </div>
    `;
  }
}

async function createProposalCard(id, description, votesFor, votesAgainst, deadline, executed) {
  const now = Math.floor(Date.now() / 1000);
  const isActive = !executed && now <= deadline;
  const isEnded = !executed && now > deadline;

  const totalVotes = votesFor.add(votesAgainst);
  const forPercentage = totalVotes.gt(0) ? votesFor.mul(100).div(totalVotes).toNumber() : 0;

  let status = 'pending';
  let statusText = 'Pending';

  if (executed) {
    status = 'executed';
    statusText = 'Executed';
  } else if (isActive) {
    status = 'active';
    statusText = 'Active';
  } else if (isEnded) {
    status = 'ended';
    statusText = 'Ended';
  }

  const card = document.createElement('div');
  card.className = 'proposal-card';

  let hasVoted = false;
  if (userAccount) {
    try {
      hasVoted = await governanceContract.hasVoted(id, userAccount);
    } catch (error) {
      console.error('Failed to check voting status:', error);
    }
  }

  card.innerHTML = `
    <div class="proposal-header">
      <div class="proposal-id">Proposal #${id}</div>
      <div class="proposal-status ${status}">${statusText}</div>
    </div>

    <div class="proposal-description">${description}</div>

    <div class="proposal-progress">
      <div class="progress-label">
        <span>Support</span>
        <span>${forPercentage}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${forPercentage}%"></div>
      </div>
    </div>

    <div class="proposal-votes">
      <div class="vote-option for">
        <div class="vote-count">${ethers.utils.formatEther(votesFor)}</div>
        <div class="vote-label">For</div>
      </div>
      <div class="vote-option against">
        <div class="vote-count">${ethers.utils.formatEther(votesAgainst)}</div>
        <div class="vote-label">Against</div>
      </div>
    </div>

    <div class="proposal-meta">
      <div class="deadline">
        <strong>Deadline:</strong> ${new Date(deadline * 1000).toLocaleDateString()}
      </div>
    </div>

    <div class="proposal-actions">
      ${isActive && !hasVoted ? `
        <button class="vote-btn for" onclick="voteOnProposal(${id}, true)">
          <span>👍</span> Vote For
        </button>
        <button class="vote-btn against" onclick="voteOnProposal(${id}, false)">
          <span>👎</span> Vote Against
        </button>
      ` : ''}

      ${hasVoted ? `
        <div class="voted-indicator">
          <span>✅</span> You have voted
        </div>
      ` : ''}

      ${isEnded && !executed ? `
        <button class="btn btn-secondary" onclick="executeProposal(${id})">
          Execute Proposal
        </button>
      ` : ''}
    </div>
  `;

  return card;
}

// Voting functionality
window.voteOnProposal = async function(id, support) {
  if (!userAccount) {
    alert('Please connect your wallet first');
    return;
  }

  try {
    showLoading('Submitting vote...');
    const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = browserProvider.getSigner();
    const governanceWrite = new ethers.Contract(governanceAddress, [
      'function vote(uint256,bool)'
    ], signer);

    const tx = await governanceWrite.vote(id, support);
    await tx.wait();

    showSuccess('Vote submitted successfully!');
    await loadProposals();
  } catch (error) {
    console.error('Voting error:', error);
    showError('Failed to submit vote: ' + error.message);
  }
};

window.executeProposal = async function(id) {
  if (!userAccount) {
    alert('Please connect your wallet first');
    return;
  }

  try {
    showLoading('Executing proposal...');
    const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = browserProvider.getSigner();
    const governanceWrite = new ethers.Contract(governanceAddress, [
      'function executeProposal(uint256)'
    ], signer);

    const tx = await governanceWrite.executeProposal(id);
    await tx.wait();

    showSuccess('Proposal executed successfully!');
    await loadProposals();
  } catch (error) {
    console.error('Execution error:', error);
    showError('Failed to execute proposal: ' + error.message);
  }
};

// Create proposal functionality
document.addEventListener('DOMContentLoaded', function() {
  const createForm = document.getElementById('createProposalForm');
  if (createForm) {
    createForm.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!userAccount) {
        showError('Please connect your wallet first');
        return;
      }

      const description = document.getElementById('proposalDesc').value.trim();
      const duration = parseInt(document.getElementById('proposalDuration').value);

      if (!description) {
        showError('Please enter a proposal description');
        return;
      }

      try {
        showLoading('Creating proposal...');
        const browserProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = browserProvider.getSigner();
        const governanceWrite = new ethers.Contract(governanceAddress, [
          'function createProposal(string,uint256)'
        ], signer);

        const tx = await governanceWrite.createProposal(description, duration);
        await tx.wait();

        showSuccess('Proposal created successfully!');
        document.getElementById('proposalDesc').value = '';
        await loadProposals();
        await updateHeroStats();

        // Switch to proposals tab
        document.querySelector('[data-tab="proposals"]').click();
      } catch (error) {
        console.error('Proposal creation error:', error);
        showError('Failed to create proposal: ' + error.message);
      }
    });
  }
});

// Load voting history (sample data for demonstration)
async function loadVotingHistory() {
  const historyList = document.getElementById('votingHistoryList');

  // Sample voting history data that matches our new design
  const sampleHistory = [
    {
      id: 5,
      title: 'Increase Donation Matching Fund by 25%',
      vote: 'for',
      date: '2024-01-15',
      outcome: 'Passed',
      description: 'Voted to increase matching fund percentage'
    },
    {
      id: 4,
      title: 'Implement Carbon Offset Verification',
      vote: 'for',
      date: '2024-01-10',
      outcome: 'Passed',
      description: 'Supported blockchain verification system'
    },
    {
      id: 3,
      title: 'Launch Education Grant Program',
      vote: 'against',
      date: '2024-01-05',
      outcome: 'Failed',
      description: 'Opposed grant program structure'
    },
    {
      id: 2,
      title: 'Update Platform Fee Structure',
      vote: 'for',
      date: '2023-12-28',
      outcome: 'Passed',
      description: 'Voted for transparent fee model'
    }
  ];

  historyList.innerHTML = sampleHistory.map(item => `
    <div class="history-item">
      <div class="history-info">
        <div class="history-proposal">Proposal #${item.id}: ${item.title}</div>
        <div class="history-date">${new Date(item.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
      </div>
      <div class="history-vote ${item.vote}">
        ${item.vote === 'for' ? '👍 For' : '👎 Against'}
      </div>
    </div>
  `).join('');
}

// Simple vote function for sample proposals
window.vote = function(proposalId, support) {
  if (!userAccount) {
    alert('Please connect your wallet to vote on proposals');
    return;
  }

  const supportText = support ? 'Yes' : 'No';
  alert(`Vote "${supportText}" recorded for Proposal #${proposalId}.\n\nNote: This is a demonstration. In a real implementation, this would interact with the governance smart contract.`);

  // In a real implementation, this would call the smart contract
  // and update the UI with the new vote counts
};

// Utility functions
function showLoading(message) {
  const status = document.getElementById('createProposalStatus');
  if (status) {
    status.className = 'proposal-status info';
    status.textContent = message;
  }
}

function showSuccess(message) {
  const status = document.getElementById('createProposalStatus');
  if (status) {
    status.className = 'proposal-status success';
    status.textContent = message;
    setTimeout(() => {
      status.textContent = '';
      status.className = 'proposal-status';
    }, 5000);
  }
}

function showError(message) {
  const status = document.getElementById('createProposalStatus');
  if (status) {
    status.className = 'proposal-status error';
    status.textContent = message;
    setTimeout(() => {
      status.textContent = '';
      status.className = 'proposal-status';
    }, 5000);
  }
}

// Listen for account changes
if (window.ethereum) {
  window.ethereum.on('accountsChanged', function(accounts) {
    if (accounts.length > 0) {
      userAccount = accounts[0];
      updateUserVotingPower();
      loadProposals();
    } else {
      userAccount = null;
      document.getElementById('votingPower').textContent = '0';
    }
  });
}

// Initialize when page loads
window.addEventListener('load', initializeGovernance);
