let selectedMinutes = 10; // Default value

document.querySelectorAll('.preset-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.preset-button').forEach(btn => {
            btn.style.background = '#e0e0e0';
            btn.style.borderColor = '#9e9e9e';
            btn.style.color = '#333';
        });
      
        button.style.background = '#efb934';
        button.style.borderColor = '#e19834';
        button.style.color = 'white';
        
        switch(button.textContent) {
            case '30 minutes':
                selectedMinutes = 30;
                break;
            case '1 hour':
                selectedMinutes = 60;
                break;
            case '2 hours':
                selectedMinutes = 120;
                break;
        }
        document.getElementById('breakTime').value = selectedMinutes;
    });
});



document.getElementById('breakTime').addEventListener('change', (e) => {
    const minutes = Math.min(Math.max(e.target.value, 0.1), 720);
    e.target.value = minutes;
    selectedMinutes = minutes;
    
    // Reset preset button styles when custom time is entered
    document.querySelectorAll('.preset-button').forEach(btn => {
        btn.style.background = '#e0e0e0';
        btn.style.borderColor = '#9e9e9e';
        btn.style.color = '#333';
    });
});

document.getElementById('startButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "startGoose"});
    });

    chrome.storage.local.set({ 
        timerMinutes: selectedMinutes,
        timerStart: Date.now(),
        timerActive: true
    });
    document.getElementById('stopButton').disabled = false;
    document.getElementById('startButton').disabled = true;
    chrome.runtime.sendMessage({ action: "startTimer" });
    window.close();
});

document.getElementById('stopButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "stopGoose"});
    });

    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.storage.local.set({ timerActive: false });
    window.close();
});

// When popup opens, check the timer state
// this maintains state even when the popup is closed
chrome.storage.local.get(['timerActive'], (result) => {
    if (result.timerActive) {
        document.getElementById('stopButton').disabled = false;
        document.getElementById('startButton').disabled = true;
        for (const button of document.getElementsByClassName('preset-button')) {
            button.disabled = true;
        }
        document.getElementById('breakTime').disabled = true;
    } else {
        document.getElementById('stopButton').disabled = true;
        document.getElementById('startButton').disabled = false;
        for (const button of document.getElementsByClassName('preset-button')) {
            button.disabled = false;
        }
        document.getElementById('breakTime').disabled = false;
    }
});