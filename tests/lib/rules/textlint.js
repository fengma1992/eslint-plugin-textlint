/**
 * @fileoverview Enable textlint in eslint
 * @author dujianhao
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/textlint'),
  RuleTester = require('eslint').RuleTester


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
})
ruleTester.run('textlint', rule, {
  valid: [
    {
      code: `import React from 'react'; console.log('测试');const a = '哈哈',b=window,c=1;`,
      errors: [],
    },
  ],

  invalid: [
    {
      code: '// ecmaScript 测试注释1；',
      errors: [
        { message: 'zh-technical-writing/terminology: Incorrect usage of the term: “ecmaScript”, use “ECMAScript” instead' },
        { message: 'zh-technical-writing/zhRuleSeries: 中文与数字之间需要添加空格' },
      ],
      output: '// ECMAScript 测试注释 1；',
      options: [{ lintType: 'comment' }],
    },
    {
      code: 'const a = `ios${\'android\'} ${123 + \'123\' + "456"} iot`',
      errors: [
        { message: 'zh-technical-writing/terminology: Incorrect usage of the term: “ios”, use “iOS” instead' },
        { message: 'zh-technical-writing/terminology: Incorrect usage of the term: “android”, use “Android” instead' },
        { message: 'zh-technical-writing/terminology: Incorrect usage of the term: “iot”, use “IoT” instead' },
      ],
      output: 'const a = `iOS${\'Android\'} ${123 + \'123\' + "456"} IoT`',
    },
    {
      code: 'console.log("test测试") // 测试注释2；',
      errors: [
        { message: 'zh-technical-writing/zhRuleSeries: 中文与英文之间需要添加空格' },
        { message: 'zh-technical-writing/zhRuleSeries: 中文与数字之间需要添加空格' },
      ],
      output: 'console.log("test 测试") // 测试注释 2；',
    },
    {
      code:
        `/**
*测试注释3；
*/
        `,
      errors: [{ message: 'zh-technical-writing/zhRuleSeries: 中文与数字之间需要添加空格' }],
      output:
        `/**
*测试注释 3；
*/
        `,
    },
    {
      code: `import apis from 'apis';
      const apis2 = require('apis');`,
      errors: [
        { message: 'zh-technical-writing/terminology: Incorrect usage of the term: “apis”, use “APIs” instead' },
        { message: 'zh-technical-writing/terminology: Incorrect usage of the term: “apis”, use “APIs” instead' },
      ],
      options: [{ ignoreImportDeclaration: false }],
      output: `import apis from 'APIs';
      const apis2 = require('APIs');`
    },
  ],
})

// Template
// String
// Identifier