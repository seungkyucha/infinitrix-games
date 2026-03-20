---
game-id: mini-survivor-arena
title: 미니 서바이버 아레나
genre: action, arcade
difficulty: medium
---

# 미니 서바이버 아레나 — 상세 기획서 (Cycle 7)

---

## §0. 이전 사이클 피드백 반영 매핑

| # | 출처 | 문제/제안 | 이번 기획 반영 방법 |
|---|------|----------|-------------------|
| 1 | Cycle 6 포스트모템 | 공용 엔진 모듈 분리 제안 | §12에서 TweenManager, ObjectPool, TransitionGuard, listen()/destroy(), Web Audio SFX를 공용 패턴으로 재사용. 단일 HTML 내 모듈식 클래스 구조 |
| 2 | Cycle 6 포스트모템 | 비동기 경쟁 시스템 제안 | §7에서 "오늘의 시드" 일일 챌린지 시스템 설계. localStorage 기반 시드 → 동일 적 스폰/스킬 풀 |
| 3 | Cycle 6 포스트모템 | 시뮬레이션/경영 장르 제안 | 이번은 action 장르 공백 해소 우선. 서바이버의 "스킬 빌드 선택"이 경영적 의사결정 요소 포함 |
| 4 | Cycle 6 아쉬운 점 | speed() 전역 의존 | §10에서 모든 게임 로직 함수를 **순수 함수 패턴**으로 설계. 전역 state 직접 참조 금지 |
| 5 | Cycle 6 아쉬운 점 | Space 가속 시 물리 스킵 | 본 게임은 물리 기반이 아니므로 해당 없음. 대신 §5에서 fixed timestep(16.67ms) 적용 |
| 6 | Cycle 6 아쉬운 점 | 레벨 에디터 부재 | §6에서 웨이브 데이터를 config 객체 기반 선언적 구조로 설계. 하드코딩 최소화 |
| 7 | Cycle 6 아쉬운 점 | assets/ 잔존 재발 | §13에서 assets/ 디렉토리 미생성 원칙 + 자동 검증 체크리스트. 100% Canvas 코드 드로잉 |
| 8 | platform-wisdom | setTimeout 금지 | §5 게임 루프에서 모든 지연 전환은 tween onComplete 전용 |
| 9 | platform-wisdom | 상태×시스템 매트릭스 | §5.3에 전체 매트릭스 포함 |
| 10 | platform-wisdom | cancelAll/add 경쟁 조건 | clearImmediate() API 사용. §12 TweenManager 명세 |
| 11 | platform-wisdom | 가드 플래그 필수 | §5.2 웨이브 클리어/레벨업 전환에 `isTransitioning` 가드 |
| 12 | platform-wisdom | 유령 변수 방지 | §13.4 코드 리뷰 체크리스트에 "선언된 변수 사용처 전수 검증" 포함 |
| 13 | 분석 보고서 | hard 난이도 부재 | §6.3 하드 모드 옵션 추가 (적 HP ×1.5, 스킬 선택지 2개) |
| 14 | 분석 보고서 | action 장르 1개뿐 | action + arcade 조합으로 장르 공백 해소 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
360도 전방위에서 밀려오는 몬스터 무리 속에서 **이동만으로 생존**하는 탑다운 서바이버 게임. 공격은 자동으로 발사되며, 레벨업 시 3개 스킬 중 1개를 선택하여 빌드를 완성한다. **20웨이브(약 5~8분)**를 버티면 클리어.

### 핵심 재미 3요소
1. **빌드 크래프팅**: 매 레벨업마다 3개 스킬 중 1개 선택 → 매 판마다 다른 빌드 → 무한 리플레이
2. **성장의 쾌감**: 초반 약한 1발 공격 → 후반 화면 가득 투사체 + 폭발 → "나 이렇게 강해졌어" 판타지
3. **위기 탈출**: 사방에서 몰려오는 적 틈새를 찾아 빠져나가는 순간의 긴장감

### 레퍼런스
- **Vampire Survivors**: 자동 공격 + 레벨업 스킬 선택 + 웨이브 서바이벌
- **Survivor.io**: 모바일 터치 조이스틱 + 간결한 스킬 UI

---

## §2. 게임 규칙 및 목표

### 승리 조건
- 20웨이브를 모두 생존하면 **VICTORY** (보너스 점수 +5000)

### 패배 조건
- 플레이어 HP가 0 이하 → **GAMEOVER**

