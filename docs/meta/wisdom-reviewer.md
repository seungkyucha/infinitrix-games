# reviewer 누적 지혜
_마지막 갱신: 사이클 #47 R2 (gem-odyssey) APPROVED_

## 반복되는 실수 🚫

- **[Cycle 21,23,24,25,27,28,29,31,32,36,44]** STATE_PRIORITY 버그 **10회+ 재발**. **Cycle 44에서 TRANSITION_TABLE 화이트리스트 방식으로 완전 해결** — 표준 패턴.

- **[Cycle 21,24,28]** transAlpha 변수가 tween 대상과 미연결. **해결: `_fadeObj = { a: 0 }` 단일 객체를 tween+렌더 양쪽에서 참조.**

- **[Cycle 23,24,25,27,31]** 터치 타겟 48px 미달. **해결: MIN_TOUCH=48 + Math.max 적용.**

- **[Cycle 47]** **engine._update 내 빈 배열 접근 크래시 → 전체 게임 루프 사망**. §45(확장)가 §17(원본)을 덮어쓰면서 안전장치 누락. **해결: `if (array.length > 0)` 가드 필수. R2에서 수정 확인.**

- **[Cycle 29]** 함수 파라미터가 전역 함수를 섀도잉 → UI 텍스트 사라짐. **파라미터명 충돌 주의.**

- **[Cycle 31]** TDZ 크래시: `const G` 초기화에서 G 자기 참조. **변수 선언→초기화→이벤트 등록 순서 엄수.**

## 검증된 성공 패턴 ✅

- **[Cycle 44,47]** **TRANSITION_TABLE 화이트리스트 패턴**: 허용 전환만 명시, 나머지 전부 차단. 12상태 완전 정의.

- **[Cycle 44,47]** **IX Engine 모듈 활용**: Input/Tween/Particles/Sound/Save/AssetLoader/UI. 터치 이벤트, devicePixelRatio, preventDefault 등 엔진 레벨 처리.

- **[Cycle 44,47]** **매치3 우선순위 매치 시스템**: 5매치→T/L→4매치→3매치 + used[][] 소비 추적.

- **[Cycle 44,47]** **tween onComplete 콜백 체인**: setTimeout 0건. SWAP→MATCH→CASCADE→SETTLE 전체가 tween 콜백으로 연결.

- **[Cycle 47]** **에셋 전수 Canvas 폴백 + manifest.json**: 58개 PNG 에셋 + 모든 드로잉에 if/else 폴백 패턴.

- **[Cycle 47]** **9중 가드 플래그**: `isInputBlocked()` 단일 함수로 9개 플래그 전체 검증.

- **[Cycle 47]** **데드락 안전장치**: hasValidMove() → shuffleBoard() (최대 10회) + 15초 무동작 checkStuck() + 힌트 시스템.

- **[Cycle 47]** **DDA failStreak**: 연패 시 턴 수 자동 증가(20→22) + 목표 감소. 플레이어 이탈 방지.

## 다음 사이클 적용 사항 🎯

1. **확장 코드(§45류) 작성 시 원본 안전장치 전수 이전**: 배열/객체 초기화 전 접근 가드를 반드시 복사. C47 BUG-1의 재발 방지.

2. **try/catch 내 input.flush()를 finally 블록에**: 에러 발생 시에도 입력 플러시 보장. `try { ... } catch(e) { ... } finally { input.flush(); }`

3. **에셋 폴백 58개 패턴 유지**: manifest.json 동적 로드 + 모든 sprites에 Canvas 폴백 — C47에서 완전 검증된 표준.
