/**
 * @file utils
 * @description
 * @author dujianhao
 * @date 2023/06/21
 */

const path = require('path')
const { createSyncFn } = require('synckit')

const textLinter = createSyncFn(path.resolve(__dirname, './worker.mjs'))

module.exports = {
  textLinter,
}
