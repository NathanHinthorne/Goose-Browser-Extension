/**
 * Goose State 🪿
 */
class GooseState {
  constructor(goose) {
    this.goose = goose;

    // Goose Defaults
    this.goose.speed = 0;
    this.goose.velocity = { x: 0, y: 0 };

    // Local State Defaults
    this.distanceToTarget = 0;
    this.targetPos = { x: 0, y: 0 };

    // this.stateIsFinished = false;
  }

  enter() {}
  exit() {}
  update() { }
  

  
  isWithinBounds(x, y) {
    const padding = 100;
    return (
      x > padding && x < window.innerWidth - padding &&
      y > padding && y < window.innerHeight - padding
    );
  }

  genPointInBounds() {
    const padding = 100;
    return {
      x: padding + Math.random() * (window.innerWidth - padding * 2),
      y: padding + Math.random() * (window.innerHeight - padding * 2)
    };
  }
  
  setVelocity(x, y) {
    this.goose.velocity.x = x;
    this.goose.velocity.y = y;
  }

  setTarget(x, y) {
    this.targetPos.x = x;
    this.targetPos.y = y;

    const dx = this.targetPos.x - this.goose.position.x;
    const dy = this.targetPos.y - this.goose.position.y;
    this.distanceToTarget = Math.sqrt(dx * dx + dy * dy);
  }

  moveToTarget() {
    const dx = this.targetPos.x - this.goose.position.x;
    const dy = this.targetPos.y - this.goose.position.y;
    this.distanceToTarget = Math.sqrt(dx * dx + dy * dy);

    const velocityX = (dx / this.distanceToTarget) * this.goose.speed;
    const velocityY = (dy / this.distanceToTarget) * this.goose.speed;

    this.setVelocity(velocityX, velocityY);
  }
}

class IdleState extends GooseState {
  enter() {
    this.goose.speed = 0;
    this.goose.currentAnimation = Goose.ANIMATIONS.BOBBING;
    // this.animationSwitchChance = 0.15 / GameEngine.FPS; // 15% chance a second
    this.wanderChance = 0.06 / GameEngine.FPS; // 6% chance a second
    this.flyChance = 0.02 / GameEngine.FPS; // 2% chance a second
    this.swimChance = 0.02 / GameEngine.FPS; // 2% chance a second
    this.danceChance = 0.02 / GameEngine.FPS; // 2% chance a second
    this.trackMudChance = 0.02 / GameEngine.FPS; // 2% chance a second

    // swap back to default animation when one-time animations finish
    Goose.ANIMATIONS.LOOKING_AROUND.setOnComplete(() => {
      this.goose.currentAnimation = Goose.ANIMATIONS.BOBBING
      console.log("Returning to bobbing animation");
    });
    Goose.ANIMATIONS.LOOKING_UP.setOnComplete(() => {
      this.goose.currentAnimation = Goose.ANIMATIONS.BOBBING
      console.log("Returning to bobbing animation");
    });
  }

  update() {
    if (Math.random() < this.wanderChance) {
      this.goose.setState(Goose.STATES.WANDER);
    }

    if (Math.random() < this.flyChance) {
      this.goose.setState(Goose.STATES.FLY);
    }

    if (Math.random() < this.swimChance) {
      this.goose.setState(Goose.STATES.SWIM);
    }

    if (Math.random() < this.danceChance) {
      this.goose.setState(Goose.STATES.DANCE);
    }

    if (Math.random() < this.trackMudChance) {
      this.goose.setState(Goose.STATES.TRACK_MUD);
    }

    // if (Math.random() < this.animationSwitchChance && this.goose.currentAnimation === Goose.ANIMATIONS.BOBBING) {
    //   if (Math.random() < 0.5) {
    //     this.goose.currentAnimation = Goose.ANIMATIONS.LOOKING_AROUND;
    //   } else {
    //     this.goose.currentAnimation = Goose.ANIMATIONS.LOOKING_UP;
    //   }
    // }
  }
}

