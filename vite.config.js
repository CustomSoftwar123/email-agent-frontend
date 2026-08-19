import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5174,
    // Same backend port nginx proxies to in production, so dev and live agree.
    proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } },
})
