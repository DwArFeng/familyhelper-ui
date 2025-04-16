// noinspection JSUnusedGlobalSymbols

import type { ShallowRef } from 'vue'

import type { ComponentExposed } from 'vue-component-type-helpers'

import type { TreeNode } from '@/components/tree/commons/types.ts'
import type { HybridBean, HybridBeanMap } from './types.ts'
import LazySearchTreePanel from './LazySearchTreePanel.vue'

// -----------------------------------------------------------通用-----------------------------------------------------------
type UseGeneralLazySearchTreePanelResult<CT> = {
  searchOptionHandler: (pattern: string, accept: (result: CT[]) => void) => void
  loadRootHandler: (accept: (result: CT[]) => void) => void
  loadChildHandler: (ct: CT, accept: (result: CT[]) => void) => void
  queryPathHandler: (ct: CT, accept: (result: CT[]) => void) => void
}

/**
 * 使用通用的懒加载搜索树面板。
 *
 * 该方法适用于通用的使用懒加载搜索树面板的场景，在这种场景中，对应的后台接口返回的 bean 只有一种。
 *
 * 该方法返回的结果中：
 * - `searchOptionHandler` 表示搜索选项处理器，可直接用于懒加载搜索树面板的 `searchOptionHandler` 属性。
 * - `loadRootHandler` 表示加载根 component bean 处理器，可直接用于懒加载搜索树面板的 `loadRootHandler` 属性。
 * - `loadChildHandler` 表示加载子 component bean 处理器，可直接用于懒加载搜索树面板的 `loadChildHandler` 属性。
 * - `queryPathHandler` 表示查询路径处理器，可直接用于懒加载搜索树面板的 `queryPathHandler` 属性。
 *
 * 当懒加载搜索树面板使用的 component bean 类型和后台接口返回的 bean 类型一致时，
 * 可以使用 {@link useIdentityLazySearchTreePanel} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param searchOptionCaller 搜索选项的调用函数。
 * @param loadRootCaller 加载根 bean 的调用函数。
 * @param loadChildCaller 加载子 bean 的调用函数。
 * @param queryPathCaller 查询路径的调用函数。
 * @returns 调用方法后的返回结果。
 * @see useIdentityLazySearchTreePanel
 */
export function useGeneralLazySearchTreePanel<T, CT>(
  beanMap: (t: T) => CT,
  searchOptionCaller: (pattern: string) => Promise<T[]> | T[],
  loadRootCaller: () => Promise<T[]> | T[],
  loadChildCaller: (ct: CT) => Promise<T[]> | T[],
  queryPathCaller: (ct: CT) => Promise<T[]> | T[],
): UseGeneralLazySearchTreePanelResult<CT> {
  const { searchOptionHandler, loadRootHandler, loadChildHandler, queryPathHandler } =
    getGeneralLoadingHandler(
      beanMap,
      searchOptionCaller,
      loadRootCaller,
      loadChildCaller,
      queryPathCaller,
    )

  return {
    searchOptionHandler,
    loadRootHandler,
    loadChildHandler,
    queryPathHandler,
  }
}

