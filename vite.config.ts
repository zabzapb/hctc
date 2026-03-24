import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Mock API Route for Sync Profile
    {
      name: 'mock-sync-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/v1/auth/sync' && req.method === 'POST') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'success', message: 'Sync complete (Mock)' }));
            return;
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    // [DEV ONLY] Proxy to bypass CORS for Naver OAuth & API
    proxy: {
      '/naver-auth': {
        target: 'https://nid.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/naver-auth/, '')
      },
      '/naver-api': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/naver-api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
        },
      },
    },
  },
})
