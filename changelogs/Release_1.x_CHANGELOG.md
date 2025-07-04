# ChangeLog

## Release_1.3.0_20240804_build_A

### 功能构建

- 依赖升级。
  - 升级 `spring` 依赖版本为 `5.3.37` 以规避漏洞。

- 优化页面。
  - 学习笔记 -> 笔记管理主面板节点概览页签属性面板名称表单样式优化。
  - 学习笔记 -> 笔记管理主面板项目概览页签属性面板名称表单样式优化。
  - 资产管理 -> 资产BOM管理主面板浮动窗口弹出按钮样式优化。
  - 日常生活 -> 活动数据管理主面板浮动窗口弹出按钮样式优化。
  - 日常生活 -> 活动管理主面板浮动窗口弹出按钮样式优化。
  - 日常生活 -> 活动模板管理主面板浮动窗口弹出按钮样式优化。
  - 学习笔记 -> 笔记管理主面板浮动窗口弹出按钮样式优化。
  - 工程助手 -> 备忘录主面板浮动窗口弹出按钮样式优化。
  - 工程助手 -> 历史备忘录主面板浮动窗口弹出按钮样式优化。
  - 系统设置 -> 账户安全主面板浮动窗口弹出按钮样式优化。
  - 系统设置 -> 权限分组管理关联权限节点对话框关闭为优化，点击遮罩层不再关闭对话框。

- 实现配置仓库一级菜单。
  - 实现配置类型管理二级菜单。
  - 实现配置节点管理二级菜单。
  - 实现格式化器支持二级菜单。

- 增加组件功能。
  - Header 布局面板增加 `applyContainerHeight` 属性，以控制组件的高度是否自适应，该更新属于不兼容更新。
  - 标题布局面板增加 `applyContainerHeight` 属性，以控制组件的高度是否自适应，该更新属于不兼容更新。

- familyhelper-ui-view-pc 模块前端依赖新增。
  - 增加依赖 `js-base64` 以应用其新功能，版本为 `^3.7.7`。

- 更新 `familyhelper-ui-component-api` 模块部分接口以适配新的网络接口版本。
  - 新增 src/api/settingrepo/textNode.js。
  - 更新 src/api/settingrepo/settingNode.js。

### Bug 修复

- 修复页面 bug。
  - 资金管理 -> 账本管理功能编辑对话框提醒管理页签实体维护对话框类型表单行点击查询按钮后相应对话框无法正常打开。
  - 资金管理 -> 余额记录输入余额对话框新余额表单行大写金额解析错误。
  - 资金管理 -> 资金报告主面板账本页签余额面板大写金额解析错误。
  - 资金管理 -> 资金报告主面板银行卡页签余额面板大写金额解析错误。
  - 资金管理 -> 资金报告主面板资金变更页签变更金额面板大写金额解析错误。

- 修复组件 bug。
  - 修复表格面板底部分页器的样式 bug。

### 功能移除

- 移除系统设置一级菜单。
  - 移除配置类型管理二级菜单。
  - 移除配置仓库维护二级菜单。

---

## Release_1.2.4_20240429_build_A

### 功能构建

- 依赖升级。
  - 升级 `slf4j` 依赖版本为 `1.7.36` 以规避漏洞。

- familyhelper-ui-view-pc 模块 views/item 下通用组件优化。
  - miscellaneous/fileEditor/FileEditPanel.vue 文件编辑未保存时提交按钮强调显示。

- 增加页面功能。
  - 日常生活 -> 活动模板管理右侧驱动页签下驱动面板支持提醒功能及提醒范围。

- 优化页面。
  - 我与家庭 -> 证件管理右侧证件照片面板支持大文件上传/下载。
  - 日常生活 -> 活动管理右侧面板文件页签下文件管理面板支持大文件上传/下载。
  - 学习笔记 -> 笔记管理右侧面板笔记页签面板及其浮动窗口笔记未保存时提交按钮强调显示。
  - 学习笔记 -> 笔记管理右侧面板笔记页签面板或其浮动窗口提交笔记时，另一处组件中的笔记自动更新。

