function createCharacter(spec) {
  return [
    spec.id,
    {
      name: spec.name,
      nickname: spec.nickname,
      title: spec.title,
      icon: spec.icon,
      accentClass: spec.accentClass,
      description: spec.description,
      group: spec.group,
    },
  ];
}

function createChoice(id, tierId, text, energy, effect, factionEffects = {}, requirementId = 'always') {
  return {
    id,
    tierId,
    text,
    energy,
    requirementId,
    effect,
    factionEffects,
  };
}

function mergeStatChanges(base, extra) {
  return {
    ...(base ?? {}),
    ...(extra ?? {}),
  };
}

function buildChoices(spec, defaults) {
  return [
    createChoice(
      `${spec.id}_high`,
      'high',
      `【${defaults.highLabel}】${spec.highText}`,
      spec.highEnergy ?? defaults.highEnergy,
      {
        statChanges: mergeStatChanges(defaults.highStatChanges, spec.highStatChanges),
        riskChanges: spec.highRiskKey ? { [spec.highRiskKey]: spec.highRiskDelta ?? 1 } : undefined,
        log: spec.highLog ?? `${spec.title}被你用最费心的方式暂时压住了。`,
      },
      spec.highFactionEffects ?? defaults.highFactionEffects,
    ),
    createChoice(
      `${spec.id}_mid`,
      'mid',
      `【${defaults.midLabel}】${spec.midText}`,
      spec.midEnergy ?? defaults.midEnergy,
      {
        statChanges: mergeStatChanges(defaults.midStatChanges, spec.midStatChanges),
        riskChanges: spec.midRiskKey ? { [spec.midRiskKey]: spec.midRiskDelta ?? 1 } : undefined,
        log: spec.midLog ?? `你给“${spec.title}”留了台阶，也给自己留了一点回旋。`,
      },
      spec.midFactionEffects ?? defaults.midFactionEffects,
    ),
    createChoice(
      `${spec.id}_low`,
      'low',
      `【${defaults.lowLabel}】${spec.lowText}`,
      spec.lowEnergy ?? defaults.lowEnergy,
      {
        statChanges: mergeStatChanges(defaults.lowStatChanges, spec.lowStatChanges),
        riskChanges: spec.lowRiskKey ? { [spec.lowRiskKey]: spec.lowRiskDelta ?? 1 } : undefined,
        log: spec.lowLog ?? `你把“${spec.title}”先推开了，问题自然会换个日子回来。`,
      },
      spec.lowFactionEffects ?? defaults.lowFactionEffects,
    ),
  ];
}

function createEvent(spec, defaults) {
  return {
    id: `e_${spec.id}`,
    tag: spec.tag,
    icon: spec.icon,
    color: spec.color,
    conditionId: spec.conditionId,
    weight: spec.weight ?? defaults.weight ?? 4,
    factionId: spec.factionId,
    characterIds: spec.characterIds,
    title: spec.title,
    desc: spec.desc,
    choices: buildChoices(spec, defaults),
  };
}

const nobleDefaults = {
  highLabel: '把体面做足',
  midLabel: '按礼数从简',
  lowLabel: '推到以后',
  highEnergy: 18,
  midEnergy: 10,
  lowEnergy: 0,
  highStatChanges: { treasury: -8, authority: 7, favor: 2, stress: 5 },
  midStatChanges: { treasury: -4, authority: 4, favor: 1, stress: 2 },
  lowStatChanges: { authority: -5, favor: -2, stress: -2 },
  highFactionEffects: { old_nobles: 2 },
  midFactionEffects: { old_nobles: 1 },
  lowFactionEffects: { merchants: 1 },
  weight: 5,
};

const councilDefaults = {
  highLabel: '亲自定夺',
  midLabel: '限期回报',
  lowLabel: '先压案头',
  highEnergy: 18,
  midEnergy: 10,
  lowEnergy: 0,
  highStatChanges: { authority: 7, treasury: 2, stress: 6 },
  midStatChanges: { authority: 4, treasury: 1, stress: 2 },
  lowStatChanges: { authority: -6, stress: -2 },
  highFactionEffects: { old_nobles: 1 },
  midFactionEffects: { old_nobles: 1 },
  lowFactionEffects: { merchants: 1 },
  weight: 4,
};

const petitionDefaults = {
  highLabel: '当场给答复',
  midLabel: '交地方处置',
  lowLabel: '打发回去',
  highEnergy: 16,
  midEnergy: 8,
  lowEnergy: 0,
  highStatChanges: { treasury: -6, favor: 8, authority: 3, stress: 4 },
  midStatChanges: { treasury: -2, favor: 4, authority: 1, stress: 1 },
  lowStatChanges: { treasury: 2, favor: -7, authority: -3, stress: -2 },
  highFactionEffects: { old_nobles: 1 },
  midFactionEffects: {},
  lowFactionEffects: { merchants: 1 },
  weight: 4,
};

const militaryDefaults = {
  highLabel: '立刻补给',
  midLabel: '给半套承诺',
  lowLabel: '再拖几天',
  highEnergy: 18,
  midEnergy: 10,
  lowEnergy: 0,
  highStatChanges: { treasury: -10, military: 9, authority: 2, stress: 5 },
  midStatChanges: { treasury: -4, military: 5, authority: 1, stress: 2 },
  lowStatChanges: { military: -6, authority: -2, stress: -2 },
  highFactionEffects: { military: 2 },
  midFactionEffects: { military: 1 },
  lowFactionEffects: { old_nobles: 1 },
  weight: 5,
};

const merchantDefaults = {
  highLabel: '放手做大',
  midLabel: '有条件放行',
  lowLabel: '先敲一笔',
  highEnergy: 16,
  midEnergy: 9,
  lowEnergy: 0,
  highStatChanges: { treasury: 10, authority: -4, favor: -3, stress: 2 },
  midStatChanges: { treasury: 5, authority: 1, stress: 2 },
  lowStatChanges: { treasury: 2, authority: -3, favor: -1, stress: -2 },
  highFactionEffects: { merchants: 2 },
  midFactionEffects: { merchants: 1 },
  lowFactionEffects: { old_nobles: 1 },
  weight: 5,
};

const foreignDefaults = {
  highLabel: '签下条件',
  midLabel: '继续周旋',
  lowLabel: '先晾着他们',
  highEnergy: 17,
  midEnergy: 9,
  lowEnergy: 0,
  highStatChanges: { authority: -4, favor: 1, military: 1, stress: 4 },
  midStatChanges: { authority: -1, treasury: 1, stress: 2 },
  lowStatChanges: { authority: -3, military: -2, stress: -1 },
  highFactionEffects: { foreign: 2 },
  midFactionEffects: { foreign: 1 },
  lowFactionEffects: { military: 1 },
  weight: 5,
};

const clergyDefaults = {
  highLabel: '高调表态',
  midLabel: '礼数从简',
  lowLabel: '避而不见',
  highEnergy: 15,
  midEnergy: 8,
  lowEnergy: 0,
  highStatChanges: { treasury: -5, authority: 5, favor: 6, stress: 3 },
  midStatChanges: { treasury: -2, authority: 3, favor: 3, stress: 1 },
  lowStatChanges: { authority: -4, favor: -4, stress: -2 },
  highFactionEffects: { old_nobles: 2 },
  midFactionEffects: { old_nobles: 1 },
  lowFactionEffects: { merchants: 1 },
  weight: 4,
};

const intrigueDefaults = {
  highLabel: '借题发作',
  midLabel: '暗中布线',
  lowLabel: '装没看见',
  highEnergy: 14,
  midEnergy: 8,
  lowEnergy: 0,
  highStatChanges: { authority: 6, stress: 5 },
  midStatChanges: { treasury: 3, authority: 2, stress: 2 },
  lowStatChanges: { authority: -4, favor: -1, stress: -2 },
  highFactionEffects: { foreign: 1, old_nobles: 1 },
  midFactionEffects: { foreign: 1 },
  lowFactionEffects: { merchants: 1 },
  weight: 4,
};

export const CHARACTER_OVERRIDES = {
  queen_isabella: {
    name: 'Isabella de Valen',
    nickname: '白鸢',
    title: '王后与旧贵族领袖',
    icon: 'fa-crown',
    accentClass: 'text-yellow-300',
    description: '她把正统、婚盟和祖制拧成一张细密的网，只要她站在你身边，旧贵族就还愿意再观望几天。',
    group: 'royalty',
  },
  lord_pei: {
    name: 'Percival Dorne',
    nickname: '古卷',
    title: '大印官',
    icon: 'fa-scroll',
    accentClass: 'text-yellow-200',
    description: '掌礼法、司档案，也最擅长用一句“祖制如此”堵死你想偷懒的缝。',
    group: 'council',
  },
  general_han: {
    name: 'Halric Voss',
    nickname: '铁狼',
    title: '北境统帅',
    icon: 'fa-shield-alt',
    accentClass: 'text-red-300',
    description: '他知道军心值多少钱，也知道你最怕哪一天宫门先认将旗后认王旗。',
    group: 'military',
  },
  guildmaster_shen: {
    name: 'Silas Merrow',
    nickname: '灰账本',
    title: '商会总会首',
    icon: 'fa-coins',
    accentClass: 'text-amber-300',
    description: '他嘴上说的是周转，袖子里塞的永远是契据、抵押和你未来几个月的命。',
    group: 'merchant',
  },
  envoy_ashina: {
    name: 'Aurel Khazad',
    nickname: '草原鹰',
    title: '汗国正使',
    icon: 'fa-globe',
    accentClass: 'text-sky-300',
    description: '他每次微笑都像在量你的城门宽度，看看明年适合让多少骑兵并排进来。',
    group: 'foreign',
  },
  spymaster_ruan: {
    name: 'Roderic Vale',
    nickname: '夜镜',
    title: '密探总监',
    icon: 'fa-user-secret',
    accentClass: 'text-violet-300',
    description: '他总能在你最不想知道真相时把真相送到你手里，然后安静地看你装作没看见。',
    group: 'intrigue',
  },
};

