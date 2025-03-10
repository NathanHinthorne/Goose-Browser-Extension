class AngrySymbol {
    constructor(goose) {
        this.goose = goose;
        
        // Position offsets from goose
        this.xOffset = this.goose.facing === "left" ? -20 : 20;
        this.yOffset = -20;
        
        this.position = {
            x: goose.position.x + this.xOffset,
            y: goose.position.y + this.yOffset
        };
        
        this.aliveDuration = 0.8;
        this.aliveTime = 0;

        // Create angry symbol animation
        this.animation = new Animator(
            0,                      // row
            AngrySymbol.SPRITESHEET,// spritesheet path
            AngrySymbol.FRAME_SIZE, // frame size
            AngrySymbol.SCALE,      // scale
            2,                      // frame count
            0.3,                    // frame duration in seconds
            true                    // looped
        );
    }

    update() {
        
        // Sync position to goose
        this.xOffset = this.goose.facing === "left" ? -20 : 20;
        this.position.x = this.goose.position.x + this.xOffset;
        this.position.y = this.goose.position.y + this.yOffset;


        // Update alive time
        this.aliveTime += ENGINE.clockTick;

        if (this.aliveTime >= this.aliveDuration) {
            this.kill();
        }
    }

    kill() {
        this.removeFromCanvas = true;
    }

    draw() {
        this.animation.drawFrame(this.position.x, this.position.y);
    }

    static get SPRITESHEET() {
        return "/images/sprites/angry-symbol2.png";
    }

    static get SCALE() {
        return 2;
    }

    static get FRAME_SIZE() {
        return 8;
    }
}