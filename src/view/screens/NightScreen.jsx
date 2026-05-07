const toneClassMap = {
  alert: 'bg-red-900/20 text-gray-200',
  warning: 'bg-yellow-900/20 text-yellow-100',
  info: 'text-gray-400',
  calm: 'text-gray-300',
};

const iconClassMap = {
  alert: 'fas fa-exclamation-triangle text-red-500',
  warning: 'fas fa-bell text-yellow-500',
  info: 'fas fa-hourglass-half text-gray-500',
  calm: 'fas fa-star text-yellow-600',
};

const dailyDeltaMeta = {
  treasury: { label: '国库', positiveClass: 'text-yellow-300', negativeClass: 'text-yellow-500' },
  authority: { label: '权威', positiveClass: 'text-purple-300', negativeClass: 'text-purple-500' },
  military: { label: '军力', positiveClass: 'text-red-300', negativeClass: 'text-red-500' },
  favor: { label: '民心', positiveClass: 'text-green-300', negativeClass: 'text-green-500' },
  stress: { label: '压力', positiveClass: 'text-emerald-300', negativeClass: 'text-red-300' },
};

function DailyDeltaRow({ label, delta, positiveClass, negativeClass, inverse = false }) {
  const isPositive = inverse ? delta < 0 : delta > 0;
  const isNegative = inverse ? delta > 0 : delta < 0;
  const toneClass = isPositive ? positiveClass : isNegative ? negativeClass : 'text-gray-400';
  const prefix = delta > 0 ? '+' : '';

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-900/60 px-3 py-2 text-sm">
      <span className="text-gray-300">{label}</span>
      <span className={`font-mono font-bold ${toneClass}`}>{prefix}{delta}</span>
    </div>
  );
}

function getNightTakeaway(summary) {
  const firstAlert = summary.find((item) => item.tone === 'alert');
  const firstWarning = summary.find((item) => item.tone === 'warning');
  const firstInfo = summary.find((item) => item.tone === 'info');

  if (firstAlert?.text.includes('宰相')) {
    return {
      title: '今夜结论：权威正在失守',
      body: '宫廷内斗已经开始反噬你。明天优先处理会继续削弱王权的隐患。',
      panelClass: 'border-red-800/70 bg-red-950/20 text-red-100',
    };
  }

  if (firstAlert?.text.includes('北方')) {
    return {
      title: '今夜结论：外敌压力抬头',
      body: '接下来最重要的是军力和国库。没有资源缓冲，下一波战报会更难看。',
      panelClass: 'border-red-800/70 bg-red-950/20 text-red-100',
    };
  }

  if (firstAlert?.text.includes('南方')) {
    return {
      title: '今夜结论：地方正在离心',
      body: '民心和财政都在为你的拖延买单。明天不要再放任同类问题继续发酵。',
      panelClass: 'border-red-800/70 bg-red-950/20 text-red-100',
    };
  }

  if (firstAlert?.text.includes('政令') || firstAlert?.text.includes('行政')) {
    return {
      title: '今夜结论：乱批的代价开始兑现',
      body: '继续省事只会把你推向更糟的夜间连锁。接下来要减少无脑盖章。',
      panelClass: 'border-red-800/70 bg-red-950/20 text-red-100',
    };
  }

  if (firstInfo?.text.includes('情报布控')) {
    return {
      title: '今夜结论：情报为你买到了时间',
      body: '这不是解决问题，只是延缓爆发。明天还得真正处理那条隐患。',
      panelClass: 'border-blue-800/70 bg-blue-950/20 text-blue-100',
    };
  }

  if (firstWarning) {
    return {
      title: '今夜结论：危机已经被提前预警',
      body: '今晚还没真正爆炸，但这说明你只剩下一到两天的修补窗口了。',
      panelClass: 'border-yellow-800/70 bg-yellow-950/20 text-yellow-100',
    };
  }

  return {
    title: '今夜结论：局势暂时可控',
    body: '虽然没有突发危机，但固定开销和压力增长仍在持续。平静不等于安全。',
    panelClass: 'border-gray-700/70 bg-gray-900/50 text-gray-100',
  };
}

function getRegimeTone(regimeSummary) {
  if (!regimeSummary?.primaryFaction) {
    return 'border-gray-700 bg-gray-900/40 text-gray-200';
  }

  if (regimeSummary.primaryFaction.id === 'old_nobles') {
    return 'border-yellow-800/70 bg-yellow-950/20 text-yellow-100';
  }

  if (regimeSummary.primaryFaction.id === 'military') {
    return 'border-red-800/70 bg-red-950/20 text-red-100';
  }

  if (regimeSummary.primaryFaction.id === 'merchants') {
    return 'border-amber-800/70 bg-amber-950/20 text-amber-100';
  }

  return 'border-sky-800/70 bg-sky-950/20 text-sky-100';
}

