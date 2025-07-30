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