const additionalCharacterSeeds = [
  { id: 'chancellor_osmond', name: 'Osmond Hale', nickname: '铁羽笔', title: '首席枢密官', icon: 'fa-feather-pointed', accentClass: 'text-slate-300', description: '擅长把任何麻烦写成对你有利的诏令，也擅长把锅写给别人。', group: 'council' },
  { id: 'lord_chamberlain_edric', name: 'Edric Moor', nickname: '钥厅人', title: '内廷总管', icon: 'fa-key', accentClass: 'text-slate-300', description: '宫门、银匙和寝殿排班都经他手，任何风吹草动都绕不开这位管钥匙的人。', group: 'council' },
  { id: 'steward_cedric', name: 'Cedric Vale', nickname: '空仓簿', title: '王室司库', icon: 'fa-vault', accentClass: 'text-amber-300', description: '他永远说还能再挪一点钱，只是没人知道那一点会从哪条命上挪出来。', group: 'council' },
  { id: 'magistrate_marius', name: 'Marius Flint', nickname: '冷锤', title: '御前法官', icon: 'fa-gavel', accentClass: 'text-slate-300', description: '他断案像削石头一样干脆，却总挑最让人难受的时候把卷宗递到你面前。', group: 'council' },
  { id: 'mintwarden_aldrin', name: 'Aldrin Pike', nickname: '新铸币', title: '铸币监', icon: 'fa-coins', accentClass: 'text-amber-200', description: '他分得清金银与铜屑的分量，也分得清哪种假账最适合在冬天推出去。', group: 'council' },
  { id: 'harborreeve_godfrey', name: 'Godfrey Rill', nickname: '潮税', title: '海关总吏', icon: 'fa-anchor', accentClass: 'text-sky-300', description: '港口每一声号角都要从他账上过一遍，而他的账一向比潮水更浑。', group: 'council' },
  { id: 'archivist_renard', name: 'Renard Sable', nickname: '灰狐', title: '典籍馆长', icon: 'fa-book', accentClass: 'text-violet-200', description: '他记得每一份旧契据藏在哪层灰里，也记得哪家大族曾在旧王朝背后站错队。', group: 'council' },
  { id: 'physician_lucan', name: 'Lucan Mire', nickname: '静脉', title: '御医首席', icon: 'fa-staff-snake', accentClass: 'text-emerald-300', description: '他知道你为什么头痛，也知道宫里有多少人盼着你某天别再醒来。', group: 'council' },
  { id: 'prince_leopold', name: 'Leopold de Valen', nickname: '雏狮', title: '王储', icon: 'fa-crown', accentClass: 'text-yellow-200', description: '太年轻，太显眼，也太容易被任何一派拿来讲“后路”。', group: 'royalty' },
  { id: 'princess_margot', name: 'Margot de Valen', nickname: '金针', title: '长公主', icon: 'fa-ring', accentClass: 'text-pink-300', description: '她笑着挑席次和婚盟，像在绣花，其实每一针都扎在家族利益上。', group: 'royalty' },
  { id: 'dowager_celia', name: 'Celia Thorn', nickname: '旧壁炉', title: '王太后', icon: 'fa-fireplace', accentClass: 'text-yellow-100', description: '只要她还坐在偏殿的高背椅里，所有人都会假装这个王朝仍然按旧规矩转。', group: 'royalty' },
  { id: 'lady_sybil', name: 'Sybil Ardent', nickname: '红羽', title: '宠妃', icon: 'fa-fan', accentClass: 'text-pink-400', description: '她比任何人都明白风向，今天还替你挡酒，明天就能替别人递话。', group: 'harem' },
  { id: 'lady_rosalind', name: 'Rosalind Mere', nickname: '绯幕', title: '内廷宠姬', icon: 'fa-mask', accentClass: 'text-rose-300', description: '她掌宴会上的笑声和流言，能让整个宫廷在一夜之间记住或忘掉一件事。', group: 'harem' },
  { id: 'chamberlain_viola', name: 'Viola Crespin', nickname: '银铃', title: '女官长', icon: 'fa-bell', accentClass: 'text-blue-200', description: '她看似只管寝宫与礼服，实际上后宫每一场冷战都要由她决定谁先低头。', group: 'harem' },
  { id: 'duke_alaric', name: 'Alaric Vayne', nickname: '北塔', title: '王后兄长', icon: 'fa-landmark', accentClass: 'text-yellow-200', description: '他总拿家族声望和边地封臣说事，仿佛你欠的不只是银子，还有整片领地。', group: 'inlaw' },
  { id: 'duchess_mirelle', name: 'Mirelle Vayne', nickname: '丝袍', title: '王后长姊', icon: 'fa-gem', accentClass: 'text-pink-200', description: '她是宴席、婚盟和体面开销的化身，只要她开口，国库就会想起什么叫贵族。', group: 'inlaw' },
  { id: 'count_gaston', name: 'Gaston Rieux', nickname: '猎犬', title: '西境伯爵', icon: 'fa-dog', accentClass: 'text-yellow-300', description: '他每次入都都说带来忠诚，结果总会顺便带来几项要你点头的私利。', group: 'nobility' },
  { id: 'countess_elise', name: 'Elise Rieux', nickname: '冷纱', title: '西境伯爵夫人', icon: 'fa-scroll', accentClass: 'text-yellow-100', description: '她比丈夫更会算家族账，尤其擅长把情面包装成你无法拒绝的礼数。', group: 'nobility' },
  { id: 'matriarch_seraphine', name: 'Seraphine Morn', nickname: '黑百合', title: '晨辉家族主母', icon: 'fa-flower-tulip', accentClass: 'text-violet-200', description: '她几乎从不抬高声音，却能让几家大族在一顿晚餐后同时改口。', group: 'nobility' },
  { id: 'heir_tristan', name: 'Tristan Morn', nickname: '银扣', title: '晨辉家族继承人', icon: 'fa-ring', accentClass: 'text-blue-200', description: '年轻、骄矜、急着证明自己，也因此特别适合被人怂恿闯祸。', group: 'nobility' },
  { id: 'miller_tomas', name: 'Tomas Reed', nickname: '磨坊手', title: '磨坊主代表', icon: 'fa-wheat-awn', accentClass: 'text-amber-200', description: '他一身面粉味地闯进殿上时，往往意味着某个地方已经饿到不能再等。', group: 'commoner' },
  { id: 'widow_ysolde', name: 'Ysolde Marr', nickname: '灰披肩', title: '寡妇请愿人', icon: 'fa-person-dress', accentClass: 'text-gray-300', description: '她替死人说话，也替那些活着却没人听的穷人说话。', group: 'commoner' },
  { id: 'cooper_owen', name: 'Owen Tallow', nickname: '木桶匠', title: '城南手工业代表', icon: 'fa-hammer', accentClass: 'text-amber-300', description: '从税、柴火到运河水位，他总能用最朴素的话告诉你国家哪里正在裂。', group: 'commoner' },
  { id: 'shepherd_brann', name: 'Brann Holt', nickname: '山风', title: '北坡牧民代表', icon: 'fa-sheep', accentClass: 'text-green-300', description: '他把草场、狼患和私兵掠夺说得像天气，其实每一句都在讲边境快塌了。', group: 'commoner' },
  { id: 'fishwife_mara', name: 'Mara Fen', nickname: '潮声', title: '港市渔民代表', icon: 'fa-fish', accentClass: 'text-sky-300', description: '她嘴比浪更急，港口一涨税或一封海，她就会第一个把怨气带进宫。', group: 'commoner' },
  { id: 'reeve_colm', name: 'Colm Weaver', nickname: '旧桥桩', title: '河谷里长', icon: 'fa-bridge', accentClass: 'text-stone-300', description: '他管的是小地方，却总在最关键的时候提醒你大路和粮道是怎么断掉的。', group: 'official' },
  { id: 'bailiff_joren', name: 'Joren Pike', nickname: '锁链', title: '城北执达吏', icon: 'fa-link', accentClass: 'text-gray-300', description: '牢房、欠税和街巷械斗全归他管，所以他见谁都像在量脚镣尺寸。', group: 'official' },
  { id: 'mayor_bastien', name: 'Bastien Crowe', nickname: '市钟', title: '港城市长', icon: 'fa-city', accentClass: 'text-sky-200', description: '他既怕城里没货，也怕城里有货却不交税。每次觐见都像在平衡一锅沸汤。', group: 'official' },
  { id: 'castellan_everard', name: 'Everard Flint', nickname: '城门锁', title: '边堡城守', icon: 'fa-fort-awesome', accentClass: 'text-red-200', description: '他守的是王国最容易先被忘掉的墙，所以每封军报都写得像诀别书。', group: 'official' },
  { id: 'magistrate_lysa', name: 'Lysa Quill', nickname: '冷烛', title: '南郡巡按', icon: 'fa-scale-balanced', accentClass: 'text-purple-200', description: '她能把地方豪强和教士一起审到失声，也能把你的拖延一条条记在簿上。', group: 'official' },
  { id: 'envoy_lucerne', name: 'Lucerne Valois', nickname: '白狐', title: '西陆公国使节', icon: 'fa-feather', accentClass: 'text-sky-200', description: '他讲话像在邀舞，实际上每一步都在试你愿不愿意再退半步。', group: 'foreign' },
  { id: 'envoy_vesper', name: 'Vesper Thorn', nickname: '黑灯', title: '海上城邦使节', icon: 'fa-ship', accentClass: 'text-sky-300', description: '她谈的从来不是友谊，只是停航费、关税和谁该先让船进港。', group: 'foreign' },
  { id: 'ambassador_nasrin', name: 'Nasrin al-Sahir', nickname: '琥珀眼', title: '沙海联邦大使', icon: 'fa-sun', accentClass: 'text-amber-200', description: '她极少把条件一次说完，总要等你先暴露出最急的缺口。', group: 'foreign' },
  { id: 'merchant_prince_otto', name: 'Otto Marrec', nickname: '银桨', title: '自由商港执照主', icon: 'fa-sack-dollar', accentClass: 'text-amber-300', description: '他是外国势力里最会用商业包装胁迫的那一个。', group: 'foreign' },
  { id: 'mercenary_captain_ivaan', name: 'Ivaan Drask', nickname: '裂甲', title: '灰旗佣兵长', icon: 'fa-swords', accentClass: 'text-red-300', description: '谁出钱，他就替谁守门；谁少付钱，他就替谁把门打开。', group: 'foreign' },
  { id: 'bishop_aldous', name: 'Aldous Mere', nickname: '钟冕', title: '都城主教', icon: 'fa-church', accentClass: 'text-blue-200', description: '他能让百姓把苦日子解释成试炼，也能让他们把你的失德解释成天罚。', group: 'clergy' },
  { id: 'abbess_miriel', name: 'Miriel Snow', nickname: '冬烛', title: '圣安院女院长', icon: 'fa-candle-holder', accentClass: 'text-blue-100', description: '她手里有施粥院、孤儿院和无数耳朵，所以她的话比很多大臣都更像民心。', group: 'clergy' },
  { id: 'prior_corvin', name: 'Corvin Hale', nickname: '灰袍', title: '修道院院监', icon: 'fa-book-bible', accentClass: 'text-gray-200', description: '他管圣物、抄本与赎罪仪式，也管多少流言会先从修士嘴里传出去。', group: 'clergy' },
  { id: 'pilgrim_lark', name: 'Lark Fen', nickname: '路钟', title: '民间巡礼者', icon: 'fa-person-walking', accentClass: 'text-emerald-200', description: '她像一阵从乡间吹进都城的风，带来的常常是谣言、神迹和失控的群众情绪。', group: 'clergy' },
  { id: 'captain_rowan', name: 'Rowan Pike', nickname: '晨枪', title: '禁卫队长', icon: 'fa-shield', accentClass: 'text-red-200', description: '他站在宫门里，却总被宫门外的人盯着出价。', group: 'military' },
  { id: 'admiral_severin', name: 'Severin Vale', nickname: '盐雾', title: '王家舰队提督', icon: 'fa-anchor-circle-check', accentClass: 'text-sky-300', description: '海盗、关税和外国船队都得从他眼皮底下过，所以他永远不够船。', group: 'military' },
  { id: 'quartermaster_fergus', name: 'Fergus Borne', nickname: '麻绳', title: '军需总监', icon: 'fa-boxes-stacked', accentClass: 'text-amber-300', description: '从马料到箭羽，只要断过一次，他就能拿来向你要十次钱。', group: 'military' },
  { id: 'banneret_rolf', name: 'Rolf Banner', nickname: '破旗', title: '边军旗团长', icon: 'fa-flag', accentClass: 'text-red-300', description: '他身上的伤比勋章还多，也比任何人都知道前线离崩线有多近。', group: 'military' },
  { id: 'veteran_elsa', name: 'Elsa Thorn', nickname: '铁靴', title: '退伍军代表', icon: 'fa-boot', accentClass: 'text-red-200', description: '她替那些被王国用旧了的士兵说话，而他们永远是最容易被忘掉的一批人。', group: 'military' },
];

export const ADDITIONAL_CHARACTER_META = Object.fromEntries(additionalCharacterSeeds.map(createCharacter));

