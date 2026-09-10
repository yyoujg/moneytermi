import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'moneytermi',
  brand: {
    primaryColor: '#F97316',
  },
  webView: {},
  webBundleDir: 'dist',
  navigationBar: {
    withBackButton: true,
  },
  permissions: [],
});
