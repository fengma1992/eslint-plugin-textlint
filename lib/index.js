/**
 * @fileoverview lint text in JS
 * @author dujianhao
 */
'use strict'
const textlint = require('./rules/textlint')

const packageInfo = require('../package.json')

module.exports = {
  meta: {
    name: packageInfo.name,
    version: packageInfo.version,
  },
  rules: {
    textlint,
  },
}