import { useMemo } from 'react';
import { mapPositionToUI, getTierTextClass } from '../../utils';

/**
 * 로비 데이터 변환 로직 Hook
 * @param {Object} data - React Query로 받아온 로비 데이터
 * @param {Object} user - 현재 로그인한 유저 정보
 * @param {Object} refreshedProfilesRef - 전적 갱신 캐시 (useRef)
 * @returns {Object} 변환된 데이터들 (lobbyTitle, codes, userRole, isHost, captains, draftPool, totalParticipants)
 */
export const useLobbyTransform = (data, user, refreshedProfilesRef) => {

    const lobbyTitle = useMemo(() => {
        if (!data) return "대회 로비";
        return data.title || "대회 로비";
    }, [data]);

    const codes = useMemo(() => {
        if (!data) return { teamLeaderCode: '', teamMemberCode: '' };

        const leaderCode = data.teamLeaderCode || data.leaderCode || data.codes?.teamLeaderCode || '';
        const memberCode = data.teamMemberCode || data.memberCode || data.codes?.teamMemberCode || '';

        return {
            teamLeaderCode: leaderCode,
            teamMemberCode: memberCode
        };
    }, [data]);

    const userRole = useMemo(() => {
        if (!data || !user?.id) return "MEMBER";

        const myId = user.id;
        const leaders = Array.isArray(data.leaders) ? data.leaders : [];
        const members = Array.isArray(data.members) ? data.members : [];
        const observers = data.observers || [];

        if (leaders.some(l => Number(l.id) === Number(myId))) {
            return "CAPTAIN";
        }

        if (members.some(m => Number(m.id) === Number(myId))) {
            return "CREW";
        }

        if (observers.some(o => Number(o.id) === Number(myId))) {
            return "SPECTATOR";
        }

        const hasAdminCodes = data.codes && (data.codes.teamLeaderCode || data.codes.teamMemberCode);
        const ownerIdValue = data.ownerId || data.hostId || data.masterId;
        const isExplicitOwner = ownerIdValue && Number(ownerIdValue) === Number(myId);
        const isOwner = isExplicitOwner || !!hasAdminCodes;

        if (isOwner) return "ADMIN";

        return "MEMBER";
    }, [data, user?.id]);

    const isHost = useMemo(() => {
        if (!data || !user?.id) return false;

        const hasAdminCodes = data.codes && (data.codes.teamLeaderCode || data.codes.teamMemberCode);
        const ownerIdValue = data.ownerId || data.hostId || data.masterId;
        const isExplicitOwner = ownerIdValue && Number(ownerIdValue) === Number(user.id);

        return isExplicitOwner || !!hasAdminCodes;
    }, [data, user?.id]);

    const captains = useMemo(() => {
        if (!data) return [];

        const leaders = Array.isArray(data.leaders) ? data.leaders : [];
        const myId = user?.id;
        const ownerId = data.ownerId;

        return leaders.map((leader, index) => {
            const baseData = {
                id: leader.id,
                name: leader.name,
                tier: leader.tier,
                division: leader.division,
                teamNumber: index + 1,
                image: leader.profileIconUrl || "",
                ready: leader.isReady,
                selectedRole: mapPositionToUI(leader.position),
                isSelf: Number(leader.id) === Number(myId),
                isOwner: Number(leader.id) === Number(ownerId),
                points: leader.leaderPoint || 0,
                leaderPoint: leader.leaderPoint || 0,
                loading: false,
                role: 'MID',
                mainPosition: leader.mainPosition,
                subPosition: leader.subPosition,
                mostChampions: (leader.mostChampions || []).map(c => ({
                    name: c.championName,
                    games: c.totalGames,
                    winRate: c.winRate,
                    kda: c.kda,
                    imageUrl: c.championIconUrl || c.imageUrl || `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/${c.championName}.png`
                })),
                lp: leader.leaguePoints,
                gameName: leader.gameName,
                tagLine: leader.tagLine,
                level: leader.summonerLevel,
                winRate: leader.winRate,
                recent20: leader.recentStats,
                memberId: leader.memberId || leader.id,
                lastUpdated: leader.updatedAt || leader.lastUpdated
            };

            const cached = refreshedProfilesRef?.current?.[leader.memberId] || refreshedProfilesRef?.current?.[leader.id];
            if (cached) {
                return { ...baseData, ...cached };
            }
            return baseData;
        });
    }, [data, user?.id, refreshedProfilesRef]);

    const draftPool = useMemo(() => {
        if (!data) return { TOP: [], JNG: [], MID: [], ADC: [], SUP: [], SPECTATOR: [] };

        const newPool = { TOP: [], JNG: [], MID: [], ADC: [], SUP: [], SPECTATOR: [] };
        const members = Array.isArray(data.members) ? data.members : [];
        const myId = user?.id;
        const ownerId = data.ownerId;

        members.forEach(member => {
            const uiPosition = mapPositionToUI(member.position);
            if (newPool[uiPosition]) {
                let memberData = {
                    id: member.id,
                    name: member.name,
                    tier: member.tier,
                    division: member.division,
                    color: getTierTextClass(member.tier),
                    lp: member.leaguePoints,
                    isSelf: Number(member.id) === Number(myId),
                    isOwner: Number(member.id) === Number(ownerId),
                    image: member.profileIcon,
                    mainPosition: member.mainPosition,
                    subPosition: member.subPosition,
                    mostChampions: member.mostChampions,
                    gameName: member.gameName,
                    tagLine: member.tagLine,
                    level: member.summonerLevel,
                    winRate: member.winRate,
                    recent20: member.recentStats,
                    memberId: member.memberId || member.id,
                    lastUpdated: member.updatedAt || member.lastUpdated
                };

                const cached = refreshedProfilesRef?.current?.[member.memberId] || refreshedProfilesRef?.current?.[member.id];
                if (cached) {
                    memberData = { ...memberData, ...cached };
                }

                newPool[uiPosition].push(memberData);
            }
        });

        if (data.observers) {
            const leaderIds = new Set((data.leaders || []).map(l => Number(l.id)));

            newPool.SPECTATOR = data.observers
                .filter(obs => !leaderIds.has(Number(obs.id)))
                .map(obs => {
                    let obsData = {
                        id: obs.id,
                        name: obs.name,
                        tier: "Obs",
                        color: "text-gray-500",
                        isSelf: Number(obs.id) === Number(myId),
                        mainPosition: obs.mainPosition,
                        subPosition: obs.subPosition,
                        mostChampions: obs.mostChampions,
                        gameName: obs.gameName,
                        tagLine: obs.tagLine,
                        level: obs.summonerLevel,
                        winRate: obs.winRate,
                        recent20: obs.recentStats,
                        memberId: obs.memberId || obs.id,
                        lastUpdated: obs.updatedAt || obs.lastUpdated
                    };

                    const cached = refreshedProfilesRef?.current?.[obs.memberId] || refreshedProfilesRef?.current?.[obs.id];
                    if (cached) {
                        obsData = { ...obsData, ...cached };
                    }
                    return obsData;
                });
        }

        return newPool;
    }, [data, user?.id, refreshedProfilesRef]);

    const totalParticipants = useMemo(() => {
        if (!data) return 0;
        const leadersCount = (data.leaders || []).length;
        const membersCount = Array.isArray(data.members) ? data.members.length : 0;
        const observersCount = (data.observers || []).length;
        return leadersCount + membersCount + observersCount;
    }, [data]);

    return {
        lobbyTitle,
        codes,
        userRole,
        isHost,
        captains,
        draftPool,
        totalParticipants
    };
};
