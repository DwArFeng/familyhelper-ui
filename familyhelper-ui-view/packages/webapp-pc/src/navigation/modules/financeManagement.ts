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
    key: 'financeManagement',
    index: 10,
    display: {
      '': {
        label: '资金管理',
      },
      elementPlus: {
        label: '资金管理',
      },
      simple: {
        label: '资金管理',
      },
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.accountBook',
    index: 10,
    display: {
      '': {
        label: '账本管理',
      },
      elementPlus: {
        label: '账本管理',
      },
      simple: {
        label: '账本管理',
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
      path: 'finance-management/account-book',
      component: {
        key: 'financeManagement.accountBook',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management.account_book',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.bankCardTypeIndicator',
    index: 20,
    display: {
      '': {
        label: '银行卡类型管理',
      },
      elementPlus: {
        label: '银行卡类型管理',
      },
      simple: {
        label: '银行卡类型管理',
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
      path: 'finance-management/bank-card-type-indicator',
      component: {
        key: 'financeManagement.bankCardTypeIndicator',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management.bank_card_type_indicator',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.bankCard',
    index: 30,
    display: {
      '': {
        label: '银行卡管理',
      },
      elementPlus: {
        label: '银行卡管理',
      },
      simple: {
        label: '银行卡管理',
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
      path: 'finance-management/bank-card',
      component: {
        key: 'financeManagement.bankCard',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management.bank_card',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.balanceRecord',
    index: 40,
    display: {
      '': {
        label: '余额记录',
      },
      elementPlus: {
        label: '余额记录',
      },
      simple: {
        label: '余额记录',
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
      path: 'finance-management/balance-record',
      component: {
        key: 'financeManagement.balanceRecord',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management.balance_record',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.fundChangeTypeIndicator',
    index: 50,
    display: {
      '': {
        label: '资金变更类型管理',
      },
      elementPlus: {
        label: '资金变更类型管理',
      },
      simple: {
        label: '资金变更类型管理',
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
      path: 'finance-management/fund-change-type-indicator',
      component: {
        key: 'financeManagement.fundChangeTypeIndicator',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management.fund_change_type_indicator',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.fundChange',
    index: 60,
    display: {
      '': {
        label: '资金变更记录',
      },
      elementPlus: {
        label: '资金变更记录',
      },
      simple: {
        label: '资金变更记录',
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
      path: 'finance-management/fund-change',
      component: {
        key: 'financeManagement.fundChange',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management.fund_change',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.financeReport',
    index: 70,
    display: {
      '': {
        label: '资金报告',
      },
      elementPlus: {
        label: '资金报告',
      },
      simple: {
        label: '资金报告',
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
      path: 'finance-management/finance-report',
      component: {
        key: 'financeManagement.financeReport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management.finance_report',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.remindDriverSupport',
    index: 80,
    display: {
      '': {
        label: '提醒驱动器支持',
      },
      elementPlus: {
        label: '提醒驱动器支持',
      },
      simple: {
        label: '提醒驱动器支持',
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
      path: 'finance-management/remind-driver-support',
      component: {
        key: 'financeManagement.remindDriverSupport',
      },
    },
    permission: {
      required: true,
      node: 'ui.pc;ui.pc.menu_visible.finance_management.remind_driver_support',
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
