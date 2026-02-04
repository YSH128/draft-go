import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMyProfile } from "../api/auth";
import { getAuctionState, placeBid } from "../api/draft";
import {
  DEFAULT_TIER,
  isLeader,
  mapTeams,
  normalizeQueue,
} from "../utils/draftUtils";
import useToast from "./useToast";

const BID_INCREMENT = 20;
const ROUND_SECONDS = 15;

export const useAuctionGame = (draftId) => {
  const isValidDraftId = Number.isFinite(draftId) && draftId > 0;
  console.log("🪝 useAuctionGame Init:", { draftId, isValidDraftId });

  const [queue, setQueue] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentState, setCurrentState] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [myMemberId, setMyMemberId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  console.log("🪝 useAuctionGame State:", { isLoading, loadError, queueLen: queue.length });

  const { toasts, showToast, removeToast } = useToast();
  const timerStartRef = useRef({ time: Date.now(), baseSeconds: ROUND_SECONDS });

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

  // 최소 입찰가
  const minBidPrice = useMemo(() => {
    return currentState?.minBidPrice ?? 0;
  }, [currentState]);

  // 포지션 점유 여부
  const isPositionTaken = useMemo(() => {
    if (!currentState) return false;
    const position = currentState.position;
    return position ? Boolean(myTeamRoster[position]?.name) : false;
  }, [currentState, myTeamRoster]);

  // 초기 데이터 적용
  const applyInitialData = useCallback((data) => {
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

  const handleQueueUpdate = useCallback((body) => {
    try {
      const queue = JSON.parse(body);
      setQueue(queue || []);
    } catch (error) {
      console.error("Queue 업데이트 실패:", error);
    }
  }, []);

  const handleTeamsUpdate = useCallback((body) => {
    try {
      const teams = JSON.parse(body);
      setTeams(teams || []);
    } catch (error) {
      console.error("Teams 업데이트 실패:", error);
    }
  }, []);

  const handleAuctionEvent = useCallback((body) => {
    try {
      const event = JSON.parse(body);
      switch (event.type) {
        case "ROUND_START":
          setCurrentState(event.data.roundStatus);
          setCurrentBid(null);
          setActiveTeamId(null);
          setTimeLeft(ROUND_SECONDS);
          break;
        case "BID":
          setCurrentBid({ teamId: event.data.teamId, price: event.data.price });
          setActiveTeamId(String(event.data.teamId));
          if (typeof event.data.remainingSeconds === "number") {
            setTimeLeft(event.data.remainingSeconds);
          }
          break;
        case "ROUND_ENDED":
          setCurrentState(null);
          setCurrentBid(null);
          setActiveTeamId(null);
          setTimeLeft(0);
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
    if (!currentBid?.teamId) {
      return minPrice;
    }
    return currentPrice + BID_INCREMENT;
  }, [currentBid, minBidPrice]);

  // 입찰 가능 여부
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
        showToast(bidDisabledReason, "warning", 5000);
      }
      return;
    }

    try {
      await placeBid(draftId, Number(myTeamId), nextBidPrice);
      showToast("입찰이 완료되었습니다!", "success");
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        "입찰에 실패했습니다. 다시 시도해주세요.";
      showToast(serverMessage, "error", 5000);
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

  // 초기 데이터 로딩
  useEffect(() => {
    if (!isValidDraftId) return;

    const loadInitialData = async () => {
      try {
        const [initialData, myProfileData] = await Promise.all([
          getAuctionState(draftId),
          getMyProfile().catch(() => null),
        ]);

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

  // timeLeft 기준점 업데이트
  useEffect(() => {
    timerStartRef.current = { time: Date.now(), baseSeconds: timeLeft };
  }, [timeLeft]);

  // 타이머 카운트다운
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
    }, 100);

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

  return {
    queue,
    teams,
    currentState,
    currentBid,
    timeLeft,
    activeTeamId,
    myMemberId,
    isLoading,
    loadError,
    uiTeams,
    myTeamId,
    myTeamPoints,
    currentPlayer,
    minBidPrice,
    nextBidPrice,
    canBid,
    bidDisabledReason,
    activeQueue,
    passedQueue,
    toasts,
    showToast,
    removeToast,
    handleBid,
    handleQueueUpdate,
    handleTeamsUpdate,
    handleAuctionEvent,
    refreshAuctionState,
    BID_INCREMENT,
  };
};
