# ChangeLog

## Release_3.6.0_20250625_build_A

### 功能构建

- `webapp-pc` 子模块功能新增。
  - 新增登录页面背景图片配置功能。
  - 配置仓库 -> 配置节点管理页面新增国际化节点编辑子面板。

- `component-util` 子模块功能新增。
  - 新增 `src/util/i18n.ts` 国际化工具类。

- `webapp-pc` 子模块组件优化。
  - `CardPanel` 组件按钮样式优化。
  - `TextEditor` 组件 `el-link` v-bind 优化，以规避 deprecated 警告。

- `component-api` 子模块功能新增。
  - 新增 `src/api/settingrepo/iahnNode.ts` API 代码。
  - 为 `src/api/settingrepo/settingNode.ts` 添加新类型枚举。
  - 为 `src/api/settingrepo/imageListNode.ts` 添加新方法。
  - 为 `src/api/settingrepo/imageNode.ts` 添加新方法。
  - 为 `src/api/settingrepo/settingNode.ts` 添加新方法。
  - 为 `src/api/settingrepo/textNode.ts` 添加新方法。

### Bug 修复

- `webapp-mobile` 子模块 bug 修复。
  - 修复 `src/library/props.ts` 中的错误配置。

- `component-api` 子模块 bug 修复。
  - 修复 `src/api/settingrepo/imageListNode.ts` 中的 bug。
  - 修复 `src/api/settingrepo/imageNode.ts` 中的 bug。
  - 修复 `src/api/settingrepo/settingNode.ts` 中的 bug。
  - 修复 `src/api/settingrepo/textNode.ts` 中的 bug。

### 功能移除

- (无)

---

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

- 优化 `familyhelper-ui-view` 模块中的 `ts` 与 `vue`
