---
game-id: mini-tower-defense
title: 미니 타워 디펜스
genre: strategy
difficulty: medium
---

# 미니 타워 디펜스 (Mini Tower Defense) — 상세 기획서

> **Cycle:** 3
> **작성일:** 2026-03-20
> **기획:** Claude (Game Designer)
> **근거:** `docs/analytics/cycle-3-report.md` 분석 보고서 기반

---

## 0. 이전 사이클 피드백 반영

> Cycle 2 "스타 가디언" 포스트모템에서 지적된 문제점과 다음 사이클 제안을 **명시적으로** 반영합니다.

### 0-1. Cycle 2 문제 해결 매핑

| Cycle 2 문제 / 제안 | 심각도 | Cycle 3 반영 방법 |
|---------------------|--------|-------------------|
| **[B1/B2] CONFIRM_MODAL·PAUSE에서 Tween 미업데이트** — 모달이 alpha=0 고정 | CRITICAL | → **§8 상태 × 시스템 매트릭스**를 기획서에 사전 정의. 모든 상태에서 tween 업데이트 여부를 명시하고, 코드 상단 주석으로 이중 보장 |
| **[B3] setTimeout(600)으로 게임오버 전환** — C1에서 지적 후 C2 재발 | MAJOR | → **setTimeout 완전 금지**. 모든 상태 전환을 tween onComplete 콜백으로 구현. 기획서 내 모든 전환에 tween 명세 포함 |
| **[B4] NEW BEST 판정 순서 오류** — saveBest() 후 비교하면 항상 false | MAJOR | → **"판정 먼저, 저장 나중에"** 규칙을 §7 점수 시스템에 명시. `isNewBest = score > getBest()` → `saveBest(score)` 순서 고정 |
| **[B5] SVG feGaussianBlur 배경 사각형 노출** | MINOR | → **SVG 필터 완전 미사용**. 모든 에셋을 순수 Canvas Path2D 드로잉으로 생성 |
| 이벤트 리스너 cleanup 미구현 (C2 미해결) | 제안 | → **game.destroy()** 패턴 표준화. 모든 addEventListener에 대응하는 removeEventListener를 destroy()에 등록 |
| easeOutElastic 누락 (C2 미해결) | 제안 | → **이징 함수 5종 완전 구현**: linear, easeOutQuad, easeInQuad, easeOutBack, easeOutElastic |
| 전략/시뮬레이션 장르 도전 | 제안 | → **타워 디펜스 (strategy)** 장르 선택. CrazyGames 전략 상위 7개 중 5개가 TD |
| 절차적 사운드(Web Audio API) 실험 | 제안 | → **Web Audio API로 효과음 4종** 생성 (타워 공격, 적 처치, 웨이브 시작, 게임오버). 외부 에셋 0개 원칙 유지 |

### 0-2. platform-wisdom.md 검증된 패턴 계승

| 성공 패턴 | 적용 |
|-----------|------|
| 단일 HTML + Canvas + Vanilla JS | 동일 아키텍처 유지 |
| 게임 상태 머신 | LOADING → TITLE → WAVE_PREP → PLAYING → PAUSE → CONFIRM_MODAL → GAMEOVER (7상태) |
| DPR 대응 (Canvas 내부 해상도 ≠ CSS) | 동일 적용 |
| localStorage try-catch | 동일 적용 (iframe sandbox 대응) |
| TweenManager + ObjectPool 재사용 | 핵심 인프라로 채택 (이징 5종 완전 구현) |
| 기획서에 HEX/수식 명시 | 모든 수치/공식/색상 코드 명시 (구현 충실도 목표 95%) |
| Canvas 기반 모달 (confirm/alert 금지) | 모든 확인 UI를 Canvas 모달로 구현 |
| 관대한 히트박스 | 타워 사거리 판정에 +8px 관용 적용 |
| 코드 폴백 렌더링 | 에셋 로드 실패 시 Canvas 드로잉 폴백 100% 동작 보장 |

---

## 1. 게임 개요 및 핵심 재미 요소

### 컨셉
판타지 세계를 배경으로 **8×6 그리드 위에 타워를 전략적으로 배치하여 고정 경로를 따라 이동하는 적 웨이브를 방어**하는 클래식 타워 디펜스 게임입니다. 3종 타워(아처·마법사·캐논) × 3단계 업그레이드, 웨이브 기반 난이도 상승, 골드 경제 시스템으로 "어디에 무엇을 얼마나 투자하느냐"의 전략적 선택을 제공합니다.

