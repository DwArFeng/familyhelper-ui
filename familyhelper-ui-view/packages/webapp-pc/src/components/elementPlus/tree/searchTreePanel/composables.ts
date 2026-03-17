// noinspection JSUnusedGlobalSymbols

import { type Ref, ref, type ShallowRef } from 'vue'

import { type ComponentExposed } from 'vue-component-type-helpers'
import { type ManagedBean } from './types.ts'
import SearchTreePanel from './SearchTreePanel.vue'

// -----------------------------------------------------------自定义-----------------------------------------------------------
type UseCustomSearchTreePanelResult<T, CT> = {
  items: Ref<CT[]>
  updateByLookup: (res: T[]) => void
}

/**
 * 使用自定义的搜索树面板。
 *
 * 该方法适用于使用搜索树面板的场景，在这种场景中：
 * - 后端（或查询接口）返回的 bean 类型为 `T`
 * - 搜索树面板实际渲染的节点数据（component bean）类型为 `CT`
 *
 * 该方法要求调用者提供：
 * - `beanMap`：将 `T` 映射为 `CT`
 * - `mergeHandler`：将新结果合并到 `items` 中（例如：保留引用以维持展开/选中状态，或直接整体替换）
 *
 * 在此 API 下，调用者需要完全控制 `items` 的结构和更新方式。
 * 如果目标 bean 可以通过特定的方法进行映射与合并，并且效率高于托管 API 使用的通用映射与合并方法，
 * 则适合使用此方法。
 *
 * 该方法返回的结果中：
 * - `items` 可直接用于搜索树面板的 `items` 属性。
 * - `updateByLookup` 用于在拿到查询结果 `T[]` 后更新 `items`。
 *
 * 当 component bean 类型和查询返回的 bean 类型一致时，
 * 可以使用 {@link useIdentityCustomSearchTreePanel} 方法进行简化。
 *
 * @template T bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param mergeHandler 合并处理器，用于把新的 `CT[]` 合并进 `items`。
 * @returns 调用方法后的返回结果。
 * @see useIdentityCustomSearchTreePanel
 */
export function useCustomSearchTreePanel<T, CT>(
  beanMap: (t: T) => CT,
  mergeHandler: (ref: Ref<CT[]>, cts: CT[]) => void,
): UseCustomSearchTreePanelResult<T, CT> {
  const { items, updateByLookup } = getCustomAttribute(beanMap, mergeHandler)

  return {
    items,
    updateByLookup,
  } as UseCustomSearchTreePanelResult<T, CT>
}

/**
 * 使用自定义的搜索树面板。
 *
 * 该方法可以简化懒加载搜索树面板使用的 component bean 类型和后端接口返回的 bean 类型一致的场景。
 *
 * 该方法要求调用者提供：
 * - `beanMap`：将 `T` 映射为 `CT`
 * - `mergeHandler`：将新结果合并到 `items` 中（例如：保留引用以维持展开/选中状态，或直接整体替换）
 *
 * 在此 API 下，调用者需要完全控制 `items` 的结构和更新方式。
 * 如果目标 bean 可以通过特定的方法进行映射与合并，并且效率高于托管 API 使用的通用映射与合并方法，
 * 则适合使用此方法。
 *
 * 该方法返回的结果中：
 * - `items` 可直接用于搜索树面板的 `items` 属性。
 * - `updateByLookup` 用于在拿到查询结果 `T[]` 后更新 `items`。
 *
 * @template T bean 类型。
 * @param mergeHandler 合并处理器。
 * @returns 调用方法后的返回结果。
 */
export function useIdentityCustomSearchTreePanel<T>(
  mergeHandler: (ref: Ref<T[]>, ts: T[]) => void,
): UseCustomSearchTreePanelResult<T, T> {
  return useCustomSearchTreePanel((t: T) => t, mergeHandler)
}

