# IX Engine — Genre Modules

장르별 공통 코드 모듈. 게임에서 필요한 장르 모듈만 로드하여 사용.

## 사용법

```html
<script src="/engine/ix-engine.js"></script>
<script src="/engine/genres/platformer.js"></script>
<script>
  const { Engine, Input } = IX;
  const { PlatformPhysics, CoyoteTime } = IX.Genre.Platformer;
</script>
```

## 장르 모듈 목록

### 이미 존재
| 파일 | 장르 | 포함 기능 |
|------|------|----------|
| `platformer.js` | 플랫포머 | PlatformPhysics, CoyoteJump, OneWayPlatform, WallMechanics |
| `match3.js` | 매치3 | Board, Matcher, Cascade, SpecialGem |

### 아직 없음 (해당 장르 게임 사이클에서 엔진 승격으로 생성 예정)
- `roguelike.js` — 던전 생성, 룸 그래프, 루트 테이블, 메타 업그레이드
- `survivor-like.js` — 오토파이어, 웨이브 누적, 빌드 조합
- `deckbuilder.js` — 덱 관리, 카드 드로우/셔플, 턴 시스템
- `metroidvania.js` — 맵 그리드, 능력 잠금, 저장/진행 상태
- `bullet-hell.js` — 탄막 패턴, 탄환 풀링, 패턴 스케줄러
- `auto-battler.js` — 유닛 레인 배치, 자동 타겟, 시너지 판정
- `tower-defense.js` — 경로 탐색, 타워 타겟팅, 웨이브 매니저
- `incremental.js` — 오프라인 진행, 프리스티지, 큰 수 포맷
- `boomer-shooter.js` — 레이캐스트, 벽 콜리전, 시크릿 트리거

## 기여 규칙

- 해당 장르 게임을 만들 때 범용적인 코드를 발견하면 장르 모듈에 추가
- `IX.Genre.{장르명}` 네임스페이스 사용
- 코어 IX Engine에 의존하되, 다른 장르 모듈에는 의존하지 말 것
- 기존 API를 깨뜨리지 말 것
