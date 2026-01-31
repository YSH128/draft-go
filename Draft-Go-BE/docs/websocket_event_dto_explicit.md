# WebSocket 이벤트 DTO 명시화

## 개요
BidEventDto처럼 모든 WebSocket 이벤트 데이터에 명시적인 DTO를 추가하여 타입 안전성과 가독성을 향상시켰습니다.

## 변경 사항

### 1. RoundStartEventDto 추가
**라운드 시작 이벤트를 위한 명시적 DTO**

```java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundStartEventDto {
    private Long draftId;
    private Long draftMemberId;
    private String playerName;
    private String playerProfileImageUrl;
    private Tier tier;
    private Division division;
    private int turnOrder;
    private CurrentMemberStatus currentMemberStatus;
    private LocalDateTime startedAt;
}
```

**역할**:
- 새로운 라운드가 시작될 때 클라이언트에게 전달되는 정보
- `RoundStatus`의 모든 필드를 포함하지만, WebSocket 전송에 최적화

### 2. RoundEndedEventDto 추가
**라운드 종료 이벤트를 위한 명시적 DTO**

```java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundEndedEventDto {
    private Long teamId;      // 낙찰된 팀 ID (유찰 시 null)
    private Integer price;    // 낙찰가 (유찰 시 null)
    private boolean isSuccessful;  // 낙찰 여부
    
    public static RoundEndedEventDto successful(Long teamId, int price) {
        return RoundEndedEventDto.builder()
                .teamId(teamId)
                .price(price)
                .isSuccessful(true)
                .build();
    }
    
    public static RoundEndedEventDto skipped() {
        return RoundEndedEventDto.builder()
                .teamId(null)
                .price(null)
                .isSuccessful(false)
                .build();
    }
}
```

**역할**:
- 라운드가 종료될 때 낙찰/유찰 정보 전달
- `isSuccessful` 플래그로 명확한 상태 구분
- 팩토리 메서드로 생성 편의성 제공

### 3. AuctionEvent 개선

#### Before (RoundStatus 직접 전송)
```java
public static AuctionEvent roundStart(RoundStatus state) {
    return AuctionEvent.builder()
            .type(AuctionEventType.ROUND_START)
            .data(state)  // ❌ 도메인 객체 직접 전송
            .build();
}

public static AuctionEvent roundEnded(BidInfo bid) {
    return AuctionEvent.builder()
            .type(AuctionEventType.ROUND_ENDED)
            .data(bid)  // ❌ 도메인 객체 직접 전송
            .build();
}
```

#### After (명시적 DTO 사용)
```java
public static AuctionEvent roundStart(RoundStatus state) {
    return AuctionEvent.builder()
            .type(AuctionEventType.ROUND_START)
            .data(RoundStartEventDto.builder()  // ✅ 명시적 DTO
                    .draftId(state.getDraftId())
                    .draftMemberId(state.getDraftMemberId())
                    .playerName(state.getPlayerName())
                    .playerProfileImageUrl(state.getPlayerProfileImageUrl())
                    .tier(state.getTier())
                    .division(state.getDivision())
                    .turnOrder(state.getTurnOrder())
                    .currentMemberStatus(state.getCurrentMemberStatus())
                    .startedAt(state.getStartedAt())
                    .build())
            .build();
}

public static AuctionEvent roundEnded(BidInfo bid) {
    return AuctionEvent.builder()
            .type(AuctionEventType.ROUND_ENDED)
            .data(bid.exists() 
                    ? RoundEndedEventDto.successful(bid.getTeamId(), bid.getPrice())  // ✅ 명시적 DTO
                    : RoundEndedEventDto.skipped())
            .build();
}
```

### 4. AuctionEventPublisher 정리
중복된 `timeOver` 메서드를 제거하고 `roundEnded`로 통일

```java
// Before: 중복 메서드
public void timeOver(Long draftId, BidInfo bid) { ... }
public void roundEnded(Long draftId, BidInfo bid) { ... }

// After: 하나로 통일
public void roundEnded(Long draftId, BidInfo bid) {
    template.convertAndSend(
            "/ws/auction/" + draftId,
            AuctionEvent.roundEnded(bid));
}
```

## WebSocket 이벤트 타입별 DTO 정리

| 이벤트 타입 | DTO | 설명 |
|-----------|-----|------|
| `ROUND_START` | `RoundStartEventDto` | 새 라운드 시작 (경매 대상 선수 정보) |
| `BID` | `BidEventDto` | 입찰 발생 (팀 ID, 가격, 남은 시간) |
| `ROUND_ENDED` | `RoundEndedEventDto` | 라운드 종료 (낙찰/유찰 정보) |

## 클라이언트 사용 예시

