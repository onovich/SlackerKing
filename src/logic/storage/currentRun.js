const STORAGE_KEY = 'slackerking-current-run-v1';

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

export function loadCurrentRun() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!isValidGameState(parsed?.gameState) || parsed.gameState.isGameOver) {
      return null;
    }

    return {
      gameState: parsed.gameState,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveCurrentRun(gameState) {
  if (typeof window === 'undefined' || !isValidGameState(gameState) || gameState.isGameOver) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
    gameState,
    savedAt: Date.now(),
  }));
}

export function clearCurrentRun() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
