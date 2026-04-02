# compreg - 组件注册模块

compreg 模块是 VIM 的核心模块之一，负责处理组件的注册和管理。

## 目录结构

```
. - compreg 目录
├─── index.ts - 入口文件
├─── props.ts - 配置文件
├─── types.ts - 类型声明文件
├─── README.md - 此文件
└─┬─ modules - 模块目录
  ├─── foo.ts - 组件注册模块 foo
  └─── bar.ts - 组件注册模块 bar
```

## 使用说明

### 使用 compreg API

在某些场景，尤其是需要根据不同的 component key 动态加载组件时，开发人员可能需要使用 compreg 模块提供的 API 来获取组件信息。

在这种情况下，可以在 `VimApplicationContext` 中获取到 `compreg` 模块的实例对象，并使用 compreg API。

以获取默认组件信息为例，代码如下所示：

```ts
import vim from '@/vim'

import {type VimCompreg} from '@/compreg/types.ts'

function getDefaultComponentInfo(): void {
    const compreg: Omit<VimCompreg, 'init'> = vim.ctx().compreg()
    const info = compreg.defaultComponentInfo()
    console.log(info.component)
}
```

以根据 key 获取组件信息为例，代码如下所示：

```ts
import vim from '@/vim'

import {type VimCompreg} from '@/compreg/types.ts'

function getComponentInfoByKey(): void {
    const compreg: Omit<VimCompreg, 'init'> = vim.ctx().compreg()
    const info = compreg.componentInfo('welcome')
    if (info) {
        console.log(info.component)
    }
}
```

## 修改说明

### 修改配置

本模块使用的所有配置均在 `./props.ts` 文件中定义，您只需根据其中的注释修改所需的配置即可。

如果配置的修改是临时的，并且不希望被提交，可以使用以下小技巧：

- 将 `./props.ts` 文件中的修改放在另一个 Changelist 中，这样便可避免绝大多数令人尴尬的错误提交。
- 在 `./props.ts` 文件中的修改进行 `git stash`，然后在 `git commit` 时使用 `git stash pop` 恢复修改。
- 对于 idea 系列的 IDE，可以使用 `shelve` 功能，更加方便地管理临时修改。

### 添加组件注册模块

compreg 中的模块采用动态扫描机制，开发人员只需要在 `./modules` 目录下按照约定的规则添加组件注册模块对应的文件，
组件注册模块即可被 VIM 自动加载。

组件注册模块定义在 `./modules/*.ts` 文件中，在实践中，通常一个功能模块对应一个 `./modules/*.ts` 文件。

对于 ts 文件的命名规则，VIM 框架没有特定的限制，在实践中，通常使用 `camelCase` 命名法命名。

ts 文件需要默认导出一个 `VimCompregModule` 类型的对象，VIM 会自动加载该对象，
开发人员可以参考 `./types.ts` 文件中的 `VimCompregModule` 类型定义，了解该对象的具体结构，并提供对应的方法实现。

在 `VimCompregModule` 中，`provideComponentSettings()`方法用于对 VIM 框架提供模块中所有的组件设置。

`VimCompregModule.provideComponentSettings()` 方法的返回值是 `ComponentSetting` 数组，
对于每一个元素，其完整配置示例代码如下所示：

```ts
import {type ComponentSetting} from './types.ts'

const example: ComponentSetting = {
    key: 'example',
    name: '示例',
    description: '示例页面。',
    exampleRouterComponentParam: {
        '': {},
        foo: {},
        bar: {},
    },
    component: {
        '': () => import('@/views/nodes/foo/example/Example.vue'),
        foo: () => import('@/views/nodes/foo/example/Example.vue'),
        bar: () => import('@/views/nodes/bar/example/Example.vue'),
    },
}
```

对于上述示例代码：

- `key`：组件的唯一标识符，用于通过 `compreg.componentInfo(key)` 方法获取组件信息。
- `name` / `description`：展示用名称与说明。
- `exampleRouterComponentParam`：各 Visualizer 下的示例路由组件参数；顶层键可使用 camelCase，由 compreg 聚合时规范为
  kebab-case。
- `component`：组件对象，是一个 `Record<string, any>` 结构，其中：
  - 键（如 `''`、`foo`、`bar`）表示不同的 Visualizer 名称。
  - 值表示组件值，应符合 vue3 的标准组件定义，为静态导入或动态导入的组件对象。
  - 必须提供一个 `''` 键作为默认值，以便在找不到当前 Visualizer 对应的组件时使用。

一个完整的模块文件示例代码如下所示：

`./modules/example.ts`：

```ts
// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import {type ComponentSetting, type VimCompregModule} from '@/compreg/types.ts'

/**
 * VIM Compreg 模块。
 */
const vimCompregModule: VimCompregModule = {
    init,
    provideComponentSettings,
}

/**
 * 初始化。
 */
function init(): void {
}

/**
 * ComponentSetting 数组。
 */
const compregSettings: ComponentSetting[] = [
    {
        key: 'example',
        name: '示例',
        description: '示例页面。',
        exampleRouterComponentParam: {
            '': {},
            foo: {},
            bar: {},
        },
        component: {
            '': () => import('@/views/nodes/foo/example/Example.vue'),
            foo: () => import('@/views/nodes/foo/example/Example.vue'),
            bar: () => import('@/views/nodes/bar/example/Example.vue'),
        },
    },
]

/**
 * 提供 ComponentSetting。
 */
function provideComponentSettings(): ComponentSetting[] {
    return compregSettings
}

export default vimCompregModule
```
