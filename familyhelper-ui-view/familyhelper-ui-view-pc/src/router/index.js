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
      // 资金管理。
      {
        path: 'finance-management/account-book',
        component: () => import('@/views/financeManagement/accountBook/AccountBook.vue'),
        meta: {
          permissionRequired: true,
          permissionNode: 'ui.pc.menu_visible.system_settings.permission_node',
        },
      },
      // 系统设置。
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