type UseOperableCustomSearchTreePanelResult<T, CT> = {
  items: Ref<CT[]>
  updateByLookup: (res: T[]) => void
  setCurrent: (t: T | null) => void
}

/**
 * 使用可操作的自定义搜索树面板。
 *
 * 该方法在 {@link useCustomSearchTreePanel} 的基础上，额外提供了对组件实例的便捷操作方法。
 *
 * 该方法要求调用者提供：
 * - `beanMap`：将 `T` 映射为 `CT`
 * - `mergeHandler`：将新结果合并到 `items` 中（例如：保留引用以维持展开/选中状态，或直接整体替换）
 *
 * 在此 API 下，调用者需要完全控制 `items` 的结构和更新方式。
 * 如果目标 bean 可以通过特定的方法进行映射与合并，并且效率高于托管 API 使用的通用映射与合并方法，
 * 则适合使用此方法。
 *
 * 该方法返回的结果中：
 * - `items` 可直接用于搜索树面板的 `items` 属性。
 * - `updateByLookup` 用于在拿到查询结果 `T[]` 后更新 `items`。
 * - `setCurrent` 用于设置树的当前选中项（依赖 `searchTreePanelRef`）。
 *
 * 当 component bean 类型和查询返回的 bean 类型一致时，
 * 可以使用 {@link useOperableIdentityCustomSearchTreePanel} 方法进行简化。
 *
 * @template T 查询返回的 bean 类型。
 * @template CT component bean 类型。
 * @param beanMap bean 映射函数。
 * @param mergeHandler 合并处理器。
 * @param searchTreePanelRef 搜索树面板的引用。
 * @returns 调用方法后的返回结果。
 * @see useOperableIdentityCustomSearchTreePanel
 */
export function useOperableCustomSearchTreePanel<T, CT>(
  beanMap: (t: T) => CT,
  mergeHandler: (ref: Ref<CT[]>, cts: CT[]) => void,
  searchTreePanelRef: Readonly<ShallowRef<ComponentExposed<typeof SearchTreePanel> | null>>,
): UseOperableCustomSearchTreePanelResult<T, CT> {
  const { items, updateByLookup } = getCustomAttribute(beanMap, mergeHandler)

  function setCurrent(t: T | null): void {
    const instance = searchTreePanelRef.value
    if (!instance) {
      throw new Error('SearchTreePanel instance is not ready')
    }
    if (!t) {
      instance.setCurrent(null)
      return
    }
    const ct: CT = beanMap(t)
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.setCurrent(ct as Record<string, any>)
  }

  return {
    items,
    updateByLookup,
    setCurrent,
  } as UseOperableCustomSearchTreePanelResult<T, CT>
}

/**
 * 使用可操作的搜索树面板（简化版）。
 *
 * 该方法可以简化懒加载搜索树面板使用的 component bean 类型和后端接口返回的 bean 类型一致的场景。
 *
 * 该方法在 {@link useIdentityCustomSearchTreePanel} 的基础上，额外提供了对组件实例的便捷操作方法。
 *
 * 该方法要求调用者提供：
 * - `beanMap`：将 `T` 映射为 `CT`
 * - `mergeHandler`：将新结果合并到 `items` 中（例如：保留引用以维持展开/选中状态，或直接整体替换）
 *
 * 在此 API 下，调用者需要完全控制 `items` 的结构和更新方式。
 * 如果目标 bean 可以通过特定的方法进行映射与合并，并且效率高于托管 API 使用的通用映射与合并方法，
 * 则适合使用此方法。
 *
 * 该方法返回的结果中：
 * - `items` 可直接用于搜索树面板的 `items` 属性。
 * - `updateByLookup` 用于在拿到查询结果 `T[]` 后更新 `items`。
 * - `setCurrent` 用于设置树的当前选中项（依赖 `searchTreePanelRef`）。
 *
 * @template T bean 类型。
 * @param mergeHandler 合并处理器。
 * @param searchTreePanelRef 搜索树面板的引用。
 * @returns 调用方法后的返回结果。
 */
