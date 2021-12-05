const financeManagement = [
  {
    key: 'financeManagement',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '资金管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: false,
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.finance_management',
      },
    },
    node: {
      parentKey: null,
    },
  },
  {
    key: 'financeManagement.accountBook',
    index: 0,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '账本管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/finance-management/account-book',
        component: () => import('@/views/items/financeManagement/accountBook/AccountBook.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.finance_management.account_book',
      },
    },
    node: {
      parentKey: 'financeManagement',
    },
  },
  {
    key: 'financeManagement.bankCardTypeIndicator',
    index: 10,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '银行卡类型管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/finance-management/bank-card-type-indicator',
        component: () => import('@/views/items/financeManagement/bankCardTypeIndicator/BankCardTypeIndicator.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.finance_management.bank_card_type_indicator',
      },
    },
    node: {
      parentKey: 'financeManagement',
    },
  },
  {
    key: 'financeManagement.bankCard',
    index: 20,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '银行卡管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/finance-management/bank-card',
        component: () => import('@/views/items/financeManagement/bankCard/BankCard.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.finance_management.bank_card',
      },
    },
    node: {
      parentKey: 'financeManagement',
    },
  },
  {
    key: 'financeManagement.balanceRecord',
    index: 30,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '余额记录',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/finance-management/balance-record',
        component: () => import('@/views/items/financeManagement/balanceRecord/BalanceRecord.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.finance_management.balance_record',
      },
    },
    node: {
      parentKey: 'financeManagement',
    },
  },
  {
    key: 'financeManagement.fundChangeTypeIndicator',
    index: 40,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '资金变更类型管理',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/finance-management/fund-change-type-indicator',
        component: () => import('@/views/items/financeManagement/fundChangeTypeIndicator/FundChangeTypeIndicator.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.finance_management.fund_change_type_indicator',
      },
    },
    node: {
      parentKey: 'financeManagement',
    },
  },
  {
    key: 'financeManagement.fundChange',
    index: 50,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '资金变更记录',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/finance-management/fund-change',
        component: () => import('@/views/items/financeManagement/fundChange/FundChange.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.finance_management.fund_change',
      },
    },
    node: {
      parentKey: 'financeManagement',
    },
  },
  {
    key: 'financeManagement.financeReport',
    index: 60,
    meta: {
      display: {
        iconType: 'elementUI',
        iconContent: '',
        labelType: 'elementUI',
        labelContent: '资金报告',
      },
      menu: {
        shown: true,
      },
      ezNav: {
        shown: true,
      },
      router: {
        required: true,
        path: 'app/finance-management/finance-report',
        component: () => import('@/views/items/financeManagement/financeReport/FinanceReport.vue'),
      },
      permission: {
        required: true,
        node: 'ui.pc.menu_visible.finance_management.finance_report',
      },
    },
    node: {
      parentKey: 'financeManagement',
    },
  },
];

export default financeManagement;
