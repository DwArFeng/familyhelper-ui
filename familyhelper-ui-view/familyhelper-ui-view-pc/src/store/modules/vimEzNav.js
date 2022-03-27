/* eslint-disable no-param-reassign */
// noinspection JSUnusedGlobalSymbols

import vim from '@/vim';

import { operateInspect, operatePut } from '@/api/settingrepo/settingNode';
import { currentTimestamp, formatTimestamp } from '@/util/timestamp';

import resolveResponse from '@/util/response';

// 存储在设置仓库中的设置类型ID。
const SETTINGREPO_CATEGORY_ID = 'framework.pc.eznav';

const state = {
  affixItemKeys: [],
  pinnedItemKeys: [],
  activeItemKeys: [],
  itemMetaMap: {},
  loading: false,
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
    itemMetaMap: s.itemMetaMap,
  }),
  itemMeta: (s) => (itemKey) => {
    const metaMayExists = s.itemMetaMap[itemKey];
    if (metaMayExists === undefined || metaMayExists === null) {
      return { query: {}, params: {} };
    }
    return metaMayExists;
  },
  loading: (s) => s.loading,
};
const mutations = {
  pushItemKey: (s, itemKey) => {
    // itemMetaMap 进行添加或更新空对象。
    s.itemMetaMap[itemKey] = { params: {}, query: {} };

    // 获取 params, query 参数，并对 itemMetaMap 进行添加或更新。
    // noinspection DuplicatedCode
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
  pushLocation: (s, location) => {
    // 获取 location 的名称，作为接下来一系列操作的主键使用。
    const itemKey = location.name;

    // 获取 params, query 参数，并对 itemMetaMap 进行添加或更新。
    const { params, query } = location;
    s.itemMetaMap[itemKey] = { params, query };

    // 如果 affix, pinned, active 三处数组都没有 itemKey 的话， 把 itemKey 添加到 active 数组里。
    // noinspection DuplicatedCode
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
    s.itemMetaMap = pd.itemMetaMap;
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
  updatePinnedItemKeys: (s, itemKeys) => {
    s.pinnedItemKeys = itemKeys;
  },
  updateActiveItemKeys: (s, itemKeys) => {
    s.activeItemKeys = itemKeys;
  },
  setLoading: (s, value) => { s.loading = value; },
};

const actions = {
  pushItemKey: ({ commit }, itemKey) => {
    commit('pushItemKey', itemKey);
  },
  pushLocation: ({ commit }, location) => {
    commit('pushLocation', location);
  },
  removeItemKey: ({ commit }, itemKey) => {
    commit('removeItemKey', itemKey);
  },
  // eslint-disable-next-line no-shadow
  savePersistenceData: ({ getters }, accountId) => {
    const { persistenceData } = getters;
    switch (vim.addons.ezNav.restoreWhenLogin) {
      case 'restore-all':
        break;
      default:
        persistenceData.activeItemKeys = [];
        break;
    }
    return resolveResponse(operatePut(
      SETTINGREPO_CATEGORY_ID,
      [accountId],
      JSON.stringify(persistenceData),
      formatTimestamp(currentTimestamp()),
    ));
  },
  restorePersistenceData: ({ commit }, accountId) => {
    // 置位加载标志。
    commit('setLoading', true);
    return resolveResponse(operateInspect(
      SETTINGREPO_CATEGORY_ID,
      [accountId],
    ))
      .then((res) => {
        if (res === null) {
          return Promise.resolve();
        }
        const persistenceData = JSON.parse(res.value);
        switch (vim.addons.ezNav.restoreWhenLogin) {
          case 'restore-all':
            break;
          default:
            persistenceData.activeItemKeys = [];
            break;
        }
        commit('restorePersistenceData', persistenceData);
        return Promise.resolve();
      })
      .finally(() => {
        // 复位加载标志。
        commit('setLoading', false);
      });
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
  // 置位加载标志。
  store.commit('vimEzNav/setLoading', true);
  // 恢复导航信息。
  // noinspection JSUnresolvedVariable
  const { accountId } = store.state.lnp;
  resolveResponse(operateInspect(
    SETTINGREPO_CATEGORY_ID,
    [accountId],
  ))
    .then((res) => {
      if (res === null) {
        return Promise.resolve();
      }
      const persistenceData = JSON.parse(res.value);
      store.commit('vimEzNav/restorePersistenceData', persistenceData);
      return Promise.resolve();
    })
    .catch(() => {
    })
    .finally(() => {
      // 复位加载标志。
      store.commit('vimEzNav/setLoading', false);
    });
};

const beforeUnloadHook = (store) => {
  // 存储导航信息。
  // noinspection JSUnresolvedVariable
  const { accountId } = store.state.lnp;
  const persistenceData = store.getters['vimEzNav/persistenceData'];
  resolveResponse(operatePut(
    SETTINGREPO_CATEGORY_ID,
    [accountId],
    JSON.stringify(persistenceData),
    formatTimestamp(currentTimestamp()),
  ))
    .catch(() => {
    });
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
