import PositionSlot from "./PositionSlot";
import { POSITIONS } from "../../../constants/riot.js";
/**
 * 팀 카드 컴포넌트
 * - 팀 이름, 포인트, 5개 포지션 슬롯 표시
 *
 * @param {Object} team - 팀 정보
 * @param {string} team.name - 팀 이름
 * @param {string} team.captain - 캡틴 이름
 * @param {number} team.points - 보유 포인트
 * @param {Object} team.roster - 로스터 { TOP, JUNGLE, MID, BOT, SUP }
 * @param {boolean} isActive - 현재 입찰 중인 팀 여부
 * @param {boolean} isMine - 내 팀 여부
 */
export default function TeamCard({ team, isActive = false, isMine = false }) {
  const { name, captain, points, roster = {} } = team;

  // 스타일 결정
  const getBorderStyle = () => {
    if (isActive) {
      return "border-2 border-primary bg-card-dark shadow-[0_0_15px_rgba(200,155,60,0.1)]";
    }
    if (isMine) {
      return "border border-hextech-blue/40 bg-card-dark";
    }
    return "border-primary/20 bg-card-dark";
  };

  return (
    <div className={`space-y-4 rounded border p-4 overflow-hidden ${getBorderStyle()}`}>
      {/* 팀 헤더 */}
      <div className="flex items-center justify-between">
        <span className={`text-base font-bold ${isActive ? "text-primary" : "text-white"}`}>
          {name}
        </span>
        <span className={`text-sm font-bold ${isActive ? "text-primary-bright" : "text-primary"}`}>
          {points} P
        </span>
      </div>

      {/* 포지션 슬롯 */}
      <div className="flex justify-between gap-0.5">
        {POSITIONS.map((position) => (
          <PositionSlot
            key={position.id}
            position={position}
            player={roster[position.id] || null}
          />
        ))}
      </div>
    </div>
  );
}
