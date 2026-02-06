import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from .models import TeamRoster, AnalysisResponse, PlayerProfile
# 모델들은 models.py로 이동됨

# .env 파일 로드
load_dotenv()

# OpenAI 클라이언트 설정 (라이브러리가 설치되어 있어야 함)
try:
    from openai import OpenAI, AuthenticationError
    client = OpenAI(
        api_key=os.getenv("GMS_KEY"),
        base_url=os.getenv("GMS_BASE_URL")
    )
except ImportError:
    client = None
    AuthenticationError = None
    print("Warning: 'openai' library not installed. Please run 'pip install openai'")

app = FastAPI()

# ----------------------------------------------------------------
# CORS 설정
# ----------------------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------
# 헬스 체크
# ----------------------------------------------------------------
@app.get("/health")
def read_root():
    # API 키 확인
    api_key = os.getenv("GMS_KEY")
    has_key = api_key and api_key != "YOUR_GMS_KEY_HERE"
    
    return {
        "status": "ok", 
        "ai_ready": has_key,
        "model": os.getenv("AI_MODEL_NAME", "gpt-3.5-turbo")
    }

# ----------------------------------------------------------------
# AI 분석 엔드포인트
# ----------------------------------------------------------------
@app.post("/analyze")
def analyze_roster(roster: TeamRoster):
    """
    팀 로스터를 받아서 OpenAI에게 승률/전략 분석을 요청합니다.
    - myTeam만 있는 경우: 우리 팀의 내부 시너지 및 강약점 분석
    - enemyTeam도 있는 경우: 양 팀 간의 승률 예측 및 매치업 분석
    """
    if not client:
        return {"error": "Server configuration error: OpenAI library missing"}
        
    api_key = os.getenv("GMS_KEY")
    if not api_key or api_key.startswith("YOUR"):
        # 키가 없으면 더미 데이터 반환 (개발 편의성)
        return _get_mock_response(roster)


    # User Prompt 구성
    user_prompt = _build_user_prompt(roster)
    
    # System Prompt 구성 (분기 처리)
    if roster.focus_side == "ENEMY_TEAM":
        # [Case B] 적군 파훼법 (Weakness Focus)
        system_prompt = (
            "Role: You are a Head Coach analyzing the ENEMY team to find their weaknesses.\n"
            "Goal: Identify the 'Weak Link' (Low tier, Off-role, Losing streak) and suggest how to exploit them.\n\n"
            "Analysis Rules:\n"
            "1. Find the PRIMARY TARGET: Who is the easiest kill? (Tier Gap > Role Proficiency > Momentum)\n"
            "2. Suggest Counter Strategy: How to abuse this player? (e.g., 'Expose their limited champion pool')\n"
            "3. Predict Win Rate based on mismatched lanes.\n\n"
            
            "Output Format (JSON):\n"
            "{\n"
            '  "summary_title": "적군 파훼법",\n'
            '  "summary_text": "3 sentences summarizing the counter strategy.",\n'
            '  "key_player_or_target": "Target Name (Position) - Reason",\n'
            '  "points": ["Weakness 1", "Weakness 2", "Exploit Method 1", "Exploit Method 2"],\n'
            '  "win_rate_prediction": "e.g., 6:4 Advantage"\n'
            "}\n"
            "Language: Korean (한국어). Tone: Professional, Cold, Strategic."
        )
    else:
        # [Case A] 아군 전력 분석 (Strength/Instability Focus) -- Default
        system_prompt = (
            "Role: You are a Head Coach analyzing YOUR OWN team to solidify victory.\n"
            "Goal: Identify your 'Ace' (Key Player) and internal 'Instability' to fix.\n\n"
            "Analysis Rules:\n"
            "1. Find the KEY PLAYER: High Tier, Main Role, Hot Streak.\n"
            "2. Identify Instability: Who might throw? (Off-role, Loss streak)\n"
            "3. Suggest Synergy: How to play around the Key Player?\n\n"
            
            "Output Format (JSON):\n"
            "{\n"
            '  "summary_title": "아군 전력 분석",\n'
            '  "summary_text": "3 sentences summarizing team power and playstyle.",\n'
            '  "key_player_or_target": "Ace Name (Position) - Reason",\n'
            '  "points": ["Strength 1 (Synergy)", "Strength 2 (Ace)", "Caution 1 (Instability)", "Caution 2"],\n'
            '  "win_rate_prediction": null\n'
            "}\n"
            "Language: Korean (한국어). Tone: Encouraging but Objective."
        )

    try:
        # OpenAI 호출
        model_name = os.getenv("AI_MODEL_NAME", "gpt-4o")
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}, # JSON 모드 강제
            temperature=0.7,
        )

        # 결과 파싱 & 유효성 검사
        content = response.choices[0].message.content
        result_json = json.loads(content)
        
        # Pydantic 모델로 검증
        validated_response = AnalysisResponse(**result_json)
        
        return validated_response

    except AuthenticationError as e:
        print(f"GMS Auth Error: {e}")
        raise HTTPException(status_code=401, detail="GMS API authentication failed. Please check your GMS Key.")
    except Exception as e:
        print(f"Error during AI analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


def _build_user_prompt(roster: TeamRoster) -> str:
    """TeamRoster 객체를 분석하기 쉬운 텍스트 프롬프트로 변환 (컨텍스트 강화)"""
    
    def analyze_player(p: PlayerProfile):
        info = f"- [{p.position}] {p.name} (Tier: {p.tier}, Bid: {p.bidPrice})"
        
        # 1. 픽 정보
        if p.current_pick:
            info += f" | PICK: {p.current_pick}"
        else:
            info += " | PICK: NONE (Analyze Tendency)"
            
        # 2. 전적/기세 분석 (Momentum)
        if p.matchHistory:
            wins = sum(1 for m in p.matchHistory if m.win)
            total = len(p.matchHistory)
            win_rate = (wins / total) * 100 if total > 0 else 0
            
            momentum = "Normal"
            if win_rate >= 80: momentum = "HOT STREAK (Very High Confidence)"
            elif win_rate <= 20: momentum = "SLUMP/LOSING STREAK (Mental Boom Risk)"
            elif win_rate <= 40: momentum = "Bad Condition"
            
            info += f" | Recent: {wins}W {total-wins}L ({momentum})"
        
        # 3. 모스트 챔피언 확인 (숙련도 유추용)
        if p.mostChampions:
            info += f" | Most: {', '.join(p.mostChampions)}"
            
        return info

    prompt = "### My Team Context ###\n"
    for p in roster.myTeam:
        prompt += analyze_player(p) + "\n"
            
    if roster.enemyTeam:
        prompt += "\n### Enemy Team Context (Targets) ###\n"
        for p in roster.enemyTeam:
            prompt += analyze_player(p) + "\n"
            
    return prompt



def _get_mock_response(roster: TeamRoster):
    """API 키가 없을 때 반환할 더미 데이터"""
    print("Returning Mock Data (No Valid API Key found)")
    if roster.focus_side == "ENEMY_TEAM":
        return {
            "summary_title": "적군 파훼법 (Mock)",
            "summary_text": "API 키가 없어 모의 데이터를 반환합니다. 적 미드가 연패 중이므로 집중 공략하세요.",
            "key_player_or_target": "Enemy Mid (Loss Streak)",
            "points": ["미드 라인전 단계부터 압박", "적 정글 동선 파악 필수", "상대 멘탈 흔들기"],
            "win_rate_prediction": "6:4 우세"
        }
    else:
        return {
            "summary_title": "아군 전력 분석 (Mock)",
            "summary_text": "API 키가 없어 모의 데이터를 반환합니다. 우리 정글러의 컨디션이 매우 좋습니다.",
            "key_player_or_target": "My Jungle (Ace)",
            "points": ["정글-미드 시너지 기대", "탑 라인 안정감 확보", "바텀은 반반 가기"],
            "win_rate_prediction": None
        }
