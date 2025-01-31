import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Remove the base URL for direct deployment
  // base: '/skc_pytutor/',  // Comment out or remove this line
})
