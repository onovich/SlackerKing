import { getPhaseName } from '../../logic/engine/gameEngine';

function formatSavedAt(savedAt) {
  if (!savedAt) {
    return '尚未存档';
  }

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(savedAt);
  } catch {
    return '刚刚';
  }
}

function StatCard({ label, value, toneClass = 'text-gray-100' }) {
  return (
    <div className="rounded-2xl border border-gray-700/80 bg-black/20 px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.28em] text-gray-500">{label}</div>
      <div className={`mt-2 text-base font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function SaveSlotCard({ slot, isSelected, onSelect }) {
  const savedState = slot.savedRun?.gameState;

  return (
    <button
      type="button"
      onClick={() => onSelect(slot.id)}
      className={`rounded-2xl border px-4 py-4 text-left transition ${isSelected ? 'border-yellow-500 bg-yellow-900/20 shadow-[0_0_0_1px_rgba(234,179,8,0.35)]' : 'border-gray-700/80 bg-black/20 hover:border-gray-500'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-gray-100">{slot.label}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-gray-500">{savedState ? 'Occupied' : 'Empty'}</div>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
          {slot.isActive ? <span className="rounded-full border border-yellow-700/70 bg-yellow-900/30 px-2 py-1 text-yellow-200">续写</span> : null}
          {isSelected ? <span className="rounded-full border border-gray-500/70 bg-gray-800 px-2 py-1 text-gray-100">选中</span> : null}
        </div>
      </div>

      <div className="mt-4 text-sm leading-6 text-gray-300">
        {savedState ? (
          <>
            <div>第 {savedState.day} 天 · {getPhaseName(savedState.phase)}</div>
            <div className="text-gray-400">压力 {savedState.player.stress}% · 国库 {savedState.resources.treasury} · 军力 {savedState.resources.military}</div>
            <div className="mt-2 text-xs text-gray-500">{formatSavedAt(slot.savedRun.savedAt)}</div>
          </>
        ) : (
          <div className="text-gray-500">空槽位，适合用来保存一条新路线。</div>
        )}
      </div>
    </button>
  );
}

export function TitleScreen({ gameState, runRecords, saveSlots, activeSlotId, selectedSlotId, feedback, onSelectSlot, onNewGame, onSave, onLoad }) {
  const selectedSlot = saveSlots.find((slot) => slot.id === selectedSlotId) ?? saveSlots[0];
  const selectedState = selectedSlot?.savedRun?.gameState;
  const canLoad = Boolean(selectedSlot?.savedRun);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl rounded-[32px] border border-gray-700/80 bg-[radial-gradient(circle_at_top,_rgba(202,138,4,0.18),_rgba(17,24,39,0.96)_56%)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)] md:p-8 xl:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="min-w-0">
            <div className="text-xs uppercase tracking-[0.45em] text-yellow-500">SlackerKing</div>
            <h1 className="mt-4 text-4xl font-black tracking-[0.12em] text-gray-100 sm:text-5xl">王冠之重</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
              你不是来征服世界的，你只是想把今天混过去。但国库、军镇、王室与教会都会在同一天找上门。
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={onNewGame}
                className="rounded-2xl border border-yellow-500 bg-yellow-700 px-5 py-4 text-left text-sm font-bold text-white transition hover:bg-yellow-600"
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-100/80">Start</div>
                <div className="mt-2 text-xl">新游戏</div>
                <div className="mt-2 text-xs font-medium text-yellow-100/80">重开当前朝局，从第一天早晨重新登基。</div>
              </button>

              <button
                type="button"
                onClick={() => onSave(selectedSlot?.id)}
                className="rounded-2xl border border-gray-600 bg-gray-900/80 px-5 py-4 text-left text-sm font-bold text-gray-100 transition hover:border-yellow-600 hover:bg-gray-800"
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-gray-500">Save</div>
                <div className="mt-2 text-xl">存档</div>
                <div className="mt-2 text-xs font-medium text-gray-400">把当前进度写入选中的多槽存档位。</div>
              </button>

              <button
                type="button"
                onClick={() => onLoad(selectedSlot?.id)}
                disabled={!canLoad}
                className="rounded-2xl border border-gray-600 bg-gray-900/80 px-5 py-4 text-left text-sm font-bold text-gray-100 transition enabled:hover:border-yellow-600 enabled:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-gray-500">Load</div>
                <div className="mt-2 text-xl">读档</div>
                <div className="mt-2 text-xs font-medium text-gray-400">读取选中的槽位，继续处理朝局。</div>
              </button>
            </div>

            <div className="mt-6 min-h-7 text-sm text-yellow-200">{feedback || '\u00a0'}</div>

            <div className="mt-8 grid gap-3 lg:grid-cols-3">
              {saveSlots.map((slot) => (
                <SaveSlotCard key={slot.id} slot={slot} isSelected={slot.id === selectedSlotId} onSelect={onSelectSlot} />
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="当前局面" value={`第 ${gameState.day} 天`} toneClass="text-white" />
              <StatCard label="现阶段" value={getPhaseName(gameState.phase)} toneClass="text-blue-200" />
              <StatCard label="败局记录" value={`${runRecords.totalRuns} 次`} toneClass="text-red-200" />
              <StatCard label="最高存活" value={`第 ${runRecords.bestDay || 0} 天`} toneClass="text-yellow-200" />
            </div>
          </section>

          <aside className="rounded-[28px] border border-gray-700/80 bg-black/25 p-5 md:p-6">
            <div className="text-xs uppercase tracking-[0.35em] text-yellow-500">Save Slots</div>
            <h2 className="mt-3 text-2xl font-black tracking-wider text-gray-100">多槽存档面板</h2>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              标题页作为统一入口，读档和存档都会作用在你当前选中的槽位；激活槽位会在游戏过程中持续自动续写。
            </p>

            <div className="mt-5 rounded-2xl border border-yellow-800/40 bg-yellow-900/10 p-4">
              <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-500">Selected Slot</div>
              <div className="mt-2 text-lg font-bold text-yellow-100">{selectedSlot?.label ?? '尚未选择槽位'}</div>
              <div className="mt-2 text-sm text-yellow-100/70">
                {selectedState ? `保存于 ${formatSavedAt(selectedSlot.savedRun.savedAt)} · ${getPhaseName(selectedState.phase)}` : '当前槽位为空，点击上方卡片后即可把进度存进去。'}
              </div>
              <div className="mt-2 text-xs text-yellow-100/60">{activeSlotId ? `当前自动续写：${saveSlots.find((slot) => slot.id === activeSlotId)?.label ?? '无'}` : '当前没有激活自动续写槽位。'}</div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatCard label="王国压力" value={`${selectedState?.player.stress ?? gameState.player.stress}%`} toneClass="text-red-200" />
              <StatCard label="国库" value={`${selectedState?.resources.treasury ?? gameState.resources.treasury}`} toneClass="text-yellow-200" />
              <StatCard label="军力" value={`${selectedState?.resources.military ?? gameState.resources.military}`} toneClass="text-red-200" />
              <StatCard label="待办朝会" value={selectedState ? `第 ${selectedState.day} 天` : '尚未开始'} toneClass="text-white" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}