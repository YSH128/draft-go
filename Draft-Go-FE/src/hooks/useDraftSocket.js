import { useEffect, useMemo, useRef } from "react";
import { buildWsUrl, createStompClient } from "../libs/stomp";

export const useDraftSocket = (
  draftId,
  {
    handleAuctionEvent,
    handleQueueUpdate,
    handleTeamsUpdate,
    refreshAuctionState,
  },
) => {
  const wsClientRef = useRef(null);
  const isValidDraftId = Number.isFinite(draftId) && draftId > 0;

  const wsUrl = useMemo(
    () => buildWsUrl(import.meta.env.VITE_API_BASE_URL),
    [],
  );

  useEffect(() => {
    if (!isValidDraftId || !wsUrl) return;

    const client = createStompClient({
      url: wsUrl,
      onConnect: () => {
        client.subscribe(`/ws/auction/${draftId}`, handleAuctionEvent);
        client.subscribe(`/topic/auction/${draftId}/queue`, handleQueueUpdate);
        client.subscribe(`/topic/auction/${draftId}/teams`, handleTeamsUpdate);
        refreshAuctionState();
      },
      onError: (event) => {
        console.error("WebSocket 연결 오류:", event);
      },
    });

    wsClientRef.current = client;

    return () => {
      wsClientRef.current?.disconnect();
      wsClientRef.current = null;
    };
  }, [
    draftId,
    handleAuctionEvent,
    handleQueueUpdate,
    handleTeamsUpdate,
    isValidDraftId,
    refreshAuctionState,
    wsUrl,
  ]);
};
