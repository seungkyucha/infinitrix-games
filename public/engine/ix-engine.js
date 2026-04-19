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
    /**
     * Convert client (screen/touch) coordinates to game (logical) coordinates.
     *
     * The game uses ctx.setTransform(dpr, ...) so game coordinates = (0..W, 0..H)
     * where W = window.innerWidth, H = window.innerHeight.
     *
     * On mobile, getBoundingClientRect() may differ from the logical game size
     * due to CSS scaling, iframe embedding, or viewport quirks.
     *
     * Formula: gameX = (clientX - rect.left) / rect.width * gameW
     * This works regardless of CSS transforms, DPR, or container scaling.
     */
    const toCanvasCoords = (clientX, clientY) => {
      const r = c.getBoundingClientRect();
      // Get the game's logical dimensions (set by Engine.resize)
      const gameW = parseFloat(c.style.width)  || r.width;
      const gameH = parseFloat(c.style.height) || r.height;
      return [
        (clientX - r.left) / r.width  * gameW,
        (clientY - r.top)  / r.height * gameH
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
    const { color = '#fff', speed = 100, life = 0.5, size = 3, spread = Math.PI * 2, texture = null, rotation = false } = opts;
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
        texture,
        rotation: rotation ? Math.random() * Math.PI * 2 : 0,
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
      if (p.texture) {
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation * (p.life / p.maxLife));
        ctx.drawImage(p.texture, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() { this._particles.length = 0; }
  get count() { return this._particles.length; }
}

// ═══════════════════════════════════════════════════════════
// Asset Loader — 에셋 프리로더 (타임아웃 + 폴백 보장)
// ═══════════════════════════════════════════════════════════
class AssetLoader {
  constructor() { this.sprites = {}; this.failed = []; }

  /**
   * Load a map of key→src. Each asset has an independent timeout.
   * Never rejects — missing assets degrade to fallback rendering via draw().
   *
   * @returns {Promise<{loaded: string[], failed: string[], timedOut: boolean}>}
   */
  async load(assetMap, opts = {}) {
    const timeoutMs = opts.timeoutMs ?? 10000;
    const entries = Object.entries(assetMap);
    const loaded = [];
    const failed = [];

    await Promise.all(entries.map(([key, src]) =>
      new Promise(resolve => {
        const img = new Image();
        let done = false;
        const finish = (ok) => {
          if (done) return;
          done = true;
          if (ok) { this.sprites[key] = img; loaded.push(key); }
          else { failed.push(key); this.failed.push(key); }
          resolve();
        };
        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        img.src = src;
        setTimeout(() => finish(false), timeoutMs);
      })
    ));

    return { loaded, failed, timedOut: failed.length > 0 };
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

  has(key) { return !!this.sprites[key]; }
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

  /**
   * Fisher-Yates 배열 셔플 (in-place)
   *
   * 범용 셔플. 카드덱, 아이템 풀, 적 배치, 퍼즐 보드 초기화 등에 사용.
   * 게임 상태에 의존하지 않는 순수 함수.
   *
   * @param {Array} arr - 셔플할 배열 (원본이 변경됨)
   * @returns {Array} 셔플된 배열 (입력과 같은 참조)
   */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = MathUtil.randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * Grid-based A* pathfinding (4-directional)
   *
   * 범용 그리드 경로 탐색. 로그라이크, 타워디펜스, 전략 등 다양한 장르에서 사용.
   * 게임 상태에 의존하지 않는 순수 함수 — isBlocked 콜백으로 장애물을 판단.
   *
   * @param {number} sx - 시작 x
   * @param {number} sy - 시작 y
   * @param {number} gx - 목표 x
   * @param {number} gy - 목표 y
   * @param {number} w  - 그리드 너비
   * @param {number} h  - 그리드 높이
   * @param {function} isBlocked - (x, y) => boolean (해당 타일이 통과 불가이면 true)
   * @param {object} [opts] - { maxNodes: 200 }
   * @returns {Array<{x,y}>} 경로 (시작 제외, 목표 포함). 경로 없으면 빈 배열.
   */
  aStar(sx, sy, gx, gy, w, h, isBlocked, opts) {
    if (sx === gx && sy === gy) return [];
    const maxNodes = (opts && opts.maxNodes) || 200;
    const open = [{ x: sx, y: sy, g: 0, f: 0, parent: null }];
    const closed = new Set();
    const key = (x, y) => y * w + x;

    while (open.length > 0) {
      open.sort((a, b) => a.f - b.f);
      const cur = open.shift();
      if (cur.x === gx && cur.y === gy) {
        const path = [];
        let n = cur;
        while (n.parent) { path.unshift({ x: n.x, y: n.y }); n = n.parent; }
        return path;
      }
      closed.add(key(cur.x, cur.y));

      const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
      for (const [dx, dy] of dirs) {
        const nx = cur.x + dx, ny = cur.y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        if (closed.has(key(nx, ny))) continue;
        if (!(nx === gx && ny === gy) && isBlocked(nx, ny)) continue;
        const g = cur.g + 1;
        const heuristic = Math.abs(nx - gx) + Math.abs(ny - gy);
        const existing = open.find(n => n.x === nx && n.y === ny);
        if (existing) {
          if (g < existing.g) { existing.g = g; existing.f = g + heuristic; existing.parent = cur; }
        } else {
          open.push({ x: nx, y: ny, g, f: g + heuristic, parent: cur });
        }
      }
      if (open.length > maxNodes) return []; // Safety limit
    }
    return [];
  },

  /**
   * Bresenham line-of-sight check (그리드 기반)
   *
   * 두 타일 사이에 장애물 없이 직선이 통과하는지 확인.
   * 로그라이크 FOV, 슈터 사격, 전략 게임 시야 판정 등에 사용.
   *
   * @param {number} x0 - 시작 x
   * @param {number} y0 - 시작 y
   * @param {number} x1 - 끝 x
   * @param {number} y1 - 끝 y
   * @param {function} isBlocked - (x, y) => boolean (벽이면 true)
   * @returns {boolean} 시야가 확보되면 true
   */
  lineOfSight(x0, y0, x1, y1, isBlocked) {
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let cx = x0, cy = y0;
    while (cx !== x1 || cy !== y1) {
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
      if (cx === x1 && cy === y1) return true;
      if (isBlocked(cx, cy)) return false;
    }
    return true;
  },
};

// ═══════════════════════════════════════════════════════════
// Layout — 반응형 레이아웃 유틸리티 (모바일/PC/태블릿 대응)
// ═══════════════════════════════════════════════════════════
const Layout = {
  /** 기준 해상도 (디자인 기준) */
  BASE_W: 1280,
  BASE_H: 720,

  /** 현재 화면에 맞는 스케일 팩터 계산 */
  scale(w, h) {
    return Math.min(w / this.BASE_W, h / this.BASE_H);
  },

  /** 기준 해상도 기반 값을 현재 해상도로 변환 */
  px(baseValue, w, h) {
    return baseValue * this.scale(w, h);
  },

  /** 화면 비율에 따른 폰트 크기 (최소/최대 클램프) */
  fontSize(base, w, h, min = 10, max = 72) {
    return MathUtil.clamp(base * this.scale(w, h), min, max);
  },

  /** 화면 중앙 기준 좌표 (w/h 생략 시 window.innerWidth/Height 사용) */
  cx(w) { return (w || window.innerWidth) / 2; },
  cy(h) { return (h || window.innerHeight) / 2; },

  /** 모바일 여부 */
  isMobile(w) { return w < 768; },
  isTablet(w) { return w >= 768 && w < 1024; },
  isDesktop(w) { return w >= 1024; },

  /** 세로 모드 여부 */
  isPortrait(w, h) { return h > w; },

  /** 안전 영역 (노치/상태바 등 고려) — 게임 콘텐츠가 들어갈 영역 */
  safeArea(w, h) {
    const pad = this.isMobile(w) ? 10 : 20;
    const topPad = this.isMobile(w) ? 40 : 20; // 모바일 상태바 영역
    return { x: pad, y: topPad, w: w - pad * 2, h: h - topPad - pad };
  },

  /** 그리드 레이아웃 계산 (매치3 보드, 인벤토리 등) */
  grid(cols, rows, areaW, areaH, padding = 2) {
    const cellW = Math.floor((areaW - padding * (cols + 1)) / cols);
    const cellH = Math.floor((areaH - padding * (rows + 1)) / rows);
    const cellSize = Math.min(cellW, cellH);
    const totalW = cellSize * cols + padding * (cols + 1);
    const totalH = cellSize * rows + padding * (rows + 1);
    const offsetX = Math.floor((areaW - totalW) / 2);
    const offsetY = Math.floor((areaH - totalH) / 2);
    return { cellSize, totalW, totalH, offsetX, offsetY, padding };
  },

  /** UI 버튼 크기 (모바일에서 최소 44px 터치 타겟) */
  buttonSize(baseW, baseH, screenW, screenH) {
    const s = this.scale(screenW, screenH);
    const w = Math.max(baseW * s, 44);
    const h = Math.max(baseH * s, 44);
    return { w, h };
  },

  /** HUD 영역 — 상단/하단 UI 배치 */
  hud(w, h) {
    const s = this.scale(w, h);
    const mobile = this.isMobile(w);
    return {
      top: { x: 0, y: 0, w, h: Math.max(40, 60 * s) },
      bottom: { x: 0, y: h - Math.max(50, 80 * s), w, h: Math.max(50, 80 * s) },
      fontSize: this.fontSize(mobile ? 14 : 18, w, h, 10, 28),
      iconSize: Math.max(24, Math.round(32 * s)),
      padding: Math.max(8, Math.round(16 * s)),
    };
  },

  /** 터치 조작 영역 (가상 조이스틱, 버튼) — 모바일 전용 */
  touchControls(w, h) {
    if (!this.isMobile(w) && !this.isTablet(w)) return null;
    const s = this.scale(w, h);
    const btnSize = Math.max(48, Math.round(64 * s));
    const margin = Math.max(16, Math.round(24 * s));
    return {
      joystick: {
        x: margin + btnSize, y: h - margin - btnSize,
        radius: btnSize,
      },
      buttonA: {
        x: w - margin - btnSize, y: h - margin - btnSize,
        size: btnSize, label: 'A',
      },
      buttonB: {
        x: w - margin - btnSize * 2.2, y: h - margin - btnSize * 0.5,
        size: btnSize * 0.8, label: 'B',
      },
    };
  },
};

// ═══════════════════════════════════════════════════════════
// Sprite Animation — sprite sheet frame management
// ═══════════════════════════════════════════════════════════
class Sprite {
  constructor(image, frameWidth, frameHeight, frameCount, fps = 12) {
    this.image = image;
    this.fw = frameWidth;
    this.fh = frameHeight;
    this.frameCount = frameCount;
    this.fps = fps;
    this.currentFrame = 0;
    this.elapsed = 0;
    this.loop = true;
    this.playing = true;
  }

  update(dt) {
    if (!this.playing) return;
    this.elapsed += dt;
    const frameDur = 1000 / this.fps;
    while (this.elapsed >= frameDur) {
      this.elapsed -= frameDur;
      this.currentFrame++;
      if (this.currentFrame >= this.frameCount) {
        this.currentFrame = this.loop ? 0 : this.frameCount - 1;
        if (!this.loop) this.playing = false;
      }
    }
  }

  draw(ctx, x, y, w, h) {
    if (!this.image) return;
    const sx = this.currentFrame * this.fw;
    ctx.drawImage(this.image, sx, 0, this.fw, this.fh, x, y, w || this.fw, h || this.fh);
  }

  reset() { this.currentFrame = 0; this.elapsed = 0; this.playing = true; }
  play() { this.playing = true; }
  stop() { this.playing = false; }
  setFrame(f) { this.currentFrame = Math.min(f, this.frameCount - 1); }
}

// ═══════════════════════════════════════════════════════════
// Button — 마우스 + 터치 + 키보드 통합 위젯
//
// 단일 API로 세 가지 입력을 모두 처리하고 hit-test가 내장되어
// "마우스로는 되는데 키보드로 안되는" 버그를 구조적으로 제거한다.
//
// 사용법:
//   const btn = new IX.Button({
//     x: 100, y: 100, w: 200, h: 60,
//     text: 'Start',
//     key: 'Space',               // 단축키 (문자열 또는 배열)
//     onClick: () => Scene.transition('PLAY'),
//   });
//   // 매 프레임:  Button.updateAll(input); Button.renderAll(ctx);
//
// Scene.transition() 시 자동으로 clearAll() 호출 → 상태별 버튼 누수 차단.
// ═══════════════════════════════════════════════════════════
class Button {
  constructor(opts) {
    this.x = opts.x; this.y = opts.y;
    this.w = opts.w; this.h = opts.h;
    this.text = opts.text ?? '';
    this.keys = opts.key ? (Array.isArray(opts.key) ? opts.key : [opts.key]) : [];
    this.onClick = opts.onClick || (() => {});
    this.color = opts.color ?? '#6c3cf7';
    this.textColor = opts.textColor ?? '#fff';
    this.radius = opts.radius ?? 10;
    this.fontSize = opts.fontSize ?? 18;
    this.bold = opts.bold ?? true;
    this.icon = opts.icon ?? null;            // optional asset key
    this.hover = false;
    this.pressed = false;
    this.enabled = opts.enabled !== false;
    this.visible = opts.visible !== false;
    this._cooldown = 0;                       // prevent double-trigger
    Button._active.push(this);
    if ((this.w && this.w < 44) || (this.h && this.h < 44)) {
      console.warn('[IX.Button] tap target under 44px — text=' + JSON.stringify(this.text) + ' size=' + this.w + 'x' + this.h + ' (mobile UX risk)');
    }
  }

  hitTest(px, py) {
    return this.visible && this.enabled
      && px >= this.x && px <= this.x + this.w
      && py >= this.y && py <= this.y + this.h;
  }

  _trigger() {
    if (this._cooldown > 0) return;
    this._cooldown = 200;                     // 200ms debounce
    try { this.onClick(); } catch (e) { console.error('[IX.Button]', e); }
  }

  update(input, dt) {
    if (!this.visible || !this.enabled) return;
    if (this._cooldown > 0) this._cooldown = Math.max(0, this._cooldown - dt);
    this.hover = this.hitTest(input.mouseX, input.mouseY);
    // Mouse/touch tap on button
    if (input.tapped && this.hitTest(input.tapX, input.tapY)) this._trigger();
    // Keyboard shortcut
    for (const k of this.keys) {
      if (input.jp(k)) { this._trigger(); break; }
    }
  }

  render(ctx) {
    if (!this.visible) return;
    ctx.save();
    const alpha = this.enabled ? 1 : 0.4;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.hover ? this.color + 'dd' : this.color + '99';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(this.x, this.y, this.w, this.h, this.radius);
    else ctx.rect(this.x, this.y, this.w, this.h);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${this.bold ? 'bold ' : ''}${this.fontSize}px ${UI.FONT}`;
    ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2);
    if (this.keys.length && this.keys[0] !== 'Space') {
      ctx.font = `10px ${UI.FONT}`;
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillText(`[${this.keys[0].replace(/^Key/, '')}]`, this.x + this.w / 2, this.y + this.h - 8);
    }
    ctx.restore();
  }

  setEnabled(v) { this.enabled = v; }
  setVisible(v) { this.visible = v; }
  setPosition(x, y) { this.x = x; this.y = y; }
}

Button._active = [];
Button.clearAll = function() { Button._active.length = 0; };
/**
 * 특정 버튼을 _active 목록에서 제거.
 * 동적으로 생성/제거되는 버튼(카드 슬롯, 인벤토리 등)에 사용.
 * @param {Button} btn - 제거할 버튼 인스턴스
 */
Button.remove = function(btn) {
  const idx = Button._active.indexOf(btn);
  if (idx >= 0) Button._active.splice(idx, 1);
};
/**
 * 버튼 배열을 일괄 제거. 동적 버튼 그룹 관리에 사용.
 * 예: 턴 종료 시 카드 버튼 전체 제거 → Button.removeList(cardButtons)
 * @param {Button[]} list - 제거할 버튼 배열
 */
Button.removeList = function(list) {
  for (const b of list) {
    const idx = Button._active.indexOf(b);
    if (idx >= 0) Button._active.splice(idx, 1);
  }
};
Button.updateAll = function(input, dt) {
  for (const b of Button._active) b.update(input, dt);
};
Button.renderAll = function(ctx) {
  for (const b of Button._active) b.render(ctx);
};

// ═══════════════════════════════════════════════════════════
// Scene — 상태 전환 + 리소스 자동 정리
//
// Scene.setTimeout/setInterval/on()으로 등록된 모든 리소스는
// Scene.transition() 또는 Scene.cleanup() 시 자동 해제된다.
// Tween/Particles/Button도 함께 정리되어 상태 잔존 버그를 차단.
// ═══════════════════════════════════════════════════════════
const Scene = {
  _states: {},
  _resources: { timers: [], intervals: [], listeners: [] },
  current: null,
  _tween: null,
  _particles: null,

  /** Tween/Particles 인스턴스를 Scene과 연결 — transition 시 자동 clear */
  bind({ tween, particles }) {
    this._tween = tween || null;
    this._particles = particles || null;
  },

  register(name, handlers) {
    this._states[name] = {
      enter: handlers.enter || (() => {}),
      update: handlers.update || (() => {}),
      render: handlers.render || (() => {}),
      exit: handlers.exit || (() => {}),
    };
  },

  transition(name, data) {
    if (!this._states[name]) {
      console.error('[IX.Scene] Unknown state:', name);
      return;
    }
    const prev = this.current;
    try { if (prev) this._states[prev].exit(); } catch (e) { console.error('[IX.Scene.exit]', e); }
    this.cleanup();
    this.current = name;
    StateGuard.touch();
    try { this._states[name].enter(data); } catch (e) { console.error('[IX.Scene.enter]', e); }
  },

  /** 현재 scene에 속한 모든 리소스 정리 */
  cleanup() {
    for (const id of this._resources.timers) clearTimeout(id);
    for (const id of this._resources.intervals) clearInterval(id);
    for (const [target, event, fn] of this._resources.listeners) {
      try { target.removeEventListener(event, fn); } catch {}
    }
    this._resources.timers.length = 0;
    this._resources.intervals.length = 0;
    this._resources.listeners.length = 0;
    Button.clearAll();
    if (this._tween) this._tween.clear();
    if (this._particles) this._particles.clear();
  },

  setTimeout(fn, ms) {
    const id = setTimeout(() => {
      const i = this._resources.timers.indexOf(id);
      if (i >= 0) this._resources.timers.splice(i, 1);
      fn();
    }, ms);
    this._resources.timers.push(id);
    return id;
  },

  setInterval(fn, ms) {
    const id = setInterval(fn, ms);
    this._resources.intervals.push(id);
    return id;
  },

  on(target, event, fn) {
    target.addEventListener(event, fn);
    this._resources.listeners.push([target, event, fn]);
    return fn;
  },

  update(dt, input) {
    if (this.current) {
      try { this._states[this.current].update(dt, input); } catch (e) { console.error('[IX.Scene.update]', e); }
    }
    Button.updateAll(input, dt);
    StateGuard.tick(dt, input);
  },

  render(ctx, w, h) {
    if (this.current) {
      try { this._states[this.current].render(ctx, w, h); } catch (e) { console.error('[IX.Scene.render]', e); }
    }
    Button.renderAll(ctx);
  },
};

// ═══════════════════════════════════════════════════════════
// StateGuard — 멈춤 감지 워치독
//
// 입력이 일정 시간 이상 없고 아무 state 전환도 없으면 onStuck 호출.
// 기본 동작은 TITLE로 복귀 — "영원히 로딩" 같은 데드락을 방지한다.
// ═══════════════════════════════════════════════════════════
const StateGuard = {
  _enabled: false,
  _elapsed: 0,
  _stuckMs: 30000,
  _onStuck: null,
  _lastInputState: '',

  enable(opts = {}) {
    this._enabled = true;
    this._stuckMs = opts.stuckMs ?? 30000;
    this._onStuck = opts.onStuck || (() => {
      console.warn('[IX.StateGuard] Stuck detected — returning to TITLE');
      if (Scene.current !== 'TITLE' && Scene._states.TITLE) Scene.transition('TITLE');
    });
    this._elapsed = 0;
  },

  disable() { this._enabled = false; },

  /** 어떤 입력/전환이 발생했을 때 호출. 내부 타이머 리셋. */
  touch() { this._elapsed = 0; },

  tick(dt, input) {
    if (!this._enabled) return;
    // any input touches the guard
    const inputSig = `${input.mouseX|0},${input.mouseY|0},${input.mouseDown},${input.tapped},${Object.keys(input.justPressed).length}`;
    if (inputSig !== this._lastInputState) {
      this._lastInputState = inputSig;
      this._elapsed = 0;
      return;
    }
    this._elapsed += dt;
    if (this._elapsed >= this._stuckMs) {
      this._elapsed = 0;
      try { this._onStuck(); } catch (e) { console.error('[IX.StateGuard]', e); }
    }
  },
};

// ═══════════════════════════════════════════════════════════
// GameFlow — 표준 라이프사이클 (BOOT → TITLE → PLAY → GAMEOVER)
//
// 모든 게임이 동일한 시작/종료/재시작 흐름을 공유하도록 강제한다.
// 재시작 시 onReset 콜백을 호출하여 게임 로직의 상태를 초기화하고,
// Scene.cleanup()이 타이머/리스너/트윈/파티클을 보장 정리한다.
//
// 사용법:
//   GameFlow.init({
//     title:    { enter, update, render },     // 선택
//     play:     { enter, update, render },     // 필수
//     gameover: { enter, update, render },     // 선택 (기본 제공)
//     onReset:  () => { /* 게임 상태 초기화 */ },
//     titleText: '게임 제목',
//   });
//   GameFlow.start();
// ═══════════════════════════════════════════════════════════
const GameFlow = {
  _config: null,

  init(config) {
    this._config = config;
    const onReset = config.onReset || (() => {});
    const titleText = config.titleText || 'PRESS SPACE';

    // TITLE state (default or user-supplied)
    Scene.register('TITLE', config.title || {
      enter: () => {
        const w = window.innerWidth, h = window.innerHeight;
        new Button({
          x: w/2 - 120, y: h/2, w: 240, h: 64,
          text: 'START', key: ['Space', 'Enter'],
          onClick: () => GameFlow.startPlay(),
        });
      },
      update: () => {},
      render: (ctx, w, h) => {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, w, h);
        UI.text(ctx, titleText, w/2, h/2 - 80, { size: 42, bold: true, color: '#fff', glow: '#6c3cf7' });
        UI.text(ctx, 'Space / Enter / Tap to start', w/2, h/2 + 100, { size: 16, color: '#aab' });
      },
    });

    // PLAY state (user-supplied — required)
    if (!config.play) throw new Error('[IX.GameFlow] config.play is required');
    Scene.register('PLAY', config.play);

    // GAMEOVER state (default or user-supplied)
    Scene.register('GAMEOVER', config.gameover || {
      enter: (data) => {
        const w = window.innerWidth, h = window.innerHeight;
        new Button({
          x: w/2 - 140, y: h/2 + 40, w: 280, h: 56,
          text: 'RESTART', key: ['KeyR', 'Space', 'Enter'],
          onClick: () => { onReset(); Scene.transition('PLAY'); },
        });
        new Button({
          x: w/2 - 140, y: h/2 + 110, w: 280, h: 48,
          text: 'TITLE', key: ['Escape'],
          color: '#555',
          onClick: () => Scene.transition('TITLE'),
        });
      },
      update: () => {},
      render: (ctx, w, h) => {
        ctx.fillStyle = 'rgba(10,10,26,0.92)';
        ctx.fillRect(0, 0, w, h);
        UI.text(ctx, 'GAME OVER', w/2, h/2 - 60, { size: 56, bold: true, color: '#ff4466', glow: '#ff0044' });
        const scoreText = config._gameoverData?.score != null ? `SCORE: ${config._gameoverData.score}` : '';
        if (scoreText) UI.text(ctx, scoreText, w/2, h/2, { size: 22, color: '#ffd700' });
      },
    });

    StateGuard.enable({ stuckMs: config.stuckMs ?? 30000 });
  },

  /** 현재 Scene을 TITLE로 시작 */
  start() {
    Scene.transition('TITLE');
  },

  /** PLAY 시작 — onReset 호출 후 PLAY 진입 */
  startPlay(data) {
    if (this._config?.onReset) {
      try { this._config.onReset(); } catch (e) { console.error('[IX.GameFlow.onReset]', e); }
    }
    Scene.transition('PLAY', data);
  },

  /** 게임 오버 — Score 등 UI 데이터 전달 */
  gameOver(data) {
    if (this._config) this._config._gameoverData = data;
    Scene.transition('GAMEOVER', data);
  },
};

// ═══════════════════════════════════════════════════════════
// Pool — 오브젝트 풀링 (적, 탄환, 보석 등 재활용)
//
// GC 부담을 줄이기 위해 엔티티를 사전 할당하고 active 플래그로 관리.
// acquire()로 비활성 엔티티를 가져오고, active=false로 반환.
//
// 사용법:
//   const pool = new IX.Pool(100, () => ({ active: false, x: 0, y: 0, hp: 0 }));
//   const e = pool.acquire();   // 비활성 엔티티 1개 반환 (없으면 null)
//   e.x = 100; e.hp = 50;       // 초기화
//   e.active = false;           // 반환 (release)
//   pool.forEach(e => { ... }); // 활성 엔티티만 순회
//   pool.releaseAll();          // 전체 비활성화 (리셋 시)
// ═══════════════════════════════════════════════════════════
class Pool {
  /**
   * @param {number} size - 사전 할당할 엔티티 수
   * @param {function} factory - () => obj (active: false 포함 권장)
   */
  constructor(size, factory) {
    this._items = [];
    for (let i = 0; i < size; i++) this._items.push(factory());
  }

  /** 비활성 엔티티 하나를 활성화하여 반환. 풀 소진 시 null (graceful skip). */
  acquire() {
    for (const item of this._items) {
      if (!item.active) { item.active = true; return item; }
    }
    return null;
  }

  /** 모든 엔티티 비활성화 (게임 리셋 시 사용) */
  releaseAll() {
    for (const item of this._items) item.active = false;
  }

  /** 활성 엔티티만 순회하며 콜백 실행 */
  forEach(fn) {
    for (const item of this._items) {
      if (item.active) fn(item);
    }
  }

  /** 현재 활성 엔티티 수 */
  count() {
    let c = 0;
    for (const item of this._items) { if (item.active) c++; }
    return c;
  }

  /** 내부 배열 직접 접근 (읽기 전용 권장) */
  get items() { return this._items; }
}

// ═══════════════════════════════════════════════════════════
// SpatialHash — 그리드 기반 공간 해싱 (충돌 판정 최적화)
//
// 많은 엔티티의 충돌 판정을 O(n²) → O(n) 수준으로 최적화.
// 매 프레임 clear() → insert() → query() 순서로 사용.
//
// 사용법:
//   const hash = new IX.SpatialHash(64);
//   hash.clear();
//   enemyPool.forEach(e => hash.insert(e));  // 모든 적 등록
//   const nearby = hash.query(bullet.x, bullet.y, bullet.size + 30);
//   for (const e of nearby) { /* 충돌 판정 */ }
// ═══════════════════════════════════════════════════════════
class SpatialHash {
  /**
   * @param {number} cellSize - 해시 셀 크기 (픽셀). 가장 큰 엔티티 크기의 2배 권장.
   */
  constructor(cellSize = 64) {
    this._cellSize = cellSize;
    this._cells = {};
  }

  /** 모든 셀 초기화 (매 프레임 시작 시 호출) */
  clear() { this._cells = {}; }

  /** 오브젝트를 해당 셀에 등록. obj는 { x, y } 필수. */
  insert(obj) {
    const cs = this._cellSize;
    const cx = Math.floor(obj.x / cs);
    const cy = Math.floor(obj.y / cs);
    const k = cx + ',' + cy;
    if (!this._cells[k]) this._cells[k] = [];
    this._cells[k].push(obj);
  }

  /** (x, y) 중심 반경 r 내의 셀에 속한 오브젝트 목록 반환 */
  query(x, y, r) {
    const results = [];
    const cs = this._cellSize;
    const minCx = Math.floor((x - r) / cs);
    const maxCx = Math.floor((x + r) / cs);
    const minCy = Math.floor((y - r) / cs);
    const maxCy = Math.floor((y + r) / cs);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const cell = this._cells[cx + ',' + cy];
        if (cell) results.push(...cell);
      }
    }
    return results;
  }
}

// ═══════════════════════════════════════════════════════════
// PopupText — 떠오르는 텍스트 팝업 매니저
// 데미지 숫자, 점수 획득, 상태 알림 등 다양한 게임에서 재사용.
// Cycle 1(pixel-depths), Cycle 3(poly-spire)에서 반복 구현되어 승격.
// ═══════════════════════════════════════════════════════════
class PopupText {
  /**
   * @param {object} [opts]
   * @param {number} [opts.defaultVy=-60]  기본 상승 속도 (px/s, 음수=위로)
   * @param {number} [opts.defaultLife=1.0] 기본 수명 (초)
   */
  constructor(opts = {}) {
    this.items = [];
    this._defaultVy = opts.defaultVy ?? -60;
    this._defaultLife = opts.defaultLife ?? 1.0;
  }

  /**
   * 팝업 추가
   * @param {number} x
   * @param {number} y
   * @param {string} text  표시할 텍스트 (예: '-12', '+5 HP', '콤보!')
   * @param {string} color CSS 색상
   * @param {object} [opts] { vy, life }
   */
  add(x, y, text, color, opts = {}) {
    this.items.push({
      x, y, text, color,
      vy: opts.vy ?? this._defaultVy,
      life: opts.life ?? this._defaultLife,
      maxLife: opts.life ?? this._defaultLife,
    });
  }

  /** 매 프레임 호출 — dt는 밀리초 */
  update(dt) {
    const sec = dt / 1000;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.y += p.vy * sec;
      p.life -= sec;
      if (p.life <= 0) this.items.splice(i, 1);
    }
  }

  /**
   * 렌더 — 알파 페이드 + 텍스트 출력
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} [opts] { fontSize: 18, bold: true, glow: false }
   */
  render(ctx, opts = {}) {
    const size = opts.fontSize || 18;
    const bold = opts.bold !== false;
    const glow = opts.glow || false;
    for (const p of this.items) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.font = `${bold ? 'bold ' : ''}${size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
      }
      ctx.fillText(p.text, p.x, p.y);
      if (glow) ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  /** 모든 팝업 제거 */
  clear() { this.items = []; }

  /** 현재 팝업 수 */
  get count() { return this.items.length; }
}

// ═══════════════════════════════════════════════════════════
// EffectQueue — 원샷 스프라이트 이펙트 큐
//
// 히트/폭발/사망 등 일회성 스프라이트 애니메이션을 관리.
// Sprite(loop=false) 인스턴스를 큐에 넣으면 재생 완료 시 자동 제거.
// Cycle 5(painted-sky)에서 승격 — 모든 장르의 시각 이펙트에 공통 사용 가능.
//
// 사용법:
//   const fx = new IX.EffectQueue();
//   // 직접 Sprite 추가:
//   const spr = new Sprite(img, fW, fH, 4, 12);
//   fx.add(spr, x, y, 48);
//   // 또는 이미지로부터 자동 생성:
//   fx.spawn(img, x, y, 48, 4, 12);
//   // 매 프레임:
//   fx.update(dt);   fx.render(ctx);
//   // 리셋:
//   fx.clear();
// ═══════════════════════════════════════════════════════════
class EffectQueue {
  constructor() { this.items = []; }

  /**
   * 사전 생성된 Sprite를 큐에 추가 (loop=false 강제, reset 호출)
   * @param {Sprite} sprite - 재생할 Sprite 인스턴스
   * @param {number} x - 중심 X
   * @param {number} y - 중심 Y
   * @param {number} size - 렌더 크기 (정사각 기준)
   */
  add(sprite, x, y, size) {
    sprite.loop = false;
    sprite.reset();
    this.items.push({ sprite, x, y, size });
  }

  /**
   * 이미지 + 프레임 정보로 Sprite를 자동 생성하여 큐에 추가
   * @param {HTMLImageElement} image
   * @param {number} x - 중심 X
   * @param {number} y - 중심 Y
   * @param {number} size - 렌더 크기
   * @param {number} frames - 총 프레임 수
   * @param {number} [fps=12] - 재생 fps
   * @param {object} [dims] - { w, h } 시트 전체 크기 (SVG naturalWidth=0 대응)
   */
  spawn(image, x, y, size, frames, fps, dims) {
    fps = fps || 12;
    const fW = dims ? (dims.w / frames) : ((image.naturalWidth || image.width || size) / frames);
    const fH = dims ? dims.h : (image.naturalHeight || image.height || size);
    const spr = new Sprite(image, fW, fH, frames, fps);
    spr.loop = false;
    this.items.push({ sprite: spr, x, y, size });
  }

  /** 매 프레임 호출 — dt는 밀리초 */
  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      this.items[i].sprite.update(dt);
      if (!this.items[i].sprite.playing) this.items.splice(i, 1);
    }
  }

  /** 모든 이펙트 렌더 — 중심 좌표 기준 정사각 */
  render(ctx) {
    for (const e of this.items) {
      const s = e.size;
      e.sprite.draw(ctx, e.x - s / 2, e.y - s / 2, s, s);
    }
  }

  /** 모든 이펙트 제거 */
  clear() { this.items.length = 0; }

  /** 현재 활성 이펙트 수 */
  get count() { return this.items.length; }
}

// ═══════════════════════════════════════════════════════════
// Genre — 장르별 모듈 마운트 포인트
// 각 장르 모듈은 /engine/genres/{genre}.js에서 IX.Genre.{Name}에 등록
// ═══════════════════════════════════════════════════════════
const Genre = {};

// ═══════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════
return {
  Engine, Input, Sound, Tween, Particles, AssetLoader,
  UI, Save, MathUtil, Layout, Sprite,
  Button, Scene, StateGuard, GameFlow,
  Pool, SpatialHash, PopupText, EffectQueue,
  Genre,
};

})();
