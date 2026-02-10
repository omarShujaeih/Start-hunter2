"use strict";

const Input = {
  keys: {},
  mouseClicked: false,
  mouseX: 0,
  mouseY: 0,

  init(canvas) {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.mouseClicked = true;
    });
  },

  isDown(key) {
    return !!this.keys[key];
  },

  consumeClick() {
    const was = this.mouseClicked;
    this.mouseClicked = false;
    return was;
  }
};
