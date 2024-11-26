let selectedMinutes = 10; // Default value

document.querySelectorAll('.preset-button').forEach(button => {
    console.log("Preset button clicked");
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
    const minutes = Math.min(Math.max(e.target.value, 1), 720);
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
    console.log('Starting goose...');
    const goose = new Goose();
    goose.walk();
    chrome.runtime.sendMessage({ action: "startTimer" });
    chrome.storage.local.set({ 
        timerMinutes: selectedMinutes,
        timerStart: Date.now(),
        timerActive: true
    });
    document.getElementById('stopButton').disabled = false; // Enable stop button
    document.getElementById('startButton').disabled = true; // Disable start button
    window.close();
});

document.getElementById('stopButton').addEventListener('click', () => {
    console.log('Stopping goose...');
    goose = null; // Reset goose object
    chrome.runtime.sendMessage({ action: "stopTimer" });
    chrome.storage.local.set({ timerActive: false });
    window.close();
});