const nobleSeeds = [
  { id: 'wedding_seating', tag: '皇室家务', icon: 'fa-ring', color: 'text-pink-200', conditionId: 'household_cycle_ready', factionId: 'old_nobles', characterIds: ['princess_margot', 'duchess_mirelle'], title: '公主婚礼席次之争', desc: '玛格丽特公主和米蕾尔公爵夫人为婚礼主桌席次吵到了御前。谁坐在哪把椅子上，背后都是两家大族的脸面。', highText: '给足陪嫁与席面，谁都别再闹。', midText: '削掉几张最扎眼的请帖，把事压平。', lowText: '说婚期未定，先别来烦朕。', highRiskKey: 'wedding_debt', midRiskKey: 'wedding_debt', lowRiskKey: 'court_scandal' },
  { id: 'dowager_retinue', tag: '皇室家务', icon: 'fa-fireplace', color: 'text-yellow-100', conditionId: 'household_cycle_ready', factionId: 'old_nobles', characterIds: ['dowager_celia', 'lord_chamberlain_edric'], title: '太后要求恢复旧侍从编制', desc: '塞莉娅王太后要求恢复先王时代的完整侍从编制，说这才像一个还没败落的王室。', highText: '把人和制服都补齐，让她满意。', midText: '先恢复一半编制，场面过得去就行。', lowText: '回她一句今非昔比，别再提了。', highRiskKey: 'funeral_omens', midRiskKey: 'funeral_omens', lowRiskKey: 'succession_whispers' },
  { id: 'prince_tutor', tag: '王储教育', icon: 'fa-book-open-reader', color: 'text-yellow-200', conditionId: 'old_nobles_route_ready', factionId: 'old_nobles', characterIds: ['prince_leopold', 'lord_pei'], title: '王储导师人选', desc: '列奥波德王储到了该定导师的时候，礼官、主教和外戚都各有自己的人选。', highText: '亲自指定最稳的人，顺便定下宫中规矩。', midText: '让几家各退一步，共同辅导。', lowText: '说孩子还小，再拖一季。', highRiskKey: 'succession_whispers', midRiskKey: 'succession_whispers', lowRiskKey: 'family_vengeance' },
  { id: 'rose_gallery', tag: '后宫风波', icon: 'fa-mask', color: 'text-rose-300', conditionId: 'household_cycle_ready', factionId: 'old_nobles', characterIds: ['lady_rosalind', 'lady_sybil'], title: '绯幕厅争宠传闻', desc: '罗莎琳与西碧儿在绯幕厅里为了谁该陪同你出席晚宴闹得满城风雨。', highText: '办一场更大的夜宴，把两边都压住。', midText: '只给一边露脸，另一边用珠宝堵嘴。', lowText: '任她们互咬，你先躲开。', highRiskKey: 'court_scandal', midRiskKey: 'court_scandal', lowRiskKey: 'court_scandal' },
  { id: 'sybil_gems', tag: '后宫风波', icon: 'fa-gem', color: 'text-pink-300', conditionId: 'household_cycle_ready', factionId: 'old_nobles', characterIds: ['lady_sybil', 'steward_cedric'], title: '西碧儿要一套宝石头冠', desc: '西碧儿开口要一套新头冠，说没有这套首饰她今晚没法替你镇住贵妇们的眼睛。', highText: '给她最显眼的那套，让她替你演完整出戏。', midText: '挑次一级的给她，面子够用就好。', lowText: '让她自己想办法凑。', highRiskKey: 'wedding_debt', midRiskKey: 'court_scandal', lowRiskKey: 'court_scandal' },
  { id: 'inlaw_hunt_feast', tag: '宗亲宴请', icon: 'fa-drumstick-bite', color: 'text-yellow-300', conditionId: 'old_nobles_route_ready', factionId: 'old_nobles', characterIds: ['duke_alaric', 'count_gaston'], title: '外戚催你办围猎宴', desc: '阿拉里克公爵提议办一场大围猎，把宗亲和边地封臣都请进都城，说这样才能显出王室气象。', highText: '准了，顺手把奖赏与封赏一并开出去。', midText: '围猎可以有，规模得收一收。', lowText: '说边境不稳，猎会作罢。', highRiskKey: 'noble_feud', midRiskKey: 'noble_feud', lowRiskKey: 'family_vengeance' },
  { id: 'count_claims', tag: '封地纠纷', icon: 'fa-map', color: 'text-yellow-200', conditionId: 'old_nobles_route_ready', factionId: 'old_nobles', characterIds: ['count_gaston', 'countess_elise'], title: '伯爵夫妇争封地账册', desc: '加斯东伯爵与埃莉斯伯爵夫人拿着两本互相矛盾的封地账册入殿，都说对方私吞了家产。', highText: '你来裁定，把账和人一起按下。', midText: '让他们先交出副本，再慢慢查。', lowText: '把他们轰回家自己吵。', highRiskKey: 'noble_feud', midRiskKey: 'family_vengeance', lowRiskKey: 'noble_feud' },
  { id: 'mourning_cloak', tag: '礼制事务', icon: 'fa-cloak', color: 'text-slate-200', conditionId: 'household_cycle_ready', factionId: 'old_nobles', characterIds: ['dowager_celia', 'matriarch_seraphine'], title: '太庙祭服要不要换新', desc: '旧王留下的祭服已经陈旧破损，太后和大族主母都觉得你继续将就下去不吉利。', highText: '重制整套祭服，顺便修补祖庙排场。', midText: '只换最显眼的几件，先过眼前这一关。', lowText: '说布匹紧缺，旧的还能穿。', highRiskKey: 'funeral_omens', midRiskKey: 'funeral_omens', lowRiskKey: 'succession_whispers' },
  { id: 'nursery_quarrel', tag: '皇室家务', icon: 'fa-child-reaching', color: 'text-yellow-100', conditionId: 'household_cycle_ready', factionId: 'old_nobles', characterIds: ['prince_leopold', 'chamberlain_viola'], title: '王储侍从在育儿室打起来了', desc: '王储身边两名侍从因站队不同，在育儿室直接扭打成一团。宫里已经开始有人借题发挥。', highText: '立刻换掉整班人，向外传出你的态度。', midText: '只撤最闹的两个，其他人继续留用。', lowText: '说孩子们身边吵闹正常。', highRiskKey: 'succession_whispers', midRiskKey: 'court_scandal', lowRiskKey: 'succession_whispers' },
  { id: 'dowry_chest', tag: '婚盟事务', icon: 'fa-box-open', color: 'text-amber-200', conditionId: 'old_nobles_route_ready', factionId: 'old_nobles', characterIds: ['princess_margot', 'duchess_mirelle'], title: '嫁妆箱里少了银器', desc: '公主婚盟在即，几口本应装满银器的嫁妆箱却空了一半。两边都等着你先开口。', highText: '拿库银补齐，让婚盟别出丑。', midText: '挑重点补齐，剩下以后慢慢凑。', lowText: '说谁丢的谁去找。', highRiskKey: 'wedding_debt', midRiskKey: 'family_vengeance', lowRiskKey: 'court_scandal' },
  { id: 'family_trial', tag: '宗亲冲突', icon: 'fa-scale-balanced', color: 'text-stone-200', conditionId: 'old_nobles_route_ready', factionId: 'old_nobles', characterIds: ['duke_alaric', 'matriarch_seraphine'], title: '外戚要你偏袒家族审判', desc: '一桩涉及外戚亲信的杀人案被送到御前，阿拉里克希望你不要让家族在都城丢脸。', highText: '你亲自压案，把人情和判决一起做了。', midText: '让法官照办，但别把羞事传得太广。', lowText: '说一切按律，自己抽身。', highRiskKey: 'family_vengeance', midRiskKey: 'court_scandal', lowRiskKey: 'noble_feud' },
  { id: 'heir_betrothal', tag: '婚盟事务', icon: 'fa-heart', color: 'text-pink-200', conditionId: 'old_nobles_route_ready', factionId: 'old_nobles', characterIds: ['heir_tristan', 'princess_margot'], title: '家族想拿王女换盟约', desc: '特里斯坦背后的家族想借婚约把王女和一串地方承诺一起绑进盟书里。', highText: '当场拍板，用婚盟换来短期稳定。', midText: '只答应象征性亲近，不签死承诺。', lowText: '把婚书退回去，让他们另想办法。', highRiskKey: 'family_vengeance', midRiskKey: 'succession_whispers', lowRiskKey: 'noble_feud' },
];

const councilSeeds = [
  { id: 'mint_report', tag: '内阁政务', icon: 'fa-coins', color: 'text-amber-300', conditionId: 'court_cycle_ready', characterIds: ['mintwarden_aldrin', 'chancellor_osmond'], title: '铸币监报告银含量不足', desc: '奥德林把一枚新铸银币掰在你桌上，冷冷提醒你：如果再掺铜，连市场上的酒贩都要开始拒收王室钱币。', highText: '亲自整顿铸币坊，今天就换工匠。', midText: '先回收最差的一批，剩下慢慢调。', lowText: '先别声张，能花出去就行。', highRiskKey: 'mint_debasement', midRiskKey: 'mint_debasement', lowRiskKey: 'mint_debasement' },
  { id: 'canal_sluice', tag: '内阁政务', icon: 'fa-water', color: 'text-sky-200', conditionId: 'treasury_pressure_ready', characterIds: ['steward_cedric', 'reeve_colm'], title: '主运河水闸要塌', desc: '运河主闸被报年久失修，一旦坍了，冬粮进都和春税出城都会卡死。', highText: '你亲批银子，先把主闸抢修。', midText: '只修最危险的那一段，剩下拖到春天。', lowText: '说等下月再议。', highRiskKey: 'canal_silt', midRiskKey: 'canal_silt', lowRiskKey: 'canal_silt' },
  { id: 'dock_dues', tag: '内阁政务', icon: 'fa-anchor', color: 'text-sky-300', conditionId: 'court_cycle_ready', characterIds: ['harborreeve_godfrey', 'mayor_bastien'], title: '港口税目一夜多出三层', desc: '港口同一批货现在要缴三道不同名目的税，船东们已经开始改走私湾。', highText: '当场砍掉两层杂税，顺手查人。', midText: '合并税目，先把名义理顺。', lowText: '反正银子没少，先这样。', highRiskKey: 'port_smuggling', midRiskKey: 'port_smuggling', lowRiskKey: 'port_smuggling' },
  { id: 'plague_quarantine', tag: '内阁政务', icon: 'fa-staff-snake', color: 'text-emerald-300', conditionId: 'public_grievance_ready', characterIds: ['physician_lucan', 'magistrate_lysa'], title: '南市出现热病', desc: '卢坎带来的报告很短：南市热病有扩散迹象，要么现在封街，要么过几天满城都是咳血的人。', highText: '立刻封街并拨银施药。', midText: '先封最乱的几条巷子，药材后补。', lowText: '别制造恐慌，让他们自己挺过。', highRiskKey: 'plague_whispers', midRiskKey: 'plague_whispers', lowRiskKey: 'plague_whispers' },
  { id: 'census_roll', tag: '内阁政务', icon: 'fa-list-check', color: 'text-slate-300', conditionId: 'authority_pressure_ready', characterIds: ['chancellor_osmond', 'archivist_renard'], title: '人口册少了整整一郡', desc: '人口册在抄写时“少”了一整郡。有人偷税，有人遮兵役，还有人想让你永远算不清自己究竟统治着谁。', highText: '亲自盯着重编户籍，把账补齐。', midText: '先补都城周边，远郡以后再追。', lowText: '少一郡就少一郡，先别折腾。', highRiskKey: 'blackmail_letters', midRiskKey: 'blackmail_letters', lowRiskKey: 'pretender_rumor' },
  { id: 'grain_tallies', tag: '内阁政务', icon: 'fa-wheat-awn', color: 'text-amber-200', conditionId: 'treasury_pressure_ready', characterIds: ['steward_cedric', 'miller_tomas'], title: '谷仓损耗对不上', desc: '司库和磨坊主给出的谷仓损耗数字差了整整三成，显然不是老鼠能吃掉的量。', highText: '当场封仓盘点，把手伸最长的人揪出来。', midText: '先补上账面窟窿，暗中慢慢查。', lowText: '把数字抹平，别让人知道。', highRiskKey: 'granary_rot', midRiskKey: 'granary_rot', lowRiskKey: 'granary_rot' },
  { id: 'bridge_toll', tag: '内阁政务', icon: 'fa-road-bridge', color: 'text-stone-300', conditionId: 'regional_audience_ready', characterIds: ['reeve_colm', 'bailiff_joren'], title: '边桥收费官私设关卡', desc: '一座本该免费通行的边桥被地方吏员拿去层层收钱，商队和灾民都堵在路上。', highText: '撤人拆卡，把桥路重新打通。', midText: '只撤最惹眼的几道口子。', lowText: '让他们先把今年的税补齐再说。', highRiskKey: 'border_bandits', midRiskKey: 'canal_silt', lowRiskKey: 'border_bandits' },
  { id: 'royal_physic', tag: '内阁政务', icon: 'fa-flask', color: 'text-emerald-200', conditionId: 'court_cycle_ready', characterIds: ['physician_lucan', 'queen_isabella'], title: '御医建议削减夜宴', desc: '卢坎很委婉地说，你再这么熬夜和灌酒，最先垮掉的不会是王朝，而是你的脉。', highText: '照医嘱减宴减酒，今天就停。', midText: '缩短一半场次，给自己留口气。', lowText: '让御医少操心，多配药。', highStatChanges: { authority: 3, favor: 1, stress: -10 }, midStatChanges: { authority: 1, stress: -6 }, lowStatChanges: { authority: -2, stress: 6 }, highRiskKey: 'court_scandal', midRiskKey: 'court_scandal', lowRiskKey: 'funeral_omens', highLog: '你难得听了一次御医的话，至少今天夜里不会再有人看见你端着酒杯打瞌睡。', midLog: '你决定把夜宴缩短一半，侍从们都像见了奇迹。', lowLog: '你让卢坎多开点镇痛药，宫里则开始传“国王比夜宴更离不开药瓶”。' },
  { id: 'archive_fire', tag: '内阁政务', icon: 'fa-folder-open', color: 'text-violet-200', conditionId: 'intrigue_cycle_ready', characterIds: ['archivist_renard', 'lord_pei'], title: '典籍馆失火烧掉封地契据', desc: '典籍馆一间偏库半夜起火，偏偏烧掉的正是几份最值钱的封地契据。', highText: '立刻封馆查人，把旧契据重誊出来。', midText: '先止住传言，再慢慢补档。', lowText: '烧了就烧了，省得麻烦。', highRiskKey: 'blackmail_letters', midRiskKey: 'court_scandal', lowRiskKey: 'pretender_rumor' },
  { id: 'courthouse_bribes', tag: '内阁政务', icon: 'fa-gavel', color: 'text-slate-300', conditionId: 'authority_pressure_ready', characterIds: ['magistrate_marius', 'magistrate_lysa'], title: '法庭里连木槌都带价码', desc: '玛里乌斯把几只装满银币的木盒摆在你面前，意思很明白：都城法庭已经有人公开卖判词了。', highText: '当场拿人，哪怕把法官一起撕下来。', midText: '先换掉最脏的一层，别让庭审停摆。', lowText: '收起盒子，别让更多人知道。', highRiskKey: 'blackmail_letters', midRiskKey: 'court_scandal', lowRiskKey: 'blackmail_letters' },
];

