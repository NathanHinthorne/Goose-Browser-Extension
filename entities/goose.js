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
  update() {}
  

  
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
    this.elapsedTime = 0;
    this.timeLimit = 1;
    this.goose.speed = 0;
    this.goose.setAnimation(Goose.ANIMATIONS.BOBBING);

    // % chance of each state every second
    this.wanderChance = 0.04 / GameEngine.FPS;
    this.flyChance = 0.015 / GameEngine.FPS;
    this.swimChance = 0.015 / GameEngine.FPS;
    this.danceChance = 0.015 / GameEngine.FPS;
    this.trackMudChance = 0.015 / GameEngine.FPS;
    this.dragMemesChance = 0.015 / GameEngine.FPS;
    this.layEggChance = 0; // Will be set based on premium status
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;

    // Don't check for state transitions until premium check is complete
    if (!this.goose.premiumCheckComplete || this.elapsedTime < this.timeLimit) {
      return;
    }

    // Set lay egg chance based on premium status
    if (this.layEggChance === 0 && this.goose.isPremium) {
      this.layEggChance = 0.015 / GameEngine.FPS;
    }

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

    if (Math.random() < this.dragMemesChance) {
      this.goose.setState(Goose.STATES.DRAG_MEMES);
    }

    if (Math.random() < this.layEggChance) {
      this.goose.setState(Goose.STATES.LAY_EGG);
    }
  }
}

