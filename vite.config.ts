import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'site',
    emptyOutDir: false,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
