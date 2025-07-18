import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Root directory
  root: '.',

  // Public directory
  publicDir: 'assets',

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    target: 'es2015',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        donate: path.resolve(__dirname, 'donate.html'),
        history: path.resolve(__dirname, 'history.html'),
        foundation: path.resolve(__dirname, 'foundation.html'),
        dashboard: path.resolve(__dirname, 'dashboard.html')
      }
    }
  },

  // Development server configuration
  server: {
    port: 5500,
    open: true,
    cors: true,
    host: '0.0.0.0'
  },

  // Module resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './js'),
      '@components': path.resolve(__dirname, './js/modules'),
      '@utils': path.resolve(__dirname, './js/utils'),
      '@css': path.resolve(__dirname, './css'),
      '@assets': path.resolve(__dirname, './assets')
    }
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    postcss: {
      plugins: []
    }
  },

  // Plugin configuration
  plugins: [],

  // Optimization
  optimizeDeps: {
    include: ['ethers']
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  }
});
