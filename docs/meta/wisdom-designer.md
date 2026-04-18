# designer 누적 지혜
_마지막 갱신: 사이클 #3_

## 반복되는 실수 🚫
1. [Cycle 1,2,3] **Gemini 캐릭터 변형 일관성 붕괴**: player 4종(기본/공격/피격/방어)이 전부 서로 다른 인물로 생성. ref 필드로는 AI 이미지 생성기가 동일 캐릭터 보장 불가. 3사이클 연속 재현.
2. [Cycle 1,2,3] **보스 변형도 동일 문제**: boss-polygon-core(다면체) vs phase2(인간형 기사) — 완전히 다른 존재로 생성. ref 필드 무시됨.
3. [Cycle 1,2,3] **반투명/밝은색 오브젝트 거의 투명**: enemy-slime, boss-slime-king, ui-block, particle-triangle 등 밝은색/반투명 에셋이 배경 대비 식별 불가.
4. [Cycle 1,2,3] **manifest.json ref 필드 이스케이프 오류** (`"player\""`) — Gemini 자동 생성 시 3사이클 연속 동일 버그. 수동 검증 필수.
5. [Cycle 3] **카드 프레임 등급간 스타일 불일치**: card-frame-common(플랫 희미)과 uncommon/rare(풍부한 3D) 사이 스타일 격차 큼.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2,3] **단독 캐릭터(적) 개별 품질 우수**: enemy-skeleton, enemy-spider, enemy-golem, enemy-mage, enemy-crystal-knight 모두 로우폴리 스타일 일관성 유지.
2. [Cycle 1,2,3] **배경 품질 높음**: bg-floor1(어둠의 숲), bg-floor2(지하묘지), bg-floor3(크리스탈 궁전) 모두 분위기 탁월.
3. [Cycle 1,2,3] **SVG fallback 전략 유효 확정**: Cycle 3에서 10개 에셋 SVG 대체 완료 — 플레이어 3변형, 슬라임 2종, 보스 페이즈2, 카드 프레임, 파티클 2종, UI 1종. 동일 팔레트+스타일로 통일 성공.
4. [Cycle 1,2,3] **UI 아이콘 대부분 안정적**: ui-heart, ui-energy, ui-gold, ui-poison, ui-vulnerable 모두 소형에서도 식별 가능.
5. [Cycle 2,3] **보스 기본형 탁월**: boss-polygon-core(다면체 보스), boss-bone-lord(거대 해골) — 독립 에셋으로 생성 시 기획 완벽 부합.
6. [Cycle 3] **포션/유물 아이콘 양호**: potion-health, potion-energy, relic 시리즈 모두 스타일 통일, 소형 식별 가능.
7. [Cycle 3] **에이전트 병렬 SVG 제작 효율적**: 6개 SVG를 병렬 에이전트로 동시 제작 → 전체 작업 시간 대폭 단축.

## 다음 사이클 적용 사항 🎯
1. **캐릭터 변형은 처음부터 SVG 계획 수립** — PNG는 base만 생성, 나머지 변형은 SVG 직접 제작. base PNG 시각 확인 후 동일 팔레트/실루엣 적용.
2. **반투명·밝은색 에셋은 에셋 목록 단계에서 SVG 지정** — 슬라임, 보석, 파티클, 배리어 등은 Gemini PNG 생성 요청하지 말고 처음부터 SVG로 제작.
3. **manifest.json은 반드시 수동 작성 + `node -e JSON.parse` 검증** — palette는 배열, ref는 순수 문자열, format 필드로 png/svg 구분 명시.
