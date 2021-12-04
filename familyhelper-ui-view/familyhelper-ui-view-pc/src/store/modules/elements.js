/* eslint-disable no-param-reassign */
// noinspection JSUnusedGlobalSymbols

import screenfull from 'screenfull';

let escapeEventFlag = false;

const state = {
  menuVisible: true,
  fullScreen: false,
};

const getters = {
  isMenuVisible: (s) => (s.menuVisible),
  isFullScreen: (s) => (s.fullScreen),
};

const mutations = {
  setMenuVisible: (s, val) => {
    s.menuVisible = val;
  },
  setFullScreen: (s, val) => {
    if (s.fullScreen !== val) {
      escapeEventFlag = true;
    }
    s.fullScreen = val;
    if (val) {
      screenfull.request().finally();
    } else {
      screenfull.exit().finally();
    }
  },
};

const actions = {
  setMenuVisible({ commit }, val) {
    commit('setMenuVisible', val);
  },
  setFullScreen({ commit }, val) {
    commit('setFullScreen', val);
  },
};

function handleFullScreenChange(store) {
  if (escapeEventFlag) {
    escapeEventFlag = false;
    return;
  }
  store.commit('elements/setFullScreen', screenfull.isFullscreen);
}

function handleF11Pressed(event, store) {
  if (event.keyCode === 122) {
    // 禁用 f11。
    event.returnValue = false;
    // 使用 screenfull 组件实现全屏。
    store.commit('elements/setFullScreen', !screenfull.isFullscreen);
  }
}

let fullScreenHandler;
let f11KeyHandler;

const postConstructHook = () => {

};

const loadHook = (store) => {
  if (store.getters['elements/isFullScreen']) {
    screenfull.request().finally();
  } else {
    screenfull.exit().finally();
  }
  fullScreenHandler = () => {
    handleFullScreenChange(store);
  };
  f11KeyHandler = (event) => {
    handleF11Pressed(event, store);
  };
  if (screenfull.isEnabled) {
    screenfull.on('change', fullScreenHandler);
  }
  window.addEventListener('keydown', f11KeyHandler, true);
};

const beforeUnloadHook = () => {
  if (screenfull.isEnabled) {
    screenfull.off('change', fullScreenHandler);
  }
  window.removeEventListener('keydown', f11KeyHandler);
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
