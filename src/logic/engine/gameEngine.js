import { INITIAL_STATE, RESOURCE_KEYS, RISK_META, defaultEvent, eventDatabase, locations, nightEvents } from '../../data/gameContent';

function cloneState(state) {
  return {
    ...state,
    resources: { ...state.resources },
    player: { ...state.player },
    flags: { ...state.flags },
    history: [...state.history],
    logs: [...state.logs],
    nightSummary: [...state.nightSummary],
    gameOver: state.gameOver ? { ...state.gameOver } : null,
  };
}

function createLogEntry(state, text) {
  return {
    id: `${state.day}-${state.logs.length}-${Math.random().toString(36).slice(2, 8)}`,
    day: state.day,
    text,
  };
}

function pushLog(state, text) {
  state.logs.push(createLogEntry(state, text));
}

function pushNightSummary(state, tone, text) {
  state.nightSummary.push({
    id: `${state.day}-${state.nightSummary.length}-${tone}`,
    tone,
    text,
  });
}

function setFlag(state, key, value) {
  state.flags[key] = value;
}

function getFlag(state, key) {
  return state.flags[key];
}

function deleteFlag(state, key) {
  delete state.flags[key];
}

function clampState(state) {
  RESOURCE_KEYS.forEach((key) => {
    state.resources[key] = Math.max(0, Math.min(100, state.resources[key]));
  });
  state.player.stress = Math.max(0, Math.min(100, state.player.stress));
  state.player.energy = Math.max(0, Math.min(100, state.player.energy));
  state.player.ap = Math.max(0, state.player.ap);
}

function applyStatChanges(state, changes) {
  let damage = false;

  if (typeof changes.treasury === 'number') {
    state.resources.treasury += changes.treasury;
    damage ||= changes.treasury < -10;
  }
  if (typeof changes.authority === 'number') {
    state.resources.authority += changes.authority;
    damage ||= changes.authority < -10;
  }
  if (typeof changes.military === 'number') {
    state.resources.military += changes.military;
    damage ||= changes.military < -10;
  }
  if (typeof changes.favor === 'number') {
    state.resources.favor += changes.favor;
    damage ||= changes.favor < -10;
  }
  if (typeof changes.stress === 'number') {
    state.player.stress += changes.stress;
    damage ||= changes.stress > 15;
  }
  if (typeof changes.energy === 'number') {
    state.player.energy += changes.energy;
  }

  clampState(state);
  return damage;
}

function evaluateGameOver(state) {
  if (state.isGameOver) {
    return;
  }

  let cause = null;
  let title = '';
  let desc = '';

  if (state.player.stress >= 100) {
    cause = '中风崩殂';
    title = '过劳死者';
    desc = '无休止的政治斗争和巨大的压力摧毁了你的大脑。你在批阅奏章时倒地不起，甚至没人发现，直到你的宠物狗开始舔你的脸。';
  } else if (state.resources.treasury <= 0) {
    cause = '破产引发内乱';
    title = '乞丐王';
    desc = '国库连一枚铜币都倒不出来了。禁军因为欠饷打开了城门，愤怒的暴民冲进宫廷，将你扒光衣服吊死在广场上。';
  } else if (state.resources.authority <= 0) {
    cause = '权臣逼宫';
    title = '傀儡';
    desc = '你的懦弱让宰相彻底掌握了实权。他递给你一杯毒酒和一份退位诏书，你颤抖着喝下毒酒，结束了这糊弄的一生。';
  } else if (state.resources.military <= 0) {
    cause = '外敌破城';
    title = '亡国之君';
    desc = '敌国的铁蹄踏破了首都。你试图混在逃难的农民中溜走，但因为肚子太大且满身香水味被敌军斥候认出，沦为阶下囚。';
  } else if (state.resources.favor <= 0) {
    cause = '大革命';
    title = '断头台贵宾';
    desc = '人民受够了你的荒唐。他们自制了叫做“断头台”的机器，并热情地邀请你成为了第一个体验者。咔嚓。';
  }

  if (cause) {
    state.isGameOver = true;
    state.gameOver = { cause, title, desc };
    pushLog(state, `【驾崩】 ${cause}`);
  }
}

