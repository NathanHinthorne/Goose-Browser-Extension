
class Hat {
    constructor(goose, hatType = 0) {
        this.goose = goose;
        this.hatType = hatType; // Which hat from the spritesheet (0-based index)
        
        this.position = {
            x: goose.position.x,
            y: goose.position.y
        };
        
        this.visible = true;
    }
    
    update() {
        const headPos = this.goose.getHeadPosition();
        this.position.x = headPos.x;
        this.position.y = headPos.y + 2; // slight offset above head
    }
    
    draw() {
        if (this.visible) {
            Animator.drawStaticSprite(
                this.position.x, 
                this.position.y, 
                Hat.SPRITESHEET, 
                Hat.FRAME_SIZE, 
                Hat.SCALE, 
                0, // no rotation
                this.hatType, // row/frame index
                this.goose.facing
            );
        }
    }
    
    show() {
        this.visible = true;
    }
    
    hide() {
        this.visible = false;
    }
    
    setHatType(hatType) {
        this.hatType = hatType;

        if (this.hatType !== Hat.HAT_TYPES.NONE) {
            ENGINE.addEntity(new TextBox(Goose.instance, TextBox.RANDOM_NEW_HAT_TEXT), GameEngine.DEPTH.FOREGROUND);
        } else {
            ENGINE.addEntity(new TextBox(Goose.instance, "BORING!"), GameEngine.DEPTH.FOREGROUND);
        }
    }
    
    kill() {
        this.removeFromCanvas = true;
    }
    
    static get SPRITESHEET() {
        return "/images/entities/hats.png";
    }
    
    static get SCALE() {
        return 1.8;
    }
    
    static get FRAME_SIZE() {
        return {
            width: 20,
            height: 20
        };
    }

    static get HAT_TYPES() {
        return {
            NONE: 0,
            SANTA: 1,
            IRISH: 2,
            TOP_HAT: 3,
            BEACH: 4,
            PIRATE: 5,
            COWBOY: 6,
            FEDORA: 7,
            FANCY_PINK: 8,
            WIZARD: 9,
            GRADUATION: 10,
            CROWN: 11,
            POLICE: 12,
            U_WASHINGTON: 13,
            JESTER: 14,
        };
    }
}