### 기본 규칙
1. 플레이어는 아레나(1600×1600 월드 영역) 내에서 자유 이동. 캔버스는 800×800 뷰포트로 플레이어를 중심 추적 (§2.1 카메라 참조)
2. 적은 뷰포트 바깥 가장자리에서 스폰되어 플레이어를 추적
3. 무기는 **자동 발사** — 플레이어는 이동에만 집중
4. 적 처치 시 **경험치 젬(XP Gem)** 드롭
5. 경험치가 레벨업 임계치에 도달하면 **레벨업 스킬 선택** UI 표시
6. 웨이브 간 3초 휴식 (WAVE_PREP 상태)
7. 매 5웨이브마다 **보스** 등장
8. 적 접촉 피격 시 **무적 시간 0.5초** (iFrame) — 매 프레임 데미지 방지

### §2.1 카메라/뷰포트 시스템
- **월드 크기**: 1600×1600px (논리 좌표)
- **뷰포트 크기**: 800×800px (캔버스 표시 영역)
- **카메라**: 플레이어 중심 추적. 부드러운 추적을 위해 lerp 적용:
  ```
  camera.x += (player.x - camera.x - viewW/2) * 0.1;
  camera.y += (player.y - camera.y - viewH/2) * 0.1;
  camera.x = clamp(camera.x, 0, worldW - viewW);
  camera.y = clamp(camera.y, 0, worldH - viewH);
  ```
- **렌더링 오프셋**: 모든 월드 오브젝트는 `drawX = obj.x - camera.x`로 변환
- **월드 경계**: 플레이어가 월드 가장자리에 도달하면 이동 제한 (clamp)
- **미니맵** (선택): 우측 하단 100×100px 영역에 플레이어 위치 + 보스 위치 표시

---

## §3. 조작 방법

### 키보드
| 키 | 동작 |
|----|------|
| `W` / `↑` | 위로 이동 |
| `A` / `←` | 왼쪽 이동 |
| `S` / `↓` | 아래로 이동 |
| `D` / `→` | 오른쪽 이동 |
| `1`, `2`, `3` | 레벨업 시 스킬 선택 (좌/중/우) |
| `P` / `Escape` | 일시정지 |
| `Enter` / `Space` | 타이틀에서 게임 시작 / GAMEOVER에서 재시작 |

### 마우스
| 동작 | 설명 |
|------|------|
| 클릭 | 타이틀 시작, GAMEOVER 재시작, 레벨업 스킬 카드 클릭 |

### 터치 (모바일)
| 동작 | 설명 |
|------|------|
| **가상 조이스틱** | 화면 왼쪽 하단 1/3 영역 터치 → 드래그 방향으로 이동 |
| 터치 | 스킬 카드 탭, 시작/재시작 탭 |

> **입력 모드 분기**: 첫 입력 이벤트 종류(keydown vs touchstart)로 `inputMode`를 결정. 이후 해당 모드에 맞는 UI 힌트만 표시.

---

## §4. 시각적 스타일 가이드

### 색상 팔레트

| 용도 | HEX | 설명 |
|------|-----|------|
| 배경 | `#0A0A1A` | 어두운 남색 (우주/던전 느낌) |
| 아레나 바닥 | `#12122A` | 배경보다 약간 밝은 남색 |
| 그리드 라인 | `#1A1A3A` | 미묘한 격자 패턴 |
| 플레이어 | `#00FFAA` | 밝은 민트/시안 |
| 플레이어 글로우 | `#00FFAA40` | 반투명 외곽 발광 |
| 적 (일반) | `#FF4444` | 빨간색 |
| 적 (빠른) | `#FFAA00` | 주황색 |
| 적 (탱커) | `#8844FF` | 보라색 |
| 적 (원거리) | `#FF44AA` | 분홍색 |
| 보스 | `#FF0044` | 진한 빨강 + 크기 2배 |
| XP 젬 | `#44FF44` | 초록색 빛나는 마름모 |
| 투사체 | `#FFFF44` | 노란색 |
| HP 바 (배경) | `#333333` | 어두운 회색 |
| HP 바 (채움) | `#00FF66` → `#FF3333` | 잔량에 따라 그라데이션 |
| XP 바 | `#6644FF` | 보라색 |
| 스킬 카드 배경 | `#1A1A3A` | 어두운 카드 |
| 스킬 카드 테두리 | `#4488FF` | 파란색 하이라이트 |
| 스킬 카드 호버 | `#6699FF` | 밝은 파란색 |
| UI 텍스트 | `#FFFFFF` | 흰색 |
| 보조 텍스트 | `#888899` | 회색 |
| 데미지 텍스트 | `#FF4444` | 빨간색 플로팅 |
| 힐 텍스트 | `#44FF44` | 초록색 플로팅 |

