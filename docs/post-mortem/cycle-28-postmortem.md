---
cycle: 28
game-id: neon-pulse
title: 네온 펄스
date: 2026-03-23
verdict: APPROVED
---

# 네온 펄스 (Neon Pulse) — 포스트모템

## 한 줄 요약
비트에 맞춰 적을 처치하는 리듬 아케이드 로그라이트를 단일 HTML 3,288줄에 5개 음악 존·6체 보스·13종 사운드 칩·프로시저럴 BGM으로 구현했다.

## 무엇을 만들었나
네온 펄스는 Web Audio API로 실시간 생성되는 BPM 동기화 비트에 맞춰 적을 공격하는 **리듬 아케이드 로그라이트**다. 화면 하단의 비트 레인에 맞춰 Space/탭 한 번으로 공격하면 Perfect(±50ms)/Great(±100ms)/Good(±150ms)/Miss 4단 판정이 이루어지고, 연속 Perfect 콤보로 스코어 배율이 최대 ×3.0까지 폭발한다. "비트를 타는 쾌감"이 이 게임의 핵심이다.

5개 음악 존(Synthwave/Dubstep/Lo-fi/Drum&Bass/Glitch) × 3스테이지 = 15 기본 스테이지에 히든 존 2개를 더해 총 17스테이지를 돌파한다. 존마다 고유 BPM 범위와 색상 팔레트, 차별화된 적 디자인(음표/스피커/카세트/드럼스틱/글리치)이 시각·청각 양면에서 변화를 준다. 존 보스는 턴테이블을 모티브로 한 5체 + 히든 보스 "Void DJ"까지 총 6체이며, 페이즈별 BPM tween으로 긴장감이 상승한다.

전투 사이 3택 사운드 칩(유물) 13종과 영구 업그레이드 3트리(Rhythm/Power/Flow)가 매 런마다 다른 빌드를 만들고, 3단 난이도(비기너/DJ/마에스트로) + DDA 동적 밸런스 + 한/영 다국어까지 지원한다.

## 잘 된 점 ✅
- **4회차 리뷰 APPROVED — 회귀 버그 0건**: 1회차 P0(역방향 전환 차단) + P1(assets/ 참조) + P2(홀드 비트 미구현) + P3(drawHitEffect 폴백 없음) → 2회차 신규 P0(BOOT→TITLE 전환 불가) → 3회차 APPROVED → 4회차 플래너·디자이너 피드백 반영 확인 + Puppeteer 실행 검증 완료. 최종적으로 신규 이슈 0건.
- **프로시저럴 BGM 완전 구현**: `SoundManager.startBGM/updateBGM`이 `audioCtx.currentTime` 기반으로 비트를 실시간 생성. setTimeout 0건, 모든 사운드 스케줄링이 Web Audio 네이티브. 판정별·콤보별·보스별·존별로 사운드가 차별화되어 청각 피드백이 풍부하다.
- **네온 비주얼 품질**: 핑크 바이저+시안 헤드폰의 DJ 캐릭터, 존별 5종 적 디자인, 턴테이블 보스(바이닐 홈·톤암·이퀄라이저 바), 비트 유형별 시각 차별화(원형/더블/사각홀드/다이아회피/별보스), BPM 동기화 화면 펄스 — 에셋 0건 100% Canvas 프로시저럴 드로잉.
- **코드 품질 체크리스트 전항 PASS**: Math.random 0건(SeededRNG 완전), setTimeout 0건(17사이클 연속), hitTest 단일 함수 12건 호출, BPM tween 단일 경로(F70), 10 REGION 코드 구조, assets/ 디렉토리 자체 미존재. Puppeteer 브라우저 테스트 콘솔 에러 0건·경고 0건.
- **모바일 완전 지원**: 터치 공격(탭) + 스와이프 회피(dx≥30px, ≤200ms) + 우상단 일시정지 버튼. 키보드 없이 타이틀→난이도→존→플레이→칩선택→업그레이드→게임오버 전 흐름 조작 가능. touch-action:none + passive:false로 스크롤 완전 방지.

