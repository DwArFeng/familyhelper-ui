import Vue from 'vue';

import ElementUI, { Message } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import './global.css';

import vimLayout from './layout/VimLayout.vue';

Vue.use(ElementUI);

/**
 * 定义由 ElementUI 实现的通知处理器。
 */
const notifyHandlerKey = 'elementUI';
const notifyHandlerImpl = {
  notifyResponseBadCode: (code, message) => {
    Message({
      showClose: true,
      dangerouslyUseHTMLString: true,
      message: `
              <div style="text-align: center">服务端通信错误，返回错误代码</div>
              <div style="text-align: left">
              <ul><li>错误代码: ${code}</li><li>错误信息: ${message}</li></ul>
              </div>`,
      type: 'error',
      center: true,
      duration: 2000,
    });
  },
  notifyResponseError: (err) => {
    Message({
      showClose: true,
      dangerouslyUseHTMLString: true,
      message: `<div style="text-align: center">通信错误，异常信息: <br/> ${err == null ? '' : err.message}</div>`,
      type: 'error',
      center: true,
      duration: 2000,
    });
  },
  notifyErrorMessage: (message) => {
    Message({
      showClose: true,
      dangerouslyUseHTMLString: true,
      message: `<div style="text-align: center">${message}</div>`,
      type: 'error',
      center: true,
      duration: 2000,
    });
  },
};

const notifyHandler = {
  key: notifyHandlerKey,
  handler: notifyHandlerImpl,
};

export { notifyHandler };

/**
 * 定义由 ElementUI 实现的 render 处理器。
 */
const renderHandlerKey = 'elementUI';
const renderHandlerImpl = {
  handleRenderIcon: (h, content, customClass) => {
    let elIconClass = content;
    if (elIconClass === null || elIconClass === '') {
      elIconClass = 'el-icon-menu';
    }
    // noinspection JSXNamespaceValidation
    return <i class={[elIconClass, customClass]}/>;
  },
  handleRenderLabel: (h, content, customClass) => <span class={customClass}>{content}</span>,
  handleRenderLayout: (h, customClass) => <vimLayout class={[customClass]}/>,
};

const renderHandler = {
  key: renderHandlerKey,
  handler: renderHandlerImpl,
};

export { renderHandler };
