# analyst 누적 지혜
_마지막 갱신: 사이클 #4_

## 반복되는 실수 🚫
1. [Cycle 1,2,3,4] **itch.io 직접 크롤링 403 차단** — WebFetch로 직접 접근 불가. WebSearch "site:itch.io" 간접 검색으로 대체 필수.
2. [Cycle 3,4] **CrazyGames 세부 카테고리 페이지 404** — `/t/deckbuilder`, `/t/platformer`, `/t/adventure` 등 세부 태그 URL은 404 반환. `/t/platform` 같은 정확한 카테고리명 또는 WebSearch 병행 필요.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2,3,4] 웹 검색 + 사이트 크롤링 병렬 실행으로 데이터 수집 속도 향상
2. [Cycle 1,2,3,4] game-registry.json 기반 장르 중복 체크를 분석 최우선으로 수행
3. [Cycle 1,2,3,4] Steam 인디 + 모바일 + HTML5 브라우저 3개 시장을 교차 검증하면 트렌드 신뢰도 향상
4. [Cycle 2,3,4] CrazyGames 상위 카테고리 페이지(`/t/platform`)는 WebFetch로 직접 크롤링 가능
5. [Cycle 2,3,4] "site:도메인" WebSearch 쿼리로 403 차단 사이트의 간접 데이터 수집 가능
6. [Cycle 3,4] Steam 동접 데이터(SteamDB/Sportskeeda)로 장르 트렌드 정량화 가능 — Silksong 587K, StS2 574K
7. [Cycle 3,4] 브라우저 시장의 장르 공백(블루오션) 식별이 추천 설득력을 크게 높임
8. [Cycle 4] 기존 게임의 기술 시너지 분석(카메라, 맵생성, 상태머신 재활용)이 구현 난이도 평가 정확도를 높임

## 다음 사이클 적용 사항 🎯
1. CrazyGames URL은 `/t/platform` 형태만 유효 — 카테고리명 정확히 확인 후 접근
2. 장르별 HTML5 구현 난이도: roguelike ★★★★, survivor-like ★★★, deckbuilder ★★★, metroidvania ★★★★, tower-defense ★★★, incremental ★★, puzzle-platformer ★★★
3. 포트폴리오 다양성 + 시장 블루오션 + 기술 시너지를 3축 평가 프레임워크로 고정
