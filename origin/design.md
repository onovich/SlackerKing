项目交接文档：《王冠之重：庸君生存指南》

1. 项目概览 (Project Overview)

项目中文名: 王冠之重：庸君生存指南

项目英文名: The Weight of the Crown: Survival Guide of a Slacker King

当前版本: V2 (Fixed)

项目类型: Web端单机文字角色扮演/资源管理游戏

核心玩法: 扮演一位不想揽事、渴望享乐的庸君。通过平衡四项国家资源、控制个人的“压力”与“精力”，在暗流涌动的宫廷和外交危机中尽可能长久地活下去。

2. 需求设计文档 (Requirement & Design)

2.1 核心循环 (Core Loop)

游戏以“天”为单位，分为三个阶段：

晨间理政 (Morning)：处理一件随机触发的宫廷事件或奏章。选项会消耗“精力 (Energy)”，不同的选择会立即改变国家资源，或埋下隐蔽的“状态标记 (Flags)”。

自由巡幸 (Afternoon)：玩家拥有2点“行动力 (AP)”，在宫廷的各个区域（寝宫、庄园、暗室等）进行交互，主要用于恢复精力、降低压力或打探情报。

深夜结算 (Night)：系统清算当天的日常消耗，并检查隐藏的“状态标记 (Flags)”。如果某项隐患积累到爆发阈值，将触发惩罚性甚至毁灭性的夜间突发事件。

2.2 核心数值系统

国家资源 (0-100)：国库 (Treasury)、权威 (Authority)、军力 (Military)、民心 (Favor)。任何一项降至0均会导致对应的Game Over结局（破产、逼宫、外敌、暴动）。

君主状态：

压力 (Stress)：0-100。达到100会触发“中风崩殂”结局。只能通过午后享乐或推卸责任降低。

精力 (Energy)：每日早晨重置为100。负责任的决策会大量消耗精力，精力不足时只能选择风险极高的“糊弄”选项。

3. 开发文档 (Development Guide)

3.1 技术栈与架构

单文件架构：为保证极致的便携性，所有 HTML、CSS 和 JavaScript 均集中在单一的 .html 文件中。无构建工具要求。

UI 框架：使用 Tailwind CSS (CDN引入) 进行原子化样式控制，快速实现响应式布局。

图标库：依赖 FontAwesome 6.4.0 (CDN引入) 提供界面图标。

3.2 状态管理 (State Management)

游戏的核心数据存储在全局对象 state 中：

const state = {
    day: 1,                 // 当前生存天数
    phase: 'morning',       // 当前阶段 (morning, afternoon, night)
    resources: { ... },     // 四项国家资源
    player: { ... },        // 压力、精力、行动力
    flags: {},              // 【核心】蝴蝶效应标记。键值对，用于计时或状态判断
    history: [],            // 事件历史记录，防止短期内重复触发同一事件
    isGameOver: false,      // 游戏结束标志
    traits: { ... }         // 君主特质（为后续扩展预留）
};


3.3 事件系统 (Event System)

所有的晨间奏章都定义在 eventDatabase 数组中。每个事件包含：

condition: 触发条件函数（例如依赖某个 flag 或 资源阈值）。

weight: 抽取权重。

choices: 玩家可选项数组。包含文本、精力消耗 (energy)、前置条件 (req) 和执行效果 (effect)。

夜间结算系统 nightEvents 用于拦截 state.flags 中累积的变量，并在条件满足时抛出惩罚性事件。

3.4 关键机制说明 & 历史Bug提示

漂浮文字动画：使用了 DOM 动态创建绝对定位元素并配合 CSS @keyframes 实现扣除精力的视觉反馈。

UI 防误触：在选项点击后会 disabled 所有按钮以防连点。

【已修复Bug】地点点击失效：此前存在进入第二天下午后地点无法点击的问题。已在 renderLocations() 函数开头通过 grid.classList.remove('opacity-50', 'pointer-events-none'); 清理残留类名完成修复。

4. 美术约束与规范 (Art & Style Constraints)

色彩基调 (Palette)：

整体背景：极暗的冷色调（如 #12141a），模拟中世纪宫廷夜晚。

卡片与羊皮纸：深灰色至藏青色渐变 (#2a303c 至 #191e24)。

资源强调色：国库（黄色 #eab308）、权威（紫色 #a855f7）、军力（红色 #dc2626）、民心（绿色 #22c55e）。

字体 (Typography)：全局主要使用带衬线体 'Georgia', serif，增加历史厚重感与史诗感。数值部分使用等宽字体。

动画视觉效果：

资源受损过重时，使用红屏闪烁 (.damage-flash)。

数值极低（<20）时，进度条使用心跳呼吸动画 (animate-pulse) 以示警告。

文案风格：带有强烈的“黑色幽默”与“讽刺”意味。描述需生动体现君主的庸碌与宫廷的虚伪。

5. TODO (未来开发计划)

当前版本已具备完整的核心循环，后续迭代可考虑以下方向：

事件库扩充 (Content Expansion)：

添加更多针对特定派系（如教会、商会）的连环事件。

增加君主年龄增长带来的随机特质变化（如“痛风”导致无法去猎场）。

持久化存储 (Save/Load System)：

引入 localStorage，在每晚结算后自动保存 state 对象，允许玩家刷新页面后继续游戏。

音效与音乐 (Audio Integration)：

添加中世纪风格的环境白噪音（如壁炉燃烧声、人群嘈杂声）。

添加关键操作的音效（如金币碰撞声、盖章声、利刃出鞘声）。

UI 动效优化 (Polishing)：

将事件面板的切换从简单的淡入淡出升级为更具物理质感的“羊皮纸翻页”效果。

图鉴与成就系统 (Achievements)：

记录玩家解锁的不同死法和坚持的最长天数。

6. 项目启动方式 (How to Start)

本项目为纯前端单文件应用，零外部环境依赖。

运行与测试：直接双击 Crown_Weight_V2_Fixed.html 文件，使用任何现代浏览器（Chrome, Edge, Firefox, Safari等）打开即可游玩。

修改代码：使用 VS Code、Sublime Text 或任意代码编辑器打开 .html 文件即可直接编辑逻辑与样式。由于依赖了 Tailwind 的 CDN，开发时请确保设备已连接互联网以便加载样式库和图标库。