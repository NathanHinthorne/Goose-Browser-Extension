document.getElementById('startTimer').addEventListener('click', () => {
  const minutes = document.getElementById('breakTime').value;
  chrome.storage.local.set({ 
    timerMinutes: minutes,
    timerStart: Date.now(),
    timerActive: true
  });
  window.close();
});