class WanderState extends GooseState {
  enter() {
    this.goose.speed = 30;
    this.goose.currentAnimation = Goose.ANIMATIONS.WALKING;
    this.targetRandomLocation();

    ENGINE.addEntity(new TextBox(this.goose, TextBox.RANDOM_WANDER_TEXT), GameEngine.DEPTH.FOREGROUND);
  }

  update() {
    if (this.distanceToTarget < 10) {
      this.setVelocity(0, 0);
      this.goose.setState(Goose.STATES.IDLE);
    } else {
      this.moveToTarget();
    }
  }

  targetRandomLocation() {
    const randPoint = this.genPointInBounds();
    this.setTarget(randPoint.x, randPoint.y);
  }
}

// Chases user's mouse
class ChaseState extends GooseState {
  enter() {
    this.goose.speed = 120;
    this.goose.currentAnimation = Goose.ANIMATIONS.ANGRY;
    this.interpolatedPos = { x: this.goose.position.x, y: this.goose.position.y };
    this.arrivedAtMouse = false;
    this.elapsedTime = 0;
    this.timeLimit = 25; 
    this.timeSinceLastHonk = 0;
    this.timeSinceLastTalk = 0;
    this.honkInterval = 0.5 + Math.random() * 2.5; // Honk every 0.5-3 seconds
    this.talkInterval = 8; // Talk every 8 seconds

    ENGINE.addEntity(new TextBox(this.goose, TextBox.RANDOM_INITIAL_CHASE_TEXT), GameEngine.DEPTH.FOREGROUND);
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;
    if (this.elapsedTime > this.timeLimit) {
      this.goose.setState(Goose.STATES.WANDER);
    }

    this.targetUserMouse();

    if (this.distanceToTarget < 10 && !this.arrivedAtMouse) {
      this.goose.currentAnimation = Goose.ANIMATIONS.BOBBING;
      this.setVelocity(0, 0);
      this.arrivedAtMouse = true;
    }
    
    if (this.distanceToTarget > 20) {
      if (this.arrivedAtMouse) {
        this.goose.currentAnimation = Goose.ANIMATIONS.ANGRY;
        this.arrivedAtMouse = false;
      }
      this.moveToTarget();

      this.timeSinceLastHonk += ENGINE.clockTick;
      if (this.timeSinceLastHonk >= this.honkInterval) {
        ASSET_MGR.playSFX(Goose.RANDOM_HONK_SFX());
        ENGINE.addEntity(new Honk(this.goose), GameEngine.DEPTH.FOREGROUND);
        this.timeSinceLastHonk = 0;
        this.honkInterval = 0.5 + Math.random() * 2.5; // Honk every 0.5-3 seconds
      }

      this.timeSinceLastTalk += ENGINE.clockTick;
      if (this.timeSinceLastTalk >= this.talkInterval) {
        ENGINE.addEntity(new TextBox(this.goose, TextBox.RANDOM_UPDATE_CHASE_TEXT), GameEngine.DEPTH.FOREGROUND);
        this.timeSinceLastTalk = 0;
      }
    }
  }

  targetUserMouse() {
    // strategy #1: directly target mouse position
    // this.setTarget(ENGINE.mouseX, ENGINE.mouseY);

    // strategy #2:
    // interpolate target position to smooth out movement, 
    // making the goose look like its "reacting" to new mouse position
    const smoothingFactor = 0.03;
    this.interpolatedPos.x += (ENGINE.mouseX - this.interpolatedPos.x) * smoothingFactor;
    this.interpolatedPos.y += (ENGINE.mouseY - this.interpolatedPos.y) * smoothingFactor;
    this.setTarget(this.interpolatedPos.x, this.interpolatedPos.y);
  }

  exit() {
  }
}

