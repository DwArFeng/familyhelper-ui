const fs = require('node:fs')
const PathUtil = require('./path')
const { readFileSync } = require('node:fs')

/**
 * @type {Array<{name: string, dependencies: string[]}>}
 */
const packageInfos = parsePackageInfos()

function parsePackageInfos() {
  // 如果不存在 packages 文件夹，则返回空数组。
  if (!fs.existsSync(PathUtil.parsePath('packages'))) {
    return []
  }

  /**
   * @type {string[]}
   */
  const pkgDirNames = fs.readdirSync(PathUtil.parsePath('packages')).filter((f) => {
    return (
      fs.statSync(PathUtil.parsePath(`packages/${f}`)).isDirectory() &&
      fs.existsSync(PathUtil.parsePath(`packages/${f}/package.json`))
    )
  })

  /**
   * @type {Map<string, string>}
   */
  const pkgNamePkgDirNameMap = new Map()

  /**
   * @type {Map<string, string[]>}
   */
  const pkgDirNameDependentPkgNamesMap = new Map()

  for (const pkgDirName of pkgDirNames) {
    /**
     * @type {{name: string, dependencies: Object, devDependencies: Object}}
     */
    const pkg = JSON.parse(
      readFileSync(PathUtil.parsePath(`packages/${pkgDirName}/package.json`), 'utf-8'),
    )
    pkgNamePkgDirNameMap.set(pkg.name, pkgDirName)
    /**
     * @type {string[]}
     */
    let dependencies = []
    if (!pkg.dependencies) {
      dependencies = []
    } else {
      dependencies = Object.keys(pkg.dependencies)
    }
    let devDependencies = []
    if (!pkg.devDependencies) {
      devDependencies = []
    } else {
      devDependencies = Object.keys(pkg.devDependencies)
    }
    pkgDirNameDependentPkgNamesMap.set(pkgDirName, [...dependencies, ...devDependencies])
  }

  /**
   * @type {Array<{name: string, dependencies: string[]}>}
   */
  const packageInfos = []

  for (const pkgDirName of pkgDirNames) {
    const dirName = pkgDirName
    const dependentPkgNames = pkgDirNameDependentPkgNamesMap.get(pkgDirName)
    /**
     * @type {string[]}
     */
    const dependentPkgDirNames = []
    for (const dependentPkgName of dependentPkgNames) {
      if (!pkgNamePkgDirNameMap.has(dependentPkgName)) {
        continue
      }
      dependentPkgDirNames.push(pkgNamePkgDirNameMap.get(dependentPkgName))
    }
    packageInfos.push({ name: dirName, dependencies: dependentPkgDirNames })
  }

  return packageInfos
}

// 导出模块。
module.exports = { packageInfos }
