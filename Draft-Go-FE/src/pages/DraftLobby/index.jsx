import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as DraftApi from "../../api/draft"; 

import TeamLeaderCard from "../../components/Ui/TeamLeaderCard";
import PositionIcon from "../../components/ui/PositionIcon";
import ChatBubble from "../../components/Ui/ChatBubble";
import ChatInput from "../../components/Ui/ChatInput";
import SectionTitle from "../../components/ui/SectionTitle";
import Button from "../../components/ui/Button";
import CreateDraftModal from "../../components/ui/CreateDraftModal";
import CodeGenerationModal from "../../components/Ui/CodeGenerationModal";
import TeamLeaderSettingsModal from "../../components/Ui/TeamLeaderSettingsModal";
import ParticipantProfileModal from "../../components/Ui/ParticipantProfileModal";
import KickConfirmModal from "../../components/Ui/KickConfirmModal";
import Badge from "../../components/ui/Badge";
import useAuthStore from "../../stores/useAuthStore"; // Auth Store Import

// 포지션 매핑 함수 (API ↔ UI 변환)
const mapPositionToAPI = (position) => {
    const mapping = { 'JNG': 'JUNGLE', 'ADC': 'BOT' };
    return mapping[position] || position;
};


const mapPositionToUI = (position) => {
    const mapping = { 'JUNGLE': 'JNG', 'BOT': 'ADC' };
    return mapping[position] || position;
};



// DUMMY DATA REMOVED

