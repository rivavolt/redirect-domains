import redirects from '../../redirects.json';

const STORAGE_KEY = 'disabledDomains';

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'setDisabled') {
      chrome.storage.local.set({ [STORAGE_KEY]: msg.disabled }).then(() => {
        sendResponse({ ok: true });
      });
      return true;
    }
    if (msg.type === 'getState') {
      chrome.storage.local.get(STORAGE_KEY).then((result) => {
        sendResponse({
          redirects,
          disabled: result[STORAGE_KEY] || [],
        });
      });
      return true;
    }
  });
});
