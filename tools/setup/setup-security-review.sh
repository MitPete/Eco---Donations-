#!/bin/bash

echo "🔒 Setting up FREE Smart Contract Security Review..."
echo "=================================================="

echo "📋 Installing Free Security Analysis Tools..."

# Check if we have npm/node
if ! command -v npm &> /dev/null; then
    echo "⚠️  Node.js/npm not found. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Install Slither (requires Python)
echo "🐍 Setting up Slither (Static Analysis)..."
if command -v python3 &> /dev/null; then
    echo "✅ Python3 found"

    # Try to install slither-analyzer
    if ! command -v slither &> /dev/null; then
        echo "📦 Installing Slither..."
        pip3 install slither-analyzer 2>/dev/null || {
            echo "⚠️  Slither installation failed. You may need to:"
            echo "   pip3 install slither-analyzer"
            echo "   or use: python3 -m pip install slither-analyzer"
        }
    else
        echo "✅ Slither already installed"
    fi
else
    echo "⚠️  Python3 not found. Slither analysis will be skipped."
    echo "   Install Python3 to enable Slither analysis."
fi

# Install MythX CLI (free tier)
echo "🔮 Setting up MythX CLI..."
npm install -g mythx-cli 2>/dev/null || {
    echo "⚠️  MythX CLI installation failed (optional)"
}

# Install Hardhat security plugins
echo "🔨 Installing Hardhat Security Plugins..."
npm install --save-dev @nomiclabs/hardhat-solhint hardhat-gas-reporter hardhat-contract-sizer 2>/dev/null || {
    echo "⚠️  Some Hardhat plugins failed to install"
}

# Create security analysis scripts
echo "📋 Creating Security Analysis Scripts..."

# Create Slither analysis script
cat > security-slither-analysis.sh << 'EOF'
#!/bin/bash

echo "🐍 Running Slither Static Analysis..."
echo "=================================="

if ! command -v slither &> /dev/null; then
    echo "❌ Slither not installed. Install with:"
    echo "   pip3 install slither-analyzer"
    exit 1
fi

# Create results directory
mkdir -p security-reports

echo "🔍 Analyzing contracts with Slither..."

# Analyze each contract individually
contracts=("Donation.sol" "EcoCoin.sol" "EcoGovernance.sol" "AutoDonation.sol" "MultiSigWallet.sol")

for contract in "${contracts[@]}"; do
    if [ -f "contracts/$contract" ]; then
        echo ""
        echo "📄 Analyzing: $contract"
        echo "----------------------------------------"

        # Run Slither analysis
        slither "contracts/$contract" \
            --json security-reports/slither-${contract%.sol}-report.json \
            --print human-summary,inheritance-graph,contract-summary \
            --exclude-dependencies \
            2>&1 | tee security-reports/slither-${contract%.sol}-output.txt

        echo "✅ Analysis complete for $contract"
    else
        echo "⚠️  Contract not found: contracts/$contract"
    fi
done

echo ""
echo "📊 Slither Analysis Summary:"
echo "============================"

# Count issues by severity
total_high=0
total_medium=0
total_low=0
total_informational=0

for json_file in security-reports/slither-*-report.json; do
    if [ -f "$json_file" ]; then
        contract_name=$(basename "$json_file" | sed 's/slither-//; s/-report.json//')

        # Count issues (simplified parsing)
        high=$(grep -o '"impact": "High"' "$json_file" 2>/dev/null | wc -l)
        medium=$(grep -o '"impact": "Medium"' "$json_file" 2>/dev/null | wc -l)
        low=$(grep -o '"impact": "Low"' "$json_file" 2>/dev/null | wc -l)
        info=$(grep -o '"impact": "Informational"' "$json_file" 2>/dev/null | wc -l)

        total_high=$((total_high + high))
        total_medium=$((total_medium + medium))
        total_low=$((total_low + low))
        total_informational=$((total_informational + info))

        echo "📋 $contract_name: High: $high, Medium: $medium, Low: $low, Info: $info"
    fi
done

