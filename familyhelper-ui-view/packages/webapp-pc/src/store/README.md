# store - 状态管理模块

store 模块是项目的核心模块之一，负责全局状态的管理。

## 目录结构

```
. - store 目录
├─── index.ts - 入口文件
├─── types.ts - 类型声明文件
├─── README.md - 此文件
└─┬─ modules - 模块目录
  ├─── moduleAlpha.ts - 模块 A
  ├─── moduleBravo.ts - 模块 B
  └─── moduleCharlie.ts - 模块 C
```

## 使用说明

### 获取并使用 Store

开发人员可以在 `VimApplicationContext` 中获取到 `store` 模块的实例对象，并使用 `vueStore` 字段对应的方法获取 Store 示例。

VIM Store 实例的使用方法与 Pinia 对应的 Store 使用方法一致。

```typescript
import vim from '@/vim'
import type { LnpStore } from '@/store/modules/lnp.ts'

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

function printMe(): void {
  console.log(lnpStore.me)
}
```

### 获取并使用 StoreDefinition

在部分场景下，开发人员可能需要使用 StoreDefinition，而不是 Store 本身。

此时，开发人员可以在 `VimApplicationContext` 中获取到 `store` 模块的实例对象，
并使用 `storeDefinition` 字段对应的方法获取 StoreDefinition 实例。

VIM StoreDefinition 实例的使用方法与 Pinia 对应的 StoreDefinition 使用方法一致。

```typescript
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

const lnpStoreDefinition = vim.ctx().store().vueStoreDefinition<'lnp', LnpStore>('lnp')

function printMe(): void {
  const lnpStore: LnpStore = lnpStoreDefinition()
  console.log(lnpStore.me)
}
```

### 注册方法侦听

在某些场景下，开发人员可能需要对 Store 中的方法注册侦听。

不妨试想如下场景：
> 在 store 中，lnp 模块负责处理用户的登录状态，并提供 logout 方法用于登出。
> 在调用 logout 方法后，页面路由应该跳转到登录页面。
> 在调用 logout 方法后，某个页面需要清理数据。
> 在调用 logout 方法后，更多的业务逻辑需要执行。

对于以上场景，一种可行的实现方案是，将所有的业务逻辑都放在 logout 方法中，伪代码如下：

```ts
async function logout(): Promise<void> {
  // 调用注销接口。
  await callLogoutApi()
  // 路由跳转到登录页面。
  jumpToLoginPage()
  // Foo 页面数据清理逻辑。
  clearFooPageData()
  // 如果后期还有其他页面需要清理数据，继续在下方添加代码。
  // ...
}
```

显而易见，这种实现方案并不优雅，且不易于维护：

- 业务逻辑耦合在一起，难以拆分和复用。
- 如果后期有其他页面需要清理数据，仍然需要在 logout 方法中添加代码。
- 随着业务逻辑的增加，logout 方法的代码量会越来越大，导致可读性下降。

