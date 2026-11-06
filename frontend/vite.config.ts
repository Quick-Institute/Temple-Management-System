import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

// Tailwind is processed through PostCSS (see postcss.config.cjs), so no Vite Tailwind plugin is needed.
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        allowedHosts: true,
    },
})
