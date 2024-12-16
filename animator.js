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
     * @param {number} frameSize The size in pixels of the sprites in this animation.
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
        this.frameSize = frameSize;
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

        this.displaySize = this.frameSize * scale; // Scaled size

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
                this.currentFrame = this.frameCount - 1; // Set current frame to the last frame if not looping
            }
        } else {
            // The animation is still running
            this.currentFrame = Math.floor(this.elapsedTime / this.frameDuration);
        }

        const spritesheetX = this.currentFrame * this.frameSize; // X position of the frame in the spritesheet
        const spritesheetY = this.row * this.frameSize; // Y position of the frame in the spritesheet

        const centeredCanvasX = canvasX - this.displaySize / 2;
        const centeredCanvasY = canvasY - this.displaySize / 2;

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

        CTX.drawImage(ASSET_MGR.getAsset(this.spritesheet),
            spritesheetX, spritesheetY,
            this.frameSize, this.frameSize,
            centeredCanvasX, centeredCanvasY,
            this.displaySize, this.displaySize);
        
        // Restore the context to its original state (after potential flip)
        CTX.restore();
    };

    /**
     * @returns True if this animation has been completed; else false.
     */
    isDone() {
        return this.elapsedTime >= this.totalTime;
    };
};