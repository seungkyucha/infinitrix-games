/**
 * InfiniTriX Game Engine v1.0
 * 공통 게임 모듈 — 모든 HTML5 게임에서 재사용
 *
 * 사용법 (게임 index.html 내):
 *   <script src="/engine/ix-engine.js"></script>
 *   <script>
 *     const { Engine, Input, Sound, Tween, Particles, UI } = IX;
 *     const engine = new Engine('gameCanvas');
 *     // ...
 *   </script>
 */
'use strict';

const IX = (() => {

// ═══════════════════════════════════════════════════════════
// Canvas Engine — 초기화, 리사이즈, 게임 루프
// ═══════════════════════════════════════════════════════════
class Engine {
  constructor(canvasId, opts = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.W = 0;
    this.H = 0;
    this.dpr = 1;
    this.lastTime = 0;
    this.running = false;
    this._update = opts.update || (() => {});
    this._render = opts.render || (() => {});
    this._onResize = opts.onResize || (() => {});

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Auto-focus canvas for keyboard input (iframe support)
    this.canvas.tabIndex = 0;
    this.canvas.style.outline = 'none';
    this.canvas.focus();
    document.body.addEventListener('click', () => this.canvas.focus());
    document.body.addEventListener('touchstart', () => this.canvas.focus());
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this._onResize(this.W, this.H);
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    const loop = (timestamp) => {
      if (!this.running) return;
      const rawDt = timestamp - this.lastTime;
      const dt = Math.min(rawDt, 33.33); // Cap at 2 frames (~30fps min)
      this.lastTime = timestamp;
      try {
        this._update(dt, timestamp);
        this._render(this.ctx, this.W, this.H, dt);
      } catch (e) {
        console.error('[IX.Engine]', e);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() { this.running = false; }
}

// ═══════════════════════════════════════════════════════════
// Input Manager — 키보드 + 마우스 + 터치 통합
// ═══════════════════════════════════════════════════════════
const GAME_KEYS = new Set([
  'Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
  'KeyW','KeyA','KeyS','KeyD','KeyP','KeyR','KeyE','KeyQ',
  'Escape','Enter','ShiftLeft','ShiftRight','KeyX','KeyZ',
  'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9'
]);

class Input {
  constructor(canvas) {
    this.keys = {};
    this.justPressed = {};
    this.mouseX = 0; this.mouseY = 0;
    this.mouseDown = false;
    this.tapped = false;
    this.tapX = 0; this.tapY = 0;
    this.touches = [];
    this.isMobile = ('ontouchstart' in window) || window.innerWidth < 800;
    this._canvas = canvas;
    this._init();
  }

  _init() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      if (!this.keys[e.code]) this.justPressed[e.code] = true;
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Also listen on document for iframe compatibility
    document.addEventListener('keydown', (e) => {
      if (GAME_KEYS.has(e.code)) e.preventDefault();
      if (!this.keys[e.code]) this.justPressed[e.code] = true;
      this.keys[e.code] = true;
    });
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    const c = this._canvas;
    const toCanvasCoords = (clientX, clientY) => {
      const r = c.getBoundingClientRect();
      return [
        (clientX - r.left) * (c.width / r.width) / (window.devicePixelRatio || 1),
        (clientY - r.top) * (c.height / r.height) / (window.devicePixelRatio || 1)
      ];
    };

    // Mouse
    c.addEventListener('mousemove', (e) => {
      [this.mouseX, this.mouseY] = toCanvasCoords(e.clientX, e.clientY);
    });
    c.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.mouseDown = true;
      this.tapped = true;
      [this.tapX, this.tapY] = toCanvasCoords(e.clientX, e.clientY);
      this.mouseX = this.tapX; this.mouseY = this.tapY;
    });
    c.addEventListener('mouseup', () => { this.mouseDown = false; });
    c.addEventListener('contextmenu', (e) => e.preventDefault());

    // Touch
    c.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      [this.tapX, this.tapY] = toCanvasCoords(t.clientX, t.clientY);
      this.tapped = true;
      this.mouseX = this.tapX; this.mouseY = this.tapY;
      this.mouseDown = true;
      this.touches = Array.from(e.touches).map(t => {
        const [x, y] = toCanvasCoords(t.clientX, t.clientY);
        return { id: t.identifier, x, y };
      });
    }, { passive: false });
    c.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      [this.mouseX, this.mouseY] = toCanvasCoords(t.clientX, t.clientY);
      this.touches = Array.from(e.touches).map(t => {
        const [x, y] = toCanvasCoords(t.clientX, t.clientY);
        return { id: t.identifier, x, y };
      });
    }, { passive: false });
    c.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.mouseDown = false;
      this.touches = Array.from(e.touches).map(t => {
        const [x, y] = toCanvasCoords(t.clientX, t.clientY);
        return { id: t.identifier, x, y };
      });
    }, { passive: false });
  }

  /** Just pressed this frame */
  jp(code) { return !!this.justPressed[code]; }

  /** Currently held */
  held(code) { return !!this.keys[code]; }

  /** Any confirm action (Space, Enter, tap) */
  confirm() { return this.jp('Space') || this.jp('Enter') || this.tapped; }

  /** Clear per-frame state — call at end of each frame */
  flush() {
    this.justPressed = {};
    this.tapped = false;
  }
}

