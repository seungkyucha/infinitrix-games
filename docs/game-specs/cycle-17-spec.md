---
game-id: arcane-bastion
title: 아케인 바스티온
genre: action, strategy
difficulty: hard
---

# 아케인 바스티온 — 상세 기획서

_사이클 #17 | 작성일: 2026-03-22_

---

## §0. 이전 사이클 피드백 반영 매핑

> Cycle 16 포스트모템 "아쉬웠던 점" + platform-wisdom 누적 교훈(F1~F23, 16사이클)을 기획 단계에서 선제 대응한다.

| # | 출처 | 문제 | 이번 기획서 해결 방법 | 해당 섹션 |
|---|------|------|----------------------|-----------|
| F1 | Cycle 1~16 (16사이클 연속) | assets/ 디렉토리 재발 | **빈 index.html에서 처음부터 작성.** assets/ 디렉토리 절대 생성 금지. 100% Canvas 코드 드로잉 + thumbnail.svg만 허용 | §8, §13.6 |
| F2 | Cycle 1~16 | setTimeout 기반 상태 전환 | tween onComplete 콜백만으로 전환. setTimeout **0건** 목표 | §5, §13.5 |
| F3 | Cycle 6~16 | 순수 함수 패턴 필수 | 모든 게임 로직 함수는 파라미터 기반. 전역 직접 참조 0건. §10에 전체 함수 시그니처 정의 | §10 |
| F4 | Cycle 2 | 상태×시스템 매트릭스 누락 | §6에 전체 상태×시스템 매트릭스 선행 작성 (5상태 × 6시스템) | §6 |
| F5 | Cycle 3/4 | 가드 플래그 누락 → 콜백 반복 호출 | `waveClearing`, `isTransitioning`, `isBossActive` 3중 가드 체계 | §5.4, §6.2 |
| F6 | Cycle 4 | TweenManager cancelAll+add 경쟁 조건 | `clearImmediate()` 즉시 정리 API 분리. cancelAll 직후 `_pendingCancel=false` + `_tweens.length=0` 플러시 | §10.1 |
| F7 | Cycle 7/16 | 기획서 수치 ↔ 코드 수치 불일치 | §13 수치 정합성 검증 테이블 필수. 웨이브별 적 수·HP·보상 전수 대조 | §13 |
| F8 | Cycle 1 | iframe 환경 confirm/alert 사용 불가 | Canvas 기반 모달 UI만 사용. window.open/alert/confirm/prompt 0건 | §4, §8 |
| F9 | Cycle 3~4 | SVG 필터 재발 (feGaussianBlur) | 인라인 SVG에서 filter 태그 완전 금지. gradient/pattern만 허용. Canvas glow는 shadowBlur로 구현 | §8.2 |
| F10 | Cycle 15~16 | offscreen canvas 배경 캐싱 | `buildBgCache()` 패턴 — resizeCanvas() 시에만 재빌드. 바이옴 배경 3종 캐싱 | §8.3 |
| F11 | Cycle 11 | let/const TDZ 크래시 | 변수 선언 → DOM 할당 → 이벤트 등록 → init() 순서 엄격 준수. §13.1 초기화 순서 체크리스트 | §13.1 |
| F12 | Cycle 10/11 | gameLoop try-catch 미적용 | `try{...}catch(e){console.error(e);}requestAnimationFrame(loop)` 기본 적용 | §5.3, §13.4 |
| F13 | Cycle 13~16 | index.html 미존재 | 리뷰 제출 전 스모크 테스트: (1) index.html 존재 (2) 페이지 로드 성공 (3) 콘솔 에러 0건 | §13.7 |
| F14 | Cycle 10 | 수정 회귀 (render 시그니처 변경) | 수정 시 전체 플로우 회귀 테스트 (TITLE→PLAY→UPGRADE→BOSS→GAMEOVER) | §13.8 |
| F15 | Cycle 3/7 | 유령 변수 (선언만 하고 미사용) | §13.2 변수 사용처 검증 테이블 | §13.2 |
| F16 | Cycle 5 | 하나의 값에 대한 갱신 경로 이중화 | HP/마나/점수는 단일 함수(`modifyHP()`, `modifyMana()`, `addScore()`)를 통해서만 갱신 | §7.1 |
| F17 | Cycle 3 | 상태 전환 우선순위 체계 | GAMEOVER > BOSS > UPGRADE_SELECT > PAUSED > PLAYING. STATE_PRIORITY 맵 | §6.2 |
| F18 | Cycle 15~16 | 범위 축소 전략 | 상태 5개 한정, 핵심 메카닉 3개(직접 전투+타워 배치+로그라이크 업그레이드). "나중에" 금지 | §1 |
| F19 | Cycle 15 | "절반 구현" 패턴 | 기능별 세부 구현 체크리스트(§13.3) — A+B+C 개별 완료 확인 | §13.3 |
| F20 | Cycle 13 | CONFIG.MIN_TOUCH 선언-구현 괴리 | 모든 버튼·UI에 `touchSafe()` 유틸로 48px 하한 강제 적용 | §4, §12.3 |
| F21 | Cycle 16 아쉬운점 | 마우스 하드드롭 미지원 | 키보드/마우스/터치 모두 **전 기능 지원** 보장. 입력별 매핑 테이블 §3에 명시 | §3 |
| F22 | Cycle 16 아쉬운점 | NEXT 프리뷰 미구현 | 기획서에 명시된 UI는 **100% 구현**. "선택적" 기능 없음 | §4 |
| F23 | Cycle 5/8 | beginTransition() 우회 직접 전환 | 모든 화면 전환은 `beginTransition()` 경유 필수. PAUSED만 예외(즉시 전환, `beginTransition(target, {immediate:true})`) | §6.2 |
| F24 | Cycle 12 | 터치 타겟 44×44px 미달 | 모든 인터랙티브 UI 최소 48×48px. CONFIG.MIN_TOUCH_TARGET = 48 | §4, §12.3 |

---

## §1. 게임 개요 및 핵심 재미 요소

### 컨셉
마법사가 바스티온(요새)을 중앙에 두고, 사방에서 몰려오는 적을 **직접 주문을 시전**하여 처치하고, **마법 타워를 배치**하여 자동 방어를 구축하며, 웨이브 사이마다 **로그라이크 업그레이드 3택 1**을 선택하여 성장하는 **로그라이크 포지 디펜스**.