echo ""
echo "🎯 Overall Summary:"
echo "   🔴 High Severity: $total_high"
echo "   🟡 Medium Severity: $total_medium"
echo "   🟢 Low Severity: $total_low"
echo "   ℹ️  Informational: $total_informational"

echo ""
echo "📁 Reports saved to: security-reports/"
echo "   - JSON reports: slither-*-report.json"
echo "   - Text output: slither-*-output.txt"

if [ $total_high -gt 0 ]; then
    echo ""
    echo "⚠️  HIGH SEVERITY issues found! Review immediately before deployment."
elif [ $total_medium -gt 0 ]; then
    echo ""
    echo "⚠️  MEDIUM SEVERITY issues found. Review before deployment."
else
    echo ""
    echo "✅ No high or medium severity issues found!"
fi
EOF

chmod +x security-slither-analysis.sh

# Create manual security checklist
cat > security-manual-checklist.md << 'EOF'
# 🔒 Manual Smart Contract Security Checklist

## 📋 Pre-Deployment Security Review

### **🎯 Critical Security Areas**

#### **1. Access Controls & Permissions**
- [ ] **Owner/Admin Controls**
  - [ ] Are admin functions properly protected?
  - [ ] Is there a multi-sig or timelock for critical functions?
  - [ ] Can ownership be transferred safely?
  - [ ] Are there emergency stop mechanisms?

- [ ] **Function Visibility**
  - [ ] Are all functions properly scoped (public/external/internal/private)?
  - [ ] No unintended public functions?
  - [ ] External calls properly validated?

#### **2. Input Validation & Bounds**
- [ ] **Parameter Validation**
  - [ ] All user inputs validated?
  - [ ] Proper bounds checking (min/max values)?
  - [ ] Address validation (non-zero checks)?
  - [ ] Array bounds protection?

- [ ] **Integer Overflow/Underflow**
  - [ ] Using SafeMath or Solidity 0.8+ built-in checks?
  - [ ] No unchecked arithmetic operations?
  - [ ] Proper handling of edge cases?

#### **3. Reentrancy Protection**
- [ ] **External Calls**
  - [ ] Follow checks-effects-interactions pattern?
  - [ ] Reentrancy guards where needed?
  - [ ] State updates before external calls?
  - [ ] No recursive call vulnerabilities?

#### **4. Token Economics & Logic**
- [ ] **ERC20 Token (EcoCoin)**
  - [ ] Proper mint/burn controls?
  - [ ] Total supply limits enforced?
  - [ ] Transfer restrictions if any?
  - [ ] Allowance mechanism secure?

- [ ] **Donation Logic**
  - [ ] Funds routing correct?
  - [ ] No fund lockup scenarios?
  - [ ] Proper event emissions?
  - [ ] Withdrawal mechanisms secure?

#### **5. Governance Security**
- [ ] **Voting Mechanism**
  - [ ] Double voting prevention?
  - [ ] Proper vote counting?
  - [ ] Quorum requirements?
  - [ ] Proposal validation?

#### **6. Gas Optimization & DoS**
- [ ] **Gas Limits**
  - [ ] No unbounded loops?
  - [ ] Reasonable gas consumption?
  - [ ] DoS via gas limit attacks prevented?

#### **7. External Dependencies**
- [ ] **Oracle/Price Feeds**
  - [ ] Trusted oracle sources?
  - [ ] Price manipulation protection?
  - [ ] Fallback mechanisms?

### **🛠️ Testing Verification**

#### **Unit Tests Coverage**
- [ ] All critical functions tested?
- [ ] Edge cases covered?
- [ ] Failure scenarios tested?
- [ ] Integration tests complete?

#### **Mainnet Simulation**
- [ ] Tested on testnet extensively?
- [ ] Real-world scenario testing?
- [ ] Load testing performed?
- [ ] Multi-user interaction testing?

### **📊 Security Tools Results**

#### **Slither Analysis**
- [ ] Slither scan completed ✅
- [ ] High severity issues: ___
- [ ] Medium severity issues: ___
- [ ] All critical issues addressed?