### 배경
- 월드 영역(1600×1600): `#12122A` 위에 32px 간격 격자 라인(`#1A1A3A`)
- **offscreen canvas에 격자 타일 캐시** (256×256 타일을 반복 패턴으로 drawImage, Cycle 5 검증 패턴)
- 월드 경계: 2px `#2A2A4A` 테두리
- 뷰포트 밖의 격자는 렌더링하지 않음 (camera offset 기반 culling)

### 오브젝트 형태 (100% Canvas 코드 드로잉)

| 오브젝트 | 형태 | 크기 (논리 px) |
|----------|------|---------------|
| 플레이어 | 원 + 내부 삼각형(방향) + 외곽 글로우 | 반지름 12px |
| 일반 적 | 원 + 눈 2개 (흰 점) | 반지름 10px |
| 빠른 적 | 뾰족한 삼각형 | 높이 16px |
| 탱커 적 | 사각형 + 두꺼운 테두리 | 20×20px |
| 원거리 적 | 다이아몬드 + 중앙 점 | 14×14px |
| 보스 | 큰 원 + 왕관 형태 + HP 바 | 반지름 24px |
| 투사체 | 작은 원 + 트레일 | 반지름 3px |
| XP 젬 | 마름모 + 회전 애니메이션 | 6×6px |
| 데미지 숫자 | 플로팅 텍스트 (위로 올라가며 페이드아웃) | 14px 폰트 |

### 폰트
- 시스템 폰트 스택: `'Segoe UI', system-ui, -apple-system, sans-serif`
- **외부 폰트 로드 금지** (Cycle 1 교훈)

---

## §5. 핵심 게임 루프

### §5.1 게임 상태 머신

```
TITLE → PLAYING → WAVE_PREP → PLAYING → ... → VICTORY
                ↕                                  ↓
             LEVELUP                           GAMEOVER
                ↕                                  ↓
              PAUSE ←──────────────────────────── TITLE
```

**상태 목록 (8개)**:
1. `TITLE` — 타이틀 화면
2. `PLAYING` — 게임 진행 중
3. `WAVE_PREP` — 웨이브 간 휴식 (3초 카운트다운)
4. `LEVELUP` — 스킬 선택 UI (게임 일시정지)
5. `PAUSE` — 일시정지
6. `GAMEOVER` — 사망
7. `VICTORY` — 20웨이브 클리어

**상태 전환은 반드시 `enterState(newState)` 함수를 통해서만 수행.**
**TransitionGuard 패턴 적용**: `STATE_PRIORITY` 맵으로 우선순위 관리.

```javascript
const STATE_PRIORITY = {
  TITLE: 0, PLAYING: 1, WAVE_PREP: 2,
  LEVELUP: 3, PAUSE: 4, GAMEOVER: 5, VICTORY: 6
};
```

GAMEOVER/VICTORY는 항상 최고 우선순위 — 다른 전환이 덮어쓸 수 없음.

### §5.2 프레임 루프 (requestAnimationFrame)

```
매 프레임:
1. deltaTime 계산 (cap: 50ms, fixed step: 16.67ms)
2. tweenManager.update(dt)
3. switch(state):
   - PLAYING:
     a. 입력 처리 → 플레이어 이동 (updatePlayer(player, input, dt, bounds))
     b. 무기 자동 발사 (updateWeapons(player, weapons, enemies, projectiles, dt))
     c. 투사체 이동 (updateProjectiles(projectiles, dt, bounds))
     d. 적 이동/AI (updateEnemies(enemies, player, dt))
     e. 충돌 판정:
        - 투사체 vs 적 (checkProjectileHits(projectiles, enemies))
        - 적 vs 플레이어 (checkEnemyCollisions(enemies, player))
        - 플레이어 vs XP 젬 (checkGemPickup(player, gems))
     f. XP 체크 → 레벨업 조건 확인
     g. 웨이브 클리어 조건 확인 (가드: isWaveClearing)
     h. HP ≤ 0 확인 (가드: isTransitioning)
     i. 파티클 업데이트
   - WAVE_PREP:
     a. 카운트다운 tween
     b. 파티클 업데이트
   - LEVELUP:
     a. 입력 대기 (카드 선택)
   - PAUSE:
     a. 입력 대기 (재개)
4. 렌더링:
   a. 배경 (캐시된 격자)
   b. XP 젬
   c. 투사체
   d. 적 (HP 바 포함)
   e. 플레이어
   f. 파티클/이펙트
   g. HUD (HP, XP, 웨이브, 점수, 레벨)
   h. 상태별 오버레이 UI
```

