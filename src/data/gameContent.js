export const RESOURCE_KEYS = ['treasury', 'authority', 'military', 'favor'];

export const RESOURCE_META = {
  treasury: { label: '国库', icon: 'fa-coins', textColor: 'text-yellow-400', barColor: 'bg-yellow-500' },
  authority: { label: '权威', icon: 'fa-crown', textColor: 'text-purple-400', barColor: 'bg-purple-500' },
  military: { label: '军力', icon: 'fa-shield-alt', textColor: 'text-red-400', barColor: 'bg-red-600' },
  favor: { label: '民心', icon: 'fa-users', textColor: 'text-green-400', barColor: 'bg-green-500' },
};

export const CHOICE_TIER_META = {
  low: {
    label: '低代价',
    hint: '省精力，但更容易把麻烦留到以后。',
    badgeClass: 'border-gray-600 bg-gray-900/70 text-gray-300',
  },
  mid: {
    label: '中代价',
    hint: '收益与风险都较均衡，适合稳住局面。',
    badgeClass: 'border-blue-700/70 bg-blue-900/30 text-blue-200',
  },
  high: {
    label: '高代价',
    hint: '花费更高，但会给出更直接的统治回报。',
    badgeClass: 'border-yellow-700/70 bg-yellow-900/30 text-yellow-200',
  },
};

export const RISK_META = {
  hand_power: {
    label: '宰相权势扩张',
    icon: 'fa-landmark',
    levels: {
      caution: 1,
      danger: 3,
    },
    sourceText: '你对宰相的放任正在侵蚀王权。',
    mitigationText: '优先通过晨间强硬处置或后续权威修复来压制。',
  },
  southern_mess: {
    label: '南方行省失控',
    icon: 'fa-fire',
    levels: {
      caution: 1,
      danger: 2,
    },
    sourceText: '南方总督正在脱离控制，地方叛乱风险上升。',
    mitigationText: '尽快补足民心，并避免继续用拖字诀处理地方问题。',
  },
  envoy_active: {
    label: '北方汗国威胁',
    icon: 'fa-horse-head',
    levels: {
      caution: 1,
      danger: 3,
    },
    sourceText: '北方使者滞留宫中，外交危机正在持续发酵。',
    mitigationText: '尽快解决使者问题，并为可能的战争预留军力与国库。',
  },
  khan_war: {
    label: '北方汗国威胁',
    icon: 'fa-horse-head',
    levels: {
      caution: 1,
      danger: 1,
    },
    sourceText: '大汗已经被激怒，战争进入倒计时。',
    mitigationText: '立即补充军力，并准备承担国库与民心代价。',
  },
  messy_admin: {
    label: '行政混乱积累',
    icon: 'fa-file-circle-exclamation',
    levels: {
      caution: 2,
      danger: 4,
    },
    sourceText: '草率批文的后遗症正在全国蔓延。',
    mitigationText: '减少继续乱批的频率，并为夜间恶果预留缓冲资源。',
  },
};

export const INITIAL_DAILY_CHANGES = {
  treasury: 0,
  authority: 0,
  military: 0,
  favor: 0,
  stress: 0,
  energy: 0,
};

export const INITIAL_STATE = {
  day: 1,
  phase: 'morning',
  currentEventId: null,
  resources: { treasury: 50, authority: 50, military: 40, favor: 50 },
  player: { stress: 20, energy: 100, ap: 2 },
  flags: {},
  history: [],
  isGameOver: false,
  traits: { isSlippery: true },
  logs: [],
  nightSummary: [],
  dailyChanges: { ...INITIAL_DAILY_CHANGES },
  gameOver: null,
};

