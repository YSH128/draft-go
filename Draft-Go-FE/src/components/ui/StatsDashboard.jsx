import React from 'react';
import Badge from './Badge';
import PositionIcon from './PositionIcon';

/**
 * StatsDashboard Component
 * Displays lobby statistics including player count, average tier, and position breakdown
 * 
 * @param {Array} captains - Array of captain objects
 * @param {Object} draftPool - Object containing arrays of players by position
 * @param {Function} calculateAverageTier - Function to calculate average tier from player array
 */
export default function StatsDashboard({ captains, draftPool, calculateAverageTier }) {
  const totalPlayers = captains.filter(c => c.name).length + 
                      Object.values(draftPool).flat().filter(p => !p.tier || p.tier !== 'Obs').length;

  const allPlayers = [
    ...captains.filter(c => c.name),
    ...Object.values(draftPool).flat().filter(p => !p.tier || p.tier !== 'Obs')
  ];
  
  const averageTier = calculateAverageTier(allPlayers);

  return (
    <section className="bg-panel-dark border-[#393528] p-6 rounded-xl border mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Left: Overall Stats */}
        <div className="flex items-center gap-4 md:border-r md:border-[#393528] md:pr-6">
          <div className="bg-primary/10 p-3 rounded-lg">
            <span className="material-symbols-outlined text-primary text-2xl">groups</span>
          </div>
          <div>
            <p className="text-[10px] text-[#bab29c] font-bold uppercase tracking-wider mb-1">
              전체 참가자
            </p>
            <p className="text-white font-black text-2xl leading-none mb-1">
              {totalPlayers} <span className="text-base text-[#bab29c] font-normal">Players</span>
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Badge variant={averageTier.baseTier.toLowerCase()}>
                {averageTier.baseTier.toUpperCase()}
              </Badge>
              <span className="text-white font-bold text-sm w-[60px]">
                {averageTier.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Role Breakdown */}
        <div className="flex-1 flex justify-around w-full">
          {['TOP', 'JNG', 'MID', 'ADC', 'SUP'].map(role => {
            // Calculate Captain Count for this role (ONLY READY captains!)
            const captainCount = captains.filter(c => c.selectedRole === role).length;
            const poolCount = draftPool[role]?.length || 0;
            const roleAverage = calculateAverageTier(draftPool[role] || []);

            return (
              <div key={role} className="flex flex-col items-center text-center gap-1 group cursor-default">
                <div className="text-[#bab29c] group-hover:text-primary transition-colors">
                  <PositionIcon position={role} className="w-8 h-8" />
                </div>
                <p className="text-[#bab29c] text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                  {role}
                </p>
                
                {/* Count Display: Pool (+Captain) */}
                <p className="text-white font-bold leading-none">
                  {poolCount}
                  {captainCount > 0 && (
                    <span className="text-primary text-xs ml-1">(+{captainCount})</span>
                  )}
                </p>

                <p className="text-[#666] text-[10px] font-bold">
                  {roleAverage.name !== 'Unranked' ? roleAverage.name : '-'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