## 아쉬웠던 점 / 개선 가능성 ⚠️
- **4회 리뷰 사이클 소요**: 1회차에서 NEEDS_MAJOR_FIX 4건(역방향 전환 차단, assets/ 참조, 홀드 비트 미구현, hitEffect 폴백 없음)이 동시 발견. 자동 스모크 테스트 게이트 14항목이 기획서에 설계되었으나 여전히 수동 의존. 자동화가 구현되었다면 2회 이내 APPROVED가 가능했을 것.
- **공용 엔진 분리 28사이클째 미착수**: TweenManager/ObjectPool/SoundManager/InputManager가 여전히 게임별 copy-paste. 3,288줄은 Cycle 27(4,238줄)보다 줄었지만 공용 모듈 분리 없이는 구조적 한계가 계속된다.
- **리듬 게임 밸런스 검증 수단 부재**: BPM×적밀도×칩효과 조합이 단순한 편이라 DPS/EHP 캡 + DDA 3단계 폴백으로 관리 가능하지만, 극단 빌드(콤보 특화 + 고BPM)의 실제 플레이 데이터 기반 검증은 미수행.
- **2회차 BOOT→TITLE 전환 불가 회귀**: 1회차 수정 중 ACTIVE_SYS[BOOT]에 SYS.TWEEN을 누락하여 신규 P0 발생. "수정 회귀" 패턴(Cycle 10 이래 반복)이 상태×시스템 매트릭스 영역에서 재발. 수정 후 전체 플로우 회귀 테스트의 자동화가 필요.
- **홀드 비트·더블 비트 밸런스 미검증**: 홀드(지속 대미지)·더블(2연타 400ms)의 코드 구현은 완전하나, 보스별 비트 패턴 구성에서의 출현 빈도·난이도 곡선은 실플레이 피드백 없이 설정됨.

## 기술 하이라이트 🛠️
- **BPM tween 단일 경로(F70)**: `G.bpm`은 오직 `tw.add()`로만 갱신되며 직접 대입 0건. Cycle 5 B2(이중 경로 버그)의 교훈을 리듬 게임에 적용하여 보스 페이즈별 BPM 전환이 tween 곡선 하나로 완전히 제어된다.
- **프로시저럴 BGM 엔진**: `audioCtx.currentTime` 기반 고정밀 비트 스케줄링으로 드럼/베이스/멜로디를 실시간 합성. Cycle 5의 Web Audio 비트 스케줄링 패턴을 본격 BGM 생성으로 격상. setTimeout 완전 배제로 BPM 동기화 정밀도 보장.
- **10 REGION 코드 구조(F66)**: CONFIG→ENGINE→ENTITY→DRAW→RHYTHM→COMBAT→ROGUE→STATE→SAVE→MAIN으로 3,288줄을 10개 영역으로 분리. 의존 방향이 단방향(상→하)이며, 추후 모듈 추출이 가능한 구조.
- **홀드 비트 완전 구현**: `updateHoldBeats()`에서 `holdDur`(지속 시간)/`holdRatio`(진행률)/`isHolding`(키 상태)을 연동하여 프레임 단위 지속 대미지를 정확하게 계산. 더블 비트는 `doublePending` 상태 + 400ms 자동 Miss 타이머로 구현.
- **STATE×SYSTEM 매트릭스 16상태 전수 정의**: BOOT/TITLE/DIFFICULTY_SELECT/ZONE_MAP/UPGRADE/STAGE_INTRO/PLAYING/PAUSE/CHIP_SELECT/BOSS_INTRO/BOSS_BATTLE/RESULT/VICTORY/GAMEOVER 등 16상태에서 TWEEN/DRAW/INPUT/PHYSICS/SOUND 등 시스템 활성화를 명시적으로 정의. REVERSE_ALLOWED 11개 경로로 역방향 전환도 안전하게 처리.

## 다음 사이클 제안 🚀
1. **공용 엔진 모듈 분리 최우선 착수**: 이번 사이클의 10 REGION 구조가 모듈 추출의 최적 시작점. TweenManager/ObjectPool/SoundManager/InputManager/hitTest()를 `shared/engine.js`로 추출하면 게임당 500줄+ 절감 가능.
2. **리듬 게임 자동 플레이 시뮬레이터**: BPM×판정 정확도×칩 선택 조합으로 N회 자동 런을 수행하여 "콤보 특화 빌드의 클리어율" 등을 수치화. 이번 사이클의 DPS 캡/시너지 캡/DDA 구조를 시뮬레이터의 검증 기준으로 활용.
3. **프로시저럴 사운드 엔진 고도화**: 이번 SoundManager의 존별 사운드 차별화를 기반으로, 플레이어 빌드에 따라 BGM 레이어가 동적으로 변화하는 "적응형 BGM" 시스템 실험. Web Audio API의 GainNode 크로스페이드 + 보스별 전용 악기 레이어 추가.
