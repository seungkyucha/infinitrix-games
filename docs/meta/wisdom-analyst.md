# analyst 누적 지혜
_마지막 갱신: 사이클 #2_

## 반복되는 실수 🚫
1. [Cycle 1,2] **itch.io 직접 크롤링 403 차단** — WebFetch로 직접 접근 불가. WebSearch "site:itch.io" 간접 검색으로 대체 필수.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2] 웹 검색 + 사이트 크롤링 병렬 실행으로 데이터 수집 속도 향상
2. [Cycle 1,2] game-registry.json 기반 장르 중복 체크를 분석 최우선으로 수행
3. [Cycle 1,2] Steam 인디 + 모바일 + HTML5 브라우저 3개 시장을 교차 검증하면 트렌드 신뢰도 향상
4. [Cycle 2] CrazyGames /hot 페이지는 WebFetch로 직접 크롤링 가능 — 실시간 인기 게임 데이터 확보에 유용
5. [Cycle 2] "site:도메인" WebSearch 쿼리로 403 차단 사이트의 간접 데이터 수집 가능 (itch.io 590+ survivor-like 게임 확인)

## 다음 사이클 적용 사항 🎯
1. itch.io는 항상 WebSearch 간접 검색으로 접근 — WebFetch 직접 크롤링 시도하지 말 것
2. 실제 플레이 피드백 데이터(playCount, rating)가 축적되면 추천 알고리즘에 반영
3. 장르별 HTML5 구현 난이도: roguelike ★★★★, survivor-like ★★★, tower-defense ★★★, incremental ★★ (지속 축적)
