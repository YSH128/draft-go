import { useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import UnifiedChat from "../../components/chat/UnifiedChat";
import ToastContainer from "../../components/ToastContainer";
import { useAuctionGame } from "../../hooks/useAuctionGame";
import { useChatSocket } from "../../hooks/useChatSocket";
import { useDraftSocket } from "../../hooks/useDraftSocket";
import useChatStore from "../../stores/useChatStore";
import DraftLayout from "./components/DraftLayout";
import { AuctionSection, TeamSidebarSection } from "./sections";

export default function DraftPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get("draftId");
  const draftId = draftIdParam ? Number(draftIdParam) : null;
  const isValidDraftId = Number.isFinite(draftId) && draftId > 0;

  // 1. Game Logic Hook
  const game = useAuctionGame(draftId);
  console.log("🚩 DraftPage Render Start", { draftId, game });

  // 백엔드 이벤트 기반 드래프트 상태 관리
  // 백엔드에서 /ws/auction/{draftId} 토픽으로 AUCTION_ENDED 이벤트 전송
  // 이벤트 구조: { type: "AUCTION_ENDED", data: { draftId, message } }
  const handleAuctionEventWithStatus = useCallback((body) => {
    try {
      const event = typeof body === 'string' ? JSON.parse(body) : body;
      
      // AUCTION_ENDED 이벤트 처리
      if (event.type === "AUCTION_ENDED") {
        console.log("[Draft] 모든 경매 종료 이벤트 수신");
        game.showToast(
          "모든 경매가 종료되었습니다. 결과 페이지로 이동합니다.",
          "success",
        );
        setTimeout(() => {
          navigate(`/result?draftId=${draftId}`);
        }, 2000);
      } else {
        // 다른 경매 이벤트는 기존 핸들러로 전달
        game.handleAuctionEvent(body);
      }
    } catch (error) {
      console.error("[Draft] 경매 이벤트 처리 실패:", error);
    }
  }, [draftId, navigate, game.showToast, game.handleAuctionEvent]); // game 대신 필요한 메서드만
  // 2. Draft Socket Hook
  useDraftSocket(draftId, {
    handleAuctionEvent: handleAuctionEventWithStatus, // 경매 + AUCTION_ENDED 이벤트 처리
    handleQueueUpdate: game.handleQueueUpdate,
    handleTeamsUpdate: game.handleTeamsUpdate,
    refreshAuctionState: game.refreshAuctionState,
  });

  // 3. Chat System
  const { messages } = useChatStore();
  const { sendMessage } = useChatSocket(draftId);

  // NOTE: 채팅 메시지는 로비 → 드래프트 → 결과 페이지까지 이어져야 함
  // clearMessages()를 호출하지 않음!

  // 4. Highest Bidder
  const highestBidderInfo = useMemo(() => {
    if (!game.activeTeamId) return { name: null, color: null };
    const team = game.uiTeams.find((t) => t.id === game.activeTeamId);
    return {
      name: team ? team.captain : null,
      color: team ? team.color : null,
    };
  }, [game.activeTeamId, game.uiTeams]);

  // NOTE: 기존 시스템 메시지 감지 방식은 제거됨
  // 이유: 채팅 메시지로 상태를 판단하는 것은 불안정하며,
  //      이전 경매의 메시지가 남아있을 경우 오작동 가능

  if (!isValidDraftId) {
    return (
      <DraftLayout>
        <div className="flex w-full min-h-screen items-center justify-center text-white text-xl font-bold bg-black/50">
          ⚠️ draftId가 필요합니다. /draft?draftId=1 형식으로 접속해주세요.
        </div>
      </DraftLayout>
    );
  }

  if (game.loadError) {
    return (
      <DraftLayout>
        <div className="flex w-full items-center justify-center text-sm text-red-400">
          {game.loadError}
        </div>
      </DraftLayout>
    );
  }

  if (game.isLoading) {
    return (
      <DraftLayout>
        <div className="flex w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="border-primary/30 border-t-primary size-12 animate-spin rounded-full border-4" />
            <p className="text-primary/70 text-sm">
              드래프트 정보를 불러오는 중...
            </p>
          </div>
        </div>
      </DraftLayout>
    );
  }

  return (
    <DraftLayout>
      <ToastContainer toasts={game.toasts} removeToast={game.removeToast} />

      <div className="flex h-full w-full">
        {/* 왼쪽: 팀 리스트 */}
        <aside className="w-[320px] flex-shrink-0 border-r border-white/10 overflow-y-auto no-scrollbar relative">
          <TeamSidebarSection
            teams={game.uiTeams}
            activeTeamId={game.activeTeamId}
            myTeamId={game.myTeamId}
          />
        </aside>

        {/* 중앙: 경매/대기열 */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <AuctionSection
            player={game.currentPlayer}
            currentBid={game.currentBid?.price ?? 0}
            minBidPrice={game.minBidPrice}
            nextBidPrice={game.nextBidPrice}
            hasCurrentBid={!!game.currentBid?.teamId}
            timeLeft={game.timeLeft}
            bidIncrement={game.BID_INCREMENT}
            onBid={game.handleBid}
            canBid={game.canBid}
            bidDisabledReason={game.bidDisabledReason}
            queue={game.activeQueue}
            passedQueue={game.passedQueue}
            highestBidderName={highestBidderInfo.name}
            highestBidderColor={highestBidderInfo.color}
          />
        </main>

        {/* 오른쪽: 채팅 */}
        <aside className="w-[280px] flex-shrink-0 border-l border-white/10">
          <UnifiedChat
            className="h-full"
            viewerCount={2400}
            onSendMessage={sendMessage}
          />
        </aside>
      </div>

      {/* 로비로 나가기 버튼 (Fixed) */}
      <div className="fixed bottom-5 left-5 z-50">
        <button
          onClick={() => navigate(ROUTES.HOME)}
          className="group flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white/60 transition-all duration-200 hover:border-primary/50 hover:bg-black/80 hover:text-white backdrop-blur-sm"
          title="로비로 나가기"
        >
          <span className="material-symbols-outlined text-lg transition-colors group-hover:text-primary">
            logout
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest transition-colors group-hover:text-primary">
            EXIT
          </span>
        </button>
      </div>
    </DraftLayout>
  );
}
