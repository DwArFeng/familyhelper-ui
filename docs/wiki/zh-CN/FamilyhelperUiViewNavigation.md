# Familyhelper UI View - 导航模块

本文说明 `familyhelper-ui-view` 中导航模块的职责、使用方式、配置位置与扩展约定，
覆盖 `webapp-pc`、`webapp-mobile` 的 `src/navigation` 模块。

导航模块负责维护节点树，并在每个节点上声明菜单显示信息、路由元数据和权限元数据。
业务菜单通过 `modules/*.ts` 提交节点设置；路由模块按这些元数据装配页面路由，
Visualizer 负责渲染菜单，`compreg` 按组件 key 解析实际页面组件。

## 适用范围

本文适用于以下源码：

- `packages/webapp-pc/src/navigation`：PC 端导航模块。
- `packages/webapp-mobile/src/navigation`：移动端导航模块。

路由装配、路由守卫和侧栏渲染会读取导航结果，本文只说明它们与导航字段的对应关系。
相关入口包括两端的 `src/router/index.ts`、`src/router/guards.ts`，以及各 Visualizer 的侧栏组件。

本文不逐一列举全部业务菜单，也不展开 Store 生命周期、组件注册步骤和视图目录约定。
跨模块的启动链路与职责边界见 [VIM Architecture](./VimArchitecture.md)。

PC 端与移动端当前使用相同的导航模块结构，但它们是两个独立应用。
修改其中一个应用的 `src/navigation/props.ts` 或 `modules/*.ts` 不会自动同步到另一个应用。
当前业务节点的权限字符串前缀也彼此独立：PC 端使用 `ui.pc;ui.pc.menu_visible...`，
移动端使用 `ui.mobile;ui.mobile.menu_visible...`。

## 目录结构

两端的 `src/navigation` 目录结构相同：

```text
src/navigation/
├── index.ts    - 模块入口、节点聚合与生命周期
├── props.ts    - 默认节点和 EzNav 配置
├── types.ts    - VimNavigation、NodeSetting、NodeInfo 等类型
├── README.md   - 模块内简要说明
└── modules/    - 按菜单分组的节点设置
    └── *.ts
```

各文件职责如下：

| 文件           | 主要职责                                                                                    |
|----------------|---------------------------------------------------------------------------------------------|
| `index.ts`     | 扫描 `modules/*.ts`，把 `NodeSetting` 转为 `NodeInfo`，组装父子关系并切换初始化状态         |
| `props.ts`     | 提供 `defaultNodeKey`、`ezNavEnabled`、`ezNavMaxActiveItem`、`ezNavRestoreWhenLogin`        |
| `types.ts`     | 声明 `VimNavigation`、`NavigationSetting`、`NodeInfo`、`NodeSetting`、`VimNavigationModule` |
| `modules/*.ts` | 默认导出一个 `VimNavigationModule`，通常一个大菜单对应一个文件                              |

`index.ts` 使用 `import.meta.glob('./modules/*.ts', { eager: true })` 加载模块。
该扫描只包含 `modules` 目录当前这一层的 `.ts` 文件，不包含子目录。
每个文件必须默认导出 `VimNavigationModule`。
`init(ctx: VimApplicationContext)` 可以返回 `void` 或 `Promise<void>`；
返回 Promise 时，导航模块会等该 Promise 完成后再调用 `provideNodeSettings()`。

聚合时采用以下规则：

- `display` 的键会通过 `toKebabCase` 写入 `NodeInfo`。源码中的 `elementPlusEngineering` 会变成 `element-plus-engineering`。
- 省略的 `menu`、`ezNav` 会变成 `shown: false`。省略的 `router`、`permission` 会变成 `required: false`。
- `key` 重复时抛出「导航节点 \<key\> 重复」。
- `parentKey` 为 `null` 时，节点进入根节点数组；否则把自身 `key` 放入父节点的 `childKeys`。
- 每个节点的 `childKeys` 按 `index` 升序排序。
- `nodeRootKeys` 保持节点被组装时的顺序，不在这里按 `index` 重排。
- 初始化完成后，模块状态从 `initializing` 变为 `initialized`。