export const eventDatabase = [
  {
    id: 'e_tax_revolt',
    tag: '内政危机',
    icon: 'fa-fire',
    color: 'text-red-500',
    conditionId: 'favor_low_no_revolt_cd',
    weight: 10,
    title: '抗税暴乱',
    desc: '财政大臣满头大汗地跑来：“陛下，南方行省拒绝缴纳新定的羊毛税！他们不仅赶走了税务官，还烧毁了粮仓！”',
    choices: [
      { id: 'revolt_crush', tierId: 'high', text: '【铁血镇压】派禁卫军去教训他们。 (耗精力, 需军力>30)', energy: 30, requirementId: 'military_at_least_30', effectId: 'revolt_crush' },
      { id: 'revolt_relief', tierId: 'mid', text: '【妥协免税】安抚他们，撤销税收令。 (耗精力, 损权威)', energy: 20, requirementId: 'always', effectId: 'revolt_relief' },
      { id: 'revolt_delegate', tierId: 'low', text: '【踢皮球】让当地总督自己想办法。 (省精力, 埋隐患)', energy: 5, requirementId: 'always', effectId: 'revolt_delegate' },
    ],
  },
  {
    id: 'e_envoy_arrival',
    tag: '外交事件',
    icon: 'fa-globe',
    color: 'text-blue-400',
    conditionId: 'envoy_arrival_ready',
    weight: 8,
    title: '北方汗国的使节',
    desc: '一个裹着熊皮、浑身膻味的野蛮人使者大步走入大殿，甚至没有单膝下跪。“大汗听说南方的国王软弱可欺。交出十万金币岁币，否则铁蹄踏平此地！”',
    choices: [
      { id: 'envoy_execute', tierId: 'high', text: '【斩首示威】砍了他的头送回去！ (耗精力, 极高战争风险)', energy: 40, requirementId: 'always', effectId: 'envoy_execute' },
      { id: 'envoy_delay', tierId: 'mid', text: '【糊弄大法】赏赐他美酒，说国库空虚需筹措时日。 (低耗, 拖延)', energy: 10, requirementId: 'always', effectId: 'envoy_delay' },
      { id: 'envoy_play_dumb', tierId: 'low', text: '【装傻充愣】“你说什么？朕耳背，听不懂北方方言。”', energy: 5, requirementId: 'always', effectId: 'envoy_play_dumb' },
    ],
  },
  {
    id: 'e_envoy_stay',
    tag: '外交后续',
    icon: 'fa-wine-glass',
    color: 'text-purple-400',
    conditionId: 'envoy_stay_due',
    weight: 100,
    title: '赖着不走的使者',
    desc: '北方使者已经在宫廷白吃白喝几天了，甚至调戏了女官。他再次上殿催问：“陛下，钱凑够了吗？”',
    choices: [
      { id: 'envoy_pay_off', tierId: 'mid', text: '【破财消灾】给他钱，让他快滚。 (耗国库)', energy: 10, requirementId: 'treasury_above_30', effectId: 'envoy_pay_off' },
      { id: 'envoy_assassinate', tierId: 'high', text: '【暗下毒手】让情报总管在今晚的宴会上“解决”他。 (耗精力, 风险极大)', energy: 30, requirementId: 'always', effectId: 'envoy_assassinate' },
    ],
  },
  {
    id: 'e_magic_beast',
    tag: '宫廷异闻',
    icon: 'fa-dragon',
    color: 'text-emerald-500',
    conditionId: 'magic_beast_ready',
    weight: 5,
    title: '进贡的狮鹫幼崽',
    desc: '总督送来一只罕见的魔法生物幼崽，长着鹰头狮身。它极其凶猛，咬伤了三个驯兽师。',
    choices: [
      { id: 'beast_raise', tierId: 'high', text: '【悉心培养】聘请法师驯养它作为皇家象征。 (重耗国库与精力)', energy: 40, requirementId: 'treasury_above_20', effectId: 'beast_raise' },
      { id: 'beast_gift', tierId: 'mid', text: '【转送权臣】把它赐给骄横的军方将领。 (借刀杀人)', energy: 10, requirementId: 'always', effectId: 'beast_gift' },
      { id: 'beast_sell', tierId: 'low', text: '【卖给黑市】这玩意儿肯定很值钱！ (庸君之选)', energy: 5, requirementId: 'always', effectId: 'beast_sell' },
    ],
  },
  {
    id: 'e_corrupt_hand',
    tag: '权力博弈',
    icon: 'fa-balance-scale',
    color: 'text-gray-400',
    conditionId: 'corrupt_hand_ready',
    weight: 8,
    title: '宰相的夹带',
    desc: '你在批阅一堆公文时，发现宰相偷偷将一项“盐业专卖权”批给了他自己的亲信商人。',
    choices: [
      { id: 'hand_scold', tierId: 'high', text: '【雷霆震怒】撕毁公文，当庭训斥宰相！ (耗精力, 夺回权力)', energy: 30, requirementId: 'always', effectId: 'hand_scold' },
      { id: 'hand_ignore', tierId: 'low', text: '【睁只眼闭只眼】假装没看见，盖章通过。 (省精力, 丧失实权)', energy: 0, requirementId: 'always', effectId: 'hand_ignore' },
      { id: 'hand_profit', tierId: 'mid', text: '【分一杯羹】私下找他，要求分成。 (贪腐君王)', energy: 15, requirementId: 'always', effectId: 'hand_profit' },
    ],
  },
];

