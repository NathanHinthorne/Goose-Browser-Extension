importScripts('ExtPay.js');

const extPay = ExtPay('annoying-goose'); 
extPay.startBackground();

// temp
extPay.getUser().then(user => {
  console.log(user);
});


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
  console.log('triggerExtensionStartup() called');
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

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  return tab;
}