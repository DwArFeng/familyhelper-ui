# ChangeLog

## Beta_4.0.1_20260316_build_A

### 功能构建

- `component-api` 子模功能新增。
  - 新增 `src/api/settingrepo/fileListNode.ts` API 接口。
  - 新增 `src/api/settingrepo/fileNode.ts` API 接口。

- `webapp-pc` 子模块组件优化。
  - `src/components/elementPlus/file/fileSelector/composables.ts` 新增 Composition API。

- `component-ckeditor` 子模块依赖升级。
  - 升级 `ckeditor5` 依赖版本为 `^47.6.0` 以规避漏洞。

- `webapp-pc` 子模块依赖升级。
  - 升级 `ckeditor5` 依赖版本为 `^47.6.0` 以规避漏洞。

### Bug 修复

- 移除 `.changelogs` 目录下的 `CHANGELOG_*.md` 文件中冗余的章节，包含错误的链接。
  - changelogs/CHANGELOG_3.x.md。

### 功能移除

- (无)

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
