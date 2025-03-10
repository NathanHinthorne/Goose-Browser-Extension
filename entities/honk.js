class Honk {
    constructor(goose) {
        // Position offsets from goose
        this.xOffsetHighNeck = 32;
        this.yOffsetHighNeck = -10;
        this.xOffsetLowNeck = 40;
        this.yOffsetLowNeck = 2;

        this.position = {
            x: goose.position.x + this.xOffset,
            y: goose.position.y + this.yOffsetHigh
        };
        
        this.goose = goose;
        
        // Create honk animation
        this.animation = new Animator(
            0,                  // row
            Honk.SPRITESHEET,   // spritesheet path
            Honk.FRAME_SIZE,    // frame size
            Honk.SCALE,         // scale
            3,                  // frame count
            0.12,               // frame duration in seconds
            false               // not looped
        );

        // Set up callback for when animation completes
        this.animation.setOnComplete(() => {
            this.kill();
        });
    }

    update() {
        // Sync position to goose, adjusting xOffset based on facing direction
        if (this.goose.isBendingDown) {
            if (this.goose.facing === "right") {
                this.position.x = this.goose.position.x + this.xOffsetLowNeck;
            } else {
                this.position.x = this.goose.position.x - this.xOffsetLowNeck;
            }
            this.position.y = this.goose.position.y + this.yOffsetLowNeck;
        } else {
            if (this.goose.facing === "right") {
                this.position.x = this.goose.position.x + this.xOffsetHighNeck;
            } else {
                this.position.x = this.goose.position.x - this.xOffsetHighNeck;
            }
            this.position.y = this.goose.position.y + this.yOffsetHighNeck;
        }
    }

    draw() {
        this.animation.drawFrame(this.position.x, this.position.y, this.goose.facing);
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/sprites/honk.png";
    }

    static get SCALE() {
        return 2;
    }

    static get FRAME_SIZE() {
        return 16;
    }
}