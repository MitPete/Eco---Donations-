#!/bin/bash

echo "🧪 Running Comprehensive Browser Compatibility Tests..."
echo "===================================================="

cd "$(dirname "$0")/frontend"

# Test browser compatibility across pages
echo "📊 Testing Browser Compatibility Features..."
echo ""

# Function to test a specific feature in HTML files
test_html_feature() {
    local feature=$1
    local pattern=$2
    local description=$3

    echo "🔍 Testing: $description"
    echo "-----------------------------------"

    found_files=0
    total_files=0

    for file in *.html; do
        if [ -f "$file" ]; then
            ((total_files++))
            if grep -q "$pattern" "$file"; then
                echo "✅ $file: $feature implemented"
                ((found_files++))
            else
                echo "⚠️  $file: $feature missing"
            fi
        fi
    done

    echo "Result: $found_files/$total_files files have $feature"
    echo ""
}

# Test viewport meta tags
test_html_feature "Viewport Meta" "viewport" "Viewport meta tag presence"

# Test mobile responsiveness
test_html_feature "Mobile CSS" "mobile.css\|mobile-" "Mobile-specific CSS inclusion"

# Test browser polyfills
test_html_feature "Browser Polyfills" "browser-polyfills.js" "Browser compatibility polyfills"

# Test specific browser features
echo "🌐 Browser Feature Compatibility Analysis"
echo "========================================"

# Create a temporary test file to check CSS features
cat > temp-feature-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <style>
        .grid-test { display: grid; }
        .flex-test { display: flex; }
        .custom-prop-test { --custom: value; }
        .transform-test { transform: translateX(10px); }
    </style>
</head>
<body>
    <script>
        // Test modern JavaScript features
        const features = {
            cssGrid: CSS.supports('display', 'grid'),
            cssFlexbox: CSS.supports('display', 'flex'),
            cssCustomProperties: CSS.supports('--custom', 'value'),
            cssTransforms: CSS.supports('transform', 'translateX(1px)'),
            es6ArrowFunctions: true,
            fetchAPI: typeof fetch !== 'undefined',
            localStorage: typeof Storage !== 'undefined',
            webGL: !!window.WebGLRenderingContext,
            touchEvents: 'ontouchstart' in window,
            serviceWorker: 'serviceWorker' in navigator
        };

        console.log('Browser Feature Support:');
        for (const [feature, supported] of Object.entries(features)) {
            console.log(`${supported ? '✅' : '❌'} ${feature}: ${supported ? 'Supported' : 'Not Supported'}`);
        }
    </script>
</body>
</html>
EOF

echo "📱 CSS Feature Support:"
echo "----------------------"

