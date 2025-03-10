import type { VimApplicationContext } from '@/vim/types.ts'
import type {
  SimplyStore,
  SimplyStoreDefinition,
  StoreHook,
  VimStore,
  VimStoreModule,
} from '@/store/types.ts'
import { createPinia, defineStore } from 'pinia'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

type Module = { default: VimStoreModule }

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'

/**
 * Store 定义。
 */
const storeDefinitions: Record<string, SimplyStoreDefinition<string, unknown & StoreHook>> = {}

/**
 * Store。
 */
const store: VimStore = {
  init,
  vueStoreDefinition,
  vueStore,
}

/**
 * 初始化。
 *
 * @param ctx VIM 应用上下文对象。
 */
async function init(ctx: VimApplicationContext): Promise<void> {
  // 检查状态。
  // noinspection DuplicatedCode
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

  // 定义 Promise 数组。
  const promises: Promise<void>[] = []

  // 遍历所有模块，对其初始化。
  for (const moduleName in modules) {
    // 获取模块。
    const vimStoreModule: VimStoreModule = modules[moduleName].default as VimStoreModule
    // 初始化模块。
    const mayPromise = vimStoreModule.init(ctx)
    // 判断 mayPromise 是否为 Promise，并执行对应操作。
    if (mayPromise instanceof Promise) {
      // 等待 mayPromise 完成后，将 Store 定义存入 storeDefinitions 对象。
      mayPromise.then(() => {
        storeDefinitions[moduleName] = defineStore(moduleName, vimStoreModule.provideStoreSetup())
      })
      // 将 Promise 存入 Promise 数组。
      promises.push(mayPromise)
    } else {
      // 将 Store 定义存入 storeDefinitions 对象。
      storeDefinitions[moduleName] = defineStore(moduleName, vimStoreModule.provideStoreSetup())
    }
  }

  // 等待所有 Promise 完成。
  await Promise.all(promises)

  // Vue 应用使用 Pinia。
  ctx.app.use(createPinia())

  // 设置状态为 initialized。
  status = 'initialized'
}

/**
 * 获取 Vue Store 定义。
 *
 * 调用者需要保证方法的 id 与对应的泛型 SS 匹配，否则会导致错误的 IDE 补全提示。
 *
 * @param id Store ID。
 */
function vueStoreDefinition<Id extends string, SS>(id: Id): SimplyStoreDefinition<Id, SS> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 storeDefinition')
  }
  return storeDefinitions[id] as SimplyStoreDefinition<Id, SS>
}

/**
 * 获取 Vue Store。
 *
 * 调用者需要保证方法的 id 与对应的泛型 SS 匹配，否则会导致错误的 IDE 补全提示。
 *
 * @param id
 */
function vueStore<Id extends string, SS>(id: Id): SimplyStore<Id, SS> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 store')
  }
  return storeDefinitions[id]() as SimplyStore<Id, SS>
}

export default store
