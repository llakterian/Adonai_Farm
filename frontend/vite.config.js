import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Admin chunk for all admin-related components
          'admin': [
            './src/pages/Dashboard.jsx',
            './src/pages/Breeding.jsx',
            './src/pages/Workers.jsx',
            './src/pages/Reports.jsx',
            './src/pages/Account.jsx',
            './src/pages/Inventory.jsx',
            './src/pages/Users.jsx',
            './src/pages/Infrastructure.jsx',
            './src/pages/ContactManagement.jsx',
            './src/pages/PublicContentManagement.jsx',
            './src/components/AdminLayout.jsx'
          ],
          // Public chunk for public-facing components
          'public': [
            './src/pages/Homepage.jsx',
            './src/pages/About.jsx',
            './src/pages/Services.jsx',
            './src/pages/Contact.jsx',
            './src/pages/Gallery.jsx',
            './src/components/PublicLayout.jsx',
            './src/components/PublicGallery.jsx',
            './src/components/AnimalShowcase.jsx'
          ],
          // Utils chunk for utility functions
          'utils': [
            './src/utils/imageOptimization.js',
            './src/utils/progressiveEnhancement.js',
            './src/utils/seo.js',
            './src/utils/sitemap.js',
            './src/utils/offline.js',
            './src/utils/notifications.js'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    // Optimize build performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      }
    },
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-helmet-async'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // Performance optimizations
  esbuild: {
    // Remove console logs in production
    drop: ['console', 'debugger']
  }
})