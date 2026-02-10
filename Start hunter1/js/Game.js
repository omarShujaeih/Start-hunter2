"use strict";

const Game = {
  canvas: null,
  ctx: null,

  player: null,
  star: null,
  equation: null,
  timer: null,

  score: 0,
  lives: 3,
  starDropped: false,

  state: "START", 
  spaceWasDown: false,

  bonusTriggered10: false,
  bannerText: "",
  bannerTime: 0,

  bgStars: [],

  sfx(name) {
    if (typeof Sound !== "undefined" && Sound && typeof Sound.play === "function") {
      Sound.play(name);
    }
  },

  buttonRectStart() { return { x: 310, y: 230, w: 180, h: 56 }; },
  buttonRectRestart() { return { x: 310, y: 300, w: 180, h: 56 }; },
  pointInRect(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  },

  drawButton(rect, text) {
    const hover = this.pointInRect(Input.mouseX, Input.mouseY, rect);

    this.ctx.save();
    this.ctx.shadowColor = hover ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.55)";
    this.ctx.shadowBlur = hover ? 18 : 12;
    this.ctx.shadowOffsetY = 6;

    this.ctx.fillStyle = hover ? "rgba(60,70,95,0.95)" : "rgba(35,40,60,0.90)";
    Utils.roundRect(this.ctx, rect.x, rect.y, rect.w, rect.h, 16);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = hover ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.35)";
    this.ctx.lineWidth = 2;
    Utils.roundRect(this.ctx, rect.x, rect.y, rect.w, rect.h, 16);
    this.ctx.stroke();

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "18px Arial";
    const tw = this.ctx.measureText(text).width;
    this.ctx.fillText(text, rect.x + (rect.w - tw) / 2, rect.y + 36);

    this.ctx.restore();
  },

  initBackground() {
    this.bgStars = Array.from({ length: 75 }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      s: Math.random() * 1.6 + 0.4,
      v: Math.random() * 22 + 10
    }));
  },

  updateBackground(dt) {
    for (const st of this.bgStars) {
      st.y += st.v * dt;
      if (st.y > this.canvas.height) {
        st.y = -6;
        st.x = Math.random() * this.canvas.width;
      }
    }
  },

  drawBackground() {
    const g = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    g.addColorStop(0, "#0b1330");
    g.addColorStop(1, "#05060a");
    this.ctx.fillStyle = g;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "rgba(255,255,255,0.65)";
    for (const st of this.bgStars) {
      this.ctx.fillRect(st.x, st.y, st.s, st.s);
    }
  },

  start() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    Input.init(this.canvas);
