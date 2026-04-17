# Cycle 2 엔진 승격 보고서
_게임: neon-survivors (survivor-like)_
_날짜: 2026-04-18_

## 승격

### 1. IX.Pool — 오브젝트 풀링
- **출처**: `neon-survivors/index.html` → `createPool()` 함수
- **대상**: `public/engine/ix-engine.js` → `class Pool`
- **이유**: 탄환/적/보석 등 대량 엔티티 관리에 필수. shooter, tower-defense, bullet-hell, survivor 등 2+ 장르에서 확실히 재사용. 게임 상태에 의존하지 않는 순수 자료구조.
- **API**: `new Pool(size, factory)` → `acquire()`, `releaseAll()`, `forEach(fn)`, `count()`, `.items`
- **하위 호환**: 신규 추가만. 기존 API 변경 없음.

### 2. IX.SpatialHash — 공간 해싱 (충돌 최적화)
- **출처**: `neon-survivors/index.html` → `spatialHash` 객체 리터럴
- **대상**: `public/engine/ix-engine.js` → `class SpatialHash`
- **이유**: 엔티티 수 50+ 이상인 게임에서 충돌 판정 O(n²)→O(n) 최적화. shooter, survivor, tower-defense, action 등 다수 장르에서 재사용. 순수 자료구조.
- **API**: `new SpatialHash(cellSize)` → `clear()`, `insert(obj)`, `query(x, y, radius)`
- **하위 호환**: 신규 추가만. 기존 API 변경 없음.

## 보류(이유)

### 가상 조이스틱 (VirtualJoystick)
- 로직(base/knob 위치, dx/dy 계산)은 범용이지만, 렌더링이 에셋에 의존하여 로직/렌더 분리가 필요.
- 다음 모바일 액션 게임에서 재사용 시 분리 후 승격 검토.

## 향후 후보

### IX.Camera — 카메라 시스템
- 2사이클 연속 lerp 추적 + 경계 클램프 + 쉐이크 구현 (Cycle 1 로그라이크, Cycle 2 서바이버).
- 현재는 게임별로 MAP_W/MAP_H에 의존 → `new Camera({ bounds, lerpSpeed, shake })` 형태의 클래스 설계 후 승격.
- **우선순위: 높음** — Cycle 3에서 실시간 게임이면 즉시 승격 추천.

### IX.Genre.Survivor — 서바이버 장르 모듈
- 웨이브 매니저, 자동 공격 시스템, 경험치/레벨업 시스템 등이 후보지만, 아직 1개 게임(neon-survivors)에서만 검증됨.
- 동일 장르 2번째 게임 개발 시 공통 패턴 추출하여 `/engine/genres/survivor.js` 생성.

### VFX System (스프라이트 시트 기반 이펙트)
- 에셋 로더 내부에 의존. AssetLoader와의 인터페이스를 정리한 뒤 IX.VFX로 승격 가능.
