import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: {
    // Firestore alone is ~450 kB; the admin area is split into its own chunk
    chunkSizeWarningLimit: 700,
  },
})
