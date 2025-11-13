class Target {
    constructor(goose) {
        this.position = {
            x: goose.position.x,
            y: goose.position.y
        };
        this.goose = goose;
    }

    update() {
        // sync to goose's current target position
        if (this.goose.currentState) {
            this.position.x = this.goose.currentState.targetPos.x;
            this.position.y = this.goose.currentState.targetPos.y;
        }
    }

    draw() {
        Animator.drawStaticSprite(
            this.position.x - Target.FRAME_SIZE / 2, 
            this.position.y - Target.FRAME_SIZE / 2,
            Target.SPRITESHEET,
            Target.FRAME_SIZE, 
            Target.SCALE
        );
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/entities/target.png";
    }

    static get SCALE() {
        return 2;
    }

    static get FRAME_SIZE() {
        return 11;
    }
}