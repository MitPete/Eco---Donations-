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
