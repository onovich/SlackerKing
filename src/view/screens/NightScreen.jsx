const toneClassMap = {
  alert: 'bg-red-900/20 text-gray-200',
  info: 'text-gray-400',
  calm: 'text-gray-300',
};

const iconClassMap = {
  alert: 'fas fa-exclamation-triangle text-red-500',
  info: 'fas fa-hourglass-half text-gray-500',
  calm: 'fas fa-star text-yellow-600',
};

function getNightTakeaway(summary) {
  const firstAlert = summary.find((item) => item.tone === 'alert');
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

  return {
    title: '今夜结论：局势暂时可控',
    body: '虽然没有突发危机，但固定开销和压力增长仍在持续。平静不等于安全。',
    panelClass: 'border-gray-700/70 bg-gray-900/50 text-gray-100',
  };
}

export function NightScreen({ summary, onNextDay }) {
  const takeaway = getNightTakeaway(summary);

  return (
    <section className="parchment flex w-full max-w-2xl flex-col rounded-xl p-8 xl:max-w-4xl xl:p-10">
      <div className="mb-6 border-b border-gray-700 pb-4 text-center">
        <i className="fas fa-moon mb-4 animate-pulse text-5xl text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-200">暗夜密报</h2>
        <p className="mt-3 hidden text-sm text-gray-500 xl:block">桌面端可按 Enter 继续，滚轮浏览整晚的连锁后果。</p>
      </div>

      <div className={`mb-6 rounded-xl border p-4 ${takeaway.panelClass}`}>
        <div className="text-xs uppercase tracking-[0.3em] text-gray-400">Tonight's Takeaway</div>
        <div className="mt-2 text-lg font-bold">{takeaway.title}</div>
        <p className="mt-2 text-sm leading-6 opacity-90">{takeaway.body}</p>
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
        className="w-full rounded-lg border border-yellow-500 bg-yellow-700 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-yellow-600"
      >
        迎接新的一天（敲响晨钟）
      </button>
    </section>
  );
}