// ═══════════════════════════════════════════════════════════
// Tween Manager — 애니메이션 보간
// ═══════════════════════════════════════════════════════════
class Tween {
  constructor() { this._tweens = []; this._pending = []; this._updating = false; }

  add(obj, props, duration, ease = 'easeInOut', onComplete) {
    const tw = { obj, from: {}, to: {}, dur: duration, elapsed: 0, ease, onComplete, done: false };
    for (const k in props) { tw.from[k] = obj[k]; tw.to[k] = props[k]; }
    if (this._updating) this._pending.push(tw);
    else this._tweens.push(tw);
    return tw;
  }

  update(dt) {
    this._updating = true;
    for (let i = this._tweens.length - 1; i >= 0; i--) {
      const tw = this._tweens[i];
      if (tw.done) { this._tweens.splice(i, 1); continue; }
      tw.elapsed += dt;
      let t = Math.min(tw.elapsed / tw.dur, 1);
      t = this._ease(t, tw.ease);
      for (const k in tw.to) tw.obj[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * t;
      if (tw.elapsed >= tw.dur) {
        tw.done = true;
        if (tw.onComplete) tw.onComplete();
        this._tweens.splice(i, 1);
      }
    }
    this._updating = false;
    if (this._pending.length) { this._tweens.push(...this._pending); this._pending.length = 0; }
  }

  clear() { this._tweens.length = 0; this._pending.length = 0; }

  _ease(t, type) {
    if (type === 'linear') return t;
    if (type === 'easeIn') return t * t;
    if (type === 'easeOut') return t * (2 - t);
    return t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1; // easeInOut
  }
}

// ═══════════════════════════════════════════════════════════
// Sound Manager — Web Audio API 신스 + SFX
// ═══════════════════════════════════════════════════════════
class Sound {
  constructor() { this._ctx = null; this._vol = 0.3; this._bgm = null; }

  init() {
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { console.warn('[IX.Sound] AudioContext not available'); }
  }

  resume() {
    if (this._ctx && this._ctx.state === 'suspended') this._ctx.resume();
  }

  /** Play a simple tone */
  tone(freq, duration = 0.1, type = 'square', vol = 0.3) {
    if (!this._ctx) return;
    try {
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol * this._vol, this._ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this._ctx.destination);
      osc.start();
      osc.stop(this._ctx.currentTime + duration);
    } catch (e) {}
  }

  /** Predefined SFX */
  sfx(name) {
    const sounds = {
      select:   () => { this.tone(660, 0.08, 'square'); this.tone(880, 0.1, 'square'); },
      hit:      () => { this.tone(200, 0.15, 'sawtooth', 0.4); },
      score:    () => { this.tone(523, 0.05); this.tone(659, 0.08); this.tone(784, 0.1); },
      gameover: () => { this.tone(440, 0.3, 'sawtooth'); this.tone(220, 0.5, 'sawtooth'); },
      powerup:  () => { this.tone(880, 0.1, 'sine'); this.tone(1100, 0.15, 'sine'); },
      jump:     () => { this.tone(300, 0.08, 'square'); },
      dash:     () => { this.tone(150, 0.1, 'sawtooth', 0.5); },
      explosion:() => { this.tone(80, 0.3, 'sawtooth', 0.5); },
    };
    if (sounds[name]) sounds[name]();
  }

  setVolume(v) { this._vol = Math.max(0, Math.min(1, v)); }
}

// ═══════════════════════════════════════════════════════════
// Particle System — 파티클 이펙트
// ═══════════════════════════════════════════════════════════
class Particles {
  constructor(maxParticles = 200) {
    this._particles = [];
    this._max = maxParticles;
  }