**가드 플래그 목록**:
- `isWaveClearing`: 웨이브 클리어 tween 실행 중 재호출 방지
- `isTransitioning`: 상태 전환 tween 실행 중 중복 전환 방지
- `isLevelingUp`: 레벨업 큐에 여러 개가 쌓일 때 순차 처리

### §5.3 상태 × 시스템 업데이트 매트릭스

| 시스템 | TITLE | PLAYING | WAVE_PREP | LEVELUP | PAUSE | GAMEOVER | VICTORY |
|--------|:-----:|:-------:|:---------:|:-------:|:-----:|:--------:|:-------:|
| tweenManager.update() | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| 입력 처리 | 시작만 | ✅ | ❌ | 카드만 | 재개만 | 재시작만 | 재시작만 |
| 플레이어 이동 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 무기 발사 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 투사체 이동 | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| 적 이동/AI | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 적 스폰 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 충돌 판정 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 파티클 | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| HUD 렌더 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 오버레이 UI | 타이틀 | ❌ | 카운트다운 | 스킬카드 | 일시정지 | 결과 | 결과 |

---

## §6. 난이도 시스템

### §6.1 웨이브 스케일링 (config 객체 기반)

```javascript
// 선언적 웨이브 config — 하드코딩 최소화 (Cycle 6 피드백 반영)
function getWaveConfig(wave) {
  return {
    enemyCount:    Math.min(40, 8 + wave * 2),          // 8 → 40
    spawnInterval: Math.max(300, 1500 - wave * 60),     // 1500ms → 300ms
    enemyHpMul:    1 + (wave - 1) * 0.1,                // ×1.0 → ×2.9
    enemySpeedMul: 1 + (wave - 1) * 0.03,               // ×1.0 → ×1.57
    fastRatio:     Math.min(0.4, wave * 0.02),           // 0% → 40%
    tankerRatio:   wave >= 5 ? Math.min(0.2, (wave - 4) * 0.02) : 0,
    rangedRatio:   wave >= 8 ? Math.min(0.15, (wave - 7) * 0.02) : 0,
    isBoss:        wave % 5 === 0
  };
}
```

### §6.2 적 유형 상세

| 유형 | HP | 속도 | 공격력 | XP | 특수 행동 |
|------|-----|------|--------|-----|----------|
| 일반 (Normal) | 3 | 60px/s | 1 | 1 | 직선 추적 |
| 빠른 (Fast) | 2 | 110px/s | 1 | 2 | 직선 추적 + 가속 |
| 탱커 (Tanker) | 12 | 40px/s | 2 | 3 | 직선 추적 + 넉백 저항 |
| 원거리 (Ranged) | 4 | 50px/s | 1 (탄) | 3 | 거리 120px 이내 시 정지 + 2초마다 탄 발사 |
| 보스 (Boss) | 50 + wave×10 | 35px/s | 3 | 20 | 3페이즈 순환 (아래 상세) |

**관대한 히트박스**: 플레이어 시각 반지름 12px, 피격 판정 반지름 8px (Cycle 2 검증 패턴)
**무적 시간 (iFrame)**: 피격 후 0.5초간 무적 + 깜빡임 애니메이션 (tween alpha 0.3↔1.0). `player.iFrameTimer > 0`이면 적 접촉 무시.

### §6.2.1 보스 3페이즈 AI (Cycle 2 보스 패턴 계승)

보스는 HP 비율에 따라 페이즈가 전환되는 상태 머신 위의 상태 머신:

| 페이즈 | HP 조건 | 행동 | 지속 | 시각 효과 |
|--------|---------|------|------|----------|
| **1: 돌진** | 100%~60% | 플레이어 방향 직선 돌진 (속도 ×2.5), 2초마다 방향 재설정 | 2초 돌진 → 1초 정지 반복 | 돌진 중 잔상(트레일) 3개 |
| **2: 방사탄** | 60%~30% | 제자리 정지 + 1.5초마다 8방향 탄 발사 (탄속 120px/s) | 1.5초 간격 | 빨간 원형 차지 이펙트 → 방사 |
| **3: 소환+돌진** | 30%~0% | 3초마다 일반 적 4마리 소환 + 페이즈1 돌진 (속도 ×3.0) | 돌진+소환 병행 | 몸체 깜빡임 + 빨간 아우라 |

