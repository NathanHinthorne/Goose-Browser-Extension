
class TextBox {
    constructor(goose, text, aliveTime = 3) {
        // Position offsets from goose
        this.xOffset = 50;
        this.yOffset = -64;

        this.position = {
            x: goose.position.x + this.xOffset,
            y: goose.position.y + this.yOffset
        };
        
        this.goose = goose;
        this.text = text;
        this.aliveTime = aliveTime;
        this.elapsedTime = 0;
        this.isClosing = false;

        // Precompute text drawing parameters
        this.padding = 8;
        this.maxWidth = (TextBox.FRAME_SIZE.width * TextBox.SCALE) - (2 * this.padding) - 40;
        this.lineHeight = 12; // Adjust as needed
        this.maxLines = 3;
        this.textY = this.position.y - TextBox.FRAME_SIZE.height * TextBox.SCALE / 4;
        this.textX = this.position.x - (TextBox.FRAME_SIZE.width * TextBox.SCALE / 2) + this.padding;

        // Precompute lines of text and handle overflow
        const { lines, overflowText } = this.computeLines(text);
        this.lines = lines;
        
        // Create popup animation
        this.openAnimation = new Animator(
            0,                          // row
            TextBox.SPRITESHEET,        // spritesheet path
            TextBox.FRAME_SIZE,   // frame width
            TextBox.SCALE,              // scale
            3,                          // frame count
            0.1,                        // frame duration in seconds
            false                       // not looped
        );

        // Create closing animation
        this.closeAnimation = new Animator(
            1,                          // row (second row)
            TextBox.SPRITESHEET,        
            TextBox.FRAME_SIZE,   
            TextBox.SCALE,              
            3,                          // frame count
            0.1,                        // frame duration
            false                       
        );

        // Set up callback for when close animation completes
        this.closeAnimation.setOnComplete(() => {
            if (overflowText) {
                const newTextBox = new TextBox(goose, overflowText, aliveTime);
                ENGINE.addEntity(newTextBox, GameEngine.DEPTH.FOREGROUND);
            }
            this.kill();
        });

        this.currentAnimation = this.openAnimation;
    }

    computeLines(text) {
        const words = text.split(' ');
        let line = '';
        const lines = [];
        let overflowText = '';

        // Distribute words across multiple lines
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = CTX.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > this.maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }

            // Check if we have reached the maximum number of lines
            if (lines.length === this.maxLines) {
                overflowText = words.slice(i).join(' ');
                break;
            }
        }

        if (lines.length < this.maxLines) {
            lines.push(line);
        }

        return { lines, overflowText };
    }

    update() {
        // Update lifetime
        this.elapsedTime += ENGINE.clockTick;

        // Check if it's time to start closing animation
        if (this.elapsedTime >= this.aliveTime && !this.isClosing) {
            this.isClosing = true;
            this.currentAnimation = this.closeAnimation;
        }

        // Sync position to goose, adjusting xOffset based on facing direction
        if (this.goose.facing === "right") {
            this.position.x = this.goose.position.x + this.xOffset;
        } else {
            this.position.x = this.goose.position.x - this.xOffset;
        }
        this.position.y = this.goose.position.y + this.yOffset;

        // Recompute text position
        this.textX = this.position.x - (TextBox.FRAME_SIZE.width * TextBox.SCALE / 2) + this.padding;
        this.textY = this.position.y - TextBox.FRAME_SIZE.height * TextBox.SCALE / 4;
    }

    draw() {
        this.currentAnimation.drawFrame(this.position.x, this.position.y, this.goose.facing);
        
        // Only draw text if we're not in the closing animation
        if (!this.isClosing) {
            // Draw text inside the bubble
            CTX.save();
            CTX.font = '10px "Silkscreen"';
            CTX.fillStyle = 'black';
            CTX.textAlign = 'left';
            CTX.textBaseline = 'middle';
            
            // Draw each line of text
            for (let i = 0; i < this.lines.length; i++) {
                CTX.fillText(this.lines[i], this.textX, this.textY + (i * this.lineHeight));
            }

            CTX.restore();
        }
    }

    kill() {
        this.removeFromCanvas = true;
    }

    static get SPRITESHEET() {
        return "/images/entities/textbox.png";
    }

    static get SCALE() {
        return 2;
    }

    static get FRAME_SIZE() {
        return {
            width: 64,
            height: 32
        };
    }

    static get RANDOM_WANDER_TEXT() {
        const texts = [
            "*Inhales* ... Honk!!",
            "I cause problems.",
            "Are you trying to get stuff done?               Not on my watch.",
            "Did you know I can dance?",
            "Whatcha doin'?",
            "I'm a menace to society.",
            "Doin' what geese do best.",
            "Look behind you.",
            "Acting like I'm not a trained killer.",
            "Roaming wherever I please.",
            "You don't have authority over me.",
            "Mess with the honk, you get the bonk!",
            "Don't pretend like I'm not here.",
            "Pay attention to me!",
            "I'm the boss around here.",
            "Hit me, I dare you!",
            "Your computer is my playground.",
            "You have no idea what I'm capable of.",
            "I successfully wasted your time.",
            "This goose is on the loose.",
            "HEY! I own this computer. Leave."
        ];

        return texts[Math.floor(Math.random() * texts.length)];
    }

    static get RANDOM_INITIAL_CHASE_TEXT() {
        const texts = [
            "Alright, now you're gonna get it!",
            "You're in trouble now!",
            "HEY! Watch it pal!",
            "You're gonna regret doing that...",
            "YOU DARE HIT ME?!",
            "Mess with the honk, you get the bonk!",
        ];

        return texts[Math.floor(Math.random() * texts.length)];
    }

    static get RANDOM_UPDATE_CHASE_TEXT() {
        const texts = [
            "You're not getting away this time!",
            "I'm coming for you!",
            "I'm on your tail!",
            "You can't run forever!",
            "I'm gaining on you!",
            "You can't hide from me!",
            "You can't shake me!",
            "I'm not done with you yet!",
            "I'm not giving up!",
        ];

        return texts[Math.floor(Math.random() * texts.length)];
    }

    static get RANDOM_NEW_HAT_TEXT() {
        const texts = [
            "Pretty snazzy, eh?",
            "I really like this one.",
            "I'm feeling fancy today.",
            "Not bad. Not bad at all.",
            "*Looks in the mirror*",
            "OH YEAH!",
            "Clearly the best hat.",
            "I look good. Really good.",
            "Looking sharp.",
            "A fine choice.",
            "Never been a finer goose than me.",
            "You like it?",
            "For once you made a good decision.",
            "I'm the best, aren't I?",
        ];

        return texts[Math.floor(Math.random() * texts.length)];
    }
}