// fires when the extension is first installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  triggerBrowserStartup();
});

// fires when entire browser first starts up
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started');
  triggerBrowserStartup();
});

function triggerBrowserStartup() {
  // Send to all tabs
  // chrome.tabs.query({}, (tabs) => {
  //   tabs.forEach(tab => {
  //     try {
  //       chrome.tabs.sendMessage(tab.id, { command: "browserStartup" }, (response) => {
  //         if (chrome.runtime.lastError) {
  //           console.error('Error sending browserStartup:', chrome.runtime.lastError);
  //         } else {
  //           console.log('browserStartup message sent successfully');
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Exception sending browserStartup:', error);
  //     }
  //   });
  // });

  // // Also send directly to runtime in case no tabs are open
  // chrome.runtime.sendMessage({ command: "browserStartup" }, (response) => {
  //   if (chrome.runtime.lastError) {
  //     console.error('Error sending browserStartup to runtime:', chrome.runtime.lastError);
  //   }
  // });
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


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // React to tab updates
  if (changeInfo.status === 'complete') {
    // Tab finished loading
    console.log('Tab loaded:', tab.url);
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