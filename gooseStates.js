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
    goose.frameDuration = 300;
    goose.currentFrame = 0;
    goose.lastFrameTime = 0;
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
      
      this.goose.element.style.left = boundedX + 'px';
      this.goose.element.style.top = boundedY + 'px';
      
      this.goose.element.style.transform = velocity.x > 0 
        ? 'scaleX(1)' 
        : 'scaleX(-1)';
      
      this.goose.distanceToTarget = Math.hypot(
        this.goose.targetPos.x - boundedX,
        this.goose.targetPos.y - boundedY
      );

      if (this.goose.distanceToTarget < 10) {
        console.log("REACHED TARGET. choosing new target...")
        this.setNewTarget();
        this.moveToTarget();
      }
    };

    this.goose.isMoving = true;
  }

  setNewTarget() {
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
    this.goose.setAnimation('idle');
    this.goose.startAnimation();
  }

  exit() {
    this.goose.stopAnimation();
  }
}

class WanderState extends GooseState {
  constructor(goose) {
    super(goose);
    this.goose.frameDuration = 300;
    this.goose.speed = 0;
  }

  enter() {
    console.log("Entering Wander State");
    this.goose.setAnimation('walking');
    this.goose.startAnimation();
    this.setNewTarget();
    this.moveToTarget();
  }

  exit() {
    console.log("Exiting Wander State");
    this.goose.stopAnimation();
    this.stopMoving();
  }
}

// Chases user's mouse
class ChaseState extends GooseState {
  constructor(goose) {
    super(goose);
    this.goose.frameDuration = 300;
    this.goose.speed = 2.5;
  }

  enter() {
    this.goose.setAnimation('running');
    this.goose.startAnimation();
    this.setNewTarget();
    this.moveToTarget();
  }

  update() {
    
  }

  exit() {
    this.goose.stopAnimation();
    this.stopMoving();
  }
}