- 优化 `src/api/assets/itemFile.js` 模块中部分 api 的代码结构。
  - src/api/assets/itemFile.js。

### Bug 修复

- 修复 familyhelper-ui-node 模块下部分文件中的错误配置。
  - src/main/resources/logging/settings.xml。

- 修复 familyhelper-ui-view-pc 模块 views/item 下通用组件的 bug。
  - miscellaneous/fileEditor/FileEditPanel.vue 中 `type`，`id`，`mode` 同时变化时，文件多次下载的 bug。

### 功能移除

- (无)

---

## Release_1.2.3_20240414_build_A

### 功能构建

- 日志功能优化。
  - 优化默认日志配置，默认配置仅向控制台输出 `INFO` 级别的日志。
  - 优化日志配置结构，提供 `conf/logging/settings.xml` 配置文件及其不同平台的参考配置文件，以供用户自定义日志配置。
  - 优化启动脚本，使服务支持新的日志配置结构。
  - 优化 `assembly.xml`，使项目打包时输出新的日志配置结构。

- 优化页面。
  - 资产管理 -> 资产BOM管理主面板资料页签支持大文件上传/下载。

### Bug 修复

- 修复页面 bug。
  - 学习笔记 -> 笔记本错误文案。

- 修复组件 bug。
  - 修复文件创建对话框组件关闭后重新打开时，文件类型无法选择的 bug。

### 功能移除

- (无)

---

## Release_1.2.2_20240217_build_A

### 功能构建

- (无)

### Bug 修复

- 修复页面 bug。
  - 我与家庭 -> 证件管理右下方使用提示通知在页面销毁时有时不能关闭的 bug。

- 修复组件 bug。
  - 修复表格面板组件首次加载时，当前页面属性异常的 bug。

### 功能移除

- (无)

---

## Release_1.2.1_20240215_build_A

### 功能构建

- 增加页面功能。
  - 工程助手 -> 备忘录西侧面板头部面板布局优化。
  - 工程助手 -> 备忘录西侧面板头部面板增加概要搜索框。
  - 工程助手 -> 历史备忘录西侧面板头部面板布局优化。
  - 工程助手 -> 历史备忘录西侧面板头部面板增加概要搜索框。

- 优化页面。
  - 工程助手 -> 历史备忘录西侧面板主表格标题列文案优化。

### Bug 修复

- (无)

### 功能移除

- (无)

---

## Release_1.2.0_20240212_build_A

### 功能构建

- 优化 familyhelper-ui-view-pc 模块通用组件。
  - src/components/layout/TablePanel 增加分页组件调整策略以及紧凑展示模式。

- familyhelper-ui-view-pc 模块 views/item 下通用组件优化。
  - activityDataSet/ActivityDataSetIndicator.vue 文案优化。
  - activityDataSet/ActivityDataSetSelectDialog.vue 文案优化。

- 去除 familyhelper-ui-view-pc 模块中对话框组件不必要的外层 div。
  - src/views/items/life/activityDataSet/ActivityDataSetSelectDialog.vue。

- 实现系统设置一级菜单。
  - 账户安全二级菜单。

- 优化页面。
  - 系统管理 -> 权限分组管理关联权限节点对话框主表格文本列优化溢出时的显示机制。
  - 系统管理 -> 权限分组管理关联权限节点对话框样式调整，弹出时屏幕最右侧不再显示滚动条。
  - 系统管理 -> 权限分组管理关联权限节点对话框样式调整，对话框更加水平居中。
  - 系统管理 -> 权限分组管理中部面板下方表格增加右键菜单，提供复制 ID 功能。

- VIM 框架优化。
  - 使用新的登录接口。

### Bug 修复

- 修复组件 bug。
  - 修复表格面板组件首次换页时，当前页面属性更新行为异常的 bug。

- 修正拼写错误。
  - 修正 `permissionGroup/PermissionGroup.vue` 中的拼写错误。

### 功能移除

- (无)

---

## Release_1.1.3_20240129_build_A

### 功能构建

