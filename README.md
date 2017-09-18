# Real world website boilerplate

静的ウェブサイトを開発するためのボイラープレートです。

HTMLテンプレートを作成するためのシンプルな仕組みや、標準的なCSSやJavaScriptを書くための設定を含んでいます。サブディレクトリや差分納品、SSIなどの煩わしさの解決策を提供します。

## クイックスタート

```sh
git clone https://github.com/yuheiy/real-world-website-boilerplate.git my-app
cd my-app
rm -rf .git
yarn
yarn start
```

## 概要

### ディレクトリ構成

```sh
├── dist/                           # 本番向けビルドの結果が出力される
├── docs/
│   └── user-guide.md
├── node_modules/
├── public/                         # `dist/`ディレクトリのプロジェクトルートにそのままコピーされる
│   ├── assets/
│   │   └── img/
│   └── pub.html
├── src/
│   ├── css/
│   │   ├── components/
│   │   │   ├── license/
│   │   │   │   └── _Display.scss
│   │   │   ├── _Content.scss
│   │   │   ├── _GlobalHeader.scss
│   │   │   └── _Section.scss
│   │   ├── _base.scss
│   │   ├── _functions.scss
│   │   ├── _vars.scss
│   │   └── main.scss               # CSSのエントリーポイント。`/assets/css/main.css`に出力される
│   ├── html/                       # ディレクトリ内の階層のまま`dist/`ディレクトリ内のプロジェクトルートに出力される
│   │   ├── _data/                  # テンプレート全体から参照できる変数
│   │   │   └── siteNavigation.json # テンプレート内の`file.siteNavigation`変数から参照できる
│   │   ├── _extends/               # ビルド時に除外される
│   │   │   └── default.pug
│   │   ├── _includes/              # ビルド時に除外される
│   │   │   ├── global-header.pug
│   │   │   ├── head.pug
│   │   │   └── scripts.pug
│   │   ├── document.json           # テンプレート内の`page`変数から参照できる。`document.pug`でのみ有効な変数
│   │   ├── document.pug            # `/document.html`に出力されるファイル
│   │   ├── getting-started.json
│   │   ├── getting-started.pug
│   │   ├── index.json
│   │   ├── index.pug
│   │   ├── license.json
│   │   └── license.pug
│   └── js/
│       ├── components/
│       │   └── license/
│       │       └── Display.js
│       ├── main.js                 # JavaScriptのエントリーポイント。`/assets/js/main.js`に出力される
│       └── polyfill.js
├── task/
│   └── renderHtml.js
├── tmp/                            # 開発時に出力される一時ファイル
├── vendor-public/                  # 開発サーバーでルートディレクトリから参照できるファイル。`dist/`ディレクトリに出力されない
│   └── common.css
├── README.md
├── gulpfile.babel.js
├── package.json
├── realworld.config.js             # 開発環境の設定ファイル
├── webpack.config.js
└── yarn.lock
```

### `yarn start`

開発用サーバーが起動します。コンソールにサーバーのURLが表示されます。

### `yarn build`

本番向けにビルドしたファイルを`dist/`ディレクトリに出力します。

### `realworld.config.js`

ウェブサイトのURLに応じて`baseUrl`と`basePath`を設定してください。

#### ルート直下の場合

```javascript
module.exports = {
  baseUrl: 'http://example.com',
}
```

#### サブディレクトリの場合

```javascript
module.exports = {
  baseUrl: 'http://example.com/path/to/project',
  basePath: '/path/to/project',
}
```

## [ユーザーガイド](/docs/user-guide.md)

- [HTMLテンプレート](/docs/user-guide.md#htmlテンプレート)
- [対象ブラウザの設定](/docs/user-guide.md#対象ブラウザの設定)
- [ステージング環境へのデプロイ](/docs/user-guide.md#ステージング環境へのデプロイ)
- [SSI](/docs/user-guide.md#ssi)
- [差分納品](/docs/user-guide.md#差分納品)

## インスピレーション

開発サーバーの仕組みは[bs-compile-middleware](https://github.com/ktsn/bs-compile-middleware)を参考にしています。

## ライセンス

MIT