const eventConditions = {
  favor_low_no_revolt_cd: (state) => state.resources.favor < 40 && !getFlag(state, 'tax_revolt_cd'),
  envoy_arrival_ready: (state) => state.day > 3 && !getFlag(state, 'envoy_active') && !getFlag(state, 'envoy_cd'),
  envoy_stay_due: (state) => (getFlag(state, 'envoy_active') ?? 0) >= 3,
  magic_beast_ready: (state) => state.day > 5 && !getFlag(state, 'beast_seen'),
  corrupt_hand_ready: (state) => state.resources.authority < 60 && !getFlag(state, 'hand_warned'),
};

const requirementChecks = {
  always: () => true,
  military_at_least_30: (state) => state.resources.military >= 30,
  treasury_above_30: (state) => state.resources.treasury > 30,
  treasury_above_20: (state) => state.resources.treasury > 20,
};

export function isMorningChoiceAvailable(state, choice) {
  const requirement = requirementChecks[choice.requirementId] ?? requirementChecks.always;
  return requirement(state) && state.player.energy >= choice.energy;
}

const choiceEffects = {
  revolt_crush: (state) => {
    applyStatChanges(state, { treasury: 15, military: -10, favor: -15, stress: 10 });
    pushLog(state, '军队带回了税金和几百颗人头，但仇恨的种子已埋下。');
    setFlag(state, 'tax_revolt_cd', 5);
  },
  revolt_relief: (state) => {
    applyStatChanges(state, { authority: -15, favor: 10 });
    pushLog(state, '你展现了软弱的仁慈。其他行省见状也开始考虑抗税。');
    setFlag(state, 'weak_king', (getFlag(state, 'weak_king') || 0) + 1);
    setFlag(state, 'tax_revolt_cd', 10);
  },
  revolt_delegate: (state) => {
    applyStatChanges(state, { stress: -5 });
    setFlag(state, 'southern_mess', 1);
    pushLog(state, '总督收到密信后破口大骂。南方的局势正在脱离控制。');
  },
  envoy_execute: (state) => {
    applyStatChanges(state, { authority: 20, military: 10, favor: 10 });
    setFlag(state, 'khan_war', 1);
    pushLog(state, '群臣为你的硬气欢呼，但你知道，战争不可避免了。');
  },
  envoy_delay: (state) => {
    applyStatChanges(state, { treasury: -5 });
    setFlag(state, 'envoy_active', 1);
    pushLog(state, '使者喝得酩酊大醉，暂时住在宫里。你争取到了一点时间。');
  },
  envoy_play_dumb: (state) => {
    applyStatChanges(state, { authority: -10 });
    setFlag(state, 'envoy_confused', 1);
    pushLog(state, '使者被你的无赖惊呆了，骂骂咧咧地暂时退下。');
  },
  envoy_pay_off: (state) => {
    applyStatChanges(state, { treasury: -30, authority: -10 });
    deleteFlag(state, 'envoy_active');
    setFlag(state, 'envoy_cd', 15);
    pushLog(state, '使者带着黄金嚣张离去，宫廷尊严扫地。');
  },
  envoy_assassinate: (state) => {
    if (Math.random() > 0.4) {
      pushLog(state, '暗杀成功。对外宣称使者突发急病暴毙。大汗虽然怀疑，但暂时找不到借口发兵。');
      deleteFlag(state, 'envoy_active');
      setFlag(state, 'envoy_cd', 20);
      return;
    }

    applyStatChanges(state, { authority: -20, stress: 30 });
    setFlag(state, 'khan_war', 1);
    deleteFlag(state, 'envoy_active');
    pushLog(state, '【灾难】毒酒被识破！使者连夜逃回北方，大汗震怒发兵！');
  },
  beast_raise: (state) => {
    applyStatChanges(state, { treasury: -20, authority: 15 });
    setFlag(state, 'has_griffon', 1);
    setFlag(state, 'beast_seen', 1);
    pushLog(state, '虽然花钱如流水，但这只猛兽成为了王室威严的象征。');
  },
  beast_gift: (state) => {
    applyStatChanges(state, { military: -5, stress: -10 });
    setFlag(state, 'beast_seen', 1);
    pushLog(state, '几周后听说将军被狮鹫抓瞎了一只眼，在家休养。你暗自窃喜。');
  },
  beast_sell: (state) => {
    applyStatChanges(state, { treasury: 25, authority: -5 });
    setFlag(state, 'beast_seen', 1);
    pushLog(state, '学者们痛斥你的短视，但国库的充实让你充耳不闻。');
  },
  hand_scold: (state) => {
    applyStatChanges(state, { authority: 15, treasury: 10, stress: 15 });
    setFlag(state, 'hand_warned', 1);
    pushLog(state, '宰相跪地求饶。但你知道他不会善罢甘休。');
  },
  hand_ignore: (state) => {
    applyStatChanges(state, { authority: -10 });
    setFlag(state, 'hand_power', (getFlag(state, 'hand_power') || 0) + 1);
    pushLog(state, '你签了字。宰相的权势越来越大，甚至连护卫都不把你放在眼里了。');
  },
  hand_profit: (state) => {
    applyStatChanges(state, { treasury: 15, authority: -5 });
    pushLog(state, '宰相心领神会地交出了“分红”。你们成了狼狈为奸的同伙。');
  },
  daily_review: (state) => {
    applyStatChanges(state, { authority: 5, treasury: 5 });
    pushLog(state, '你累得半死，但总算干了点国王该干的事。');
  },
  daily_stamp: (state) => {
    applyStatChanges(state, { authority: -5, favor: -5 });
    setFlag(state, 'messy_admin', (getFlag(state, 'messy_admin') || 0) + 1);
    pushLog(state, '文件像雪片一样发下去了，至于后果，以后再说。');
  },
};

