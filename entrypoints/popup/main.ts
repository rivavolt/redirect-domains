const list = document.getElementById('list')!;

chrome.runtime.sendMessage({ type: 'getState' }, (res) => {
  const disabledRuleIds = new Set<number>(res.disabledRuleIds);

  for (let i = 0; i < res.redirects.length; i++) {
    const r = res.redirects[i];
    const ruleId = i + 1;

    const row = document.createElement('div');
    row.className = 'row';

    const label = document.createElement('span');
    label.className = 'label';
    label.innerHTML = `${r.from} <span class="to">&rarr; ${r.to}</span>`;

    const toggle = document.createElement('label');
    toggle.className = 'toggle';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !disabledRuleIds.has(ruleId);
    input.addEventListener('change', () => {
      if (input.checked) {
        disabledRuleIds.delete(ruleId);
      } else {
        disabledRuleIds.add(ruleId);
      }
      chrome.runtime.sendMessage({
        type: 'setDisabledRuleIds',
        disabledRuleIds: Array.from(disabledRuleIds),
      });
    });

    const slider = document.createElement('span');
    slider.className = 'slider';

    toggle.append(input, slider);
    row.append(label, toggle);
    list.append(row);
  }
});
