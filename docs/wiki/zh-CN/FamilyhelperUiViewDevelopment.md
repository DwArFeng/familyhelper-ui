# Familyhelper UI View - 本地开发指南

本文面向 `familyhelper-ui-view` 的前端开发人员，
说明前端 monorepo 的环境准备、项目初始化、配置生成、全量构建、单包开发和代码检查流程。

本文与 [Familyhelper UI View - 前端 view 模块导读](./FamilyhelperUiView.md) 配合使用：
前者负责本地开发操作，后者负责模块定位、子包划分和阅读顺序。
VIM 模块的架构与职责边界见 [VIM Architecture - 总体架构说明](./VimArchitecture.md)，
多包构建脚本的调度原理见 [Familyhelper UI View - VIM 5 构建脚本与 `build.js` 原理](./FamilyhelperUiViewBuildScript.md)。

## 适用范围

本文适用于 `familyhelper-ui-view` monorepo 及其 `packages/*` 工作区，
包括以下组件包和 Web 应用：

- `component-api`：API 请求和相关类型、工具能力。
- `component-ckeditor`：CKEditor 相关组件和本地演示页面。
- `component-iconfont`：图标字体资源及示例代码。
- `component-util`：通用工具能力。
- `webapp-pc`：PC 端完整 Web 应用。
- `webapp-mobile`：移动端完整 Web 应用。

本文不覆盖 Maven 分发、WAR 文件装配、Tomcat 部署及部署后的初始化检查。
这些内容属于仓库根工程和分发模块的文档范围。

## 环境要求

### 包管理器

项目使用 pnpm workspace 管理依赖，
根工程 `package.json` 将包管理器固定声明为 `pnpm@9.12.3`。
因此，执行本文命令时应使用根工程声明的 pnpm 版本。

项目同时提交了 `pnpm-lock.yaml`，其锁文件格式为 pnpm `9.0`。
依赖安装必须遵守锁文件，避免本地解析出与仓库不一致的依赖树。

本项目不能使用 npm 或 yarn 替代 pnpm 安装依赖。
原因是工作区由 `pnpm-workspace.yaml` 管理，
各 Web 应用还通过 `workspace:*` 依赖引用仓库内的组件包。

### Node.js 与 TypeScript

项目未在 `package.json` 中声明 `engines` 字段，
因此本文不把 Node.js 22 作为硬性运行时版本要求。

不过，多个 TypeScript 配置文件引用了 `@tsconfig/node22`，
并使用 Node.js 类型定义；实际开发环境应使用能够正常运行当前 Node.js 工具链和依赖的 Node.js 版本。

### 辅助工具

代码检查依赖各子包已经声明的 Prettier、ESLint、TypeScript、`tsc` 或 `vue-tsc`。
这些工具通过 pnpm 安装到工作区，不需要单独全局安装。

## 项目结构

`familyhelper-ui-view` 的主要结构如下：

```text
. - familyhelper-ui-view 根目录
├── packages/                 - pnpm workspace 子包
│   ├── component-api/        - API 组件包
│   ├── component-ckeditor/   - CKEditor 组件包
│   ├── component-iconfont/   - 图标字体组件包
│   ├── component-util/       - 通用工具组件包
│   ├── webapp-mobile/        - 移动端 Web 应用
│   └── webapp-pc/            - PC 端 Web 应用
├── scripts/                  - 根工程配置生成、构建和检查脚本
├── package.json              - 根工程脚本及 pnpm 版本声明
├── pnpm-workspace.yaml       - workspace 范围配置
├── pnpm-lock.yaml            - 依赖锁文件
└── scripts-config.json       - 根工程脚本配置，运行时生成
```

各子包通常包含以下目录或文件：

- `src/`：组件包或 Web 应用的源码。
- `scripts/`：该包的配置生成、开发、构建和检查脚本。
- `package.json`：该包的脚本、依赖和包管理器声明。
- `scripts-config.json`：该包的本地脚本配置，生成后不提交到版本库。
- `dist/`：Web 应用构建后的静态文件目录，仅由声明 `build` 脚本的应用包生成。

`packages/*` 是 workspace 的实际范围。
根工程脚本会扫描其中同时具备目录属性和 `package.json` 的子目录，再根据包名和依赖关系调度各子包脚本。

