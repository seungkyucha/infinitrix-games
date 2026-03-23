---
cycle: 35
game-id: abyss-diver
title: 어비스 다이버 (Abyss Diver)
date: 2026-03-24
verdict: ⚠️ PENDING REVIEW (코드 분석 기반 예비 평가)
---

# 어비스 다이버 (Abyss Diver) — 포스트모템

## 한 줄 요약
Level Devil의 "적대적 레벨" 메카닉을 심해 테마로 재해석한 아케이드 퍼즐 플랫포머를 3,666줄 단일 HTML로 완성 — 5바이옴 × 23스테이지 + 보스 5종 + 잠수복 업그레이드 트리 + DDA 폴백까지 구현했다.

## 무엇을 만들었나
"어비스 다이버"는 심해 자체가 플레이어의 적인 아케이드 퍼즐 플랫포머다. 고대 해저 문명 아비소스의 비밀을 파헤치는 다이버가 되어 붕괴하는 산호, 반전되는 해류, 수압에 의한 조작 왜곡, 유인등 함정 같은 환경적 위협을 돌파한다. Poki #1 Level Devil의 "바닥이 무너지고 벽이 닫히는" 핵심 재미를 수중 물리(부력·수압·해류)로 변환한 것이 차별점이다.

5개 바이옴(산호 정원→심해 동굴→열수 분출구→해구 심연→아비소스 유적)이 각각 고유한 환경 메카닉과 시각적 아이덴티티를 갖추고 있으며, 6종 도구(음파탐지·전기충격·조명탄·수압실드·중력앵커·시간감속)와 3갈래 × 5단계 잠수복 업그레이드 트리가 깊은 전략적 선택을 제공한다. arcade+puzzle 장르 조합은 사이클 #25 이후 10사이클 만에 재등장하며, 2번째 장르 순환의 시작을 알린다.

즉사 & 즉부활 메카닉과 SeededRNG 기반 함정 배치의 40~60% 변형, DDA 시스템(3연속 사망 시 함정 30% 비활성화)이 "한 번 더" 중독성과 공정한 난이도 곡선을 동시에 달성한다.

