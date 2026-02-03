import React, { useState, useEffect } from 'react';
import wallpaper1 from '../../assets/wallpaper/draft-go-wallpaper-1.png';
import wallpaper2 from '../../assets/wallpaper/draft-go-wallpaper-2.png';
import wallpaper3 from '../../assets/wallpaper/draft-go-wallpaper-3.png';
import wallpaper4 from '../../assets/wallpaper/draft-go-wallpaper-4.png';
import wallpaper5 from '../../assets/wallpaper/draft-go-wallpaper-5.png';

const WALLPAPERS = [wallpaper1, wallpaper2, wallpaper3, wallpaper4, wallpaper5];

import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { createDraftRoom, updateDraft } from '../../api/draft';
import useAuthStore from '../../stores/useAuthStore';

export default function CreateDraftModal({ 
  isOpen, 
  onClose, 
  // 수정 모드 관련 Props
  isEditMode = false, 
  initialData = null, 
  draftId = null,
  onUpdate = null,
  activeCaptainCount = 0 
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // 폼 입력값 상태
  const [formData, setFormData] = useState({
    title: '',
    maxTeamCount: 2, 
    startPoint: 1000,
    startPrice: 100,
    thumbnailUrl: WALLPAPERS[0]
  });

  const [isLoading, setIsLoading] = useState(false);

  // 모달이 열릴 때 데이터 초기화
  useEffect(() => {
     if (isOpen) {
         if (isEditMode && initialData) {
             setFormData({
                 title: initialData.title || '',
                 maxTeamCount: initialData.maxTeamCount || 2,
                 startPoint: initialData.startPoint || 1000,
                 startPrice: initialData.startPrice || 100,
                 thumbnailUrl: initialData.thumbnailUrl || WALLPAPERS[0]
             });
         } else if (!isEditMode) {
             // 생성 모드 초기화
             setFormData({
                title: '',
                maxTeamCount: 2, 
                startPoint: 1000,
                startPrice: 100,
                thumbnailUrl: WALLPAPERS[0]
              });
         }
     }
     // 의존성 배열 경고 무시 (무한 루프 방지)
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); 

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // 숫자 입력값 처리 (빈 값 허용)
    const newValue = name === 'title' ? value : (value === '' ? '' : Number(value));
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.title.trim()) {
      alert("대회 제목을 입력해주세요.");
      return;
    }
    if (formData.maxTeamCount < 2) {
      alert("팀 수는 최소 2팀 이상이어야 합니다.");
      return;
    }
    // 활성화된 팀장 수보다 적은 팀 수로 변경 불가
    if (isEditMode && formData.maxTeamCount < activeCaptainCount) {
        alert(`현재 활성화된 팀장이 ${activeCaptainCount}명입니다. 최소 ${activeCaptainCount}팀 이상으로 설정해야 합니다.`);
        return;
    }

    if (!user) {
        alert("로그인이 필요합니다.");
        navigate('/login');
        return;
    }

    try {
        setIsLoading(true);
        
        if (isEditMode) {
             // --- 대회 수정 로직 ---
             const payload = { ...formData };
             // 숫자 타입 변환
             payload.maxTeamCount = Number(payload.maxTeamCount);
             payload.startPoint = Number(payload.startPoint);
             payload.startPrice = Number(payload.startPrice);

             console.log('[EditModal] 대회 수정 요청 START');
             console.log(' - URL:', `/drafts/${draftId}`);
             console.log(' - Payload:', JSON.stringify(payload, null, 2));

             await updateDraft(draftId, payload);
             console.log('[EditModal] 수정 성공');

             // [REMOVED] Point Sync Logic
             // Start Point change no longer overwrites individual leader points.
             
             // alert("대회 정보가 수정되었습니다."); // Parent will handle notification
             
             if (onUpdate) onUpdate(true); // Call parent with success flag
             onClose();
             
        } else {
             // --- 대회 생성 로직 ---
            console.log('[CreateModal] 대회 생성 요청:', formData);
            const result = await createDraftRoom(formData);
            
            // API 응답에서 ID 추출
            let newDraftId;
            if (typeof result === 'number') {
                newDraftId = result;
            } else {
                newDraftId = result?.draftId || result?.id || result?.data?.draftId;
            }

            if (newDraftId) {
                console.log('[CreateModal] 생성된 Draft ID:', newDraftId);
                onClose();
                navigate(`/draft-lobby/${newDraftId}`);
            } else {
                alert("대회 생성에 실패했습니다. (ID 오류)");
            }
        }
    } catch (error) {
        console.error(isEditMode ? "[EditModal] 수정 실패:" : "[CreateModal] 생성 실패:", error);
        if (error.response) {
            console.error(' - Status:', error.response.status);
            console.error(' - Data:', JSON.stringify(error.response.data, null, 2));
        }
        alert((isEditMode ? "수정 중 오류 (상세 로그 확인): " : "생성 중 오류: ") + (error.response?.data?.message || error.message));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-[520px] bg-[#1a1812] border border-[#393528] rounded-xl overflow-hidden shadow-2xl flex flex-col animate-scaleIn"
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
            <div className="flex flex-col items-center justify-center gap-3 mb-6">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(200,155,60,0.2)]">
                    <span className="material-symbols-outlined text-primary text-4xl font-bold">
                        {isEditMode ? 'settings_suggest' : 'add_circle'}
                    </span>
                </div>
                <h2 className="text-white text-3xl font-black tracking-tight font-display">
                    {isEditMode ? '로비 정보 수정' : '새로운 대회 생성'}
                </h2>
                <p className="text-[#bab29c] text-sm">
                    {isEditMode ? '대회 설정을 변경합니다 (진행 중인 내용은 유지됩니다)' : '드래프트 설정을 입력하고 대회를 시작하세요'}
                </p>
            </div>

            {/* Form Fields */}
            <div className="w-full space-y-4 mb-8">
                
                {/* 1. 대회 제목 */}
                <div>
                    <label className="block text-[#bab29c] text-xs font-bold mb-1 ml-1 uppercase tracking-wider">대회 제목</label>
                    <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="예: 2026 스프링 시즌 결승전"
                        className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors font-bold placeholder-[#333]"
                        autoFocus={!isEditMode}
                    />
                </div>

                {/* 2. 팀 수 & 시작 포인트 (Row) */}
                <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-[#bab29c] text-xs font-bold mb-1 ml-1 uppercase tracking-wider">참가 팀 수</label>
                        <select
                            name="maxTeamCount"
                            value={formData.maxTeamCount}
                            onChange={handleChange}
                            className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-12 px-4 text-white focus:outline-none focus:border-primary transition-colors font-bold"
                        >
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num}팀</option>
                            ))}
                        </select>
                    </div>
                     <div className="flex-1">
                        <label className="block text-[#bab29c] text-xs font-bold mb-1 ml-1 uppercase tracking-wider">시작 포인트</label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-[#555] font-bold">P</span>
                            <input 
                                type="number" 
                                name="startPoint"
                                value={formData.startPoint}
                                onChange={handleChange}
                                className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-12 pl-8 pr-4 text-white focus:outline-none focus:border-primary transition-colors font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                         </div>
                    </div>
                </div>

                {/* 3. 시작 최소가 */}
                <div>
                    <label className="block text-[#bab29c] text-xs font-bold mb-1 ml-1 uppercase tracking-wider">경매 시작 최소가</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-[#555] font-bold">P</span>
                        <input 
                            type="number" 
                            name="startPrice"
                            value={formData.startPrice}
                            onChange={handleChange}
                            className="w-full bg-[#0f0e0b] border border-[#393528] rounded-lg h-12 pl-8 pr-4 text-white focus:outline-none focus:border-primary transition-colors font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    </div>

                {/* 4. 배경 이미지 선택 */}
                <div>
                    <label className="block text-[#bab29c] text-xs font-bold mb-2 ml-1 uppercase tracking-wider">배경 이미지 선택</label>
                    <div className="grid grid-cols-5 gap-2">
                        {WALLPAPERS.map((wp, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: wp }))}
                                className={`relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                                    formData.thumbnailUrl === wp 
                                    ? 'border-primary shadow-[0_0_10px_rgba(200,155,60,0.4)] scale-105 z-10' 
                                    : 'border-transparent hover:border-[#bab29c] opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img src={wp} alt={`Wallpaper ${idx + 1}`} className="w-full h-full object-cover" />
                                {formData.thumbnailUrl === wp && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white font-bold drop-shadow-md">check</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Submit Button */}
            <Button 
                variant="primary" 
                size="full" 
                onClick={handleSubmit}
                disabled={isLoading}
                className="!font-black !text-lg !rounded-lg !py-4 shadow-lg hover:brightness-110"
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                         <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
                         {isEditMode ? '수정 중...' : '생성 중...'}
                    </span>
                ) : (
                    isEditMode ? "수정 완료" : "대회 생성하기"
                )}
            </Button>

        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
}
