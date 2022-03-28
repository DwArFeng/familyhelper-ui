/* eslint-disable no-param-reassign */
// noinspection JSUnusedGlobalSymbols

import Vue from 'vue';
import vim from '@/vim';
import router from '@/router';

import { notifyHandler } from '@/elements';

import uuid from '@/util/uuid';

import { login, logout, postpone } from '@/api/system/login';
import { currentDate } from '@/api/system/time';
import { lookupForUser } from '@/api/system/permission';
import { currentTimestamp } from '@/util/timestamp';

import resolveResponse from '@/util/response';

const state = {
  accountId: '',
  token: '',
  expireDate: '',
  serviceDateOffset: 0,
  permissions: {},
  permUuid: '',
  onlineFlag: false,
};

const getters = {
  isLogin: (s) => {
    if (!s.onlineFlag) {
      return false;
    }
    if (s.token === '') {
      return false;
    }
    return currentTimestamp() + s.serviceDateOffset - s.expireDate < 0;
  },
  me: (s) => s.accountId,
  token: (s) => s.token,
  hasPermission: (s) => (node) => s.permissions[node] === s.permUuid,
  persistenceData: (s) => ({
    accountId: s.accountId,
    token: s.token,
    expireDate: s.expireDate,
    serviceDateOffset: s.serviceDateOffset,
    permissions: s.permissions,
    permUuid: s.permUuid,
    onlineFlag: s.onlineFlag,
  }),
};

const mutations = {
  setLoginInfo: (s, loginInfo) => {
    // noinspection JSUnresolvedVariable
    s.accountId = loginInfo.account_id;
    s.token = loginInfo.token;
    // noinspection JSUnresolvedVariable
    s.expireDate = loginInfo.expire_date;
  },
  setServiceDateOffset: (s, val) => {
    s.serviceDateOffset = val;
  },
  setPermissions: (s, permissions) => {
    const permUuid = uuid();
    s.permUuid = permUuid;
    permissions.forEach((permission) => {
      Vue.set(s.permissions, permission.key.string_id, permUuid);
    });
  },
  setOnlineFlag: (s, val) => {
    s.onlineFlag = val;
  },
  restorePersistenceData: (s, pd) => {
    s.accountId = pd.accountId;
    s.token = pd.token;
    s.expireDate = pd.expireDate;
    s.serviceDateOffset = pd.serviceDateOffset;
    s.permissions = pd.permissions;
    s.permUuid = pd.permUuid;
    s.onlineFlag = pd.onlineFlag;
  },
};

const actions = {
  // eslint-disable-next-line no-shadow
  login({ state, commit, dispatch }, { accountId, password }) {
    return resolveResponse(login(accountId, password))
      .then((res) => {
        commit('setLoginInfo', res);
      })
      .then(() => {
        commit('setOnlineFlag', true);
        return resolveResponse(currentDate());
      })
      .then((res) => {
        commit('setServiceDateOffset', res - currentTimestamp());
        return resolveResponse(lookupForUser(state.accountId));
      })
      .then((res) => {
        commit('setPermissions', res);
      })
      .then(() => {
        router.push({ path: '/vim' });
        return Promise.resolve();
      })
      .then(() => {
        if (vim.addons.ezNav.enabled) {
          return dispatch('vimEzNav/restorePersistenceData', state.accountId, { root: true });
        }
        return Promise.resolve();
      });
  },
  // eslint-disable-next-line no-shadow
  postpone({ state, commit }) {
    const errorHandlerMap = new Map();
    errorHandlerMap.set(90, () => {
      notifyHandler().notifyErrorMessage('登录状态异常，请重新登录');
      commit('setOnlineFlag', false);
      router.push({ path: '/login' });
    });
    return resolveResponse(postpone(state.token), errorHandlerMap)
      .then((res) => {
        commit('setLoginInfo', res);
        // noinspection JSUnresolvedVariable
        return resolveResponse(currentDate());
      })
      .then((res) => {
        commit('setServiceDateOffset', res - currentTimestamp());
        return Promise.resolve();
      });
  },
  // eslint-disable-next-line no-shadow
  logout({ state, commit, dispatch }) {
    return Promise.resolve()
      .then(() => {
        if (vim.addons.ezNav.enabled) {
          return dispatch('vimEzNav/savePersistenceData', state.accountId, { root: true })
            .then(() => dispatch('vimEzNav/clearAll', null, { root: true }));
        }
        return Promise.resolve();
      })
      .then(() => {
        commit('setOnlineFlag', false);
        return Promise.resolve();
      })
      .then(() => resolveResponse(logout(state.token)))
      .finally(() => {
        router.push({ path: '/login' });
        return Promise.resolve();
      });
  },
};

// 存储在 LocalStorage 中的持久化主键
const PERSISTENCE_DATA_KEY = 'store.persistence_data.lnp';

const postConstructHook = (store) => {
  // 复位登录参数。
  const persistenceDataJson = window.localStorage.getItem(PERSISTENCE_DATA_KEY);
  if (persistenceDataJson !== null && persistenceDataJson !== undefined) {
    const persistenceData = JSON.parse(persistenceDataJson);
    store.commit('lnp/restorePersistenceData', persistenceData);
  }
};

let loginKeeper;

const loadHook = (store) => {
  // 立即执行一次登录状态检查。
  if (!store.getters['lnp/isLogin']) {
    if (router.currentRoute.name !== 'login') {
      notifyHandler().notifyErrorMessage('登录状态异常，请重新登录');
      router.push({ path: '/login' });
    }
  } else {
    store.dispatch('lnp/postpone')
      .catch(() => {
      });
  }

  // 设置登录保持器。
  loginKeeper = setInterval(() => {
    if (!store.getters['lnp/isLogin']) {
      if (router.currentRoute.name !== 'login') {
        notifyHandler().notifyErrorMessage('登录状态异常，请重新登录');
        router.push({ path: '/login' });
      }
    } else {
      store.dispatch('lnp/postpone')
        .catch(() => {
        });
    }
  }, 10000);
};

const beforeUnloadHook = (store) => {
  // 存储登录参数。
  const persistenceData = store.getters['lnp/persistenceData'];
  window.localStorage.setItem(PERSISTENCE_DATA_KEY, JSON.stringify(persistenceData));
  // 清除登录保持器。
  clearInterval(loginKeeper);
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
