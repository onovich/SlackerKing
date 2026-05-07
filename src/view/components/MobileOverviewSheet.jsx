import { getPhaseName } from '../../logic/engine/gameEngine';
import { getGuidance } from './DesktopCompanion';

function SummaryRow({ label, value, toneClass = 'text-gray-100' }) {
  return (
    <div className="rounded-lg border border-gray-700/70 bg-gray-900/60 px-3 py-2 text-sm">
      <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">{label}</div>
      <div className={`mt-1 font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function FigureTag({ figure }) {
  return (
    <div className="rounded-lg border border-gray-700/70 bg-gray-900/60 px-3 py-2 text-sm text-gray-200">
      <div className="font-semibold">{figure.displayName ?? figure.name}</div>
      <div className="mt-1 text-xs text-gray-500">{figure.title}</div>
    </div>
  );
}

function RiskCard({ risk }) {
  return (
    <div className="rounded-xl border border-gray-700/70 bg-gray-900/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-gray-100">{risk.label}</div>
        <div className={`rounded-full border px-2 py-1 text-[11px] ${risk.level.badgeClass}`}>{risk.level.label}</div>
      </div>
      <p className="mt-2 text-xs leading-5 text-gray-400">{risk.sourceText}</p>
    </div>
  );
}

function FactionCard({ faction }) {
  return (
    <div className="rounded-xl border border-gray-700/70 bg-gray-900/60 p-3">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-100">
        <span>{faction.label}</span>
        <span className={`rounded-full border px-2 py-1 text-[11px] ${faction.level.badgeClass}`}>{faction.level.label}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-gray-400">{faction.score > 0 ? faction.summary : '你暂时还没明显向这股势力下注。'}</p>
    </div>
  );
}

export function MobileOverviewSheet({ gameState, currentEvent, visibleRisks, factionOverview, courtFigures, onClose }) {
  const guidance = getGuidance(gameState, visibleRisks, factionOverview);
  const latestLog = gameState.logs.at(-1)?.text;
  const leadingFactions = factionOverview.filter((item) => item.score > 0).slice(0, 2);
  const visibleFigures = courtFigures.slice(0, 3);
  const visibleRiskCards = visibleRisks.slice(0, 3);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-8 lg:hidden" onClick={onClose}>
      <aside
        className="mobile-sheet-panel flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] border border-gray-700 bg-gray-900 shadow-[0_-16px_32px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-gray-500">{getPhaseName(gameState.phase)}</div>
            <div className="mt-1 text-lg font-bold text-yellow-500">王座提要</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-600 bg-gray-900/80 px-3 py-2 text-xs font-semibold text-gray-200"
          >
            关闭
          </button>
        </div>

        <div className="log-container flex-1 space-y-4 overflow-y-auto p-4">
          <div className="rounded-xl border border-gray-700/70 bg-gray-800/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Current Focus</div>
            <div className="mt-2 text-base font-bold text-gray-100">{gameState.isGameOver ? '王朝落幕' : currentEvent?.title ?? '宫廷事务'}</div>
            <div className="mt-1 text-sm text-gray-400">{gameState.isGameOver ? '这一局已经结束。' : currentEvent?.tag ?? '当前阶段摘要'}</div>
          </div>

          <div className="rounded-xl border border-yellow-800/60 bg-yellow-900/10 p-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-yellow-500">Current Objective</div>
            <div className="mt-2 text-base font-bold text-yellow-200">{guidance.title}</div>
            <p className="mt-2 text-sm leading-6 text-yellow-100/85">{guidance.body}</p>
          </div>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.25em] text-gray-500">Court Snapshot</div>
            <div className="grid grid-cols-2 gap-2">
              <SummaryRow label="行动力 / 精力" value={`${gameState.player.ap} / ${gameState.player.energy}`} toneClass="text-blue-300" />
              <SummaryRow label="压力" value={`${gameState.player.stress}%`} toneClass="text-red-300" />
              <SummaryRow label="国库" value={gameState.resources.treasury} toneClass="text-yellow-300" />
              <SummaryRow label="权威" value={gameState.resources.authority} toneClass="text-purple-300" />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.25em] text-gray-500">Court Risks</div>
            <div className="space-y-2">
              {visibleRiskCards.length > 0 ? visibleRiskCards.map((risk) => <RiskCard key={risk.id} risk={risk} />) : (
                <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/10 p-3 text-sm leading-6 text-emerald-200">
                  目前没有暴露出的重大隐患，适合先囤资源和缓冲。
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.25em] text-gray-500">Faction Drift</div>
            <div className="space-y-2">
              {leadingFactions.length > 0 ? leadingFactions.map((faction) => <FactionCard key={faction.id} faction={faction} />) : (
                <div className="rounded-xl border border-gray-700/70 bg-gray-900/60 p-3 text-sm leading-6 text-gray-300">
                  你的路线还没成形，接下来几次选择会开始暴露统治倾向。
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.25em] text-gray-500">Key Figures</div>
            <div className="space-y-2">
              {visibleFigures.length > 0 ? visibleFigures.map((figure) => <FigureTag key={figure.id} figure={figure} />) : (
                <div className="rounded-xl border border-gray-700/70 bg-gray-900/60 p-3 text-sm leading-6 text-gray-300">
                  还没有谁真正走到台前。路线和危机会先把人逼出来。
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-700/70 bg-gray-800/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Latest Record</div>
            <p className="mt-2 text-sm leading-6 text-gray-300">{latestLog ?? '史官尚未落笔，风暴仍在酝酿。'}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}