### 핵심 재미 요소
1. **전략적 배치의 쾌감** — 제한된 골드로 타워 조합과 위치를 최적화하는 퍼즐적 재미
2. **점진적 파워 성장** — 웨이브 클리어 보상으로 타워를 업그레이드하며 강해지는 성장 판타지
3. **위기 돌파의 성취감** — 적이 막 통과하려는 순간 간신히 막아내는 아슬아슬한 스릴
4. **타워 콤보 시너지** — 아처(빠른 단일)·마법사(범위 감속)·캐논(느린 폭발)의 상호 보완 전략
5. **짧고 집중적인 세션** — 한 판 5~10분. 20웨이브 클리어 또는 라이프 소진 시 종료

---

## 2. 게임 규칙 및 목표

### 2.1 기본 규칙
- **고정 경로 타워 디펜스** — 적은 맵 좌측 입구에서 우측 출구까지 미리 정해진 S자 경로를 따라 이동
- 플레이어는 경로가 아닌 빈 타일에 **타워를 배치**하여 지나가는 적을 공격
- 각 타워는 **사거리 내 가장 앞선 적**을 자동 공격 (타겟팅: First)
- 적이 출구에 도달하면 **라이프 1 감소** (초기 라이프: 20)
- 라이프가 0이 되면 **게임 오버**
- **20웨이브 전체 클리어** 시 승리 (Victory) — 남은 라이프 × 50 보너스 점수

### 2.2 경제 시스템
- **초기 골드:** 100G
- **적 처치 보상:** 적 유형별 상이 (§2.4 참조)
- **웨이브 클리어 보너스:** `20 + wave × 5` G
- **타워 판매:** 총 투자 비용(구매 + 업그레이드)의 **60%** 반환
- 골드가 부족하면 타워 배치/업그레이드 **불가** (UI 회색 처리 + 흔들림 tween 피드백)

### 2.3 타워 (3종 × 3단계)

#### 아처 타워 (Archer Tower) — 빠른 단일 공격
| 단계 | 비용 | 공격력 | 사거리 | 공격 속도 | 색상 |
|------|------|--------|--------|-----------|------|
| Lv.1 | 25G | 8 | 90px | 600ms | `#4CAF50` (녹색) |
| Lv.2 | 30G | 15 | 100px | 500ms | `#66BB6A` |
| Lv.3 | 50G | 25 | 115px | 400ms | `#81C784` |

- **투사체:** 빠른 화살 (`600px/s`), 단일 적 대상
- **특성:** 가장 저렴하고 빠름. 초반 주력. 업그레이드 시 연사력 증가

#### 마법사 타워 (Mage Tower) — 범위 감속
| 단계 | 비용 | 공격력 | 사거리 | 공격 속도 | 감속률 | 색상 |
|------|------|--------|--------|-----------|--------|------|
| Lv.1 | 50G | 12 | 80px | 1000ms | 30% | `#7E57C2` (보라) |
| Lv.2 | 40G | 22 | 90px | 900ms | 40% | `#9575CD` |
| Lv.3 | 65G | 35 | 100px | 800ms | 50% | `#B39DDB` |

- **투사체:** 마법 구체 (`400px/s`), 착탄 시 **반경 30px 범위 피해 + 감속 1.5초**
- **특성:** 적 무리를 느리게 만들어 다른 타워의 DPS 시간을 벌어줌. 핵심 콤보 타워

#### 캐논 타워 (Cannon Tower) — 폭발 광역
| 단계 | 비용 | 공격력 | 사거리 | 공격 속도 | 폭발 반경 | 색상 |
|------|------|--------|--------|-----------|-----------|------|
| Lv.1 | 75G | 25 | 85px | 1500ms | 35px | `#EF5350` (빨강) |
| Lv.2 | 55G | 45 | 95px | 1300ms | 40px | `#E57373` |
| Lv.3 | 80G | 70 | 105px | 1100ms | 50px | `#EF9A9A` |

- **투사체:** 포탄 (`300px/s`), 포물선 궤적(시각적), 착탄 시 **폭발 범위 피해**
- **특성:** 가장 비싸고 느리지만 밀집 적에게 최대 효율. 후반 핵심

### 2.4 적 유형 (4종)

