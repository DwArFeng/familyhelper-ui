# library - 第三方组件库模块

library 模块是 VIM 的核心模块之一，负责处理第三方组件库的集成和使用。同时，该模块也负责处理组件库无关特性的实现。

## 目录结构

```
. - library 目录
├─── index.ts - 入口文件
├─── props.ts - 配置文件
├─── types.ts - 类型声明文件
├─── README.md - 此文件
└─┬─ modules - 模块目录
  ├─┬─ moduleAlpha - 模块 A
  │ ├─── index.ts - 模块 A 入口文件
  │ └─── ... - 模块 A 相关文件
  ├─┬─ moduleBravo - 模块 B
  │ ├─── index.ts - 模块 B 入口文件
  │ └─── ... - 模块 B 相关文件
  └─┬─ moduleCharlie - 模块 C
    ├─── index.ts - 模块 C 入口文件
    └─── ... - 模块 C 相关文件
```

## 使用说明

### 使用第三方组件

library 模块负责处理第三方组件库的集成和使用，这些组件的使用方法请参考对应的第三方文档。

### 使用 library API

在某些情况下，开发人员可能需要使用 library 模块提供的 API 来处理一些特定的功能。

在这种情况下，可以在 `VimApplicationContext` 中获取到 `library` 模块的实例对象，并使用 library API。

以主动发送通知为例，代码如下所示：

```typescript
import vim from '@/vim'

import { type VimLibrary } from '@/library/types.ts'

function notify(): void {
  const library: Omit<VimLibrary, "init"> = vim.ctx().library()
  library.defaultVisualizer().notify('errorMessage', 'This is a custom error.')
}
```

## 修改说明

### 修改配置

本模块使用的所有配置均在 `./props.ts` 文件中定义，您只需根据其中的注释修改所需的配置即可。

如果配置的修改是临时的，并且不希望被提交，可以使用以下小技巧：

- 将 `./props.ts` 文件中的修改放在另一个 Changelist 中，这样便可避免绝大多数令人尴尬的错误提交。
- 在 `./props.ts` 文件中的修改进行 `git stash`，然后在 `git commit` 时使用 `git stash pop` 恢复修改。
- 对于 idea 系列的 IDE，可以使用 `shelve` 功能，更加方便地管理临时修改。

### 增加模块

library 中的模块采用动态扫描机制，开发人员只需要在 `./modules` 目录下按照约定的规则添加模块目录，模块即可被 VIM 自动加载。

模块的名称为模块目录名称的 `kebab-case` 形式，模块目录下必须包含 `index.ts` 文件，
`index.ts` 文件需要默认导出一个 `VimLibraryModule` 类型的对象，
开发人员可以参考 `./types.ts` 文件中的 `VimLibraryModule` 类型定义，了解该对象的具体结构，并提供对应的方法实现。

一般来说，library 模块的用途有以下几种：

1. 引入第三方库的资源文件，如 CSS 文件、图片文件等。
2. 在 vue app 中注册第三方组件。
3. 提供可视化器组件。

#### 引入资源文件

在 `index.ts` 文件的头部导入资源文件，方法提供空实现/ null 返回值即可，代码如下所示：

```ts
import { type VimLibraryModule } from '@/library/types.ts'

import 'library.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init(): void {
}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
```

#### 注册第三方组件

在初始化方法中，通过 `VimApplicationContext` 拿到 vue 的 `App` 对象，并注册组件，代码如下所示：

```ts
import { type VimApplicationContext } from '@/vim/types.ts'
import { type VimLibraryModule } from '@/library/types.ts'

import ElementPLUS from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import 'element-plus/dist/index.css'

import './global.css'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init(ctx: VimApplicationContext): void {
  ctx.app.use(ElementPLUS, {
    locale: zhCn,
  })
}

function provideVisualizer(): null {
  return null
}

export default vimLibraryModule
```

#### 提供可视化器组件

在 `VimLibraryModule.provideVisualizer` 方法中提供格式化器的实现。

```ts
import {
  type Hyperscript,
  type NotifyType,
  type RenderType,
  type ResponseMeta,
  type VimLibraryModule,
  type Visualizer,
} from '@/library/types.ts'

import { type VNode } from 'vue'

// 在这个例子中，除了提供可视化器，还和上面的例子一样，同时引入了资源文件。
import './global.css'

// 组件导入（这些组件需要提前准备好）。
import LayoutComponent from './render/layout/Layout.vue'
import LoginComponent from './render/login/Login.vue'
import PageForbidden from './render/pageForbidden/PageForbidden.vue'
import PageNotFound from './render/pageNotFound/PageNotFound.vue'
import PageError from './render/pageError/PageError.vue'

const vimLibraryModule: VimLibraryModule = {
  init,
  provideVisualizer,
}

function init(): void {
}

function provideVisualizer(): Visualizer {
  return {
    // 对于 notify 方法，建议根据不同的类型进行不同的处理，以简化代码复杂度。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notify(type: NotifyType, ...args: any[]): void {
      switch (type) {
        case 'apiResponseBad':
          notifyApiResponseBad(args[0] as ResponseMeta)
          break
        case 'apiResponseError':
          notifyApiResponseError(args[0] as Error)
          break
        case 'errorMessage':
          notifyErrorMessage(args[0] as string)
          break
      }
    },
    // 对于 render 方法，建议根据不同的类型进行不同的处理，以简化代码复杂度。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(type: RenderType, ...args: any[]): VNode {
      switch (type) {
        case 'login':
          return renderLogin(args[0] as Hyperscript)
        case 'layout':
          return renderLayout(args[0] as Hyperscript)
        case 'pageForbidden':
          return renderPageForbidden(args[0] as Hyperscript)
        case 'pageNotFound':
          return renderPageNotFound(args[0] as Hyperscript)
        case 'pageError':
          return renderPageError(args[0] as Hyperscript)
      }
    },
  }
}

function notifyApiResponseBad(responseMeta: ResponseMeta): void {
  alert(`服务端通信错误，返回错误代码
错误代码: ${responseMeta.code}
错误信息: ${responseMeta.message}`)
}

function notifyApiResponseError(err: Error): void {
  alert(`通信错误
错误信息: ${err == null ? '' : err.message}`)
}

function notifyErrorMessage(message: string): void {
  alert(`内部错误
错误信息: ${message}`)
}

function renderLogin(h: Hyperscript): VNode {
  return h(LoginComponent)
}

function renderLayout(h: Hyperscript): VNode {
  return h(LayoutComponent)
}

function renderPageForbidden(h: Hyperscript): VNode {
  return h(PageForbidden)
}

function renderPageNotFound(h: Hyperscript): VNode {
  return h(PageNotFound)
}

function renderPageError(h: Hyperscript): VNode {
  return h(PageError)
}

export default vimLibraryModule
```
