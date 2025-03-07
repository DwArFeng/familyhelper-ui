// 导入依赖模块。
const path = require('node:path')

/**
 * 解析路径。
 *
 * 该函数用于解析给定的相对路径（相对于模块的根目录），并返回绝对路径。
 *
 * @param {string} relativePath 给定的相对路径（相对于项目的根目录）。
 * @returns {string} 解析后获得的绝对路径。
 */
const parsePath = function (relativePath) {
  return path.join(__dirname, '../../', relativePath)
}

// 导出模块。
module.exports = { parsePath }
