import store from '@/store/index';
import vim from '@/vim';

const simpleGuard = (to, from, next) => {
  next();
};

const vimGuard = (to, from, next) => {
  // 判断是否登录，如果没有登录，直接跳转到登录页面。
  if (!store.getters['lnp/isLogin']) {
    next({ path: '/login' });
    return;
  }

  // 检查页面的权限。
  const { permissionRequired } = to.meta;
  const { permissionNode } = to.meta;
  // 如果权限不存在，跳转到权限不存在相应页面。
  if (permissionRequired && !store.getters['lnp/hasPermission'](permissionNode)) {
    next({ path: '/error/forbidden' });
    return;
  }

  // 设置 vuex 的 vim 模块的当前 vim 参数为最新的 vim 参数。
  store.commit('vim/setCurrentKey', to.name);

  // 判断 addon 的 ezNav 是否生效，如生效，对 ezNav 进行相应操作。
  if (vim.addons.ezNav.enabled && to.meta.ezNav) {
    store.commit('vimEzNav/pushLocateInfo', { to, from });
  }

  next();
};

const guards = {
  simple: simpleGuard,
  vim: vimGuard,
};

export default guards;
