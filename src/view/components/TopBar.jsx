import { RESOURCE_KEYS, RESOURCE_META } from '../../data/gameContent';
import { getPhaseName } from '../../logic/engine/gameEngine';

function ResourceMeter({ type, value }) {
  const meta = RESOURCE_META[type];
  const safeValue = Math.max(0, Math.min(100, value));
  const isLow = safeValue <= 20;

  return (
    <div className="resource-group" data-type={type}>
      <div className="mb-1 flex justify-between text-xs">
        <span className={meta.textColor}>
          <i className={`fas ${meta.icon} mr-1`} />
          {meta.label}
        </span>
      </div>
      <div className="relative h-2 w-20 rounded-full border border-gray-700 bg-gray-800 md:w-24">
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

export function TopBar({ gameState }) {
  const stressAlert = gameState.player.stress > 80;

  return (
    <header className="z-10 flex flex-wrap items-center justify-between border-b border-gray-700 bg-gray-900 p-3 shadow-lg">
      <div className="flex min-w-[200px] flex-col">
        <h1 className="text-lg font-bold tracking-wider text-yellow-600">
          <i className="fas fa-chess-king mr-2" />
          王冠之重
          <span className="ml-2 text-xs text-gray-500">SlackerKing</span>
        </h1>
        <span className="mt-1 text-xs font-mono text-gray-400">第 {gameState.day} 天 - {getPhaseName(gameState.phase)}</span>
      </div>

      <div className="flex flex-1 justify-center space-x-4 md:space-x-8">
        {RESOURCE_KEYS.map((key) => (
          <ResourceMeter key={key} type={key} value={gameState.resources[key]} />
        ))}
      </div>

      <div className="min-w-[200px] justify-end space-x-6 border-l border-gray-700 pl-4 hidden md:flex">
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
