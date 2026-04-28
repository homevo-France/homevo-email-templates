import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Sur GitHub Pages, l'app est servie sous /<repo-name>/.
  // En dev local, base = "/" pour http://localhost:5173/
  base: process.env.VITE_BASE_PATH || "/",
})
