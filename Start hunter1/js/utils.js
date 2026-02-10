"use strict";

const Utils = {
  clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  },

  rectsIntersect(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  },

  roundRect(ctx, x, y, w, h, r = 12) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  },

  drawShadowedPanel(ctx, x, y, w, h, r = 14, alpha = 0.35) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = `rgba(20,20,25,${alpha})`;
    Utils.roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.restore();
  }
};