### 핵심 재미 요소
1. **이중 전투 긴장감**: 마법사가 직접 주문을 쏘면서 + 타워가 자동 공격. "내가 어디를 막고, 타워에 어디를 맡길까"의 판단
2. **로그라이크 성장 쾌감**: 웨이브 클리어 후 3택 1 업그레이드. 매 런마다 다른 빌드 → 무한 리플레이
3. **자원 딜레마**: 마나를 주문에 쓸까, 타워 건설에 쓸까? 공격 vs 투자의 끊임없는 선택
4. **보스전 스펙터클**: 5/10/15웨이브 보스 — 특수 패턴 + 화면 흔들림 + 슬로우모션 연출
5. **점진적 압도감**: 1웨이브(슬라임 5마리) → 15웨이브(드래곤 보스 + 엘리트 혼합). 처음엔 여유롭다가 점점 벅차오르는 곡선
6. **한 판 5~10분**: 초보자 3분(5웨이브), 숙련자 10분(15웨이브 클리어). 즉시 재도전 가능

### 장르 균형 기여
- 현재 플랫폼: action 21.1% (최소), strategy 26.3% (2번째 최소)
- 이 게임: **action + strategy** → 가장 부족한 2개 장르 동시 보강
- 기존 mini-tower-defense와 차별: 직접 전투 + 로그라이크 업그레이드 + 보스전 추가

### Cycle 16 포스트모템 반영 포인트
- **범위 축소 전략 유지**: 상태 5개, 핵심 메카닉 3개로 한정
- **마우스 전 기능 지원**: 키보드/마우스/터치 모두 동일 기능 (Cycle 16 하드드롭 미지원 교훈)
- **기획 UI 100% 구현**: NEXT 웨이브 프리뷰, 미니맵 등 기획서에 적은 것은 전부 구현 ("나중에" 금지)
- **offscreen canvas 배경 캐싱**: 초기부터 적용

---

## §2. 게임 규칙 및 목표

### 2.1 기본 규칙
1. 화면 중앙에 **바스티온(요새)**이 위치한다 (HP 100)
2. 적은 화면 4방향(상/하/좌/우) 가장자리에서 스폰되어 바스티온을 향해 이동한다
3. 플레이어(마법사)는 바스티온 주변을 자유롭게 이동하며 주문을 시전한다
4. **마나**를 소비하여 마법 타워를 배치할 수 있다 (최대 8개)
5. 바스티온 HP가 0이 되면 게임 오버
6. 15웨이브 클리어 시 승리

### 2.2 웨이브 시스템
| 웨이브 | 적 종류 | 적 수 | 보스 | 바이옴 |
|--------|---------|-------|------|--------|
| 1 | 슬라임 | 5 | - | 숲 |
| 2 | 슬라임 | 8 | - | 숲 |
| 3 | 슬라임+스켈레톤 | 10 | - | 숲 |
| 4 | 스켈레톤+스파이더 | 12 | - | 숲 |
| 5 | 슬라임+스켈레톤+스파이더 | 15 | 🔴 골렘 보스 | 숲 |
| 6 | 레이스+스파이더 | 14 | - | 동굴 |
| 7 | 레이스+골렘 | 16 | - | 동굴 |
| 8 | 스켈레톤+레이스+골렘 | 18 | - | 동굴 |
| 9 | 전종 혼합 | 20 | - | 동굴 |
| 10 | 전종 혼합+엘리트 | 22 | 🔴 레이스 킹 보스 | 동굴 |
| 11 | 전종+엘리트×2 | 20 | - | 화산 |
| 12 | 전종+엘리트×3 | 22 | - | 화산 |
| 13 | 엘리트 집중 | 18 | - | 화산 |
| 14 | 전종+엘리트×4 | 25 | - | 화산 |
| 15 | 전 엘리트 | 20 | 🔴 드래곤 최종보스 | 화산 |

### 2.3 적 타입 (7종 + 보스 3종)
| 적 | HP | 속도 | 공격력 | 특수 능력 | 색상 |
|----|----|------|--------|-----------|------|
| 슬라임 | 20 | 1.0 | 5 | 없음 | #44ff44 (녹) |
| 스켈레톤 | 35 | 1.5 | 8 | 빠른 이동 | #dddddd (백) |
| 스파이더 | 25 | 2.0 | 6 | 최고속, 군집 | #884488 (보라) |
| 골렘 | 80 | 0.5 | 15 | 고HP, 느림 | #aa7744 (갈) |
| 레이스 | 40 | 1.2 | 10 | 일정 확률 투명화(피격 무시) | #6666ff (청) |
| 다크나이트 | 60 | 1.0 | 12 | 근접 시 방어력 상승 | #333333 (흑) |
| 드래곤킨 | 50 | 0.8 | 10 | 원거리 화염 발사 | #ff4444 (적) |
| **[보스] 골렘 킹** | 300 | 0.3 | 20 | 지면 충격파 (범위 공격) | #cc8833 |
| **[보스] 레이스 킹** | 250 | 0.8 | 25 | 소환 (레이스 2마리) + 순간이동 | #4444ff |
| **[보스] 고대 드래곤** | 500 | 0.4 | 30 | 화염 브레스 (부채꼴 범위) + 비행 | #ff2222 |

### 2.4 마법 타워 (5종)
| 타워 | 마나 비용 | 사거리 | 공격력 | 공격속도 | 특수 |
|------|-----------|--------|--------|----------|------|
| 아케인 타워 | 30 | 120 | 10 | 1.0s | 기본 단일 대상 |
| 화염 타워 | 50 | 100 | 15 | 1.5s | 범위 공격 (반경 40) |
| 냉기 타워 | 40 | 130 | 8 | 1.2s | 감속 30%, 2초 |
| 번개 타워 | 60 | 150 | 20 | 2.0s | 체인 3대상 |
| 치유 타워 | 45 | 80 | 0 | 3.0s | 바스티온 HP 회복 5 |

### 2.5 마법사 주문
| 주문 | 마나 소비 | 사거리 | 공격력 | 쿨다운 | 특수 |
|------|-----------|--------|--------|--------|------|
| 아케인 볼트 | 0 | 200 | 8 | 0.3s | 기본 공격 (마나 소비 없음) |
| 파이어볼 | 15 | 180 | 25 | 1.5s | 범위 폭발 (반경 50) |
| 프로스트 노바 | 20 | 자기중심 | 10 | 3.0s | 주변 적 전체 감속 50%, 3초 |

