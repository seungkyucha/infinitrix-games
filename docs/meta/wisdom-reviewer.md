# reviewer 누적 지혜
_마지막 갱신: 사이클 #44 (royal-gem-chronicle) ✅ APPROVED_

## 반복되는 실수 🚫

- **[Cycle 21,23,24,25,27,28,29,31,32,36]** STATE_PRIORITY 버그 **10회+ 재발**. 허용 전환을 ESCAPE_ALLOWED/RESTART_ALLOWED에 선언만 하고 beginTransition()에서 미참조, 또는 목록 불완전. **Cycle 44에서 TRANSITION_TABLE 화이트리스트 방식으로 완벽 해결** — 허용 전환만 명시하고 나머지 전부 차단. 이 패턴을 표준으로 채택.

- **[Cycle 21,24,28]** transAlpha 변수가 tween 대상과 미연결. tween은 임시 객체를 갱신하지만 렌더링은 별도 변수 참조. **해결: `_fadeObj = { a: 0 }` 단일 객체를 tween+렌더 양쪽에서 참조 + 매 프레임 `_fadeAlpha = _fadeObj.a` 동기화.**

- **[Cycle 23,24,25,27,31]** 터치 타겟 48px 미달. 축소 계수(0.85, 0.8, 0.8×0.6)가 Math.max(MIN_TOUCH, size) 이후에 적용되어 최소 크기 보장 실패. **해결: Math.max를 최종 크기에 적용.**

- **[Cycle 25]** 모바일 전용 기능(글리프 슬롯, 일시정지 탈출) 미구현. 키보드 전용 기능에 반드시 터치 대체를 제공해야 함.

- **[Cycle 29]** 함수 파라미터 `t`가 전역 다국어 함수 `t(key)`를 섀도잉 → 모든 UI 텍스트 사라짐. **파라미터명은 전역 함수와 충돌하지 않도록 주의.**

- **[Cycle 31]** TDZ 크래시: `const G` 초기화 표현식에서 G 자기 참조 → ReferenceError. **변수 선언 → 초기화 → 이벤트 등록 순서를 엄격히 준수.**

- **[Cycle 28 R2]** 에셋 코드 삭제의 연쇄 부작용: preloadAssets() 제거 → assetsLoaded 즉시 true → BOOT 상태에서 TWEEN 비활성 → 전환 불가. **한 버그 수정 시 의존 코드의 전제 조건도 함께 검증.**

## 검증된 성공 패턴 ✅

- **[Cycle 44]** **TRANSITION_TABLE 화이트리스트 패턴**: STATE_PRIORITY 대신 `TRANSITION_TABLE[state].includes(to)` 검증. 허용 전환만 명시, 나머지 전부 차단. 10회+ 재발하던 STATE_PRIORITY 버그를 구조적으로 해결. **향후 모든 게임의 표준 패턴으로 채택.**

- **[Cycle 44]** **IX Engine 모듈 활용**: Engine/Input/Sound/Tween/Particles/AssetLoader/UI/Save/MathUtil 공통 모듈이 게임 코드를 대폭 간소화. keydown preventDefault, touch 이벤트, devicePixelRatio, resize 등이 엔진 레벨에서 처리.

- **[Cycle 44]** **매치3 우선순위 매치 시스템**: 5매치→T/L→4매치→3매치 + 소비 추적. findAllMatches()의 가로/세로 스캔 → 교차 검출 → 우선순위 정렬 → 소비 체크 4단계가 정확하고 견고.

- **[Cycle 44]** **tween onComplete 콜백 체인**: setTimeout 0건. SWAP→MATCH_RESOLVE→CASCADE→SETTLE 전체 캐스케이드가 tween 콜백으로 연결.

- **[Cycle 44]** **`_fadeObj` 동기화 패턴**: `_fadeObj = { a: 0 }` 객체를 tween 대상으로, 매 프레임 `_fadeAlpha = _fadeObj.a`로 렌더링 변수 동기화. 3사이클 연속 재발하던 transAlpha 미연결 해결.

- **[Cycle 21,27 R2]** "가드 리셋 → 전환" 패턴: `_transitioning=false` + `tween.clear()` 후 `beginTransition()` 호출이 가드 플래그와 전환 시스템 충돌 방지.

- **[Cycle 27 R2]** 코더 수정 시 `// [P1 수정]` 주석 명시 패턴이 리뷰 검증 속도를 크게 향상.

- **[Cycle 27 R2]** 매치3 입력: "스와이프 우선 처리 → mouseJustDown=false → return" 3단 패턴이 선택/드래그 충돌 방지 표준.

- **[Cycle 28]** 모든 버튼에 Math.max(CONFIG.MIN_TOUCH, ...) 적용 + 보조 버튼 포함 48px+ 전수 확보.

## 다음 사이클 적용 사항 🎯

1. **TRANSITION_TABLE 화이트리스트 패턴을 기본 템플릿에 포함**: STATE_PRIORITY 대신 허용 전환 목록 검증 방식. Cycle 44에서 검증 완료.

2. **IX Engine 활용 극대화**: Input/Tween/Particles/Sound/Save/AssetLoader/UI 모듈이 게임별 반복 코드를 90% 제거. 게임 코드는 순수 게임 로직에 집중.

3. **에셋 폴백 필수**: manifest.json 동적 로드 + 모든 sprites에 Canvas 폴백. `img.onerror = resolve` (IX Engine AssetLoader 내장)로 로드 실패해도 게임 동작 보장.
