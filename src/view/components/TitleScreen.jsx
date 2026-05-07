import { useState } from 'react';
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

      <div className="mt-3 text-sm leading-6 text-gray-300">
        {savedState ? (
          <>
            <div>第 {savedState.day} 天 · {getPhaseName(savedState.phase)}</div>
            <div className="text-gray-400">压力 {savedState.player.stress}% · 国库 {savedState.resources.treasury} · 军力 {savedState.resources.military}</div>
            <div className="mt-2 text-xs text-gray-500">{formatSavedAt(slot.savedRun.savedAt)}</div>
          </>
        ) : (
          <div className="text-gray-500">空槽位。</div>
        )}
      </div>
    </button>
  );
}

function LoadSubmenu({ saveSlots, activeSlotId, selectedSlotId, onSelectSlot, onConfirm, onBack }) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-100 sm:text-2xl">选择读档槽位</h2>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-gray-600 bg-gray-900/80 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-800"
        >
          返回
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {saveSlots.map((slot) => (
          <SaveSlotCard
            key={slot.id}
            slot={slot}
            isSelected={slot.id === selectedSlotId}
            onSelect={onSelectSlot}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-yellow-800/40 bg-yellow-900/10 px-4 py-3 text-sm text-yellow-100/80">
        <div>
          <span className="font-semibold text-yellow-100">当前选择：</span>
          {saveSlots.find((slot) => slot.id === selectedSlotId)?.label ?? '未选择'}
          <span className="ml-2 text-yellow-100/60">自动续写：{activeSlotId ? saveSlots.find((slot) => slot.id === activeSlotId)?.label ?? '无' : '无'}</span>
        </div>
        <button
          type="button"
          onClick={() => onConfirm(selectedSlotId)}
          className="rounded-xl border border-yellow-600 bg-yellow-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-yellow-600"
        >
          确认读档
        </button>
      </div>
    </div>
  );
}

export function TitleScreen({ saveSlots, activeSlotId, selectedSlotId, feedback, onSelectSlot, onNewGame, onLoad }) {
  const [submenu, setSubmenu] = useState(false);
  const hasAnySavedRun = saveSlots.some((slot) => slot.savedRun);

  const handleLoad = (slotId) => {
    if (onLoad(slotId)) {
      setSubmenu(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:items-center lg:px-8 lg:py-8">
      <div className="w-full max-w-5xl rounded-[28px] border border-gray-700/80 bg-[radial-gradient(circle_at_top,_rgba(202,138,4,0.18),_rgba(17,24,39,0.96)_56%)] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.45)] sm:p-6 md:p-8 xl:p-10">
        <div className="text-xs uppercase tracking-[0.45em] text-yellow-500">SlackerKing</div>
        <h1 className="mt-3 text-3xl font-black tracking-[0.12em] text-gray-100 sm:text-5xl">王冠之重</h1>
        {submenu ? (
          <LoadSubmenu
            saveSlots={saveSlots}
            activeSlotId={activeSlotId}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
            onConfirm={handleLoad}
            onBack={() => setSubmenu(false)}
          />
        ) : (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onNewGame}
                className="rounded-2xl border border-yellow-500 bg-yellow-700 px-5 py-5 text-left text-sm font-bold text-white transition hover:bg-yellow-600"
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-100/80">Start</div>
                <div className="mt-2 text-xl">新游戏</div>
              </button>

              <button
                type="button"
                onClick={() => setSubmenu(true)}
                disabled={!hasAnySavedRun}
                className="rounded-2xl border border-gray-600 bg-gray-900/80 px-5 py-5 text-left text-sm font-bold text-gray-100 transition enabled:hover:border-yellow-600 enabled:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <div className="text-[11px] uppercase tracking-[0.28em] text-gray-500">Load</div>
                <div className="mt-2 text-xl">读档</div>
              </button>
            </div>

            <div className="min-h-7 text-sm text-yellow-200">{feedback || '\u00a0'}</div>
          </div>
        )}
      </div>
    </div>
  );
}