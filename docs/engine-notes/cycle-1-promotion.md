# Cycle 1 엔진 승격 내역

_게임: pixel-depths (턴제 로그라이크) | 날짜: 2026-04-18_

---

## 승격

### 1. `MathUtil.aStar(sx, sy, gx, gy, w, h, isBlocked, opts)`
- **출처**: `pixel-depths/index.html` — 적 AI 경로탐색
- **승격 위치**: `public/engine/ix-engine.js` → `MathUtil.aStar`
- **이유**: 그리드 기반 A* 경로탐색은 로그라이크, 타워디펜스, 전략, 퍼즐 등 4개 이상 장르에서 필수. `isBlocked(x,y)` 콜백으로 게임별 장애물 판단을 위임하여 순수 함수로 구현.
- **API**: `MathUtil.aStar(sx, sy, gx, gy, gridW, gridH, isBlocked, { maxNodes: 200 })` → `[{x,y}, ...]`

### 2. `MathUtil.lineOfSight(x0, y0, x1, y1, isBlocked)`
- **출처**: `pixel-depths/index.html` — 원거리 적 사격/시야 판정
- **승격 위치**: `public/engine/ix-engine.js` → `MathUtil.lineOfSight`
- **이유**: Bresenham 기반 시야 판정은 로그라이크 FOV, 슈터 사선 확인, 전략 시야 시스템 등 다수 장르에서 재사용 가능. `isBlocked(x,y)` 콜백으로 벽 판단 위임.
- **API**: `MathUtil.lineOfSight(x0, y0, x1, y1, isBlocked)` → `boolean`

---

## 보류 (이유)

| 후보 | 이유 |
|------|------|
| `addDamagePopup` | 게임 내 `damagePopups` 배열에 직접 종속. 범용화하려면 별도 클래스(DamagePopupManager)로 분리 필요하나, 현재 1게임만 사용하여 시기상조. |
| `addLog` (메시지 로그) | `logMessages` 전역 배열에 종속. 턴제 전용 UI 패턴으로 범용성 낮음. |
| `renderMinimap` | 타일맵 + explored/visible 배열에 강하게 결합. 로그라이크 전용. |

---

## 향후 후보

### `engine/genres/roguelite.js` 생성 (2번째 로그라이크 게임 시 즉시 실행)

| 모듈 | 설명 | 승격 조건 |
|------|------|----------|
| `BSPDungeon` | BSP 이진 공간 분할 던전 생성 (방 분할 → 복도 연결 → 적/아이템 배치) | 다음 로그라이크 사이클에서 패턴 반복 확인 시 |
| `FOV` | Raycasting 시야 계산 (각도 기반 벽 차단) | 동일 |
| `TurnManager` | 턴제 처리 루프 (플레이어 → 적 AI → 상태 업데이트) | 동일 |
| `LootTable` | 확률 기반 아이템/적 스폰 테이블 | 동일 |
| `PersistentUpgrade` | 런 간 영구 업그레이드 시스템 (Save 래퍼) | 동일 |

---

## 게임 코드 변경

- `aStar()` 함수 본문 → `MathUtil.aStar()` 위임 래퍼로 교체 (3줄)
- `hasLineOfSight()` 함수 본문 → `MathUtil.lineOfSight()` 위임 래퍼로 교체 (3줄)
- 기존 동작 100% 보존, 하위 호환 깨짐 없음
