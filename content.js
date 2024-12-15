// Singleton initialization function
function initializeGoose() {
  if (!window.goose) {
    window.goose = new Goose();
  }
  return window.goose;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only process messages in the main frame
  if (window !== window.top) {
    console.log("message blocked: ", message);
    return;
  };

  console.log("Message received:", message);
  const goose = initializeGoose();
  
  switch (message.command) {
    case "browserStartup":
      console.log("Initializing Goose assets...");
      assets.initialize();
      break;

    case "startGoose":
      assets.initialize();

      setTimeout(() => {
        goose.setState('wander');
        sendResponse({ status: "startedGoose" });
      }, 1000);  
      break;
    
    case "stopGoose":
      goose.delete();
      sendResponse({ status: "stoppedGoose" });
      break;
  }
  return true;  // Indicates we wish to send a response asynchronously
}); 
