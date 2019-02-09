# Real world website boilerplate

静的ウェブサイトを開発するためのボイラープレートです。大量の HTML ファイルも快適に開発できる仕組みに注力しつつ、モダンな開発ツールを採用しながらも柔軟な構成になっています。

## 目次

- [推奨環境](#推奨環境)
- [インストール](#インストール)
- [開発用サーバー](#開発用サーバー)
- [本番用ビルド](#本番用ビルド)
- [ディレクトリ構成](#ディレクトリ構成)
  - [`src/`](#src)
  - [`src/html/`](#srchtml)
  - [`src/css/`](#srccss)
  - [`src/js/`](#srcjs)
  - [`public/`](#public)
  - [`vendor-public/`](#vendor-public)
  - [`dist/`](#dist)
  - [`.tmp/`](#tmp)
- [HTML テンプレート](#html-テンプレート)
  - [データファイル](#データファイル)
  - [変数](#変数)
    - [`data`](#data)
    - [`page`](#page)
    - [`page.path`](#pagepath)
    - [`absPath(filePath)`](#abspathfilepath)
    - [`assetPath(filePath)`](#assetpathfilepath)
    - [`__DEV__`](#__dev__)
- [設定](#設定)
  - [サブディレクトリ](#サブディレクトリ)
  - [アセットディレクトリ](#アセットディレクトリ)
  - [独自フラグ](#独自フラグ)
  - [Server Side Includes](#server-side-includes)
  - [テンプレートエンジン](#テンプレートエンジン)
  - [HTML の整形](#html-の整形)
- [レシピ](#レシピ)
  - [差分納品](#差分納品)

## 推奨環境

- Mac OS X または Windows
- Yarn
- Node.js 8.9.0 以降
- EditorConfig および Prettier をサポートするエディタ

## インストール

```bash
git clone https://github.com/yuheiy/real-world-website-boilerplate.git my-web
cd my-web
rm -rf .git
yarn install
```

このプロジェクトの Git リポジトリをクローンした上で、Node.js の依存モジュールをインストールしてください。

## 開発用サーバー

```bash
yarn start
```

ソースファイルの監視を開始して、開発用サーバーを起動します。`--prod` フラグを指定するとビルドが本番用になります。

## 本番用ビルド

```bash
yarn build
```

[`dist/`](#dist)に本番用にビルドされたファイルが出力されます。

## ディレクトリ構成

```
.
├── .tmp/
│   ├── assets/
│   │   ├── main.bundle.css
│   │   ├── main.bundle.css.map
│   │   ├── main.module.bundle.js
│   │   ├── main.module.bundle.js.map
│   │   ├── main.nomodule.bundle.js
│   │   └── main.nomodule.bundle.js.map
│   └── index.html
├── dist/
│   ├── assets/
│   │   ├── logo.svg
│   │   ├── main.bundle.css
│   │   ├── main.module.bundle.js
│   │   ├── main.nomodule.bundle.js
│   │   └── ogp.png
│   ├── favicon.ico
│   └── index.html
├── public/
│   ├── assets/
│   │   ├── logo.svg
│   │   └── ogp.png
│   └── favicon.ico
├── src/
│   ├── css/
│   │   └── main.scss
│   ├── html/
│   │   ├── _data/
│   │   │   └── meta.yml
│   │   ├── index.pug
│   │   └── index.yml
│   └── js/
│       ├── main.js
│       ├── polyfill.common.js
│       ├── polyfill.module.js
│       └── polyfill.nomodule.js
├── vendor-public/
│   └── common.css
├── gulpfile.js
└── package.json
```

### `src/`

コンパイルなどの処理をさせるファイルはこのディレクトリに配置します。

### `src/html/`

HTML にコンパイルされる前のテンプレートファイルと、テンプレートから参照するためのデータファイルをこのディレクトリに配置します。配置されたファイルは、同じ階層を維持したままプロジェクトのルートディレクトリに対応付けされます。例えば`src/html/product/drink.pug`は`/product/drink.html`として出力されます。

[サブディレクトリが指定](#サブディレクトリ)されていれば、サブディレクトリ以下の階層に対応付けされます。

詳細は[HTML テンプレート](#html-テンプレート)を参照してください。

### `src/css/`

CSS にコンパイルされる前の Sass ファイルをこのディレクトリに配置します。`src/css/main.scss`をエントリーポイントとして、[アセットディレクトリ](#アセットディレクトリ)直下に`main.bundle.css`として出力されます。

### `src/js/`

コンパイルされる前の JavaScript ファイルをこのディレクトリに配置します。`src/js/main.js`をエントリーポイントとして、[アセットディレクトリ](#アセットディレクトリ)直下に`main.bundle.js`として出力されます。

ファイル内では次のグローバル変数を参照できます。

`__DEV__`は、開発時は`true`になり、本番用ビルドでは`false`になります。

`__BASE_PATH__`は、デフォルトでは`/`になり、[サブディレクトリが指定](#サブディレクトリ)されていれば`/path/to/subdir/`のようになります。

### `public/`

静的ファイルをこのディレクトリに配置します。各ファイルはプロジェクトのルートディレクトリに対応付けされます。`public/favicon.ico`は`/favicon.ico`として出力されます。

[サブディレクトリが指定](#サブディレクトリ)されていれば、サブディレクトリ以下の階層に対応付けされます。

### `vendor-public/`

デプロイに含めないファイルをこのディレクトリに配置します。各ファイルはプロジェクトのルートディレクトリに対応付けされます。`vendor-public/common.css`は`/common.css`として出力されます。

このディレクトリ内のファイルは本番用ビルドの実行時に[`dist/`](#dist)に出力されません。開発時には必要であっても、デプロイに含める必要はないファイルを配置できます。

[サブディレクトリが指定](#サブディレクトリ)されていても対応付けされるパスに*影響しません*。

### `dist/`

本番用ビルドの実行時にはこのディレクトリにファイルが出力されます。

[サブディレクトリが指定](#サブディレクトリ)されていれば、このディレクトリを基準としたサブディレクトリにファイルが出力されます。

**このディレクトリ以下のファイルを直接編集することは推奨されません。**

### `.tmp/`

開発用サーバーの起動中に一時的に必要になるファイルがこのディレクトリに出力されます。

**このディレクトリ以下のファイルを直接編集することは推奨されません。**

## HTML テンプレート

[`src/html/`](#srchtml)に配置されたファイルは、同じ階層を維持したままプロジェクトのルートディレクトリに対応付けされます。例えば`src/html/foo/bar.pug`は`/foo/bar.html`として出力されます。

ただし、`_`から始まるファイルおよびディレクトリは無視されます。

また、開発用サーバー起動中はリクエストされたファイルのみをコンパイルします。それによってファイル数の増大が開発中のビルド時間に影響しないようになっています。

### データファイル

テンプレート内では変数としてデータファイルの内容を参照できます。データファイルの種類には 2 つあり、単一ページのみに適用されるデータファイルと、全てのページに適用されるデータファイルがあります。規約に沿ったファイル名でファイルを作成することでデータを設定できます（[`data`](#data)と[`page`](#page)を参照してください）。

データファイルの形式としては、JavaScript、YAML、JSON をサポートしています。

形式が JavaScript であれば、テンプレート内で使用する値かその値を返す関数をエクスポートしてください。関数が Promise を返す場合は、解決後の結果がデータとして読み込まれます。

また関数をエクスポートした場合には`absPath`関数などのテンプレート用のオブジェクトが渡されます。詳しくは`config/siteGenerator/task.js`の`defaultLocals`変数を参照してください。

```js
// ok
module.exports = {
  title: 'Document title',
  post: {
    title: 'Post title',
  },
}

// ok
module.exports = (_locals) => {
  return {
    title: 'Document title',
    post: {
      title: 'Post title',
    },
  }
}

// ok
module.exports = async (_locals) => {
  const post = await fetchPost()
  return {
    title: 'Document title',
    post,
  }
}
```

内容はいずれのファイル形式であってもキャッシュされず、ファイルをコンパイルするたびに毎回読み込み直されます。

拡張子が`.js`、`.yml`、`.yaml`、`.json`の順に優先されます。

### 変数

テンプレートファイルではいくつかの変数を参照できます。

#### `data`

`src/html/_data/`直下のデータファイルは`data`変数に対応付けされます。`src/html/_data/meta.json`というデータファイルは、`data.meta`からその内容を参照できます。

#### `page`

テンプレートファイルと同じ名前のデータファイルを参照できます。テンプレートファイルが`src/html/page.pug`であれば、データファイルは`src/html/page.json`になります。

#### `page.path`

テンプレートファイル自身の出力先のパスを参照できます。`src/html/page.pug`は`/page.html`になります。また、`index.html`は省略可能なファイル名であるため、`src/html/index.pug`は`/`になります。

[サブディレクトリが指定](#サブディレクトリ)されていてもこの値に影響はありません。サブディレクトリを含めた絶対パスは`absPath(page.path)`で取得できます。

データファイルに`path`が指定されていればこの値で上書きされます。

#### `absPath(filePath)`

`filePath`をプロジェクトのルートディレクトリを基準とした絶対パスに変換します。

[サブディレクトリが指定](#サブディレクトリ)されていれば、`absPath('page.html')`は`/path/to/subdir/page.html`のようになります。

#### `assetPath(filePath)`

`filePath`を[アセットディレクトリ](#アセットディレクトリ)を基準とした絶対パスに変換します。`assetPath('ogp.png')`は`/assets/ogp.png`になります。

[サブディレクトリが指定](#サブディレクトリ)されていれば、`assetPath('ogp.png')`は`/path/to/subdir/assets/page.html`のようになります。

#### `__DEV__`

本番用ビルドが有効になっているかを判断できるフラグです。開発用サーバーが`--prod`フラグ無しで起動中のときには`false`になります。開発用サーバーを`--prod`フラグ付きで起動したときか、本番用ビルドを実行したときには`true`になります。

## 設定

### サブディレクトリ

プロジェクトがデプロイされる URL の基準になるディレクトリを指定できます。ルートディレクトリにデプロイされるのであれば指定の必要はありません。

npm-scripts の`start`コマンドおよび`build`コマンドに、`--subdir path/to/subdir`というように引数を追加することで指定できます。

```diff
  "scripts": {
-   "start": "gulp",
+   "start": "gulp --subdir path/to/subdir",
-   "build": "gulp build --prod"
+   "build": "gulp build --prod --subdir path/to/subdir"
  },
```

### アセットディレクトリ

コンパイル後の CSS ファイルや JavaScript ファイルが出力されるディレクトリを変更できます。デフォルトでは`/assets/`です。

`config/path.js`の`assetsPath`変数を次のように編集すると変更できます。

```js
// デフォルト
// `/assets/`
// `/path/to/subdir/assets/`
const assetsPath = path.join(basePath, 'assets')

// `/`
// `/path/to/subdir/`
const assetsPath = basePath

// `/assets/`
// `/assets/path/to/subdir/`
const assetsPath = path.join('assets', basePath)
```

### 独自フラグ

`config/flag.js`を編集してビルド用のフラグを追加できます。

```js
const isDev = !process.argv.includes('--prod')
const isStaging = process.argv.includes('--staging')

module.exports = {
  isDev,
  isStaging,
}
```

必要に応じて`config/siteGenerator/task.js`や`config/webpack.config.js`へ変数を渡すことで参照できるようになります。

### Server Side Includes

このプロジェクトで採用している Browsersync では Server Side Includes を有効にできます。`gulp-tasks/serve.js`を編集して、オプションの`rewriteRules`を次のように実装することで有効にできます。読み込む対象のファイルを`vendor-public/`に配置する場合の実装例です。

```js
const fs = require('fs')

const serve = (done) => {
  bs.init(
    {
      // ...
      rewriteRules: [
        {
          match: /<!--#include virtual="(.+?)" -->/g,
          fn(_req, _res, _match, filePath) {
            const srcFilePath = join(vendorPublicDir, filePath)

            if (
              fs.existsSync(srcFilePath) &&
              fs.statSync(srcFilePath).isFile()
            ) {
              return fs.readFileSync(srcFilePath, 'utf8')
            } else {
              return `<strong style="color: red">\`${srcFilePath}\` could not be found</strong>`
            }
          },
        },
      ],
      // ...
    },
    done,
  )
}
```

これにより次のようなディレクティブが有効になります。

<!-- prettier-ignore -->
```html
<body>
  <!--#include virtual="/includes/site-header.html" -->
  <main>
    ...
  </main>
  <!--#include virtual="/includes/site-footer.html" -->
</body>
```

### テンプレートエンジン

このプロジェクトでは HTML テンプレートのためのテンプレートエンジンに Pug を採用していますが、別のテンプレートエンジンに置き換えることもできます。

`config/siteGenerator/task.js`の`task`関数を変更して必要に応じたテンプレートエンジンに変更してください。

また`config/siteGenerator/index.js`の`inputExt`に拡張子が指定されています。使用するテンプレートエンジンに合わせた指定に変更してください。

### HTML の整形

テンプレートエンジンとして Pug を使用している場合、HTML ファイルは圧縮された状態で出力されます。出力される HTML ファイルを整形したければ、[JS Beautifier](https://github.com/beautify-web/js-beautify)などのフォーマッターを使用してください。

[gulp-jsbeautifier](https://github.com/tarunc/gulp-jsbeautifier)などのプラグインを`config/siteGenerator/task.js`の`task`関数の末尾に追加することでフォーマットできるようになります。

```js
const beautify = require('gulp-jsbeautifier')

const beautifyOpts = {
  indent_size: 2,
}

const task = (stream, handleError) => {
  return stream
    .pipe(data(readLocals))
    .on('error', handleError)
    .pipe(pug(pugOpts))
    .on('error', handleError)
    .pipe(beautify(beautifyOpts))
    .on('error', handleError)
}
```

## レシピ

### 差分納品

納品ファイルの差分を管理する必要があれば、[`dist/`](#dist)を Git にコミットするようにします。`.gitignore`を次のように変更してください。

```diff
# project build output
-/dist/
/.tmp/
```

リリースの毎に本番用ビルドを実行して、出力される`dist/`を Git にコミットします。このコミットに Git のタグを付けておくと参照しやすくなります。

前回のリリースと対応するコミットが`release-20180101`の場合、次のコマンドで追加・変更したファイルのみを Zip ファイルとして出力できます。

```bash
git archive --format=zip --prefix=htdocs/ HEAD:dist `git diff --diff-filter=ACMR --name-only release-20180101 HEAD | grep "^dist/" | sed -e "s/dist\///"` > htdocs.zip
```

削除したファイルリストは次のコマンドで出力できます。

```bash
git diff release-20180101 --name-only --diff-filter=D | grep "^dist" | sed -e "s/dist\///" > deleted-files.txt
```
