class Shadow {
    constructor(goose) {
        this.xOffset = -5;
        this.yOffset = 29;

        this.heightIsFrozen = false;

        this.position = {
            x: goose.position.x + this.xOffset,
            y: goose.position.y + this.yOffset
        };
        this.goose = goose;
    }

    update() {
        if (this.goose.currentAnimation === Goose.ANIMATIONS.RUNNING ||
            this.goose.currentAnimation === Goose.ANIMATIONS.DANCING ||
            this.goose.currentAnimation === Goose.ANIMATIONS.DRAGGING ||
            this.goose.currentAnimation === Goose.ANIMATIONS.BITING ||
            this.goose.currentAnimation === Goose.ANIMATIONS.BONKING
        ) {
            this.xOffset = -10;
        } else {
            this.xOffset = -5;
        }
        // sync to goose's position
        if (!this.heightIsFrozen) {
            this.position.y = this.goose.position.y + this.yOffset;
        }
        this.position.x = this.goose.facing === "right" ? this.goose.position.x + this.xOffset : this.goose.position.x - this.xOffset;
    }

    draw() {
        if (!this.hidden) {
            Animator.drawStaticSprite(this.position.x, this.position.y, Shadow.SPRITESHEET, Shadow.FRAME_SIZE, Shadow.SCALE);
        }
    }

    freezeHeight() {
        this.heightIsFrozen = true;
    }

    unfreezeHeight() {
        this.heightIsFrozen = false;
    }

    hide() {
        this.hidden = true;
    }

    show() {
        this.hidden = false;
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/entities/shadow.png";
    }

    static get SCALE() {
        return 2;
    }

    static get FRAME_SIZE() {
        return 32;
    }

}