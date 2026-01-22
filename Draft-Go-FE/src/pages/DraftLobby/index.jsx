import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TeamLeaderCard from "../../components/Ui/TeamLeaderCard";
import ChatBubble from "../../components/Ui/ChatBubble";
import ChatInput from "../../components/Ui/ChatInput";
import SectionTitle from "../../components/ui/SectionTitle";
import Button from "../../components/ui/Button";
import CodeGenerationModal from "../../components/Ui/CodeGenerationModal";
import TeamLeaderSettingsModal from "../../components/Ui/TeamLeaderSettingsModal";
import ParticipantProfileModal from "../../components/Ui/ParticipantProfileModal";
import KickConfirmModal from "../../components/Ui/KickConfirmModal";
import Badge from "../../components/ui/Badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const DUMMY_CAPTAINS = [
  { 
    id: 1, name: "Hide on bush", tier: "Challenger", teamNumber: 1, image: "", ready: true, selectedRole: null, isSelf: false, 
    points: 1000,  // 경매 포인트
    lp: 358,       // 실제 롤 LP
    role: 'MID',
    primaryRole: 'MID',    // 주포지션
    secondaryRole: 'TOP',  // 부포지션
    mostChampions: [
      { name: "Zed", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Zed.png", games: 45, winRate: 68, kda: 4.2 },
      { name: "Yasuo", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Yasuo.png", games: 32, winRate: 62, kda: 3.8 },
      { name: "Akali", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Akali.png", games: 28, winRate: 59, kda: 3.5 }
    ]
  },
  { 
    id: 2, name: "Canyon Fan", tier: "Grandmaster", teamNumber: 2, image: "", ready: true, selectedRole: "JNG", isSelf: false, 
    points: 1000,
    lp: 245,
    role: 'JNG',
    primaryRole: 'JNG',
    secondaryRole: 'SUP',
    mostChampions: [
      { name: "LeeSin", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/LeeSin.png", games: 52, winRate: 71, kda: 4.5 },
      { name: "Graves", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Graves.png", games: 38, winRate: 65, kda: 3.9 }
    ]
  },
  { 
    id: 3, name: "Ruler of Bot", tier: "Master", teamNumber: 3, image: "", ready: true, selectedRole: "ADC", isSelf: false, 
    points: 1000,
    lp: 122,
    role: 'ADC',
    primaryRole: 'ADC',
    secondaryRole: 'MID',
    mostChampions: [
      { name: "Jinx", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jinx.png", games: 48, winRate: 66, kda: 4.1 },
      { name: "Caitlyn", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Caitlyn.png", games: 35, winRate: 60, kda: 3.7 },
      { name: "Aphelios", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Aphelios.png", games: 25, winRate: 56, kda: 3.3 }
    ]
  }
];

const DUMMY_MESSAGES = [
  { id: 1, sender: "System", message: "Player 'Vayne Main KR' 님이 입장했습니다.", variant: "system" },
  { id: 2, sender: "Hide on bush", message: "이번 드래프트 팀장님들 다들 티어가 높네요. 재미있을 것 같습니다.", variant: "other" },
  { id: 3, sender: "나 (Me)", message: "준비되시면 바로 경매 시작하겠습니다!", variant: "me" },
  { id: 4, sender: "System", message: "방장님이 대회 규칙을 변경하였습니다.", variant: "system" },
  { id: 5, sender: "Canyon Fan", message: "ㄱㄱㄱ", variant: "other" },
];

const DUMMY_POOL = {
  TOP: [
    {
      name: "Diamond Player 01", 
      tier: "Diamond I", 
      color: "text-[var(--color-tier-diamond-text)]",
      lp: 87,
      primaryRole: "TOP",
      secondaryRole: "JNG",
      mostChampions: [
        { name: "Garen", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Garen.png", games: 35, winRate: 63, kda: 3.2 },
        { name: "Darius", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Darius.png", games: 28, winRate: 57, kda: 2.8 }
      ]
    },
    {
      name: "Top King KR", 
      tier: "Emerald II", 
      color: "text-[var(--color-tier-emerald-text)]",
      lp: 45,
      primaryRole: "TOP",
      secondaryRole: "MID",
      mostChampions: [
        { name: "Jax", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Jax.png", games: 42, winRate: 60, kda: 3.5 }
      ]
    }
  ],
  JNG: [
    {
      name: "LeeSin Master", 
      tier: "Platinum I", 
      color: "text-[var(--color-tier-platinum-text)]",
      lp: 72,
      primaryRole: "JNG",
      secondaryRole: "TOP",
      mostChampions: [
        { name: "LeeSin", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/LeeSin.png", games: 58, winRate: 68, kda: 4.1 },
        { name: "KhaZix", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Khazix.png", games: 31, winRate: 61, kda: 3.6 }
      ]
    }
  ],
  MID: [
    {
      name: "Mid Lane Ruler", 
      tier: "Emerald III", 
      color: "text-[var(--color-tier-emerald-text)]",
      lp: 33,
      primaryRole: "MID",
      secondaryRole: "ADC",
      mostChampions: [
        { name: "Ahri", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ahri.png", games: 47, winRate: 64, kda: 3.9 },
        { name: "Syndra", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Syndra.png", games: 29, winRate: 59, kda: 3.4 }
      ]
    }
  ],
  ADC: [
    {
      name: "Vayne Main KR", 
      tier: "Diamond IV", 
      color: "text-[var(--color-tier-diamond-text)]",
      lp: 21,
      primaryRole: "ADC",
      secondaryRole: "MID",
      mostChampions: [
        { name: "Vayne", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Vayne.png", games: 73, winRate: 70, kda: 4.7 },
        { name: "Ezreal", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ezreal.png", games: 38, winRate: 62, kda: 3.8 }
      ]
    },
    {
      name: "Gold Marksman", 
      tier: "Gold I", 
      color: "text-[var(--color-tier-gold-text)]",
      lp: 91,
      primaryRole: "ADC",
      secondaryRole: "SUP",
      mostChampions: [
        { name: "Ashe", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ashe.png", games: 45, winRate: 58, kda: 3.3 }
      ]
    }
  ],
  SUP: [
    {
      name: "Thresh Hook God", 
      tier: "Emerald I", 
      color: "text-[var(--color-tier-emerald-text)]",
      lp: 56,
      primaryRole: "SUP",
      secondaryRole: "JNG",
      mostChampions: [
        { name: "Thresh", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Thresh.png", games: 67, winRate: 66, kda: 4.2 },
        { name: "Blitzcrank", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Blitzcrank.png", games: 34, winRate: 59, kda: 3.5 }
      ]
    },
    {
      name: "Bronze escaped", 
      tier: "Silver II", 
      color: "text-[var(--color-tier-silver-text)]",
      lp: 14,
      primaryRole: "SUP",
      secondaryRole: "ADC",
      mostChampions: [
        { name: "Soraka", imageUrl: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Soraka.png", games: 52, winRate: 55, kda: 3.1 }
      ]
    }
  ],
  SPECTATOR: [
    {name: "Tournament Admin", tier: "MANAGER", color: "text-[#666]"},
    {name: "Observer 01", tier: "OBSERVER", color: "text-[#666]"}
  ]
};

export default function DraftLobby() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Local State for UI Testing ---
  const [userRole, setUserRole] = useState("CAPTAIN"); // 'ADMIN', 'CAPTAIN', 'CREW'
  const [isHost, setIsHost] = useState(false); // New State: Admin Privilege
  const [lobbyTitle, setLobbyTitle] = useState("[2026 KR] 토너먼트");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codes, setCodes] = useState({
      teamLeaderCode: "CAPTAIN-2026",
      teamMemberCode: "CREW-8282"
  });
  const [captains, setCaptains] = useState(DUMMY_CAPTAINS);
  const [draftPool, setDraftPool] = useState(DUMMY_POOL);
  const [messages, setMessages] = useState([
    { id: 1, sender: "System", message: "드래프트 로비에 입장하셨습니다.", variant: "system", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);

  // Auto-scroll for chat
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Join Logic from Home
  useEffect(() => {
    if (location.state) {
        const { code, position, role } = location.state;
        
        // Determine Host Privilege
        let hostPrivilege = false;
        if (role === 'ADMIN' || (code && code.includes("HOST"))) {
            hostPrivilege = true;
        }
        setIsHost(hostPrivilege);

        if (role === 'SPECTATOR') {
             // ... Spectator logic
             // eslint-disable-next-line
             setDraftPool(prev => ({
                ...prev,
                SPECTATOR: [...prev.SPECTATOR, {
                    name: `관전자_${Math.floor(Math.random()*100)}`,
                    tier: "Unranked",
                    color: "text-gray-400",
                    isSelf: true
                }]
             }));
             setUserRole('CREW'); 
        } else if (code && code.includes("CAPTAIN")) {
            // Assign to Captain Slot
            setCaptains(prev => {
                // Reset isSelf for all existing captains to ensure exclusivity
                const resetCaptains = prev.map(c => ({ ...c, isSelf: false }));
                const emptySlotIndex = resetCaptains.findIndex(c => !c.name || c.tier === "Unassigned");
                
                const newCaptainData = {
                    name: hostPrivilege ? "나 (Host & Captain)" : "나 (Me)",
                    tier: "Challenger",
                    image: "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png",
                    ready: false,
                    points: 1000,
                    lp: 850,
                    isSelf: true,
                    role: position,
                    mostChampions: []
                };

                if (emptySlotIndex !== -1) {
                    const newCaptains = [...resetCaptains];
                    newCaptains[emptySlotIndex] = {
                        ...newCaptains[emptySlotIndex],
                        ...newCaptainData
                    };
                    return newCaptains;
                } else {
                    // Append new captain
                    return [...resetCaptains, {
                        id: Date.now(),
                        teamNumber: resetCaptains.length + 1,
                        ...newCaptainData,
                        selectedRole: null
                    }];
                }
            });
            setUserRole('CAPTAIN');
        } else {
            // ... Draft Pool logic
             if (draftPool[position]) {
                setDraftPool(prev => ({
                    ...prev,
                    [position]: [...prev[position], {
                        name: hostPrivilege ? "나 (Host)" : "나 (Me)",
                        tier: "Diamond II",
                        color: "text-blue-400",
                        isSelf: true,
                        lp: 50,
                        primaryRole: position,
                        secondaryRole: 'MID', // Dummy
                        mostChampions: ['Ahri', 'Yasuo', 'LeeSin']
                    }]
                }));
             }
             setUserRole('CREW');
        }
        
        // Clear state to prevent re-running on refresh
        navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);
  const handleRefreshCode = (type) => {
      // Dummy Logic
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      if (type === 'LEADER') {
          setCodes(prev => ({...prev, teamLeaderCode: `CAPTAIN-${randomStr}`}));
      } else {
          setCodes(prev => ({...prev, teamMemberCode: `CREW-${randomStr}`}));
      }
  };

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSettingsCaptain, setSelectedSettingsCaptain] = useState(null);
  
  // Kick Feature
  const [isKickModalOpen, setIsKickModalOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState(null); // { type: 'CAPTAIN' | 'POOL', id: number | string, name: string, dropId: string (optional) }

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // TODO: API 연동 - 초기 데이터 로딩
  // useEffect(() => {
  //   const fetchDraftData = async () => {
  //     try {
  //       const response = await fetch('/api/draft/lobby');
  //       const data = await response.json();
  //       setCaptains(data.captains);  // mostChampions 포함
  //       setDraftPool(data.pool);
  //     } catch (error) {
  //       console.error('Draft 데이터 로딩 실패:', error);
  //     }
  //   };
  //   fetchDraftData();
  // }, []);

  // Handlers
  const handleKickClick = (target, isSelf = false) => {
    setKickTarget({ ...target, isSelf });
    setIsKickModalOpen(true);
  };

  const confirmKick = () => {
    if (!kickTarget) return;

    // Self Leave Logic
    if (kickTarget.isSelf) {
        setIsKickModalOpen(false);
        // Navigate to Home
        navigate('/');
        return;
    }

    if (kickTarget.type === 'CAPTAIN') {
       // Remove Captain Slot
       setCaptains(prev => prev.filter(c => c.id !== kickTarget.id));
       
       // Log system message
       setMessages(prev => [...prev, {
          id: Date.now(),
          sender: "System",
          message: `관리자가 '[팀장] ${kickTarget.name}' 님을 퇴장시켰습니다.`,
          variant: "system"
       }]);

    } else if (kickTarget.type === 'POOL') {
       // Remove from Pool
       // target.dropId = "pool-TOP" etc. -> extract role "TOP"
       const roleKey = kickTarget.role; 
       
       if (draftPool[roleKey]) {
          setDraftPool(prev => ({
             ...prev,
             [roleKey]: prev[roleKey].filter(p => (p.name !== kickTarget.name)) // name is unique in this data
          }));
          
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: "System",
            message: `관리자가 '[대기열] ${kickTarget.name}' 님을 퇴장시켰습니다.`,
            variant: "system"
         }]);
       }
    }
    
    setIsKickModalOpen(false);
    setKickTarget(null);
  };

  // Derived State: Captains + Pool (Excluding Spectators)
  const totalParticipants = captains.filter(c => c.name).length + 
    Object.entries(draftPool).reduce((acc, [role, players]) => role === 'SPECTATOR' ? acc : acc + players.length, 0);

  // Captain Interaction Handlers
  const handleRoleSelect = (captainId, role) => {
    setCaptains(prev => prev.map(c => 
      c.id === captainId ? { ...c, selectedRole: role } : c
    ));
  };

  const handleReadyToggle = (captainId) => {
    setCaptains(prev => prev.map(c => 
      c.id === captainId ? { ...c, ready: !c.ready } : c
    ));
  };

  const handleOpenSettings = (captain) => {
    setSelectedSettingsCaptain(captain);
    setIsSettingsModalOpen(true);
  };

  const handleOpenProfile = (participant) => {
    console.log('handleOpenProfile called:', participant, 'userRole:', userRole);
    // CAPTAIN/CREW/HOST confirm profile view
    if (userRole === 'CAPTAIN' || userRole === 'CREW' || isHost) {
      // Captain 데이터를 모달 형식에 맞게 변환
      const profileData = {
        summonerName: participant.name,
        profileIconUrl: participant.image || "",
        tier: participant.tier,
        lp: participant.lp || 0,  // points가 아닌 lp 사용
        level: 432, // 임시 데이터 (API에서 받을 예정)
        winRate: 54,  // 임시 데이터
        recent20: { wins: 12, losses: 8 },  // 임시 데이터
        mostChampions: participant.mostChampions || [],  // 참가자의 실제 mostChampions 사용
        mainPosition: participant.mainPosition || participant.primaryRole || null,  // 주포지션
        subPosition: participant.subPosition || participant.secondaryRole || null,  // 부포지션
        lastUpdated: null
      };
      setSelectedParticipant(profileData);
      setIsProfileModalOpen(true);
      console.log('Profile modal should open with data:', profileData);
    }
  };

  const handleRefreshProfile = async () => {
    // TODO: API 호출로 최신 전적 가져오기
    console.log('전적 갱신:', selectedParticipant);
    
    // try {
    //   const response = await fetch(`/api/summoner/${selectedParticipant.summonerName}/refresh`, {
    //     method: 'POST'
    //   });
    //   const updatedData = await response.json();
    //   
    //   // 프로필 모달 데이터 업데이트
    //   setSelectedParticipant({
    //     ...selectedParticipant,
    //     level: updatedData.level,
    //     winRate: updatedData.winRate,
    //     recent20: updatedData.recent20,
    //     mostChampions: updatedData.mostChampions,
    //     lastUpdated: updatedData.lastUpdated
    //   });
    //   
    //   // captains 상태도 업데이트 (카드에도 반영)
    //   setCaptains(prev => prev.map(c => 
    //     c.name === selectedParticipant.summonerName 
    //       ? { ...c, mostChampions: updatedData.mostChampions, lp: updatedData.lp }
    //       : c
    //   ));
    // } catch (error) {
    //   console.error('전적 갱신 실패:', error);
    //   alert('전적 갱신에 실패했습니다.');
    // }
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

  const getTierTextClass = (tier) => {
        if (!tier) return "text-[#bab29c]";
        const tierLower = tier.split(" ")[0].toLowerCase();
        return TIER_TEXT_COLORS[tierLower] || `text-[var(--color-tier-${tierLower}-text)]`;
  };

  const handleSaveSettings = (captainId, newData) => {
      const oldCaptain = captains.find(c => c.id === captainId);
      const poolList = Object.values(draftPool).flat();
      const newCaptainFromPool = poolList.find(p => p.name === newData.name);

      // --- CASE 1: Adding New Captain (No existing captain found with ID) ---
      if (!oldCaptain) {
          if (!newCaptainFromPool) return; 

          // 1. Remove from Pool
          const sourceRole = Object.keys(draftPool).find(role => draftPool[role].some(p => p.name === newData.name));
          setDraftPool(prev => ({
              ...prev,
              [sourceRole]: prev[sourceRole].filter(p => p.name !== newData.name)
          }));

          // 2. Add to Captains
          setCaptains(prev => [
              ...prev,
              {
                  id: Date.now(),
                  name: newCaptainFromPool.name,
                  tier: newCaptainFromPool.tier,
                  teamNumber: prev.length + 1,
                  image: "",
                  ready: false,
                  selectedRole: null,
                  isSelf: false,
                  points: newData.points,
                  role: sourceRole
              }
          ]);
          setIsSettingsModalOpen(false);
          return;
      }

      // --- CASE 2: Updating Existing Captain ---
      if (newCaptainFromPool && newCaptainFromPool.name !== oldCaptain.name) {
          let newCaptainRole = null;
          for (const [role, players] of Object.entries(draftPool)) {
              if (players.some(p => p.name === newData.name)) {
                  newCaptainRole = role;
                  break;
              }
          }

          setDraftPool(prev => {
              const newPool = { ...prev };
              // Remove new captain
              for (const role in newPool) {
                  newPool[role] = newPool[role].filter(p => p.name !== newData.name);
              }
              // Add old captain back
              if (oldCaptain && oldCaptain.name) {
                const targetRole = oldCaptain.role || 'MID';
                const oldCaptainForPool = {
                    name: oldCaptain.name,
                    tier: oldCaptain.tier,
                    color: getTierTextClass(oldCaptain.tier)
                };
                if (!newPool[targetRole]) newPool[targetRole] = [];
                newPool[targetRole].push(oldCaptainForPool);
              }
              return newPool;
          });

          setCaptains(prev => prev.map(c => 
            c.id === captainId ? { 
               ...c, 
               name: newCaptainFromPool.name, 
               tier: newCaptainFromPool.tier, 
               points: newData.points,
               role: newCaptainRole || c.role,
               ready: false
            } : c
          ));
      } else {
          // Just Update Points
          setCaptains(prev => prev.map(c => 
            c.id === captainId ? { ...c, points: newData.points } : c
          ));
      }
      setIsSettingsModalOpen(false);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Helper to determine if ID is a captain slot
    const isCaptainSlot = (id) => id.startsWith('captain-slot-');
    
    // Helper to get slot index
    const getSlotIndex = (id) => parseInt(id.split('captain-slot-')[1]);

// Helper used from component scope

    const isSourceCaptain = isCaptainSlot(source.droppableId);
    const isDestCaptain = isCaptainSlot(destination.droppableId);
    
    // 1. Captain <-> Captain (Swap Order)
    if (isSourceCaptain && isDestCaptain) {
        const sourceIndex = getSlotIndex(source.droppableId);
        const destIndex = getSlotIndex(destination.droppableId);
        
        // Sort/Swap logic
        const newCaptains = [...captains];
        // If simply swapping positions
        const temp = newCaptains[sourceIndex];
        newCaptains[sourceIndex] = newCaptains[destIndex];
        newCaptains[destIndex] = temp;
        
        // Re-assign Team Numbers order? No, usually ID/Team stays, just user moves?
        // Actually, dragging Captain A to Captain B slot usually means "Swap Order".
        // Let's swap the whole objects.
        // And then update teamNumbers based on index.
        const reordered = newCaptains.map((c, i) => ({ ...c, teamNumber: i + 1 }));
        setCaptains(reordered);
        return;
    }

    // 2. Pool -> Captain Slot (Promotion)
    if (!isSourceCaptain && isDestCaptain) {
        const destIndex = getSlotIndex(destination.droppableId);
        const sourceRole = source.droppableId.split('-')[1];
        const poolList = draftPool[sourceRole];
        const player = poolList[source.index];

        const newPool = { ...draftPool };
        // Remove from Pool
        newPool[sourceRole] = poolList.filter((_, i) => i !== source.index);

        const newCaptainData = {
             id: Date.now(),
             name: player.name,
             tier: player.tier,
             teamNumber: destIndex + 1,
             image: "",
             ready: false,
             role: sourceRole,
             selectedRole: null,
             isSelf: false,
             points: 1000
        };

        // If Adding to End (New Slot)
        if (destIndex === captains.length) {
             setDraftPool(newPool);
             setCaptains(prev => [...prev, newCaptainData]);
             return;
        }

        // If Replacing Existing
        const targetCaptain = captains[destIndex];
        if (targetCaptain) {
             // Return old captain to pool
             const oldCapRole = targetCaptain.role || 'MID';
             if (!newPool[oldCapRole]) newPool[oldCapRole] = [];
             newPool[oldCapRole].push({
                 name: targetCaptain.name,
                 tier: targetCaptain.tier,
                 color: getTierTextClass(targetCaptain.tier)
             });
             
             const newCaptains = [...captains];
             newCaptains[destIndex] = { ...newCaptainData, id: targetCaptain.id }; // Keep Slot ID if replacing?
             // Actually, simplified: Just replace content.
             setCaptains(newCaptains);
             setDraftPool(newPool);
        }
        return;
    }

    // 3. Captain Slot -> Pool (Demotion)
    if (isSourceCaptain && !isDestCaptain) {
        const sourceIndex = getSlotIndex(source.droppableId);
        const destRole = destination.droppableId.split('-')[1];
        const captainToDemote = captains[sourceIndex];

        if (!captainToDemote) return;

        // Remove from Captains
        const newCaptains = [...captains];
        newCaptains.splice(sourceIndex, 1);
        
        // Re-assign Team Numbers
        const reordered = newCaptains.map((c, i) => ({ ...c, teamNumber: i + 1 }));
        setCaptains(reordered);

        // Add to Pool
        setDraftPool(prev => {
             const newPool = { ...prev };
             const targetRole = destRole; 
             
             const playerForPool = {
                 name: captainToDemote.name,
                 tier: captainToDemote.tier,
                 color: getTierTextClass(captainToDemote.tier)
             };
             
             const destList = [...(newPool[targetRole] || [])];
             destList.splice(destination.index, 0, playerForPool);
             newPool[targetRole] = destList;
             return newPool;
        });
        return;
    }

    // 4. Pool -> Pool (Reorder inside pool)
    if (!isSourceCaptain && !isDestCaptain) {
        const sourceRole = source.droppableId.split('-')[1];
        const destRole = destination.droppableId.split('-')[1];

        const newPool = { ...draftPool };
        const sourceList = [...newPool[sourceRole]];
        const [movedPlayer] = sourceList.splice(source.index, 1);

        if (sourceRole === destRole) {
             sourceList.splice(destination.index, 0, movedPlayer);
             newPool[sourceRole] = sourceList;
        } else {
             newPool[sourceRole] = sourceList; // Removed source
             const destList = [...newPool[destRole]];
             destList.splice(destination.index, 0, movedPlayer);
             newPool[destRole] = destList;
        }
        setDraftPool(newPool);
    }
  };

  const handleJoinPool = (targetRole) => {
      const myName = "나 (Me)";
      const meData = { name: myName, tier: "Gold", tierLower: "gold", color: getTierTextClass("Gold"), isSelf: true };
      
      setDraftPool(prev => {
          const newPool = { ...prev };
          // Remove me from any role
          Object.keys(newPool).forEach(role => {
              newPool[role] = newPool[role].filter(p => p.name !== myName);
          });
          
          // Add to target role
          if (!newPool[targetRole]) newPool[targetRole] = [];
          newPool[targetRole].push(meData);
          
          return newPool;
      });
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
           {/* Dev Tool: Role Switcher */}
           <div className="absolute top-4 left-4 z-50 flex gap-2 bg-black/50 p-2 rounded backdrop-blur-md border border-gray-700">
              <span className="text-xs font-bold text-gray-400">DEV MODE: {userRole}</span>
              <button onClick={() => setUserRole("ADMIN")} className={`text-xs px-2 py-0.5 rounded ${userRole==='ADMIN'?'bg-primary text-black':'bg-gray-700'}`}>Admin</button>
              <button onClick={() => setUserRole("CAPTAIN")} className={`text-xs px-2 py-0.5 rounded ${userRole==='CAPTAIN'?'bg-primary text-black':'bg-gray-700'}`}>Captain</button>
              <button onClick={() => setUserRole("CREW")} className={`text-xs px-2 py-0.5 rounded ${userRole==='CREW'?'bg-primary text-black':'bg-gray-700'}`}>Crew</button>
           </div>

           <div className="p-8 lg:p-10 flex-1">
              {/* Page Title & Stats */}
              <div className="mb-10 flex items-end justify-between border-b border-[#393528] pb-6">
                <div className="min-w-0 flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-2 rounded-full bg-red-500 animate-pulse"></div>
                    <p className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Live Tournament Lobby</p>
                  </div>
                  <SectionTitle className="!text-3xl whitespace-nowrap overflow-hidden text-ellipsis text-glow flex items-center gap-3">
                    {isEditingTitle ? (
                         <div className="flex items-center gap-2">
                            <input 
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                className="bg-[#0f0e0b] border border-[#393528] text-white text-2xl font-bold px-3 py-1 rounded focus:outline-none focus:border-primary w-full min-w-[320px]"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setLobbyTitle(tempTitle);
                                        setIsEditingTitle(false);
                                    } else if (e.key === 'Escape') {
                                        setIsEditingTitle(false);
                                    }
                                }}
                            />
                            <button 
                                onClick={() => {
                                    setLobbyTitle(tempTitle);
                                    setIsEditingTitle(false);
                                }}
                                className="text-green-500 hover:text-green-400"
                            >
                                <span className="material-symbols-outlined">check</span>
                            </button>
                            <button 
                                onClick={() => setIsEditingTitle(false)}
                                className="text-red-500 hover:text-red-400"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                         </div>
                    ) : (
                        <>
                            {lobbyTitle}
                            {isHost && (
                                <button 
                                    onClick={() => {
                                        setTempTitle(lobbyTitle);
                                        setIsEditingTitle(true);
                                    }}
                                    className="text-[#555] hover:text-primary transition-colors mt-1"
                                    title="방 제목 수정"
                                >
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                </button>
                            )}
                        </>
                    )}
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
                                                    onCardClick={(userRole === 'CAPTAIN' || userRole === 'CREW' || isHost) && !captain.isSelf 
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
                    {isHost && (
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
                            <Badge variant="platinum">PLATINUM II</Badge>
                            <span className="text-white font-bold text-sm">플래티넘 2</span>
                        </div>
                    </div>
                 </div>

                 {/* Right: Role Breakdown */}
                 <div className="flex-1 flex justify-around w-full">
                    {['TOP', 'JNG', 'MID', 'ADC', 'SUP'].map(role => (
                        <div key={role} className="flex flex-col items-center text-center gap-1 group cursor-default">
                             <div className="text-[#bab29c] group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-2xl">
                                    {role === 'TOP' && 'stat_1'}
                                    {role === 'JNG' && 'forest'}
                                    {role === 'MID' && 'lan'}
                                    {role === 'ADC' && 'target'}
                                    {role === 'SUP' && 'flare'}
                                </span>
                             </div>
                             <p className="text-[#bab29c] text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">{role}</p>
                                {draftPool[role]?.length || 0}
                             <p className="text-[#666] text-[10px] font-bold">
                                평균: {role === 'TOP' && 'Gold 1'}
                                {role === 'JNG' && 'Platinum 4'}
                                {role === 'MID' && 'Emerald 3'}
                                {role === 'ADC' && 'Gold 2'}
                                {role === 'SUP' && 'Silver 1'}
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
                        roleIcon="stat_1" 
                        count={draftPool.TOP.length} 
                        players={draftPool.TOP} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'TOP', name: p.name, id: p.name }, isSelf)}
                     />
                     
                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-JNG" 
                        roleName="정글 (Jungle)" 
                        roleIcon="forest" 
                        count={draftPool.JNG.length} 
                        players={draftPool.JNG} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'JNG', name: p.name, id: p.name }, isSelf)}
                     />
                     
                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-MID" 
                        roleName="미드 (Mid)" 
                        roleIcon="lan" 
                        count={draftPool.MID.length} 
                        players={draftPool.MID} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'MID', name: p.name, id: p.name }, isSelf)}
                     />
                     
                    {/* Row 2 */}
                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-ADC" 
                        roleName="원딜 (ADC)" 
                        roleIcon="target" 
                        count={draftPool.ADC.length} 
                        players={draftPool.ADC} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'ADC', name: p.name, id: p.name }, isSelf)}   
                     />

                     <DraftPoolColumn 
                        onJoin={handleJoinPool} 
                        onPlayerClick={handleOpenProfile} 
                        droppableId="pool-SUP" 
                        roleName="서포터 (SUP)" 
                        roleIcon="flare" 
                        count={draftPool.SUP.length} 
                        players={draftPool.SUP} 
                        userRole={userRole} 
                        isAdmin={isHost}
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'SUP', name: p.name, id: p.name }, isSelf)}
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
                        onKick={(p, isSelf) => handleKickClick({ type: 'POOL', role: 'SPECTATOR', name: p.name, id: p.name }, isSelf)}
                     />
                 </div>
              </section>

              {/* Auction Control / Status - Bottom Right */}
              <div className="flex justify-end pt-4" style={{ marginBottom: '1px' }}> {/* Adjusted alignment */}
                  {isHost ? (
                      <Button 
                        variant="bid" 
                        disabled={!captains.filter(c => c.name).every(c => c.ready)}
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

      {/* --- DEV TOOLS: REMOVE IN PRODUCTION --- */}
      <div className="fixed bottom-4 left-4 bg-black/80 p-4 rounded-lg border border-red-500/50 z-50 text-xs font-mono backdrop-blur-md">
        <h5 className="text-red-400 font-bold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">bug_report</span> 
            DEV MODE CONTROLS
        </h5>
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
                <span className="text-[#bab29c]">Host Privilege:</span>
                <button 
                    onClick={() => setIsHost(!isHost)}
                    className={`px-2 py-1 rounded ${isHost ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                >
                    {isHost ? 'ON' : 'OFF'}
                </button>
            </div>
            <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[#bab29c]">User Role:</span>
                <select 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value)}
                    className="bg-[#2a2215] text-[#f4c025] border border-[#393528] rounded px-1 py-1 outline-none"
                    disabled={userRole === 'ADMIN'} // Admin role is deprecated in favor of isHost + Spectator, but keeping for legacy check
                >
                    <option value="CAPTAIN">CAPTAIN</option>
                    <option value="CREW">CREW</option>
                    <option value="ADMIN">ADMIN (Legacy)</option>
                </select>
            </div>
            <div className="text-[10px] text-[#666]">
                Current: {isHost ? '[HOST]' : ''} {userRole}
            </div>
        </div>
      </div>

    </div>
    </DragDropContext>
  );
}

// Internal Sub-component for Draft Pool Column to keep file clean
function DraftPoolColumn({ roleName, roleIcon, count, players, userRole, isAdmin, droppableId, onJoin, onPlayerClick, onKick }) {
    // 현재 사용자가 이미 이 풀에 있는지 확인
    const hasCurrentUser = players.some(p => p.isSelf || p.name === "나 (Me)");
    
    return (
        <div className="flex flex-col h-full">
            <div className={`bg-gradient-to-r ${isAdmin ? 'from-[#3a2e15] to-[#2a2215] border-yellow-600' : 'from-[#1e1a0d] to-[#161410] border-primary'} border-l-4 px-5 py-3 mb-0 rounded-t-lg flex items-center justify-between`}>
                <h4 className="text-white font-bold text-base flex items-center gap-2 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-primary text-xl">{roleIcon}</span> {roleName}
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
                        <Draggable key={p.name} draggableId={`player-${p.name}`} index={idx} isDragDisabled={!isAdmin}>
                           {(provided) => (
                                <div
                                   ref={provided.innerRef}
                                   {...provided.draggableProps}
                                   {...provided.dragHandleProps}
                                   className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors border-b border-[#393528] last:border-0 group cursor-pointer relative"
                                   onClick={(e) => {
                                     // DnD 핸들 클릭이 아닐 때만 프로필 열기
                                     if (onPlayerClick && (userRole === 'CAPTAIN' || userRole === 'CREW' || isAdmin)) {
                                       e.stopPropagation();
                                       onPlayerClick(p);
                                     }
                                   }}
                                >
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-sm group-hover:text-primary transition-colors">{p.name}</p>
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
                    
                    {/* Crew 'Join' Card - 이미 참여한 포지션에는 표시 안 함 */}
                    {userRole === 'CREW' && !hasCurrentUser && (
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