export default function DraftLobby() {
  const { user } = useAuthStore(); // Current User
  const { draftId } = useParams(); 
  const navigate = useNavigate();
  
  // States
  const [userRole, setUserRole] = useState("MEMBER"); // Default to MEMBER, updated by API
  const [isHost, setIsHost] = useState(false); 
  const [data, setData] = useState(null); // Keep full data for edit modal

  const [lobbyTitle, setLobbyTitle] = useState("Lobby Loading...");
  const [isEditDraftModalOpen, setIsEditDraftModalOpen] = useState(false);

  
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codes, setCodes] = useState({
      teamLeaderCode: "LOADING...",
      teamMemberCode: "LOADING..."
  });

  const [captains, setCaptains] = useState([]);
  const [draftPool, setDraftPool] = useState({
      TOP: [], JNG: [], MID: [], ADC: [], SUP: [], SPECTATOR: []
  });
  
  // TODO: 채팅 API 연동 전까지 빈 배열
  const [messages, setMessages] = useState([]);

  // Auto-scroll for chat
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

  // --- API Integration ---
  


  const fetchLobbyData = async () => {
      try {
          const targetId = draftId || 1;

          const [data, draftList] = await Promise.all([
              DraftApi.getDraftLobby(targetId),
              DraftApi.getDraftList() // Fetch list to get config details if missing in lobby
          ]);
          
          console.log("Lobby Data:", data);
          console.log("Draft List:", draftList);
          
          // Merge config from draftList if available
          let mergedData = { ...data };
          
          // Handle various list response structures
          let validList = [];
          if (Array.isArray(draftList)) validList = draftList;
          else if (Array.isArray(draftList?.data)) validList = draftList.data;
          else if (Array.isArray(draftList?.content)) validList = draftList.content;

          if (validList.length > 0) {
              const currentDraftConfig = validList.find(d => {
                  const dId = d.id || d.draftId;
                  return Number(dId) === Number(targetId);
              });

              if (currentDraftConfig) {
                  mergedData = {
                      ...mergedData,
                      startPoint: currentDraftConfig.startPoint ?? mergedData.startPoint,
                      maxTeamCount: currentDraftConfig.maxTeamCount ?? mergedData.maxTeamCount,
                      startPrice: currentDraftConfig.startPrice ?? mergedData.startPrice,
                      title: currentDraftConfig.title ?? mergedData.title
                  };
              }
          }
          
          // [Fallback] If startPoint is still missing, try to infere from existing captains
          if (mergedData.startPoint === undefined && mergedData.leaders && mergedData.leaders.length > 0) {
               mergedData.startPoint = mergedData.leaders[0].leaderPoint || 1000;
          }

          setData(mergedData); // Save full data for edit modal
          console.log("[DraftLobby] MERGED DATA:", JSON.stringify(mergedData, null, 2));

          if (!mergedData) return;

          setLobbyTitle(mergedData.title || "Unknown Lobby");
          
          if (mergedData.codes) {
              setCodes(mergedData.codes);
          }

          // Transform Leaders -> Captains UI Model
          const leaders = Array.isArray(data.leaders) ? data.leaders : [];
          
          // Check My Role - ID 타입 일관성 확보
          const myId = user?.id; // ID는 number로 통일
          if (!myId) {
              console.warn('[DraftLobby] User ID not found in AuthStore');
          }
          
          
          // API Response Check: ownerId might be hostId or similar
          // [Refactor] "codes" 정보가 존재하면 관리자 권한이 있는 것으로 간주 (Backend Logic: 코드는 관리자에게만 반환됨)
          const hasAdminCodes = data.codes && (data.codes.teamLeaderCode || data.codes.teamMemberCode);
          
          // ownerId가 명시적으로 있으면 그것도 체크, 없으면 codes 존재 여부로 판단
          const ownerIdValue = data.ownerId || data.hostId || data.masterId; 
          const isExplicitOwner = ownerIdValue && Number(ownerIdValue) === Number(myId);
          
          const isOwner = isExplicitOwner || !!hasAdminCodes;
          setIsHost(isOwner);

          // Update User Role based on list presence (Participation Role)
          let myRole = "MEMBER";
          
          // Check if I am a captain
          if (leaders.some(l => Number(l.id) === Number(myId))) {
              myRole = "CAPTAIN";
          }
          // Check if I am a member (crew)
          const membersList = Array.isArray(data.members) ? data.members : [];
          if (membersList.some(m => Number(m.id) === Number(myId))) {
              myRole = "CREW";
          }
          // Check if I am a spectator
          if (data.observers && data.observers.some(o => Number(o.id) === Number(myId))) {
              myRole = "SPECTATOR";
          }

          // [Refactor] Admin 권한은 'isHost' 상태로 관리하되, userRole은 참가 상태를 유지함.
          // 단, 현재 UI에서 'ADMIN' 뱃지가 필요하다면 별도 처리가 필요할 수 있으나,
          // 사용자 요구사항("관리자이면서 팀장 가능")에 따라 userRole은 포지션을 우선함.
          // 만약 아무 역할도 없다면(MEMBER), 그리고 관리자라면 -> 그때 ADMIN 표시?
          if (myRole === "MEMBER" && isOwner) {
              myRole = "ADMIN";
          }
          
          setUserRole(myRole);
          console.log('[DraftLobby] Logic Check -> HasCodes:', !!hasAdminCodes, 'IsOwner:', isOwner);
          console.log('[DraftLobby] Final Role:', myRole);


          const mappedCaptains = leaders.map((leader, index) => {
              const baseData = {
                  id: leader.id,
                  name: leader.name,
                  tier: leader.tier,
                  teamNumber: index + 1,
                  image: leader.profileIcon || "", 
                  ready: leader.isReady,
                  selectedRole: mapPositionToUI(leader.position),
                  isSelf: Number(leader.id) === Number(myId),
                  points: leader.leaderPoint || mergedData.startPoint || 1000,
                  loading: false,
                  role: 'MID', // Default
                  // Pass full profile data
                  mainPosition: leader.mainPosition,
                  subPosition: leader.subPosition,
                  mostChampions: leader.mostChampions,
                  lp: leader.leaguePoints,
                  gameName: leader.gameName,
                  tagLine: leader.tagLine,
                  level: leader.summonerLevel,
                  winRate: leader.winRate,
                  recent20: leader.recentStats, // { wins, losses }
                  memberId: leader.memberId || leader.id, // 전적 갱신용 memberId 추가 (fallback to id)
                  lastUpdated: leader.updatedAt || leader.lastUpdated // 전적 갱신 쿨타임 계산용
              };

              // Merge with cached refreshed data if available
              const cached = refreshedProfilesRef.current[leader.memberId] || refreshedProfilesRef.current[leader.id];
              if (cached) {
                  return { ...baseData, ...cached };
              }
              return baseData;
          });
          setCaptains(mappedCaptains);

          // Transform Members -> DraftPool UI Model
          const newPool = { TOP: [], JNG: [], MID: [], ADC: [], SUP: [], SPECTATOR: [] };
          
          const members = Array.isArray(data.members) ? data.members : [];
          members.forEach(member => {
              const uiPosition = mapPositionToUI(member.position);
              if (newPool[uiPosition]) {
                  let memberData = {
                      id: member.id,
                      name: member.name,
                      tier: member.tier,
                      color: getTierTextClass(member.tier),
                      lp: member.leaguePoints,
                      isSelf: Number(member.id) === Number(myId),
                      image: member.profileIcon,
                      // Profile Data
                      mainPosition: member.mainPosition,
                      subPosition: member.subPosition,
                      mostChampions: member.mostChampions,
                      gameName: member.gameName,
                      tagLine: member.tagLine,
                      level: member.summonerLevel,
                      winRate: member.winRate,
                      recent20: member.recentStats,
                      memberId: member.memberId || member.id, // 전적 갱신용 memberId 추가
                      lastUpdated: member.updatedAt || member.lastUpdated
                  };

                  // Merge with cache
                  const cached = refreshedProfilesRef.current[member.memberId] || refreshedProfilesRef.current[member.id];
                  if (cached) {
                      memberData = { ...memberData, ...cached };
                  }

                  newPool[uiPosition].push(memberData);
              }
          });
          
          // Observers
          if (data.observers) {
              newPool.SPECTATOR = data.observers.map(obs => {
                  let obsData = {
                      id: obs.id,
                      name: obs.name,
                      tier: "Obs",
                      color: "text-gray-500",
                      isSelf: Number(obs.id) === Number(myId),
                      // Profile Data
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

                   // Merge with cache
                  const cached = refreshedProfilesRef.current[obs.memberId] || refreshedProfilesRef.current[obs.id];
                  if (cached) {
                      obsData = { ...obsData, ...cached };
                  }
                  return obsData;
              });
          }

          setDraftPool(newPool);

          return data;
      } catch (error) {
          console.error("Failed to fetch lobby:", error);
          // navigate('/'); // 에러 시 홈으로?
      }
  };

  useEffect(() => {
     fetchLobbyData();
     // Polling (5초마다 갱신) - 소켓 연동 전까지 임시
     const interval = setInterval(fetchLobbyData, 5000);
     return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, user?.id]);

  // Handle Refresh Code
  const handleRefreshCode = async (type) => {
      // type: 'LEADER' | 'MEMBER' (UI에서는 undefined일 수 있으니 매핑 필요)
       // Modal에서 어떤 타입을 요청하는지 확인 필요.
       // 현재 모달은 전체 갱신 버튼이 있는 형태라면 둘 다 하거나 특정 타입 지정.
       // 여기서는 예시로 LEADER라고 가정하거나, 인자로 받음.
       try {
           const codeType = type === 'LEADER' ? 'LEADER' : 'MEMBER';
           const targetId = draftId || 1;
           await DraftApi.refreshInviteCode(targetId, codeType);
           fetchLobbyData(); // 데이터 다시 로드
       } catch (error) {
           console.error("Code refresh failed:", error);
           alert("초대 코드 갱신 실패");
       }
  };

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSettingsCaptain, setSelectedSettingsCaptain] = useState(null);
  
  // Kick Feature
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState(null); // { type: 'CAPTAIN' | 'POOL', id: number | string, name: string, dropId: string (optional) }

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Initial Load (handled by fetchLobbyData)

  // Handlers
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
            // API Call for leaving (Kick myself)
            // Note: API 명세에 본인 나가기는 kick과 동일하게 처리되는지, 
            // 아니면 별도 leave가 있는지 확인했으나 일단 kick/{userId}로 통일을 가정.
            await DraftApi.kickParticipant(targetId, kickTarget.id); // userId 필요
            navigate('/');
            return;
        }

        // Kick Others
        await DraftApi.kickParticipant(targetId, kickTarget.id);
        
        // Refresh UI
        fetchLobbyData();
        
    } catch (error) {
        console.error("Kick failed:", error);
        alert("퇴장 처리에 실패했습니다.");
    } finally {
        setIsKickModalOpen(false);
        setKickTarget(null);
    }
  };

  // Derived State: Captains + Pool (Excluding Spectators)
  const totalParticipants = captains.filter(c => c.name).length + 
    Object.entries(draftPool).reduce((acc, [role, players]) => role === 'SPECTATOR' ? acc : acc + players.length, 0);

  // Captain Interaction Handlers
  // Captain Interaction Handlers
  const handleRoleSelect = async (captainId, role) => {
    // Optimistic UI Update
    setCaptains(prev => prev.map(c => 
      c.id === captainId ? { ...c, selectedRole: role } : c
    ));

    try {
        const targetId = draftId || 1;
        await DraftApi.changePosition(targetId, {
            targetUserId: captainId,
            position: mapPositionToAPI(role) // 포지션 매핑 적용
        });
        await fetchLobbyData(); // Sync with server
    } catch (e) {
        console.error("Failed to change position:", e);
        alert("포지션 변경에 실패했습니다.");
        fetchLobbyData(); // Revert on failure
    }
  };

  const handleReadyToggle = async (captainId) => {
    try {
        const targetId = draftId || 1;
        const captain = captains.find(c => c.id === captainId);
        // Toggle Logic
        await DraftApi.toggleReady(targetId, !captain.ready);
        fetchLobbyData();
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
    // Confirm profile view (Anyone can view?) - Usually anyone can view anyone.
    // Simplifying restriction: all can view.
      const profileData = {
        summonerName: participant.name, // or gameName
        gameName: participant.gameName || participant.name,
        tagLine: participant.tagLine,
        profileIconUrl: participant.image || "",
        tier: participant.tier,
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
    // memberId 우선 사용, 없으면 id (fallback)
    const targetId = selectedParticipant.memberId || selectedParticipant.id;

    try {
        await DraftApi.refreshMemberData(targetId);
        alert('전적 갱신이 완료되었습니다.');
        
        // 1. 특정 멤버의 최신 상세 정보 가져오기 (Direct Fetch)
        const memberProfile = await DraftApi.getMemberProfile(targetId);
        
        if (memberProfile) {
             const stats = memberProfile.stats || {};
             
             const newProfileData = {
                summonerName: memberProfile.gameName || memberProfile.username, // gameName 우선
                gameName: memberProfile.gameName,
                tagLine: memberProfile.tagLine,
                profileIconUrl: memberProfile.profileIconUrl || "",
                
                // Stats는 stats 객체 안에 있음
                tier: stats.rank || "Unranked",
                lp: stats.leaguePoints || 0,
                level: memberProfile.summonerLevel || 0, // Top level or inside stats? JSON shows only stats.rank... wait, provided JSON didn't show level in stats, check top level. 'updatedAt' is top. 'puuid' is top.
                // User JSON doesn't show summonerLevel in top level or stats. Assuming it might be top level or missing. defaulting to 0.
                
                winRate: stats.winRate || 0,
                recent20: { 
                    wins: stats.wins || 0, 
                    losses: stats.losses || 0 
                },
                
                mostChampions: (memberProfile.mostChampions || []).map(c => ({
                    name: c.championName,
                    games: c.totalGames,
                    winRate: c.winRate,
                    kda: c.kda,
                    // Image URL construction if missing
                    imageUrl: c.imageUrl || `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/${c.championName}.png` 
                })),
                
                mainPosition: memberProfile.mainPosition,
                subPosition: memberProfile.subPosition,
                
                lastUpdated: memberProfile.updatedAt || new Date().toISOString(), 
                memberId: memberProfile.memberId || memberProfile.id,
                id: memberProfile.memberId || memberProfile.id // Prefer memberId as ID
             };
             setSelectedParticipant(newProfileData);
        }

        // 3. 로비 데이터도 백그라운드에서 갱신 (전체 UI 동기화)
        // Note: 로비 API가 updatedAt을 반환하지 않을 수 있으므로, 방금 받은 상세 정보로 로컬 state를 강제 갱신하여 쿨타임 유지
        await fetchLobbyData(); // await to ensure we overwrite *after* fetch if needed, or update *after* fetch.
        
        if (memberProfile) {
            const stats = memberProfile.stats || {};
            const freshTime = memberProfile.updatedAt || memberProfile.lastUpdated || new Date().toISOString();
            
            // Map memberProfile back to Lobby Data Structure for persistence
            const freshData = {
                lastUpdated: freshTime,
                tier: stats.rank || "Unranked",
                leaguePoints: stats.leaguePoints || 0,
                lp: stats.leaguePoints || 0, // UI might use lp
                winRate: stats.winRate || 0,
                recentStats: { wins: stats.wins || 0, losses: stats.losses || 0 }, // Lobby uses recentStats
                recent20: { wins: stats.wins || 0, losses: stats.losses || 0 }, // UI might use recent20
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
                image: memberProfile.profileIconUrl || "", // UI might use image
                mainPosition: memberProfile.mainPosition,
                subPosition: memberProfile.subPosition
            };
            
            // Save to Cache Ref & Session Storage
            refreshedProfilesRef.current[targetId] = freshData;
            sessionStorage.setItem('refreshedProfiles', JSON.stringify(refreshedProfilesRef.current));

            // Update Captains
            setCaptains(prev => prev.map(c => {
                if ((c.memberId && Number(c.memberId) === Number(targetId)) || Number(c.id) === Number(targetId)) {
                    return { ...c, ...freshData };
                }
                return c;
            }));

            // Update Draft Pool
            setDraftPool(prev => {
                const newPool = { ...prev };
                Object.keys(newPool).forEach(key => {
                    newPool[key] = newPool[key].map(m => {
                         if ((m.memberId && Number(m.memberId) === Number(targetId)) || Number(m.id) === Number(targetId)) {
                            return { ...m, ...freshData };
                        }
                        return m;
                    });
                });
                return newPool;
            });
        }

    } catch (error) {
        console.error('전적 갱신 실패:', error);
        alert('전적 갱신에 실패했습니다: ' + (error.response?.data?.message || error.message));
    }
  };

  // Helper Maps - Must be static for Tailwind JIT
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



  // --- 티어 및 단계별 점수 계산 로직 ---
  const TIER_ORDER = ["iron", "bronze", "silver", "gold", "platinum", "emerald", "diamond", "master", "grandmaster", "challenger"];
  const DIV_MAP = { "i": 3, "ii": 2, "iii": 1, "iv": 0 };
  const DIV_REVERSE = ["IV", "III", "II", "I"];

  // 티어 점수 계산 (각 티어당 4점 + 단계별 점수)
  const getTierScore = (tierStr) => {
      if (!tierStr) return 0;
      const parts = tierStr.toLowerCase().split(" ");
      const tier = parts[0];
      // 마스터 이상은 단계가 없는 경우 기본값 처리, 그 외에는 IV(0) 처리
      // 보통 "Gold II" 형식으로 들어옴
      const div = parts[1] || (TIER_ORDER.indexOf(tier) >= 7 ? "i" : "iv");
      
      const tierIdx = TIER_ORDER.indexOf(tier);
      if (tierIdx === -1) return 0;

      let score = tierIdx * 4;
      
      // 마스터 티어 이상은 단계 구분 없이 처리
      // 단순히 평균 티어를 보여주기 위함이므로 다이아몬드 상위로 취급
      if (tierIdx >= 7) {
           return score; // Master=28, GM=32...
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
      
      // 마스터 이상은 티어 이름만 표시
      if (clampedTierIdx >= 7) {
          return { 
              name: baseTierName, 
              baseTier: baseTierName,
              color: getTierTextClass(tierName) 
          }; 
      }
      
      // 마스터 미만은 티어와 단계(I~IV) 표시
      const divStr = DIV_REVERSE[divScore] || "IV";
      const formatName = `${baseTierName} ${divStr}`;
      
      return { 
          name: formatName,
          baseTier: baseTierName, // For badge variations
          color: getTierTextClass(tierName)
      };
  };

  const calculateAverageTier = (participants) => {
      if (!participants || participants.length === 0) return { name: "Unranked", baseTier: "Unranked", color: "text-[#666]" };
      
      let sum = 0;
      let count = 0;
      
      participants.forEach(p => {
          if (p.tier && p.tier !== "Unranked") {
             sum += getTierScore(p.tier);
             count++;
          }
      });

      if (count === 0) return { name: "Unranked", baseTier: "Unranked", color: "text-[#666]" };
      
      const avg = Math.round(sum / count);
      return getTierFromScore(avg);
  };

  const getTierTextClass = (tier) => {
        if (!tier) return "text-[#bab29c]";
        const tierLower = tier.split(" ")[0].toLowerCase();
        return TIER_TEXT_COLORS[tierLower] || `text-[var(--color-tier-${tierLower}-text)]`;
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
                  fetchLobbyData();
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

                  // 3. Promote New Captain (MEMBER -> LEADER)
                  await DraftApi.changeRole(targetId, {
                      targetUserId: newCaptainUser.id,
                      role: 'LEADER'
                  });

                  // 4. Update Points for New Captain
                  if (newData.points !== undefined) {
                      await DraftApi.setLeaderPoint(targetId, {
                          leaderId: newCaptainUser.id,
                          point: Number(newData.points)
                      });
                  }
              } else {
                  // 이름 변경 없음 -> 포인트만 수정
                  await DraftApi.setLeaderPoint(targetId, {
                      leaderId: captainId, // captainId is userId here
                      point: Number(newData.points)
                  });
              }
              fetchLobbyData();
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
    
    // 편의상 DraggableId에 userId를 넣었다고 가정하거나, index로 찾음.
    // 기존 코드: captain-${id}, player-${name}
    // API 연동을 위해 DraggableId에 userId를 쓰는게 좋음. 
    // fetchLobbyData에서 `draggableId={`player-${p.id}`}` 로 수정 필요.
    
    // 여기서는 기존 로직의 흐름만 API로 변경.
    const targetId = draftId || 1;
    const isSourceCaptain = source.droppableId.startsWith('captain-slot');
    const isDestCaptain = destination.droppableId.startsWith('captain-slot');
    
    // 1. Captain <-> Captain (Swap) -> Not Supported by Backend yet? (Client only reorder or ignore)
    // 사용자가 "팀장 순서 상관없다"고 했으므로 무시.
    if (isSourceCaptain && isDestCaptain) return;

    try {
        // 2. Pool -> Captain (Promotion)
        // changeRole(LEADER)
        if (!isSourceCaptain && isDestCaptain) {
            // draggableId에서 ID 추출: "player-{id}"
            const playerId = result.draggableId.replace('player-', '');
            if (!playerId) return;

            await DraftApi.changeRole(targetId, {
                targetUserId: Number(playerId),
                role: 'LEADER'
            });
            fetchLobbyData();
            return;
        }

        // 3. Captain -> Pool (Demotion)
        // changeRole(MEMBER)
        if (isSourceCaptain && !isDestCaptain) {
             // draggableId에서 ID 추출: "captain-{id}"
             const captainId = result.draggableId.replace('captain-', '');
             if (!captainId) return;
             
             await DraftApi.changeRole(targetId, {
                 targetUserId: Number(captainId),
                 role: 'MEMBER'
             });
             fetchLobbyData();
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
             if (targetRole === 'SPECTATOR') {
                 await DraftApi.changeRole(targetId, {
                     targetUserId: Number(playerId),
                     role: 'OBSERVER'
                 });
             } else {
                 await DraftApi.changePosition(targetId, {
                     targetUserId: Number(playerId),
                     position: mapPositionToAPI(targetRole)
                 });
             }
             fetchLobbyData();
             return;
        }
    } catch (e) {
        console.error("Drag Drop Action Failed:", e);
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

           // 관전자(SPECTATOR)로 이동하는 경우 별도 처리
           if (targetRole === 'SPECTATOR') {
               // 관전자 변경은 changeRole API 사용 (OBSERVER role)
               await DraftApi.changeRole(targetId, {
                   targetUserId: myId,
                   role: 'OBSERVER'
               });
               console.log('[handleJoinPool] 관전자로 변경 완료');
           } else {
               // 일반 포지션 변경
               await DraftApi.changePosition(targetId, {
                   targetUserId: myId,
                   position: mapPositionToAPI(targetRole)
               });
               console.log('[handleJoinPool] 포지션 변경 완료:', mapPositionToAPI(targetRole));
           }
           
           fetchLobbyData();
       } catch (error) {
           console.error("Position change failed:", error);
           console.error("Error response:", error.response?.data);
           alert("포지션 변경 실패: " + (error.response?.data?.message || error.message));
       }
   };

  // Chat Handler
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), sender: "나 (Me)", message: text, variant: "me", timestamp }]);
  };

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
                   {/* Admin Action Button */}
                   {isHost && (
                       <Button 
                           variant="primaryStatic" 
                           onClick={() => setIsCodeModalOpen(true)}
                           className="!rounded-full !px-6 !py-2.5 !text-base transition-all"
                       >
                           <span className="material-symbols-outlined font-bold">key</span>
                           초대 코드
                       </Button>
                   )}

                   {/* ... Stats Content ... */}
                   <div className="bg-panel-dark border border-[#393528] px-4 py-2 rounded-lg flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#bab29c] text-lg">groups</span>
                      <div>
                         <p className="text-[10px] text-[#bab29c] font-bold uppercase tracking-wider">총 참가 인원</p>
                         <p className="text-white font-bold leading-none">{totalParticipants}명</p>
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
              <section className="bg-black/40 border border-[#393528] rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm">
                 {/* Left: General Info */}
                 <div className="flex items-center gap-8 border-b md:border-b-0 md:border-r border-[#393528] pb-6 md:pb-0 md:pr-8 w-full md:w-auto justify-center md:justify-start">
                    <div>
                        <p className="text-[#bab29c] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">groups</span> 전체 참가자
                        </p>
                        {/* Values */}
                    <p className="text-white text-3xl font-black font-display tracking-tight flex items-baseline gap-2">
                        {totalParticipants} <span className="text-lg text-[#666] font-bold">Players</span>
                    </p></div>
                    <div>
                        <p className="text-[#bab29c] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">leaderboard</span> 평균 티어
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                            {(() => {
                                const allPlayers = [
                                    ...captains.filter(c => c.name),
                                    ...Object.values(draftPool).flat().filter(p => !p.tier || p.tier !== 'Obs')
                                ];
                                const avg = calculateAverageTier(allPlayers);
                                return (
                                    <>
                                     <Badge variant={avg.baseTier.toLowerCase()}>{avg.baseTier.toUpperCase()}</Badge>
                                     <span className="text-white font-bold text-sm w-[60px]">{avg.name}</span>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                 </div>

                 {/* Right: Role Breakdown */}
                 <div className="flex-1 flex justify-around w-full">
                    {['TOP', 'JNG', 'MID', 'ADC', 'SUP'].map(role => (
                        <div key={role} className="flex flex-col items-center text-center gap-1 group cursor-default">
                             <div className="text-[#bab29c] group-hover:text-primary transition-colors">
                                <PositionIcon position={role} className="w-8 h-8" />
                             </div>
                             <p className="text-[#bab29c] text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">{role}</p>
                                {draftPool[role]?.length || 0}
                             <p className="text-[#666] text-[10px] font-bold">
                                {(() => {
                                    const avg = calculateAverageTier(draftPool[role] || []);
                                    return avg.name !== 'Unranked' ? avg.name : '-';
                                })()}
                             </p>
                        </div>
                    ))}
                 </div>
              </section>

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
                        players={draftPool.ADC} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'ADC', name: p.name, id: p.id }, isSelf)}   
                     />

                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-SUP" 
                        roleName="서포터 (SUP)" 
                        role="SUP" 
                        count={draftPool.SUP.length} 
                        players={draftPool.SUP} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'SUP', name: p.name, id: p.id }, isSelf)}
                     />

                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-SPECTATOR" 
                        roleName="관전자 (Spectators)" 
                        roleIcon="visibility" 
                        count={draftPool.SPECTATOR.length} 
                        players={draftPool.SPECTATOR} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'SPECTATOR', name: p.name, id: p.id }, isSelf)}
                     />
                 </div>
              </section>

              {/* Auction Control / Status - Bottom Right */}
              <div className="flex justify-end pt-4" style={{ marginBottom: '1px' }}> {/* Adjusted alignment */}
                  {isHost ? (
                      <Button 
                        variant="bid" 
                        disabled={!captains.filter(c => c.name).every(c => c.ready)}
                        onClick={async () => {
                            try {
                                const targetId = draftId || 1;
                                await DraftApi.startDraft(targetId);
                                // 경매 페이지로 이동
                                navigate(`/auction/${targetId}`);
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
        initialData={data} // Pass full data object (contains title, maxTeamCount, etc.)
        onUpdate={fetchLobbyData}
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



    </div>
    </DragDropContext>
  );
}

// Internal Sub-component for Draft Pool Column to keep file clean
function DraftPoolColumn({ roleName, role, roleIcon, count, players, userRole, isAdmin, droppableId, onJoin, onPlayerClick, onKick }) {
    // 현재 사용자가 이미 이 풀에 있는지 확인
    const hasCurrentUser = players.some(p => p.isSelf || p.name === "나 (Me)");
    
    return (
        <div className="flex flex-col h-full">
            <div className={`bg-gradient-to-r ${isAdmin ? 'from-[#3a2e15] to-[#2a2215] border-yellow-600' : 'from-[#1e1a0d] to-[#161410] border-primary'} border-l-4 px-5 py-3 mb-0 rounded-t-lg flex items-center justify-between`}>
                <h4 className="text-white font-bold text-base flex items-center gap-2 uppercase tracking-widest">
                    {role ? (
                        <PositionIcon position={role} className="w-6 h-6" />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-xl">{roleIcon}</span>
                    )}
                    {roleName}
                </h4>
                <span className="text-xs text-[#bab29c] font-mono font-bold">{count}</span>
            </div>
            
            <Droppable droppableId={droppableId} type="DRAFT_SWAP">
              {(provided) => (
                <div 
                   className="bg-panel-dark rounded-b-lg border border-t-0 border-[#393528] flex-1 flex flex-col relative min-h-[100px] max-h-[240px] overflow-y-auto [&::-webkit-scrollbar]:hidden"
                   style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                   ref={provided.innerRef}
                   {...provided.droppableProps}
                >
                    {players.map((p, idx) => (
                        <Draggable key={p.id} draggableId={`player-${p.id}`} index={idx} isDragDisabled={!isAdmin}>
                           {(provided) => (
                                <div
                                   ref={provided.innerRef}
                                   {...provided.draggableProps}
                                   {...provided.dragHandleProps}
                                   className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors border-b border-[#393528] last:border-0 group cursor-pointer relative"
                                   onClick={(e) => {
                                     // 카드 클릭 시 프로필 열기 (모든 사용자 가능)
                                     if (onPlayerClick) {
                                       e.stopPropagation();
                                       onPlayerClick(p);
                                     }
                                   }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-bold text-sm group-hover:text-primary transition-colors">{p.name}</p>
                                            {/* Admin Badge for Self */}
                                            {(p.isSelf || p.name === "나 (Me)") && isAdmin && (
                                                <span className="bg-[#f4c025]/20 text-[#f4c025] text-[9px] px-1.5 py-0.5 rounded border border-[#f4c025]/30 font-bold">ADMIN</span>
                                            )}
                                        </div>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${p.color}`}>{p.tier}</p>
                                    </div>
                                    
                                    {/* Default Arrow / Admin Kick Button / Self Leave Button */}
                                    <div className="relative size-6 flex items-center justify-center">
                                       <span className={`material-symbols-outlined text-[#393528] group-hover:text-primary transition-colors absolute inset-0 flex items-center justify-center ${(isAdmin || p.isSelf || p.name === "나 (Me)") ? 'group-hover:opacity-0' : ''}`}>
                                          chevron_right
                                       </span>
                                       {(isAdmin || p.isSelf || p.name === "나 (Me)") && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const isSelf = p.isSelf || p.name === "나 (Me)";
                                                    if (onKick) onKick(p, isSelf);
                                                }}
                                                className="absolute inset-0 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                                                title={p.isSelf || p.name === "나 (Me)" ? "나가기" : "참가자 퇴장"}
                                            >
                                                <span className="material-symbols-outlined font-bold">close</span>
                                            </button>
                                       )}
                                    </div>
                                </div>
                           )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {/* Crew 'Join' Card - 이미 참여한 포지션에는 표시 안 함, SPECTATOR 제외 */}
                    {userRole === 'CREW' && !hasCurrentUser && droppableId !== 'pool-SPECTATOR' && (
                        <div 
                            onClick={() => onJoin && onJoin(droppableId.split('-')[1])}
                            className="flex items-center gap-4 px-5 py-4 bg-[#0f0e0b]/50 hover:bg-primary/10 transition-all border-b border-[#393528] border-t-2 border-t-primary/20 group cursor-pointer mt-1"
                        >
                            <div className="flex-1 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-primary/30 group-hover:border-primary flex items-center justify-center bg-black/40 transition-all group-hover:scale-110">
                                    <span className="material-symbols-outlined text-primary text-xl font-bold">add</span>
                                </div>
                                <div>
                                    <p className="text-[#bab29c] group-hover:text-primary font-bold text-sm transition-colors">이 포지션 참여하기</p>
                                    <p className="text-[#666] text-[10px] font-bold uppercase tracking-wider">JOIN THIS ROLE</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-[#393528] group-hover:text-primary transition-colors">chevron_right</span>
                        </div>
                    )}
                </div>
              )}
            </Droppable>
        </div>
    )
}