`parentKey` 必须为 `null`，或指向同一次聚合中已经存在的节点 `key`。
父节点不存在时，初始化会在读取该父节点的 `childKeys` 时失败。

文件名在实践中使用 camelCase。节点身份由 `NodeSetting.key` 决定，文件名本身不是节点 key。

PC 端当前的模块文件为 `about.ts`、`assetManagement.ts`、`auditManagement.ts`、`developerTools.ts`、
`fileio.ts`、`financeManagement.ts`、`life.ts`、`logicEngine.ts`、`miscellaneous.ts`、`note.ts`、
`notifyManagement.ts`、`settingrepo.ts`、`systemSettings.ts`、`welcome.ts`。

移动端当前的模块文件为 `developerTools.ts`、`miscellaneous.ts`、`navigationDemo.ts`、
`systemSettings.ts`、`welcome.ts`。

两端文件列表不同，反映的是各自的业务菜单范围。
需要同一菜单在两端都出现时，应分别在两个 `modules` 目录中提供节点。

## 使用说明

初始化完成后，通过 `vim.ctx().navigation()` 读取节点和设置。
节点本身在 `modules/*.ts` 中声明。菜单、路由和权限是同一个 `NodeSetting` 上的不同字段，
由侧栏、路由和守卫分别消费。

### 使用 navigation API

业务代码只读取导航对象，不调用 `init`。
以下示例在 VIM 初始化完成后打印根节点 key：

```typescript
import vim from '@/vim'

import { type VimNavigation } from '@/navigation/types.ts'

function printNodeRootKeys(): void {
  const navigation: Omit<VimNavigation, 'init'> = vim.ctx().navigation()
  console.log(navigation.nodeRootKeys())
}
```

`setting` 可以在任意 VIM 状态下读取。当前字段和默认值如下：

| 字段                    | 当前默认值         | 说明                                                         |
|-------------------------|--------------------|--------------------------------------------------------------|
| `defaultNodeKey`        | `welcome`          | 必须是某个 `NodeSetting.key`                                 |
| `ezNavEnabled`          | `true`             | 是否启用 EzNav                                               |
| `ezNavMaxActiveItem`    | `1000`             | EzNav 最大活动项数量                                         |
| `ezNavRestoreWhenLogin` | `restore-pinned`   | 登录恢复时保留固定项；另一可选值为 `restore-all`             |

PC 端 `props.ts` 把默认节点导出为 `defaultNavigationKey`，移动端导出为 `defaultNodeKey`。
两个常量都会写入 `setting.defaultNodeKey`。

`nodeRootKeys()` 返回根节点 key，顺序是组装顺序。
`nodeInfos()` 返回 `Readonly<Record<string, NodeInfo>>`。
每条 `NodeInfo` 包含 `parentKey`、`childKeys`、`key`、`index`、`display`、`menu`、`ezNav`、`router` 和 `permission`。
这两个函数只能在导航模块进入 `initialized` 之后调用。
状态仍为 `initializing` 时，读取 `nodeRootKeys()` 会抛出「不能在 initializing 状态下获取 nodeRootKeys」，
读取 `nodeInfos()` 会抛出「不能在 initializing 状态下获取 nodeInfos」。

调用 `vim.ctx()` 和 `navigation()` 时，VIM 必须已经初始化完成。
普通页面和初始化完成钩子满足这一条件；不要在模块加载的顶层立即取得导航对象，也不要在业务代码中再次执行 `init`。

### 导航节点与菜单

`menu` 可以省略。省略后 `menu.shown` 为 `false`。
`menu.shown` 决定侧栏是否列出该节点，路由是否存在由 `router` 字段单独决定。

两端的 `welcome` 节点当前都是 `menu.shown: false`、`ezNav.shown: true`、`affix: true`。
因此首页不出现在侧栏中，仍可以出现在 EzNav 中，并通过路由打开。