- 优化 README.md 文件。
  - 增加 `适配版本` 子标题，列出当前版本适配的网络接口版本。

- 优化页面。
  - 我与家庭 -> 证件管理东侧证件文件面板使用证件缩略图进行展示，提高系统响应速度。

### Bug 修复

- (无)

### 功能移除

- (无)

---

## Release_1.1.2_20240128_build_A

### 功能构建

- familyhelper-ui-view-mobile 模块前端依赖升级。
  - 升级 `eslint-plugin-vue` 依赖版本为 `^8.7.1` 并解决兼容性问题，以应用其新功能。
  - 升级 `axios` 依赖版本为 `^1.6.7` 以规避漏洞。
  - 升级 `core-js` 依赖版本为 `^3.35.1` 以规避漏洞。
  - 升级 `vue` 依赖版本为 `^2.7.16` 以规避漏洞。
  - 升级 `@vue/cli-plugin-babel` 依赖版本为 `^4.5.19` 以规避漏洞。
  - 升级 `@vue/cli-plugin-eslint` 依赖版本为 `^4.5.19` 以规避漏洞。
  - 升级 `@vue/cli-plugin-router` 依赖版本为 `^4.5.19` 以规避漏洞。
  - 升级 `@vue/cli-service` 依赖版本为 `^4.5.19` 以规避漏洞。
  - 升级 `@vue/eslint-config-airbnb` 依赖版本为 `^5.3.0` 以规避漏洞。
  - 升级 `eslint` 依赖版本为 `^6.8.0` 以规避漏洞。
  - 升级 `eslint-plugin-import` 依赖版本为 `^2.29.1` 以规避漏洞。
  - 升级 `vue-template-compiler` 依赖版本为 `^2.7.16` 以规避漏洞。

- familyhelper-ui-view-pc 模块前端依赖升级。
  - 升级 `eslint-plugin-vue` 依赖版本为 `^8.7.1` 并解决兼容性问题，以应用其新功能。
  - 升级 `axios` 依赖版本为 `^1.6.7` 以规避漏洞。
  - 升级 `core-js` 依赖版本为 `^3.35.1` 以规避漏洞。
  - 升级 `echarts` 依赖版本为 `^5.4.3` 以规避漏洞。
  - 升级 `element-ui` 依赖版本为 `^2.15.14` 以规避漏洞。
  - 升级 `vue` 依赖版本为 `^2.7.16` 以规避漏洞。
  - 升级 `@vue/cli-plugin-babel` 依赖版本为 `^4.5.19` 以规避漏洞。
  - 升级 `@vue/cli-plugin-eslint` 依赖版本为 `^4.5.19` 以规避漏洞。
  - 升级 `@vue/cli-plugin-router` 依赖版本为 `^4.5.19` 以规避漏洞。
  - 升级 `@vue/cli-service` 依赖版本为 `^4.5.19` 以规避漏洞。
  - 升级 `@vue/eslint-config-airbnb` 依赖版本为 `^5.3.0` 以规避漏洞。
  - 升级 `eslint` 依赖版本为 `^6.8.0` 以规避漏洞。
  - 升级 `eslint-plugin-import` 依赖版本为 `^2.29.1` 以规避漏洞。
  - 升级 `vue-template-compiler` 依赖版本为 `^2.7.16` 以规避漏洞。

### Bug 修复

- 修复页面 bug。
  - 学习笔记 -> 笔记管理西侧笔记树选择项目时，新建节点和新建项目按钮点击报错。

### 功能移除

- (无)

---

## Release_1.1.1_20240126_build_A

### 功能构建

- familyhelper-ui-component-ckeditor5 模块前端依赖升级。
  - 升级 `postcss` 依赖版本为 `^8.4.33` 以规避漏洞。

- 增加页面功能。
  - 学习笔记 -> 笔记管理项目编辑器主面板笔记页签增加另存为附件功能。

- 增加富文本编辑器功能。
  - 增加 URL 导入图片功能。