const petitionSeeds = [
  { id: 'widow_grain', tag: '民间上访', icon: 'fa-bowl-food', color: 'text-green-200', conditionId: 'public_grievance_ready', characterIds: ['widow_ysolde', 'abbess_miriel'], title: '寡妇们来求冬粮', desc: '伊索尔德带着十几个抱孩子的寡妇跪在殿前，说再过十天她们连给孩子煮稀汤的谷皮都没了。', highText: '开仓放粮，先让她们活到开春。', midText: '只发最急的几户，其余交修院登记。', lowText: '让她们去找地方官。', highRiskKey: 'harvest_shortfall', midRiskKey: 'harvest_shortfall', lowRiskKey: 'refugee_wave' },
  { id: 'shepherd_raiders', tag: '民间上访', icon: 'fa-sheep', color: 'text-green-300', conditionId: 'regional_audience_ready', characterIds: ['shepherd_brann', 'castellan_everard'], title: '牧民说夜里总有人掳羊', desc: '布兰带着被割断的羊铃来到殿上，说边地游匪和某些私兵把他们当成移动粮仓。', highText: '拨人巡边，把抢羊的人钉在路口。', midText: '让城守先护住最危险的几处草场。', lowText: '叫他们自己结伴守夜。', highRiskKey: 'border_bandits', midRiskKey: 'border_bandits', lowRiskKey: 'frontier_deserters' },
  { id: 'miller_flood', tag: '民间上访', icon: 'fa-water', color: 'text-sky-200', conditionId: 'public_grievance_ready', characterIds: ['miller_tomas', 'reeve_colm'], title: '河谷磨坊被水冲塌', desc: '托马斯说河谷一带的磨坊倒了三座，春前不修，粮食磨不出来，税也收不上来。', highText: '拨木料和工钱，马上修。', midText: '先修主磨坊，偏远的等后面。', lowText: '反正税没到期，让他们自己扛。', highRiskKey: 'harvest_shortfall', midRiskKey: 'canal_silt', lowRiskKey: 'granary_rot' },
  { id: 'cooper_levy', tag: '民间上访', icon: 'fa-hammer', color: 'text-amber-300', conditionId: 'public_grievance_ready', characterIds: ['cooper_owen', 'guildmaster_shen'], title: '桶匠们抱怨木料税', desc: '欧文说木料税一涨，连装酒和腌鱼的桶都要做不起了，最后骂名却会落在王室头上。', highText: '减掉木料税，先保住工坊活路。', midText: '只豁免冬季木料，春后再议。', lowText: '说税是商会定价的问题。', highRiskKey: 'guild_monopoly', midRiskKey: 'guild_monopoly', lowRiskKey: 'port_smuggling' },
  { id: 'fishwife_tariff', tag: '民间上访', icon: 'fa-fish', color: 'text-sky-300', conditionId: 'public_grievance_ready', characterIds: ['fishwife_mara', 'mayor_bastien'], title: '渔港盐税闹市', desc: '玛拉在殿上直接拍下一条腌鱼，说连这种穷人吃的东西都快被税出肉价了。', highText: '砍掉一层盐税，顺便压住港口闹事。', midText: '先限价一季，回头再补税。', lowText: '叫她别拿咸鱼脏御前。', highRiskKey: 'port_smuggling', midRiskKey: 'refugee_wave', lowRiskKey: 'port_smuggling' },
  { id: 'reeve_bridge', tag: '地方觐见', icon: 'fa-bridge', color: 'text-stone-200', conditionId: 'regional_audience_ready', characterIds: ['reeve_colm', 'lord_pei'], title: '河谷老桥只能走一辆车', desc: '科尔姆说老桥木梁全泡烂了，最近两次税车过桥都差点翻进河里。', highText: '立刻派工修桥，别让粮路断在你手里。', midText: '先铺临时板桥，熬过冬季。', lowText: '让他们绕远路。', highRiskKey: 'canal_silt', midRiskKey: 'border_bandits', lowRiskKey: 'harvest_shortfall' },
  { id: 'bailiff_cells', tag: '地方觐见', icon: 'fa-link', color: 'text-gray-300', conditionId: 'authority_pressure_ready', characterIds: ['bailiff_joren', 'magistrate_marius'], title: '城北牢房装不下了', desc: '约伦抱怨说牢房已经塞满欠税、斗殴和偷粮的人，照现在这样拖下去迟早会炸监。', highText: '拨钱扩牢并清理积案。', midText: '先放掉轻罪犯，给牢房腾口气。', lowText: '多上几道锁就行。', highRiskKey: 'refugee_wave', midRiskKey: 'plague_whispers', lowRiskKey: 'court_scandal' },
  { id: 'mayor_market', tag: '地方觐见', icon: 'fa-store', color: 'text-amber-200', conditionId: 'regional_audience_ready', characterIds: ['mayor_bastien', 'guildmaster_shen'], title: '港城市场快被一家公司包圆', desc: '巴斯蒂安报告说一批关系商人正在把港城粮油和灯油铺子一口气全收走。', highText: '拆开垄断，把执照重新发。', midText: '给他们设价上限，先稳几周。', lowText: '谁有本事谁赚。', highRiskKey: 'guild_monopoly', midRiskKey: 'guild_monopoly', lowRiskKey: 'blackmail_letters' },
  { id: 'castellan_refugees', tag: '地方觐见', icon: 'fa-person-shelter', color: 'text-sky-200', conditionId: 'regional_audience_ready', characterIds: ['castellan_everard', 'widow_ysolde'], title: '边堡外全是逃难的人', desc: '埃弗拉德说边堡外的空地被难民搭满了棚子，再不给粮和秩序，军堡自己都会乱。', highText: '拨粮拨布，把他们先安进营地。', midText: '只收老人和孩子，其余人分散回乡。', lowText: '把人挡在堡外，别进城。', highRiskKey: 'refugee_wave', midRiskKey: 'refugee_wave', lowRiskKey: 'border_bandits' },
  { id: 'magistrate_road', tag: '地方觐见', icon: 'fa-road', color: 'text-stone-300', conditionId: 'regional_audience_ready', characterIds: ['magistrate_lysa', 'cooper_owen'], title: '南郡大道被豪强占着收费', desc: '莱萨说南郡大道两端都被地方豪强架起路卡，过路人交了税还得再交“保路银”。', highText: '派人拆卡，顺便把豪强敲醒。', midText: '只拆主道，次道先忍。', lowText: '默许他们先替你收钱。', highRiskKey: 'border_bandits', midRiskKey: 'family_vengeance', lowRiskKey: 'blackmail_letters' },
  { id: 'village_pilgrims', tag: '民间上访', icon: 'fa-person-walking', color: 'text-blue-200', conditionId: 'clergy_cycle_ready', characterIds: ['pilgrim_lark', 'abbess_miriel'], title: '村民说有圣迹要朝圣', desc: '拉克带来消息，说乡下有人见到发光圣像，周边村子都想丢下活计去朝圣。', highText: '让修院接管人群，免得闹出乱子。', midText: '准他们小规模祭拜，别扩太大。', lowText: '爱去哪去哪。', highRiskKey: 'heretic_fervor', midRiskKey: 'heretic_fervor', lowRiskKey: 'refugee_wave' },
  { id: 'winter_charcoal', tag: '民间上访', icon: 'fa-fire', color: 'text-orange-200', conditionId: 'public_grievance_ready', characterIds: ['widow_ysolde', 'cooper_owen'], title: '城里穷户买不起木炭', desc: '一场寒潮还没到，城里最穷的一批人已经开始烧门板取暖了。', highText: '开官仓木炭，别让人冻死在街口。', midText: '只发给登记在册的贫户。', lowText: '冬天本就难熬，让他们自己想法。', highRiskKey: 'plague_whispers', midRiskKey: 'harvest_shortfall', lowRiskKey: 'refugee_wave' },
];

const militarySeeds = [
  { id: 'mercenary_wages', tag: '军情会商', icon: 'fa-sack-dollar', color: 'text-red-300', conditionId: 'military_route_ready', factionId: 'military', characterIds: ['general_han', 'mercenary_captain_ivaan'], title: '灰旗佣兵讨欠饷', desc: '伊瓦安把账本摔在你面前，说灰旗佣兵再拿不到饷银，就只能自己找地方结算。', highText: '把欠饷补齐，再给他们一笔安家钱。', midText: '先付一半，剩下等下批税银。', lowText: '告诉他们王国现在没空哄佣兵。', highRiskKey: 'mercenary_arrears', midRiskKey: 'mercenary_arrears', lowRiskKey: 'mercenary_arrears' },
  { id: 'fleet_pitch', tag: '军情会商', icon: 'fa-anchor-circle-check', color: 'text-sky-300', conditionId: 'border_cycle_ready', factionId: 'military', characterIds: ['admiral_severin', 'harborreeve_godfrey'], title: '舰队说连船底焦油都不够', desc: '塞维林说若不补足焦油和麻绳，王家舰队连下个月出港都费劲。', highText: '把海军缺口一次补上。', midText: '先保旗舰和哨船，别全配齐。', lowText: '让海军自己省着用。', highRiskKey: 'pirate_raids', midRiskKey: 'pirate_raids', lowRiskKey: 'port_smuggling' },
  { id: 'border_beacons', tag: '军情会商', icon: 'fa-fire-flame-curved', color: 'text-red-200', conditionId: 'border_cycle_ready', factionId: 'military', characterIds: ['general_han', 'castellan_everard'], title: '北境烽火台缺人守', desc: '几座边境烽火台因为缺人和缺粮，已经到了点火都未必有人应的地步。', highText: '补兵补粮，今晚就让烽火台重亮。', midText: '先守主线，其余支塔暂缓。', lowText: '真有敌情再说。', highRiskKey: 'frontier_deserters', midRiskKey: 'frontier_deserters', lowRiskKey: 'border_bandits' },
  { id: 'garrison_boots', tag: '军情会商', icon: 'fa-boot', color: 'text-amber-200', conditionId: 'military_route_ready', factionId: 'military', characterIds: ['quartermaster_fergus', 'veteran_elsa'], title: '守军连冬靴都不够', desc: '军需官和退伍老兵一起提醒你，再不发冬靴，很多人不是死于敌军，而是死于冻疮和逃营。', highText: '发足冬装，至少别让人光脚站岗。', midText: '先补前线和夜哨。', lowText: '再挺一挺。', highRiskKey: 'frontier_deserters', midRiskKey: 'mercenary_arrears', lowRiskKey: 'frontier_deserters' },
  { id: 'veteran_land', tag: '军情会商', icon: 'fa-house-flag', color: 'text-green-200', conditionId: 'military_route_ready', factionId: 'military', characterIds: ['veteran_elsa', 'lord_pei'], title: '退伍兵索要承诺田地', desc: '艾尔莎替一批退伍兵来讨那块说好了却迟迟没分下去的田地。', highText: '给地给种子，把旧账结了。', midText: '先发一批，剩下排队。', lowText: '让他们继续等。', highRiskKey: 'pretender_rumor', midRiskKey: 'mercenary_arrears', lowRiskKey: 'frontier_deserters' },
  { id: 'banner_oath', tag: '军情会商', icon: 'fa-flag', color: 'text-red-300', conditionId: 'military_route_ready', factionId: 'military', characterIds: ['banneret_rolf', 'captain_rowan'], title: '边军要你重宣效忠誓词', desc: '罗尔夫觉得军中近来流言太多，建议你公开重宣誓词，好让人记住军旗到底替谁而立。', highText: '亲自到校场宣誓，给足他们面子。', midText: '在宫中设誓，不必跑太远。', lowText: '派大臣代读誓词。', highRiskKey: 'pretender_rumor', midRiskKey: 'military_overreach', lowRiskKey: 'military_overreach' },
  { id: 'quartermaster_salt', tag: '军情会商', icon: 'fa-bag-shopping', color: 'text-amber-300', conditionId: 'military_route_ready', factionId: 'military', characterIds: ['quartermaster_fergus', 'guildmaster_shen'], title: '军盐被商会卡住', desc: '军需盐价被人暗中抬高，连腌肉都快做不起了。军中已经开始骂户部和商会一起吃军粮。', highText: '拨专款保军盐，顺手敲打商会。', midText: '先签临时军价，别让冬粮断。', lowText: '让军需自己去讲价。', highRiskKey: 'guild_monopoly', midRiskKey: 'mercenary_arrears', lowRiskKey: 'military_overreach' },
  { id: 'captain_patrol', tag: '军情会商', icon: 'fa-person-rifle', color: 'text-red-200', conditionId: 'border_cycle_ready', factionId: 'military', characterIds: ['captain_rowan', 'castellan_everard'], title: '禁卫要求扩大夜巡', desc: '罗文要求把夜巡线从宫门扩到外城，说最近城里有不少人夜里在试探哨位。', highText: '准了，再给他们补灯火和口粮。', midText: '只加宫外主道夜巡。', lowText: '别把城里弄得像要打仗。', highRiskKey: 'pretender_rumor', midRiskKey: 'blackmail_letters', lowRiskKey: 'court_scandal' },
  { id: 'harbor_chain', tag: '军情会商', icon: 'fa-link', color: 'text-sky-200', conditionId: 'border_cycle_ready', factionId: 'military', characterIds: ['admiral_severin', 'mayor_bastien'], title: '港口拦船铁链断了一节', desc: '塞维林说港口夜间拦船铁链坏了，真要有海盗或走私大船硬闯，王港就是个敞开的篮子。', highText: '今天就换新链子和桩座。', midText: '先修最关键的一段。', lowText: '先凑合着用。', highRiskKey: 'pirate_raids', midRiskKey: 'port_smuggling', lowRiskKey: 'pirate_raids' },
  { id: 'siege_drills', tag: '军情会商', icon: 'fa-tower-observation', color: 'text-red-300', conditionId: 'border_cycle_ready', factionId: 'military', characterIds: ['general_han', 'banneret_rolf'], title: '边军想加练攻城器械', desc: '韩烈希望加练攻城器械，说即便不主动出兵，也得让别人知道你不是只会守城。', highText: '准他们操练，粮料也一起给。', midText: '只练一部分器械，别烧太多钱。', lowText: '这种排场先免了。', highRiskKey: 'frontier_deserters', midRiskKey: 'khan_war', lowRiskKey: 'military_overreach' },
];