### JavaScript/TypeScript
```typescript
// WebSocket 구독
stompClient.subscribe('/ws/auction/123', (message) => {
    const event: AuctionEvent = JSON.parse(message.body);
    
    switch (event.type) {
        case 'ROUND_START':
            const roundData: RoundStartEventDto = event.data;
            console.log(`새 라운드 시작: ${roundData.playerName}`);
            startTimer(30);
            break;
            
        case 'BID':
            const bidData: BidEventDto = event.data;
            console.log(`${bidData.teamId}팀이 ${bidData.price}에 입찰`);
            updateTimer(bidData.remainingSeconds);
            break;
            
        case 'ROUND_ENDED':
            const endData: RoundEndedEventDto = event.data;
            if (endData.isSuccessful) {
                console.log(`낙찰: ${endData.teamId}팀, ${endData.price}원`);
            } else {
                console.log('유찰');
            }
            break;
    }
});
```

### DTO 인터페이스 (TypeScript)
```typescript
interface RoundStartEventDto {
    draftId: number;
    draftMemberId: number;
    playerName: string;
    playerProfileImageUrl: string;
    tier: string;
    division: string;
    turnOrder: number;
    currentMemberStatus: 'BIDDING' | 'COMPLETED' | 'SKIPPED';
    startedAt: string;
}

interface BidEventDto {
    teamId: number;
    price: number;
    remainingSeconds: number;
}

interface RoundEndedEventDto {
    teamId: number | null;
    price: number | null;
    isSuccessful: boolean;
}

interface AuctionEvent {
    type: 'ROUND_START' | 'BID' | 'ROUND_ENDED';
    data: RoundStartEventDto | BidEventDto | RoundEndedEventDto;
}
```

## 장점

### 1. 타입 안전성
- ✅ 명시적 DTO로 컴파일 타임 타입 체크
- ✅ JSON 직렬화/역직렬화 오류 방지

### 2. 도메인 모델 보호
- ✅ 도메인 객체(`RoundStatus`, `BidInfo`)를 직접 노출하지 않음
- ✅ 내부 구조 변경 시 WebSocket API에 영향 최소화

### 3. 명확한 API 계약
- ✅ 각 이벤트 타입마다 어떤 데이터가 전송되는지 명확
- ✅ 클라이언트 개발자가 쉽게 이해 가능

### 4. 유연성
- ✅ 필요한 필드만 선택적으로 전송 가능
- ✅ 도메인 모델 변경 없이 DTO만 수정 가능

### 5. 문서화 개선
- ✅ Swagger/OpenAPI 문서에 명확하게 표시
- ✅ 주석으로 각 필드의 의미 설명 가능

## 일관성

모든 WebSocket 이벤트가 동일한 패턴을 따름:

```java
// 패턴: 도메인 객체 → DTO 변환 → 이벤트 생성
public static AuctionEvent [eventName]([DomainObject] obj) {
    return AuctionEvent.builder()
            .type(AuctionEventType.[TYPE])
            .data([EventDto].builder()
                    .field1(obj.getField1())
                    .field2(obj.getField2())
                    // ...
                    .build())
            .build();
}
```

## 테스트 예시

```java
@Test
void roundEndedEvent_successful() {
    // Given
    BidInfo bid = BidInfo.builder()
            .teamId(123L)
            .price(500)
            .build();
    
    // When
    AuctionEvent event = AuctionEvent.roundEnded(bid);
    
    // Then
    assertThat(event.getType()).isEqualTo(AuctionEventType.ROUND_ENDED);
    
    RoundEndedEventDto data = (RoundEndedEventDto) event.getData();
    assertThat(data.isSuccessful()).isTrue();
    assertThat(data.getTeamId()).isEqualTo(123L);
    assertThat(data.getPrice()).isEqualTo(500);
}

@Test
void roundEndedEvent_skipped() {
    // Given
    BidInfo bid = BidInfo.builder().build();  // teamId == null
    
    // When
    AuctionEvent event = AuctionEvent.roundEnded(bid);
    
    // Then
    RoundEndedEventDto data = (RoundEndedEventDto) event.getData();
    assertThat(data.isSuccessful()).isFalse();
    assertThat(data.getTeamId()).isNull();
    assertThat(data.getPrice()).isNull();
}
```

## 마이그레이션 가이드

클라이언트 코드 수정이 필요한 경우:

### Before
```javascript
// RoundStatus 전체 객체가 전송됨
if (event.type === 'ROUND_START') {
    console.log(event.data.draftId);  // 동일
}

// BidInfo 전체 객체가 전송됨
if (event.type === 'ROUND_ENDED') {
    if (event.data.teamId != null) {  // ❌ 암묵적 체크
        console.log('낙찰');
    }
}
```

### After
```javascript
// RoundStartEventDto 전송 (필드는 동일)
if (event.type === 'ROUND_START') {
    console.log(event.data.draftId);  // 동일
}

// RoundEndedEventDto 전송
if (event.type === 'ROUND_ENDED') {
    if (event.data.isSuccessful) {  // ✅ 명시적 플래그
        console.log(`낙찰: ${event.data.teamId}팀`);
    } else {
        console.log('유찰');
    }
}
```

## 결론

모든 WebSocket 이벤트에 명시적 DTO를 사용함으로써:
- ✅ **타입 안전성** 향상
- ✅ **도메인 모델 보호**
- ✅ **API 계약 명확화**
- ✅ **일관된 코드 스타일**

유지보수성과 확장성이 크게 개선되었습니다! 🎉