- 优化文件创建对话框组件。
  - 去除不必要的外层 div。
  - 放宽文件名的限制，允许使用 `-`。
  - 增加模式属性，支持基于权限或手动指定指示器。

- 实现关于一级菜单。

### Bug 修复

- 修复组件 bug。
  - 修复文件对话框组件点击取消按钮时，控制台报错的 bug。

- 修复页面 bug。
  - 资产管理 -> 资产BOM管理中部面板资料页签主表格中只读权限用户仍可点击删除按钮。
  - 学习笔记 -> 笔记管理中部面板附件页签主表格中只读权限用户仍可点击删除按钮。
  - 资产管理 -> 资产BOM管理西侧面板项目树未选择数据时，头部面板按钮行为异常。
  - 学习笔记 -> 笔记管理西侧面板笔记树未选择数据时，头部面板按钮行为异常。

### 功能移除

- (无)

---

## Release_1.1.0_20240125_build_A

### 功能构建

- 去除 familyhelper-ui-view-pc 模块中对话框组件不必要的外层 div。
  - src/views/items/financeManagement/remindDriverSupport/RemindDriverSupportSelectDialog.vue。
  - src/views/items/notifyManagement/dispatcherSupport/DispatcherSupportSelectDialog.vue。
  - src/views/items/assetsManagement/assetCatalog/AssetCatalogSelectDialog.vue。
  - src/views/items/life/pbSet/PbSetSelectDialog.vue。
  - src/views/items/financeManagement/accountBook/AccountBookSelectDialog.vue。
  - src/views/items/notifyManagement/metaIndicator/MetaIndicatorSelectDialog.vue。
  - src/views/items/note/noteBook/NoteBookSelectDialog.vue。
  - src/views/items/life/activityTemplateDriverSupport/ActivityTemplateDriverSupportSelectDialog.vue。
  - src/views/items/notifyManagement/routerSupport/RouterSupportSelectDialog.vue。
  - src/views/items/notifyManagement/senderSupport/SenderSupportSelectDialog.vue。
  - src/views/items/projectHelper/memoRemindDriverSupport/MemoRemindDriverSupportSelectDialog.vue。
  - src/views/items/projectHelper/project/ProjectSelectDialog.vue。

- 执行 npm update，升级前端依赖。
  - familyhelper-ui-component-ckeditor5。
  - familyhelper-ui-view-mobile。
  - familyhelper-ui-view-pc。

- 依赖升级。
  - 升级 `spring` 依赖版本为 `5.3.31` 以规避漏洞。
  - 升级 `slf4j` 依赖版本为 `1.7.5` 以规避漏洞。

### Bug 修复

- 修正 familyhelper-ui-view-pc 模块中的拼写错误的文件名。
  - filtTypeConstants.js -> fileTypeConstants.js。

- 修复分页查询当前页数大于数据总页数时，查询行为不正常的 bug。

### 功能移除

- 删除不需要的依赖。
  - 删除 `org.slf4j:jcl-over-slf4j` 依赖。

---

## Release_1.0.10_20240123_build_A

### 功能构建

- PC 端代码格式优化。
  - src/views/items/meAndClannad/profileTypeIndicator/CategoryMaintainPanel.vue。

- 优化组件结构。
  - src/components/layout/TreePanel.vue。
  - src/components/layout/LazySearchTreePanel.vue。

- 实现日常生活一级菜单。
  - 活动数据集合二级菜单。
  - 活动数据管理二级菜单。
  - 活动类型管理二级菜单。
  - 活动模板驱动支持二级菜单。
  - 活动模板管理二级菜单。
  - 活动管理二级菜单。

- 优化页面。
  - 资金管理 -> 提醒驱动器支持文案优化。
  - 资金管理 -> 提醒驱动器支持选择对话框文案优化。
  - 学习笔记 -> 笔记管理左侧树面板优化。
  - 系统设置 -> 权限分组管理左侧树面板优化。
  - 日常生活 -> 个人最佳管理左侧树面板优化。
  - 资产管理 -> 资产BOM管理左侧树面板优化。
  - 系统设置 -> 权限分组管理主界面显示优化。