const merchantSeeds = [
  { id: 'guild_lending', tag: '商路交易', icon: 'fa-sack-dollar', color: 'text-amber-300', conditionId: 'merchants_route_ready', factionId: 'merchants', characterIds: ['guildmaster_shen', 'merchant_prince_otto'], title: '商会想包下冬贷', desc: '商会提出替王国垫付冬季周转款，但条件是他们能独占几条高利放贷渠道。', highText: '签，让他们先把银子抬进来。', midText: '借钱可以，利率和期限要卡死。', lowText: '先收见面礼，再说以后。', highRiskKey: 'guild_monopoly', midRiskKey: 'merchants_corruption', lowRiskKey: 'blackmail_letters' },
  { id: 'river_monopoly', tag: '商路交易', icon: 'fa-water', color: 'text-sky-300', conditionId: 'treasury_pressure_ready', factionId: 'merchants', characterIds: ['guildmaster_shen', 'mayor_bastien'], title: '河运行会想包圆漕运', desc: '几家河运行会愿意立刻补税，但要把漕运装卸和驿站仓房一起打包吃下。', highText: '准他们包下，先让船动起来。', midText: '只给装卸，不给仓房。', lowText: '让他们再加价。', highRiskKey: 'guild_monopoly', midRiskKey: 'port_smuggling', lowRiskKey: 'merchants_corruption' },
  { id: 'mint_contract', tag: '商路交易', icon: 'fa-coins', color: 'text-amber-200', conditionId: 'treasury_pressure_ready', factionId: 'merchants', characterIds: ['mintwarden_aldrin', 'guildmaster_shen'], title: '私坊想承包铸币辅料', desc: '几家私坊提出包供铸币辅料和银矿运输，条件是账面上他们只按自己愿意让你看到的数字走。', highText: '给他们合同，先把铸币线救活。', midText: '合同可以签，但必须交副本查账。', lowText: '先把入场费交来。', highRiskKey: 'mint_debasement', midRiskKey: 'mint_debasement', lowRiskKey: 'blackmail_letters' },
  { id: 'wool_charter', tag: '商路交易', icon: 'fa-shirt', color: 'text-amber-100', conditionId: 'merchants_route_ready', factionId: 'merchants', characterIds: ['guildmaster_shen', 'widow_ysolde'], title: '羊毛出口执照', desc: '商会想拿独家羊毛出口执照，说这样能更快把边地的税银换回来。百姓则担心衣料会更贵。', highText: '批给他们，先让银子回来。', midText: '限定期限和上限，先试一季。', lowText: '先榨他们一笔押金。', highRiskKey: 'guild_monopoly', midRiskKey: 'harvest_shortfall', lowRiskKey: 'merchants_corruption' },
  { id: 'customs_farm', tag: '商路交易', icon: 'fa-ship', color: 'text-sky-200', conditionId: 'merchants_route_ready', factionId: 'merchants', characterIds: ['harborreeve_godfrey', 'merchant_prince_otto'], title: '港口税包征提案', desc: '奥托建议由他的人替王室包征港口税，保你每月银子准时入库，只求别查得太细。', highText: '包给他，先保月月有现银。', midText: '只包部分码头，其余仍由官吏掌。', lowText: '让他先交诚意金。', highRiskKey: 'port_smuggling', midRiskKey: 'port_smuggling', lowRiskKey: 'blackmail_letters' },
  { id: 'lamp_oil', tag: '商路交易', icon: 'fa-oil-can', color: 'text-amber-300', conditionId: 'treasury_pressure_ready', factionId: 'merchants', characterIds: ['guildmaster_shen', 'fishwife_mara'], title: '灯油行会想抬冬价', desc: '灯油行会说海路险、税重、仓位贵，冬季价格必须上扬。贫民区已经开始点不起灯。', highText: '准涨价，换他们提前缴税。', midText: '涨可以，但给贫区留平价油。', lowText: '先罚一笔，再慢慢谈。', highRiskKey: 'guild_monopoly', midRiskKey: 'refugee_wave', lowRiskKey: 'port_smuggling' },
  { id: 'caravan_insurance', tag: '商路交易', icon: 'fa-caravan', color: 'text-amber-200', conditionId: 'merchants_route_ready', factionId: 'merchants', characterIds: ['merchant_prince_otto', 'envoy_lucerne'], title: '跨境商队保险契', desc: '几家跨境商队提出卖给王室一套“安全契”，其实就是让你替他们担风险。', highText: '签，换来跨境货流不断。', midText: '只给几条最值钱的商路保底。', lowText: '让他们先把保费抬上来。', highRiskKey: 'foreign_infiltration', midRiskKey: 'guild_monopoly', lowRiskKey: 'blackmail_letters' },
  { id: 'glasshouse_lease', tag: '商路交易', icon: 'fa-wine-glass', color: 'text-amber-100', conditionId: 'merchants_route_ready', factionId: 'merchants', characterIds: ['guildmaster_shen', 'lady_rosalind'], title: '温室花房租给谁', desc: '一片本属王室的温室花房引来几家商号争租，罗莎琳也想从中分走部分份额。', highText: '整片租出，谁出价高给谁。', midText: '切成几份，别让一家吃满。', lowText: '暂时不租，先收礼。', highRiskKey: 'court_scandal', midRiskKey: 'guild_monopoly', lowRiskKey: 'blackmail_letters' },
  { id: 'countinghouse_merger', tag: '商路交易', icon: 'fa-file-invoice-dollar', color: 'text-amber-300', conditionId: 'merchants_route_ready', factionId: 'merchants', characterIds: ['guildmaster_shen', 'steward_cedric'], title: '三家票号要合并总账', desc: '三家票号希望合并成一个更大的总账房，说这样国库往来更快，但也更黑。', highText: '准他们合并，先把流水拉起来。', midText: '可以合，但必须接受王室抽查。', lowText: '先别合，让他们继续互相掣肘。', highRiskKey: 'merchants_corruption', midRiskKey: 'merchants_corruption', lowRiskKey: 'guild_monopoly' },
];

const foreignSeeds = [
  { id: 'lucerne_hostages', tag: '外邦试探', icon: 'fa-feather', color: 'text-sky-200', conditionId: 'foreign_route_ready', factionId: 'foreign', characterIds: ['envoy_lucerne', 'queen_isabella'], title: '西陆公国要交换质子', desc: '吕西安提出一桩看似体面的交换：各送一名贵族少年去对方宫廷“学习礼仪”。', highText: '点头，先换来几年表面亲近。', midText: '只接受礼仪互访，不写成质子。', lowText: '说王国还没弱到要送孩子。', highRiskKey: 'foreign_infiltration', midRiskKey: 'succession_whispers', lowRiskKey: 'khan_war' },
  { id: 'vesper_border_mark', tag: '外邦试探', icon: 'fa-map', color: 'text-sky-300', conditionId: 'border_cycle_ready', factionId: 'foreign', characterIds: ['envoy_vesper', 'castellan_everard'], title: '海上城邦要求重画边界图', desc: '维斯珀坚持说两份旧海图不一致，要趁冬天一起重画沿岸边界与泊位。', highText: '先答应重画，换来航路平静。', midText: '只核对争议最小的几段。', lowText: '图是旧王朝定的，不改。', highRiskKey: 'pirate_raids', midRiskKey: 'foreign_infiltration', lowRiskKey: 'pirate_raids' },
  { id: 'nasrin_spice_port', tag: '外邦试探', icon: 'fa-sun', color: 'text-amber-200', conditionId: 'foreign_route_ready', factionId: 'foreign', characterIds: ['ambassador_nasrin', 'mayor_bastien'], title: '沙海使团索要香料专港', desc: '娜丝琳希望为沙海香料在王港划出一段只由她的人管理的专港。', highText: '给她专港，先换通商繁荣。', midText: '给临时泊位，不给全套自治。', lowText: '让她照普通商船排队。', highRiskKey: 'foreign_infiltration', midRiskKey: 'port_smuggling', lowRiskKey: 'pirate_raids' },
  { id: 'otto_loan_fleet', tag: '外邦试探', icon: 'fa-ship', color: 'text-amber-300', conditionId: 'foreign_route_ready', factionId: 'foreign', characterIds: ['merchant_prince_otto', 'guildmaster_shen'], title: '外国商人想借船队押债', desc: '奥托提出替你偿一部分急债，但希望拿王国的三艘货船做抵押。', highText: '先押船，保证银子到手。', midText: '只拿两艘旧船做担保。', lowText: '先拖着，别让他看清家底。', highRiskKey: 'foreign_infiltration', midRiskKey: 'merchants_corruption', lowRiskKey: 'blackmail_letters' },
  { id: 'ivaan_bodyguard', tag: '外邦试探', icon: 'fa-user-shield', color: 'text-red-300', conditionId: 'border_cycle_ready', factionId: 'foreign', characterIds: ['mercenary_captain_ivaan', 'captain_rowan'], title: '灰旗佣兵想接宫廷护卫', desc: '伊瓦安说禁卫人手不稳，灰旗可以临时接一部分宫廷护卫差事。', highText: '让他们进来，先补夜间战力。', midText: '只让他们守外围，不碰内门。', lowText: '一句话回绝。', highRiskKey: 'military_overreach', midRiskKey: 'foreign_infiltration', lowRiskKey: 'mercenary_arrears' },
  { id: 'embassy_chapel', tag: '外邦试探', icon: 'fa-church', color: 'text-blue-200', conditionId: 'foreign_route_ready', factionId: 'foreign', characterIds: ['envoy_lucerne', 'bishop_aldous'], title: '使团想在都城自建礼拜所', desc: '外邦使团希望在都城自建礼拜所，声称只是为了让随员安心祈祷。', highText: '准了，用一块地换他们安静。', midText: '允许临时借用旧礼堂。', lowText: '宗教地界不让外人碰。', highRiskKey: 'clergy_unrest', midRiskKey: 'foreign_infiltration', lowRiskKey: 'clergy_unrest' },
  { id: 'northern_map', tag: '外邦试探', icon: 'fa-scroll', color: 'text-sky-200', conditionId: 'border_cycle_ready', factionId: 'foreign', characterIds: ['envoy_ashina', 'spymaster_ruan'], title: '北方使团想看旧边图', desc: '汗国使团借谈判之名，点名要看旧边境图册与几处驿站旧账。', highText: '给他们一套修过的图，先换口头缓和。', midText: '只给最无关紧要的几张。', lowText: '一张也不给。', highRiskKey: 'foreign_infiltration', midRiskKey: 'khan_war', lowRiskKey: 'khan_war' },
  { id: 'envoy_ransom', tag: '外邦试探', icon: 'fa-coins', color: 'text-amber-200', conditionId: 'foreign_route_ready', factionId: 'foreign', characterIds: ['ambassador_nasrin', 'envoy_vesper'], title: '外国商队扣下我方商人要赎金', desc: '两家外邦商队互相甩锅，最后把一批我方商人扣在港外，要求王室出面交赎金。', highText: '出钱赎人，先别让消息炸开。', midText: '谈个折价，再把人分批接回。', lowText: '让商会自己收尾。', highRiskKey: 'foreign_infiltration', midRiskKey: 'refugee_wave', lowRiskKey: 'port_smuggling' },
  { id: 'border_marriage', tag: '外邦试探', icon: 'fa-heart', color: 'text-pink-200', conditionId: 'foreign_route_ready', factionId: 'foreign', characterIds: ['envoy_lucerne', 'princess_margot'], title: '边境联姻的风声又起', desc: '外邦提议重开一桩边境联姻旧案，理由是“让孩子替大人们收拾烂摊子”。', highText: '先答应谈，别急着拍死。', midText: '只谈礼物与仪式，不谈婚约本身。', lowText: '把提案丢回去。', highRiskKey: 'succession_whispers', midRiskKey: 'foreign_infiltration', lowRiskKey: 'khan_war' },
];