- 페이즈 전환 시 0.5초 무적 + 스크린 셰이크 (tween으로 camera offset ±4px)
- **사전 체크**: `if (player.hp <= 0) return;` — GAMEOVER가 보스 페이즈 전환보다 우선 (Cycle 3 교훈)
- 보스 HP 바: 화면 상단에 별도 표시 (너비 200px, 높이 8px)

### §6.3 난이도 모드 (타이틀 화면에서 선택)

| 모드 | 적 HP 배율 | 스킬 선택지 | XP 배율 | 설명 |
|------|-----------|------------|---------|------|
| Normal | ×1.0 | 3개 | ×1.0 | 기본 |
| Hard | ×1.5 | 2개 | ×0.8 | 분석 보고서: hard 부재 해소 |

---

## §7. 점수 시스템

### 기본 점수

| 행동 | 점수 |
|------|------|
| 일반 적 처치 | 10 |
| 빠른 적 처치 | 20 |
| 탱커 처치 | 30 |
| 원거리 처치 | 30 |
| 보스 처치 | 200 + wave × 20 |
| 웨이브 클리어 | 100 × wave |
| 레벨업 | 50 |
| VICTORY 보너스 | 5000 |

### 콤보 시스템
- 2초 이내 연속 처치 시 콤보 카운터 증가
- 콤보 배율: `1.0 + combo × 0.1` (최대 ×3.0)
- 2초간 처치 없으면 콤보 리셋
- 콤보 카운터 HUD 우측 상단에 표시 (≥5 콤보 시 강조)

### 일일 챌린지 시스템 (Cycle 6 포스트모템 제안 #2 반영)
- **오늘의 시드**: 날짜 문자열 해시 기반 일일 고정 시드 → 적 스폰 패턴/스킬 풀 동일
  ```javascript
  // 날짜 문자열 → 정수 시드 변환 (djb2 해시)
  function dateSeed(dateStr) { // dateStr = "2026-03-20"
    let hash = 5381;
    for (let i = 0; i < dateStr.length; i++)
      hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) & 0xFFFFFFFF;
    return hash >>> 0;
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyRng = seededRng(dateSeed(todayStr));
  ```
- localStorage에 `dailySeed`, `dailyBestScore`, `dailyDate` 저장
- 타이틀 화면에 "오늘의 챌린지" 버튼 표시
- 같은 날 최고 점수 갱신 시 "NEW RECORD" 표시
- **판정 먼저, 저장 나중에** (Cycle 2 교훈): `isNewRecord = score > savedBest` → `save(score)`

### 최고 기록 저장
- localStorage `miniSurvivorBest` (try-catch 래핑, Cycle 1 패턴)
- `dailyChallenge_YYYYMMDD` — 일일 챌린지 최고 점수

---

## §8. 스킬/무기 시스템

### 기본 무기 (시작 시 보유)
- **에너지 볼트**: 가장 가까운 적 방향으로 자동 발사. 1초 간격, 데미지 1.

### 스킬 풀 (12종) — 레벨업 시 3개 랜덤 제시

| # | 스킬 명 | 유형 | 설명 | 최대 레벨 | 레벨업 효과 |
|---|---------|------|------|----------|------------|
| 1 | 멀티샷 | 공격 | 볼트 발사 수 +1 | 5 | Lv1: 2발 → Lv5: 6발 (부채꼴) |
| 2 | 래피드 파이어 | 공격 | 발사 간격 감소 | 5 | Lv1: 0.9s → Lv5: 0.5s |
| 3 | 피어싱 | 공격 | 투사체 관통 횟수 +1 | 3 | Lv1: 1관통 → Lv3: 3관통 |
| 4 | 오비탈 | 공격 | 플레이어 주위 회전 구체 | 3 | Lv1: 2개 → Lv3: 4개, 반지름 60px |
| 5 | 충격파 | 공격 | 5초마다 원형 범위 폭발 | 3 | Lv1: 반지름 80 → Lv3: 160, 데미지 3→6 |
| 6 | 번개 | 공격 | 3초마다 랜덤 적 3체에 번개 | 3 | Lv1: 3체 → Lv3: 7체, 데미지 2→5 |
| 7 | 이동속도 UP | 유틸 | 이동속도 +15% | 3 | Lv1: +15% → Lv3: +45% |
| 8 | 자석 | 유틸 | XP 젬 흡수 반경 +50px | 3 | Lv1: +50 → Lv3: +150 (기본 40px) |
| 9 | 방어력 UP | 방어 | 받는 데미지 -1 (최소 1) | 2 | Lv1: -1 → Lv2: -2 |
| 10 | HP 회복 | 방어 | 10초마다 HP 1 회복 | 3 | Lv1: 10s → Lv3: 5s |
| 11 | 넉백 | 유틸 | 투사체 적중 시 밀어내기 | 2 | Lv1: 30px → Lv2: 60px |
| 12 | 크리티컬 | 공격 | 15% 확률 ×2 데미지 | 3 | Lv1: 15% → Lv3: 30% |

