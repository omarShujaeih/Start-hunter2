"use strict";


class AssetLoader {
  constructor() {
    this.images = {};
    this.sounds = {};
  }

  /**
   * Load multiple images in batch
   * @param {Object} imageMap 
   * @returns {Promise}
   */
  loadImages(imageMap) {
    return new Promise((resolve, reject) => {
      const imageNames = Object.keys(imageMap);
      let loadedCount = 0;

      if (imageNames.length === 0) {
        resolve();
        return;
      }

      imageNames.forEach(name => {
        const img = new Image();
        
        img.onload = () => {
          loadedCount++;
          this.images[name] = img;
          if (loadedCount === imageNames.length) {
            resolve();
          }
        };

        img.onerror = () => {
          console.warn(`Failed to load image: ${name} from ${imageMap[name]}`);
          loadedCount++;
          this.images[name] = img; 
          if (loadedCount === imageNames.length) {
            resolve();
          }
        };

        img.src = imageMap[name];
      });
    });
  }

  /**
   * Load multiple sounds in batch
   * @param {Object} soundMap 
   * @returns {Promise} 
   */
  loadSounds(soundMap) {
    return new Promise((resolve) => {
      const soundNames = Object.keys(soundMap);

      if (soundNames.length === 0) {
        resolve();
        return;
      }

      soundNames.forEach(name => {
        const audio = new Audio();
        audio.src = soundMap[name];
        this.sounds[name] = audio;
      });

      resolve();
    });
  }

  /**
   * Load image asset (legacy single method)
   * @param {string} name - Asset name
   * @param {string} src - Image source path
   * @returns {Image}
   */
  loadImage(name, src) {
    const img = new Image();
    img.src = src;
    this.images[name] = img;
    return img;
  }

  /**
   * 
   * @param {string} name 
   * @returns {Image|null}
   */
  getImage(name) {
    return this.images[name] || null;
  }

  /**
   * 
   * 
   * @param {string} name 
   * @param {string} src 
   * @returns {Audio}
   */
  loadSound(name, src) {
    const audio = new Audio(src);
    this.sounds[name] = audio;
    return audio;
  }

  /**
   * Get a loaded sound
   * @param {string} name 
   * @returns {Audio|null}
   */
  getSound(name) {
    return this.sounds[name] || null;
  }

  /**
   * 
   *
   * @param {string} name 
   * @param {number} volume 
   */
  playSound(name, volume = 0.4) {
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    try {
      sound.currentTime = 0;
      sound.volume = Math.max(0, Math.min(1, volume)); 
      const playPromise = sound.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Could not play sound "${name}":`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound "${name}":`, error);
    }
  }

  /**
   * Stop a sound
   * @param {string} name 
   */
  stopSound(name) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  /**
   *
   * @returns {boolean}
   */
  allImagesLoaded() {
    return Object.values(this.images).every(img => img && img.complete);
  }

  /**
   * 
   * @returns {string[]}
   */
  getLoadedImages() {
    return Object.keys(this.images);
  }

  /**
   * 
   * @returns {string[]}
   */
  getLoadedSounds() {
    return Object.keys(this.sounds);
  }
}
