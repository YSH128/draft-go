import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DraftLayout from "./components/DraftLayout";
import { TeamSidebarSection, AuctionSection, ChatSection } from "./sections";
import { getAuctionState, getDraftQueue, getTeamInfos, placeBid, startAuction } from "../../api/draft";
import { getMyProfile } from "../../api/auth";
import { buildWsUrl, createStompClient } from "../../libs/stomp";
import ToastContainer from "../../components/ToastContainer";
import useToast from "../../hooks/useToast";

const DEFAULT_TIER = "UNRANKED";
const BID_INCREMENT = 20;
const ROUND_SECONDS = 30;

/**
 * 서버의 startedAt으로부터 남은 시간(초)을 계산
 * @param {string} startedAt - ISO 8601 형식의 시작 시간
 * @returns {number} 남은 초 (0 이상)
 */
const calculateRemainingSeconds = (startedAt) => {
  if (!startedAt) return ROUND_SECONDS;
  try {
    const startTime = new Date(startedAt).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    return Math.max(0, ROUND_SECONDS - elapsed);
  } catch {
    return ROUND_SECONDS;
  }
};

const MOCK_MESSAGES = [
  {
    type: "system",
    content: "드래프트가 시작되었습니다. 첫 번째 선수가 공개되었습니다.",
  },
  {
    type: "user",
    sender: "Blue Alpha",
    color: "blue",
    content: "이번 선수는 무조건 가져갑니다. 챌린저 미드 픽!",
  },
  {
    type: "user",
    sender: "Green Delta",
    color: "gold",
    content: "현재 가격 240P 입찰합니다.",
  },
  {
    type: "user",
    sender: "User_1029",
    color: "default",
    content: "저 팀 캡틴 진짜 빡세네 ㅋㅋ",
  },
];



const normalizeQueue = (queue) =>
  (queue || []).map((member) => ({
    id: String(member.id),
    memberId: member.memberId,
    name: member.name,
    position: member.position,
    status: member.status,
    turnOrder: member.turnOrder ?? 0,
    tier: member.tier || DEFAULT_TIER,
    division: member.division || null,
    rank: member.rank ?? null,
    imageUrl: member.profileImageUrl || null,
  }));

const buildRoster = (members = []) => {
  const roster = {};
  members.forEach((member) => {
    if (!member.position) return;
    roster[member.position] = {
      name: member.name,
      imageUrl: member.profileImageUrl || null,
      tier: member.tier || DEFAULT_TIER,
      division: member.division || null,
    };
  });
  return roster;
};

const isLeaderMember = (member) => {
  if (!member) return false;
  if (member.isLeader === true || member.leader === true) return true;
  const role = typeof member.role === "string" ? member.role.toUpperCase() : "";
  return role === "LEADER" || role === "CAPTAIN";
};

const normalizeMemberId = (member) => {
  const raw = member?.memberId ?? member?.id ?? member?.userId ?? null;
  return raw === null || raw === undefined ? null : String(raw);
};

const normalizeId = (value) => {
  if (value === null || value === undefined) return null;
  return String(value);
};

const getNextActiveQueueId = (queueList = []) => {
  const nextPlayer = queueList
    .filter((player) => {
      const status = String(player?.status || "").toUpperCase();
      return status !== "SKIPPED" && status !== "COMPLETED";
    })
    .sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0))[0];

  return normalizeId(nextPlayer?.id ?? nextPlayer?.memberId ?? nextPlayer?.draftMemberId);
};

const mapTeams = (teams) =>
  (teams || []).map((team) => {
    const leader = team.members?.find((member) => isLeaderMember(member));
    return {
      id: String(team.teamId),
      name: team.teamName,
      captain: leader?.name || "??",
      points: team.currentPoint ?? 0,
      roster: buildRoster(team.members || []),
    };
  });

