/* eslint-disable no-param-reassign */
// noinspection JSUnusedGlobalSymbols

import vim from '@/vim';

const state = {
  currentKey: '',
};

const getters = {
  isCurrent: (s) => (itemKey) => s.currentKey === itemKey,
  currentKey: (s) => (s.currentKey),
  item: () => (itemKey) => vim.itemMap[itemKey],
  currentItem: (s, g) => g.item(s.currentKey),
  parentItem: () => (itemKey) => {
    if (itemKey === null || itemKey === '') {
      return null;
    }
    const { itemMap } = vim;
    const { parentKey } = itemMap[itemKey].node;
    if (parentKey === null || parentKey === '') {
      return null;
    }
    return itemMap[parentKey];
  },
  childItems: () => (itemKey) => {
    const { rootItemKeys, itemMap } = vim;
    const result = [];
    if (itemKey === null || itemKey === '') {
      rootItemKeys.forEach((ik) => { result.push(itemMap[ik]); });
    } else {
      itemMap[itemKey].node.childKeys.forEach((ik) => { result.push(itemMap[ik]); });
    }
    return result;
  },
};

const mutations = {
  setCurrentKey: (s, val) => {
    s.currentKey = val;
  },
};

const actions = {
  setCurrentKey({ commit }, val) {
    commit('setCurrentKey', val);
  },
};

const postConstructHook = () => {

};

const loadHook = () => {

};

const beforeUnloadHook = () => {

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
