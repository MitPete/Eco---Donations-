const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

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

// Route handlers for clean URLs
app.get('/donate', (req, res) => {
  res.sendFile(path.join(__dirname, 'donate.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, 'history.html'));
});

app.get('/foundation', (req, res) => {
  res.sendFile(path.join(__dirname, 'foundation.html'));
});

app.get('/foundations', (req, res) => {
  res.sendFile(path.join(__dirname, 'foundation.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/governance', (req, res) => {
  res.sendFile(path.join(__dirname, 'governance.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🎨 CSS files will always load fresh (no caching)`);
});