# Check CSS Grid support
if grep -q "display.*grid" css/*.css 2>/dev/null; then
    echo "✅ CSS Grid: Used in stylesheets"
else
    echo "⚠️  CSS Grid: Not used in stylesheets"
fi

# Check CSS Flexbox support
if grep -q "display.*flex" css/*.css 2>/dev/null; then
    echo "✅ CSS Flexbox: Used in stylesheets"
else
    echo "⚠️  CSS Flexbox: Not used in stylesheets"
fi

# Check media queries
if grep -q "@media" css/*.css 2>/dev/null; then
    echo "✅ Media Queries: Responsive breakpoints implemented"
else
    echo "❌ Media Queries: No responsive breakpoints found"
fi

# Check for vendor prefixes
if grep -q "\-webkit\|\-moz\|\-ms\|\-o" css/*.css 2>/dev/null; then
    echo "✅ Vendor Prefixes: Found in stylesheets"
else
    echo "⚠️  Vendor Prefixes: None found (may need for older browsers)"
fi

echo ""
echo "🔧 JavaScript Compatibility:"
echo "----------------------------"

# Check for modern JavaScript usage
if grep -q "const\|let\|=>" js/*.js 2>/dev/null; then
    echo "✅ ES6+ Features: Modern JavaScript used"
else
    echo "⚠️  ES6+ Features: Only ES5 JavaScript found"
fi

# Check for async/await
if grep -q "async\|await" js/*.js 2>/dev/null; then
    echo "✅ Async/Await: Modern async patterns used"
else
    echo "⚠️  Async/Await: Traditional callback/promise patterns"
fi

# Check for fetch API usage
if grep -q "fetch(" js/*.js 2>/dev/null; then
    echo "✅ Fetch API: Modern HTTP requests"
else
    echo "⚠️  Fetch API: May need XMLHttpRequest fallback"
fi

echo ""
echo "📱 Mobile Browser Compatibility:"
echo "------------------------------"

# Check viewport configuration
viewport_count=$(grep -c "viewport" *.html 2>/dev/null || echo 0)
total_html=$(ls *.html 2>/dev/null | wc -l | tr -d ' ')
echo "📱 Viewport Meta Tags: $viewport_count/$total_html pages configured"

# Check touch optimizations
if [ -f "js/mobile-enhancements.js" ]; then
    echo "✅ Touch Optimizations: Mobile enhancement script present"
else
    echo "❌ Touch Optimizations: No mobile enhancement script"
fi

# Check for iOS-specific optimizations
if grep -q "user-scalable=no\|maximum-scale" *.html 2>/dev/null; then
    echo "✅ iOS Optimizations: Zoom prevention implemented"
else
    echo "⚠️  iOS Optimizations: May need zoom prevention"
fi

echo ""
echo "🔗 Wallet Browser Compatibility:"
echo "-------------------------------"

# Check wallet detection
if grep -q "window.ethereum\|MetaMask" js/*.js 2>/dev/null; then
    echo "✅ Wallet Detection: MetaMask/Web3 wallet support"
else
    echo "❌ Wallet Detection: No wallet integration found"
fi

# Check for mobile wallet support
if grep -q "mobile.*wallet\|wallet.*mobile" js/*.js 2>/dev/null; then
    echo "✅ Mobile Wallets: Mobile wallet optimizations present"
else
    echo "⚠️  Mobile Wallets: May need mobile wallet optimizations"
fi

echo ""
echo "📊 Browser-Specific Testing Checklist:"
echo "====================================="

browsers=("Chrome" "Safari" "Firefox" "Edge" "Mobile Chrome" "Mobile Safari")
features=("Page Loading" "Wallet Connection" "Form Submission" "Responsive Design" "Touch Events")

echo "Browser compatibility testing checklist:"
echo ""

for browser in "${browsers[@]}"; do
    echo "🌐 $browser:"
    for feature in "${features[@]}"; do
        echo "  [ ] $feature"
    done
    echo ""
done

echo "💡 Testing Recommendations:"
echo "=========================="
echo "1. ✅ Use browser-compatibility-test.html for interactive testing"
echo "2. ✅ Test wallet functionality in each browser"
echo "3. ✅ Verify responsive design across devices"
echo "4. ✅ Check form submission and validation"
echo "5. ✅ Test touch interactions on mobile browsers"
echo "6. ✅ Verify CSS animations and transitions"
echo ""

echo "🔧 Common Browser Issues to Watch For:"
echo "====================================="
echo "Chrome:    - Usually most compatible"
echo "Safari:    - Wallet popups, date parsing, localStorage"
echo "Firefox:   - WebGL, some CSS features"
echo "Edge:      - Legacy compatibility, wallet integration"
echo "Mobile:    - Touch targets, viewport scaling, wallet apps"

# Clean up
rm -f temp-feature-test.html

echo ""
echo "✅ Browser Compatibility Analysis Complete!"
echo ""
echo "🚀 Next Steps:"
echo "  1. Open browser-compatibility-test.html in each target browser"
echo "  2. Run manual tests and mark results"
echo "  3. Test wallet connectivity in each browser"
echo "  4. Document any browser-specific issues found"
echo "  5. Implement fixes for identified compatibility issues"
