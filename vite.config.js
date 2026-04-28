import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This MUST match your repository name exactly
  base: '/AI-ML_Learning_Program_Tracker_App/', 
})