function resolveRumors(state) {
  const targetKey = pickSpyTarget(state);

  if (!targetKey) {
    deleteFlag(state, 'spy_watch_target');
    deleteFlag(state, 'spy_watch_cd');
    pushLog(state, '情报总管：今日并无要事，陛下。天下太平（大概）。');
    return;
  }

  setFlag(state, 'spy_watch_target', targetKey);
  setFlag(state, 'spy_watch_cd', 1);

  if (targetKey === 'hand_power') {
    pushLog(state, '情报总管密报：宰相最近频繁密会城防军将领。臣已布线盯梢，今夜他的动作会被暂时压住。');
    return;
  }

  if (targetKey === 'southern_mess') {
    pushLog(state, '暗探回报：南方行省正在私下打造兵器。臣已派人截断信使，今夜局势不会继续恶化。');
    return;
  }

  if (targetKey === 'envoy_active' || targetKey === 'khan_war') {
    pushLog(state, '仆人说：北方使者在宴会上画了首都的布防图。臣已安排假情报误导他们，今夜威胁会被拖住。');
    return;
  }

  pushLog(state, '情报总管回报：几道荒唐诏令已被地方官吏层层曲解。臣已暗中截下一批公文，今夜恶果会被延后。');
}

function getSuppressedRiskKey(state) {
  if ((getFlag(state, 'spy_watch_cd') || 0) <= 0) {
    return null;
  }

  return getFlag(state, 'spy_watch_target') || null;
}

