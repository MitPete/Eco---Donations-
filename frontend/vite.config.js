import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Project root
  root: '.',

  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,

    // Multi-page configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        donate: resolve(__dirname, 'src/pages/donate.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard.html'),
        governance: resolve(__dirname, 'src/pages/governance.html'),
        history: resolve(__dirname, 'src/pages/history.html'),
        foundation: resolve(__dirname, 'src/pages/foundation.html'),
        whitepaper: resolve(__dirname, 'src/pages/whitepaper.html')
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
