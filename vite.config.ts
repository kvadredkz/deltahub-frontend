import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 4000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            secure: false,
            configure: (proxy, options) => {
              proxy.on('error', (err, req, res) => {
                console.log('proxy error', err);
              });
              proxy.on('proxyReq', (proxyReq, req, res) => {
                console.log('Sending Request to the Target:', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes, req, res) => {
                console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
              });
            }
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