/**
 * 使用懒加载搜索树面板。
 *
 * 该方法适用于使用懒加载搜索树面板的场景，在这种场景中，对应的后台接口返回的 bean 只有一种。
 *
 * 该方法可以简化懒加载搜索树面板使用的 component bean 类型和后端接口返回的 bean 类型一致的场景。
 *
 * 该方法返回的结果中：
 * - `searchOptionHandler` 表示搜索选项处理器，可直接用于懒加载搜索树面板的 `searchOptionHandler` 属性。
 * - `loadRootHandler` 表示加载根 bean 处理器，可直接用于懒加载搜索树面板的 `loadRootHandler` 属性。
 * - `loadChildHandler` 表示加载子 bean 处理器，可直接用于懒加载搜索树面板的 `loadChildHandler` 属性。
 * - `queryPathHandler` 表示查询路径处理器，可直接用于懒加载搜索树面板的 `queryPathHandler` 属性。
 *
 * @template T bean 类型。
 * @param searchOptionCaller 搜索选项的调用函数。
 * @param loadRootCaller 加载根 bean 的调用函数。
 * @param loadChildCaller 加载子 bean 的调用函数。
 * @param queryPathCaller 查询路径的调用函数。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityLazySearchTreePanel<T>(
  searchOptionCaller: (pattern: string) => Promise<T[]> | T[],
  loadRootCaller: () => Promise<T[]> | T[],
  loadChildCaller: (ct: T) => Promise<T[]> | T[],
  queryPathCaller: (ct: T) => Promise<T[]> | T[],
): UseGeneralLazySearchTreePanelResult<T> {
  const { searchOptionHandler, loadRootHandler, loadChildHandler, queryPathHandler } =
    getGeneralLoadingHandler(
      (t: T) => t,
      searchOptionCaller,
      loadRootCaller,
      loadChildCaller,
      queryPathCaller,
    )

  return {
    searchOptionHandler,
    loadRootHandler,
    loadChildHandler,
    queryPathHandler,
  }
}

// -----------------------------------------------------------通用-带操作方法-----------------------------------------------------------
type UseOperableGeneralLazySearchTreePanel<T, CT> = {
  searchOptionHandler: (pattern: string, accept: (result: CT[]) => void) => void
  loadRootHandler: (accept: (result: CT[]) => void) => void
  loadChildHandler: (ct: CT, accept: (result: CT[]) => void) => void
  queryPathHandler: (ct: CT, accept: (result: CT[]) => void) => void
  appendRoot: (t: T) => void
  append: (target: TreeNode<CT>, t: T) => void
  insertBefore: (target: TreeNode<CT>, t: T) => void
  insertAfter: (target: TreeNode<CT>, t: T) => void
  update: (t: T) => void
  remove: (t: T) => void
  setCurrent: (t: T) => void
}

/**
 * 使用可操作的懒加载搜索树面板。
 *
 * 该方法适用于使用懒加载搜索树面板的场景，在这种场景中，对应的后台接口返回的 bean 只有一种。
 * 该方法除了返回可直接用于懒加载搜索树面板的结果之外，也提供了对懒加载搜索树面板的便捷操作方法。
 *
 * 该方法返回的结果中：
 * - `searchOptionHandler` 表示搜索选项处理器，可直接用于懒加载搜索树面板的 `searchOptionHandler` 属性。
 * - `loadRootHandler` 表示加载根 bean 处理器，可直接用于懒加载搜索树面板的 `loadRootHandler` 属性。
 * - `loadChildHandler` 表示加载子 bean 处理器，可直接用于懒加载搜索树面板的 `loadChildHandler` 属性。
 * - `queryPathHandler` 表示查询路径处理器，可直接用于懒加载搜索树面板的 `queryPathHandler` 属性。
 * - `appendRoot` 表示追加根 bean 的方法。
 * - `append` 表示追加子 bean 的方法。
 * - `insertBefore` 表示在指定 component bean 前插入子 bean 的方法，其中， component bean
 *   对应的树节点可以通过树的当前节点等各种方法获取。
 * - `insertAfter` 表示在指定 component bean 后插入子 bean 的方法，其中， component bean
 *   对应的树节点可以通过树的当前节点等各种方法获取。
 * - `update` 表示更新 bean 的方法。
 * - `remove` 表示删除 bean 的方法。
 * - `setCurrent` 表示设置当前 bean 的方法。
 *
 * 当懒加载搜索树面板使用的 component bean 类型和后台接口返回的 bean 类型一致时，
 * 可以使用 {@link useIdentityOperableGeneralLazySearchTreePanel} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param searchOptionCaller 搜索选项的调用函数。
 * @param loadRootCaller 加载根 bean 的调用函数。
 * @param loadChildCaller 加载子 bean 的调用函数。
 * @param queryPathCaller 查询路径的调用函数。
 * @param lazySearchTreePanelRef 懒加载搜索树面板的引用。
 * @returns 调用方法后的返回结果。
 * @see useIdentityOperableGeneralLazySearchTreePanel
 */
