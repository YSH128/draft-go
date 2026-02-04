import { create } from 'zustand';

/**
 * 전역 채팅 스토어
 * Lobby -> Draft -> Result 페이지 간 채팅 내역 유지
 */
const useChatStore = create((set, get) => ({
  // State
  messages: [],       // 채팅 메시지 배열
  isConnected: false, // 소켓 연결 상태
  draftId: null,      // 현재 드래프트 ID

  // Actions
  
  // 메시지 추가
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, msg] 
  })),

  // 메시지 전체 설정 (초기화 등)
  setMessages: (msgs) => set({ messages: msgs }),

  // 메시지 비우기
  clearMessages: () => set({ messages: [] }),

  // 연결 상태 변경
  setConnected: (status) => set({ isConnected: status }),

  // 드래프트 ID 설정 (ID가 변경되면 메시지 초기화 여부 결정)
  setDraftId: (id) => {
    const currentId = get().draftId;
    
    // ID가 바뀌면 (새로운 방 입장)
    if (currentId !== null && currentId !== id) {
      // 기존 메시지 초기화 (또는 시스템 메시지로 구분선 추가 가능)
      // 여기서는 깔끔하게 초기화하는 정책을 기본으로 함
      set({ 
        draftId: id,
        messages: [],
        isConnected: false 
      });
    } else {
      // 첫 진입이거나 같은 방인 경우 ID만 업데이트
      set({ draftId: id });
    }
  },

  // 시스템 메시지 추가 편의 함수
  addSystemMessage: (content) => {
    const sysMsg = {
      type: 'SYSTEM',
      content,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    get().addMessage(sysMsg);
  }
}));

export default useChatStore;
