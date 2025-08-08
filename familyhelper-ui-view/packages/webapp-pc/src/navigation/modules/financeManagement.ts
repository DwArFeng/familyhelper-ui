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
    key: 'financeManagement',
    index: 10,
    display: {
      label: '资金管理',
    },
    menu: {
      shown: true,
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.accountBook',
    index: 10,
    display: {
      label: '账本管理',
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
      component: () => import('@/views/nodes/financeManagement/accountBook/AccountBook.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management.account_book',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.bankCardTypeIndicator',
    index: 20,
    display: {
      label: '银行卡类型管理',
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
      component: () =>
        import('@/views/nodes/financeManagement/bankCardTypeIndicator/BankCardTypeIndicator.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management.bank_card_type_indicator',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.bankCard',
    index: 30,
    display: {
      label: '银行卡管理',
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
      component: () => import('@/views/nodes/financeManagement/bankCard/BankCard.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management.bank_card',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.balanceRecord',
    index: 40,
    display: {
      label: '余额记录',
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
      component: () => import('@/views/nodes/financeManagement/balanceRecord/BalanceRecord.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management.balance_record',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.fundChangeTypeIndicator',
    index: 50,
    display: {
      label: '资金变更类型管理',
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
      component: () =>
        import(
          '@/views/nodes/financeManagement/fundChangeTypeIndicator/FundChangeTypeIndicator.vue'
        ),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management.fund_change_type_indicator',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.fundChange',
    index: 60,
    display: {
      label: '资金变更记录',
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
      component: () => import('@/views/nodes/financeManagement/fundChange/FundChange.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management.fund_change',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.financeReport',
    index: 70,
    display: {
      label: '资金报告',
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
      component: () => import('@/views/nodes/financeManagement/financeReport/FinanceReport.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management.finance_report',
    },
  },
  {
    parentKey: 'financeManagement',
    key: 'financeManagement.remindDriverSupport',
    index: 80,
    display: {
      label: '提醒驱动器支持',
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
      component: () =>
        import('@/views/nodes/financeManagement/remindDriverSupport/RemindDriverSupport.vue'),
    },
    permission: {
      required: true,
      node: 'ui.pc.menu_visible.finance_management.remind_driver_support',
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
