#!/bin/bash

echo "📚 Creating Comprehensive Beta Documentation & Guides..."
echo "====================================================="

echo ""
echo "🎯 Setting up documentation structure..."

# Create documentation directories
mkdir -p docs/{user-guides,technical,video-scripts,troubleshooting}
mkdir -p beta-testing/{onboarding,tutorials,FAQ}

echo "✅ Documentation directories created"

# 1. Beta Tester Onboarding Guide
echo "📖 Creating Beta Tester Onboarding Guide..."

cat > beta-testing/onboarding/BETA_TESTER_GUIDE.md << 'EOF'
# 🌱 Welcome to ECO Donations Beta Testing!

> **Thank you for joining our beta program!** Your feedback is crucial for making ECO Donations the best platform for environmental giving.

---

## 🎯 **What is ECO Donations?**

ECO Donations is a blockchain-powered platform that revolutionizes environmental giving by:

- 🌍 **Direct Impact**: Donate directly to verified environmental foundations
- 🪙 **Earn ECO Tokens**: Get rewarded with ECO tokens for every donation
- 🗳️ **Community Governance**: Vote on platform decisions and new foundation partnerships
- 🤖 **Auto-Donations**: Set up automatic recurring donations
- 🏆 **Impact NFTs**: Receive unique NFTs as proof of your environmental impact

---

## 🚀 **Getting Started - 5 Simple Steps**

