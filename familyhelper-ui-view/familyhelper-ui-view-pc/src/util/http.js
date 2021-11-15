import axios from 'axios';
import Vue from 'vue';

// 根据不同环境设置 baseURL。
const API_PREFIX = '/api';
const VERSION_PREFIX = '/v1';
let urlPrefix;
if (process.env.NODE_ENV === 'development') {
  urlPrefix = 'http://localhost:8080/familyhelper_webapi_node_war_exploded/';
} else if (process.env.NODE_ENV === 'debug') {
  urlPrefix = 'https://www.debug.com';
} else if (process.env.NODE_ENV === 'production') {
  urlPrefix = '/familyhelper-webapi';
}
axios.defaults.baseURL = urlPrefix + API_PREFIX + VERSION_PREFIX;

// 请求超时设置。
axios.defaults.timeout = 600000;

// post请求头
axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8';

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
    // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
    // noinspection JSUnresolvedVariable
    const loginInfo = Vue.ls.get('loginInfo');
    if (!(!loginInfo && loginInfo !== 0 && loginInfo !== '')) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authentication = loginInfo.token;
    }
    return config;
  },
  (error) => Promise.error(error),
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return Promise.resolve(response);
    }
    return Promise.reject(new Error(`${response.status}`));
  },
  (err) => Promise.reject(err),
);

export function get(module, url, params) {
  return new Promise((resolve, reject) => {
    axios.get(`/${module}/${url}`, params)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getBlob(module, url, params) {
  return new Promise((resolve, reject) => {
    axios.get(`/${module}/${url}`, {
      params,
      responseType: 'blob',
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function post(module, url, params) {
  return new Promise((resolve, reject) => {
    axios.post(`/${module}/${url}`, params)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function postFormData(module, url, params) {
  return new Promise((resolve, reject) => {
    axios.post(`/${module}/${url}`, params, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function del(module, url, params) {
  return new Promise((resolve, reject) => {
    axios.delete(`/${module}/${url}`, {
      params,
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function patch(module, url, params) {
  return new Promise((resolve, reject) => {
    axios.patch(`/${module}/${url}`, params)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
