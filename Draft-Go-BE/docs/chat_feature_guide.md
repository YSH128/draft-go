# 채팅 기능 구현 가이드

## 개요

Draft-Go 프로젝트에 실시간 단체 채팅 기능이 추가되었습니다. 로비와 경매 진행 중에 참가자들이 실시간으로 채팅할 수 있으며, 입장/퇴장/시스템 알림도 자동으로 전송됩니다.

## 구조

```
draft/
  └── chat/
      ├── dto/
      │   ├── ChatMessage.java              # 채팅 메시지 DTO
      │   └── request/
      │       └── ChatMessageRequest.java   # 채팅 전송 요청 DTO
      └── websocket/
          └── ChatWebSocketController.java  # WebSocket 컨트롤러
```

## 주요 기능

### 1. 일반 채팅 메시지
- 사용자가 직접 메시지를 전송
- 모든 참가자에게 실시간 브로드캐스트

### 2. 입장/퇴장 알림
- 참가자가 로비에 입장할 때 자동 알림
- 참가자가 로비를 퇴장할 때 자동 알림

### 3. 시스템 메시지
- 경매 시작/종료 시 자동 알림
- 중요한 이벤트 발생 시 시스템 메시지 전송

## API 명세

### WebSocket 구독

**경로**: `/topic/chat/{draftId}`

**메시지 타입**:
- `CHAT`: 일반 채팅
- `JOIN`: 입장 알림
- `LEAVE`: 퇴장 알림
- `SYSTEM`: 시스템 메시지

### 메시지 전송

**경로**: `/app/chat/{draftId}`

**요청 본문**:
```json
{
  "content": "메시지 내용 (최대 500자)"
}
```

**응답**: 없음 (브로드캐스트로 자동 전송)

## 메시지 형식

### 일반 채팅 메시지
```json
{
  "type": "CHAT",
  "senderId": 123,
  "senderNickname": "홍길동",
  "content": "안녕하세요!",
  "timestamp": "2026-01-26T15:30:00"
}
```

### 입장 알림
```json
{
  "type": "JOIN",
  "senderNickname": "홍길동",
  "content": "홍길동님이 입장했습니다.",
  "timestamp": "2026-01-26T15:30:00"
}
```

### 퇴장 알림
```json
{
  "type": "LEAVE",
  "senderNickname": "홍길동",
  "content": "홍길동님이 퇴장했습니다.",
  "timestamp": "2026-01-26T15:30:00"
}
```

### 시스템 메시지
```json
{
  "type": "SYSTEM",
  "content": "🎯 경매가 시작되었습니다!",
  "timestamp": "2026-01-26T15:30:00"
}
```

## 클라이언트 연동 예제

### JavaScript (SockJS + StompJS)

```javascript
// WebSocket 연결
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

// 연결 및 구독
stompClient.connect({}, function(frame) {
    console.log('Connected:', frame);
    
    // 채팅 구독
    stompClient.subscribe('/topic/chat/123', function(message) {
        const chatMessage = JSON.parse(message.body);
        displayChatMessage(chatMessage);
    });
});

// 채팅 메시지 전송
function sendChat(draftId, content) {
    if (!stompClient || !stompClient.connected) {
        console.error('Not connected');
        return;
    }
    
    stompClient.send(
        `/app/chat/${draftId}`,
        {},
        JSON.stringify({ content: content })
    );
}

// 채팅 메시지 표시
function displayChatMessage(chatMessage) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${chatMessage.type.toLowerCase()}`;
    
    let displayText = '';
    switch(chatMessage.type) {
        case 'CHAT':
            displayText = `[${chatMessage.senderNickname}] ${chatMessage.content}`;
            break;
        case 'JOIN':
        case 'LEAVE':
        case 'SYSTEM':
            displayText = chatMessage.content;
            break;
    }
    
    messageDiv.textContent = displayText;
    document.getElementById('chatMessages').appendChild(messageDiv);
}

