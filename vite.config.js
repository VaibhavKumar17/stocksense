import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Don't watch backend folder (no longer needed, but kept for safety)
      ignored: ['**/backend/**']
    }
  }
})
