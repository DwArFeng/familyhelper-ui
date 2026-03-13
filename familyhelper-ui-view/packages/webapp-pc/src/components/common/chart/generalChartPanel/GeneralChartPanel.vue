<template>
  <div class="general-chart-panel-container" ref="chartContainerRef" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch, useTemplateRef } from 'vue'

import { type ECharts, type ECElementEvent, type Payload } from 'echarts/core'
import * as echarts from 'echarts/core'

import { type GeneralChartOption, type RendererType } from './types.ts'

defineOptions({
  name: 'GeneralChartPanel',
})

// -----------------------------------------------------------Props 定义-----------------------------------------------------------
type Props = {
  /**
   * 图表选项。
   *
   * 选项是 ECharts 的核心概念，ECharts 中的所有图表都是基于选项绘制的。
   *
   * @see https://echarts.apache.org/zh/option.html
   */
  option: GeneralChartOption

  /**
   * 图表主题。
   *
   * @see https://echarts.apache.org/handbook/zh/concepts/style/
   */
  theme?: string | object

  /**
   * 图表渲染器。
   *
   * @see https://echarts.apache.org/handbook/zh/best-practices/canvas-vs-svg/
   */
  renderer?: RendererType
}

const props = withDefaults(defineProps<Props>(), {
  theme: undefined,
  renderer: 'canvas',
})

// -----------------------------------------------------------Emits 定义-----------------------------------------------------------
type Emits = {
  // 初始化/销毁。
  (e: 'init', instance: ECharts): void
  (e: 'destroy'): void

  // 尺寸变化。
  (e: 'resize'): void

  // 鼠标事件。
  // noinspection SpellCheckingInspection
  (e: 'click', params: ECElementEvent): void
  // noinspection SpellCheckingInspection
  (e: 'dblclick', params: ECElementEvent): void
  // noinspection SpellCheckingInspection
  (e: 'mousedown', params: ECElementEvent): void
  // noinspection SpellCheckingInspection
  (e: 'mousemove', params: ECElementEvent): void
  // noinspection SpellCheckingInspection
  (e: 'mouseup', params: ECElementEvent): void
  // noinspection SpellCheckingInspection
  (e: 'mouseover', params: ECElementEvent): void
  // noinspection SpellCheckingInspection
  (e: 'mouseout', params: ECElementEvent): void
  // noinspection SpellCheckingInspection
  (e: 'globalout', params: ECElementEvent): void
  // noinspection SpellCheckingInspection
  (e: 'contextmenu', params: ECElementEvent): void

  // 组件事件。
  // noinspection SpellCheckingInspection
  (e: 'highlight', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'downplay', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'selectchanged', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'legendselectchanged', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'legendselected', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'legendunselected', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'legendselectall', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'legendinverseselect', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'legendscroll', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'datazoom', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'datarangeselected', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'graphroam', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'georoam', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'treeroam', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'timelinechanged', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'timelineplaychanged', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'restore', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'dataviewchanged', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'magictypechanged', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'geoselectchanged', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'geoselected', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'geounselected', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'axisareaselected', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'brush', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'brushend', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'brushselected', params: Payload): void
  // noinspection SpellCheckingInspection
  (e: 'globalcursortaken', params: Payload): void

  // 加载事件。
  // noinspection SpellCheckingInspection
  (e: 'rendered', params: { elapsedTime: number }): void
  // noinspection SpellCheckingInspection
  (e: 'finished'): void
}

const emit = defineEmits<Emits>()

// -----------------------------------------------------------容器引用-----------------------------------------------------------
const chartContainerRef = useTemplateRef<HTMLElement>('chartContainerRef')

// -----------------------------------------------------------实例引用-----------------------------------------------------------
const chartInstance = shallowRef<ECharts | null>(null)

