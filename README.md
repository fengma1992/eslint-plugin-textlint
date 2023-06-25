# eslint-plugin-textlint

Enable textlint in eslint

## Installation

You'll first need to install [ESLint](https://eslint.org/) and [TextLint](https://textlint.github.io/):

```sh
npm i eslint textlint --save-dev
```

Next, install `eslint-plugin-textlint`:

```sh
npm install eslint-plugin-textlint --save-dev
```

## Usage

### `.eslintrc` configuration

1. Add `textlint` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "textlint"
    ]
}
```

2. Configure the rules you want to use under the rules section in `.eslintrc`.

```json
{
    "rules": {
        "textlint/textlint": [2, "all"]
    }
}
```

* rule: `textlint/textlint`

This rule has a string option:

| option      | desc                                                |
|-------------|-----------------------------------------------------|
| `"all"`     | (default) inspect comments and codes                | 
| `"comment"` | inspect only comments                               |                
| `"code"`    | inspect only codes (strings and templates in codes) |                   


### `.textlintrc` configuration

1. Add `"@textlint/text": true` to the plugins section of your `.textlintrc` configuration file.

```json
{
  "plugins": {
    "@textlint/text": true,
  }
}
```

2. Configure the rules you want to use under the rules section in `.textlintrc`.

```json
{
  rules: {
    // whatever you want
  }
}

```

## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                               | Description               | 🔧 |
|:-----------------------------------|:--------------------------|:---|
| [textlint](docs/rules/textlint.md) | Enable textlint in eslint | 🔧 |
