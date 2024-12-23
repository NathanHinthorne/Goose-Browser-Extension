class Footprints {
    constructor(x, y, rotation) {
        this.xOffset = 0;
        this.yOffset = 32;
        this.position = {
            x: x + this.xOffset,
            y: y + this.yOffset
        };
        this.rotation = rotation;
    }

    update() {
        // Footprints do not need to update
    }

    draw() {
        Animator.drawStaticSprite(
            this.position.x,
            this.position.y,
            Footprints.SPRITESHEET,
            Footprints.FRAME_SIZE,
            Footprints.SCALE,
            this.rotation
        );
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/sprites/footprints.png";
    }

    static get SCALE() {
        return 2;
    }

    static get FRAME_SIZE() {
        return {
            width: 10,
            height: 10
        };
    }
}