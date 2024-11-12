/* eslint-disable no-param-reassign */
// noinspection JSUnusedGlobalSymbols

import {
  childForUserUnread,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/notification';
import resolveResponse from '@/util/response';

const state = {
  unreadCount: 0,
};

const getters = {
  unreadCount: (s) => s.unreadCount,
};

const mutations = {
  updateUnreadCount: (s, val) => {
    s.unreadCount = val;
  },
};

const actions = {
  // eslint-disable-next-line no-shadow
  updateUnreadCount({ rootGetters, commit }) {
    commit('updateUnreadCount', 0);
    const isLogin = rootGetters['lnp/isLogin'];
    if (!isLogin) {
      return;
    }
    const me = rootGetters['lnp/me'];
    resolveResponse(childForUserUnread(me, 0, 0))
      .then((res) => {
        commit('updateUnreadCount', parseInt(res.count, 10));
      });
  },
};

let unreadUpdateTimer;
let meWatcher;

const postConstructHook = () => {

};

const loadHook = (store) => {
  // 设置未阅读提醒更新计时器。
  unreadUpdateTimer = setInterval(() => {
    store.dispatch('notification/updateUnreadCount')
      .catch(() => {
      });
  }, 30000);
  // 注册登录本人改变的侦听器。
  // eslint-disable-next-line no-shadow
  meWatcher = store.watch((state, getter) => getter['lnp/me'], () => {
    store.dispatch('notification/updateUnreadCount');
  });
  store.dispatch('notification/updateUnreadCount')
    .catch(() => {
    });
};

const beforeUnloadHook = () => {
  // 清除未阅读提醒更新计时器。
  clearInterval(unreadUpdateTimer);
  // 清除登录本人改变的侦听器。
  meWatcher();
};

export default {
  module: {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
  },
  postConstructHook,
  loadHook,
  beforeUnloadHook,
};
