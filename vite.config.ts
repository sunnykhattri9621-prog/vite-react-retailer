import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react() ,  tailwindcss()],
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    mimeTypes: {
      'tsx': 'text/javascript',  // ← ADD THIS
      'ts': 'text/javascript',
    }
  }
})
