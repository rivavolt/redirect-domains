import { defineConfig } from 'wxt';
import redirects from './redirects.json';

const hosts = redirects.map((r) => `*://*.${r.from}/*`);

export default defineConfig({
  modules: [],
  manifest: {
    name: 'Redirect Domains',
    version: '0.1.0',
    description: 'Redirects domains based on declarative config',
    permissions: ['declarativeNetRequest', 'storage'],
    host_permissions: hosts,
  },
});
