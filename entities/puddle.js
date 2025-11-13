class Puddle {
    constructor(puddleX, puddleY) {
        // Position offsets initial coords
        this.xOffset = 0;
        this.yOffset = 28;

        this.position = {
            x: puddleX + this.xOffset,
            y: puddleY + this.yOffset
        };
        
        this.hasGoose = false;
        
        // Create puddle animations - 3 frames each
        this.emptyAnimation = new Animator(
            0,                          // row
            Puddle.SPRITESHEET,         // spritesheet path
            Puddle.FRAME_SIZE,          // frame dimensions
            Puddle.SCALE,               // scale
            1,                          // frame count
            0.4,                        // frame duration in seconds
            true                        // looped
        );

        this.withGooseAnimation = new Animator(
            1,                          // row (second row of spritesheet)
            Puddle.SPRITESHEET,         // spritesheet path
            Puddle.FRAME_SIZE,          // frame dimensions
            Puddle.SCALE,               // scale
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
        ASSET_MGR.playAudio(Puddle.SFX.SPLASH);
    }

    removeGoose() {
        this.hasGoose = false;
        this.currentAnimation = this.emptyAnimation;
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/entities/puddle.png";
    }

    static get SFX() {
        return {
            SPLASH: "/audio/splash.mp3"
        };
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
}