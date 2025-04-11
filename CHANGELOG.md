# ChangeLog

### Release_3.1.0_20250411_build_A

#### 功能构建

- (无)

#### Bug修复

- (无)

#### 功能移除

- (无)

---

### Release_3.0.0_20250411_build_A

#### 功能构建

- `webapp-mobile` 子模块优化。
  - 建立构建脚本格式化机制。
  - 建立代码格式化机制。
  - 建立代码检查机制。

- `webapp-pc` 子模块优化。
  - 新增 `src/components/text/jsonEditor` JSON 编辑器组件。
  - 新增 `src/composables/icon.ts` 图标 Composition API。
  - 新增 `src/composables/userPreference.ts` 用户偏好 Composition API。
  - `src/components/dialog/floatyDialog/FloatyDialog.vue` 面板代码优化。
  - 建立构建脚本格式化机制。
  - 建立代码格式化机制。
  - 建立代码检查机制。

- `component-util` 子模块建立。
  - 编写通用工具函数。
  - 构建模块初始结构。

- `component-api` 子模块优化。
  - 建立构建脚本格式化机制。
  - 建立代码格式化机制。
  - 建立代码检查机制。

- `component-iconfont` 子模块优化。
  - 建立构建脚本格式化机制。
  - 建立代码格式化机制。
  - 建立代码检查机制。

- `component-ckeditor` 子模块优化。
  - 添加 `@ckeditor/ckeditor5-core`，消除模块打包时的警告输出。
  - 建立构建脚本格式化机制。
  - 建立代码格式化机制。
  - 建立代码检查机制。

- `webapp-mobile` 子模块回归。
  - VIM 框架回归。

- `webapp-pc` 子模块回归。
  - 菜单 `关于` 回归。
  - 菜单 `通知管理` 回归。
  - 菜单 `配置仓库` 回归。
  - 菜单 `系统设置` 回归。
  - 菜单 `首页` 回归。
  - 组件库 `ElementPlus` 回归。
  - 组件库 `ElementPlusIcon` 回归。
  - 组件库 `Iconfont` 回归。
  - 组件库 `Jsoneditor` 回归。
  - 组件库 `OverlayScrollbars` 回归。
  - 组件 `TitleLayoutPanel` 回归。
  - 组件 `FileSelector` 回归。
  - 组件 `AvatarPanel` 回归。
  - 组件 `FloatyDialog` 回归。
  - 组件 `MaintainDialog` 回归。
  - 组件 `BorderLayoutPanel` 回归。
  - 组件 `ComingSoon` 回归。
  - 组件 `HeaderLayoutPanel` 回归。
  - 组件 `TablePanel` 回归。
  - 组件 `TextEditor` 回归。
  - 组件 `LazySearchTreePanel` 回归。
  - 依赖回归。
  - VIM 框架回归。

- `component-api` 子模块回归。
  - `src/api/notify` 目录下的 HTTP 客户端 API 回归。
  - `src/api/settingrepo` 目录下的 HTTP 客户端 API 回归。
  - `src/api/clannad` 目录下的 HTTP 客户端 API 回归。
  - `src/api/system` 目录下的 HTTP 客户端 API 回归。
  - `src/utils` 目录下的工具函数回归。

- `component-iconfont` 子模块回归。

- `component-ckeditor` 子模块回归。

- 优化 `familyhelper-ui-view` 模块打包机制。
  - 将打包机制由 `build -> lint` 更改为 `build -> check`，允许子模块引入更多的检查机制。
  - 修改对应的构建脚本。

- 建立 `familyhelper-ui-view` 模块构建脚本格式化机制。

#### Bug修复

- 修复 `familyhelper-ui-view` 模块的脚本 bug。
  - 修复 `packages` 目录不存在时无法执行 pnpm 指令的 bug。

#### 功能移除

- 移除 `familyhelper-ui-view` 模块旧版本 `packages` 目录。

---

### 更早的版本

[View all changelogs](./changelogs)