const clergySeeds = [
  { id: 'bishop_relic', tag: '神权事务', icon: 'fa-church', color: 'text-blue-200', conditionId: 'clergy_cycle_ready', factionId: 'old_nobles', characterIds: ['bishop_aldous', 'queen_isabella'], title: '主教要你迎接圣髑', desc: '阿尔德斯主教坚持要你亲自迎接一批新到都城的圣髑，说这会让全城记住王权仍受神眷。', highText: '盛大迎接，把钟和火把都点亮。', midText: '礼要做，但仪式缩短一半。', lowText: '说你没空迎骨头。', highRiskKey: 'clergy_unrest', midRiskKey: 'clergy_unrest', lowRiskKey: 'heretic_fervor' },
  { id: 'abbess_soup', tag: '神权事务', icon: 'fa-bowl-food', color: 'text-emerald-200', conditionId: 'clergy_cycle_ready', factionId: 'old_nobles', characterIds: ['abbess_miriel', 'widow_ysolde'], title: '女修院粥棚要断粮', desc: '米莉艾尔修院长直说，粥棚再断一天，街上很快就会有人把修院也一起砸了。', highText: '给粮给木柴，让粥棚继续冒热气。', midText: '只保最穷的几处粥棚。', lowText: '让修院自己募捐。', highRiskKey: 'clergy_unrest', midRiskKey: 'harvest_shortfall', lowRiskKey: 'refugee_wave' },
  { id: 'prior_procession', tag: '神权事务', icon: 'fa-person-praying', color: 'text-blue-100', conditionId: 'clergy_cycle_ready', factionId: 'old_nobles', characterIds: ['prior_corvin', 'lord_pei'], title: '修士想办赎罪游行', desc: '科尔文修士想在都城办一场赎罪游行，说只要你肯露脸，民间的戾气会缓一阵。', highText: '你亲自参加，让所有人都看见。', midText: '派王后和主教代表露面。', lowText: '让修士自己走去。', highRiskKey: 'clergy_unrest', midRiskKey: 'funeral_omens', lowRiskKey: 'heretic_fervor' },
  { id: 'pilgrim_visions', tag: '神权事务', icon: 'fa-star', color: 'text-blue-200', conditionId: 'clergy_cycle_ready', factionId: 'old_nobles', characterIds: ['pilgrim_lark', 'bishop_aldous'], title: '巡礼者说看见圣井发光', desc: '拉克带着一批狂热信众，说郊外圣井发光，是王国该悔改的征兆。', highText: '让教会接管此事，别让民间自己长成风暴。', midText: '只准少量朝圣，其他人一律遣回。', lowText: '当成疯话，不许再提。', highRiskKey: 'heretic_fervor', midRiskKey: 'clergy_unrest', lowRiskKey: 'heretic_fervor' },
  { id: 'bell_tower', tag: '神权事务', icon: 'fa-bell', color: 'text-blue-100', conditionId: 'clergy_cycle_ready', factionId: 'old_nobles', characterIds: ['bishop_aldous', 'steward_cedric'], title: '主钟楼裂了一道缝', desc: '都城大钟楼木架开裂，若塌下来，砸的不止是砖石，还有你在民间最后那点体面。', highText: '立刻修，连铜钟都一起重铸。', midText: '先补木架，钟慢慢修。', lowText: '它站了几十年，再站几个月也行。', highRiskKey: 'funeral_omens', midRiskKey: 'clergy_unrest', lowRiskKey: 'funeral_omens' },
  { id: 'cemetery_plague', tag: '神权事务', icon: 'fa-skull-crossbones', color: 'text-gray-300', conditionId: 'clergy_cycle_ready', factionId: 'old_nobles', characterIds: ['prior_corvin', 'physician_lucan'], title: '城外墓园尸坑满了', desc: '城外墓园接连挖了几处新坑，修士和御医都觉得你最好尽快出手，不然会被人理解成天谴。', highText: '拨钱扩墓园并办净化礼。', midText: '先补一块地，仪式从简。', lowText: '让他们自己去埋。', highRiskKey: 'plague_whispers', midRiskKey: 'funeral_omens', lowRiskKey: 'plague_whispers' },
  { id: 'shrine_tithe', tag: '神权事务', icon: 'fa-hand-holding-dollar', color: 'text-amber-100', conditionId: 'clergy_cycle_ready', factionId: 'old_nobles', characterIds: ['abbess_miriel', 'guildmaster_shen'], title: '乡间小圣所拒交什一', desc: '几处乡间圣所开始拒交什一，说王国的税吏已经从穷人身上刮得太狠。', highText: '先减轻税，换他们重新归顺。', midText: '只豁免最穷的几处。', lowText: '强征，一分不能少。', highRiskKey: 'clergy_unrest', midRiskKey: 'clergy_unrest', lowRiskKey: 'heretic_fervor' },
  { id: 'saint_bones', tag: '神权事务', icon: 'fa-bone', color: 'text-gray-200', conditionId: 'clergy_cycle_ready', factionId: 'old_nobles', characterIds: ['bishop_aldous', 'prior_corvin'], title: '圣骨真伪起争议', desc: '一副新到都城的圣骨被怀疑是假的，修士、贵族和看热闹的人已经吵成一团。', highText: '公开验骨，哪怕得罪一批人。', midText: '低调处理，别把事情闹大。', lowText: '说真假都不重要。', highRiskKey: 'heretic_fervor', midRiskKey: 'clergy_unrest', lowRiskKey: 'court_scandal' },
];

const intrigueSeeds = [
  { id: 'sealed_blackmail', tag: '密谋暗线', icon: 'fa-envelope-open-text', color: 'text-violet-300', conditionId: 'intrigue_cycle_ready', characterIds: ['spymaster_ruan', 'archivist_renard'], title: '密探截到一封勒索信', desc: '罗德里克截到一封勒索信，信上同时牵扯到一名主教、一名军官和一位商会账房。', highText: '当场拆雷，把三边都叫来敲打。', midText: '先藏着信，换成你手里的筹码。', lowText: '把信塞回档案里。', highRiskKey: 'blackmail_letters', midRiskKey: 'blackmail_letters', lowRiskKey: 'court_scandal' },
  { id: 'borrowed_seal', tag: '密谋暗线', icon: 'fa-stamp', color: 'text-violet-200', conditionId: 'intrigue_cycle_ready', characterIds: ['lord_pei', 'chancellor_osmond'], title: '王印被人借去用了半夜', desc: '大印官发现王印昨夜被人私借出库，又完好无损地送了回来。最麻烦的是，你还不知道盖到了什么上。', highText: '立刻翻库查人，把昨夜出入全盘一遍。', midText: '只查最可疑的两条线。', lowText: '假装没看见，免得更多人紧张。', highRiskKey: 'blackmail_letters', midRiskKey: 'pretender_rumor', lowRiskKey: 'hand_power' },
  { id: 'corridor_whispers', tag: '密谋暗线', icon: 'fa-user-secret', color: 'text-violet-300', conditionId: 'intrigue_cycle_ready', characterIds: ['spymaster_ruan', 'chamberlain_viola'], title: '内廷走廊在传你的病情', desc: '女官长报告说，宫里近来不断有人低声讨论你是不是快撑不住了。', highText: '立刻露面并办几件狠事压住流言。', midText: '只挑几个人敲打一遍。', lowText: '传就传吧，谁还没点病。', highText: '立刻露面并办几件狠事压住流言。', midText: '只挑几个人敲打一遍。', lowText: '传就传吧，谁还没点病。', highRiskKey: 'succession_whispers', midRiskKey: 'court_scandal', lowRiskKey: 'succession_whispers' },
  { id: 'hidden_bastard', tag: '密谋暗线', icon: 'fa-baby', color: 'text-pink-200', conditionId: 'intrigue_cycle_ready', characterIds: ['lady_sybil', 'spymaster_ruan'], title: '有人在查一名私生子的来历', desc: '罗德里克说有人在都城里秘密追查一名“可能与王室有血缘”的孩子。真相不重要，流言本身就够危险。', highText: '先找到孩子，把话语权抓在手里。', midText: '让密探盯住消息源，别立刻动。', lowText: '别掺和这种脏事。', highRiskKey: 'succession_whispers', midRiskKey: 'blackmail_letters', lowRiskKey: 'pretender_rumor' },
  { id: 'masked_minstrel', tag: '密谋暗线', icon: 'fa-masks-theater', color: 'text-pink-300', conditionId: 'intrigue_cycle_ready', characterIds: ['lady_rosalind', 'spymaster_ruan'], title: '蒙面吟游者在酒会上唱影射曲', desc: '罗莎琳说昨夜酒会来了个蒙面吟游者，整晚都在唱“懒王、空库与假忠臣”的段子。', highText: '立刻把人抓来，顺藤摸幕后。', midText: '先禁唱那首曲，再查人。', lowText: '任他们唱，明天就会有别的段子。', highRiskKey: 'court_scandal', midRiskKey: 'blackmail_letters', lowRiskKey: 'court_scandal' },
  { id: 'chamber_poison', tag: '密谋暗线', icon: 'fa-wine-glass-empty', color: 'text-violet-200', conditionId: 'intrigue_cycle_ready', characterIds: ['physician_lucan', 'spymaster_ruan'], title: '酒窖里查出一批掺药葡萄酒', desc: '御医和密探同时确认，酒窖里有一批葡萄酒被人动过手脚，但还没查出本来想毒谁。', highText: '封酒窖换班，把所有钥匙全收回。', midText: '只封最可疑的一批酒。', lowText: '今晚别喝那桶就行。', highRiskKey: 'blackmail_letters', midRiskKey: 'court_scandal', lowRiskKey: 'funeral_omens' },
  { id: 'courier_cipher', tag: '密谋暗线', icon: 'fa-scroll', color: 'text-violet-300', conditionId: 'intrigue_cycle_ready', characterIds: ['spymaster_ruan', 'envoy_lucerne'], title: '驿骑身上带着双重密文', desc: '一名驿骑身上查出了双层密文，外面是普通税信，里面却提到了几名你最不想同框的人。', highText: '拆信追人，把整条线拔出来。', midText: '只留下密文，暂不惊动其他人。', lowText: '把信烧了，省得越看越多。', highRiskKey: 'foreign_infiltration', midRiskKey: 'blackmail_letters', lowRiskKey: 'hand_power' },
];

export const EXTRA_MORNING_EVENTS = [
  ...nobleSeeds.map((spec) => createEvent(spec, nobleDefaults)),
  ...councilSeeds.map((spec) => createEvent(spec, councilDefaults)),
  ...petitionSeeds.map((spec) => createEvent(spec, petitionDefaults)),
  ...militarySeeds.map((spec) => createEvent(spec, militaryDefaults)),
  ...merchantSeeds.map((spec) => createEvent(spec, merchantDefaults)),
  ...foreignSeeds.map((spec) => createEvent(spec, foreignDefaults)),
  ...clergySeeds.map((spec) => createEvent(spec, clergyDefaults)),
  ...intrigueSeeds.map((spec) => createEvent(spec, intrigueDefaults)),
];

