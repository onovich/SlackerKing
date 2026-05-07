const STORAGE_KEY = 'slackerking-run-records-v1';

export const DEATH_CAUSE_CATALOG = [
  {
    id: '中风崩殂',
    title: '过劳死者',
    description: '死于长期失控的压力，通常意味着你把减压和节奏管理拖到了太晚。',
  },
  {
    id: '破产引发内乱',
    title: '乞丐王',
    description: '国库见底后，王座会先被军饷和暴民一起掀翻。',
  },
  {
    id: '权臣逼宫',
    title: '傀儡',
    description: '权威跌穿底线后，朝堂不会再等你把局面慢慢补回来。',
  },
  {
    id: '外敌破城',
    title: '亡国之君',
    description: '军力崩塌时，所有外交姿态都会迅速变成亡国倒计时。',
  },
  {
    id: '大革命',
    title: '断头台贵宾',
    description: '民心被连续透支后，最先回来的不是忠诚，而是清算。',
  },
];

export const EPITHET_ARCHETYPE_CATALOG = [
  {
    id: '救火国王',
    title: '救火国王',
    description: '没有稳定押注任何派系，更多是在四处止损和临时救火。',
  },
  {
    id: '礼制守成人',
    title: '礼制守成人',
    description: '靠宗室、礼法和王室体面维持秩序，是典型的旧贵族统治原型。',
  },
  {
    id: '军镇共主',
    title: '军镇共主',
    description: '用军心、赏格和强硬姿态撑住局势，是典型的军方路线原型。',
  },
  {
    id: '账簿之王',
    title: '账簿之王',
    description: '靠周转、借贷和商路续命，是典型的商会路线原型。',
  },
  {
    id: '边贸调停者',
    title: '边贸调停者',
    description: '靠谈判、拖延和边贸交易买时间，是典型的外邦路线原型。',
  },
];

export const ARCHIVE_MILESTONE_CATALOG = [
  {
    id: 'first_fall',
    title: '第一滴血',
    description: '第一次把一局真正打完，哪怕结局很难看。',
    target: 1,
    getProgress: (records) => records?.totalRuns ?? 0,
    formatProgress: (value, target) => `${Math.min(value, target)}/${target} 次败局`,
  },
  {
    id: 'seven_days',
    title: '七日王朝',
    description: '至少活到第 7 天，证明你已经能稳住开局的连环失控。',
    target: 7,
    getProgress: (records) => records?.bestDay ?? 0,
    formatProgress: (value, target) => `${Math.min(value, target)}/${target} 天`,
  },
  {
    id: 'twelve_days',
    title: '老狐狸',
    description: '至少活到第 12 天，说明你开始能把路线和资源一起拧住。',
    target: 12,
    getProgress: (records) => records?.bestDay ?? 0,
    formatProgress: (value, target) => `${Math.min(value, target)}/${target} 天`,
  },
  {
    id: 'chronicler',
    title: '史官熟客',
    description: '累计经历 5 次败局，档案开始真正具备可读性。',
    target: 5,
    getProgress: (records) => records?.totalRuns ?? 0,
    formatProgress: (value, target) => `${Math.min(value, target)}/${target} 次败局`,
  },
  {
    id: 'death_collector',
    title: '死法见闻录',
    description: '见过至少 3 种不同死法，开始真正理解这顶王冠的风险谱系。',
    target: 3,
    getProgress: (records) => getDeathCauseCodex(records).filter((entry) => entry.unlocked).length,
    formatProgress: (value, target) => `${Math.min(value, target)}/${target} 种死法`,
  },
  {
    id: 'many_faces',
    title: '百面之君',
    description: '打出至少 3 种统治原型，证明你不只会一条活法。',
    target: 3,
    getProgress: (records) => getEpithetArchetypeCodex(records).filter((entry) => entry.unlocked).length,
    formatProgress: (value, target) => `${Math.min(value, target)}/${target} 种原型`,
  },
];

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
      routeTitle: runSummary.routeTitle ?? '',
      routeBody: runSummary.routeBody ?? '',
      primaryFaction: runSummary.primaryFaction ?? '',
      figures: Array.isArray(runSummary.figures) ? runSummary.figures.slice(0, 3) : [],
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

export function getDeathCauseCodex(records) {
  return DEATH_CAUSE_CATALOG.map((entry) => {
    const count = records?.deathCauses?.[entry.id] ?? 0;
    return {
      ...entry,
      unlocked: count > 0,
      count,
    };
  });
}

export function getEpithetArchetypeCodex(records) {
  return EPITHET_ARCHETYPE_CATALOG.map((entry) => {
    const count = Object.entries(records?.epithets ?? {}).reduce((sum, [epithet, value]) => (
      epithet.endsWith(entry.id) ? sum + value : sum
    ), 0);

    return {
      ...entry,
      unlocked: count > 0,
      count,
    };
  });
}

export function getArchiveMilestones(records) {
  return ARCHIVE_MILESTONE_CATALOG.map((entry) => {
    const progress = entry.getProgress(records);
    return {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      unlocked: progress >= entry.target,
      progress,
      target: entry.target,
      progressLabel: entry.formatProgress(progress, entry.target),
    };
  });
}