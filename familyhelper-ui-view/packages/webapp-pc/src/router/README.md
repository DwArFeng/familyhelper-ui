# router - 路由模块

router 模块是 VIM 的核心模块之一，负责处理路由相关的功能。

```
. - router 目录
├─── guards.ts - 路由守卫文件
├─── index.ts - 入口文件
├─── texts.ts - 文本常量文件
├─── types.ts - 类型声明文件
└─── README.md - 此文件
```

## 使用说明

### 直接使用 vue router

VIM 的路由模块是基于 vue router 实现的，并且兼容 vue-router 官方的 Composition API。

开发人员可以像是直接使用 vue-router 一样使用 VIM 的路由模块。

以侦听路由变化为例，代码如下所示：

```ts
import { watch } from 'vue'

import { useRoute } from 'vue-router'

const route = useRoute()

watch(route, (to, from) => {
  console.log('路由变化:', {
    to,
    from,
    currentPath: route.path,
    currentParam: route.params,
    currentQuery: route.query
  })
})
```

### 使用 router API

除了直接使用 vue router，VIM 还提供了一些 router API 用于路由的使用。

可以在 `VimApplicationContext` 中获取到 `router` 模块的实例对象，并使用 router API。

以侦听路由变化为例，代码如下所示：

```ts
import vim from '@/vim'

import { watch } from 'vue'

const router = vim.ctx().router().vueRouter()

watch(router.currentRoute, (to, from) => {
  console.log('路由变化:', {
    to,
    from,
    currentPath: router.currentRoute.path,
    currentParam: router.currentRoute.params,
    currentQuery: router.currentRoute.query,
  })
})
```

## 修改说明

在大多数情况下，开发人员不需要修改 router 模块的代码。

### 不建议修改的原因

- 结构紧凑：router 模块的代码经过精心设计，结构紧凑，功能明确，直接修改可能会破坏现有的逻辑。
- 未模块化设计：当前模块未进行进一步的模块化拆分，直接修改可能会导致代码耦合性增加，影响整体稳定性。

### 修改时的注意事项

- 充分理解现有逻辑：在修改代码前，请确保对 router 模块的现有逻辑有充分的理解，避免因误解导致功能异常。
- 保持接口兼容性：如果必须修改，请确保对外暴露的接口保持兼容性，避免影响其他模块的正常运行。
- 测试覆盖：修改后需对所有相关功能进行全面测试，确保修改不会引入新的问题。

### 查阅进一步资料

有关 router 模块的详细设计和使用说明，请参考 [wiki](../../../../../docs/wiki/README.md) 中的相应章节以获取更多背景知识。