export function useOperableGeneralLazySearchTreePanel<T, CT>(
  beanMap: (t: T) => CT,
  searchOptionCaller: (pattern: string) => Promise<T[]> | T[],
  loadRootCaller: () => Promise<T[]> | T[],
  loadChildCaller: (ct: CT) => Promise<T[]> | T[],
  queryPathCaller: (ct: CT) => Promise<T[]> | T[],
  lazySearchTreePanelRef: Readonly<ShallowRef<ComponentExposed<typeof LazySearchTreePanel> | null>>,
): UseOperableGeneralLazySearchTreePanel<T, CT> {
  const { searchOptionHandler, loadRootHandler, loadChildHandler, queryPathHandler } =
    getGeneralLoadingHandler(
      beanMap,
      searchOptionCaller,
      loadRootCaller,
      loadChildCaller,
      queryPathCaller,
    )

  function appendRoot(t: T): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = beanMap(t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.appendRoot(ct as Record<string, any>)
  }

  function append(target: TreeNode<CT>, t: T): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = beanMap(t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.append(target as TreeNode<Record<string, any>>, ct as Record<string, any>)
  }

  function insertBefore(target: TreeNode<CT>, t: T): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = beanMap(t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.insertBefore(target as TreeNode<Record<string, any>>, ct as Record<string, any>)
  }

  function insertAfter(target: TreeNode<CT>, t: T): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = beanMap(t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.insertAfter(target as TreeNode<Record<string, any>>, ct as Record<string, any>)
  }

  function update(t: T): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = beanMap(t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.update(ct as Record<string, any>)
  }

  function remove(t: T): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = beanMap(t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.remove(ct as Record<string, any>)
  }

  function setCurrent(t: T): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = beanMap(t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.setCurrent(ct as Record<string, any>)
  }

  return {
    searchOptionHandler,
    loadRootHandler,
    loadChildHandler,
    queryPathHandler,
    appendRoot,
    append,
    insertBefore,
    insertAfter,
    update,
    remove,
    setCurrent,
  }
}

