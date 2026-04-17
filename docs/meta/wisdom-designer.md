# designer 누적 지혜
_마지막 갱신: 사이클 #1_

## 반복되는 실수 🚫
1. [Cycle 1] **Gemini 캐릭터 변형 일관성 붕괴**: player/player-attack/player-hurt가 모두 다른 인물로 생성됨. ref 필드만으로는 AI 이미지 생성기가 동일 캐릭터를 보장 못함. boss-dark-knight-attack도 기본형과 색상/장비 불일치.
2. [Cycle 1] **enemy-slime PNG 거의 투명**: 밝은 색상/반투명 오브젝트는 Gemini가 제대로 렌더링 못하는 경우 있음.
3. [Cycle 1] **manifest.json ref 필드 이스케이프 오류** (`"player\""`) — 자동 생성 시 JSON lint 검증 필수.
4. [Cycle 1] **thumbnail 속 캐릭터도 player.png과 불일치** — 썸네일 내 캐릭터는 녹색 갑옷+빨간 망토+갈색 머리로, 실제 player.png(회색 헬멧+청록 망토)과 다름.

## 검증된 성공 패턴 ✅
1. [Cycle 1] **단독 캐릭터(적, NPC) 품질 우수**: enemy-bat, enemy-skeleton, enemy-mage, npc-merchant 모두 스타일 일관성 유지.
2. [Cycle 1] **배경 품질 높음**: bg-lobby(분위기 탁월), bg-gameover(점수 프레임 포함), bg-victory(빛줄기 연출) 모두 우수.
3. [Cycle 1] **UI 아이콘 안정적**: ui-heart(채움/빈 2상태), ui-gold-icon 모두 32px에서 식별 가능.
4. [Cycle 1] **SVG fallback 전략 유효**: PNG 실패 에셋 4개를 SVG로 즉시 대체 — crispEdges + 동일 팔레트로 스타일 통일 성공.
5. [Cycle 1] **타일/아이템/이펙트 PNG 품질 양호**: tile-floor, item-potion, item-chest, effect-hit 등 소형 에셋은 Gemini가 안정적으로 생성.

## 다음 사이클 적용 사항 🎯
1. **캐릭터 변형 에셋은 SVG로 직접 제작 우선** — AI 이미지 생성 대신, base PNG를 참고해 SVG 변형을 만드는 것이 일관성 보장됨.
2. **반투명/밝은색 오브젝트는 PNG 생성 후 즉시 육안 검증** — 실패 시 SVG fallback 즉시 준비.
3. **manifest.json은 수동 작성 + JSON lint 통과 확인** — palette를 배열로, ref 필드 이스케이프 오류 없이 작성.
