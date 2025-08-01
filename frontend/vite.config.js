import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Project root - using public directory as root
  root: './public',
  publicDir: false, // Disable default public dir since we're already in it

  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,

    // Multi-page configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        donate: resolve(__dirname, 'public/donate.html'),
        dashboard: resolve(__dirname, 'public/dashboard.html'),
        governance: resolve(__dirname, 'public/governance.html'),
        history: resolve(__dirname, 'public/history.html'),
        foundation: resolve(__dirname, 'public/foundation.html'),
        whitepaper: resolve(__dirname, 'public/whitepaper.html')
      }
    },

    // Asset handling
    assetsDir: 'assets',
    assetsInlineLimit: 4096,

    // Performance optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // Development server
  server: {
    port: 8888,
    host: true,
    open: true,
    cors: true,

    // File system routing - allow access to parent directories
    fs: {
      allow: ['..']
    },

    // Proxy for API calls if needed
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // Preview server (production preview)
  preview: {
    port: 8889,
    host: true
  },

  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.css";`
      }
    }
  },

  // Asset optimization
  assetsInclude: ['**/*.glb', '**/*.gltf'],

  // Environment variables
  envPrefix: 'VITE_',

  // Plugin configuration
  plugins: [
    // Add plugins as needed
  ],

  // Dependency optimization
  optimizeDeps: {
    include: ['ethers', 'web3'],
    exclude: []
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@scripts': resolve(__dirname, 'src/scripts'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // JSON handling
  json: {
    namedExports: true,
    stringify: false
  },

  // Worker configuration
  worker: {
    format: 'es'
  }
})
