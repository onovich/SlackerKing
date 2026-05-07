import { useState } from 'react';
import { getPhaseName } from '../../logic/engine/gameEngine';

function formatSavedAt(savedAt) {
  if (!savedAt) {
    return '未保存';
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

function SlotRow({ slot, isSelected, onSelect }) {
  const savedState = slot.savedRun?.gameState;

  return (
    <button
      type="button"
      onClick={() => onSelect(slot.id)}
      className={`rounded-2xl border px-4 py-3 text-left transition ${isSelected ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700/80 bg-black/20 hover:border-gray-500'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-gray-100">{slot.label}</div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
          {slot.isActive ? <span className="rounded-full border border-yellow-700/70 bg-yellow-900/30 px-2 py-1 text-yellow-200">续写</span> : null}
          {isSelected ? <span className="rounded-full border border-gray-500/70 bg-gray-800 px-2 py-1 text-gray-100">选中</span> : null}
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-400">
        {savedState ? `第 ${savedState.day} 天 · ${getPhaseName(savedState.phase)} · ${formatSavedAt(slot.savedRun.savedAt)}` : '空槽位'}
      </div>
    </button>
  );
}

function SlotSelectionView({ action, saveSlots, activeSlotId, selectedSlotId, onSelectSlot, onConfirm, onBack }) {
  return (
    <div className="mt-5 flex-1 overflow-y-auto pr-1">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-gray-100">{action === 'save' ? '选择存档槽位' : '选择读档槽位'}</h3>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-gray-600 bg-gray-900/80 px-4 py-2 text-xs font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-800"
        >
          返回
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3">
          {saveSlots.map((slot) => (
            <SlotRow key={slot.id} slot={slot} isSelected={slot.id === selectedSlotId} onSelect={onSelectSlot} />
          ))}
        </div>

        <div className="rounded-2xl border border-yellow-800/40 bg-yellow-900/10 p-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-yellow-500">Selected Slot</div>
          <div className="mt-2 text-lg font-bold text-yellow-100">
            {saveSlots.find((slot) => slot.id === selectedSlotId)?.label ?? '尚未选择槽位'}
          </div>
          <div className="mt-2 text-xs text-yellow-100/60">
            自动续写：{activeSlotId ? saveSlots.find((slot) => slot.id === activeSlotId)?.label ?? '无' : '无'}
          </div>
          <button
            type="button"
            onClick={() => onConfirm(selectedSlotId)}
            className="mt-4 w-full rounded-xl border border-yellow-600 bg-yellow-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-yellow-600"
          >
            {action === 'save' ? '确认存档' : '确认读档'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsMenu({ saveSlots, activeSlotId, selectedSlotId, feedback, onSelectSlot, onResume, onSave, onLoad, onReturnToTitle }) {
  const [submenu, setSubmenu] = useState(null);
  const hasAnySavedRun = saveSlots.some((slot) => slot.savedRun?.gameState);

  const handleSave = (slotId) => {
    if (onSave(slotId)) {
      setSubmenu(null);
    }
  };

  const handleLoad = (slotId) => {
    if (onLoad(slotId)) {
      setSubmenu(null);
    }
  };

  return (
    <div className="absolute inset-0 z-40 overflow-y-auto bg-black/72 p-3 backdrop-blur-sm sm:p-4">
      <div className="mx-auto flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-gray-700/80 bg-[radial-gradient(circle_at_top,_rgba(120,53,15,0.24),_rgba(17,24,39,0.96)_58%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:max-h-[calc(100vh-2rem)] md:p-8">
        <div className="text-xs uppercase tracking-[0.35em] text-yellow-500">Game Menu</div>
        <h2 className="mt-3 text-3xl font-black tracking-wider text-gray-100">设置页</h2>
        {submenu ? (
          <SlotSelectionView
            action={submenu}
            saveSlots={saveSlots}
            activeSlotId={activeSlotId}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
            onConfirm={submenu === 'save' ? handleSave : handleLoad}
            onBack={() => setSubmenu(null)}
          />
        ) : (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onResume}
                className="rounded-xl border border-yellow-600 bg-yellow-700 px-4 py-4 text-sm font-bold text-white transition hover:bg-yellow-600"
              >
                回到游戏
              </button>
              <button
                type="button"
                onClick={() => setSubmenu('save')}
                className="rounded-xl border border-gray-600 bg-gray-800 px-4 py-4 text-sm font-bold text-gray-100 transition hover:bg-gray-700"
              >
                存档
              </button>
              <button
                type="button"
                onClick={() => setSubmenu('load')}
                disabled={!hasAnySavedRun}
                className="rounded-xl border border-gray-600 bg-gray-800 px-4 py-4 text-sm font-bold text-gray-100 transition enabled:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                读档
              </button>
              <button
                type="button"
                onClick={onReturnToTitle}
                className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-4 text-sm font-bold text-red-100 transition hover:bg-red-900/60"
              >
                回到标题
              </button>
            </div>

            <div className="min-h-6 text-sm text-yellow-200">{feedback || '\u00a0'}</div>
          </div>
        )}
      </div>
    </div>
  );
}