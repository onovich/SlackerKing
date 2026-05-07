import { CHARACTER_META, FACTION_META, INITIAL_DAILY_CHANGES, INITIAL_FACTION_STANDINGS, INITIAL_STATE, RESOURCE_KEYS, RISK_META, defaultEvent, eventDatabase, locations, nightEvents } from '../../data/gameContent';

function cloneState(state) {
  return {
    ...state,
    resources: { ...state.resources },
    player: { ...state.player },
    flags: { ...state.flags },
    factions: { ...state.factions },
    history: [...state.history],
    logs: [...state.logs],
    nightSummary: [...state.nightSummary],
    dailyChanges: { ...state.dailyChanges },
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
  const previous = {
    treasury: state.resources.treasury,
    authority: state.resources.authority,
    military: state.resources.military,
    favor: state.resources.favor,
    stress: state.player.stress,
    energy: state.player.energy,
  };

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

  state.dailyChanges.treasury += state.resources.treasury - previous.treasury;
  state.dailyChanges.authority += state.resources.authority - previous.authority;
  state.dailyChanges.military += state.resources.military - previous.military;
  state.dailyChanges.favor += state.resources.favor - previous.favor;
  state.dailyChanges.stress += state.player.stress - previous.stress;
  state.dailyChanges.energy += state.player.energy - previous.energy;

  return damage;
}

function applyFactionEffects(state, factionEffects) {
  if (!factionEffects) {
    return;
  }

  Object.entries(factionEffects).forEach(([key, delta]) => {
    if (!(key in FACTION_META) || typeof delta !== 'number') {
      return;
    }

    const current = state.factions[key] ?? INITIAL_FACTION_STANDINGS[key] ?? 0;
    state.factions[key] = Math.max(0, Math.min(9, current + delta));
  });
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
    state.gameOver = {
      cause,
      title,
      desc,
      regimeSummary: getRegimeSummary(state),
    };
    pushLog(state, `【驾崩】 ${cause}`);
  }
}

const eventConditions = {
  favor_low_no_revolt_cd: (state) => state.resources.favor < 40 && !getFlag(state, 'tax_revolt_cd'),
  envoy_arrival_ready: (state) => state.day > 3 && !getFlag(state, 'envoy_active') && !getFlag(state, 'envoy_cd'),
  envoy_stay_due: (state) => (getFlag(state, 'envoy_active') ?? 0) >= 3,
  old_nobles_rite_ready: (state) => state.day > 3 && (state.factions.old_nobles || 0) >= 3 && !getFlag(state, 'old_nobles_cd'),
  old_nobles_patronage_ready: (state) => Boolean(getFlag(state, 'old_nobles_aftermath')) && !getFlag(state, 'old_nobles_aftermath_seen'),
  old_nobles_restoration_ready: (state) => state.day > 5 && Boolean(getFlag(state, 'old_nobles_aftermath_seen')) && state.history.includes('e_nobles_patronage') && (state.factions.old_nobles || 0) >= 5 && !getFlag(state, 'old_nobles_cd'),
  military_petition_ready: (state) => state.day > 3 && (state.factions.military || 0) >= 3 && !getFlag(state, 'military_cd'),
  military_honor_ready: (state) => Boolean(getFlag(state, 'military_aftermath')) && !getFlag(state, 'military_aftermath_seen'),
  military_commission_ready: (state) => state.day > 5 && Boolean(getFlag(state, 'military_aftermath_seen')) && state.history.includes('e_military_honor') && (state.factions.military || 0) >= 5 && !getFlag(state, 'military_cd'),
  merchants_compact_ready: (state) => state.day > 3 && (state.factions.merchants || 0) >= 3 && !getFlag(state, 'merchants_cd'),
  merchants_extension_ready: (state) => Boolean(getFlag(state, 'merchants_aftermath')) && !getFlag(state, 'merchants_aftermath_seen'),
  merchants_accounts_ready: (state) => state.day > 5 && Boolean(getFlag(state, 'merchants_aftermath_seen')) && state.history.includes('e_merchants_extension') && (state.factions.merchants || 0) >= 5 && !getFlag(state, 'merchants_cd'),
  foreign_trade_ready: (state) => state.day > 3 && (state.factions.foreign || 0) >= 3 && !getFlag(state, 'foreign_cd'),
  foreign_marriage_ready: (state) => Boolean(getFlag(state, 'foreign_aftermath')) && !getFlag(state, 'foreign_aftermath_seen'),
  magic_beast_ready: (state) => state.day > 5 && !getFlag(state, 'beast_seen'),
  corrupt_hand_ready: (state) => state.resources.authority < 60 && !getFlag(state, 'hand_warned'),
};

