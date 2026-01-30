import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import * as DraftApi from "../../api/draft"; 

import TeamLeaderCard from "../../components/ui/TeamLeaderCard";
import PositionIcon from "../../components/ui/PositionIcon";
import ChatBubble from "../../components/ui/ChatBubble";
import ChatInput from "../../components/ui/ChatInput";
import SectionTitle from "../../components/ui/SectionTitle";
import Button from "../../components/ui/Button";
import CreateDraftModal from "../../components/ui/CreateDraftModal";
import CodeGenerationModal from "../../components/ui/CodeGenerationModal";
import TeamLeaderSettingsModal from "../../components/ui/TeamLeaderSettingsModal";
import ParticipantProfileModal from  "../../components/ui/ParticipantProfileModal";
import KickConfirmModal from "../../components/ui/KickConfirmModal";
import AlertModal from '../../components/ui/AlertModal';
import Badge from "../../components/ui/Badge";
import StatsDashboard from "../../components/ui/StatsDashboard";
import DraftPoolColumn from "../../components/ui/DraftPoolColumn";
import useAuthStore from "../../stores/useAuthStore";
import { useLobbyData } from "../../hooks/useLobbyData";
import { useLobbySocket } from "../../hooks/useLobbySocket";

// 포지션 매핑 함수 (API ↔ UI 변환)
const mapPositionToAPI = (position) => {
    const mapping = { 'JNG': 'JUNGLE', 'ADC': 'BOT' };
    return mapping[position] || position;
};


const mapPositionToUI = (position) => {
    const mapping = { 'JUNGLE': 'JNG', 'BOT': 'ADC' };
    return mapping[position] || position;
};

// Tier text color mapping
const TIER_TEXT_COLORS = {
    challenger: "text-[var(--color-tier-challenger-text)]",
    grandmaster: "text-[var(--color-tier-grandmaster-text)]",
    master: "text-[var(--color-tier-master-text)]",
    diamond: "text-[var(--color-tier-diamond-text)]",
    emerald: "text-[var(--color-tier-emerald-text)]",
    platinum: "text-[var(--color-tier-platinum-text)]",
    gold: "text-[var(--color-tier-gold-text)]",
    silver: "text-[var(--color-tier-silver-text)]",
    bronze: "text-[var(--color-tier-bronze-text)]",
    iron: "text-[var(--color-tier-iron-text)]",
    manager: "text-[#666]",
    observer: "text-[#666]"
};

const getTierTextClass = (tier) => {
    if (!tier) return "text-[#bab29c]";
    const tierLower = tier.toLowerCase();
    return TIER_TEXT_COLORS[tierLower] || `text-[var(--color-tier-${tierLower}-text)]`;
};

// Tier score calculation constants and functions
const TIER_ORDER = ["iron", "bronze", "silver", "gold", "platinum", "emerald", "diamond", "master", "grandmaster", "challenger"];
const DIV_MAP = { "I": 3, "II": 2, "III": 1, "IV": 0, "i": 3, "ii": 2, "iii": 1, "iv": 0 };
const DIV_REVERSE = ["IV", "III", "II", "I"];

const getTierScore = (tierStr, divisionStr) => {
    if (!tierStr) return 0;
    
    const tier = tierStr.toLowerCase();
    const div = divisionStr || (TIER_ORDER.indexOf(tier) >= 7 ? "I" : "IV");
    
    const tierIdx = TIER_ORDER.indexOf(tier);
    if (tierIdx === -1) return 0;

    let score = tierIdx * 4;
    
    if (tierIdx >= 7) {
         return score; 
    }

    score += (DIV_MAP[div] !== undefined ? DIV_MAP[div] : 0);
    return score;
};

const getTierFromScore = (score) => {
    const tierIdx = Math.floor(score / 4);
    const divScore = Math.round(score % 4);
    
    const clampedTierIdx = Math.max(0, Math.min(tierIdx, TIER_ORDER.length - 1));
    const tierName = TIER_ORDER[clampedTierIdx];
    const baseTierName = tierName.charAt(0).toUpperCase() + tierName.slice(1);
    
    if (clampedTierIdx >= 7) {
        return { 
            name: baseTierName, 
            baseTier: baseTierName,
            color: getTierTextClass(tierName) 
        }; 
    }
    
    const divStr = DIV_REVERSE[divScore] || "IV";
    
    return { 
        name: `${baseTierName} ${divStr}`,
        division: divStr,
        baseTier: baseTierName, 
        color: getTierTextClass(tierName)
    };
};

const calculateAverageTier = (participants) => {
    if (!participants || participants.length === 0) return { name: "Unranked", baseTier: "Unranked", color: "text-[#666]" };
    
    let sum = 0;
    let count = 0;
    
    participants.forEach(p => {
        if (p.tier && p.tier !== "Unranked") {
           sum += getTierScore(p.tier, p.division);
           count++;
        }
    });

    if (count === 0) return { name: "Unranked", baseTier: "Unranked", color: "text-[#666]" };
    
    const avg = Math.round(sum / count);
    return getTierFromScore(avg);
};