class FlyState extends GooseState {
  enter() {
    this.goose.speed = 80;
    this.goose.currentAnimation = Goose.ANIMATIONS.FLYING;
    this.goose.shadow.freezeHeight();
    
    // Store initial position for the return journey
    this.initialPos = { x: this.goose.position.x, y: this.goose.position.y + 10 };
    
    // Set up the final target higher in the air
    this.finalTarget = { x: this.goose.position.x, y: this.goose.position.y - 100 };
    
    // Flying state properties
    this.bobAmplitude = 20; // Height of the bobbing motion
    this.bobFrequency = 2; // Speed of the bobbing
    this.elapsedTime = 0;
    this.isAscending = true;
    this.isDescending = false;
    
    // Set initial target to final position
    this.setTarget(this.finalTarget.x, this.finalTarget.y);
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;
    
    if (this.isAscending) {
      // Add bobbing motion during ascent
      const bobOffset = Math.sin(this.elapsedTime * this.bobFrequency) * this.bobAmplitude;
      this.setTarget(this.finalTarget.x, this.finalTarget.y + bobOffset);
      
      if (this.distanceToTarget < 20) {
        this.isAscending = false;
        this.hoverStartTime = this.elapsedTime;
        this.hoverDuration = 2; // Hover for 2 seconds
      }
    } else if (!this.isDescending) {
      // Hover at the top
      const bobOffset = Math.sin(this.elapsedTime * this.bobFrequency) * this.bobAmplitude;
      this.setTarget(this.finalTarget.x, this.finalTarget.y + bobOffset);
      
      if (this.elapsedTime - this.hoverStartTime > this.hoverDuration) {
        this.isDescending = true;
        this.setTarget(this.initialPos.x, this.initialPos.y);
        this.goose.speed = 60; // Slower descent
      }
    } else {
      // Descending phase
      const bobOffset = Math.sin(this.elapsedTime * this.bobFrequency) * (this.bobAmplitude / 2);
      const currentTarget = {
        x: this.initialPos.x,
        y: this.initialPos.y + bobOffset
      };
      this.setTarget(currentTarget.x, currentTarget.y);
      
      if (this.distanceToTarget < 10) {
        this.goose.setState(Goose.STATES.IDLE);
      }
    }
    
    this.moveToTarget();
  }

  exit() {
    this.goose.shadow.unfreezeHeight();
  }
}

class SwimState extends GooseState {
  enter() {
    this.goose.speed = 30;  // Walking speed to puddle
    this.goose.currentAnimation = Goose.ANIMATIONS.WALKING;
    
    let puddleX, puddleY;
    do {
      // Create puddle at random location near goose
      const randAngle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 50; // Random distance between 100-150 pixels
      puddleX = this.goose.position.x + Math.cos(randAngle) * distance;
      puddleY = this.goose.position.y + Math.sin(randAngle) * distance;
    } while (!this.isWithinBounds(puddleX, puddleY));
    
    // Create and add puddle to game
    this.puddle = new Puddle(puddleX, puddleY);
    ENGINE.addEntity(this.puddle, GameEngine.DEPTH.BACKGROUND);
    
    // Set target to puddle location
    this.setTarget(puddleX, puddleY);

    // Track if we've reached the puddle
    this.hasReachedPuddle = false;
    
    // Set a time limit for swimming
    this.elapsedTime = 0;
    this.swimDuration = 15 + Math.random() * 10; // Random duration between 15-25 seconds
  }

  update() {
    if (!this.hasReachedPuddle) {
      if (this.distanceToTarget < 2) {
        // We've reached the puddle, start swimming
        this.hasReachedPuddle = true;
        this.goose.shadow.hide();
        this.goose.currentAnimation = Goose.ANIMATIONS.SWIMMING;
        this.setVelocity(0, 0);
        this.puddle.addGoose(); // Trigger puddle animation change and splash sound
      } else {
        // Keep moving toward puddle
        this.moveToTarget();
      }
    } else {
      // Swimming behavior
      this.elapsedTime += ENGINE.clockTick;
      
      if (this.elapsedTime >= this.swimDuration) {
        this.goose.setState(Goose.STATES.IDLE);
      }
    }
  }

  exit() {
    // Clean up puddle when leaving state
    if (this.puddle) {
      this.puddle.kill();
    }
    this.goose.shadow.show();
  }
}

class ShooedState extends GooseState {

}

