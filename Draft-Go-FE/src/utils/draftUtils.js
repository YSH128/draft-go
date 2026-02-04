export const DEFAULT_TIER = "UNRANKED";

// 백엔드에서 받은 queue 데이터를 UI용으로 변환
export const normalizeQueue = (queue) =>
  (queue || []).map((member) => ({
    id: String(member.id),
    memberId: member.memberId,
    name: member.name,
    position: member.position,
    status: member.status,
    turnOrder: member.turnOrder ?? 0,
    tier: member.tier || DEFAULT_TIER,
    division: member.division,
    imageUrl: member.profileImageUrl,
  }));

// 팀 멤버로부터 포지션별 roster 구성
export const buildRoster = (members = []) => {
  const roster = {};
  members.forEach((member) => {
    if (!member.position) return;
    roster[member.position] = {
      name: member.name,
      imageUrl: member.profileImageUrl,
      tier: member.tier || DEFAULT_TIER,
      division: member.division,
    };
  });
  return roster;
};

// 팀장 여부 확인
export const isLeader = (member) => {
  if (!member) return false;
  return member.isLeader === true || member.leader === true;
};

// 백엔드 teams 데이터를 UI용으로 변환
export const mapTeams = (teams) =>
  (teams || []).map((team) => {
    const leader = team.members?.find((m) => isLeader(m));
    return {
      id: String(team.teamId),
      name: team.teamName,
      captain: leader?.name || "알 수 없음",
      points: team.currentPoint ?? 0,
      roster: buildRoster(team.members || []),
    };
  });
