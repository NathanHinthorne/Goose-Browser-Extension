/**
 * The Game Engine contains all entities, and puts them all through the update-render loop. It is also responsible for tracking user input.
 * @author Seth Ladd (original), Nathan Hinthorne (modified)
 */
class GameEngine {
    /**
     * This constructs a new GameEngine, initializing some necessary parameters.
     */
    constructor() {
        /** Everything that will be updated and drawn each frame. */
        this.entities = {
            background: [],
            midground: [],
            foreground: []
        };

        /** The timer tells you how long it's been since the last tick */
        this.timer = new Timer();

        /** How long has the game been running? */
        this.gameTime = 0;

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseClicked = false;
    };

    /**
     * This adds a new entity to the entities array.
     * @param {Object} entity The entity (sprite) that you want to add to the Game.
     * @param {number} zIndex negative for background, zero (default) for midground, positive for foreground.
     */
    addEntity(entity, zIndex = 0) {
        if (zIndex < 0) {
            this.entities.background.push(entity);
        } else if (zIndex > 0) {
            this.entities.foreground.push(entity);
        } else {
            this.entities.midground.push(entity);
        }

        // as a precaution from previous removals, ensure removeFromCanvas is false
        entity.removeFromCanvas = false;
    };

    /** This is going to clear all of the entities so that a new set can be placed in. */
    clearEntities() {
        this.entities = {
            background: [],
            midground: [],
            foreground: []
        };
    }

    /** Controls the update-render loop */
    start() {
        this.configureEventListeners();
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, CANVAS);
        };
        gameLoop();
    };

    /** This is the update-render loop. */
    loop() {
        this.clockTick = this.timer.tick();
        this.gameTime += this.clockTick;
        this.update();
        this.draw();
    };

    /**
     * This method is going to go through all entities and allow them to update their position.
     */
    update() {
        if (this.running) {
            // (1) Update the background entities:
            this.entities.background.forEach((entity) => {
                if (entity.removeFromCanvas) {
                    const i = this.entities.background.indexOf(entity);
                    this.entities.background.splice(i, 1);
                } else {
                    entity.update();
                }
            });

            // (2) Update the midground entities:
            this.entities.midground.forEach((entity) => {
                if (entity.removeFromCanvas) {
                    const i = this.entities.midground.indexOf(entity);
                    this.entities.midground.splice(i, 1);
                } else {
                    entity.update();
                }
            });

            // (3) Update the foreground entities:
            this.entities.foreground.forEach((entity) => {
                if (entity.removeFromCanvas) {
                    const i = this.entities.foreground.indexOf(entity);
                    this.entities.foreground.splice(i, 1);
                } else {
                    entity.update();
                }
            });
        }
    };

    /**
     * This method is going to clear the canvas and redraw ALL of the entities in their *new* positions.
     */
    draw() {
        CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);

        this.entities.background.forEach((entity) => { entity.draw(); });
        this.entities.midground.forEach((entity) => { entity.draw(); });
        this.entities.foreground.forEach((entity) => { entity.draw(); });
    };

    configureEventListeners() {
        console.log("Configuring event listeners");

        document.addEventListener("mousedown", (mouseEvent) => {
            this.mouseClicked = true;
        });

        document.addEventListener("mouseup", (mouseEvent) => {
            this.mouseClicked = false;
        });

        document.addEventListener("mousemove", (mouseEvent) => {
            const rect = CANVAS.getBoundingClientRect();
            const x = mouseEvent.clientX - rect.left;
            const y = mouseEvent.clientY - rect.top;

            this.mouseX = x;
            this.mouseY = y;

            // console.log(`Mouse move at canvas coordinates: (${x}, ${y})`);
        });
    }

    static get FPS() {
        return 60;
    }

    static get DEPTH() {
        return {
            BACKGROUND: -1,
            MIDGROUND: 0,
            FOREGROUND: 1
        }
    }
};

//! not being used yet
function checkWindowState() {
    // minimized vs maximized
    // document.visibilityState === 'visible'

    // active vs inactive
    // document.hasFocus()

    if (document.hasFocus()) {
        console.log('✅ Window is active');
    } else {
        console.log('⛔️ Window is inactive');
    }
}


/** Creates an alias for requestAnimationFrame for backwards compatibility. */
window.requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        /**
         * Compatibility for requesting animation frames in older browsers
         * @param {Function} callback Function
         * @param {DOM} element DOM ELEMENT
         */
        ((callback, element) => {
            window.setTimeout(callback, 1000 / GameEngine.FPS);
        });
})();