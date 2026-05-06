import { locations } from '../../data/gameContent';

export function AfternoonScreen({ ap, onChooseLocation, onEndAfternoon, locked }) {
  return (
    <section className="flex w-full max-w-5xl flex-col xl:max-w-6xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-widest text-yellow-500">
          <i className="fab fa-fort-awesome mr-3" />皇家内廷
        </h2>
        <p className="mt-2 text-gray-400 xl:text-lg">
          剩余行动力：
          <span className="mx-2 rounded bg-gray-800 px-2 text-xl font-bold text-blue-400">{ap}</span>
          是去体察民情，还是纵情声色？
        </p>
        <p className="mt-3 hidden text-sm text-gray-500 xl:block">桌面端支持数字键 1-5 快速移动，按 Enter 可直接回寝宫安歇。</p>
      </div>

      <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-7 ${locked ? 'pointer-events-none opacity-50' : ''}`}>
        {locations.map((location, index) => (
          <button
            key={location.id}
            type="button"
            className="group relative flex cursor-pointer flex-col items-center rounded-xl border border-gray-700 bg-gray-800/80 p-6 text-center shadow-md transition-all hover:border-gray-500 hover:bg-gray-700 xl:min-h-[15rem] xl:justify-center xl:p-7"
            style={{ animationDelay: `${index * 0.1}s` }}
            disabled={locked || ap <= 0}
            onClick={() => onChooseLocation(location.id)}
          >
            <span className="absolute right-3 top-3 hidden rounded border border-gray-600 bg-gray-900/80 px-2 py-1 font-mono text-xs text-gray-300 lg:inline-flex">
              {index + 1}
            </span>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-700 bg-gray-900 transition-transform group-hover:scale-110">
              <i className={`fas ${location.icon} ${location.color} text-2xl`} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-200">{location.name}</h3>
            <p className="two-line-clamp text-sm text-gray-400">{location.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-10 text-center xl:flex xl:items-center xl:justify-between">
        <div className="hidden text-left text-sm text-gray-500 xl:block">
          <div>鼠标悬停查看地点信息，键盘可快速巡幸。</div>
          <div className="mt-1">行动力归零后会自动进入夜间结算。</div>
        </div>
        <button
          type="button"
          onClick={onEndAfternoon}
          className="rounded-lg border border-gray-500 bg-gradient-to-r from-gray-700 to-gray-600 px-10 py-3 font-bold tracking-wide text-white shadow-lg transition hover:-translate-y-1 hover:from-gray-600 hover:to-gray-500"
        >
          回寝宫安歇 <i className="fas fa-bed ml-2" />
        </button>
      </div>
    </section>
  );
}
