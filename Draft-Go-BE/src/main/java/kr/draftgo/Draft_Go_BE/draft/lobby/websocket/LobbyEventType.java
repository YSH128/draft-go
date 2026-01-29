package kr.draftgo.Draft_Go_BE.draft.lobby.websocket;

/**
 * 로비 이벤트 타입
 */
public enum LobbyEventType {
    /**
     * 역할 변경 (LEADER <-> MEMBER)
     */
    ROLE_CHANGED,

    /**
     * 포지션 변경
     */
    POSITION_CHANGED,

    /**
     * 참가자 입장
     */
    PARTICIPANT_JOINED,

    /**
     * 참가자 퇴장
     */
    PARTICIPANT_LEFT,

    /**
     * 팀장 포인트 변경
     */
    LEADER_POINT_CHANGED,

    /**
     * 팀장 준비 상태 변경
     */
    READY_STATUS_CHANGED,

    /**
     * 초대 코드 리프레시
     */
    INVITE_CODE_REFRESHED,

    /**
     * 드래프트 시작
     */
    DRAFT_STARTED,

    /**
     * 방 폭파 (관리자가 강제로 방을 종료함)
     */
    DRAFT_DESTROYED,

    /**
     * 전체 로비 새로고침 필요 (버전 불일치 시)
     */
    REFRESH_REQUIRED
}
