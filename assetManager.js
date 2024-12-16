/**
 * This class is used to manage Assets.
 * It will download the assets and store them (in its cache) for use by other classes.
 * @author Seth Ladd (original), Nathan Hinthorne (modified)
 */
class AssetManager {
    constructor() {
        /** How many filepaths have been successfully added to the cache as images. */
        this.successCount = 0;
        /** How many filepaths could not be added to the cache as images. */
        this.errorCount = 0;
        /** An associative array of downloaded assets. [filePath => img]. */
        this.downloadQueue = [];
        /** An indexed array of filepaths which still need to be downloaded. */
        this.cache = [];
    };

    /**
     * This method simply adds a filepath to the downloadQueue.
     */
    queueDownload(path) {
        // console.log("Queueing " + path);
        this.downloadQueue.push(path);
    };

    /**
     * @returns true if the AssetManager has put (or attempted to put) every Asset into the cache. 
     */
    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    };

    /**
     * This method is going to take all paths from the downloadQueue and actually download them into images or audio, which will be stored in
     * the cache. It updates successCount and errorCount appropriately as well.
     * @param {function} callback The function to be run AFTER downloadAll has finished executing.
     */
    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {

            const path = this.downloadQueue[i];

            // make sure the path is a string
            if (typeof path !== 'string') {
                console.error("Error loading " + path + ": not a string");
            }

            const ext = path.substring(path.length - 3);

            switch (ext) {
                case 'jpg':
                case 'png':
                    const img = new Image();
                    img.addEventListener("load", () => {
                        // console.log("Loaded " + path);
                        this.successCount++;
                        if (this.isDone()) callback();
                    });

                    img.addEventListener("error", () => {
                        console.error("Error loading " + path);
                        this.errorCount++;
                        if (this.isDone()) callback();
                    });

                    img.src = path;
                    this.cache[path] = img;
                    break;

                case 'mp3':
                case 'wav':
                    const audio = new Audio();
                    audio.addEventListener("loadeddata", () => {
                        // console.log("Loaded " + path);
                        this.successCount++;
                        if (this.isDone()) callback();
                    });

                    audio.addEventListener("error", () => {
                        console.error("Error loading " + path);
                        this.errorCount++;
                        if (this.isDone()) callback();
                    });

                    audio.addEventListener("ended", () => {
                        audio.pause();
                        audio.currentTime = 0;
                    });

                    audio.src = path;
                    audio.load();

                    this.cache[path] = audio;
                    break;

                default:
                    console.error("Error loading " + path + ": unknown file extension");
                    this.errorCount++;
                    if (this.isDone()) callback();
            }
        }
    };

    /**
     * @param {string} path The filepath of the Asset you are trying to access.
     * @returns The image associated with the path in the cache (given that it has been successfully downloaded).
     */
    getAsset(path) {
        return this.cache[path];
    };

    /**
     * Plays the audio associated with the given path.
     * @param {string} path The filepath of the audio you are trying to play.
     * @param {number} volume The volume to which you want to set the audio.
     */
    playSFX(path, volume) {
        const audio = this.cache[path];
        audio.currentTime = 0;
        audio.volume = volume;

        audio.play();
    };

    /**
     * Stops all audio currently playing.
     */
    stopAudio() {
        for (let key in this.cache) {
            const audio = this.cache[key];
            if (audio instanceof Audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
    };

    /** 
     * Sets the volume of all audio in the cache to the given volume.
     * @param {number} volume The volume to which you want to set the audio.
     */
    adjustVolume(volume) {
        for (let key in this.cache) {
            const audio = this.cache[key];
            if (audio instanceof Audio) {
                audio.volume = volume;
            }
        }
    };
};
