/*
 * 您不需要更改此文件的任何代码。
 * 该文件将会自动读取所有子模块的 index.js 将其自动加载。
 * 您只需要更改 ./props.js 中的设置即可。
 */

// eslint-disable-next-line import/named
import Vue from 'vue';
import {
  defaultItemKey, ezNavEnabled, ezNavMaxActiveItem, ezNavRestoreWhenLogin,
} from './props';

// 定义 itemMap 的解析函数。
function parseItem(items) {
  const rootItemKeys = [];
  const itemMap = {};

  // 第一遍循环，首先初始化 itemMap 需要的字段，然后将 items 中的所有 item 推到 itemMap 中。
  items.forEach((item) => {
    const dejaVu = item;
    dejaVu.node.childKeys = [];
    itemMap[dejaVu.key] = dejaVu;
  });

  // 第二遍循环，整理所有 item 的 childKeys 节点。
  items.forEach((item) => {
    const { key } = item;
    const { parentKey } = item.node;
    if (parentKey === null || parentKey === undefined || parentKey === '') {
      rootItemKeys.push(item.key);
    } else {
      const parentItem = itemMap[parentKey];
      const { childKeys } = parentItem.node;
      childKeys.push(key);
    }
  });

  // 第三遍循环，排序所有 item 的 childKeys 节点。
  items.forEach((item) => {
    const { childKeys } = item.node;
    childKeys.sort((a, b) => itemMap[a].index - itemMap[b].index);
  });

  // 对 rootItemKeys 进行排序。
  rootItemKeys.sort((a, b) => itemMap[a].index - itemMap[b].index);

  return { rootItemKeys, itemMap };
}

const items = [];

// https://webpack.js.org/guides/dependency-management/#requirecontext
// noinspection JSUnresolvedFunction
const ctx = require.context('./items', true, /\.js$/);

// you do not need `import app from './items/app'`
// it will auto require all items module from items file
ctx.keys().forEach((subItemsPath) => {
  const subItems = ctx(subItemsPath).default;
  items.push(...subItems);
});

const { rootItemKeys, itemMap } = parseItem(items);

const addons = {};

/**
 * EzNav 模块的配置。
 */
const addonsEzNav = {
  enabled: ezNavEnabled,
  maxActiveItem: ezNavMaxActiveItem,
  restoreWhenLogin: ezNavRestoreWhenLogin,
};
addons.ezNav = addonsEzNav;

/**
 * Vim 对象。
 */
const vim = {
  rootItemKeys,
  itemMap,
  defaultItemKey,
  addons,
};

// noinspection JSUnusedGlobalSymbols
Vue.prototype.$vim = vim;

export default vim;
