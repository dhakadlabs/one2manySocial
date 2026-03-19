import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/devto-proxy': {
        target: 'https://dev.to',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/devto-proxy/, ''),
        secure: true,
      },
      '/tumblr-proxy': {
        target: 'https://www.tumblr.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/tumblr-proxy/, ''),
        secure: true,
      },
      '/tumblr-api-proxy': {
        target: 'https://api.tumblr.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/tumblr-api-proxy/, ''),
        secure: true,
      },
    },
  },
})