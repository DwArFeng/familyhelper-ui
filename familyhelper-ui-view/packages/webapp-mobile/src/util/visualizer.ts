// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { ref, watch } from 'vue'

import vim from '@/vim'

import { type VisualizerStore } from '@/store/modules/visualizer.ts'
import { type Visualizer } from '@/library/types.ts'

const visualizerStore = vim.ctx().store().vueStore<'visualizer', VisualizerStore>('visualizer')

const currentVisualizer = ref<Visualizer | null>(null)

/**
 * 静默初始化 Visualizer 实例。
 *
 * 该方法会获取当前配置的 Visualizer 实例，但不显示错误通知。
 * 用于首次加载时避免错误通知噪音。
 */
function initializeVisualizer(): void {
  const visualizerKey = visualizerStore.visualizerKey

  if (!visualizerKey) {
    currentVisualizer.value = vim.ctx().library().defaultVisualizer()
  } else {
    const visualizer: Visualizer | null = vim.ctx().library().visualizer(visualizerKey)
    if (!visualizer) {
      currentVisualizer.value = vim.ctx().library().defaultVisualizer()
    } else {
      currentVisualizer.value = visualizer
    }
  }
}

/**
 * 更新 Visualizer 实例。
 *
 * 该方法会获取当前配置的 Visualizer 实例，并显示相应的错误通知。
 * 用于响应 visualizerKey 变化时通知用户配置问题。
 */
function updateVisualizer(): void {
  const visualizerKey = visualizerStore.visualizerKey

  if (!visualizerKey) {
    vim
      .ctx()
      .library()
      .defaultVisualizer()
      .notify('errorMessage', `配置仓库中的 Visualizer Key 为空，使用默认可视化器`)
    currentVisualizer.value = vim.ctx().library().defaultVisualizer()
  } else {
    const visualizer: Visualizer | null = vim.ctx().library().visualizer(visualizerKey)
    if (!visualizer) {
      vim
        .ctx()
        .library()
        .defaultVisualizer()
        .notify(
          'errorMessage',
          `配置仓库中的 Visualizer Key "${visualizerKey}" 不存在，使用默认可视化器`,
        )
      currentVisualizer.value = vim.ctx().library().defaultVisualizer()
    } else {
      currentVisualizer.value = visualizer
    }
  }
}

watch(
  () => ({ ready: visualizerStore.ready, visualizerKey: visualizerStore.visualizerKey }),
  (value, oldValue) => {
    if (!value.ready) {
      initializeVisualizer()
      return
    }
    if (value.visualizerKey !== oldValue?.visualizerKey) {
      updateVisualizer()
    }
  },
  { immediate: true },
)

/**
 * 获取当前配置的 Visualizer 实例。
 *
 * @returns Visualizer 实例。
 */
export function getVisualizer(): Visualizer {
  if (!currentVisualizer.value) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }
  return currentVisualizer.value
}
