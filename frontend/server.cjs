const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// Middleware to prevent caching for CSS and JS files
app.use((req, res, next) => {
  if (req.url.endsWith('.css') || req.url.endsWith('.js')) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🎨 CSS files will always load fresh (no caching)`);
});
