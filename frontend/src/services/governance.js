// Enhanced Governance JavaScript - Demo Mode
let userAccount;
let sampleProposals = [
  {
    id: 0,
    description: "Increase the donation matching fund from 10% to 25% to amplify environmental impact",
    votesFor: 1250000,
    votesAgainst: 340000,
    deadline: Math.floor(Date.now() / 1000) + 604800, // 1 week from now
    executed: false,
    status: 'active'
  },
  {
    id: 1,
    description: "Implement carbon offset verification system using blockchain oracles for transparency",
    votesFor: 2100000,
    votesAgainst: 450000,
    deadline: Math.floor(Date.now() / 1000) + 259200, // 3 days from now
    executed: false,
    status: 'active'
  },
  {
    id: 2,
    description: "Launch quarterly environmental education grant program for universities",
    votesFor: 890000,
    votesAgainst: 1200000,
    deadline: Math.floor(Date.now() / 1000) - 86400, // ended 1 day ago
    executed: false,
    status: 'ended'
  },
  {
    id: 3,
    description: "Partner with Ocean Cleanup Foundation for dedicated plastic removal initiatives",
    votesFor: 3200000,
    votesAgainst: 150000,
    deadline: Math.floor(Date.now() / 1000) - 172800, // ended 2 days ago
    executed: true,
    status: 'executed'
  },
  {
    id: 4,
    description: "Reduce platform fees by 50% to encourage more environmental donations",
    votesFor: 1800000,
    votesAgainst: 1900000,
    deadline: Math.floor(Date.now() / 1000) + 1209600, // 2 weeks from now
    executed: false,
    status: 'active'
  }
];

// Connect wallet function
async function connectWallet() {
  try {
    console.log('Attempting to connect wallet...');
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet');
      return false;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length > 0) {
      userAccount = accounts[0];
      document.getElementById('votingPower').textContent = '1,250';
      console.log('Wallet connected successfully:', userAccount);
      return true;
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return false;
  }
  return false;
}

// Make connectWallet globally available
window.connectWallet = connectWallet;

// Check wallet connection status
function checkWalletConnection() {
  if (window.ethereum && window.ethereum.selectedAddress) {
    userAccount = window.ethereum.selectedAddress;
    document.getElementById('votingPower').textContent = '1,250';
    console.log('Wallet already connected:', userAccount);
    return true;
  }
  return false;
}

// Initialize governance functionality
async function initializeGovernance() {
  try {
    console.log('Initializing governance...');
    initializeTabs();
    await loadProposals();
    await loadVotingHistory();

    // Check if wallet is connected
    checkWalletConnection();

    // Set sample statistics
    document.getElementById('totalVoters').textContent = '2,847';

    console.log('Governance initialized successfully');

  } catch (error) {
    console.error('Failed to initialize governance:', error);
    showError('Failed to load governance data');
  }
}

// Tab functionality
function initializeTabs() {
  console.log('Initializing tabs...');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      console.log('Switching to tab:', targetTab);

      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
  console.log('Tabs initialized');
}

