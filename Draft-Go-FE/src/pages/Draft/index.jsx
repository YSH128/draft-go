import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMyProfile } from "../../api/auth";
import { getAuctionState, placeBid } from "../../api/draft";
import ToastContainer from "../../components/ToastContainer";
import { getChatPublishPath, getChatTopic } from "../../constants/socket";
import useToast from "../../hooks/useToast";
import { buildWsUrl, createStompClient } from "../../libs/stomp";
import DraftLayout from "./components/DraftLayout";
import { AuctionSection, ChatSection, TeamSidebarSection } from "./sections";

const DEFAULT_TIER = "UNRANKED";
const BID_INCREMENT = 20;
const ROUND_SECONDS = 15;

// 백엔드에서 받은 queue 데이터를 UI용으로 변환
const normalizeQueue = (queue) =>
  (queue || []).map((member) => ({
    id: String(member.id),
    memberId: member.memberId,
    name: member.name,
    position: member.position,
    status: member.status,
    turnOrder: member.turnOrder ?? 0,
    tier: member.tier || DEFAULT_TIER,
    division: member.division,
    imageUrl: member.profileImageUrl,
  }));

// 팀 멤버로부터 포지션별 roster 구성
const buildRoster = (members = []) => {
  const roster = {};
  members.forEach((member) => {
    if (!member.position) return;
    roster[member.position] = {
      name: member.name,
      imageUrl: member.profileImageUrl,
      tier: member.tier || DEFAULT_TIER,
      division: member.division,
    };
  });
  return roster;
};

// 팀장 여부 확인
const isLeader = (member) => {
  if (!member) return false;
  return member.isLeader === true || member.leader === true;
};

// 백엔드 teams 데이터를 UI용으로 변환
const mapTeams = (teams) =>
  (teams || []).map((team) => {
    const leader = team.members?.find((m) => isLeader(m));
    return {
      id: String(team.teamId),
      name: team.teamName,
      captain: leader?.name || "알 수 없음",
      points: team.currentPoint ?? 0,
      roster: buildRoster(team.members || []),
    };
  });

