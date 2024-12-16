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
    this.velocity = { x: 0, y: 0 };
    
    this.facing = "right";
    this.currentAnimation = Goose.ANIMATIONS.idle;
  }

  // State transition method
  setState(newState) {
    if (this.currentState?.exit) {
      this.currentState.exit();
    }

    ASSET_MGR.playSFX(Goose.SFX.HONK);

    this.currentState = this.states[newState];
    console.log( "currentState: ", this.currentState );

    if (this.currentState?.enter) {
      this.currentState.enter();
    }
  }

  delete() {
    ASSET_MGR.playSFX(Goose.SFX.HONK_ECHO);

    // Stop any ongoing animations or intervals
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    // Clear from window
    Goose.instance = null;
    
    // might not want to clear cache since goose will be used later
    // assets.clearCache();

    // Any additional cleanup
    this.removeFromCanvas = true;
  }

  
  // === UPDATE/DRAW LOOP METHODS ===

  update() {
    // update logic should be handled by the current GooseState.
    // goose takes different actions based on its state.
    this.currentState.update();
  }

  draw() {
    this.currentAnimation.drawFrame(this.position.x, this.position.y, this.facing);
  }



  // === CLASS CONSTANTS ===

  static get FRAME_SIZE() {
    return 32;
  }

  static get SCALE() {
    return 2;
  }

  static get SPRITESHEET() {
    return "/images/goose-spritesheet.png";
  }

  static get SFX() {
    return {
      HONK: "/audio/honk.mp3",
      HONK_ECHO: "/audio/honk-echo.mp3"
    };
  }

  static get MEME_IMAGES() {
    return [
      '/images/memes/deal-with-it.jpg',
      '/images/memes/goose-morning.jpg',
      '/images/memes/hammer.jpg',
      '/images/memes/mess-with-the-honk.jpg',
      '/images/memes/not-going-anywhere.jpg',
      '/images/memes/peace-was-never-an-option.jpg',
      '/images/memes/peaking.jpg',
      '/images/memes/selfie.jpg',
      '/images/memes/take-break-cat.jpg'
    ];
  }

  static get ANIMATIONS() { // problem. need to only create animators on initialization 
    return {
      idle: new Animator(0, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 2, 0.7),
      lookingAround: new Animator(1, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 6, 0.5),
      lookingUp: new Animator(2, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 3, 0.5),
      walking: new Animator(3, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.2),
      running: new Animator(4, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.15),
      flying: new Animator(5, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.2),
      shooed: new Animator(6, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.15)
    }
  }
}





/**
 * Goose State 🪿
 * 1. Idle, 2. Wander, 3. Alert, 4. Chase, 
 */
class GooseState {
  constructor(goose) {
    this.goose = goose;

    // Initialize
    goose.isMoving = false;
    goose.targetPos = { x: 0, y: 0 };
    goose.distanceToTarget = 0;

    // Defaults
    goose.speed = 0;
  }

  enter() {}
  exit() {}
  update() {}

  calculateVelocity(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    return magnitude > 0 
      ? { 
          x: (dx / magnitude) * this.goose.speed,
          y: (dy / magnitude) * this.goose.speed
        }
      : { x: 0, y: 0 };
  }

  moveToTarget() {
    const move = () => {
      if (!this.goose.isMoving) return;

      const currentPos = this.goose.position;
      const velocity = this.calculateVelocity(currentPos, this.goose.targetPos);
      
      const newX = currentPos.x + velocity.x;
      const newY = currentPos.y + velocity.y;
      
      const boundedX = Math.max(0, Math.min(window.innerWidth - 50, newX));
      const boundedY = Math.max(0, Math.min(window.innerHeight - 50, newY));
      
      this.goose.position.x = boundedX;
      this.goose.position.y = boundedY;
      
      this.goose.distanceToTarget = Math.hypot(
        this.goose.targetPos.x - boundedX,
        this.goose.targetPos.y - boundedY
      );

      if (this.goose.distanceToTarget < 10) {
        console.log("GOOSE REACHED TARGET");
        this.setNewTarget();
      }

      requestAnimationFrame( move );
    };

    this.goose.isMoving = true;
    requestAnimationFrame( move );
  }

  setNewTarget() {
    console.log("Setting new target...");
    this.goose.targetPos = {
      x: Math.random() * (window.innerWidth - 50),
      y: Math.random() * (window.innerHeight - 50)
    };
  }

  stopMoving() {
    this.goose.isMoving = false;
  }
}

class IdleState extends GooseState {
  enter() {
    this.goose.currentAnimation = Goose.ANIMATIONS.idle;
  }

  exit() {
  }
}

class WanderState extends GooseState {
  constructor(goose) {
    super(goose);
    this.goose.speed = 0.3;
  }

  enter() {
    console.log("Entering Wander State");
    this.goose.currentAnimation = Goose.ANIMATIONS.walking;
    this.setNewTarget();
    this.moveToTarget();
  }

  exit() {
    console.log("Exiting Wander State");
    this.stopMoving();
  }
}

// Chases user's mouse
class ChaseState extends GooseState {
  constructor(goose) {
    super(goose);
    this.goose.speed = 0.8;
  }

  enter() {
    this.goose.currentAnimation = Goose.ANIMATIONS.running;
    this.setNewTarget();
    this.moveToTarget();
  }

  exit() {
    this.stopMoving();
  }
}

