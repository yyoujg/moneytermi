import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'moneytermi',
  brand: {
    displayName: '머니터미',
    primaryColor: '#F97316',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
});
