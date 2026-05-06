export function MorningScreen({ event, availability, onChoose, locked }) {
  return (
    <section className="parchment flex w-full max-w-3xl flex-col rounded-xl p-6 md:p-10">
      <div className="mb-6 flex items-center border-b border-gray-700 pb-4">
        <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-600 bg-gray-800 shadow-inner">
          <i className={`fas ${event.icon} ${event.color} text-3xl`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-yellow-500">{event.title}</h2>
          <span className="text-sm text-gray-500">{event.tag}</span>
        </div>
      </div>

      <p className="mb-8 rounded border-l-4 border-gray-600 bg-gray-800/50 p-4 font-serif text-lg leading-relaxed text-gray-300">
        {event.desc}
      </p>

      <div className="flex flex-col space-y-4">
        {event.choices.map((choice) => {
          const isEnabled = !locked && Boolean(availability[choice.id]);
          const [label, detail] = choice.text.split('(');

          return (
            <button
              key={choice.id}
              type="button"
              className={`btn-choice flex flex-col justify-between rounded-lg border p-4 text-left ${
                isEnabled ? 'border-gray-600 bg-gray-800 text-gray-200' : 'cursor-not-allowed border-gray-800 bg-gray-900/60 text-gray-500'
              }`}
              disabled={!isEnabled}
              onClick={(eventObject) => {
                const rect = eventObject.currentTarget.getBoundingClientRect();
                onChoose(choice.id, { x: rect.right - 20, y: rect.top });
              }}
            >
              <div className="mb-1 font-bold">{label.trim()}</div>
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
