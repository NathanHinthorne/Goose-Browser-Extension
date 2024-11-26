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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    setActiveBadge();
  } else if (request.action === "stopTimer") {
    clearBadge();
  }
});