const STORAGE_KEY = 'slackerking-run-records-v1';

export function createDefaultRunRecords() {
  return {
    bestDay: 0,
    totalRuns: 0,
    deathCauses: {},
    epithets: {},
    recentRuns: [],
  };
}

export function loadRunRecords() {
  if (typeof window === 'undefined') {
    return createDefaultRunRecords();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultRunRecords();
    }

    const parsed = JSON.parse(raw);
    return {
      bestDay: typeof parsed?.bestDay === 'number' ? parsed.bestDay : 0,
      totalRuns: typeof parsed?.totalRuns === 'number' ? parsed.totalRuns : 0,
      deathCauses: parsed?.deathCauses && typeof parsed.deathCauses === 'object' ? parsed.deathCauses : {},
      epithets: parsed?.epithets && typeof parsed.epithets === 'object' ? parsed.epithets : {},
      recentRuns: Array.isArray(parsed?.recentRuns) ? parsed.recentRuns.filter((entry) => entry && typeof entry === 'object').slice(0, 6) : [],
    };
  } catch {
    return createDefaultRunRecords();
  }
}

export function saveRunRecords(records) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function recordFinishedRun(records, runSummary) {
  const nextRecentRuns = [
    {
      day: runSummary.day ?? 0,
      cause: runSummary.cause ?? '',
      epithet: runSummary.epithet ?? '',
      title: runSummary.title ?? '',
    },
    ...(records?.recentRuns ?? []),
  ].slice(0, 6);

  const next = {
    bestDay: Math.max(records?.bestDay ?? 0, runSummary.day ?? 0),
    totalRuns: (records?.totalRuns ?? 0) + 1,
    deathCauses: { ...(records?.deathCauses ?? {}) },
    epithets: { ...(records?.epithets ?? {}) },
    recentRuns: nextRecentRuns,
  };

  if (runSummary.cause) {
    next.deathCauses[runSummary.cause] = (next.deathCauses[runSummary.cause] ?? 0) + 1;
  }

  if (runSummary.epithet) {
    next.epithets[runSummary.epithet] = (next.epithets[runSummary.epithet] ?? 0) + 1;
  }

  return next;
}