| 적 유형 | 색상 | HP | 이동 속도 | 처치 보상 | 등장 웨이브 | 특수 |
|---------|------|-----|-----------|-----------|------------|------|
| **고블린** (Goblin) | `#8BC34A` | 20 | 40px/s | 5G | 1+ | 없음 |
| **오크** (Orc) | `#FF9800` | 60 | 30px/s | 12G | 4+ | 없음 |
| **다크 나이트** (Dark Knight) | `#546E7A` | 120 | 25px/s | 20G | 8+ | 방어력 3 (피해 = max(1, dmg - 3)) |
| **스피드 러너** (Speed Runner) | `#E040FB` | 30 | 70px/s | 15G | 6+ | 감속 효과 50% 감소 |

- 모든 적의 **시각 크기: 24×24px**, **판정 히트박스: 20×20px** (관대한 판정)
- 적 처치 시 **폭발 파티클 8개** + **골드 팝업 텍스트** (+5G 등) tween fadeUp

### 2.5 웨이브 시스템 (20웨이브)

```
웨이브 N의 적 수: min(20, 5 + N × 1.5) (반올림)
적 스폰 간격: max(500, 2000 - N × 80) ms
적 HP 배율: 1 + (N - 1) × 0.12
```

| 웨이브 | 적 구성 | 특이 사항 |
|--------|---------|-----------|
| 1~3 | 고블린 100% | 입문 구간, 아처 타워 학습 |
| 4~5 | 고블린 70% + 오크 30% | 오크 첫 등장, 마법사 필요성 |
| 6~7 | 고블린 40% + 오크 30% + 러너 30% | 러너 첫 등장, 빠른 적 대응 |
| 8~10 | 고블린 20% + 오크 30% + 다크나이트 20% + 러너 30% | 다크나이트 등장, 캐논 필요성 |
| 11~15 | 고블린 10% + 오크 30% + 다크나이트 30% + 러너 30% | 본격 혼합, 업그레이드 필수 |
| 16~19 | 오크 25% + 다크나이트 40% + 러너 35% | 고난이도, 최적 배치 요구 |
| 20 | 다크나이트 50% + 러너 50% (HP ×2.0) | **최종 웨이브** — 엘리트 적, 승리 도전 |

---

## 3. 조작 방법

### 3.1 마우스 (PC 기본)
| 조작 | 동작 |
|------|------|
| **좌클릭 빈 타일** | 타워 구매 메뉴 열기 (3종 타워 아이콘 표시) |
| **좌클릭 타워 아이콘** | 해당 타워 배치 (골드 차감) |
| **좌클릭 기존 타워** | 타워 정보 패널 열기 (업그레이드/판매 버튼) |
| **우클릭 / ESC** | 메뉴·패널 닫기 |
| **P키** | 일시정지 토글 |
| **Space** | 웨이브 조기 시작 (WAVE_PREP 상태에서) |

### 3.2 키보드 단축키
| 키 | 동작 |
|----|------|
| `1` | 아처 타워 선택 (빈 타일 클릭 후) |
| `2` | 마법사 타워 선택 |
| `3` | 캐논 타워 선택 |
| `U` | 선택된 타워 업그레이드 |
| `S` | 선택된 타워 판매 |
| `R` | 게임오버 시 재시작 (Canvas 모달 확인) |
| `P` / `ESC` | 일시정지 토글 |

### 3.3 터치 (모바일)
| 조작 | 동작 |
|------|------|
| **탭 빈 타일** | 타워 구매 메뉴 열기 |
| **탭 타워 아이콘** | 해당 타워 배치 |
| **탭 기존 타워** | 타워 정보 패널 열기 |
| **탭 빈 영역** | 메뉴·패널 닫기 |
| **일시정지 버튼 (우상단)** | 일시정지 토글 |
| **웨이브 시작 버튼** | WAVE_PREP에서 조기 시작 |

> **입력 모드 자동 감지**: 첫 입력에 따라 마우스/터치 모드를 자동 설정. 이후 입력 변경 시 즉시 전환. 터치 모드에서는 호버 미리보기 숨김, 버튼 크기 1.5배 확대.

---

## 4. 시각적 스타일 가이드