export function useOperableIdentityCustomSearchTreePanel<T>(
  mergeHandler: (ref: Ref<T[]>, ts: T[]) => void,
  searchTreePanelRef: Readonly<ShallowRef<ComponentExposed<typeof SearchTreePanel> | null>>,
): UseOperableCustomSearchTreePanelResult<T, T> {
  return useOperableCustomSearchTreePanel((t: T) => t, mergeHandler, searchTreePanelRef)
}

// -----------------------------------------------------------托管-公共-----------------------------------------------------------
type GetCustomAttributeResult<T, CT> = {
  items: Ref<CT[]>
  updateByLookup: (res: T[]) => void
}

function getCustomAttribute<T, CT>(
  beanMap: (t: T) => CT,
  mergeHandler: (ref: Ref<CT[]>, cts: CT[]) => void,
): GetCustomAttributeResult<T, CT> {
  const _items = ref<CT[]>([])

  function updateByLookup(res: T[]): void {
    const cts: CT[] = res.map(beanMap)
    mergeHandler(_items as Ref<CT[]>, cts)
  }

  return {
    items: _items,
    updateByLookup,
  } as GetCustomAttributeResult<T, CT>
}

// -----------------------------------------------------------托管-----------------------------------------------------------
type UseManagedSearchTreePanelResult<T, PT> = {
  keyField: 'key'
  labelField: 'label'
  childrenField: 'children'
  disabledField: 'disabled' | undefined
  items: Ref<ManagedBean<PT>[]>
  updateByLookup: (res: T[]) => void
}

/**
 * 使用托管的搜索树面板。
 *
 * 托管 API 可实现如下功能：
 * - 调用者提供 bean 的拆解方式（key/label/children/disabled/data）
 * - composable 负责把 bean 构造成可直接喂给 `SearchTreePanel` 的树节点结构（{@link ManagedBean}）
 *
 * 与自定义 API 的区别在于托管 API 维护了一套通用的 bean 映射与合并逻辑，使用者只需提供映射函数即可，
 * 而不需要关心树节点的构造与更新细节。
 *
 * 托管 API 使用通用的遍历方法构造树节点，并使用遍历-对比的方式合并新旧数据。
 * 如果通用方式的效率可以满足需求，使用托管 API 可避免使用者重复实现相似的映射与合并逻辑，从而简化代码。
 *
 * 该方法返回的结果中：
 * - `keyField/labelField/childrenField/disabledField` 可直接传给 `SearchTreePanel` 对应属性。
 * - `items` 可直接用于搜索树面板的 `items` 属性。
 * - `updateByLookup` 用于在拿到查询结果 `T[]` 后更新 `items`。
 *
 * @template T 查询返回的领域对象类型（通常为树结构根节点类型）。
 * @template PT 节点承载的业务数据类型，将被放入 `ManagedBean.data`。
 * @param keyMap key 映射函数，要求同一棵树中 key 唯一且稳定。
 * @param labelMap label 映射函数。
 * @param dataMap data 映射函数，将 `T` 映射为 `PT`。
 * @param childrenMap children 映射函数，返回子节点数组。
 * @param disableMap disabled 映射函数；若为空则认为全部节点不禁用。
 * @returns 调用方法后的返回结果。
 */
export function useManagedSearchTreePanel<T, PT>(
  keyMap: (t: T) => string,
  labelMap: (t: T) => string,
  dataMap: (t: T) => PT,
  childrenMap: (t: T) => T[],
  disableMap: ((t: T) => boolean) | null | undefined,
): UseManagedSearchTreePanelResult<T, PT> {
  const { keyField, labelField, childrenField, disabledField, items, updateByLookup } =
    getManagedAttribute(keyMap, labelMap, dataMap, childrenMap, disableMap)
  return {
    keyField,
    labelField,
    childrenField,
    disabledField,
    items,
    updateByLookup,
  } as UseManagedSearchTreePanelResult<T, PT>
}

