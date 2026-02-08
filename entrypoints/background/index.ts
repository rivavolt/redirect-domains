import redirects from '../../redirects.json';

const STORAGE_KEY = 'disabledDomains';

async function getDisabled(): Promise<Set<string>> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return new Set(result[STORAGE_KEY] || []);
}

function buildRules(disabled: Set<string>): chrome.declarativeNetRequest.Rule[] {
  return redirects
    .filter((r) => !disabled.has(r.from))
    .map((r, i) => ({
      id: i + 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: { transform: { host: r.to } },
      },
      condition: {
        requestDomains: [r.from],
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
      },
    }));
}

async function syncRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map((r) => r.id);
  const disabled = await getDisabled();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: removeIds,
    addRules: buildRules(disabled),
  });
}

export default defineBackground(() => {
  // Sync rules on every service worker start — dynamic rules persist,
  // but this ensures config changes are picked up after extension updates.
  syncRules();
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'setDisabled') {
      chrome.storage.local.set({ [STORAGE_KEY]: msg.disabled }).then(() => {
        syncRules().then(() => sendResponse({ ok: true }));
      });
      return true;
    }
    if (msg.type === 'getState') {
      getDisabled().then((disabled) =>
        sendResponse({ redirects, disabled: Array.from(disabled) })
      );
      return true;
    }
  });
});
