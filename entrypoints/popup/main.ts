const list = document.getElementById('list')!;

chrome.runtime.sendMessage({ type: 'getState' }, (res) => {
  const disabled = new Set<string>(res.disabled);

  for (const r of res.redirects) {
    const row = document.createElement('div');
    row.className = 'row';

    const label = document.createElement('span');
    label.className = 'label';
    label.innerHTML = `${r.from} <span class="to">&rarr; ${r.to}</span>`;

    const toggle = document.createElement('label');
    toggle.className = 'toggle';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !disabled.has(r.from);
    input.addEventListener('change', () => {
      if (input.checked) {
        disabled.delete(r.from);
      } else {
        disabled.add(r.from);
      }
      chrome.runtime.sendMessage({
        type: 'setDisabled',
        disabled: Array.from(disabled),
      });
    });

    const slider = document.createElement('span');
    slider.className = 'slider';

    toggle.append(input, slider);
    row.append(label, toggle);
    list.append(row);
  }
});
