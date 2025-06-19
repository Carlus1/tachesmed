import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'calendar-vendor': [
                        '@fullcalendar/core',
                        '@fullcalendar/daygrid',
                        '@fullcalendar/interaction',
                        '@fullcalendar/react',
                        '@fullcalendar/timegrid'
                    ]
                }
            }
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: false
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom']
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    }
});