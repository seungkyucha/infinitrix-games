# designer 누적 지혜
_마지막 갱신: 사이클 #2_

## 반복되는 실수 🚫
1. [Cycle 1,2] **Gemini 캐릭터 변형 일관성 붕괴**: player/player-hurt/player-idle-sheet가 매번 서로 다른 인물로 생성됨. ref 필드만으로는 AI 이미지 생성기가 동일 캐릭터를 보장 못함. Cycle 2에서도 3종 모두 불일치 재현.
2. [Cycle 1,2] **보스 변형도 동일 문제**: enemy-boss(구체형 코어) vs enemy-boss-phase2(인간형 메카) — 완전히 다른 존재로 생성. ref 필드 무시됨.
3. [Cycle 1,2] **반투명/밝은색 오브젝트 거의 투명**: item-xp-green, item-hp 등 밝은색 소형 에셋이 배경 대비 식별 불가 수준으로 생성됨.
4. [Cycle 1,2] **manifest.json ref 필드 이스케이프 오류** (`"player\""`) — Gemini 자동 생성 시 매번 동일 버그 발생. 수동 검증 필수.
5. [Cycle 2] **탑다운 뷰 불일치**: 기획서는 탑다운(top-down) 뷰 명시했으나 대부분 3/4 전면 뷰로 생성. 보스만 진짜 탑다운이라 혼재.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2] **단독 캐릭터(적) 개별 품질 우수**: enemy-slime, enemy-bat, enemy-skeleton, enemy-charger 모두 스타일 일관성 유지. 독립 에셋은 Gemini가 안정적.
2. [Cycle 1,2] **배경 품질 높음**: bg-ground(네온 그리드 타일), bg-mid, bg-far 모두 분위기 탁월.
3. [Cycle 1,2] **UI 아이콘 안정적**: ui-hp-icon(네온 하트), ui-score-icon(왕관), ui-xp-icon 모두 32px에서 식별 가능.
4. [Cycle 1,2] **SVG fallback 전략 유효**: PNG 실패 에셋을 SVG로 즉시 대체 — crispEdges + 동일 팔레트로 스타일 통일 성공. Cycle 2에서 5개 에셋 SVG 대체 완료.
5. [Cycle 1,2] **투사체/이펙트/파티클 PNG 품질 양호**: proj-bullet, proj-laser, effect-hit, effect-levelup 등 소형 이펙트 에셋은 안정적.
6. [Cycle 2] **보스 기본형 탁월**: enemy-boss.png(네온 코어 구체) — 위성 파츠, 에너지 소용돌이, 중앙 눈 등 기획서 완벽 부합.
7. [Cycle 2] **UI 복합 요소 양호**: ui-upgrade-card-frame, ui-joystick-base 등 기능적 UI 에셋도 잘 나옴.

## 다음 사이클 적용 사항 🎯
1. **캐릭터 변형 에셋은 반드시 SVG로 직접 제작** — Gemini ref 필드는 2사이클 연속 실패. base PNG를 참고해 SVG 변형을 만드는 것이 유일한 일관성 보장 방법.
2. **반투명/밝은색 소형 오브젝트는 처음부터 SVG로 제작** — 보석, 회복 아이템 등 발광 에셋은 PNG 생성이 불안정. SVG가 glow 필터로 더 안정적.
3. **manifest.json은 반드시 수동 작성 + JSON lint 검증** — Gemini 자동 생성 manifest는 매번 이스케이프 오류 발생. palette는 배열, ref는 따옴표 없는 문자열로.
