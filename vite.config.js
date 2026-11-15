import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The API (server/) runs on :8787 in dev; in production nginx routes /api and /uploads to it.
const api = { target: 'http://127.0.0.1:8787', changeOrigin: false }

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': api, '/uploads': api } },
})