function pickSpyTarget(state) {
  const candidates = [];

  if ((getFlag(state, 'khan_war') || 0) > 0) {
    candidates.push({ key: 'khan_war', progress: getFlag(state, 'khan_war') || 0 });
  } else if ((getFlag(state, 'envoy_active') || 0) > 0) {
    candidates.push({ key: 'envoy_active', progress: getFlag(state, 'envoy_active') || 0 });
  }

  candidates.push({ key: 'hand_power', progress: getFlag(state, 'hand_power') || 0 });
  candidates.push({ key: 'southern_mess', progress: getFlag(state, 'southern_mess') || 0 });
  candidates.push({ key: 'messy_admin', progress: getFlag(state, 'messy_admin') || 0 });

  return candidates
    .filter((item) => item.progress > 0)
    .sort((left, right) => right.progress - left.progress)[0]?.key ?? null;
}

const locationActions = {
  visit_queen: (state) => {
    applyStatChanges(state, { energy: -15, authority: 10 });
    pushLog(state, '你与王后共进下午茶，听她抱怨其他贵族妇人。无聊但有用。');
  },
  visit_mistress: (state) => {
    if (state.resources.treasury >= 15) {
      applyStatChanges(state, { treasury: -15, stress: -35, favor: -5 });
      pushLog(state, '醇酒、音乐与温柔乡。你暂时忘了王座的重压。');
      return;
    }

    pushLog(state, '【囊中羞涩】情妇因为你没带贵重礼物而给了你闭门羹。');
    applyStatChanges(state, { stress: 10 });
  },
  visit_hunt: (state) => {
    applyStatChanges(state, { energy: -20, military: 10, stress: -15 });
    pushLog(state, '你射中了一头公鹿。武将们大声喝彩。');
  },
  visit_spy: (state) => {
    applyStatChanges(state, { treasury: -5 });
    resolveRumors(state);
  },
  visit_sleep: (state) => {
    applyStatChanges(state, { energy: 40, stress: -10 });
    pushLog(state, '你屏退左右，睡了一个长长的午觉。');
  },
};

const nightChecks = {
  hand_coup: (state) => (getFlag(state, 'hand_power') || 0) >= 4,
  khan_invasion: (state) => (getFlag(state, 'khan_war') || 0) >= 1,
  southern_revolt: (state) => typeof getFlag(state, 'southern_mess') === 'number' && getFlag(state, 'southern_mess') >= 3,
  messy_karma: (state) => (getFlag(state, 'messy_admin') || 0) >= 5,
};

const nightResults = {
  hand_coup: (state) => {
    applyStatChanges(state, { authority: -30, stress: 40 });
    setFlag(state, 'hand_power', 0);
    return '【逼宫】宰相带着全副武装的卫兵要求你签署“代政令”。你被迫交出了大部分权力！';
  },
  khan_invasion: (state) => {
    if (state.resources.military > 60) {
      applyStatChanges(state, { military: -20, treasury: -20, favor: 20 });
      setFlag(state, 'khan_war', 0);
      return '【战报】北方大军入侵！幸好我军准备充分，浴血奋战击退了敌军。';
    }

    applyStatChanges(state, { military: -40, treasury: -30, stress: 50, favor: -20 });
    return '【溃败】北方大军如入无人之境，边防军全线崩溃！首都危在旦夕！';
  },
  southern_revolt: (state) => {
    applyStatChanges(state, { favor: -20, treasury: -15, stress: 20 });
    deleteFlag(state, 'southern_mess');
    return '【叛乱】由于你的不作为，南方总督宣布独立！失去了南方的税收。';
  },
  messy_karma: (state) => {
    applyStatChanges(state, { authority: -10, favor: -10, treasury: -10 });
    setFlag(state, 'messy_admin', 0);
    return '【恶果】你之前闭眼盖章的政令引发了巨大的行政混乱，各地怨声载道。';
  },
};

function pickMorningEvent(state) {
  const pool = eventDatabase.filter((event) => eventConditions[event.conditionId](state) && !state.history.includes(event.id));

  if (pool.length === 0) {
    return defaultEvent;
  }

  const totalWeight = pool.reduce((sum, event) => sum + (event.weight || 1), 0);
  let roll = Math.random() * totalWeight;

  for (const event of pool) {
    roll -= event.weight || 1;
    if (roll <= 0) {
      return event;
    }
  }

  return pool[pool.length - 1] ?? defaultEvent;
}

