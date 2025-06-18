# ChangeLog

## Release_3.5.0_20250618_build_A

### 功能构建

- Wiki 编写。
  - docs/wiki/zh_CN/VersionBlacklist.md。

- `webapp-pc` 子模块功能优化。
  - `src/components/avatar/AvatarPanel.vue` 样式逻辑优化。
  - `src/components/table/tablePanel/TablePanel.vue` Emit 接口参数名称优化。
  - `src/views/nodes/assetsManagement/assetCatalog/subDialogs/PermitMaintainDialog.vue` 模板结构优化。
  - `src/views/nodes/note/noteBook/subDialogs/PermitMaintainDialog.vue` 模板结构优化。
  - `src/views/nodes/assetsManagement/assetBom/AssetBom.vue` 删除多余代码。

- `webapp-pc` 子模块页面功能新增。
  - 系统设置 -> 权限节点管理页面权限实体新增等级字段。

- `webapp-pc` 子模块页面优化。
  - 资产管理 -> 资产BOM管理主面板资料页签资料下载功能使用流式下载进行优化。

- `component-ckeditor` 子模块依赖升级。
  - 升级 `vite` 依赖版本为 `^6.3.4` 以规避漏洞。

- `webapp-mobile` 子模块依赖升级。
  - 升级 `vite` 依赖版本为 `^6.3.4` 以规避漏洞。

- `webapp-pc` 子模块依赖升级。
  - 升级 `vite` 依赖版本为 `^6.3.4` 以规避漏洞。

- 优化 `familyhelper-ui-view` 模块中的子模块。
  - 优化 `webapp-mobile` 子模块的配置文件，以消除不必要的警告。
  - 优化 `webapp-pc` 子模块的配置文件，以消除不必要的警告。

### Bug 修复

- (无)

### 功能移除

- (无)

---

## Release_3.4.0_20250502_build_A

### 功能构建

- `webapp-pc` 子模块回归。
  - 菜单 `资产管理` 回归。
  - 组件 `ImageSelectCropDialog` 回归。
  - 组件 `ImageCropper` 回归。
  - 组件 `DraggableTablePanel` 回归。

- `webapp-pc` 子模块依赖新增。
  - 增加依赖 `vue-cropper` 以应用其新功能，版本为 `^1.1.4`。
  - 增加依赖 `sortablejs` 以应用其新功能，版本为 `^1.15.6`。
  - 增加依赖 `@types/sortablejs` 以应用其新功能，版本为 `^1.15.8`。

- `webapp-pc` 子模块组件优化。
  - `MaintainDialog` 组件对话框代码结构优化。
  - `DefaultTreeOperateAreaSlot` 组件图标按钮图标尺寸优化。
  - `TablePanel` 组件图标按钮图标尺寸优化。
  - `table/tablePanel/composables.ts` 代码注释优化。
  - `TablePanel` 组件代码优化，去除不必要的 ref 属性。

- `webapp-pc` 子模块页面优化。
  - 系统设置 -> 账户安全页面主页签对应的子页签及子对话框组件代码结构优化。
  - 学习笔记 -> 笔记管理页面主页签对应的页签子面板头部面板悬浮按钮显示逻辑优化。
  - 学习笔记 -> 笔记管理页面代码结构优化。
  - 系统设置 -> 权限分组管理页面西侧权限分组树显示逻辑优化。
  - 系统设置 -> 权限分组管理页面权限分组维护对话框显示逻辑优化。
  - 系统设置 -> 权限分组管理权限分组树子面板显示逻辑优化。
  - 学习笔记 -> 笔记本页面主卡片面板显示逻辑优化。
  - 学习笔记 -> 笔记本选择笔记本子对话框主卡片面板显示逻辑优化。

- `component-api` 子模块回归。
  - `src/api/assets` 目录下的 HTTP 客户端 API 回归。

### Bug 修复

- `webapp-pc` 子模块页面 bug 修复。
  - 学习笔记 -> 笔记管理页面主笔记编辑面板概览页签和对应的浮动窗口一起显示的场景下，一个组件编辑属性，另一个组件没有更新。
  - 杂项 -> 文件编辑面板图片子编辑器的图片预览功能在部分场景下显示异常。
  - 学习笔记 -> 笔记管理笔记树子面板根元素类名错误。

- `webapp-pc` 子模块组件 bug 修复。
  - `LazySearchTreePanel` 组件调用 `update` 方法时，如果更新的项目是当前节点对应的项目，组件不触发更新事件。
  - `LazySearchTreePanel` 组件在刷新时未能正确清除当前选中项的 bug。

### 功能移除

- (无)

---

## Release_3.3.0_20250428_build_B

### 功能构建

