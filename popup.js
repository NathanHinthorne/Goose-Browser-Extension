document.querySelectorAll('.preset-button').forEach(button => {
    button.addEventListener('click', () => {
        let minutes;
        switch(button.textContent) {
            case '30 minutes':
                minutes = 30;
                break;
            case '1 hour':
                minutes = 60;
                break;
            case '2 hours':
                minutes = 120;
                break;
        }
        
        chrome.storage.local.set({ 
            timerMinutes: minutes,
            timerStart: Date.now(),
            timerActive: true
        });
        window.close();
    });
});

document.getElementById('breakTime').addEventListener('change', (e) => {
    const minutes = Math.min(Math.max(e.target.value, 1), 720);
    e.target.value = minutes;
});