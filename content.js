
// Singleton initialization function
function initializeGoose() {
  if (!window.goose) {
    window.goose = new Goose();
  }
  return window.goose;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only process messages in the main frame
  if (window !== window.top) return;

  console.log("Message received:", message);
  const goose = initializeGoose();
  
  switch(message.command) {
    case "startGoose":
      goose.setAction('wander');
      goose.playSFX(goose.sfx.honk);
      sendResponse({ status: "Goose walking" });
      break;
    
    case "stopGoose":
      goose.delete();
      sendResponse({ status: "Goose stopped" });
      break;
  }
  return true;  // Indicates we wish to send a response asynchronously
}); 