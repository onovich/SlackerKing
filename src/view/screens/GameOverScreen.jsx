import { getArchiveMilestones, getDeathCauseCodex, getEpithetArchetypeCodex, getVictoryOutcomeCodex } from '../../logic/storage/runRecords';

function getOutcomeHint(gameOver) {
  if (gameOver?.isVictory) {
    return '这条活法已经被你跑通了。下一局可以故意换一条主路线，看看同样的乱局还能被你糊弄出多少种收场。';
  }

  const cause = gameOver?.cause;
  if (cause === '中风崩殂') {
    return '你不是死于大事，而是死于长期失控的压力。下一局把减压当成硬约束，而不是可选项。';
  }

  if (cause === '破产引发内乱') {
    return '你给自己留的财政缓冲不够。下一局别把国库当作纯消耗品，至少要撑得住两晚固定开销和一次突发事件。';
  }

  if (cause === '权臣逼宫') {
    return '权威崩盘通常不是一夜之间发生的。下一局看到宰相或类似隐患时，要更早用强硬手段止损。';
  }

  if (cause === '外敌破城') {
    return '没有军力储备时，外交强硬只会把自己送上断头路。下一局在挑衅外敌前先把军力和国库抬起来。';
  }

  if (cause === '大革命') {
    return '民心是最容易被你忽视、却最容易突然清零的资源。下一局别让享乐和怠政连续透支它。';
  }

  return '回看最后几天的日志，找出最先失控的那一环。下一局先稳住它，再考虑更贪的路线。';
}

function getFigureNames(regimeSummary) {
  return regimeSummary?.figures?.map((figure) => figure.displayName ?? figure.name).join('、') ?? '';
}

function getRecordEntries(recordMap) {
  return Object.entries(recordMap ?? {}).sort((left, right) => right[1] - left[1]);
}

function getRecentRuns(runRecords) {
  return Array.isArray(runRecords?.recentRuns) ? runRecords.recentRuns.slice(0, 4) : [];
}

function getRecentRunSubline(run) {
  if (run.primaryFaction && Array.isArray(run.figures) && run.figures.length > 0) {
    return `${run.primaryFaction} · ${run.figures.join('、')}`;
  }

  if (run.primaryFaction) {
    return run.primaryFaction;
  }

  if (Array.isArray(run.figures) && run.figures.length > 0) {
    return run.figures.join('、');
  }

  return '';
}