- 优化部分对话框的生成结构。
  - AccountBookSelectDialog。
  - ActivityTemplateDriverSupportSelectDialog。
  - AssetCatalogSelectDialog。
  - DispatcherSupportSelectDialog。
  - MemoRemindDriverSupportSelectDialog。
  - MetaIndicatorSelectDialog。
  - NoteBookSelectDialog。
  - PbSetSelectDialog。
  - ProjectSelectDialog。
  - RemindDriverSupportSelectDialog。
  - RouterSupportSelectDialog。
  - SenderSupportSelectDialog。

### Bug 修复

- 修复组件问题。
  - 修复 `CardPanel` 组件的名称问题。

- 修复权限表格切换分页时，分页信息不更新的 bug。
  - 资产管理 -> 资产目录管理 -> 权限管理对话框。
  - 资金管理 -> 账本管理 -> 功能编辑对话框 -> 权限管理页签。
  - 日常生活 -> 个人最佳集合 -> 权限管理对话框。
  - 日常生活 -> 活动数据集合 -> 权限管理对话框。
  - 我与家庭 -> 证件管理 -> 权限管理对话框。
  - 学习笔记 -> 笔记本 -> 权限管理对话框。
  - 工程助手 -> 工程管理 -> 权限管理对话框。

### 功能移除

- (无)

---

## Release_1.0.9_20230311_build_A

### 功能构建

- 框架优化。
  - 快捷导航栏增加快捷键。

- 文案优化。
  - 属性编辑 -> 编辑属性。

- 新增组件结构。
  - src/components/layout/FloatyDialog.vue。

- 优化页面。
  - 杂项 -> 文件编辑器内容优化。
  - 工程助手 -> 备忘录页面结构优化。
  - 工程助手 -> 历史备忘录页面结构优化。
  - 工程助手 -> 备忘录编辑器页面结构优化。
  - 系统设置 -> 配置类型管理表格面板增加右键菜单，提供复制类型功能。
  - 系统设置 -> 配置仓库维护表格面板增加右键菜单，提供复制节点功能。
  - 学习笔记 -> 笔记管理页面结构优化。
  - 资产管理 -> 资产BOM管理页面结构优化。
  - 资金管理 -> 账本管理增加刷新按钮。
  - 资产管理 -> 资产目录管理增加刷新按钮。
  - 日常生活 -> 个人最佳集合增加刷新按钮。
  - 学习笔记 -> 笔记本增加刷新按钮。
  - 工程助手 -> 工程管理增加刷新按钮。

### Bug 修复

- 修复备忘录提醒面板实体维护对话框中消息字段的初始值错误的 bug。

### 功能移除

- (无)

---

## Release_1.0.8_20230227_build_A

### 功能构建

- 实现工程助手一级菜单。
  - 备忘录编辑器二级菜单。

- 实现通知管理一级菜单。
  - 通知历史二级菜单。

- 优化组件结构。
  - src/components/text/TextEditor.vue。
  - src/components/entity/EntityMaintainDialog.vue。

- 优化页面。
  - 资金管理 -> 资金变更记录增加资金变更类型筛选器。
  - 工程助手 -> 备忘录增加优先级和星标。
  - 工程助手 -> 历史备忘录增加优先级和星标。
  - 通知管理 -> 通知接收增加主题列，点击主题后弹出主题和正文的通知详情对话框。
  - 工程助手 -> 备忘录页面重构。
  - 工程助手 -> 历史备忘录页面重构。
  - 工程助手 -> 备忘录西侧备忘录列表增加独立编辑右键菜单。
  - 工程助手 -> 历史备忘录西侧备忘录列表增加独立编辑右键菜单。
  - 系统设置 -> 权限节点管理列表增加邮件菜单，可快捷复制权限节点 ID。
  - 系统设置 -> 角色管理体验优化。
  - 杂项 -> 文件编辑器外观及快捷键优化。
  - 资金管理 -> 账本管理中的提醒管理编辑器优化表格列显示。
  - 工程助手 -> 备忘录编辑器增加提醒功能。

