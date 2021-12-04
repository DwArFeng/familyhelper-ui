import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// https://webpack.js.org/guides/dependency-management/#requirecontext
// noinspection JSUnresolvedFunction
const ctx = require.context('./modules', true, /\.js$/);

// you do not need `import app from './modules/app'`
// it will auto require all vuex module and reload hooks from modules file
const modules = {};
const postConstructHooks = [];
const loadHooks = [];
const beforeUnloadHooks = [];
ctx.keys().forEach((modulePath) => {
  const { module } = ctx(modulePath).default;
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1');
  modules[moduleName] = module;
  const { postConstructHook } = ctx(modulePath).default;
  postConstructHooks.push(postConstructHook);
  const { loadHook } = ctx(modulePath).default;
  loadHooks.push(loadHook);
  const { beforeUnloadHook } = ctx(modulePath).default;
  beforeUnloadHooks.push(beforeUnloadHook);
});

const store = new Vuex.Store({
  modules,
});

export default store;

// 执行每一个模块的构造后钩子。
postConstructHooks.forEach((hook) => {
  hook(store);
});

// 注册每个模块的加载钩子。
loadHooks.forEach((hook) => {
  window.addEventListener('load', () => hook(store));
});

// 注册每个模块的卸载前钩子。
beforeUnloadHooks.forEach((hook) => {
  window.addEventListener('beforeunload', () => hook(store));
});
