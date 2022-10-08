import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
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
    coverage: {
      include: ['src/**/*.ts', '!src/**/*.{d}.ts'],
      reportsDirectory: 'coverage',
      enabled: true,
      reporter: ['text', 'lcov', 'json'],
    },
  },
});
