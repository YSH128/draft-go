import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 채팅 관련 상태와 로직을 관리하는 Hook
 * @param {string} userId - 현재 사용자 ID
 * @returns {Object} 채팅 상태와 핸들러
 */
export const useLobbyChat = (userId) => {
    const [messages, setMessages] = useState([]);
    const chatContainerRef = useRef(null);

    // 채팅 자동 스크롤
    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, []);

    // 메시지가 추가되면 자동 스크롤
    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // WebSocket 메시지 수신 핸들러
    const handleChatMessage = useCallback((message) => {
        setMessages((prev) => {
            const newMsg = {
                id: Date.now(),
                sender: message.senderNickname || "알 수 없음",
                message: message.content,
                variant: message.senderId === userId ? "me" : "other",
                timestamp: message.timestamp
                    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: message.type,
            };
            return [...prev, newMsg];
        });
    }, [userId]);

    return {
        messages,
        setMessages,
        chatContainerRef,
        scrollToBottom,
        handleChatMessage,
    };
};
