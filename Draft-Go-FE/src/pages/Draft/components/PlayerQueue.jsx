import { Icon } from "../../../components/ui";
import PlayerQueueCard from "./PlayerQueueCard";
import PassedQueueCard from "./PassedQueueCard";

/**
 * 플레이어 대기열 섹션
 * - 드래프트 대기열 + 유찰 대기열
 *
 * @param {Array} queue - 대기열 플레이어 목록
 * @param {Array} passedQueue - 유찰 플레이어 목록
 */
export default function PlayerQueue({ queue = [], passedQueue = [] }) {
  return (
    <div className="flex h-[28rem] shrink-0 gap-0 border-t border-primary/10 pt-6">
      {/* 드래프트 대기열 (3/4) */}
      <div className="flex w-3/4 flex-col border-r border-primary/10 pr-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-3">
          <Icon name="groups" className="text-sm text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            드래프트 대기열
          </span>
          <div className="h-[1px] flex-1 bg-primary/20" />
        </div>

        {/* 그리드 */}
        <div className="custom-scrollbar grid grid-cols-6 gap-3 overflow-y-auto pb-2 pr-2">
          {queue.map((player) => (
            <PlayerQueueCard key={player.id} player={player} />
          ))}
        </div>
      </div>

      {/* 유찰 대기열 (1/4) */}
      <div className="flex w-1/4 flex-col pl-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-3">
          <Icon name="person_off" className="text-sm text-primary/60" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
            유찰 대기열
          </span>
          <div className="h-[1px] flex-1 bg-primary/10" />
        </div>

        {/* 리스트 */}
        <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto pr-2">
          {passedQueue.map((player) => (
            <PassedQueueCard key={player.id} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
}
