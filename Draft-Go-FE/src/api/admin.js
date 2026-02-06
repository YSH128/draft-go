import { instance } from "../libs/axios";

/**
 * 관리자 전용 API
 */

// 팀장 자동 준비 완료
export const readyAllLeaders = async (draftId) => {
    const response = await instance.post(`/admin/drafts/${draftId}/ready-all-leaders`);
    return response.data;
};

// 테스트 유저 추가 (1~30명)
export const addTestMembers = async (draftId, count = 10) => {
    const response = await instance.post(`/admin/drafts/${draftId}/add-test-members`, null, {
        params: { count },
    });
    return response.data;
};