function getEventById(id) {
  return eventDatabase.find((event) => event.id === id) ?? (id === defaultEvent.id ? defaultEvent : defaultEvent);
}

function transitionByStep(state, nextStep) {
  if (nextStep === 'afternoon') {
    return enterAfternoon(state).state;
  }
  if (nextStep === 'night') {
    return enterNight(state).state;
  }
  if (nextStep === 'nextDay') {
    return startNextDay(state).state;
  }
  return state;
}

export function getPhaseName(phase) {
  if (phase === 'morning') return '御前会议';
  if (phase === 'afternoon') return '自由巡幸';
  if (phase === 'night') return '深夜结算';
  return '王座余烬';
}

export function getCurrentEvent(state) {
  return getEventById(state.currentEventId);
}

function getRiskLevel(progress, levels) {
  if (progress >= levels.danger) {
    return {
      key: 'danger',
      label: '危急',
      accentClass: 'text-red-300',
      badgeClass: 'border-red-700/70 bg-red-900/30 text-red-200',
    };
  }

  if (progress >= levels.caution) {
    return {
      key: 'caution',
      label: '警戒',
      accentClass: 'text-yellow-300',
      badgeClass: 'border-yellow-700/70 bg-yellow-900/30 text-yellow-200',
    };
  }

  return {
    key: 'stable',
    label: '平稳',
    accentClass: 'text-emerald-300',
    badgeClass: 'border-emerald-700/70 bg-emerald-900/30 text-emerald-200',
  };
}

export function getVisibleRisks(state) {
  const risks = [];
  const suppressedRiskKey = getSuppressedRiskKey(state);

  const pushRisk = (id, progress) => {
    const meta = RISK_META[id];
    if (!meta || progress <= 0) {
      return;
    }

    const level = getRiskLevel(progress, meta.levels);
    risks.push({
      id,
      label: meta.label,
      icon: meta.icon,
      progress,
      level,
      sourceText: meta.sourceText,
      mitigationText: meta.mitigationText,
      isSuppressed: suppressedRiskKey === id,
    });
  };

  pushRisk('hand_power', getFlag(state, 'hand_power') || 0);
  pushRisk('southern_mess', getFlag(state, 'southern_mess') || 0);
  pushRisk('messy_admin', getFlag(state, 'messy_admin') || 0);

  const envoyProgress = Math.max(getFlag(state, 'envoy_active') || 0, getFlag(state, 'khan_war') || 0);
  if ((getFlag(state, 'khan_war') || 0) > 0) {
    pushRisk('khan_war', getFlag(state, 'khan_war') || 0);
  } else {
    pushRisk('envoy_active', envoyProgress);
  }

  return risks.sort((left, right) => right.progress - left.progress);
}

export function initializeGameState() {
  return prepareMorning(cloneState(INITIAL_STATE)).state;
}

export function prepareMorning(currentState) {
  const state = cloneState(currentState);
  if (state.isGameOver) {
    return { state, damage: false };
  }

  state.phase = 'morning';
  state.player.energy = 100;
  state.nightSummary = [];

  const event = pickMorningEvent(state);
  state.currentEventId = event.id;

  if (event.id !== defaultEvent.id) {
    state.history.push(event.id);
    if (state.history.length > 5) {
      state.history.shift();
    }
  }

  clampState(state);
  return { state, damage: false };
}

