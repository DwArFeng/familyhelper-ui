// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import {
  type Component,
  type ComponentSetting,
  type CompregSetting,
  type VimCompreg,
  type VimCompregModule,
} from '@/compreg/types.ts'
import { defaultComponentKey } from '@/compreg/props.ts'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

type Module = { default: VimCompregModule }

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'

/**
 * Compreg 组件信息。
 */
const compregComponents: Record<string, Component> = {}

/**
 * Compreg。
 */
const compreg: VimCompreg = {
  init,
  setting: setting(),
  defaultComponent,
  component,
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
  const rawModules: Record<string, Module> = import.meta.glob('./modules/*.ts', { eager: true })

  // 定义 modules 对象。
  const modules: Record<string, Module> = {}

  // 遍历所有模块，解析单个模块，并将其存入 modules 对象。
  for (const moduleKey in rawModules) {
    /*
     * 获取模块名称。
     * 由于 import.meta.glob 返回的 key 是相对路径，故可使用正则表达式替换获取模块名称。
     */
    const moduleName: string = toKebabCase(moduleKey.replace(/^\.\/modules\/(\w+)\.ts$/, '$1'))
    // 将模块存入 modules 对象。
    modules[moduleName] = rawModules[moduleKey]
  }

  // 定义 ComponentSetting 数组。
  const compregSettings: ComponentSetting[] = []

  // 定义 Promise 数组。
  const promises: Promise<void>[] = []

  // 遍历所有模块，对其初始化。
  for (const moduleName in modules) {
    // 获取模块。
    const vimCompregModule: VimCompregModule = modules[moduleName].default as VimCompregModule
    // 初始化模块。
    const mayPromise = vimCompregModule.init(ctx)
    // 判断 mayPromise 是否为 Promise，并执行对应操作。
    if (mayPromise instanceof Promise) {
      // 等待 mayPromise 完成后，将 ComponentSetting 存入 compregSettings 数组。
      mayPromise.then(() => {
        compregSettings.push(...vimCompregModule.provideComponentSettings())
      })
      // 将 Promise 存入 Promise 数组。
      promises.push(mayPromise)
    } else {
      // 将 ComponentSetting 存入 compregSettings 数组。
      compregSettings.push(...vimCompregModule.provideComponentSettings())
    }
  }

  // 等待所有 Promise 完成。
  await Promise.all(promises)

  // 将 ComponentSetting 转换为 Component，并存入 compregComponents 对象。
  for (const compregSetting of compregSettings) {
    if (compregComponents[compregSetting.key]) {
      throw new Error(`Compreg 组件 ${compregSetting.key} 重复`)
    }
    compregComponents[compregSetting.key] = compregSetting.component
  }

  // 设置状态。
  status = 'initialized'
}

/**
 * 获取设置。
 *
 * @returns 设置。
 */
function setting(): CompregSetting {
  return {
    defaultComponentKey,
  }
}

/**
 * 获取默认的 Component。
 *
 * @returns 默认的 Component。
 */
function defaultComponent(): Component {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 defaultComponent')
  }
  const component: Component = compregComponents[defaultComponentKey]
  if (!component) {
    throw new Error('找不到默认的 Component')
  }
  return component
}

/**
 * 根据指定的 key 获取组件。
 *
 * @param key 指定的 key。
 */
function component(key: string): Component | null {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 component')
  }
  return compregComponents[key] || null
}

export default compreg