开发人员可以使用 `SimplyStore.$onAction` 方法注册侦听器，该方法与 Pinia 对应的 `$onAction` 方法一致。
具体的使用方法可以参考 [Pinia 文档](https://pinia.vuejs.org/api/pinia/interfaces/StoreWithState.html#-onAction-)。

使用方法侦听对上述代码进行改造后，代码如下：

`lnp.ts`：

```ts
async function logout(): Promise<void> {
  // 仅调用注销接口。
  await callLogoutApi()
}
```

`router.ts`：

```ts
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

lnpStore.$onAction(({ name, after }) => {
  // 只处理 logout 方法。
  if (name !== 'logout') {
    return
  }
  after(() => {
    jumpToLoginPage()
  })
})
```

`Foo.vue`：

```ts
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

lnpStore.$onAction(({ name, after }) => {
  // 只处理 logout 方法。
  if (name !== 'logout') {
    return
  }
  after(() => {
    clearPageData()
  })
})
```

由上述代码可以看出，使用方法侦听后，业务逻辑被拆分成了多个独立的部分， 每个部分只关注自己的业务逻辑，且可以独立维护和复用，
并且无论后期需要添加多少个功能，`lnp.ts` 文件中的 logout 方法都不需要修改， 只需要在对应的文件中添加新的侦听器即可。

### 注册 ExecutableActionHandle 方法侦听

在上文中，我们介绍了如何使用 `SimplyStore.$onAction` 方法注册方法侦听器，并且阐明了这样做的好处。

然而，由于 `Pinia` 的设计，`$onAction` 方法无法覆盖所有的场景。

不妨试想如下场景：
> 在 store 中，lnp 模块负责处理用户的登录状态，并提供 logout 方法用于登出。
> 在调用 logout 方法前，需要保存用户的自定义设置。

如果开发人员熟悉 `$onAction` 方法，就会知道 `$onAction` 方法的 `after` 回调函数是在方法执行完成后调用的，
因此，上述场景难以使用 `$onAction` 方法直接实现。

VIM 框架考虑到了这一场景，并且引入了 ExecutableActionHandle API，使得上述需求可以实现。

`lnp.ts`：

```ts
import type { ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'
import { ExecutableActionHandleImpl } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'

function willLogout(): ExecutableActionHandle<void, void, void> {
  return new ExecutableActionHandleImpl(() => logout())
}

async function logout(): Promise<void> {
  // 调用注销接口。
  await callLogoutApi()
}
```

`UserSettings.vue`：

```ts
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

import type { ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

lnpStore.$onAction(({ name, after }) => {
  if (name !== 'willLogin') {
    return
  }
  after((result: ExecutableActionHandle<void, void, void>) => {
    // 在登出方法执行之前，保存用户自定义设置。
    result.registerBeforeHook(async () => {
      saveUserSettings()
    })
  })
})
```

`LogoutButton.vue`：

```ts
import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')

function handleButtonClicked(): void {
  lnpStore
    .willLogout()
    .execute()
    .catch(() => {
      console.log('执行失败')
    })
}
```

## 修改说明

### 添加模块

store 模块采用动态扫描机制，开发人员只需要在 `./modules` 目录下按照约定的规则添加模块对应的模块文件，
模块即可被 VIM 自动加载。

模块定义在 `./modules/*.ts` 文件中，一个模块对应一个 `./modules/*.ts` 文件。

对于 ts 文件的命名规则，VIM 框架没有特定的限制，在实践中，通常使用 `camelCase` 命名法命名。

模块需要默认导出一个 `VimStoreModule` 类型的对象，VIM 会自动加载该对象，VIM 会自动加载该对象，
开发人员可以参考 `./types.ts` 文件中的 `VimStoreModule` 类型定义，了解该对象的具体结构，并提供对应的方法实现。

以下代码提供了一个较为全面的模块的示例：

`.modules/foobar.ts`：

```ts
// noinspection JSUnusedGlobalSymbols,DuplicatedCode,JSAnnotator

import type { VimApplicationContext } from '@/vim/types.ts'
import type { StoreSetup, VimStoreModule } from '@/store/types.ts'

import type { ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'
import { ExecutableActionHandleImpl } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'

import { computed, type ComputedRef, ref } from 'vue'

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerWindowLoadHook(windowLoadHook)
  ctx.registerWindowBeforeUnloadHook(windowUnloadHook)
}

// -----------------------------------------------------------Store 定义-----------------------------------------------------------
/**
 * Foobar Store。
 */
export type FoobarStore = {
  me: ComputedRef<string>
  hasPermission: (node: string) => boolean
  willLogout: () => ExecutableActionHandle<void, void, void>
}

// Store 区域。
const _accountId = ref<string>('')
const _permissions = ref<Record<string, boolean>>({})

// 账号。
const me = computed<string>(() => _accountId.value)

// 权限。
function hasPermission(node: string): boolean {
  return _permissions.value[node]
}

function willLogout(): ExecutableActionHandle<void, void, void> {
  return new ExecutableActionHandleImpl(() => logout())
}

async function logout(): Promise<void> {
  // 调用注销接口。
  return new Promise((resolve) => {
    console.log('模拟注销...')
    resolve()
  })
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): FoobarStore => ({
    me,
    hasPermission,
    willLogout
  })
}

// -----------------------------------------------------------钩子逻辑-----------------------------------------------------------
/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  console.log('Foobar Store windowLoadHook')
}

/**
 * Window 卸载钩子。
 */
function windowUnloadHook(): void {
  console.log('Foobar Store windowUnloadHook')
  // 清除数据。
  _accountId.value = ''
  _permissions.value = {}
}

// -----------------------------------------------------------VimStoreModule 定义-----------------------------------------------------------
/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup
}

export default vimStoreModule
```
