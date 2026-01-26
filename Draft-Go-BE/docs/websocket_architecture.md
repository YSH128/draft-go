# WebSocket 아키텍처 및 동작 흐름

## 목차
1. [개요](#개요)
2. [기술 스택](#기술-스택)
3. [WebSocket 설정](#websocket-설정)
4. [아키텍처 구조](#아키텍처-구조)
5. [모듈별 사용 흐름](#모듈별-사용-흐름)
6. [메시지 흐름도](#메시지-흐름도)
7. [주요 컴포넌트 설명](#주요-컴포넌트-설명)
8. [클라이언트 연결 가이드](#클라이언트-연결-가이드)

---

## 개요

Draft-Go 프로젝트는 실시간 드래프트 경매 시스템을 제공하기 위해 **STOMP over WebSocket** 프로토콜을 사용합니다.

### 주요 기능
- **로비 실시간 업데이트**: 참가자 입장/퇴장, 역할/포지션 변경, 준비 상태 변경
- **경매 실시간 통신**: 경매 시작/종료, 입찰 정보, 팀 정보 업데이트
- **단체 채팅**: 로비 및 경매 중 실시간 채팅 (참가자 입장/퇴장 알림 포함)

---

## 기술 스택

| 구성 요소 | 기술 |
|---------|------|
| 프로토콜 | STOMP (Simple Text Oriented Messaging Protocol) |
| 전송 계층 | WebSocket + SockJS (fallback) |
| 메시징 브로커 | Spring Simple Broker |
| 클라이언트 라이브러리 | SockJS, StompJS |

---

## WebSocket 설정

### WebSocketConfig.java

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue", "/ws");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

### 설정 설명

#### 1. STOMP Endpoint
- **엔드포인트**: `/ws`
- **기능**: 클라이언트가 WebSocket 연결을 시작하는 진입점
- **CORS**: 모든 오리진 허용 (`*`)
- **SockJS**: WebSocket을 지원하지 않는 브라우저를 위한 폴백 지원

#### 2. Message Broker
- **구독 prefix**: `/topic`, `/queue`, `/ws`
  - `/topic`: 브로드캐스트 메시지 (1:N)
  - `/queue`: 개인 메시지 (1:1)
  - `/ws`: 추가 웹소켓 경로
- **애플리케이션 prefix**: `/app`
  - 클라이언트가 서버로 메시지를 보낼 때 사용

---

## 아키텍처 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                         클라이언트                                │
│                    (Browser + SockJS)                            │
└────────────────────┬────────────────────────────────────────────┘
                     │ STOMP over WebSocket
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    WebSocket Endpoint                            │
│                         /ws                                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
┌──────────────────┐    ┌──────────────────┐
│  Message Broker  │    │  @MessageMapping │
│   (Subscribe)    │    │     (Send)       │
│  /topic/...      │    │    /app/...      │
│  /queue/...      │    │                  │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ↓                       ↓
┌─────────────────────────────────────────┐
│         비즈니스 로직 처리                  │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ Lobby Module │  │Auction Module│    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│   SimpMessagingTemplate                 │
│   (브로드캐스트 발송)                      │
└─────────────────────────────────────────┘
```

---

## 모듈별 사용 흐름

### 1. 로비 (Lobby) 모듈

#### 구독 경로
```
/topic/lobby/{draftId}
```

#### 이벤트 타입 (LobbyEventType)
| 이벤트 | 설명 |
|-------|------|
| `ROLE_CHANGED` | 역할 변경 (LEADER ↔ MEMBER) |
| `POSITION_CHANGED` | 포지션 변경 (TOP, JUNGLE, MID, BOT, SUP, OBSERVER) |
| `PARTICIPANT_JOINED` | 참가자 입장 |
| `PARTICIPANT_LEFT` | 참가자 퇴장 |
| `LEADER_POINT_CHANGED` | 팀장 포인트 변경 |
| `READY_STATUS_CHANGED` | 팀장 준비 상태 변경 |
| `INVITE_CODE_REFRESHED` | 초대 코드 리프레시 |
| `DRAFT_STARTED` | 드래프트 시작 |
| `REFRESH_REQUIRED` | 전체 로비 새로고침 필요 |

#### 메시지 형식
```json
{
  "eventType": "PARTICIPANT_JOINED",
  "draftId": 123
}
```

#### 주요 컴포넌트
1. **LobbyWebSocketController**: 클라이언트 구독 처리
2. **LobbyWebSocketService**: 브로드캐스트 발송
3. **LobbyService**: 비즈니스 로직 처리 후 이벤트 발행

#### 동작 흐름
```
클라이언트              REST API              WebSocket Service
    │                     │                          │
    │  POST /lobby/...    │                          │
    ├───────────────────→ │                          │
    │                     │ (비즈니스 로직 처리)       │
    │                     ├─────────────────────────→│
    │                     │  broadcastLobbyUpdate()  │
    │                     │                          │
    │  ← 이벤트 브로드캐스트 (eventType만 전송)         │
    │←──────────────────────────────────────────────│
    │                     │                          │
    │  GET /lobby/{draftId} (최신 데이터 조회)        │
    ├───────────────────→ │                          │
    │  ← 전체 로비 정보     │                          │
    │←─────────────────── │                          │
```

**핵심 특징**: 
- WebSocket으로는 **이벤트 타입만** 전송
- 클라이언트는 이벤트 수신 후 **REST API로 최신 데이터 조회**

---

### 2. 경매 (Auction) 모듈

#### 구독 경로
| 경로 | 용도 |
|-----|------|
| `/ws/auction/{draftId}` | 경매 이벤트 (시작, 입찰, 종료) |
| `/topic/auction/{draftId}/queue` | 드래프트 대기열 정보 |
| `/topic/auction/{draftId}/teams` | 팀 정보 업데이트 |

#### 메시지 전송 경로
| 경로 | 용도 |
|-----|------|
| `/app/auction/{draftId}/queue` | 대기열 정보 요청 |
| `/app/auction/{draftId}/teams` | 팀 정보 요청 |

#### 이벤트 타입 (AuctionEventType)
| 이벤트 | 설명 | 데이터 |
|-------|------|--------|
| `START` | 경매 시작 | AuctionState (현재 경매 상태) |
| `BID` | 입찰 발생 | BidInfo (teamId, price) |
| `END` | 경매 종료 | BidInfo (최종 낙찰 정보) |

#### 메시지 형식

**경매 이벤트**
```json
{
  "type": "START",
  "data": {
    "currentPlayerId": 456,
    "currentPlayerName": "Faker",
    "remainingTime": 30,
    "currentBid": {
      "teamId": 1,
      "price": 100
    }
  }
}
```

**대기열 정보**
```json
[
  {
    "playerId": 123,
    "playerName": "Faker",
    "position": "MID",
    "tier": "CHALLENGER"
  }
]
```

**팀 정보**
```json
[
  {
    "teamId": 1,
    "leaderName": "홍길동",
    "remainingPoints": 900,
    "members": [...]
  }
]
```

#### 주요 컴포넌트
1. **AuctionController**: REST API 및 WebSocket 메시지 핸들링
2. **AuctionEventPublisher**: 경매 이벤트 브로드캐스트
3. **AuctionService**: 경매 비즈니스 로직

#### 동작 흐름

**경매 시작 흐름**
```
클라이언트        REST API       AuctionService    EventPublisher
    │                │                 │                  │
    │  POST /start   │                 │                  │
    ├──────────────→ │                 │                  │
    │                ├───────────────→ │                  │
    │                │  startAuction() │                  │
    │                │                 ├─────────────────→│
    │                │                 │   start(draftId) │
    │                │                 │                  │
    │  ← START 이벤트 브로드캐스트                          │
    │←───────────────────────────────────────────────────│
```

**입찰 흐름**
```
클라이언트A       BidService     EventPublisher    클라이언트B
    │                │                  │                │
    │  POST /bid     │                  │                │
    ├──────────────→ │                  │                │
    │                ├─────────────────→│                │
    │                │  bidUpdated()    │                │
    │                │                  │                │
    │  ← BID 이벤트 (모든 구독자에게 브로드캐스트)          │
    │←────────────────────────────────────────────────→ │
```

**@MessageMapping 사용 (양방향 통신)**
```
클라이언트                  AuctionController
    │                             │
    │  SEND /app/auction/1/queue  │
    ├────────────────────────────→│
    │        @MessageMapping       │
    │        getDraftQueuews()     │
    │                              │
    │  ← 응답: /topic/auction/1/queue
    │←─────────────────────────────│
    │      (대기열 데이터)           │
```

---

### 3. 채팅 (Chat) 모듈

#### 구독 경로
```
/topic/chat/{draftId}
```

#### 메시지 전송 경로
```
/app/chat/{draftId}
```

#### 메시지 타입 (MessageType)
| 타입 | 설명 |
|-----|------|
| `CHAT` | 일반 채팅 메시지 |
| `JOIN` | 참가자 입장 알림 |
| `LEAVE` | 참가자 퇴장 알림 |
| `SYSTEM` | 시스템 메시지 |

#### 메시지 형식

**일반 채팅 메시지**
```json
{
  "type": "CHAT",
  "senderId": 123,
  "senderNickname": "홍길동",
  "content": "안녕하세요!",
  "timestamp": "2026-01-26T15:30:00"
}
```

**입장 알림**
```json
{
  "type": "JOIN",
  "senderNickname": "홍길동",
  "content": "홍길동님이 입장했습니다.",
  "timestamp": "2026-01-26T15:30:00"
}
```

**퇴장 알림**
```json
{
  "type": "LEAVE",
  "senderNickname": "홍길동",
  "content": "홍길동님이 퇴장했습니다.",
  "timestamp": "2026-01-26T15:30:00"
}
```

**시스템 메시지**
```json
{
  "type": "SYSTEM",
  "content": "🎯 경매가 시작되었습니다!",
  "timestamp": "2026-01-26T15:30:00"
}
```

#### 주요 컴포넌트
1. **ChatWebSocketController**: 채팅 메시지 핸들링 및 브로드캐스트
2. **LobbyService / RoomService**: 참가자 입장/퇴장 시 채팅 알림 발송
3. **AuctionService**: 경매 시작/종료 시 시스템 메시지 발송

#### 동작 흐름

**채팅 메시지 전송**
```
클라이언트A          ChatController         클라이언트B,C
    │                     │                      │
    │  SEND /app/chat/1   │                      │
    │  {content: "안녕"}   │                      │
    ├────────────────────→│                      │
    │                     │ 메시지 생성 & 브로드캐스트 │
    │                     │                      │
    │  ← CHAT 메시지 (모든 구독자에게)             │
    │←──────────────────────────────────────────→│
```

**자동 알림 (입장/퇴장/시스템)**
```
비즈니스 로직         ChatController      구독 클라이언트들
    │                     │                      │
    │ 이벤트 발생          │                      │
    │ (입장/퇴장/경매 시작) │                      │
    ├────────────────────→│                      │
    │ sendJoinMessage()   │                      │
    │                     │ 알림 메시지 브로드캐스트  │
    │                     ├─────────────────────→│
    │                     │                      │
```

#### 통합 시나리오

**로비 참가자 입장**
1. 클라이언트가 `/api/v1/rooms/join` 호출
2. `RoomService.joinToLobby()` 실행
3. Redis에 참가자 추가
4. `LobbyWebSocketService`가 `PARTICIPANT_JOINED` 이벤트 발송
5. `ChatWebSocketController`가 입장 알림 메시지 발송

**경매 시작**
1. 관리자가 `/api/v1/lobby/{draftId}/start` 호출
2. `LobbyService.startDraft()` 실행
3. 드래프트 상태를 `IN_DRAFT`로 변경
4. `LobbyWebSocketService`가 `DRAFT_STARTED` 이벤트 발송
5. `AuctionService.startAuction()` 실행
6. `ChatWebSocketController`가 "경매 시작" 시스템 메시지 발송

---

## 메시지 흐름도

### 구독 (Subscribe) 흐름
```
1. 클라이언트가 STOMP CONNECT 요청
   ↓
2. 서버가 연결 수락 (CONNECTED 프레임 응답)
   ↓
3. 클라이언트가 SUBSCRIBE 요청
   - SUBSCRIBE /topic/lobby/123
   ↓
4. 서버가 해당 구독을 등록
   ↓
5. 이벤트 발생 시 서버가 SEND 프레임으로 메시지 전송
```

### 메시지 전송 (Send) 흐름
```
1. 클라이언트가 SEND 요청
   - SEND /app/auction/123/queue
   ↓
2. 서버의 @MessageMapping 메서드가 처리
   ↓
3. @SendTo로 지정된 목적지로 응답 브로드캐스트
   - /topic/auction/123/queue
   ↓
4. 구독 중인 모든 클라이언트가 메시지 수신
```

---

## 주요 컴포넌트 설명

### 1. SimpMessagingTemplate
- **역할**: Spring이 제공하는 메시징 템플릿
- **기능**: 특정 목적지로 메시지 브로드캐스트
- **사용 예시**:
```java
@Component
@RequiredArgsConstructor
public class LobbyWebSocketService {
    private final SimpMessagingTemplate messagingTemplate;
    
    public void broadcastLobbyUpdate(Long draftId, LobbyEventType eventType) {
        LobbyUpdateMessage message = LobbyUpdateMessage.builder()
                .eventType(eventType)
                .draftId(draftId)
                .build();
        
        messagingTemplate.convertAndSend(
            "/topic/lobby/" + draftId, 
            message
        );
    }
}
```

### 2. @MessageMapping
- **역할**: 클라이언트로부터 메시지를 수신하는 핸들러
- **특징**: `/app` prefix가 자동으로 붙음
- **사용 예시**:
```java
@MessageMapping("/auction/{draftId}/queue")
@SendTo("/topic/auction/{draftId}/queue")
public List<DraftMemberResponse> getDraftQueuews(@DestinationVariable Long draftId) {
    return auctionService.getDraftQueue(draftId);
}
```

### 3. @SendTo
- **역할**: 메서드 반환값을 특정 목적지로 브로드캐스트
- **특징**: @MessageMapping과 함께 사용
- **동작**: 메서드의 반환값이 자동으로 JSON 변환되어 전송됨

### 4. @SubscribeMapping
- **역할**: 클라이언트가 구독할 때 호출되는 핸들러
- **용도**: 구독 이벤트 로깅, 초기 데이터 전송 등
- **사용 예시**:
```java
@SubscribeMapping("/topic/lobby/{draftId}")
public void onSubscribe(Long draftId) {
    log.info("Client subscribed to lobby - draftId: {}", draftId);
}
```

---

## 클라이언트 연결 가이드

### JavaScript (SockJS + StompJS)

#### 1. 라이브러리 설치
```html
<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
```

#### 2. 연결 설정
```javascript
// WebSocket 연결
const socket = new SockJS('https://your-domain.com/ws');
const stompClient = Stomp.over(socket);

// 연결
stompClient.connect({}, function(frame) {
    console.log('Connected:', frame);
    
    // 로비 구독
    stompClient.subscribe('/topic/lobby/123', function(message) {
        const data = JSON.parse(message.body);
        console.log('Lobby event:', data.eventType);
        
        // REST API로 최신 데이터 조회
        fetchLobbyInfo(data.draftId);
    });
    
    // 경매 이벤트 구독
    stompClient.subscribe('/ws/auction/123', function(message) {
        const event = JSON.parse(message.body);
        console.log('Auction event:', event.type, event.data);
    });
    
    // 대기열 구독
    stompClient.subscribe('/topic/auction/123/queue', function(message) {
        const queue = JSON.parse(message.body);
        updateQueueUI(queue);
    });
    
    // 채팅 구독
    stompClient.subscribe('/topic/chat/123', function(message) {
        const chatMessage = JSON.parse(message.body);
        console.log('Chat message:', chatMessage.type, chatMessage.content);
        displayChatMessage(chatMessage);
    });
});

// 채팅 메시지 전송
function sendChatMessage(draftId, content) {
    stompClient.send(
        `/app/chat/${draftId}`,
        {},
        JSON.stringify({ content: content })
    );
}

// 메시지 전송 (경매)
function requestQueue(draftId) {
    stompClient.send(
        `/app/auction/${draftId}/queue`,
        {},
        JSON.stringify({})
    );
}

// 연결 해제
function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
}
```

#### 3. REST API와 함께 사용하는 패턴
```javascript
// WebSocket으로 이벤트 알림만 받고
stompClient.subscribe('/topic/lobby/123', function(message) {
    const data = JSON.parse(message.body);
    
    // REST API로 최신 전체 데이터 조회
    fetch(`/api/v1/drafts/${data.draftId}/lobby`)
        .then(response => response.json())
        .then(lobbyInfo => {
            updateLobbyUI(lobbyInfo);
        });
});
```

---

## 연결 문제 해결

### NGINX WebSocket 프록시 설정
WebSocket 연결이 실패하는 경우 NGINX 설정을 확인하세요.

```nginx
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 타임아웃 설정
    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;
}
```

### SockJS Fallback
WebSocket을 지원하지 않는 환경에서는 SockJS가 자동으로 다음 전송 방식으로 폴백합니다:
1. WebSocket
2. HTTP Streaming
3. HTTP Long Polling

---

## 보안 고려사항

### 1. CORS 설정
현재는 모든 오리진을 허용하고 있습니다. 프로덕션 환경에서는 제한 필요:
```java
registry.addEndpoint("/ws")
        .setAllowedOrigins("https://draft-go.com", "https://www.draft-go.com")
        .withSockJS();
```

### 2. 인증
WebSocket 연결 시 JWT 토큰 검증이 필요한 경우, Interceptor 추가 가능:
```java
@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new AuthChannelInterceptor());
}
```

### 3. 권한 검증
메시지 핸들러에서 사용자 권한 확인 필요

---

## 테스트

### 테스트 페이지
프로젝트에서 제공하는 테스트 페이지:

**로비 WebSocket 테스트**
- **경로**: `/static/test-lobby-websocket.html`
- **URL**: `http://localhost:8080/test-lobby-websocket.html`
- **기능**: 로비 WebSocket 연결 및 이벤트 수신 테스트

**채팅 WebSocket 테스트**
- **경로**: `/static/test-chat-websocket.html`
- **URL**: `http://localhost:8080/test-chat-websocket.html`
- **기능**: 채팅 메시지 전송 및 수신, 입장/퇴장/시스템 메시지 테스트

### 수동 테스트 도구
- **Postman**: WebSocket 연결 및 메시지 전송 테스트 지원
- **wscat**: CLI 기반 WebSocket 클라이언트

---

## 참고 자료

- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [STOMP Protocol Specification](https://stomp.github.io/)
- [SockJS Documentation](https://github.com/sockjs/sockjs-client)
