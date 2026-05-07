import { getPhaseName } from '../../logic/engine/gameEngine';

function getTip(gameState, currentEvent) {
  if (gameState.phase === 'morning') {
    return currentEvent?.tag ? `优先处理“${currentEvent.tag}”` : '处理今日朝务';
  }

  if (gameState.phase === 'afternoon') {
    return `还剩 ${gameState.player.ap} 点行动力`;
  }

  return '看完夜报后进入下一天';
}

export function MobileActionBar({ gameState, currentEvent, onOpenOverview, onOpenLog, onOpenMenu, onEndAfternoon, onNextDay }) {
  if (gameState.isGameOver) {
    return null;
  }

  const showEndAfternoon = gameState.phase === 'afternoon';
  const showNextDay = gameState.phase === 'night';

  return (
    <div className="mobile-dock fixed inset-x-0 bottom-0 z-30 border-t border-gray-700/80 bg-gray-950/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_24px_rgba(0,0,0,0.35)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.28em] text-gray-500">{getPhaseName(gameState.phase)}</div>
            <div className="mt-1 text-sm font-semibold text-gray-100">{getTip(gameState, currentEvent)}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onOpenOverview}
              className="rounded-full border border-gray-600 bg-gray-900/80 px-3 py-2 text-xs font-semibold text-gray-200"
            >
              <i className="fas fa-chess-king mr-1" />提要
            </button>
            <button
              type="button"
              onClick={onOpenLog}
              className="rounded-full border border-gray-600 bg-gray-900/80 px-3 py-2 text-xs font-semibold text-gray-200"
            >
              <i className="fas fa-book-open mr-1" />日志
            </button>
            <button
              type="button"
              onClick={onOpenMenu}
              className="rounded-full border border-gray-600 bg-gray-900/80 px-3 py-2 text-xs font-semibold text-gray-200"
            >
              <i className="fas fa-gear mr-1" />菜单
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-3 py-2 text-gray-300">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">压力</div>
            <div className="mt-1 font-mono font-bold text-red-300">{gameState.player.stress}%</div>
          </div>
          <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-3 py-2 text-gray-300">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">精力</div>
            <div className="mt-1 font-mono font-bold text-blue-300">{gameState.player.energy}</div>
          </div>
          <div className="rounded-lg border border-gray-700/70 bg-gray-900/70 px-3 py-2 text-gray-300">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">行动</div>
            <div className="mt-1 font-mono font-bold text-yellow-300">{gameState.phase === 'afternoon' ? gameState.player.ap : gameState.day}</div>
          </div>
        </div>

        {showEndAfternoon ? (
          <button
            type="button"
            onClick={onEndAfternoon}
            className="w-full rounded-xl border border-gray-500 bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-3 text-sm font-bold tracking-wide text-white"
          >
            回寝宫安歇 <i className="fas fa-bed ml-2" />
          </button>
        ) : null}

        {showNextDay ? (
          <button
            type="button"
            onClick={onNextDay}
            className="w-full rounded-xl border border-yellow-500 bg-yellow-700 px-4 py-3 text-sm font-bold tracking-wide text-white"
          >
            进入下一天 <i className="fas fa-sun ml-2" />
          </button>
        ) : null}
      </div>
    </div>
  );
}