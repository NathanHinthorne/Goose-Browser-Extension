class DiscoBall {
    constructor(ballX, ballY) {
        this.position = {
            x: ballX,
            y: ballY
        };
        
        this.animation = this.emptyAnimation = new Animator(
            0,                          // row
            DiscoBall.SPRITESHEET,      // spritesheet path
            DiscoBall.FRAME_SIZE,       // frame dimensions
            DiscoBall.SCALE,            // scale
            2,                          // frame count
            0.2,                        // frame duration in seconds
            true                        // looped
        );
    }

    start() {
        ASSET_MGR.playAudio(DiscoBall.SFX.DANCE, 0.7);
    }

    update() {
    }

    draw() {
        this.animation.drawFrame(this.position.x, this.position.y);
    }

    kill() {
        this.removeFromCanvas = true;
        ASSET_MGR.stopAudio();
    }

    static get SPRITESHEET() {
        return "/images/entities/disco-ball.png";
    }

    static get SFX() {
        return {
            DANCE: "/audio/distraction-dance.mp3"
        };
    }

    static get SCALE() {
        return 3;
    }

    static get FRAME_SIZE() {
        return {
            width: 16,
            height: 20
        };
    }
}