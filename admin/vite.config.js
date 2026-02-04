import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0', // 允许外部访问，不仅仅是localhost
    port: 8080,
    allowedHosts: [
      'rmadmin.sdiread.com' // 允许的域名
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8300',
        changeOrigin: true,
        secure: false, // 如果目标服务器使用 HTTPS，设为 true
        ws: true, // 支持 WebSocket
        // 不重写路径，保持原始路径
        rewrite: (path) => path,
        // 确保所有 HTTP 方法都被代理（包括 POST）
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 确保请求方法正确传递
            console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`)
          })
        }
      }
    }
  }
})