Sound.load("start", "assets/start.wav", 0.6);
Sound.load("pickup", "assets/pickup.wav", 0.6);
Sound.load("miss", "assets/miss.wav", 0.6);

    this.initBackground();

    this.resetGame();
    this.state = "START";

    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  },

  resetGame() {
    this.score = 0;
    this.lives = 3;
    Equation.level = 1;

    this.player = new Player(this.canvas.width, this.canvas.height);
    this.star = new Star(this.canvas.width, this.canvas.height);
    this.star.fallSpeed = 180;

    this.bonusTriggered10 = false;
    this.bannerText = "";
    this.bannerTime = 0;

    this.newQuestion();
  },

  newQuestion() {
    if (this.score >= 30) Equation.level = 2;

    this.equation = Equation.generate();
    this.timer = new Timer(5);

    this.starDropped = false;
    this.star.active = false;
    this.player.frozen = false;
  },

  retrySameQuestion() {
    this.timer.reset(5);
    this.starDropped = false;
    this.star.active = false;
    this.player.frozen = false;
  },

  answerToX(answer) {
    const cols = 10;
    const colW = this.canvas.width / cols;
    const col = ((answer % cols) + cols) % cols;
    return col * colW + colW / 2;
  },

  penaltyPerSecond() {
    return Equation.level === 1 ? 1 : 2;
  },

  triggerScore10Action() {
    this.bonusTriggered10 = true;
    this.star.fallSpeed += 60;
    this.score += 5;
    this.bannerText = "BONUS! +5 points & Faster Star!";
    this.bannerTime = 1.6;
  },

  loop(time) {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop.bind(this));
  },

  update(dt) {
if (Input.mouseClicked) {
  Sound.unlock();
}

    this.updateBackground(dt);
    if (this.bannerTime > 0) this.bannerTime -= dt;

    const spaceDown = Input.isDown(" ") || Input.isDown("Space") || Input.isDown("Spacebar");
    if (spaceDown && !this.spaceWasDown) {
      if (this.state === "PLAY") this.state = "PAUSE";
      else if (this.state === "PAUSE") this.state = "PLAY";
    }
    this.spaceWasDown = spaceDown;

    if (Input.isDown("r") || Input.isDown("R")) {
      this.resetGame();
      this.state = "START";
      return;
    }

    if (Input.consumeClick()) {
      const mx = Input.mouseX, my = Input.mouseY;

      if (this.state === "START" && this.pointInRect(mx, my, this.buttonRectStart())) {
        this.sfx("start");
        this.state = "PLAY";
      }

      if (this.pointInRect(mx, my, this.buttonRectRestart())) {
        this.sfx("start");
        this.resetGame();
        this.state = "START";
      }
    }

    if (this.state !== "PLAY") return;

    const t = this.timer.update(dt);

    if (t.thinking) {
      this.player.frozen = false;
      this.player.update(dt, this.canvas.width);
    } else {
      this.player.frozen = true;
    }

    if (!t.thinking && !this.starDropped) {
      const xTarget = this.answerToX(this.equation.answer);
      this.star.spawn(xTarget);
      this.starDropped = true;
    }

    if (t.penalty) {
      this.score -= this.penaltyPerSecond();
    }

    const status = this.star.update(dt);

    if (this.star.active && Utils.rectsIntersect(this.player.getBounds(), this.star.getBounds())) {
      this.star.active = false;
      this.score += 10;
      this.sfx("pickup");
Sound.play("pickup");

      if (!this.bonusTriggered10 && this.score >= 10) {
        this.triggerScore10Action();
      }

      this.newQuestion();
    }

    if (status === "missed") {
      this.lives -= 1;
      this.score -= 5;
      this.sfx("miss");
Sound.play("miss");

      if (this.lives > 0) this.retrySameQuestion();
    }

    if (this.score >= 100) this.state = "WIN";
    if (this.lives <= 0) this.state = "LOSE";
  },

  drawColumnIndex() {
    const cols = 10;
    const colW = this.canvas.width / cols;

    Utils.drawShadowedPanel(this.ctx, 12, 430, 776, 38, 16, 0.30);

    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "rgba(255,255,255,0.80)";

    for (let i = 0; i < cols; i++) {
      const x = i * colW + colW / 2;

      this.ctx.strokeStyle = "rgba(255,255,255,0.06)";
      this.ctx.beginPath();
      this.ctx.moveTo(i * colW, 0);
      this.ctx.lineTo(i * colW, this.canvas.height);
      this.ctx.stroke();

      this.ctx.fillText(i.toString(), x - 4, 456);
    }
  },

  drawTimerBar() {
    Utils.drawShadowedPanel(this.ctx, 12, 76, 776, 40, 16, 0.28);

    const x = 24, y = 90, w = 752, h = 14;

    this.ctx.fillStyle = "rgba(255,255,255,0.12)";
    Utils.roundRect(this.ctx, x, y, w, h, 10);
    this.ctx.fill();

    const remain = parseFloat(this.timer.remaining());
    const total = 5;
    const p = Math.max(0, Math.min(1, remain / total));
    const fillW = w * p;

    this.ctx.fillStyle = this.timer.isThinking() ? "rgba(124,252,0,0.85)" : "rgba(255,80,80,0.85)";
    Utils.roundRect(this.ctx, x, y, fillW, h, 10);
    this.ctx.fill();

    this.ctx.fillStyle = "rgba(255,255,255,0.9)";
    this.ctx.font = "14px Arial";
    if (this.timer.isThinking()) {
      this.ctx.fillText(`Thinking: ${this.timer.remaining()}s`, 28, 66);
    } else {
      this.ctx.fillText(`LOCKED! Star falling...`, 28, 66);
    }
  },

  drawTopHUD() {
    Utils.drawShadowedPanel(this.ctx, 12, 10, 776, 58, 16, 0.35);

    this.ctx.fillStyle = "#e8e8ff";
    this.ctx.font = "18px Arial";
    this.ctx.fillText(`Score: ${this.score}`, 28, 45);
    this.ctx.fillText(`Lives: ${this.lives}`, 160, 45);
    this.ctx.fillText(`Level: ${Equation.level}`, 290, 45);

    this.ctx.fillStyle = "rgba(255,255,255,0.75)";
    this.ctx.font = "14px Arial";
    this.ctx.fillText("SPACE: Pause/Resume   R: Restart", 510, 45);

    if (this.bannerTime > 0) {
      Utils.drawShadowedPanel(this.ctx, 12, 122, 776, 34, 14, 0.26);
      this.ctx.fillStyle = "#ffdf6a";
      this.ctx.font = "16px Arial";
      this.ctx.fillText(this.bannerText, 28, 145);
    }
  },

  drawEquationPanel() {
    Utils.drawShadowedPanel(this.ctx, 12, 164, 776, 70, 16, 0.28);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "28px Arial";
    this.ctx.fillText(`Solve: ${this.equation.text}`, 28, 210);

    this.ctx.fillStyle = "rgba(255,255,255,0.70)";
    this.ctx.font = "14px Arial";
    this.ctx.fillText("Use the answer to choose the column index (0-9) at the bottom.", 28, 232);
  },

  drawPauseOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = "rgba(0,0,0,0.65)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    Utils.drawShadowedPanel(this.ctx, 190, 165, 420, 170, 18, 0.45);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "48px Arial";
    this.ctx.fillText("PAUSED", 285, 240);

    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "rgba(255,255,255,0.85)";
    this.ctx.fillText("Press SPACE to Resume", 305, 270);

    this.ctx.restore();
  },

  draw() {
    this.drawBackground();
    this.drawTopHUD();

    // START
    if (this.state === "START") {
      Utils.drawShadowedPanel(this.ctx, 160, 135, 480, 220, 20, 0.38);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "44px Arial";
      this.ctx.fillText("Star Hunter", 265, 200);

      this.ctx.fillStyle = "rgba(255,255,255,0.80)";
      this.ctx.font = "16px Arial";
      this.ctx.fillText("Solve the equation, predict the column, move before lock.", 200, 230);

      this.drawButton(this.buttonRectStart(), "START");
      this.drawButton(this.buttonRectRestart(), "RESTART");

      this.drawColumnIndex();
      return;
    }

    if (this.state === "PAUSE") {
      this.drawEquationPanel();
      this.drawTimerBar();

      this.star.draw(this.ctx);
      this.player.draw(this.ctx);
      this.drawColumnIndex();

      this.drawPauseOverlay();
      return;
    }

    this.drawEquationPanel();
    this.drawTimerBar();

    this.star.draw(this.ctx);
    this.player.draw(this.ctx);
    this.drawColumnIndex();

    this.drawButton(this.buttonRectRestart(), "RESTART");

    if (this.state === "WIN") {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(0,0,0,0.55)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      Utils.drawShadowedPanel(this.ctx, 190, 165, 420, 170, 18, 0.45);
      this.ctx.fillStyle = "#00ff88";
      this.ctx.font = "48px Arial";
      this.ctx.fillText("YOU WIN!", 265, 240);
      this.ctx.restore();
    }

    if (this.state === "LOSE") {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(0,0,0,0.55)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      Utils.drawShadowedPanel(this.ctx, 170, 165, 460, 170, 18, 0.45);
      this.ctx.fillStyle = "#ff4444";
      this.ctx.font = "48px Arial";
      this.ctx.fillText("GAME OVER", 235, 240);
      this.ctx.restore();
    }
  }
};
