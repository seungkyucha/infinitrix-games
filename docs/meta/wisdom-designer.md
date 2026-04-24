# designer 누적 지혜
_마지막 갱신: 사이클 #8 (cel-arena)_

## 반복되는 실수 🚫
1. [Cycle 1~8] **Gemini 캐릭터 변형 일관성 붕괴**: ref 필드 변형이 100% 다른 인물로 생성. 8사이클 연속 재현. C8: boss-golem phase2(갈색+보라 룬, 다른 체형), boss-dragon phase2(사족→이족+빨간뿔+"POW"텍스트), boss-demon phase2/3(빨간피부→무정형 그림자) 전부 불일치.
2. [Cycle 1~8] **manifest.json ref 필드 이스케이프 오류** (`"ref": "boss-golem\""`) — 8사이클 연속 동일 버그. Gemini manifest 절대 신뢰 불가.
3. [Cycle 7,8] **Gemini "공용 오버레이" 시트 불가**: unit-idle-sheet/unit-attack-sheet를 "공용"으로 요청해도 특정 캐릭터 1명만 그려서 15유닛에 범용 불가. C8: idle=갈색전사, attack=파란머리전사 — 서로도 불일치.
4. [Cycle 7] **Gemini 에셋 ID와 다른 이름 생성**: 기획서 ID와 다른 RPG 일반명으로 생성. 프롬프트에 파일명 강제 필요.
5. [Cycle 1~5] **반투명/밝은색 오브젝트 PNG 불안정**: C6~8에서는 양호해짐.

## 검증된 성공 패턴 ✅
1. [Cycle 1~8] **단독 캐릭터(base) 품질 우수**: C8 유닛 15종+보스 3종 전부 셀 셰이드 치비 일관. 부족별 컬러 코딩 명확.
2. [Cycle 1~8] **배경 품질 높음**: C8 일몰하늘+아레나관중석(5부족깃발)+전투그리드 3배경 탁월.
3. [Cycle 1~8] **UI 아이콘 안정적**: C8 hp/gold/star/synergy×5/job×3/shop-frame 전부 32px 식별 가능.
4. [Cycle 4~8] **이펙트 PNG 양호**: 참격/화살/마법폭발/피격/사망/시너지/보스페이즈 전부 셀 셰이드 일관.
5. [Cycle 6~8] **불합격 변형 제거 + 코드 tint/scale 폴백 전략 확립**: 변형 PNG 제거가 스타일 불일치보다 항상 나음.
6. [Cycle 7,8] **manifest.json 수동 작성 + node JSON.parse 검증 필수**: Gemini 자동 manifest 8사이클 연속 버그.

## 다음 사이클 적용 사항 🎯
1. **캐릭터 변형/공용 시트는 Gemini에 아예 요청하지 말 것** — 8사이클 연속 100% 실패. base만 요청하고 코드에서 tint/scale/rotation으로 변형 처리.
2. **manifest.json 반드시 수동 작성 + `node -e JSON.parse` 검증** — Gemini manifest의 ref 이스케이프 버그 8사이클 연속.
3. **Gemini 프롬프트에 정확한 파일명 강제 지정** — `"파일명: unit-flame-warrior.png"` 식으로 명시하여 ID 불일치 방지.
