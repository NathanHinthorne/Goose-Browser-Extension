class Egg {
    constructor(eggX, eggY, numChildren, parentGoose) {
        // Position offsets initial coords
        this.yOffset = 20;

        this.position = {
            x: eggX,
            y: eggY + this.yOffset
        };

        this.isWiggling = false;
        this.isHatching = false;

        this.wiggleDuration = 4;
        this.wiggleTime = 0;

        this.idleAnimation = new Animator(
            0,                          // row
            Egg.SPRITESHEET,            // spritesheet path
            Egg.FRAME_SIZE,             // frame dimensions
            Egg.SCALE,                  // scale
            1,                          // frame count
            1,                          // frame duration in seconds
            true                        // looped
        );

        this.wiggleAnimation = new Animator(
            0,                          // row
            Egg.SPRITESHEET,            // spritesheet path
            Egg.FRAME_SIZE,             // frame dimensions
            Egg.SCALE,                  // scale
            5,                          // frame count
            0.8,                        // frame duration in seconds
            true                        // looped
        );
        
        this.hatchingAnimation = new Animator(
            1,                          // row
            Egg.SPRITESHEET,            // spritesheet path
            Egg.FRAME_SIZE,             // frame dimensions
            Egg.SCALE,                  // scale
            8,                          // frame count
            1,                          // frame duration in seconds
            false                       // looped
        );

        // Set up callback for when end animation completes
        this.hatchingAnimation.setOnComplete(() => {
            this.kill();
            ENGINE.addEntity(new Gosling(this.position.x, this.position.y - 20, numChildren, parentGoose));
        });
    }

    hatch() {
        this.isWiggling = true;
    }

    update() {
        if (this.isWiggling) {
            this.wiggleTime += ENGINE.clockTick;
        }
        if (this.isWiggling && this.wiggleTime >= this.wiggleDuration) {
            this.isWiggling = false;
            this.isHatching = true;
            ASSET_MGR.playAudio(Egg.SFX.CRACK);
        }
    }

    draw() {
        if (this.isHatching) {
            this.hatchingAnimation.drawFrame(this.position.x, this.position.y);

        } else if (this.isWiggling) {
            this.wiggleAnimation.drawFrame(this.position.x, this.position.y);

        } else {
            this.idleAnimation.drawFrame(this.position.x, this.position.y);
        }
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/sprites/egg.png";
    }

    static get SFX() {
        return {
            CRACK: "/audio/egg-crack.mp3",
        };
    }

    static get SCALE() {
        return 2;
    }

    static get FRAME_SIZE() {
        return {
            width: 16,
            height: 16
        };
    }
}