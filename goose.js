class Goose {
  constructor() {
    // Singleton pattern
    if (Goose.instance) {
      return Goose.instance;
    }
    Goose.instance = this;

    // Create the canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '9999';
    this.canvas.style.pointerEvents = 'none'; // Prevent blocking user interaction

    // Disable image smoothing for pixel art
    this.ctx.imageSmoothingEnabled = false;       // Standard property
    this.ctx.mozImageSmoothingEnabled = false;    // Firefox
    this.ctx.webkitImageSmoothingEnabled = false; // Safari
    this.ctx.msImageSmoothingEnabled = false;  

    document.body.appendChild(this.canvas);

    // Set canvas dimensions to match the viewport
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // State management
    this.states = {
      idle: new IdleState(this),
      wander: new WanderState(this),
    };
    this.currentState = this.states.idle;

    // Initialize goose properties
    this.position = {
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 100
    };
    this.pranksEnabled = false;
    this.currentFrame = 0;
    this.animationId = null; // animation ID for requestAnimationFrame
    this.currentAnimation = 'idle';

    this.frameWidth = 32;
    this.frameHeight = 32;
    this.scaleFactor = 2;
    this.displayWidth = this.frameWidth * this.scaleFactor;
    this.displayHeight = this.frameHeight * this.scaleFactor;

    this.lastFrameTime = 0;
  }

  resizeCanvas() {
    // Set actual canvas resolution (backing store)
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    
    // Scale the context to counter the resolution scaling
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Reset image smoothing after context changes
    this.ctx.imageSmoothingEnabled = false;
  }

  // State transition method
  setState(newState) {
    if (this.currentState?.exit) {
      this.currentState.exit();
    }

    this.playSFX(assets.sounds.honk);

    this.currentState = this.states[newState];
    console.log( "currentState: ", this.currentState );

    if (this.currentState?.enter) {
      this.currentState.enter();
    }
  }

  playAnimation(animation) {    
    this.currentAnimation = animation;
    this.currentFrame = 0;
    this.lastFrameTime = performance.now();

    const animate = (timestamp) => {
      const deltaTime = timestamp - this.lastFrameTime;

      const animationDetails = assets.spritesheet.animations[this.currentAnimation];
      if (deltaTime >= animationDetails.frameDuration) {
        this.currentFrame = (this.currentFrame + 1) % animationDetails.frames;
        this.lastFrameTime = timestamp;
      }

      this.drawFrame();
      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  drawFrame() {
    const frameImage = assets.getFrame(this.currentAnimation, this.currentFrame);

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the goose at its current position
    const frameWidth = assets.frameWidth;
    const frameHeight = assets.frameHeight;
    const displayWidth = frameWidth * 2; // Scaled size
    const displayHeight = frameHeight * 2;

    const img = new Image();
    img.src = frameImage;
    this.ctx.drawImage(
      img,
      0,
      0,
      frameWidth,
      frameHeight,
      this.position.x - displayWidth / 2,
      this.position.y - displayHeight / 2,
      displayWidth,
      displayHeight
    );

    console.log("goose position: ", this.position.x, this.position.y);

    // Optional: Draw shadow
    this.drawShadow();
  }

  drawShadow() {
    const shadowWidth = 40;
    const shadowHeight = 12;

    const yOffset = 30; // Adjust this value to control the shadow's height

    this.ctx.beginPath();
    this.ctx.ellipse(
      this.position.x,
      this.position.y + yOffset,
      shadowWidth / 2,
      shadowHeight / 2,
      0,
      0,
      2 * Math.PI
    );
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fill();
  }


  /**
   * @param {Object} sfx Sound object from assets.sounds
   */
  async playSFX(sfx) {
    try {
      await sfx.file.play();
    } catch (error) {
      console.error('Error playing sound:', error, "\nWas trying to play file: ", sfx.file, "at path:", sfx.path);
    }
  }

  delete() {
    this.playSFX(assets.sounds.honkEcho);

    // Stop any ongoing animations or intervals
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }
    this.stopAnimation();

    // Clear from window
    Goose.instance = null;

    // erase everything from the ctx
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // might not want to clear cache since goose will be used later
    // assets.clearCache();

    // Any additional cleanup
    Object.keys(this).forEach(key => {
      delete this[key];
    });
  }
}

const assets = {
  frameWidth: 32,
  frameHeight: 32,
  
  spritesheet: {
    path: 'images/goose-spritesheet.png',
    image: null,
    animations: {
      idle: { row: 0, frames: 4, frameDuration: 700 },
      walking: { row: 1, frames: 4, frameDuration: 200 }, 
      running: { row: 2, frames: 4, frameDuration: 150 },
      flying: { row: 3, frames: 4, frameDuration: 200 },
      shooed: { row: 5, frames: 4, frameDuration: 150 }
    }
  },

  sounds: {
    honk: { path: 'sounds/honk.mp3', file: null },
    honkEcho: { path: 'sounds/honk-echo.mp3', file: null },
  },

  memes: [
    'deal-with-it.jpg',
    'goose-morning.jpg',
    'hammer.jpg',
    'mess-with-the-honk.jpg',
    'not-going-anywhere.jpg',
    'peace-was-never-an-option.jpg',
    'peaking.jpg',
    'selfie.jpg',
    'take-break-cat.jpg'
  ],

  frameCache: new Map(),
  tempCanvas: document.createElement('canvas'),
  tempCtx: null,

  setupSounds() {
    for (const sound in this.sounds) {
      this.sounds[sound].file = new Audio(chrome.runtime.getURL(this.sounds[sound].path));
    }
  },

  setupCanvas() {
    this.tempCanvas.width = this.frameWidth;
    this.tempCanvas.height = this.frameHeight;
    this.tempCtx = this.tempCanvas.getContext('2d', { 
      willReadFrequently: true 
    });
  },

  async loadSpriteSheet() {
    return new Promise((resolve, reject) => {
      this.spritesheet.image = new Image();
      this.spritesheet.image.onload = () => resolve(this.spritesheet.image);
      this.spritesheet.image.onerror = reject;
      this.spritesheet.image.src = chrome.runtime.getURL(this.spritesheet.path);
    });
  },

  cacheAllFrames() {
    Object.entries(this.spritesheet.animations).forEach(([stateName, state]) => {
      for (let frame = 0; frame < state.frames; frame++) {
        const key = `${stateName}-${frame}`;
        this.tempCtx.clearRect(0, 0, this.frameWidth, this.frameHeight);
        this.tempCtx.drawImage(
          this.spritesheet.image,
          frame * this.frameWidth,
          state.row * this.frameHeight,
          this.frameWidth,
          this.frameHeight,
          0, 0,
          this.frameWidth,
          this.frameHeight
        );
        const dataUrl = this.tempCanvas.toDataURL();
        this.frameCache.set(key, dataUrl);
      }
    });
  },

  async initialize() {
    try {
      this.setupCanvas();
      await this.loadSpriteSheet();
      this.cacheAllFrames();
      this.setupSounds();
      console.log('Goose assets initialized successfully');
      return this;
    } catch (error) {
      console.error('Failed to load goose assets:', error);
      throw error;
    }
  },

  getFrame(animation, frameNumber) {
    const key = `${animation}-${frameNumber}`;
    const frame = this.frameCache.get(key);
    if (!frame) {
        console.warn('Frame cache miss:', key);
    }
    return frame;
  },

  clearCache() {
    this.frameCache.clear();
  }
};
