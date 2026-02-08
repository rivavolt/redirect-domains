const toggle = document.getElementById('toggle') as HTMLInputElement;

chrome.runtime.sendMessage({ type: 'getState' }, (res) => {
  toggle.checked = res.enabled;
});

toggle.addEventListener('change', () => {
  chrome.runtime.sendMessage({ type: 'toggle', enabled: toggle.checked });
});
