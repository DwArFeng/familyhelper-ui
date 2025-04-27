# vim - Vue Interactive Model 工程模板

VIM(Vue Interactive Model) 是一个基于 Vue3 + Vite + TypeScript 的工程模板，旨在简化开发人员的开发流程，提高开发效率。
它集成了前端页面中常用的功能模块，提供了丰富的工具类和函数。

VIM 整合了 API 接口请求、第三方组件库、导航、路由、状态管理，从而提供包含菜单、页签、权限控制、通知等功能的完整解决方案。
它使得开发人员可以专注于业务页面本身的开发，而不必过多关注底层的实现细节。

## 目录结构

```
. - vim 目录
├─── index.ts - 入口文件
├─── types.ts - 类型声明文件
└─── README.md - 此文件
```

## 使用说明

### 引入 vim 对象

vim 对象是 VIM 的核心对象，包含了 VIM 的所有功能模块。开发人员可以在需要时从 `.vue`, `.ts` 或 `.js` 文件中引入 vim 对象。

通过如下指令使用 vim 对象：

```typescript
import vim from '@/vim'

import { type VimApplicationContext } from '@/vim/types.ts'

function vimUseDemo(): void {
  const ctx: VimApplicationContext = vim.ctx()
  doSomothingWithVimApplicationContext(ctx)
}
```

### VIM 应用上下文

VIM 应用上下文对象 `VimApplicationContext` 是 VIM 的核心对象，包含了 VIM 的所有功能模块。

`VimApplicationContext` 的定义可以参考 `./types.ts` 文件。

在 `VimApplicationContext` 中可以获取到 VIM 的所有功能模块，如下表所示：

| 模块名称         | 模块描述       | 模块文档                             |
|:-------------|:-----------|:---------------------------------|
| `api`        | API 接口请求模块 | [API 接口请求模块](../api/README.md)   |
| `library`    | 第三方组件库模块   | [第三方组件库模块](../library/README.md) |
| `navigation` | 导航模块       | [导航模块](../navigation/README.md)  |
| `router`     | 路由模块       | [路由模块](../router/README.md)      |
| `store`      | 状态管理模块     | [状态管理模块](../store/README.md)     |

## 修改说明

如无特殊需求，无需修改此目录下的文件。