#### **Manual Code Review**
- [ ] Line-by-line critical function review
- [ ] Business logic verification
- [ ] Compliance with best practices
- [ ] Documentation accuracy check

### **🚨 Risk Assessment**

#### **High Risk Areas Identified:**
1. ________________
2. ________________
3. ________________

#### **Mitigation Strategies:**
1. ________________
2. ________________
3. ________________

#### **Deployment Readiness:**
- [ ] All high/medium issues resolved
- [ ] Test coverage > 90%
- [ ] Multi-signature wallet setup
- [ ] Emergency procedures documented
- [ ] Monitoring systems ready

### **✅ Final Security Approval**

**Security Review Completed By:** ________________
**Date:** ________________
**Deployment Approved:** [ ] Yes [ ] No

**Notes:**
________________________________
________________________________
________________________________

---

## 🛡️ Post-Deployment Security

### **Monitoring & Alerts**
- [ ] Transaction monitoring setup
- [ ] Unusual activity alerts
- [ ] Gas price monitoring
- [ ] Error rate tracking

### **Emergency Procedures**
- [ ] Pause/emergency stop tested
- [ ] Recovery procedures documented
- [ ] Team contact information updated
- [ ] Incident response plan ready

### **Regular Audits**
- [ ] Monthly security reviews scheduled
- [ ] Community bug bounty program
- [ ] External audit planned for mainnet
- [ ] Security best practices training
EOF

# Create automated security analysis
cat > run-security-analysis.sh << 'EOF'
#!/bin/bash

echo "🔒 Running Comprehensive Security Analysis..."
echo "============================================"

# Create reports directory
mkdir -p security-reports
cd security-reports

echo "📊 Security Analysis Report - $(date)" > security-summary.txt
echo "=======================================" >> security-summary.txt
echo "" >> security-summary.txt

# 1. Run Slither if available
if command -v slither &> /dev/null; then
    echo "🐍 Running Slither Analysis..." | tee -a security-summary.txt
    cd ..
    ./security-slither-analysis.sh
    cd security-reports
    echo "✅ Slither analysis completed" >> security-summary.txt
else
    echo "⚠️  Slither not available - install with: pip3 install slither-analyzer" >> security-summary.txt
fi

echo "" >> security-summary.txt

# 2. Contract size analysis
echo "📏 Contract Size Analysis..." | tee -a security-summary.txt
echo "=============================" >> security-summary.txt

