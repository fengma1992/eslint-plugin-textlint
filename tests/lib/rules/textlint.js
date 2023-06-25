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
    // give me some code that won't trigger a warning
  ],

  invalid: [
    {
      code: '// ecmaScript 测试注释1；',
      errors: [{ message: 'Incorrect usage of the term: “ecmaScript”, use “ECMAScript” instead' }, { message: '中文与数字之间需要添加空格' }],
      output: '// ECMAScript 测试注释 1；',
      options: ['comment'],
    },
    {
      code: 'console.log("test测试") // 测试注释2；',
      errors: [{ message: '中文与英文之间需要添加空格' }, { message: '中文与数字之间需要添加空格' }],
      output: 'console.log("test 测试") // 测试注释 2；',
    },
    {
      code:
        `/**
*测试注释3；
*/
        `,
      errors: [{ message: '中文与数字之间需要添加空格' }],
      output:
        `/**
*测试注释 3；
*/
        `,
    },
  ],
})

// Template
// String
// Identifier