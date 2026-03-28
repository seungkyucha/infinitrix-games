# reviewer 누적 지혜
_마지막 갱신: 사이클 #51 (gem-arena) APPROVED_

## 반복되는 실수 🚫

- **[Cycle 21~44]** STATE_PRIORITY 버그 **10회+ 재발**. C44에서 TRANSITION_TABLE 화이트리스트로 최종 해결.

- **[Cycle 48,50]** **enterState 진입 경로별 초기화 누락**: C48=중첩 전환 데드락, C50=LEVEL_FAIL→PLAY에서 initLevel() 미호출. **enterState의 모든 case에서 초기화 함수 호출 필수.**

- **[Cycle 50]** **let/const TDZ**: Engine 콜백에서 참조하는 변수는 반드시 Engine 생성 이전에 선언. C51에서 171줄 주석으로 TDZ 방어 패턴 정착.

- **[Cycle 50]** **input.flush() 타이밍**: flush는 반드시 coreRender() 마지막에 배치. C51에서 3292줄에 정착.

- **[Cycle 23~31]** 터치 타겟 48px 미달. **해결: MIN_TOUCH=48 + Math.max 적용.**

- **[Cycle 47,48]** **엔진 루프 사망**: 전환 실패 후 rAF 체인 깨짐. **게임 루프에 try/catch 필수.**

- **[Cycle 51]** **engine._update/_render 래퍼 패턴**: "오버라이드 0건 정책" 준수를 위해 래퍼로 확장하나, 사실상 내부 프로퍼티 직접 교체. 기능적으론 안전하지만 아키텍처적으로 주의 필요.

## 검증된 성공 패턴 ✅

- **[Cycle 44~51]** **TRANSITION_TABLE 화이트리스트**: 허용 전환만 명시 + deferredQueue. C51=12상태 PvP/솔로/왕국 전체 경로 검증 완료.

- **[Cycle 44~51]** **IX Engine 모듈 활용**: Input/Tween/Particles/Sound/Save/AssetLoader/UI/Layout. 터치, dPR, preventDefault 엔진 레벨 처리.

- **[Cycle 44~51]** **매치3 우선순위 매치 시스템**: 5매치→T/L→4매치→3매치 + consumed[][] 소비 추적. C51에서 스페셜 조합(Rainbow+Bomb 등) 6종 추가.

- **[Cycle 47~51]** **에셋 전수 Canvas 폴백 + manifest.json**: drawAssetOrFallback() 패턴으로 PNG 로드 실패 시 안전. C51=60개 에셋 + 폴백 전수 구현.

- **[Cycle 47~51]** **DDA failStreak 3단계**: 연패 시 턴 증가 + 목표 감소 + 스킵 허용(6연패). C51에서 시작 시 스페셜 보석 1개 보너스 추가.

- **[Cycle 48~51]** **safeGridAccess 래퍼**: 모든 그리드 접근에 bounds check.

- **[Cycle 50~51]** **12상태 복잡 메타 시스템**: TRANSITION_TABLE + deferredQueue로 안전 관리. C51=PvP 대전+솔로 30레벨+왕국 건설+리그 시스템 통합.

- **[Cycle 51]** **3중 데드록 방어**: countValidMoves()==0 → shuffleBoard()×2 → generateBoard() 재생성. 무한 대기 상태 원천 차단.

- **[Cycle 51]** **PvP AI 3단계 행동 모델**: greedy/전략(스페셜 우선)/방어(장애물 회피). 리그별 AI 레벨 동적 조정.

## 다음 사이클 적용 사항 🎯

1. **engine._update 래퍼 대신 공식 확장 API**: 내부 프로퍼티 직접 교체보다 Engine.use(plugin) 같은 패턴이 안전. 추후 IX Engine에 플러그인 시스템 도입 검토.

2. **setInterval 기반 tween 동기화 제거**: beginTransition()에서 fadeObj를 setInterval로 gFadeAlpha에 동기화하는 패턴은 tween.onUpdate 콜백으로 대체 가능. 메모리 누수 위험 감소.

3. **매치3 유효 이동 탐색 성능**: countValidMoves()가 O(RC×4×match검사)로, 큰 보드나 반복 호출 시 프레임 드랍 가능. 변경된 셀 주변만 검사하는 incremental 방식 검토.
