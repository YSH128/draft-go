from pydantic import BaseModel
from typing import List, Optional, Any

# 매치 기록 (승패, KDA 등)
class MatchRecord(BaseModel):
    championName: str
    win: bool
    kda: str

# 선수 프로필 (기본 정보 + 상세 정보)
# 선수 프로필 (기본 정보 + 상세 정보)
class PlayerProfile(BaseModel):
    memberId: Optional[str] = None
    name: str                   # 소환사명
    tier: str                   # 티어 (예: "CHALLENGER_1", "GOLD_4")
    position: str               # 포지션 (TOP, JUNGLE, MID, ADC, SUP)
    bidPrice: int               # 낙찰가
    isLeader: bool = False      # 팀장 여부
    
    # 상세 정보 (Optional - API가 지원하면 채워서 보냄)
    current_pick: Optional[str] = None # 현재 픽한 챔피언 (없으면 None)
    mostChampions: List[str] = []     # 모스트 챔피언 3개
    matchHistory: List[MatchRecord] = [] # 최근 전적

# AI 분석 결과 응답 구조 (Refactored)
class AnalysisResponse(BaseModel):
    summary_title: str          # (예: "아군 전력 분석" / "적군 파훼법")
    summary_text: str           # 핵심 내용 (3문장 이내)
    key_player_or_target: str   # (내 팀: "Key Player", 적 팀: "Primary Target")
    points: List[str]           # (내 팀: 강점/주의점, 적 팀: 약점/공략법 통합 3~4개)
    win_rate_prediction: Optional[str] = None # 승률 예측 (적 팀 분석 시에만 포함)

# 전체 팀 로스터 (우리팀 vs 상대팀)
class TeamRoster(BaseModel):
    myTeam: List[PlayerProfile]
    enemyTeam: List[PlayerProfile] = []
    focus_side: str = "MY_TEAM" # "MY_TEAM" (내 팀 클릭) or "ENEMY_TEAM" (상대 팀 클릭)

