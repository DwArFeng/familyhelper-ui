// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type ComputedRef, type Ref } from 'vue'
import { computed, ref } from 'vue'
import { type ShallowRef } from 'vue'

import { type ECharts } from 'echarts/core'

import { type GeneralChartPanelOption } from './types.ts'
import { type RendererType } from './types.ts'
import GeneralChartPanel from './GeneralChartPanel.vue'

// -----------------------------------------------------------通用-----------------------------------------------------------
type UseGeneralGeneralChartPanelResult = {
  option: Ref<GeneralChartPanelOption>
  theme: ComputedRef<string | object | undefined>
  renderer: ComputedRef<RendererType>
  autoResize: ComputedRef<boolean | undefined>
  autoLoading: ComputedRef<boolean | undefined>
}

/**
 * 使用通用的通用图表。
 *
 * 该方法适用于表格变化较大的灵活场景。
 *
 * 返回的结果中：
 * - `option` 表示图表的选项，可直接用于 GeneralChartPanel 的 `option` 属性。
 * - `theme` 表示图表的主题，可直接用于 GeneralChartPanel 的 `theme` 属性。
 * - `renderer` 表示图表的渲染器类型，可直接用于 GeneralChartPanel 的 `renderer` 属性。
 * - `autoResize` 表示图表是否自动调整大小，可直接用于 GeneralChartPanel 的 `autoResize` 属性。
 * - `autoLoading` 表示图表是否自动加载数据，可直接用于 GeneralChartPanel 的 `autoLoading` 属性。
 *
 * @param initialOption 初始的图表选项，默认为空对象。
 * @param theme 图表的主题，可以是字符串或对象，默认为 `undefined`。
 * @param renderer 图表的渲染器类型，可以是字符串或对象，默认为 `canvas`。
 * @returns 调用方法后的返回结果。
 */
export function useGeneralGeneralChartPanel(
  initialOption: GeneralChartPanelOption | undefined,
  theme: string | object | undefined,
  renderer: RendererType,
): UseGeneralGeneralChartPanelResult {
  const _option = ref<GeneralChartPanelOption>(initialOption ?? {})

  const _theme = computed<string | object | undefined>(() => theme)
  const _renderer = computed<RendererType>(() => renderer)
  const _autoResize = computed<boolean>(() => true)
  const _autoLoading = computed<boolean>(() => true)

  return {
    option: _option,
    theme: _theme,
    renderer: _renderer,
    autoResize: _autoResize,
    autoLoading: _autoLoading,
  } as UseGeneralGeneralChartPanelResult
}

// -----------------------------------------------------------通用-带操作方法-----------------------------------------------------------
type UseOperableGeneralGeneralChartPanelResult = {
  option: Ref<GeneralChartPanelOption>
  theme: ComputedRef<string | object | undefined>
  renderer: ComputedRef<RendererType>
  autoResize: ComputedRef<boolean | undefined>
  autoLoading: ComputedRef<boolean | undefined>
  resize: () => void
  showLoading: () => void
  hideLoading: () => void
  renderToSVGString: (opts?: Parameters<ECharts['renderToSVGString']>[0]) => string
  getDataURL: (opts?: Parameters<ECharts['getDataURL']>[0]) => string
  getConnectedDataURL: (opts?: Parameters<ECharts['getConnectedDataURL']>[0]) => string
}

/**
 * 使用可操作的通用的通用图表。
 *
 * 该方法适用于表格变化较大的灵活场景。
 *
 * 返回的结果中：
 * - `option` 表示图表的选项，可直接用于 GeneralChartPanel 的 `option` 属性。
 * - `theme` 表示图表的主题，可直接用于 GeneralChartPanel 的 `theme` 属性。
 * - `renderer` 表示图表的渲染器类型，可直接用于 GeneralChartPanel 的 `renderer` 属性。
 * - `autoResize` 表示图表是否自动调整大小，可直接用于 GeneralChartPanel 的 `autoResize` 属性。
 * - `autoLoading` 表示图表是否自动加载数据，可直接用于 GeneralChartPanel 的 `autoLoading` 属性。
 * - `resize` 方法用于调整图表大小。
 * - `showLoading` 方法用于显示图表加载状态。
 * - `hideLoading` 方法用于隐藏图表加载状态。
 * - `renderToSVGString` 方法用于将图表渲染为 SVG 字符串。
 * - `getDataURL` 方法用于获取图表的 Data URL。
 * - `getConnectedDataURL` 方法用于获取连接的图表的 Data URL。
 *
 * 该方法除了返回图表选项和主题等基本信息外，还提供了一些操作方法，方便在图表实例化后进行操作。
 *
 * @param initialOption 初始的图表选项，默认为空对象。
 * @param theme 图表的主题，可以是字符串或对象，默认为 `undefined`。
 * @param renderer 图表的渲染器类型，可以是字符串或对象，默认为 `canvas`。
 * @param autoResize 图表是否自动调整大小，默认为 `true`。
 * @param autoLoading 图表是否自动加载数据，默认为 `true`。
 * @param generalChartPanelRef 通用表格面板的引用。
 */