侧栏先取得根节点或子节点，再保留 `menu.shown` 为 `true` 的节点。
PC 端 `elementPlusEngineering` 的侧栏还会对根节点按 `index` 升序排序。
`index.ts` 不对 `nodeRootKeys` 排序，其它 Visualizer 是否再次排序以其侧栏实现为准。

`SidebarItem` 在 `permission.required` 为 `true` 时，还会读取 `lnp` Store 的 `hasPermission`。
权限节点缺失，或当前用户没有该权限时，该项不会渲染。

`index` 数值越小，节点越靠前。它决定同级顺序。
同一父节点下的新菜单，实践中从 `10` 开始，并以 `10` 递增，便于以后插入。
现有首页节点的 `index` 为 `0`，PC 端系统设置根节点的 `index` 为 `140`。

`display` 是按 Visualizer 名称组织的对象。写入 `NodeInfo` 之前，键会被转换成 kebab-case。
`elementPlusEngineering` 解析标签时，先取 `element-plus-engineering` 的 `messageKey` 或 `label`，
再回退到 `element-plus`，最后回退到空字符串键。
`elementPlus` 解析标签时，先取 `element-plus` 的 `label`，再回退到空字符串键。
PC 端首页和系统设置节点同时提供空字符串键、`comvisual`、`elementPlus` 的 `label`，
以及 `elementPlusEngineering` 的 `messageKey`。`messageKey` 需要能被对应文案解析。
移动端首页当前提供空字符串键和 `comvisual` 的 `label`。

EzNav 与侧栏菜单相互独立。`ezNav` 省略时 `shown` 为 `false`。
需要出现在 EzNav 中时，设置 `shown: true`，并按需提供：

- `affix`：为 `true` 时该项固定，且不能被关闭。首页使用这个设置。
- `affixIndex`：固定项的顺序，数值越小越靠前。
- `closedBehavior.type`：`back` 表示返回上一级，`default` 表示返回默认页面，`none` 表示不做任何操作。

`props.ts` 的 `ezNavEnabled` 为 `true` 时，路由守卫才会把 `ezNav.shown` 为真的节点推入 EzNav。

### 导航节点与路由

`router` 可以省略。省略后 `router.required` 为 `false`。
这类节点适合作为菜单目录：侧栏可以显示它，选中后不会执行 `push`。

`router.required` 为 `true` 时，需要提供 `path` 和 `component.key`。
路由模块会把它注册为布局路由的子路由：

- 路由名是节点 `key`。
- 路径是 `/vim/layout/` 再接 `router.path`。
- 组件先按 `component.key` 到 `compreg` 查找；找到后先取当前 Visualizer 对应的组件，再回退空字符串键。
- 没有对应注册信息时，使用默认组件的空字符串键。
- `component.param` 采用同样的回退：先取当前 Visualizer，再取空字符串键。

布局路由的重定向名是 `setting.defaultNodeKey`。
当前默认值 `welcome` 必须是一个已经声明的节点 key。

以 PC 端系统设置中的账户管理节点为例，三项标识对应如下：

- 节点 key 和路由名：`systemSettings.account`。
- `router.path`：`system-settings/account`，完整路径为 `/vim/layout/system-settings/account`。
- `router.component.key`：`systemSettings.account`，由 `compreg` 按这个 key 解析页面组件。

### 导航节点与权限

`permission` 可以省略。省略后 `permission.required` 为 `false`，节点不检查权限。
两端首页 `welcome` 当前都是这种公共节点。

`permission.required` 为 `true` 时，需要提供 `permission.node`。
侧栏在权限节点缺失或 `hasPermission` 返回假时不渲染该项。
路由守卫另行判断：当前未登录时进入 `vim.login`；
节点要求权限，但权限节点缺失或当前用户不具备该权限时，进入 `vim.pageForbidden`。

