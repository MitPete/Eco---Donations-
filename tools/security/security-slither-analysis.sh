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
