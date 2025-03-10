import type { VimApplicationContext } from '@/vim/types.ts'
import type { LibrarySetting, VimLibrary, VimLibraryModule, Visualizer } from '@/library/types.ts'
import { defaultVisualizerKey } from '@/library/props.ts'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

type Module = { default: VimLibraryModule }

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'

/**
 * 可视化器信息。
 */
const libraryVisualizers: Record<string, Visualizer> = {}

/**
 * Library。
 */
const library: VimLibrary = {
  init,
  setting: setting(),
  defaultVisualizer,
  visualizerKeys,
  visualizers,
  visualizer,
}

/**
 * 初始化。
 *
 * @param ctx VIM 应用上下文对象。
 */
async function init(ctx: VimApplicationContext): Promise<void> {
  // 检查状态。
  if (status !== 'initializing') {
    throw new Error('只能在 initializing 状态下初始化')
  }

  // 动态获取 modules 目录下的所有模块。
  const rawModules: Record<string, Module> = import.meta.glob('./modules/*/index.ts', {
    eager: true,
  })

  // 定义 modules 对象。
  const modules: Record<string, Module> = {}

  // 遍历所有模块，解析单个模块，并将其存入 modules 对象。
  for (const moduleKey in rawModules) {
    /*
     * 获取模块名称。
     * 由于 import.meta.glob 返回的 key 是相对路径，故可使用正则表达式替换获取模块名称。
     */
    const moduleName: string = toKebabCase(
      moduleKey.replace(/^\.\/modules\/(\w+)\/index\.ts$/, '$1'),
    )
    // 将模块存入 modules 对象。
    modules[moduleName] = rawModules[moduleKey]
  }

  // 定义 Promise 数组。
  const promises: Promise<void>[] = []

  // 遍历所有模块，对其初始化。
  for (const moduleName in modules) {
    // 获取模块。
    const vimLibraryModule: VimLibraryModule = modules[moduleName].default as VimLibraryModule
    // 初始化模块。
    const mayPromise = vimLibraryModule.init(ctx)
    // 判断 mayPromise 是否为 Promise，并执行对应操作。
    if (mayPromise instanceof Promise) {
      // 等待 mayPromise 完成后，将可视化器存入 visualizerInfos 对象。
      mayPromise.then(() => {
        const mayVisualizer = vimLibraryModule.provideVisualizer()
        if (mayVisualizer) {
          libraryVisualizers[moduleName] = mayVisualizer
        }
      })
      // 将 Promise 存入 Promise 数组。
      promises.push(mayPromise)
    } else {
      // 将可视化器存入 visualizerInfos 对象。
      const mayVisualizer = vimLibraryModule.provideVisualizer()
      if (mayVisualizer) {
        libraryVisualizers[moduleName] = mayVisualizer
      }
    }
  }

  // 等待所有 Promise 完成。
  await Promise.all(promises)

  // 设置状态为 initialized。
  status = 'initialized'
}

/**
 * 获取设置。
 *
 * @return 设置。
 */
function setting(): LibrarySetting {
  return {
    defaultVisualizerKey,
  }
}

/**
 * 获取默认的 Visualizer。
 *
 * @return 默认的 Visualizer。
 */
function defaultVisualizer(): Visualizer {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 defaultVisualizer')
  }
  const visualizer: Visualizer = libraryVisualizers[defaultVisualizerKey]
  if (!visualizer) {
    throw new Error('找不到默认的 Visualizer')
  }
  return visualizer
}

/**
 * 获取 Visualizer key 列表。
 *
 * @return Visualizer key 列表。
 */
function visualizerKeys(): Readonly<string[]> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 visualizerKeys')
  }
  return Object.keys(libraryVisualizers)
}

/**
 * 获取 Visualizer 列表。
 *
 * @return Visualizer 列表。
 */
function visualizers(): Readonly<Visualizer[]> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 visualizers')
  }
  return Object.values(libraryVisualizers)
}

/**
 * 根据指定的 key 获取 Visualizer。
 *
 * @param key 指定的 key。
 */
function visualizer(key: string): Visualizer | null {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 visualizer')
  }
  return libraryVisualizers[key] || null
}

export default library
