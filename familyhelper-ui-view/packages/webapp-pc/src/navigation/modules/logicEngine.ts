// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * 节点设置数组。
 */
const nodeSettings: NodeSetting[] = [
  {
    parentKey: null,
    key: 'logicEngine',
    index: 137,
    display: {
      '': {
        label: '逻辑引擎',
      },
      comvisual: {
        label: '逻辑引擎',
      },
      elementPlus: {
        label: '逻辑引擎',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.logic_engine',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.logic_engine',
    },
  },
  {
    parentKey: 'logicEngine',
    key: 'logicEngine.section',
    index: 10,
    display: {
      '': {
        label: '部件设置',
      },
      comvisual: {
        label: '部件设置',
      },
      elementPlus: {
        label: '部件设置',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.logic_engine.section',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'logic-engine/section',
      component: {
        key: 'logicEngine.section',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.logic_engine.section',
    },
  },
  {
    parentKey: 'logicEngine',
    key: 'logicEngine.task',
    index: 20,
    display: {
      '': {
        label: '任务',
      },
      comvisual: {
        label: '任务',
      },
      elementPlus: {
        label: '任务',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.logic_engine.task',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'logic-engine/task',
      component: {
        key: 'logicEngine.task',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.logic_engine.task',
    },
  },
  {
    parentKey: 'logicEngine',
    key: 'logicEngine.driverSupport',
    index: 30,
    display: {
      '': {
        label: '驱动器支持',
      },
      comvisual: {
        label: '驱动器支持',
      },
      elementPlus: {
        label: '驱动器支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.logic_engine.driver_support',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'logic-engine/driver-support',
      component: {
        key: 'logicEngine.driverSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.logic_engine.driver_support',
    },
  },
  {
    parentKey: 'logicEngine',
    key: 'logicEngine.performerSupport',
    index: 40,
    display: {
      '': {
        label: '执行器支持',
      },
      comvisual: {
        label: '执行器支持',
      },
      elementPlus: {
        label: '执行器支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.logic_engine.performer_support',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'logic-engine/performer-support',
      component: {
        key: 'logicEngine.performerSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.logic_engine.performer_support',
    },
  },
  {
    parentKey: 'logicEngine',
    key: 'logicEngine.guarderSupport',
    index: 50,
    display: {
      '': {
        label: '守卫器支持',
      },
      comvisual: {
        label: '守卫器支持',
      },
      elementPlus: {
        label: '守卫器支持',
      },
      elementPlusEngineering: {
        messageKey: 'navigation.logic_engine.guarder_support',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'logic-engine/guarder-support',
      component: {
        key: 'logicEngine.guarderSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.logic_engine.guarder_support',
    },
  },
]

/**
 * 提供 NodeSetting。
 */
function provideNodeSettings(): NodeSetting[] {
  return nodeSettings
}

export default vimNavigationModule