// Load and display proposals
async function loadProposals() {
  console.log('Loading proposals...');
  const proposalsList = document.getElementById('proposalsList');

  try {
    if (sampleProposals.length === 0) {
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

    for (const proposal of sampleProposals) {
      const proposalCard = await createProposalCard(
        proposal.id,
        proposal.description,
        proposal.votesFor,
        proposal.votesAgainst,
        proposal.deadline,
        proposal.executed
      );
      proposalsList.appendChild(proposalCard);
    }

    // Update hero stats with sample data
    document.getElementById('totalProposals').textContent = sampleProposals.filter(p => p.status === 'active').length;

    console.log('Proposals loaded successfully, total:', sampleProposals.length);

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
}async function createProposalCard(id, description, votesFor, votesAgainst, deadline, executed) {
  const now = Math.floor(Date.now() / 1000);
  const isActive = !executed && now <= deadline;
  const isEnded = !executed && now > deadline;

  const totalVotes = votesFor + votesAgainst;
  const forPercentage = totalVotes > 0 ? Math.round((votesFor / totalVotes) * 100) : 0;

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
  card.setAttribute('data-proposal-id', id);

  // For demo purposes, simulate random voting status
  let hasVoted = Math.random() > 0.7; // 30% chance user has voted

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
        <div class="vote-count">${(votesFor / 1000).toLocaleString()}K</div>
        <div class="vote-label">For</div>
      </div>
      <div class="vote-option against">
        <div class="vote-count">${(votesAgainst / 1000).toLocaleString()}K</div>
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
        <button class="vote-button for" onclick="voteOnProposal(${id}, true)">
          <span>👍</span> Vote For
        </button>
        <button class="vote-button against" onclick="voteOnProposal(${id}, false)">
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
  // Check wallet connection first
  if (!userAccount) {
    // Try to connect wallet if not connected
    const connected = await connectWallet();
    if (!connected) {
      showError('Please connect your wallet to vote');
      return;
    }
  }

  try {
    showLoading('Submitting vote...');

    // Simulate voting delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demonstration purposes, show success and update UI
    const supportText = support ? 'For' : 'Against';
    showSuccess(`Vote "${supportText}" submitted successfully for Proposal #${id}!`);

    // Update the proposal card to show user has voted
    const proposalCard = document.querySelector(`[data-proposal-id="${id}"]`);
    if (proposalCard) {
      const actionsDiv = proposalCard.querySelector('.proposal-actions');
      actionsDiv.innerHTML = `
        <div class="voted-indicator">
          <span>✅</span> You voted ${supportText}
        </div>
      `;
    }

    // In a real implementation, this would interact with the smart contract
    // await governanceWrite.vote(id, support);

  } catch (error) {
    console.error('Voting error:', error);
    showError('Failed to submit vote: ' + error.message);
  }
};

window.executeProposal = async function(id) {
  // Check wallet connection first
  if (!userAccount) {
    // Try to connect wallet if not connected
    const connected = await connectWallet();
    if (!connected) {
      showError('Please connect your wallet to execute proposals');
      return;
    }
  }

  try {
    showLoading('Executing proposal...');

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    showSuccess(`Proposal #${id} executed successfully!`);

    // Update the proposal card to show executed status
    const proposalCard = document.querySelector(`[data-proposal-id="${id}"]`);
    if (proposalCard) {
      const statusDiv = proposalCard.querySelector('.proposal-status');
      statusDiv.textContent = 'Executed';
      statusDiv.className = 'proposal-status executed';

      const actionsDiv = proposalCard.querySelector('.proposal-actions');
      actionsDiv.innerHTML = `
        <div class="executed-indicator">
          <span>✅</span> Proposal Executed
        </div>
      `;
    }

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

      console.log('Form submitted, checking wallet connection...');
      console.log('Current userAccount:', userAccount);
      console.log('window.ethereum exists:', !!window.ethereum);
      console.log('window.ethereum.selectedAddress:', window.ethereum?.selectedAddress);

      // Check wallet connection first
      if (!userAccount) {
        console.log('No userAccount found, attempting to connect...');
        // Try to connect wallet if not connected
        const connected = await connectWallet();
        if (!connected) {
          showError('Please connect your wallet to create a proposal');
          return;
        }
      }

      const description = document.getElementById('proposalDesc').value.trim();
      const duration = parseInt(document.getElementById('proposalDuration').value);

      if (!description) {
        showError('Please enter a proposal description');
        return;
      }

      try {
        showLoading('Creating proposal...');

        // Simulate proposal creation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create new proposal object
        const newProposal = {
          id: sampleProposals.length, // Use next available ID
          description: description,
          votesFor: 0,
          votesAgainst: 0,
          deadline: Math.floor(Date.now() / 1000) + (duration * 24 * 60 * 60), // Convert days to seconds
          executed: false,
          status: 'active'
        };

        // Add to proposals array
        sampleProposals.push(newProposal);

        console.log('New proposal created:', newProposal);

        // For demonstration purposes, show success
        showSuccess('Proposal created successfully! It will appear in the active proposals list.');
        document.getElementById('proposalDesc').value = '';

        // Refresh the proposals display
        await loadProposals();

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
      document.getElementById('votingPower').textContent = '1,250';
      loadProposals();
    } else {
      userAccount = null;
      document.getElementById('votingPower').textContent = '0';
    }
  });
}

// Initialize when page loads
window.addEventListener('load', initializeGovernance);
