# 경매 결과 조회 API 문서

## 개요
완료된 경매의 결과를 상세하게 조회하는 API입니다.

## API 명세

### 경매 결과 상세 조회

**Endpoint**: `GET /api/v1/drafts/{draftId}/result`

**설명**: 특정 드래프트의 경매 결과를 팀별, 선수별로 상세하게 조회합니다.

#### 요청

**Path Parameters**:
- `draftId` (Long, required): 드래프트 ID

**Headers**:
- `Authorization`: Bearer {accessToken} (Optional - 공개 조회 가능)

#### 응답

**200 OK**

```json
{
  "draftId": 1,
  "title": "2026 겨울 내전",
  "ownerName": "Player1",
  "startPrice": 10,
  "startPoint": 100,
  "maxTeamCount": 2,
  "status": "COMPLETED",
  "createdAt": "2026-01-31T10:00:00",
  "teams": [
    {
      "teamId": 1,
      "teamName": "Team A",
      "finalPoint": 25,
      "spentPoint": 75,
      "players": [
        {
          "memberId": 1,
          "gameName": "TestPlayer1",
          "tagLine": "KR1",
          "profileIconUrl": "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/1.png",
          "position": "TOP",
          "isLeader": true,
          "bidPrice": 0,
          "tier": "GOLD",
          "division": "I"
        },
        {
          "memberId": 2,
          "gameName": "TestPlayer2",
          "tagLine": "KR1",
          "profileIconUrl": "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/2.png",
          "position": "JUNGLE",
          "isLeader": false,
          "bidPrice": 25,
          "tier": "SILVER",
          "division": "II"
        },
        {
          "memberId": 3,
          "gameName": "TestPlayer3",
          "tagLine": "KR1",
          "profileIconUrl": "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/3.png",
          "position": "MID",
          "isLeader": false,
          "bidPrice": 20,
          "tier": "PLATINUM",
          "division": "III"
        },
        {
          "memberId": 4,
          "gameName": "TestPlayer4",
          "tagLine": "KR1",
          "profileIconUrl": "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/4.png",
          "position": "BOT",
          "isLeader": false,
          "bidPrice": 15,
          "tier": "GOLD",
          "division": "IV"
        },
        {
          "memberId": 5,
          "gameName": "TestPlayer5",
          "tagLine": "KR1",
          "profileIconUrl": "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/5.png",
          "position": "SUP",
          "isLeader": false,
          "bidPrice": 15,
          "tier": "BRONZE",
          "division": "I"
        }
      ]
    },
    {
      "teamId": 2,
      "teamName": "Team B",
      "finalPoint": 30,
      "spentPoint": 70,
      "players": [
        {
          "memberId": 6,
          "gameName": "TestPlayer6",
          "tagLine": "KR1",
          "profileIconUrl": "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/6.png",
          "position": "TOP",
          "isLeader": true,
          "bidPrice": 0,
          "tier": "DIAMOND",
          "division": "II"
        }
        // ... 나머지 팀원
      ]
    }
  ],
  "summary": {
    "totalPlayers": 10,
    "completedPlayers": 8,
    "skippedPlayers": 2,
    "totalSpentPoints": 145
  }
}
```

**404 Not Found**

```json
{
  "code": "DRAFT_NOT_FOUND",
  "message": "존재하지 않는 드래프트입니다"
}
```

## 응답 필드 설명

### DraftResultResponse

| 필드 | 타입 | 설명 |
|------|------|------|
| draftId | Long | 드래프트 ID |
| title | String | 드래프트 제목 |
| ownerName | String | 드래프트 생성자 닉네임 |
| startPrice | Integer | 시작 입찰가 |
| startPoint | Integer | 각 팀의 시작 포인트 |
| maxTeamCount | Integer | 최대 팀 수 |
| status | String | 드래프트 상태 (LOBBY, IN_DRAFT, COMPLETED) |
| createdAt | DateTime | 생성 일시 |
| teams | Array | 팀별 결과 목록 |
| summary | Object | 경매 요약 통계 |

### TeamResultDto

| 필드 | 타입 | 설명 |
|------|------|------|
| teamId | Long | 팀 ID |
| teamName | String | 팀 이름 |
| finalPoint | Integer | 최종 남은 포인트 |
| spentPoint | Integer | 사용한 포인트 (startPoint - finalPoint) |
| players | Array | 팀원 목록 |

### PlayerResultDto

| 필드 | 타입 | 설명 |
|------|------|------|
| memberId | Long | 멤버 ID |
| gameName | String | 게임 닉네임 |
| tagLine | String | 태그라인 |
| profileIconUrl | String | 프로필 아이콘 URL |
| position | String | 포지션 (TOP, JUNGLE, MID, BOT, SUP) |
| isLeader | Boolean | 팀장 여부 |
| bidPrice | Integer | 낙찰가 (팀장은 0) |
| tier | String | 티어 (IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER) |
| division | String | 디비전 (I, II, III, IV) |

### ResultSummary

| 필드 | 타입 | 설명 |
|------|------|------|
| totalPlayers | Integer | 전체 선수 수 |
| completedPlayers | Integer | 낙찰된 선수 수 |
| skippedPlayers | Integer | 유찰된 선수 수 |
| totalSpentPoints | Integer | 모든 팀이 사용한 총 포인트 |

## 사용 예시

### cURL

```bash
# 경매 결과 조회
curl -X GET "http://localhost:8080/api/v1/drafts/1/result" \
  -H "accept: application/json"
```

### JavaScript (fetch)

```javascript
// 경매 결과 조회
async function getDraftResult(draftId) {
  const response = await fetch(`/api/v1/drafts/${draftId}/result`);
  const result = await response.json();
  
  console.log('경매 제목:', result.title);
  console.log('총 팀 수:', result.teams.length);
  
  // 팀별 정보 출력
  result.teams.forEach(team => {
    console.log(`\n[${team.teamName}]`);
    console.log(`남은 포인트: ${team.finalPoint}`);
    console.log(`사용 포인트: ${team.spentPoint}`);
    console.log('팀원:');
    
    team.players.forEach(player => {
      const role = player.isLeader ? '팀장' : '팀원';
      console.log(`  - ${player.gameName} (${player.position}, ${role}, ${player.bidPrice}P)`);
    });
  });
}

// 사용
getDraftResult(1);
```

## 특이사항

### 1. 진행 중 결과 조회
- 경매가 완료되지 않아도 현재까지의 결과를 조회할 수 있습니다
- IN_DRAFT 상태에서도 이미 낙찰된 선수들의 정보를 확인 가능합니다

### 2. 팀장 포인트
- 팀장의 `bidPrice`는 `startPrice`와 동일합니다
- 팀장은 경매 없이 자동으로 팀에 배정되며, startPrice만큼의 포인트를 사용한 것으로 처리됩니다

### 3. 포인트 계산
- `spentPoint` = `startPoint` - `finalPoint`
- 팀장의 startPrice도 사용 포인트에 포함됩니다

## 에러 코드

| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| DRAFT_NOT_FOUND | 404 | 존재하지 않는 드래프트 |

## 관련 API

- `GET /api/v1/drafts` - 드래프트 목록 조회
- `GET /api/v1/drafts/{draftId}/auction` - 경매 초기 데이터 조회 (진행 중)

## Swagger UI

API 문서는 다음 URL에서 확인할 수 있습니다:
- `http://localhost:8080/swagger-ui/index.html`
