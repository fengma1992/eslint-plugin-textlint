# Enable textlint in eslint (`textlint/textlint`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

## Rule Details

This rule aims to run textlint in JS.

Your project should have a textlintrc file and this rule will depend on it.

## Options

This rule has an object option:

* `"lintType": "all" (default) | "comment" | "code"`
    * `"all"`: (default) inspect comments and codes.
    * `"comment"`: inspect only comments.
    * `"code"`: inspect only codes (strings and templates in codes).
* `"ignoreImportDeclaration": true (default) | false`
    * `true`: ignore literal in import(ES Module) and require(CMD) statement.
    * `false`: check literal in import(ES Module) and require(CMD) statement.

### lintType

Examples of **correct** code for this rule with the default `{ "lintType": "all" }` option:

```js
/*eslint "textlint/textlint": [2, { "lintType": "all" }]*/

// will check this comment
const a = 'will check this string'

```

### ignoreImportDeclaration

Examples of **correct** code for this rule with the default `{ "ignoreImportDeclaration": true }` option:

```js
/*eslint "textlint/textlint": [2, { "ignoreImportDeclaration": true }]*/

// won't check this import
import CustomName1 from 'customPackage1';
// won't check this require
const CustomName2 = require('customPackage2');

```

## When Not To Use It

Give a short description of when it would be appropriate to turn off this rule.

## Further Reading

If there are other links that describe the issue this rule addresses, please include them here in a bulleted list.
