# 📝 MongoDB 전적 시스템 설계 및 최적화 노트

## 1. 개요

LoL 전적 데이터(Match History)를 MongoDB에 저장하고, 대용량 데이터 환경에서도 **커서 기반 페이지네이션(No-Offset)**을 통해 끊김 없는 무한 스크롤을 구현하기 위한 스키마 및 인덱스 설계를 정리함.

## 2. 스키마 설계 전략 (Schema Design)

### A. 컬렉션 구조: `matches`

전적 리스트 조회 시 성능을 위해 **Read-Optimized(조회 최적화)** 된 구조가 필요함.

| 필드명 | 타입 | 설명 | 비고 |
| --- | --- | --- | --- |
| `_id` | ObjectId | MongoDB 자동 생성 PK | **정렬 기준으로 사용 불가** (데이터 수집 시점 != 게임 실제 시간) |
| **`puuid`** | String | 사용자 식별자 (Partition Key) | 조회 조건의 핵심 (Equality) |
| **`gameCreation`** | Long/Date | **게임 시작 시간 (Sort Key)** | 커서(Cursor)의 기준값이 됨 |
| **`matchId`** | String | 매치 고유 ID (Tie-breaker) | `KR_12345` 형태. 시간 중복 시 2차 정렬 기준 |
| `matchData` | Object | 게임 상세 데이터 (JSON) | 임베디드 방식 저장 |

### B. 왜 `_id`를 커서로 쓰지 않는가? (Critical)

* **문제점:** `_id`는 문서가 **DB에 저장되는 순간(Insert Time)** 생성됨.
* **상황:** 만약 1년 전 게임 데이터를 오늘 수집해서 넣는다면?
* `_id`는 '오늘' 날짜로 생성되지만, 실제 게임(`gameCreation`)은 '1년 전'임.


* **결론:** `_id`로 정렬하면 뒤죽박죽이 됨. 반드시 **`gameCreation`** 필드를 커서 기준으로 삼아야 함.

## 3. 인덱싱 전략 (Indexing Strategy)

### A. 복합 인덱스 (Compound Index) 필수

커서 페이지네이션의 핵심은 **"찾고(Where) + 정렬(Sort)"**을 인덱스 하나로 끝내는 것임. **ESR(Equality, Sort, Range) 규칙**에 따라 인덱스를 구성해야 함.

```javascript
// MongoDB Shell 명령어
db.matches.createIndex({ 
    puuid: 1,          // 1. Equality: 누구의 전적인가? (정확히 일치)
    gameCreation: -1,  // 2. Sort/Range: 최신순 정렬 및 범위 검색 (커서 역할)
    matchId: -1        // 3. Tie-Breaker: 시간이 완벽히 같을 경우 대비 (선택 사항이나 권장)
});

```

* **`puuid: 1`**: 특정 유저의 데이터만 필터링. (카디널리티가 높음)
* **`gameCreation: -1`**: 최신 게임부터 보여줘야 하므로 내림차순(DESC) 인덱스핑.
* **`matchId: -1`**: 아주 드문 확률로 `gameCreation`이 밀리초(ms) 단위까지 똑같은 경우를 대비한 유니크 키.

### B. 쿼리 실행 계획 (Query Plan)

인덱스를 걸었을 때 DB가 동작하는 방식.

1. **Seek:** 인덱스 트리에서 `puuid="내꺼"` 이면서 `gameCreation < 커서값`인 위치를 바로 찾음. (Log N)
2. **Scan:** 그 위치부터 인덱스를 타고 20개만 쓱 훑음. (O(Limit))
3. **Fetch:** 찾은 인덱스가 가리키는 실제 문서 데이터만 가져옴.

## 4. 커서 페이지네이션 구현 로직

### A. 쿼리 패턴 (Query Pattern)

**1) 첫 페이지 요청 (커서 없음)**

```javascript
db.matches.find({ 
    puuid: "User_PUUID" 
})
.sort({ gameCreation: -1, matchId: -1 }) // 인덱스 순서대로
.limit(20)

```

* **응답:** 20개의 리스트와 함께, **마지막 20번째 아이템**의 `gameCreation`과 `matchId`를 클라이언트에게 `nextCursor`로 줌.

**2) 두 번째 페이지 요청 (커서 있음)**

* 클라이언트 전달 값: `lastGameCreation = 1704890000`, `lastMatchId = "KR_123"`

```javascript
db.matches.find({
    puuid: "User_PUUID",
    $or: [
        { gameCreation: { $lt: 1704890000 } }, // 1. 시간이 더 과거이거나
        { 
          gameCreation: 1704890000,            // 2. 시간은 같은데
          matchId: { $lt: "KR_123" }           //    ID가 더 작은 경우 (중복 방지)
        }
    ]
})
.sort({ gameCreation: -1, matchId: -1 })
.limit(20)

```

* **최적화 팁:** LoL 게임은 한 유저가 같은 밀리초에 2게임을 할 수 없으므로, 사실상 `$or` 조건 없이 **`gameCreation: { $lt: lastGameCreation }`** 하나만 써도 무방함. (복잡도 감소)

## 5. 결론 및 제언

* **인덱스:** `{ puuid: 1, gameCreation: -1 }` 복합 인덱스는 선택이 아닌 **필수**임. 이거 없으면 데이터 쌓일수록 전적 조회 로딩 3초 이상 걸림.
* **데이터 타입:** `gameCreation`은 반드시 숫자(Long) 또는 Date 타입으로 저장해야 함. (문자열 저장 시 대소 비교 속도 저하).
* **설계 요약:** RDBMS처럼 정규화하지 말고, 조회용 `matches` 컬렉션에 **필요한 모든 정보를 때려 박는(Embedding)** 전략이 페이지네이션 속도에는 가장 유리함.