### Bug 修复

- 修正 vim 布局前景色不正常的问题。

- 修正杂项菜单配置文件中的错误。

- 修复页面 bug。
  - 资产管理 -> 资产BOM管理不能选择不属于自己但是有权限的资产目录。
  - 资产管理 -> 资产BOM管理只读模式下信息面板编辑按钮没有禁用。
  - 资产管理 -> 资产BOM管理资料面板类型未知的文件无法下载。
  - 学习笔记 -> 笔记管理附件面板类型未知的文件无法下载。
  - 工程助手 -> 备忘录文件面板类型未知的文件无法下载。
  - 通知管理 -> 通知设置西侧列表右键菜单分割线前景色不正常。
  - 资金管理 -> 资金变更记录西侧列表带类型查询行为不正常。

- 修复资金管理菜单下属二级子菜单的文案问题。

### 功能移除

- 移除页面。
  - 通知管理 -> 发送历史。

---

## Release_1.0.7_202301010_build_A

### 功能构建

- 优化页面。
  - 系统设置 -> 配置类型管理增加应用变更按钮。
  - 通知管理 -> 通知设置左侧通知设置面板表格增加右键菜单，提供复制主键功能。
  - 工程助手 -> 备忘录左侧备忘录头部栏增加刷新数据按钮。
  - 工程助手 -> 历史备忘录左侧备忘录头部栏增加刷新数据按钮。

### Bug 修复

- 修正 `工程助手` 菜单下的页面问题。
  - 修正 `工程选择对话框` 中的部分不正确的文本。
  - 修正 `工程选择对话框` 中卡片面板的所有者信息显示不合理的问题。

- 修正 `日常生活` 菜单下的页面问题。
  - 修正 `个人最佳集合选择对话框` 中的部分不正确的文本。
  - 修正 `个人最佳集合选择对话框` 中卡片面板的所有者信息显示不合理的问题。

- 修正 `资金管理` 菜单下的页面问题。
  - 修正 `账本选择对话框` 中卡片面板的所有者信息显示不合理的问题。

- 修正 `资产管理` 菜单下的页面问题。
  - 修正 `资产目录选择对话框` 中的部分不正确的文本。
  - 修正 `资产目录选择对话框` 中卡片面板的所有者信息显示不合理的问题。

- 修正 `学习笔记` 菜单下的页面问题。
  - 修正 `笔记本选择对话框` 中的部分不正确的文本。
  - 修正 `笔记本选择对话框` 中卡片面板的所有者信息显示不合理的问题。

- 修正 `系统设置` 菜单下的页面问题。
  - 修正 `角色管理` 页面中的部分不正确的文本。

### 功能移除

- (无)

---

## Release_1.0.6_20230101_build_A

### 功能构建

- 重构通知管理一级菜单。
  - 通知设置二级菜单。
  - 主题设置二级菜单。
  - 元数据指示器设置二级菜单。
  - 元数据设置二级菜单。
  - 发送器设置二级菜单。
  - 发送历史二级菜单。
  - 路由器设置二级菜单。
  - 调度器设置二级菜单。
  - 发送器设置二级菜单。

- 完成学习笔记一级菜单。
  - 笔记本二级菜单。
  - 笔记管理二级菜单。

- 资金管理模块页面优化。
  - 在资金变更管理页面增加了票据管理功能，可以为每条资金变更上传票据支持。
  - 资金变更管理页面中部分只读性质的按钮对访客权限的用户变得可用。

- 优化页面。
  - 登录页面登录时增加动画效果。
  - 资金管理 -> 余额记录页面待提交的银行卡增加角灯。
  - 系统设置 -> 权限节点管理增加刷新数据按钮。
  - 系统设置 -> 配置类型管理增加刷新数据按钮。
  - 通知管理 -> 主题设置增加新字段的显示与编辑。
  - 资金管理 -> 账本管理编辑功能增强，新增提醒驱动编辑功能。

- 移动页面。
  - 我与家庭 / 通知管理 -> 通知管理 / 通知接收。