### 4.1 색상 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| **배경 (잔디)** | `#2E7D32` | 짙은 녹색 기본 타일 |
| **경로** | `#5D4037` | 갈색 흙길 |
| **경로 테두리** | `#795548` | 밝은 갈색 경로 가장자리 |
| **그리드 라인** | `#388E3C` (20% alpha) | 은은한 그리드 |
| **UI 배경** | `#1B2631` (85% alpha) | 반투명 다크 |
| **UI 텍스트** | `#ECF0F1` | 밝은 회색 |
| **골드 텍스트** | `#FFD700` | 골드 강조 |
| **라이프 텍스트** | `#E74C3C` | 빨간 하트 |
| **웨이브 텍스트** | `#F39C12` | 주황 강조 |
| **배치 가능 하이라이트** | `#FFFFFF` (20% alpha) | 호버 시 밝아짐 |
| **사거리 표시** | `#FFFFFF` (15% alpha) | 타워 선택 시 원형 |
| **아처 계열** | `#4CAF50` → `#81C784` | 녹색 (단계별 밝아짐) |
| **마법사 계열** | `#7E57C2` → `#B39DDB` | 보라 (단계별 밝아짐) |
| **캐논 계열** | `#EF5350` → `#EF9A9A` | 빨강 (단계별 밝아짐) |
| **고블린** | `#8BC34A` | 연두 |
| **오크** | `#FF9800` | 주황 |
| **다크나이트** | `#546E7A` | 회청 |
| **스피드러너** | `#E040FB` | 핑크 |

### 4.2 배경
- **8열 × 6행 그리드** (각 타일 `64×64px`, 총 게임 영역 `512×384px`)
- 상단 HUD 바: 높이 `40px` (웨이브, 골드, 라이프 표시)
- 하단 타워 구매 바: 높이 `48px` (3종 타워 + 비용 표시)
- **Canvas 전체 크기:** `512 × 472px` (384 + 40 + 48)
- 잔디 타일: `#2E7D32` 바탕에 랜덤 `#388E3C` 점(3~5개/타일)으로 텍스처 표현
- 경로 타일: `#5D4037` 바탕에 `#795548` 점선 테두리

### 4.3 오브젝트 형태 (순수 Canvas 드로잉 — SVG 필터 미사용)

| 오브젝트 | 드로잉 방식 |
|----------|------------|
| **아처 타워** | 녹색 사각 기반 + 상단 삼각 지붕 + 활 모양 호(arc) |
| **마법사 타워** | 보라 원통 기반 + 상단 뾰족 삼각 + 빛나는 구체(반투명 원) |
| **캐논 타워** | 빨간 사각 기반 + 포신(굵은 직선) + 바퀴(작은 원 2개) |
| **고블린** | 연두 원 + 뾰족 귀(삼각 2개) + 눈(흰 점 2개) |
| **오크** | 주황 큰 원 + 작은 눈(흰 점 2개) + 아래턱(호) |
| **다크나이트** | 회청 사각(방패) + 상단 삼각(투구) + 작은 칼(직선) |
| **스피드러너** | 핑크 마름모 + 속도선(뒤쪽 짧은 선 3개) |
| **투사체 (화살)** | 길이 8px 직선 + 촉(작은 삼각) |
| **투사체 (마법)** | 반경 4px 원 + 글로우(반투명 큰 원) |
| **투사체 (포탄)** | 반경 5px 원 + 포물선 그림자 |
| **폭발 이펙트** | 확장 + 페이드 원 (tween scaleUp + fadeOut) |
| **감속 이펙트** | 파란 반투명 원이 적 주위에서 수축 (tween) |

### 4.4 폰트
- **시스템 폰트 스택만 사용** (외부 CDN 의존 0개):
  ```
  'Segoe UI', system-ui, -apple-system, sans-serif
  ```
- HUD 텍스트: `14px bold`
- 웨이브 타이틀: `32px bold`
- 골드 팝업: `12px bold`
- 메뉴/모달: `16px`

---

## 5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 메인 루프 (`requestAnimationFrame`)

```
function loop(timestamp) {
  const dt = min((timestamp - lastTime) / 1000, 0.05);  // 최대 50ms 캡
  lastTime = timestamp;

  switch (state) {
    case LOADING:     updateLoading();                    break;
    case TITLE:       tw.update(dt); renderTitle();       break;
    case WAVE_PREP:   tw.update(dt); renderGame(); renderWavePrep(); break;
    case PLAYING:     updateGame(dt); tw.update(dt); renderGame(); break;
    case PAUSE:       tw.update(dt); renderGame(); renderPause(); break;
    case CONFIRM_MODAL: tw.update(dt); renderGame(); renderModal(); break;
    case GAMEOVER:    tw.update(dt); renderGame(); renderGameover(); break;
  }

  requestAnimationFrame(loop);
}
```

### 5.2 updateGame(dt) 상세 흐름

