document.getElementById('start-check').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'start-check' });
});