- 完成我与家庭一级菜单。
  - 证件管理二级菜单。

- eznav 增加导航栏关闭后的行为配置。

- 新增组件结构。
  - src/components/layout/CornerLightPanel.vue。

- 优化组件结构。
  - src/components/file/FileUploadDialog.vue。
  - src/components/file/FileCreateDialog.vue。
  - src/components/layout/TreePanel.vue。

- 完成日常生活一级菜单。
  - 个人最佳集合二级菜单。
  - 个人最佳管理二级菜单。

### Bug 修复

- 修正 familyhelper-ui-distribute 模块的打包模式。

- 修正 `资金管理` 菜单下的页面问题。
  - 修正 `账本管理` 页面中的部分不正确的文本。
  - 修正 `资金变更记录` 页面错误的配置仓库项引用。

- 修正 `通知管理` 菜单下的页面问题。
  - 修正 `关联设置` 页面中删除数据时发生错误的问题。
  - 修正 `关联设置` 页面中错误的文本。

- 修正 `我与家庭` 菜单下的页面问题。
  - 修正 `证件管理` 页面中删除访问权限时发生错误的问题。

- 修复/优化通用组件的显示行为。
  - 修正 BorderLayoutPanel.vue 页边空白显示的问题。
  - 修正 TitleLayoutPanel.vue 未设定边界时组件页边空白的显示问题。

### 功能移除

- (无)

---

## Release_1.0.5_20220702_build_A

### 功能构建

- 实现通知管理一级菜单。
  - 路由器支持二级菜单。
  - 发送器支持二级菜单。
  - 主题设置二级菜单。
  - 通知设置二级菜单。
  - 路由器设置二级菜单。
  - 发送器设置二级菜单。
  - 关联设置二级菜单。

- 实现系统设置一级菜单。
  - 配置类型管理二级菜单。
  - 配置仓库维护二级菜单。

- 用户刷新、登出后，将 eznav 的信息存储到设置仓库中。

- 创建文件类型进行权限控制。

- 增加导航栏深度清理选项。

- 资金管理模块页面优化。
  - 增加账本选择器的默认选项，登出后可记忆。
  - 优化资金报告视图布局。

- 资产管理模块页面优化。
  - 增加资产目录选择器的默认选项，登出后可记忆。
  - 优化资产BOM管理视图布局。

- 我与家庭模块页面优化。
  - 家人称呼管理的新增、编辑页面中，家人ID选择器替换为标准账户选择器。

- 工程助手模块页面优化。
  - 增加工程选择器的默认选项，登出后可记忆。
  - 优化任务管理视图布局。
  - 优化任备忘录视图布局。
  - 优化任历史备忘录视图布局。

- eznav 导航栏在加载中面板处增加深度清理功能，提供了在加载失败后进行深度复位的能力。

- 优化公共组件。
  - EntityMaintainDialog.vue 增加 `top` 属性。
  - BorderLayoutPanel.vue 增加调节东西部面板宽度的属性。
  - TextEditor.vue 增加辅助工具插槽。

- 依赖升级。
  - 升级 `spring` 依赖版本为 `5.3.20` 以规避漏洞。
  - 升级 `log4j2` 依赖版本为 `2.17.2` 以规避漏洞。
  - 升级 `log4j2` 依赖版本为 `1.7.36` 以规避漏洞。

### Bug 修复

- 备忘录、历史备忘录页面 bug 修复。

- 修正文件编辑器中不正确的路径格式。

### 功能移除

- (无)

---

## Release_1.0.4_20220325_build_A

### 功能构建

- 使用 `LocalStorage` 代替 `Cookies` 存放 `EzNav` 的信息。

- 增加思维导图文件编辑器，但还未开发完成。

- 右上角头像和其对应的下拉菜单增加通知提醒功能。

- 优化权限节点管理页面，在 header panel 中增加 id 搜索框。

- 完成我与家庭一级菜单。
  - 通知管理二级菜单。

- 优化资产BOM管理页面，在访客模式下禁用了访客没有权限的按钮。