export function useOperableGeneralGeneralChartPanel(
  initialOption: GeneralChartPanelOption | undefined,
  theme: string | object | undefined,
  renderer: RendererType,
  autoResize: boolean | undefined,
  autoLoading: boolean | undefined,
  generalChartPanelRef: Readonly<ShallowRef<InstanceType<typeof GeneralChartPanel> | null>>,
): UseOperableGeneralGeneralChartPanelResult {
  const _option = ref<GeneralChartPanelOption>(initialOption ?? {})

  const _theme = computed<string | object | undefined>(() => theme)
  const _renderer = computed<RendererType>(() => renderer)
  const _autoResize = computed<boolean | undefined>(() => autoResize)
  const _autoLoading = computed<boolean | undefined>(() => autoLoading)

  function resize(): void {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    instance.resize()
  }

  function showLoading(): void {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    instance.showLoading()
  }

  function hideLoading(): void {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    instance.hideLoading()
  }

  function renderToSVGString(opts?: Parameters<ECharts['renderToSVGString']>[0]): string {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    return instance.renderToSVGString(opts)
  }

  function getDataURL(opts?: Parameters<ECharts['getDataURL']>[0]): string {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    return instance.getDataURL(opts)
  }

  function getConnectedDataURL(opts?: Parameters<ECharts['getConnectedDataURL']>[0]): string {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    return instance.getConnectedDataURL(opts)
  }

  return {
    option: _option,
    theme: _theme,
    renderer: _renderer,
    autoResize: _autoResize,
    autoLoading: _autoLoading,
    resize,
    showLoading,
    hideLoading,
    renderToSVGString,
    getDataURL,
    getConnectedDataURL,
  } as UseOperableGeneralGeneralChartPanelResult
}

// -----------------------------------------------------------分离-----------------------------------------------------------
type UseSeparatedGeneralChartPanelResult = {
  option: ComputedRef<GeneralChartPanelOption>
  theme: ComputedRef<string | object | undefined>
  renderer: ComputedRef<RendererType>
  autoResize: ComputedRef<boolean | undefined>
  autoLoading: ComputedRef<boolean | undefined>
  staticOption: Ref<GeneralChartPanelOption>
  dynamicOption: Ref<GeneralChartPanelOption>
}

/**
 * 使用分离的通用图表。
 *
 * 该方法将表格选项分为静态和动态两个部分，适用于表格结构固定，但是其中的数据经常变化的场景。
 *
 * 返回的结果中：
 * - `option` 表示图表的选项，包含静态和动态部分，可直接用于 GeneralChartPanel 的 `option` 属性。
 * - `theme` 表示图表的主题，可直接用于 GeneralChartPanel 的 `theme` 属性。
 * - `renderer` 表示图表的渲染器类型，可直接用于 GeneralChartPanel 的 `renderer` 属性。
 * - `autoResize` 表示图表是否自动调整大小，可直接用于 GeneralChartPanel 的 `autoResize` 属性。
 * - `autoLoading` 表示图表是否自动加载数据，可直接用于 GeneralChartPanel 的 `autoLoading` 属性。
 * - `staticOption` 表示静态部分的图表选项，更改此引用中的值，便可更改图表选项中的静态部分。
 * - `dynamicOption` 表示动态部分的图表选项，更改此引用中的值，便可更改图表选项中的动态部分。
 *
 * @param initialStaticOption 初始的静态图表选项，默认为空对象。
 * @param initialDynamicOption 初始的动态图表选项，默认为空对象。
 * @param theme 图表的主题，可以是字符串或对象，默认为 `undefined`。
 * @param renderer 图表的渲染器类型，可以是字符串或对象，默认为 `canvas`。
 */
