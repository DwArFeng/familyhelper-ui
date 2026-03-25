# ChangeLog

## Beta_4.2.0_20260322_build_A

### 功能构建

- `webapp-pc` 子模块文件优化注释、文档注释格式、代码换行格式。
  - src/store/modules/*.ts。
  - src/api/types.ts。
  - src/compreg/types.ts。
  - src/library/types.ts。
  - src/navigation/types.ts。
  - src/router/types.ts。
  - src/store/types.ts。

- `webapp-mobile` 子模块 README.md 说明文件优化。
  - src/store/README.md。
  - src/library/README.md。

- `webapp-pc` 子模块 README.md 说明文件优化。
  - src/library/README.md。
  - src/store/README.md。

- `webapp-util` 子模块功能优化。
  - 优化 `src/util/store.ts` 中的方法签名，以支持 `ExecutableActionHandle` 前置/后置钩子的优先级设置。
  - 优化 `src/util/store.ts` 中的文档注释。

- `familyhelper-ui-view` 子模块功能重构，以适配新的中台架构。
  - packages/webapp-pc。
  - packages/webapp-mobile。
  - packages/component-api。

### Bug 修复

- (无)

### 功能移除

- (无)

---

## Beta_4.1.0_20260321_build_A

### 功能构建

- Wiki 编写。
  - docs/wiki/zh-CN/CompileBySource.md。

- `webapp-mobile` 子模块功能优化。
  - 优化 `src/store/modules/visualizer.ts` 模块中的常量值以及注释，以提升项目规范性。
  - 优化 `src/store/modules/navigation.ts` 模块中的常量值以及注释，以提升项目规范性。
  - 将菜单的加载方式变更为动态加载，默认菜单作为 fallback。
  - 合并 `src/store/modules` 中的 `navigation.ts` 和 `navigationEzNav.ts` 模块为 `navigation.ts` 模块。
  - 重构 `router` VIM 组件的加载机制，以支持动态菜单加载。
  - 重构 `navigation` VIM 组件签名，以支持动态菜单加载。
  - 调整 `src/library/modules` 中的 `simple` 模块中的渲染器组件代码，以支持动态菜单加载。
  - 优化 `src/store/modules/visualizer.ts` 模块中的方法签名，代码格式，代码注释。
  - 优化 `src/router/guards.ts` 中的方法签名，以消除警告。
  - 调整 `navigation` VIM 组件及相关组件中的方法签名，使其更加合理。
  - 新增 `store` VIM 组件中的方法。
  - 新增 `src/util/store.ts` 工具方法，用于判断 `store` VIM 组件是否准备完毕。
  - 优化 `src/views/vim/*/*.vue` 组件的 `store` VIM 组件是否准备完毕判断逻辑。
  - 补充 `src/store/README.md` 中的 `store` VIM 组件使用说明。
  - 优化 `src/store/modules/visualizer.ts` 模块中的代码格式以及代码注释。
  - 新增 `compreg` VIM 组件，用于维护组件的注册。
  - 调整 `navigation` VIM 组件，调整 `RouterSetting` 类型。
  - 将菜单的关系和组件显示分离。
  - 增加 `miscellaneous.compregFallback` 组件，作为 `compreg` 的默认组件。
  - 更新 `src/navigation/README.md` 中的 `navigation` VIM 组件使用说明。
  - 重构 `src/views/nodes` 中的目录结构，以适配 `library` VIM 组件下对应的模块名称。
  - 更改 `navigation` VIM 组件模块中的内容，以适配 `library` VIM 组件下对应的模块名称。

- `component-api` 子模功能优化。
  - `src/api/settingrepo/navigationNode.ts` 方法签名优化。

- `webapp-pc` 子模块功能优化。
  - 优化 `src/store/modules/visualizer.ts` 模块中的常量值以及注释，以提升项目规范性。
  - 优化 `src/store/modules/navigation.ts` 模块中的常量值以及注释，以提升项目规范性。
  - 将菜单的加载方式变更为动态加载，默认菜单作为 fallback。
  - 合并 `src/store/modules` 中的 `navigation.ts` 和 `navigationEzNav.ts` 模块为 `navigation.ts` 模块。
  - 重构 `router` VIM 组件的加载机制，以支持动态菜单加载。
  - 重构 `navigation` VIM 组件签名，以支持动态菜单加载。
  - 调整 `src/library/modules` 中的 `elementPlus` 和 `simple` 模块中的渲染器组件代码，以支持动态菜单加载。
  - 优化 `src/store/modules/visualizer.ts` 模块中的方法签名，代码格式，代码注释。
  - 优化 `src/router/guards.ts` 中的方法签名，以消除警告。
  - 调整 `navigation` VIM 组件及相关组件中的方法签名，使其更加合理。
  - 新增 `store` VIM 组件中的方法。
  - 新增 `src/util/store.ts` 工具方法，用于判断 `store` VIM 组件是否准备完毕。
  - 优化 `src/views/vim/*/*.vue` 组件的 `store` VIM 组件是否准备完毕判断逻辑。
  - 补充 `src/store/README.md` 中的 `store` VIM 组件使用说明。
  - 优化 `src/store/modules/visualizer.ts` 模块中的代码格式以及代码注释。
  - 新增 `compreg` VIM 组件，用于维护组件的注册。
  - 调整 `navigation` VIM 组件，调整 `RouterSetting` 类型。
  - 将菜单的关系和组件显示分离。
  - 增加 `miscellaneous.compregFallback` 组件，作为 `compreg` 的默认组件。
  - 更新 `src/navigation/README.md` 中的 `navigation` VIM 组件使用说明。

### Bug 修复

- `webapp-pc` 子模块 bug 修复。
  - 修正 `src/navigation/README.md` 中的过时的示例代码。

- `webapp-pc` 子模块页面 bug 修复。
  - 配置仓库 -> 配置节点编辑器导航节点子编辑面板结构页签左侧树面板未选中节点时点击编辑按钮编辑数据后页面报错。

### 功能移除

- (无)

---

## Beta_4.0.1_20260320_build_A

### 功能构建

- Wiki 编写。
  - docs/wiki/zh-CN/ConfDirectory.md。

- `webapp-pc` 子模块组件新增。
  - 组件 `SearchTreePanel` 新增。

- `webapp-pc` 子模块页面功能新增。
  - 配置仓库 -> 配置节点编辑器新增导航节点子编辑面板。
  - 配置仓库 -> 配置节点编辑器新增文件节点子编辑面板。
  - 配置仓库 -> 配置节点编辑器新增文件列表节点子编辑面板。

- `component-api` 子模功能新增。
  - 新增 `src/api/settingrepo/navigationNode.ts` API 接口。
  - 更新 `src/api/settingrepo/settingNode.ts` API 接口。
  - 新增 `src/api/settingrepo/fileListNode.ts` API 接口。
  - 新增 `src/api/settingrepo/fileNode.ts` API 接口。

- `webapp-pc` 子模块组件优化。
  - `src/components/elementPlus/dialog/maintainDialog/composables.ts` 方法签名优化，新增 Composition API。
  - `src/components/elementPlus/tree/lazySerachTreePanel/composables.ts` 方法签名优化。
  - `src/components/elementPlus/table/draggableTablePanel/composables.ts` 方法签名及文档注释优化。
  - `src/components/elementPlus/card/cardPanel/composables.ts` 方法签名优化。
  - `src/components/elementPlus/tree/lazySerachTreePanel/LazySearchTreePanel.vue` 方法签名优化。
  - `src/components/elementPlus/tree/lazySerachTreePanel/LazySearchTreePanel.vue` 调整 Emits 顺序。
  - `src/views/nodes/elementPlus/miscellaneous/fileEditor/FileEditPanel.vue` 新增事件 `onFileCommitted`。
  - `src/components/elementPlus/file/fileSelector/composables.ts` 新增 Composition API。

- `component-ckeditor` 子模块依赖升级。
  - 升级 `ckeditor5` 依赖版本为 `^47.6.0` 以规避漏洞。

- `webapp-pc` 子模块依赖升级。
  - 升级 `ckeditor5` 依赖版本为 `^47.6.0` 以规避漏洞。

### Bug 修复

- 移除 `.changelogs` 目录下的 `CHANGELOG_*.md` 文件中冗余的章节，包含错误的链接。
  - changelogs/CHANGELOG_3.x.md。

### 功能移除

- `webapp-pc` 子模块功能移除。
  - `src/components/elementPlus/tree/lazySerachTreePanel/LazySearchTreePanel.vue` 移除未使用的 `update` 事件。

---

## Beta_4.0.0_20250316_build_A

### 功能构建

- Wiki 更新。
  - docs/wiki/zh-CN/Introduction.md。
  - docs/wiki/en-US/README.md。
  - docs/wiki/zh-CN/README.md。

- `webapp-mobile` 子模块部分 README.md 文档优化。
  - src/navigation/README.md。

- `webapp-mobile` 子模块功能优化。
  - 更改导航的路由设置，将单一组件映射变为基于可视化器类型的复合组件映射。
  - 更改 src/views 路径结构，引入 simple 可视化器目录。
  - 实现可视化器的动态加载。

- `webapp-pc` 子模块功能优化。
  - 更改导航的路由设置，将单一组件映射变为基于可视化器类型的复合组件映射。
  - 更改 src/views 路径结构，引入 elementPlus 和 simple 可视化器目录。
  - 实现可视化器的动态加载。

- `component-ckeditor` 子模块依赖升级。
  - 升级 `vite` 依赖版本为 `^6.4.1` 以规避漏洞。

- `webapp-mobile` 子模块依赖升级。
  - 升级 `vite` 依赖版本为 `^6.4.1` 以规避漏洞。

- `webapp-pc` 子模块依赖升级。
  - 升级 `vite` 依赖版本为 `^6.4.1` 以规避漏洞。

- 依赖升级。
  - 升级 `log4j2` 依赖版本为 `2.25.3` 以规避漏洞。

- `familyhelper-ui-view` 子模块类优化注释、文档注释格式、代码换行格式。
  - packages/component-util/src/util/timestamp.ts。

- 优化文件格式。
  - 优化 `index.jsp` 文件的格式。
  - 优化 `spring-mvc.xml` 文件的格式。
  - 优化 `pom.xml` 文件的格式。

### Bug 修复

- `webapp-mobile` 子模块部分 README.md 文档修正。
  - src/navigation/README.md。

### 功能移除

- (无)

---

## 更早的版本

[View all changelogs](./changelogs)