// -----------------------------------------------------------延迟初始化标记-----------------------------------------------------------
let initLater: boolean = false

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
function initChart(): void {
  function bindEmitEvents(): void {
    // 鼠标事件。
    // noinspection SpellCheckingInspection
    _chartInstance.on('click', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('click', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('dblclick', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('dblclick', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('mousedown', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('mousedown', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('mousemove', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('mousemove', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('mouseup', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('mouseup', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('mouseover', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('mouseover', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('mouseout', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('mouseout', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('globalout', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('globalout', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('contextmenu', (param: ECElementEvent) => {
      // noinspection SpellCheckingInspection
      emit('contextmenu', param)
    })

    // 组件事件。
    // noinspection SpellCheckingInspection
    _chartInstance.on('highlight', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('highlight', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('downplay', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('downplay', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('selectchanged', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('selectchanged', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('legendselectchanged', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('legendselectchanged', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('legendselected', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('legendselected', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('legendunselected', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('legendunselected', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('legendselectall', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('legendselectall', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('legendinverseselect', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('legendinverseselect', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('legendscroll', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('legendscroll', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('datazoom', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('datazoom', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('datarangeselected', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('datarangeselected', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('graphroam', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('graphroam', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('georoam', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('georoam', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('treeroam', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('treeroam', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('timelinechanged', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('timelinechanged', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('timelineplaychanged', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('timelineplaychanged', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('restore', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('restore', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('dataviewchanged', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('dataviewchanged', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('magictypechanged', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('magictypechanged', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('geoselectchanged', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('geoselectchanged', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('geoselected', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('geoselected', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('geounselected', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('geounselected', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('axisareaselected', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('axisareaselected', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('brush', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('brush', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('brushend', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('brushend', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('brushselected', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('brushselected', param as Payload)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('globalcursortaken', (param: unknown) => {
      // noinspection SpellCheckingInspection
      emit('globalcursortaken', param as Payload)
    })

    // 加载事件。
    // noinspection SpellCheckingInspection
    _chartInstance.on('rendered', (param: { elapsedTime: number }) => {
      // noinspection SpellCheckingInspection
      emit('rendered', param)
    })
    // noinspection SpellCheckingInspection
    _chartInstance.on('finished', () => {
      // noinspection SpellCheckingInspection
      emit('finished')
    })
  }

  // 检查容器是否存在，如果不存在，则不进行初始化。
  const _chartContainer: HTMLElement | null = chartContainerRef.value
  if (!_chartContainer) {
    return
  }
  // 检查实例是否已存在，如果已存在，则不进行初始化。
  if (chartInstance.value) {
    return
  }

  // 当容器的长度或宽度为 0 时，标记为延迟初始化并退出，以规避 ECharts 警告。
  if (_chartContainer.clientWidth === 0 || _chartContainer.clientHeight === 0) {
    initLater = true
    return
  }

  // 创建新的 ECharts 实例。
  const _chartInstance: ECharts = echarts.init(chartContainerRef.value, props.theme, {
    renderer: props.renderer,
  })
  // 抛出事件绑定。
  bindEmitEvents()
  // 初始化选项。
  _chartInstance.setOption(props.option, true)
  // 保存实例引用。
  chartInstance.value = _chartInstance
  // 抛出初始化事件。
  emit('init', _chartInstance)
  // 复位延迟初始化标记。
  initLater = false
}

function disposeChart(): void {
  // 检查容器是否存在，如果不存在，则不进行初始化。
  if (!chartContainerRef.value) {
    return
  }
  // 检查实例是否存在，如果不存在，则不进行销毁。
  if (!chartInstance.value) {
    return
  }
  // 销毁实例。
  chartInstance.value.dispose()
  chartInstance.value = null
  // 抛出销毁事件。
  emit('destroy')
}

function refreshChart(): void {
  disposeChart()
  initChart()
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  disposeChart()
})

// -----------------------------------------------------------尺寸变化处理-----------------------------------------------------------
const resizeObserver = ref<ResizeObserver | null>(null)

function initResizeListener(): void {
  function resizeObserverCallBack(): void {
    // 如果延迟启动标记置位，则初始化。
    if (initLater) {
      initChart()
    }
    // 否则调整尺寸。
    else {
      const _chartInstance: ECharts | null = chartInstance.value as ECharts | null
      if (!_chartInstance) {
        return
      }
      _chartInstance.resize()
      emit('resize')
    }
  }

  const _chartContainer: HTMLElement | null = chartContainerRef.value
  if (!_chartContainer) {
    return
  }
  const _resizeObserver: ResizeObserver = new ResizeObserver(resizeObserverCallBack)
  _resizeObserver.observe(_chartContainer)
  resizeObserver.value = _resizeObserver
}

function disposeResizeListener(): void {
  const _resizeObserver: ResizeObserver | null = resizeObserver.value
  if (!_resizeObserver) {
    return
  }
  _resizeObserver.disconnect()
  resizeObserver.value = null
}

onMounted(() => {
  initResizeListener()
})

onUnmounted(() => {
  disposeResizeListener()
})

// -----------------------------------------------------------选项处理-----------------------------------------------------------
watch(() => props.option, updateOption, { deep: true })

function updateOption(option: GeneralChartOption): void {
  const _chartInstance: ECharts | null = chartInstance.value as ECharts | null
  if (!_chartInstance) {
    return
  }
  _chartInstance.setOption(option, true)
}

// -----------------------------------------------------------主题处理-----------------------------------------------------------
watch(
  () => props.theme,
  () => {
    refreshChart()
  },
)

// -----------------------------------------------------------渲染器处理-----------------------------------------------------------
watch(
  () => props.renderer,
  () => {
    refreshChart()
  },
)

// -----------------------------------------------------------加载动画-----------------------------------------------------------
/**
 * 显示加载动画。
 *
 * @see https://echarts.apache.org/zh/api.html#echartsInstance.showLoading
 */
function showLoading(): void {
  const _chartInstance: ECharts | null = chartInstance.value as ECharts | null
  if (!_chartInstance) {
    return
  }
  _chartInstance.showLoading()
}

/**
 * 隐藏加载动画。
 *
 * @see https://echarts.apache.org/zh/api.html#echartsInstance.hideLoading
 */
function hideLoading(): void {
  const _chartInstance: ECharts | null = chartInstance.value as ECharts | null
  if (!_chartInstance) {
    return
  }
  _chartInstance.hideLoading()
}

// -----------------------------------------------------------渲染输出-----------------------------------------------------------
/**
 * 渲染图表为 SVG 字符串。
 *
 * 渲染得到 SVG 字符串。在设置 `renderer: 'svg'` 使用 SVG 渲染模式有效。
 *
 * @param opts 选项，详见 ECharts 官方文档。
 * @returns 图表的 SVG 字符串。
 * @see https://echarts.apache.org/zh/api.html#echartsInstance.renderToSVGString
 */
function renderToSVGString(opts?: Parameters<ECharts['renderToSVGString']>[0]): string {
  const _chartInstance: ECharts | null = chartInstance.value as ECharts | null
  if (!_chartInstance) {
    throw new Error('EChart instance is not ready')
  }
  if (props.renderer !== 'svg') {
    throw new Error('Function renderToSVGString can only be used when renderer is svg')
  }
  return _chartInstance.renderToSVGString(opts)
}

/**
 * 获取图表的 Data URL。
 *
 * 导出图表图片，返回一个 general64 的 URL，可以设置为 `Image` 的 `src`。
 *
 * @param opts 选项，详见 ECharts 官方文档。
 * @returns 图表的 Data URL。
 * @see https://echarts.apache.org/zh/api.html#echartsInstance.getDataURL
 */
function getDataURL(opts?: Parameters<ECharts['getDataURL']>[0]): string {
  const _chartInstance: ECharts | null = chartInstance.value as ECharts | null
  if (!_chartInstance) {
    throw new Error('EChart instance is not ready')
  }
  return _chartInstance.getDataURL(opts)
}

/**
 * 获取连接图表的 Data URL。
 *
 * 导出连接图表图片，返回一个 general64 的 URL，可以设置为 `Image` 的 `src`。
 * 导出图片中每个图表的相对位置跟容器的相对位置有关。
 *
 * @param opts 选项，详见 ECharts 官方文档。
 * @returns 图表的 Data URL。
 * @see https://echarts.apache.org/zh/api.html#echartsInstance.getConnectedDataURL
 */
function getConnectedDataURL(opts?: Parameters<ECharts['getConnectedDataURL']>[0]): string {
  const _chartInstance: ECharts | null = chartInstance.value as ECharts | null
  if (!_chartInstance) {
    throw new Error('EChart instance is not ready')
  }
  return _chartInstance.getConnectedDataURL(opts)
}

// -----------------------------------------------------------方法暴露-----------------------------------------------------------
defineExpose({
  showLoading,
  hideLoading,
  renderToSVGString,
  getDataURL,
  getConnectedDataURL,
})
</script>

<style scoped>
.general-chart-panel-container {
  height: 100%;
  width: 100%;
}
</style>
