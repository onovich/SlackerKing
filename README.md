# SlackerKing
SlackerKing is a Vite + React refactor of the original single-file court survival prototype, prepared for GitHub Pages deployment and future Unity-friendly logic migration.<br/>**SlackerKing 是原始单文件宫廷生存原型的 Vite + React 重构版本，已准备好 GitHub Pages 部署，并为后续向 Unity 友好的逻辑迁移打下基础。**

## Overview
- Survive as a pleasure-seeking ruler by balancing treasury, authority, military strength, public favor, stress, and daily energy across morning policy, afternoon leisure, and night settlement loops.<br/>**你将扮演一位沉迷享乐的君主，在晨间理政、午后巡幸与夜间结算的循环中平衡国库、权威、军力、民心、压力与每日精力。**
- The original prototype is preserved in [origin/index.html](origin/index.html), while the active app now lives in the Vite entry and modular `src/` layers.<br/>**原始原型仍保留在 [origin/index.html](origin/index.html) 中，当前可维护版本则迁移到了 Vite 入口与模块化 `src/` 分层。**

## Architecture
- Core data tables live in [src/data/gameContent.js](src/data/gameContent.js), rule resolution and state transitions live in [src/logic/engine/gameEngine.js](src/logic/engine/gameEngine.js), and React only handles hook orchestration plus UI assembly under [src/view](src/view).<br/>**核心数据表位于 [src/data/gameContent.js](src/data/gameContent.js)，规则结算与状态推进位于 [src/logic/engine/gameEngine.js](src/logic/engine/gameEngine.js)，React 仅负责 Hook 编排与 [src/view](src/view) 下的界面组装。**
- This repository now has the required migration-oriented folders: `src/data/`, `src/logic/engine/`, `src/logic/hooks/`, `src/view/screens/`, and `src/view/components/`.<br/>**当前仓库已建立迁移导向所需目录：`src/data/`、`src/logic/engine/`、`src/logic/hooks/`、`src/view/screens/` 与 `src/view/components/`。**
- The current refactor focuses on extracting rules and screens without claiming a completed Unity port; the engine boundary is in place for later C# or ECS mapping.<br/>**当前重构重点是抽离规则与界面，而不是声称已完成 Unity 移植；不过 engine 边界已经建立，后续可映射到 C# 或 ECS。**

## Setup
- Install dependencies with `npm install`.<br/>**使用 `npm install` 安装依赖。**
- Start local development with `npm run dev`.<br/>**使用 `npm run dev` 启动本地开发。**
- Create a production build with `npm run build`.<br/>**使用 `npm run build` 生成生产构建。**

## Deployment
- GitHub Pages deployment is automated by [\.github/workflows/deploy.yml](.github/workflows/deploy.yml), and Vite is configured with the repository base path in [vite.config.js](vite.config.js).<br/>**GitHub Pages 部署已由 [\.github/workflows/deploy.yml](.github/workflows/deploy.yml) 自动化处理，Vite 也已在 [vite.config.js](vite.config.js) 中配置仓库子路径 base。**
- After pushing to `main`, set `Settings -> Pages -> Source` to `GitHub Actions` in the GitHub repository.<br/>**推送到 `main` 后，请在 GitHub 仓库中将 `Settings -> Pages -> Source` 切换为 `GitHub Actions`。**
- The expected Pages URL is `https://onovich.github.io/SlackerKing/`.<br/>**预期的 Pages 地址为 `https://onovich.github.io/SlackerKing/`。**

## Planning Docs
- See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the active execution roadmap.<br/>**当前执行路线图见 [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)。**
- See [docs/PHASE_1_READABILITY_SPEC.md](docs/PHASE_1_READABILITY_SPEC.md) for the current readability and UX baseline spec.<br/>**当前阶段的信息可读性与体验基线规格见 [docs/PHASE_1_READABILITY_SPEC.md](docs/PHASE_1_READABILITY_SPEC.md)。**
- See [docs/PHASE_2_NUMERIC_SPEC.md](docs/PHASE_2_NUMERIC_SPEC.md) for the numeric responsibility and progression spec.<br/>**当前数值职责与进程曲线规格见 [docs/PHASE_2_NUMERIC_SPEC.md](docs/PHASE_2_NUMERIC_SPEC.md)。**
- See [docs/PHASE_3_FACTION_SPEC.md](docs/PHASE_3_FACTION_SPEC.md) for the faction-route and event-chain expansion spec.<br/>**当前阶段的派系路线与事件链扩充规格见 [docs/PHASE_3_FACTION_SPEC.md](docs/PHASE_3_FACTION_SPEC.md)。**