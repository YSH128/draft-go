import React from 'react';
import DraftPoolColumn from '../../../components/ui/DraftPoolColumn';

export default function DraftPoolSection({
    draftPool,
    userRole,
    isHost,
    maxTeamCount,
    captains,
    onJoinPool,
    onPlayerClick,
    onKick
}) {
    return (
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
                    onJoin={onJoinPool}
                    onPlayerClick={onPlayerClick}
                    droppableId="pool-TOP"
                    roleName="탑 (Top)"
                    role="TOP"
                    count={draftPool.TOP.length}
                    captainCount={captains.filter(c => c.selectedRole === 'TOP').length}
                    requiredCount={maxTeamCount || 2}
                    players={draftPool.TOP}
                    userRole={userRole}
                    isAdmin={isHost}
                    onKick={(p, isSelf) => onKick({ type: 'POOL', role: 'TOP', name: p.name, id: p.id }, isSelf)}
                />

                <DraftPoolColumn
                    onJoin={onJoinPool}
                    onPlayerClick={onPlayerClick}
                    droppableId="pool-JNG"
                    roleName="정글 (Jungle)"
                    role="JNG"
                    count={draftPool.JNG.length}
                    captainCount={captains.filter(c => c.selectedRole === 'JNG').length}
                    requiredCount={maxTeamCount || 2}
                    players={draftPool.JNG}
                    userRole={userRole}
                    isAdmin={isHost}
                    onKick={(p, isSelf) => onKick({ type: 'POOL', role: 'JNG', name: p.name, id: p.id }, isSelf)}
                />

                <DraftPoolColumn
                    onJoin={onJoinPool}
                    onPlayerClick={onPlayerClick}
                    droppableId="pool-MID"
                    roleName="미드 (Mid)"
                    role="MID"
                    count={draftPool.MID.length}
                    captainCount={captains.filter(c => c.selectedRole === 'MID').length}
                    requiredCount={maxTeamCount || 2}
                    players={draftPool.MID}
                    userRole={userRole}
                    isAdmin={isHost}
                    onKick={(p, isSelf) => onKick({ type: 'POOL', role: 'MID', name: p.name, id: p.id }, isSelf)}
                />

                {/* Row 2 */}
                <DraftPoolColumn
                    onJoin={onJoinPool}
                    onPlayerClick={onPlayerClick}
                    droppableId="pool-ADC"
                    roleName="원딜 (ADC)"
                    role="ADC"
                    count={draftPool.ADC.length}
                    captainCount={captains.filter(c => c.selectedRole === 'ADC').length}
                    requiredCount={maxTeamCount || 2}
                    players={draftPool.ADC}
                    userRole={userRole}
                    isAdmin={isHost}
                    onKick={(p, isSelf) => onKick({ type: 'POOL', role: 'ADC', name: p.name, id: p.id }, isSelf)}
                />

                <DraftPoolColumn
                    onJoin={onJoinPool}
                    onPlayerClick={onPlayerClick}
                    droppableId="pool-SUP"
                    roleName="서포터 (Support)"
                    role="SUP"
                    count={draftPool.SUP.length}
                    captainCount={captains.filter(c => c.selectedRole === 'SUP').length}
                    requiredCount={maxTeamCount || 2}
                    players={draftPool.SUP}
                    userRole={userRole}
                    isAdmin={isHost}
                    onKick={(p, isSelf) => onKick({ type: 'POOL', role: 'SUP', name: p.name, id: p.id }, isSelf)}
                />

                <DraftPoolColumn
                    onJoin={onJoinPool}
                    onPlayerClick={onPlayerClick}
                    droppableId="pool-SPECTATOR"
                    roleName="관전자 (Spectator)"
                    role="SPECTATOR"
                    count={draftPool.SPECTATOR.length}
                    players={draftPool.SPECTATOR}
                    userRole={userRole}
                    isAdmin={isHost}
                    onKick={(p, isSelf) => onKick({ type: 'POOL', role: 'SPECTATOR', name: p.name, id: p.id }, isSelf)}
                />
            </div>
        </section>
    );
}
