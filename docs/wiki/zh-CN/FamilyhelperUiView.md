# Familyhelper UI View - 前端 view 模块导读

`familyhelper-ui-view` 是家庭助手在**浏览器侧界面**的源码工程：
以 pnpm monorepo 组织多个可复用组件包与多个完整 Web 应用（PC / 移动端）。
它与仓库根目录下的 Maven 工程、`docs/wiki` 中“从源码编译、打包分发、Tomcat 部署”类文档**互为补充**——本文只做**导读**，
不替代上述运维向说明；具体命令行与初始化步骤以该目录内说明为准。

## 仓库内结构

工程根目录下主要包含 `packages`（各 npm 包）与 `scripts`（跨包构建等脚本）。`packages` 中大致分为两类：

- **component-xxx**：可被多个应用复用的能力封装（组件、API 客户端等），包与包之间可能存在依赖关系。
- **webapp-xxx**：面向终端用户的完整应用，通常依赖若干 `component-*`；一般而言 **webapp 之间彼此不依赖**。

极简示意：

```
.（familyhelper-ui-view 根目录）
├── packages/     — monorepo 子包
└── scripts/      — 构建与相关脚本
```

构建编排与多包构建顺序由 `scripts` 侧脚本负责；原理与调度细节见
[VIM 5 构建脚本与 build.js](./FamilyhelperUiViewBuildScript.md)。

## 子包一览

下列子包以导读为目的各作一句说明（版本与依赖树请参阅各包内 `package.json`）：

- **component-api**：面向后端的 API 访问与其它通用接口层能力的聚合包。
- **component-ckeditor**：富文本编辑器（CKEditor）相关封装。
- **component-iconfont**：图标字体资源的封装与使用约定。
- **component-util**：通用工具与辅助能力。
- **webapp-pc**：PC 端完整 Web 应用。
- **webapp-mobile**：移动端完整 Web 应用。

## 技术栈与工程化（导读）

应用技术以 **Vue 3** 为基础；
仓库根 `README` 中提到的 **vim（Vue Interactive Model）** 是本项目在交互与视图组织上的自研模型，旨在统一应用内开发体验。
包管理**仅**使用 **pnpm workspace**；全仓构建依赖仓库根目录提供的脚本（如 `pnpm run build`）， 
以正确处理组件包与 webapp 之间的产物依赖。
vim 的设计理念、扩展方式、与路由或 Store 的分工等，**不在本文展开**。

## 本地上手线索

推荐阅读顺序：进入 `familyhelper-ui-view` 目录后，先按该目录文档完成依赖安装与**全量构建**，
再在具体 `webapp-*` 包内进行开发或本地预览。
原因是部分 webapp 会直接依赖组件包**已构建产物**；跳过全量构建可能导致 `serve` 等行为异常。
**具体命令（含 `pnpm install --frozen-lockfile`、必须使用 pnpm 的约定等） 一律以模块内部的 `README.md` 为准**。

## 构建脚本维护约定

若修改 `scripts/` 下的脚本，需按该工程约定使用 Prettier 做格式检查与修正（命令见模块内部的 `README.md` 中“构建脚本格式化”一节）。