function CodexBadge({ entry, accentClass, lockedLabel }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs leading-5 ${entry.unlocked ? accentClass : 'border-gray-700/70 bg-gray-950/30 text-gray-500'}`}>
      <div className="font-semibold">{entry.title}</div>
      <div className="mt-1">{entry.unlocked ? `${entry.description} · 已见 ${entry.count} 次` : lockedLabel}</div>
    </div>
  );
}

function MilestoneBadge({ entry }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs leading-5 ${entry.unlocked ? 'border-emerald-700/70 bg-emerald-950/20 text-emerald-100' : 'border-gray-700/70 bg-gray-950/30 text-gray-400'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">{entry.title}</div>
        <div className={`rounded-full border px-2 py-0.5 text-[10px] ${entry.unlocked ? 'border-emerald-700/70 text-emerald-200' : 'border-gray-700 text-gray-500'}`}>
          {entry.unlocked ? '已达成' : entry.progressLabel}
        </div>
      </div>
      <div className="mt-1">{entry.description}</div>
    </div>
  );
}

export function GameOverScreen({ gameOver, day, runRecords, newlyUnlockedMilestones, onRestart }) {
  const retryHint = getOutcomeHint(gameOver);
  const figureNames = getFigureNames(gameOver?.regimeSummary);
  const deathCauseEntries = getRecordEntries(runRecords?.deathCauses).slice(0, 4);
  const epithetEntries = getRecordEntries(runRecords?.epithets).slice(0, 3);
  const recentRuns = getRecentRuns(runRecords);
  const deathCauseCodex = getDeathCauseCodex(runRecords);
  const victoryOutcomeCodex = getVictoryOutcomeCodex(runRecords);
  const epithetCodex = getEpithetArchetypeCodex(runRecords);
  const archiveMilestones = getArchiveMilestones(runRecords);
  const isVictory = Boolean(gameOver?.isVictory);

  return (
    <section className={`parchment flex w-full max-w-xl flex-col rounded-xl border-4 p-5 text-center shadow-[0_0_30px_rgba(220,38,38,0.3)] sm:p-6 xl:max-w-2xl xl:p-10 ${isVictory ? 'border-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-red-800'}`}>
      <i className={`fas ${isVictory ? 'fa-crown' : 'fa-skull-crossbones'} mb-6 text-7xl drop-shadow-lg ${isVictory ? 'text-emerald-400' : 'text-red-600'}`} />
      <h2 className="mb-2 text-3xl font-black tracking-widest text-gray-100 sm:text-4xl">{isVictory ? '功 成' : '驾 崩'}</h2>
      <div className={`mx-auto mb-6 h-1 w-24 ${isVictory ? 'bg-emerald-500' : 'bg-red-600'}`} />

      <h3 className={`mb-4 text-xl font-bold sm:text-2xl ${isVictory ? 'text-emerald-300' : 'text-yellow-500'}`}>{gameOver?.cause}</h3>
      <p className="mb-8 rounded bg-gray-900/50 p-4 text-base leading-7 text-gray-300 sm:text-lg sm:leading-relaxed">{gameOver?.desc}</p>

      <div className="mb-8 grid grid-cols-1 gap-4 rounded bg-gray-800 p-4 text-left text-sm text-gray-400 sm:grid-cols-2">
        <div>
          在位天数: <span className="font-bold text-white">{day}</span>
        </div>
        <div>
          最终称谓: <span className={`font-bold ${isVictory ? 'text-emerald-300' : 'text-yellow-400'}`}>{gameOver?.title}</span>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-yellow-800/60 bg-yellow-900/10 p-4 text-left">
        <div className="text-xs uppercase tracking-[0.3em] text-yellow-500">复盘建议</div>
        <p className="mt-3 text-sm leading-6 text-yellow-100/85">{retryHint}</p>
      </div>

      {newlyUnlockedMilestones?.length ? (
        <div className="mb-8 rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4 text-left">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-400">本局新达成</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {newlyUnlockedMilestones.map((entry) => (
              <MilestoneBadge key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-8 rounded-xl border border-gray-700/80 bg-gray-900/50 p-4 text-left">
        <div className="text-xs uppercase tracking-[0.3em] text-gray-500">统治路线</div>
        {gameOver?.regimeSummary?.epithet ? <div className="mt-3 text-sm font-semibold text-gray-300">统治称号：{gameOver.regimeSummary.epithet}</div> : null}
        <div className="mt-3 text-base font-bold text-gray-100">{gameOver?.regimeSummary?.title}</div>
        <p className="mt-2 text-sm leading-6 text-gray-300">{gameOver?.regimeSummary?.body}</p>
        {gameOver?.regimeSummary?.epithetDetail ? <p className="mt-2 text-xs leading-5 text-gray-500">{gameOver.regimeSummary.epithetDetail}</p> : null}
        {figureNames ? <p className="mt-3 text-xs leading-5 text-gray-500">这一局最常站到台前的人物：{figureNames}</p> : null}
      </div>

      <div className="mb-8 rounded-xl border border-gray-700/80 bg-gray-900/50 p-4 text-left">
        <div className="text-xs uppercase tracking-[0.3em] text-gray-500">王朝档案</div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            最长在位: <span className="font-bold text-white">{runRecords?.bestDay ?? 0}</span>
          </div>
          <div>
            累计败局: <span className="font-bold text-white">{runRecords?.totalRuns ?? 0}</span>
          </div>
          <div>
            累计成功: <span className="font-bold text-emerald-200">{runRecords?.totalVictories ?? 0}</span>
          </div>
          <div>
            已见死法: <span className="font-bold text-white">{Object.keys(runRecords?.deathCauses ?? {}).length}</span>
          </div>
          <div>
            已见胜局: <span className="font-bold text-emerald-200">{Object.keys(runRecords?.victoryCauses ?? {}).length}</span>
          </div>
          <div>
            已获称号: <span className="font-bold text-white">{Object.keys(runRecords?.epithets ?? {}).length}</span>
          </div>
        </div>

        {deathCauseEntries.length ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.25em] text-gray-500">死法记录</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {deathCauseEntries.map(([cause, count]) => (
                <span key={cause} className="rounded-full border border-red-800/70 bg-red-950/20 px-3 py-1 text-xs text-red-100">
                  {cause} x{count}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {epithetEntries.length ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.25em] text-gray-500">已获称号</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {epithetEntries.map(([epithet, count]) => (
                <span key={epithet} className="rounded-full border border-yellow-800/70 bg-yellow-950/20 px-3 py-1 text-xs text-yellow-100">
                  {epithet} x{count}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {recentRuns.length ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-[0.25em] text-gray-500">最近几局</div>
            <div className="mt-2 space-y-2">
              {recentRuns.map((run, index) => (
                <div key={`${run.day}-${run.cause}-${index}`} className="rounded-lg border border-gray-700/70 bg-gray-950/40 px-3 py-2 text-xs text-gray-300">
                  <div className="font-semibold text-gray-100">第 {run.day} 天{run.isVictory ? '功成' : '驾崩'} · {run.cause || (run.isVictory ? '未知胜局' : '未知败局')}</div>
                  <div className="mt-1 text-gray-500">{run.epithet || run.title || '无称号记录'}</div>
                  {run.routeTitle ? <div className="mt-1 text-gray-300">{run.routeTitle}</div> : null}
                  {getRecentRunSubline(run) ? <div className="mt-1 text-gray-500">{getRecentRunSubline(run)}</div> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <div className="text-xs uppercase tracking-[0.25em] text-gray-500">王朝里程碑</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {archiveMilestones.map((entry) => (
              <MilestoneBadge key={entry.id} entry={entry} />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs uppercase tracking-[0.25em] text-gray-500">死法图鉴</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {deathCauseCodex.map((entry) => (
              <CodexBadge key={entry.id} entry={entry} accentClass="border-red-800/70 bg-red-950/20 text-red-100" lockedLabel="尚未见过这种败局。" />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs uppercase tracking-[0.25em] text-gray-500">胜局图鉴</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {victoryOutcomeCodex.map((entry) => (
              <CodexBadge key={entry.id} entry={entry} accentClass="border-emerald-800/70 bg-emerald-950/20 text-emerald-100" lockedLabel="尚未达成这种胜局。" />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs uppercase tracking-[0.25em] text-gray-500">统治原型图鉴</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {epithetCodex.map((entry) => (
              <CodexBadge key={entry.id} entry={entry} accentClass="border-yellow-800/70 bg-yellow-950/20 text-yellow-100" lockedLabel="尚未走出这类统治原型。" />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className={`w-full rounded-lg border px-8 py-3 font-bold text-white transition ${isVictory ? 'border-emerald-500 bg-emerald-700 hover:bg-emerald-600' : 'border-red-500 bg-red-800 hover:bg-red-700'}`}
      >
        <i className="fas fa-redo mr-2" />{isVictory ? '再开一局换条活法' : '下一世再做庸君'}
      </button>
      <div className="mt-4 hidden text-sm text-gray-500 xl:block">桌面端可按 R 快速重开。</div>
    </section>
  );
}
