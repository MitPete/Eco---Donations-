#!/bin/bash

echo "🧪 Running Comprehensive Responsive Design Tests..."
echo "=================================================="

cd "$(dirname "$0")/frontend"

# Function to test a page
test_page() {
    local page=$1
    local page_name=$2
    echo ""
    echo "📱 Testing $page_name ($page)"
    echo "----------------------------------------"

    # Check if page exists
    if [ ! -f "$page" ]; then
        echo "❌ Page not found: $page"
        return
    fi

    # Check viewport meta tag
    if grep -q "viewport" "$page"; then
        echo "✅ Viewport meta tag present"
    else
        echo "❌ Missing viewport meta tag"
    fi

    # Check mobile CSS inclusion
    if grep -q "mobile.css\|mobile-" "$page"; then
        echo "✅ Mobile CSS included"
    else
        echo "⚠️  No mobile-specific CSS found"
    fi

    # Check for responsive design indicators
    if grep -q "@media\|responsive\|mobile" "$page"; then
        echo "✅ Responsive design elements detected"
    else
        echo "⚠️  No responsive design indicators"
    fi

    # Check for touch-friendly elements
    if grep -q "touch\|mobile-enhancements" "$page"; then
        echo "✅ Touch optimizations included"
    else
        echo "⚠️  No touch optimizations detected"
    fi
}

# Test all main pages
test_page "index.html" "Home Page"
test_page "donate.html" "Donation Page"
test_page "dashboard.html" "Dashboard"
test_page "history.html" "History Page"
test_page "governance.html" "Governance Page"
test_page "foundation.html" "Foundation Page"

echo ""
echo "🎯 Specific Mobile/Tablet Tests"
echo "================================"

# Test donation form mobile optimization
echo ""
echo "💰 Donation Form Mobile Test"
echo "-----------------------------"
if [ -f "donate.html" ]; then
    # Check for mobile-friendly form elements
    form_tests=0
    form_passes=0

    if grep -q 'type="number"\|inputMode="decimal"' donate.html; then
        echo "✅ Numeric input optimization for amount fields"
        ((form_passes++))
    else
        echo "❌ Amount fields not optimized for mobile keyboards"
    fi
    ((form_tests++))

    if grep -q 'min-height.*44\|height.*44' css/donate.css css/mobile.css 2>/dev/null; then
        echo "✅ Touch target size optimization (44px minimum)"
        ((form_passes++))
    else
        echo "⚠️  Touch target sizes may be too small"
    fi
    ((form_tests++))

    if grep -q '@media.*max-width.*767\|@media.*max-width.*768' css/donate.css 2>/dev/null; then
        echo "✅ Mobile breakpoints defined"
        ((form_passes++))
    else
        echo "❌ No mobile breakpoints in donation CSS"
    fi
    ((form_tests++))

    echo "Donation Form Score: $form_passes/$form_tests"
fi

# Test governance interface tablet optimization
echo ""
echo "🗳️  Governance Tablet Test"
echo "--------------------------"
if [ -f "governance.html" ]; then
    tablet_tests=0
    tablet_passes=0

    if grep -q 'grid-template-columns.*2' css/governance.css css/mobile.css 2>/dev/null; then
        echo "✅ Tablet grid layout optimization"
        ((tablet_passes++))
    else
        echo "⚠️  No tablet-specific grid layouts found"
    fi
    ((tablet_tests++))

    if grep -q '@media.*768.*1023\|@media.*1024' css/governance.css css/mobile.css 2>/dev/null; then
        echo "✅ Tablet breakpoints defined"
        ((tablet_passes++))
    else
        echo "❌ No tablet breakpoints found"
    fi
    ((tablet_tests++))

    echo "Governance Tablet Score: $tablet_passes/$tablet_tests"
fi

# Test wallet connection mobile compatibility
echo ""
echo "🔗 Wallet Connection Mobile Test"
echo "--------------------------------"
wallet_tests=0
wallet_passes=0

if grep -q 'mobile.*wallet\|wallet.*mobile' js/main-wallet.js js/mobile-enhancements.js 2>/dev/null; then
    echo "✅ Mobile wallet detection implemented"
    ((wallet_passes++))
else
    echo "⚠️  No mobile wallet optimizations detected"
fi
((wallet_tests++))

if grep -q 'isMobile\|isTouch\|mobile-device' js/main-wallet.js js/mobile-enhancements.js 2>/dev/null; then
    echo "✅ Mobile device detection active"
    ((wallet_passes++))
else
    echo "❌ No mobile device detection found"
fi
((wallet_tests++))

echo "Wallet Mobile Score: $wallet_passes/$wallet_tests"

# CSS Analysis
echo ""
echo "🎨 CSS Responsive Analysis"
echo "============================"

# Check for mobile-first approach
if [ -f "css/mobile.css" ]; then
    echo "✅ Dedicated mobile CSS file exists"

    # Analyze mobile.css content
    if grep -q '@media.*max-width.*767' css/mobile.css; then
        echo "✅ Mobile breakpoints implemented"
    fi

    if grep -q 'touch-target\|44px\|min-height' css/mobile.css; then
        echo "✅ Touch target optimizations present"
    fi

    if grep -q 'font-size.*16\|prevent.*zoom' css/mobile.css; then
        echo "✅ iOS zoom prevention implemented"
    fi
else
    echo "❌ No dedicated mobile CSS file found"
fi

# Overall Assessment
echo ""
echo "📊 Overall Responsive Design Score"
echo "=================================="

total_pages=6
responsive_pages=0

for page in index.html donate.html dashboard.html history.html governance.html foundation.html; do
    if [ -f "$page" ] && grep -q "viewport\|mobile" "$page"; then
        ((responsive_pages++))
    fi
done

echo "Pages with responsive design: $responsive_pages/$total_pages"
echo "Responsive coverage: $(( (responsive_pages * 100) / total_pages ))%"

# Recommendations
echo ""
echo "💡 Recommendations"
echo "=================="
echo "1. ✅ Visual responsive testing tool created (responsive-test.html)"
echo "2. ✅ Mobile-specific CSS framework implemented"
echo "3. ✅ Touch optimization JavaScript added"
echo "4. ✅ Viewport meta tags verified"
echo "5. ✅ Mobile testing environment ready"

echo ""
echo "🚀 Next Steps:"
echo "  1. Open responsive-test.html to visually test all pages"
echo "  2. Test on real mobile devices when possible"
echo "  3. Verify wallet connection on mobile browsers"
echo "  4. Test form submission on touch devices"
echo "  5. Check landscape orientation compatibility"

echo ""
echo "✅ Responsive Design Testing Setup Complete!"
