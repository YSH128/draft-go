# 경매 초기 데이터 로드 API

## 개요
클라이언트가 경매 페이지에 진입할 때 필요한 모든 정보를 **한 번의 API 호출**로 제공하는 통합 엔드포인트입니다.

## API 명세

### 엔드포인트
```
GET /api/v1/auctions/{draftId}
```

### 응답 구조
```json
{
  "currentRound": {
    "draftId": 123,
    "playerName": "김철수",
    "playerProfileImageUrl": "https://...",
    "tier": "GOLD",
    "division": "I",
    "draftMemberId": 456,
    "turnOrder": 1,
    "currentMemberStatus": "BIDDING"
  },
  "currentBid": {
    "teamId": 789,
    "price": 500
  },
  "remainingSeconds": 25,
  "queue": [
    {
      "id": 457,
      "name": "이영희",
      "profileImageUrl": "https://...",
      "tier": "PLATINUM",
      "division": "III",
      "position": "MID",
      "status": "WAITING",
      "turnOrder": 2
    },
    // ...more queue items
  ],
  "nextPlayerName": "이영희",
  "teams": [
    {
      "teamId": 789,
      "teamName": "A팀",
      "currentPoint": 2500,
      "members": [
        {
          "memberId": 100,
          "name": "홍길동",
          "profileImageUrl": "https://...",
          "position": "TOP",
          "isLeader": true
        },
        // ...more members
      ]
    },
    // ...more teams
  ]
}
```

## 응답 필드 설명

### currentRound (RoundStatus)
현재 진행 중인 라운드 정보
- `null`: 진행 중인 라운드 없음 (경매 시작 전 또는 종료 후)
- 존재 시: 현재 경매 중인 선수 정보

### currentBid (BidInfo)
현재 최고 입찰가 정보
- `teamId`: 최고 입찰자 팀 ID
- `price`: 최고 입찰가
- 입찰이 없으면 `teamId`와 `price`가 `null`

### remainingSeconds (Integer)
타이머 남은 시간 (초)
- `null`: 타이머가 없음 (경매 진행 중이 아님)
- `0~30`: 남은 시간

### queue (List<DraftMemberResponse>)
드래프트 대기열
- `WAITING` 또는 `SKIPPED` 상태인 멤버만 포함
- `turnOrder`로 정렬됨

### nextPlayerName (String)
다음 순서 선수 이름
- 대기열 첫 번째 멤버의 이름
- 대기열이 비어있으면 `null`

### teams (List<TeamInfoResponse>)
전체 팀 정보
- `currentPoint`: Redis에서 실시간 포인트 조회 (없으면 DB 값)
- `members`: 각 팀의 현재 팀원 목록

## 사용 시나리오

### 1. 페이지 초기 로드
```javascript
// 1. 페이지 진입 시 초기 데이터 로드
async function loadAuctionPage(draftId) {
  const response = await fetch(`/api/v1/auctions/${draftId}`);
  const data = await response.json();
  
  // UI 초기화
  renderCurrentRound(data.currentRound);
  renderCurrentBid(data.currentBid);
  startTimer(data.remainingSeconds);
  renderQueue(data.queue);
  renderTeams(data.teams);
  
  // WebSocket 연결
  connectWebSocket(draftId);
}

// 2. WebSocket으로 실시간 업데이트 수신
function connectWebSocket(draftId) {
  // 경매 이벤트 구독
  stompClient.subscribe(`/ws/auction/${draftId}`, (message) => {
    const event = JSON.parse(message.body);
    handleAuctionEvent(event);
  });
  
  // 대기열 업데이트 구독
  stompClient.subscribe(`/topic/auction/${draftId}/queue`, (message) => {
    const queue = JSON.parse(message.body);
    renderQueue(queue);
  });
  
  // 팀 정보 업데이트 구독
  stompClient.subscribe(`/topic/auction/${draftId}/teams`, (message) => {
    const teams = JSON.parse(message.body);
    renderTeams(teams);
  });
}
```

### 2. 새로고침 (Refresh)
```javascript
// 특정 정보만 새로고침하고 싶을 때
async function refreshQueue(draftId) {
  const queue = await fetch(`/api/v1/auctions/${draftId}/queue`).then(r => r.json());
  renderQueue(queue);
}

async function refreshTeams(draftId) {
  const teams = await fetch(`/api/v1/auctions/${draftId}/teams`).then(r => r.json());
  renderTeams(teams);
}
```

### 3. 재연결 (Reconnection)
```javascript
// WebSocket 연결이 끊겼을 때 전체 데이터 다시 로드
async function reconnect(draftId) {
  // 1. 최신 데이터 로드
  const data = await fetch(`/api/v1/auctions/${draftId}`).then(r => r.json());
  
  // 2. UI 업데이트
  renderCurrentRound(data.currentRound);
  renderCurrentBid(data.currentBid);
  startTimer(data.remainingSeconds);
  renderQueue(data.queue);
  renderTeams(data.teams);
  
  // 3. WebSocket 재연결
  connectWebSocket(draftId);
}
```

