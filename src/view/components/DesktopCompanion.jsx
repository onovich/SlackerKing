function ShortcutRow({ keyLabel, description }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-700/80 bg-gray-900/70 px-3 py-2 text-sm text-gray-300">
      <span>{description}</span>
      <span className="rounded border border-yellow-700/70 bg-yellow-900/30 px-2 py-1 font-mono text-xs text-yellow-300">
        {keyLabel}
      </span>
    </div>
  );
}

function ResourceRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-900/60 px-3 py-2 text-sm text-gray-300">
      <span>{label}</span>
      <span className={`font-mono font-bold ${tone}`}>{value}</span>
    </div>
  );
}

export function DesktopCompanion({ gameState, currentEvent }) {
  const shortcuts = gameState.isGameOver
    ? [{ keyLabel: 'R', description: '重新开始这一局' }]
    : gameState.phase === 'morning'
      ? [
          { keyLabel: '1-9', description: '快速选择奏章选项' },
          { keyLabel: '鼠标悬停', description: '阅读条件与消耗提示' },
        ]
      : gameState.phase === 'afternoon'
        ? [
            { keyLabel: '1-5', description: '快速前往午后地点' },
            { keyLabel: 'Enter', description: '直接结束午后行动' },
          ]
        : [
            { keyLabel: 'Enter', description: '进入下一天' },
            { keyLabel: '滚轮', description: '查看夜间结算详情' },
          ];

  const latestLog = gameState.logs.at(-1)?.text;

  return (
    <aside className="hidden xl:flex xl:w-72 xl:flex-col xl:gap-4">
      <div className="desktop-card sticky top-4 flex flex-col gap-4 rounded-2xl border border-gray-700/80 bg-gray-900/75 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Desktop Mode</div>
          <h2 className="mt-2 text-xl font-bold text-yellow-500">御案总览</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            大屏模式保留手机端视觉风格，只在桌面端补充信息密度和快捷操作。
          </p>
        </div>

        <div className="rounded-xl border border-gray-700/80 bg-gray-800/70 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Current Focus</div>
          <div className="mt-2 text-lg font-bold text-gray-100">{gameState.isGameOver ? '王朝落幕' : currentEvent?.title ?? '宫廷事务'}</div>
          <div className="mt-1 text-sm text-gray-400">{gameState.isGameOver ? '按 R 可立即重开' : currentEvent?.tag ?? '当前阶段摘要'}</div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Shortcuts</div>
          {shortcuts.map((item) => (
            <ShortcutRow key={`${item.keyLabel}-${item.description}`} keyLabel={item.keyLabel} description={item.description} />
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Court Snapshot</div>
          <ResourceRow label="行动力 / 精力" value={`${gameState.player.ap} / ${gameState.player.energy}`} tone="text-blue-300" />
          <ResourceRow label="压力" value={`${gameState.player.stress}%`} tone="text-red-300" />
          <ResourceRow label="国库" value={gameState.resources.treasury} tone="text-yellow-300" />
          <ResourceRow label="权威" value={gameState.resources.authority} tone="text-purple-300" />
        </div>

        <div className="rounded-xl border border-gray-700/80 bg-gray-800/60 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Latest Record</div>
          <p className="mt-2 text-sm leading-6 text-gray-300">{latestLog ?? '史官尚未落笔，风暴仍在酝酿。'}</p>
        </div>
      </div>
    </aside>
  );
}
