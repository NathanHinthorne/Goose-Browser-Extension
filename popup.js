document.getElementById('startButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {command: "startGoose"});
        chrome.storage.local.set({ [`gooseActive_${tabId}`]: true }, () => {
            document.getElementById('stopButton').disabled = false;
            document.getElementById('startButton').disabled = true;
            window.close();
        });
    });
});

document.getElementById('stopButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const tabId = tabs[0].id;
        chrome.tabs.sendMessage(tabId, {command: "stopGoose"});
        chrome.storage.local.set({ [`gooseActive_${tabId}`]: false }, () => {
            document.getElementById('stopButton').disabled = true;
            document.getElementById('startButton').disabled = false;
            window.close();
        });
    });
});

document.getElementById('toggleStateSwapper').addEventListener('change', (event) => {
    const enabled = event.target.checked;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        chrome.storage.local.set({ [`stateSwapperEnabled_${tabId}`]: enabled }, () => {
            chrome.tabs.sendMessage(tabId, { command: "toggleStateSwapper", enabled: enabled });
        });
    });
});

// When popup opens, check the goose state and state swapper state
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;
    chrome.storage.local.get([`gooseActive_${tabId}`, `stateSwapperEnabled_${tabId}`], (result) => {
        if (result[`gooseActive_${tabId}`]) {
            document.getElementById('stopButton').disabled = false;
            document.getElementById('startButton').disabled = true;
        } else {
            document.getElementById('stopButton').disabled = true;
            document.getElementById('startButton').disabled = false;
        }
        document.getElementById('toggleStateSwapper').checked = result[`stateSwapperEnabled_${tabId}`];
    });
});