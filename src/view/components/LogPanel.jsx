function renderHighlightedText(text) {
  const parts = text.split(/(【.*?】)/g).filter(Boolean);
  return parts.map((part, index) =>
    part.startsWith('【') && part.endsWith('】') ? (
      <span key={`${part}-${index}`} className="font-bold text-yellow-500">
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export function LogPanel({ logs }) {
  return (
    <aside className="z-20 hidden w-80 flex-col border-l border-gray-700 bg-gray-900 shadow-[-5px_0_15px_rgba(0,0,0,0.3)] md:flex xl:w-[23rem] xl:overflow-hidden xl:rounded-[24px] xl:border xl:border-gray-700/80 xl:shadow-[0_16px_36px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4">
        <span className="font-bold tracking-wide text-yellow-600">
          <i className="fas fa-book-open mr-2" />
          起居注
        </span>
        <span className="text-xs text-gray-500">史官记录</span>
      </div>
      <div className="log-container flex-1 space-y-4 overflow-y-auto p-4 text-sm font-serif">
        {logs.length === 0 ? (
          <div className="rounded border border-dashed border-gray-700 bg-gray-800/50 p-4 text-gray-500">史官正在磨墨，稍后开始记录。</div>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className="rounded border-l-2 border-gray-600 bg-gray-800/50 py-2 pl-3 text-gray-300 transition hover:bg-gray-800">
              <div className="mb-1 w-max border-b border-gray-700/50 pb-1 text-xs text-gray-500">Day {entry.day}</div>
              <div>{renderHighlightedText(entry.text)}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
