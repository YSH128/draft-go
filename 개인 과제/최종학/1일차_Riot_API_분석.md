# Riot API 기술 분석 및 학습 노트

## 1. 개요
리그 오브 레전드 경매 시스템 POC를 진행하며 Riot API의 동작 방식, 제약 사항, 데이터 구조적 특징을 분석하고 학습한 내용을 정리함.

## 2. API 구조적 특징 (Key Learnings)

### A. 식별자 체계의 변화 (SummonerID vs PUUID)
*   **기존:** `Summoner Name` → `Summoner ID` 구조가 주를 이뤘으나 폐기됨.
*   **변경:** `GameName + TagLine` → `PUUID` (Account-V1)가 모든 요청의 루트(Root)가 됨.
*   **발견:** `LEAGUE-V4` 엔드포인트가 과거 `encryptedSummonerId`만 받던 것에서, 최근 `PUUID`를 직접 지원하는 방식으로 개선됨을 확인 (`/entries/by-puuid/{puuid}`). 이로 인해 중간 변환 과정이 생략되어 로직이 단순화됨.

### B. 라우팅 전략 (Platform vs Regional)
API마다 호출해야 하는 도메인이 다름을 테스트를 통해 확인.
| 구분 | 라우팅 예시 | 대상 API | 비고 |
| :-- | :-- | :-- | :-- |
| **Platform** | `kr.api.riotgames.com` | Summoner, League, Mastery | 특정 서버(KR) 내 데이터 |
| **Regional** | `asia.api.riotgames.com` | **Match-V5**, Account-V1 | 광역 리전(소환사의 협곡 등) 통합 데이터 |
*   **시행착오:** Match-V5를 `kr` 도메인으로 호출하면 404/400 에러 발생. 전적 데이터는 `asia` 도메인을 사용해야 함.

### C. 데이터 정규화 부재 (Data Dragon 필수)
*   **현상:** API 응답(Match, Mastery 등)에는 챔피언이 `ID(숫자)`로만 반환됨 (예: `157`).
*   **해결:** `Data Dragon` (Static JSON)을 별도로 호출하여 인메모리 Map으로 매핑해야 함. API 자체적으로 이름을 반환하지 않으므로 클라이언트/백엔드에서 매핑 로직 필수.

## 3. 주요 API 테스트 결과

### A. Match-V5 (전적 분석)
*   **데이터 구조:** 매치 리스트 조회(`/ids`) → 상세 조회(`/matches`)의 N+1 구조.
*   **정보량:** 단일 매치 JSON이 매우 방대(약 100KB+). 경매 시스템에 필요한 건 `win`, `teamPosition` 등 극히 일부이므로 DTO 설계를 통해 필요한 필드만 추출하는 파싱 최적화 필요.
*   **포지션 산출:** `teamPosition` 필드가 정확도가 높으나, 칼바람 나락 등 비랭크 게임에서는 `UTILITY` 등으로 잡힐 수 있어 필터링 로직 필요.

### B. Tournament Stub API (한계점)
*   **테스트:** `Stub` API로 토너먼트 코드 생성(`STUB_...`) 성공.
*   **한계:** 생성된 Stub 코드는 **Live 서버 클라이언트에서 유효하지 않음.**
*   **결론:** 실제 서비스(방 자동 생성)를 하려면 Stub이 아닌 실제 `Tournament API` 권한(Production Key) 신청이 선행되어야 함.

## 4. 결론 및 제언
*   **계정 조회 최적화:** 닉네임 변경이 잦으므로 시스템 내부적으로는 불변 값인 `PUUID`를 PK로 사용해야 함.
*   **비동기 처리:** 전적 분석(최근 10판 등) 시 다수의 API 호출이 발생하므로, 블로킹 방식(RestTemplate)보다 `WebClient` 등을 활용한 병렬 처리가 필수적임.
