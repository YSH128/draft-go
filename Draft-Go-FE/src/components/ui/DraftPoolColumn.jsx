import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import PositionIcon from './PositionIcon';
import Badge from './Badge';

/**
 * DraftPoolColumn Component
 * Displays a column of players for a specific position in the draft pool
 * Maintains original UI design from inline implementation
 */
export default function DraftPoolColumn({ 
  roleName, 
  role, 
  roleIcon, 
  count, 
  captainCount,
  requiredCount, // New prop
  players, 
  userRole, 
  isAdmin, 
  droppableId, 
  onJoin, 
  onPlayerClick, 
  onKick 
}) {
    // 현재 사용자가 이미 이 풀에 있는지 확인
    const hasCurrentUser = players.some(p => p.isSelf || p.name === "나 (Me)");
    
    // Status Logic
    const totalCount = count + captainCount;
    // requiredCount가 있으면 계산, 없으면 null handled
    const diff = requiredCount ? totalCount - requiredCount : 0;
    
    let statusText = null;
    let statusColor = "text-[#bab29c]";
    
    if (requiredCount) {
        if (diff === 0) {
            statusText = "(OK)";
            statusColor = "text-green-500";
        } else if (diff < 0) {
            statusText = `(부족 ${diff})`; // e.g. -1
            statusColor = "text-red-500";
        } else {
            statusText = `(초과 +${diff})`;
            statusColor = "text-orange-500";
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className={`bg-gradient-to-r ${isAdmin ? 'from-[#3a2e15] to-[#2a2215] border-yellow-600' : 'from-[#1e1a0d] to-[#161410] border-primary'} border-l-4 px-5 py-3 mb-0 rounded-t-lg flex items-center justify-between`}>
                <h4 className="text-white font-bold text-base flex items-center gap-2 uppercase tracking-widest">
                    {role ? (
                        <PositionIcon position={role} className="w-6 h-6" />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-xl">{roleIcon}</span>
                    )}
                    {roleName}
                    
                    {/* Status Indicator */}
                    {statusText && (
                        <span className={`text-[10px] font-bold ml-1 ${statusColor}`}>
                            {statusText}
                        </span>
                    )}
                </h4>
                <span className="text-xs text-[#bab29c] font-mono font-bold">{count}</span>
            </div>
            
            {/* Player List with Droppable */}
            <Droppable droppableId={droppableId} type="DRAFT_SWAP">
              {(provided) => (
                <div 
                   className="bg-panel-dark rounded-b-lg border border-t-0 border-[#393528] flex-1 flex flex-col relative min-h-[100px]"
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
                                   className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors border-b border-[#393528] last:border-b-0 group cursor-pointer relative ${
                                     p.isSelf ? 'border-l-2 border-l-[#0ac8b9]' : ''
                                   }`}
                                   onClick={(e) => {
                                     console.log('[DraftPool] Card clicked:', p.name, 'isSelf:', p.isSelf, 'id:', p.id);
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
                                            {/* [Admin UI] ADMIN Badge (Visible to All) */}
                                            {p.isOwner && (
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
                    
                    {/* Crew 'Join' Card - 조건부 표시 */}
                    {/* 
                        1. Crew/Spectator: 자유롭게 이동 가능 (단, 현재 자신이 속한 리스트 제외)
                        2. Admin: 모든 포지션 참여 가능
                        3. Captain: 관전자 포함 어떤 포지션으로도 이동 불가 (버튼 숨김)
                    */}
                    {!hasCurrentUser && (
                        (userRole === 'CREW' || userRole === 'SPECTATOR') || 
                        isAdmin
                    ) && (
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
    );
}
