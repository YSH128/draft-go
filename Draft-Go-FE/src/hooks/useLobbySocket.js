import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createStompClient, buildWsUrl } from '../libs/stomp';
import { LOBBY_SOCKET_EVENTS, getLobbyTopic, getChatTopic, getChatPublishPath } from '../constants/socket';

/**
 * 드래프트 로비 WebSocket 연결 및 이벤트 처리를 담당하는 커스텀 훅
 *
 * 주요 기능:
 * 1. STOMP 클라이언트 생성 및 토픽 구독
 * 2. 이벤트 타입별 분기 처리
 * 3. DRAFT_STARTED → 경매 페이지로 라우팅
 * 4. 기타 이벤트 → Query 무효화하여 데이터 refetch
 * 5. 채팅 메시지 구독 및 전송
 *
 * @param {number|string} draftId - 드래프트 ID
 * @param {Function} onLobbyEnded - 로비 종료 콜백
 * @param {Function} onChatMessage - 채팅 메시지 수신 콜백
 */
export const useLobbySocket = (draftId, onLobbyEnded, onChatMessage) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clientRef = useRef(null);

  /**
   * 소켓 메시지 핸들러
   * 이벤트 타입에 따라 적절한 액션 수행
   */
  const handleSocketMessage = useCallback((messageBody) => {
    try {
      // 메시지 파싱 (문자열 or 객체)
      const payload = typeof messageBody === 'string' 
        ? JSON.parse(messageBody) 
        : messageBody;
      
      const { eventType } = payload;


      // 이벤트 분기 처리
      switch (eventType) {
        case LOBBY_SOCKET_EVENTS.DRAFT_STARTED:
          // 드래프트 시작 → 경매 페이지로 라우팅
          navigate(`/draft?draftId=${draftId}`);
          break;

        case LOBBY_SOCKET_EVENTS.DRAFT_DESTROYED:
          if (onLobbyEnded) onLobbyEnded();
          break;

        // 데이터 갱신이 필요한 모든 이벤트
        case LOBBY_SOCKET_EVENTS.PARTICIPANT_JOINED:
        case LOBBY_SOCKET_EVENTS.PARTICIPANT_LEFT:
        case LOBBY_SOCKET_EVENTS.ROLE_CHANGED:
        case LOBBY_SOCKET_EVENTS.POSITION_CHANGED:
        case LOBBY_SOCKET_EVENTS.READY_STATUS_CHANGED:
        case LOBBY_SOCKET_EVENTS.LEADER_POINT_CHANGED:
        case LOBBY_SOCKET_EVENTS.INVITE_CODE_REFRESHED:
        case LOBBY_SOCKET_EVENTS.REFRESH_REQUIRED:
          queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('❌ [LobbySocket] Message handling error:', error);
    }
  }, [draftId, navigate, onLobbyEnded, queryClient]);

  useEffect(() => {
    if (!draftId) return;

    // WebSocket URL 생성
    const wsUrl = buildWsUrl(import.meta.env.VITE_API_BASE_URL);
    if (!wsUrl) {
      console.error('[LobbySocket] Failed to build WebSocket URL');
      return;
    }



    // STOMP 클라이언트 생성
    const client = createStompClient({
      url: wsUrl,
      onConnect: () => {
        // 로비 토픽 구독: /topic/lobby/{draftId}
        client.subscribe(getLobbyTopic(draftId), handleSocketMessage);

        // 채팅 토픽 구독: /topic/chat/{draftId}
        const chatTopic = getChatTopic(draftId);
        client.subscribe(chatTopic, (body) => {
          if (onChatMessage) {
            try {
              const message = JSON.parse(body);
              onChatMessage(message);
            } catch (e) {
              console.error('[LobbySocket] Chat message parse error:', e);
            }
          }
        });
      },
      onError: (error) => {
        console.error('❌ [LobbySocket] Connection error:', error);
      },
    });

    clientRef.current = client;

    // Cleanup: 언마운트 시 연결 해제
    return () => {
      client?.disconnect();
      clientRef.current = null;
    };
  }, [draftId, handleSocketMessage, onChatMessage]);

  /**
   * 채팅 메시지 전송
   * @param {string} content - 메시지 내용
   */
  const sendChatMessage = useCallback((content) => {
    const client = clientRef.current;
    if (!client) {
      return false;
    }
    const destination = getChatPublishPath(draftId);
    const payload = JSON.stringify({ content });
    const result = client.send(destination, {}, payload);
    return result;
  }, [draftId]);

  return { sendChatMessage };
};

