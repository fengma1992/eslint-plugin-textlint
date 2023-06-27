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

const COMMENT_TYPE = {
  LINE: 'Line', // 单行注释
  BLOCK: 'Block', // 块注释
}

function isComment(type) {
  return [COMMENT_TYPE.BLOCK, COMMENT_TYPE.LINE].includes(type)
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

const STRING_REG = /^(['"])(.*)\1$/

function formatNode(node) {
  const { type, value } = node
  let positionShift = 0
  let newValue = value
  // 模板字符串真实位置和字符串相差 开头的 ` 符号
  if (type === 'TemplateElement') {
    positionShift++
  }

  // 字符串
  if (type === 'Literal') {
    // 剔除字符串多余的双引号/单引号
    if (STRING_REG.test(value)) {
      newValue = value.replace(STRING_REG, '$2')
      positionShift++
    }
  }

  if (isComment(type)) {
    // 单行注释 value：不包含 //
    // 多行注释 value：不包含首尾的 \/* 和 *\/
    // 所以需要调整位置 + 2
    positionShift = 2
  }

  return { ...node, value: newValue, positionShift }
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
        type: 'object',
        properties: {
          // 允许的检测内容，全部 / 注释 / 代码
          lintType: {
            enum: ['all', 'comment', 'code'],
            default: 'all',
          },
          // 忽略 import 包声明字符串
          ignoreImportDeclaration: {
            type: 'boolean',
            default: true,
          },
        },
      },
    ],
  },

  create(context) {
    const { lintType = LINT_TYPE.ALL, ignoreImportDeclaration = true } = context.options[0] || {}
    const { comments, body } = context.sourceCode.ast
    const filename = context.getFilename()

    let nodeList = []

    /**
     * 解析 AST
     * @param {object} node
     */
    function parseNode(node) {
      if (!node) {
        return
      }

      const { type, value, raw: rawValue, loc, range } = node

      switch (type) {
        case 'ImportDeclaration':
          if (ignoreImportDeclaration) {
            return
          }

          parseNode(node.source)
          break
        case 'ExpressionStatement':
          const { expression } = node
          expression.arguments.forEach(item => parseNode(item))
          break
        case 'CallExpression':
          const { callee, arguments: args } = node
          // cjs require
          if (ignoreImportDeclaration && callee === 'require') {
            return
          }
          args.forEach(item => parseNode(item))
          break
        case 'VariableDeclaration':
          node.declarations.forEach(declaration => parseNode(declaration.init))
          break
        case 'TemplateLiteral':
          const { expressions, quasis } = node

          expressions.forEach(item => parseNode(item))
          quasis.forEach(item => parseNode(item))
          break
        case 'Literal':
          if (typeof value !== 'string') {
            return
          }
          nodeList.push({
            type: 'Literal',
            value: rawValue || value,
            loc,
            range,
          })
          break
        case 'TemplateElement':
          nodeList.push({
            type: 'TemplateElement',
            value: value.raw,
            loc,
            range,
          })
          break
        case 'BinaryExpression':
          const { left, right } = node

          parseNode(left)
          parseNode(right)
          break
        default:
          break
      }
    }

    // 代码
    if ([LINT_TYPE.ALL, LINT_TYPE.CODE].includes(lintType)) {
      body.forEach(node => parseNode(node))
    }

    // 注释
    if ([LINT_TYPE.ALL, LINT_TYPE.COMMENT].includes(lintType)) {
      nodeList = nodeList.concat(comments)
    }


    function report(textLintResult, node) {
      textLintResult.messages.forEach(({ message, loc, severity, ruleId, fix }) => {
        if (severity === 0) {
          return
        }
        const params = {
          message: `${ruleId}: ${message}`,
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


    function textLintNode(node) {
      const newNode = formatNode(node)
      const result = textLinter({
        text: newNode.value,
        filename,
      })

      report(result, newNode)
    }

    return {
      Program() {
        nodeList.forEach(textLintNode)
      },
    }
  },
}
