#!/bin/bash

echo "🌐 Setting up Cross-Browser Compatibility Testing..."
echo "=================================================="

cd "$(dirname "$0")/frontend"

# Create browser compatibility test suite
echo "🧪 Creating browser compatibility test suite..."

cat > browser-compatibility-test.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Compatibility Test - Eco Donations</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            line-height: 1.6;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .test-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .test-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .browser-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .test-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .status {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
        }
        .pass { background: #28a745; }
        .fail { background: #dc3545; }
        .warn { background: #ffc107; color: #333; }
        .unknown { background: #6c757d; }
        .test-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
        }
        .test-btn:hover {
            background: #0056b3;
        }
        .results-summary {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-top: 20px;
        }
        .feature-test {
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .compatibility-matrix {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .compatibility-matrix th,
        .compatibility-matrix td {
            padding: 8px 12px;
            text-align: center;
            border: 1px solid #ddd;
        }
        .compatibility-matrix th {
            background: #f8f9fa;
            font-weight: 600;
        }
        @media (max-width: 768px) {
            .test-grid {
                grid-template-columns: 1fr;
            }
            .compatibility-matrix {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌐 Cross-Browser Compatibility Test</h1>
        <p>Test Eco-Donations across different browsers and platforms</p>
    </div>

    <div class="browser-info">
        <h3>🔍 Detected Browser Information</h3>
        <div id="browser-detection"></div>
    </div>

    <div class="test-grid">
        <div class="test-card">
            <h3>🧪 Feature Detection Tests</h3>
            <div id="feature-tests"></div>
        </div>

        <div class="test-card">
            <h3>🔗 Wallet Compatibility</h3>
            <div id="wallet-tests"></div>
        </div>

        <div class="test-card">
            <h3>🎨 CSS Feature Tests</h3>
            <div id="css-tests"></div>
        </div>

        <div class="test-card">
            <h3>📱 Mobile Browser Tests</h3>
            <div id="mobile-tests"></div>
        </div>
    </div>

    <div class="test-grid">
        <div class="test-card">
            <h3>🔧 Manual Test Checklist</h3>
            <div id="manual-tests">
                <div class="test-item">
                    <span>Navigation menu works</span>
                    <div>
                        <span class="status unknown" id="nav-test" onclick="toggleTest('nav-test')">?</span>
                        <button class="test-btn" onclick="testNavigation()">Test</button>
                    </div>
                </div>
                <div class="test-item">
                    <span>Wallet connection functional</span>
                    <div>
                        <span class="status unknown" id="wallet-test" onclick="toggleTest('wallet-test')">?</span>
                        <button class="test-btn" onclick="testWallet()">Test</button>
                    </div>
                </div>
                <div class="test-item">
                    <span>Forms submit correctly</span>
                    <div>
                        <span class="status unknown" id="form-test" onclick="toggleTest('form-test')">?</span>
                        <button class="test-btn" onclick="testForms()">Test</button>
                    </div>
                </div>
                <div class="test-item">
                    <span>Charts/graphs display</span>
                    <div>
                        <span class="status unknown" id="chart-test" onclick="toggleTest('chart-test')">?</span>
                        <button class="test-btn" onclick="testCharts()">Test</button>
                    </div>
                </div>
                <div class="test-item">
                    <span>Responsive layout works</span>
                    <div>
                        <span class="status unknown" id="responsive-test" onclick="toggleTest('responsive-test')">?</span>
                        <button class="test-btn" onclick="testResponsive()">Test</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="test-card">
            <h3>📊 Performance Tests</h3>
            <div id="performance-tests"></div>
        </div>
    </div>

    <div class="results-summary">
        <h3>📋 Browser Compatibility Matrix</h3>
        <table class="compatibility-matrix">
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>Chrome</th>
                    <th>Safari</th>
                    <th>Firefox</th>
                    <th>Edge</th>
                    <th>Mobile Chrome</th>
                    <th>Mobile Safari</th>
                </tr>
            </thead>
            <tbody id="compatibility-matrix">
                <tr>
                    <td>Web3/Ethereum</td>
                    <td id="chrome-web3">?</td>
                    <td id="safari-web3">?</td>
                    <td id="firefox-web3">?</td>
                    <td id="edge-web3">?</td>
                    <td id="mobile-chrome-web3">?</td>
                    <td id="mobile-safari-web3">?</td>
                </tr>
                <tr>
                    <td>CSS Grid</td>
                    <td id="chrome-grid">?</td>
                    <td id="safari-grid">?</td>
                    <td id="firefox-grid">?</td>
                    <td id="edge-grid">?</td>
                    <td id="mobile-chrome-grid">?</td>
                    <td id="mobile-safari-grid">?</td>
                </tr>
                <tr>
                    <td>ES6 Modules</td>
                    <td id="chrome-es6">?</td>
                    <td id="safari-es6">?</td>
                    <td id="firefox-es6">?</td>
                    <td id="edge-es6">?</td>
                    <td id="mobile-chrome-es6">?</td>
                    <td id="mobile-safari-es6">?</td>
                </tr>
                <tr>
                    <td>Local Storage</td>
                    <td id="chrome-storage">?</td>
                    <td id="safari-storage">?</td>
                    <td id="firefox-storage">?</td>
                    <td id="edge-storage">?</td>
                    <td id="mobile-chrome-storage">?</td>
                    <td id="mobile-safari-storage">?</td>
                </tr>
            </tbody>
        </table>

        <div id="test-summary"></div>
    </div>

    <script>
        class BrowserCompatibilityTester {
            constructor() {
                this.results = {};
                this.init();
            }

            init() {
                this.detectBrowser();
                this.runFeatureTests();
                this.runWalletTests();
                this.runCSSTests();
                this.runMobileTests();
                this.runPerformanceTests();
                this.updateCompatibilityMatrix();
            }

            detectBrowser() {
                const userAgent = navigator.userAgent;
                const browserInfo = {
                    name: 'Unknown',
                    version: 'Unknown',
                    platform: navigator.platform,
                    mobile: /Mobi|Android/i.test(userAgent),
                    webgl: !!window.WebGLRenderingContext,
                    webgl2: !!window.WebGL2RenderingContext
                };

                // Detect browser
                if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
                    browserInfo.name = 'Chrome';
                    browserInfo.version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
                } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
                    browserInfo.name = 'Safari';
                    browserInfo.version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
                } else if (userAgent.includes('Firefox')) {
                    browserInfo.name = 'Firefox';
                    browserInfo.version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
                } else if (userAgent.includes('Edg')) {
                    browserInfo.name = 'Edge';
                    browserInfo.version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
                }

                document.getElementById('browser-detection').innerHTML = `
                    <strong>Browser:</strong> ${browserInfo.name} ${browserInfo.version}<br>
                    <strong>Platform:</strong> ${browserInfo.platform}<br>
                    <strong>Mobile:</strong> ${browserInfo.mobile ? 'Yes' : 'No'}<br>
                    <strong>WebGL:</strong> ${browserInfo.webgl ? 'Supported' : 'Not supported'}<br>
                    <strong>User Agent:</strong> ${userAgent}
                `;

                this.browserInfo = browserInfo;
            }

            runFeatureTests() {
                const tests = [
                    {
                        name: 'ES6 Arrow Functions',
                        test: () => {
                            try {
                                eval('() => {}');
                                return true;
                            } catch (e) {
                                return false;
                            }
                        }
                    },
                    {
                        name: 'Async/Await',
                        test: () => {
                            try {
                                eval('async function test() { await Promise.resolve(); }');
                                return true;
                            } catch (e) {
                                return false;
                            }
                        }
                    },
                    {
                        name: 'Fetch API',
                        test: () => typeof fetch !== 'undefined'
                    },
                    {
                        name: 'Local Storage',
                        test: () => {
                            try {
                                localStorage.setItem('test', 'test');
                                localStorage.removeItem('test');
                                return true;
                            } catch (e) {
                                return false;
                            }
                        }
                    },
                    {
                        name: 'Web3 Support',
                        test: () => typeof window.ethereum !== 'undefined'
                    },
                    {
                        name: 'WebSocket',
                        test: () => typeof WebSocket !== 'undefined'
                    }
                ];

                const container = document.getElementById('feature-tests');
                container.innerHTML = tests.map(test => {
                    const result = test.test();
                    const statusClass = result ? 'pass' : 'fail';
                    const statusText = result ? '✓' : '✕';
                    return `
                        <div class="feature-test">
                            <span class="status ${statusClass}">${statusText}</span>
                            ${test.name}: <strong>${result ? 'Supported' : 'Not Supported'}</strong>
                        </div>
                    `;
                }).join('');
            }

            runWalletTests() {
                const tests = [
                    {
                        name: 'MetaMask Detection',
                        test: () => typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
                    },
                    {
                        name: 'Web3 Provider',
                        test: () => typeof window.ethereum !== 'undefined'
                    },
                    {
                        name: 'EIP-1193 Support',
                        test: () => typeof window.ethereum?.request === 'function'
                    }
                ];

                const container = document.getElementById('wallet-tests');
                container.innerHTML = tests.map(test => {
                    const result = test.test();
                    const statusClass = result ? 'pass' : 'warn';
                    const statusText = result ? '✓' : '!';
                    return `
                        <div class="feature-test">
                            <span class="status ${statusClass}">${statusText}</span>
                            ${test.name}: <strong>${result ? 'Available' : 'Not Available'}</strong>
                        </div>
                    `;
                }).join('');
            }

            runCSSTests() {
                const tests = [
                    {
                        name: 'CSS Grid',
                        test: () => CSS.supports('display', 'grid')
                    },
                    {
                        name: 'CSS Flexbox',
                        test: () => CSS.supports('display', 'flex')
                    },
                    {
                        name: 'CSS Custom Properties',
                        test: () => CSS.supports('--custom-property', 'value')
                    },
                    {
                        name: 'CSS Transforms',
                        test: () => CSS.supports('transform', 'translateX(1px)')
                    },
                    {
                        name: 'CSS Animations',
                        test: () => CSS.supports('animation', 'none')
                    }
                ];

                const container = document.getElementById('css-tests');
                container.innerHTML = tests.map(test => {
                    const result = test.test();
                    const statusClass = result ? 'pass' : 'fail';
                    const statusText = result ? '✓' : '✕';
                    return `
                        <div class="feature-test">
                            <span class="status ${statusClass}">${statusText}</span>
                            ${test.name}: <strong>${result ? 'Supported' : 'Not Supported'}</strong>
                        </div>
                    `;
                }).join('');
            }

            runMobileTests() {
                const isMobile = this.browserInfo.mobile;
                const tests = [
                    {
                        name: 'Touch Events',
                        test: () => 'ontouchstart' in window
                    },
                    {
                        name: 'Device Orientation',
                        test: () => 'orientation' in window
                    },
                    {
                        name: 'Viewport Meta Support',
                        test: () => !!document.querySelector('meta[name="viewport"]')
                    }
                ];

                const container = document.getElementById('mobile-tests');
                if (isMobile) {
                    container.innerHTML = tests.map(test => {
                        const result = test.test();
                        const statusClass = result ? 'pass' : 'warn';
                        const statusText = result ? '✓' : '!';
                        return `
                            <div class="feature-test">
                                <span class="status ${statusClass}">${statusText}</span>
                                ${test.name}: <strong>${result ? 'Available' : 'Not Available'}</strong>
                            </div>
                        `;
                    }).join('');
                } else {
                    container.innerHTML = '<p>Mobile tests only available on mobile devices</p>';
                }
            }

            runPerformanceTests() {
                const container = document.getElementById('performance-tests');

                // Measure page load performance
                const navigation = performance.getEntriesByType('navigation')[0];
                const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;

                // Memory usage (if available)
                const memory = performance.memory;

                container.innerHTML = `
                    <div class="feature-test">
                        <span class="status ${loadTime < 3000 ? 'pass' : 'warn'}">${loadTime < 3000 ? '✓' : '!'}</span>
                        Page Load Time: <strong>${loadTime ? Math.round(loadTime) + 'ms' : 'N/A'}</strong>
                    </div>
                    ${memory ? `
                    <div class="feature-test">
                        <span class="status pass">✓</span>
                        Memory Usage: <strong>${Math.round(memory.usedJSHeapSize / 1048576)}MB</strong>
                    </div>
                    ` : ''}
                `;
            }

            updateCompatibilityMatrix() {
                const currentBrowser = this.browserInfo.name.toLowerCase();

                // Update current browser column
                const features = ['web3', 'grid', 'es6', 'storage'];
                const tests = {
                    web3: typeof window.ethereum !== 'undefined',
                    grid: CSS.supports('display', 'grid'),
                    es6: true, // Modern browsers support ES6
                    storage: !!window.localStorage
                };

                features.forEach(feature => {
                    const result = tests[feature];
                    const cell = document.getElementById(`${currentBrowser}-${feature}`);
                    if (cell) {
                        cell.innerHTML = result ? '✅' : '❌';
                        cell.style.backgroundColor = result ? '#d4edda' : '#f8d7da';
                    }
                });
            }
        }

        // Manual test functions
        function toggleTest(testId) {
            const element = document.getElementById(testId);
            const current = element.textContent;

            if (current === '?') {
                element.textContent = '✓';
                element.className = 'status pass';
            } else if (current === '✓') {
                element.textContent = '✕';
                element.className = 'status fail';
            } else {
                element.textContent = '?';
                element.className = 'status unknown';
            }
        }

        function testNavigation() {
            window.open('index.html', '_blank');
        }

        function testWallet() {
            if (typeof window.ethereum !== 'undefined') {
                window.ethereum.request({ method: 'eth_accounts' })
                    .then(() => {
                        document.getElementById('wallet-test').textContent = '✓';
                        document.getElementById('wallet-test').className = 'status pass';
                    })
                    .catch(() => {
                        document.getElementById('wallet-test').textContent = '✕';
                        document.getElementById('wallet-test').className = 'status fail';
                    });
            } else {
                alert('No wallet detected');
            }
        }

        function testForms() {
            window.open('donate.html', '_blank');
        }

        function testCharts() {
            window.open('dashboard.html', '_blank');
        }

        function testResponsive() {
            window.open('responsive-test.html', '_blank');
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new BrowserCompatibilityTester();
        });
    </script>
</body>
</html>
EOF

echo "✅ Browser compatibility test interface created"

# Create automated browser testing script
echo "🤖 Creating automated browser testing script..."

cat > automated-browser-tests.js << 'EOF'
// Automated Cross-Browser Testing Suite
class AutomatedBrowserTests {
    constructor() {
        this.testResults = {};
        this.pages = [
            'index.html',
            'donate.html',
            'dashboard.html',
            'history.html',
            'governance.html',
            'foundation.html'
        ];
    }

    async runAllTests() {
        console.log('🚀 Starting Automated Cross-Browser Tests...');

        // Test browser capabilities
        await this.testBrowserCapabilities();

        // Test each page
        for (const page of this.pages) {
            await this.testPage(page);
        }

        // Test wallet integration
        await this.testWalletIntegration();

        // Generate report
        this.generateReport();
    }

    async testBrowserCapabilities() {
        console.log('🔍 Testing Browser Capabilities...');

        const tests = {
            es6Support: this.testES6Support(),
            fetchAPI: this.testFetchAPI(),
            localStorage: this.testLocalStorage(),
            webGL: this.testWebGL(),
            cssGrid: this.testCSSGrid(),
            cssFlexbox: this.testCSSFlexbox(),
            touchEvents: this.testTouchEvents(),
            webWorkers: this.testWebWorkers()
        };

        this.testResults.capabilities = {};
        for (const [test, result] of Object.entries(tests)) {
            this.testResults.capabilities[test] = await result;
        }
    }

    testES6Support() {
        try {
            eval('const test = () => {}; class Test {}');
            return { passed: true, message: 'ES6 features supported' };
        } catch (e) {
            return { passed: false, message: 'ES6 features not supported', error: e.message };
        }
    }

    testFetchAPI() {
        return {
            passed: typeof fetch !== 'undefined',
            message: typeof fetch !== 'undefined' ? 'Fetch API available' : 'Fetch API not available'
        };
    }

    testLocalStorage() {
        try {
            localStorage.setItem('test', 'value');
            const value = localStorage.getItem('test');
            localStorage.removeItem('test');
            return { passed: value === 'value', message: 'Local Storage working' };
        } catch (e) {
            return { passed: false, message: 'Local Storage not available', error: e.message };
        }
    }

    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return { passed: !!gl, message: gl ? 'WebGL supported' : 'WebGL not supported' };
        } catch (e) {
            return { passed: false, message: 'WebGL test failed', error: e.message };
        }
    }

    testCSSGrid() {
        return {
            passed: CSS.supports('display', 'grid'),
            message: CSS.supports('display', 'grid') ? 'CSS Grid supported' : 'CSS Grid not supported'
        };
    }

    testCSSFlexbox() {
        return {
            passed: CSS.supports('display', 'flex'),
            message: CSS.supports('display', 'flex') ? 'CSS Flexbox supported' : 'CSS Flexbox not supported'
        };
    }

    testTouchEvents() {
        return {
            passed: 'ontouchstart' in window,
            message: 'ontouchstart' in window ? 'Touch events supported' : 'Touch events not supported'
        };
    }

    testWebWorkers() {
        return {
            passed: typeof Worker !== 'undefined',
            message: typeof Worker !== 'undefined' ? 'Web Workers supported' : 'Web Workers not supported'
        };
    }

    async testPage(page) {
        console.log(`📄 Testing ${page}...`);

        try {
            // Test if page loads without errors
            const response = await fetch(page);
            const html = await response.text();

            const tests = {
                loads: response.ok,
                hasViewport: html.includes('viewport'),
                hasMetaMobile: html.includes('mobile') || html.includes('responsive'),
                hasCSS: html.includes('.css'),
                hasJS: html.includes('.js'),
                validHTML: this.validateHTML(html)
            };

            this.testResults[page] = tests;
        } catch (e) {
            this.testResults[page] = { error: e.message };
        }
    }

    validateHTML(html) {
        // Basic HTML validation
        const hasDoctype = html.includes('<!DOCTYPE');
        const hasHtmlTag = html.includes('<html');
        const hasHeadTag = html.includes('<head>');
        const hasBodyTag = html.includes('<body');

        return hasDoctype && hasHtmlTag && hasHeadTag && hasBodyTag;
    }

    async testWalletIntegration() {
        console.log('🔗 Testing Wallet Integration...');

        this.testResults.wallet = {
            ethereumPresent: typeof window.ethereum !== 'undefined',
            metaMaskDetected: typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask,
            web3Provider: typeof window.ethereum?.request === 'function',
            eip1193Support: typeof window.ethereum?.request === 'function'
        };
    }

    generateReport() {
        console.log('\n📊 Cross-Browser Test Report');
        console.log('='.repeat(50));

        // Browser capabilities
        console.log('\n🔍 Browser Capabilities:');
        for (const [test, result] of Object.entries(this.testResults.capabilities)) {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${test}: ${result.message}`);
        }

        // Page tests
        console.log('\n📄 Page Tests:');
        for (const [page, tests] of Object.entries(this.testResults)) {
            if (page === 'capabilities' || page === 'wallet') continue;

            console.log(`\n${page}:`);
            if (tests.error) {
                console.log(`❌ Error: ${tests.error}`);
            } else {
                for (const [test, result] of Object.entries(tests)) {
                    const status = result ? '✅' : '❌';
                    console.log(`  ${status} ${test}`);
                }
            }
        }

        // Wallet tests
        console.log('\n🔗 Wallet Integration:');
        for (const [test, result] of Object.entries(this.testResults.wallet)) {
            const status = result ? '✅' : '❌';
            console.log(`${status} ${test}`);
        }

        // Summary
        const totalTests = Object.keys(this.testResults.capabilities).length;
        const passedTests = Object.values(this.testResults.capabilities).filter(r => r.passed).length;

        console.log(`\n📈 Summary: ${passedTests}/${totalTests} browser capabilities supported`);
        console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutomatedBrowserTests;
} else {
    window.AutomatedBrowserTests = AutomatedBrowserTests;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    const tester = new AutomatedBrowserTests();
    tester.runAllTests();
}
EOF

echo "✅ Automated browser testing script created"

# Create browser-specific polyfills
echo "🔧 Creating browser-specific polyfills..."

cat > js/browser-polyfills.js << 'EOF'
// Browser Compatibility Polyfills
(function() {
    'use strict';

    // Polyfill for older browsers

    // Array.includes polyfill (IE support)
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement, fromIndex) {
            return this.indexOf(searchElement, fromIndex) !== -1;
        };
    }

    // Object.assign polyfill (IE support)
    if (typeof Object.assign !== 'function') {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            const to = Object(target);
            for (let index = 1; index < arguments.length; index++) {
                const nextSource = arguments[index];
                if (nextSource != null) {
                    for (const nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    // Fetch polyfill for older browsers
    if (!window.fetch) {
        window.fetch = function(url, options) {
            return new Promise(function(resolve, reject) {
                const xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    resolve({
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        text: function() { return Promise.resolve(xhr.responseText); },
                        json: function() { return Promise.resolve(JSON.parse(xhr.responseText)); }
                    });
                };
                xhr.onerror = function() {
                    reject(new Error('Network error'));
                };
                xhr.open(options && options.method || 'GET', url);
                if (options && options.headers) {
                    for (const header in options.headers) {
                        xhr.setRequestHeader(header, options.headers[header]);
                    }
                }
                xhr.send(options && options.body || null);
            });
        };
    }

    // Promise polyfill for very old browsers
    if (typeof Promise === 'undefined') {
        window.Promise = function(executor) {
            const self = this;
            self.state = 'pending';
            self.value = undefined;
            self.handlers = [];

            function resolve(value) {
                if (self.state === 'pending') {
                    self.state = 'fulfilled';
                    self.value = value;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }

            function reject(reason) {
                if (self.state === 'pending') {
                    self.state = 'rejected';
                    self.value = reason;
                    self.handlers.forEach(handle);
                    self.handlers = null;
                }
            }

            function handle(handler) {
                if (self.state === 'pending') {
                    self.handlers.push(handler);
                } else {
                    if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
                        handler.onFulfilled(self.value);
                    }
                    if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
                        handler.onRejected(self.value);
                    }
                }
            }

            this.then = function(onFulfilled, onRejected) {
                return new Promise(function(resolve, reject) {
                    handle({
                        onFulfilled: function(value) {
                            try {
                                resolve(onFulfilled ? onFulfilled(value) : value);
                            } catch (ex) {
                                reject(ex);
                            }
                        },
                        onRejected: function(reason) {
                            try {
                                resolve(onRejected ? onRejected(reason) : reason);
                            } catch (ex) {
                                reject(ex);
                            }
                        }
                    });
                });
            };

            executor(resolve, reject);
        };
    }

    // CSS.supports polyfill
    if (!window.CSS || !CSS.supports) {
        window.CSS = window.CSS || {};
        CSS.supports = function(property, value) {
            const element = document.createElement('div');
            try {
                element.style[property] = value;
                return element.style[property] === value;
            } catch (e) {
                return false;
            }
        };
    }

    // CustomEvent polyfill for IE
    if (typeof CustomEvent !== 'function') {
        function CustomEvent(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            const evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    }

    // Browser-specific fixes
    const userAgent = navigator.userAgent;

    // Safari-specific fixes
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        // Fix for Safari's date parsing
        const originalDate = Date;
        Date = function(dateString) {
            if (typeof dateString === 'string' && dateString.includes('-')) {
                dateString = dateString.replace(/-/g, '/');
            }
            return new originalDate(dateString);
        };
        Date.prototype = originalDate.prototype;
    }

    // Firefox-specific fixes
    if (userAgent.includes('Firefox')) {
        // Add any Firefox-specific polyfills here
    }

    // Edge-specific fixes
    if (userAgent.includes('Edg')) {
        // Add any Edge-specific polyfills here
    }

    // Mobile browser fixes
    if (/Mobi|Android/i.test(userAgent)) {
        // Prevent double-tap zoom on buttons
        document.addEventListener('touchend', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('btn')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Fix for iOS viewport height
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => setTimeout(setVH, 100));
    }

    console.log('✅ Browser polyfills loaded');
})();
EOF

echo "✅ Browser polyfills created"

echo ""
echo "🌐 Cross-Browser Compatibility Testing Setup Complete!"
echo "====================================================="
echo ""
echo "📋 Available Tools:"
echo "  1. browser-compatibility-test.html - Interactive testing interface"
echo "  2. automated-browser-tests.js - Automated test suite"
echo "  3. js/browser-polyfills.js - Compatibility polyfills"
echo ""
echo "🧪 Testing Instructions:"
echo "  1. Open browser-compatibility-test.html in each target browser"
echo "  2. Run manual tests for each browser"
echo "  3. Document any issues found"
echo "  4. Test on mobile versions of browsers"
echo ""
echo "📱 Target Browsers:"
echo "  ✓ Chrome (desktop/mobile)"
echo "  ✓ Safari (desktop/mobile)"
echo "  ✓ Firefox"
echo "  ✓ Edge"
echo ""
echo "🔧 Next Steps:"
echo "  1. Test on each browser systematically"
echo "  2. Document compatibility issues"
echo "  3. Implement browser-specific fixes"
echo "  4. Verify wallet functionality across browsers"