class DanceState extends GooseState {
  enter() {
    this.goose.currentAnimation = Goose.ANIMATIONS.DANCING;
    this.elapsedTime = 0;
    this.danceDuration = 8.8;

    this.discoBall = new DiscoBall(this.goose.position.x, this.goose.position.y - 100);
    ENGINE.addEntity(this.discoBall, GameEngine.DEPTH.FOREGROUND);
    this.discoBall.start();
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;

    if (this.elapsedTime >= this.danceDuration) {
      this.goose.setState(Goose.STATES.IDLE);
    }
  }

  exit() {
    this.discoBall.kill();
  }
}

class TrackMudState extends GooseState {
  enter() {
    this.goose.speed = 30;  // Walking speed to mud
    this.goose.currentAnimation = Goose.ANIMATIONS.BOBBING;
    
    // Create and add mud to game
    this.mud = new Mud(this.goose.position.x, this.goose.position.y);
    ENGINE.addEntity(this.mud, GameEngine.DEPTH.BACKGROUND);
    this.mud.addGoose(); // Trigger mud animation change and squelch sound

    // Set a time limit for tracking mud
    this.elapsedTime = 0;
    this.stayInMudDuration = 2; // Stay in mud for 3 seconds
    this.trackMudDuration = 50 + Math.random() * 10; // Random duration between 50-60 seconds

    this.trackingMud = false;

    // Store footprints entities
    this.footprints = [];

    // Footprint interval
    this.footprintInterval = 0.5; // Place footprints every 0.5 seconds
    this.timeSinceLastFootprint = 0;

    // Initialize target position and movement
    this.targetPos = { x: this.goose.position.x, y: this.goose.position.y };
    this.targetMoveSpeed = 200; // Speed at which the target moves
    this.targetMoveDirection = { x: Math.random() - 0.5, y: Math.random() - 0.5 };
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;
      
    if (!this.trackingMud && this.elapsedTime > this.stayInMudDuration) {
      this.goose.currentAnimation = Goose.ANIMATIONS.WALKING;
      this.trackingMud = true;
      this.elapsedTime = 0;
      this.mud.removeGoose();
    }

    if (this.trackingMud) {
      this.timeSinceLastFootprint += ENGINE.clockTick;

      if (this.timeSinceLastFootprint >= this.footprintInterval) {
        // Calculate rotation based on velocity
        const rotation = Math.atan2(this.goose.velocity.y, this.goose.velocity.x);

        // Create footprints at the goose's position
        const footprints = new Footprints(this.goose.position.x, this.goose.position.y, rotation);
        ENGINE.addEntity(footprints, GameEngine.DEPTH.BACKGROUND);
        this.footprints.push(footprints);

        // Reset the footprint timer
        this.timeSinceLastFootprint = 0;
      }

      // Move the target position in a random, interpolated way
      this.targetPos.x += this.targetMoveDirection.x * this.targetMoveSpeed * ENGINE.clockTick;
      this.targetPos.y += this.targetMoveDirection.y * this.targetMoveSpeed * ENGINE.clockTick;

      // Change direction randomly
      if (Math.random() < 0.01) {
        this.targetMoveDirection.x = Math.random() - 0.5;
        this.targetMoveDirection.y = Math.random() - 0.5;
      }

      // Ensure the target stays within bounds
      if (this.hitTopBounds(this.targetPos.x, this.targetPos.y) ||
          this.hitBottomBounds(this.targetPos.x, this.targetPos.y)) {
        this.targetMoveDirection.y *= -1;
      }

      if (this.hitLeftBounds(this.targetPos.x, this.targetPos.y) ||
          this.hitRightBounds(this.targetPos.x, this.targetPos.y)) {
        this.targetMoveDirection.x *= -1;
      }

      // Set the new target position for the goose
      this.setTarget(this.targetPos.x, this.targetPos.y);

      // Move the goose towards the target
      this.moveToTarget();

      if (this.elapsedTime >= this.trackMudDuration) {
        this.goose.setState(Goose.STATES.IDLE);
      }
    }
  }

  exit() {
    // Clean up mud and footprints when leaving state
    if (this.mud) {
      this.mud.kill();
    }
    this.goose.shadow.show();

    // Kill all footprints
    this.footprints.forEach(footprint => footprint.kill());
  }

