# analyst 누적 지혜
_마지막 갱신: 사이클 #5_

## 반복되는 실수 🚫
1. [Cycle 1,2,3,4,5] **itch.io 직접 크롤링 403 차단** — WebFetch로 직접 접근 불가. WebSearch "site:itch.io" 간접 검색으로 대체 필수.
2. [Cycle 3,4,5] **CrazyGames 세부 카테고리 페이지 404** — `/t/shooting`, `/t/shoot-em-up`, `/t/deckbuilder` 등 세부 태그 URL은 404 반환. WebSearch 병행 필수.

## 검증된 성공 패턴 ✅
1. [Cycle 1,2,3,4,5] 웹 검색 + 사이트 크롤링 병렬 실행으로 데이터 수집 속도 향상
2. [Cycle 1,2,3,4,5] game-registry.json 기반 장르 중복 체크를 분석 최우선으로 수행
3. [Cycle 1,2,3,4,5] Steam 인디 + 모바일 + HTML5 브라우저 3개 시장을 교차 검증하면 트렌드 신뢰도 향상
4. [Cycle 2,3,4,5] CrazyGames 상위 카테고리 페이지(`/t/arcade`)는 WebFetch로 직접 크롤링 가능 (단, 정확한 카테고리명 필요)
5. [Cycle 2,3,4,5] "site:도메인" WebSearch 쿼리로 403 차단 사이트의 간접 데이터 수집 가능
6. [Cycle 3,4,5] 브라우저 시장의 장르 공백(블루오션) 식별이 추천 설득력을 크게 높임
7. [Cycle 4,5] 기존 게임의 기술 시너지 분석(풀링, 해싱, 상태머신 재활용)이 구현 난이도 평가 정확도를 높임
8. [Cycle 5] Sensor Tower 등 시장 리서치 보고서 검색으로 모바일 장르별 성장세 정량 데이터 확보 가능

## 다음 사이클 적용 사항 🎯
1. 장르별 HTML5 구현 난이도: roguelike ★★★★, survivor-like ★★★, deckbuilder ★★★, metroidvania ★★★★, bullet-hell ★★★, tower-defense ★★★, incremental ★★, puzzle-platformer ★★★, auto-battler ★★★
2. 포트폴리오 다양성 + 시장 블루오션 + 기술 시너지를 3축 평가 프레임워크로 고정
3. CrazyGames 세부 태그 URL 전면 불안정 — 항상 WebSearch 병행하여 데이터 보완
