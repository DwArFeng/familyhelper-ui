/*
 * 您不需要在此文件中更改任何代码。
 * 所有的 elements 引用都按照模块分类写在 ./modules 下面。
 * 由该文件负责扫描并加载。
 */
import { defaultNotifyHandler, defaultRenderHandler } from '@/elements/props';

const notifyHandlerMap = {};
const renderHandlerMap = {};

// https://webpack.js.org/guides/dependency-management/#requirecontext
// noinspection JSUnresolvedFunction
const ctx = require.context('./modules', true, /index\.js$/);

// you do not need `import app from './modules/app'`
// it will auto require all view module from modules file
ctx.keys().forEach((modulePath) => {
  const module = ctx(modulePath);
  const { notifyHandler } = module;
  const { renderHandler } = module;
  if (notifyHandler !== undefined && notifyHandler !== null) {
    notifyHandlerMap[notifyHandler.key] = notifyHandler.handler;
  }
  if (renderHandler !== undefined && renderHandler !== null) {
    renderHandlerMap[renderHandler.key] = renderHandler.handler;
  }
});

const notifyHandler = (type) => {
  if (type === undefined || type === null || type === '') {
    return notifyHandlerMap[defaultNotifyHandler];
  }
  return notifyHandlerMap[type];
};

const renderHandler = (type) => {
  if (type === undefined || type === null || type === '') {
    return renderHandlerMap[defaultRenderHandler];
  }
  return renderHandlerMap[type];
};

export { notifyHandler };
export { renderHandler };
