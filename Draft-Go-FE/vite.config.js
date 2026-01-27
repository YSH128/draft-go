import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 현재 모드에 맞는 .env 파일 로드 (VITE_ 접두사 상관없이 모두 로드하려면 세 번째 인자로 '' 전달)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      global: 'globalThis',
    },
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'https://draft-go.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})