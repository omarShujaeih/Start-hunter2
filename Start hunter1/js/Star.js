"use strict";

class Star {
  constructor(canvasWidth, canvasHeight) {
    this.canvasHeight = canvasHeight;
    this.w = 28;
    this.h = 28;
    this.fallSpeed = 180;
    this.active = false;
    this.x = 0;
    this.y = 0;
  }

  spawn(xTarget) {
    this.x = xTarget - this.w / 2;
    this.y = -this.h;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return "none";

    this.y += this.fallSpeed * dt;

    if (this.y > this.canvasHeight) {
      this.active = false;
      return "missed";
    }
    return "none";
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.shadowColor = "rgba(255,215,0,0.65)";
    ctx.shadowBlur = 20;

    ctx.fillStyle = "#FFD700";
    Utils.roundRect(ctx, this.x, this.y, this.w, this.h, 9);
    ctx.fill();

    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ffffff";
    Utils.roundRect(ctx, this.x + 6, this.y + 6, this.w - 12, 7, 7);
    ctx.fill();

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
