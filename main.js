// ====== SETUP =======

const DEBUG_MODE = false;

let CANVAS;
let CTX;
let ENGINE;
let ASSET_MGR;

let isInitialized = false;
let stateSwapperPanel;

function initializeEnvironment() {
  if (isInitialized) return;

  // load via chrome API
  const fullPath = chrome.runtime.getURL('fonts/Silkscreen-Regular.ttf');
  const pixelFont = new FontFace('pixel-font', 'url(' + fullPath + ')');

  pixelFont.load().then(function (font) {
    document.fonts.add(font);
    console.log('Font loaded successfully');
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
  CTX = CANVAS.getContext("2d");
  CTX.imageSmoothingEnabled = false; // Disable image smoothing for pixel art

  // Set canvas dimensions to match the viewport
  resizeCanvas();
  window.addEventListener('resize', () => resizeCanvas());

  /** The GameEngine overseeing the update-render loop and containing all entities. */
  ENGINE = new GameEngine();

  /** The AssetManager which contains all images and sound. */
  ASSET_MGR = new AssetManager();
  queueAssets();
  
  createStateSwapperPanel();

  if (DEBUG_MODE) {
    console.info("Debug mode enabled.");
  }

  isInitialized = true;
};

function resizeCanvas() {
  // Set actual canvas resolution
  CANVAS.width = window.innerWidth * window.devicePixelRatio;
  CANVAS.height = window.innerHeight * window.devicePixelRatio;

  // Scale the context to counter the resolution scaling
  CTX.scale(window.devicePixelRatio, window.devicePixelRatio);

  // Reset image smoothing after context changes
  CTX.imageSmoothingEnabled = false;
}

function queueAssets() {
  ASSET_MGR.queueDownload(Goose.SFX.HONK1);
  ASSET_MGR.queueDownload(Goose.SFX.HONK2);
  ASSET_MGR.queueDownload(Goose.SFX.HONK3);
  ASSET_MGR.queueDownload(Goose.SFX.HONK_ECHO);
  ASSET_MGR.queueDownload(Goose.SPRITESHEET);
  ASSET_MGR.queueDownload(Shadow.SPRITESHEET);
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
}


// ====== GOOSE INITIALIZATION =======

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only process messages in the main frame
  if (window !== window.top) {
    // console.log("message blocked: ", message);
    return;
  };
  // console.log("Message received:", message);

  initializeEnvironment();

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
    
    case "toggleStateSwapper":
      if (message.enabled) {
        showStateSwapperPanel();
      } else {
        hideStateSwapperPanel();
      }
      sendResponse({ status: "stateSwapperToggled" });
      break;
  }
  return true;  // Indicates we wish to send a response asynchronously
});

function createStateSwapperPanel() {
  stateSwapperPanel = document.createElement('div');
  stateSwapperPanel.className = 'state-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'state-panel-header';
  const title = document.createElement('h2');
  title.className = 'state-panel-title';
  title.textContent = '🪿 Goose State Swapper';
  header.appendChild(title);
  stateSwapperPanel.appendChild(header);

  // Content
  const content = document.createElement('div');
  content.className = 'state-panel-content';

  // State buttons
  ['IDLE', 'WANDER', 'CHASE', 'FLY', 'SWIM', 'DANCE', 'TRACK_MUD', 'DRAG_MEMES'].forEach(stateName => {
    const button = document.createElement('button');
    button.className = 'state-button';
    button.textContent = stateName;
    button.onclick = () => {
      if (Goose.instance) {
        Goose.instance.setState(Goose.instance.constructor.STATES[stateName]);
      } else {
        console.error('Goose instance not found');
      }
    };
    content.appendChild(button);
  });

  stateSwapperPanel.appendChild(content);
  document.body.appendChild(stateSwapperPanel);
  
  if (DEBUG_MODE) {
    showStateSwapperPanel();
  } else {
    hideStateSwapperPanel();
  }
}

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