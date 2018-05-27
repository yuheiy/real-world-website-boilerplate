# Real world website boilerplate

静的ウェブサイトを開発するためのボイラープレートです。次のような特徴があります。

- デファクトスタンダードである開発ツールを採用
  - [Pug](https://pugjs.org/)
  - [Sass](https://sass-lang.com/)
  - [PostCSS](http://postcss.org/)
  - [webpack](https://webpack.js.org/)
  - [Babel](https://babeljs.io/)
  - [Browsersync](https://browsersync.io/)
  - [Prettier](https://prettier.io/)など
- [HTMLテンプレート](#htmlテンプレート)の開発をサポート
  - テンプレートで利用するデータの管理（YAML、JSON）
  - 各ページごとにパスの解決方法を提供
  - 必要なファイルのみを処理することによって規模によるビルド時間の増大を防止
- 拡張性があり明確な[ディレクトリ構造](#ディレクトリ構造)
- サブディレクトリを想定した開発に対応（[ディレクトリ構造](#ディレクトリ構造)、[HTMLテンプレート](#htmlテンプレート)を参照）

## 目次

- [推奨環境](#推奨環境)
- [導入](#導入)
- [本番用ビルド](#本番用ビルド)
- [ディレクトリ構造](#ディレクトリ構造)
  - [`dist/`ディレクトリ](#distディレクトリ)
  - [`public/`ディレクトリ](#publicディレクトリ)
  - [`src/`ディレクトリ](#srcディレクトリ)
  - [`vendor-public/`ディレクトリ](#vendor-publicディレクトリ)
  - [`task/`ディレクトリ](#taskディレクトリ)
  - [`tmp/`ディレクトリ](#tmpディレクトリ)
  - [`realworld.config.js`ファイル](#realworldconfigjsファイル)
- [HTMLテンプレート](#htmlテンプレート)
  - [`file`（全ページ共有データ）](#file全ページ共有データ)
  - [`page`（個別ページ用データ）](#page個別ページ用データ)
  - [`origin`](#origin)
  - [`absPath(pagePath)`](#abspathpagepath)
  - [`assetPath(filePath)`](#assetpathfilepath)
  - [`absUrl(pagePath)`](#absurlpagepath)
  - [`assetUrl(filePath)`](#asseturlfilepath)
  - [`__DEV__`](#__dev__)
- [対象ブラウザ](#対象ブラウザ)
- [レシピ](#レシピ)
  - [CSSファイルのエントリーポイントの設定](#cssファイルのエントリーポイントの設定)
  - [アセットディレクトリの変更](#アセットディレクトリの変更)
  - [Server Side Includesの設定](#server-side-includesの設定)
  - [差分納品ファイル管理ガイド](#差分納品ファイル管理ガイド)
- [参考](#参考)

## 推奨環境

- Mac OS XまたはWindows
- Yarn
- Node.js 8.9以降
- EditorConfigおよびPrettierをサポートするエディタ

## 導入

1. 最新版のボイラープレートを取得

    ```bash
    git clone https://github.com/yuheiy/real-world-website-boilerplate.git my-project/
    cd my-project/
    rm -rf .git/
    ```

1. `yarn install`を実行して依存パッケージのインストール
1. `yarn start`を実行して開発用サーバーの起動

## 本番用ビルド

次のコマンドによって本番用ビルドを実行します。

```bash
yarn build
```

これによって`dist/`ディレクトリにビルドされたファイルが生成されます。

## ディレクトリ構造

```
.
├── dist/
│   └── path/to/project/
│       ├── assets/
│       │   ├── css/
│       │   │   └── main.bundle.css
│       │   ├── img/
│       │   │   └── logo.svg
│       │   └── js/
│       │       └── main.bundle.js
│       ├── about.html
│       ├── index.html
│       └── pub.html
├── public/
│   ├── assets/
│   │   └── img/
│   │       └── logo.svg
│   └── pub.html
├── src/
│   ├── css/
│   │   └── main.scss
│   ├── html/
│   │   ├── _data/
│   │   │   └── meta.yml
│   │   ├── about.pug
│   │   ├── about.yml
│   │   ├── index.pug
│   │   └── index.yml
│   └── js/
│       └── main.js
├── vendor-public/
│   └── common.css
├── task/
├── tmp/
│   └── path/to/project/
│       └── assets/
│           ├── css/
│           │   ├── main.bundle.css
│           │   └── main.bundle.css.map
│           └── js/
│               ├── main.bundle.js
│               └── main.bundle.js.map
├── package.json
└── realworld.config.js
```

サブディレクトリが設定されていない場合、ファイルは`dist/`ディレクトリあるいは`tmp/`ディレクトリの直下に生成されます。サブディレクトリが設定されている場合、それらのディレクトリを基準として、指定されたサブディレクトリにファイルが生成されます。

サブディレクトリの設定方法は[`realworld.config.js`ファイル](#realworldconfigjsファイル)を参照してください。

### `dist/`ディレクトリ

`yarn build`によって本番用ビルドが実行されたときに、このディレクトリにファイルが生成されます。

`src/`ディレクトリのファイルはコンパイル後に生成され、`public/`ディレクトリのファイルはそのままコピーされます。`vendor-public/`ディレクトリのファイルは無視されます。

### `public/`ディレクトリ

コンパイルが不要な静的ファイルをこのディレクトリに配置します。`/`または指定されたサブディレクトリから、このディレクトリを参照できます。

### `src/`ディレクトリ

コンパイルをソースファイルをこのディレクトリに配置します。主にこのディレクトリで作業することになるでしょう。

CSSは`src/css/main.scss`ファイルが、アセットディレクトリの`css/main.bundle.css`ファイルとして生成されます。

JavaScriptは`src/js/main.js`ファイルが、アセットディレクトリの`js/main.bundle.js`ファイルとして生成されます。

### `vendor-public/`ディレクトリ

コンパイルが不要かつ納品をしないファイルを配置します。本番用ビルド時に`dist/`ディレクトリに含まれません。

サブディレクトリの設定に関わらず`/`から参照できます。

サイトの下層ページを制作する場合に、共通で読み込む必要のあるCSSファイルなどを配置することを想定しています。

### `task/`ディレクトリ

ビルドタスクに関するファイルを配置します。

### `tmp/`ディレクトリ

`yarn start`によって開発サーバーが起動されたときに、開発に必要な一時ファイルが生成されます。

### `realworld.config.js`ファイル

プロジェクトのURLを設定します。

- サブディレクトリを設定しない場合は次のようにします。

  ```javascript
  module.exports = {
    origin: 'http://example.com',
  }
  ```

- サブディレクトリを設定する場合は次のようにします。

  ```javascript
  module.exports = {
    origin: 'http://example.com',
    subdir: 'path/to/project',
  }
  ```

## HTMLテンプレート

テンプレートエンジンとしてPugを採用しています。

開発時には、リクエストされたパスと対応するファイルのみをコンパイルすることによって、全体のページ数と比例してビルド時間が増大することを防止しています。Browsersyncのミドルウェアとして[real-world-website-render-helper](https://github.com/yuheiy/real-world-website-render-helper)を利用することによって実現しています。

`src/html/`ディレクトリのファイルは、ディレクトリ構造を維持したままHTMLファイルとして出力されます。`src/html/index.pug`の場合、`/index.html`から参照できます。`_`から始まるファイル及びディレクトリは、個別にHTMLファイルとして出力されません。

### `file`（全ページ共有データ）

`src/html/_data/`ディレクトリ直下にYAMLファイルまたはJSONファイルを作成することで、`file`変数として対応付けされ、全てのページから参照できるようになります。`src/html/_data/meta.yml`というファイルの場合、`file.meta`から参照できます。

### `page`（個別ページ用データ）

Pugファイルと同名のYAMLファイルまたはJSONファイルを作成することで、対応するファイルのみで有効になるデータを設定できます。`src/html/page.pug`というファイルで利用するデータを指定する場合、`src/html/page.yml`というファイルを作成します。

自動的に`page.path`にページのパスが設定されます。`src/html/page.pug`の場合は`/page.html`になり、`src/html/index.pug`の場合は省略されて`/`になります。[`absPath()`](#abspathpagepath)などの関数と組み合わせることで、サブディレクトリにも対応したパスを出力できます。

### `origin`

`realworld.config.js`に設定した`origin`の値を参照できます。

### `absPath(pagePath)`

指定されたサブディレクトリを基準とした相対パスを、絶対パスに変換します。サブディレクトリとして`path/to/project`が指定されていた場合、`absPath('page.html')`は`/path/to/project/page.html`になります。

### `assetPath(filePath)`

アセットディレクトリを基準とした相対パスを、絶対パスに変換します。`assetPath('img/logo.svg')`は`/assets/img/logo.svg`になります。

### `absUrl(pagePath)`

指定されたサブディレクトリを基準とした相対パスを、絶対URLに変換します。`origin`に`http://example.com`が指定されていた場合、`absUrl('page.html')`は`http://example.com/page.html`になります。

### `assetUrl(filePath)`

アセットディレクトリを基準とした相対パスを、絶対URLに変換します。`origin`に`http://example.com`が指定されていた場合、`assetUrl('img/logo.svg')`は`http://example.com/assets/img/logo.svg`になります。

### `__DEV__`

`yarn start`での開発時は`true`になり、`yarn build`でのビルド時は`false`になります。

## 対象ブラウザ

ビルドの対象にするブラウザは`.browserslistrc`で設定します。記述方法は[Browserslistのドキュメント](https://github.com/ai/browserslist)を参照してください。

デフォルトでは次のようになっています。

```yaml
last 1 Chrome version
last 1 ChromeAndroid version
last 1 Edge version
last 1 Firefox version
last 1 iOS version
last 1 Safari version
> 3% in JP
```

この設定は次のパッケージから参照されます。

- [Autoprefixer](https://github.com/postcss/autoprefixer)
- [babel-preset-env](https://github.com/babel/babel-preset-env)

なお、[IE10以下を対象とする場合、Babelで問題が発生することがあります](https://babeljs.io/docs/usage/caveats/)。

## レシピ

### CSSファイルのエントリーポイントの設定

`gulpfile.js`を編集してCSSファイルのエントリーポイントを変更できます。デフォルトでは`src/css/main.scss`がアセットディレクトリに`css/main.bundle.css`として出力されます。

```javascript
const cssEntries = {
  main: 'src/css/main.scss',
}
```

オブジェクトのキーが出力されるファイル名、対応する値がソースファイルのパスです。

`src/css/print.scss`をエントリーポイントとして追加したい場合、次のように設定します。アセットディレクトリに`css/print.bundle.css`として出力されます。

```javascript
const cssEntries = {
  main: 'src/css/main.scss',
  print: 'src/css/print.scss',
}
```

### アセットディレクトリの変更

`task/util.js`を編集することでアセットディレクトリを変更することができます。

- デフォルトでは、プロジェクトディレクトリ直下の`assets/`ディレクトリが設定されています。

  ```javascript
  const assetPath = path.join(basePath, 'assets')
  ```

- プロジェクトディレクトリ直下に配置する場合は、次のように変更します。

  ```javascript
  const assetPath = basePath
  ```

- サブディレクトリとして`path/to/project`が指定されており、`/assets/path/to/project`というディレクトリに配置する場合は、次のように変更します。

  ```javascript
  const assetPath = join('/assets', basePath)
  ```

- `https://assets-cdn.example.com`という別オリジンから配信する場合は、次のように変更します。

  ```diff
  -const baseAssetUrl = `${origin}${toPosixPath(assetPath)}`
  +const baseAssetUrl = 'https://assets-cdn.example.com'
  ```

  加えて、HTMLテンプレートでは`assetPath()`を利用せず、`assetUrl()`のみを利用するようにします。`task/renderHtml.js`は次のように変更します。

  ```diff
  const baseLocals = {
    __DEV__: !isProd,
    origin,
    absPath: (pagePath = '') => toPosixPath(join(basePath, pagePath)),
  - assetPath: (filePath = '') => toPosixPath(join(assetPath, filePath)),
    absUrl: (pagePath = '') => `${baseUrl}${toPosixPath(join('/', pagePath))}`,
  + assetUrl: isProd
  +   ? (filePath = '') => `${baseAssetUrl}${toPosixPath(join('/', filePath))}`
  +   : (filePath = '') => toPosixPath(join(assetPath, '/', filePath)),
  }
  ```

  デプロイ時は、ビルドによって生成されたアセットディレクトリ以下のファイルをCDNにアップロードしてください。

### Server Side Includesの設定

Browsersyncのオプションである`rewriteRules`を設定することで有効になります。読み込む対象のファイルを`vendor-public/`ディレクトリに配置する場合、`gulpfile.js`を次のように変更します。

```javascript
const serve = (done) => {
  const { existsSync, statSync, readFileSync } = require('fs')

  bs.init(
    {
      // 省略
      rewriteRules: [
        {
          match: /<!--#include virtual="(.+?)" -->/g,
          fn(_req, _res, _match, filePath) {
            const srcFilePath = join('vendor-public', filePath)

            if (existsSync(srcFilePath) && statSync(srcFilePath).isFile()) {
              return readFileSync(srcFilePath, 'utf8')
            } else {
              return `<strong style="color: red">\`${srcFilePath}\` could not be found</strong>`
            }
          },
        },
      ],
      // 省略
    },
    done,
  )
}
```

これによって次のようなディレクティブが利用できるようになります。

```html
<body>
  <!--#include virtual="/includes/site-header.html" -->
  <main>
    ...
  </main>
  <!--#include virtual="/includes/site-footer.html" -->
</body>
```

### 差分納品ファイル管理ガイド

納品ファイルの差分管理が必要な場合、`dist/`ディレクトリをGitにコミットするようにします。`.gitignore`を次のように変更します。

```diff
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

-/dist/
/tmp/
```

リリースの毎に`yarn build`を実行して、生成される`dist/`ディレクトリをGitにコミットします。このコミットに、Gitのタグを付けておくと参照しやすくなります。

前回のリリースと対応するコミットが`release-20180101`の場合、次のコマンドで追加・変更したファイルのみをZipファイルとして生成できます。

```bash
git archive --format=zip --prefix=htdocs/ HEAD:dist `git diff --diff-filter=ACMR --name-only release-20180101 HEAD | grep "^dist/" | sed -e "s/dist\///"` > htdocs.zip
```

削除したファイルリストは次のコマンドで生成できます。

```bash
git diff release-20180101 --name-only --diff-filter=D | grep "^dist" | sed -e "s/dist\///" > deleted-files.txt
```

## 参考

開発サーバーの仕組みは『[watch 時のビルドをもっと速くしたい](https://speakerdeck.com/ktsn/watch-shi-falsebirudowomotutosu-kusitai)』を参考にしています。
