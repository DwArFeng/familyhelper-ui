# view - 视图目录

view 目录是 VIM 本项目的视图目录，包含了项目的所有视图文件。

## 目录结构

```
. - view 目录
├─── README.md - 此文件
├─┬─ nodes - （导航）节点视图目录
│ ├─── directoryAlpha - 视图目录 A
│ ├─── directoryBravo - 视图目录 B
│ └─── ... - 其它视图目录
└─┬─ vim - VIM 视图目录
  ├─── layout - 布局视图目录
  ├─── login - 登录视图目录
  ├─── pageError - 页面错误视图目录
  ├─── pageForbidden - 页面禁止访问视图目录
  └─── pageNotFound - 页面未找到视图目录
```

## 使用说明

### （导航）节点视图目录

（导航）节点视图目录 `./nodes` 负责存放项目的所有导航节点视图文件，
有关导航节点的说明请参考 [导航模块](../navigation/README.md) 文档。

（导航）节点视图目录是开发人员进行业务页面开发的主要目录，任何业务页面均应存放在该目录下。

（导航）节点视图目录内部没有严格的目录结构要求，开发人员可以根据实际情况自行组织目录结构，
但是在长期实践中，通常会按照以下的原则组织目录结构：

- 每个一级子目录对应一个导航节点（通常是一个大菜单），子目录名称使用 `camelCase` 命名法命名。
- 子目录下建立第二级子目录，第二级子目录对应一个业务页面（通常是一个子菜单），第二级子目录名称使用 `camelCase` 命名法命名。
- 二级子目录下存放业务页面的视图文件，以及子组件目录。

对于二级目录，通常会包含视图文件（`.vue` 文件）和子组件目录（如 `subDialogs`, `subPanels` 等），通常按照以下规则组织：

- 视图文件通常是一个 `.vue` 文件，命名使用 `PascalCase` 命名法，所有被菜单引用，或被其它视图引用的视图文件都应存放在此处。
- 如果视图文件足够简单，则直接在视图文件中编写所有的代码。
- 如果视图文件较复杂，则可以将其拆分为多个子组件，子组件通常存放在 `subDialogs`, `subPanels` 等目录中。
- 放在子组件目录中的子组件通常只能被当前业务页面引用，不能被其它业务页面引用，如果需要被其它业务页面引用，则应放在二级目录下。

例如：

```
. - nodes 目录
├─── systemSettings - 系统设置导航节点
│ ├─┬─ accountSecurity - 账号安全业务页面
| | ├─── AccountSecurity.vue - 账号安全视图文件
| | ├─── AccountSecurityEditPanel.vue - 账号安全编辑面板视图文件
| | ├─── subDialogs - 子对话框目录
| | └─── subPanels - 子面板目录
│ └─┬─ permissionGroup - 权限分组业务页面
|   ├─── PermissionGroup.vue - 权限分组视图文件
|   └─── subPanels - 子面板目录
└─── ... - 其它导航节点视图目录
```

### VIM 视图目录

VIM 视图目录 `./vim` 负责存放 VIM 的所有视图文件，主要包括布局视图、登录视图、错误页面等。

VIM 视图目录内的文件通常是固定不变的，它的结构与 `第三方组件库模块` 中的 `Visualizer` 实现密切相关，
因此，该项目中的 VIM 视图目录结构应该由 VIM 框架的设计者维护，开发人员不需要修改。

VIM 视图目录下包含以下子二级目录，与 `第三方组件库模块` 中的 `Visualizer` 一一对应：

| Directory name  | Visualizer method                                                           |
|:----------------|:----------------------------------------------------------------------------|
| `layout`        | `render(type: Extract<RenderType, 'layout'>, h: Hyperscript): VNode`        |
| `login`         | `render(type: Extract<RenderType, 'login'>, h: Hyperscript): VNode`         |
| `pageError`     | `render(type: Extract<RenderType, 'pageError'>, h: Hyperscript): VNode`     |
| `pageForbidden` | `render(type: Extract<RenderType, 'pageForbidden'>, h: Hyperscript): VNode` |
| `pageNotFound`  | `render(type: Extract<RenderType, 'pageNotFound'>, h: Hyperscript): VNode`  |

VIM 视图目录下的每个子目录都只包含一个视图文件，视图文件的命名使用 `PascalCase` 命名法。

视图文件使用了代理模式进行实现，即使用 `Hyperscript` 动态渲染 `第三方组件库模块` 中的 `Visualizer` 提供的组件。

使用者如对相关技术感兴趣，
可以参考 [Render Functions & JSX](https://vuejs.org/guide/extras/render-function.html) 文档进行进一步了解。