---

## §3. 조작 방법

### 3.1 키보드
| 키 | 기능 |
|----|------|
| W/A/S/D 또는 방향키 | 마법사 이동 (8방향) |
| 마우스 좌클릭 | 아케인 볼트 발사 (마우스 방향) |
| Q | 파이어볼 시전 (마우스 방향) |
| E | 프로스트 노바 시전 (자기 중심) |
| 1~5 | 타워 선택 (배치 모드 진입) |
| 마우스 좌클릭 (배치 모드) | 타워 배치 |
| ESC / 우클릭 | 배치 모드 취소 / 일시정지 |
| Space | 웨이브 조기 시작 (대기 중) |

### 3.2 마우스 단독
| 입력 | 기능 |
|------|------|
| 좌클릭 (게임 필드) | 해당 방향으로 아케인 볼트 발사 |
| 우클릭 | 파이어볼 시전 (클릭 방향) |
| 가운데 클릭 | 프로스트 노바 |
| 마법사 드래그 | 마법사 이동 |
| 하단 UI 타워 아이콘 클릭 | 타워 선택 → 배치 모드 |
| ESC | 일시정지 |

### 3.3 터치 (모바일)
| 입력 | 기능 |
|------|------|
| 좌측 가상 조이스틱 | 마법사 이동 |
| 우측 영역 탭 | 아케인 볼트 발사 (탭 방향) |
| 스킬 버튼 (화면 우하단) | 파이어볼 / 프로스트 노바 |
| 하단 타워 바 탭 | 타워 선택 → 배치 모드 |
| 배치 모드에서 탭 | 타워 배치 |
| 일시정지 버튼 (우상단, 48×48px) | 일시정지 |

### 3.4 입력 장치별 기능 커버리지 매트릭스
| 기능 | 키보드+마우스 | 마우스 단독 | 터치 |
|------|--------------|------------|------|
| 이동 | ✅ WASD/방향키 | ✅ 드래그 | ✅ 조이스틱 |
| 기본 공격 | ✅ 좌클릭 | ✅ 좌클릭 | ✅ 우측 탭 |
| 파이어볼 | ✅ Q키 | ✅ 우클릭 | ✅ 스킬 버튼 |
| 프로스트 노바 | ✅ E키 | ✅ 가운데 클릭 | ✅ 스킬 버튼 |
| 타워 선택 | ✅ 1~5키 | ✅ UI 클릭 | ✅ UI 탭 |
| 타워 배치 | ✅ 좌클릭 | ✅ 좌클릭 | ✅ 탭 |
| 일시정지 | ✅ ESC | ✅ ESC | ✅ 버튼 |

> ⚠️ **Cycle 16 교훈**: 모든 입력 장치에서 전 기능이 사용 가능해야 한다. 마우스 단독 플레이 시 기능 누락 금지.

---

## §4. 시각적 스타일 가이드

### 4.1 전체 테마
**다크 판타지 네온** — 어두운 배경에 마법 이펙트가 빛나는 스타일. InfiniTriX 플랫폼의 네온 시각 정체성 유지.

### 4.2 색상 팔레트
| 용도 | 색상 | Hex |
|------|------|-----|
| 배경 (숲) | 짙은 녹색 | #0a1a0a → #1a3a1a 그라디언트 |
| 배경 (동굴) | 짙은 청색 | #0a0a1a → #1a1a3a 그라디언트 |
| 배경 (화산) | 짙은 적색 | #1a0a0a → #3a1a0a 그라디언트 |
| 바스티온 | 금색 글로우 | #ffd700, shadow #ffaa00 |
| 마법사 | 보라색 로브 | #9944ff, #bb66ff |
| 아케인 이펙트 | 시안 | #00ffff |
| 화염 이펙트 | 오렌지-적 | #ff6600, #ff2200 |
| 냉기 이펙트 | 하늘색 | #88ddff, #44aaff |
| 번개 이펙트 | 황색 | #ffff44, #ffdd00 |
| UI 텍스트 | 흰색 | #ffffff |
| UI 배경 | 반투명 흑 | rgba(0,0,0,0.7) |
| HP 바 | 적→녹 그라디언트 | #ff4444 → #44ff44 |
| 마나 바 | 청색 | #4488ff |

### 4.3 바스티온 시각 디자인
- 중앙 원형 요새, 금색 테두리 + 내부 보라색 마법진
- HP 비율에 따라 금빛 강도 감소 (100%: 밝은 금 → 20%: 어두운 갈색)
- 피격 시 0.1초 빨간 플래시

### 4.4 마법사 시각 디자인 (다중 프레임)
| 상태 | 설명 |
|------|------|
| idle | 로브 자락 미세 흔들림 (사인파), 지팡이 끝 빛남 |
| walk | 4프레임 걷기 애니메이션, 로브 펄럭임 |
| attack | 지팡이 휘두르기 + 마법진 출현 |
| hit | 빨간 플래시 0.1초 + 넉백 |
| cast | 양팔 들기 + 마법진 확대 (파이어볼/노바) |

### 4.5 적 시각 디자인 (타입별 고유)
| 적 | 형태 | 특징 |
|------|------|------|
| 슬라임 | 반투명 젤리 원형 | 탄성 바운스 이동, 눈 2개 |
| 스켈레톤 | 해골 전사 | 칼 휘두르기, 뼈 관절 분리 |
| 스파이더 | 8다리 거미 | 다리 애니메이션, 빠른 이동 |
| 골렘 | 바위 덩어리 | 무거운 걸음, 파편 파티클 |
| 레이스 | 투명 유령 | 반투명 깜빡임, 꼬리 잔상 |
| 다크나이트 | 갑옷 전사 | 방패 빛남 (근접 시 방어 활성) |
| 드래곤킨 | 소형 드래곤 | 날개짓, 화염 파티클 |

### 4.6 보스 시각 디자인
- **골렘 킹**: 일반 골렘 2.5배 크기, 왕관, 지면 충격파 시 동심원 이펙트
- **레이스 킹**: 일반 레이스 2배 크기, 왕관, 순간이동 시 잔상 3개
- **고대 드래곤**: 화면 폭 40% 크기, 날개 펼침 애니메이션, 화염 브레스 부채꼴 이펙트

