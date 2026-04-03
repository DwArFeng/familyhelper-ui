# Familyhelper UI View - VIM 5 构建脚本与 `build.js` 原理

`familyhelper-ui-view` 根目录的 `package.json` 将 `build` 脚本定义为 `node scripts/build.js`。
本文说明该入口脚本如何与 `scripts/util` 下的模块协作，
在 **pnpm workspace monorepo** 中按 **包间依赖关系** 调度各子包的 `pnpm build`，并在 CPU 逻辑核数量限制下 **尽量并行** 执行。
全仓库 Maven 打包、分发目录与 Tomcat 部署等流程见 Wiki 中 [从源码编译](./CompileBySource.md) 等文档；
`familyhelper-ui-view` 内的安装、全量构建命令与约定以该模块内的 `README.md` 为准。

## 术语：VIM 与 VIM 5

**VIM（Vue Interactive Model）** 与 **VIM 5** 在本文语境下指**同一套自研框架**：**VIM 5** 即 **VIM 框架的第五代**。
`familyhelper-ui-view` **整体工程结构**（monorepo 包划分、`packages` 与 `scripts` 的职责分工、多包构建编排等）采用的即为 **VIM 5 构型**。

本文以 **VIM 5** 为标题用语，着重说明该构型中 **`scripts/build.js` 及配套 util** 如何从各包 `package.json` 抽取 workspace 内依赖、
得到执行序约束，并在固定并发上限下启动多个子进程的 `pnpm build`。
这一层与 Vue 生态里各包自有的打包器配置、Rollup 或 Vite 等 **单包构建细节** 解耦，
只负责 **何时、以何顺序、何种并行度** 调用各包自身的 `build` 脚本。
应用内的交互与视图组织仍属 VIM 体系，更一般的导读见 [Familyhelper UI View - 前端 view 模块导读](./FamilyhelperUiView.md)。

## 入口 `scripts/build.js`

启动后打印开始日志，调用异步函数 `run()`。`run()` 内部仅调用 `executePackages(PackageUtil.packageInfos)`，
将 **包信息列表** 交给执行层。

`executePackages` 使用 `ExecUtil.runParallel`，并发上限为 `require('node:os').cpus().length`，
即本机 **逻辑 CPU 数量**；对每个包项调用的迭代函数是 `executeSinglePackage`。

若 `run()` 链路上任一环节抛错，脚本会输出错误与堆栈，并以状态码 `1` 退出进程。

## 单包构建 `executeSinglePackage`

对每个 `packageInfo`，脚本用 `packageInfo.name` 作为 **`packages` 目录下的文件夹名**（不是 npm 作用域全名），
读取 `packages/<name>/package.json`。

若该文件没有 `scripts` 或没有 `scripts.build`，该包 **整包跳过**，不启动子进程。

否则会使用 `ExecUtil.spawn`，在 `packages/<name>` 工作目录下执行 `pnpm`、参数为 `build`。
子进程失败时记录日志并将错误 **继续向上抛出**，以便顶层终止整个构建。

## 依赖图如何生成：`scripts/util/package.js`

`parsePackageInfos` 在 `packages` 存在时扫描其子目录，筛出同时满足 **是目录** 且 **含 `package.json`** 的项，
得到一组 **包目录名**。

对每个包读取 `package.json`：用其 `name` 字段建立 **npm 包名 → 包目录名** 的映射。
将 `dependencies` 与 `devDependencies` 两个对象的 **键** 合并成依赖名列表；
对每个键，若能在上述映射中找到对应包，则记一条 **依赖边**：从 **当前包目录名** 指向 **被依赖包的目录名**。
映射不到的键视为 **workspace 外部依赖**， **不参与构图**。因此构图仅反映 **本 monorepo 内** 的包间依赖。

最终导出数组 `packageInfos`，元素形如 `{ name: 目录名, dependencies: 目录名[] }`。
其中 `dependencies` 列出的是 **必须先完成构建的 workspace 包目录名**。
`readdirSync` 得到的目录顺序会进入处理顺序；脚本内 **未对包名做稳定排序**，初始列表顺序依赖文件系统实现。

## 并行调度：`scripts/util/exec.js` 中的 `runParallel`

`runParallel(maxConcurrency, packageInfos, iteratorFn)` 维护：

