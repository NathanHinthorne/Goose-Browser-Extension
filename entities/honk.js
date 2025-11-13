class Honk {
    constructor(goose) {
        this.position = {
            x: goose.position.x,
            y: goose.position.y
        };

        this.xOffset = 20;
        this.yOffset = 20;
        
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
        const headPos = this.goose.getHeadPosition();
        this.position.x = headPos.x + (this.goose.facing === "right" ? this.xOffset : -this.xOffset);
        this.position.y = headPos.y + this.yOffset;
    }

    draw() {
        this.animation.drawFrame(this.position.x, this.position.y, this.goose.facing);
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/entities/honk.png";
    }

    static get SCALE() {
        return 2;
    }

    static get FRAME_SIZE() {
        return 16;
    }
}