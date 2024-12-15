class Goose {
  constructor() {
    // Singleton pattern
    if (Goose.instance) {
      return Goose.instance;
    }
    Goose.instance = this;

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

    this.element = this.createGoose();
    this.shadow = this.createShadow();

    this.lastFrameTime = 0;
  }

  createShadow() {
    let existingShadow = document.querySelector('.goose-shadow');
    if (existingShadow) {
        return existingShadow;
    }

    const shadow = document.createElement('div');
    shadow.className = 'goose-shadow';
    shadow.style.position = 'fixed';
    shadow.style.width = `${this.displayWidth * 0.8}px`; // Slightly smaller than goose
    shadow.style.height = `${this.displayHeight * 0.3}px`; // Flatter than goose
    shadow.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Translucent black
    shadow.style.borderRadius = '50%'; // Make it oval
    shadow.style.transform = `translate(${this.position.x}px, ${this.position.y + this.displayHeight - 5}px)`; // Position slightly below goose
    shadow.style.zIndex = '9997'; // Below the goose
    shadow.style.willChange = 'transform';
    document.body.appendChild(shadow);

    console.log("created shadow");

    return shadow;
  }

  updateShadow() {
    if (this.shadow) {
        this.shadow.style.transform = 
            `translate(${this.position.x + this.displayWidth * 0.1}px, 
            ${this.position.y + this.displayHeight - 5}px)`;
    }
  }

  // State transition method
  setState(newState) {
    if (this.currentState?.exit) {
      this.currentState.exit();
    }

    this.playSFX(assets.sounds.honk);

    this.currentState = this.states[newState];
    console.log( "currentState: ", this.currentState );
    this.element.style.display = 'block';

    if (this.currentState?.enter) {
      this.currentState.enter();
    }
  }

  playAnimation(animation) {    
    this.currentAnimation = animation;
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    let lastTimestamp = 0;

    const animationDetails = assets.spritesheet.animations[this.currentAnimation];
    console.log( "animationDetails: ", animationDetails );

    const animate = (timestamp) => {
      const deltaTime = timestamp - lastTimestamp;
      if (deltaTime > 16.67) { // More than 60fps
          // console.warn('Slow frame:', deltaTime);
      }
      lastTimestamp = timestamp;

      // Only update frame if enough time has passed
      if (timestamp - this.lastFrameTime >= animationDetails.frameDuration) {
        this.updateFrame();
        this.renderFrame();
        this.lastFrameTime = timestamp;
      }
      
      // Continue the animation loop
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

  updateFrame() {
    const animationDetails = assets.spritesheet.animations[this.currentAnimation];
    
    // Increment frame, wrapping around state-specific frame count
    this.currentFrame = (this.currentFrame + 1) % animationDetails.frames;
    // console.log("Current frame: ", this.currentFrame);
  }

  renderFrame() {
    if (!this.element) return;

    let frameImage = assets.getFrame(this.currentAnimation, this.currentFrame);

    if (!frameImage) {
      console.log("cache miss for frame: ", this.currentAnimation, this.currentFrame );
    }
    // else {
    //   console.log("Found frame: ", frameImage);
    // }

    this.element.style.backgroundImage = `url(${frameImage})`;
    // this.element.style.width = `${this.displayWidth}px`;
    // this.element.style.height = `${this.displayHeight}px`;
    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;

    this.updateShadow(); // Update shadow position
  }
  
  // Utility methods
  createGoose() {
    let existingGoose = document.querySelector('.goose');
    if (existingGoose) {
      return existingGoose;
    }

    const goose = document.createElement('div');
    goose.className = 'goose';
    goose.style.position = 'fixed';
    // goose.style.left = this.position.x + 'px';
    // goose.style.top = this.position.y + 'px';
    goose.style.transform = 'translate(0, 0)';
    goose.style.willChange = 'transform'; // Hint to browser for optimization

    goose.style.zIndex = '9999';
    goose.style.width = `${this.displayWidth}px`;
    goose.style.height = `${this.displayHeight}px`;
    goose.style.backgroundSize = '100% 100%';
    goose.style.backgroundRepeat = 'no-repeat';
    goose.style.display = 'none';
    document.body.appendChild(goose);
    return goose;
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

    // Remove from DOM
    if (this.element) {
      this.element.remove();
    }

    // Stop any ongoing animations or intervals
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }
    this.stopAnimation();

    // Clear from window
    window.goose = null;
    Goose.instance = null;

    if (this.shadow) {
        this.shadow.remove();
    }

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