- (无)

### Bug 修复

- 调整 eslint 配置，修复项目在部分电脑中非 ASCII 路径下无法打包的问题。

### 功能移除

- (无)

---

## Release_3.3.0_20250428_build_A

### 功能构建

- `webapp-pc` 子模块依赖新增。
  - 增加依赖 `eslint-import-resolver-typescript` 以应用其新功能，版本为 `^4.3.4`。
  - 增加依赖 `eslint-plugin-import-x` 以应用其新功能，版本为 `^4.11.0`。

- `webapp-mobile` 子模块依赖新增。
  - 增加依赖 `eslint-import-resolver-typescript` 以应用其新功能，版本为 `^4.3.4`。
  - 增加依赖 `eslint-plugin-import-x` 以应用其新功能，版本为 `^4.11.0`。

- `component-util` 子模块优化。
  - 优化子模块的 lint 机制。

- `component-util` 子模块依赖新增。
  - 增加依赖 `eslint-import-resolver-typescript` 以应用其新功能，版本为 `^4.3.4`。
  - 增加依赖 `eslint-plugin-import-x` 以应用其新功能，版本为 `^4.11.0`。

- `component-ckeditor` 子模块优化。
  - 优化子模块的 lint 机制，并按照新的规则调整代码。

- `component-ckeditor` 子模块依赖新增。
  - 增加依赖 `eslint-import-resolver-typescript` 以应用其新功能，版本为 `^4.3.4`。
  - 增加依赖 `eslint-plugin-import-x` 以应用其新功能，版本为 `^4.11.0`。

- `component-api` 子模块优化。
  - 优化子模块的 lint 机制，并按照新的规则调整代码。

- `component-api` 子模块依赖新增。
  - 增加依赖 `eslint-import-resolver-typescript` 以应用其新功能，版本为 `^4.3.4`。
  - 增加依赖 `eslint-plugin-import-x` 以应用其新功能，版本为 `^4.11.0`。

- 优化 `familyhelper-ui-view` 模块中 `VIM` 模板的注释。
  - 优化 `webapp-pc` 子模块中 `VIM` 模板的注释。
  - 优化 `webapp-mobile` 子模块中 `VIM` 模板的注释。

- `webapp-mobile` 子模块优化。
  - 优化子模块的 lint 机制，并按照新的规则调整代码及文档。
  - 优化 `src/navigation/modules` 目录中 `ts` 文件的注释。
  - 优化 `src/store/modules` 目录中 `ts` 文件的代码结构。
  - 优化 `src/store/types.ts` 中的部分类型定义。
  - 优化 `src/views` 的目录结构。
  - 优化 `src/navigation/types.ts` 中的部分类型定义。

- `webapp-pc` 子模块优化。
  - 优化子模块的 lint 机制，并按照新的规则调整代码及文档。
  - 优化 `src/navigation/modules` 目录中 `ts` 文件的注释。
  - 优化 `src/store/modules` 目录中 `ts` 文件的代码结构。
  - 优化 `src/store/types.ts` 中的部分类型定义。
  - 优化 `src/views` 的目录结构。
  - 优化 `src/navigation/types.ts` 中的部分类型定义。

- 更新 README.md。

- Wiki 编写。
  - 构建 wiki 目录结构。
  - docs/wiki/en_US/Contents.md。
  - docs/wiki/en_US/Introduction.md。
  - docs/wiki/zh_CN/Contents.md。
  - docs/wiki/zh_CN/Introduction.md。

- 优化 `familyhelper-ui-view` 模块中 `ts` 与 `js` 的注释。
  - 优化部分文件的 noinspection 注释。
  - 优化部分代码注释中的内容。
  - 优化部分文档注释中的内容。

### Bug 修复

- `webapp-pc` 子模块页面 bug 修复。
  - 学习笔记 -> 笔记本页面 vue 文件中 import-from 代码中 URL 大小写错误。
  - 学习笔记 -> 笔记管理页面 vue 文件中 import-from 代码中 URL 大小写错误。
  - 学习笔记 -> 笔记管理主面板笔记页签及其对应浮动面板编辑模式在特定场景下工具栏样式显示错误。
  - 杂项 -> 文件编面板 rtf 子面板编辑模式在特定场景下工具栏样式显示错误。
  - 学习笔记 -> 笔记管理西侧笔记树面板搜索栏未能正确处理搜索逻辑。
  - 杂项 -> 文件编面板 rtf 子面板 blob 更新时未能正确处理状态变更指示器逻辑。
  - 杂项 -> 文件编面板 txt 子面板 blob 更新时未能正确处理状态变更指示器逻辑。
  - 通知管理 -> 发送器设置西部面板选择项变更时中部面板不能正确处理。

