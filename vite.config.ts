import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // 👇👇👇 关键修改在这里 👇👇👇
  build: {
    target: "esnext" // 允许使用最新的 JS 特性 (Top-level await)
  },
  // ☝️☝️☝️ 关键修改在这里 ☝️☝️☝️
  
  server: {
    port: 3000,
    host: '0.0.0.0',
  }
});
