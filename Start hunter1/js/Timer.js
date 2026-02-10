"use strict";

class Timer {
  constructor(thinkingSeconds) {
    this.reset(thinkingSeconds);
  }

  reset(seconds) {
    this.thinkingTime = seconds;
    this.elapsed = 0;
    this.penaltyTick = 0;
  }

  update(dt) {
    this.elapsed += dt;

    if (this.elapsed < this.thinkingTime) {
      return { thinking: true, penalty: false };
    }

    this.penaltyTick += dt;
    if (this.penaltyTick >= 1) {
      this.penaltyTick = 0;
      return { thinking: false, penalty: true };
    }

    return { thinking: false, penalty: false };
  }

  remaining() {
    return Math.max(0, this.thinkingTime - this.elapsed).toFixed(1);
  }

  isThinking() {
    return this.elapsed < this.thinkingTime;
  }
}