```
1. WaveManager.update(dt)
   → 스폰 타이머 확인 → 적 생성 (ObjectPool.acquire)
   → 웨이브 완료 검사 → state = WAVE_PREP 전환 (tween onComplete)

2. Enemies.forEach(enemy => {
   → enemy.moveAlongPath(dt)          // 경로 웨이포인트 따라 이동
   → enemy.updateSlowEffect(dt)       // 감속 타이머 감소
   → if (enemy.reachedExit) { lives--; pool.release(enemy); }
   → if (enemy.hp <= 0) { gold += reward; spawnDeathFX(); pool.release(enemy); }
   })

3. Towers.forEach(tower => {
   → tower.updateCooldown(dt)
   → tower.findTarget(enemies)        // 사거리 내 가장 앞선 적
   → if (target && ready) tower.fire() // 투사체 생성 (ObjectPool.acquire)
   })

4. Projectiles.forEach(proj => {
   → proj.moveToward(target, dt)
   → if (proj.hitTarget()) { applyDamage(); spawnHitFX(); pool.release(proj); }
   })

5. Particles.update(dt)               // 시각 이펙트 업데이트

6. checkGameOver()
   → if (lives <= 0) { state = GAMEOVER; ... }
```

### 5.3 렌더링 순서 (Z-order)

```
1. 배경 (잔디 + 경로)        — 캐시된 offscreen canvas
2. 그리드 라인                — 배치 가능 타일 하이라이트
3. 사거리 표시                — 선택된 타워의 원형 범위
4. 적 (경로 위)               — HP 바 포함
5. 타워                       — 단계별 시각 차이
6. 투사체                     — 화살/마법/포탄
7. 파티클/이펙트              — 폭발, 감속, 골드 팝업
8. HUD (상단)                 — 웨이브, 골드, 라이프
9. 타워 구매 바 (하단)        — 3종 타워 버튼
10. 타워 정보 패널            — 업그레이드/판매 (선택 시)
11. 오버레이 (웨이브 텍스트/모달) — 반투명 배경 위
```

---

## 6. 난이도 시스템

### 6.1 웨이브 기반 난이도 스케일링

| 파라미터 | 공식 | 웨이브 1 | 웨이브 10 | 웨이브 20 |
|----------|------|----------|-----------|-----------|
| 적 수 | `min(20, floor(5 + N × 1.5))` | 6 | 20 | 20 |
| 스폰 간격 | `max(500, 2000 - N × 80)` ms | 1920ms | 1200ms | 500ms |
| 적 HP 배율 | `1 + (N - 1) × 0.12` | ×1.00 | ×2.08 | ×3.28 |
| 웨이브 보너스 | `20 + N × 5` G | 25G | 70G | 120G |

### 6.2 동적 밸런스 보정
- **연속 3웨이브 라이프 무손실 클리어** → 다음 웨이브 적 HP 배율 `+0.15` 추가 (숙련자 도전)
- **라이프 5 이하** → 적 처치 골드 보상 `×1.3` (구제 메카닉, UI에 "위기 보너스!" 표시)

### 6.3 경로 설계 (S자형 고정 경로)

```
맵 좌표 (col, row) — 0-indexed, 8×6 그리드

입구: (-1, 1) → (0,1) → (1,1) → (2,1) → (3,1) → (4,1) → (5,1)
                                                              ↓
                 (5,2) → (4,2) → (3,2) → (2,2) → (1,2) → (0,2)  ← 아래 없어도 됨
                                                              ↓     이건 내려가야 함
실제 S자:
  (0,1)→(5,1)↓(5,2)→(5,3)←(0,3)↓(0,4)→(5,4)↓(5,5)→출구(8,5)

상세 웨이포인트 (타일 중심 좌표):
  START → (0,1) → (5,1) → (5,3) → (0,3) → (0,4) → (5,4) → (7,4) → EXIT

경로 타일 목록:
  Row 1: col 0~5  (오른쪽 이동)
  Col 5: row 1~3  (아래 이동)
  Row 3: col 5~0  (왼쪽 이동)
  Col 0: row 3~4  (아래 이동)
  Row 4: col 0~7  (오른쪽 이동 → 출구)
```

> 경로 타일은 게임 시작 시 `PATH_TILES[]` 배열로 사전 계산. 배치 불가 타일로 마킹.
> 적은 웨이포인트 배열을 순서대로 따라 이동하며, 각 웨이포인트 도달 시 다음 방향으로 전환.

---

## 7. 점수 시스템

### 7.1 점수 획득

| 행동 | 점수 |
|------|------|
| 고블린 처치 | 50점 |
| 오크 처치 | 120점 |
| 다크나이트 처치 | 200점 |
| 스피드러너 처치 | 150점 |
| 웨이브 클리어 보너스 | `wave × 100`점 |
| 승리 보너스 (20웨이브 클리어) | `남은 라이프 × 500`점 |
| 타워 업그레이드 없이 웨이브 클리어 | `+200`점 (미니멀리스트 보너스) |

