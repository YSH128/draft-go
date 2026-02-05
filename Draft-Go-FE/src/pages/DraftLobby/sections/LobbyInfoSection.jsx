import React from 'react';
import SectionTitle from '../../../components/ui/SectionTitle';
import Button from '../../../components/ui/Button';

export default function LobbyInfoSection({
    lobbyTitle,
    isHost,
    totalParticipants,
    startPoint,
    startPrice,
    captains,
    onEditClick,
    onCodeClick
}) {
    const allCaptainsReady = captains.filter(c => c.name).every(c => c.ready);

    return (
        <div className="mb-10 flex items-end justify-between border-b border-[#393528] pb-6">
            <div className="min-w-0 flex-1 mr-4">
                <SectionTitle className="!text-3xl whitespace-nowrap overflow-hidden text-ellipsis text-glow flex items-center gap-3">
                    <>
                        {lobbyTitle}
                        {isHost && (
                            <button
                                onClick={onEditClick}
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
                            onClick={onCodeClick}
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
                        <p className="text-white font-bold leading-none">{startPoint || 1000} P</p>
                    </div>
                </div>

                {/* Min Bid Stat */}
                <div className="bg-panel-dark border border-[#393528] px-4 py-2 rounded-lg flex items-center gap-3 hidden md:flex">
                    <span className="material-symbols-outlined text-[#bab29c] text-lg">gavel</span>
                    <div>
                        <p className="text-[10px] text-[#bab29c] font-bold uppercase tracking-wider">입찰 최소가</p>
                        <p className="text-white font-bold leading-none">{startPrice || 100} P</p>
                    </div>
                </div>
                
                <div className="bg-panel-dark border border-[#393528] px-4 py-2 rounded-lg flex items-center gap-3 w-[150px]">
                    <span className={`material-symbols-outlined text-primary text-lg ${allCaptainsReady ? '' : 'animate-pulse'}`}>stadium</span>
                    <div>
                        <p className="text-[10px] text-[#bab29c] font-bold uppercase tracking-wider">현재 단계</p>
                        <p className="text-primary font-bold leading-none whitespace-nowrap">
                            {allCaptainsReady ? "준비 완료" : "준비중"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
