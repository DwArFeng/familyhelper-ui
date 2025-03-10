// noinspection DuplicatedCode

const childProcess = require('child_process')
const LogUtil = require('./log')

/**
 * 启动一个子进程执行指定的命令。
 *
 * @param {string} command The command to run.
 * @param {string[]} args The command arguments.
 * @param {string} [cwd] The custom directory to run the command in.
 * @return {Promise<void>} A promise that resolves when the command has been executed successfully.
 */
async function spawn(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const _process = childProcess.spawn(command, args, {
      stdio: [
        'ignore', // stdin
        'inherit', // stdout
        'inherit', // stderr
      ],
      cwd: cwd || process.cwd(), // Set the custom directory or use the current working directory
      shell: process.platform === 'win32',
    })

    _process.stdout?.on('data', (chunk) => {
      // 按照换行符分割 chunk，并输出。
      chunk.split('\n').forEach((c) => {
        LogUtil.info(c.replace(/\s+$/, ''))
      })
    })

    _process.stderr?.on('data', (chunk) => {
      // 按照换行符分割 chunk，并输出。
      chunk.split('\n').forEach((c) => {
        LogUtil.warn(c.replace(/\s+$/, ''))
      })
    })

    _process.on('error', (error) => {
      reject(error)
    })

    _process.on('exit', (code) => {
      const ok = code === 0
      if (ok) {
        resolve()
      } else {
        reject(new Error('Failed to execute command'))
      }
    })
  })
}

/**
 * 执行指定的命令。
 *
 * @param {string} command The command to run.
 * @param {string} [cwd] The custom directory to run the command in.
 * @return {Promise<void>} A promise that resolves when the command has been executed successfully.
 */
async function exec(command, cwd) {
  return new Promise((resolve, reject) => {
    // noinspection JSCheckFunctionSignatures
    const _process = childProcess.exec(command, {
      stdio: [
        'ignore', // stdin
        'inherit', // stdout
        'inherit', // stderr
      ],
      cwd: cwd || process.cwd(), // Set the custom directory or use the current working directory
      shell: process.platform === 'win32',
    })

    _process.stdout?.on('data', (chunk) => {
      // 按照换行符分割 chunk，并输出。
      chunk.split('\n').forEach((c) => {
        LogUtil.info(c.replace(/\s+$/, ''))
      })
    })

    _process.stderr?.on('data', (chunk) => {
      // 按照换行符分割 chunk，并输出。
      chunk.split('\n').forEach((c) => {
        LogUtil.warn(c.replace(/\s+$/, ''))
      })
    })

    _process.on('error', (error) => {
      reject(error)
    })

    _process.on('exit', (code) => {
      const ok = code === 0
      if (ok) {
        resolve()
      } else {
        reject(new Error('Failed to execute command'))
      }
    })
  })
}

// 导出模块。
module.exports = { spawn, exec }