### 7.2 최고 점수 처리 순서 (B4 교훈 반영)

```javascript
// ⚠️ 반드시 이 순서 — "판정 먼저, 저장 나중에"
const isNewBest = score > getBest();     // 1. 판정
saveBest(score);                          // 2. 저장
if (isNewBest) showNewBestEffect();       // 3. 연출
```

### 7.3 localStorage 키
- `mtd_bestScore` — 최고 점수
- `mtd_bestWave` — 최고 도달 웨이브
- 모든 접근은 `try { ... } catch(e) { /* silent */ }` 래핑

---

## 8. 상태 × 시스템 업데이트 매트릭스 ⭐

> **Cycle 2 B1/B2의 근본 원인 해결.** 이 매트릭스는 코드 상단 주석으로도 그대로 복사할 것.

| 게임 상태 | TweenMgr | WaveMgr | Enemies | Towers | Projectiles | Particles | Input | Render | SFX |
|-----------|----------|---------|---------|--------|-------------|-----------|-------|--------|-----|
| **LOADING** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | loading화면 | ✗ |
| **TITLE** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | start만 | title화면 | ✗ |
| **WAVE_PREP** | **✓** | ✗ | ✗ | ✗ | ✗ | **✓** | 배치+start | game+prep UI | ✗ |
| **PLAYING** | **✓** | **✓** | **✓** | **✓** | **✓** | **✓** | 배치+pause | game | **✓** |
| **PAUSE** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | resume만 | game+pause오버레이 | ✗ |
| **CONFIRM_MODAL** | **✓** | ✗ | ✗ | ✗ | ✗ | ✗ | 예/아니오 | game+modal오버레이 | ✗ |
| **GAMEOVER** | **✓** | ✗ | ✗ | ✗ | ✗ | **✓** | restart만 | game+결과화면 | ✗ |

> **핵심 규칙:** TweenManager는 **모든 상태에서 항상 업데이트**한다. 어떤 상태에서든 UI 애니메이션(모달 페이드인, 텍스트 스케일 등)이 동작해야 하기 때문이다.

---

## 9. 상태 전환 흐름 (setTimeout 완전 금지)

```
LOADING ──(에셋 로드 완료)──→ TITLE
                              │
TITLE ──(클릭/탭/Space)──→ WAVE_PREP
                              │
WAVE_PREP ──(Space/탭 또는 3초 tween 카운트다운 onComplete)──→ PLAYING
                              │
PLAYING ──(웨이브 전체 적 소멸)──→ WAVE_PREP (tween: "WAVE CLEAR!" 1.5초 fadeOut onComplete)
PLAYING ──(P키/일시정지 버튼)──→ PAUSE
PLAYING ──(라이프 ≤ 0)──→ GAMEOVER (tween: 화면 적색 플래시 0.8초 onComplete)
                              │
PAUSE ──(P키/resume 버튼)──→ PLAYING
PAUSE ──(R키)──→ CONFIRM_MODAL
                              │
CONFIRM_MODAL ──(예)──→ TITLE (게임 리셋)
CONFIRM_MODAL ──(아니오/ESC)──→ PAUSE
                              │
GAMEOVER ──(R키/재시작 버튼)──→ TITLE (게임 리셋)
PLAYING ──(20웨이브 클리어)──→ GAMEOVER (Victory 모드, tween: 승리 연출)
```

> **모든 지연 전환은 tween의 onComplete 콜백으로 처리.** `setTimeout` 사용 금지.

---

## 10. 핵심 시스템 설계

### 10.1 TweenManager (Cycle 2 인프라 계승 + 개선)

```javascript
// API
tw.add(target, { alpha: 1, scale: 1.2 }, 500, 'easeOutBack', () => { ... });
tw.update(dt);    // 매 프레임 호출 (모든 상태에서!)
tw.cancelAll();   // deferred 패턴으로 안전하게 취소

// 이징 함수 5종 완전 구현
const EASING = {
  linear:       t => t,
  easeOutQuad:  t => t * (2 - t),
  easeInQuad:   t => t * t,
  easeOutBack:  t => 1 + (--t) * t * (2.70158 * t + 1.70158),
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 :
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1
};
```

**동시 호출 보호 (Cycle 2 교훈):**
- `update()` 중 `cancelAll()` 호출 시 → `_pendingCancel = true` 플래그 → update 완료 후 실제 제거 (deferred 패턴)
- 역순 순회로 splice 안전성 보장

