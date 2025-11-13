// ====== SETUP =======

const DEBUG_MODE = false;
const FORCE_CHROMEOS_MODE = true;

let CANVAS;
let CTX;
let ENGINE;
let ASSET_MGR;

let isInitialized = false;
let stateSwapperPanel;
const extpay = ExtPay('annoying-goose');

function initializeEnvironment() {
  if (isInitialized) return;

  // load via chrome API
  const fullPath = chrome.runtime.getURL('fonts/Silkscreen-Regular.ttf');
  const pixelFont = new FontFace('Silkscreen', 'url(' + fullPath + ')');

  pixelFont.load().then(function (font) {
    document.fonts.add(font);
    if (DEBUG_MODE) {
      console.log('Font loaded successfully');
    }
  }).catch(function (error) {
    console.error('Failed to load font at path:', fullPath, error);
    // Fallback to a default font
    document.body.style.fontFamily = 'Arial, sans-serif';
  });


  /** The html element on which we are drawing. */
  CANVAS = document.createElement('canvas');
  CANVAS.style.position = 'fixed';
  CANVAS.style.top = '0';
  CANVAS.style.left = '0';
  CANVAS.style.width = '100vw';
  CANVAS.style.height = '100vh';
  CANVAS.style.zIndex = '9999';
  CANVAS.style.pointerEvents = 'none'; // Prevent blocking user interaction

  document.body.appendChild(CANVAS);

  /** The tool we use to draw on CANVAS. */
  CTX = CANVAS.getContext("2d", {
    alpha: true,
    desynchronized: true, // Better performance on ChromeOS
    willReadFrequently: false // Optimize for drawing, not reading
  });
  
  // Test canvas capabilities
  if (!CTX || typeof CTX.drawImage !== 'function') {
    console.error('Canvas context not properly initialized on ChromeOS');
    return;
  }
  CTX.imageSmoothingEnabled = false; // Disable image smoothing for pixel art

  // Set canvas dimensions to match the viewport
  resizeCanvas();
  window.addEventListener('resize', () => resizeCanvas());

  /** The GameEngine overseeing the update-render loop and containing all entities. */
  ENGINE = new GameEngine();

  /** The AssetManager which contains all images and sound. */
  ASSET_MGR = new AssetManager();
  queueAssets();

  if (DEBUG_MODE) {
    console.info("Debug mode enabled.");
  }

  isInitialized = true;

  // Keep track of when user minimizes the window
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Add comprehensive ChromeOS debugging
  if (DEBUG_MODE && (/\bCrOS\b/.test(navigator.userAgent) || FORCE_CHROMEOS_MODE)) {
    console.log('ChromeOS Debug Info:', {
      devicePixelRatio: window.devicePixelRatio,
      canvasSupport: !!document.createElement('canvas').getContext,
      webglSupport: !!document.createElement('canvas').getContext('webgl'),
      memoryInfo: navigator.deviceMemory || 'unknown'
    });
  }
};

function resizeCanvas() {
  // ChromeOS-friendly scaling
  const pixelRatio = window.devicePixelRatio || 1;
  const maxPixelRatio = 2; // Cap pixel ratio for ChromeOS performance
  const effectiveRatio = Math.min(pixelRatio, maxPixelRatio);
  
  CANVAS.width = window.innerWidth * effectiveRatio;
  CANVAS.height = window.innerHeight * effectiveRatio;
  
  CTX.scale(effectiveRatio, effectiveRatio);
  CTX.imageSmoothingEnabled = false;
  
  // ChromeOS-specific canvas context settings
  if (/\bCrOS\b/.test(navigator.userAgent) || FORCE_CHROMEOS_MODE) {
    CTX.imageSmoothingQuality = 'low'; // Better performance
  }
}