export default function DraftLobby() {
  const { user } = useAuthStore(); // 현재 유저
  const { draftId } = useParams(); 
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // ========== TanStack Query & WebSocket ==========
  // 서버 데이터 가져오기 (실시간 동기화)
  const { data: rawData, isLoading, isFetching, isError } = useLobbyData(draftId);

  // DEBUG: Check raw data structure
  useEffect(() => {
    if (rawData) console.log('🔍 [DraftLobby] RAW DATA:', rawData);
  }, [rawData]);
  
  // WebSocket 연결 및 이벤트 리스닝
  // WebSocket 연결 및 이벤트 리스닝
  const handleLobbyEnded = useCallback(() => {
      console.warn('Draft deleted by host. Showing alert.');
      setIsLobbyClosedAlertOpen(true);
  }, []);

  useLobbySocket(draftId, handleLobbyEnded);
  
  // ========== Local State (UI only) ==========
  const [isEditDraftModalOpen, setIsEditDraftModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const [isKickedAlertOpen, setIsKickedAlertOpen] = useState(false);
  const [isLobbyClosedAlertOpen, setIsLobbyClosedAlertOpen] = useState(false);
  const [isDestroyConfirmOpen, setIsDestroyConfirmOpen] = useState(false);
  const [isUpdateSuccessOpen, setIsUpdateSuccessOpen] = useState(false);
  const isSelfLeavingRef = useRef(false); // Track if user is leaving voluntarily


  const chatContainerRef = useRef(null);
  const refreshedProfilesRef = useRef(JSON.parse(sessionStorage.getItem('refreshedProfiles') || '{}')); // Cache from Session Storage



  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  // ========== Derived State from Query Data ==========
  // 서버 데이터를 UI 형식으로 변환 (useMemo로 최적화)
  const data = useMemo(() => {
    if (!rawData) return null;
    
    // DraftList에서 추가 정보 병합 (필요시)
    return rawData;
  }, [rawData]);

  // ========== Auto-redirect when kicked from lobby ==========
  useEffect(() => {
    // 데이터가 로딩 중이거나 없으면 리다이렉트 하지 않음
    // invalidateQueries 후 refetch 중일 때(isRefetching/isFetching)도 기다려야 함
    if (isLoading || isFetching || !data || !user?.id) {
        return;
    }

    const myId = Number(user.id);
    
    // Check if current user exists in any participant list
    const isInLeaders = data.leaders?.some(leader => Number(leader.id) === myId) || false;
    const isInMembers = Array.isArray(data.members) 
      ? data.members.some(member => Number(member.id) === myId)
      : (data.members ? Object.values(data.members).flat().some(member => Number(member.id) === myId) : false);

    const isInObservers = data.observers?.some(obs => Number(obs.id) === myId) || false;

    // If user is not found in any list
    if (!isInLeaders && !isInMembers && !isInObservers) {
      if (isSelfLeavingRef.current) {
          // Voluntarily leaving (handled by confirmKick navigation)
          return;
      }

      console.warn('[DraftLobby] User not found (Kicked by Admin). Showing alert...');
      setIsKickedAlertOpen(true);
    }
  }, [data, user, navigate, isLoading, isFetching]);


  // Lobby Title
  const lobbyTitle = useMemo(() => {
    if (!data) return "대회 로비";
    return data.title || "대회 로비";
  }, [data]);

  // Codes
  const codes = useMemo(() => {
    if (!data) return { teamLeaderCode: '', teamMemberCode: '' };
    
    // API 응답 구조에 맞게 필드명 매핑
    const leaderCode = data.teamLeaderCode || data.leaderCode || data.codes?.teamLeaderCode || '';
    const memberCode = data.teamMemberCode || data.memberCode || data.codes?.teamMemberCode || '';
    
    return {
      teamLeaderCode: leaderCode,
      teamMemberCode: memberCode
    };
  }, [data]);


  
  const userRole = useMemo(() => {
    if (!data || !user?.id) return "MEMBER";
    
    const myId = user.id;
    const leaders = Array.isArray(data.leaders) ? data.leaders : [];
    const members = Array.isArray(data.members) ? data.members : [];
    const observers = data.observers || [];
    
    // 팀장 여부
    if (leaders.some(l => Number(l.id) === Number(myId))) {
      return "CAPTAIN";
    }
    
    // 팀원 여부
    if (members.some(m => Number(m.id) === Number(myId))) {
      return "CREW";
    }
    
    // 관전자 여부
    if (observers.some(o => Number(o.id) === Number(myId))) {
      return "SPECTATOR";
    }
    
    // 호스트 여부 확인
    const hasAdminCodes = data.codes && (data.codes.teamLeaderCode || data.codes.teamMemberCode);
    const ownerIdValue = data.ownerId || data.hostId || data.masterId;
    const isExplicitOwner = ownerIdValue && Number(ownerIdValue) === Number(myId);
    const isOwner = isExplicitOwner || !!hasAdminCodes;
    
    if (isOwner) return "ADMIN";
    
    return "MEMBER";
  }, [data, user?.id]);
  
  const isHost = useMemo(() => {
    if (!data || !user?.id) return false;
    
    const hasAdminCodes = data.codes && (data.codes.teamLeaderCode || data.codes.teamMemberCode);
    const ownerIdValue = data.ownerId || data.hostId || data.masterId;
    const isExplicitOwner = ownerIdValue && Number(ownerIdValue) === Number(user.id);
    
    return isExplicitOwner || !!hasAdminCodes;
  }, [data, user?.id]);

  const captains = useMemo(() => {
    if (!data) return [];
    
    const leaders = Array.isArray(data.leaders) ? data.leaders : [];
    const myId = user?.id;
    
    return leaders.map((leader, index) => {
      const baseData = {
        id: leader.id,
        name: leader.name,
        tier: leader.tier,
        division: leader.division,
        teamNumber: index + 1,
        image: leader.profileIcon || "",
        ready: leader.isReady,
        selectedRole: mapPositionToUI(leader.position),
        isSelf: Number(leader.id) === Number(myId),
        points: leader.leaderPoint || 0, // 포인트 정보: 순수 leaderPoint 값만 사용 (기본값 0)
        leaderPoint: leader.leaderPoint || 0,
        loading: false,
        role: 'MID',
        mainPosition: leader.mainPosition,
        subPosition: leader.subPosition,
        mostChampions: leader.mostChampions,
        lp: leader.leaguePoints,
        gameName: leader.gameName,
        tagLine: leader.tagLine,
        level: leader.summonerLevel,
        winRate: leader.winRate,
        recent20: leader.recentStats,
        memberId: leader.memberId || leader.id,
        lastUpdated: leader.updatedAt || leader.lastUpdated
      };
      
      // 캐시된 전적 데이터 적용
      const cached = refreshedProfilesRef.current[leader.memberId] || refreshedProfilesRef.current[leader.id];
      if (cached) {
        return { ...baseData, ...cached };
      }
      return baseData;
    });
  }, [data, user?.id]);
  
  const draftPool = useMemo(() => {
    if (!data) return { TOP: [], JNG: [], MID: [], ADC: [], SUP: [], SPECTATOR: [] };
    
    const newPool = { TOP: [], JNG: [], MID: [], ADC: [], SUP: [], SPECTATOR: [] };
    const members = Array.isArray(data.members) ? data.members : [];
    const myId = user?.id;
    
    members.forEach(member => {
      const uiPosition = mapPositionToUI(member.position);
      if (newPool[uiPosition]) {
        let memberData = {
          id: member.id,
          name: member.name,
          tier: member.tier,
          division: member.division,
          color: getTierTextClass(member.tier),
          lp: member.leaguePoints,
          isSelf: Number(member.id) === Number(myId),
          image: member.profileIcon,
          mainPosition: member.mainPosition,
          subPosition: member.subPosition,
          mostChampions: member.mostChampions,
          gameName: member.gameName,
          tagLine: member.tagLine,
          level: member.summonerLevel,
          winRate: member.winRate,
          recent20: member.recentStats,
          memberId: member.memberId || member.id,
          lastUpdated: member.updatedAt || member.lastUpdated
        };
        
        const cached = refreshedProfilesRef.current[member.memberId] || refreshedProfilesRef.current[member.id];
        if (cached) {
          memberData = { ...memberData, ...cached };
        }
        
        newPool[uiPosition].push(memberData);
      }
    });
    
    // 관전자 추가
    if (data.observers) {
      // 팀장 목록에 있는 유저는 관전자 목록에서 제외 (중복 표시 방지)
      const leaderIds = new Set((data.leaders || []).map(l => Number(l.id)));
      
      newPool.SPECTATOR = data.observers
        .filter(obs => !leaderIds.has(Number(obs.id))) // 팀장인 경우 관전자 목록에서 제외
        .map(obs => {
        let obsData = {
          id: obs.id,
          name: obs.name,
          tier: "Obs",
          color: "text-gray-500",
          isSelf: Number(obs.id) === Number(myId),
          mainPosition: obs.mainPosition,
          subPosition: obs.subPosition,
          mostChampions: obs.mostChampions,
          gameName: obs.gameName,
          tagLine: obs.tagLine,
          level: obs.summonerLevel,
          winRate: obs.winRate,
          recent20: obs.recentStats,
          memberId: obs.memberId || obs.id,
          lastUpdated: obs.updatedAt || obs.lastUpdated
        };
        
        const cached = refreshedProfilesRef.current[obs.memberId] || refreshedProfilesRef.current[obs.id];
        if (cached) {
          obsData = { ...obsData, ...cached };
        }
        return obsData;
      });
    }
    
    return newPool;
  }, [data, user?.id]);

  // Helper: Fetch & Calculate Stats (Logic reuse)
  // Defined before useEffect that uses it to avoid initialization errors
  const updateMemberStats = useCallback(async (targetId, showNotification = false) => {
      try {
         await DraftApi.refreshMemberData(targetId);
         const memberProfile = await DraftApi.getMemberProfile(targetId);
         
         // Get History & Calculate
         const historyResponse = await DraftApi.getMatchHistory(targetId, 0, 20);
         const history = Array.isArray(historyResponse) ? historyResponse : (historyResponse.content || []);

         let recentWins = 0;
         let recentLosses = 0;

         const targetGameName = memberProfile.gameName;
         const targetTagLine = memberProfile.tagLine;
         const normalize = (str) => str ? str.toLowerCase().replace(/\s/g, '') : '';
         const targetNameNorm = normalize(targetGameName);
         const targetTagNorm = normalize(targetTagLine);

         history.slice(0, 20).forEach((match) => {
            if (!match.participants) return;
            const myParticipant = match.participants.find(p => {
                const pName = p.gameName || p.summonerName;
                const pTag = p.tagLine;
                const nameMatch = normalize(pName) === targetNameNorm;
                const tagMatch = pTag ? normalize(pTag) === targetTagNorm : true; 
                return nameMatch && tagMatch;
            });
            if (myParticipant) {
                 const isWin = myParticipant.win === true || myParticipant.win === 'true';
                 if (isWin) recentWins++;
                 else recentLosses++;
            }
         });

         const stats = memberProfile.stats || {};
         const freshTime = memberProfile.updatedAt || memberProfile.lastUpdated || new Date().toISOString();

         const newData = {
            lastUpdated: freshTime,
            tier: stats.tier || "Unranked",
            division: stats.division,
            leaguePoints: stats.leaguePoints || 0,
            lp: stats.leaguePoints || 0, 
            winRate: stats.winRate || 0,
            recentStats: { wins: recentWins, losses: recentLosses },
            recent20: { wins: recentWins, losses: recentLosses },
            mostChampions: (memberProfile.mostChampions || []).map(c => ({
                name: c.championName,
                games: c.totalGames,
                winRate: c.winRate,
                kda: c.kda,
                imageUrl: c.imageUrl || `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/${c.championName}.png` 
            })),
            gameName: memberProfile.gameName,
            tagLine: memberProfile.tagLine,
            profileIcon: memberProfile.profileIconUrl || "",
            image: memberProfile.profileIconUrl || "",
            
            // Extra fields for UI mapping
            summonerName: memberProfile.gameName || memberProfile.username,
            profileIconUrl: memberProfile.profileIconUrl || "",
            level: memberProfile.summonerLevel || 0,
            mainPosition: memberProfile.mainPosition,
            subPosition: memberProfile.subPosition,
            memberId: memberProfile.memberId || memberProfile.id,
            id: memberProfile.memberId || memberProfile.id
         };

         // Cache Update
         refreshedProfilesRef.current[targetId] = newData;
         sessionStorage.setItem('refreshedProfiles', JSON.stringify(refreshedProfilesRef.current));

         // Query를 무효화하여 서버에서 최신 데이터 가져오기
         queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });

         if (showNotification) {
             alert('전적 갱신이 완료되었습니다.');
         }

         return newData;
      } catch (error) {
         console.error(`[UpdateStats] Failed for ${targetId}:`, error);
         throw error;
      }
  }, [draftId, queryClient]);

  // [REMOVED] Auto-refresh logic - Server provides up-to-date stats from signup
  // Manual refresh is still available via ParticipantProfileModal button

  // Handle Refresh Code
  const handleRefreshCode = async (type) => {
      try {
          const codeType = type === 'LEADER' ? 'LEADER' : 'MEMBER';
          const targetId = draftId || 1;
          await DraftApi.refreshInviteCode(targetId, codeType);
          // 데이터 갱신 (WebSocket 이벤트로 자동 갱신되지만, 명시적 호출)
          queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
      } catch (error) {
          console.error("Code refresh failed:", error);
          alert("초대 코드 갱신 실패");
      }
  };

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSettingsCaptain, setSelectedSettingsCaptain] = useState(null);
  

  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);


  const handleKickClick = (target, isSelf = false) => {
    setKickTarget({ ...target, isSelf });
    setIsKickModalOpen(true);
  };

  const confirmKick = async () => {
    if (!kickTarget) return;
    try {
        const targetId = draftId || 1;
        
        // Self Leave Logic
        if (kickTarget.isSelf) {
            isSelfLeavingRef.current = true; // Mark as self-initiated leave
            
            console.log('[DraftLobby] Self leave initiated. isHost:', isHost, 'userRole:', userRole, 'kickTarget:', kickTarget);

            // 관리자가 나가는 경우 -> 방 삭제
            if (isHost || userRole === 'ADMIN') {
                 console.log('[DraftLobby] Host is leaving -> Deleting Draft');
                 try {
                     await DraftApi.deleteDraft(draftId);
                     console.log('[DraftLobby] Delete request success');
                 } catch (err) {
                     console.error('[DraftLobby] Delete request failed:', err);
                 }
                 // 방이 삭제되면 소켓 이벤트(DRAFT_DELETED)가 발생하거나,
                 // 백엔드에서 처리가 늦을 수 있으므로 바로 나감
                 navigate('/');
            } else {
                 await DraftApi.kickParticipant(targetId, kickTarget.id);
                 navigate('/');
            }
            return;
        }

        // Kick Others
        await DraftApi.kickParticipant(targetId, kickTarget.id);
        
        // Refresh UI
        queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
        
    } catch (error) {
        console.error("Kick failed:", error);
        alert("퇴장 처리에 실패했습니다.");
    } finally {
        setIsKickModalOpen(false);
        setKickTarget(null);
    }
  };


  const totalParticipants = captains.filter(c => c.name).length + 
    Object.entries(draftPool).reduce((acc, [role, players]) => role === 'SPECTATOR' ? acc : acc + players.length, 0);


  const handleRoleSelect = async (captainId, role) => {
    try {
        const targetId = draftId || 1;
        await DraftApi.changePosition(targetId, {
            targetUserId: captainId,
            position: mapPositionToAPI(role)
        });
        // WebSocket 이벤트로 자동 갱신됨
        queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
    } catch (e) {
        console.error("Failed to change position:", e);
        alert("포지션 변경에 실패했습니다.");
    }
  };

  const handleDestroyDraft = async () => {
    try {
        await DraftApi.destroyDraft(draftId);
        setIsDestroyConfirmOpen(false);
        // 성공 메시지는 WebSocket 이벤트로 처리됨
        // 방장도 DRAFT_DESTROYED 이벤트를 받아 홈으로 이동함
    } catch (error) {
        console.error('[DraftLobby] Destroy draft failed:', error);
        setIsDestroyConfirmOpen(false);
        
        const errorMessage = error.response?.data?.message || '로비 닫기에 실패했습니다.';
        alert(errorMessage);
    }
  };

  const handleReadyToggle = async (captainId) => {
    try {
        const targetId = draftId || 1;
        const captain = captains.find(c => c.id === captainId);

        // 포지션 미선택 시 준비 불가 (준비 상태로 변경하려는 경우만)
        if (!captain.ready && !captain.selectedRole) {
            alert('포지션을 먼저 선택해주세요.');
            return;
        }
        // 팀장이 아닌 경우, 팀원 풀에 있는 경우에만 준비 가능
        if (userRole === "CREW") {
            const myMember = Object.values(draftPool).flat().find(m => m.id === user.id);
            if (!myMember || !myMember.mainPosition) {
                alert('팀원은 포지션을 선택해야 준비할 수 있습니다.');
                return;
            }
        }

        await DraftApi.toggleReady(targetId, !captain.ready);
        queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
    } catch (e) {
        console.error("Ready toggle failed:", e);
        alert("준비 상태 변경 실패: " + (e.response?.data?.message || e.message));
    }
  };

  const handleOpenSettings = (captain) => {
    setSelectedSettingsCaptain(captain);
    setIsSettingsModalOpen(true);
  };

  const handleOpenProfile = (participant) => {
    console.log('handleOpenProfile called:', participant, 'userRole:', userRole);

      const profileData = {
        summonerName: participant.name,
        gameName: participant.gameName || participant.name,
        tagLine: participant.tagLine,
        profileIconUrl: participant.image || "",
        tier: participant.tier,
        division: participant.division,
        lp: participant.lp || 0,
        level: participant.level || 0,
        winRate: participant.winRate || 0,
        recent20: participant.recent20 || { wins: 0, losses: 0 },
        mostChampions: participant.mostChampions || [],
        mainPosition: participant.mainPosition,
        subPosition: participant.subPosition,
        lastUpdated: participant.lastUpdated, // API provision needed
        memberId: participant.memberId // 전적 갱신용
      };
      setSelectedParticipant(profileData);
      setIsProfileModalOpen(true);
  };

  const handleRefreshProfile = async () => {
    if (!selectedParticipant || (!selectedParticipant.memberId && !selectedParticipant.id)) {
        alert('전적 갱신에 필요한 정보가 없습니다.');
        return;
    }
    const targetId = selectedParticipant.memberId || selectedParticipant.id;

    try {
        const newData = await updateMemberStats(targetId, true);
        setSelectedParticipant(newData);
    } catch (error) {
        console.error('Profile refresh failed:', error);
    }
  };

  const handleSaveSettings = async (captainId, newData) => {
      // Team Leader Settings (Points)
      try {
          const targetId = draftId || 1;
          
          if (captainId === 'new') {
              // '팀장 추가' 기능은 API 명세에 'change-role' (MEMBER->LEADER)로 구현됨.
              // 모달에서 이름을 선택해서 넘기는 경우라면...
              // 1. 해당 유저가 Pool에 있어야 함.
              // 2. 그 유저의 ID를 알아내서 changeRole 호출
              // 현재 UI 흐름상 '이름'으로 매칭해야 함.
              const poolList = Object.values(draftPool).flat();
              const targetUser = poolList.find(p => p.name === newData.name);
              
              if (targetUser) {
                  // 관전자를 팀장으로 승격하는 경우, 먼저 일반 포지션으로 변경
                  // draftPool.SPECTATOR에 있는지 확인
                  const isObserver = draftPool.SPECTATOR.some(obs => obs.id === targetUser.id);
                  
                  if (isObserver) {
                      console.log(`[AddCaptain] Observer -> Leader: Changing position from OBSERVER to TOP first`);
                      await DraftApi.changePosition(targetId, {
                          targetUserId: targetUser.id,
                          position: 'TOP' // Default position for new leader
                      });
                  }
                  
                  await DraftApi.changeRole(targetId, {
                      targetUserId: targetUser.id,
                      role: 'LEADER'
                  });
                   // 포인트 설정도 같이 해야한다면? API 분리됨. 후속 호출.
                  if (newData.points !== undefined) {
                       await DraftApi.setLeaderPoint(targetId, {
                           leaderId: targetUser.id,
                           point: Number(newData.points)
                       });
                  }
                   queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
               }
          } else {
              // 기존 팀장 수정
              const currentCaptain = captains.find(c => c.id === captainId);
              const isNameChanged = currentCaptain && currentCaptain.name !== newData.name;

              if (isNameChanged) {
                  // 1. Identify New User from Pool
                  // 이름으로 유저 찾기 (Pool 전체 검색)
                  const poolList = Object.values(draftPool).flat();
                  const newCaptainUser = poolList.find(p => p.name === newData.name);

                  if (!newCaptainUser) {
                      alert(`'${newData.name}' 참가자를 찾을 수 없습니다.`);
                      return;
                  }

                  // 2. Demote Old Captain (LEADER -> MEMBER)
                  await DraftApi.changeRole(targetId, {
                      targetUserId: captainId,
                      role: 'MEMBER'
                  });

                  // 3. 관전자를 팀장으로 승격하는 경우, 먼저 일반 포지션으로 변경
                  // draftPool.SPECTATOR에 있는지 확인
                  const isNewCaptainObserver = draftPool.SPECTATOR.some(obs => obs.id === newCaptainUser.id);
                  
                  if (isNewCaptainObserver) {
                      console.log(`[ChangeCaptain] Observer -> Leader: Changing position from OBSERVER to TOP first`);
                      await DraftApi.changePosition(targetId, {
                          targetUserId: newCaptainUser.id,
                          position: 'TOP' // Default position for new leader
                      });
                  }

                  // 4. Promote New Captain (MEMBER -> LEADER)
                  await DraftApi.changeRole(targetId, {
                      targetUserId: newCaptainUser.id,
                      role: 'LEADER'
                  });

                  // 4. Update Points for New Captain
                  if (newData.point !== undefined) {
                      await DraftApi.setLeaderPoint(targetId, {
                          leaderId: newCaptainUser.id,
                          point: Number(newData.point)
                      });
                  }
              } else {
                  // 이름 변경 없음 -> 포인트만 수정
                  await DraftApi.setLeaderPoint(targetId, {
                      leaderId: captainId, // captainId is userId here
                      point: Number(newData.point)
                  });
              }
               queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
           }
      } catch (e) {
          console.error("Save settings failed:", e);
      }
      setIsSettingsModalOpen(false);
  };

  /* Drag & Drop Logic Replacement with API */
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    // ID 파싱 (draggableId: 'captain-123' or 'player-Name' -> 실제 ID 필요)
    // DroppableId 파싱 (captain-slot-1, pool-TOP)
    
    const targetId = draftId || 1;
    const isSourceCaptain = source.droppableId.startsWith('captain-slot');
    const isDestCaptain = destination.droppableId.startsWith('captain-slot');
    
    // 1. Captain <-> Captain (Swap) -> Not Supported by Backend yet? (Client only reorder or ignore)
    if (isSourceCaptain && isDestCaptain) return;

    try {
        // 2. Pool -> Captain (Promotion)
        // changeRole(LEADER)
        if (!isSourceCaptain && isDestCaptain) {
            // draggableId에서 ID 추출: "player-{id}"
            const playerId = result.draggableId.replace('player-', '');
            if (!playerId) return;

            // 목표 슬롯 인덱스 추출 (captain-slot-0, captain-slot-1, ...)
            const slotIndex = destination.droppableId.split('-')[2];
            
            // 해당 슬롯에 이미 팀장이 있는지 확인
            const existingCaptain = captains[slotIndex];
            
            // 드래그한 참가자의 원래 위치 확인
            const sourceRole = source.droppableId.split('-')[1]; // TOP, JNG, MID, ADC, SUP, SPECTATOR
            
            console.log('[DragDrop] Pool -> Captain slot:', {
                slotIndex,
                newLeaderId: playerId,
                sourceRole,
                existingCaptain: existingCaptain,
                hasExisting: existingCaptain && existingCaptain.id
            });

            // 슬롯에 이미 팀장이 있다면, 기존 팀장을 먼저 강등
            if (existingCaptain && existingCaptain.id) {
                console.log(`[DragDrop] Demoting existing captain ${existingCaptain.id} to MEMBER`);
                await DraftApi.changeRole(targetId, {
                    targetUserId: Number(existingCaptain.id),
                    role: 'MEMBER'
                });
            }

            // 관전자를 팀장으로 승격하는 경우, 먼저 일반 포지션으로 변경
            if (sourceRole === 'SPECTATOR') {
                console.log(`[DragDrop] Observer -> Leader: Changing position from OBSERVER to TOP first`);
                await DraftApi.changePosition(targetId, {
                    targetUserId: Number(playerId),
                    position: 'TOP' // Default position for new leader
                });
            }

            // 새 팀원을 팀장으로 승격
            console.log(`[DragDrop] Promoting member ${playerId} to LEADER`);
            await DraftApi.changeRole(targetId, {
                targetUserId: Number(playerId),
                role: 'LEADER'
            });
            
            queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
            return;
        }

        // 3. Captain -> Pool (Demotion)
        // changeRole(MEMBER)
        if (isSourceCaptain && !isDestCaptain) {
             // draggableId에서 ID 추출: "captain-{id}"
             const captainId = result.draggableId.replace('captain-', '');
             if (!captainId) return;
             
             const targetRole = destination.droppableId.split('-')[1];

             // Case: Captain -> Spectator
             if (targetRole === 'SPECTATOR') {
                // Demote first (LEADER -> MEMBER)
                await DraftApi.changeRole(targetId, {
                    targetUserId: Number(captainId),
                    role: 'MEMBER'
                });
                // Then set Position to OBSERVER
                await DraftApi.changePosition(targetId, {
                    targetUserId: Number(captainId),
                    position: 'OBSERVER'
                });
             } else {
                 // Normal Demotion to Pool (MEMBER) with Position Change
                 console.log(`[DragDrop] Captain -> Pool: Demoting ${captainId} to ${targetRole}`);
                 
                 // Demote first (LEADER -> MEMBER)
                 await DraftApi.changeRole(targetId, {
                     targetUserId: Number(captainId),
                     role: 'MEMBER'
                 });
                 
                 // Set position to target role (TOP, JNG, MID, ADC, SUP)
                 await DraftApi.changePosition(targetId, {
                     targetUserId: Number(captainId),
                     position: mapPositionToAPI(targetRole)
                 });
             }
             queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
             return;
        }

        // 4. Pool -> Pool (Change Position)
        // changePosition (or changeRole if Spectator)
        if (!isSourceCaptain && !isDestCaptain) {
             const targetRole = destination.droppableId.split('-')[1]; // TOP, JNG...
             const sourceRole = source.droppableId.split('-')[1];

             if (sourceRole === targetRole) return; 

             // draggableId에서 ID 추출
             const playerId = result.draggableId.replace('player-', '');
             if (!playerId) return;

             // Logic Switch: Spectator is a Role, not a Position
             // [REVISED] Spectator as a Position (OBSERVER)
             if (targetRole === 'SPECTATOR') {
                 // Case 1: Pool Member -> Spectator
                 await DraftApi.changePosition(targetId, {
                     targetUserId: Number(playerId),
                     position: 'OBSERVER'
                 });
             } else {
                 await DraftApi.changePosition(targetId, {
                     targetUserId: Number(playerId),
                     position: mapPositionToAPI(targetRole)
                 });
             }
             queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
             return;
        }
    } catch (e) {
        console.error("Drag Drop Action Failed:", e);
        const errorCode = e.response?.data?.errorCode;
        const errorMessage = e.response?.data?.message;

        if (errorCode === 'MAX_TEAM_COUNT_EXCEEDED') {
            alert('팀장 인원이 가득 찼습니다.');
        } else if (errorCode === 'LEADER_CANNOT_BE_OBSERVER') {
            alert('팀장은 관전자가 될 수 없습니다.');
        } else {
             // Fallback for legacy messages if needed
            if (errorMessage?.includes('팀장') && errorMessage?.includes('관전자')) {
                alert('팀장은 관전자가 될 수 없습니다.');
            } else if (errorMessage?.includes('팀장') && (errorMessage?.includes('최대') || errorMessage?.includes('가득'))) {
                alert('팀장 인원이 가득 찼습니다.');
            } else {
                alert('작업에 실패했습니다: ' + (errorMessage || '알 수 없는 오류'));
            }
        }
    }
  };

   const handleJoinPool = async (targetRole) => {
       // API Call for changing position
       try {
           const targetId = draftId || 1;
           const myId = user?.id;
           
           if (!myId) {
               alert("로그인이 필요합니다.");
               return;
           }

           console.log('[handleJoinPool] 포지션 변경 요청:', { targetRole, myId, draftId: targetId });

            // 관전자(SPECTATOR)로 이동하는 경우
            if (targetRole === 'SPECTATOR') {
                console.log('[handleJoinPool] 관전자로 포지션 변경 시도 (OBSERVER)');
                
                // 만약 현재 팀장(Captain)이라면, 먼저 팀장직을 내려놓아야 함 (MEMBER로 변경)
                // 그래야 백엔드 leaders 리스트에서 제거되어 중복 표시가 방지됨
                if (userRole === 'CAPTAIN') {
                    console.log('[handleJoinPool] 팀장이 관전자로 이동 -> MEMBER로 강등 먼저 수행');
                    await DraftApi.changeRole(targetId, {
                        targetUserId: myId,
                        role: 'MEMBER'
                    });
                }

                // 이후 관전자 포지션으로 변경
                await DraftApi.changePosition(targetId, {
                    targetUserId: myId,
                    position: 'OBSERVER'
                });
            } else {
                // 일반 포지션 변경 (Pool로 이동)
                console.log('[handleJoinPool] 일반 포지션 변경 시도:', targetRole);

                // 만약 현재 팀장(Captain)이라면, 먼저 팀장직을 내려놓아야 함 (MEMBER로 변경)
                // (관리자가 팀장에서 일반 팀원으로 이동하는 경우)
                if (userRole === 'CAPTAIN') {
                     console.log('[handleJoinPool] 팀장이 Pool로 이동 -> MEMBER로 강등 먼저 수행');
                     await DraftApi.changeRole(targetId, {
                         targetUserId: myId,
                         role: 'MEMBER'
                     });
                }
                
                 await DraftApi.changePosition(targetId, {
                     targetUserId: myId,
                     position: mapPositionToAPI(targetRole)
                 });
                 console.log('[handleJoinPool] 포지션 변경 완료:', mapPositionToAPI(targetRole));
             }
            
            queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
        } catch (error) {
            console.error("Position change failed:", error);
            const errorCode = error.response?.data?.errorCode;
            const errorMessage = error.response?.data?.message;

            if (errorCode === 'MAX_TEAM_COUNT_EXCEEDED') {
                alert("팀장 인원이 가득 찼습니다.");
            } else if (errorCode === 'LEADER_CANNOT_BE_OBSERVER') {
                alert("팀장은 관전자가 될 수 없습니다.");
            } else {
                alert("포지션 변경 실패: " + (errorMessage || error.message));
            }
        }
    };

  // Chat Handler
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), sender: "나 (Me)", message: text, variant: "me", timestamp }]);
  };

  // ========== Loading & Error States ==========
  if (isLoading) {
    return (
      <div className="draft-lobby-container">
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>로비 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="draft-lobby-container">
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-error)', fontSize: '1.2rem', marginBottom: '1rem' }}>
            로비 데이터를 불러오지 못했습니다.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="btn" 
            style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem' }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ========== Main Render ==========
  return (
    <DragDropContext onDragEnd={onDragEnd}>
    <div className="flex min-h-[calc(100vh-var(--header-height))] justify-center bg-background-dark font-sans text-white relative">
      <div className="flex w-full shadow-2xl">
        
        {/* --- Main Content Area --- */}
        <main className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1812] via-background-dark to-background-dark relative">


           <div className="p-8 lg:p-10 flex-1">
              {/* Page Title & Stats */}
              <div className="mb-10 flex items-end justify-between border-b border-[#393528] pb-6">
                <div className="min-w-0 flex-1 mr-4">

                  <SectionTitle className="!text-3xl whitespace-nowrap overflow-hidden text-ellipsis text-glow flex items-center gap-3">
                    {/* Replaced Inline Edit with Modal Trigger */}
                    <>
                        {lobbyTitle}
                        {isHost && (
                            <button 
                                onClick={() => setIsEditDraftModalOpen(true)}
                                className="text-[#bab29c] hover:text-primary transition-colors hover:scale-110"
                                title="대회 설정 수정"
                            >
                                <span className="material-symbols-outlined text-2xl">edit_square</span>
                            </button>
                        )}
                    </>
                  </SectionTitle>
                </div>
                {/* Stats */}
                <div className="flex items-center gap-6 mb-1 shrink-0">
                   {/* Admin Action Buttons */}
                   {isHost && (
                       <div className="flex items-center gap-3">

                           
                           <Button 
                               variant="primaryStatic" 
                               onClick={() => setIsCodeModalOpen(true)}
                               className="!rounded-full !px-6 !py-2.5 !text-base transition-all"
                           >
                               <span className="material-symbols-outlined font-bold">key</span>
                               초대 코드
                           </Button>
                       </div>
                   )}

                   {/* ... Stats Content ... */}
                   <div className="bg-panel-dark border border-[#393528] px-4 py-2 rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#bab29c] text-lg">groups</span>
                      <div>
                         <p className="text-[10px] text-[#bab29c] font-bold uppercase tracking-wider">총 참가 인원</p>
                         <p className="text-white font-bold leading-none">{totalParticipants}명</p>
                      </div>
                   </div>

                   {/* Start Point Stat */}
                   <div className="bg-panel-dark border border-[#393528] px-4 py-2 rounded-lg flex items-center gap-3 hidden md:flex">
                      <span className="material-symbols-outlined text-[#bab29c] text-lg">monetization_on</span>
                      <div>
                         <p className="text-[10px] text-[#bab29c] font-bold uppercase tracking-wider">시작 포인트</p>
                         <p className="text-white font-bold leading-none">{data?.startPoint || 1000} P</p>
                      </div>
                   </div>

                   {/* Min Bid Stat */}
                   <div className="bg-panel-dark border border-[#393528] px-4 py-2 rounded-lg flex items-center gap-3 hidden md:flex">
                      <span className="material-symbols-outlined text-[#bab29c] text-lg">gavel</span>
                      <div>
                         <p className="text-[10px] text-[#bab29c] font-bold uppercase tracking-wider">입찰 최소가</p>
                         <p className="text-white font-bold leading-none">{data?.startPrice || 100} P</p>
                      </div>
                   </div>
                    <div className="bg-panel-dark border border-[#393528] px-4 py-2 rounded-lg flex items-center gap-3 w-[150px]">
                       <span className={`material-symbols-outlined text-primary text-lg ${captains.filter(c => c.name).every(c => c.ready) ? '' : 'animate-pulse'}`}>stadium</span>
                       <div>
                          <p className="text-[10px] text-[#bab29c] font-bold uppercase tracking-wider">현재 단계</p>
                          <p className="text-primary font-bold leading-none whitespace-nowrap">
                            {captains.filter(c => c.name).every(c => c.ready) ? "준비 완료" : "준비중"}
                          </p>
                       </div>
                    </div>
                </div>
              </div>

              {/* Captains Section */}
              <section className="mb-10">
                 <div className="flex items-center justify-between mb-5 px-1">
                    <h3 className="text-white text-2xl font-bold flex items-center gap-3 font-display">
                        <div className="bg-primary/10 p-1.5 rounded text-primary">
                            <span className="material-symbols-outlined">military_tech</span>
                        </div>
                        팀장 목록 (Captains)
                    </h3>
                    <div className="flex items-center gap-2 text-[#bab29c]">
                        <span className="h-px w-8 bg-[#393528]"></span>
                        <span className="text-xs font-bold uppercase tracking-widest">Active Teams: {captains.filter(c => c.name).length}</span>
                    </div>
                 </div>
                 
                 {/* Captains Grid - Scrollable if > 6 */}
                 <div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[960px] overflow-y-auto custom-scrollbar p-4"
                    style={{ scrollbarGutter: 'stable' }}
                 >
                    {/* 1. Existing Captains */}
                    {captains.map((captain, index) => (
                        <Droppable key={captain.id} droppableId={`captain-slot-${index}`} type="DRAFT_SWAP">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`relative h-full rounded-2xl transition-all duration-300 ${
                                        snapshot.isDraggingOver ? 'ring-2 ring-primary shadow-[0_0_20px_rgba(200,155,60,0.3)] bg-primary/5' : ''
                                    }`}
                                >
                                    <Draggable 
                                        key={captain.id} 
                                        draggableId={`captain-${captain.id}`} 
                                        index={index} 
                                        isDragDisabled={!isHost}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="h-full"
                                            >
                                                <TeamLeaderCard
                                                    key={captain.id}
                                                    captainName={captain.name}
                                                    tier={captain.tier}
                                                    points={captain.points}
                                                    teamNumber={captain.teamNumber}
                                                    profileIcon={captain.image} // Pass profile icon
                                                    isAdmin={isHost}
                                                    isReady={captain.ready}
                                                    selectedRole={captain.selectedRole}
                                                    onRoleSelect={(role) => handleRoleSelect(captain.id, role)}
                                                    onReadyClick={() => handleReadyToggle(captain.id)}
                                                    onOpenSettings={() => handleOpenSettings(captain)}
                                                    onCardClick={(userRole === 'CAPTAIN' || userRole === 'CREW' || isHost) 
                                                      ? () => handleOpenProfile(captain) 
                                                      : undefined}
                                                    mostChampions={captain.mostChampions || []}
                                                    onKick={(isSelf) => handleKickClick({ type: 'CAPTAIN', id: captain.id, name: captain.name }, isSelf)} 
                                                    isCurrentUser={captain.isSelf}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}

                    {/* 2. Add New Captain Slot (Always at the end) - ADMIN Only */}
                    {isHost && captains.filter(c => c.name).length < (data?.maxTeamCount || 2) && (
                     <Droppable droppableId={`captain-slot-${captains.length}`} type="DRAFT_SWAP">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`relative h-full rounded-2xl transition-all duration-300 ${
                                    snapshot.isDraggingOver ? 'ring-2 ring-primary shadow-[0_0_20px_rgba(200,155,60,0.3)] bg-primary/5' : ''
                                }`}
                            >
                                <div 
                                    onClick={() => handleOpenSettings({ id: 'new', name: null })} 
                                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all min-h-[460px] opacity-60 h-full ${
                                        snapshot.isDraggingOver ? 'border-primary bg-primary/10 opacity-100 scale-[0.98]' : 'border-[#393528]'
                                    } cursor-pointer hover:border-primary/50 hover:bg-primary/5 group`}
                                >
                                    <div className={`size-20 rounded-full border-2 border-dashed flex items-center justify-center mb-6 transition-colors bg-[#0f0e0b] ${
                                        snapshot.isDraggingOver ? 'border-primary' : 'border-[#393528] group-hover:border-primary/50'
                                    }`}>
                                        <span className={`material-symbols-outlined text-4xl transition-colors ${
                                            snapshot.isDraggingOver ? 'text-primary' : 'text-[#393528] group-hover:text-primary'
                                        }`}>
                                            {snapshot.isDraggingOver ? 'download' : 'add'}
                                        </span>
                                    </div>
                                    <p className={`font-bold text-lg transition-colors ${
                                        snapshot.isDraggingOver ? 'text-primary' : 'text-[#393528] group-hover:text-primary'
                                    }`}>
                                        {snapshot.isDraggingOver ? '팀장 임명' : '팀장 추가'}
                                    </p>
                                    <p className="text-[#393528]/50 text-xs mt-2 uppercase tracking-wider">New Slot</p>
                                </div>
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    )}
                 </div>
              </section>

              {/* Stats Dashboard */}
               <StatsDashboard 
                  captains={captains}
                  draftPool={draftPool}
                  calculateAverageTier={calculateAverageTier}
               />

              {/* Draft Pool Section (Simplified for this phase - Fixed Layout) */}
              <section className="pb-10">
                 <div className="flex items-center justify-between mb-5 px-1 border-b border-[#393528] pb-2">
                    <h3 className="text-white text-2xl font-bold flex items-center gap-3 font-display">
                        <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                        참가자 대기열 (Draft Pool)
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[#bab29c] text-xs font-bold uppercase">Real-time Update</span>
                    </div>
                 </div>
                 {/* 3x2 Grid Layout */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Row 1 */}
                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-TOP" 
                        roleName="탑 (Top)" 
                        role="TOP" 
                        count={draftPool.TOP.length}
                        captainCount={captains.filter(c => c.selectedRole === 'TOP' && c.ready).length}
                        players={draftPool.TOP} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'TOP', name: p.name, id: p.id }, isSelf)}
                     />
                     
                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-JNG" 
                        roleName="정글 (Jungle)" 
                        role="JNG" 
                        count={draftPool.JNG.length}
                        captainCount={captains.filter(c => c.selectedRole === 'JNG' && c.ready).length}
                        players={draftPool.JNG} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'JNG', name: p.name, id: p.id }, isSelf)}
                     />
                     
                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-MID" 
                        roleName="미드 (Mid)" 
                        role="MID" 
                        count={draftPool.MID.length}
                        captainCount={captains.filter(c => c.selectedRole === 'MID' && c.ready).length}
                        players={draftPool.MID} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'MID', name: p.name, id: p.id }, isSelf)}
                     />
                     
                    {/* Row 2 */}
                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-ADC" 
                        roleName="원딜 (ADC)" 
                        role="ADC" 
                        count={draftPool.ADC.length}
                        captainCount={captains.filter(c => c.selectedRole === 'ADC' && c.ready).length}
                        players={draftPool.ADC} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'ADC', name: p.name, id: p.id }, isSelf)}   
                     />

                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-SUP" 
                        roleName="서포터 (Support)" 
                        role="SUP" 
                        count={draftPool.SUP.length}
                        captainCount={captains.filter(c => c.selectedRole === 'SUP' && c.ready).length}
                        players={draftPool.SUP} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'SUP', name: p.name, id: p.id }, isSelf)}
                     />

                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-SPECTATOR" 
                        roleName="관전자 (Spectator)" 
                        role="SPECTATOR" 
                        count={draftPool.SPECTATOR.length} 
                        players={draftPool.SPECTATOR} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'SPECTATOR', name: p.name, id: p.id }, isSelf)}
                     />
                 </div>
              </section>

              {/* Auction Control / Status - Bottom Right */}
              <div className="flex justify-end pt-4 gap-3" style={{ marginBottom: '1px' }}> {/* Adjusted alignment & added gap */}
                  
                  {/* 로비 닫기 버튼 (Moved from Header) */}
                  {isHost && (
                        <button
                            onClick={() => setIsDestroyConfirmOpen(true)}
                            className="flex items-center gap-2 rounded-xl px-6 py-3 bg-[#1a1812] hover:bg-red-900/20 text-red-500 font-bold text-base border-2 border-red-900/30 hover:border-red-500/50 transition-all"
                            title="로비를 닫고 모든 참가자를 퇴장시킵니다"
                        >
                            <span className="material-symbols-outlined font-bold">meeting_room</span>
                            로비 닫기
                        </button>
                    )}

                  {isHost ? (
                      <Button 
                        variant="bid" 
                        disabled={!captains.filter(c => c.name).every(c => c.ready)}
                        onClick={async () => {
                            try {
                                const targetId = draftId || 1;
                                await DraftApi.startDraft(targetId);
                                // 경매 페이지로 이동
                                navigate(`/draft?draftId=${targetId}`);
                            } catch (e) {
                                console.error("Start failed:", e);
                                alert("드래프트 시작 실패: " + (e.response?.data?.message || e.message));
                            }
                        }}
                        className={`!h-14 !px-8 !text-xl !rounded-xl gap-2 !flex-row flex items-center justify-center transition-all duration-300 ${
                            captains.filter(c => c.name).every(c => c.ready) 
                            ? 'shadow-[0_0_20px_rgba(200,155,60,0.4)] hover:brightness-110 cursor-pointer opacity-100' 
                            : 'shadow-none cursor-not-allowed opacity-50'
                        }`}
                      >
                         <span className="material-symbols-outlined font-bold text-2xl">gavel</span>
                         <span>경매 시작하기</span>
                      </Button>
                  ) : (
                      <div className="bg-[#0f0e0b] border border-[#393528] rounded-xl px-6 py-4 flex items-center gap-4 shadow-xl">
                          <span className="material-symbols-outlined text-[#c89b3c] text-2xl animate-spin-slow">sync</span>
                          <div>
                              <p className="text-[#c89b3c] text-xs font-bold uppercase tracking-widest mb-0.5">SYSTEM</p>
                              <p className="text-white font-bold text-sm text-opacity-80">관리자의 시작을 기다리는 중...</p>
                          </div>
                      </div>
                  )}
              </div>
           </div>
        </main>

        {/* --- Sidebar (Chat) --- */}
        <aside className="w-[380px] border-l border-[#393528] bg-black flex flex-col shadow-2xl z-20 h-[calc(100vh-var(--header-height))] sticky top-[var(--header-height)]">
            <div className="p-5 border-b border-[#393528] flex items-center justify-between bg-panel-dark">
                <h4 className="text-white font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                    <span className="material-symbols-outlined text-primary text-lg">forum</span>
                    실시간 채팅 (Live Chat)
                </h4>
                <div className="flex items-center gap-2 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                    <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                    <span className="text-[10px] text-green-500 font-bold uppercase">Online</span>
                </div>
            </div>
            
            {/* Messages Area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-2 bg-[#0c0b09] flex flex-col min-h-0"
            >
                <div className="mt-auto"></div>
                {messages.map((msg) => (
                    <ChatBubble key={msg.id} sender={msg.sender} message={msg.message} variant={msg.variant} timestamp={msg.timestamp} />
                ))}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-panel-dark border-t border-[#393528]">
                <ChatInput onSubmit={handleSendMessage} />
            </div>
        </aside>

      </div>
      
      {/* Modals */}
      <CreateDraftModal 
        isOpen={isEditDraftModalOpen}
        onClose={() => setIsEditDraftModalOpen(false)}
        isEditMode={true}
        draftId={draftId}
        initialData={data}
        onUpdate={(isSuccess) => {
             queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
             if (isSuccess) setIsUpdateSuccessOpen(true);
        }}
        activeCaptainCount={captains.filter(c => c.name).length}
        captainList={captains.filter(c => c.name)}
      />
      <CodeGenerationModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        codes={codes}
        onRefresh={handleRefreshCode}
      />
      <TeamLeaderSettingsModal 
        key={selectedSettingsCaptain?.id || 'settings-modal'}
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        captain={selectedSettingsCaptain}
        pool={Object.values(draftPool).flat()}
        onSave={handleSaveSettings}
        defaultStartPoint={data?.startPoint || 1000}
      />
      <ParticipantProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        participantData={selectedParticipant}
        onRefresh={handleRefreshProfile}
      />
      <KickConfirmModal
        isOpen={isKickModalOpen}
        onClose={() => setIsKickModalOpen(false)}
        onConfirm={confirmKick}
        participantName={kickTarget?.name}
        isSelf={kickTarget?.isSelf} 
      />
      
      {/* Kicked Notification Modal */}
       <AlertModal
        isOpen={isKickedAlertOpen}
        onClose={() => {
            setIsKickedAlertOpen(false);
            navigate('/');
        }}
        title="퇴장 알림"
        message="관리자에 의해 퇴장되었습니다."
        variant="error"
        icon="block"
      />

       {/* Lobby Closed Notification Modal */}
       <AlertModal
        isOpen={isLobbyClosedAlertOpen}
        onClose={() => {
            setIsLobbyClosedAlertOpen(false);
            navigate('/');
        }}
        title="로비 종료"
        message="방장에 의해 로비가 종료되었습니다."
        variant="warning"
        icon="meeting_room"
      />

       {/* Destroy Draft Confirm Modal */}
       <AlertModal
        isOpen={isDestroyConfirmOpen}
        onClose={() => setIsDestroyConfirmOpen(false)}
        onConfirm={handleDestroyDraft}
        title="로비 닫기 확인"
        message={"정말로 로비를 닫으시겠습니까?\n\n모든 참가자가 퇴장되며, 드래프트 데이터가 완전히 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다."}
        variant="error"
        icon="warning"
      />

       {/* Update Success Notification Modal */}
       <AlertModal
        isOpen={isUpdateSuccessOpen}
        onClose={() => setIsUpdateSuccessOpen(false)}
        title="수정 완료"
        message="대회 정보가 성공적으로 수정되었습니다."
        variant="success"
        icon="check_circle"
      />
    </div>
    </DragDropContext>
  );
}
