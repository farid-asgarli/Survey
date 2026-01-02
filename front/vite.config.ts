import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks(id) {
          // Vendor chunks - split by dependency type for better caching
          if (id.includes('node_modules')) {
            // Core React runtime - rarely changes
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
              return 'vendor-react';
            }
            // State management and data fetching
            if (id.includes('zustand') || id.includes('@tanstack/react-query') || id.includes('immer')) {
              return 'vendor-state';
            }
            // Form handling
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/')) {
              return 'vendor-forms';
            }
            // UI utilities and animation
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            // i18n
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
            // Icons (lucide-react has many icons, good to keep separate)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Other vendor code
            return 'vendor';
          }
        },
      },
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Increase chunk size warning limit (default 500kb)
    chunkSizeWarningLimit: 600,
  },
});
