import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Bind to all network interfaces for network access
    port: 5173,
    strictPort: false, // Allow using alternative port if 5173 is busy
    allowedHosts: ['.ngrok-free.dev', '.ngrok.io', 'localhost'], // Allow ngrok domains
    hmr: {
      clientPort: 443, // Use HTTPS port for HMR over ngrok
    },
  },
})
