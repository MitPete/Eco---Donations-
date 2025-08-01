#!/bin/bash

echo "🔄 RECOVERING LOST CONTENT FROM CODEBASE CLEANUP..."
echo "=================================================="

echo "📁 Creating recovery script for all empty files..."

# List of critical files that need content recovery
CRITICAL_FILES=(
    "BETA_LAUNCH_CHECKLIST.md"
    "BETA_LAUNCH_READINESS_FINAL.md"
    "LAUNCH_SUCCESS.md"
    "LIVE_LAUNCH_ANNOUNCEMENT.md"
    "MASSIVE_PROGRESS_SUMMARY.md"
    "PLATFORM_FEE_IMPLEMENTATION_COMPLETE.md"
    "PRIORITY_3_COMPLETE.md"
    "PROGRESS_UPDATE_JULY_30.md"
    "SECURITY_REVIEW_COMPLETED.md"
    "SEPOLIA_DEPLOYMENT_GUIDE.md"
    "about.html"
    "analytics.html"
    "projects.html"
    "apply-comprehensive-security.sh"
    "apply-security-fixes.sh"
    "deploy-beta-contracts.sh"
    "deploy-live.sh"
    "deploy-to-vercel.sh"
    "execute-final-launch.sh"
    "setup-analytics.sh"
    "setup-beta-documentation.sh"
    "setup-beta-launch.sh"
    "setup-beta-testing.sh"
    "setup-browser-testing.sh"
    "setup-community-infrastructure.sh"
    "setup-enhanced-wallet.sh"
    "setup-mobile-testing.sh"
    "setup-security-review.sh"
    "setup-transaction-flow.sh"
    "start-dev-server.sh"
    "start-monitoring.sh"
    "run-responsive-tests.sh"
    "run-security-audit.sh"
    "run-ultimate-automated-tests.sh"
    "test-browser-compatibility.sh"
    "test-everything.sh"
    "test-wallet-integration.sh"
    "testnet-deployment-sim.sh"
    "validate-security.sh"
)

echo "🔍 Checking which files can be recovered from git history..."

for file in "${CRITICAL_FILES[@]}"; do
    echo "📝 Checking: $file"

    # Try to find the file in previous commits
    if git show HEAD~1:"$file" > /dev/null 2>&1; then
        echo "✅ Found in HEAD~1: $file"

        # Determine the correct destination path
        case "$file" in
            apply-comprehensive-security.sh|apply-security-fixes.sh|validate-security.sh)
                destination="tools/security/$file"
                ;;
            deploy-*.sh|execute-final-launch.sh|start-*.sh|GO_LIVE.sh)
                destination="tools/deployment/$file"
                ;;
            setup-*.sh)
                destination="tools/setup/$file"
                ;;
            run-*.sh|test-*.sh)
                destination="tools/testing/$file"
                ;;
            *LAUNCH*|*BETA*|*PROGRESS*|*SECURITY*|*PLATFORM*|*PRIORITY*)
                destination="docs/development/$file"
                ;;
            *.html)
                # Check if these should go to src/frontend
                if [ "$file" = "about.html" ] || [ "$file" = "analytics.html" ] || [ "$file" = "projects.html" ]; then
                    destination="src/frontend/$file"
                else
                    destination="$file"
                fi
                ;;
            *)
                destination="$file"
                ;;
        esac

        # Create directory if needed
        mkdir -p "$(dirname "$destination")"

        # Restore the file
        git show HEAD~1:"$file" > "$destination" 2>/dev/null

        if [ -s "$destination" ]; then
            echo "✅ Restored: $destination"
        else
            echo "⚠️  Could not restore: $file"
        fi
    else
        echo "❌ Not found in git history: $file"
    fi
done

echo ""
echo "🔄 RECOVERY COMPLETE!"
echo "====================="
echo ""
echo "📊 Summary:"
echo "- Critical documentation files restored to docs/development/"
echo "- Scripts restored to tools/ subdirectories"
echo "- HTML files restored to src/frontend/"
echo ""
echo "🎯 Next Steps:"
echo "1. Review the restored content"
echo "2. Commit the recovered files"
echo "3. Continue with your development work"
echo ""
echo "💡 To prevent this in the future:"
echo "- Always test file moves with 'git mv' instead of manual reorganization"
echo "- Use 'git status' to verify all content is preserved"
echo "- Create backups before major reorganizations"
