/**
 * Gosling State 🪿
 */
class GoslingState {
  constructor(gosling) {
    this.gosling = gosling;

    // Goose Defaults
    this.gosling.speed = 0;
    this.gosling.velocity = { x: 0, y: 0 };

    // Local State Defaults
    this.distanceToTarget = 0;
    this.targetPos = { x: 0, y: 0 };
  }

  enter() {}
  exit() {}
  update() {}
  
  setVelocity(x, y) {
    this.gosling.velocity.x = x;
    this.gosling.velocity.y = y;
  }

  setTarget(x, y) {
    this.targetPos.x = x;
    this.targetPos.y = y;

    const dx = this.targetPos.x - this.gosling.position.x;
    const dy = this.targetPos.y - this.gosling.position.y;
    this.distanceToTarget = Math.sqrt(dx * dx + dy * dy);
  }

  moveToTarget() {
    const dx = this.targetPos.x - this.gosling.position.x;
    const dy = this.targetPos.y - this.gosling.position.y;
    this.distanceToTarget = Math.sqrt(dx * dx + dy * dy);

    const velocityX = (dx / this.distanceToTarget) * this.gosling.speed;
    const velocityY = (dy / this.distanceToTarget) * this.gosling.speed;

    this.setVelocity(velocityX, velocityY);
  }
}

class NothingState extends GoslingState {
    enter() {
        this.gosling.setAnimation(Gosling.ANIMATIONS.BOBBING);
        this.gosling.speed = 0;
    }

    update() {
        this.setTarget(this.gosling.targetPos.x, this.gosling.targetPos.y);

        if (this.distanceToTarget > 20) {
            this.gosling.setState(Gosling.STATES.FOLLOW_PARENT);
        }
    }
}

class FollowParentState extends GoslingState {
    constructor(gosling) {
        super(gosling);
        this.peepChance = 0.06 / GameEngine.FPS; // 6% chance a second
    }

    enter() {
        this.gosling.setAnimation(Gosling.ANIMATIONS.WALKING);
        this.gosling.speed = 30;
    }

    update() {
        this.setTarget(this.gosling.targetPos.x, this.gosling.targetPos.y);
        this.moveToTarget();

        if (Math.random() < this.peepChance) {
            ASSET_MGR.playAudio(Gosling.RANDOM_PEEP_SFX());
        }

        if (this.distanceToTarget < 10) {
            this.gosling.setState(Gosling.STATES.IDLE);
        }

        // return to chasing if parent goose gets too far away
        if (this.distanceToTarget > 70) {
            this.gosling.setState(Gosling.STATES.CHASE_PARENT);
        }
    }
}

/**
 * Runs after parent goose until it gets close enough to the parent goose
 */
class ChaseParentState extends GoslingState {
    constructor(gosling) {
        super(gosling);
        this.peepChance = 0.15 / GameEngine.FPS; // 15% chance a second
    }

    enter() {
        this.gosling.setAnimation(Gosling.ANIMATIONS.RUNNING);
        this.gosling.speed = 90;
    }
    
    update() {
        this.setTarget(this.gosling.targetPos.x, this.gosling.targetPos.y);
        this.moveToTarget();

        if (Math.random() < this.peepChance) {
            ASSET_MGR.playAudio(Gosling.RANDOM_PEEP_SFX());
        }

        if (this.distanceToTarget < 10) {
            this.gosling.setState(Gosling.STATES.IDLE);
        }
    
        if (this.distanceToTarget < 50) {
            this.gosling.setState(Gosling.STATES.FOLLOW_PARENT);
        }
    }
}


class Gosling {
    constructor(x, y, childNumber, parentGoose) {
        this.parentGoose = parentGoose;
        this.position = { x, y };
        this.setState(Gosling.STATES.FOLLOW_PARENT);
        this.trailingDistance = (childNumber * 30) + 10;
        this.trailingX = 0;
        this.trailingY = 0;

        this.youngDuration = 120; // 2 minutes
        this.elapsedTime = 0;

        // this.target = new Target(this);
        // ENGINE.addEntity(this.target, GameEngine.DEPTH.FOREGROUND);

        console.log("gosling #", childNumber, "is at", this.position.x, this.position.y);
        console.log("gosling trailing distance is", this.trailingDistance);
    }

