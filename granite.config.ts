import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'moneytermi',
  brand: {
    displayName: '머니터미',
    primaryColor: '#F97316',
    icon: 'https://static.toss.im/appsintoss/25699/18f666e4-2b68-4c41-98d4-34fdc6e1599e.png',
  },
  web: {
    host: '192.168.50.21',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  navigationBar: {
    withBackButton: true,
  },
  permissions: [],
});
