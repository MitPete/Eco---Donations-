const donationContractAddress = "0xYourContractAddress"; // replace with deployed contract address

const donationAbi = [
  {
    "inputs": [
      { "internalType": "uint8", "name": "foundation", "type": "uint8" },
      { "internalType": "string", "name": "message", "type": "string" }
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ],
    "name": "foundationDonations",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint8", "name": "foundation", "type": "uint8" },
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "message", "type": "string" }
    ],
    "name": "DonationMade",
    "type": "event"
  }
];

let provider;
let signer;
let donationContract;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected");
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  donationContract = new ethers.Contract(donationContractAddress, donationAbi, signer);
  document.getElementById("connectButton").innerText = "Wallet Connected";
}

async function sendDonation() {
  if (!donationContract) {
    alert("Connect wallet first");
    return false;
  }
  const foundation = document.getElementById("foundation").value;
  const message = document.getElementById("message").value;
  const amount = document.getElementById("amount").value;
  const overrides = { value: ethers.utils.parseEther(amount) };
  const tx = await donationContract.donate(foundation, message, overrides);
  document.getElementById("txStatus").innerText = "Waiting for confirmation...";
  await tx.wait();
  document.getElementById("txStatus").innerText = "Donation successful!";
  return false;
}

async function loadHistory() {
  if (!window.ethereum) {
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(donationContractAddress, donationAbi, provider);

  // Load totals
  const totalList = document.getElementById("totals");
  const foundations = ["Save The Oceans", "Protect The Rainforest", "Protect The Sequoias", "Clean Energy"];
  totalList.innerHTML = "";
  for (let i = 0; i < foundations.length; i++) {
    const total = await contract.foundationDonations(i);
    const li = document.createElement("li");
    li.textContent = `${foundations[i]}: ${ethers.utils.formatEther(total)} ETH`;
    totalList.appendChild(li);
  }

  // Load donation events
  const tableBody = document.querySelector("#donationTable tbody");
  tableBody.innerHTML = "";
  const filter = contract.filters.DonationMade();
  const events = await contract.queryFilter(filter, 0, "latest");
  events.forEach(ev => {
    const row = document.createElement("tr");
    const cells = [
      foundations[ev.args.foundation],
      ev.args.sender,
      ethers.utils.formatEther(ev.args.amount),
      ev.args.message
    ];
    cells.forEach(text => {
      const td = document.createElement("td");
      td.textContent = text;
      row.appendChild(td);
    });
    tableBody.appendChild(row);
  });
}
