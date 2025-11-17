import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { swEnvPlugin } from './vite-plugin-sw-env.js'

export default defineConfig({
  plugins: [react(), swEnvPlugin()],
  base: '/home-assistant/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/messaging'],
          'utils-vendor': ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for better chunking
  },
})