### 4.7 배경 레이어 (3~4 레이어 패럴랙스)
| 레이어 | 숲 | 동굴 | 화산 |
|--------|-----|------|------|
| far (0.1x) | 먼 산맥 실루엣 | 종유석 천장 | 용암 흐름 원경 |
| mid (0.3x) | 나무 실루엣 | 바위 기둥 | 분화구 가장자리 |
| near (0.6x) | 풀/관목 | 크리스탈 조각 | 용암 균열 |
| foreground (1.0x) | 낙엽 파티클 | 물방울 파티클 | 불꽃 파티클 |

> 모든 배경은 offscreen canvas `buildBgCache(biome)` 함수로 캐싱. resizeCanvas() 시에만 재빌드.

### 4.8 UI 요소 크기 규격
- 모든 인터랙티브 UI 최소 48×48px (`CONFIG.MIN_TOUCH_TARGET = 48`)
- 일시정지 버튼: 48×48px (우상단)
- 타워 선택 바: 각 아이콘 56×56px (하단 중앙)
- 스킬 버튼: 56×56px (우하단, 터치 전용)
- 가상 조이스틱 베이스: 120×120px (좌하단, 터치 전용)

---

## §5. 핵심 게임 루프 (초당 프레임 기준 로직 흐름)

### 5.1 메인 루프 구조
```
function gameLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 최대 50ms 캡
    lastTime = timestamp;

    tweenManager.update(dt);

    switch (state) {
      case STATE.TITLE:      updateTitle(dt);    break;
      case STATE.PLAYING:    updatePlaying(dt);  break;
      case STATE.UPGRADE:    updateUpgrade(dt);  break;
      case STATE.PAUSED:     /* 아무것도 안 함 */ break;
      case STATE.GAMEOVER:   updateGameOver(dt); break;
    }

    render(state, dt);
  } catch (e) {
    console.error('[GameLoop Error]', e);
  }
  requestAnimationFrame(gameLoop);
}
```

### 5.2 PLAYING 상태 프레임 흐름
```
updatePlaying(dt):
  1. updateInput(dt)          — 키보드/마우스/터치 입력 처리
  2. updateWizard(wizard, dt)  — 마법사 이동 + 쿨다운 갱신
  3. updateProjectiles(projectiles, enemies, dt) — 투사체 이동 + 충돌
  4. updateTowers(towers, enemies, dt)           — 타워 자동 공격
  5. updateEnemies(enemies, bastion, dt)          — 적 이동 + 바스티온 공격
  6. checkWaveComplete(enemies, waveData)         — 웨이브 완료 판정
  7. checkGameOver(bastion)                       — 바스티온 HP ≤ 0 판정
  8. updateParticles(particles, dt)               — 파티클 업데이트
  9. updateScreenEffects(dt)                      — 화면 흔들림/슬로우모션
```

### 5.3 방어적 게임 루프
- `try-catch`로 전체 루프 감싸기 (F12)
- `dt` 최대값 50ms 캡 (탭 전환 후 복귀 시 폭주 방지)
- `requestAnimationFrame`은 catch 블록 밖에서 호출

### 5.4 가드 플래그 체계
| 플래그 | 용도 | 설정 시점 | 해제 시점 |
|--------|------|-----------|-----------|
| `_waveClearing` | 웨이브 완료 처리 중복 방지 | checkWaveComplete() 진입 | 업그레이드 선택 완료 후 |
| `_isTransitioning` | 상태 전환 중복 방지 | beginTransition() 진입 | 전환 완료 콜백 |
| `_isBossActive` | 보스 활성 여부 | 보스 스폰 | 보스 처치 |
| `_isPlacingTower` | 타워 배치 모드 | 타워 아이콘 클릭 | 배치 완료/취소 |

---

## §6. 상태 머신 및 상태×시스템 매트릭스

### 6.1 게임 상태 (5개)
```
STATE = {
  TITLE: 0,        // 타이틀 화면
  PLAYING: 1,      // 메인 게임플레이
  UPGRADE: 2,      // 웨이브 간 업그레이드 선택 (3택 1)
  PAUSED: 3,       // 일시정지
  GAMEOVER: 4      // 게임 오버 (패배 또는 승리)
}
```

### 6.2 상태 전환 우선순위 (STATE_PRIORITY)
```
STATE_PRIORITY = {
  GAMEOVER: 100,   // 최고 우선
  PAUSED: 80,
  UPGRADE: 60,
  PLAYING: 40,
  TITLE: 20        // 최저 우선
}
```

모든 상태 전환은 `beginTransition(targetState, options)` 경유 필수:
```
function beginTransition(target, opts = {}) {
  if (_isTransitioning) return;
  if (STATE_PRIORITY[target] < STATE_PRIORITY[state] && !opts.force) return;
  if (bastion.hp <= 0 && target !== 'GAMEOVER') return; // GAMEOVER 우선
  _isTransitioning = true;

  if (opts.immediate) {
    state = target;
    _isTransitioning = false;
    return;
  }

  tweenManager.add({
    target: screenFade, prop: 'alpha',
    from: 0, to: 1, duration: 300,
    onComplete: () => {
      state = target;
      tweenManager.add({
        target: screenFade, prop: 'alpha',
        from: 1, to: 0, duration: 300,
        onComplete: () => { _isTransitioning = false; }
      });
    }
  });
}
```

### 6.3 상태 × 시스템 매트릭스

| 시스템 | TITLE | PLAYING | UPGRADE | PAUSED | GAMEOVER |
|--------|-------|---------|---------|--------|----------|
| **tween** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **input** | ✅ 시작 | ✅ 전체 | ✅ 선택 | ✅ 해제 | ✅ 재시작 |
| **physics** (이동/충돌) | ❌ | ✅ | ❌ | ❌ | ❌ |
| **enemies** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **towers** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **particles** | ✅ 타이틀용 | ✅ | ✅ 잔여 | ❌ | ✅ 잔여 |
| **render** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **audio** | ✅ BGM | ✅ BGM+SFX | ✅ BGM | ❌ 음소거 | ✅ BGM |
| **screenFX** | ❌ | ✅ | ❌ | ❌ | ✅ |

---

## §7. 점수 시스템 및 자원 관리