class WanderState extends GooseState {
  enter() {
    this.goose.speed = 30;
    this.goose.setAnimation(Goose.ANIMATIONS.WALKING);
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

class ChaseState extends GooseState {
  enter() {
    this.goose.speed = 150;
    this.goose.setAnimation(Goose.ANIMATIONS.ANGRY);
    this.interpolatedPos = { x: this.goose.position.x, y: this.goose.position.y };
    // this.arrivedAtMouse = false;
    this.elapsedTime = 0;
    this.timeLimit = 15;
    this.attackInterval = 1; // Delay before goose can bite/whack you
    this.timeSinceLastAttack = 0;
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

    this.timeSinceLastAttack += ENGINE.clockTick;
    if (this.distanceToTarget < 10 && this.timeSinceLastAttack >= this.attackInterval) {
      this.timeSinceLastAttack = 0;

      const chance = Math.random();
      if (chance < 0.5) { // 50% chance of either bonk or bite
        this.goose.setState(Goose.STATES.BONK);
      } else {
        this.goose.setState(Goose.STATES.BITE);
      }
    }
    
    if (this.distanceToTarget > 10) {
      this.moveToTarget();

      this.timeSinceLastHonk += ENGINE.clockTick;
      if (this.timeSinceLastHonk >= this.honkInterval) {
        ASSET_MGR.playAudio(Goose.RANDOM_HONK_SFX());
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

class BiteState extends GooseState {
  enter() {
    Goose.ANIMATIONS.BITING.resetAnimation(); // Reset to first frame
    this.goose.setAnimation(Goose.ANIMATIONS.BITING);
    ASSET_MGR.playAudio(Goose.SFX.BITE, 0.5);
    this.setVelocity(0, 0);

    this.elapsedTime = 0;
    this.timeLimit = 5; // hang on for 5 seconds
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;
    if (this.elapsedTime > this.timeLimit) {
      this.goose.setState(Goose.STATES.WANDER);
    }

    const xOffset = this.goose.facing === "right" ? -40 : 40;

    this.goose.position.x = ENGINE.mouseX + xOffset;
    this.goose.position.y = ENGINE.mouseY;
  }
}

class BonkState extends GooseState {
  enter() {
    Goose.ANIMATIONS.BONKING.resetAnimation(); // Reset to first frame
    this.goose.setAnimation(Goose.ANIMATIONS.BONKING);
    ASSET_MGR.playAudio(Goose.SFX.BONK);
    this.setVelocity(0, 0);

    this.elapsedTime = 0;
    this.timeLimit = 1;
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;
    if (this.elapsedTime > this.timeLimit) {
      this.goose.setState(Goose.STATES.WANDER);
    }
  }
}




class FlyState extends GooseState {
  enter() {
    this.goose.speed = 80;
    this.goose.setAnimation(Goose.ANIMATIONS.FLYING);
    this.goose.shadow.freezeHeight();
    for (let gosling of this.goose.goslings) {
      gosling.freeze();
    }
    
    
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
    for (let gosling of this.goose.goslings) {
      gosling.unfreeze();
    }
  }
}

class SwimState extends GooseState {
  enter() {
    this.goose.speed = 30;  // Walking speed to puddle
    this.goose.setAnimation(Goose.ANIMATIONS.WALKING);
    
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
        this.goose.setAnimation(Goose.ANIMATIONS.SWIMMING);
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
    this.goose.setAnimation(Goose.ANIMATIONS.DANCING);
    this.elapsedTime = 0;
    this.danceDuration = 8.8;

    this.discoBall = new DiscoBall(this.goose.position.x, this.goose.position.y - 100);
    ENGINE.addEntity(this.discoBall, GameEngine.DEPTH.FOREGROUND);
    this.discoBall.start();

    for (let gosling of this.goose.goslings) {
      gosling.setState(Gosling.STATES.DANCE);
    }
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;

    if (this.elapsedTime >= this.danceDuration) {
      this.goose.setState(Goose.STATES.IDLE);
    }
  }

  exit() {
    this.discoBall.kill();

    for (let gosling of this.goose.goslings) {
      gosling.setState(Gosling.STATES.FOLLOW_PARENT);
    }
  }
}

class TrackMudState extends GooseState {
  enter() {
    this.goose.speed = 30;  // Walking speed to mud
    this.goose.setAnimation(Goose.ANIMATIONS.BOBBING);
    
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
      this.goose.setAnimation(Goose.ANIMATIONS.WALKING);
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

        // Ensure the speed is above the minimum threshold
        const minSpeed = 0.4;
        const speed = Math.sqrt(this.targetMoveDirection.x ** 2 + this.targetMoveDirection.y ** 2);
        if (speed < minSpeed) {
          const scale = minSpeed / speed;
          this.targetMoveDirection.x *= scale;
          this.targetMoveDirection.y *= scale;
        }
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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

class DragMemesState extends GooseState {
  enter() {
    if (this.goose.memeIndex > Goose.MEME_IMAGES.length - 1) {
      // reshuffle memes and reset index
      this.goose.memeIndex = 0;
      this.goose.shuffled_memes = shuffle([...Goose.MEME_IMAGES]);

      // ENGINE.addEntity(new TextBox(this.goose, "Looks like I'm all out of memes"), GameEngine.DEPTH.FOREGROUND);
      // this.goose.setAnimation(Goose.ANIMATIONS.BOBBING);
      // setTimeout(() => {
      //   this.goose.setState(Goose.STATES.IDLE);
      // }, 4000);
      // return;
    }

    this.goose.speed = 50;
    this.goose.setAnimation(Goose.ANIMATIONS.DRAGGING);
    this.targetRandomLocation();

    // Create meme element
    this.meme = this.createMemeElement();
    document.body.appendChild(this.meme);

    // Set initial meme position
    this.updateMemePosition();
  }

  update() {
    if (!this.meme) return;

    if (this.goose.velocity.x < 0) {
      this.goose.facing = "right";
    } else if (this.goose.velocity.x > 0) {
      this.goose.facing = "left";
    }

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
    if (this.meme) {
      this.enableUserDrag();

      // timer to remove meme from DOM
      setTimeout(() => {
        if (this.meme.parentNode) {
          this.meme.parentNode.removeChild(this.meme);
        }
      }, 15000); 
    }
  }

  targetRandomLocation() {
    const randPoint = this.genPointInBounds();
    this.setTarget(randPoint.x, randPoint.y);
  }

  createMemeElement() {
    const meme = document.createElement('img');
    const imagePath = this.goose.shuffled_memes[this.goose.memeIndex];
    this.goose.memeIndex++;
    meme.src = chrome.runtime.getURL(imagePath);
    meme.className = 'goose-meme';
    meme.style.position = 'fixed';
    meme.style.zIndex = '9998';
    meme.style.cursor = 'move';

    // Force a reload by adding a timestamp query parameter, getting around caching
    // This ensures a fresh image is loaded each time
    meme.src = chrome.runtime.getURL(imagePath) + '?t=' + Date.now();
    
    return meme;
  }

  updateMemePosition() {
    if (this.goose.facing === "left") {
      this.meme.style.left = `${this.goose.position.x - this.meme.width}px`;
      this.meme.style.right = 'auto';
    } else {
      this.meme.style.left = `${this.goose.position.x}px`;
      this.meme.style.right = 'auto';
    }

    this.meme.style.top = `${this.goose.position.y}px`;
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
      meme.style.left = `${moveEvent.clientX - offsetX}px`;
      meme.style.top = `${moveEvent.clientY - offsetY}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}

/**
 * Lays an egg that hatches into a gosling after a delay.
 */
class LayEggState extends GooseState {
  enter() {
    this.goose.setAnimation(Goose.ANIMATIONS.LAYING_EGG);
    this.elapsedTime = 0;
    this.layDuration = 7;

    // Create and add egg to game
    this.goose.numChildren++;
    this.egg = new Egg(this.goose.position.x, this.goose.position.y, this.goose.numChildren, this.goose);
    ENGINE.addEntity(this.egg, GameEngine.DEPTH.BACKGROUND);
  }

  update() {
    this.elapsedTime += ENGINE.clockTick;

    if (this.elapsedTime >= this.layDuration) {
      this.goose.setState(Goose.STATES.WANDER);
    }
  }

  exit() {
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
    this.setAnimation(Goose.ANIMATIONS.BOBBING);
    this.currentState = null;
    this.previousState = null;

    this.goslings = [];
    this.numChildren = 0;

    this.hat = new Hat(this, Hat.HAT_TYPES.NONE);
    ENGINE.addEntity(this.hat, GameEngine.DEPTH.FOREGROUND);

    this.memeIndex = 0;
    this.shuffled_memes = shuffle([...Goose.MEME_IMAGES]);

    if (DEBUG_MODE) {
      this.target = new Target(this);
      ENGINE.addEntity(this.target, GameEngine.DEPTH.FOREGROUND);
    }

    // Extra sprites that belong with the goose
    this.shadow = new Shadow(this);
    ENGINE.addEntity(this.shadow, GameEngine.DEPTH.BACKGROUND);

    // Create an overlay for the goose
    this.gooseOverlay = document.createElement('div');
    this.gooseOverlay.style.position = 'fixed';
    this.gooseOverlay.style.width = `${Goose.FRAME_SIZE * Goose.SCALE}px`;
    this.gooseOverlay.style.height = `${Goose.FRAME_SIZE * Goose.SCALE}px`;
    this.gooseOverlay.style.pointerEvents = 'auto';
    this.gooseOverlay.style.userSelect = 'none'; // prevent text selection
    this.gooseOverlay.style.backgroundColor = 'transparent'; // keep it invisible
    this.gooseOverlay.style.cursor = 'pointer';
    document.body.appendChild(this.gooseOverlay);

    this.isPremium = false;
    this.premiumCheckComplete = false;
    
    const extPay = ExtPay('annoying-goose');
    extPay.getUser().then(user => {
      this.isPremium = user.paid;
      this.premiumCheckComplete = true;
    });
  }

  /**
   * Performs a state transition 
   * @param {GooseState} stateClass One of the Goose.STATES enum values
   */
  setState(stateClass) {
    this.previousState = this.currentState;

    if (this.currentState?.exit) {
      this.currentState.exit();
    }

    ASSET_MGR.playAudio(Goose.RANDOM_HONK_SFX());
    ENGINE.addEntity(new Honk(this), GameEngine.DEPTH.FOREGROUND);

    // create new goose state based on the stateClass
    if (stateClass.prototype instanceof GooseState) {
      this.currentState = new stateClass(this);
    } else {
      throw new Error("Unknown state type:", stateClass);
    }

    if (this.currentState?.enter) {
      this.currentState.enter();
    }
  }

  setAnimation(animation) {
    this.currentAnimation = animation;

    const bendingDownAnimations = [
      Goose.ANIMATIONS.LAYING_EGG,
      Goose.ANIMATIONS.SWIMMING,
      Goose.ANIMATIONS.RUNNING,
      Goose.ANIMATIONS.ANGRY,
      Goose.ANIMATIONS.BITING,
      Goose.ANIMATIONS.DRAGGING
    ];

    // temp until head pos system is implemented
    if (bendingDownAnimations.includes(animation)) {
      this.isBendingDown = true;
    } else {
      this.isBendingDown = false;
    }
  }


  kill() {
    ASSET_MGR.playAudio(Goose.SFX.HONK_ECHO);

    // Stop any ongoing animations or intervals
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }
    this.currentState = null;

    // Clear from window  
    Goose.instance = null;

    // clear all entities from the engine
    ENGINE.clearEntities();

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
      ASSET_MGR.playAudio(Goose.SFX.SLAP);
      this.setState(Goose.STATES.CHASE);
    }

    // goose takes different actions based on its state.
    this.currentState.update();

    // movement updates
    this.position.x += this.velocity.x * ENGINE.clockTick;
    this.position.y += this.velocity.y * ENGINE.clockTick;

    // update goose overlay position
    this.gooseOverlay.style.left = `${this.position.x - (Goose.FRAME_SIZE * Goose.SCALE) / 2}px`;
    this.gooseOverlay.style.top = `${this.position.y - (Goose.FRAME_SIZE * Goose.SCALE) / 2}px`;
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
    return (otherX > this.position.x - (Goose.FRAME_SIZE * Goose.SCALE / 2) &&
      otherX < this.position.x + (Goose.FRAME_SIZE * Goose.SCALE / 2) &&
      otherY > this.position.y - (Goose.FRAME_SIZE * Goose.SCALE / 2) &&
      otherY < this.position.y + (Goose.FRAME_SIZE * Goose.SCALE / 2));
  }

  getHeadPosition() {
    const frameIndex = this.currentAnimation.currentFrame;
    const anchors = this.currentAnimation.headAnchors;
    
    if (!anchors || !anchors[frameIndex]) {
      console.error("No head anchor found for frame index:", frameIndex);
      return { x: this.position.x, y: this.position.y - 32 }; // fallback
    }
    
    const anchor = anchors[frameIndex];
    const facingMultiplier = this.facing === "right" ? 1 : -1;
    
    return {
      x: this.position.x + (anchor.x * facingMultiplier),
      y: this.position.y + anchor.y
    };
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
    return "/images/entities/goose.png";
  }

  static get SFX() {
    return {
      HONK1: "/audio/honk1.mp3",
      HONK2: "/audio/honk2.mp3",
      HONK3: "/audio/honk3.mp3",
      HONK_ECHO: "/audio/honk-echo.mp3",
      SLAP: "/audio/slap.mp3",
      BITE: "/audio/bite.mp3",
      BONK: "/audio/bonk-doge.mp3",
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

  /*
  NOTE:

  The () at the end is immediately invoking the arrow function.

  Example: instead of storing the function itself in BOBBING, 
  you're storing the result of calling that function 
  (the Animator object with the headAnchors property added).

  This is a common pattern in JavaScript called an Immediately Invoked Function Expression (IIFE).
  */
  static ANIMATIONS = {
    BOBBING: (() => {
      const anime = new Animator(0, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 2, 0.7);
      anime.headAnchors = [
        {x: 10, y: -30}, // frame 0
        {x: 10, y: -28}  // frame 1
      ];
      return anime;
    })(),
    LOOKING_AROUND: (() => {
      const anime = new Animator(1, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 3, 0.7, false);
      anime.headAnchors = [
        {x: 10, y: -32}, // frame 0
        {x: 10, y: -32}, // frame 1
        {x: 10, y: -32}  // frame 2
      ];
      return anime;
    })(),
    LOOKING_UP: (() => {
      const anime = new Animator(2, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 1, 0.7, false);
      anime.headAnchors = [
        {x: 10, y: -32}  // frame 0
      ];
      return anime;
    })(),
    WALKING: (() => {
      const anime = new Animator(3, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.2);
      anime.headAnchors = [
        {x: 10, y: -30}, // frame 1
        {x: 10, y: -30}, // frame 2
        {x: 10, y: -30},  // frame 3
        {x: 10, y: -30}, // frame 0
      ];
      return anime;
    })(),
    RUNNING: (() => {
      const anime = new Animator(4, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.15);
      anime.headAnchors = [
        {x: 18, y: -20}, // frame 0
        {x: 18, y: -20}, // frame 1
        {x: 18, y: -20}, // frame 2
        {x: 18, y: -20}  // frame 3
      ];
      return anime;
    })(),
    FLYING: (() => {
      const anime = new Animator(5, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.2);
      anime.headAnchors = [
        {x: 10, y: -32}, // frame 0
        {x: 10, y: -31}, // frame 1
        {x: 10, y: -32}, // frame 2
        {x: 10, y: -30}  // frame 3
      ];
      return anime;
    })(),
    SWIMMING: (() => {
      const anime = new Animator(6, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 2, 0.5);
      anime.headAnchors = [
        {x: 10, y: -14}, // frame 0
        {x: 12, y: -14}  // frame 1
      ];
      return anime;
    })(),
    SHOOED: (() => {
      const anime = new Animator(7, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.15);
      anime.headAnchors = [
        {x: 10, y: -32}, // frame 0
        {x: 10, y: -32}, // frame 1
        {x: 10, y: -32}, // frame 2
        {x: 10, y: -32}  // frame 3
      ];
      return anime;
    })(),
    DANCING: (() => {
      const anime = new Animator(8, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.23);
      anime.headAnchors = [
        {x: -2, y: -32}, // frame 0
        {x: 18, y: -10}, // frame 1
        {x: 22, y: 10}, // frame 2
        {x: 18, y: -10}  // frame 3
      ];
      return anime;
    })(),
    ANGRY: (() => {
      const anime = new Animator(9, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.15);
      anime.headAnchors = [
        {x: 20, y: -15}, // frame 0
        {x: 18, y: -13}, // frame 1
        {x: 20, y: -15}, // frame 2
        {x: 18, y: -13}  // frame 3
      ];
      return anime;
    })(),
    LAYING_EGG: (() => {
      const anime = new Animator(10, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 2, 0.8);
      anime.headAnchors = [
        {x: 10, y: -14},  // frame 1
        {x: 10, y: -14}, // frame 0
      ];
      return anime;
    })(),
    DRAGGING: (() => {
      const anime = new Animator(11, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 4, 0.2);
      anime.headAnchors = [
        {x: 18, y: 8}, // frame 0
        {x: 16, y: 6}, // frame 1
        {x: 18, y: 8}, // frame 2
        {x: 16, y: 6}  // frame 3
      ];
      return anime;
    })(),
    BITING: (() => {
      const anime = new Animator(12, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 2, 0.2, false);
      anime.headAnchors = [
        {x: 20, y: 0}, // frame 0
        {x: 20, y: 0}, // frame 1
      ];
      return anime;
    })(),
    BONKING: (() => {
      const anime = new Animator(13, Goose.SPRITESHEET, Goose.FRAME_SIZE, Goose.SCALE, 3, 0.1, false);
      anime.headAnchors = [
        {x: 0, y: -30}, // frame 0
        {x: 0, y: -34}, // frame 1
        {x: 0, y: -30}  // frame 2
      ];
      return anime;
    })()
  }

  static STATES = {
    IDLE: IdleState,
    WANDER: WanderState,
    CHASE: ChaseState,
    BITE: BiteState,
    BONK: BonkState,
    FLY: FlyState,
    SWIM: SwimState,
    SHOOED: ShooedState,
    DANCE: DanceState,
    TRACK_MUD: TrackMudState,
    DRAG_MEMES: DragMemesState,
    LAY_EGG: LayEggState,
  }
}
