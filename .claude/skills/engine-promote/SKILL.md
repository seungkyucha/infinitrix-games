---
name: engine-promote
description: 방금 만든 게임 코드에서 재사용 가능한 함수/모듈을 IX Engine 또는 장르 모듈로 이동하는 체계적 절차. 코더의 엔진 승격 phase에서 반드시 사용. 다음 사이클에서 같은 코드가 중복 재작성되는 것을 방지.
---

# 엔진 승격 프로토콜

"버그가 다음 게임에서 재현되지 않도록" 하려면 **개별 게임의 해결책을 공통 엔진으로 끌어올려야** 한다. 이 스킬은 그 작업의 표준 절차.

## 사용 시점

- cycle pipeline 의 `[5.8/7] 엔진 승격` phase
- 코더가 같은 함수를 두 번째 게임에서 발견했을 때

## 절차

### 1. 스캔

```bash
# 현재 사이클 게임의 script 본문 추출
awk '/<script>/,/<\/script>/' public/games/<game-id>/index.html > /tmp/game.js

# 엔진·장르 모듈 현재 상태 파악
ls public/engine/genres/
grep -n "^\s*class\|^\s*const\s" public/engine/ix-engine.js | head -40
```

### 2. 후보 식별

**승격 후보 기준** (셋 중 하나 해당):

| 유형 | 예시 | 이동처 |
|------|------|--------|
| 범용 수학/유틸 | clamp2D, wrapAngle, easeOutBack | `ix-engine.js` MathUtil / UI / Layout |
| 범용 렌더 패턴 | drawRoundedRect, drawHUDBar | `ix-engine.js` UI |
| 장르 공통 메커니즘 | 타워 디펜스의 경로 유도, 로그라이크의 상자 루트 | `engine/genres/<genre>.js` |

**승격 금지** (이번 게임에만 적합):
- 게임 전용 상태 변수를 클로저로 캡처하는 함수
- 특정 에셋 이름에 의존하는 코드
- 테스트/디버그 헬퍼

### 3. 이동 방법

**범용 유틸 추가** — `public/engine/ix-engine.js`:

```javascript
const MathUtil = {
  // 기존 ...
  clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
  // ↓ 추가
  clamp2D: (x, y, minX, maxX, minY, maxY) => [
    Math.max(minX, Math.min(maxX, x)),
    Math.max(minY, Math.min(maxY, y)),
  ],
};
```

**장르 모듈 추가/신규 생성** — `public/engine/genres/<genre>.js`:

```javascript
// public/engine/genres/roguelike.js (새로 만든다면)
(function() {
  if (!window.IX || !window.IX.Genre) return;
  class DungeonGen { /* ... */ }
  class LootTable { /* ... */ }
  IX.Genre.Roguelike = { DungeonGen, LootTable };
})();
```

> 새 장르 모듈을 만들 경우 `public/engine/genres/README.md` 에 한 줄 추가.

### 4. 게임 index.html 갱신

승격한 함수 호출을 IX 경로로 변경:

```javascript
// before
function drawHUDBar(ctx, x, y, w, h, value, max) { ... }
drawHUDBar(ctx, 10, 10, 200, 20, hp, 100);

// after (승격됨)
UI.hpBar(ctx, 10, 10, 200, 20, hp, 100);  // IX.UI.hpBar 활용
```

### 5. 검증

```bash
# 엔진 파싱 확인
node -e "const fs=require('fs'); const s=fs.readFileSync('public/engine/ix-engine.js','utf8'); new Function(s); console.log('OK')"

# 게임 HTML 에 승격 후 사용한 모듈 확인
grep -n "IX\.\|IX\.Genre\." public/games/<game-id>/index.html | head
```

### 6. 보고서 작성

`docs/engine-notes/cycle-N-promotion.md`:

```markdown
---
cycle: N
game: <game-id>
---

## 승격 완료
- `MathUtil.clamp2D` (범용) — <사유>
- `Genre.Roguelike.DungeonGen` (신규 장르 모듈) — <사유>

## 보류
- `spawnBossPattern(x, y)` — 현재 게임 전용 상태 사용. 범용화 필요.

## 향후 후보
- `waveGrowthCurve(wave)` — 타워 디펜스/서바이벌 양쪽에 쓰일 패턴. 두 게임에서 보이면 승격.
```

## 체크리스트

- [ ] 이번 게임 script 본문 전체 스캔
- [ ] 범용 후보 ≥ 1개 / 장르 후보 ≥ 0개 리스트업
- [ ] 하위 호환: 기존 엔진 API 변경 없음 (추가만)
- [ ] 엔진 파일 파싱 확인
- [ ] 게임이 승격된 모듈을 실제로 호출하도록 수정
- [ ] `docs/engine-notes/cycle-N-promotion.md` 저장