### 7.1 점수
| 행동 | 점수 |
|------|------|
| 슬라임 처치 | 10 |
| 스켈레톤 처치 | 20 |
| 스파이더 처치 | 15 |
| 골렘 처치 | 40 |
| 레이스 처치 | 25 |
| 다크나이트 처치 | 35 |
| 드래곤킨 처치 | 30 |
| 골렘 킹 보스 처치 | 200 |
| 레이스 킹 보스 처치 | 300 |
| 고대 드래곤 보스 처치 | 500 |
| 웨이브 클리어 보너스 | 웨이브 번호 × 50 |
| 바스티온 잔여 HP 보너스 (승리 시) | HP × 10 |

> 점수 갱신은 반드시 `addScore(amount, source)` 단일 함수만 사용 (F16).

### 7.2 마나 시스템
- 초기 마나: 100 / 최대 마나: 100 (업그레이드로 증가 가능)
- 마나 자동 회복: 3/초 (업그레이드로 증가 가능)
- 적 처치 시 마나 드롭: 처치 적 마나 보상 = 적 점수의 20% (소수점 버림)
- 마나 갱신은 반드시 `modifyMana(amount, source)` 단일 함수만 사용

### 7.3 바스티온 HP
- 초기 HP: 100 / 최대 HP: 100 (업그레이드로 증가 가능)
- 피격 시 `modifyHP(amount, source)` 단일 함수로만 변경
- HP ≤ 0 시 즉시 GAMEOVER 전환 (STATE_PRIORITY 최고)
- HP 회복: 치유 타워, 일부 업그레이드

### 7.4 최고 기록 저장
- localStorage 키: `arcaneBastion_hi`
- 저장 형식: `JSON.stringify({ score, wave, time })`
- **판정 먼저, 저장 나중에** (F: Cycle 2 교훈)
```
const isNewBest = score > getBest().score; // 판정 먼저
saveBest({ score, wave, time });            // 저장 나중에
```

---

## §8. 난이도 시스템

### 8.1 웨이브 기반 난이도 곡선

| 웨이브 | 적 HP 배율 | 적 속도 배율 | 적 수 배율 | 스폰 간격(ms) |
|--------|-----------|-------------|-----------|---------------|
| 1-3 | 1.0× | 1.0× | 1.0× | 1500 |
| 4-5 | 1.2× | 1.1× | 1.2× | 1200 |
| 6-8 | 1.4× | 1.2× | 1.3× | 1000 |
| 9-10 | 1.6× | 1.3× | 1.4× | 800 |
| 11-13 | 1.8× | 1.4× | 1.5× | 700 |
| 14-15 | 2.0× | 1.5× | 1.6× | 600 |

### 8.2 엘리트 적
- 웨이브 10+ 에서 등장
- 일반 적의 2배 HP, 1.3배 속도
- 황금 테두리 글로우 (shadowBlur, **SVG filter 금지** F9)
- 처치 시 2배 점수 + 2배 마나

### 8.3 보스 메카닉
| 보스 | 웨이브 | 패턴 1 | 패턴 2 | 패턴 3 |
|------|--------|--------|--------|--------|
| 골렘 킹 | 5 | 직선 돌진 | 지면 충격파 (3초 쿨) | 바위 투척 |
| 레이스 킹 | 10 | 순간이동 (5초 쿨) | 레이스 2마리 소환 (10초 쿨) | 영혼 흡수 (HP 회복) |
| 고대 드래곤 | 15 | 화염 브레스 (부채꼴 60도) | 비행 (3초간 무적+이동) | 화염 융단폭격 (직선 3줄) |

---

## §9. 로그라이크 업그레이드 시스템

### 9.1 업그레이드 풀 (18종)
웨이브 클리어 후 3개 무작위 제시, 1개 선택.

| # | 카테고리 | 이름 | 효과 | 최대 중첩 |
|---|----------|------|------|-----------|
| 1 | 공격 | 볼트 강화 | 아케인 볼트 공격력 +25% | 3 |
| 2 | 공격 | 멀티샷 | 아케인 볼트 2발 동시 발사 | 1 |
| 3 | 공격 | 파이어 마스터리 | 파이어볼 범위 +30%, 쿨다운 -20% | 2 |
| 4 | 공격 | 연쇄 번개 | 아케인 볼트가 체인 1회 추가 | 2 |
| 5 | 방어 | 바스티온 강화 | 바스티온 최대 HP +20 | 3 |
| 6 | 방어 | 가시 보호막 | 바스티온 근접 공격한 적에게 반사 피해 5 | 2 |
| 7 | 방어 | 보호 결계 | 바스티온 피격 시 30% 확률로 피해 무시 | 2 |
| 8 | 자원 | 마나 샘 | 마나 자동 회복 +2/초 | 3 |
| 9 | 자원 | 마나 약탈 | 적 처치 시 마나 보상 +50% | 2 |
| 10 | 자원 | 확장 마나풀 | 최대 마나 +30 | 2 |
| 11 | 타워 | 타워 강화 | 전 타워 공격력 +20% | 3 |
| 12 | 타워 | 빠른 장전 | 전 타워 공격속도 +15% | 3 |
| 13 | 타워 | 추가 배치 | 타워 최대 배치 수 +2 | 2 |
| 14 | 이동 | 신속 | 마법사 이동속도 +20% | 3 |
| 15 | 이동 | 순간이동 | Space(또는 더블탭)로 짧은 텔레포트 | 1 |
| 16 | 특수 | 냉기 마스터리 | 프로스트 노바 범위 +40%, 감속 지속 +1초 | 2 |
| 17 | 특수 | 크리티컬 | 모든 공격 20% 확률 2배 데미지 | 2 |
| 18 | 특수 | 재생 | 웨이브 시작 시 바스티온 HP 10 회복 | 3 |

### 9.2 업그레이드 선택 UI
- 화면 중앙에 카드 3장 가로 배치 (각 160×220px)
- 카드 구성: 아이콘 (상단), 이름 (중간), 효과 설명 (하단), 카테고리 색상 테두리
- 호버/터치 시 카드 확대(1.1×) + 글로우
- 선택 시 카드 확대 → 페이드아웃 → 다음 웨이브 시작
- 카테고리 색상: 공격=#ff4444, 방어=#44ff44, 자원=#4488ff, 타워=#ffaa00, 이동=#44ffff, 특수=#ff44ff