    /**
     * Performs a state transition 
     * @param {GoslingState} stateClass One of the Gosling.STATES enum values
     */
    setState(stateClass) {
        this.previousState = this.currentState;

        if (this.currentState?.exit) {
            // console.log("Exiting current state: ", this.currentState);
            this.currentState.exit();
        }

        // create new goose state based on the stateClass
        if (stateClass.prototype instanceof GoslingState) {
            this.currentState = new stateClass(this);
        } else {
            throw new Error("Unknown state type:", stateClass);
        }

        if (this.currentState?.enter) {
            // console.log("Entering new state: ", this.currentState);
            this.currentState.enter();
        }
    }

    setAnimation(animation) {
        this.currentAnimation = animation;
    }

    growUp() {
        console.log("gosling has grown up!");


        // this.setState(Gosling.STATES.IDLE_NEAR_PARENT);
        // this.kill();

        //TODO take out singleton pattern for Goose to allow multiple geese to be spawned
        // ENGINE.addEntity(new Goose(this.position.x, this.position.y - 20));
    }

    kill() {
        this.removeFromCanvas = true;
    }

    // === UPDATE/DRAW LOOP METHODS ===

    update() {
        if (this.velocity.x > 0) {
            this.facing = "right";
        } else if (this.velocity.x < 0) {
            this.facing = "left";
        }

        this.elapsedTime += ENGINE.clockTick;

        if (this.elapsedTime >= this.youngDuration) {
            this.growUp();
        }

        if (this.parentGoose.speed > 0) {
            this.trailingX = (this.parentGoose.velocity.x / this.parentGoose.speed) * -this.trailingDistance;
            this.trailingY = (this.parentGoose.velocity.y / this.parentGoose.speed) * -this.trailingDistance;
        }

        this.targetPos = {
            x: this.parentGoose.position.x + this.trailingX,
            y: this.parentGoose.position.y + this.trailingY
        }

        // gosling takes different actions based on its state.
        this.currentState.update();

        // movement updates
        this.position.x += this.velocity.x * ENGINE.clockTick;
        this.position.y += this.velocity.y * ENGINE.clockTick;
    }

    draw() {
        this.currentAnimation.drawFrame(this.position.x, this.position.y, this.facing);

        
    }
    
    // === CLASS CONSTANTS ===

    static get SPRITESHEET() {
        return "/images/sprites/gosling.png";
    }

    static get SCALE() {
        return 2.2;
    }

    static get FRAME_SIZE() {
        return 16;
    }

    static get SFX() {
        return {
            PEEP1: "/audio/peep1.mp3",
            PEEP2: "/audio/peep2.mp3",
            PEEP3: "/audio/peep3.mp3",
        };
    }

    static RANDOM_PEEP_SFX() {
        const sfxPaths = [Gosling.SFX.PEEP1, Gosling.SFX.PEEP2, Gosling.SFX.PEEP3];
        return sfxPaths[Math.floor(Math.random() * sfxPaths.length)];
    }

    static ANIMATIONS = {
        BOBBING: new Animator(0, Gosling.SPRITESHEET, Gosling.FRAME_SIZE, Gosling.SCALE, 2, 0.7),
        WALKING: new Animator(1, Gosling.SPRITESHEET, Gosling.FRAME_SIZE, Gosling.SCALE, 4, 0.2),
        RUNNING: new Animator(2, Gosling.SPRITESHEET, Gosling.FRAME_SIZE, Gosling.SCALE, 4, 0.15)
    }

    static STATES = {
        IDLE: NothingState,
        CHASE_PARENT: ChaseParentState,
        FOLLOW_PARENT: FollowParentState,
    }
}

