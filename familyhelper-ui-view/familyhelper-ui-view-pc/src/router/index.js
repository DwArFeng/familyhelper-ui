import Vue from 'vue';
import VueRouter from 'vue-router';

import { currentTimestamp } from '@/util/timestamp';
import { permissions } from '@/util/permission';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/home',
    meta: {
      permissionRequired: false,
    },
  },
  {
    path: '/home',
    component: () => import('@/views/home/Home.vue'),
    children: [
      {
        path: '',
        component: () => import('@/views/etc/Welcome.vue'),
        meta: {
          permissionRequired: false,
        },
      },
      {
        path: 'finance-management/account-book',
        component: () => import('@/views/financeManagement/accountBook/AccountBook.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.finance_management.account_book',
        },
      },
      {
        path: 'finance-management/bank-card-type-indicator',
        component: () => import('@/views/financeManagement/bankCardTypeIndicator/BankCardTypeIndicator.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.finance_management.bank_card_type_indicator',
        },
      },
      {
        path: 'finance-management/bank-card',
        component: () => import('@/views/financeManagement/bankCard/BankCard.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.finance_management.bank_card',
        },
      },
      {
        path: 'finance-management/balance-record',
        component: () => import('@/views/financeManagement/balanceRecord/BalanceRecord.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.finance_management.balance_record',
        },
      },
      {
        path: 'finance-management/fund-change-type-indicator',
        component: () => import('@/views/financeManagement/fundChangeTypeIndicator/FundChangeTypeIndicator.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.finance_management.fund_change_type_indicator',
        },
      },
      {
        path: 'finance-management/fund-change',
        component: () => import('@/views/financeManagement/fundChange/FundChange.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.finance_management.fund_change',
        },
      },
      {
        path: 'finance-management/finance-report',
        component: () => import('@/views/financeManagement/financeReport/FinanceReport.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.finance_management.finance_report',
        },
      },
      {
        path: 'me-and-clannad/my-profile',
        component: () => import('@/views/meAndClannad/myProfile/MyProfile.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.me_and_clannad.my_profile',
        },
      },
      {
        path: 'me-and-clannad/profile-type-indicator',
        component: () => import('@/views/meAndClannad/profileTypeIndicator/ProfileTypeIndicator.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.me_and_clannad.profile_type_indicator',
        },
      },
      {
        path: 'me-and-clannad/my-album',
        component: () => import('@/views/meAndClannad/myAlbum/MyAlbum.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.me_and_clannad.my_album',
        },
      },
      {
        path: 'me-and-clannad/clannad-profile',
        component: () => import('@/views/meAndClannad/clannadProfile/ClannadProfile.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.me_and_clannad.clannad_profile',
        },
      },
      {
        path: 'me-and-clannad/clannad-album',
        component: () => import('@/views/meAndClannad/clannadAlbum/ClannadAlbum.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.me_and_clannad.clannad_album',
        },
      },
      {
        path: 'me-and-clannad/clannad-call',
        component: () => import('@/views/meAndClannad/clannadCall/ClannadCall.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.me_and_clannad.clannad_call',
        },
      },
      {
        path: 'system-setting/account',
        component: () => import('@/views/systemSettings/account/Account.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.system_settings.account',
        },
      },
      {
        path: 'system-setting/role',
        component: () => import('@/views/systemSettings/role/Role.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.system_settings.role',
        },
      },
      {
        path: 'system-setting/permission-node',
        component: () => import('@/views/systemSettings/permissionNode/PermissionNode.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.system_settings.permission_node',
        },
      },
      {
        path: 'system-setting/permission-group',
        component: () => import('@/views/systemSettings/permissionGroup/PermissionGroup.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.system_settings.permission_group',
        },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/views/etc/Login.vue'),
    meta: {
      permissionRequired: false,
    },
  },
  {
    path: '/error/forbidden',
    component: () => import('@/views/error/PageForbidden.vue'),
    meta: {
      permissionRequired: false,
    },
  },
  {
    name: 'error_internal',
    path: '/error/internal',
    component: () => import('@/views/error/PageInternal.vue'),
    meta: {
      permissionRequired: false,
    },
  },
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});

// 添加用于登录的路由守卫。
router.beforeEach((to, from, next) => {
  // 如果目标路径为登录，则不用进行 token 检测。
  if (to.path === '/login' || to.path.startsWith('/error')) {
    next();
    return;
  }
  // 从 local storage 中读取登录信息。
  // noinspection JSUnresolvedVariable
  const loginInfo = Vue.ls.get('loginInfo');
  // 如果登录信息不存在，直接跳转到登录界面。
  if (loginInfo == null) {
    next({ path: '/login' });
    return;
  }
  // 如果登录信息已经过期，直接跳转到登录界面。
  // noinspection JSUnresolvedVariable
  if (currentTimestamp() > loginInfo.expire_date) {
    next({ path: '/login' });
    return;
  }
  // 检查页面的权限。
  const { permissionRequired } = to.meta;
  const { permissionNode } = to.meta;
  // 如果路由没有配置权限，则跳转到内部错误页面。
  if (permissionRequired === undefined) {
    next({
      name: 'error_internal',
      params: {
        message: '内部页面错误哦\n请在该页面的路由元数据中配置权限标记\'permissionRequired\'',
      },
    });
    return;
  }
  // 如果权限不存在，跳转到权限不存在相应页面。
  if (permissionRequired && !permissions().has(permissionNode)) {
    next({ path: '/error/forbidden' });
    return;
  }
  next();
});

export default router;