type UseOperableManagedSearchTreePanelResult<T, PT> = {
  keyField: 'key'
  labelField: 'label'
  childrenField: 'children'
  disabledField: 'disabled' | undefined
  items: Ref<ManagedBean<PT>[]>
  updateByLookup: (res: T[]) => void
  setCurrent: (t: T | null) => void
}

/**
 * 使用可操作的托管搜索树面板。
 *
 * 该方法在 {@link useManagedSearchTreePanel} 的基础上，额外提供了对组件实例的便捷操作方法。
 *
 * 托管 API 可实现如下功能：
 * - 调用者提供 bean 的拆解方式（key/label/children/disabled/data）
 * - composable 负责把 bean 构造成可直接喂给 `SearchTreePanel` 的树节点结构（{@link ManagedBean}）
 *
 * 与自定义 API 的区别在于托管 API 维护了一套通用的 bean 映射与合并逻辑，使用者只需提供映射函数即可，
 * 而不需要关心树节点的构造与更新细节。
 *
 * 托管 API 使用通用的遍历方法构造树节点，并使用遍历-对比的方式合并新旧数据。
 * 如果通用方式的效率可以满足需求，使用托管 API 可避免使用者重复实现相似的映射与合并逻辑，从而简化代码。
 *
 * @template T 查询返回的领域对象类型。
 * @template PT 节点承载的业务数据类型。
 * @param keyMap key 映射函数。
 * @param labelMap label 映射函数。
 * @param dataMap data 映射函数。
 * @param childrenMap children 映射函数。
 * @param disableMap disabled 映射函数；若为空则认为全部节点不禁用。
 * @param searchTreePanelRef 搜索树面板的引用。
 * @returns 调用方法后的返回结果。
 * @see useManagedSearchTreePanel
 */
export function useOperableManagedSearchTreePanel<T, PT>(
  keyMap: (t: T) => string,
  labelMap: (t: T) => string,
  dataMap: (t: T) => PT,
  childrenMap: (t: T) => T[],
  disableMap: ((t: T) => boolean) | null | undefined,
  searchTreePanelRef: Readonly<ShallowRef<ComponentExposed<typeof SearchTreePanel> | null>>,
): UseOperableManagedSearchTreePanelResult<T, PT> {
  const { keyField, labelField, childrenField, disabledField, items, updateByLookup } =
    getManagedAttribute(keyMap, labelMap, dataMap, childrenMap, disableMap)

  function setCurrent(t: T | null): void {
    const instance = searchTreePanelRef.value
    if (!instance) {
      throw new Error('SearchTreePanel instance is not ready')
    }
    if (!t) {
      instance.setCurrent(null)
      return
    }
    const managedBean: ManagedBean<PT> = instance.getItem(keyMap(t)) as ManagedBean<PT>
    // 此处类型必须使用 any，故忽略类型检查
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance.setCurrent(managedBean as Record<string, any>)
  }

  return {
    keyField,
    labelField,
    childrenField,
    disabledField,
    items,
    updateByLookup,
    setCurrent,
  } as UseOperableManagedSearchTreePanelResult<T, PT>
}

// -----------------------------------------------------------托管-公共-----------------------------------------------------------
type GetManagedAttributeResult<T, PT> = {
  keyField: 'key'
  labelField: 'label'
  childrenField: 'children'
  disabledField: 'disabled' | undefined
  items: Ref<ManagedBean<PT>[]>
  updateByLookup: (res: T[]) => void
}

