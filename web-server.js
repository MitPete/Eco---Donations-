const express = require('express');
const path = require('path');

const app = express();
const PORT = 5173;

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

app.get('/whitepaper', (req, res) => {
  res.sendFile(path.join(__dirname, 'whitepaper.html'));
});

// Serve static files from current directory
app.use(express.static(__dirname));

// Default route serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server on all interfaces (0.0.0.0) so it's accessible on network
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at:`);
  console.log(`  Local:   http://localhost:${PORT}/`);
  console.log(`  Network: http://192.168.86.148:${PORT}/`);
});
