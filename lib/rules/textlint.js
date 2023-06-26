/**
 * @fileoverview textlint in eslint
 * @author dujianhao
 */
'use strict'

const { textLinter } = require('./utils')


const LINT_TYPE = {
  ALL: 'all', // 全部
  COMMENT: 'comment', // 注释
  CODE: 'code',// 代码
}

const TARGET_TOKEN_TYPES = ['Template', 'String']

const COMMENT_TYPE = {
  LINE: 'Line', // 单行注释
  BLOCK: 'Block', // 块注释
}

const TARGET_COMMENT_TYPES = [COMMENT_TYPE.BLOCK, COMMENT_TYPE.LINE]

function isComment(type) {
  return TARGET_COMMENT_TYPES.includes(type)
}

/**
 * 将 textlint 的 line 转化为 eslint 的 line
 * @param node
 * @param position
 * @return {number}
 */
function formatLine(node, position) {
  const { loc: CodeLoc } = node
  return CodeLoc.start.line + position.line - 1
}

/**
 * 将 textlint 的 column 转化为 eslint 的 column
 * @param node
 * @param position
 * @return {*}
 */
function formatColumn(node, position) {
  const { loc: CodeLoc, positionShift } = node

  return CodeLoc.start.column + position.column + positionShift
}

/**
 * 将 textlint 的 fixRange 转化为 eslint 的fixRange
 * @param node
 * @param fixRange
 * @return {*[]}
 */
function formatFixRange(node, fixRange) {
  const { range, positionShift } = node
  const [start, end] = fixRange

  return [range[0] + start + positionShift, range[0] + end + positionShift]
}

const TEMPLATE_REG = {
  START: /^`/,
  END: /`$/,
  VALUE_START: /\$\{$/,
  VALUE_END: /^}/,
}

const STRING_REG = /^(['"])(.*)\1$/

function formatNode(node) {
  let { type, value } = node
  let positionShift = 0
  // 模板字符串
  if (type === 'Template') {
    // 剔除开头的`
    if (TEMPLATE_REG.START.test(value)) {
      value = value.replace(TEMPLATE_REG.START, '')
      // ` 在开头，偏移需要 +1
      positionShift++
    }
    // 剔除结尾的`
    if (TEMPLATE_REG.END.test(value)) {
      value = value.replace(TEMPLATE_REG.END, '')
    }
    // 剔除代码块开头的${
    if (TEMPLATE_REG.VALUE_START.test(value)) {
      value = value.replace(TEMPLATE_REG.VALUE_START, '')
    }
    // 剔除代码块结尾的}
    if (TEMPLATE_REG.VALUE_END.test(value)) {
      value = value.replace(TEMPLATE_REG.VALUE_END, '')
      // } 在开头，偏移需要 +1
      positionShift++
    }
  }
  // 字符串
  if (type === 'String') {
    // 剔除字符串多余的双引号/单引号
    if (STRING_REG.test(value)) {
      value = value.replace(STRING_REG, '$2')
      positionShift++
    }
  }

  if (isComment(type)) {
    // 单行注释 value：不包含 //
    // 多行注释 value：不包含首尾的 \/* 和 *\/
    // 所以需要调整位置 + 2
    positionShift = 2
  }

  return { ...node, value, positionShift }
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: 'Enable textlint in eslint',
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: 'code',
    schema: [
      {
        enum: ['all', 'comment', 'code'], // 允许的检测内容，全部 / 注释 / 代码
      },
    ],
  },

  create(context) {
    // 默认 lintType 为 all
    const lintType = context.options[0] || LINT_TYPE.ALL

    const { comments, tokens } = context.sourceCode.ast

    const filteredTokens = tokens.filter(token => TARGET_TOKEN_TYPES.includes(token.type))

    const filename = context.getFilename()

    function report(textLintResult, node) {
      textLintResult.messages.forEach(({ message, loc, severity, fix }) => {
        if (severity === 0) {
          return
        }
        const params = {
          message,
          loc: {
            start: {
              line: formatLine(node, loc.start),
              column: formatColumn(node, loc.start),
            },
            end: {
              line: formatLine(node, loc.end),
              column: formatColumn(node, loc.end),
            },
          },
        }
        // textLint 返回的 fix 是一个对象
        if (fix) {
          fix.range = formatFixRange(node, fix.range)
          params.fix = () => fix
        }

        context.report(params)
      })
    }


    function parseNode(node) {
      const newNode = formatNode(node)
      const result = textLinter({
        text: newNode.value,
        filename,
      })

      report(result, newNode)
    }

    return {
      Program() {
        if ([LINT_TYPE.ALL, LINT_TYPE.COMMENT].includes(lintType)) {
          comments.forEach(parseNode)
        }
        if ([LINT_TYPE.ALL, LINT_TYPE.CODE].includes(lintType)) {
          filteredTokens.forEach(parseNode)
        }
      },
    }
  },
}
