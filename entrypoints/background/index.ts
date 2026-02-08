import redirects from '../../redirects.json';

const STORAGE_KEY = 'disabledRuleIds';
const RULESET_ID = 'redirects';

async function getDisabledRuleIds(): Promise<number[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async () => {
    const disabledRuleIds = await getDisabledRuleIds();
    if (disabledRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateStaticRules({
        rulesetId: RULESET_ID,
        disableRuleIds: disabledRuleIds,
      });
    }
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'setDisabledRuleIds') {
      const { disabledRuleIds } = msg;
      const allIds = redirects.map((_r, i) => i + 1);
      const enableIds = allIds.filter((id) => !disabledRuleIds.includes(id));

      chrome.storage.local.set({ [STORAGE_KEY]: disabledRuleIds }).then(() =>
        chrome.declarativeNetRequest
          .updateStaticRules({
            rulesetId: RULESET_ID,
            disableRuleIds: disabledRuleIds,
            enableRuleIds: enableIds,
          })
          .then(() => sendResponse({ ok: true }))
      );
      return true;
    }
    if (msg.type === 'getState') {
      getDisabledRuleIds().then((disabledRuleIds) =>
        sendResponse({ redirects, disabledRuleIds })
      );
      return true;
    }
  });
});