### **Step 1: Set Up Your Wallet** 💳
1. **Install MetaMask** (if you don't have it):
   - Visit [metamask.io](https://metamask.io)
   - Install the browser extension
   - Create a new wallet or import existing one

2. **Connect to Sepolia Testnet**:
   - Open MetaMask
   - Click network dropdown (usually shows "Ethereum Mainnet")
   - Select "Sepolia test network"
   - If not visible, enable "Show test networks" in Settings

3. **Get Test ETH**:
   - Visit [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de)
   - Enter your wallet address
   - Wait for test ETH (usually 1-2 minutes)

### **Step 2: Access the Platform** 🌐
1. Visit: **[YOUR_BETA_URL]**
2. Click "Connect Wallet" in the top right
3. Select MetaMask and approve connection
4. You should see your wallet address displayed

### **Step 3: Make Your First Donation** 💚
1. Go to the **Donate** page
2. Choose a foundation:
   - 🌊 **Save The Oceans** - Marine conservation
   - 🌳 **Protect The Rainforest** - Forest preservation
   - 🌲 **Protect The Sequoias** - Ancient tree protection
   - ⚡ **Clean Energy** - Renewable energy projects

3. Enter donation amount (minimum 0.001 ETH)
4. Add a personal message (optional)
5. Click "Donate Now"
6. Confirm transaction in MetaMask

### **Step 4: Claim Your Rewards** 🪙
1. After donation confirms, go to **Dashboard**
2. See your ECO token balance (10x your ETH donation)
3. View your Impact NFT in the **History** section
4. Check your environmental impact stats

### **Step 5: Participate in Governance** 🗳️
1. Visit the **Governance** page
2. Browse active proposals
3. Use your ECO tokens to vote
4. Submit your own proposals (requires 100+ ECO tokens)

---

## 🧪 **What We Want You to Test**

### **Priority Testing Areas:**

#### **1. Donation Flow** (⭐⭐⭐⭐⭐ Critical)
- [ ] Test donations to all 4 foundations
- [ ] Try different donation amounts
- [ ] Test with and without messages
- [ ] Verify ECO tokens are received
- [ ] Check NFT generation

#### **2. Wallet Integration** (⭐⭐⭐⭐⭐ Critical)
- [ ] Connect/disconnect wallet multiple times
- [ ] Test network switching
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile devices

#### **3. Governance Features** (⭐⭐⭐⭐ High)
- [ ] View proposals
- [ ] Cast votes on proposals
- [ ] Create new proposals (if you have enough tokens)
- [ ] Check voting history

#### **4. Auto-Donation Setup** (⭐⭐⭐ Medium)
- [ ] Set up recurring donations
- [ ] Test different intervals (daily, weekly, monthly)
- [ ] Cancel auto-donations
- [ ] Modify existing auto-donations

#### **5. User Experience** (⭐⭐⭐⭐ High)
- [ ] Test on mobile phones
- [ ] Test on tablets
- [ ] Navigate all pages
- [ ] Check loading times
- [ ] Test error scenarios (insufficient balance, etc.)

---

## 🐛 **How to Report Issues**

### **When You Find a Bug:**
1. **Take a screenshot** of the issue
2. **Note the exact steps** to reproduce
3. **Record your browser/device info**
4. **Submit via our feedback form**: [FEEDBACK_FORM_URL]

### **Bug Report Template:**
```
**Issue Title**: Brief description
**Severity**: Critical / High / Medium / Low
**Steps to Reproduce**:
1. Go to...
2. Click on...
3. Error occurs...

**Expected Result**: What should happen
**Actual Result**: What actually happened
**Browser**: Chrome/Safari/Firefox + version
**Device**: Desktop/Mobile/Tablet
**Screenshot**: [Attach image]
```

---

## 💡 **Testing Tips**

### **Best Practices:**
- 🔄 **Test Multiple Times**: Try the same action several times
- 📱 **Test Different Devices**: Desktop, mobile, tablet
- 🌐 **Test Different Browsers**: Chrome, Safari, Firefox, Edge
- ⚡ **Test Edge Cases**: Very small donations, very large donations
- 🐌 **Test Slow Networks**: Throttle your connection to test loading
- ❌ **Test Error Scenarios**: Cancel transactions, insufficient balance

### **What to Look For:**
- ✅ **Functionality**: Does everything work as expected?
- 🎨 **Design**: Is the interface intuitive and appealing?
- ⚡ **Performance**: Are pages loading quickly?
- 📱 **Responsiveness**: Does it work well on mobile?
- 🛡️ **Security**: Do you feel safe using the platform?

---

## 🎁 **Beta Tester Rewards**

As a thank you for your valuable time:

- 🏆 **Exclusive Beta Tester NFT**: Special recognition badge
- 🪙 **Bonus ECO Tokens**: Extra tokens for active participation
- 🌟 **Early Access**: First access to new features
- 📈 **Governance Influence**: Your feedback shapes the platform

---

## 📞 **Support & Contact**

### **Need Help?**
- 📧 **Email**: beta-support@eco-donations.com
- 💬 **Discord**: [DISCORD_INVITE_URL]
- 📋 **FAQ**: See troubleshooting guide below
- ⏰ **Response Time**: Within 24 hours

### **Beta Testing Schedule**
- **Beta Phase 1**: August 15-22, 2025 (Core functionality)
- **Beta Phase 2**: August 23-30, 2025 (Advanced features)
- **Feedback Deadline**: August 30, 2025
- **Mainnet Launch**: September 15, 2025

---

## 🎬 **Video Tutorials**

Coming soon! We'll provide video walkthroughs for:
- Setting up MetaMask for testing
- Making your first donation
- Participating in governance
- Setting up auto-donations

---

**Ready to start testing?** 🚀 Visit [YOUR_BETA_URL] and let's make environmental giving better together!

---

*Questions? Feedback? We're here to help! Thank you for being part of the ECO Donations beta community.* 🌱
EOF

echo "✅ Beta Tester Onboarding Guide created"

# 2. Step-by-Step Donation Tutorial
echo "📖 Creating Donation Tutorial..."

cat > beta-testing/tutorials/DONATION_TUTORIAL.md << 'EOF'
# 💚 Step-by-Step Donation Tutorial

> **Learn how to make your first environmental donation and earn ECO tokens!**

---

## 🎯 **Tutorial Overview**

**Time Required**: 5-10 minutes
**Prerequisites**: MetaMask wallet with Sepolia test ETH
**What You'll Learn**: Complete donation process from start to finish

---

## 📋 **Before You Start**

### **Required Setup:**
- ✅ MetaMask installed and set up
- ✅ Connected to Sepolia testnet
- ✅ Have test ETH in your wallet (get from faucet)
- ✅ Platform connection working

---

## 🚀 **Step-by-Step Donation Process**

### **Step 1: Navigate to Donation Page**
1. Open ECO Donations platform
2. Ensure wallet is connected (see address in top right)
3. Click **"Donate"** in the navigation menu
4. You should see the donation interface

### **Step 2: Choose Your Foundation**
Four verified environmental foundations available:

**🌊 Save The Oceans**
- Focus: Marine conservation and ocean cleanup
- Impact: Protecting marine ecosystems

**🌳 Protect The Rainforest**
- Focus: Rainforest preservation and restoration
- Impact: Combating deforestation

**🌲 Protect The Sequoias**
- Focus: Ancient tree conservation
- Impact: Preserving old-growth forests

**⚡ Clean Energy**
- Focus: Renewable energy projects
- Impact: Reducing carbon emissions

**Action**: Click on the foundation card you want to support

### **Step 3: Enter Donation Amount**

**Donation Limits:**
- **Minimum**: 0.001 ETH (~$2-3)
- **Maximum**: 100 ETH
- **Recommended**: 0.01-0.1 ETH for testing

**What You'll Receive:**
- **ECO Tokens**: 10x your ETH donation amount
- **Impact NFT**: Unique digital certificate
- **Foundation Receipt**: Proof of donation

**Action**: Enter your desired donation amount

### **Step 4: Add Personal Message (Optional)**

**Message Guidelines:**
- Maximum 500 characters
- Can include why you're donating
- Will be stored permanently on blockchain
- Visible in your donation history

**Example Messages:**
- "Supporting ocean cleanup for future generations 🌊"
- "Every tree matters for our planet 🌳"
- "Let's build a cleaner energy future ⚡"

**Action**: Type your message or leave blank

### **Step 5: Review & Confirm Donation**

**Review Screen Shows:**
- Foundation selected
- Donation amount in ETH
- ECO tokens you'll receive
- Estimated gas fees
- Your message (if added)

**Action**: Click "Donate Now" when ready

### **Step 6: MetaMask Transaction**

**What Happens:**
1. MetaMask popup opens
2. Shows transaction details:
   - **To**: Foundation wallet address
   - **Amount**: Your donation amount
   - **Gas Fee**: Network transaction cost
   - **Total**: Amount + Gas

3. **Review carefully** - blockchain transactions are permanent
4. Click "Confirm" to proceed

**If Transaction Fails:**
- Check you have enough ETH (amount + gas)
- Ensure you're on Sepolia network
- Try again with higher gas price

### **Step 7: Transaction Processing**

**Processing Stages:**
1. **Submitted**: Transaction sent to blockchain
2. **Pending**: Waiting for network confirmation
3. **Confirmed**: Transaction successful
4. **Complete**: Tokens and NFT issued

**Visual Indicators:**
- Spinner shows processing
- Progress bar updates
- Success message when complete

**Timing**: Usually 15-60 seconds on Sepolia

### **Step 8: Verify Your Rewards**

**Check Dashboard:**
1. Go to **Dashboard** page
2. Verify ECO token balance increased
3. See donation statistics updated

**Check History:**
1. Go to **History** page
2. See your new donation record
3. View your Impact NFT
4. See foundation receipt

**Check MetaMask:**
1. Open MetaMask
2. Check transaction history
3. Verify ETH balance decreased

---

## 🎉 **Congratulations!**

You've successfully:
- ✅ Made an environmental donation
- ✅ Earned ECO tokens
- ✅ Received an Impact NFT
- ✅ Contributed to positive environmental change

---

## 🔄 **Try Different Scenarios**

**For Complete Testing:**

### **Small Donation Test**
- Amount: 0.001 ETH (minimum)
- Foundation: Any
- Message: "Testing minimum donation"

### **Large Donation Test**
- Amount: 0.1 ETH
- Foundation: Different from first
- Message: "Testing larger amount"

### **All Foundations Test**
- Make small donations to all 4 foundations
- Compare the different Impact NFTs
- Check if token rewards are consistent

### **Message Variations**
- Try with and without messages
- Test maximum character limit (500)
- Use different languages/emojis

---

## ❌ **Troubleshooting Common Issues**

### **"Insufficient Balance" Error**
**Cause**: Not enough ETH for donation + gas
**Solution**:
- Get more test ETH from faucet
- Try smaller donation amount

### **"Transaction Failed" Error**
**Cause**: Network congestion or wrong network
**Solution**:
- Ensure you're on Sepolia testnet
- Wait and try again
- Increase gas price in MetaMask

### **"Wallet Not Connected" Error**
**Cause**: MetaMask disconnected
**Solution**:
- Refresh page
- Click "Connect Wallet" again
- Check MetaMask is unlocked

### **Slow Transaction**
**Cause**: Network congestion
**Solution**:
- Be patient (can take 1-5 minutes)
- Check transaction on [Sepolia Etherscan](https://sepolia.etherscan.io)
- Don't submit again (creates duplicate)

### **No ECO Tokens Received**
**Cause**: Transaction still processing or failed
**Solution**:
- Wait for full confirmation
- Check transaction success on Etherscan
- Refresh dashboard page

---

## 📊 **Understanding Your Impact**

### **Token Economics:**
- **1 ETH donated** = **10 ECO tokens received**
- ECO tokens can be used for:
  - Governance voting
  - Platform decision-making
  - Future reward programs

### **Impact Tracking:**
- Each donation creates permanent record
- NFTs provide verifiable proof
- Total impact visible on dashboard
- Foundation receives 100% of donation

---

## 🎬 **Video Tutorial** *(Coming Soon)*

Watch our complete video walkthrough showing:
- Real-time donation process
- MetaMask interaction
- Reward verification
- Troubleshooting tips

---

## 💡 **Pro Tips for Beta Testing**

1. **Test Multiple Browsers**: Chrome, Safari, Firefox
2. **Test Mobile Devices**: Phone and tablet interfaces
3. **Test Edge Cases**: Minimum amounts, maximum amounts
4. **Test Network Issues**: Slow connections, disconnections
5. **Document Everything**: Screenshots of any issues

---

**Ready to make a difference?** 🌱 Start your first donation and help us build the future of environmental giving!

*Having issues? Check our [Troubleshooting FAQ](../troubleshooting/FAQ.md) or contact beta support.*
EOF

echo "✅ Donation Tutorial created"

# 3. Governance Participation Guide
echo "📖 Creating Governance Guide..."

cat > beta-testing/tutorials/GOVERNANCE_GUIDE.md << 'EOF'
# 🗳️ Governance Participation Guide

> **Learn how to use your ECO tokens to shape the future of environmental giving!**

---

## 🎯 **What is ECO Governance?**

ECO Governance is a **decentralized decision-making system** where token holders vote on:

- 🌍 **New Foundation Partnerships**: Which environmental organizations to add
- ⚙️ **Platform Parameters**: Fee structures, reward rates, limits
- 🚀 **Feature Development**: What new features to prioritize
- 💰 **Treasury Management**: How to use platform funds
- 📋 **Policy Changes**: Platform rules and guidelines

**Your Voice Matters**: Every ECO token = 1 vote

---

## 🎫 **Voting Power & Requirements**

### **Voting Power:**
- **1 ECO Token** = **1 Vote**
- Tokens are locked during voting period
- Tokens returned after proposal concludes
- No minimum tokens required to vote

### **Proposal Creation:**
- **Minimum**: 100 ECO tokens required
- **Deposit**: 10 ECO tokens held until proposal concludes
- **Deposit Returned**: If proposal gets >10% participation
- **Deposit Lost**: If proposal gets <10% participation

---

## 🚀 **How to Participate in Governance**

### **Step 1: Access Governance Page**
1. Navigate to **Governance** in main menu
2. Ensure wallet is connected
3. Verify you have ECO tokens for voting

### **Step 2: Browse Active Proposals**

**Proposal Information Includes:**
- **Title & Description**: What's being proposed
- **Proposer**: Who submitted it
- **Voting Period**: Start and end dates
- **Current Status**: Active, Passed, Failed, Executed
- **Vote Tally**: Yes/No vote counts
- **Participation**: Total tokens voting

**Proposal Categories:**
- 🌍 **Foundation**: New environmental partners
- ⚙️ **Technical**: Platform improvements
- 💰 **Economic**: Token economics changes
- 📋 **Governance**: Voting system changes

### **Step 3: Research Proposals**

**Before Voting:**
- Read full proposal description
- Check proposal discussion (if available)
- Consider long-term implications
- Evaluate alignment with platform mission

**Key Questions:**
- Does this benefit environmental causes?
- Is the proposal technically feasible?
- Are there any risks or downsides?
- How does this affect the community?

### **Step 4: Cast Your Vote**

**Voting Process:**
1. Click on proposal you want to vote on
2. Review proposal details carefully
3. Choose your vote:
   - ✅ **YES**: Support the proposal
   - ❌ **NO**: Oppose the proposal
   - ⏭️ **ABSTAIN**: Neutral (counts toward quorum)

4. Enter number of ECO tokens to use
5. Click "Cast Vote"
6. Confirm transaction in MetaMask

**Voting Strategy Tips:**
- You can split tokens across multiple proposals
- Higher token commitment shows stronger conviction
- Consider saving tokens for high-impact proposals

### **Step 5: Monitor Results**

**Proposal Outcomes:**
- **Passed**: Majority YES votes + minimum quorum met
- **Failed**: Majority NO votes or insufficient participation
- **Executed**: Passed proposals implemented automatically
- **Expired**: Voting period ended without decision

---

## 📊 **Proposal Lifecycle**

### **1. Proposal Creation** (1-7 days)
- Community member submits proposal
- 100 ECO token minimum required
- Proposal reviewed for validity

### **2. Voting Period** (7 days)
- Community votes YES/NO/ABSTAIN
- Tokens locked during voting
- Real-time vote tracking

### **3. Execution Period** (1-3 days)
- Passed proposals implemented
- Failed proposals archived
- Tokens returned to voters

### **4. Implementation** (Varies)
- Technical changes deployed
- New partnerships activated
- Policy changes enforced

---

## 🎯 **Current Test Proposals** *(Beta Period)*

### **Proposal #1: Marine Foundation Partnership**
- **Type**: Foundation Partnership
- **Description**: Add "Ocean Cleanup Foundation" as 5th donation option
- **Voting Period**: August 15-22, 2025
- **Required**: Simple majority + 20% participation

### **Proposal #2: Auto-Donation Rewards**
- **Type**: Economic
- **Description**: 20% bonus ECO tokens for auto-donation users
- **Voting Period**: August 16-23, 2025
- **Required**: Simple majority + 30% participation

### **Proposal #3: Mobile App Development**
- **Type**: Technical
- **Description**: Prioritize native mobile app for iOS/Android
- **Voting Period**: August 17-24, 2025
- **Required**: Simple majority + 25% participation

---

## 📋 **How to Create Proposals** *(For Beta Testing)*

### **Proposal Creation Process:**

**Step 1: Preparation**
- Develop clear, detailed proposal
- Research similar proposals
- Gather community feedback
- Ensure you have 100+ ECO tokens

**Step 2: Proposal Submission**
1. Go to Governance page
2. Click "Create Proposal"
3. Fill out proposal form:
   - **Title**: Clear, descriptive (max 100 chars)
   - **Category**: Foundation/Technical/Economic/Governance
   - **Description**: Detailed explanation (max 2000 chars)
   - **Rationale**: Why this benefits the platform
   - **Implementation**: How it would be executed

4. Review and submit
5. Pay 10 ECO token deposit
6. Confirm transaction

**Step 3: Community Engagement**
- Share proposal in community channels
- Answer questions and feedback
- Build support for your proposal

### **Proposal Writing Tips:**

**Good Proposals Include:**
- Clear problem statement
- Specific solution details
- Implementation timeline
- Success metrics
- Risk assessment

**Example Template:**
```
Title: Add Solar Energy Foundation Partnership

Problem: Currently no renewable energy focused foundation

Solution: Partner with Solar Energy International (SEI)
- Verified 501(c)(3) non-profit
- 30+ years in solar education
- Global impact in developing countries

Implementation:
1. Due diligence review (2 weeks)
2. Smart contract update (1 week)
3. Frontend integration (1 week)
4. Marketing launch (ongoing)

Benefits:
- Expands renewable energy impact
- Attracts solar industry donors
- Diversifies foundation portfolio

Risks: Minimal - standard foundation onboarding
```

---

## 📊 **Voting Best Practices**

### **Research Before Voting:**
- Read proposal completely
- Check proposer's history
- Consider long-term impacts
- Ask questions in community

### **Strategic Voting:**
- **High Conviction**: Use more tokens
- **Low Conviction**: Use fewer tokens
- **Uncertainty**: Consider abstaining
- **Save Tokens**: For most important votes

### **Community Participation:**
- Engage in proposal discussions
- Share your voting rationale
- Help educate other voters
- Participate consistently

---

## ❌ **Troubleshooting Governance Issues**

### **"Insufficient Tokens" Error**
**Cause**: Trying to vote with more tokens than you have
**Solution**:
- Check your ECO token balance
- Vote with available tokens only
- Make more donations to earn tokens

### **"Proposal Not Found" Error**
**Cause**: Proposal ended or was removed
**Solution**:
- Refresh page
- Check proposal is still active
- Verify correct proposal ID

### **"Transaction Failed" Error**
**Cause**: Network issues or insufficient gas
**Solution**:
- Ensure enough ETH for gas
- Try again with higher gas price
- Check network connection

### **Tokens Still Locked**
**Cause**: Proposal voting period not ended
**Solution**:
- Wait for proposal to conclude
- Check proposal end date
- Tokens auto-unlock after conclusion

---

## 🎁 **Governance Rewards** *(Future Features)*

**Coming to Mainnet:**
- 🏆 **Voting Streaks**: Bonus tokens for consistent participation
- 📊 **Proposal Success**: Rewards for successful proposals
- 🎖️ **Governance NFTs**: Special badges for active participants
- 💰 **Fee Sharing**: Revenue sharing for governance participants

---

## 📈 **Your Governance Impact**

**Track Your Participation:**
- **Proposals Voted**: Total voting participation
- **Tokens Used**: Cumulative voting power exercised
- **Success Rate**: % of your votes on winning side
- **Proposals Created**: Your contributions to governance

**Community Impact:**
- Shape platform direction
- Influence environmental partnerships
- Guide technical development
- Build sustainable governance

---

## 🎬 **Video Tutorial** *(Coming Soon)*

Watch our governance walkthrough covering:
- How to evaluate proposals
- Voting strategies and best practices
- Creating effective proposals
- Understanding governance impact

---

## 💡 **Beta Testing Focus Areas**

### **Test These Governance Features:**
- [ ] View all active proposals
- [ ] Cast votes with different token amounts
- [ ] Try creating a test proposal (if you have 100+ tokens)
- [ ] Check voting history and results
- [ ] Test proposal filtering and search
- [ ] Verify token locking/unlocking
- [ ] Test on mobile devices

### **Report These Issues:**
- Voting transaction failures
- Token balance display errors
- Proposal loading issues
- Mobile interface problems
- Unclear voting instructions

---

**Ready to shape the future?** 🌱 Your vote matters in building the world's best environmental giving platform!

*Need help? Check our [Troubleshooting FAQ](../troubleshooting/FAQ.md) or contact beta support.*
EOF

echo "✅ Governance Guide created"

# 4. Troubleshooting FAQ
echo "📖 Creating Troubleshooting FAQ..."

cat > beta-testing/troubleshooting/FAQ.md << 'EOF'
# 🔧 Troubleshooting FAQ & Common Issues

> **Quick solutions to common problems during beta testing**

---

## 🚨 **Critical Issues** *(Immediate Solutions)*

### **🔗 Wallet Connection Problems**

#### **Issue**: "Wallet Not Connected" / Connection Keeps Dropping
**Symptoms**:
- Can't connect MetaMask
- Connection drops frequently
- "Connect Wallet" button not working

**Solutions**:
1. **Refresh the page** completely (Ctrl+F5 / Cmd+Shift+R)
2. **Unlock MetaMask** - ensure wallet is not locked
3. **Check Network**: Ensure you're on Sepolia testnet
4. **Clear Browser Cache**:
   - Chrome: Settings → Privacy → Clear browsing data
   - Safari: Develop → Empty Caches
5. **Try Incognito/Private Mode**: Test in private browser window
6. **Disable Browser Extensions**: Temporarily disable ad blockers
7. **Update MetaMask**: Ensure latest version installed

#### **Issue**: "Wrong Network" / "Switch to Sepolia"
**Solutions**:
1. **Manually Switch in MetaMask**:
   - Open MetaMask
   - Click network dropdown (top center)
   - Select "Sepolia test network"
2. **Enable Test Networks**:
   - MetaMask Settings → Advanced
   - Toggle "Show test networks" ON
3. **Add Sepolia Manually**:
   - Network Name: Sepolia
   - RPC URL: https://sepolia.infura.io/v3/
   - Chain ID: 11155111
   - Currency: ETH

---

## 💰 **Transaction & Balance Issues**

### **💸 Insufficient Balance Problems**

#### **Issue**: "Insufficient Balance for Transaction"
**Cause**: Not enough ETH for donation + gas fees
**Solutions**:
1. **Get Test ETH**:
   - Visit [Sepolia Faucet](https://sepolia-faucet.pk910.de)
   - Enter your wallet address
   - Wait 1-2 minutes for ETH delivery
2. **Reduce Donation Amount**: Try smaller amount
3. **Check Gas Settings**: Lower gas price in MetaMask
4. **Wait for Network**: Try during less congested times

#### **Issue**: "Transaction Failed" / "Out of Gas"
**Solutions**:
1. **Increase Gas Limit**:
   - In MetaMask, click "Edit" on gas settings
   - Increase gas limit to 100,000-200,000
2. **Increase Gas Price**: Use "Fast" or "Aggressive" settings
3. **Try Again**: Network congestion may have cleared
4. **Check Balance**: Ensure sufficient ETH after gas

### **🪙 ECO Token Issues**

#### **Issue**: ECO Tokens Not Received After Donation
**Causes & Solutions**:
1. **Transaction Still Processing**:
   - Wait 1-5 minutes for full confirmation
   - Check [Sepolia Etherscan](https://sepolia.etherscan.io)
2. **Transaction Failed**:
   - Check transaction hash on Etherscan
   - If failed, retry donation
3. **Display Issue**:
   - Refresh dashboard page
   - Hard refresh (Ctrl+F5)
   - Check different page (History)

#### **Issue**: Wrong ECO Token Amount
**Expected**: 10 ECO per 1 ETH donated
**Check**:
- Verify donation amount was correct
- Check if multiple donations combined
- Refresh page to update display

---

## 🎨 **Interface & Display Issues**

### **📱 Mobile Interface Problems**

#### **Issue**: Buttons Too Small / Hard to Click
**Solutions**:
1. **Zoom Out**: Pinch to zoom out on mobile
2. **Rotate Device**: Try landscape orientation
3. **Use Different Browser**: Try Chrome mobile, Safari, Firefox
4. **Report Issue**: Note device/browser for our fixes

#### **Issue**: Pages Don't Load Properly on Mobile
**Solutions**:
1. **Clear Mobile Browser Cache**:
   - Chrome: Settings → Privacy → Clear browsing data
   - Safari: Settings → Safari → Clear History and Data
2. **Disable Data Saver**: Turn off data compression
3. **Try Desktop**: Compare with desktop version
4. **Report**: Include device model and browser version

### **🖥️ Desktop Interface Issues**

#### **Issue**: Layout Broken / Elements Overlapping
**Solutions**:
1. **Zoom Level**: Ensure browser zoom is 100%
2. **Window Size**: Try full screen or different size
3. **Browser Compatibility**: Test Chrome, Firefox, Safari, Edge
4. **Clear Cache**: Hard refresh or clear browser data
5. **Disable Extensions**: Try without ad blockers

#### **Issue**: Pages Load Slowly / Hang
**Solutions**:
1. **Check Internet Speed**: Test connection speed
2. **Close Other Tabs**: Free up browser memory
3. **Try Different Time**: Test during off-peak hours
4. **Different Browser**: Compare performance
5. **Report Performance**: Note timing and conditions

---

## 🗳️ **Governance Issues**

### **Issue**: "Insufficient Tokens to Vote"
**Solutions**:
1. **Check Token Balance**: Verify you have ECO tokens
2. **Make Donations**: Earn tokens through donations
3. **Reduce Vote Amount**: Use fewer tokens for voting
4. **Wait for Tokens**: Ensure donation transactions confirmed

### **Issue**: "Voting Transaction Failed"
**Solutions**:
1. **Check Proposal Status**: Ensure proposal still active
2. **Increase Gas**: Use higher gas settings
3. **Try Smaller Amount**: Vote with fewer tokens
4. **Refresh Page**: Reload governance page

### **Issue**: Tokens Locked After Voting
**This is Normal**: Tokens lock during voting period
**Solutions**:
- **Wait**: Tokens unlock when proposal ends
- **Check End Date**: See when voting period concludes
- **Use Other Tokens**: Vote with remaining unlocked tokens

---

## 🤖 **Auto-Donation Issues**

### **Issue**: Can't Set Up Auto-Donation
**Solutions**:
1. **Check Balance**: Ensure sufficient ETH for setup
2. **Valid Parameters**: Check amount and interval limits
3. **Approve Tokens**: May need token approval transaction
4. **Try Different Amount**: Start with smaller amounts

### **Issue**: Auto-Donation Not Executing
**Solutions**:
1. **Check Balance**: Ensure wallet has enough ETH
2. **Verify Schedule**: Confirm next execution time
3. **Check Status**: See if auto-donation is still active
4. **Manual Trigger**: Try canceling and recreating

---

## 🔍 **General Troubleshooting Steps**

### **🔄 Standard Reset Procedure**
When encountering any issue:

1. **Refresh Page**: Hard refresh (Ctrl+F5 / Cmd+Shift+R)
2. **Check MetaMask**: Ensure unlocked and connected
3. **Verify Network**: Confirm Sepolia testnet selected
4. **Check Balance**: Ensure sufficient ETH for gas
5. **Clear Cache**: Browser cache and site data
6. **Try Incognito**: Test in private browsing mode
7. **Different Browser**: Test with another browser
8. **Different Device**: Try mobile/desktop alternative

### **📊 Diagnostic Information to Collect**

**Before Reporting Issues, Gather**:
- **Browser**: Name and version
- **Device**: Desktop/mobile/tablet + OS version
- **MetaMask Version**: Found in MetaMask settings
- **Error Message**: Exact text of any errors
- **Transaction Hash**: If transaction-related
- **Screenshots**: Visual evidence of issue
- **Steps to Reproduce**: Exact sequence that causes issue

---

## 📞 **Getting Additional Help**

### **🔗 Useful Links**
- **Sepolia Faucet**: [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de)
- **Sepolia Explorer**: [sepolia.etherscan.io](https://sepolia.etherscan.io)
- **MetaMask Support**: [support.metamask.io](https://support.metamask.io)

### **📧 Contact Beta Support**
**When to Contact Support**:
- Issue persists after trying solutions
- Potential security concerns
- Feature requests or suggestions
- Technical questions about platform

**How to Contact**:
- **Email**: beta-support@eco-donations.com
- **Subject**: Include "BETA:" prefix
- **Include**: All diagnostic information above
- **Response Time**: Within 24 hours

### **📋 Issue Priority Levels**

**🔴 CRITICAL**: Platform unusable, security issues
- Immediate attention required
- Blocking core functionality

**🟡 HIGH**: Major features not working
- Donations failing consistently
- Wallet connection completely broken

**🟢 MEDIUM**: Minor issues, workarounds available
- UI display problems
- Performance issues

**🔵 LOW**: Enhancement requests, cosmetic issues
- Text improvements
- Design suggestions

---

## 🧪 **Beta Testing Best Practices**

### **🔍 Effective Bug Reporting**
1. **Try to Reproduce**: Test issue multiple times
2. **Isolate Variables**: Test with different browsers/devices
3. **Document Steps**: Write exact reproduction steps
4. **Include Context**: What were you trying to accomplish?
5. **Provide Screenshots**: Visual evidence helps
6. **Note Environment**: Browser, device, network conditions

### **⚡ Quick Testing Tips**
- **Test Edge Cases**: Minimum/maximum values
- **Test Error Scenarios**: Cancelled transactions, insufficient balance
- **Test Different Browsers**: Chrome, Safari, Firefox, Edge
- **Test Mobile**: Both phone and tablet interfaces
- **Test Connectivity**: Slow networks, intermittent connections

---

## 📈 **Common User Mistakes** *(Not Platform Issues)*

### **❌ Things That Are User Error**:
- Using Ethereum mainnet instead of Sepolia testnet
- Not having enough ETH for gas fees
- Canceling transactions in MetaMask
- Not waiting for transaction confirmations
- Using expired or invalid wallet addresses

### **✅ How to Avoid**:
- Always double-check network (should be Sepolia)
- Keep extra ETH for gas (0.01 ETH minimum)
- Be patient with transaction processing
- Confirm all details before submitting
- Read error messages carefully

---

**Still having issues?** Don't worry! Our team is here to help. Contact beta support with your specific problem and we'll get you back to testing quickly! 🚀

*Remember: You're helping us build a better platform with every issue you report!* 🌱
EOF

echo "✅ Troubleshooting FAQ created"

# 5. Video Script Planning
echo "📖 Creating Video Script..."

cat > docs/video-scripts/BETA_WALKTHROUGH_SCRIPT.md << 'EOF'
# 🎬 ECO Donations Beta Walkthrough - Video Script

> **5-7 Minute Video Tutorial for Beta Testers**

---

## 🎯 **Video Overview**

**Target Length**: 5-7 minutes
**Target Audience**: Beta testers, new to crypto/DeFi
**Goal**: Complete platform walkthrough with confidence building
**Style**: Friendly, professional, encouraging

---

## 📝 **Script Outline**

### **[0:00-0:30] Opening & Welcome** *(30 seconds)*

**On Screen**: ECO Donations logo, beta tester welcome screen
**Narrator**:
> "Welcome to ECO Donations beta testing! I'm excited to show you how our platform is revolutionizing environmental giving through blockchain technology. In the next 5 minutes, you'll learn everything you need to confidently test our platform and provide valuable feedback. Let's dive in!"

**Actions**:
- Show platform homepage
- Highlight beta testing badge
- Quick overview of interface

### **[0:30-1:30] Platform Overview** *(60 seconds)*

**On Screen**: Dashboard overview, feature highlights
**Narrator**:
> "ECO Donations combines the power of blockchain with environmental impact. Here's what makes us special: First, you donate directly to verified environmental foundations using cryptocurrency. Second, you earn ECO tokens as rewards - that's 10 tokens for every 1 ETH donated. Third, you receive unique Impact NFTs as permanent proof of your contribution. And fourth, you can participate in governance to help shape the platform's future."

**Actions**:
- Navigate through main pages
- Show donation interface briefly
- Highlight token rewards
- Show governance section

### **[1:30-2:00] Prerequisites Check** *(30 seconds)*

**On Screen**: MetaMask installation, Sepolia setup
**Narrator**:
> "Before we start, make sure you have MetaMask installed and connected to Sepolia testnet. If you need test ETH, visit the Sepolia faucet - we've linked it in the description. Don't worry, this is all free testing currency with no real value. Once you're set up, come back and let's make your first donation!"

**Actions**:
- Show MetaMask interface
- Demonstrate network switching
- Show faucet website quickly

### **[2:00-4:00] Complete Donation Walkthrough** *(2 minutes)*

**On Screen**: Full donation process
**Narrator**:
> "Now let's make a donation! I'll click on the Donate page, and here we see four amazing environmental foundations. I'll choose 'Save the Oceans' for this demonstration.

> I'll enter 0.01 ETH - that's about $20-30 in value, but remember, this is just test currency. I can add a personal message here, something like 'Testing for a better tomorrow!'

> When I click 'Donate Now', MetaMask opens showing the transaction details. I can see the amount going to the foundation and the gas fee for the network. Everything looks good, so I'll confirm.

> Now we wait for blockchain confirmation - usually 30-60 seconds on Sepolia. Great! The transaction is confirmed. Let's see what happened..."

**Actions**:
- Navigate to donate page
- Select foundation
- Enter amount and message
- Show MetaMask transaction
- Wait for confirmation
- Show success state

### **[4:00-5:00] Rewards & Impact Verification** *(60 seconds)*

**On Screen**: Dashboard showing rewards, History page
**Narrator**:
> "Amazing! Let's check our rewards. On the dashboard, I can see my ECO token balance increased by 0.1 tokens - that's 10x my donation amount. My total environmental impact is also tracking.

> In the History section, here's my donation record with all the details, and look at this - my unique Impact NFT! This is permanent proof of my environmental contribution, stored forever on the blockchain.

> This transparency is what makes blockchain giving so powerful - every donation is verifiable and permanent."

**Actions**:
- Show dashboard with updated balances
- Navigate to history page
- Highlight the NFT
- Show transaction details

### **[5:00-6:00] Governance Preview** *(60 seconds)*

**On Screen**: Governance page, active proposals
**Narrator**:
> "Now that I have ECO tokens, I can participate in governance! Here's where token holders vote on platform decisions. I can see active proposals about adding new foundations, changing platform parameters, or developing new features.

> Voting is simple - I select a proposal, choose my vote, decide how many tokens to use, and submit. My tokens get locked during voting but are returned afterward. This ensures every vote represents real stake in the platform."

**Actions**:
- Navigate to governance
- Show active proposals
- Demonstrate voting interface (without actually voting)
- Explain token locking

### **[6:00-6:30] Testing Guidance** *(30 seconds)*

**On Screen**: Testing checklist, bug report form
**Narrator**:
> "As a beta tester, please try different scenarios: test on mobile devices, try different browsers, test with various donation amounts, and explore all the features. If you find any issues, use our feedback form to report them. Your testing helps us build a better platform for everyone!"

**Actions**:
- Show mobile interface briefly
- Highlight feedback mechanisms
- Show testing checklist

### **[6:30-7:00] Closing & Next Steps** *(30 seconds)*

**On Screen**: Support contact info, community links
**Narrator**:
> "Thank you for being part of our beta community! You're helping build the future of environmental giving. If you need help, check our FAQ, join our Discord, or email beta support. Together, we're making environmental impact more transparent, rewarding, and accessible. Happy testing!"

**Actions**:
- Show support resources
- Display community links
- End with logo and call-to-action

---

## 🎥 **Production Notes**

### **Visual Requirements**:
- **Screen Recording**: High-quality capture of platform
- **Annotations**: Arrows and highlights for key elements
- **Transitions**: Smooth between different sections
- **Brand Consistency**: ECO Donations colors and fonts

### **Audio Requirements**:
- **Clear Narration**: Professional, friendly tone
- **Background Music**: Subtle, environmentally-themed
- **Sound Effects**: Minimal, transaction confirmations
- **Audio Quality**: Studio-quality recording

### **Technical Specifications**:
- **Resolution**: 1080p minimum, 4K preferred
- **Frame Rate**: 30fps
- **Format**: MP4 for web compatibility
- **Captions**: Full closed captions for accessibility

---

## 📋 **Supplementary Materials**

### **Video Description Text**:
```
🌱 Welcome to ECO Donations Beta Testing!

This comprehensive walkthrough shows you everything you need to know to test our revolutionary environmental giving platform.

⏰ Timestamps:
0:00 - Welcome & Introduction
0:30 - Platform Overview
1:30 - Prerequisites Setup
2:00 - Making Your First Donation
4:00 - Verifying Rewards & Impact
5:00 - Governance Participation
6:00 - Testing Guidelines
6:30 - Support & Community

🔗 Useful Links:
• Beta Platform: [YOUR_BETA_URL]
• Sepolia Faucet: https://sepolia-faucet.pk910.de
• MetaMask Setup: https://metamask.io
• Bug Reports: [FEEDBACK_FORM_URL]
• Discord Community: [DISCORD_INVITE]
• Support Email: beta-support@eco-donations.com

🧪 What to Test:
✅ Donation flow on all foundations
✅ Mobile and desktop interfaces
✅ Multiple browsers (Chrome, Safari, Firefox)
✅ Governance voting
✅ Auto-donation setup
✅ Error scenarios and edge cases

Questions? Join our Discord or email beta support!

#ECODonations #EnvironmentalGiving #Blockchain #Beta #Testing
```

### **Social Media Clips** *(30-60 second excerpts)*:

**Clip 1: "What is ECO Donations?"** *(Platform Overview)*
- Focus: Unique value proposition
- Duration: 45 seconds
- Use: Twitter, LinkedIn

**Clip 2: "Making Your First Donation"** *(Donation Process)*
- Focus: Easy donation process
- Duration: 60 seconds
- Use: Instagram, TikTok

**Clip 3: "Earning Rewards"** *(Token Rewards)*
- Focus: Token economics
- Duration: 30 seconds
- Use: Twitter, Facebook

---

## 🎬 **Alternative Format Options**

### **Option A: Longer Comprehensive (10-15 minutes)**
- Detailed troubleshooting
- Multiple donation examples
- Advanced governance features
- Technical deep-dive

### **Option B: Series of Short Videos (2-3 minutes each)**
- Video 1: Setup & First Donation
- Video 2: Understanding Rewards
- Video 3: Governance Participation
- Video 4: Mobile Testing
- Video 5: Troubleshooting

### **Option C: Interactive Video Guide**
- Clickable elements
- Choose-your-own-path style
- Embedded directly in platform
- Context-sensitive help

---

## 📊 **Success Metrics**

### **Video Performance Goals**:
- **Completion Rate**: >80% finish rate
- **Engagement**: >5% like/comment rate
- **Conversion**: >60% viewers test platform
- **Support Reduction**: <20% support tickets about basics

### **Feedback Collection**:
- Post-video survey about clarity
- Track which sections cause confusion
- Monitor support tickets for common issues
- A/B test different explanations

---

**Ready for Production?** This script provides the foundation for a comprehensive beta testing video that will empower testers and reduce support load! 🎬🌱
EOF

echo "✅ Video Script created"

echo ""
echo "📚 COMPREHENSIVE Documentation & Guides Complete!"
echo "=============================================="
echo ""
echo "📁 Created Documentation Structure:"
echo "├── 📖 beta-testing/"
echo "│   ├── onboarding/BETA_TESTER_GUIDE.md"
echo "│   ├── tutorials/DONATION_TUTORIAL.md"
echo "│   ├── tutorials/GOVERNANCE_GUIDE.md"
echo "│   └── troubleshooting/FAQ.md"
echo "└── 📹 docs/video-scripts/BETA_WALKTHROUGH_SCRIPT.md"
echo ""
echo "🎯 Documentation Includes:"
echo "   ✅ Complete beta tester onboarding guide"
echo "   ✅ Step-by-step donation tutorial"
echo "   ✅ Comprehensive governance guide"
echo "   ✅ Troubleshooting FAQ with solutions"
echo "   ✅ Professional video script (5-7 minutes)"
echo ""
echo "📊 Coverage Areas:"
echo "   🌍 Complete platform walkthrough"
echo "   💳 Wallet setup and management"
echo "   💚 Donation process optimization"
echo "   🗳️ Governance participation"
echo "   🐛 Issue reporting and troubleshooting"
echo "   📱 Mobile and cross-browser testing"
echo ""
echo "🚀 Ready for Phase 2 Launch!"
EOF

chmod +x setup-beta-documentation.sh