function getEventWeight(event, state) {
  const baseWeight = event.weight || 1;
  if (!event.factionId) {
    return baseWeight;
  }

  const factionScore = state.factions?.[event.factionId] || 0;
  if (factionScore <= 0) {
    return baseWeight;
  }

  return baseWeight + factionScore * 8;
}

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
    applyStatChanges(state, { treasury: 18, authority: 5, military: -10, favor: -15, stress: 10 });
    pushLog(state, '军队带回了税金和几百颗人头。你短期内稳住了朝局，但仇恨的种子已埋下。');
    setFlag(state, 'tax_revolt_cd', 5);
  },
  revolt_relief: (state) => {
    applyStatChanges(state, { treasury: -5, authority: -10, favor: 12 });
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
    applyStatChanges(state, { authority: 18, military: 12, favor: 6 });
    setFlag(state, 'khan_war', 1);
    pushLog(state, '群臣为你的硬气欢呼，但你知道，战争不可避免了。');
  },
  envoy_delay: (state) => {
    applyStatChanges(state, { treasury: -8 });
    setFlag(state, 'envoy_active', 1);
    pushLog(state, '使者喝得酩酊大醉，暂时住在宫里。你争取到了一点时间。');
  },
  envoy_play_dumb: (state) => {
    applyStatChanges(state, { authority: -12 });
    setFlag(state, 'envoy_active', 1);
    pushLog(state, '使者被你的无赖惊呆了，但他显然没被打发走。宫里很快就会继续为这块烫手山芋付代价。');
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
  nobles_grand_rite: (state) => {
    applyStatChanges(state, { treasury: -12, authority: 14, favor: 6, stress: 8 });
    setFlag(state, 'old_nobles_cd', 6);
    setFlag(state, 'old_nobles_aftermath', 'granted');
    deleteFlag(state, 'old_nobles_aftermath_seen');
    pushLog(state, '冬祭办得极尽铺张，宗室和旧贵族都被你的排场安抚住了。朝野重新想起，这个王朝毕竟还姓你的姓。');
  },
  nobles_trimmed_rite: (state) => {
    applyStatChanges(state, { treasury: -6, authority: 7, favor: 4, stress: 4 });
    setFlag(state, 'old_nobles_cd', 5);
    setFlag(state, 'old_nobles_aftermath', 'trimmed');
    deleteFlag(state, 'old_nobles_aftermath_seen');
    pushLog(state, '你把冬祭办得体面而克制。宗室虽嫌寒酸，却也挑不出大错。');
  },
  nobles_proxy_rite: (state) => {
    applyStatChanges(state, { authority: -8, favor: -4, stress: -4 });
    setFlag(state, 'old_nobles_cd', 4);
    setFlag(state, 'old_nobles_aftermath', 'snubbed');
    deleteFlag(state, 'old_nobles_aftermath_seen');
    setFlag(state, 'hand_power', (getFlag(state, 'hand_power') || 0) + 1);
    pushLog(state, '你把礼仪丢给礼官代办。宗室脸上挂着笑，背地里却开始怀疑你是否还配坐在祖庙前。');
  },
  nobles_patronage_yes: (state) => {
    applyStatChanges(state, { treasury: -10, authority: 10, favor: 4, stress: 5 });
    deleteFlag(state, 'old_nobles_aftermath');
    setFlag(state, 'old_nobles_aftermath_seen', 1);
    pushLog(state, '王后满意地收起名单。宗室上下都觉得你还懂得什么叫做王室恩典。');
  },
  nobles_patronage_trim: (state) => {
    applyStatChanges(state, { treasury: -4, authority: 5, favor: 2, stress: 2 });
    deleteFlag(state, 'old_nobles_aftermath');
    setFlag(state, 'old_nobles_aftermath_seen', 1);
    pushLog(state, '你把封赏名单压缩了一半。王后并不满意，但至少裴文璟承认你还算留了体面。');
  },
  nobles_patronage_no: (state) => {
    applyStatChanges(state, { authority: -8, favor: -4 });
    deleteFlag(state, 'old_nobles_aftermath');
    setFlag(state, 'old_nobles_aftermath_seen', 1);
    setFlag(state, 'hand_power', (getFlag(state, 'hand_power') || 0) + 1);
    pushLog(state, '你把名单推了回去。王后没再说什么，但宗室席间很快又开始传出“陛下只会摆样子”的冷笑。');
  },
  nobles_restore_full: (state) => {
    applyStatChanges(state, { treasury: -12, authority: 12, favor: 5, stress: 4 });
    setFlag(state, 'old_nobles_cd', 6);
    pushLog(state, '宗庙修缮按古制铺开。宗室与礼官都重新挺直了腰板，只是户部尚书看你的眼神像在看一个纵火犯。');
  },
  nobles_restore_phased: (state) => {
    applyStatChanges(state, { treasury: -6, authority: 6, favor: 3, stress: 2 });
    setFlag(state, 'old_nobles_cd', 5);
    pushLog(state, '你答应分年修缮，先把祖庙最显眼的门面撑起来。宗室虽然嫌你抠门，但也承认这至少像个交代。');
  },
  nobles_restore_delay: (state) => {
    applyStatChanges(state, { authority: -7, favor: -3, stress: -2 });
    setFlag(state, 'old_nobles_cd', 4);
    setFlag(state, 'hand_power', (getFlag(state, 'hand_power') || 0) + 1);
    pushLog(state, '你决定先拿帷幔和香火把宗庙糊弄过去。裴文璟没再多说，但朝中已经有人在私下议论你连祖宗都敢怠慢。');
  },
  military_full_fund: (state) => {
    applyStatChanges(state, { treasury: -14, military: 15, authority: 4, stress: 6 });
    setFlag(state, 'military_cd', 6);
    setFlag(state, 'military_aftermath', 'funded');
    deleteFlag(state, 'military_aftermath_seen');
    pushLog(state, '银子一车车送去边军大营。将领们对你感恩戴德，至少这几个月里不会有人在军中说你是纸糊的国王。');
  },
  military_field_games: (state) => {
    applyStatChanges(state, { treasury: -6, military: 8, authority: 5, stress: -4 });
    setFlag(state, 'military_cd', 5);
    setFlag(state, 'military_aftermath', 'reviewed');
    deleteFlag(state, 'military_aftermath_seen');
    pushLog(state, '你亲临校场，赏了几名勇士，顺手给将军们画了几张大饼。军心确实稳住了一阵。');
  },
  military_delay_pay: (state) => {
    applyStatChanges(state, { authority: -5, military: -10 });
    setFlag(state, 'military_cd', 4);
    setFlag(state, 'military_aftermath', 'delayed');
    deleteFlag(state, 'military_aftermath_seen');
    setFlag(state, 'khan_war', Math.max(1, getFlag(state, 'khan_war') || 0));
    pushLog(state, '你让户部再拖一个月。将领嘴上称是，军报里却已经开始出现边军逃亡与哗变的字眼。');
  },
  military_honor_grant: (state) => {
    applyStatChanges(state, { treasury: -8, military: 8, authority: 4 });
    deleteFlag(state, 'military_aftermath');
    setFlag(state, 'military_aftermath_seen', 1);
    pushLog(state, '韩烈得了你给足的面子，也替你把军中的躁气压了下去。至少短期内，这支军队还认你这个王。');
  },
  military_honor_words: (state) => {
    applyStatChanges(state, { military: 4, authority: 3, stress: 2 });
    deleteFlag(state, 'military_aftermath');
    setFlag(state, 'military_aftermath_seen', 1);
    pushLog(state, '你给了军中一场像样的表彰，却只发了有限的赏银。韩烈看得出你在抠门，但也知道此刻不宜翻脸。');
  },
  military_honor_refuse: (state) => {
    applyStatChanges(state, { authority: -6, military: -8 });
    deleteFlag(state, 'military_aftermath');
    setFlag(state, 'military_aftermath_seen', 1);
    setFlag(state, 'khan_war', Math.max(1, getFlag(state, 'khan_war') || 0));
    pushLog(state, '你把韩烈连人带名单一起打发了回去。军中暂时没闹，但失望正在一点点积起来。');
  },
  military_commission_trust: (state) => {
    applyStatChanges(state, { military: 10, authority: -6, stress: -4 });
    setFlag(state, 'military_cd', 6);
    pushLog(state, '韩烈的人顺利接手了几处宫门。军心明显更稳了，但你也第一次清楚感觉到，宫城里站岗的人未必只听你一个人的话。');
  },
  military_commission_split: (state) => {
    applyStatChanges(state, { military: 5, authority: 3, stress: 2 });
    setFlag(state, 'military_cd', 5);
    pushLog(state, '你在换防名单里硬塞进了自己的人。韩烈不算满意，但至少没法说你完全不给军方面子。');
  },
  military_commission_reject: (state) => {
    applyStatChanges(state, { authority: 4, military: -8, stress: 5 });
    setFlag(state, 'military_cd', 4);
    setFlag(state, 'khan_war', Math.max(1, getFlag(state, 'khan_war') || 0));
    pushLog(state, '你把换防名单压回兵部，宫门暂时还是你的宫门。只是韩烈退下时那张冷脸，已经写满了“以后再算”。');
  },
  merchants_open_charter: (state) => {
    applyStatChanges(state, { treasury: 18, authority: -8, favor: -6, stress: -4 });
    setFlag(state, 'merchants_cd', 6);
    setFlag(state, 'merchants_aftermath', 'expanded');
    deleteFlag(state, 'merchants_aftermath_seen');
    pushLog(state, '盐商们笑着抬走了牌照，也顺手抬走了一部分朝廷脸面。银子是真的进了库，但百姓骂声也是真的。');
  },
  merchants_raise_loan: (state) => {
    applyStatChanges(state, { treasury: 10, authority: 2, stress: 4 });
    setFlag(state, 'merchants_cd', 5);
    setFlag(state, 'merchants_aftermath', 'loaned');
    deleteFlag(state, 'merchants_aftermath_seen');
    pushLog(state, '商会很爽快地把钱垫上了，当然，他们的账房先生也把利息写得清清楚楚。');
  },
  merchants_raids: (state) => {
    applyStatChanges(state, { treasury: 6, authority: 6, favor: 4 });
    setFlag(state, 'merchants_cd', 4);
    setFlag(state, 'merchants_aftermath', 'taxed');
    deleteFlag(state, 'merchants_aftermath_seen');
    pushLog(state, '你先拿最肥的几家开刀。围观百姓拍手叫好，但剩下的商人也开始悄悄把银子往外搬。');
  },
  merchants_extension_yes: (state) => {
    applyStatChanges(state, { treasury: 16, authority: -8, favor: -6 });
    deleteFlag(state, 'merchants_aftermath');
    setFlag(state, 'merchants_aftermath_seen', 1);
    pushLog(state, '沈万金几乎是笑着退下的。银子又一次涌进来了，只是你也越来越分不清这到底是商会在为你服务，还是你在替商会撑腰。');
  },
  merchants_extension_audit: (state) => {
    applyStatChanges(state, { treasury: 8, authority: 4, stress: 4 });
    deleteFlag(state, 'merchants_aftermath');
    setFlag(state, 'merchants_aftermath_seen', 1);
    pushLog(state, '你没立刻续约，而是先派人查账。沈万金嘴上恭敬，心里显然已经在盘算该去打点谁。');
  },
  merchants_extension_tax: (state) => {
    applyStatChanges(state, { treasury: 6, favor: 4, authority: 3 });
    deleteFlag(state, 'merchants_aftermath');
    setFlag(state, 'merchants_aftermath_seen', 1);
    pushLog(state, '你反手给商会加了一刀税。百姓拍手称快，沈万金却把笑意收了个干净。');
  },
  merchants_accounts_cover: (state) => {
    applyStatChanges(state, { treasury: 14, authority: -8, favor: -4, stress: -2 });
    setFlag(state, 'merchants_cd', 6);
    pushLog(state, '你把火案压成了“仓库失修”的普通事故，银路照常运转。沈万金自然心领神会，只是朝廷脸面又被账房先生按在地上擦了一遍。');
  },
  merchants_accounts_probe: (state) => {
    applyStatChanges(state, { treasury: 7, authority: 5, stress: 3 });
    setFlag(state, 'merchants_cd', 5);
    pushLog(state, '你命人暗查火案，既没立刻翻脸，也没装作看不见。沈万金开始频繁递话，说明这把火多半确实烧到了他不想见人的地方。');
  },
  merchants_accounts_seize: (state) => {
    applyStatChanges(state, { treasury: 8, authority: 7, favor: 3, stress: 4 });
    setFlag(state, 'merchants_cd', 4);
    pushLog(state, '你借火案狠狠干了一刀，把几条漕运生意重新收回朝廷名下。百姓叫好，商会却也从此把你记进了那本最不想翻开的账。');
  },
  foreign_sign_treaty: (state) => {
    applyStatChanges(state, { treasury: 12, favor: 4, military: -6, authority: -4 });
    deleteFlag(state, 'envoy_active');
    deleteFlag(state, 'khan_war');
    setFlag(state, 'envoy_cd', 10);
    setFlag(state, 'foreign_cd', 6);
    setFlag(state, 'foreign_aftermath', 'treaty');
    deleteFlag(state, 'foreign_aftermath_seen');
    pushLog(state, '互市与停战条款签了下去。边境总算安静了些，但朝堂里已经有人开始嘀咕你是不是在拿王朝面子做生意。');
  },
  foreign_buy_time: (state) => {
    applyStatChanges(state, { treasury: -4, authority: -4 });
    setFlag(state, 'foreign_cd', 4);
    setFlag(state, 'foreign_aftermath', 'delay');
    deleteFlag(state, 'foreign_aftermath_seen');
    setFlag(state, 'envoy_active', Math.max(1, getFlag(state, 'envoy_active') || 0));
    pushLog(state, '你又把使团安抚了一轮。今天是拖过去了，可边境那头显然还会回来继续要价。');
  },
  foreign_refuse_terms: (state) => {
    applyStatChanges(state, { authority: 6, military: 6, stress: 6 });
    setFlag(state, 'foreign_cd', 5);
    setFlag(state, 'foreign_aftermath', 'refused');
    deleteFlag(state, 'foreign_aftermath_seen');
    setFlag(state, 'khan_war', Math.max(1, getFlag(state, 'khan_war') || 0));
    pushLog(state, '你把提案撕成两半扔回使团脸上。朝堂上一阵叫好，只是边境烽火也跟着更近了一步。');
  },
  foreign_marriage_accept: (state) => {
    applyStatChanges(state, { authority: -8, favor: 4, military: -4 });
    deleteFlag(state, 'foreign_aftermath');
    setFlag(state, 'foreign_aftermath_seen', 1);
    deleteFlag(state, 'envoy_active');
    setFlag(state, 'envoy_cd', 12);
    pushLog(state, '你把联姻条件暂时答应了下来。边境压力立刻缓和了一截，但宫里对你“卖婚求安”的议论也压不下去了。');
  },
  foreign_marriage_delay: (state) => {
    applyStatChanges(state, { treasury: -4, authority: -4 });
    deleteFlag(state, 'foreign_aftermath');
    setFlag(state, 'foreign_aftermath_seen', 1);
    setFlag(state, 'envoy_active', Math.max(1, getFlag(state, 'envoy_active') || 0));
    pushLog(state, '你把联姻话题继续往后拖。阿史那嘴上还算客气，可他显然把这当成了另一次抬价的机会。');
  },
  foreign_marriage_reject: (state) => {
    applyStatChanges(state, { authority: 6, military: 6, stress: 6 });
    deleteFlag(state, 'foreign_aftermath');
    setFlag(state, 'foreign_aftermath_seen', 1);
    setFlag(state, 'khan_war', Math.max(1, getFlag(state, 'khan_war') || 0));
    pushLog(state, '你拒绝拿王室婚事做筹码。阿史那收起了笑，边境也重新闻到了火药味。');
  },
  beast_raise: (state) => {
    applyStatChanges(state, { treasury: -20, authority: 18, military: 4 });
    setFlag(state, 'has_griffon', 1);
    setFlag(state, 'beast_seen', 1);
    pushLog(state, '虽然花钱如流水，但这只猛兽成为了王室威严的象征。');
  },
  beast_gift: (state) => {
    applyStatChanges(state, { authority: 4, military: -3, stress: -8 });
    setFlag(state, 'beast_seen', 1);
    pushLog(state, '几周后听说将军被狮鹫抓瞎了一只眼，在家休养。你暗自窃喜。');
  },
  beast_sell: (state) => {
    applyStatChanges(state, { treasury: 22, authority: -8 });
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
    applyStatChanges(state, { treasury: 12, authority: -6 });
    setFlag(state, 'hand_power', (getFlag(state, 'hand_power') || 0) + 1);
    pushLog(state, '宰相心领神会地交出了“分红”。你们成了狼狈为奸的同伙，而他的胆子也跟着更大了。');
  },
  daily_review: (state) => {
    applyStatChanges(state, { authority: 6, treasury: 4, favor: 1, stress: 4 });
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

function getMorningEnergyByStress(stress) {
  if (stress >= 85) return 70;
  if (stress >= 65) return 80;
  if (stress >= 45) return 90;
  return 100;
}

function getNightWarningFlagKey(riskKey) {
  return `${riskKey}_night_warning_seen`;
}

const locationActions = {
  visit_queen: (state) => {
    applyStatChanges(state, { energy: -10, authority: 8, favor: 4 });
    pushLog(state, '你与王后共进下午茶，顺手安抚了几家心怀不满的旧贵族。无聊，但确实稳住了局面。');
  },
  visit_mistress: (state) => {
    if (state.resources.treasury >= 20) {
      applyStatChanges(state, { treasury: -20, stress: -28, favor: -8, authority: -5 });
      pushLog(state, '醇酒、音乐与温柔乡让你彻底松了口气，但宫里已经有人开始议论陛下又荒唐了一整晚。');
      return;
    }

    pushLog(state, '【囊中羞涩】情妇因为你没带贵重礼物而给了你闭门羹。');
    applyStatChanges(state, { stress: 10 });
  },
  visit_hunt: (state) => {
    applyStatChanges(state, { energy: -18, treasury: -5, military: 9, stress: -10 });
    pushLog(state, '你射中了一头公鹿。武将们大声喝彩，但这场排场不小的围猎也实打实烧掉了一笔钱。');
  },
  visit_spy: (state) => {
    applyStatChanges(state, { treasury: -5 });
    resolveRumors(state);
  },
  visit_sleep: (state) => {
    applyStatChanges(state, { energy: 35, stress: -12, authority: -4 });
    pushLog(state, '你屏退左右，睡了一个长长的午觉。人是缓过来了，但宫里难免又多了几句“陛下今日还是没露面”的闲话。');
  },
};

const nightEffects = {
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

function resolveNightThreats(state, suppressedRiskKey) {
  let eventsOccurred = 0;
  const resolvedRiskKeys = new Set();

  for (const event of nightEvents) {
    const progress = getFlag(state, event.riskKey) || 0;
    const warningFlagKey = getNightWarningFlagKey(event.riskKey);

    if (progress <= 0) {
      deleteFlag(state, warningFlagKey);
      continue;
    }

    if (suppressedRiskKey === event.riskKey) {
      continue;
    }

    if (progress >= event.triggerThreshold) {
      const result = (nightEffects[event.effectId] ?? (() => ''))(state);
      deleteFlag(state, warningFlagKey);
      resolvedRiskKeys.add(event.riskKey);
      if (!result) {
        continue;
      }

      pushNightSummary(state, 'alert', result);
      pushLog(state, result);
      eventsOccurred += 1;
      continue;
    }

    if (progress >= event.warningThreshold && !getFlag(state, warningFlagKey)) {
      pushNightSummary(state, 'warning', event.warningText);
      pushLog(state, event.warningText);
      setFlag(state, warningFlagKey, true);
      continue;
    }

    if (progress < event.warningThreshold) {
      deleteFlag(state, warningFlagKey);
    }
  }

  return { eventsOccurred, resolvedRiskKeys };
}

function pickMorningEvent(state) {
  const pool = eventDatabase.filter((event) => eventConditions[event.conditionId](state) && !state.history.includes(event.id));

  if (pool.length === 0) {
    return defaultEvent;
  }

  const totalWeight = pool.reduce((sum, event) => sum + getEventWeight(event, state), 0);
  let roll = Math.random() * totalWeight;

  for (const event of pool) {
    roll -= getEventWeight(event, state);
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

function getFactionLevel(score) {
  if (score >= 5) {
    return {
      label: '押注',
      badgeClass: 'border-red-700/70 bg-red-900/30 text-red-200',
      barClass: 'bg-red-500',
    };
  }

  if (score >= 3) {
    return {
      label: '靠拢',
      badgeClass: 'border-yellow-700/70 bg-yellow-900/30 text-yellow-200',
      barClass: 'bg-yellow-500',
    };
  }

  if (score >= 1) {
    return {
      label: '试探',
      badgeClass: 'border-blue-700/70 bg-blue-900/30 text-blue-200',
      barClass: 'bg-blue-500',
    };
  }

  return {
    label: '观望',
    badgeClass: 'border-gray-700/70 bg-gray-900/40 text-gray-300',
    barClass: 'bg-gray-600',
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

export function getFactionOverview(state) {
  const factions = Object.entries(FACTION_META)
    .map(([id, meta]) => ({
      id,
      label: meta.label,
      icon: meta.icon,
      accentClass: meta.accentClass,
      summary: meta.summary,
      score: state.factions?.[id] ?? 0,
      level: getFactionLevel(state.factions?.[id] ?? 0),
    }))
    .sort((left, right) => right.score - left.score);

  const leadScore = factions[0]?.score ?? 0;
  return factions.map((faction) => ({
    ...faction,
    isLeading: leadScore > 0 && faction.score === leadScore,
  }));
}

export function getCourtFigures(state, event) {
  const ids = new Set(event?.characterIds ?? []);

  getFactionOverview(state)
    .filter((faction) => faction.score >= 3)
    .slice(0, 2)
    .forEach((faction) => {
      (FACTION_META[faction.id]?.characterIds ?? []).forEach((id) => ids.add(id));
    });

  if ((getFlag(state, 'spy_watch_target') || state.phase === 'night') && CHARACTER_META.spymaster_ruan) {
    ids.add('spymaster_ruan');
  }

  return Array.from(ids)
    .map((id) => CHARACTER_META[id] ? ({ id, ...CHARACTER_META[id] }) : null)
    .filter(Boolean);
}

function getFactionRouteSummary(faction) {
  if (!faction) {
    return {
      title: '你的统治还没有稳定押注任何派系',
      body: '这局更多是在四处救火。你还没真正建立一条持续路线，也因此很难让任何人替你稳住局面。',
    };
  }

  if (faction.id === 'old_nobles') {
    return {
      title: '你的统治主要靠旧贵族体面支撑',
      body: '你不断回头维护王室礼制与宗室关系。这条路擅长稳权威，但也会持续吞掉财政与精力。',
    };
  }

  if (faction.id === 'military') {
    return {
      title: '你的统治已经明显向军方倾斜',
      body: '你在用军力、军心和强硬姿态维系局面。这条路能压危机，但最怕财政透支与外线连锁。',
    };
  }

  if (faction.id === 'merchants') {
    return {
      title: '你的统治越来越像在和商会合伙',
      body: '你换来了更快的银钱与周转空间，但也在持续拿权威和民心给投机者让路。',
    };
  }

  return {
    title: '你的统治正被外部势力牵着走',
    body: '你不断用拖延、谈判和交易换取喘息。这条路能买时间，但会持续侵蚀宫廷里的脸面与底线。',
  };
}

export function getRegimeSummary(state, event = getCurrentEvent(state)) {
  const factionOverview = getFactionOverview(state);
  const primaryFaction = factionOverview[0]?.score > 0 ? factionOverview[0] : null;
  const figures = getCourtFigures(state, event).slice(0, 3);
  const routeSummary = getFactionRouteSummary(primaryFaction);

  return {
    primaryFaction,
    figures,
    title: routeSummary.title,
    body: routeSummary.body,
  };
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
  state.player.energy = getMorningEnergyByStress(state.player.stress);
  state.nightSummary = [];
  state.dailyChanges = { ...INITIAL_DAILY_CHANGES };

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
  applyFactionEffects(state, choice.factionEffects);
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
  applyFactionEffects(state, location.factionEffects);
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

  if (suppressedRiskKey) {
    const riskMeta = RISK_META[suppressedRiskKey];
    if (riskMeta) {
      pushNightSummary(state, 'info', `【情报布控】你提前盯住了“${riskMeta.label}”，这一隐患今夜没有继续恶化。`);
    }
    deleteFlag(state, 'spy_watch_target');
  }

  const { eventsOccurred, resolvedRiskKeys } = resolveNightThreats(state, suppressedRiskKey);

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

    if (resolvedRiskKeys.has(key)) {
      return;
    }

    if (suppressedRiskKey && key === suppressedRiskKey) {
      return;
    }

    state.flags[key] += 1;
  });

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
