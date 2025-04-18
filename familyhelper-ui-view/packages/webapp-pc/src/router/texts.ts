// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { RouteLocationNormalizedGeneric } from 'vue-router'

export function noGuardNameErrorText(to: RouteLocationNormalizedGeneric): string {
  return `URL ${to.fullPath} 对应的路由的元数据中未设置 guard。

请在您的页面中增加 guard 配置，如下：
{
  name: '${to.name as string}'
  ...
  meta: {
    guard: 'your-guard-here'
  }
}
`
}

export function guardNotExistsErrorText(
  to: RouteLocationNormalizedGeneric,
  guardName: string,
): string {
  return `URL ${to.fullPath} 对应的路由的元数据中不存在名称为 ${guardName} 的路由守卫。

请在您的页面中检查 guard 配置，如下：
{
  name: '${to.name as string}'
  ...
  meta: {
    // 请确认 '${guardName}' 是一个有效的守卫名称。
    guard: '${guardName}'
  }
}

有效的守卫名称可以在 '@/router/guards.ts' 中确认，如：
...
const guards: Record<string, VimRouterGuard<any>> = {
  simple: simpleGuard,
  vim: vimGuard,
  error: errorGuard,
}
...
其中，'simple', 'vim', 'error' 是有效的路由守卫名称。

如果您想扩展守卫，也应该按照此规则进行扩展，如：
...
const guards: Record<string, VimRouterGuard<any>> = {
  simple: simpleGuard,
  vim: vimGuard,
  error: errorGuard,
  yours: yoursGuard,
}
...
那么如此一来，'yours' 也是有效的路由守卫名称了。
`
}
