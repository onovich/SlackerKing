const STORAGE_KEY = 'slackerking-save-slots-v2';
const LEGACY_STORAGE_KEY = 'slackerking-current-run-v1';

export const SAVE_SLOT_DEFINITIONS = [
  { id: 'slot-1', label: '御案一' },
  { id: 'slot-2', label: '御案二' },
  { id: 'slot-3', label: '御案三' },
];

const VALID_PHASES = new Set(['morning', 'afternoon', 'night']);
const RESOURCE_KEYS = ['treasury', 'authority', 'military', 'favor'];

function hasNumberEntries(record, keys) {
  return keys.every((key) => typeof record?.[key] === 'number' && Number.isFinite(record[key]));
}

function isValidGameState(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }

  if (typeof state.day !== 'number' || state.day < 1) {
    return false;
  }

  if (!VALID_PHASES.has(state.phase)) {
    return false;
  }

  if (!hasNumberEntries(state.resources, RESOURCE_KEYS)) {
    return false;
  }

  if (!hasNumberEntries(state.player, ['stress', 'energy', 'ap'])) {
    return false;
  }

  if (!Array.isArray(state.logs) || !Array.isArray(state.history) || !Array.isArray(state.nightSummary)) {
    return false;
  }

  if (!state.flags || typeof state.flags !== 'object') {
    return false;
  }

  if (!state.dailyChanges || typeof state.dailyChanges !== 'object') {
    return false;
  }

  return typeof state.isGameOver === 'boolean';
}

function isValidSlotId(slotId) {
  return SAVE_SLOT_DEFINITIONS.some((slot) => slot.id === slotId);
}

function normalizeSavedRun(savedRun) {
  if (!isValidGameState(savedRun?.gameState) || savedRun.gameState.isGameOver) {
    return null;
  }

  return {
    gameState: savedRun.gameState,
    savedAt: typeof savedRun.savedAt === 'number' ? savedRun.savedAt : Date.now(),
  };
}

function createEmptySaveData() {
  return {
    activeSlotId: null,
    slots: Object.fromEntries(SAVE_SLOT_DEFINITIONS.map((slot) => [slot.id, null])),
  };
}

function writeSaveData(saveData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
}

function readLegacySaveData() {
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const savedRun = normalizeSavedRun(parsed);
    if (!savedRun) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return null;
    }

    const migrated = createEmptySaveData();
    migrated.activeSlotId = SAVE_SLOT_DEFINITIONS[0].id;
    migrated.slots[migrated.activeSlotId] = savedRun;
    writeSaveData(migrated);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  } catch {
    return null;
  }
}

function readSaveData() {
  if (typeof window === 'undefined') {
    return createEmptySaveData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return readLegacySaveData() ?? createEmptySaveData();
    }

    const parsed = JSON.parse(raw);
    const slots = Object.fromEntries(
      SAVE_SLOT_DEFINITIONS.map((slot) => [slot.id, normalizeSavedRun(parsed?.slots?.[slot.id])]),
    );
    const activeSlotId = isValidSlotId(parsed?.activeSlotId) ? parsed.activeSlotId : null;

    return {
      activeSlotId: slots[activeSlotId] ? activeSlotId : null,
      slots,
    };
  } catch {
    return createEmptySaveData();
  }
}

export function loadSaveSlots() {
  const saveData = readSaveData();
  return SAVE_SLOT_DEFINITIONS.map((slot) => ({
    ...slot,
    savedRun: saveData.slots[slot.id],
    isActive: saveData.activeSlotId === slot.id,
  }));
}

export function getActiveSaveSlotId() {
  return readSaveData().activeSlotId;
}

export function loadCurrentRun(slotId) {
  const saveData = readSaveData();
  const resolvedSlotId = isValidSlotId(slotId) ? slotId : saveData.activeSlotId;
  if (!resolvedSlotId || !saveData.slots[resolvedSlotId]) {
    return null;
  }

  return {
    slotId: resolvedSlotId,
    ...saveData.slots[resolvedSlotId],
  };
}

export function saveCurrentRun(slotId, gameState) {
  if (typeof window === 'undefined' || !isValidSlotId(slotId) || !isValidGameState(gameState) || gameState.isGameOver) {
    return null;
  }

  const saveData = readSaveData();
  const savedRun = {
    gameState,
    savedAt: Date.now(),
  };

  const nextSaveData = {
    activeSlotId: slotId,
    slots: {
      ...saveData.slots,
      [slotId]: savedRun,
    },
  };

  writeSaveData(nextSaveData);
  return {
    slotId,
    ...savedRun,
  };
}

export function setActiveSaveSlotId(slotId) {
  if (typeof window === 'undefined') {
    return null;
  }

  const saveData = readSaveData();
  const nextActiveSlotId = isValidSlotId(slotId) && saveData.slots[slotId] ? slotId : null;
  writeSaveData({
    activeSlotId: nextActiveSlotId,
    slots: saveData.slots,
  });
  return nextActiveSlotId;
}