- 修复 `familyhelper-ui-view` 模块 `pom.xml` 中错误的插件配置。

### 功能移除

- `webapp-mobile` 子模块功能移除。
  - 移除 `src/store/types.ts` 中多余的类型定义。

- `webapp-pc` 子模块功能移除。
  - 移除 `src/store/types.ts` 中多余的类型定义。

- 删除 `webapp-mobile` 子模块中多余的说明文件。
  - src/README.md。

- 删除 `webapp-pc` 子模块中多余的说明文件。
  - src/README.md。

---

## Release_3.2.0_20250418_build_A

### 功能构建

- `component-ckeditor` 子模块依赖升级。
  - 升级 `vite` 依赖版本为 `^6.2.6` 以规避漏洞。

- `webapp-pc` 子模块优化。
  - 使用统一 API 维护文件的创建、展示、编辑等相关逻辑。
  - `src/composables/icon.ts` 中新增缺失图标 Composition API。

- 优化 `familyhelper-ui-view` 模块中的 `ts` 与 `vue` 的代码。
  - 补充部分代码方法中缺失的返回类型标注。

- 优化 `familyhelper-ui-view` 模块中 `ts` 与 `js` 的注释。
  - 补充部分方法文档注释中的 `@returns` 注释块。
  - 优化文档注释中 `@param` 与 `@returns` 中的类型标注。
  - 将文档注释中的 `@return` 替换为 `@returns`。

### Bug 修复

- `webapp-pc` 子模块中 `vue` 模板 `element-plus` 组件 `:icon` 属性 bug 修复。
  - src/components/file/fileUploadDialog/FileUploadDialog.vue。
  - src/components/text/textEditor/TextEditor.vue。

### 功能移除

- (无)

---

## Release_3.1.0_20250416_build_A

### 功能构建

- `component-api` 子模块回归。
  - `src/api/note` 目录下的 HTTP 客户端 API 回归。

- `webapp-pc` 子模块回归。
  - 菜单 `学习笔记` 回归。
  - 菜单 `杂项` 回归。
  - 组件 `FileUploadDialog` 回归。
  - 组件 `FileCreateDialog` 回归。
  - 组件 `CornerLightPanel` 回归。
  - 组件 `CardPanel` 回归。

- `webapp-pc` 子模块格式优化。
  - 部分 `vue` 组件的事件发送的变量名优化。
  - 部分 `vue` 组件的功能区的注释内容优化。
  - 部分 `vue` 组件的表格相关的变量名优化。
  - 部分 `vue` 组件的导入区的代码格式优化。

- `webapp-pc` 子模块依赖新增。
  - 增加依赖 `@ckeditor/ckeditor5-vue` 以应用其新功能，版本为 `^7.3.0`。
  - 增加依赖 `ckeditor5` 以应用其新功能，版本为 `^45.0.0`。
  - 增加依赖 `pdfjs-dist` 以应用其新功能，版本为 `^5.1.91`。
  - 增加依赖 `@dwarfeng/familyhelper-ui-component-ckeditor` 以应用其新功能，版本为 `workspace:*`。

- `webapp-mobile` 子模块优化。
  - 优化库资产的打包策略，如动态引入的 `js` 与 `mjs` 资产文件。

- `webapp-pc` 子模块优化。
  - 优化库资产的打包策略，如动态引入的 `js` 与 `mjs` 资产文件。

- `component-ckeditor` 子模功能新增。
  - 新增 `src/util/file.ts` 工具类。

- `component-ckeditor` 子模块优化。
  - 添加 `dev` 指令以及相关代码，提升模块开发的便捷性。
  - `ckeditor5` 相关代码使用 `^45.0.0` 版本进行重写。
  - 使用 TypeScript 重写 `ckeditor5` 相关的代码。
  - 使用 TypeScript 相关标准优化代码检查机制。

### Bug 修复

- `webapp-pc` 子模块 bug 修复。
  - 部分 `vue` 组件的必选属性的定义代码 bug 修复。

### 功能移除

- `component-ckeditor` 子模块功能移除。
  - 去除 `webpack` 相关的 `ckeditor5` 依赖，并移除 `webpack` 相关的构建脚本。
  - 去除子模块的 `sample` 目录及相关代码。

---

## Release_3.0.0_20250411_build_A

### 功能构建

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

### Bug 修复

- 修复 `familyhelper-ui-view` 模块的脚本 bug。
  - 修复 `packages` 目录不存在时无法执行 pnpm 指令的 bug。

### 功能移除

- 移除 `familyhelper-ui-view` 模块旧版本 `packages` 目录。

---

## 更早的版本

[View all changelogs](./changelogs)
