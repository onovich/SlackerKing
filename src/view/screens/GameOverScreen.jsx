export function GameOverScreen({ gameOver, day, onRestart }) {
  return (
    <section className="parchment flex w-full max-w-xl flex-col rounded-xl border-4 border-red-800 p-8 text-center shadow-[0_0_30px_rgba(220,38,38,0.3)] xl:max-w-2xl xl:p-10">
      <i className="fas fa-skull-crossbones mb-6 text-7xl text-red-600 drop-shadow-lg" />
      <h2 className="mb-2 text-4xl font-black tracking-widest text-gray-100">驾 崩</h2>
      <div className="mx-auto mb-6 h-1 w-24 bg-red-600" />

      <h3 className="mb-4 text-2xl font-bold text-yellow-500">{gameOver?.cause}</h3>
      <p className="mb-8 rounded bg-gray-900/50 p-4 text-lg leading-relaxed text-gray-300">{gameOver?.desc}</p>

      <div className="mb-8 grid grid-cols-2 gap-4 rounded bg-gray-800 p-4 text-left text-sm text-gray-400">
        <div>
          在位天数: <span className="font-bold text-white">{day}</span>
        </div>
        <div>
          最终声望: <span className="font-bold text-yellow-400">{gameOver?.title}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-lg border border-red-500 bg-red-800 px-8 py-3 font-bold text-white transition hover:bg-red-700"
      >
        <i className="fas fa-redo mr-2" />下一世再做庸君
      </button>
      <div className="mt-4 hidden text-sm text-gray-500 xl:block">桌面端可按 R 快速重开。</div>
    </section>
  );
}