- **剩余队列** `remainingPackageInfos`：尚未开始编排的包；
- **promiseMap**：包目录名 → 表示 **该包构建及前置等待** 的 `Promise`，供后继包 `Promise.all` 等待；
- **retPromises**：收集所有已启动的顶层 Promise，最后 `Promise.all(retPromises)` 等待全部结束。

外层 `while` 在队列非空时循环。每一轮从内层循环尝试 **从下标 0 起第一个可调度包**：

- 若 `dependencies.length === 0`，则直接 `iteratorFn(packageInfo)`（在 `build.js` 中即进入对应目录执行 `pnpm build`）。
- 若有依赖，则必须 **每一个** 依赖名都已出现在 `promiseMap` 中；否则 **本轮跳过该包**，继续扫描下一个。
  一旦全部就绪，则构造 `Promise.all(dependentPromises).then(() => iteratorFn(packageInfo))`，
  保证 **所有直接 workspace 依赖对应的 Promise 完成后** 才执行本包构建。

每启动一个新的“包级”Promise 后，会调用 `blockIfReachMaxConcurrency`：
将“该 Promise settled 时从在飞集合中移除自身”的包装 Promise 放入 **在飞列表**；
若在飞数量达到 `maxConcurrency`，则 `await Promise.race(executingPromises)`， 直到 **至少一个在飞任务完成** 再继续调度。
这里的上限是 **并发槽位**，日志中若出现“并行线程”一类表述，应理解为 **同时进行中的包级任务数**，不必理解为操作系统线程与之一一对应。

若多轮调度后仍无法使剩余队列前进（例如依赖环），循环迭代次数超过固定阈值会抛出 `Circular dependencies detected`。
这是 **启发式环检测**，并非输出环上具体包名的拓扑分析。

`spawn` 使用 `child_process.spawn`；在 Windows 上 `shell` 为 `true`，`cwd` 为子包目录；stdio 对子进程设为 `inherit`，
并对 `stdout` / `stderr` 注册了按行处理的回调（具体是否与 `inherit` 叠加产生重复输出，取决于运行环境与 Node 行为，本文只记录代码结构）。

## 路径解析：`scripts/util/path.js`

`parsePath(relativePath)` 使用 `path.join(__dirname, '../../', relativePath)`，即相对 **`scripts` 目录的上两级**，
也就是 **`familyhelper-ui-view` 工程根**。因此 `build.js` 与各 `util` 中的 `packages/...` 均相对于该 monorepo 根目录解析。

## 与 Vue 仓库 `scripts/build.js` 的对照

Vue 核心仓库中的 [`scripts/build.js`](https://github.com/vuejs/vue/blob/main/scripts/build.js) 负责 
**同一仓库内** 多份 Rollup 构建配置：
从配置模块取得 `builds` 列表，可按命令行参数过滤；对每个配置 **顺序** 调用 `rollup` 生成产物，
生产环境可经 Terser 压缩再写文件，并可报告 gzip 体积等。其粒度是 **构建条目（bundle）**，而非 **多个独立 npm 包进程**。

`familyhelper-ui-view` 的 `build.js` **不内联 Rollup**；它把每个 workspace 子包已写好的 `pnpm build` 当作黑盒，
只在 **进程与依赖序** 层面编排。
亮点在于：**无 workspace 依赖的包可以多路同时构建**；**有依赖的包在依赖全部完成后才启动**，
并在 **逻辑 CPU 数** 限制下通过 `race` 控制同时在飞数量。
这与 Vue 脚本解决的是不同层面的问题：前者是 **monorepo 多包 orchestration**，后者是 **单仓多 entry 的 bundler 流水线**。

## 日志与脚本配置（简述）

`scripts/util/log.js` 从 `scripts/config` 等读取脚本公共配置（如日志级别），再按级别输出带时间戳与模块名的行。构建过程中的
`info` / `debug` 等级别会影响控制台详细程度；细节以 `scripts` 目录内配置与模块为准。

## 延伸阅读

- [Familyhelper UI View - 前端 view 模块导读](./FamilyhelperUiView.md)
- 模块内命令与格式化约定：`familyhelper-ui-view` 仓库中的 `README.md`
- Wiki 总目录：[目录](./Contents.md)
