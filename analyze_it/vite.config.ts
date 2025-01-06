import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Autorise aussi localhost
    port: 5173,  // Optionnel, mais utile pour fixer le port
  },
})
