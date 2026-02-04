import { useEffect } from "react";
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

  // 2. Draft Socket Hook
  useDraftSocket(draftId, {
    handleAuctionEvent: game.handleAuctionEvent,
    handleQueueUpdate: game.handleQueueUpdate,
    handleTeamsUpdate: game.handleTeamsUpdate,
    refreshAuctionState: game.refreshAuctionState,
  });

  // 3. Chat System
  const { messages } = useChatStore();
  const { sendMessage } = useChatSocket(draftId);

  // 시스템 메시지 감지 (경매 종료 -> 결과 페이지 이동)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg?.type === "SYSTEM" &&
      lastMsg?.content === "🎉 모든 경매가 종료되었습니다!"
    ) {
      console.log("드래프트 종료 이벤트(시스템 메시지) 수신");
      game.showToast(
        "모든 경매가 종료되었습니다. 결과 페이지로 이동합니다.",
        "success",
      );
      setTimeout(() => {
        navigate(`/result?draftId=${draftId}`);
      }, 2000);
    }
  }, [messages, draftId, navigate, game.showToast]);

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