/**
 * 使用可操作的懒加载搜索树面板。
 *
 * 该方法适用于使用懒加载搜索树面板的场景，在这种场景中，对应的后台接口返回的 bean 只有一种。
 * 该方法除了返回可直接用于懒加载搜索树面板的结果之外，也提供了对懒加载搜索树面板的便捷操作方法。
 *
 * 该方法可以简化懒加载搜索树面板使用的 component bean 类型和后端接口返回的 bean 类型一致的场景。
 *
 * 该方法返回的结果中：
 * - `searchOptionHandler` 表示搜索选项处理器，可直接用于懒加载搜索树面板的 `searchOptionHandler` 属性。
 * - `loadRootHandler` 表示加载根 bean 处理器，可直接用于懒加载搜索树面板的 `loadRootHandler` 属性。
 * - `loadChildHandler` 表示加载子 bean 处理器，可直接用于懒加载搜索树面板的 `loadChildHandler` 属性。
 * - `queryPathHandler` 表示查询路径处理器，可直接用于懒加载搜索树面板的 `queryPathHandler` 属性。
 * - `appendRoot` 表示追加根 bean 的方法。
 * - `append` 表示追加子 bean 的方法。
 * - `insertBefore` 表示在指定 component bean 前插入子 bean 的方法，其中， component bean
 *   对应的树节点可以通过树的当前节点等各种方法获取。
 * - `insertAfter` 表示在指定 component bean 后插入子 bean 的方法，其中， component bean
 *   对应的树节点可以通过树的当前节点等各种方法获取。
 * - `update` 表示更新 bean 的方法。
 * - `remove` 表示删除 bean 的方法。
 * - `setCurrent` 表示设置当前 bean 的方法。
 *
 * @template T bean 类型。
 * @param searchOptionCaller 搜索选项的调用函数。
 * @param loadRootCaller 加载根 bean 的调用函数。
 * @param loadChildCaller 加载子 bean 的调用函数。
 * @param queryPathCaller 查询路径的调用函数。
 * @param lazySearchTreePanelRef 懒加载搜索树面板的引用。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityOperableGeneralLazySearchTreePanel<T>(
  searchOptionCaller: (pattern: string) => Promise<T[]> | T[],
  loadRootCaller: () => Promise<T[]> | T[],
  loadChildCaller: (ct: T) => Promise<T[]> | T[],
  queryPathCaller: (ct: T) => Promise<T[]> | T[],
  lazySearchTreePanelRef: Readonly<ShallowRef<ComponentExposed<typeof LazySearchTreePanel> | null>>,
): UseOperableGeneralLazySearchTreePanel<T, T> {
  return useOperableGeneralLazySearchTreePanel(
    (t: T) => t,
    searchOptionCaller,
    loadRootCaller,
    loadChildCaller,
    queryPathCaller,
    lazySearchTreePanelRef,
  )
}

// -----------------------------------------------------------通用-公共-----------------------------------------------------------
type GetGeneralLoadingHandlerResult<CT> = {
  searchOptionHandler: (pattern: string, accept: (result: CT[]) => void) => void
  loadRootHandler: (accept: (result: CT[]) => void) => void
  loadChildHandler: (ct: CT, accept: (result: CT[]) => void) => void
  queryPathHandler: (ct: CT, accept: (result: CT[]) => void) => void
}

function getGeneralLoadingHandler<T, CT>(
  beanMap: (t: T) => CT,
  searchOptionCaller: (pattern: string) => Promise<T[]> | T[],
  loadRootCaller: () => Promise<T[]> | T[],
  loadChildCaller: (ct: CT) => Promise<T[]> | T[],
  queryPathCaller: (ct: CT) => Promise<T[]> | T[],
): GetGeneralLoadingHandlerResult<CT> {
  function searchOptionHandler(pattern: string, accept: (result: CT[]) => void): void {
    const callerResult: Promise<T[]> | T[] = searchOptionCaller(pattern)
    if (callerResult instanceof Promise) {
      callerResult.then((result: T[]) => {
        accept(result.map(beanMap))
      })
    } else {
      accept(callerResult.map(beanMap))
    }
  }

  function loadRootHandler(accept: (result: CT[]) => void): void {
    const callerResult: Promise<T[]> | T[] = loadRootCaller()
    if (callerResult instanceof Promise) {
      callerResult.then((result: T[]) => {
        accept(result.map(beanMap))
      })
    } else {
      accept(callerResult.map(beanMap))
    }
  }

  function loadChildHandler(ct: CT, accept: (result: CT[]) => void): void {
    const callerResult: Promise<T[]> | T[] = loadChildCaller(ct)
    if (callerResult instanceof Promise) {
      callerResult.then((result: T[]) => {
        accept(result.map(beanMap))
      })
    } else {
      accept(callerResult.map(beanMap))
    }
  }

  function queryPathHandler(ct: CT, accept: (result: CT[]) => void): void {
    const callerResult: Promise<T[]> | T[] = queryPathCaller(ct)
    if (callerResult instanceof Promise) {
      callerResult.then((result: T[]) => {
        accept(result.map(beanMap))
      })
    } else {
      accept(callerResult.map(beanMap))
    }
  }

  return {
    searchOptionHandler,
    loadRootHandler,
    loadChildHandler,
    queryPathHandler,
  }
}

// -----------------------------------------------------------混合-----------------------------------------------------------
type UseHybridLazySearchTreePanelResult<CT> = {
  searchOptionHandler: (pattern: string, accept: (result: CT[]) => void) => void
  loadRootHandler: (accept: (result: CT[]) => void) => void
  loadChildHandler: (ct: CT, accept: (result: CT[]) => void) => void
  queryPathHandler: (ct: CT, accept: (result: CT[]) => void) => void
}

/**
 * 使用混合的懒加载搜索树面板。
 *
 * 该方法适用于使用懒加载搜索树面板的场景，在这种场景中，对应的后台接口返回的 bean 有多种。
 * 常见的例子如：文件夹-文件 结构，文件夹和文件对应的 bean 类型不同。
 *
 * 在此类场景下，由于不同的 bean 需要不同的映射逻辑，因此要求：
 * - 后端接口返回的每个 bean 必须被转换成 {@link HybridBean} 格式，包括使用 type 字段标明实体的类型。
 * - 必须为每种 bean 类型提供对应的 {@link HybridBeanMap} 映射器
 * - 所有映射器的 `type` 值必须互不相同
 * - 映射器集合必须覆盖所有可能的 bean 类型（即后端返回的每个 bean 的 type 都能找到对应的映射器）
 *
 * 该方法返回的结果中：
 * - `searchOptionHandler` 表示搜索选项处理器，可直接用于懒加载搜索树面板的 `searchOptionHandler` 属性。
 * - `loadRootHandler` 表示加载根 bean 处理器，可直接用于懒加载搜索树面板的 `loadRootHandler` 属性。
 * - `loadChildHandler` 表示加载子 bean 处理器，可直接用于懒加载搜索树面板的 `loadChildHandler` 属性。
 * - `queryPathHandler` 表示查询路径处理器，可直接用于懒加载搜索树面板的 `queryPathHandler` 属性。
 *
 * @template T bean 类型，应该为多个 bean 的联合类型。
 * @template CT component bean 类型。
 * @param hybridBeanMaps 混合 bean 映射器列表，包含所有的 bean 映射器。
 * @param searchOptionCaller 搜索选项的调用函数。
 * @param loadRootCaller 加载根 bean 的调用函数。
 * @param loadChildCaller 加载子 bean 的调用函数。
 * @param queryPathCaller 查询路径的调用函数。
 * @returns 调用方法后的返回结果。
 */
