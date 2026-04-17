---
name: game-template
description: IX.GameFlow 기반 HTML5 게임 스켈레톤 템플릿 제공. 새 게임을 만들 때(cycle 코딩 단계 시작 시) 항상 사용해 공통 구조를 강제한다. 중복 상태머신 재구현을 방지하는 목적.
---

# InfiniTriX 게임 스켈레톤 템플릿

새 게임(index.html)의 **첫 줄부터 이 템플릿으로 시작**할 것. 자체 state machine, 자체 버튼 hit-test, 맨 setTimeout/addEventListener 를 쓰면 안 된다.

## 사용 시점

- Cycle pipeline 의 코더 단계에서 **새 index.html 을 처음 작성할 때**
- 기존 게임을 리팩토링할 때, 구조를 이 템플릿에 맞추는 용도

## 캐노니컬 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
<title>[게임 제목]</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#0a0a1a;touch-action:none;user-select:none;-webkit-user-select:none}
canvas{display:block;width:100%;height:100%}
</style>
</head>
<body>
<canvas id="gameCanvas"></canvas>
<script src="/engine/ix-engine.js"></script>
<script>
'use strict';
const { Engine, Input, Sound, Tween, Particles, AssetLoader, UI, Save, MathUtil, Layout, Sprite, Button, Scene, GameFlow, StateGuard, Genre } = IX;

// ── 게임 전역 상태 — resetGameState()에서 반드시 모두 초기화 ──
let score, lives, level, wave, combo, paused;
const entities = [];
const projectiles = [];
const pickups = [];

function resetGameState() {
  score = 0;
  lives = 3;
  level = 1;
  wave = 1;
  combo = 0;
  paused = false;
  entities.length = 0;
  projectiles.length = 0;
  pickups.length = 0;
  // 여기에 모든 전역 변수/배열 초기화 — 빠뜨리면 재시작 시 상태 누수
}

const engine = new Engine('gameCanvas');
const input = new Input(engine.canvas);
const sound = new Sound();
const tween = new Tween();
const particles = new Particles(300);
const assets = new AssetLoader();

async function init() {
  // 1. 에셋 로드 (10초 타임아웃)
  const manifest = await fetch('assets/manifest.json').then(r => r.json()).catch(() => null);
  if (manifest?.assets) {
    const map = {};
    for (const [k, v] of Object.entries(manifest.assets)) map[k] = 'assets/' + v.file;
    await assets.load(map, { timeoutMs: 10000 });
  }

  // 2. Scene 에 tween/particles 연결 → 전환 시 자동 clear
  Scene.bind({ tween, particles });

  // 3. GameFlow 초기화 — BOOT/TITLE/GAMEOVER 는 자동, PLAY 만 구현
  GameFlow.init({
    titleText: '[게임 제목]',
    play: {
      enter: () => {
        // PLAY 진입 시 HUD 버튼 생성 — Scene.cleanup 이 전환 시 정리
        const w = window.innerWidth;
        new Button({
          x: w - 90, y: 10, w: 80, h: 36, text: 'PAUSE',
          key: 'KeyP', color: '#333',
          onClick: () => { paused = !paused; },
        });
      },
      update: (dt, inp) => {
        if (paused) return;
        // 게임 로직
        tween.update(dt);
        particles.update(dt);
        // 게임 오버 예시: if (lives <= 0) GameFlow.gameOver({ score });
      },
      render: (ctx, w, h) => {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, w, h);
        particles.render(ctx);
        UI.text(ctx, 'SCORE ' + score, 16, 24, { size: 18, align: 'left', color: '#fff' });
        if (paused) {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(0, 0, w, h);
          UI.text(ctx, 'PAUSED', w/2, h/2, { size: 48, bold: true, color: '#fff' });
        }
      },
    },
    onReset: resetGameState,
    stuckMs: 45000,
  });

  // 4. Engine 루프를 Scene에 위임
  engine._update = (dt) => {
    Scene.update(dt, input);
    input.flush();
  };
  engine._render = (ctx, w, h) => {
    Scene.render(ctx, w, h);
  };

  resetGameState();
  GameFlow.start();
  engine.start();
}
init();
</script>
</body>
</html>
```

## 절대 규칙

1. **자체 상태 머신 금지** — TRANSITION_TABLE, ACTIVE_SYSTEMS, setState 등 재구현 X
2. **모든 버튼은 new Button({ key, onClick })** — 키보드 단축키 필수
3. **setTimeout/setInterval/addEventListener 직접 호출 금지** — IX.Scene.setTimeout/setInterval/on 사용
4. **resetGameState()에 모든 변수** 초기화 — 배열은 `.length = 0` 로, 재시작 3회 반복해도 누수 없어야 함
5. **manifest.json 의 art-style** 을 Canvas 배경/UI 컬러에도 반영

## 장르별 확장 포인트

- 로그라이크: `const dungeon = Genre.Roguelike.generate(seed)` (장르 모듈 활용)
- 매치3: `const board = new Genre.Match3.Board(8, 8)` (이미 존재)
- 플랫포머: `const phys = new Genre.Platformer.PlatformPhysics()` (이미 존재)

장르 모듈이 없으면 **엔진 승격 단계에서 생성**하고 다음 사이클부터 사용.
