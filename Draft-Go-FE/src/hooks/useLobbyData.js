  import { useQuery } from '@tanstack/react-query';
  import { getDraftLobby } from '../api/draft';

  /**
   * 드래프트 로비 데이터를 가져오는 커스텀 훅
   * TanStack Query를 사용하여 서버 상태 관리
   * 
   * @param {number|string} draftId - 드래프트 ID
   * @returns {Object} TanStack Query의 useQuery 결과 { data, isLoading, isError, error, refetch }
   */
  export const useLobbyData = (draftId) => {
    return useQuery({
      queryKey: ['lobbyData', Number(draftId)],
      queryFn: () => getDraftLobby(draftId),
      enabled: !!draftId,
      staleTime: Infinity, // 소켓으로만 데이터 갱신 (자동 refetch 방지)
      gcTime: 1000 * 60 * 5, // 5분간 캐시 유지 (v5에서 cacheTime → gcTime)
    });
  };
