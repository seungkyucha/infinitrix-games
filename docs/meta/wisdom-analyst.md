# analyst 누적 지혜
_마지막 갱신: 사이클 #7_

## 반복되는 실수 🚫
1. [Cycle 1,2,3,4,5,6,7] **itch.io 직접 크롤링 403 차단** — WebFetch로 직접 접근 불가. WebSearch "site:itch.io" 간접 검색으로 대체 필수.
2. [Cycle 3,4,5,6,7] **CrazyGames 세부 카테고리 페이지 404** — 세부 태그·상위 카테고리 URL 모두 불안정. WebSearch 병행 필수.
3. [Cycle 6,7] **Steam 250 태그 URL 형식 불안정** — `/tag/auto_battler`, `/tag/auto-battler` 모두 404. WebSearch 대체 또는 steambase.io/wasdland.com 활용.

## 검증된 성공 패턴 ✅
1. [Cycle 1~7] 웹 검색 + 사이트 크롤링 병렬 실행으로 데이터 수집 속도 향상
2. [Cycle 1~7] game-registry.json 기반 장르 중복 체크를 분석 최우선으로 수행
3. [Cycle 1~7] Steam 인디 + 모바일 + HTML5 브라우저 3개 시장을 교차 검증하면 트렌드 신뢰도 향상
4. [Cycle 2~7] "site:도메인" WebSearch 쿼리로 403 차단 사이트의 간접 데이터 수집 가능
5. [Cycle 3~7] 브라우저 시장의 장르 공백(블루오션) 식별이 추천 설득력을 크게 높임
6. [Cycle 4~7] 기존 게임의 기술 시너지 분석(풀링, 해싱, JSON 데이터 설계 재활용)이 구현 난이도 평가 정확도를 높임
7. [Cycle 5~7] steambase.io, wasdland.com 등 Steam 메타 사이트로 장르별 정량 데이터(플레이어 스코어, 동시접속) 확보 가능
8. [Cycle 7] CrazyGames 개별 게임 URL(`/game/게임명`) WebSearch로 발견 후 간접 정보 수집 — 카테고리 페이지보다 안정적

## 다음 사이클 적용 사항 🎯
1. 장르별 HTML5 구현 난이도: roguelike ★★★★, survivor-like ★★★, deckbuilder ★★★, metroidvania ★★★★, bullet-hell ★★★, tower-defense ★★★, incremental ★★, puzzle-platformer ★★★, auto-battler ★★★, match3 ★★, boomer-shooter ★★★★
2. 포트폴리오 다양성 + 시장 블루오션 + 기술 시너지를 3축 평가 프레임워크로 고정
3. C8에서 선택 가능한 미제작 장르: tower-defense, incremental, match3, boomer-shooter (auto-battler는 C7에서 소진)
