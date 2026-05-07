import { RESOURCE_KEYS, RESOURCE_META } from '../../data/gameContent';
import { getPhaseName } from '../../logic/engine/gameEngine';

function formatDelta(delta) {
  if (delta > 0) {
    return { label: `+${delta}`, className: 'text-emerald-300', icon: 'fa-arrow-trend-up' };
  }

  if (delta < 0) {
    return { label: `${delta}`, className: 'text-red-300', icon: 'fa-arrow-trend-down' };
  }

  return { label: '0', className: 'text-gray-500', icon: 'fa-minus' };
}

function ResourceMeter({ type, value, delta }) {
  const meta = RESOURCE_META[type];
  const safeValue = Math.max(0, Math.min(100, value));
  const isLow = safeValue <= 20;
  const deltaMeta = formatDelta(delta);

  return (
    <div className="resource-group min-w-[5rem]" data-type={type}>
      <div className="mb-1 flex justify-between text-xs">
        <span className={meta.textColor}>
          <i className={`fas ${meta.icon} mr-1`} />
          {meta.label}
        </span>
        <span className={`font-mono ${deltaMeta.className}`}>
          <i className={`fas ${deltaMeta.icon} mr-1 text-[10px]`} />
          {deltaMeta.label}
        </span>
      </div>
      <div className="relative h-2 w-16 rounded-full border border-gray-700 bg-gray-800 sm:w-20 md:w-24">
        <div
          className={`bar-transition h-full rounded-full ${isLow ? 'animate-pulse bg-red-500' : meta.barColor}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

function StatusMeter({ label, icon, valueText, width, barClassName, tooltip, alert }) {
  return (
    <div className="group relative flex cursor-help flex-col items-end">
      <div className="mb-1 flex w-full justify-between text-xs">
        <span className={alert ? 'text-red-300' : 'text-blue-300'}>
          {label} <i className={`fas ${icon}`} />
        </span>
        <span className={`font-mono ${alert ? 'animate-bounce text-red-500' : ''}`}>{valueText}</span>
      </div>
      <div className="h-2 w-24 rounded-full border border-gray-700 bg-gray-800">
        <div className={`bar-transition h-full rounded-full ${barClassName}`} style={{ width }} />
      </div>
      <div className="absolute right-0 top-full z-50 mt-2 hidden w-48 rounded border border-gray-600 bg-gray-800 p-2 text-xs group-hover:block">
        {tooltip}
      </div>
    </div>
  );
}

function RiskBadge({ visibleRisks }) {
  const highestRisk = visibleRisks.find((risk) => risk.level.key === 'danger')
    ?? visibleRisks.find((risk) => risk.level.key === 'caution');

  if (!highestRisk) {
    return (
      <div className="mt-2 inline-flex items-center gap-2 self-start rounded-full border border-emerald-700/70 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-200">
        <i className="fas fa-shield-heart" />
        朝局暂稳
      </div>
    );
  }

  return (
    <div className={`mt-2 inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs ${highestRisk.level.badgeClass}`}>
      <i className={`fas ${highestRisk.icon}`} />
      {highestRisk.label}：{highestRisk.level.label}
    </div>
  );
}

export function TopBar({ gameState, visibleRisks, onOpenLog }) {
  const stressAlert = gameState.player.stress > 80;

  return (
    <header className="z-10 flex flex-wrap items-start justify-between gap-3 border-b border-gray-700 bg-gray-900 p-3 shadow-lg xl:rounded-[24px] xl:border xl:px-5 xl:py-4 xl:shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold tracking-wider text-yellow-600">
          <i className="fas fa-chess-king mr-2" />
          王冠之重
          <span className="ml-2 text-xs text-gray-500">SlackerKing</span>
        </h1>
        <span className="mt-1 text-xs font-mono text-gray-400">第 {gameState.day} 天 - {getPhaseName(gameState.phase)}</span>
        <RiskBadge visibleRisks={visibleRisks} />
      </div>

      <button
        type="button"
        onClick={onOpenLog}
        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-600 bg-gray-800/90 px-3 py-2 text-xs font-semibold text-gray-200 md:hidden"
      >
        <i className="fas fa-book-open" />
        史官起居注
      </button>

      <div className="flex w-full flex-wrap justify-start gap-x-3 gap-y-2 md:mt-0 md:flex-1 md:justify-center md:space-x-0 xl:w-auto xl:flex-nowrap xl:gap-x-7">
        {RESOURCE_KEYS.map((key) => (
          <ResourceMeter key={key} type={key} value={gameState.resources[key]} delta={gameState.dailyChanges[key]} />
        ))}
      </div>

      <div className="grid w-full grid-cols-2 gap-2 text-xs md:hidden">
        <div className={`rounded-lg border px-3 py-2 ${stressAlert ? 'border-red-800/70 bg-red-950/20 text-red-100' : 'border-gray-700/70 bg-gray-900/60 text-gray-300'}`}>
          <div className="flex items-center justify-between gap-2">
            <span><i className="fas fa-brain mr-1" />压力</span>
            <span className="font-mono font-bold">{gameState.player.stress}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full border border-gray-700 bg-gray-800">
            <div className={`bar-transition h-full rounded-full ${stressAlert ? 'animate-pulse bg-red-500' : 'bg-gradient-to-r from-orange-500 to-red-600'}`} style={{ width: `${gameState.player.stress}%` }} />
          </div>
        </div>
        <div className="rounded-lg border border-gray-700/70 bg-gray-900/60 px-3 py-2 text-gray-300">
          <div className="flex items-center justify-between gap-2">
            <span><i className="fas fa-bolt mr-1" />精力</span>
            <span className="font-mono font-bold text-blue-300">{gameState.player.energy}</span>
          </div>
          <div className="mt-2 h-2 rounded-full border border-gray-700 bg-gray-800">
            <div className="bar-transition h-full rounded-full bg-blue-500" style={{ width: `${gameState.player.energy}%` }} />
          </div>
        </div>
      </div>

      <div className="hidden min-w-[200px] justify-end space-x-6 border-l border-gray-700 pl-4 md:flex xl:min-w-[240px]">
        <StatusMeter
          label="压力"
          icon="fa-brain"
          valueText={`${gameState.player.stress}%`}
          width={`${gameState.player.stress}%`}
          barClassName="bg-gradient-to-r from-orange-500 to-red-600"
          tooltip="达到 100% 将中风死亡。通过午后享乐降低。"
          alert={stressAlert}
        />
        <StatusMeter
          label="精力"
          icon="fa-bolt"
          valueText={gameState.player.energy}
          width={`${gameState.player.energy}%`}
          barClassName="bg-blue-500"
          tooltip="每天早晨恢复。处理政务需要消耗。耗尽后只能选择低成本选项。"
          alert={false}
        />
      </div>
    </header>
  );
}