export const defaultEvent = {
  id: 'e_daily_routine',
  title: '琐碎的政务',
  tag: '日常',
  icon: 'fa-paperclip',
  color: 'text-gray-500',
  desc: '一堆鸡毛蒜皮的领地纠纷、税务报表和贵族间的互相攻讦堆在你的桌上。看着就让人头痛。',
  choices: [
    { id: 'daily_review', tierId: 'high', text: '【仔细批阅】耗尽脑汁处理。 (-40精力, +少量权威/国库)', energy: 40, requirementId: 'always', effectId: 'daily_review' },
    { id: 'daily_stamp', tierId: 'low', text: '【全部准奏】闭着眼睛全盖章。 (-0精力, 埋下大量隐患)', energy: 0, requirementId: 'always', effectId: 'daily_stamp' },
  ],
};

export const locations = [
  { id: 'visit_queen', name: '王后寝宫', icon: 'fa-crown', color: 'text-yellow-400', desc: '陪伴王后，安抚旧贵族。(-少量精力, +权威/民心)', actionId: 'visit_queen' },
  { id: 'visit_mistress', name: '情妇庄园', icon: 'fa-heart', color: 'text-pink-500', desc: '极致享乐，交换政治代价。(-更多国库, 大幅-压力, -权威/民心)', actionId: 'visit_mistress' },
  { id: 'visit_hunt', name: '皇家猎场', icon: 'fa-horse', color: 'text-green-600', desc: '与将军们打猎。(-精力/少量国库, +军力/降压)', actionId: 'visit_hunt' },
  { id: 'visit_spy', name: '情报暗室', icon: 'fa-user-secret', color: 'text-purple-600', desc: '听取流言。(-钱, 获取隐患线索)', actionId: 'visit_spy' },
  { id: 'visit_sleep', name: '寝宫大睡', icon: 'fa-bed', color: 'text-blue-400', desc: '什么都不做，纯躺平。(恢复精力, 降压, 轻微失威)', actionId: 'visit_sleep' },
];

export const nightEvents = [
  {
    id: 'n_hand_coup',
    riskKey: 'hand_power',
    warningThreshold: 3,
    triggerThreshold: 4,
    warningText: '【警讯】城防军将领近来频繁出入相府。再放任一夜，宰相很可能就要逼宫了。',
    effectId: 'hand_coup',
  },
  {
    id: 'n_khan_invasion',
    riskKey: 'khan_war',
    warningThreshold: 1,
    triggerThreshold: 2,
    warningText: '【警讯】北方边境烽烟四起。大汗的前锋已经在试探防线，明夜可能就会真正南下。',
    effectId: 'khan_invasion',
  },
  {
    id: 'n_southern_revolt',
    riskKey: 'southern_mess',
    warningThreshold: 2,
    triggerThreshold: 3,
    warningText: '【警讯】南方总督正在集结兵甲。若再不给回应，独立檄文恐怕就要送到你案头。',
    effectId: 'southern_revolt',
  },
  {
    id: 'n_messy_karma',
    riskKey: 'messy_admin',
    warningThreshold: 4,
    triggerThreshold: 5,
    warningText: '【警讯】各地官吏已经开始互相推诿你签下的荒唐政令。再拖下去，行政混乱就会全面爆开。',
    effectId: 'messy_karma',
  },
];