// 연결 해제
function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
}
```

## 통합 시나리오

### 1. 로비 입장 시
1. 클라이언트가 `/api/v1/rooms/join` API 호출
2. `RoomService.joinToLobby()` 실행
3. Redis에 참가자 추가
4. 로비 이벤트 브로드캐스트 (`PARTICIPANT_JOINED`)
5. **채팅 입장 알림 자동 발송** ✨

### 2. 로비 퇴장 시
1. 클라이언트가 `/api/v1/drafts/{draftId}/lobby/kick` API 호출
2. `LobbyService.kickUser()` 실행
3. Redis에서 참가자 제거
4. 로비 이벤트 브로드캐스트 (`PARTICIPANT_LEFT`)
5. **채팅 퇴장 알림 자동 발송** ✨

### 3. 경매 시작 시
1. 관리자가 `/api/v1/drafts/{draftId}/lobby/start` API 호출
2. `LobbyService.startDraft()` 실행
3. 드래프트 상태를 `IN_DRAFT`로 변경
4. `AuctionService.startAuction()` 호출
5. **채팅 시스템 메시지 자동 발송** ✨ ("🎯 경매가 시작되었습니다!")

### 4. 경매 종료 시
1. 마지막 선수 경매 완료
2. `AuctionService.startAuction()` 내부 로직에서 종료 감지
3. DB에 최종 결과 저장
4. **채팅 시스템 메시지 자동 발송** ✨ ("🎉 모든 경매가 종료되었습니다!")

## 자동 알림 통합

채팅 컨트롤러는 다음 서비스들과 통합되어 있습니다:

### LobbyService
- `kickUser()`: 퇴장 시 채팅 알림 발송

### RoomService
- `joinToLobby()`: 입장 시 채팅 알림 발송

### AuctionService
- `startAuction()`: 경매 시작/종료 시 시스템 메시지 발송

## 테스트

### 테스트 페이지
브라우저에서 다음 URL로 접속하여 테스트할 수 있습니다:

```
http://localhost:8080/test-chat-websocket.html
```

### 테스트 시나리오

1. **기본 연결 테스트**
   - Draft ID 입력 후 연결 버튼 클릭
   - 연결 성공 메시지 확인

2. **채팅 메시지 전송**
   - 메시지 입력 후 전송 또는 Enter 키
   - 자신이 보낸 메시지가 화면에 표시되는지 확인

3. **다중 클라이언트 테스트**
   - 여러 브라우저 탭을 열어 동일한 Draft ID로 연결
   - 한 탭에서 메시지 전송 시 다른 탭에서도 수신되는지 확인

4. **입장/퇴장 알림 테스트**
   - 실제 API를 통해 로비 입장/퇴장
   - 채팅에 자동 알림이 표시되는지 확인

5. **시스템 메시지 테스트**
   - 경매 시작/종료
   - 시스템 메시지가 표시되는지 확인

## 제약사항

### 메시지 길이
- 최대 500자까지 전송 가능
- 초과 시 유효성 검증 오류 발생

### 인증
- WebSocket 연결 시 Spring Security를 통한 인증 필요
- `@CurrentMember`로 현재 사용자 정보 획득

### 브로드캐스트
- 같은 draftId를 구독하는 모든 클라이언트에게 메시지 전송
- 개인 메시지 기능은 현재 미지원

## 향후 개선 사항

1. **채팅 이력 저장**
   - 현재는 실시간 전송만 지원
   - Redis 또는 DB에 채팅 이력 저장 고려

2. **읽음/안읽음 표시**
   - 메시지 읽음 상태 추적

3. **개인 메시지**
   - 특정 사용자에게만 메시지 전송

4. **파일/이미지 공유**
   - 멀티미디어 컨텐츠 공유 기능

5. **스팸 방지**
   - 메시지 전송 빈도 제한
   - 부적절한 내용 필터링

## 문제 해결

### 메시지가 전송되지 않음
- WebSocket 연결 상태 확인
- 브라우저 콘솔에서 에러 메시지 확인
- STOMP 디버그 로그 활성화

### 메시지가 중복 수신됨
- 동일한 destination을 여러 번 구독하지 않았는지 확인
- 연결 해제 후 재연결 시도

### 인증 오류
- JWT 토큰이 유효한지 확인
- Spring Security 설정 확인

## 참고 문서

- [WebSocket 아키텍처 문서](./websocket_architecture.md)
- [Spring WebSocket Documentation](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [STOMP Protocol](https://stomp.github.io/)
