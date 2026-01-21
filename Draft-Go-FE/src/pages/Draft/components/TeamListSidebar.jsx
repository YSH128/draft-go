import TeamCard from "./TeamCard";

/**
 * 팀 리스트 사이드바
 * - 모든 팀의 현재 상태 표시
 *
 * @param {Array} teams - 팀 목록
 * @param {string} activeTeamId - 현재 입찰 중인 팀 ID
 * @param {string} myTeamId - 내 팀 ID
 */
export default function TeamListSidebar({ teams = [], activeTeamId, myTeamId }) {
  return (
    <aside className="custom-scrollbar z-10 flex w-[480px] shrink-0 flex-col space-y-4 overflow-y-auto border-r border-primary/20 bg-background-dark p-5">
      {/* 섹션 타이틀 */}
      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-primary">
        팀 리스트
      </h2>

      {/* 팀 카드 목록 */}
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          isActive={team.id === activeTeamId}
          isMine={team.id === myTeamId}
        />
      ))}
    </aside>
  );
}