export function useHybridLazySearchTreePanel<T, CT>(
  hybridBeanMaps: HybridBeanMap<T, CT>[],
  searchOptionCaller: (pattern: string) => Promise<HybridBean<T>[]> | HybridBean<T>[],
  loadRootCaller: () => Promise<HybridBean<T>[]> | HybridBean<T>[],
  loadChildCaller: (ct: CT) => Promise<HybridBean<T>[]> | HybridBean<T>[],
  queryPathCaller: (ct: CT) => Promise<HybridBean<T>[]> | HybridBean<T>[],
): UseHybridLazySearchTreePanelResult<CT> {
  const hybridBeanMapMap = parseHybridBeanMaps(hybridBeanMaps)

  const { searchOptionHandler, loadRootHandler, loadChildHandler, queryPathHandler } =
    getHybridLoadingHandler(
      hybridBeanMapMap,
      searchOptionCaller,
      loadRootCaller,
      loadChildCaller,
      queryPathCaller,
    )

  return {
    searchOptionHandler,
    loadRootHandler,
    loadChildHandler,
    queryPathHandler,
  }
}

// -----------------------------------------------------------混合-带操作方法-----------------------------------------------------------
type UseOperableHybridLazySearchTreePanelResult<T, CT> = {
  searchOptionHandler: (pattern: string, accept: (result: CT[]) => void) => void
  loadRootHandler: (accept: (result: CT[]) => void) => void
  loadChildHandler: (ct: CT, accept: (result: CT[]) => void) => void
  queryPathHandler: (ct: CT, accept: (result: CT[]) => void) => void
  appendRoot: (t: HybridBean<T>) => void
  append: (target: TreeNode<CT>, t: HybridBean<T>) => void
  insertBefore: (target: TreeNode<CT>, t: HybridBean<T>) => void
  insertAfter: (target: TreeNode<CT>, t: HybridBean<T>) => void
  update: (t: HybridBean<T>) => void
  remove: (t: HybridBean<T>) => void
  setCurrent: (t: HybridBean<T>) => void
}

