export function MorningScreen({ event, availability, onChoose, locked }) {
  return (
    <section className="parchment flex w-full max-w-3xl flex-col rounded-xl p-6 md:p-10 xl:max-w-6xl xl:flex-row xl:gap-8 xl:p-8">
      <div className="xl:flex xl:min-h-full xl:flex-1 xl:flex-col xl:justify-between">
        <div className="mb-6 flex items-center border-b border-gray-700 pb-4 xl:mb-8">
          <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-600 bg-gray-800 shadow-inner xl:h-20 xl:w-20">
            <i className={`fas ${event.icon} ${event.color} text-3xl xl:text-4xl`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-yellow-500 xl:text-3xl">{event.title}</h2>
            <span className="text-sm text-gray-500 xl:text-base">{event.tag}</span>
          </div>
        </div>

        <p className="mb-8 rounded border-l-4 border-gray-600 bg-gray-800/50 p-4 font-serif text-lg leading-relaxed text-gray-300 xl:mb-0 xl:min-h-[220px] xl:text-[1.15rem] xl:leading-9">
          {event.desc}
        </p>

        <div className="hidden xl:flex xl:flex-wrap xl:gap-3 xl:pt-6">
          <span className="rounded-full border border-gray-600 bg-gray-800/60 px-3 py-1 text-xs uppercase tracking-[0.25em] text-gray-400">
            Desktop Ready
          </span>
          <span className="rounded-full border border-yellow-700/60 bg-yellow-900/20 px-3 py-1 text-xs text-yellow-300">
            数字键 1-{event.choices.length} 可直接选择
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-4 xl:w-[30rem] xl:justify-center">
        {event.choices.map((choice) => {
          const isEnabled = !locked && Boolean(availability[choice.id]);
          const [label, detail] = choice.text.split('(');

          return (
            <button
              key={choice.id}
              type="button"
              className={`btn-choice flex flex-col justify-between rounded-lg border p-4 text-left xl:min-h-[9.5rem] xl:p-5 ${
                isEnabled ? 'border-gray-600 bg-gray-800 text-gray-200 xl:hover:translate-x-2' : 'cursor-not-allowed border-gray-800 bg-gray-900/60 text-gray-500'
              }`}
              disabled={!isEnabled}
              onClick={(eventObject) => {
                const rect = eventObject.currentTarget.getBoundingClientRect();
                onChoose(choice.id, { x: rect.right - 20, y: rect.top });
              }}
            >
              <div className="mb-1 flex items-start justify-between gap-4">
                <span className="font-bold xl:text-lg">{label.trim()}</span>
                <span className="hidden rounded border border-gray-600 bg-gray-900/80 px-2 py-1 font-mono text-xs text-gray-300 lg:inline-flex">
                  {event.choices.indexOf(choice) + 1}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <div className="text-xs italic text-gray-400">{detail ? `(${detail}` : ''}</div>
                {choice.energy > 0 ? (
                  <span className="rounded border border-blue-800 bg-blue-900/50 px-2 py-1 text-xs text-blue-300">
                    <i className="fas fa-bolt mr-1" />-{choice.energy} 精力
                  </span>
                ) : (
                  <span className="rounded border border-green-800 bg-green-900/50 px-2 py-1 text-xs text-green-300">无消耗</span>
                )}
              </div>
              {!availability[choice.id] ? <span className="mt-2 text-xs text-red-500"><i className="fas fa-lock mr-1" />条件未满足</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
