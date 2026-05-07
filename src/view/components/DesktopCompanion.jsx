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

function RiskRow({ risk }) {
  return (
    <div className="rounded-xl border border-gray-700/80 bg-gray-800/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-100">
          <i className={`fas ${risk.icon} ${risk.level.accentClass}`} />
          <span>{risk.label}</span>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs ${risk.level.badgeClass}`}>
          {risk.level.label}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-gray-400">{risk.sourceText}</p>
      {risk.isSuppressed ? (
        <p className="mt-2 rounded-lg border border-blue-800/60 bg-blue-900/20 px-2 py-1 text-xs leading-5 text-blue-200">
          情报暗室已布控：今夜该隐患不会继续恶化。
        </p>
      ) : null}
      <p className="mt-2 text-xs leading-5 text-gray-500">应对：{risk.mitigationText}</p>
    </div>
  );
}

function FactionRow({ faction }) {
  const width = faction.score > 0 ? Math.min(100, faction.score * 18) : 8;

  return (
    <div className={`rounded-xl border p-3 ${faction.isLeading ? 'border-yellow-700/60 bg-yellow-950/10' : 'border-gray-700/80 bg-gray-800/60'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-100">
          <i className={`fas ${faction.icon} ${faction.accentClass}`} />
          <span>{faction.label}</span>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs ${faction.level.badgeClass}`}>
          {faction.level.label}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-900/80">
        <div className={`h-full rounded-full ${faction.level.barClass}`} style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-xs leading-5 text-gray-400">
        {faction.score > 0 ? faction.summary : '你暂时还没有明显向这股势力下注。'}
      </p>
    </div>
  );
}

function getGuidance(gameState, visibleRisks, factionOverview) {
  const lowestResource = Object.entries(gameState.resources).sort((left, right) => left[1] - right[1])[0];
  const highestRisk = visibleRisks[0];
  const leadingFaction = factionOverview[0]?.score >= 3 ? factionOverview[0] : null;

  if (gameState.isGameOver) {
    return {
      title: '复盘这次败局',
      body: '回看最后几条史官记录，找出是哪条资源或哪项隐患先失控。下一局先补那一环。',
    };
  }

  if (gameState.player.stress >= 75) {
    return {
      title: '先处理压力',
      body: '你的压力已经逼近危险线。下一次午后优先减压，否则可能先死在王座上。',
    };
  }

  if (highestRisk?.level.key === 'danger') {
    return {
      title: '先压住危急隐患',
      body: `当前最危险的是“${highestRisk.label}”。优先围绕它做选择，并为夜间后果留出缓冲资源。`,
    };
  }

  if (gameState.day <= 3) {
    return {
      title: '建立前期安全垫',
      body: '前 3 天的目标是把四项国家资源尽量稳在 35 以上，不要因为省精力连续埋雷。',
    };
  }

  if (lowestResource && lowestResource[1] < 35) {
    return {
      title: '先补最弱资源',
      body: `你当前最脆弱的是“${lowestResource[0] === 'treasury' ? '国库' : lowestResource[0] === 'authority' ? '权威' : lowestResource[0] === 'military' ? '军力' : '民心'}”。接下来优先修这一项，避免单项崩盘。`,
    };
  }

  if (leadingFaction) {
    return {
      title: '开始兑现路线红利',
      body: `你已经明显在向“${leadingFaction.label}”靠拢。后续尽量连续选择同类手段，才能把这条统治路线做实。`,
    };
  }

  if (highestRisk) {
    return {
      title: '确认你的治理倾向',
      body: `你已经暴露出“${highestRisk.label}”风险。现在不是乱点选项的时候，开始决定你要补权、补军，还是继续享乐硬扛。`,
    };
  }

  return {
    title: '趁平稳期囤余地',
    body: '局势暂时平静时，优先把国库和军力抬起来。后面真正危险时，你需要足够缓冲。',
  };
}

export function DesktopCompanion({ gameState, currentEvent, visibleRisks, factionOverview }) {
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
  const guidance = getGuidance(gameState, visibleRisks, factionOverview);

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

        <div className="rounded-xl border border-yellow-800/60 bg-yellow-900/10 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-yellow-500">Current Objective</div>
          <div className="mt-2 text-base font-bold text-yellow-200">{guidance.title}</div>
          <p className="mt-2 text-sm leading-6 text-yellow-100/80">{guidance.body}</p>
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

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Faction Drift</div>
          {factionOverview.some((item) => item.score > 0) ? (
            factionOverview.map((faction) => <FactionRow key={faction.id} faction={faction} />)
          ) : (
            <div className="rounded-xl border border-gray-700/80 bg-gray-800/60 p-3 text-sm leading-6 text-gray-300">
              你还没有形成明显的派系倾向。接下来几次晨间和午后选择，会慢慢把路线推向不同势力。
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Court Risks</div>
          {visibleRisks.length > 0 ? (
            visibleRisks.map((risk) => <RiskRow key={risk.id} risk={risk} />)
          ) : (
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/10 p-3 text-sm leading-6 text-emerald-200">
              宫廷暂时没有暴露出的重大隐患。现在适合稳资源、攒余地。
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-700/80 bg-gray-800/60 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Latest Record</div>
          <p className="mt-2 text-sm leading-6 text-gray-300">{latestLog ?? '史官尚未落笔，风暴仍在酝酿。'}</p>
        </div>
      </div>
    </aside>
  );
}
