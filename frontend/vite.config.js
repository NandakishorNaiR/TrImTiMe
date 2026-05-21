import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: `http://localhost:${process.env.BACKEND_PORT || 4000}`,
                changeOrigin: true,
                rewrite: (path) => path
            }
        }
    }
})