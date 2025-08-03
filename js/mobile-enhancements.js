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
