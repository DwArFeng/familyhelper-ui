// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type NavigationNodeSetting, type VimNavigationModule } from '@/navigation/types.ts'

/**
 * VIM Navigation 模块。
 */
const vimNavigationModule: VimNavigationModule = {
  init,
  provideNavigationNodeSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * Navigation 节点数组。
 */
const navigationNodes: NavigationNodeSetting[] = [
  {
    parentKey: null,
    key: 'life',
    index: 120,
    display: {
      label: '日常生活',
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.life',
    },
  },
  {
    parentKey: 'life',
    key: 'life.pbSet',
    index: 0,
    display: {
      label: '个人最佳集合',
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
      path: 'life/pb-set',
      component: () => import('@/views/nodes/life/pbSet/PbSet.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.life.pb_set',
    },
  },
  {
    parentKey: 'life',
    key: 'life.pbManagement',
    index: 10,
    display: {
      label: '个人最佳管理',
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
      path: 'life/pb-management',
      component: () => import('@/views/nodes/life/pbManagement/PbManagement.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.life.pb_management',
    },
  },
]

/**
 * 提供 NavigationNodeSetting。
 */
function provideNavigationNodeSettings(): NavigationNodeSetting[] {
  return navigationNodes
}

export default vimNavigationModule