---

## §10. 함수 시그니처 정의 (순수 함수 원칙)

> **F3 원칙**: 모든 게임 로직 함수는 파라미터로 데이터를 수신한다. 전역 직접 참조 0건.

### 10.1 핵심 유틸리티
```javascript
// TweenManager — clearImmediate() 분리 (F6)
class TweenManager {
  add(opts)           // { target, prop, from, to, duration, ease, onComplete }
  update(dt)          // 매 프레임 호출
  cancelAll()         // deferred 취소
  clearImmediate()    // 즉시 정리 — cancelAll 후 안전하게 add 가능
}

// ObjectPool — 파티클/투사체 재사용
class ObjectPool {
  constructor(createFn, resetFn, size)
  acquire()
  release(obj)
}

// SoundManager — Web Audio API
class SoundManager {
  playBGM(type)       // 'forest' | 'cave' | 'volcano' | 'boss'
  playSFX(type)       // 'shoot' | 'hit' | 'kill' | 'boss_spawn' | 'level_up' | 'tower_place' | 'game_over'
  stopAll()
  setVolume(v)
}
```

### 10.2 게임 로직 함수 시그니처 (전역 참조 0건)
```javascript
// 마법사
function updateWizard(wizard, input, dt, bounds) → wizard
function fireArcaneBeam(wizard, targetPos, projectiles, upgrades) → projectile
function castFireball(wizard, targetPos, mana, projectiles, upgrades) → { projectile, manaUsed }
function castFrostNova(wizard, enemies, mana, upgrades) → { affected[], manaUsed }

// 적
function spawnEnemy(type, waveNum, spawnSide, bounds) → enemy
function updateEnemy(enemy, bastion, dt) → enemy
function damageEnemy(enemy, damage, isCrit) → { enemy, killed, score, mana }
function checkEnemyAttack(enemy, bastion, dt) → damage

// 타워
function placeTower(type, pos, towers, mana, maxTowers) → { tower, manaUsed, success }
function updateTower(tower, enemies, projectiles, dt, upgrades) → void
function findTarget(tower, enemies) → enemy|null

// 웨이브
function getWaveData(waveNum) → { enemies[], spawnInterval, isBoss }
function checkWaveComplete(enemies, waveClearing) → boolean
function startNextWave(waveNum, bounds) → waveState

// 보스
function updateBoss(boss, wizard, bastion, enemies, dt) → void
function bossPattern(boss, patternId, targets) → effects[]

// 충돌
function checkCollision(a, b) → boolean  // 원형 충돌
function findEnemiesInRadius(pos, radius, enemies) → enemy[]

// 업그레이드
function generateUpgradeChoices(pool, currentUpgrades, count) → choice[3]
function applyUpgrade(upgradeId, gameState) → gameState

// 점수/자원 (단일 갱신 경로 F16)
function addScore(state, amount, source) → state
function modifyMana(state, amount, source) → state
function modifyHP(bastion, amount, source) → bastion

// 렌더
function render(state, gameData, ctx, dt) → void
function drawWizard(ctx, wizard, frame, dt) → void
function drawEnemy(ctx, enemy, dt) → void
function drawTower(ctx, tower, dt) → void
function drawBastion(ctx, bastion, dt) → void
function drawUI(ctx, gameData, state) → void
function drawParticles(ctx, particles, dt) → void
function drawBackground(ctx, bgCache, biome) → void
```

---

## §11. 업적/도전과제 시스템

| # | 업적 이름 | 조건 | 아이콘 |
|---|-----------|------|--------|
| 1 | 첫 방어 | 웨이브 1 클리어 | 🛡️ |
| 2 | 타워 마스터 | 타워 5종 모두 배치 | 🏰 |
| 3 | 백 킬 | 단일 런에서 100킬 달성 | 💀 |
| 4 | 골렘 슬레이어 | 골렘 킹 보스 처치 | ⚔️ |
| 5 | 레이스 밴퀴셔 | 레이스 킹 보스 처치 | 👻 |
| 6 | 드래곤 슬레이어 | 고대 드래곤 최종보스 처치 (게임 클리어) | 🐉 |
| 7 | 무타워 클리어 | 타워 0개로 웨이브 5 클리어 | 🧙 |
| 8 | 무피격 웨이브 | 바스티온 피해 0으로 웨이브 클리어 | ✨ |
| 9 | 마나 부자 | 마나 300 이상 보유 | 💎 |
| 10 | 바스티온 수호자 | 바스티온 HP 100%로 15웨이브 클리어 | 👑 |

- localStorage 키: `arcaneBastion_achievements`
- 달성 시 화면 상단에 토스트 알림 (tween 슬라이드 인/아웃, 2초)
- GAMEOVER 화면에서 달성 업적 목록 표시

---

## §12. 사운드 시스템

### 12.1 Web Audio API 기반 (setTimeout 0건)
- `AudioContext` 생성 후 `ctx.currentTime` 기반 스케줄링만 사용
- BGM: OscillatorNode 체인으로 8비트 스타일 루프
- SFX: 단발 오실레이터 + gainNode 엔벨로프

### 12.2 BGM (4종)
| BGM | 바이옴 | 분위기 | 주파수 범위 |
|-----|--------|--------|-------------|
| 숲 테마 | 웨이브 1-5 | 평화로운 판타지 | C4~G5 |
| 동굴 테마 | 웨이브 6-10 | 긴장감, 에코 | A3~E5 |
| 화산 테마 | 웨이브 11-15 | 웅장, 위협 | E3~B5 |
| 보스 테마 | 보스전 | 격렬, 빠른 비트 | G3~C6 |

### 12.3 SFX (7종)
| SFX | 트리거 | 파형 | 지속시간 |
|-----|--------|------|----------|
| 아케인 볼트 | 기본 공격 | sine→square | 0.1s |
| 파이어볼 | 폭발 | sawtooth | 0.3s |
| 프로스트 노바 | 시전 | triangle | 0.4s |
| 타워 건설 | 배치 확인 | sine | 0.2s |
| 적 처치 | 처치 시 | square→noise | 0.15s |
| 보스 등장 | 보스 스폰 | low sine sweep | 1.0s |
| 게임 오버 | 바스티온 파괴 | descending saw | 0.8s |

