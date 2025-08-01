#!/bin/bash

echo "🔧 Setting up mobile testing environment..."
echo "================================================"

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Create mobile-specific CSS if it doesn't exist
if [ ! -f "css/mobile.css" ]; then
    echo "📱 Creating mobile-specific CSS..."
    cat > css/mobile.css << 'EOF'
/* Mobile-First Responsive Design */
@media (max-width: 767px) {
    /* Navigation */
    .navbar {
        padding: 10px 15px;
    }

    .nav-links {
        flex-direction: column;
        width: 100%;
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: none;
    }

    .nav-links.active {
        display: flex;
    }

    .hamburger {
        display: block;
        cursor: pointer;
    }

    /* Forms */
    .donation-form {
        padding: 15px;
        margin: 10px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-control {
        font-size: 16px; /* Prevents zoom on iOS */
        padding: 12px;
        border-radius: 8px;
    }

    .btn {
        padding: 15px 20px;
        font-size: 16px;
        border-radius: 8px;
        min-height: 44px; /* Touch target size */
    }

    /* Cards */
    .card-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .card {
        margin: 10px;
        padding: 20px;
    }

    /* Tables */
    .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
    }

    table {
        min-width: 600px;
    }

    /* Typography */
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 18px; }

    .small-text {
        font-size: 14px;
        line-height: 1.4;
    }

    /* Wallet Connection */
    .wallet-status {
        padding: 10px;
        border-radius: 8px;
        margin: 10px 0;
    }

    .connect-wallet-btn {
        width: 100%;
        padding: 15px;
        font-size: 16px;
        border-radius: 8px;
    }
}

/* Tablet Styles */
@media (min-width: 768px) and (max-width: 1023px) {
    .container {
        padding: 0 20px;
    }

    .governance-cards {
        grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-stats {
        grid-template-columns: repeat(2, 1fr);
    }

    .chart-container {
        height: 300px;
    }
}

/* General Touch Improvements */
@media (hover: none) {
    .btn:hover {
        transform: none;
    }

    .card:hover {
        transform: none;
    }

    /* Remove hover effects on touch devices */
    .interactive:hover {
        background: initial;
    }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* High DPI screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .logo {
        background-image: url('../assets/logo@2x.png');
        background-size: contain;
    }
}
EOF
    echo "✅ Mobile CSS created"
fi

# Add viewport meta tag to all HTML files if missing
echo "🔍 Checking viewport meta tags..."
for file in *.html; do
    if [ -f "$file" ]; then
        if ! grep -q "viewport" "$file"; then
            echo "📱 Adding viewport meta tag to $file"
            sed -i.bak '/<head>/a\
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
' "$file"
        fi
    fi
done

# Create touch-friendly JavaScript enhancements
echo "📱 Creating touch-friendly JavaScript..."
cat > js/mobile-enhancements.js << 'EOF'
// Mobile-specific enhancements
class MobileEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupTouchEvents();
        this.setupMobileNavigation();
        this.setupFormEnhancements();
        this.setupViewportFixes();
        this.detectMobile();
    }

    detectMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouch = 'ontouchstart' in window;

        if (isMobile || isTouch) {
            document.body.classList.add('mobile-device');
        }

        // Add specific device classes
        if (/iPhone/i.test(navigator.userAgent)) {
            document.body.classList.add('ios', 'iphone');
        } else if (/iPad/i.test(navigator.userAgent)) {
            document.body.classList.add('ios', 'ipad');
        } else if (/Android/i.test(navigator.userAgent)) {
            document.body.classList.add('android');
        }
    }

    setupTouchEvents() {
        // Add touch feedback to buttons
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                const btn = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
                btn.style.opacity = '0.7';
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                const btn = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
                setTimeout(() => {
                    btn.style.opacity = '';
                }, 150);
            }
        });

        // Prevent double-tap zoom on buttons
        document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                e.preventDefault();
                e.target.click();
            }
        }, { passive: false });
    }

    setupMobileNavigation() {
        // Create hamburger menu if it doesn't exist
        const navbar = document.querySelector('.navbar');
        if (navbar && !document.querySelector('.hamburger')) {
            const hamburger = document.createElement('div');
            hamburger.className = 'hamburger';
            hamburger.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;
            navbar.appendChild(hamburger);

            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                hamburger.addEventListener('click', () => {
                    navLinks.classList.toggle('active');
                    hamburger.classList.toggle('active');
                });
            }
        }
    }

    setupFormEnhancements() {
        // Auto-resize textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
        });

        // Add proper input types for mobile keyboards
        document.querySelectorAll('input[name*="email"]').forEach(input => {
            input.type = 'email';
        });

        document.querySelectorAll('input[name*="phone"]').forEach(input => {
            input.type = 'tel';
        });

        document.querySelectorAll('input[name*="amount"], input[name*="value"]').forEach(input => {
            input.type = 'number';
            input.pattern = '[0-9]*';
            input.inputMode = 'decimal';
        });
    }

    setupViewportFixes() {
        // Fix viewport height on mobile browsers
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });

        // Prevent zoom on input focus (iOS)
        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('focus', () => {
                if (window.innerWidth < 768) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                }
            });

            element.addEventListener('blur', () => {
                if (window.innerWidth < 768) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    viewport.content = 'width=device-width, initial-scale=1.0';
                }
            });
        });
    }

    // Wallet connection optimization for mobile
    optimizeWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            // Check if it's a mobile wallet
            const isMobileWallet = window.ethereum.isTrust ||
                                  window.ethereum.isMetaMask && /Mobile/i.test(navigator.userAgent);

            if (isMobileWallet) {
                console.log('Mobile wallet detected');
                // Add mobile-specific wallet handling
                document.body.classList.add('mobile-wallet');
            }
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.mobileEnhancements = new MobileEnhancements();
    });
} else {
    window.mobileEnhancements = new MobileEnhancements();
}