### 스킬 선택 규칙
1. 이미 보유한 스킬이 최대 레벨 미만이면 "레벨업" 선택지로 제시
2. 미보유 스킬은 "신규 획득" 선택지로 제시
3. 최대 레벨 도달 스킬은 풀에서 제외
4. 3개 미만이면 남은 만큼만 표시
5. **시드 기반 랜덤**: 일일 챌린지 모드에서는 시드로 선택지 고정

### 레벨업 XP 테이블

| 플레이어 레벨 | 필요 XP | 누적 XP |
|-------------|---------|---------|
| 1→2 | 5 | 5 |
| 2→3 | 8 | 13 |
| 3→4 | 12 | 25 |
| 4→5 | 17 | 42 |
| N→N+1 | `floor(5 + (N-1) * 1.5 + (N-1)^1.3)` | — |

---

## §9. 엔티티 스폰 시스템

### 적 스폰
1. 뷰포트 바깥 50px 위치에서 스폰 (플레이어 주변 원형 영역의 바깥 링, 월드 범위 내 clamp)
2. 스폰 위치는 플레이어 기준 랜덤 각도
3. 최소 스폰 거리: 뷰포트 대각선 절반 + 50px (≈ 616px, 화면 밖에서 등장)
4. **동시 활성 적 상한**: 150마리 (ObjectPool 크기, 넓은 월드 대응)
5. 보스는 웨이브 시작 시 즉시 스폰, 일반 적은 interval로 순차 스폰
6. 월드 경계 밖 100px 이상 벗어난 적은 자동 release + 뷰포트 근처에 재스폰 (성능 보호)

### XP 젬
- 적 사망 위치에 드롭
- 화면 내 최대 200개 (초과 시 가장 오래된 젬 자동 소멸)
- 자석 반경 내 젬은 플레이어에게 가속 이동 (300px/s)
- 기본 흡수 반경: 40px

### 투사체
- ObjectPool 크기: 200
- 화면 밖 50px 이상 벗어나면 release
- 관통 횟수 소진 시 release

---

## §10. 순수 함수 설계 원칙 (Cycle 6 피드백 반영)

**모든 게임 로직 함수는 파라미터를 통해 데이터를 받는 순수 함수로 작성한다.**

```javascript
// ✅ 올바른 패턴: 파라미터로 데이터 전달
function updatePlayer(player, input, dt, bounds) {
  const speed = player.baseSpeed * (1 + player.speedBonus);
  player.x += input.dx * speed * dt;
  player.y += input.dy * speed * dt;
  player.x = clamp(player.x, bounds.left + player.r, bounds.right - player.r);
  player.y = clamp(player.y, bounds.top + player.r, bounds.bottom - player.r);
}

// ❌ 금지 패턴: 전역 직접 참조
function updatePlayer() {
  player.x += input.dx * player.speed * deltaTime; // 전역 3개 참조
}
```

### 순수 함수 대상 목록
| 함수 | 파라미터 | 반환/부수효과 |
|------|---------|-------------|
| `updatePlayer(player, input, dt, bounds)` | 플레이어, 입력, 시간, 경계 | player 좌표 갱신 |
| `updateEnemies(enemies, target, dt)` | 적 배열, 추적 대상, 시간 | 적 좌표 갱신 |
| `updateProjectiles(projectiles, dt, bounds)` | 투사체 배열, 시간, 경계 | 투사체 이동 + OOB 마킹 |
| `checkCircleCollision(a, b)` | {x,y,r}, {x,y,r} | boolean |
| `calcDamage(baseDmg, critChance, critMul)` | 수치 3개 | {damage, isCrit} |
| `calcXpNeeded(level)` | 레벨 | 필요 XP |
| `getWaveConfig(wave)` | 웨이브 번호 | config 객체 |
| `pickSkillChoices(pool, owned, count, rng)` | 풀, 보유목록, 개수, RNG | 스킬 3개 배열 |

---

