// fires when the extension is first installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  triggerExtensionStartup();
});

// fires when entire browser first starts up
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started');
  triggerExtensionStartup();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // React to tab updates
  if (changeInfo.status === 'complete') {
    // Tab finished loading
    console.log('Tab loaded:', tab.url);
    triggerExtensionStartup();
  }
});

function triggerExtensionStartup() {
  // Query for all tabs and send message to each
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { command: "extensionStartup" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log(`Tab ${tab.id} not ready yet`);
          return;
        }
        console.log('Extension startup response:', response);
      });
    });
  });
}


// Set badge when timer starts
function setActiveBadge() {
  chrome.action.setBadgeText({ text: "ON" });
  chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
}

// Clear badge when timer stops
function clearBadge() {
  chrome.action.setBadgeText({ text: "" });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("background.js recieved message:", message);

  switch( message.action ) {
    case "startTimer":
      setActiveBadge();
      break;

    case "stopTimer":
      clearBadge();
      break;
  }
});


// Handle alarms for scheduled tasks
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodicTask') {
    // Execute scheduled task
  }
});

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  return tab;
}