import TeamListSidebar from "../components/TeamListSidebar";

export default function TeamSidebarSection({ teams, activeTeamId, myTeamId }) {
  return (
    <TeamListSidebar
      teams={teams}
      activeTeamId={activeTeamId}
      myTeamId={myTeamId}
    />
  );
}
