import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/gmgen/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2021',
    commonjsOptions: {
      esmExternals: true,
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
    rage: {
      include: ['src/**/*.ts', '!src/**/*.{d}.ts'],
      reportsDirectory: 'coverage',
      enabled: true,
      reporter: ['text', 'lcov', 'json'],
    },
  },
});