### 10.2 ObjectPool (Cycle 2 인프라 계승)

```javascript
// 풀링 대상: 적(4종), 투사체(3종), 파티클
const pools = {
  enemy:      new ObjectPool(() => new Enemy(), 30),
  projectile: new ObjectPool(() => new Projectile(), 50),
  particle:   new ObjectPool(() => new Particle(), 80)
};

// acquire/release + 역순 순회 패턴
for (let i = activeList.length - 1; i >= 0; i--) {
  if (activeList[i].dead) {
    pools[type].release(activeList.splice(i, 1)[0]);
  }
}
```

### 10.3 Web Audio API — 절차적 효과음 (신규)

> Cycle 2 제안 "절차적 사운드 실험" 반영. 외부 에셋 0개로 효과음 생성.

```javascript
// AudioContext 초기화 (첫 사용자 인터랙션 시)
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { /* 사운드 비활성 — 게임플레이 영향 없음 */ }
  }
}

// 효과음 4종
function sfxShoot(type) {
  // 아처: 짧은 고음 삐 (800Hz, 50ms, triangle)
  // 마법사: 중음 스윕 (400→600Hz, 150ms, sine)
  // 캐논: 저음 쿵 (120Hz, 200ms, sawtooth + lowpass)
}
function sfxKill()    { /* 팝 효과: 1200Hz→200Hz 100ms sine 감쇠 */ }
function sfxWave()    { /* 짧은 팡파르: 440→880Hz 300ms square */ }
function sfxGameover(){ /* 하강음: 400→100Hz 500ms sawtooth */ }
```

- 모든 SFX 호출은 `try-catch` 래핑 — 오디오 실패 시 무시
- PLAYING 상태에서만 SFX 재생 (매트릭스 참조)
- 볼륨: 0.3 (기본), 향후 옵션 추가 가능

### 10.4 game.destroy() 패턴 (신규 — Cycle 2 미해결 항목)

```javascript
function destroy() {
  // 1. 게임 루프 중단
  cancelAnimationFrame(rafId);

  // 2. 이벤트 리스너 제거
  registeredListeners.forEach(([el, evt, fn]) => el.removeEventListener(evt, fn));
  registeredListeners.length = 0;

  // 3. ObjectPool 전체 해제
  Object.values(pools).forEach(p => p.clear());

  // 4. TweenManager 전체 취소
  tw.cancelAll();

  // 5. AudioContext 닫기
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
}

// 리스너 등록 헬퍼
function listen(el, evt, fn, opts) {
  el.addEventListener(evt, fn, opts);
  registeredListeners.push([el, evt, fn, opts]);
}
```

---

## 11. UI 레이아웃 상세

### 11.1 상단 HUD (y: 0~40px)

```
┌─────────────────────────────────────────────────────────┐
│  🏰 WAVE 3/20    ⚔️ 12 enemies    💰 145G    ❤️ 18     │
│  [═══════════30%═══════]                    SCORE: 1250 │
└─────────────────────────────────────────────────────────┘
```

- 웨이브 진행 바: 현재 처치 수 / 총 적 수 (녹색 바)
- 골드: `#FFD700`, 변동 시 tween 스케일 펄스
- 라이프: `#E74C3C`, 감소 시 tween 흔들림(shake)
- 점수: 우측 정렬, 변동 시 잠시 밝아짐

### 11.2 하단 타워 바 (y: 424~472px)

```
┌─────────────────────────────────────────────────────────┐
│  [🏹 25G]   [🔮 50G]   [💣 75G]     [⏩ 웨이브 시작]    │
└─────────────────────────────────────────────────────────┘
```

- 각 타워 버튼: 48×40px, 아이콘 + 비용
- 골드 부족 시: 회색 처리 + 비용 빨간색
- 선택 시: 밝은 테두리 강조
- 웨이브 시작 버튼: WAVE_PREP 상태에서만 표시

### 11.3 타워 정보 패널 (타워 클릭 시 팝업)

```
┌───────────────┐
│ 아처 타워 Lv.2 │
│ ATK: 15  SPD: 500ms │
│ 범위: 100px         │
│ ───────────── │
│ [⬆ 업그레이드 50G] │
│ [💰 판매 33G]      │
└───────────────┘
```

- 타워 위에 tween fadeIn으로 표시
- Lv.3이면 업그레이드 버튼 숨김, "MAX" 표시
- 판매 금액 = 총 투자의 60%

---

## 12. 사이드바 메타데이터 (게임 페이지용)