/**
 * 使用可操作的混合懒加载搜索树面板。
 *
 * 该方法适用于使用懒加载搜索树面板的场景，在这种场景中，对应的后台接口返回的 bean 有多种。
 * 常见的例子如：文件夹-文件 结构，文件夹和文件对应的 bean 类型不同。
 *
 * 在此类场景下，由于不同的 bean 需要不同的映射逻辑，因此要求：
 * - 后端接口返回的每个 bean 必须被转换成 {@link HybridBean} 格式，包括使用 type 字段标明实体的类型。
 * - 必须为每种 bean 类型提供对应的 {@link HybridBeanMap} 映射器
 * - 所有映射器的 `type` 值必须互不相同
 * - 映射器集合必须覆盖所有可能的 bean 类型（即后端返回的每个 bean 的 type 都能找到对应的映射器）
 *
 * 该方法除了返回可直接用于懒加载搜索树面板的结果之外，也提供了对懒加载搜索树面板的便捷操作方法。
 *
 * @template T bean 类型，应该为多个 bean 的联合类型。
 * @template CT component bean 类型。
 * @param hybridBeanMaps 混合 bean 映射器列表，包含所有的 bean 映射器。
 * @param searchOptionCaller 搜索选项的调用函数。
 * @param loadRootCaller 加载根 bean 的调用函数。
 * @param loadChildCaller 加载子 bean 的调用函数。
 * @param queryPathCaller 查询路径的调用函数。
 * @param lazySearchTreePanelRef 懒加载搜索树面板的引用。
 * @returns 调用方法后的返回结果。
 */
