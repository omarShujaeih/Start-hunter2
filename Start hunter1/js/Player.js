"use strict";

class Player {
  constructor(canvasWidth, canvasHeight) {
    this.w = 70;
    this.h = 22;
    this.x = canvasWidth / 2 - this.w / 2;
    this.y = canvasHeight - 62;
    this.speed = 340;
    this.frozen = false;
  }

  update(dt, canvasWidth) {
    if (this.frozen) return;

    let dir = 0;
    if (Input.isDown("ArrowLeft") || Input.isDown("a") || Input.isDown("A")) dir -= 1;
    if (Input.isDown("ArrowRight") || Input.isDown("d") || Input.isDown("D")) dir += 1;

    this.x += dir * this.speed * dt;
    this.x = Utils.clamp(this.x, 0, canvasWidth - this.w);
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = this.frozen ? "rgba(180,180,180,0.25)" : "rgba(0,170,255,0.45)";
    ctx.shadowBlur = 14;

    ctx.fillStyle = this.frozen ? "#7a7a7a" : "#00aaff";
    Utils.roundRect(ctx, this.x, this.y, this.w, this.h, 12);
    ctx.fill();

    // highlight
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ffffff";
    Utils.roundRect(ctx, this.x + 8, this.y + 4, this.w - 16, 6, 6);
    ctx.fill();

    ctx.restore();
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}
