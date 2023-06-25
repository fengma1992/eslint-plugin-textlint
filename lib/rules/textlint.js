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

/**
 * 格式化注释的 value
 * 单行：不包含 //
 * 多行：不包含首尾的 \/* 和 *\/
 */
function formatCommentValue(comment) {
  const { value, type } = comment
  if (type === COMMENT_TYPE.LINE) {
    return `//${value}`
  } else if (type === COMMENT_TYPE.BLOCK) {
    return `/*${value}*/`
  }
  return value
}

/**
 * 将 textlint 的 line 转化为 eslint 的 line
 * @param comment
 * @param position
 * @return {number}
 */
function formatLine(comment, position) {
  const { loc: CodeLoc } = comment
  return CodeLoc.start.line + position.line - 1
}

/**
 * 将 textlint 的 column 转化为 eslint 的 column
 * @param comment
 * @param position
 * @return {*}
 */
function formatColumn(comment, position) {
  const { loc: CodeLoc } = comment
  return CodeLoc.start.column + position.column
}

/**
 * 将 textlint 的 fixRange 转化为 eslint 的fixRange
 * @param comment
 * @param fixRange
 * @return {*[]}
 */
function formatFixRange(comment, fixRange) {
  const { range } = comment
  const [start, end] = fixRange
  return [range[0] + start, range[0] + end]
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
    ], // Add a schema if the rule has options
  },

  create(context) {
    // 默认 lintType 为 all
    const lintType = context.options[0] || LINT_TYPE.ALL

    const { comments, tokens } = context.sourceCode.ast

    const filteredTokens = tokens.filter(token => TARGET_TOKEN_TYPES.includes(token.type))

    const filename = context.getFilename()


    function report(textLintResult, comment) {
      textLintResult.messages.forEach(({ message, loc, severity, fix }) => {
        if (severity === 0) {
          return
        }
        const params = {
          message,
          loc: {
            start: {
              line: formatLine(comment, loc.start),
              column: formatColumn(comment, loc.start),
            },
            end: {
              line: formatLine(comment, loc.end),
              column: formatColumn(comment, loc.end),
            },
          },
        }
        // textLint 返回的 fix 是一个对象
        if (fix) {
          fix.range = formatFixRange(comment, fix.range)
          params.fix = () => fix
        }

        context.report(params)
      })
    }

    function parseComment(comment) {
      const result = textLinter({
        text: formatCommentValue(comment),
        filename,
      })
      report(result, comment)
    }


    function parseToken(token) {
      const result = textLinter({
        text: token.value,
        filename,
      })

      report(result, token)
    }

    return {
      Program() {
        if ([LINT_TYPE.ALL, LINT_TYPE.COMMENT].includes(lintType)) {
          comments.forEach(parseComment)
        }
        if ([LINT_TYPE.ALL, LINT_TYPE.CODE].includes(lintType)) {
          filteredTokens.forEach(parseToken)
        }
      },
    }
  },
}
