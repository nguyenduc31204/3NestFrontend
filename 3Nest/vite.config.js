import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    
  ],
  server: {
    // Chỉ định port bạn muốn Vite chạy trên máy local
    // Đây là một con số, không phải URL
     allowedHosts: ['13ff-42-114-33-42.ngrok-free.app', '.ngrok-free.app'], // Add your ngrok host here
  }
})