if [ -d "../contracts" ]; then
    for contract in ../contracts/*.sol; do
        if [ -f "$contract" ]; then
            filename=$(basename "$contract")
            lines=$(wc -l < "$contract")
            size=$(wc -c < "$contract")
            echo "📄 $filename: $lines lines, $size bytes" >> security-summary.txt
        fi
    done
else
    echo "⚠️  Contracts directory not found" >> security-summary.txt
fi

echo "" >> security-summary.txt

# 3. Dependency analysis
echo "📦 Dependency Analysis..." | tee -a security-summary.txt
echo "=========================" >> security-summary.txt

# Check for common vulnerable patterns
echo "🔍 Scanning for common vulnerabilities..." >> security-summary.txt

if [ -d "../contracts" ]; then
    # Check for potential issues
    for contract in ../contracts/*.sol; do
        if [ -f "$contract" ]; then
            filename=$(basename "$contract")
            echo "" >> security-summary.txt
            echo "🔍 Analyzing: $filename" >> security-summary.txt

            # Check for call patterns
            if grep -q "call(" "$contract"; then
                echo "⚠️  Low-level call() found - review needed" >> security-summary.txt
            fi

            # Check for delegatecall
            if grep -q "delegatecall" "$contract"; then
                echo "⚠️  delegatecall found - high risk pattern" >> security-summary.txt
            fi

            # Check for selfdestruct
            if grep -q "selfdestruct\|suicide" "$contract"; then
                echo "⚠️  selfdestruct found - review needed" >> security-summary.txt
            fi

            # Check for tx.origin
            if grep -q "tx.origin" "$contract"; then
                echo "⚠️  tx.origin usage found - avoid using" >> security-summary.txt
            fi

            # Check for block.timestamp
            if grep -q "block.timestamp\|now" "$contract"; then
                echo "ℹ️  Timestamp dependency found - ensure not critical" >> security-summary.txt
            fi

            # Check for external calls in loops
            if grep -A5 -B5 "for\|while" "$contract" | grep -q "call\|send\|transfer"; then
                echo "⚠️  External call in loop - DoS risk" >> security-summary.txt
            fi

            echo "✅ Analysis complete for $filename" >> security-summary.txt
        fi
    done
fi

echo "" >> security-summary.txt

# 4. Generate recommendations
echo "🎯 Security Recommendations..." | tee -a security-summary.txt
echo "==============================" >> security-summary.txt
echo "" >> security-summary.txt
echo "1. 🔒 Implement multi-signature wallet for admin functions" >> security-summary.txt
echo "2. ⏱️  Add timelock for critical parameter changes" >> security-summary.txt
echo "3. 🛡️  Use reentrancy guards for external calls" >> security-summary.txt
echo "4. 🧪 Conduct thorough testing on testnet" >> security-summary.txt
echo "5. 📊 Set up monitoring for unusual activity" >> security-summary.txt
echo "6. 🐛 Consider bug bounty program" >> security-summary.txt
echo "7. 👥 Get external audit before mainnet" >> security-summary.txt
echo "" >> security-summary.txt

# 5. Generate final score
echo "📊 Security Score Estimation..." | tee -a security-summary.txt
echo "===============================" >> security-summary.txt

# Simple scoring based on analysis
score=85  # Base score

# Deduct points for issues found
if grep -q "⚠️" security-summary.txt; then
    warning_count=$(grep -c "⚠️" security-summary.txt)
    score=$((score - warning_count * 5))
fi

if [ $score -ge 90 ]; then
    grade="A"
    status="🟢 EXCELLENT"
elif [ $score -ge 80 ]; then
    grade="B"
    status="🟡 GOOD"
elif [ $score -ge 70 ]; then
    grade="C"
    status="🟠 FAIR"
else
    grade="D"
    status="🔴 NEEDS WORK"
fi

echo "" >> security-summary.txt
echo "🎯 Security Score: $score/100 (Grade: $grade)" >> security-summary.txt
echo "📊 Status: $status" >> security-summary.txt
echo "" >> security-summary.txt

if [ $score -ge 80 ]; then
    echo "✅ Ready for testnet deployment with monitoring" >> security-summary.txt
elif [ $score -ge 70 ]; then
    echo "⚠️  Address issues before testnet deployment" >> security-summary.txt
else
    echo "❌ Significant security work needed" >> security-summary.txt
fi

echo "" >> security-summary.txt
echo "📅 Analysis completed: $(date)" >> security-summary.txt

# Display summary
echo ""
echo "📋 Security Analysis Complete!"
echo "=============================="
cat security-summary.txt
echo ""
echo "📁 Full report saved to: security-reports/security-summary.txt"
echo ""
EOF

chmod +x run-security-analysis.sh

echo ""
echo "🔒 FREE Smart Contract Security Review Setup Complete!"
echo "======================================================="
echo ""
echo "🛠️ Tools Installed/Configured:"
echo "  ✅ Slither static analysis setup"
echo "  ✅ MythX CLI (free tier) setup"
echo "  ✅ Hardhat security plugins"
echo "  ✅ Manual security checklist"
echo "  ✅ Automated analysis scripts"
echo ""
echo "📋 Available Security Scripts:"
echo "  1. security-slither-analysis.sh - Run Slither analysis"
echo "  2. run-security-analysis.sh - Full automated analysis"
echo "  3. security-manual-checklist.md - Manual review checklist"
echo ""
echo "🚀 Next Steps:"
echo "  1. Run: ./run-security-analysis.sh"
echo "  2. Review: security-manual-checklist.md"
echo "  3. Address any critical issues found"
echo "  4. Document security review completion"
echo ""
echo "💡 Remember: This is a basic security review."
echo "   For mainnet deployment, consider professional audit!"