const extraRiskSpecs = [
  { key: 'clergy_unrest', label: '教会不满蔓延', icon: 'fa-church', caution: 2, danger: 3, sourceText: '主教、修院和乡间圣所正在同步积累对王权的不满。', mitigationText: '及时回应教权面子与施济需求，避免让神权议题转成群众怒火。', warningText: '【警讯】城内多处钟楼在同一晚鸣响，教会正在准备公开对你的沉默或失德表态。', resultText: '【钟声逐王】主教与修院联合向城中宣讲你的失德。第二天清晨，连最温顺的人都开始用“天意”解释你的软弱。', statChanges: { authority: -12, favor: -10, stress: 8 } },
  { key: 'harvest_shortfall', label: '歉收阴影扩大', icon: 'fa-wheat-awn', caution: 2, danger: 3, sourceText: '磨坊、谷仓与乡村赋税的缺口正在汇成真正的荒年。', mitigationText: '优先保粮、修桥和缓税，别让短缺演成全面断供。', warningText: '【警讯】多郡来报冬粮不足，若再拖一夜，明日就会有人开始抢仓。', resultText: '【饥民焚仓】乡间饥民夜里点燃了几座谷仓，粮价与怨气一起窜上了都城。', statChanges: { treasury: -10, favor: -12, stress: 10 } },
  { key: 'mint_debasement', label: '货币成色崩坏', icon: 'fa-coins', caution: 2, danger: 3, sourceText: '铸币掺杂和票号抹账正在一起掏空市场信任。', mitigationText: '尽快整顿铸币与票号，否则王室钱币会先于王命失去信用。', warningText: '【警讯】市面上开始有人拒收新币，银匠和酒馆都在私下议论王币已经不值原价。', resultText: '【铜币如泥】新币成色丑闻在夜里爆开，商人只收旧银，百姓则把怒气全算到王室头上。', statChanges: { treasury: -14, authority: -8, favor: -6, stress: 8 } },
  { key: 'port_smuggling', label: '港口走私失控', icon: 'fa-anchor', caution: 2, danger: 3, sourceText: '码头、关吏与商船正一起把税和王令从海雾里漏出去。', mitigationText: '收敛层层盘剥并压住走私链，否则港口只会越来越像他人私产。', warningText: '【警讯】夜里有多艘无灯商船趁潮起离港，海关的人却像突然一起失明。', resultText: '【海关空壳】一整夜的走私让码头税银少了大半，王港的规矩也被人当成笑话。', statChanges: { treasury: -12, authority: -8, favor: -4, stress: 7 } },
  { key: 'wedding_debt', label: '婚盟开销失控', icon: 'fa-ring', caution: 2, danger: 3, sourceText: '婚宴、陪嫁和贵族排场正在把财政往礼数深坑里拖。', mitigationText: '别让宗亲婚盟无限加码，体面一旦脱离国库就是慢性自杀。', warningText: '【警讯】宗亲已经默认下一轮婚盟开支还会加码，今夜若没人踩刹车，明早请款就会排满御案。', resultText: '【婚宴压垮王座】婚盟账单在夜里滚成雪崩，连库房最深处都被翻得见底。', statChanges: { treasury: -16, authority: -4, stress: 9 } },
  { key: 'court_scandal', label: '宫廷丑闻四起', icon: 'fa-mask', caution: 2, danger: 3, sourceText: '后宫、酒宴和私德传闻正在同时侵蚀你的体面。', mitigationText: '少给流言素材，并及时切断最显眼的笑柄。', warningText: '【警讯】城里今夜最热的酒馆曲目已经开始影射你的寝宫和私生活。', resultText: '【床帷政变】丑闻在夜里传得满城都是，第二天连忠臣都不敢替你正面辩护。', statChanges: { authority: -14, favor: -8, stress: 8 } },
  { key: 'succession_whispers', label: '继承流言升温', icon: 'fa-crown', caution: 2, danger: 3, sourceText: '关于王储、私生血脉与王位后路的流言正在宫里发酵。', mitigationText: '尽快稳住王储安排和宗亲表态，别让“后路”比现在更像正路。', warningText: '【警讯】今夜宫中多处偏殿都在谈论“若王座忽然空出来，该由谁接印”。', resultText: '【幼狮夺印】继承流言在夜里拧成了派系动作，第二天早朝每个人都像在看一场未宣之变。', statChanges: { authority: -12, favor: -6, stress: 9 } },
  { key: 'border_bandits', label: '驿路盗匪猖獗', icon: 'fa-road', caution: 2, danger: 3, sourceText: '道路、边桥与粮道上的劫掠正在把地方秩序撕开口子。', mitigationText: '尽快修路护桥并压匪，否则地方会先于边军失去信心。', warningText: '【警讯】多处驿骑今夜未归，边桥与山路已经明显不再受控。', resultText: '【驿路尽断】山匪与私兵把几条主路同时掐断，税车与军报都被堵在夜色里。', statChanges: { treasury: -8, military: -8, favor: -8, stress: 8 } },
  { key: 'refugee_wave', label: '流民潮逼近', icon: 'fa-person-shelter', caution: 2, danger: 3, sourceText: '寒潮、饥荒与地方失序正在把越来越多的人赶向都城。', mitigationText: '提前安置并给最弱的人一口饭，否则流民会很快变成暴民。', warningText: '【警讯】今夜城外火光成片，越来越多的难民正沿着官道向都城挤来。', resultText: '【流民围宫】无处可去的人群在夜里涌到宫城外，哭号与石块一起砸向高墙。', statChanges: { treasury: -8, favor: -14, authority: -6, stress: 9 } },
  { key: 'pirate_raids', label: '海盗袭港传闻', icon: 'fa-ship', caution: 2, danger: 3, sourceText: '外海与沿岸防线正在对劫掠者露出越来越大的缝。', mitigationText: '修补舰队与港防，否则一晚风浪就够把海运打回原始。', warningText: '【警讯】夜里有多处灯塔失去回号，海上来的不是商船，就是海盗。', resultText: '【海盗封港】一支海盗船队趁夜袭港，火光映红了整片码头和税仓。', statChanges: { treasury: -13, military: -7, favor: -5, stress: 8 } },
  { key: 'plague_whispers', label: '疫病风声蔓延', icon: 'fa-skull-crossbones', caution: 2, danger: 3, sourceText: '热病、尸坑和冬寒正在一起把城市推向恐慌。', mitigationText: '尽快隔离、施药和安抚，否则流言会比病更快杀人。', warningText: '【警讯】今夜多处街巷都在焚醋和草药，百姓已经把咳血当成瘟疫前兆。', resultText: '【疫火焚城】热病与恐慌同时爆开，街区封锁、尸车与谣言让都城整夜不得安宁。', statChanges: { treasury: -9, favor: -13, authority: -5, stress: 10 } },
  { key: 'noble_feud', label: '贵族私斗升级', icon: 'fa-shield-halved', caution: 2, danger: 3, sourceText: '几家大族已经越来越习惯在你看不见的地方自己解决争端。', mitigationText: '尽快给出公断并压住私兵，否则贵族会把王都当成他们的决斗场。', warningText: '【警讯】今夜几家大族宅邸同时点兵，私下集结已经不像是在摆样子。', resultText: '【诸侯私战】贵族仇杀在夜里蔓延成街区冲突，王命第一次显得比家徽更轻。', statChanges: { authority: -13, military: -4, favor: -6, stress: 8 } },
  { key: 'blackmail_letters', label: '勒索密函横飞', icon: 'fa-envelope', caution: 2, danger: 3, sourceText: '掌印、契据和隐秘丑闻正在被人一点点做成套索。', mitigationText: '压住密函和假印链条，否则最先被勒死的是王权自己的信誉。', warningText: '【警讯】今夜多家府邸同时收到匿名信，几乎所有人都开始怀疑别人手里握着自己的把柄。', resultText: '【密函满城】密函在夜里成片流出，第二天早朝人人自危，王座反而像最先暴露的一环。', statChanges: { authority: -14, favor: -4, stress: 9 } },
  { key: 'canal_silt', label: '漕运脉络堵塞', icon: 'fa-water-ladder', caution: 2, danger: 3, sourceText: '运河、水闸和木桥的老问题正在一起把粮道卡死。', mitigationText: '抢修关键节点，别让漕运从“变慢”跨成“断掉”。', warningText: '【警讯】今夜多处漕船同时滞在浅滩，运河已经不是慢，而是快不动了。', resultText: '【漕河断脉】主运河在夜里彻底堵死，税粮、商货和军需全被拦在泥水里。', statChanges: { treasury: -12, favor: -6, stress: 8 } },
  { key: 'granary_rot', label: '粮仓霉烂失控', icon: 'fa-warehouse', caution: 2, danger: 3, sourceText: '谷仓盘点缺口与保管腐败正在一起把救命粮变成烂泥。', mitigationText: '尽快盘仓与清吏，否则明面有粮、实际无粮会比空仓更致命。', warningText: '【警讯】夜里多座谷仓飘出霉坏味，守仓人都不敢让你亲自去看。', resultText: '【腐粮之冬】仓里的粮在夜里被翻出大片霉烂，饥荒和丑闻一同扑向了王宫。', statChanges: { treasury: -10, favor: -10, authority: -5, stress: 9 } },
  { key: 'heretic_fervor', label: '异端狂热扩散', icon: 'fa-burn', caution: 2, danger: 3, sourceText: '圣迹、假骨与乡间狂热正在一起挑战正统教权与王权。', mitigationText: '及时控制朝圣与神迹叙事，别让信众自己把秩序重写。', warningText: '【警讯】城外几处篝火与祷声彻夜未熄，异端聚集已经不再掩饰。', resultText: '【异端火刑】狂热与镇压在夜里同时升级，火光照出的不是敬畏，而是分裂。', statChanges: { authority: -10, favor: -10, stress: 8 } },
  { key: 'mercenary_arrears', label: '雇兵欠饷躁动', icon: 'fa-swords', caution: 2, danger: 3, sourceText: '欠饷和空头承诺正在让最会打仗的一批人开始重新算价钱。', mitigationText: '早点给饷或尽快拆散他们，否则雇兵倒戈只差一夜。', warningText: '【警讯】灰旗营地今夜火把未灭，佣兵们正围着账簿和军旗争吵谁还该替你卖命。', resultText: '【雇兵倒戈】欠饷彻底压断了佣兵耐心，今夜先换方向的不是旗，而是刀尖。', statChanges: { treasury: -8, military: -12, authority: -6, stress: 9 } },
  { key: 'family_vengeance', label: '外戚记仇成势', icon: 'fa-dagger', caution: 2, danger: 3, sourceText: '被得罪的家族和外戚正在把每一次退让都记成账。', mitigationText: '别让婚盟、审判和封地旧账堆成一整张报复清单。', warningText: '【警讯】几家外戚今夜私下频繁换车换仆，摆明了不是在准备普通宴会。', resultText: '【外戚夜袭】积怨与羞辱终于在夜里找到了出口，先被撕开的不是门，而是彼此最后那层礼貌。', statChanges: { authority: -12, military: -4, favor: -6, stress: 9 } },
  { key: 'pretender_rumor', label: '伪王传闻抬头', icon: 'fa-user-crown', caution: 2, danger: 3, sourceText: '关于替身、私生子与另一位更像王的人选的故事正在野蛮生长。', mitigationText: '压住王位替代叙事，别让“更合适的人”从耳语长成旗号。', warningText: '【警讯】今夜城里冒出了几则相互印证的流言，全都在问：如果不是你，还有谁。', resultText: '【假王登门】流言在夜里长成了人和旗，第二天开始真有人敢拿“另一个王”当赌注。', statChanges: { authority: -15, favor: -4, stress: 9 } },
  { key: 'guild_monopoly', label: '行会垄断成型', icon: 'fa-scale-balanced', caution: 2, danger: 3, sourceText: '几家行会已经快把必需品与周转钱路都攥成一把。', mitigationText: '尽快拆垄断、限价或另开路数，否则你会发现国库在替他们打工。', warningText: '【警讯】今夜多类必需品价格同时异动，几家行会的手已经伸到百姓饭桌上。', resultText: '【黑市吞城】行会与黑市在夜里一起抬价，天亮时整座城都知道谁才掌握真正的生活必需。', statChanges: { treasury: -8, authority: -10, favor: -9, stress: 8 } },
  { key: 'funeral_omens', label: '不祥之兆流传', icon: 'fa-candle-holder', caution: 2, danger: 3, sourceText: '祭服、圣钟与宫廷流言正在一起把王朝包进不祥叙事里。', mitigationText: '及时修补礼制与神权观感，别让民间先相信你该倒霉。', warningText: '【警讯】今夜城里接连传出钟裂、烛灭与祭服见灰的消息，人人都在低声说不吉。', resultText: '【丧钟先鸣】一连串不祥征兆在夜里被讲成了定数，第二天连你的沉默都像是在默认。', statChanges: { authority: -11, favor: -6, stress: 8 } },
  { key: 'frontier_deserters', label: '边军逃散加剧', icon: 'fa-person-running', caution: 2, danger: 3, sourceText: '边军的寒、饿和倦已经开始比军纪更有说服力。', mitigationText: '尽快补给与轮换，否则逃兵会像裂口一样越撕越大。', warningText: '【警讯】今夜多座边堡清点人数都差了口子，越来越多人开始用脚投票。', resultText: '【军营成空】边军逃散在夜里成片蔓延，天亮时你才发现许多旗帐里只剩风声。', statChanges: { military: -14, authority: -5, stress: 9 } },
];

export const EXTRA_RISK_META = Object.fromEntries(extraRiskSpecs.map((spec) => [
  spec.key,
  {
    label: spec.label,
    icon: spec.icon,
    levels: {
      caution: spec.caution,
      danger: spec.danger,
    },
    sourceText: spec.sourceText,
    mitigationText: spec.mitigationText,
  },
]));

export const EXTRA_NIGHT_EVENTS = extraRiskSpecs.map((spec) => ({
  id: `n_${spec.key}`,
  riskKey: spec.key,
  warningThreshold: spec.caution,
  triggerThreshold: spec.danger,
  warningText: spec.warningText,
  effect: {
    statChanges: spec.statChanges,
    clearFlags: [spec.key],
  },
  resultText: spec.resultText,
}));

