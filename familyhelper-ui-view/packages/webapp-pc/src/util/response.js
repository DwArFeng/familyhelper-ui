import { notifyHandler } from '@/elements';

const errorCodeMessageMap = new Map();
errorCodeMessageMap.set(1010, '用户不存在或密码不正确');
errorCodeMessageMap.set(1020, '用户不存在或密码不正确');

const globalDefaultBadCodeHandle = (code, message) => {
  notifyHandler().notifyResponseBadCode(code, message);
};

const globalDefaultErrorHandle = (err) => {
  notifyHandler().notifyResponseError(err);
};

/**
 * 解析通过 http.js 调用后获得的数据，并妥善处理错误。
 * @param response 通过 http.js 调用后获得的响应。
 * @param badCodeHandleMap 不正常返回代码代码处理器映射。
 * @param defaultBadCodeHandle 默认不正常返回代码处理器。
 * @param errorHandle http 错误处理器。
 */
export default function resolveResponse(
  response, badCodeHandleMap, defaultBadCodeHandle, errorHandle,
) {
  return response.then(
    (res) => {
      if (res.meta.code !== 0) {
        let anchorBadCodeHandle;
        if (badCodeHandleMap !== undefined && badCodeHandleMap.has(res.meta.code)) {
          anchorBadCodeHandle = badCodeHandleMap.get(res.meta.code);
        } else if (defaultBadCodeHandle !== undefined) {
          anchorBadCodeHandle = defaultBadCodeHandle;
        } else {
          anchorBadCodeHandle = globalDefaultBadCodeHandle;
        }
        anchorBadCodeHandle(res.meta.code, res.meta.message);
        return Promise.reject();
      }
      return Promise.resolve(res.data);
    },
    (err) => {
      let anchorErrorHandle;
      if (errorHandle !== undefined) {
        anchorErrorHandle = errorHandle;
      } else {
        anchorErrorHandle = globalDefaultErrorHandle;
      }
      anchorErrorHandle(err);
      return Promise.reject();
    },
  );
}