export default function DraftPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get("draftId");
  const draftId = draftIdParam ? Number(draftIdParam) : null;
  const isValidDraftId = Number.isFinite(draftId) && draftId > 0;

  const [queue, setQueue] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentState, setCurrentState] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [messages, setMessages] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [myMemberId, setMyMemberId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");


  const { toasts, showToast, removeToast } = useToast();

  const wsClientRef = useRef(null);
  const timerStartRef = useRef({ time: Date.now(), baseSeconds: ROUND_SECONDS });


  const wsUrl = useMemo(
    () => buildWsUrl(import.meta.env.VITE_API_BASE_URL),
    [],
  );

  const queuePlayers = useMemo(() => normalizeQueue(queue), [queue]);

  const activeQueue = useMemo(
    () =>
      queuePlayers
        .filter(
          (player) =>
            player.status !== "SKIPPED" && player.status !== "COMPLETED",
        )
        .sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0)),
    [queuePlayers],
  );

  const passedQueue = useMemo(
    () =>
      queuePlayers
        .filter((player) => player.status === "SKIPPED")
        .sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0)),
    [queuePlayers],
  );

  const uiTeams = useMemo(() => mapTeams(teams), [teams]);

  // 내 팀 정보 찾기
  const myTeamInfo = useMemo(() => {
    if (!myMemberId) return null;

    for (const team of teams) {
      const myMember = team.members?.find((m) => m.memberId === myMemberId);
      if (myMember) {
        return {
          teamId: String(team.teamId),
          isLeader: isLeader(myMember),
        };
      }
    }
    return null;
  }, [myMemberId, teams]);

  const myTeamId = myTeamInfo?.teamId ?? null;
  const isMyLeader = myTeamInfo?.isLeader ?? false;
  const myTeam = useMemo(
    () => uiTeams.find((team) => team.id === myTeamId),
    [myTeamId, uiTeams],
  );
  const myTeamRoster = myTeam?.roster || {};

  // 현재 경매 진행 중인 선수 정보
  const currentPlayer = useMemo(() => {
    if (!currentState) return null;
    // 백엔드에서 제공하는 포지션 정보 우선 사용
    const position = currentState.position;
    const mainPosition = currentState.mainPosition;
    const subPosition = currentState.subPosition;
    const mostChampions = currentState.mostChampions || [];

    return {
      id: String(currentState.draftMemberId),
      name: currentState.playerName,
      imageUrl: currentState.playerProfileImageUrl,
      tier: currentState.tier || DEFAULT_TIER,
      division: currentState.division,
      positions: position ? [position] : [],
      mainPosition,
      subPosition,
      mostChampions,
      minBidPrice: currentState.minBidPrice ?? 0,
    };
  }, [currentState]);

  // 최소 입찰가 (currentState에서 직접 추출)
  const minBidPrice = useMemo(() => {
    if (!currentState) return 0;

    const minPrice = currentState.minBidPrice;

    // minBidPrice는 서버에서 항상 제공되어야 함 (null이면 에러)
    if (minPrice === null || minPrice === undefined) {
      console.error("❌ minBidPrice가 null입니다. 서버 응답 확인 필요:", currentState);
      return 0;
    }

    return minPrice;
  }, [currentState]);

  // 현재 선수의 포지션이 내 팀에 이미 있는지 확인
  const isPositionTaken = useMemo(() => {
    if (!currentState) return false;
    const position = currentState.position;
    return position ? Boolean(myTeamRoster[position]?.name) : false;
  }, [currentState, myTeamRoster]);

  // 초기 데이터 또는 수동 새로고침 시 상태 적용
  const applyInitialData = useCallback((data) => {
    console.log("초기 데이터 수신:", data);
    setCurrentState(data.currentRound);
    setCurrentBid(data.currentBid);
    setTimeLeft(data.remainingSeconds ?? ROUND_SECONDS);
    setActiveTeamId(
      data.currentBid?.teamId ? String(data.currentBid.teamId) : null,
    );
    setQueue(data.queue || []);
    setTeams(data.teams || []);
  }, []);

  const refreshAuctionState = useCallback(async () => {
    if (!isValidDraftId) return;
    try {
      const data = await getAuctionState(draftId);
      applyInitialData(data);
    } catch (error) {
      console.error("경매 상태 새로고침 실패:", error);
    }
  }, [applyInitialData, draftId, isValidDraftId]);

  const handleQueueUpdate = useCallback(
    (body) => {
      try {
        const queue = JSON.parse(body);
        setQueue(queue || []);
      } catch (error) {
        console.error("Queue 업데이트 실패:", error);
      }
    },
    [],
  );

  const handleTeamsUpdate = useCallback((body) => {
    try {
      const teams = JSON.parse(body);
      setTeams(teams || []);
    } catch (error) {
      console.error("Teams 업데이트 실패:", error);
    }
  }, []);

  // 채팅 메시지 수신 핸들러
  const handleChatMessage = useCallback((body) => {
    try {
      const message = JSON.parse(body);
      setMessages((prev) => [...prev, { ...message, id: Date.now() }]);

      // 시스템 메시지로 경매 종료 감지 (백엔드 AuctionFinishService 참조)
      if (
        message.type === "SYSTEM" &&
        message.content === "🎉 모든 경매가 종료되었습니다!"
      ) {
        console.log("드래프트 종료 이벤트(시스템 메시지) 수신");
        showToast("모든 경매가 종료되었습니다. 결과 페이지로 이동합니다.", "success");
        setTimeout(() => {
          navigate(`/result?draftId=${draftId}`);
        }, 2000);
      }
    } catch (error) {
      console.error("채팅 메시지 처리 실패:", error);
    }
  }, [draftId, navigate, showToast]);

  // WebSocket 이벤트 핸들러 - 백엔드 이벤트 타입에 맞춰 처리
  const handleAuctionEvent = useCallback((body) => {
    try {
      const event = JSON.parse(body);

      switch (event.type) {
        case "ROUND_START":
          // 새로운 라운드 시작 (RoundStartEventDto)
          console.log("라운드 시작 이벤트 수신:", event.data);
          setCurrentState(event.data.roundStatus);
          setCurrentBid(null);
          setActiveTeamId(null);
          setTimeLeft(ROUND_SECONDS);
          break;

        case "BID":
          // 입찰 발생 (BidEventDto)
          console.log("입찰 이벤트 수신:", event.data);
          setCurrentBid({ teamId: event.data.teamId, price: event.data.price });
          setActiveTeamId(String(event.data.teamId));
          if (typeof event.data.remainingSeconds === "number") {
            setTimeLeft(event.data.remainingSeconds);
          }
          break;

        case "ROUND_ENDED":
          // 라운드 종료 (RoundEndedEventDto)
          // isSuccessful: 낙찰 여부, teamId/price: 낙찰 정보 (유찰 시 null)
          console.log("라운드 종료 이벤트 수신:", event.data);
          setCurrentState(null);
          setCurrentBid(null);
          setActiveTeamId(null);
          setTimeLeft(0);
          // 향후 낙찰/유찰 효과 추가 시 event.data.isSuccessful 활용 가능
          break;

        default:
          console.warn("알 수 없는 경매 이벤트:", event.type);
      }
    } catch (error) {
      console.error("경매 이벤트 처리 실패:", error);
    }
  }, []);

  // 현재 내 팀의 보유 포인트
  const myTeamPoints = useMemo(() => {
    if (!myTeamId) return 0;
    const team = teams.find((t) => String(t.teamId) === myTeamId);
    return team?.currentPoint ?? 0;
  }, [myTeamId, teams]);

  // 다음 입찰가
  const nextBidPrice = useMemo(() => {
    const currentPrice = currentBid?.price ?? 0;
    const minPrice = minBidPrice ?? 0;

    // 아직 입찰이 없으면 (teamId가 없으면) 최소 입찰가부터 시작
    if (!currentBid?.teamId) {
      return minPrice;
    }

    // 입찰이 있으면 현재가 + 증분
    return currentPrice + BID_INCREMENT;
  }, [currentBid, minBidPrice]);

  // 입찰 가능 여부 검증
  const canBid = useMemo(() => {
    if (!isMyLeader) return false;
    if (!myTeamId) return false;
    if (isPositionTaken) return false;
    if (timeLeft <= 0) return false;
    if (nextBidPrice > myTeamPoints) return false;
    if (!currentState) return false;
    return true;
  }, [
    isMyLeader,
    isPositionTaken,
    myTeamId,
    timeLeft,
    nextBidPrice,
    myTeamPoints,
    currentState,
  ]);

  // 입찰 불가 사유
  const bidDisabledReason = useMemo(() => {
    if (!currentState) return "경매 대기 중입니다";
    if (!myTeamId) return "팀에 소속되어 있지 않습니다";
    if (!isMyLeader) return "팀장만 입찰할 수 있습니다";
    if (isPositionTaken) return "이미 해당 포지션 선수가 있습니다";
    if (timeLeft <= 0) return "입찰 시간이 종료되었습니다";
    if (nextBidPrice > myTeamPoints) return "포인트가 부족합니다";
    return null;
  }, [
    currentState,
    myTeamId,
    isMyLeader,
    isPositionTaken,
    timeLeft,
    nextBidPrice,
    myTeamPoints,
  ]);

  const handleBid = useCallback(async () => {
    if (!isValidDraftId) return;

    if (!canBid) {
      if (bidDisabledReason) {
        showToast(bidDisabledReason, "warning", 5000); // 경고는 5초
      }
      return;
    }

    try {
      await placeBid(draftId, Number(myTeamId), nextBidPrice);
      showToast("입찰이 완료되었습니다!", "success"); // 성공은 기본 3초
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        "입찰에 실패했습니다. 다시 시도해주세요.";
      showToast(serverMessage, "error", 5000); // 에러는 5초
    }
  }, [
    bidDisabledReason,
    canBid,
    draftId,
    isValidDraftId,
    myTeamId,
    nextBidPrice,
    showToast,
  ]);

  const handleSendMessage = useCallback(
    (content) => {
      const client = wsClientRef.current;
      if (!client) {
        showToast("메시지 전송에 실패했습니다.", "error");
        return;
      }
      const destination = getChatPublishPath(draftId);
      const payload = JSON.stringify({ content });
      const sent = client.send(destination, {}, payload);
      if (!sent) {
        showToast("메시지 전송에 실패했습니다.", "error");
      }
    },
    [draftId, showToast],
  );

  // 초기 데이터 로딩 - 통합 엔드포인트 사용
  useEffect(() => {
    if (!isValidDraftId) return;

    const loadInitialData = async () => {
      try {
        const [initialData, myProfileData] = await Promise.all([
          getAuctionState(draftId), // 통합 API: queue, teams, currentRound 등 모두 포함
          getMyProfile().catch(() => null),
        ]);

        // 초기 데이터 적용
        applyInitialData(initialData);
        setMyMemberId(myProfileData?.memberId ?? null);

        setIsLoading(false);
      } catch (error) {
        console.error("초기 데이터 로딩 실패:", error);
        setLoadError("데이터를 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [applyInitialData, draftId, isValidDraftId]);

  // WebSocket 연결 및 구독
  useEffect(() => {
    if (!isValidDraftId || !wsUrl) return;

    const client = createStompClient({
      url: wsUrl,
      onConnect: () => {
        client.subscribe(`/ws/auction/${draftId}`, handleAuctionEvent);
        client.subscribe(`/topic/auction/${draftId}/queue`, handleQueueUpdate);
        client.subscribe(`/topic/auction/${draftId}/teams`, handleTeamsUpdate);
        client.subscribe(getChatTopic(draftId), handleChatMessage);
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
    handleChatMessage,
    handleQueueUpdate,
    handleTeamsUpdate,
    isValidDraftId,
    refreshAuctionState,
    wsUrl,
  ]);

  // 페이지 포커스 시 상태 새로고침
  useEffect(() => {
    if (!isValidDraftId) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshAuctionState();
      }
    };

    const handleFocus = () => {
      refreshAuctionState();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isValidDraftId, refreshAuctionState]);

  // timeLeft가 변경될 때 타이머 기준점 업데이트 (서버에서 시간 갱신 시)
  useEffect(() => {
    timerStartRef.current = { time: Date.now(), baseSeconds: timeLeft };
  }, [timeLeft]);

  // 타이머 카운트다운 (0.1초 단위로 부드럽게, 서버 업데이트 반영)
  useEffect(() => {
    if (!currentState) return;

    const timer = setInterval(() => {
      const { time: startTime, baseSeconds } = timerStartRef.current;
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = baseSeconds - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(remaining);
      }
    }, 100); // 100ms마다 업데이트

    return () => clearInterval(timer);
  }, [currentState]);

  // 'B' 키로 빠른 입찰
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "b" || e.key === "B") {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          return;
        }
        handleBid();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBid]);

  if (!isValidDraftId) {
    return (
      <DraftLayout>
        <div className="text-primary/80 flex w-full items-center justify-center text-sm">
          draftId가 필요합니다. /draft?draftId=1 형식으로 접속해주세요.
        </div>
      </DraftLayout>
    );
  }

  if (loadError) {
    return (
      <DraftLayout>
        <div className="flex w-full items-center justify-center text-sm text-red-400">
          {loadError}
        </div>
      </DraftLayout>
    );
  }

  if (isLoading) {
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <TeamSidebarSection
        teams={uiTeams}
        activeTeamId={activeTeamId}
        myTeamId={myTeamId}
      />

      <AuctionSection
        player={currentPlayer}
        currentBid={currentBid?.price ?? 0}
        minBidPrice={minBidPrice}
        nextBidPrice={nextBidPrice}
        hasCurrentBid={!!currentBid?.teamId}
        timeLeft={timeLeft}
        bidIncrement={BID_INCREMENT}
        onBid={handleBid}
        canBid={canBid}
        bidDisabledReason={bidDisabledReason}
        queue={activeQueue}
        passedQueue={passedQueue}
      />

      <ChatSection
        messages={messages}
        viewerCount={2400}
        onSendMessage={handleSendMessage}
        myMemberId={myMemberId}
      />
    </DraftLayout>
  );
}
