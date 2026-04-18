# Cycle 4 엔진 승격 보고서
_게임: ink-maiden (잉크 메이든) — 메트로배니아_
_날짜: 2026-04-19_

## 승격

### TileCollision → `public/engine/genres/platformer.js`

**클래스**: `TileCollision`
**위치**: `IX.Genre.Platformer.TileCollision`

**승격 이유**:
- ink-maiden에서 구현한 AABB 타일 충돌 해결 로직(X축→Y축 순서)은 **모든 타일 기반 플랫포머/메트로배니아의 기본 인프라**
- 기존 platformer.js에 PlatformPhysics(중력/점프), CoyoteJump, WallMechanics는 있었으나 **타일맵 충돌 해결기가 부재**
- 콜백 기반 설계(`isSolid`, `isPlatform`, `isHazard`)로 어떤 맵 데이터 형식이든 호환 가능
- 게임 상태에 의존하지 않는 순수 유틸리티 클래스

**API**:
```javascript
const tc = new TileCollision({ cols: 16, rows: 10 });

// 타일 크기 계산
const { tw, th } = tc.tileSize(screenW, screenH);

// 충돌 해결 (X→Y AABB)
const result = tc.resolve(entity, screenW, screenH, isSolidFn, {
  isPlatform: (c, r) => ...,  // 원웨이 플랫폼
  isHazard: (c, r) => ...,    // 위험 타일 (가시 등)
});
// result === 'hazard' | null

// 벽 접촉 판정 (벽 슬라이드/점프용)
const wallDir = tc.checkWallTouch(entity, screenW, screenH, isSolidFn);
// wallDir: 1(오른쪽), -1(왼쪽), 0(없음)
```

**하위 호환**: 기존 PlatformPhysics, CoyoteJump, OneWayPlatform, WallMechanics 변경 없음. 새 클래스 추가만.

**게임 코드 변경**: ink-maiden의 `resolveTileCollisions`, `checkWallTouch` 함수가 `tileCol.resolve()`, `tileCol.checkWallTouch()`로 위임. 게임 고유 로직(방 출구에 따른 solid 판정 등)은 콜백에 유지.

## 보류 (이유)

### 룸 매니저 / 맵 전환 시스템
- `loadRoom()`, `checkRoomTransition()`, `openRoomExits()` 등
- **이유**: ink-maiden 고유의 문자열 기반 맵 형식, 능력 게이팅, 세이브포인트 등에 강하게 결합. 범용화하려면 데이터 형식 추상화가 필요하나 아직 2번째 메트로배니아 게임이 없어 패턴이 확정되지 않음.

### 보스 패턴 시스템 (getBossPatterns / updateBoss 패턴 스위치)
- **이유**: 패턴 배열 + 타이머 + switch 구조는 재사용 가능하나, 패턴별 동작이 게임 고유 물리/투사체에 의존. FSM으로 추상화하면 가치 있을 수 있으나, 현재 스코프에서는 불확실.

### 적 AI 순찰/추적 패턴
- **이유**: patrol → detect → chase 패턴은 범용적이나, 각 적 타입의 행동이 너무 다양(비행, 천장, 콤보 등)하여 공통 인터페이스 추출 비용 대비 이득이 불명확.

## 향후 후보

1. **BossStateMachine** — 패턴 배열 + 타이머 + 페이즈 전환을 범용화. 2개 이상의 보스 전투 게임이 나오면 승격 검토.
2. **RoomSystem** — 타일맵 기반 방 전환 + 능력 게이팅. 2번째 메트로배니아에서 패턴 확정 시 승격.
3. **EnemyAI.patrol/chase** — 순찰→감지→추적 기본 AI 루프. 3개 이상의 액션 게임에서 반복되면 승격.
4. **Parallax** — 3레이어 배경 패럴렉스 렌더링. 현재 ink-maiden은 단순 drawImage로 처리 중이나 스크롤 배율 적용 시 범용 모듈 가치 있음.
