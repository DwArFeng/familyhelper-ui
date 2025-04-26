# api - API 接口请求模块

api 模块是 VIM 的核心模块之一，负责处理 API 接口请求和响应。它提供了统一的接口请求和响应处理机制，简化了 API 接口的调用流程。

api 模块不负责处理 API 接口的具体实现，而是在模块初始化时为 `@dwarfeng/familyhelper-ui-component-api`
模块提供 `HttpHandler` 接口的实现类。`@dwarfeng/familyhelper-ui-component-api` 模块负责处理 API 接口的具体实现。

## 目录结构

```
. - api 目录
├─── index.ts - 入口文件
├─── props.ts - 配置文件
├─── types.ts - 类型声明文件
└─── README.md - 此文件
```

## 使用说明

### 使用自带的请求

`@dwarfeng/familyhelper-ui-component-api` 子模块中提供了项目自带的 API 方法，按需引入调用即可。

如下所示：

```typescript
import type { Role } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/role.ts'
import { all as allRole } from '@dwarfeng/familyhelper-ui-component-api/src/api/system/role.ts'

import { lookupAllToList } from '@/util/lookup.ts'

async function getAllRole(): Promise<void> {
  const roles: Role[] = await lookupAllToList((pagingInfo) => allRole(pagingInfo))
  doSomethingWithRoles(roles)
}
```

### 使用自定义的请求

一般情况下，`@dwarfeng/familyhelper-ui-component-api` 子模块中提供的 API 方法已经足够使用了，
但是如果遇到特殊情况，也可以使用自定义的请求。

在这种情况下，可以在 `VimApplicationContext` 中获取到 `api` 模块的实例对象，并使用 通用/公共 Http 客户端。

如下所示：

```typescript
import vim from '@/vim'

import type { HttpClient } from '@dwarfeng/familyhelper-ui-component-api/src/util/http.ts'

async function customApiRequest(): Promise<void> {
  const client: HttpClient = vim.ctx().api().publicClient()
  const response = await client.get('custom-module', 'custom-url', { param1: 'value1' }, 'json')
  doSomethingWithResponse(response)
}
```

## 修改说明

### 修改配置

本模块使用的所有配置均在 `./props.ts` 文件中定义，您只需根据其中的注释修改所需的配置即可。

在默认情况下，`./props.ts` 文件中的 `developmentUrlPrefix` 字段指向的是本地的 webapi 服务地址，
如果开发人员使用的是第三方的 webapi 服务地址，请修改该字段为第三方的 webapi 服务地址。

如果配置的修改是临时的，并且不希望被提交，可以使用以下小技巧：

- 将 `./props.ts` 文件中的修改放在另一个 Changelist 中，这样便可避免绝大多数令人尴尬的错误提交。
- 在 `./props.ts` 文件中的修改进行 `git stash`，然后在 `git commit` 时使用 `git stash pop` 恢复修改。
- 对于 idea 系列的 IDE，可以使用 `shelve` 功能，更加方便地管理临时修改。