export default function DraftPage() {
  const [searchParams] = useSearchParams();
  const draftIdParam = searchParams.get("draftId");
  const draftId = draftIdParam ? Number(draftIdParam) : null;
  const isValidDraftId = Number.isFinite(draftId) && draftId > 0;

  const [queue, setQueue] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentState, setCurrentState] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [myMemberId, setMyMemberId] = useState(null);
  const [myProfile, setMyProfile] = useState(null);
  const [isDraftEnded, setIsDraftEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const { toasts, showToast, removeToast } = useToast();

  const didStartAuction = useRef(false);
  const wsClientRef = useRef(null);
  const currentStateRef = useRef(null);
  const isDraftEndedRef = useRef(false);
  const timerStartRef = useRef(null);

  const wsUrl = useMemo(() => buildWsUrl(import.meta.env.VITE_API_BASE_URL), []);

  const queuePlayers = useMemo(() => normalizeQueue(queue), [queue]);

  const activeQueue = useMemo(
    () =>
      queuePlayers
        .filter((player) => player.status !== "SKIPPED" && player.status !== "COMPLETED")
        .sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0)),
    [queuePlayers]
  );

  const passedQueue = useMemo(
    () =>
      queuePlayers
        .filter((player) => player.status === "SKIPPED")
        .sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0)),
    [queuePlayers]
  );

  const uiTeams = useMemo(() => mapTeams(teams), [teams]);

  const profileTeamId = useMemo(
    () => normalizeId(myProfile?.teamId ?? myProfile?.team?.teamId ?? myProfile?.team?.id),
    [myProfile]
  );

  const profileIsLeader = useMemo(() => isLeaderMember(myProfile), [myProfile]);

  // 내 팀 찾기 (flatMap으로 팀-멤버 조합 생성 후 find)
  const myTeamInfo = useMemo(() => {
    if (!myMemberId && !profileTeamId) return null;

    if (teams.length === 0) {
      return profileTeamId ? { teamId: profileTeamId, isLeader: profileIsLeader } : null;
    }

    const teamMemberPairs = teams.flatMap((team) =>
      (team.members || []).map((member) => ({ team, member }))
    );

    const normalizedMyMemberId = myMemberId ? String(myMemberId) : null;
    if (normalizedMyMemberId) {
      const match = teamMemberPairs.find(
        (pair) => normalizeMemberId(pair.member) === normalizedMyMemberId
      );
      if (match) {
        return {
          teamId: String(match.team.teamId),
          isLeader: isLeaderMember(match.member) || profileIsLeader,
        };
      }
    }

    return profileTeamId ? { teamId: profileTeamId, isLeader: profileIsLeader } : null;
  }, [myMemberId, profileIsLeader, profileTeamId, teams]);

  const myTeamId = myTeamInfo?.teamId ?? null;
  const isLeader = myTeamInfo?.isLeader ?? false;
  const myTeam = useMemo(
    () => uiTeams.find((team) => String(team.id) === String(myTeamId)),
    [myTeamId, uiTeams]
  );
  const myTeamRoster = myTeam?.roster || {};

  const currentPlayer = useMemo(() => {
    if (!currentState) return null;
    const member = queuePlayers.find(
      (player) => player.id === String(currentState.draftMemberId)
    );
    const position = member?.position;
    return {
      id: currentState.draftMemberId ? String(currentState.draftMemberId) : "current",
      name: member?.name || currentState.playerName || "Unknown",
      imageUrl: member?.imageUrl || null,
      tier: member?.tier || DEFAULT_TIER,
      division: member?.division || null,
      positions: position ? [position] : [],
      mostChampions: [],
    };
  }, [currentState, queuePlayers]);

  const isPositionTaken = useMemo(() => {
    if (!currentPlayer?.positions || currentPlayer.positions.length === 0) return false;
    return currentPlayer.positions.some((pos) => {
      const key = String(pos || "").toUpperCase();
      return Boolean(myTeamRoster[key]?.name);
    });
  }, [currentPlayer?.positions, myTeamRoster]);

  const applyAuctionState = useCallback((stateData) => {
    const state = stateData?.state || null;
    setCurrentState(state);
    setCurrentBid(stateData?.currentBid || null);

    if (typeof stateData?.remainingSeconds === "number") {
      setTimeLeft(Math.max(0, stateData.remainingSeconds));
    } else if (state?.startedAt) {
      setTimeLeft(calculateRemainingSeconds(state.startedAt));
    } else {
      setTimeLeft(ROUND_SECONDS);
    }

    setActiveTeamId(stateData?.currentBid?.teamId ? String(stateData.currentBid.teamId) : null);
  }, []);

  const refreshAuctionState = useCallback(async () => {
    if (!isValidDraftId) return;
    try {
      const stateData = await getAuctionState(draftId);
      applyAuctionState(stateData);
    } catch (error) {
      console.error(error);
    }
  }, [applyAuctionState, draftId, isValidDraftId]);

  const handleQueueUpdate = useCallback((body) => {
    try {
      const parsed = JSON.parse(body);
      setQueue(parsed || []);

      if (isDraftEndedRef.current) return;
      const nextActiveId = getNextActiveQueueId(parsed || []);
      const currentActiveId = currentStateRef.current?.draftMemberId
        ? String(currentStateRef.current.draftMemberId)
        : null;
      if (nextActiveId && nextActiveId !== currentActiveId) {
        refreshAuctionState();
      }
    } catch (error) {
      console.error(error);
    }
  }, [refreshAuctionState]);

  const handleTeamsUpdate = useCallback((body) => {
    try {
      const parsed = JSON.parse(body);
      setTeams(parsed || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleAuctionEvent = useCallback((body) => {
    try {
      const event = JSON.parse(body);
      const eventType = String(event.type || "").toUpperCase();
      if (eventType === "NEW_BIDDING") {
        const state = event.data || event.state || null;
        setCurrentState(state);
        setCurrentBid(null);
        setActiveTeamId(null);
        // 서버의 startedAt 기반으로 남은 시간 계산
        const remaining = calculateRemainingSeconds(state?.startedAt);
        setTimeLeft(remaining);
        if (state?.startedAt) {
          timerStartRef.current = state.startedAt;
        }
      } else if (eventType === "BID") {
        setCurrentBid(event.data || null);
        setActiveTeamId(event.data?.teamId ? String(event.data.teamId) : null);
        if (typeof event.data?.remainingSeconds === "number") {
          const nextRemaining = Math.max(0, event.data.remainingSeconds);
          setTimeLeft(nextRemaining);
          const elapsed = Math.max(0, ROUND_SECONDS - nextRemaining);
          timerStartRef.current = new Date(Date.now() - elapsed * 1000).toISOString();
        } else {
          refreshAuctionState();
        }
      } else if (eventType === "TIME_OVER") {
        // 해당 선수 경매 종료 (유찰 또는 낙찰 완료)
        setCurrentState(null);
        setCurrentBid(null);
        setActiveTeamId(null);
        setTimeLeft(0);
        timerStartRef.current = null;
        refreshAuctionState();
      }

    } catch (error) {
      console.error(error);
    }
  }, [refreshAuctionState]);

  // 현재 내 팀의 보유 포인트
  const myTeamPoints = useMemo(() => {
    if (!myTeamId) return 0;
    const team = teams.find((t) => String(t.teamId) === myTeamId);
    return team?.currentPoint ?? 0;
  }, [myTeamId, teams]);

  // 다음 입찰가
  const nextBidPrice = useMemo(() => {
    return (currentBid?.price ?? 0) + BID_INCREMENT;
  }, [currentBid]);

  // 입찰 가능 여부 검증
  const canBid = useMemo(() => {
    if (!isLeader) return false;
    if (!myTeamId) return false;
    if (isPositionTaken) return false;
    if (timeLeft <= 0) return false;
    if (nextBidPrice > myTeamPoints) return false;
    if (isDraftEnded) return false;
    if (!currentState) return false;
    return true;
  }, [
    isLeader,
    isPositionTaken,
    myTeamId,
    timeLeft,
    nextBidPrice,
    myTeamPoints,
    isDraftEnded,
    currentState,
  ]);

  // 입찰 불가 사유
  const bidDisabledReason = useMemo(() => {
    if (isDraftEnded) return "드래프트가 종료되었습니다";
    if (!currentState) return "경매 대기 중입니다";
    if (!myTeamId) return "팀에 소속되어 있지 않습니다";
    if (!isLeader) return "팀장만 입찰할 수 있습니다";
    if (isPositionTaken) return "이미 해당 포지션 선수가 있습니다";
    if (timeLeft <= 0) return "입찰 시간이 종료되었습니다";
    if (nextBidPrice > myTeamPoints) return "포인트가 부족합니다";
    return null;
  }, [
    isDraftEnded,
    currentState,
    myTeamId,
    isLeader,
    isPositionTaken,
    timeLeft,
    nextBidPrice,
    myTeamPoints,
  ]);

  const handleBid = useCallback(async () => {
    if (!isValidDraftId) return;

    if (!canBid) {
      if (bidDisabledReason) {
        showToast(bidDisabledReason, 'warning', 5000); // 경고는 5초
      }
      return;
    }

    try {
      await placeBid(draftId, Number(myTeamId), nextBidPrice);
      showToast('입찰이 완료되었습니다!', 'success'); // 성공은 기본 3초
    } catch (error) {
      const serverMessage =
        error.response?.data?.message || "입찰에 실패했습니다. 다시 시도해주세요.";
      showToast(serverMessage, 'error', 5000); // 에러는 5초
    }
  }, [bidDisabledReason, canBid, draftId, isValidDraftId, myTeamId, nextBidPrice, showToast]);

  const handleSendMessage = useCallback((content) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        sender: "나",
        color: "gold",
        content,
      },
    ]);
  }, []);

  useEffect(() => {
    if (!isValidDraftId) return;

    const loadInitialData = async () => {
      try {
        const [stateData, queueData, teamData, myProfileData] = await Promise.all([
          getAuctionState(draftId),
          getDraftQueue(draftId),
          getTeamInfos(draftId),
          getMyProfile().catch(() => null),
        ]);

        const state = stateData?.state || null;
        applyAuctionState(stateData);
        setQueue(queueData || []);
        setTeams(teamData || []);
        setMyMemberId(myProfileData?.memberId ?? null);
        setMyProfile(myProfileData ?? null);

        if (!state && !didStartAuction.current) {
          didStartAuction.current = true;
          await startAuction(draftId);
        }

        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setLoadError("데이터를 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [applyAuctionState, draftId, isValidDraftId]);

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
        console.error(event);
      },
    });

    wsClientRef.current = client;

    return () => {
      wsClientRef.current?.disconnect();
      wsClientRef.current = null;
    };
  }, [draftId, handleAuctionEvent, handleQueueUpdate, handleTeamsUpdate, isValidDraftId, wsUrl]);

  useEffect(() => {
    currentStateRef.current = currentState;
  }, [currentState]);

  useEffect(() => {
    isDraftEndedRef.current = isDraftEnded;
  }, [isDraftEnded]);

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

  // currentState 변경 시 타이머 시작 시점 기록
  useEffect(() => {
    if (currentState?.startedAt) {
      timerStartRef.current = currentState.startedAt;
    }
  }, [currentState]);

  // 타이머 카운트다운 - 1초마다 서버 시간 기준으로 계산
  useEffect(() => {
    if (!currentState || isDraftEnded) return undefined;

    const timer = setInterval(() => {
      const remaining = calculateRemainingSeconds(timerStartRef.current);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentState, isDraftEnded]);

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
        <div className="flex w-full items-center justify-center text-sm text-primary/80">
          draftId가 필요합니다. /draft?draftId=1 형식으로 접속해주세요.
        </div>
      </DraftLayout>
    );
  }

  if (isDraftEnded) {
    return (
      <DraftLayout>
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <h2 className="text-3xl font-bold text-primary">드래프트 종료</h2>
          <p className="text-primary-bright/70">모든 선수의 경매가 완료되었습니다.</p>
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
            <div className="size-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="text-sm text-primary/70">드래프트 정보를 불러오는 중...</p>
          </div>
        </div>
      </DraftLayout>
    );
  }

  return (
    <DraftLayout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <TeamSidebarSection teams={uiTeams} activeTeamId={activeTeamId} myTeamId={myTeamId} />

      <AuctionSection
        player={currentPlayer}
        currentBid={currentBid?.price ?? 0}
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
      />
    </DraftLayout>
  );
}
