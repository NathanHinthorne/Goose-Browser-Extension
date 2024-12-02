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

    // Memes and sound effects
    this.memes = [
      'deal-with-it.jpg',
      'goose-murder.jpg',
      'hammer.jpg',
      'mess-with-the-honk.jpg',
      'peace-was-never-an-option.jpg',
      'peaking.jpg',
      'take-break-cat.jpg'
    ];

    this.sfx = {
      honk: new Audio(chrome.runtime.getURL('sounds/honk.mp3')),
      honkEcho: new Audio(chrome.runtime.getURL('sounds/honk-echo.mp3'))
    };

    // Animation states
    this.animationStates = {
      idle: { row: 0, frames: 4 },
      walking: { row: 1, frames: 4 },
      running: { row: 2, frames: 4 },
      flying: { row: 3, frames: 4 },
      shooed: { row: 5, frames: 4 }
    };

    this.frameWidth = 32;
    this.frameHeight = 32;
    this.scaleFactor = 2;

    this.element = this.createGoose();

    // Bind methods
    this.setAnimation = this.setAnimation.bind(this);

    // Add frame update rate control
    this.animationFrameRate = 100; // milliseconds between frame changes
    this.lastFrameTime = 0;


    this.doneCaching = false;
    this.frameCache = new Map();
    
    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = this.frameWidth;
    this.tempCanvas.height = this.frameHeight;
    this.tempCtx = this.tempCanvas.getContext('2d', { 
      willReadFrequently: true 
    });

    // Don't start animation until explicitly called
    this.loadAndCache();
  }

  async loadAndCache() {
    await this.loadSpriteSheet();
    await this.cacheAllFrames();
    this.doneCaching = true;
    this.startAnimation();
  }

  // State transition method
  setAction(newAction) {
    if (this.currentState?.exit) {
      this.currentState.exit();
    }

    this.currentState = this.states[newAction];
    this.action = newAction;
    this.element.style.display = 'block';

    if (this.currentState?.enter) {
      this.currentState.enter();
    }
  }

  // Sprite sheet and animation method
  async loadSpriteSheet() {
    return new Promise((resolve, reject) => {
      this.spriteSheet = new Image();
      this.spriteSheet.onload = () => {
        this.displayWidth = this.frameWidth * this.scaleFactor;
        this.displayHeight = this.frameHeight * this.scaleFactor;
        resolve();
      };
      this.spriteSheet.onerror = reject;
      this.spriteSheet.src = chrome.runtime.getURL('images/goose-spritesheet.png');
    });
  }

  async cacheAllFrames() {
    Object.entries(this.animationStates).forEach(([stateName, state]) => {
      for (let frame = 0; frame < state.frames; frame++) {
        const key = `${stateName}-${frame}`;
        this.tempCtx.clearRect(0, 0, this.frameWidth, this.frameHeight);
        this.tempCtx.drawImage(
          this.spriteSheet,
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
  }

  getMaxFrames() {
    return Math.max(...Object.values(this.animationStates).map(state => state.frames));
  }

  startAnimation() {
    if (this.currentFrame) return;
    
    const animate = (timestamp) => {
      // Only update frame if enough time has passed
      if (!this.lastFrameTime || timestamp - this.lastFrameTime >= this.currentState.frameDuration) {
        this.updateFrame();
        this.renderFrame();
        this.lastFrameTime = timestamp;
      }
      
      // Continue the animation loop
      this.currentFrame = requestAnimationFrame(animate);
    };
    
    this.currentFrame = requestAnimationFrame(animate);
  }

  stopAnimation() {
    if (this.currentFrame) {
      cancelAnimationFrame(this.currentFrame);
      this.currentFrame = null;
    }
  }

  updateFrame() {
    const currentState = this.animationStates[this.action];
    
    // Increment frame, wrapping around state-specific frame count
    this.currentFrame = (this.currentFrame + 1) % currentState.frames;
  }

  renderFrame() {
    const currentState = this.animationStates[this.action];
    
    if (!this.element || !this.spriteSheet) return;

    const key = `${this.action}-${this.currentFrame}`;
    let frameImage = this.frameCache.get(key);

    if (!frameImage) {
      // Fallback to direct rendering if cache miss
      this.tempCtx.clearRect(0, 0, this.frameWidth, this.frameHeight);
      this.tempCtx.drawImage(
        this.spriteSheet,
        this.currentFrame * this.frameWidth,
        currentState.row * this.frameHeight,
        this.frameWidth,
        this.frameHeight,
        0, 0,
        this.frameWidth,
        this.frameHeight
      );
      frameImage = this.tempCanvas.toDataURL();
      this.frameCache.set(key, frameImage);
    }

    this.element.style.width = `${this.displayWidth}px`;
    this.element.style.height = `${this.displayHeight}px`;
    this.element.style.backgroundImage = `url(${frameImage})`;
    this.element.style.backgroundSize = '100% 100%';
    this.element.style.backgroundRepeat = 'no-repeat';
    this.element.style.display = 'block';
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
    goose.style.left = this.position.x + 'px';
    goose.style.top = this.position.y + 'px';
    goose.style.zIndex = '9999';
    goose.style.display = 'none';
    document.body.appendChild(goose);
    return goose;
  }

  setAnimation(action) {    
    this.action = action;
    this.currentFrame = 0;
  }

  async playSFX(sfx) {
    try {
      await sfx.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  delete() {
    this.playSFX(this.sfx.honkEcho);

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

    if (this.frameCache) {
      this.frameCache.clear();
    }

    // Any additional cleanup
    Object.keys(this).forEach(key => {
      delete this[key];
    });
  }
}