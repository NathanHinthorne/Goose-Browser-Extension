class Bat {
    constructor(goose) {
        // Position offsets initial coords
        this.yOffset = -20;

        this.position = {
            x: goose.position.x,
            y: goose.position.y + this.yOffset
        };

        this.idleAnimation = new Animator(
            0,                          // row
            Bat.SPRITESHEET,            // spritesheet path
            Bat.FRAME_SIZE,             // frame dimensions
            Bat.SCALE,                  // scale
            1,                          // frame count
            1,                          // frame duration in seconds
            true                        // looped
        );

        this.whackAnimation = new Animator(
            1,                          // row
            Bat.SPRITESHEET,            // spritesheet path
            Bat.FRAME_SIZE,             // frame dimensions
            Bat.SCALE,                  // scale
            3,                          // frame count
            0.1,                        // frame duration in seconds
            false                       // looped
        );

        this.currentAnimation = this.idleAnimation;

        this.whackAnimation.setOnComplete(() => {
            console.log("this bat object: ", this);
            this.currentAnimation = this.idleAnimation;
        });
    }

    whack() {
        ASSET_MGR.playAudio(Bat.SFX.BONK);
        this.currentAnimation = this.whackAnimation;
    }

    update() {
        this.position.x = Goose.instance.position.x;
        this.position.y = Goose.instance.position.y + this.yOffset;
    }

    draw() {
        this.currentAnimation.drawFrame(this.position.x, this.position.y);
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/sprites/baseball-bat.png";
    }

    static get SFX() {
        return {
            BONK: "/audio/bonk-doge.mp3",
        };
    }

    static get SCALE() {
        return 3;
    }

    static get FRAME_SIZE() {
        return {
            width: 16,
            height: 16
        };
    }
}