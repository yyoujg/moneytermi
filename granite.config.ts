import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'moneytermi',
  brand: {
    displayName: '머니터미',
    primaryColor: '#F97316',
    icon: 'https://static.toss.im/appsintoss/25699/18f666e4-2b68-4c41-98d4-34fdc6e1599e.png',
  },
  web: {
    // 실기기 QR 테스트 시 각자 LAN IP를 AIT_DEV_HOST 로 지정
    host: process.env.AIT_DEV_HOST ?? '0.0.0.0',
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
