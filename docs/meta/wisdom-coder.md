# coder 누적 지혜
_마지막 갱신: 사이클 #47 gem-odyssey_

## ⚠️ 에셋 정책 (사이클 #39~)
- assets/ 폴더의 PNG 에셋을 **반드시 사용**. 절대 삭제하지 마세요.
- manifest.json에서 에셋 목록을 읽어 동적으로 로드.
- 에셋 로드 실패 시 Canvas 폴백 드로잉으로 대체.

## 반복되는 실수 🚫
- **[C44,47]** 매치3 캐스케이드 체인에서 comboCount 리셋 타이밍: **GOAL_CHECK 진입 시에만 리셋**, 캐스케이드 중에는 누적해야 콤보 배율이 정확히 작동.
- **[C38~47]** BGM을 setInterval 대신 **dt 기반 타이머(bgmTimer += dt)**로 구현. setInterval BGM 패턴은 완전 폐기.
- **[C34~47]** 페이드 전환 시 `_fadeObj = { a: 0 }` 프록시 객체를 **매 단계 새로 생성**. 프록시 재사용 금지.
- **[C44,47]** 매치 검출 우선순위(5→T/L→4→3) + **used[][] 소비 추적**으로 상위 매치가 하위 매치 셀 선점. 스캔 순서(좌상→우하)가 결과에 영향.
- **[C43,47]** engine._update/_render 교체는 monkey-patch — **최종 렌더 함수 내부에서 확장 호출을 직접 배치**하여 콜백 교체 최소화. C47에서 init 후 1회 교체로 안정화.
- **[C37~47]** TRANSITION_TABLE 단일 객체 + beginTransition()/directTransition()으로 상태 전환 버그 근절. **13상태 ACTIVE_SYSTEMS를 IIFE로 프로그래매틱 생성**하여 누락 방지.
- **[C47]** 부스터 엣지 케이스: 색상 폭탄 발동 중 `colorBombResolving` 가드로 중복 캐스케이드 차단. 망치+돌 블록 = 효과 없음+소모 안 함. 셔플 시 장애물 위치 유지+3매치 없이 재배치.
- **[C47]** 레벨 맵 스크롤과 보드 입력 충돌: MAP 상태에서 보드 입력 완전 비활성. 드래그 거리 > 15px이면 탭 무시. 관성 스크롤(velocity × friction) 추가.
- **[C47]** 9중 가드 플래그 isInputBlocked() + TRANSITION_TABLE 13상태 = 안정 상태 머신. 20레벨+6장애물+4부스터 조합에서도 데드락 0건.
- **[C47]** 오프스크린 캐시(buildBackgroundCache)는 _bgCacheDirty 플래그로 리사이즈/레벨 전환 시만 리빌드. 매 프레임 재드로잉 방지.

## 검증된 성공 패턴 ✅
- **[C44~47]** 매치3 캐스케이드: processMatches→doGravity→재매칭→반복→finishCascade. tween onComplete 체인, setTimeout 0건.
- **[C44~47]** 가드 플래그(swapLocked/cascadeInProgress/resolving/goalChecking/boosterActive/colorBombResolving...) 다중 방어. C47에서 9중으로 확장.
- **[C44~47]** 초기 보드: 3매치 제거 루프(100패스) + 유효 이동 BFS 검증(50회 시도). 실패 시 재생성.
- **[C37~47]** beginTransition(페이드)+directTransition(즉시). 둘 다 TRANSITION_TABLE 화이트리스트 검증.
- **[C39~47]** IX Engine 완전 통합: Tween/Particles/Sound/UI/Save/Input/AssetLoader/Sprite 활용, 자체 매니저 0줄.
- **[C39~47]** 에셋 독립 패턴: 47개 PNG 에셋에 전부 Canvas 프로시저럴 폴백 → 에셋 0개로도 게임 100% 동작.
- **[C36~47]** ACTIVE_SYSTEMS IIFE 프로그래매틱 생성: 13상태 매트릭스 누락 불가.
- **[C47]** 힌트 시스템(5초 무입력→유효 이동 하이라이트) + 데드락 감지(15초→자동 셔플) = 진행 불가 상태 완전 방지.
- **[C47]** 지역별 BGM 변조: BGM_WORLD_SCALES + BGM_PATTERNS로 4개 왕국 고유 음악. dt 기반 타이머.
- **[C47]** DDA 2단계: 기본(턴+2/연패) + 극단 레벨 전용(Lv17+ 장애물 감소/독 확산 주기 변경). ddaOverride 필드로 레벨별 커스텀.

## 다음 사이클 적용 사항 🎯
- **매치3 T/L자 검출 개선**: 가로×세로 런 교차 방식은 십자 등 복잡 형태에 약함. 유니온-파인드 기반 연결 컴포넌트 분석으로 전환 고려.
- **Particles splice→swap-with-last**: 800+ 파티클 사용 시 성능 보장. IX Engine 공통 모듈 PR 가능.
- **부스터 발동 시퀀스 큐**: 색상 폭탄→스페셜 보석 연쇄 발동 시 큐 기반 순차 처리로 정합성 강화. C47에서 queueSpecialActivation 구조 도입했으나 완전 통합 필요.
