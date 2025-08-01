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

// Define the frontend root directory (parent of scripts)
const frontendRoot = path.join(__dirname, '..');

// Route handlers for clean URLs
app.get('/donate', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'public', 'donate.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'public', 'history.html'));
});

app.get('/foundation', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'public', 'foundation.html'));
});

app.get('/foundations', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'public', 'foundation.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'public', 'dashboard.html'));
});

app.get('/governance', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'public', 'governance.html'));
});

app.get('/whitepaper', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'public', 'whitepaper.html'));
});

// Default route serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'public', 'index.html'));
});

// Serve static files
app.use(express.static(frontendRoot));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${frontendRoot}`);
  console.log(`🎨 CSS files will always load fresh (no caching)`);
});