```yaml
game:
  title: "미니 타워 디펜스"
  description: "8×6 그리드 위에 3종 타워를 전략적으로 배치하여 20웨이브의 적 침공을 막아라! 아처·마법사·캐논의 조합과 업그레이드 타이밍이 승패를 결정한다."
  genre: ["strategy"]
  playCount: 0
  rating: 0
  controls:
    - "마우스 클릭: 타워 배치/선택/업그레이드"
    - "1/2/3키: 타워 종류 선택"
    - "U키: 업그레이드, S키: 판매"
    - "P키: 일시정지"
    - "Space: 웨이브 조기 시작"
    - "터치: 탭으로 모든 조작"
  tags:
    - "#타워디펜스"
    - "#전략"
    - "#웨이브서바이벌"
    - "#업그레이드"
    - "#판타지"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

---

## 13. 구현 체크리스트

### 13.1 핵심 기능 (필수)
- [ ] 8×6 그리드 + S자 고정 경로 렌더링
- [ ] 3종 타워 배치/업그레이드/판매
- [ ] 4종 적 경로 이동 + HP 시스템
- [ ] 타워 자동 공격 + 3종 투사체
- [ ] 20웨이브 스폰 시스템 (공식 기반 스케일링)
- [ ] 골드 경제 (수입/지출/판매 반환)
- [ ] 라이프 시스템 (20HP, 적 통과 시 -1)
- [ ] 점수 시스템 + localStorage 최고 기록
- [ ] 7상태 게임 상태 머신
- [ ] TweenManager (이징 5종 완전 구현)
- [ ] ObjectPool (적, 투사체, 파티클)
- [ ] Canvas 기반 모달 (confirm 대체)
- [ ] 상태 × 시스템 매트릭스 코드 주석 포함
- [ ] game.destroy() + 리스너 cleanup
- [ ] 마우스/터치 입력 자동 감지

### 13.2 시각/연출 (필수)
- [ ] 순수 Canvas 드로잉 에셋 (SVG 필터 미사용)
- [ ] 타워 공격 이펙트 (화살/마법/포탄 투사체)
- [ ] 적 처치 폭발 파티클 + 골드 팝업
- [ ] 웨이브 시작/클리어 텍스트 tween 연출
- [ ] 골드 변동 펄스 / 라이프 감소 흔들림
- [ ] 타워 사거리 원형 표시
- [ ] 배치 가능 타일 호버 하이라이트
- [ ] 캐시된 offscreen canvas 배경

### 13.3 사운드 (도전)
- [ ] Web Audio API 절차적 효과음 4종
- [ ] try-catch 래핑 (실패 시 무시)
- [ ] PLAYING 상태에서만 재생

### 13.4 기획서 대조 체크리스트 (코드 리뷰 시)
- [ ] 모든 상태에서 tw.update(dt) 호출 확인
- [ ] setTimeout 사용 0건 확인
- [ ] 점수 판정→저장 순서 확인
- [ ] 미사용 에셋 / 외부 CDN 0개 확인
- [ ] destroy() 패턴으로 모든 리스너 정리 확인
- [ ] 이징 함수 5종 모두 구현 확인
- [ ] Canvas 모달만 사용 (confirm/alert 0건) 확인

---

## 14. 예상 코드 규모

```
예상 줄 수: ~1,000~1,200줄 (Cycle 2 수준)

구조 분배:
  - 상수/설정:       ~80줄   (색상, 타워 스탯, 적 스탯, 경로 데이터)
  - TweenManager:    ~60줄   (Cycle 2 계승 + easeOutElastic 추가)
  - ObjectPool:      ~30줄   (Cycle 2 계승)
  - WaveManager:     ~80줄   (스폰 로직 + 웨이브 구성)
  - Tower 시스템:    ~150줄  (배치, 공격, 업그레이드, 판매)
  - Enemy 시스템:    ~120줄  (이동, HP, 감속, 방어력)
  - Projectile:      ~80줄   (이동, 충돌, 범위 피해)
  - 경제 시스템:     ~40줄   (골드 관리)
  - 입력 처리:       ~100줄  (마우스/터치/키보드)
  - UI/HUD:          ~120줄  (상단 HUD, 하단 바, 정보 패널)
  - 렌더링:          ~150줄  (그리드, 타워, 적, 투사체, 파티클)
  - 상태 머신/루프:  ~60줄   (7상태 + 메인 루프)
  - Web Audio SFX:   ~50줄   (절차적 효과음 4종)
  - destroy/init:    ~30줄   (라이프사이클 관리)
```