菜单是否可见和路由是否放行需要分别确认。
`menu.shown` 为 `false` 时，节点不出现在侧栏中，路由守卫仍然生效。
侧栏已经显示出的节点，直接访问其地址时仍会经过登录检查和权限检查。

权限字符串使用所在应用的前缀。PC 端账户管理节点的当前值为：

```text
ui.pc;ui.pc.menu_visible.system_settings.account
```

移动端对应节点使用 `ui.mobile;ui.mobile.menu_visible...`。
同一业务节点需要同时出现在两端时，权限字符串分别使用对应前缀。

## 修改说明

修改默认节点和 EzNav 开关时，编辑对应应用的 `props.ts`。
增加或调整菜单时，编辑对应应用的 `modules/*.ts`。两端配置各自生效。

### 修改配置

运行配置位于：

- `packages/webapp-pc/src/navigation/props.ts`
- `packages/webapp-mobile/src/navigation/props.ts`

当前默认值如下：

| 配置项                  | 当前默认值       | 说明                                                                          |
|-------------------------|------------------|-------------------------------------------------------------------------------|
| `defaultNodeKey`        | `welcome`        | PC 端导出名为 `defaultNavigationKey`，移动端导出名为 `defaultNodeKey`         |
| `ezNavEnabled`          | `true`           | 为真时，守卫才会把节点推入 EzNav                                              |
| `ezNavMaxActiveItem`    | `1000`           | EzNav 最大活动项数量                                                          |
| `ezNavRestoreWhenLogin` | `restore-pinned` | 可选值为 `restore-pinned` 或 `restore-all`                                    |

`defaultNodeKey` 必须等于某个模块 `provideNodeSettings()` 返回的 `NodeSetting.key`。
只修改一端的 `props.ts` 只影响该应用。

配置改动只用于本机联调、准备以后撤回时，可以使用导航模块 README 中的隔离办法：

- 把 `props.ts` 的修改放在独立 Changelist 中。
- 提交前对这部分修改执行 `git stash`，提交后再 `git stash pop`。
- 在 IDEA 系列 IDE 中使用 Shelve 保存临时修改。

导航节点、默认节点和 EzNav 配置都写在 `src/navigation` 中。
不要把它们写入 `scripts-config.json`；该文件只管理构建脚本和前端开发服务器配置。

### 添加导航节点

新增节点时按以下步骤处理：

1. 确认目标是 PC 端、移动端，还是两端都要增加。两端都需要时，分别修改两个应用。
2. 在对应应用的 `src/navigation/modules` 下新增 camelCase 文件，或扩展已有文件。文件必须直接位于 `modules` 目录下。
3. 默认导出 `VimNavigationModule`。`init` 可以是空函数，`provideNodeSettings` 返回 `NodeSetting[]`。
4. 保证 `key` 在该应用的全部模块中唯一。
5. `parentKey` 使用 `null` 表示根节点；否则填写已经存在的父节点 key。
6. 同一父节点下安排 `index`。新菜单可从 `10` 起按 `10` 递增。
7. `display` 至少包含空字符串键。已注册的 Visualizer 需要各自的显示信息；`elementPlusEngineering` 使用的 `messageKey` 要能被文案解析。
8. 只在需要时提供 `menu`、`ezNav`、`router` 和 `permission`。
9. `router.required` 为 `true` 时，`component.key` 要能被 `compreg` 解析到页面组件。
10. `permission.required` 为 `true` 时，使用当前应用的权限前缀。
11. `index.ts` 会在初始化时扫描 `modules/*.ts`，新增文件后不需要再手工登记。

一个同时包含目录节点和页面节点的模块可以写成：