## 项目初始化

首次获取源码后，建议在 `familyhelper-ui-view` 根目录依次执行依赖安装、配置生成和全量构建。
进入目录后执行：

```shell
pnpm install --frozen-lockfile
pnpm run generate-config
pnpm run build
```

其中，`pnpm install --frozen-lockfile` 保证安装过程使用现有锁文件。
`pnpm run generate-config` 生成根工程和各子包的本地脚本配置。
`pnpm run build` 按 workspace 依赖关系执行具备 `build` 脚本的子包。

初始化完成后，再进入 `packages/webapp-pc` 或 `packages/webapp-mobile` 启动开发服务器。
根工程 README 明确要求安装依赖后执行全量构建，因为 Web 应用的首次启动需要完成当前工程约定的构建准备。

### 安装依赖

在 `familyhelper-ui-view` 根目录执行：

```shell
pnpm install --frozen-lockfile
```

`--frozen-lockfile` 会要求 `package.json` 与 `pnpm-lock.yaml` 保持一致。
如果依赖声明已经发生变化，不能通过忽略锁文件的方式继续安装，应先确认依赖变更是否属于当前开发任务，再按项目约定更新锁文件。

不要在 monorepo 根目录执行 `npm install` 或 `yarn install`。
这会绕过项目规定的 pnpm workspace 安装流程，并可能导致 `workspace:*` 依赖、锁文件和 `node_modules` 链接状态不一致。

### 生成配置

在 `familyhelper-ui-view` 根目录执行：

```shell
pnpm run generate-config
```

根工程脚本会先生成根目录的 `scripts-config.json`，再扫描各子包并执行其中声明的 `generate-config` 脚本。
当前组件包和两个 Web 应用均声明了该脚本。

配置生成脚本使用各包 `scripts/config/scripts.js` 中的默认配置。
Web 应用默认配置包含以下开发服务器字段：

- `open`：默认值为 `true`，启动后自动打开浏览器。
- `host`：默认值为 `0.0.0.0`，表示开发服务器绑定的主机。
- `port`：默认值为 `8088`，表示开发服务器端口。
- `https`：默认值为 `false`，表示配置文件中的 HTTPS 开关字段。
- `hmr`：默认值为 `false`，表示配置文件默认的热更新字段。

如果目标 `scripts-config.json` 已经存在，生成脚本会先将旧文件复制为对应的 `scripts-config.json.old`，再写入默认配置。
因此，修改本地配置后再次执行 `generate-config` 可能覆盖当前配置，需要根据 `.old` 文件恢复临时设置。

这些配置文件已被 `.gitignore` 忽略，适合保存本机端口、是否打开浏览器等开发环境差异，
但不应把它们当作提交到版本库的业务配置文件。

### 全量构建

在 `familyhelper-ui-view` 根目录执行：

```shell
pnpm run build
```

根工程 `scripts/build.js` 会读取 `packages/*` 中的 `package.json`，按照 workspace 内的依赖关系调度子包构建。
无 workspace 依赖的包可以并行执行，存在 workspace 依赖的包会等待相关依赖任务完成后再执行。

根工程只会调用声明了 `scripts.build` 的子包。
当前 `webapp-pc` 与 `webapp-mobile` 声明了 `build` 脚本，其脚本实际执行 `vite build`，
输出分别位于：

```text
packages/webapp-pc/dist/
packages/webapp-mobile/dist/
```

当前 `component-api`、`component-util`、`component-ckeditor` 和 `component-iconfont` 没有独立的 `build` 脚本。
因此，不要在这些组件包下臆造统一的 `pnpm run build` 流程；组件源码通过 pnpm workspace 被 Web 应用引用，
组件包的独立开发和检查入口以各自 `package.json` 为准。

## 单包开发

单包开发前，先在 monorepo 根目录完成依赖安装。
如果是首次开发，建议同时执行根工程的配置生成和全量构建：

```shell
pnpm install --frozen-lockfile
pnpm run generate-config
pnpm run build
```

随后进入目标子包目录，只使用该包 `package.json` 中已声明的脚本。以下命令均假定当前工作目录已经切换到对应子包目录。

### webapp-pc

