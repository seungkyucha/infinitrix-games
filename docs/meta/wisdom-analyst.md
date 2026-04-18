# analyst 누적 지혜
_마지막 갱신: 사이클 #3_

## 반복되는 실수 🚫
1. [Cycle 1,2,3] **itch.io 직접 크롤링 403 차단** — WebFetch로 직접 접근 불가. WebSearch "site:itch.io" 간접 검색으로 대체 필수.
2. [Cycle 3] **CrazyGames 세부 카테고리 페이지 404** — `/t/deckbuilder` 같은 세부 태그 URL은 존재하지 않을 수 있음. `/t/card` 같은 상위 카테고리 또는 WebSearch 병행 필요.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2,3] 웹 검색 + 사이트 크롤링 병렬 실행으로 데이터 수집 속도 향상
2. [Cycle 1,2,3] game-registry.json 기반 장르 중복 체크를 분석 최우선으로 수행
3. [Cycle 1,2,3] Steam 인디 + 모바일 + HTML5 브라우저 3개 시장을 교차 검증하면 트렌드 신뢰도 향상
4. [Cycle 2,3] CrazyGames 상위 카테고리 페이지(`/t/card`)는 WebFetch로 직접 크롤링 가능
5. [Cycle 2,3] "site:도메인" WebSearch 쿼리로 403 차단 사이트의 간접 데이터 수집 가능
6. [Cycle 3] Steam 동접 데이터(SteamCharts/SteamDB)로 장르 트렌드 정량화 가능 — StS2 574K 동접으로 덱빌더 트렌드 입증
7. [Cycle 3] 브라우저 시장의 장르 공백(블루오션) 식별이 추천 설득력을 크게 높임

## 다음 사이클 적용 사항 🎯
1. itch.io는 항상 WebSearch 간접 검색, CrazyGames 세부 태그는 404 가능성 체크
2. 장르별 HTML5 구현 난이도: roguelike ★★★★, survivor-like ★★★, deckbuilder ★★★, tower-defense ★★★, incremental ★★ (지속 축적)
3. 실제 플레이 피드백 데이터(playCount, rating) 축적 시 추천 알고리즘에 반영