export function useSeparatedGeneralChartPanel(
  initialStaticOption: GeneralChartPanelOption | undefined,
  initialDynamicOption: GeneralChartPanelOption | undefined,
  theme: string | object | undefined,
  renderer: RendererType,
): UseSeparatedGeneralChartPanelResult {
  const _option = computed<GeneralChartPanelOption>(() => {
    const _innerStaticOption: GeneralChartPanelOption = _staticOption.value ?? {}
    const _innerDynamicOption: GeneralChartPanelOption = _dynamicOption.value ?? {}
    return mergeObjects(_innerStaticOption, _innerDynamicOption)
  })
  const _theme = computed<string | object | undefined>(() => theme)
  const _renderer = computed<RendererType>(() => renderer)
  const _autoResize = computed<boolean>(() => true)
  const _autoLoading = computed<boolean>(() => true)

  const _staticOption = ref<GeneralChartPanelOption>(initialStaticOption ?? {})
  const _dynamicOption = ref<GeneralChartPanelOption>(initialDynamicOption ?? {})

  return {
    option: _option,
    theme: _theme,
    renderer: _renderer,
    autoResize: _autoResize,
    autoLoading: _autoLoading,
    staticOption: _staticOption,
    dynamicOption: _dynamicOption,
  } as UseSeparatedGeneralChartPanelResult
}

// -----------------------------------------------------------分离-带操作方法-----------------------------------------------------------
type UseOperableSeparatedGeneralChartPanelResult = {
  option: ComputedRef<GeneralChartPanelOption>
  theme: ComputedRef<string | object | undefined>
  renderer: ComputedRef<RendererType>
  autoResize: ComputedRef<boolean | undefined>
  autoLoading: ComputedRef<boolean | undefined>
  staticOption: Ref<GeneralChartPanelOption>
  dynamicOption: Ref<GeneralChartPanelOption>
  resize: () => void
  showLoading: () => void
  hideLoading: () => void
  renderToSVGString: (opts?: Parameters<ECharts['renderToSVGString']>[0]) => string
  getDataURL: (opts?: Parameters<ECharts['getDataURL']>[0]) => string
  getConnectedDataURL: (opts?: Parameters<ECharts['getConnectedDataURL']>[0]) => string
}

/**
 * 使用可操作的分离的通用图表。
 *
 * 该方法将表格选项分为静态和动态两个部分，适用于表格结构固定，但是其中的数据经常变化的场景。
 *
 * 返回的结果中：
 * - `option` 表示图表的选项，包含静态和动态部分，可直接用于 GeneralChartPanel 的 `option` 属性。
 * - `theme` 表示图表的主题，可直接用于 GeneralChartPanel 的 `theme` 属性。
 * - `renderer` 表示图表的渲染器类型，可直接用于 GeneralChartPanel 的 `renderer` 属性。
 * - `autoResize` 表示图表是否自动调整大小，可直接用于 GeneralChartPanel 的 `autoResize` 属性。
 * - `autoLoading` 表示图表是否自动加载数据，可直接用于 GeneralChartPanel 的 `autoLoading` 属性。
 * - `staticOption` 表示静态部分的图表选项，更改此引用中的值，便可更改图表选项中的静态部分。
 * - `dynamicOption` 表示动态部分的图表选项，更改此引用中的值，便可更改图表选项中的动态部分。
 * - `resize` 方法用于调整图表大小。
 * - `showLoading` 方法用于显示图表加载状态。
 * - `hideLoading` 方法用于隐藏图表加载状态。
 * - `renderToSVGString` 方法用于将图表渲染为 SVG 字符串。
 * - `getDataURL` 方法用于获取图表的 Data URL。
 * - `getConnectedDataURL` 方法用于获取连接的图表的 Data URL。
 *
 * @param initialStaticOption 初始的静态图表选项，默认为空对象。
 * @param initialDynamicOption 初始的动态图表选项，默认为空对象。
 * @param theme 图表的主题，可以是字符串或对象，默认为 `undefined`。
 * @param renderer 图表的渲染器类型，可以是字符串或对象，默认为 `canvas`。
 * @param autoResize 图表是否自动调整大小，默认为 `true`。
 * @param autoLoading 图表是否自动加载数据，默认为 `true`。
 * @param generalChartPanelRef 通用表格面板的引用。
 */
