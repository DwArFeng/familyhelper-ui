# ChangeLog

## Beta_4.0.1_20260316_build_A

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
