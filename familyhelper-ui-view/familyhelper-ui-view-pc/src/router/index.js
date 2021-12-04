/**
 * 您不需要更改此文件的任何代码。
 * 该文件将会生成项目所需的路由，包括一个基础路由表，一个由 vim 配置文件生成的 vim路由表，
 * 和一个 404 页面的重定向。
 */

import Vue from 'vue';
import VueRouter from 'vue-router';

import vim from '@/vim/index';

import guards from './guards';

Vue.use(VueRouter);

/**
 * a base route collection that contains login, error handling, etc.
 */
const baseRoutes = [
  {
    name: '',
    path: '/',
    redirect: '/vim',
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      guard: 'simple',
    },
  },
  {
    name: 'error.forbidden',
    path: '/error/forbidden',
    component: () => import('@/views/error/forbidden/Forbidden.vue'),
    meta: {
      guard: 'simple',
    },
  },
  {
    name: 'error.internal',
    path: '/error/internal',
    component: () => import('@/views/error/internal/Internal.vue'),
    meta: {
      guard: 'simple',
    },
  },
];

/**
 * A vim route collection that will be auto-make form vim`s configuration.
 */
const vimRoute = {
  name: 'vim',
  path: '/vim',
  component: () => import('@/views/vim/VimEntry.vue'),
  redirect: null,
  children: [],
};

function resolveVimRedirect() {
  const defaultItemKey = vim.itemMap[vim.defaultItemKey];
  return {
    name: defaultItemKey.key,
  };
}

// 递归遍历 itemMap 的函数。
function traverseResolveVimItemMap(parentKey) {
  const parentItem = vim.itemMap[parentKey];
  if (parentItem.meta.router.required) {
    const vimChildrenRoute = {
      name: parentItem.key,
      path: parentItem.meta.router.path,
      component: parentItem.meta.router.component,
      meta: {
        guard: 'vim',
        permissionRequired: parentItem.meta.permission.required,
      },
    };
    if (parentItem.meta.permission.required) {
      vimChildrenRoute.meta.permissionNode = parentItem.meta.permission.node;
    }

    // 处理 EzNav 的逻辑。
    if (vim.addons.ezNav.enabled) {
      vimChildrenRoute.meta.ezNav = parentItem.meta.ezNav.shown;
    }

    vimRoute.children.push(vimChildrenRoute);
  }
  if (parentItem.node.childKeys.length === 0) {
    return;
  }
  parentItem.node.childKeys.forEach((childrenItemKey) => {
    traverseResolveVimItemMap(childrenItemKey);
  });
}

// 定义 vim 路由的重定向指向。
vimRoute.redirect = resolveVimRedirect();
// 构建 vim 路由的子路由。
vim.rootItemKeys.forEach((childKey) => {
  traverseResolveVimItemMap(childKey);
});

// 定义路由表。
const routes = [];

// 路由表添加基础路由表。
routes.push(...baseRoutes);
routes.push(vimRoute);

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
});

export { routes };

// 添加用于登录的路由守卫。
router.beforeEach((to, from, next) => {
  // 检查路由元数据的 guard 字段。
  const guardName = to.meta.guard;
  // 如果路由没有配置权限，则跳转到内部错误页面。
  if (guardName === undefined) {
    next({
      name: 'error.internal',
      params: {
        message: '内部页面错误哦\n请在该页面的路由元数据中配置守卫类型 \'guard\'',
      },
    });
    return;
  }

  // 从 guards 中取出对应的 guard。
  const guard = guards[guardName];
  // 如果 guard 不存在，则跳转到内部页面。
  if (guard === undefined) {
    next({
      name: 'error_internal',
      params: {
        message: 'guard 不存在',
      },
    });
    return;
  }

  // 执行代理守卫。
  guard(to, from, next);
});

export default router;
