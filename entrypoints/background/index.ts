import redirects from '../../redirects.json';

const STORAGE_KEY = 'redirectsEnabled';

async function isEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] !== false;
}

function buildRules(): chrome.declarativeNetRequest.Rule[] {
  return redirects.map((r, i) => ({
    id: i + 1,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      redirect: {
        transform: { host: r.to },
      },
    },
    condition: {
      urlFilter: `||${r.from}`,
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
    },
  }));
}

async function updateRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeIds = existing.map((r) => r.id);

  if (await isEnabled()) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeIds,
      addRules: buildRules(),
    });
  } else {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeIds,
    });
  }
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    updateRules();
  });

  chrome.runtime.onStartup.addListener(() => {
    updateRules();
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'toggle') {
      chrome.storage.local.set({ [STORAGE_KEY]: msg.enabled }).then(() => {
        updateRules().then(() => sendResponse({ ok: true }));
      });
      return true;
    }
    if (msg.type === 'getState') {
      isEnabled().then((enabled) => sendResponse({ enabled }));
      return true;
    }
  });
});