## API 비교

### Before (여러 번 호출 필요)
```javascript
// ❌ 4번의 API 호출 필요
const queue = await fetch(`/api/v1/auctions/${draftId}/queue`).then(r => r.json());
const teams = await fetch(`/api/v1/auctions/${draftId}/teams`).then(r => r.json());
const currentRound = redisRepo.getCurrent(draftId);  // 불가능 (서버만 접근 가능)
const remainingSeconds = redisRepo.getRemainingSeconds(draftId);  // 불가능
```

### After (한 번 호출)
```javascript
// ✅ 1번의 API 호출로 모든 정보 제공
const data = await fetch(`/api/v1/auctions/${draftId}`).then(r => r.json());
// data.currentRound, data.currentBid, data.remainingSeconds, data.queue, data.teams
```

## 장점

1. **네트워크 효율성**: 1번의 API 호출로 모든 정보 제공
2. **데이터 일관성**: 한 시점의 스냅샷이므로 데이터 불일치 없음
3. **초기 로딩 속도**: 병렬 요청 대신 단일 요청으로 빠른 로딩
4. **간결한 코드**: 클라이언트 코드가 단순해짐

## 기존 API와의 관계

| API | 용도 | 호출 시점 |
|-----|------|-----------|
| `GET /api/v1/auctions/{draftId}` | **초기 로드** | 페이지 진입, 재연결 |
| `GET /api/v1/auctions/{draftId}/queue` | 수동 새로고침 | 사용자가 명시적으로 새로고침 요청 |
| `GET /api/v1/auctions/{draftId}/teams` | 수동 새로고침 | 사용자가 명시적으로 새로고침 요청 |
| WebSocket 구독 | 실시간 업데이트 | 변경 발생 시 자동 푸시 |

## 구현 상세

### AuctionService.getInitialData()
```java
public AuctionInitialDataResponse getInitialData(Long draftId) {
    // 1. Redis에서 현재 라운드 정보 조회
    RoundStatus currentRound = redisRepo.getCurrent(draftId);
    
    // 2. Redis에서 현재 입찰 정보 조회
    BidInfo currentBid = redisRepo.getBid(draftId);
    
    // 3. Redis에서 타이머 남은 시간 조회
    Integer remainingSeconds = currentRound != null 
        ? redisRepo.getRemainingSeconds(draftId) 
        : null;
    
    // 4. DB에서 대기열 조회 (기존 메서드 재사용)
    List<DraftMemberResponse> queue = getDraftQueue(draftId);
    
    // 5. 다음 선수 이름 (대기열 첫 번째)
    String nextPlayerName = queue.isEmpty() ? null : queue.get(0).getName();
    
    // 6. DB + Redis에서 팀 정보 조회 (기존 메서드 재사용)
    List<TeamInfoResponse> teams = getTeamInfos(draftId);
    
    return AuctionInitialDataResponse.of(
        currentRound, currentBid, remainingSeconds, 
        queue, nextPlayerName, teams
    );
}
```

**특징**:
- ✅ 기존 메서드(`getDraftQueue`, `getTeamInfos`) 최대한 재사용
- ✅ Redis와 DB 데이터를 통합하여 제공
- ✅ null-safe 처리 (경매 진행 전/후에도 안전)

## 테스트 시나리오

### 1. 경매 시작 전
```json
{
  "currentRound": null,
  "currentBid": {"teamId": null, "price": 0},
  "remainingSeconds": null,
  "queue": [...],  // 전체 대기열
  "nextPlayerName": "첫 번째 선수",
  "teams": [...]   // 팀장만 있는 상태
}
```

### 2. 경매 진행 중
```json
{
  "currentRound": {...},  // 현재 경매 중인 선수
  "currentBid": {"teamId": 789, "price": 500},  // 최고 입찰가
  "remainingSeconds": 15,  // 남은 시간
  "queue": [...],  // 남은 대기열
  "nextPlayerName": "다음 선수",
  "teams": [...]   // 현재 팀 구성
}
```

### 3. 경매 종료 후
```json
{
  "currentRound": null,
  "currentBid": {"teamId": null, "price": 0},
  "remainingSeconds": null,
  "queue": [],  // 빈 대기열
  "nextPlayerName": null,
  "teams": [...]   // 최종 팀 구성
}
```

## 주의사항

1. **캐싱 불가**: 실시간 정보이므로 클라이언트 캐싱 금지
2. **권한 체크**: 추후 필요 시 Draft 참여자만 조회 가능하도록 제한 가능
3. **성능**: 한 번에 많은 정보를 조회하므로 인덱스 최적화 필요

## 결론

초기 로드 API를 통해:
- ✅ **1번의 API 호출**로 모든 정보 제공
- ✅ **기존 메서드 재사용**으로 코드 중복 최소화
- ✅ **데이터 일관성** 보장
- ✅ **클라이언트 개발 편의성** 향상