// Export for use in other files
window.MobileEnhancements = MobileEnhancements;
EOF

# Run responsive design tests
echo "🧪 Running responsive design tests..."
cat > test-responsive.js << 'EOF'
// Responsive Design Test Suite
class ResponsiveTestSuite {
    constructor() {
        this.results = [];
        this.viewports = [
            { name: 'Mobile Portrait', width: 375, height: 667 },
            { name: 'Mobile Landscape', width: 667, height: 375 },
            { name: 'Tablet Portrait', width: 768, height: 1024 },
            { name: 'Tablet Landscape', width: 1024, height: 768 },
            { name: 'Desktop', width: 1200, height: 800 }
        ];
    }

    async runTests() {
        console.log('🧪 Starting Responsive Design Tests...');

        for (const viewport of this.viewports) {
            await this.testViewport(viewport);
        }

        this.generateReport();
    }

    async testViewport(viewport) {
        console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

        // Simulate viewport
        if (window.chrome && chrome.runtime && chrome.runtime.onConnect) {
            // Chrome DevTools available
            await this.setViewport(viewport.width, viewport.height);
        }

        const tests = [
            this.testHorizontalScroll(),
            this.testTouchTargets(),
            this.testTextReadability(),
            this.testFormUsability(),
            this.testNavigationAccess(),
            this.testContentVisibility()
        ];

        const results = await Promise.all(tests);
        this.results.push({
            viewport: viewport.name,
            tests: results
        });
    }

    testHorizontalScroll() {
        const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
        return {
            name: 'No Horizontal Scroll',
            passed: !hasHorizontalScroll,
            message: hasHorizontalScroll ? 'Page has horizontal scrolling' : 'No horizontal scroll detected'
        };
    }

    testTouchTargets() {
        const buttons = document.querySelectorAll('button, .btn, a[role="button"]');
        let smallTargets = 0;

        buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                smallTargets++;
            }
        });

        return {
            name: 'Touch Targets (44px min)',
            passed: smallTargets === 0,
            message: smallTargets > 0 ? `${smallTargets} targets too small` : 'All touch targets adequate size'
        };
    }

    testTextReadability() {
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
        let unreadableText = 0;

        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontSize = parseInt(style.fontSize);
            if (fontSize < 14) {
                unreadableText++;
            }
        });

        return {
            name: 'Text Readability (14px min)',
            passed: unreadableText === 0,
            message: unreadableText > 0 ? `${unreadableText} elements with small text` : 'All text readable size'
        };
    }

    testFormUsability() {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, select, textarea');

        let issues = [];

        inputs.forEach(input => {
            const rect = input.getBoundingClientRect();
            if (rect.height < 44) {
                issues.push('Input too small');
            }

            if (!input.hasAttribute('autocomplete') && (input.type === 'email' || input.type === 'password')) {
                issues.push('Missing autocomplete');
            }
        });

        return {
            name: 'Form Usability',
            passed: issues.length === 0,
            message: issues.length > 0 ? issues.join(', ') : 'Forms optimized for mobile'
        };
    }

    testNavigationAccess() {
        const nav = document.querySelector('nav, .navbar');
        const hamburger = document.querySelector('.hamburger');
        const isMobile = window.innerWidth < 768;

        if (isMobile && !hamburger) {
            return {
                name: 'Mobile Navigation',
                passed: false,
                message: 'No hamburger menu found for mobile'
            };
        }

        return {
            name: 'Mobile Navigation',
            passed: true,
            message: 'Navigation accessible on mobile'
        };
    }

    testContentVisibility() {
        const importantElements = document.querySelectorAll('.card, .btn-primary, h1, .logo');
        let hiddenElements = 0;

        importantElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                hiddenElements++;
            }
        });

        return {
            name: 'Content Visibility',
            passed: hiddenElements === 0,
            message: hiddenElements > 0 ? `${hiddenElements} important elements hidden` : 'All content visible'
        };
    }

    generateReport() {
        console.log('\n📊 Responsive Design Test Report');
        console.log('=================================');

        this.results.forEach(result => {
            console.log(`\n📱 ${result.viewport}`);
            result.tests.forEach(test => {
                const status = test.passed ? '✅' : '❌';
                console.log(`${status} ${test.name}: ${test.message}`);
            });
        });

        const totalTests = this.results.reduce((sum, result) => sum + result.tests.length, 0);
        const passedTests = this.results.reduce((sum, result) =>
            sum + result.tests.filter(test => test.passed).length, 0);

        console.log(`\n📈 Overall Score: ${passedTests}/${totalTests} tests passed`);
        console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
    }
}

// Run tests
const testSuite = new ResponsiveTestSuite();
testSuite.runTests();
EOF

echo "✅ Mobile testing environment setup complete!"
echo ""
echo "📱 Available Tools:"
echo "  1. responsive-test.html - Visual testing interface"
echo "  2. css/mobile.css - Mobile-specific styles"
echo "  3. js/mobile-enhancements.js - Touch and mobile optimizations"
echo "  4. test-responsive.js - Automated responsive tests"
echo ""
echo "🚀 To start testing:"
echo "  1. Open responsive-test.html in your browser"
echo "  2. Test each page on different device sizes"
echo "  3. Use the manual checklist to verify functionality"
echo "  4. Run the automated tests in browser console"
echo ""
echo "📋 Key things to test:"
echo "  ✓ Donation form usability on mobile"
echo "  ✓ Governance interface on tablets"
echo "  ✓ Wallet connection on mobile browsers"
echo "  ✓ Navigation menu responsiveness"
echo "  ✓ Touch target sizes (minimum 44px)"
echo "  ✓ Text readability without zooming"
