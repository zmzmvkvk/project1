import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // '/api'로 시작하는 요청은 백엔드 서버(http://localhost:8080)로 전달
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    }
  }
})
