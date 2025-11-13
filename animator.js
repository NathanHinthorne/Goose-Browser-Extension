/**
 * This class is for animating a spritesheet.
 * An Animator is responsible for only ONE of the sprites Animations (i.e. jumping up, walking right, etc.),
 * therefore many sprites will have several Animators.
 * @author Chris Marriott, Nathan Hinthorne
 */
class Animator {

    /**
     * @param {number} row The row of the spritesheet that this specific Animator instance is going to be working with.
     * @param {string} spritesheet The path to the spritesheet that this specific Animator instance is going to be working with.
     * @param {{width: number, height: number}} frameSize The size in pixels of the sprites in this animation.
     * @param {number} scale The scale of the image when it is drawn on the canvas.
     * @param {number} frameCount The number of frames that are included in this animation.
     * @param {number} frameDuration The amount of time (in SECONDS!) between each change in frame.
     * @param {boolean} looped Whether or not the animation should be looped
     */
    constructor(row, spritesheet, frameSize, scale, frameCount, frameDuration, looped = true) {
        /** The row of the spritesheet that this specific Animator instance is going to be working with. */
        this.row = row;
        /** The path to the spritesheet that this specific Animator instance is going to be working with. */
        this.spritesheet = spritesheet;
        /** The size in pixels of the sprites in this animation. */
        if (typeof frameSize === "number") {
            this.frameSize = { width: frameSize, height: frameSize };
        } else {
            this.frameSize = frameSize;
        }
        /** The number of frames that are included in this animation. */
        this.frameCount = frameCount;
        /** The amount of time (in SECONDS!) between each change in frame. */
        this.frameDuration = frameDuration;
        /** The amount of time which has elapsed since animation started. */
        this.elapsedTime = 0;
        /** The total amount of time that it takes to finish a single runthrough of an animation (no repeats!). */
        this.totalTime = frameCount * frameDuration;
        /** The frame the animator is currently displaying */
        this.currentFrame = 0;
        this.looped = looped;

        this.hasFinished = false;

        this.displaySize = {
            width: this.frameSize.width * scale,
            height: this.frameSize.height * scale
        };

        this.onComplete = null;

        if (this.spritesheet == null) {
            console.error("Animator given invalid spritesheet: " + this.spritesheet);
        }
    };

    /**
     * This method is going to draw the appropriate frame on the Canvas (to which ctx belongs to).
     * @param {number} canvasX The x position at which we'd like our sprite to be drawn.
     * @param {number} canvasY The y position at which we'd like our sprite to be drawn.
     * @param {string} facing The direction in which the sprite is facing. Can be "right" or "left".
     */
    drawFrame(canvasX, canvasY, facing) {
        if (ENGINE.running) {
            this.elapsedTime += ENGINE.clockTick;
        }

        if (this.elapsedTime > this.totalTime) {
            // The animation has completed
            if (this.looped) {
                this.elapsedTime -= this.totalTime;
                this.currentFrame = 0; // Reset current frame at the start of the loop
            } else {
                this.currentFrame = this.frameCount - 1; // Set current frame to the last frame
                if (!this.hasFinished) {
                    if (this.onComplete) {
                        this.onComplete();
                    }
                    this.hasFinished = true;
                }
            }

        } else {
            // The animation is still running
            this.currentFrame = Math.floor(this.elapsedTime / this.frameDuration);
        }

        const spritesheetX = this.currentFrame * this.frameSize.width; // X position of the frame in the spritesheet
        const spritesheetY = this.row * this.frameSize.height; // Y position of the frame in the spritesheet

        const centeredCanvasX = canvasX - this.displaySize.width / 2;
        const centeredCanvasY = canvasY - this.displaySize.height / 2;

        if (ASSET_MGR.getAsset(this.spritesheet) == null) {
            console.error("Spritesheet not found in ASSET_MGR: " + this.spritesheet);
            return;
        }

        // Save the current context state (before potential flip)
        CTX.save();

        if (facing === "left") {
            // Translate to the center point, scale horizontally by -1 to flip, then translate back
            CTX.translate(canvasX, canvasY);
            CTX.scale(-1, 1);
            CTX.translate(-canvasX, -canvasY);
        }

        CTX.drawImage(
            ASSET_MGR.getAsset(this.spritesheet),
            spritesheetX, spritesheetY,
            this.frameSize.width, this.frameSize.height,
            centeredCanvasX, centeredCanvasY,
            this.displaySize.width, this.displaySize.height
        );
        
        // Restore the context to its original state (after potential flip)
        CTX.restore();
    };

    /**
     * Sets the callback function to be executed when a non-looping animation completes
     * @param {Function} callback The function to be called when animation completes
     */
    setOnComplete(callback) {
        // chain the callback with a call to resetAnimation() at the end
        this.onComplete = () => {
            callback();
            this.resetAnimation();
        }
    }

    /**
     * Used to reset a one-time animation to the beginning.
     */
    resetAnimation() {
        this.elapsedTime = 0;
        this.currentFrame = 0;
        this.hasFinished = false;
    }

    /**
     * 
     * @param {canvasX} canvasX The x position at which we'd like our sprite to be drawn.
     * @param {canvasY} canvasY The y position at which we'd like our sprite to be drawn.
     * @param {spritesheet} spritesheet The path to the spritesheet that this specific Animator instance is going to be working with.
     * @param {{width: number, height: number}} frameSize The size in pixels of the sprites in this animation.
     * @param {number} scale The scale of the image when it is drawn on the canvas.
     * @param {number} rotation The rotation of the sprite in radians.
     * @param {number} frameIndex The index of the frame to draw. (Assumes single column of frames in the spritesheet)
     */
    static drawStaticSprite(canvasX, canvasY, spritesheet, frameSize, scale, rotation = 0, frameIndex = 0, facing = "right") {
        if (typeof frameSize === "number") {
            frameSize = { width: frameSize, height: frameSize };
        }
        const displaySize = {
            width: frameSize.width * scale,
            height: frameSize.height * scale
        }
        const centeredCanvasX = canvasX - displaySize.width / 2;
        const centeredCanvasY = canvasY - displaySize.height / 2;

        CTX.save();

        if (rotation !== 0) {
            CTX.translate(canvasX, canvasY);
            CTX.rotate(rotation);
            CTX.translate(-canvasX, -canvasY);
        }

        if (facing === "left") {
            CTX.translate(canvasX, canvasY);
            CTX.scale(-1, 1);
            CTX.translate(-canvasX, -canvasY);
        }

        CTX.drawImage(
            ASSET_MGR.getAsset(spritesheet),
            0, frameIndex * frameSize.height, // x, y of the frame in the spritesheet
            frameSize.width, frameSize.height,
            centeredCanvasX, centeredCanvasY,
            displaySize.width, displaySize.height
        );

        CTX.restore();
    }
};

