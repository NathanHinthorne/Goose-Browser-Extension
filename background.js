importScripts('ExtPay.js');

const extPay = ExtPay('annoying-goose'); 
extPay.startBackground();


// fires when the extension is first installed or updated
browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  triggerExtensionStartup();
});

// fires when entire browser first starts up
browser.runtime.onStartup.addListener(() => {
  console.log('Browser started');
  triggerExtensionStartup();
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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
  browser.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      browser.tabs.sendMessage(tab.id, { command: "extensionStartup" }, (response) => {
        if (browser.runtime.lastError) {
          console.log(`Tab ${tab.id} not ready yet`);
          return;
        }
        console.log('Extension startup response:', response);
      });
    });
  });
}

async function getCurrentTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true
  });
  return tab;
}