function getManagedAttribute<T, PT>(
  keyMap: (t: T) => string,
  labelMap: (t: T) => string,
  dataMap: (t: T) => PT,
  childrenMap: (t: T) => T[],
  disableMap: ((t: T) => boolean) | null | undefined,
): GetManagedAttributeResult<T, PT> {
  function parseManagedBean<PT>(
    keyMap: (t: T) => string,
    labelMap: (t: T) => string,
    dataMap: (t: T) => PT,
    childrenMap: (t: T) => T[],
    disableMap: ((t: T) => boolean) | null | undefined,
    t: T,
    parent: ManagedBean<PT> | null,
  ): ManagedBean<PT> {
    const managedBean: ManagedBean<PT> = {
      key: keyMap(t),
      label: labelMap(t),
      disabled: disableMap ? disableMap(t) : false,
      parent: parent,
      children: [],
      data: dataMap(t),
    }
    const children: T[] = childrenMap(t)
    for (const child of children) {
      managedBean.children.push(
        parseManagedBean(keyMap, labelMap, dataMap, childrenMap, disableMap, child, managedBean),
      )
    }
    return managedBean
  }

  /**
   * 同步节点数组，保持对象引用不变以保留树的展开状态。
   * 通过对比新旧数据，使用 splice 和 push 等方法同步差异。
   */
  function syncManagedBeanArray(
    oldItems: ManagedBean<PT>[],
    newItems: ManagedBean<PT>[],
    parent: ManagedBean<PT> | null,
  ): void {
    // 处理空数组边界情况
    if (newItems.length === 0) {
      oldItems.length = 0
      return
    }

    // 构建旧数据 key 到 RelationBean 的映射（保留引用）
    const oldKeyMap = new Map<string, ManagedBean<PT>>()
    for (const oldItem of oldItems) {
      oldKeyMap.set(oldItem.key, oldItem)
    }

    // 按新数据顺序同步节点
    // 先收集需要保留的节点（按新顺序），并更新它们的属性
    const itemsToKeep: ManagedBean<PT>[] = []
    for (const newItem of newItems) {
      const oldItem = oldKeyMap.get(newItem.key)

      if (oldItem) {
        // 旧数据中存在相同 key 的节点，更新属性（保持引用）
        oldItem.key = newItem.key
        oldItem.label = newItem.label
        oldItem.disabled = newItem.disabled
        oldItem.parent = parent
        oldItem.data = newItem.data

        // 递归同步子节点
        syncManagedBeanArray(oldItem.children, newItem.children, oldItem)

        itemsToKeep.push(oldItem)
      } else {
        // 旧数据中不存在，创建新节点
        const itemToInsert: ManagedBean<PT> = {
          key: newItem.key,
          label: newItem.label,
          disabled: newItem.disabled,
          parent: parent,
          children: [],
          data: newItem.data,
        }
        // 递归处理子节点
        syncManagedBeanArray(itemToInsert.children, newItem.children, itemToInsert)

        itemsToKeep.push(itemToInsert)
      }
    }

    // 使用 splice 删除所有旧节点，然后按新顺序 push 所有节点
    // 这样可以保持数组引用不变，同时保持节点对象引用不变（对于相同 key 的节点）
    oldItems.splice(0, oldItems.length)
    for (const item of itemsToKeep) {
      oldItems.push(item)
    }
  }

  const _keyField = 'key'
  const _labelField = 'label'
  const _childrenField = 'children'
  const _disabledField = disableMap ? 'disabled' : undefined
  const _items = ref<ManagedBean<PT>[]>([])

  function updateByLookup(res: T[]): void {
    const managedBeans: ManagedBean<PT>[] = []
    for (const t of res) {
      managedBeans.push(
        parseManagedBean(keyMap, labelMap, dataMap, childrenMap, disableMap, t, null),
      )
    }
    // 使用同步函数更新数据，保持对象引用以保留树的展开状态
    syncManagedBeanArray(_items.value as ManagedBean<PT>[], managedBeans, null)
  }

  return {
    keyField: _keyField,
    labelField: _labelField,
    childrenField: _childrenField,
    disabledField: _disabledField,
    items: _items,
    updateByLookup,
  } as GetManagedAttributeResult<T, PT>
}
