import { useEffect, useRef, useCallback } from 'react';
import useChatStore from '../stores/useChatStore';
import { createStompClient, buildWsUrl } from '../libs/stomp';
import { getChatTopic, getChatPublishPath } from '../constants/socket';

/**
 * 채팅 전용 소켓 훅
 * - UnifiedChat 컴포넌트와 함께 사용
 * - 페이지 이동 시에도 끊김 없는 경험 제공 (Store 연동)
 */
export const useChatSocket = (draftId) => {
  const clientRef = useRef(null);
  
  // Store Actions
  const { 
    addMessage, 
    setConnected, 
    setDraftId,
    isConnected 
  } = useChatStore();

  const handleChatMessage = useCallback((body) => {
    try {
      const message = JSON.parse(body);
      addMessage(message);
    } catch (e) {
      console.error('[ChatSocket] Message parse error:', e);
    }
  }, [addMessage]);

  const connect = useCallback(() => {
    if (!draftId) return;

    // 이미 연결된 상태이고, 클라이언트가 존재하면 재연결 하지 않음
    // (단, 페이지 이동 시 unmount -> mount 되므로 ref는 초기화됨. 
    //  따라서 매번 연결을 시도하되, Store의 isConnected 상태를 업데이트함)
    
    // Store에 현재 방 ID 설정 (변경 시 메시지 초기화 로직 존재)
    setDraftId(draftId);

    const wsUrl = buildWsUrl(import.meta.env.VITE_API_BASE_URL);
    if (!wsUrl) return;

    const client = createStompClient({
      url: wsUrl,
      onConnect: () => {
        console.log(`[ChatSocket] Connected to draft ${draftId}`);
        setConnected(true);
        
        // 구독
        client.subscribe(getChatTopic(draftId), handleChatMessage);
      },
      onError: (err) => {
        console.error('[ChatSocket] Connection error:', err);
        setConnected(false);
      },
    });

    clientRef.current = client;

  }, [draftId, handleChatMessage, setConnected, setDraftId]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
      setConnected(false);
    }
  }, [setConnected]);

  const sendMessage = useCallback((content) => {
    const client = clientRef.current;
    if (!client || !content.trim()) return false;

    const destination = getChatPublishPath(draftId);
    const payload = JSON.stringify({ content });
    return client.send(destination, {}, payload);
  }, [draftId]);

  // 라이프사이클 관리
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { 
    sendMessage,
    isConnected 
  };
};