## 잘 된 점 ✅
- **SeededRNG 100% 달성**: `Math.random` 호출 0건. 코드에 유일한 `Math.sin` 기반 의사노이즈도 주석으로 "pseudo-noise without Math.random"을 명시하여 의도를 명확히 했다. 19사이클 연속 준수.
- **setTimeout/alert/confirm 0건**: 기획서 F3/F4 원칙 완벽 준수. iframe 호환성 문제 원천 차단.
- **beginTransition 단일 정의**: L1781에서 1개만 정의. Cycle 32에서 도입된 단일 정의 패턴이 안정적으로 정착.
- **ACTIVE_SYSTEMS 매트릭스 완전 구현**: 13개 상태(BOOT~MODAL) × 9개 시스템(tween~sound)을 명시적으로 관리. diving/puzzle/boss 상태를 분리하여 F23(이중 페이즈 매트릭스 분리) 교훈을 반영.
- **10+1 REGION 구조화**: 3,666줄을 11개 REGION으로 체계적 분리. REGION 3은 "모든 비주얼은 Canvas 프로시저럴 드로잉"을 선언하며 비워둠 — F1 원칙의 코드 레벨 선언.
- **심해 비주얼 Canvas 코드 드로잉**: 바이옴별 배경 그라데이션(#0A2E4D→#040D21), 바이오루미네선스(#00FFE5), 열수 주황(#FF6B35), 생물 발광(#9B59FF) 등 9색 팔레트 + 기상 효과(일광 코스틱/화산재/수압 리플) + 깊이 미터를 에셋 0건으로 구현.
- **다국어(ko/en) 완전 지원**: LANG 객체에 50+ 항목의 한영 번역. 업그레이드 설명, 도구명, 바이옴명까지 이중 언어.
- **DDA 시스템 4단계**: 3연속 사망→함정 30% 비활성, 5연속→산소 +20%, 10연속→유령 경로 힌트 등 점진적 보정으로 접근성 확보.
- **순수 함수 패턴 준수**: `drawDiver(ctx, x, y, size, pose, depth, flashTimer, time)`, `generateStage(biome, stage, rng, ddaLevel, upgrades)` 등 핵심 함수가 파라미터 기반 순수 함수로 작성.

## 아쉬웠던 점 / 개선 가능성 ⚠️
- **assets/ 디렉토리 35사이클 연속 재발**: `public/games/abyss-diver/assets/`에 player.svg, enemy.svg 등 9개 SVG + manifest.json이 존재. 코드에서 ASSET_MAP/SPRITES/preloadAssets 참조 0건이므로 삭제만 하면 해결되나, **35사이클 연속 재발은 CI 강제 차단 없이 영원히 반복될 것이 확정적**. 이 문제는 더 이상 기획서나 체크리스트로 해결 불가.
- **공용 엔진 모듈 미분리 35사이클째**: TweenManager, ObjectPool, SoundManager, InputManager, SeededRNG, hitTest(), ScrollManager가 여전히 게임별 복붙. 3,666줄 중 추정 800줄 이상이 공용 코드. 기술 부채가 관리 불능 수준.
- **코드 리뷰 미실시**: 정식 리뷰(cycle-35-review.md)가 아직 생성되지 않은 상태로 포스트모템을 작성. 터치 타겟 48px 보장, orphaned SVG, 데드코드, 수치 정합성 등의 검증이 필요하다.
- **hitTest 통합 미확인**: hitTest 함수가 3회 참조되나, 모든 터치/클릭 경로가 단일 함수를 경유하는지 전수 검증 필요.
- **밸런스 미검증**: 5바이옴 × 23스테이지 × 3업그레이드갈래 × 6도구 × DDA의 조합 공간은 코드 리뷰만으로 검증 불가. 특히 "속도 올인 빌드"의 바이옴 5 클리어 가능 여부가 DDA 의존적인 점이 기획서에서도 지적됨.
- **프로시저럴 사운드 미확인**: Web Audio API 기반 SFX/BGM이 구현되어 있으나, 사운드 품질과 체감의 코드 리뷰 한계는 여전.

## 기술 하이라이트 🛠️
- **수압 역학 물리 시스템**: `DEPTH_DRAG_COEFF`(0.00015) × 깊이 기반으로 이동 속도 감소·부력 변화를 시뮬레이션. `MIN_DEPTH_FACTOR`(0.4)가 하한을 보장하여 후반 바이옴에서도 최소 40% 이동성 유지. 단순하지만 효과적인 수중 물리 모델.
- **하이브리드 프로시저럴 레벨 생성**: `generateStage(biome, stage, rng, ddaLevel, upgrades)` 함수가 사전 정의 레이아웃 위에 함정·아이템·해류를 40~60% SeededRNG 변형. 고정 지형 + 랜덤 위험의 조합으로 학습 가능성과 리플레이 가치를 동시 달성.
- **5종 보스 AI 멀티페이즈**: 각 보스가 HP 기반 페이즈 전환 + 도구별 약점 공략 시스템. 앵글러피시 군주의 유인등 루어(진짜/가짜 구분), 화산 가디언의 용암류 프로젝타일, 해파리 여왕의 미니언 소환 등 바이옴 테마와 밀착된 공격 패턴.
- **바이옴별 환경 효과 렌더링**: `drawWeatherEffects()` + `getEnvironmentMod()`가 바이옴마다 고유 시각 효과를 적용 — 산호 정원의 일광 코스틱(ellipse 파동), 열수 분출구의 화산재(particle fall), 해구 심연의 수압 리플(concentric circles). 에셋 0건의 순수 Canvas API 활용.
- **STATE_PRIORITY + ACTIVE_SYSTEMS 이중 안전장치**: 13상태 × 9시스템 매트릭스로 "어떤 상태에서 어떤 시스템이 돌아야 하는가"를 선언적으로 관리. diving/puzzle/boss 간 물리·함정·보스 시스템의 상호 배타적 활성화가 깔끔하게 구현됨.

## 다음 사이클 제안 🚀
1. **CI/pre-commit 강제 차단 즉시 등록** — assets/ 비허용 파일 존재 시 빌드 실패 + ASSET_MAP/SPRITES/preloadAssets grep 0건 확인 + Math.random 0건 확인을 자동화. 35사이클 지연은 프로젝트 수준의 기술 부채.
2. **공용 엔진 모듈(`shared/engine.js`) 추출 착수** — SeededRNG, TweenManager, ObjectPool, SoundManager, InputManager, hitTest(), ScrollManager, STATE_PRIORITY 패턴을 단일 모듈로 통합. 게임당 800줄+ 절감 + 버그 수정 일괄 전파.
3. **밸런스 시뮬레이터 개발** — 어비스 다이버의 "빌드별 바이옴 5-3 생존 시간" 산식을 headless로 N회 시뮬레이션하여 극단 빌드 클리어율·DDA 발동률·도구 사용 빈도를 자동 검증. arcade+puzzle 장르의 밸런스 검증 표준 도구로 발전 가능.

---
