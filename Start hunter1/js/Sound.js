"use strict";

const Sound = {
  enabled: true,
  sounds: {},
  unlocked: false,

  load(name, src, volume = 0.6) {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.preload = "auto";
    this.sounds[name] = audio;
  },

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;

    Object.values(this.sounds).forEach(a => {
      try {
        a.muted = true;
        a.play().then(() => {
          a.pause();
          a.currentTime = 0;
          a.muted = false;
        }).catch(() => {
          a.muted = false;
        });
      } catch (e) {
        a.muted = false;
      }
    });
  },

  play(name) {
    if (!this.enabled) return;
    const a = this.sounds[name];
    if (!a) return;

    try {
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch (e) {}
  }
};
