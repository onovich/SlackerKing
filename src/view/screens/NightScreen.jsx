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

export function NightScreen({ summary, onNextDay }) {
  return (
    <section className="parchment flex w-full max-w-2xl flex-col rounded-xl p-8">
      <div className="mb-6 border-b border-gray-700 pb-4 text-center">
        <i className="fas fa-moon mb-4 animate-pulse text-5xl text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-200">暗夜密报</h2>
      </div>

      <div className="mb-8 max-h-[40vh] overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-1">
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
