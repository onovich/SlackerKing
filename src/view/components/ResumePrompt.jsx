import { getPhaseName } from '../../logic/engine/gameEngine';

function ResumeChip({ label, value, toneClass = 'text-gray-100' }) {
  return (
    <div className="rounded-xl border border-gray-700/80 bg-gray-950/60 px-3 py-3 text-left">
      <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500">{label}</div>
      <div className={`mt-2 text-sm font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function formatSavedAt(savedAt) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(savedAt);
  } catch {
    return '刚刚';
  }
}

export function ResumePrompt({ savedRun, currentEvent, onContinue, onDiscard }) {
  const state = savedRun?.gameState;
  if (!state) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-gray-700/80 bg-[radial-gradient(circle_at_top,_rgba(120,53,15,0.24),_rgba(17,24,39,0.96)_58%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-8">
        <div className="text-xs uppercase tracking-[0.35em] text-yellow-500">Continue Game</div>
        <h2 className="mt-3 text-3xl font-black tracking-wider text-gray-100">继续上次朝会</h2>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          检测到一局尚未结束的本地存档。进行中的局势会自动保存在浏览器里，你可以直接续上，也可以放弃旧局重新登基。
        </p>

        <div className="mt-5 rounded-2xl border border-yellow-800/50 bg-yellow-900/10 p-4">
          <div className="text-xs uppercase tracking-[0.28em] text-yellow-500">Last Session</div>
          <div className="mt-2 text-lg font-bold text-yellow-100">{currentEvent?.title ?? '宫廷事务待处理'}</div>
          <div className="mt-1 text-sm text-yellow-100/70">上次保存于 {formatSavedAt(savedRun.savedAt)} · {getPhaseName(state.phase)}</div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ResumeChip label="天数" value={`第 ${state.day} 天`} toneClass="text-white" />
          <ResumeChip label="压力" value={`${state.player.stress}%`} toneClass="text-red-200" />
          <ResumeChip label="国库" value={state.resources.treasury} toneClass="text-yellow-200" />
          <ResumeChip label="军力" value={state.resources.military} toneClass="text-red-200" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl border border-yellow-600 bg-yellow-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-yellow-600"
          >
            继续上次朝会
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-sm font-bold text-gray-100 transition hover:bg-gray-700"
          >
            放弃旧局并重开
          </button>
        </div>
      </div>
    </div>
  );
}
