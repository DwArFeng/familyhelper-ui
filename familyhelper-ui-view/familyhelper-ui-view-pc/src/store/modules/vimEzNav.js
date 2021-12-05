/* eslint-disable no-param-reassign */
// noinspection JSUnusedGlobalSymbols

import Cookies from 'js-cookie';
import vim from '@/vim';

// 存储在 Cookie 中的持久化主键
const PERSISTENCE_DATA_PREFIX = 'store.persistence_data.vim_ez_nav.';

const state = {
  affixItemKeys: [],
  pinnedItemKeys: [],
  activeItemKeys: [],
};

const getters = {
  navItems: (s) => {
    const items = [];
    s.affixItemKeys.forEach((key) => items.push(vim.itemMap[key]));
    s.pinnedItemKeys.forEach((key) => items.push(vim.itemMap[key]));
    s.activeItemKeys.forEach((key) => items.push(vim.itemMap[key]));
    return items;
  },
  pinnedNavItems: (s) => s.pinnedItemKeys.map((key) => vim.itemMap[key]),
  activeNavItems: (s) => s.activeItemKeys.map((key) => vim.itemMap[key]),
  annotation: (s) => (itemKey) => {
    if (s.affixItemKeys.includes(itemKey)) {
      return 'affix';
    }
    if (s.pinnedItemKeys.includes(itemKey)) {
      return 'pinned';
    }
    return 'active';
  },
  persistenceData: (s) => ({
    pinnedItemKeys: s.pinnedItemKeys,
    activeItemKeys: s.activeItemKeys,
  }),
};

const mutations = {
  pushItemKey: (s, itemKey) => {
    if (s.affixItemKeys.includes(itemKey)) {
      return;
    }
    if (s.pinnedItemKeys.includes(itemKey)) {
      return;
    }
    if (s.activeItemKeys.includes(itemKey)) {
      return;
    }
    if (s.pinnedItemKeys.length + s.activeItemKeys.length >= vim.addons.ezNav.maxActiveItem) {
      return;
    }
    s.activeItemKeys.push(itemKey);
  },
  removeItemKey: (s, itemKey) => {
    let index;
    index = s.pinnedItemKeys.indexOf(itemKey);
    if (index >= 0) {
      s.pinnedItemKeys.splice(index, 1);
    }
    index = s.activeItemKeys.indexOf(itemKey);
    if (index >= 0) {
      s.activeItemKeys.splice(index, 1);
    }
  },
  restorePersistenceData: (s, pd) => {
    s.pinnedItemKeys = pd.pinnedItemKeys;
    s.activeItemKeys = pd.activeItemKeys;
  },
  clearActive: (s) => {
    s.activeItemKeys = [];
  },
  clearAll: (s) => {
    s.pinnedItemKeys = [];
    s.activeItemKeys = [];
  },
  pin: (s, itemKey) => {
    if (s.pinnedItemKeys.includes(itemKey)) {
      return;
    }
    const index = s.activeItemKeys.indexOf(itemKey);
    if (index >= 0) {
      s.activeItemKeys.splice(index, 1);
    }
    s.pinnedItemKeys.push(itemKey);
  },
  unpin: (s, itemKey) => {
    const index = s.pinnedItemKeys.indexOf(itemKey);
    if (index >= 0) {
      s.pinnedItemKeys.splice(index, 1);
      s.activeItemKeys.push(itemKey);
    }
  },
  updatePinnedItemKeys: (s, itemKeys) => { s.pinnedItemKeys = itemKeys; },
  updateActiveItemKeys: (s, itemKeys) => { s.activeItemKeys = itemKeys; },
};

const actions = {
  pushItemKey: ({ commit }, itemKey) => {
    commit('pushItemKey', itemKey);
  },
  removeItemKey: ({ commit }, itemKey) => {
    commit('removeItemKey', itemKey);
  },
  // eslint-disable-next-line no-shadow
  savePersistenceData: ({ getters }, accountId) => {
    Cookies.set(`${PERSISTENCE_DATA_PREFIX}${accountId}`, JSON.stringify(getters.persistenceData));
  },
  restorePersistenceDataForLogin: ({ commit }, accountId) => {
    const persistenceDataJson = Cookies.get(`${PERSISTENCE_DATA_PREFIX}${accountId}`);
    if (persistenceDataJson === null || persistenceDataJson === undefined) {
      return;
    }
    const persistenceData = JSON.parse(persistenceDataJson);
    switch (vim.addons.ezNav.restoreWhenLogin) {
      case 'restore-all':
        break;
      default:
        persistenceData.activeItemKeys = [];
        console.log(persistenceData);
        break;
    }
    commit('restorePersistenceData', persistenceData);
  },
  clearActive: ({ commit }) => {
    commit('clearActive');
  },
  clearAll: ({ commit }) => {
    commit('clearAll');
  },
};

const postConstructHook = () => {
  // 如果未启用附加功能，则不用加载。
  if (!vim.addons.ezNav.enabled) {
    return;
  }

  // 遍历所有 itemMap，找到配置 affix 的 item。
  state.affixItemKeys = Object.values(vim.itemMap)
    .filter((item) => item.meta.ezNav.shown && item.meta.ezNav.affix)
    .sort((a, b) => a.meta.ezNav.affixIndex - b.meta.ezNav.affixIndex)
    .map((item) => item.key);
};

const loadHook = (store) => {
  // 恢复导航信息。
  // noinspection JSUnresolvedVariable
  const { accountId } = store.state.lnp;
  const persistenceDataJson = Cookies.get(`${PERSISTENCE_DATA_PREFIX}${accountId}`);
  if (persistenceDataJson !== null && persistenceDataJson !== undefined) {
    const persistenceData = JSON.parse(persistenceDataJson);
    store.commit('vimEzNav/restorePersistenceData', persistenceData);
  }
};

const beforeUnloadHook = (store) => {
  // 存储导航信息。
  // noinspection JSUnresolvedVariable
  const { accountId } = store.state.lnp;
  const persistenceData = store.getters['vimEzNav/persistenceData'];
  Cookies.set(`${PERSISTENCE_DATA_PREFIX}${accountId}`, JSON.stringify(persistenceData));
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