- 优化历史备忘录页面，完善了历史备忘录的查询、批量删除功能。

### Bug 修复

- (无)

### 功能移除

- (无)

---

## Release_1.0.3_20220309_build_A

### 功能构建

- 实现工程助手一级菜单。
  - 工程管理二级菜单。
  - 任务类型管理二级菜单。
  - 备忘录二级菜单。
  - 历史备忘录二级菜单。

- 前端工程结构变更。
  - 新建模块 familyhelper-ui-component-api, 用于分离 api。

- 添加项目的许可证。

- 升级 `log4j2` 依赖版本为 `2.17.1` 以规避漏洞。
  - `CVE-2021-44228`。
  - `CVE-2021-45105`。

- 解决部分 api 因版本升级导致的兼容性问题。

- 禁用 eslint 换行符检查。

### Bug 修复

- 优化工程结构，解决打包过程中遇到的问题。

### 功能移除

- (无)

---

## Release_1.0.2_20220205_build_A

### PC端功能构建

- 优化 components 结构。
  - 将 `ComingSoon.vue` 放置到单独的文件夹中。
  - 将 `LayoutPanel.vue` 重命名为 `BorderLayoutPanel.vue`。

- 优化 views 结构。
  - 将 `item` 文件夹重命名为 `items`。

- 实现资产管理一级菜单。
  - 资产目录管理二级菜单。
  - 项目类型管理二级菜单。
  - 项目标签管理二级菜单。
  - 资产BOM管理二级菜单。

- 实现杂项一级菜单。
  - 文件编辑器二级菜单。

- 优化了 CardPanel 的功能。
  - 简化代码。
  - 增加右键菜单的弹出功能。

- 优化了 TablePanel 的功能。
  - 简化代码。
  - 以插槽的方式重写了操作栏。
  - 增加右键菜单的弹出功能。

- 更新/完善页面。
  - 账本管理页面。
  - 银行卡管理页面。
  - 资金变更记录页面。

- 新建 `familyhelper-ui-component` 模块。
  - 新建 `familyhelper-ui-component-ckeditor5` 子模块，集成 `CKEditor5`。
  - 新建 `familyhelper-ui-component-iconfont` 子模块，集成 `Iconfont`。

### Bug 修复

- (无)

### 功能移除

- (无)

---

## Release_1.0.1_20211204_build_B

### PC端功能构建

- (无)

### Bug 修复

- 修复工程结构更改导致 `.eslintignore` 文件失效的 bug。
- 移除项目中多余的 console.log。

### 功能移除

- (无)

---

## Release_1.0.1_20211204_build_A

### PC端功能构建

- 更改登录界面背景图片、错误界面背景图片、主界面 banner 图标，对图片的体积进行压缩。

- 搭建我与家庭一级菜单。
  - 个人简介管理二级菜单。
  - 简介类型管理二级菜单。
  - 个人相册管理二级菜单。
  - 家人简介二级菜单。
  - 家庭相册二级菜单。
  - 家人称呼管理二级菜单。

- 完成我与家庭一级菜单当中的部分子菜单。
  - 个人简介管理二级菜单。
  - 简介类型管理二级菜单。
  - 家人简介二级菜单。
  - 家人称呼管理二级菜单。
  - 个人头像管理二级菜单。

- 个人简介管理优化逻辑，不再判断个人简介是否存在。

- 参考其它优秀项目重设前端布局。

### Bug 修复

- (无)

### 功能移除

- (无)

---

## Release_1.0.0_20211026_build_A

### 功能构建

- 调整工程结构，使其打包成功。

### PC端功能构建

- 完成资金管理一级菜单。
  - 账本管理二级菜单。
  - 银行卡类型管理二级菜单。
  - 银行卡管理二级菜单。
  - 余额记录二级菜单。
  - 资金变更类型管理二级菜单。
  - 资金变更记录二级菜单。
  - 资金报告二级菜单。

- 增加系统管理一级菜单功能。
  - 账户管理二级菜单。
  - 权限管理二级菜单。

### Bug 修复

- (无)

### 功能移除

- (无)
