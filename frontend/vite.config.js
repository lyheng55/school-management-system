import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // Set API URL for production builds - can be overridden by VITE_API_URL env var
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://192.168.20.82:5000/api'),
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow access from network IP addresses
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0', // Allow access from network IP addresses
    proxy: {
      '/api': {
        target: 'http://192.168.20.82:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
      }
    }
  }
})

