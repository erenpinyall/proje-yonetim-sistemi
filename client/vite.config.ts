import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API normalde 8080'de çalışır. Port başka bir servis tarafından
// kullanılıyorsa TASKTRAKER_API ile geçici olarak değiştirilebilir.
const apiTarget = process.env.TASKTRAKER_API ?? 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/hubs': {
        target: apiTarget,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
