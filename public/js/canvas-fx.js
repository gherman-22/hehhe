/**
 * Canvas Romantic Particle System:
 * - Sakura (Cherry Blossom) Petals drifting in the breeze
 * - Glowing Pastel Hearts floating upwards
 * - Heart burst on clicks / answer choices
 * - Confetti & heart shower celebration
 */

class RomanticCanvasFX {
  constructor(canvasId = 'fx-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;

    this.petals = [];
    this.floatingHearts = [];
    this.burstParticles = [];
    this.isCelebration = false;

    this.maxPetals = 28;
    this.maxHearts = 16;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    // Seed initial sakura petals
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }

    // Seed initial floating hearts
    for (let i = 0; i < this.maxHearts; i++) {
      this.floatingHearts.push(this.createFloatingHeart(true));
    }

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  // Sakura Petal Factory
  createPetal(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : -20,
      size: Math.random() * 9 + 8,
      speedX: Math.random() * 1.5 - 0.5,
      speedY: Math.random() * 1.2 + 0.8,
      flip: Math.random() * Math.PI,
      flipSpeed: Math.random() * 0.03 + 0.01,
      angle: Math.random() * Math.PI * 2,
      angleSpeed: Math.random() * 0.02 - 0.01,
      sway: Math.random() * 2 + 1,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.4 + 0.45,
      color: ['#ffccd5', '#ffb3c1', '#fbb1bd', '#fff0f3'][Math.floor(Math.random() * 4)]
    };
  }

  // Floating Heart Factory
  createFloatingHeart(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 25,
      size: Math.random() * 14 + 10,
      speedY: -(Math.random() * 0.8 + 0.5),
      speedX: Math.sin(Math.random() * Math.PI * 2) * 0.3,
      opacity: Math.random() * 0.35 + 0.25,
      scale: 1,
      pulseSpeed: Math.random() * 0.03 + 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
      color: ['#ff758c', '#ff8fa3', '#e84a6f', '#f72585'][Math.floor(Math.random() * 4)]
    };
  }

  // Draw Heart Shape helper
  drawHeart(ctx, x, y, size, color, opacity = 1, rotation = 0) {
    ctx.save();
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    const s = size / 30; // Scale relative to base path
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15 * s, -15 * s, -30 * s, 10 * s, 0, 30 * s);
    ctx.bezierCurveTo(30 * s, 10 * s, 15 * s, -15 * s, 0, 0);
    ctx.fill();
    ctx.restore();
  }

  // Draw realistic Sakura Petal
  drawPetal(ctx, petal) {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.angle);
    ctx.scale(1, Math.cos(petal.flip));
    ctx.globalAlpha = petal.opacity;

    // Gradient for realistic petal look
    const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, petal.size);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, petal.color);
    grad.addColorStop(1, '#ff85a2');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -petal.size);
    ctx.bezierCurveTo(petal.size * 0.7, -petal.size * 0.6, petal.size * 0.8, petal.size * 0.4, 0, petal.size);
    ctx.bezierCurveTo(-petal.size * 0.8, petal.size * 0.4, -petal.size * 0.7, -petal.size * 0.6, 0, -petal.size);
    ctx.fill();
    ctx.restore();
  }

  // Trigger heart burst at (x, y)
  burst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4 - 0.2);
      const speed = Math.random() * 4.5 + 2.5;
      this.burstParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 12 + 8,
        opacity: 1,
        decay: Math.random() * 0.025 + 0.015,
        rotation: Math.random() * Math.PI,
        color: ['#ff4d6d', '#ff758c', '#ff8fa3', '#e84a6f', '#ffffff'][Math.floor(Math.random() * 5)]
      });
    }
  }

  // Trigger celebratory heart & confetti explosion
  startCelebration() {
    this.isCelebration = true;
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const x = Math.random() * this.width;
        const y = Math.random() * (this.height * 0.6) + 100;
        this.burst(x, y, 10);
      }, i * 180);
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Update & Render Sakura Petals
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.y += p.speedY;
      p.x += Math.sin(p.swayOffset) * p.sway + p.speedX;
      p.swayOffset += 0.02;
      p.flip += p.flipSpeed;
      p.angle += p.angleSpeed;

      this.drawPetal(this.ctx, p);

      // Reset when exiting screen
      if (p.y > this.height + 25 || p.x < -30 || p.x > this.width + 30) {
        this.petals[i] = this.createPetal(false);
      }
    }

    // 2. Update & Render Floating Hearts
    for (let i = 0; i < this.floatingHearts.length; i++) {
      const h = this.floatingHearts[i];
      h.y += h.speedY;
      h.x += h.speedX;
      h.pulsePhase += h.pulseSpeed;
      const currentScale = 1 + Math.sin(h.pulsePhase) * 0.15;

      this.drawHeart(this.ctx, h.x, h.y, h.size * currentScale, h.color, h.opacity, 0);

      // Reset when floating off top
      if (h.y < -35) {
        this.floatingHearts[i] = this.createFloatingHeart(false);
      }
    }

    // 3. Update & Render Burst Particles
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const bp = this.burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vy += 0.12; // Gravity
      bp.vx *= 0.98;
      bp.opacity -= bp.decay;
      bp.rotation += 0.05;

      if (bp.opacity <= 0) {
        this.burstParticles.splice(i, 1);
      } else {
        this.drawHeart(this.ctx, bp.x, bp.y, bp.size, bp.color, bp.opacity, bp.rotation);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Global click effect: spawn miniature hearts under user's cursor / tap
document.addEventListener('click', (e) => {
  // Don't trigger on links or buttons that have their own burst
  const heart = document.createElement('div');
  heart.className = 'click-heart';
  heart.textContent = ['💗', '💖', '🌸', '✨', '💕'][Math.floor(Math.random() * 5)];
  heart.style.left = `${e.clientX - 12}px`;
  heart.style.top = `${e.clientY - 12}px`;
  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 850);
});

window.addEventListener('DOMContentLoaded', () => {
  window.canvasFX = new RomanticCanvasFX('fx-canvas');
});

