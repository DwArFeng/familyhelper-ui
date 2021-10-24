const errorCodeMessageMap = new Map();
errorCodeMessageMap.set(1010, '用户不存在或密码不正确');
errorCodeMessageMap.set(1020, '用户不存在或密码不正确');

const defaultErrorHandler = (vue, code, message) => {
  vue.$message({
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
};

/**
 * 解析通过 http.js 调用后获得的数据，并妥善处理错误。
 * @param vue 调用该方法的页面。
 * @param response 通过 http.js 调用后获得的响应。
 * @param errorHandlerMap 异常处理器映射。
 */
export default function resolveResponse(vue, response, errorHandlerMap) {
  return response.then(
    (res) => {
      if (res.meta.code !== 0) {
        if (errorHandlerMap !== undefined && errorHandlerMap.has(res.meta.code)) {
          const errorHandler = errorHandlerMap.get(res.meta.code);
          errorHandler(vue, res.meta.code, res.meta.message);
        } else {
          defaultErrorHandler(vue, res.meta.code, res.meta.message);
        }
        return Promise.reject();
      }
      return Promise.resolve(res.data);
    },
    (err) => {
      vue.$message({
        showClose: true,
        dangerouslyUseHTMLString: true,
        message: `<div style="text-align: center">通信错误，异常信息: <br/> ${err == null ? '' : err.message}</div>`,
        type: 'error',
        center: true,
        duration: 2000,
      });
      return Promise.reject();
    },
  );
}
