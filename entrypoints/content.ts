import redirects from '../redirects.json';

export default defineContentScript({
  matches: redirects.map((r) => `*://${r.from}/*`),
  runAt: 'document_start',
  async main() {
    const { disabledDomains } = await chrome.storage.local.get('disabledDomains');
    const disabled = new Set(disabledDomains || []);
    const match = redirects.find((r) => r.from === location.hostname && !disabled.has(r.from));
    if (match) {
      location.replace(location.href.replace(location.hostname, match.to));
    }
  },
});