const failureOutcomes = [
  { id: 'f_stress_collapse', priority: 300, cause: '中风崩殂', title: '过劳死者', desc: '长期失控的压力最终在一个最无聊的清晨击中了你。史官后来写得很委婉，但所有人都知道你是被硬撑死的。', stressAtLeast: 100 },
  { id: 'f_bankrupt_riot', priority: 290, cause: '破产引发内乱', title: '乞丐王', desc: '国库空到连禁军的靴底都补不起时，最先冲进宫门的往往不是外敌，而是自己人和愤怒的百姓。', resourcesAtMost: { treasury: 0 } },
  { id: 'f_hand_usurp', priority: 280, cause: '权臣逼宫', title: '傀儡', desc: '当权威跌到地板以下，真正决定你命运的就不再是王冠，而是谁离御座最近。', resourcesAtMost: { authority: 0 } },
  { id: 'f_city_falls', priority: 270, cause: '外敌破城', title: '亡国之君', desc: '军力被掏空以后，城墙、号角和王命都只能算装饰。敌军进城时，连你自己都知道这一天迟早会来。', resourcesAtMost: { military: 0 } },
  { id: 'f_revolution', priority: 260, cause: '大革命', title: '断头台贵宾', desc: '民心被透支干净以后，所谓秩序只剩下站在街上的人愿不愿意继续忍你。那一夜，他们决定不忍了。', resourcesAtMost: { favor: 0 } },
  { id: 'f_hand_decree', priority: 250, cause: '相府夜诏', title: '空印国王', desc: '相府在夜里替你写好了退位诏，连王印都替你盖好了。你第二天醒来时，王位已经比你先一步换了主人。', phase: 'night', minDay: 6, flagsAtLeast: { hand_power: 4 }, resourcesAtMost: { authority: 35 } },
  { id: 'f_south_breakaway', priority: 249, cause: '南境自立', title: '失土之王', desc: '南方总督不再愿意装臣子，独立檄文和税仓火光一起把你的疆界烧薄了一圈。', phase: 'night', minDay: 6, flagsAtLeast: { southern_mess: 3 }, resourcesAtMost: { favor: 35 } },
  { id: 'f_wolf_banner', priority: 248, cause: '狼旗入城', title: '城门弃守者', desc: '汗国战旗最终还是出现在了城门上。你不是不知道会来，只是总想着也许还能再拖一晚。', phase: 'night', minDay: 6, flagsAtLeast: { khan_war: 2 }, resourcesAtMost: { military: 35 } },
  { id: 'f_orders_collide', priority: 247, cause: '百令相冲', title: '乱章之主', desc: '互相打架的政令把整个行政体系扯成了线团。没人再知道该听谁，最后谁都不听了。', phase: 'night', minDay: 5, flagsAtLeast: { messy_admin: 5 }, resourcesAtMost: { authority: 30 } },
  { id: 'f_noble_draining', priority: 246, cause: '宗室分财', title: '礼制俘虏', desc: '宗亲和体面开销终于把库房最后一层也刮干净。你保住了排场，却把王朝本人卖进了礼单。', phase: 'night', minDay: 6, flagsAtLeast: { nobles_excess: 3 }, resourcesAtMost: { treasury: 25 } },
  { id: 'f_gates_taken', priority: 245, cause: '宫门换主', title: '失门之君', desc: '几道宫门在同一夜改听别人的口令。你还坐在王座上，却已经不是宫城真正的主人。', phase: 'night', minDay: 6, flagsAtLeast: { military_overreach: 3 }, resourcesAtMost: { authority: 30 } },
  { id: 'f_ledger_devours', priority: 244, cause: '黑账噬主', title: '账本祭品', desc: '商会早就准备好了把责任全丢给朝廷的账目。天亮后每张假账都盖着你的名义。', phase: 'night', minDay: 6, flagsAtLeast: { merchants_corruption: 3 }, resourcesAtMost: { authority: 30 } },
  { id: 'f_border_sold', priority: 243, cause: '边关被卖', title: '关牒上的败王', desc: '你让外人太早看清了边关和税路。等他们真把手伸进去时，王国已经没有把他们推回去的力气。', phase: 'night', minDay: 6, flagsAtLeast: { foreign_infiltration: 3 }, resourcesAtMost: { military: 35 } },
  { id: 'f_bells_exile', priority: 242, cause: '钟声逐王', title: '被绝罚者', desc: '当钟声开始替教会宣判你时，宫廷与市民忽然都学会了用同一个词形容你：该退场的人。', phase: 'night', minDay: 6, flagsAtLeast: { clergy_unrest: 3 }, resourcesAtMost: { favor: 35 } },
  { id: 'f_hungry_flames', priority: 241, cause: '饥民焚都', title: '空仓守夜人', desc: '饥荒真正抵达都城时，木门、仓房和你的名声一样易燃。那一夜，火比诏令更有说服力。', phase: 'night', minDay: 6, flagsAtLeast: { harvest_shortfall: 3 }, resourcesAtMost: { treasury: 30 } },
  { id: 'f_bad_coin', priority: 240, cause: '铜币如泥', title: '坏钱之王', desc: '你的钱先死了，接着才轮到你的命令失效。等百姓开始拿王币当笑话时，王座其实已经塌了一半。', phase: 'night', minDay: 5, flagsAtLeast: { mint_debasement: 3 }, resourcesAtMost: { treasury: 20 } },
  { id: 'f_wedding_crush', priority: 238, cause: '婚宴压垮王座', title: '嫁妆债人', desc: '你本以为花钱买体面至少能延长统治，结果婚盟账单却成了压断王座最贵的一根木梁。', phase: 'night', minDay: 5, flagsAtLeast: { wedding_debt: 3 }, resourcesAtMost: { treasury: 25 } },
  { id: 'f_bedcurtain_coup', priority: 237, cause: '床帷政变', title: '笑柄君主', desc: '后宫笑谈、酒会段子和街头小曲终于合成同一种声音：没人再认真把你当成王。', phase: 'night', minDay: 5, flagsAtLeast: { court_scandal: 3 }, resourcesAtMost: { authority: 25 } },
  { id: 'f_cub_takes_seal', priority: 236, cause: '幼狮夺印', title: '被后路取代者', desc: '一旦所有人都开始认真讨论“如果换个人会不会更好”，王位就已经先在想象里完成了易手。', phase: 'night', minDay: 6, flagsAtLeast: { succession_whispers: 3 }, resourcesAtMost: { authority: 30 } },
  { id: 'f_road_cut', priority: 235, cause: '驿路尽断', title: '断桥王', desc: '当道路、边桥和驿站一起不再向你回话时，失控的不只是物流，还有整个国家的神经。', phase: 'night', minDay: 5, flagsAtLeast: { border_bandits: 3 }, resourcesAtMost: { military: 30 } },
  { id: 'f_refugee_siege', priority: 234, cause: '流民围宫', title: '高墙囚徒', desc: '成群的难民把王宫围成了孤岛，而你连给他们一个明天的样子都拿不出来。', phase: 'night', minDay: 5, flagsAtLeast: { refugee_wave: 3 }, resourcesAtMost: { favor: 30 } },
  { id: 'f_pirates_close', priority: 233, cause: '海盗封港', title: '失潮之王', desc: '港口一被火封，王国就像突然失去了一只手。你不是被海盗打败，而是被自己长期的将就淹死。', phase: 'night', minDay: 5, flagsAtLeast: { pirate_raids: 3 }, resourcesAtMost: { treasury: 25 } },
  { id: 'f_plague_fire', priority: 232, cause: '疫火焚城', title: '瘟雾里的陛下', desc: '热病、尸车和封街令让整座都城在一夜之间认不出自己，也认不出你。', phase: 'night', minDay: 5, flagsAtLeast: { plague_whispers: 3 }, resourcesAtMost: { favor: 25 } },
  { id: 'f_lords_duel', priority: 231, cause: '诸侯私战', title: '无裁王', desc: '当贵族开始自己决定谁活谁死时，王权就成了几场私斗之间最没分量的观众。', phase: 'night', minDay: 6, flagsAtLeast: { noble_feud: 3 }, resourcesAtMost: { authority: 25 } },
  { id: 'f_canal_break', priority: 229, cause: '漕河断脉', title: '泥水王', desc: '漕运一断，粮、税、兵和谣言同时卡住。王都活着，王朝却开始缺氧。', phase: 'night', minDay: 5, flagsAtLeast: { canal_silt: 3 }, resourcesAtMost: { treasury: 25 } },
  { id: 'f_rotten_winter', priority: 228, cause: '腐粮之冬', title: '烂仓君主', desc: '你以为自己还有粮，只是没想到那粮先一步烂掉了。人最恨的从来不是贫穷，而是被糊弄。', phase: 'night', minDay: 5, flagsAtLeast: { granary_rot: 3 }, resourcesAtMost: { favor: 30 } },
  { id: 'f_heresy_fires', priority: 227, cause: '异端火刑', title: '被神弃者', desc: '狂热与镇压一起失控的夜晚，火烧掉的不只是异端，也烧掉了所有人对你还能掌局的幻想。', phase: 'night', minDay: 6, flagsAtLeast: { heretic_fervor: 3 }, resourcesAtMost: { favor: 25 } },
  { id: 'f_mercs_turn', priority: 226, cause: '雇兵倒戈', title: '付不起价的国王', desc: '当雇兵发现王室信用还不如别人的钱袋时，他们转身的速度比誓言还快。', phase: 'night', minDay: 5, flagsAtLeast: { mercenary_arrears: 3 }, resourcesAtMost: { military: 25 } },
  { id: 'f_inlaw_strike', priority: 225, cause: '外戚夜袭', title: '家门之敌', desc: '最熟悉宫里道路的人，往往不是你的敌人，而是曾经和你同桌吃过饭的人。', phase: 'night', minDay: 6, flagsAtLeast: { family_vengeance: 3 }, resourcesAtMost: { authority: 25 } },
  { id: 'f_false_king', priority: 224, cause: '假王登门', title: '被影子替代者', desc: '流言最终找到了一个能被拥上来的脸。真正可怕的从来不是那个人，而是所有人都突然觉得他也不是不行。', phase: 'night', minDay: 6, flagsAtLeast: { pretender_rumor: 3 }, resourcesAtMost: { authority: 20 } },
];

const victoryOutcomes = [
  { id: 'v_stayed_on_throne', priority: 60, isVictory: true, cause: '王冠仍在', title: '风暴续命者', desc: '你没有让这个王国变得神圣，只是让它继续站着。对这样一副烂摊子而言，这已经足够算赢。', phase: 'night', minDay: 12, stressAtMost: 70, resourcesAtLeast: { treasury: 55, authority: 55, military: 55, favor: 55 }, maxTotalRisk: 8 },
  { id: 'v_restored_crown', priority: 59, isVictory: true, cause: '王冠仍在', title: '风暴续命者', desc: '你没有让这个王国变得神圣，只是让它继续站着。对这样一副烂摊子而言，这已经足够算赢。', phase: 'night', minDay: 12, stressAtMost: 78, resourcesAtLeast: { authority: 75, favor: 65, treasury: 35 }, factionsAtLeast: { old_nobles: 5 }, flagsAtMost: { court_scandal: 2, clergy_unrest: 2, succession_whispers: 2 } },
  { id: 'v_smoke_and_silver', priority: 58, isVictory: true, cause: '雾中分账', title: '浑水掌柜', desc: '你既没有让所有人满意，也没有让任何一方彻底看清底牌。银子、谎言和交易一起替你买到了真正的活路。', phase: 'night', minDay: 12, stressAtMost: 82, resourcesAtLeast: { treasury: 65, authority: 35 }, factionsAtLeast: { merchants: 5, foreign: 4 }, maxTotalRisk: 11 },
  { id: 'v_smoke_and_silver_alt', priority: 57, isVictory: true, cause: '雾中分账', title: '浑水掌柜', desc: '你既没有让所有人满意，也没有让任何一方彻底看清底牌。银子、谎言和交易一起替你买到了真正的活路。', phase: 'night', minDay: 14, stressAtMost: 80, resourcesAtLeast: { treasury: 58, favor: 45 }, flagsAtMost: { foreign_infiltration: 2, merchants_corruption: 2, blackmail_letters: 2 }, factionsAtLeast: { merchants: 4 } },
  { id: 'v_iron_compromise', priority: 56, isVictory: true, cause: '铁旗下的太平', title: '缰绳共主', desc: '你用军粮、哨塔和几次足够硬的决断换来了边境平静。代价很大，但至少这一次，刀柄还握在你手里。', phase: 'night', minDay: 12, stressAtMost: 82, resourcesAtLeast: { military: 75, treasury: 45, authority: 45 }, factionsAtLeast: { military: 5 }, maxTotalRisk: 10 },
  { id: 'v_iron_compromise_alt', priority: 55, isVictory: true, cause: '铁旗下的太平', title: '缰绳共主', desc: '你用军粮、哨塔和几次足够硬的决断换来了边境平静。代价很大，但至少这一次，刀柄还握在你手里。', phase: 'night', minDay: 14, stressAtMost: 85, resourcesAtLeast: { military: 68, authority: 60, favor: 45 }, flagsAtMost: { frontier_deserters: 2, mercenary_arrears: 2, khan_war: 1 }, factionsAtLeast: { military: 4 } },
];

export const OUTCOME_RULES = [...failureOutcomes, ...victoryOutcomes];
export const FAILURE_OUTCOME_CATALOG = failureOutcomes.map(({ id, cause, title, desc }) => ({ id, cause, title, description: desc }));
export const VICTORY_OUTCOME_CATALOG = [
  ...new Map(victoryOutcomes.map(({ cause, title, desc }) => [cause, { id: cause, cause, title, description: desc }])).values(),
];