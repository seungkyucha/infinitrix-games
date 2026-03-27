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

| 파일 | 장르 | 포함 기능 |
|------|------|----------|
| `platformer.js` | 플랫포머/액션 | 중력, 점프, 벽점프, 코요테타임, 1방향 플랫폼 |
| `shooter.js` | 슈팅/탄막 | 탄막 패턴, 오토파이어, 무기 시스템, 탄환 풀링 |
| `tower-defense.js` | 타워 디펜스 | 그리드 배치, 타워 타겟팅, 웨이브 매니저, 경로 탐색 |
| `roguelite.js` | 로그라이트 | 절차적 맵 생성, 룸 시스템, 아이템 드롭, 영구 진행 |
| `puzzle.js` | 퍼즐 | 그리드 매칭, 블록 물리, 콤보 체인, 힌트 시스템 |
| `idle.js` | 방치형 | 오프라인 진행, 프레스티지, 자동화, 큰 수 포맷 |
| `card.js` | 카드/덱빌딩 | 덱 관리, 카드 드로우, 핸드 UI, 턴 시스템 |
| `racing.js` | 레이싱 | 드리프트 물리, 트랙/체크포인트, AI 라이벌, 부스트 |

## 기여 규칙

- 해당 장르 게임을 만들 때 범용적인 코드를 발견하면 장르 모듈에 추가
- `IX.Genre.{장르명}` 네임스페이스 사용
- 코어 IX Engine에 의존하되, 다른 장르 모듈에는 의존하지 말 것
- 기존 API를 깨뜨리지 말 것
