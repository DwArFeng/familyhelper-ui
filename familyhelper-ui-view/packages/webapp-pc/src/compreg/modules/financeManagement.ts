// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type ComponentSetting, type VimCompregModule } from '@/compreg/types.ts'

/**
 * VIM Compreg 模块。
 */
const vimCompregModule: VimCompregModule = {
  init,
  provideComponentSettings: provideCompregSettings,
}

/**
 * 初始化。
 */
function init(): void {}

/**
 * Compreg 设置数组。
 */
const compregSettings: ComponentSetting[] = [
  {
    key: 'financeManagement.accountBook',
    component: {
      '': () => import('@/views/nodes/elementPlus/financeManagement/accountBook/AccountBook.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/financeManagement/accountBook/AccountBook.vue'),
      simple: () =>
        import('@/views/nodes/elementPlus/financeManagement/accountBook/AccountBook.vue'),
    },
  },
  {
    key: 'financeManagement.bankCardTypeIndicator',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/financeManagement/bankCardTypeIndicator/BankCardTypeIndicator.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/financeManagement/bankCardTypeIndicator/BankCardTypeIndicator.vue'),
      simple: () =>
        import('@/views/nodes/elementPlus/financeManagement/bankCardTypeIndicator/BankCardTypeIndicator.vue'),
    },
  },
  {
    key: 'financeManagement.bankCard',
    component: {
      '': () => import('@/views/nodes/elementPlus/financeManagement/bankCard/BankCard.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/financeManagement/bankCard/BankCard.vue'),
      simple: () => import('@/views/nodes/elementPlus/financeManagement/bankCard/BankCard.vue'),
    },
  },
  {
    key: 'financeManagement.balanceRecord',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/financeManagement/balanceRecord/BalanceRecord.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/financeManagement/balanceRecord/BalanceRecord.vue'),
      simple: () =>
        import('@/views/nodes/elementPlus/financeManagement/balanceRecord/BalanceRecord.vue'),
    },
  },
  {
    key: 'financeManagement.fundChangeTypeIndicator',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/financeManagement/fundChangeTypeIndicator/FundChangeTypeIndicator.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/financeManagement/fundChangeTypeIndicator/FundChangeTypeIndicator.vue'),
      simple: () =>
        import('@/views/nodes/elementPlus/financeManagement/fundChangeTypeIndicator/FundChangeTypeIndicator.vue'),
    },
  },
  {
    key: 'financeManagement.fundChange',
    component: {
      '': () => import('@/views/nodes/elementPlus/financeManagement/fundChange/FundChange.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/financeManagement/fundChange/FundChange.vue'),
      simple: () => import('@/views/nodes/elementPlus/financeManagement/fundChange/FundChange.vue'),
    },
  },
  {
    key: 'financeManagement.financeReport',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/financeManagement/financeReport/FinanceReport.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/financeManagement/financeReport/FinanceReport.vue'),
      simple: () =>
        import('@/views/nodes/elementPlus/financeManagement/financeReport/FinanceReport.vue'),
    },
  },
  {
    key: 'financeManagement.remindDriverSupport',
    component: {
      '': () =>
        import('@/views/nodes/elementPlus/financeManagement/remindDriverSupport/RemindDriverSupport.vue'),
      elementPlus: () =>
        import('@/views/nodes/elementPlus/financeManagement/remindDriverSupport/RemindDriverSupport.vue'),
      simple: () =>
        import('@/views/nodes/elementPlus/financeManagement/remindDriverSupport/RemindDriverSupport.vue'),
    },
  },
]

/**
 * 提供 ComponentSetting。
 */
function provideCompregSettings(): ComponentSetting[] {
  return compregSettings
}

export default vimCompregModule