export function useOperableHybridLazySearchTreePanel<T, CT>(
  hybridBeanMaps: HybridBeanMap<T, CT>[],
  searchOptionCaller: (pattern: string) => Promise<HybridBean<T>[]> | HybridBean<T>[],
  loadRootCaller: () => Promise<HybridBean<T>[]> | HybridBean<T>[],
  loadChildCaller: (ct: CT) => Promise<HybridBean<T>[]> | HybridBean<T>[],
  queryPathCaller: (ct: CT) => Promise<HybridBean<T>[]> | HybridBean<T>[],
  lazySearchTreePanelRef: Readonly<ShallowRef<ComponentExposed<typeof LazySearchTreePanel> | null>>,
): UseOperableHybridLazySearchTreePanelResult<T, CT> {
  const hybridBeanMapMap = parseHybridBeanMaps(hybridBeanMaps)

  const { searchOptionHandler, loadRootHandler, loadChildHandler, queryPathHandler } =
    getHybridLoadingHandler(
      hybridBeanMapMap,
      searchOptionCaller,
      loadRootCaller,
      loadChildCaller,
      queryPathCaller,
    )

  function appendRoot(t: HybridBean<T>): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = hybridBeanMap(hybridBeanMapMap, t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.appendRoot(ct as Record<string, any>)
  }

  function append(target: TreeNode<CT>, t: HybridBean<T>): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = hybridBeanMap(hybridBeanMapMap, t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.append(target as TreeNode<Record<string, any>>, ct as Record<string, any>)
  }

  function insertBefore(target: TreeNode<CT>, t: HybridBean<T>): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = hybridBeanMap(hybridBeanMapMap, t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.insertBefore(target as TreeNode<Record<string, any>>, ct as Record<string, any>)
  }

  function insertAfter(target: TreeNode<CT>, t: HybridBean<T>): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = hybridBeanMap(hybridBeanMapMap, t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.insertAfter(target as TreeNode<Record<string, any>>, ct as Record<string, any>)
  }

  function update(t: HybridBean<T>): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = hybridBeanMap(hybridBeanMapMap, t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.update(ct as Record<string, any>)
  }

  function remove(t: HybridBean<T>): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = hybridBeanMap(hybridBeanMapMap, t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.remove(ct as Record<string, any>)
  }

  function setCurrent(t: HybridBean<T>): void {
    const instance = lazySearchTreePanelRef.value
    if (!instance) {
      throw new Error('LazySearchTreePanel instance is not ready')
    }
    const ct: CT = hybridBeanMap(hybridBeanMapMap, t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.setCurrent(ct as Record<string, any>)
  }

  return {
    searchOptionHandler,
    loadRootHandler,
    loadChildHandler,
    queryPathHandler,
    appendRoot,
    append,
    insertBefore,
    insertAfter,
    update,
    remove,
    setCurrent,
  }
}

// -----------------------------------------------------------混合-公共-----------------------------------------------------------
type GetHybridLoadingHandlerResult<CT> = {
  searchOptionHandler: (pattern: string, accept: (result: CT[]) => void) => void
  loadRootHandler: (accept: (result: CT[]) => void) => void
  loadChildHandler: (ct: CT, accept: (result: CT[]) => void) => void
  queryPathHandler: (ct: CT, accept: (result: CT[]) => void) => void
}

function parseHybridBeanMaps<T, CT>(
  hybridBeanMaps: HybridBeanMap<T, CT>[],
): Map<string, HybridBeanMap<T, CT>> {
  const hybridBeanMapMap = new Map<string, HybridBeanMap<T, CT>>()
  for (const hybridBeanMap of hybridBeanMaps) {
    if (hybridBeanMapMap.has(hybridBeanMap.type)) {
      throw new Error(`Duplicate hybrid bean map type: ${hybridBeanMap.type}`)
    }
    hybridBeanMapMap.set(hybridBeanMap.type, hybridBeanMap)
  }
  return hybridBeanMapMap
}

function hybridBeanMap<T, CT>(
  hybridBeanMapMap: Map<string, HybridBeanMap<T, CT>>,
  hybridBean: HybridBean<T>,
): CT {
  const hybridBeanMap = hybridBeanMapMap.get(hybridBean.type)
  if (!hybridBeanMap) {
    throw new Error(`Unknown hybrid bean type: ${hybridBean.type}`)
  }
  return hybridBeanMap.beanMap(hybridBean.bean)
}

function getHybridLoadingHandler<T, CT>(
  hybridBeanMapMap: Map<string, HybridBeanMap<T, CT>>,
  searchOptionCaller: (pattern: string) => Promise<HybridBean<T>[]> | HybridBean<T>[],
  loadRootCaller: () => Promise<HybridBean<T>[]> | HybridBean<T>[],
  loadChildCaller: (ct: CT) => Promise<HybridBean<T>[]> | HybridBean<T>[],
  queryPathCaller: (ct: CT) => Promise<HybridBean<T>[]> | HybridBean<T>[],
): GetHybridLoadingHandlerResult<CT> {
  function searchOptionHandler(pattern: string, accept: (result: CT[]) => void): void {
    const callerResult: Promise<HybridBean<T>[]> | HybridBean<T>[] = searchOptionCaller(pattern)
    if (callerResult instanceof Promise) {
      callerResult.then((result: HybridBean<T>[]) => {
        accept(result.map((t: HybridBean<T>) => hybridBeanMap(hybridBeanMapMap, t)))
      })
    } else {
      accept(callerResult.map((t: HybridBean<T>) => hybridBeanMap(hybridBeanMapMap, t)))
    }
  }

  function loadRootHandler(accept: (result: CT[]) => void): void {
    const callerResult: Promise<HybridBean<T>[]> | HybridBean<T>[] = loadRootCaller()
    if (callerResult instanceof Promise) {
      callerResult.then((result: HybridBean<T>[]) => {
        accept(result.map((t: HybridBean<T>) => hybridBeanMap(hybridBeanMapMap, t)))
      })
    } else {
      accept(callerResult.map((t: HybridBean<T>) => hybridBeanMap(hybridBeanMapMap, t)))
    }
  }

  function loadChildHandler(ct: CT, accept: (result: CT[]) => void): void {
    const callerResult: Promise<HybridBean<T>[]> | HybridBean<T>[] = loadChildCaller(ct)
    if (callerResult instanceof Promise) {
      callerResult.then((result: HybridBean<T>[]) => {
        accept(result.map((t) => hybridBeanMap(hybridBeanMapMap, t)))
      })
    } else {
      accept(callerResult.map((t) => hybridBeanMap(hybridBeanMapMap, t)))
    }
  }

  function queryPathHandler(ct: CT, accept: (result: CT[]) => void): void {
    const callerResult: Promise<HybridBean<T>[]> | HybridBean<T>[] = queryPathCaller(ct)
    if (callerResult instanceof Promise) {
      callerResult.then((result: HybridBean<T>[]) => {
        accept(result.map((t) => hybridBeanMap(hybridBeanMapMap, t)))
      })
    } else {
      accept(callerResult.map((t) => hybridBeanMap(hybridBeanMapMap, t)))
    }
  }

  return {
    searchOptionHandler,
    loadRootHandler,
    loadChildHandler,
    queryPathHandler,
  }
}
