import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query'; // Import queryClient
import Button from '../ui/Button';
import PositionIcon from '../ui/PositionIcon';
import AlertModal from '../ui/AlertModal';
import { ROUTES } from '../../constants/routes';
import { joinDraftRoom, getDraftLobby } from '../../api/draft';
import { instance as api } from '../../libs/axios';
import useAuthStore from '../../stores/useAuthStore';

export default function JoinWithCodeModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Initialize queryClient
  const { user } = useAuthStore();
  
  // Local state
  const [code, setCode] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null); // 'TOP', 'JNG', 'MID', 'ADC', 'SUP'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    icon: 'info'
  });
  
  const POSITIONS = ['TOP', 'JNG', 'MID', 'ADC', 'SUP', 'SPECTATOR'];

  if (!isOpen) return null;


  // 포지션 매핑 (프론트엔드 → 백엔드)
  const mapPositionToAPI = (position) => {
    const mapping = { 
      'JNG': 'JUNGLE', 
      'ADC': 'BOT',
      'SPECTATOR': 'OBSERVER'
    };
    return mapping[position] || position;
  };

  // Get position display name
  const getPositionDisplayName = (position) => {
    return position === 'SPECTATOR' ? '관전자' : position;
  };

  const handleJoin = async () => {
    if (isSubmitting) return;

    if (!code) {
        setAlertModal({
          isOpen: true,
          title: '입력 오류',
          message: '참가 코드를 입력해주세요.',
          variant: 'warning',
          icon: 'warning'
        });
        return;
    }
    if (!selectedPosition) {
        setAlertModal({
          isOpen: true,
          title: '입력 오류',
          message: '포지션을 선택해주세요.',
          variant: 'warning',
          icon: 'warning'
        });
        return;
    }

    setIsSubmitting(true);

    try {
        console.log('[JoinModal] 참가 요청:', { draftCode: code, position: mapPositionToAPI(selectedPosition) });
        

        try {
            console.log('[JoinModal] Pre-validation: Attempting to fetch lobby with code...');

            const draftsResponse = await api.get('/drafts');
            console.log('[JoinModal] Drafts response:', draftsResponse.data);
            
            const matchingDraft = draftsResponse.data?.find(d => 
                d.leaderCode === code || d.teamLeaderCode === code || d.leader === code
            );
            
            console.log('[JoinModal] Matching draft:', matchingDraft);
            console.log('[JoinModal] Code comparison:', {
                inputCode: code,
                leaderCode: matchingDraft?.leaderCode,
                teamLeaderCode: matchingDraft?.teamLeaderCode,
                leader: matchingDraft?.leader
            });
            
            if (matchingDraft) {
                console.log('[JoinModal] ⚠️ LEADER CODE DETECTED.');
                
                // Check if trying to join as observer with leader code
                if (selectedPosition === 'SPECTATOR') {
                    console.error('[JoinModal] ❌ Cannot join as observer with leader code');
                    setAlertModal({
                      isOpen: true,
                      title: '입장 불가',
                      message: '팀장은 관전자로 입장할 수 없습니다.',
                      variant: 'error',
                      icon: 'error'
                    });
                    setIsSubmitting(false);
                    return;
                }
                
                console.log('[JoinModal] Checking leader capacity...');
                console.log('[JoinModal] Draft info:', {
                    id: matchingDraft.id,
                    title: matchingDraft.title,
                    maxTeamCount: matchingDraft.maxTeamCount
                });
                

                try {
                    const lobbyData = await getDraftLobby(matchingDraft.id);
                    console.log('[JoinModal] Full lobby data:', lobbyData);
                    
                    const currentLeaderCount = Array.isArray(lobbyData.leaders) ? lobbyData.leaders.length : 0;
                    const maxTeamCount = matchingDraft.maxTeamCount || lobbyData.maxTeamCount;
                    
                    console.log('[JoinModal] 📊 CAPACITY CHECK:', {
                        currentLeaders: currentLeaderCount,
                        maxTeams: maxTeamCount,
                        leaders: lobbyData.leaders,
                        willBlock: currentLeaderCount >= maxTeamCount
                    });
                    
                    if (currentLeaderCount >= maxTeamCount) {
                        console.error('[JoinModal] ❌ PRE-VALIDATION FAILED: Leader capacity full');
                        console.error('[JoinModal] Current leaders in lobby:', lobbyData.leaders);
                        setAlertModal({
                          isOpen: true,
                          title: '팀장 자리 없음',
                          message: `현재 팀장 인원이 가득 찼습니다.\n(현재: ${currentLeaderCount}/${maxTeamCount})\n팀원 코드로 참여해주세요.`,
                          variant: 'warning',
                          icon: 'groups'
                        });
                        setIsSubmitting(false);
                        return;
                    }
                    
                    console.log('[JoinModal] ✅ Pre-validation passed. Proceeding with join...');
                } catch (lobbyCheckError) {
                    console.warn('[JoinModal] Could not verify lobby capacity:', lobbyCheckError);
 
                }
            } else {
                console.log('[JoinModal] ✅ Member code or observer - no capacity check needed');
            }
        } catch (preCheckError) {
            console.warn('[JoinModal] Pre-validation check failed, proceeding anyway:', preCheckError);

        }
        
        const result = await joinDraftRoom({ 
            draftCode: code, 
            position: mapPositionToAPI(selectedPosition)
        });
        
        console.log('[JoinModal] API 응답:', result);
        
        // API 응답에서 draftId 확인 (숫자로 직접 반환되는 경우 포함)
        let draftId;
        if (typeof result === 'number') {
            draftId = result; // API가 숫자를 직접 반환한 경우
        } else {
            draftId = result?.draftId || result?.id || result?.data?.draftId;
        }

        if (draftId) {
            // [추가 검증] 실제로 참가자 목록에 포함되었는지 확인
            // (백엔드가 정원 초과 시 에러를 안 뱉고 draftId만 주는 경우가 있어 클라이언트에서 검증)
            
            // TODO: [Backend Fix Required] 
            // 추후 백엔드에서 정원 초과 시 4xx 에러를 반환하도록 수정되면 아래 클라이언트 측 검증 로직은 제거 가능합니다.
            // 그때는 catch 블록에서 에러 메시지를 처리하면 됩니다.
            try {
                const lobbyData = await getDraftLobby(draftId);
                const myId = Number(user?.id);
                
                const leaders = Array.isArray(lobbyData.leaders) ? lobbyData.leaders : [];
                const members = Array.isArray(lobbyData.members) ? lobbyData.members : [];
                const observers = Array.isArray(lobbyData.observers) ? lobbyData.observers : [];
                
                const isInLeaders = leaders.some(l => Number(l.id) === myId);
                const isInMembers = members.some(m => Number(m.id) === myId);
                const isInObservers = observers.some(o => Number(o.id) === myId);
                
                if (!isInLeaders && !isInMembers && !isInObservers) {
                    console.warn('[JoinModal] 참가 실패 감지: 로비 데이터에 본인이 없음 (정원 초과 추정)');
                    setAlertModal({
                      isOpen: true,
                      title: '팀장 자리 없음',
                      message: '현재 팀장 인원이 가득 찼습니다.\n팀원 코드로 참여해주세요.',
                      variant: 'warning',
                      icon: 'groups'
                    });
                    setIsSubmitting(false);
                    return; // 이동하지 않고 모달 유지
                }
                
                console.log('[JoinModal] 참가 성공 확인 완료, 이동합니다:', draftId);

                
                // 중요: 이동하기 전에 캐시된 로비 데이터를 무효화하여, 
                // DraftLobby 진입 시 반드시 서버에서 최신 데이터(내가 포함된)를 가져오게 함
                await queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
                
                onClose();
                navigate(`/draft-lobby/${draftId}`);
                
            } catch (verifyError) {
                console.error('[JoinModal] 로비 정보 검증 실패:', verifyError);
                // 검증 실패해도 일단 이동 시도 (서버 에러일 수도 있으므로)
                
                // 에러 상황에서도 캐시 무효화 시도
                await queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });
                
                onClose();
                navigate(`/draft-lobby/${draftId}`);
            }

        } else {
            console.error('[JoinModal] draftId를 찾을 수 없음:', result);
            setAlertModal({
              isOpen: true,
              title: '참가 실패',
              message: '방 정보를 찾을 수 없습니다.\n응답: ' + JSON.stringify(result),
              variant: 'error',
              icon: 'error'
            });
        }
    } catch (error) {
        console.error("[JoinModal] 참가 실패:", error);
        console.error("[JoinModal] 에러 응답:", error.response?.data);
        
        const errorMessage = error.response?.data?.message || "참가에 실패했습니다.";
        const errorCode = error.response?.data?.errorCode; // 백엔드 에러 코드
        
        // 팀장 코드 + 관전자 조합 에러 처리 (우선순위 높음)
        if (errorCode === 'LEADER_CANNOT_BE_OBSERVER') {
            setAlertModal({
              isOpen: true,
              title: '입장 불가',
              message: '팀장은 관전자로 입장할 수 없습니다.',
              variant: 'error',
              icon: 'error'
            });
        } 
        // 최대 팀수 초과 에러 처리
        else if (errorCode === 'MAX_TEAM_COUNT_EXCEEDED' || errorMessage.includes("최대")) {
            setAlertModal({
              isOpen: true,
              title: '팀장 자리 없음',
              message: '현재 팀장 인원이 가득 찼습니다.\n팀원 코드로 참여해주세요.',
              variant: 'warning',
              icon: 'groups'
            });
            // 모달은 닫지 않고 유지 (사용자가 팀원 코드를 바로 입력할 수 있도록)
        } else {
            setAlertModal({
              isOpen: true,
              title: '참가 실패',
              message: errorMessage,
              variant: 'error',
              icon: 'error'
            });
        }
    } finally {
        if (!isOpen) { // If modal closed (success), don't verify (cleanup)
             setIsSubmitting(false);
        } else {
            // Only reset if we are staying on the page (error case)
             setIsSubmitting(false);
        }
    }
  };



  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-[480px] bg-[#1a1812] border border-[#393528] rounded-xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
            <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Padding Container */}
        <div className="p-8 pb-10 flex flex-col items-center">
            
            {/* Title */}
            <div className="flex flex-col items-center justify-center gap-3 mb-8">
                <div className="size-16 rounded-full bg-[#f4c025]/10 flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-[#f4c025] text-4xl font-bold">stadium</span>
                </div>
                <h2 className="text-white text-3xl font-black tracking-tight font-display">드래프트 참가하기</h2>
            </div>

            {/* Input: Code */}
            <div className="w-full mb-6">
                <label className="block text-[#bab29c] text-sm font-bold mb-2 ml-1">팀장/팀원 코드 입력</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[#555]">
                        <span className="material-symbols-outlined text-lg">key</span>
                    </span>
                    <input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="참가 코드를 입력하세요"
                        className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-14 pl-12 pr-4 text-white focus:outline-none focus:border-[#f4c025] transition-colors font-bold placeholder-[#333]"
                    />
                </div>
            </div>

            {/* Position Selection */}
            <div className="w-full mb-8">
                <label className="block text-[#bab29c] text-sm font-bold mb-3 ml-1">포지션 선택</label>
                <div className="flex justify-between gap-2">
                    {POSITIONS.map(pos => (
                        <button
                            key={pos}
                            onClick={() => setSelectedPosition(pos)}
                            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg border transition-all ${
                                selectedPosition === pos 
                                ? 'bg-[#f4c025] border-[#f4c025] text-black shadow-[0_0_15px_rgba(244,192,37,0.4)]' 
                                : 'bg-[#0f0e0b] border-[#393528] text-[#555] hover:border-[#f4c025] hover:text-[#f4c025]'
                            }`}
                        >
                            <PositionIcon position={pos} className="w-8 h-8 mb-1" />
                            <span className="text-[10px] font-bold tracking-wider">{getPositionDisplayName(pos)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <Button 
                variant="primary" 
                size="full" 
                onClick={handleJoin}
                disabled={isSubmitting}
                className={`!font-black !text-lg !rounded-lg !py-4 shadow-lg mb-4 ${
                    isSubmitting 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:brightness-110'
                }`}
            >
                {isSubmitting ? '참가 처리 중...' : '참가하기 🚀'}
            </Button>

        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        icon={alertModal.icon}
      />
    </div>
  );
}