进入 PC 应用目录：

```shell
cd packages/webapp-pc
```

常用脚本如下：

- `pnpm run generate-config`：重新生成 PC 应用的 `scripts-config.json`。
- `pnpm run serve`：启动 Vite 开发服务器。
- `pnpm run build`：构建 PC 应用并输出到 `dist/`。
- `pnpm run check`：依次执行格式、Lint 和类型检查。
- `pnpm run check-format`：只检查 `src/` 的 Prettier 格式。
- `pnpm run check-lint`：只执行 `eslint .`。
- `pnpm run check-type`：只执行 `vue-tsc --build`。

PC 应用的 Vite 配置使用 `scripts-config.json` 中的 `open`、`host`、`port` 和 `hmr`。
默认监听 `0.0.0.0:8088`，构建基础路径为 `/familyhelper-ui/ui/pc/`。
如果本机需要同时运行 PC 和移动端，应先修改其中一个应用的 `scripts-config.json` 端口，避免端口冲突。

### webapp-mobile

进入移动端应用目录：

```shell
cd packages/webapp-mobile
```

移动端脚本与 PC 应用保持一致：

- `pnpm run generate-config`：重新生成移动端的 `scripts-config.json`。
- `pnpm run serve`：启动 Vite 开发服务器。
- `pnpm run build`：构建移动端应用并输出到 `dist/`。
- `pnpm run check`：依次执行格式、Lint 和类型检查。
- `pnpm run check-format`：只检查 `src/` 的 Prettier 格式。
- `pnpm run check-lint`：只执行 `eslint .`。
- `pnpm run check-type`：只执行 `vue-tsc --build`。

移动端同样默认监听 `0.0.0.0:8088`，其构建基础路径为 `/familyhelper-ui/ui/mobile/`。
PC 和移动端的默认端口相同，因此不能在不调整配置的情况下同时启动两个开发服务器。

### component-*

组件包通过 workspace 依赖被 Web 应用引用。
当前组件包没有统一的构建脚本，开发时应直接修改对应包的 `src/`，再使用该包提供的检查脚本确认格式、Lint 和类型状态。

`component-api` 提供 API 方法和 HTTP 相关类型、工具，`webapp-pc` 与 `webapp-mobile` 的源码通过 `workspace:*` 依赖引用它。
API 具体配置仍位于应用侧 VIM `api` 模块的 `props.ts`，如需切换开发环境的 Web API 地址，应按该模块 README 修改对应配置。

`component-util` 提供通用工具能力，修改时应以该包当前 `src/` 目录和 `package.json` 中声明的检查脚本为准。

`component-ckeditor` 提供 `dev` 脚本，用于启动 `vite.config.dev.ts` 指定的本地演示页面：

```shell
cd packages/component-ckeditor
pnpm run dev
```

该开发配置以 `dev/` 目录作为 Vite 根目录。它没有独立的 `build` 脚本，因此本地修改组件时使用 `dev` 和检查脚本即可。

`component-iconfont` 的资源位于 `src/`，示例资源位于 `sample/`。
其检查脚本主要执行 `src/` 与 `sample/` 的 Prettier 检查，不提供 ESLint、TypeScript 或独立构建入口。
图标资源更新后，应按照该包 README 的约定重新格式化自动生成的示例和源码。

## 代码检查与格式化

### 根工程检查

在 `familyhelper-ui-view` 根目录执行：

```shell
pnpm run check
```

根工程会按照 workspace 依赖关系扫描各子包，只执行声明了 `check` 脚本的包。
子包检查失败时，根工程会输出失败信息并以失败状态结束。

根工程还提供构建脚本格式检查：

```shell
pnpx prettier --check scripts/
```

如果格式检查失败，可以使用以下命令格式化根工程脚本：

```shell
pnpx prettier --write scripts/
```

### Web 应用检查

`webapp-pc` 和 `webapp-mobile` 的 `pnpm run check` 均包含三步：

1. 使用 Prettier 检查 `src/`。
2. 使用 ESLint 检查整个包目录。
3. 使用 `vue-tsc --build` 执行 Vue 和 TypeScript 类型检查。

需要定位具体问题时，可分别执行：

```shell
pnpm run check-format
pnpm run check-lint
pnpm run check-type
```