  hitTopBounds(x, y) {
    return y < 100;
  }

  hitBottomBounds(x, y) {
    return y > window.innerHeight - 100;
  }

  hitLeftBounds(x, y) {
    return x < 100;
  }

  hitRightBounds(x, y) {
    return x > window.innerWidth - 100;
  }
}

class DragMemesState extends GooseState {
  enter() {
    this.goose.speed = 50;
    this.goose.currentAnimation = Goose.ANIMATIONS.WALKING;
    this.targetRandomLocation();

    // Create meme element
    this.meme = this.createMemeElement();
    document.body.appendChild(this.meme);

    // Set initial meme position
    this.updateMemePosition();
  }

  update() {
    if (this.distanceToTarget < 10) {
      this.setVelocity(0, 0);
      this.goose.setState(Goose.STATES.IDLE);
      this.enableUserDrag();
    } else {
      this.moveToTarget();
      this.updateMemePosition();
    }
  }

  exit() {
    // in case state is cut short
    if (this.meme.draggable) {
      this.enableUserDrag();
    }
  }

  targetRandomLocation() {
    const randPoint = this.genPointInBounds();
    this.setTarget(randPoint.x, randPoint.y);
  }

  createMemeElement() {
    const meme = document.createElement('img');
    const imagePath = Goose.MEME_IMAGES[Math.floor(Math.random() * Goose.MEME_IMAGES.length)];
    console.log("Getting meme image:", chrome.runtime.getURL(imagePath));
    meme.src = chrome.runtime.getURL(imagePath);
    meme.className = 'goose-meme';
    meme.style.position = 'absolute';
    meme.style.zIndex = '9999';
    meme.style.cursor = 'move';
    return meme;
  }

  updateMemePosition() {
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.meme.style.left = `${this.goose.position.x + scrollX}px`;
    this.meme.style.top = `${this.goose.position.y + scrollY}px`;
  }

  enableUserDrag() {
    this.meme.draggable = false; // Disable default HTML5 drag and drop
    this.meme.addEventListener('mousedown', this.onMouseDown.bind(this));
  }