### 12.4 터치 타겟 최소 크기
- `CONFIG.MIN_TOUCH_TARGET = 48`
- 모든 버튼 렌더링에 `touchSafe(w, h)` 유틸 적용:
```javascript
function touchSafe(w, h) {
  return { w: Math.max(CONFIG.MIN_TOUCH_TARGET, w), h: Math.max(CONFIG.MIN_TOUCH_TARGET, h) };
}
```

---

## §13. 검증 체크리스트

### 13.1 초기화 순서 체크리스트 (F11)
```
1. const/let 변수 선언 (CONFIG, STATE, STATE_PRIORITY)
2. Canvas 요소 참조 (document.getElementById)
3. Canvas 크기 설정 (resizeCanvas)
4. 클래스 정의 (TweenManager, ObjectPool, SoundManager)
5. 게임 상태 변수 초기화
6. 이벤트 리스너 등록
7. init() 호출
8. requestAnimationFrame(gameLoop) 시작
```

### 13.2 변수 사용처 검증 테이블 (F15)
| 변수 | 선언 | 갱신 위치 | 참조 위치 |
|------|------|-----------|-----------|
| wizard.x/y | init() | updateWizard() | drawWizard(), fireArcaneBeam() |
| bastion.hp | init() | modifyHP() | drawBastion(), drawUI(), checkGameOver() |
| mana | init() | modifyMana() | castFireball(), castFrostNova(), placeTower(), drawUI() |
| score | init() | addScore() | drawUI(), GAMEOVER 화면 |
| waveNum | init() | startNextWave() | getWaveData(), drawUI() |
| towers[] | init() | placeTower() | updateTower(), drawTower(), render() |
| enemies[] | init() | spawnEnemy(), damageEnemy() | updateEnemy(), checkCollision(), findTarget() |
| projectiles[] | init() | fire*(), ObjectPool | updateProjectiles(), drawProjectiles() |
| upgrades{} | init() | applyUpgrade() | 각 전투 함수에서 배율 참조 |
| _waveClearing | init() | checkWaveComplete() | updatePlaying() |
| _isTransitioning | init() | beginTransition() | beginTransition() |
| _isBossActive | init() | 보스 스폰/처치 | updatePlaying() |

### 13.3 기능별 세부 구현 체크리스트 (F19 "절반 구현" 방지)
| 기능 | 하위 항목 | 구현 여부 |
|------|-----------|-----------|
| 마법사 이동 | A: WASD 입력 | ☐ |
| | B: 화면 경계 제한 | ☐ |
| | C: 걷기 애니메이션 | ☐ |
| 아케인 볼트 | A: 발사 로직 | ☐ |
| | B: 충돌 판정 | ☐ |
| | C: 파티클 이펙트 | ☐ |
| 파이어볼 | A: 마나 소비 | ☐ |
| | B: 범위 폭발 | ☐ |
| | C: 폭발 파티클 | ☐ |
| 프로스트 노바 | A: 마나 소비 | ☐ |
| | B: 범위 감속 적용 | ☐ |
| | C: 냉기 파티클 | ☐ |
| 타워 배치 | A: 마나 소비 | ☐ |
| | B: 유효 위치 판정 | ☐ |
| | C: 배치 프리뷰 표시 | ☐ |
| | D: 최대 배치 수 제한 | ☐ |
| 타워 공격 | A: 타겟 탐색 | ☐ |
| | B: 투사체 생성 | ☐ |
| | C: 특수 효과 (범위/감속/체인/치유) | ☐ |
| 적 이동 | A: 바스티온 방향 이동 | ☐ |
| | B: 바스티온 도달 시 공격 | ☐ |
| | C: 타입별 특수 능력 | ☐ |
| 보스전 | A: 보스 스폰 연출 | ☐ |
| | B: 보스 패턴 3종 | ☐ |
| | C: 보스 HP바 상단 표시 | ☐ |
| 업그레이드 선택 | A: 카드 3장 생성 | ☐ |
| | B: 카드 호버/선택 UI | ☐ |
| | C: 효과 적용 | ☐ |
| | D: 중첩 제한 검증 | ☐ |
| 업적 | A: 조건 판정 | ☐ |
| | B: 토스트 알림 | ☐ |
| | C: GAMEOVER 목록 표시 | ☐ |
| | D: localStorage 저장 | ☐ |

### 13.4 방어적 코딩 체크리스트
- [ ] gameLoop에 try-catch 적용
- [ ] dt 최대값 0.05 캡
- [ ] setTimeout/setInterval 사용 0건
- [ ] alert/confirm/prompt/window.open 사용 0건
- [ ] SVG filter 태그 사용 0건 (feGaussianBlur 등)
- [ ] Canvas glow는 shadowBlur만 사용
- [ ] 전역 직접 참조 함수 0건

### 13.5 setTimeout 0건 검증 (F2)
- `grep -c "setTimeout\|setInterval" index.html` → **0** 이어야 함
- Web Audio 스케줄링: `oscillator.start(ctx.currentTime + delay)` 만 사용

### 13.6 assets/ 디렉토리 금지 (F1)
- 게임 디렉토리 내 허용 파일: `index.html`, `thumbnail.svg`
- `assets/` 디렉토리 존재 시 즉시 FAIL
- 모든 SVG는 Canvas 코드 드로잉으로 대체
- thumbnail.svg만 별도 파일 허용

### 13.7 스모크 테스트 게이트 (F13)
리뷰 제출 전 필수 확인:
1. ✅ `index.html` 파일 존재
2. ✅ 브라우저에서 페이지 로드 성공
3. ✅ 콘솔 에러/경고 0건
4. ✅ TITLE 화면 렌더링 정상
5. ✅ 게임 시작 후 PLAYING 상태 전환 정상
6. ✅ `assets/` 디렉토리 미존재

### 13.8 회귀 테스트 플로우 (F14)
수정 후 반드시 전체 플로우 확인:
```
TITLE → (시작) → PLAYING → (일시정지) → PAUSED → (해제) → PLAYING
→ (웨이브 클리어) → UPGRADE → (선택) → PLAYING → (바스티온 HP 0) → GAMEOVER
→ (재시작) → TITLE
```

