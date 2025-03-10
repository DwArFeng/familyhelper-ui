// 引入 vim 模块，将项目的初始化操作托管至 vim 模块中。
import vim from '@/vim'

// 部分低版本浏览器不支持 await API，使用 await xxx 会造成打包失败。
// 故使用 Promise API。
Promise.resolve()
  .then(() => {
    // 初始化 vim 模块。
    return vim.init()
  })
  .then(() => {
    // 将 vue 实例挂载到 #app 元素上。
    vim.ctx().app.mount('#app')
  })