export function resolveMorningChoice(currentState, choiceId) {
  const state = cloneState(currentState);
  if (state.isGameOver) {
    return { state, damage: false, nextStep: null, delayMs: 0 };
  }

  const event = getCurrentEvent(state);
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) {
    return { state, damage: false, nextStep: null, delayMs: 0 };
  }

  const meetsRequirement = (requirementChecks[choice.requirementId] ?? requirementChecks.always)(state);
  const canAfford = state.player.energy >= choice.energy;
  if (!meetsRequirement || !canAfford) {
    return { state, damage: false, nextStep: null, delayMs: 0 };
  }

  let damage = applyStatChanges(state, { energy: -choice.energy });
  (choiceEffects[choice.effectId] ?? (() => {}))(state);
  evaluateGameOver(state);

  return {
    state,
    damage,
    nextStep: state.isGameOver ? null : 'afternoon',
    delayMs: state.isGameOver ? 0 : 1200,
  };
}

export function enterAfternoon(currentState) {
  const state = cloneState(currentState);
  if (state.isGameOver) {
    return { state, damage: false };
  }

  state.phase = 'afternoon';
  state.player.ap = 2;
  clampState(state);
  return { state, damage: false };
}

export function resolveLocationVisit(currentState, locationId) {
  const state = cloneState(currentState);
  if (state.isGameOver || state.phase !== 'afternoon' || state.player.ap <= 0) {
    return { state, damage: false, nextStep: null, delayMs: 0 };
  }

  const location = locations.find((item) => item.id === locationId);
  if (!location) {
    return { state, damage: false, nextStep: null, delayMs: 0 };
  }

  state.player.ap -= 1;
  (locationActions[location.actionId] ?? (() => {}))(state);
  evaluateGameOver(state);

  return {
    state,
    damage: false,
    nextStep: !state.isGameOver && state.player.ap <= 0 ? 'night' : null,
    delayMs: !state.isGameOver && state.player.ap <= 0 ? 800 : 0,
  };
}

export function enterNight(currentState) {
  const state = cloneState(currentState);
  if (state.isGameOver) {
    return { state, damage: false };
  }

  state.phase = 'night';
  state.nightSummary = [];
  const suppressedRiskKey = getSuppressedRiskKey(state);

  Object.keys(state.flags).forEach((key) => {
    if (typeof state.flags[key] !== 'number') {
      return;
    }

    if (key.endsWith('_cd')) {
      state.flags[key] -= 1;
      if (state.flags[key] <= 0) {
        delete state.flags[key];
      }
      return;
    }

    if (suppressedRiskKey && key === suppressedRiskKey) {
      return;
    }

    state.flags[key] += 1;
  });

  if (suppressedRiskKey) {
    const riskMeta = RISK_META[suppressedRiskKey];
    if (riskMeta) {
      pushNightSummary(state, 'info', `【情报布控】你提前盯住了“${riskMeta.label}”，这一隐患今夜没有继续恶化。`);
    }
    deleteFlag(state, 'spy_watch_target');
  }

  let eventsOccurred = 0;
  for (const event of nightEvents) {
    const check = nightChecks[event.checkId];
    if (!check?.(state)) {
      continue;
    }

    const result = (nightResults[event.resultId] ?? (() => ''))(state);
    if (!result) {
      continue;
    }

    pushNightSummary(state, 'alert', result);
    pushLog(state, result);
    eventsOccurred += 1;
  }

  const damage = applyStatChanges(state, { treasury: -3, stress: 8 });
  pushNightSummary(state, 'info', '时间流逝。维持宫廷奢靡开销让国库减少，国王的偏头痛又加重了。');

  if (eventsOccurred === 0) {
    state.nightSummary.unshift({
      id: `${state.day}-calm`,
      tone: 'calm',
      text: '今夜宫廷罕见地平静。你享受了难得的安宁。',
    });
  }

  evaluateGameOver(state);
  return { state, damage };
}

export function startNextDay(currentState) {
  const state = cloneState(currentState);
  state.day += 1;
  return prepareMorning(state);
}

export function restartGame() {
  return initializeGameState();
}

export function transitionState(currentState, nextStep) {
  return transitionByStep(currentState, nextStep);
}