### 组件包检查

`component-api`、`component-util` 和 `component-ckeditor` 的 `check` 均依次执行：

1. 使用 Prettier 检查 `src/`，其中 `component-ckeditor` 还检查 `dev/`。
2. 使用 ESLint 检查包目录。
3. 使用 `tsc` 检查 TypeScript 配置。

这些包同样提供 `check-format`、`check-lint` 和 `check-type` 脚本，可在单包目录内分别执行。

`component-iconfont` 的 `check` 只执行：

```shell
prettier --check "src/" "sample/"
```

当图标库自动生成资源发生变化时，可使用以下命令重新格式化源码和示例：

```shell
pnpx prettier --write src/
pnpx prettier --write sample/
```

### 提交前建议

修改多个包时，建议在根目录执行：

```shell
pnpm run check
```

只修改单个包时，可以先执行该包的 `check-format`、`check-lint` 和 `check-type`，
再执行该包的 `check` 或回到根目录执行全量检查。
提交前还应确认没有误提交被 `.gitignore` 忽略的 `dist/`、`node_modules/`、
`scripts-config.json` 和 `scripts-config.json.old`。

## 常见问题

### `pnpm install --frozen-lockfile` 失败

优先检查当前目录是否为 `familyhelper-ui-view` 根目录，以及 `package.json` 与 `pnpm-lock.yaml` 是否来自同一版本源码。
不要直接改用 npm 或 yarn，也不要先删除锁文件绕过检查。

### 开发服务器启动后找不到应用

先确认是否已经在 monorepo 根目录完成：

```shell
pnpm run generate-config
pnpm run build
```

然后检查当前应用包的 `scripts-config.json` 是否存在且为有效 JSON。
还应根据对应 Vite 配置使用正确的基础路径：

- PC：`/familyhelper-ui/ui/pc/`
- 移动端：`/familyhelper-ui/ui/mobile/`

### 配置修改后被恢复

`generate-config` 会覆盖已有 `scripts-config.json`，并将原文件保存到 `scripts-config.json.old`。
如果只是临时调整端口或热更新设置，应在生成配置后修改文件，并注意不要再次执行配置生成覆盖修改。

### PC 和移动端无法同时启动

两个应用默认都使用 `8088` 端口。
如果需要同时运行，在其中一个应用的 `scripts-config.json` 中修改 `server.port`，再启动对应的 `serve` 脚本。

### 组件包没有 `build` 脚本

这是当前工程的实际脚本定义。
根工程构建脚本只调用声明 `build` 的子包，目前由 `webapp-pc` 和 `webapp-mobile` 生成应用 `dist/`。
组件包应通过 workspace 依赖提供源码能力，并使用自身的 `check`、格式、Lint 或类型脚本验证修改。

### 只检查格式时仍然出现其它错误

确认执行的是目标包的 `check-format`，而不是会继续执行 ESLint 和类型检查的 `check`。
根工程的 `pnpm run check` 会调度多个子包，出现错误时应根据日志中的包名进入对应目录单独复现。

### 修改构建脚本后格式检查失败

根工程脚本和各包脚本均使用 Prettier 约束格式。
在对应目录执行：

```shell
pnpx prettier --check scripts/
```

检查失败时执行：

```shell
pnpx prettier --write scripts/
```

格式化后应重新执行检查命令，不要只依赖编辑器的临时格式化结果。

## 参阅

- [Familyhelper UI View](./FamilyhelperUiView.md) - 前端 view 模块（monorepo）导读，
  说明模块定位、包划分与后续文档阅读顺序，细节请参阅该目录内 `README.md`。
- [Familyhelper UI View Build Script](./FamilyhelperUiViewBuildScript.md) - VIM 5 构型下 `scripts/build.js`的原理，
  含 workspace 依赖图、并行调度及与 Vue 官方 `scripts/build.js` 的差异说明。- [VIM Architecture](./VimArchitecture.md) - 说明 `vim`、`api`、`compreg`、`library`、`navigation`、`router`、`store` 和 `views` 的职责边界。
- [System Requirements](./SystemRequirements.md) - 系统需求，详细说明本项目推荐的系统要求，以及其它版本的测试报告。