```typescript
import { type NodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * 节点设置数组。
 */
const nodeSettings: NodeSetting[] = [
  {
    parentKey: null,
    key: 'systemSettings',
    index: 140,
    display: {
      '': {
        label: '系统设置',
      },
      comvisual: {
        label: '系统设置',
      },
      elementPlus: {
        label: '系统设置',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.system_settings',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.system_settings',
    },
  },
  {
    parentKey: 'systemSettings',
    key: 'systemSettings.account',
    index: 10,
    display: {
      '': {
        label: '账户管理',
      },
      comvisual: {
        label: '账户管理',
      },
      elementPlus: {
        label: '账户管理',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.system_settings.account',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'system-settings/account',
      component: {
        key: 'systemSettings.account',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.system_settings.account',
    },
  },
]

/**
 * 提供 NodeSetting。
 */
function provideNodeSettings(): NodeSetting[] {
  return nodeSettings
}

export default vimNavigationModule
```

上面的权限字符串使用 PC 端前缀。移动端写成 `ui.mobile;ui.mobile.menu_visible...`。
目录节点没有提供 `router`，选中后只负责展开子菜单；子节点提供了路由，打开时使用节点 key 作为路由名。

## 常见问题

### 导航节点未显示

按以下顺序检查：

1. 文件是否直接位于 `src/navigation/modules/*.ts`，并且使用默认导出。子目录中的文件不会被扫描。
2. 启动时是否抛出「导航节点 \<key\> 重复」。key 重复会使初始化失败。
3. `parentKey` 是否为 `null` 或已有节点。父节点不存在时，初始化会在访问父节点 `childKeys` 时失败。
4. 侧栏场景下 `menu.shown` 是否为 `true`。`welcome` 当前不在侧栏显示。
5. `permission.required` 为 `true` 时，当前登录用户是否通过 `hasPermission`。未通过时 `SidebarItem` 不渲染该项。
6. 父节点是否已经因为菜单开关或权限过滤而没有出现。子节点挂在未出现的父节点下时，不会出现在该菜单分支中。
7. 修改是否落在当前打开的应用。PC 端和移动端的 `modules` 目录各自生效。
8. `index` 是否只被用来比较顺序。它决定同级先后，不决定节点是否载入。

如果错误信息是「不能在 initializing 状态下获取 nodeRootKeys」或「不能在 initializing 状态下获取 nodeInfos」，
说明读取发生在导航模块初始化完成之前。把调用放到 VIM 初始化完成之后。

### 菜单可以显示但页面无法打开

菜单已经显示，说明 `menu.shown` 和侧栏权限过滤已经通过。页面能否打开还要检查路由：

1. `router.required` 是否为 `true`。目录节点没有路由，选中后不会打开页面。
2. 路由名是否就是节点 `key`。侧栏在节点需要路由时执行 `push({ name: nodeInfo.key })`。
3. `router.component.key` 是否已经在 `compreg` 中注册。未注册时路由会使用默认组件的空字符串键，打开的可能是默认组件。
4. 当前 Visualizer 的组件映射和 `component.param` 是否准备了空字符串键作为回退。
5. 当前未登录时，守卫会进入 `vim.login`。权限节点与当前用户权限不一致时，守卫会进入 `vim.pageForbidden`。

路径需要与 `router.path` 一致。账户管理节点的路径是 `system-settings/account`，
完整地址位于 `/vim/layout/` 之下。

## 参阅

组件注册、路由和视图目前还没有独立的 wiki 页面。这三部分与导航模块的职责边界见
[VIM Architecture](./VimArchitecture.md)。

- [Familyhelper UI View](./FamilyhelperUiView.md) - 前端 view 模块（monorepo）导读，
  说明模块定位、包划分与后续文档阅读顺序，细节请参阅该目录内 `README.md`。
- [Familyhelper UI View Development](./FamilyhelperUiViewDevelopment.md) - 前端 view 模块本地开发指南，
  说明环境准备、依赖安装、配置生成、构建、单包开发和代码检查流程。
- [Familyhelper UI View API](./FamilyhelperUiViewApi.md) - API 接口请求模块说明，
  介绍 PC、移动端 API 配置、请求客户端，以及二者与 `component-api` 的协作和修改边界。
- [VIM Architecture](./VimArchitecture.md) - VIM 总体架构说明，
  梳理 `vim -> api/compreg/library/navigation/router/store/views` 的职责边界、启动链路与协作时序。
