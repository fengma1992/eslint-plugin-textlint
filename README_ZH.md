# eslint-plugin-textlint

## 介绍

在 eslint 中执行 textlint

如果你有好的建议或疑问，欢迎[发表 issue](https://github.com/fengma1992/eslint-plugin-textlint/issues/new)。

## 安装

首先安装 [ESLint](https://eslint.org/) 和 [TextLint](https://textlint.github.io/):

```sh
npm i eslint textlint --save-dev
```

然后安装 `eslint-plugin-textlint`:

```sh
npm install eslint-plugin-textlint --save-dev
```

## 使用

### `.eslintrc` 配置

1. 添加 `textlint` 到 `.eslintrc` 配置文件的 plugins 内。可省略 `eslint-plugin-` 前缀:

```json
{
    "plugins": [
        "textlint"
    ]
}
```

2. 在 `.eslintrc` 的 rules 内配置规则：

```json
{
    "rules": {
        "textlint/textlint": [2, { "lintType": "all", "ignoreImportDeclaration": true }]
    }
}
```

#### rule: `textlint/textlint`

此规则有一个对象配置项：

* `"lintType": "all" (默认) | "comment" | "code"`
    * `"all"`: (默认) 检查注释和代码
    * `"comment"`: 仅检查注释
    * `"code"`: 仅检查代码 (代码内的字符串和模板字符串)
* `"ignoreImportDeclaration": true (default) | false`
    * `true`: 忽略 import 和 require 声明中的字符串
    * `false`: 检查 import 和 require 声明中的字符串


### `.textlintrc` 配置

1. 添加 `"@textlint/text": true` 到 `.textlintrc` 配置文件的 plugins 内。

```json
{
  "plugins": {
    "@textlint/text": true,
  }
}
```

2. 在 `.textlintrc` 的 rules 内配置你需要的 textlint 规则：

```js
{
  "rules": {
    // 你需要的规则
  }
}

```

## 现有规则

🔧 自动修复 [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| 名称                                 | 描述                    | 🔧 |
|:-----------------------------------|:----------------------|:---|
| [textlint](docs/rules/textlint.md) | 在 eslint 中执行 textlint | 🔧 |
