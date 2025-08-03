/**
 * Simple client-side router to handle navigation without .html extensions
 */

// Route mapping for clean URLs
const routes = {
  '/': 'index.html',
  '/home': 'index.html',
  '/donate': 'donate.html',
  '/history': 'history.html',
  '/foundation': 'foundation.html',
  '/foundations': 'foundation.html',
  '/dashboard': 'dashboard.html',
  '/governance': 'governance.html'
};

/**
 * Handle navigation for clean URLs
 */
function handleNavigation() {
  // Get the current path
  const path = window.location.pathname;

  // If the path doesn't end with .html and exists in our routes
  if (!path.endsWith('.html') && routes[path]) {
    // Redirect to the correct HTML file
    const correctPath = routes[path];

    // Preserve query parameters if they exist
    const queryString = window.location.search;

    // Use replace instead of assign to avoid creating history entries
    window.location.replace(correctPath + queryString);
  }
}

/**
 * Set up navigation listeners for clean URL handling
 */
function setupRouting() {
  // Handle direct navigation to clean URLs
  handleNavigation();

  // Intercept clicks on navigation links to handle clean URLs
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');

    if (!link) return;

    const href = link.getAttribute('href');

    // If it's a clean URL (no .html), let it work naturally
    // The server should handle 404s and redirect, but we handle client-side
    if (href && !href.endsWith('.html') && routes[href]) {
      e.preventDefault();

      // Navigate to the correct HTML file
      const correctPath = routes[href];
      window.location.href = correctPath;
    }
  });
}

// Initialize routing when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupRouting);
} else {
  setupRouting();
}

// Also run on page load
window.addEventListener('load', handleNavigation);