function queueAssets() {
  ASSET_MGR.queueDownload(Goose.SFX.HONK1);
  ASSET_MGR.queueDownload(Goose.SFX.HONK2);
  ASSET_MGR.queueDownload(Goose.SFX.HONK3);
  ASSET_MGR.queueDownload(Goose.SFX.HONK_ECHO);
  ASSET_MGR.queueDownload(Goose.SFX.SLAP);
  ASSET_MGR.queueDownload(Goose.SFX.BITE);
  ASSET_MGR.queueDownload(Goose.SFX.BONK);
  ASSET_MGR.queueDownload(Goose.SPRITESHEET);
  ASSET_MGR.queueDownload(Shadow.SPRITESHEET);
  ASSET_MGR.queueDownload(Egg.SPRITESHEET);
  ASSET_MGR.queueDownload(Egg.SFX.CRACK);
  ASSET_MGR.queueDownload(Gosling.SPRITESHEET);
  ASSET_MGR.queueDownload(Gosling.SFX.PEEP1);
  ASSET_MGR.queueDownload(Gosling.SFX.PEEP2);
  ASSET_MGR.queueDownload(Gosling.SFX.PEEP3);
  ASSET_MGR.queueDownload(TextBox.SPRITESHEET);
  ASSET_MGR.queueDownload(Honk.SPRITESHEET);
  ASSET_MGR.queueDownload(Target.SPRITESHEET);
  ASSET_MGR.queueDownload(Puddle.SPRITESHEET);
  ASSET_MGR.queueDownload(Puddle.SFX.SPLASH);
  ASSET_MGR.queueDownload(Mud.SPRITESHEET);
  ASSET_MGR.queueDownload(Mud.SFX.SPLAT);
  ASSET_MGR.queueDownload(Footprints.SPRITESHEET);
  ASSET_MGR.queueDownload(DiscoBall.SPRITESHEET);
  ASSET_MGR.queueDownload(DiscoBall.SFX.DANCE);
  ASSET_MGR.queueDownload(Hat.SPRITESHEET);
}


// ====== GOOSE INITIALIZATION =======

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only process messages in the main frame
  if (window !== window.top) {
    if (DEBUG_MODE) {
      console.log("message blocked: ", message);
    }
    return;
  };
  if (DEBUG_MODE) {
    console.log("Message received:", message);
  }

  initializeEnvironment();

  switch (message.command) {
    case "extensionStartup":
      ASSET_MGR.downloadAll(() => {
        if (DEBUG_MODE) {
          console.log("Assets downloaded successfully.");
        }
        sendResponse({ status: "assetsDownloaded" });
        ENGINE.start();
      });
      break;

    case "startGoose":
      ENGINE.addEntity(new Goose());
      Goose.instance.setState(Goose.STATES.WANDER);
      chrome.storage.local.set({ [`gooseActive_${sender.tab.id}`]: true });
      sendResponse({ status: "startedGoose" });
      break;

    case "stopGoose":
      // erase everything from the ctx
      CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
      Goose.instance.kill();
      chrome.storage.local.set({ [`gooseActive_${sender.tab.id}`]: false });
      sendResponse({ status: "stoppedGoose" });
      break;

    case "changeHat":
      if (Goose.instance && Goose.instance.hat) {
        Goose.instance.hat.setHatType(message.hatType);
      }
      sendResponse({ status: "hatChanged" });
      break;

    case "checkGooseStatus":
      sendResponse({ isActive: !!Goose.instance });
      break;

    case "changeState":
      if (Goose.instance) {
        Goose.instance.setState(Goose.instance.constructor.STATES[message.stateName]);
      }
      sendResponse({ status: "stateChanged" });
      break;
  }
  return true;  // Indicates we wish to send a response asynchronously
});

function showStateSwapperPanel() {
  if (stateSwapperPanel) {
    stateSwapperPanel.style.display = 'block';
  }
}

function hideStateSwapperPanel() {
  if (stateSwapperPanel) {
    stateSwapperPanel.style.display = 'none';
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    // Pause all audio when the document is hidden
    ASSET_MGR.pauseAudio();
  } else {
    // Resume all audio when the document becomes visible
    ASSET_MGR.resumeAudio();
  }
}