## §11. 오디오 시스템 (Web Audio API 절차적 사운드)

**외부 에셋 0개 원칙 유지.** OscillatorNode + GainNode로 효과음 생성.

| 이벤트 | 음 | 파형 | 주파수 | 지속 |
|--------|-----|------|--------|------|
| 투사체 발사 | 틱 | square | 880Hz→440Hz | 50ms |
| 적 피격 | 퍽 | sawtooth | 220Hz→110Hz | 80ms |
| 적 사망 | 팡 | square+triangle | 440Hz→880Hz | 120ms |
| XP 젬 획득 | 띵 | sine | 660Hz→880Hz | 100ms |
| 레벨업 | 팡파레 | sine 화음 | C-E-G 아르페지오 | 400ms |
| 보스 등장 | 쿵 | sawtooth | 80Hz→40Hz | 300ms |
| 플레이어 피격 | 윙 | square | 200Hz→100Hz | 150ms |
| GAMEOVER | 하강음 | sine | 440Hz→110Hz | 500ms |
| VICTORY | 상승 화음 | sine | C-E-G-C5 | 600ms |

```javascript
// AudioContext 초기화: 사용자 첫 인터랙션에서 resume()
// try-catch 래핑으로 미지원 환경 안전 처리 (Cycle 3 패턴)
```

---

## §12. 핵심 유틸리티 클래스 명세

### TweenManager (Cycle 2~5 안정화 완료)
```javascript
class TweenManager {
  add(obj, prop, from, to, duration, easing, onComplete)
  update(dt)              // deferred 패턴: _toRemove 배열로 안전 삭제
  cancelAll()             // deferred: _pendingCancel = true
  clearImmediate()        // 즉시: _tweens.length = 0, _pendingCancel = false
}
// 규칙: enterState() 진입 시 clearImmediate() 호출 후 새 tween 등록
// cancelAll() 직후 add() 호출 금지 (Cycle 4 B1 방지)
```

### ObjectPool (Cycle 2 검증)
```javascript
class ObjectPool {
  constructor(createFn, resetFn, size)
  acquire()    // 비활성 객체 반환 또는 null
  release(obj) // 비활성화 + 풀 반환
  forEach(fn)  // 활성 객체만 순회 (역순 + splice 안전 패턴)
  clear()      // 모든 객체 비활성화
}
```

### TransitionGuard (Cycle 4 확정)
```javascript
function enterState(newState) {
  if (STATE_PRIORITY[newState] < STATE_PRIORITY[state] && isTransitioning) return;
  isTransitioning = true;
  tweenManager.clearImmediate();
  state = newState;
  // 상태별 초기화 switch
  isTransitioning = false; // 초기화 완료 후 해제
}
```

### EventManager (Cycle 3 listen/destroy 패턴)
```javascript
const listeners = [];
function listen(target, event, handler, options) {
  target.addEventListener(event, handler, options);
  listeners.push({ target, event, handler, options });
}
function destroyListeners() {
  listeners.forEach(l => l.target.removeEventListener(l.event, l.handler, l.options));
  listeners.length = 0;
}
```

### 시드 기반 RNG (일일 챌린지용)
```javascript
function seededRng(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}
```

---

## §13. 자동 검증 체크리스트

### §13.1 금지 패턴 (자동 grep 검증 대상)

| # | 금지 패턴 | grep 패턴 | 위반 시 |
|---|----------|----------|---------|
| 1 | 외부 에셋 참조 | `src=\|href=.*\.(png\|jpg\|svg\|mp3\|ogg\|woff)` | FAIL |
| 2 | Google Fonts | `fonts.googleapis` | FAIL |
| 3 | SVG 필터 | `feGaussianBlur\|feDropShadow\|<filter` | FAIL |
| 4 | setTimeout 상태 전환 | `setTimeout.*state\|setTimeout.*enter` | FAIL |
| 5 | confirm/alert | `confirm(\|alert(` | FAIL |
| 6 | assets/ 디렉토리 | `assets/` 디렉토리 존재 | FAIL |
| 7 | 전역 직접 참조 함수 | 게임 로직 함수 내 전역 변수 직접 참조 | WARN |

### §13.2 필수 포함 패턴

| # | 필수 패턴 | 확인 방법 |
|---|----------|----------|
| 1 | `enterState(` | 상태 전환 함수 존재 |
| 2 | `clearImmediate(` | TweenManager 즉시 정리 API |
| 3 | `try.*localStorage` | localStorage 안전 래핑 |
| 4 | `isTransitioning\|isWaveClearing` | 가드 플래그 존재 |
| 5 | `addEventListener` + 대응 `removeEventListener` | 리스너 정리 |
| 6 | `devicePixelRatio` | DPR 대응 |
| 7 | `inputMode` 분기 실사용 | 입력 모드 조건 분기 코드 |

