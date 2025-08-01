// Critical resource preloader to eliminate FOUC
(function() {
  'use strict';

  // Configuration
  const CRITICAL_CSS_TIMEOUT = 300; // Max time to wait for CSS before showing content
  const FONT_TIMEOUT = 500; // Max time to wait for fonts

  // Track loading state
  let cssLoaded = false;
  let fontsLoaded = false;
  let timeoutReached = false;

  // Function to show content
  function showContent() {
    if (document.body && !document.body.classList.contains('css-loaded')) {
      document.body.classList.add('css-loaded');
      console.log('✅ FOUC prevention: Content visible');
    }
  }

  // Function to check if we should show content
  function checkLoadState() {
    if (cssLoaded && fontsLoaded) {
      showContent();
    } else if (timeoutReached) {
      console.warn('⚠️ FOUC prevention: Timeout reached, showing content anyway');
      showContent();
    }
  }

  // Timeout fallback
  setTimeout(function() {
    timeoutReached = true;
    checkLoadState();
  }, CRITICAL_CSS_TIMEOUT);

  // Font loading detection
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
      fontsLoaded = true;
      console.log('✅ Fonts loaded');
      checkLoadState();
    }).catch(function() {
      fontsLoaded = true; // Continue anyway
      checkLoadState();
    });

    // Font timeout
    setTimeout(function() {
      if (!fontsLoaded) {
        fontsLoaded = true;
        checkLoadState();
      }
    }, FONT_TIMEOUT);
  } else {
    // Fallback for older browsers
    fontsLoaded = true;
  }

  // CSS loading detection
  function detectCSSLoad() {
    // Check if critical stylesheets are loaded
    const baseCss = document.getElementById('base-css');
    const pageCss = document.getElementById('page-css');

    if (baseCss && pageCss) {
      // Use a more reliable method to detect CSS load
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      testElement.className = 'header'; // Use a class that should be styled
      document.body.appendChild(testElement);

      // Check if the element has been styled
      const computedStyle = window.getComputedStyle(testElement);
      if (computedStyle.display !== 'inline') {
        cssLoaded = true;
        console.log('✅ Critical CSS loaded');
        document.body.removeChild(testElement);
        checkLoadState();
      } else {
        document.body.removeChild(testElement);
        // Retry in a short while
        setTimeout(detectCSSLoad, 50);
      }
    }
  }

  // Start CSS detection when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectCSSLoad);
  } else {
    detectCSSLoad();
  }

  // Fallback: use load event
  window.addEventListener('load', function() {
    cssLoaded = true;
    fontsLoaded = true;
    checkLoadState();
  });

  // Additional optimization: preload next likely page
  function preloadLikelyPages() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let nextPages = [];

    // Predict likely next pages based on current page
    switch(currentPage) {
      case 'index.html':
      case '':
        nextPages = ['donate.html', 'dashboard.html'];
        break;
      case 'donate.html':
        nextPages = ['history.html', 'dashboard.html'];
        break;
      case 'dashboard.html':
        nextPages = ['history.html', 'governance.html'];
        break;
      case 'history.html':
        nextPages = ['foundation.html', 'dashboard.html'];
        break;
    }

    // Preload CSS for likely next pages
    nextPages.forEach(function(page) {
      const pageName = page.replace('.html', '');
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/src/styles/css/${pageName}.css?v=1`;
      document.head.appendChild(link);
    });
  }

  // Preload likely pages after current page is fully loaded
  window.addEventListener('load', function() {
    setTimeout(preloadLikelyPages, 1000);
  });

})();
