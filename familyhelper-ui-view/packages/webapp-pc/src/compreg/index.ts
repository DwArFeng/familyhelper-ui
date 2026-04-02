// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import {
  type Component,
  type ComponentInfo,
  type ComponentSetting,
  type CompregSetting,
  type VimCompreg,
  type VimCompregModule,
} from '@/compreg/types.ts'
import { defaultComponentKey } from '@/compreg/props.ts'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'
import { type JsonObject } from '@dwarfeng/familyhelper-ui-component-util/src/util/json.ts'

type Module = { default: VimCompregModule }

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'

/**
 * Compreg 组件信息。
 */
const compregComponentInfos: Record<string, ComponentInfo> = {}

/**
 * Compreg。
 */
const compreg: VimCompreg = {
  init,
  setting: setting(),
  defaultComponentInfo,
  componentInfo,
  componentInfos,
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

  /*
   * 对于 component，将其每个 key 都变为 kebab 格式，值保持不变。
   */
  function mapComponent(component: Component): Component {
    const _component: Component = { '': component[''] }
    for (const key in component) {
      _component[toKebabCase(key)] = component[key]
    }
    return _component
  }

  /*
   * 对于 exampleRouterComponentParam，将每个 key 都变为 kebab 格式，值保持不变。
   */
  function mapExampleRouterComponentParam(
    param: Record<'' | string, JsonObject>,
  ): Record<'' | string, JsonObject> {
    const _param: Record<'' | string, JsonObject> = { '': {} }
    for (const key in param) {
      _param[toKebabCase(key)] = param[key]
    }
    return _param
  }

  function mapComponentInfo(setting: ComponentSetting): ComponentInfo {
    return {
      key: setting.key,
      name: setting.name,
      description: setting.description,
      exampleRouterComponentParam: mapExampleRouterComponentParam(
        setting.exampleRouterComponentParam,
      ),
      component: mapComponent(setting.component),
    }
  }

  // 将 ComponentSetting 转换为 ComponentInfo，并存入 compregComponentInfos 对象。
  for (const compregSetting of compregSettings) {
    if (compregComponentInfos[compregSetting.key]) {
      throw new Error(`Compreg 组件 ${compregSetting.key} 重复`)
    }
    compregComponentInfos[compregSetting.key] = mapComponentInfo(compregSetting)
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
 * 获取默认的 ComponentInfo。
 *
 * @returns 默认的 ComponentInfo。
 */
function defaultComponentInfo(): ComponentInfo {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 defaultComponentInfo')
  }
  const info: ComponentInfo = compregComponentInfos[defaultComponentKey]
  if (!info) {
    throw new Error('找不到默认的 ComponentInfo')
  }
  return info
}

/**
 * 根据指定的 key 获取组件信息。
 *
 * @param key 指定的 key。
 */
function componentInfo(key: string): ComponentInfo | null {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 componentInfo')
  }
  return compregComponentInfos[key] || null
}

/**
 * 获取全部 Compreg 组件信息。
 *
 * @returns 全部 Compreg 组件信息与其 key 的映射。
 */
function componentInfos(): Readonly<Record<string, ComponentInfo>> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 componentInfos')
  }
  return compregComponentInfos
}

export default compreg
