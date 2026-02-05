import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TeamLeaderCard from '../../../components/ui/TeamLeaderCard';

export default function CaptainsSection({
    captains,
    isHost,
    userRole,
    maxTeamCount,
    onRoleSelect,
    onReadyToggle,
    onOpenSettings,
    onOpenProfile,
    onKick
}) {
    return (
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
                                                profileIcon={captain.image}
                                                isAdmin={isHost}
                                                isReady={captain.ready}
                                                selectedRole={captain.selectedRole}
                                                onRoleSelect={(role) => onRoleSelect(captain.id, role)}
                                                onReadyClick={() => onReadyToggle(captain.id)}
                                                onOpenSettings={() => onOpenSettings(captain)}
                                                onCardClick={(userRole === 'CAPTAIN' || userRole === 'CREW' || isHost)
                                                    ? () => onOpenProfile(captain)
                                                    : undefined}
                                                mostChampions={captain.mostChampions || []}
                                                onKick={(isSelf) => onKick({ type: 'CAPTAIN', id: captain.id, name: captain.name }, isSelf)}
                                                isCurrentUser={captain.isSelf}
                                                isDragging={snapshot.isDragging}
                                                isOwner={captain.isOwner}
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
                {isHost && captains.filter(c => c.name).length < (maxTeamCount || 2) && (
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
                                    onClick={() => onOpenSettings({ id: 'new', name: null })}
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
    );
}