### §13.3 검증 실행 타이밍
1. **코딩 전**: 템플릿에 assets/ 디렉토리가 없는지 확인
2. **코딩 중**: 주요 시스템 완성 시마다 금지 패턴 스캔
3. **코딩 후**: 전체 체크리스트 최종 실행

### §13.4 코드 리뷰 체크리스트 (기획서 대조)

- [ ] 상태 × 시스템 매트릭스 (§5.3)가 코드에 정확히 반영되었는가?
- [ ] 모든 상태 전환이 `enterState()`를 통해서만 이루어지는가?
- [ ] 선언된 변수가 기획서 의도대로 갱신/사용되는가? (유령 변수 0건)
- [ ] 가드 플래그(`isWaveClearing`, `isTransitioning`, `isLevelingUp`)가 적절히 사용되는가?
- [ ] 순수 함수 목록 (§10)이 전역 직접 참조 없이 구현되었는가?
- [ ] `clearImmediate()`가 `enterState()` 진입부에서 호출되는가?
- [ ] 투사체/적/젬 ObjectPool이 release 누수 없이 동작하는가?
- [ ] inputMode 변수가 조건 분기에 실제 사용되는가?
- [ ] 일일 챌린지 시드가 동일 날짜에 동일 결과를 생성하는가?
- [ ] 모바일 가상 조이스틱이 터치 이벤트에 올바르게 반응하는가?

---

## §14. 사이드바 & 카드 메타데이터

### 게임 페이지 사이드바

```yaml
game:
  title: "미니 서바이버 아레나"
  description: "360도 몬스터 웨이브 속에서 자동 공격과 스킬 빌드로 생존하는 탑다운 서바이버!"
  genre: ["action", "arcade"]
  playCount: 0
  rating: 0
  controls:
    - "WASD / 방향키: 이동"
    - "1/2/3: 레벨업 스킬 선택"
    - "P / ESC: 일시정지"
    - "터치: 가상 조이스틱 이동"
  tags:
    - "#서바이버"
    - "#자동공격"
    - "#스킬빌드"
    - "#웨이브생존"
    - "#뱀서라이크"
    - "#로그라이트"
  addedAt: "2026-03-20"
  version: "1.0.0"
  featured: true
```

### 홈페이지 GameCard 표시

| 필드 | 값 |
|------|-----|
| thumbnail | Canvas 코드로 생성: 어두운 배경 + 민트색 플레이어 + 빨간 적 무리 + 노란 투사체 |
| title | "미니 서바이버 아레나" (1줄) |
| description | "360도 몬스터 웨이브 속에서 자동 공격과 스킬 빌드로 생존하라!" (2줄) |
| genre 배지 | `action`, `arcade` (최대 2개) |
| playCount | 초기 0 → "1.2k" 포맷 (1000 이상) |
| addedAt | 2026-03-20 → 7일 이내이므로 **"NEW" 배지** 표시 |
| featured | true → **⭐ 배지** 표시 |

---

## §15. 기술 아키텍처 요약

```
/games/mini-survivor-arena/
  └── index.html          ← 단일 파일, 외부 의존성 0개
```

- **렌더링**: Canvas 2D API, DPR 대응
- **게임 루프**: requestAnimationFrame + fixed timestep (16.67ms cap 50ms)
- **상태 관리**: 유한 상태 머신 (7 상태) + TransitionGuard
- **월드/카메라**: 1600×1600 월드 + 800×800 뷰포트 + lerp 카메라 추적
- **오브젝트 관리**: ObjectPool (적 150, 투사체 200, XP 젬 200, 파티클 300)
- **애니메이션**: TweenManager (clearImmediate API 포함)
- **오디오**: Web Audio API 절차적 사운드 (try-catch)
- **저장**: localStorage (try-catch, iframe 안전)
- **입력**: 키보드 + 마우스 + 터치 가상 조이스틱, inputMode 분기
- **랜덤**: 일반 모드 Math.random(), 챌린지 모드 seededRng()
- **함수 설계**: 순수 함수 패턴 (§10), 전역 직접 참조 금지

---

_기획 완료: 2026-03-20_
_다음 단계: 구현 → 자동 검증 → 코드 리뷰 → 배포_