  /** Emit particles at position */
  emit(x, y, count = 10, opts = {}) {
    const { color = '#fff', speed = 100, life = 0.5, size = 3, spread = Math.PI * 2 } = opts;
    for (let i = 0; i < count && this._particles.length < this._max; i++) {
      const angle = Math.random() * spread - spread / 2 + (opts.angle || 0);
      const spd = speed * (0.5 + Math.random() * 0.5);
      this._particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life,
        maxLife: life,
        size: size * (0.5 + Math.random()),
        color,
        alpha: 1,
      });
    }
  }

  update(dt) {
    const dtSec = dt / 1000;
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= dtSec;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) this._particles.splice(i, 1);
    }
  }

  render(ctx) {
    for (const p of this._particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  clear() { this._particles.length = 0; }
  get count() { return this._particles.length; }
}

// ═══════════════════════════════════════════════════════════
// Asset Loader — SVG 에셋 프리로더
// ═══════════════════════════════════════════════════════════
class AssetLoader {
  constructor() { this.sprites = {}; }

  async load(assetMap) {
    await Promise.all(
      Object.entries(assetMap).map(([key, src]) =>
        new Promise(resolve => {
          const img = new Image();
          img.onload = () => { this.sprites[key] = img; resolve(); };
          img.onerror = resolve; // Continue even if asset fails
          img.src = src;
        })
      )
    );
  }

  /** Draw sprite with fallback */
  draw(ctx, key, x, y, w, h, fallbackColor = '#6c3cf7') {
    if (this.sprites[key]) {
      ctx.drawImage(this.sprites[key], x, y, w, h);
    } else {
      ctx.fillStyle = fallbackColor;
      ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.8);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// UI Helpers — 공통 UI 렌더링
// ═══════════════════════════════════════════════════════════
const UI = {
  FONT: "'Segoe UI', system-ui, -apple-system, sans-serif",

  /** Draw text with shadow/glow */
  text(ctx, text, x, y, opts = {}) {
    const { size = 16, color = '#e0e0f0', align = 'center', bold = false, glow, shadow } = opts;
    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${this.FONT}`;
    if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 15; }
    if (shadow) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowOffsetY = 2; ctx.shadowBlur = 4; }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  },

  /** Draw a button (returns true if point is inside) */
  button(ctx, text, x, y, w, h, opts = {}) {
    const { color = '#6c3cf7', textColor = '#fff', hover = false, radius = 8 } = opts;
    ctx.save();
    ctx.fillStyle = hover ? color + 'cc' : color + '88';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold 14px ${this.FONT}`;
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
  },

  /** Check if point is inside rect */
  hitTest(px, py, x, y, w, h) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  },

  /** Draw HP bar */
  hpBar(ctx, x, y, w, h, current, max, opts = {}) {
    const { bgColor = '#333', fgColor = '#00ff87', borderColor = '#555' } = opts;
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fgColor;
    ctx.fillRect(x, y, w * Math.max(0, current / max), h);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  },

  /** Draw score with label */
  score(ctx, label, value, x, y, opts = {}) {
    const { labelColor = '#888', valueColor = '#ffd700', size = 14 } = opts;
    this.text(ctx, label, x, y - 8, { size: size - 4, color: labelColor });
    this.text(ctx, String(value), x, y + 10, { size, color: valueColor, bold: true });
  },

  /** Screen transition (fade) */
  fade(ctx, w, h, alpha) {
    if (alpha <= 0) return;
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, alpha)})`;
    ctx.fillRect(0, 0, w, h);
  },

  /** Scanline overlay effect */
  scanlines(ctx, w, h, opacity = 0.03) {
    ctx.fillStyle = `rgba(0,0,0,${opacity})`;
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  },

  /** Screen shake offset calculation */
  shake(intensity) {
    if (intensity <= 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * intensity * 2,
      y: (Math.random() - 0.5) * intensity * 2
    };
  }
};

// ═══════════════════════════════════════════════════════════
// Save Manager — localStorage 래퍼
// ═══════════════════════════════════════════════════════════
const Save = {
  get(key, defaultVal = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : defaultVal; }
    catch { return defaultVal; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  getHighScore(gameId) { return this.get(`ix_${gameId}_hi`, 0); },
  setHighScore(gameId, score) {
    const prev = this.getHighScore(gameId);
    if (score > prev) { this.set(`ix_${gameId}_hi`, score); return true; }
    return false;
  }
};

// ═══════════════════════════════════════════════════════════
// Math Utilities
// ═══════════════════════════════════════════════════════════
const MathUtil = {
  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
  lerp: (a, b, t) => a + (b - a) * t,
  dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  randRange: (min, max) => min + Math.random() * (max - min),
  randInt: (min, max) => Math.floor(min + Math.random() * (max - min + 1)),
  angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
  circleCollide: (x1, y1, r1, x2, y2, r2) => MathUtil.dist(x1, y1, x2, y2) < r1 + r2,
  rectCollide: (x1, y1, w1, h1, x2, y2, w2, h2) =>
    x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2,
};

// ═══════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════
return { Engine, Input, Sound, Tween, Particles, AssetLoader, UI, Save, MathUtil };

})();
