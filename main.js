// ====== SETUP =======

let CANVAS;
let CTX;
let ENGINE;
let ASSET_MGR;

let isInitialized = false;

function initializeEnvironment() {
  if (isInitialized) return;

  /** The html element on which we are drawing. */
  CANVAS = document.createElement('canvas');
  CANVAS.style.position = 'fixed';
  CANVAS.style.top = '0';
  CANVAS.style.left = '0';
  CANVAS.style.width = '100vw';
  CANVAS.style.height = '100vh';
  CANVAS.style.zIndex = '9999';
  CANVAS.style.pointerEvents = 'none'; // Prevent blocking user interaction

  /** The tool we use to draw on CANVAS. */
  CTX = CANVAS.getContext("2d");
  CTX.imageSmoothingEnabled = false; // Disable image smoothing for pixel art

  document.body.appendChild(CANVAS);

  // Set canvas dimensions to match the viewport
  resizeCanvas();
  window.addEventListener('resize', () => resizeCanvas());

  /** The GameEngine overseeing the update-render loop and containing all entities. */
  ENGINE = new GameEngine();

  /** The AssetManager which contains all images and sound. */
  ASSET_MGR = new AssetManager();
  queueAssets();

  isInitialized = true;
};

function resizeCanvas() {
  // Set actual canvas resolution (backing store)
  CANVAS.width = window.innerWidth * window.devicePixelRatio;
  CANVAS.height = window.innerHeight * window.devicePixelRatio;
  
  // Scale the context to counter the resolution scaling
  CTX.scale(window.devicePixelRatio, window.devicePixelRatio);
  
  // Reset image smoothing after context changes
  CTX.imageSmoothingEnabled = false;
}

function queueAssets() {
  // Assuming these are the paths to your asset folders
  const imagePaths = chrome.runtime.getURL('images/');
  const audioPaths = chrome.runtime.getURL('audio/');

  // List image files
  chrome.runtime.getPackageDirectoryEntry((rootEntry) => {
    rootEntry.getDirectory('images', {}, (imageDir) => {
      const imageReader = imageDir.createReader();
      imageReader.readEntries((imageEntries) => {
        console.log("Image Paths:");
        imageEntries.forEach((entry) => {
          if (entry.isFile) {
            console.log(imagePaths + entry.name);
          }
        });

        // List audio files
        rootEntry.getDirectory('audio', {}, (audioDir) => {
          const audioReader = audioDir.createReader();
          audioReader.readEntries((audioEntries) => {
            console.log("Audio Paths:");
            audioEntries.forEach((entry) => {
              if (entry.isFile) {
                console.log(audioPaths + entry.name);
              }
            });
          });
        });
      });
    });
  });


  ASSET_MGR.queueDownload(Goose.SFX.HONK);
  ASSET_MGR.queueDownload(Goose.SFX.HONK_ECHO);
  ASSET_MGR.queueDownload(Goose.SPRITESHEET);
}


// ====== GOOSE INITIALIZATION =======

// Singleton initialization function
function initializeGoose() {
  if (!window.goose) {
    window.goose = new Goose();
    ENGINE.addEntity(window.goose);
  }
  return window.goose;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only process messages in the main frame
  if (window !== window.top) {
    console.log("message blocked: ", message);
    return;
  };

  initializeEnvironment();
  
  console.log("Message received:", message);
  const goose = initializeGoose();
  
  switch (message.command) {
    case "extensionStartup":
      console.log("Initializing Goose assets...");
      ASSET_MGR.downloadAll(() => {
        console.log("Assets downloaded successfully.");
        sendResponse({ status: "assetsDownloaded" });
        ENGINE.start(); 
      });
      break;

    case "startGoose":
      goose.setState('wander');
      sendResponse({ status: "startedGoose" });
      break;
    
    case "stopGoose":
      goose.delete();

      // erase everything from the ctx
      CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
      
      sendResponse({ status: "stoppedGoose" });
      break;
  }
  return true;  // Indicates we wish to send a response asynchronously
}); 
