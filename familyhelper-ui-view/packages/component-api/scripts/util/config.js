// noinspection DuplicatedCode

// 导入依赖模块。
const fs = require('node:fs')
const PathUtil = require('./path')

/**
 * 生成配置文件。
 *
 * @template T
 * @param {T} config 配置文件中的内容。
 * @param {string} path 配置文件的路径。
 */
let generateConfigFile = function (config, path) {
  // 如果 path 对应的文件已经存在了，则拷贝到 path.old 中。
  if (fs.existsSync(PathUtil.parsePath(path))) {
    fs.copyFileSync(PathUtil.parsePath(path), PathUtil.parsePath(path + '.old'))
  }
  // 将配置文件的内容写入配置文件。
  fs.writeFileSync(PathUtil.parsePath(path), JSON.stringify(config, null, 2))
}

/**
 * 解析配置。
 *
 * <p>
 * 该函数用于解析给定的配置文件，并与默认配置进行合并。<br>
 * 如果给定的配置文件不存在，则直接返回默认配置。
 *
 * @template T
 * @param {T} defaultConfig
 * @param {string} configPath
 * @returns {T}
 */
let parseConfig = function (defaultConfig, configPath) {
  // 加载自定义配置。
  let customConfig
  // 如果项目的根目录中存在 configPath 对应的文件，则加载该文件。
  if (fs.existsSync(PathUtil.parsePath(configPath))) {
    const customConfigContent = fs.readFileSync(PathUtil.parsePath(configPath), {
      encoding: 'utf-8',
    })
    customConfig = JSON.parse(customConfigContent)
  } else {
    // 否则，直接返回默认配置。
    return defaultConfig
  }

  // 返回合并后的配置。
  return Object.assign({}, defaultConfig, customConfig)
}

// 导出模块。
module.exports = { generateConfigFile, parseConfig }
