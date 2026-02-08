import { defineConfig } from 'wxt';

export default defineConfig({
  modules: [],
  manifest: {
    name: 'Redirect Domains',
    version: '0.1.0',
    description: 'Redirects domains based on declarative config',
    permissions: ['declarativeNetRequest', 'storage'],
    host_permissions: ['<all_urls>'],
  },
});