### 13.9 수치 정합성 검증 테이블 (F7)
| 항목 | 기획서 수치 | 코드 확인란 |
|------|------------|------------|
| 슬라임 HP | 20 | ☐ |
| 스켈레톤 HP | 35 | ☐ |
| 스파이더 HP | 25 | ☐ |
| 골렘 HP | 80 | ☐ |
| 레이스 HP | 40 | ☐ |
| 다크나이트 HP | 60 | ☐ |
| 드래곤킨 HP | 50 | ☐ |
| 골렘킹 보스 HP | 300 | ☐ |
| 레이스킹 보스 HP | 250 | ☐ |
| 고대 드래곤 보스 HP | 500 | ☐ |
| 아케인 볼트 공격력 | 8 | ☐ |
| 파이어볼 공격력 | 25 | ☐ |
| 프로스트 노바 공격력 | 10 | ☐ |
| 초기 마나 | 100 | ☐ |
| 마나 자동 회복 | 3/초 | ☐ |
| 바스티온 초기 HP | 100 | ☐ |
| 타워 최대 배치 | 8 | ☐ |
| 아케인 타워 마나 비용 | 30 | ☐ |
| 화염 타워 마나 비용 | 50 | ☐ |
| 냉기 타워 마나 비용 | 40 | ☐ |
| 번개 타워 마나 비용 | 60 | ☐ |
| 치유 타워 마나 비용 | 45 | ☐ |
| 업그레이드 "볼트 강화" 효과 | +25% | ☐ |
| 업그레이드 "크리티컬" 확률 | 20% | ☐ |
| 엘리트 HP 배율 | 2× | ☐ |
| 엘리트 속도 배율 | 1.3× | ☐ |

---

## §14. 화면 연출 시스템

### 14.1 화면 흔들림 (Screen Shake)
- 트리거: 보스 공격, 바스티온 피격, 보스 처치
- 구현: `shakeOffset = { x: Math.random()*intensity - intensity/2, y: ... }`
- 감쇠: 0.3초간 intensity 감소 (tween)
- `ctx.translate(shakeOffset.x, shakeOffset.y)` 적용 후 렌더, 복원

### 14.2 슬로우모션
- 트리거: 보스 등장, 보스 처치
- 구현: `timeScale` 변수 (1.0 → 0.3 → 1.0, 1.5초 tween)
- `dt *= timeScale` 적용

### 14.3 파티클 시스템 (ObjectPool 기반)
| 파티클 유형 | 트리거 | 수량 | 수명 | 특징 |
|------------|--------|------|------|------|
| 아케인 스파크 | 볼트 발사 | 3 | 0.3s | 시안색, 크기 감소 |
| 화염 파편 | 파이어볼 폭발 | 12 | 0.5s | 오렌지-적, 중력 |
| 냉기 결정 | 프로스트 노바 | 8 | 0.4s | 하늘색, 회전 |
| 적 소멸 | 적 처치 | 6 | 0.3s | 적 색상, 방사형 |
| 보스 폭발 | 보스 처치 | 20 | 0.8s | 금색+적색, 화면 전체 |
| 타워 빌드 | 타워 배치 | 5 | 0.4s | 금색 스파클 |
| 마나 수집 | 마나 드롭 획득 | 4 | 0.3s | 청색, 위로 상승 |

- ObjectPool 크기: 파티클 80개, 투사체 30개

### 14.4 UI 애니메이션
- 점수 변경: 숫자 카운트업 (tween, 0.3초)
- HP 변경: HP바 부드러운 감소 (tween, 0.2초) + 빨간 플래시
- 마나 변경: 마나바 부드러운 변동 (tween, 0.2초)
- 웨이브 시작: "WAVE X" 텍스트 바운스 인 (tween, 0.5초)
- 보스 등장: "⚠ BOSS ⚠" 텍스트 깜빡임 + 슬로우모션

---

## §15. 사이드바 메타데이터 (게임 페이지 표시용)

```yaml
game:
  title: "아케인 바스티온"
  description: "마법사가 되어 바스티온을 지켜라! 주문을 시전하고 마법 타워를 세우며 15웨이브를 생존하는 로그라이크 포지 디펜스."
  genre: ["action", "strategy"]
  playCount: 0
  rating: 0
  controls:
    - "WASD/방향키: 마법사 이동"
    - "마우스 좌클릭: 아케인 볼트 발사"
    - "Q: 파이어볼 / E: 프로스트 노바"
    - "1~5: 타워 선택 후 클릭으로 배치"
    - "ESC: 일시정지"
    - "터치: 가상 조이스틱 + 스킬 버튼"
  tags:
    - "#로그라이크"
    - "#타워디펜스"
    - "#마법"
    - "#보스전"
    - "#업그레이드"
    - "#판타지"
  addedAt: "2026-03-22"
  version: "1.0.0"
  featured: true
```

### 홈 페이지 GameCard 표시
- **thumbnail**: 마법사가 바스티온 앞에서 드래곤 보스와 대치하는 장면 (4:3)
- **title**: 아케인 바스티온 (1줄)
- **description**: 마법사가 되어 바스티온을 지켜라! 주문과 타워로 15웨이브 생존 (2줄)
- **genre 배지**: `action` `strategy` (최대 2개)
- **playCount**: 0 (초기)
- **addedAt**: 2026-03-22 → "NEW" 배지 표시 (7일 이내)
- **featured**: true → ⭐ 배지 표시

---

## §16. 기술 사양 요약

| 항목 | 사양 |
|------|------|
| 파일 구조 | `index.html` (단일 파일) + `thumbnail.svg` |
| 예상 코드량 | 1,900~2,200줄 |
| Canvas 해상도 | `window.innerWidth × window.innerHeight`, `devicePixelRatio` 대응 |
| 프레임 레이트 | requestAnimationFrame (60fps 목표) |
| 상태 수 | 5 (TITLE, PLAYING, UPGRADE, PAUSED, GAMEOVER) |
| 적 타입 | 7종 + 보스 3종 = 10종 |
| 타워 타입 | 5종 |
| 업그레이드 풀 | 18종 |
| 업적 | 10종 |
| 파티클 풀 | 80개 |
| 투사체 풀 | 30개 |
| BGM | 4종 (바이옴 3 + 보스 1) |
| SFX | 7종 |
| 외부 의존성 | 0 (폰트/이미지/라이브러리 없음) |
| localStorage 키 | `arcaneBastion_hi`, `arcaneBastion_achievements` |
| 브라우저 API | Canvas 2D, Web Audio API, localStorage, requestAnimationFrame |