function getFigureNames(regimeSummary) {
  return regimeSummary?.figures?.map((figure) => figure.displayName ?? figure.name).join('、') ?? '';
}

export function NightScreen({ summary, dailyChanges, regimeSummary, onNextDay }) {
  const takeaway = getNightTakeaway(summary);
  const regimeTone = getRegimeTone(regimeSummary);
  const figureNames = getFigureNames(regimeSummary);

  return (
    <section className="parchment flex w-full max-w-2xl flex-col rounded-xl p-5 sm:p-6 xl:max-w-4xl xl:p-10">
      <div className="mb-6 border-b border-gray-700 pb-4 text-center">
        <i className="fas fa-moon mb-4 animate-pulse text-5xl text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-200">暗夜密报</h2>
        <p className="mt-3 text-sm text-gray-400 xl:hidden">手机端可在底部直接进入下一天，先看完今晚的连锁后果。</p>
        <p className="mt-3 hidden text-sm text-gray-500 xl:block">桌面端可按 Enter 继续，滚轮浏览整晚的连锁后果。</p>
      </div>

      <div className={`mb-6 rounded-xl border p-4 ${takeaway.panelClass}`}>
        <div className="text-xs uppercase tracking-[0.3em] text-gray-400">Tonight's Takeaway</div>
        <div className="mt-2 text-lg font-bold">{takeaway.title}</div>
        <p className="mt-2 text-sm leading-6 opacity-90">{takeaway.body}</p>
      </div>

      <div className={`mb-6 rounded-xl border p-4 ${regimeTone}`}>
        <div className="text-xs uppercase tracking-[0.3em] opacity-70">Court Wind</div>
        {regimeSummary?.epithet ? <div className="mt-2 text-sm font-semibold opacity-80">统治称号：{regimeSummary.epithet}</div> : null}
        <div className="mt-2 text-lg font-bold">{regimeSummary?.title}</div>
        <p className="mt-2 text-sm leading-6 opacity-90">{regimeSummary?.body}</p>
        {regimeSummary?.epithetDetail ? <p className="mt-2 text-xs leading-5 opacity-70">{regimeSummary.epithetDetail}</p> : null}
        {figureNames ? <p className="mt-3 text-xs leading-5 opacity-70">今夜最值得盯住的人物：{figureNames}</p> : null}
      </div>

      <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900/60 p-4">
        <div className="text-xs uppercase tracking-[0.3em] text-gray-500">Today's Ledger</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <DailyDeltaRow label={dailyDeltaMeta.treasury.label} delta={dailyChanges.treasury} positiveClass={dailyDeltaMeta.treasury.positiveClass} negativeClass={dailyDeltaMeta.treasury.negativeClass} />
          <DailyDeltaRow label={dailyDeltaMeta.authority.label} delta={dailyChanges.authority} positiveClass={dailyDeltaMeta.authority.positiveClass} negativeClass={dailyDeltaMeta.authority.negativeClass} />
          <DailyDeltaRow label={dailyDeltaMeta.military.label} delta={dailyChanges.military} positiveClass={dailyDeltaMeta.military.positiveClass} negativeClass={dailyDeltaMeta.military.negativeClass} />
          <DailyDeltaRow label={dailyDeltaMeta.favor.label} delta={dailyChanges.favor} positiveClass={dailyDeltaMeta.favor.positiveClass} negativeClass={dailyDeltaMeta.favor.negativeClass} />
          <div className="col-span-2">
            <DailyDeltaRow label={dailyDeltaMeta.stress.label} delta={dailyChanges.stress} positiveClass={dailyDeltaMeta.stress.positiveClass} negativeClass={dailyDeltaMeta.stress.negativeClass} inverse />
          </div>
        </div>
      </div>

      <div className="mb-8 max-h-[40vh] overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-1 xl:max-h-[48vh]">
        <ul className="divide-y divide-gray-800 text-left text-gray-300">
          {summary.map((item) => (
            <li key={item.id} className={`px-4 py-3 ${toneClassMap[item.tone] ?? ''}`}>
              <div className="flex items-start">
                <i className={`${iconClassMap[item.tone] ?? iconClassMap.info} mr-3 mt-1`} />
                <span>{item.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onNextDay}
        className="hidden w-full rounded-lg border border-yellow-500 bg-yellow-700 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-yellow-600 md:block"
      >
        迎接新的一天（敲响晨钟）
      </button>
    </section>
  );
}
