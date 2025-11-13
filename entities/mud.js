class Mud {
    constructor(mudX, mudY) {
        // Position offsets initial coords
        this.xOffset = 0;
        this.yOffset = 28;

        this.position = {
            x: mudX + this.xOffset,
            y: mudY + this.yOffset
        };
        
        this.hasGoose = false;
        
        // Create Mud animations - 3 frames each
        this.emptyAnimation = new Animator(
            0,                          // row
            Mud.SPRITESHEET,         // spritesheet path
            Mud.FRAME_SIZE,          // frame dimensions
            Mud.SCALE,               // scale
            1,                          // frame count
            0.4,                        // frame duration in seconds
            true                        // looped
        );

        this.withGooseAnimation = new Animator(
            1,                          // row (second row of spritesheet)
            Mud.SPRITESHEET,         // spritesheet path
            Mud.FRAME_SIZE,          // frame dimensions
            Mud.SCALE,               // scale
            3,                          // frame count
            0.4,                        // frame duration in seconds
            true                        // looped
        );

        this.currentAnimation = this.emptyAnimation;
    }

    update() {
    }

    draw() {
        this.currentAnimation.drawFrame(this.position.x, this.position.y);
    }

    addGoose() {
        this.hasGoose = true;
        this.currentAnimation = this.withGooseAnimation;
        ASSET_MGR.playAudio(Mud.SFX.SPLAT);
    }

    removeGoose() {
        this.hasGoose = false;
        this.currentAnimation = this.emptyAnimation;
    }

    kill() {
        this.removeFromCanvas = true;
    }

  static get SPRITESHEET() {
    return "/images/entities/mud.png";
  }

  static get SCALE() {
    return 2;
  }

  static get FRAME_SIZE() {
    return {
      width: 32,
      height: 16
    };
  }

  static get SFX() {
    return {
      SPLAT: "/audio/splat.mp3"
    };
  }
}