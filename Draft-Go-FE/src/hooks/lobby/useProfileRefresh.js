import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as DraftApi from '../../api/draft';

/**
 * 프로필 전적 갱신 로직을 관리하는 Hook
 * @param {string} draftId - 드래프트 ID
 * @returns {Object} 전적 갱신 함수와 캐시 ref
 */
export const useProfileRefresh = (draftId) => {
    const queryClient = useQueryClient();
    const refreshedProfilesRef = useRef(
        JSON.parse(sessionStorage.getItem('refreshedProfiles') || '{}')
    );

    /**
     * 멤버 전적 갱신
     * @param {number} targetId - 멤버 ID
     * @param {boolean} showNotification - 알림 표시 여부
     * @param {boolean} skipRefreshTrigger - refreshMemberData API 호출 스킵 여부
     * @returns {Object} 갱신된 프로필 데이터
     */
    const updateMemberStats = useCallback(async (targetId, showNotification = false, skipRefreshTrigger = false) => {
        try {
            // 1. 서버에 전적 갱신 요청 (선택적)
            if (!skipRefreshTrigger) {
                await DraftApi.refreshMemberData(targetId);
            }

            // 2. 멤버 프로필 조회
            const memberProfile = await DraftApi.getMemberProfile(targetId);

            // 3. 최근 20경기 전적 조회
            const historyResponse = await DraftApi.getMatchHistory(targetId, 0, 20);
            const history = Array.isArray(historyResponse) 
                ? historyResponse 
                : (historyResponse.content || []);

            // 4. 승/패 계산
            let recentWins = 0;
            let recentLosses = 0;

            const targetGameName = memberProfile.gameName;
            const targetTagLine = memberProfile.tagLine;
            const normalize = (str) => str ? str.toLowerCase().replace(/\s/g, '') : '';
            const targetNameNorm = normalize(targetGameName);
            const targetTagNorm = normalize(targetTagLine);

            history.slice(0, 20).forEach((match) => {
                if (!match.participants) return;
                const myParticipant = match.participants.find(p => {
                    const pName = p.gameName || p.summonerName;
                    const pTag = p.tagLine;
                    const nameMatch = normalize(pName) === targetNameNorm;
                    const tagMatch = pTag ? normalize(pTag) === targetTagNorm : true;
                    return nameMatch && tagMatch;
                });
                if (myParticipant) {
                    const isWin = myParticipant.win === true || myParticipant.win === 'true';
                    if (isWin) recentWins++;
                    else recentLosses++;
                }
            });

            // 5. 데이터 변환
            const stats = memberProfile.stats || {};
            const freshTime = memberProfile.updatedAt || memberProfile.lastUpdated || new Date().toISOString();

            const newData = {
                lastUpdated: freshTime,
                tier: stats.tier || "Unranked",
                division: stats.division,
                leaguePoints: stats.leaguePoints || 0,
                lp: stats.leaguePoints || 0,
                winRate: stats.winRate || 0,
                recentStats: { wins: recentWins, losses: recentLosses },
                recent20: { wins: recentWins, losses: recentLosses },
                mostChampions: (memberProfile.mostChampions || []).map(c => ({
                    name: c.championName,
                    games: c.totalGames,
                    winRate: c.winRate,
                    kda: c.kda,
                    imageUrl: c.championIconUrl || c.imageUrl || `https://ddragon.leagueoflegends.com/cdn/14.16.1/img/champion/${c.championName}.png`
                })),
                gameName: memberProfile.gameName,
                tagLine: memberProfile.tagLine,
                profileIcon: memberProfile.profileIconUrl || "",
                image: memberProfile.profileIconUrl || "",
                summonerName: memberProfile.gameName || memberProfile.username,
                profileIconUrl: memberProfile.profileIconUrl || "",
                level: memberProfile.summonerLevel || 0,
                mainPosition: memberProfile.mainPosition,
                subPosition: memberProfile.subPosition,
                memberId: memberProfile.memberId || memberProfile.id,
                id: memberProfile.memberId || memberProfile.id
            };

            // 6. 캐싱
            refreshedProfilesRef.current[targetId] = newData;
            sessionStorage.setItem('refreshedProfiles', JSON.stringify(refreshedProfilesRef.current));

            // 7. 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: ['lobbyData', Number(draftId)] });

            // 8. 알림 표시
            if (showNotification) {
                alert('전적 갱신이 완료되었습니다.');
            }

            return newData;
        } catch (error) {
            console.error(`[updateMemberStats] Failed for member ${targetId}:`, error);
            throw error;
        }
    }, [draftId, queryClient]);

    return {
        updateMemberStats,
        refreshedProfilesRef,
    };
};
