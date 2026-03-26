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
    key: 'navigationDemo',
    index: 100,
    display: {
      '': {
        label: '导航演示',
      },
      comvisual: {
        label: '导航演示',
      },
    },
    menu: {
      shown: true,
    },
    router: {
      required: false,
    },
    permission: {
      required: false,
    },
  },
  {
    parentKey: 'navigationDemo',
    key: 'navigationDemo.subMenuItem1',
    index: 10,
    display: {
      '': {
        label: '子菜单1',
      },
      comvisual: {
        label: '子菜单1',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      affix: false,
      affixIndex: 0,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'navigation-demo/sub-menu-item-1',
      component: {
        key: 'miscellaneous.text',
        param: {
          '': {
            content: '这是通过 router.component.param 传入的参数 - 子菜单1',
          },
          comvisual: {
            content: '这是通过 router.component.param 传入的参数 - 子菜单1',
          },
        },
      },
    },
    permission: {
      required: false,
    },
  },
  {
    parentKey: 'navigationDemo',
    key: 'navigationDemo.subMenuItem2',
    index: 20,
    display: {
      '': {
        label: '子菜单2',
      },
      comvisual: {
        label: '子菜单2',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      affix: false,
      affixIndex: 0,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'navigation-demo/sub-menu-item-2',
      component: {
        key: 'miscellaneous.text',
        param: {
          '': {
            content: '这是通过 router.component.param 传入的参数 - 子菜单2',
          },
          comvisual: {
            content: '这是通过 router.component.param 传入的参数 - 子菜单2',
          },
        },
      },
    },
    permission: {
      required: false,
    },
  },
  {
    parentKey: 'navigationDemo',
    key: 'navigationDemo.subMenuItem3',
    index: 30,
    display: {
      '': {
        label: '外链展示1',
      },
      comvisual: {
        label: '外链展示1',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      affix: false,
      affixIndex: 0,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'navigation-demo/sub-menu-item-3',
      component: {
        key: 'miscellaneous.externalLink',
        param: {
          '': {
            src: 'http://www.example.com',
          },
          comvisual: {
            src: 'http://www.example.com',
          },
        },
      },
    },
    permission: {
      required: false,
    },
  },
  {
    parentKey: 'navigationDemo',
    key: 'navigationDemo.subMenuItem4',
    index: 40,
    display: {
      '': {
        label: '外链展示2',
      },
      comvisual: {
        label: '外链展示2',
      },
    },
    menu: {
      shown: true,
    },
    ezNav: {
      shown: true,
      affix: false,
      affixIndex: 0,
      closedBehavior: {
        type: 'back',
        data: {},
      },
    },
    router: {
      required: true,
      path: 'navigation-demo/sub-menu-item-4',
      component: {
        key: 'miscellaneous.externalLink',
        param: {
          '': {
            src: 'http://info.cern.ch/',
          },
          comvisual: {
            src: 'http://info.cern.ch/',
          },
        },
      },
    },
    permission: {
      required: false,
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
