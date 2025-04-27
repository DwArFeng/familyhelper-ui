# navigation - 导航模块

navigation 模块是 VIM 的核心模块之一，负责处理导航逻辑。

## 目录结构

```
. - navigation 目录
├─── index.ts - 入口文件
├─── props.ts - 配置文件
├─── types.ts - 类型声明文件
├─── README.md - 此文件
└─┬─ modules - 模块目录
  ├─── foo.ts - 导航菜单 foo
  └─── bar.ts - 导航菜单 bar
```

## 使用说明

### 使用 navigation API

在某些场景，尤其是 library 模块的 `Visualizer` 实现中，开发人员可能需要使用 navigation 模块提供的 API 来处理一些特定的功能。

在这种情况下，可以在 `VimApplicationContext` 中获取到 `navigation` 模块的实例对象，并使用 navigation API。

以获取根节点导航信息为例，代码如下所示：

```ts
import vim from '@/vim'

import { type VimNavigation } from '@/navigation/types.ts'

function printNodeRootKeys(): void {
  const navigation: Omit<VimNavigation, "init"> = vim.ctx().navigation()
  console.log(navigation.nodeRootKeys())
}
```

## 修改说明

### 修改配置

本模块使用的所有配置均在 `./props.ts` 文件中定义，您只需根据其中的注释修改所需的配置即可。

如果配置的修改是临时的，并且不希望被提交，可以使用以下小技巧：

- 将 `./props.ts` 文件中的修改放在另一个 Changelist 中，这样便可避免绝大多数令人尴尬的错误提交。
- 在 `./props.ts` 文件中的修改进行 `git stash`，然后在 `git commit` 时使用 `git stash pop` 恢复修改。
- 对于 idea 系列的 IDE，可以使用 `shelve` 功能，更加方便地管理临时修改。

### 添加导航节点

navigation 中的模块采用动态扫描机制，开发人员只需要在 `./modules` 目录下按照约定的规则添加导航节点对应的模块文件，
导航节点即可被 VIM 自动加载。

导航节点定义在 `./modules/*.ts` 文件中，在实践中，通常一个大菜单对应一个 `./modules/*.ts` 文件。

对于 ts 文件的命名规则，VIM 框架没有特定的限制，在实践中，通常使用 `camelCase` 命名法命名。

ts 文件需要默认导出一个 `VimNavigationModule` 类型的对象，VIM 会自动加载该对象，
开发人员可以参考 `./types.ts` 文件中的 `VimNavigationModule` 类型定义，了解该对象的具体结构，并提供对应的方法实现。

在 `VimNavigationModule` 中，`provideNavigationNodeSettings()`方法用于对 VIM 框架提供模块中所有的节点设置，
在实践中，通常是一个大菜单以及其下的所有子菜单。

`VimNavigationModule.provideNavigationNodeSettings()` 方法的返回值是 `NavigationNodeSetting` 数组，
对于每一个元素，其完整配置示例代码如下所示：

```ts
import { type NavigationNodeSetting } from './types.ts'

const example: NavigationNodeSetting = {
  parentKey: 'parent_node.key',
  key: 'node.key',
  index: 10,
  display: {
    label: 'Example label here',
    iconClass: 'menu-item',
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
    path: 'node-path-here',
    component: () => import('@/views/items/yourComponentPath/YourComponent.vue'),
  },
  permission: {
    required: true,
    node: 'node.your_permission_here',
  },
}
```

对于上述示例代码：

- `parentKey`：父节点的 key，通常是上一级菜单的 key；如果该菜单是根节点，则该值为 `null`。
- `index`：在实践中，推荐从 `10` 开始，每个菜单递增 `10`，以便于后续添加菜单时的插入。
- `display`：菜单的显示设置，对象中的字段取值由 library 模块的 `Visualizer` 决定。
- `menu`：菜单的设置，如果不需要在菜单中显示该节点，则可以不提供该字段。
- `ezNav`：ezNav 的设置，如果不需要在 ezNav 中显示该节点，则可以不提供该字段。
- `router`：路由的设置，如果改节点不需要路由，则可以不提供该字段。
- `permission`：权限的设置，如果该节点不需要权限，则可以不提供该字段。

一个完整的模块文件示例代码如下所示：

`./modules/foobar.ts`：

```ts
// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NavigationNodeSetting, VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNavigationNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {
}

/**
 * Navigation 节点数组。
 */
const navigationNodes: NavigationNodeSetting[] = [
  {
    parentKey: null,
    key: 'settingrepo',
    index: 135,
    display: {
      label: '配置仓库',
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.settingrepo',
    },
  },
  {
    parentKey: 'settingrepo',
    key: 'settingrepo.settingCategory',
    index: 10,
    display: {
      label: '配置类型管理',
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
      path: 'settingrepo/setting-category',
      component: () => import('@/views/nodes/settingrepo/settingCategory/SettingCategory.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.settingrepo.setting_category',
    },
  },
]

/**
 * 提供 NavigationNodeSetting。
 */
function provideNavigationNodeSettings(): NavigationNodeSetting[] {
  return navigationNodes
}

export default vimNavigationModule
```