export function useOperableSeparatedGeneralChartPanel(
  initialStaticOption: GeneralChartPanelOption | undefined,
  initialDynamicOption: GeneralChartPanelOption | undefined,
  theme: string | object | undefined,
  renderer: RendererType,
  autoResize: boolean | undefined,
  autoLoading: boolean | undefined,
  generalChartPanelRef: Readonly<ShallowRef<InstanceType<typeof GeneralChartPanel> | null>>,
): UseOperableSeparatedGeneralChartPanelResult {
  const _option = computed<GeneralChartPanelOption>(() => {
    const _innerStaticOption: GeneralChartPanelOption = _staticOption.value ?? {}
    const _innerDynamicOption: GeneralChartPanelOption = _dynamicOption.value ?? {}
    return mergeObjects(_innerStaticOption, _innerDynamicOption)
  })
  const _theme = computed<string | object | undefined>(() => theme)
  const _renderer = computed<RendererType>(() => renderer)
  const _autoResize = computed<boolean | undefined>(() => autoResize)
  const _autoLoading = computed<boolean | undefined>(() => autoLoading)

  const _staticOption = ref<GeneralChartPanelOption>(initialStaticOption ?? {})
  const _dynamicOption = ref<GeneralChartPanelOption>(initialDynamicOption ?? {})

  function resize(): void {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    instance.resize()
  }

  function showLoading(): void {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    instance.showLoading()
  }

  function hideLoading(): void {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    instance.hideLoading()
  }

  function renderToSVGString(opts?: Parameters<ECharts['renderToSVGString']>[0]): string {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    return instance.renderToSVGString(opts)
  }

  function getDataURL(opts?: Parameters<ECharts['getDataURL']>[0]): string {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    return instance.getDataURL(opts)
  }

  function getConnectedDataURL(opts?: Parameters<ECharts['getConnectedDataURL']>[0]): string {
    const instance = generalChartPanelRef.value
    if (!instance) {
      throw new Error('GeneralChartPanel instance is not ready')
    }
    return instance.getConnectedDataURL(opts)
  }

  return {
    option: _option,
    theme: _theme,
    renderer: _renderer,
    autoResize: _autoResize,
    autoLoading: _autoLoading,
    staticOption: _staticOption,
    dynamicOption: _dynamicOption,
    resize,
    showLoading,
    hideLoading,
    renderToSVGString,
    getDataURL,
    getConnectedDataURL,
  } as UseOperableSeparatedGeneralChartPanelResult
}

// 由于 MergeObject 仅在内部使用，因此使用 any 类型是可控的。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MergeObject = Record<string, any>

// 深度合并两个对象，特别处理数组属性如 series
function mergeObjects(target: MergeObject, source: MergeObject): MergeObject {
  const result = { ...target }

  if (!source) return result

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]

    // 如果是 undefined，则跳过
    if (sourceValue === undefined) {
      return
    }

    // 如果目标中不存在该键，直接赋值
    if (!(key in result)) {
      result[key] = sourceValue
      return
    }

    const targetValue = result[key]

    // 特殊处理数组，如 series
    if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
      // 对于 series 数组，根据 name 属性进行匹配合并
      if (key === 'series') {
        // 构建一个映射，通过 name 找到对应的系列
        const targetMap = new Map()
        targetValue.forEach((item, index) => {
          if (item.name) {
            targetMap.set(item.name, { item, index })
          }
        })

        // 合并或添加源系列
        sourceValue.forEach((sourceItem) => {
          if (sourceItem.name && targetMap.has(sourceItem.name)) {
            // 存在相同名称的系列，进行合并
            const { item: targetItem, index } = targetMap.get(sourceItem.name)
            result[key][index] = { ...targetItem, ...sourceItem }
          } else {
            // 不存在相同名称的系列，添加到数组末尾
            result[key].push(sourceItem)
          }
        })
      } else {
        // 对于其他数组，直接使用源数组替换
        result[key] = sourceValue
      }
    }
    // 处理对象类型，递归合并
    else if (isObject(sourceValue) && isObject(targetValue)) {
      result[key] = mergeObjects(targetValue, sourceValue)
    }
    // 其他类型直接替换
    else {
      result[key] = sourceValue
    }
  })

  return result
}

// 辅助函数：检查是否为对象
function isObject(value: unknown): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