  onMouseDown(event) {
    event.preventDefault();
    const meme = event.target;
    const offsetX = event.clientX - meme.getBoundingClientRect().left;
    const offsetY = event.clientY - meme.getBoundingClientRect().top;

    const onMouseMove = (moveEvent) => {
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      meme.style.left = `${moveEvent.clientX - offsetX + scrollX}px`;
      meme.style.top = `${moveEvent.clientY - offsetY + scrollY}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}






class Goose {
  constructor() {
    // Singleton pattern
    if (Goose.instance) {
      return Goose.instance;
    }
    Goose.instance = this;

    // Initialize goose properties
    const randXInsideViewport = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
    const randYInsideViewport = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
    this.position = {
      x: randXInsideViewport,
      y: randYInsideViewport
    };
    this.velocity = { x: 0, y: 0 };
    
    this.facing = "right";
    this.currentAnimation = Goose.ANIMATIONS.BOBBING;
    this.currentState = null;
    this.previousState = null;

    if (DEBUG_MODE) {
      this.target = new Target(this);
      ENGINE.addEntity(this.target, GameEngine.DEPTH.FOREGROUND);
    }

    // Extra sprites that belong with the goose
    this.shadow = new Shadow(this);
    ENGINE.addEntity(this.shadow, GameEngine.DEPTH.BACKGROUND);
  }

  /**
   * Performs a state transition 
   * @param {GooseState} stateClass One of the Goose.STATES enum values
   */
  setState(stateClass) {
    this.previousState = this.currentState;

    if (this.currentState?.exit) {
      // console.log("Exiting current state: ", this.currentState);
      this.currentState.exit();
    }

    ASSET_MGR.playSFX(Goose.RANDOM_HONK_SFX());
    ENGINE.addEntity(new Honk(this), GameEngine.DEPTH.FOREGROUND);

    // create new goose state based on the stateClass
    if (stateClass.prototype instanceof GooseState) {
      this.currentState = new stateClass(this);
    } else {
      throw new Error("Unknown state type:", stateClass);
    }

    if (this.currentState?.enter) {
      // console.log("Entering new state: ", this.currentState);
      this.currentState.enter();
    }
  }

  kill() {
    ASSET_MGR.playSFX(Goose.SFX.HONK_ECHO);

    // Stop any ongoing animations or intervals
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }
    this.currentState = null;

    // Clear from window  
    Goose.instance = null;

    // kill entities tied to the goose
    this.shadow.kill();
    if (this.target) {
      this.target.kill();
    }

    this.removeFromCanvas = true;
  }

  // === UPDATE/DRAW LOOP METHODS ===

  update() {
    if (this.velocity.x > 0) {
      this.facing = "right";
    } else if (this.velocity.x < 0) {
      this.facing = "left";
    }

    // === STATE MANAGER ===
    // put global state transitions here (transitions that will happen regardless of current state)
    if (ENGINE.mouseClicked && this.collided(ENGINE.mouseX, ENGINE.mouseY)) {
      this.setState(Goose.STATES.CHASE);
    }

    // goose takes different actions based on its state.
    this.currentState.update();

    // movement updates
    this.position.x += this.velocity.x * ENGINE.clockTick;
    this.position.y += this.velocity.y * ENGINE.clockTick;
  }

  draw() {
    this.currentAnimation.drawFrame(this.position.x, this.position.y, this.facing);
  }

  /**
   * Returns true if the goose has collided with another entity
   * @param {number} otherX The x position of the other entity
   * @param {number} otherY The y position of the other entity
   * @returns {boolean} True if the goose has collided with the other entity, false otherwise.
   */
  collided(otherX, otherY) {
    return (otherX > this.position.x - 32 && otherX < this.position.x + 32 &&
      otherY > this.position.y - 32 && otherY < this.position.y + 32);
  }




  // === CLASS CONSTANTS ===

  /**
   * The size of each frame in the spritesheet
   * @returns {{width: number, height: number}}
   */
  static get FRAME_SIZE() {
    return 32;
  }

  static get SCALE() {
    return 2;
  }

  static get SPRITESHEET() {
    return "/images/sprites/goose.png";
  }

  static get SFX() {
    return {
      HONK1: "/audio/honk1.mp3",
      HONK2: "/audio/honk2.mp3",
      HONK3: "/audio/honk3.mp3",
      HONK_ECHO: "/audio/honk-echo.mp3"
    };
  }

  static RANDOM_HONK_SFX() {
    const sfxPaths = [Goose.SFX.HONK1, Goose.SFX.HONK2, Goose.SFX.HONK3];
    return sfxPaths[Math.floor(Math.random() * sfxPaths.length)];
  }

  static get MEME_IMAGES() {
    return [
      '/images/memes/deal-with-it.jpg',
      '/images/memes/goose-morning.jpg',
      '/images/memes/mess-with-the-honk.jpg',
      '/images/memes/not-going-anywhere.jpg',
      '/images/memes/peace-was-never-an-option.jpg',
      '/images/memes/peaking.jpg',
      '/images/memes/selfie.jpg',
    ];
  }

  static ANIMATIONS = {
    BOBBING: new Animator(0, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 2, 0.7),
    LOOKING_AROUND: new Animator(1, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 3, 0.7, false),
    LOOKING_UP: new Animator(2, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 1, 0.7, false),
    WALKING: new Animator(3, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.2),
    RUNNING: new Animator(4, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.15),
    FLYING: new Animator(5, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.2),
    SWIMMING: new Animator(6, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 2, 0.5),
    SHOOED: new Animator(7, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.15),
    DANCING: new Animator(8, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.2),
    ANGRY: new Animator(9, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.15),
  }

  static STATES = {
    IDLE: IdleState,
    WANDER: WanderState,
    CHASE: ChaseState,
    FLY: FlyState,
    SWIM: SwimState,
    SHOOED: ShooedState,
    DANCE: DanceState,
    TRACK_MUD: TrackMudState,
    DRAG_MEMES: DragMemesState
  }
}