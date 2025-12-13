import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use env-configurable base so local dev works ("/") and GitHub Pages can set "/ascent/"
  base: process.env.VITE_BASE_PATH || '/',
})