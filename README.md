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
- HTMLテンプレートの開発をサポート
  - サイト固有の変数の管理
  - ページのパスの解決
  - [ファイル数が増えても開発時のビルド時間が増大しない仕組み](https://github.com/yuheiy/real-world-website-render-helper)
- 管理しやすいディレクトリ構成

## 目次

- [推奨環境](#推奨環境)
- [ディレクトリ構成](#ディレクトリ構成)
- [開発準備](#開発準備)
- [プロジェクト設定](#プロジェクト設定)
- [`pre-commit`フック](#pre-commit%E3%83%95%E3%83%83%E3%82%AF)
- [`public/`ディレクトリ](#public%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA)
- [`root-public/`ディレクトリ](#root-public%E3%83%87%E3%82%A3%E3%83%AC%E3%82%AF%E3%83%88%E3%83%AA)
- [HTMLテンプレート](#html%E3%83%86%E3%83%B3%E3%83%97%E3%83%AC%E3%83%BC%E3%83%88)
- [CSS](#css)
- [JavaScript](#javascript)
- [対象ブラウザ](#対象ブラウザ)
- [Server Side Includes](#server-side-includes)
- [本番用ビルド](#本番用ビルド)
- [ステージングサーバーへのデプロイ](#ステージングサーバーへのデプロイ)
- [差分管理](#差分管理)
- [参考](#参考)

## 推奨環境

- Mac OS X
- [Node.js](https://nodejs.org/ja/) 8.9以降
- [Yarn](https://yarnpkg.com/lang/ja/)
- [EditorConfig](http://editorconfig.org/)およびPrettierをサポートするエディタ

## ディレクトリ構成

```bash
.
├── dist/                           # ビルド時にファイルが生成されるディレクトリ
│   └── path/to/project/
│       └── assets/
│           ├── css/
│           │   └── main.css
│           ├── img/
│           │   └── logo.svg
│           ├── js/
│           │   └── main.js
│           ├── about.html
│           ├── index.html
│           └── pub.html
├── public/                         # コピーされるだけのファイルを格納
│   ├── assets/
│   │   └── img/
│   │       └── logo.svg
│   └── pub.html
├── root-public/                    # 開発時のみ必要なファイルを格納
├── src/                            # コンパイルなどの処理を行うファイル
│   ├── css/                        # CSSの元ソースを格納
│   │   ├── components/
│   │   ├── globals/
│   │   ├── _base.scss
│   │   └── main.scss               # CSSのエントリーポイント
│   ├── html/                       # HTMLの元ソースを格納
│   │   ├── _data/                  # テンプレート全体から参照できるデータ
│   │   ├── _extends/
│   │   ├── _includes/
│   │   ├── about.pug
│   │   ├── about.yml
│   │   ├── index.pug               # HTMLのページに対応するファイル
│   │   └── index.yml               # 対応するページファイルからのみ参照できるデータ
│   └── js/                         # JavaScriptの元ソースを格納
│       ├── components/
│       ├── main.js                 # JavaScriptのエントリーポイント
│       └── polyfill.js
├── task/                           # 開発用タスクで利用するスクリプトを格納
├── tmp/                            # 開発時に一時的に生成されるディレクトリ
│   └── path/to/project/
│       └── assets/
│           ├── css/
│           │   ├── main.css
│           │   └── main.css.map
│           └── js/
│               ├── main.js
│               └── main.js.map
├── package.json
└── realworld.config.js             # プロジェクト設定
```

## 開発準備

最新版のボイラープレートを取得し、依存パッケージをインストールします。

```bash
git clone https://github.com/yuheiy/real-world-website-boilerplate.git my-web/
cd my-web/
rm -rf .git/
yarn install
```

次のコマンドを実行することで、開発サーバーが起動します。

```bash
yarn start
```

## プロジェクト設定

ウェブサイトのURLに合わせて、次のように設定を記述します。

`realworld.config.js`:

```javascript
// ルート直下の場合
module.exports = {
  baseUrl: 'http://example.com',
}
```

```javascript
// サブディレクトリの場合
module.exports = {
  baseUrl: 'http://example.com/path/to/project',
  basePath: '/path/to/project',
}
```

サブディレクトリのパスを設定した場合、開発サーバーが同じパスで起動します。また、ビルド時は、`dist/path/to/project/`のようなディレクトリにファイルが生成されます。

## `pre-commit`フック

[husky](https://github.com/typicode/husky)を利用してコミット前に自動的にコードのフォーマットが実行されるようになっています。

## `public/`ディレクトリ

コンパイルなどの処理を行わないファイルを配置します。

`public/favicon.ico`というファイルの場合、開発サーバーから`/favicon.ico`というパスで参照できます。ビルド時は`dist/favicon.ico`にコピーされます。

サブディレクトリが設定されていた場合、開発サーバーから`/path/to/project/fabicon.ico`というパスで参照できます。ビルド時は`dist/path/to/project/favicon.ico`にコピーされます。

画像ファイルはこのディレクトリに配置することを想定しています。画像の最適化をビルドに組み込むと、ビルド時間がかかり過ぎてしまう上、OSなどの要因によって処理が不安定になる可能性があるためです。

ドットから始まるファイルをコピーする場合は、次のように設定を追加します。

`gulpfile.js`:

```js
const copy = () => {
  return gulp.src('public/**/*', { dot: true }).pipe(gulp.dest(destBaseDir))
}
```

## `root-public/`ディレクトリ

開発時のみ必要で、ビルド時は`dist/`ディレクトリにコピーしたくないファイルを配置します。

`root-public/common.css`というファイルの場合、開発サーバーからは`/common.css`というパスで参照できます。**サブディレクトリが設定されていても参照できるパスは同じです。**

## HTMLテンプレート

テンプレートエンジンとしてPugを採用しています。

通常、開発するファイルは`src/html`ディレクトリに配置します。その場合、テンプレートのファイル名とディレクトリ構造は維持されたままビルドされます。

`src/html/index.pug`の場合、開発サーバーから`/index.html`というパスで参照できます。ビルド時は`dist/index.html`にコピーされます。

サブディレクトリが設定されていた場合、開発サーバーから`/path/to/project/index.html`というパスで参照できます。ビルド時は`dist/path/to/project/index.html`にコピーされます。

テンプレートファイルと同じファイル名のデータファイルを作成することで、そのテンプレートからのみ参照できるデータを設定することができます。データファイルはYAMLおよびJSONに対応しています。`src/html/index.pug`の場合、`src/html/index.yml`を参照します。データファイルは拡張子が`.yml`、`.json`の順に優先されます。`.yaml`は無視されます。

`_`から始まるファイルおよびディレクトリは個別に出力されません。テンプレートからインクルードして利用することを想定しています。

また、`src/html/_data/`ディレクトリは特別なディレクトリです。このディレクトリの直下に配置したデータファイルは、`file`変数にマッピングされ、全てのテンプレートから利用できるようになります。

### 有効な変数

テンプレートからいくつかのデータを利用できます。

#### `page`

テンプレートファイルと同名のデータファイルを参照できます。

また、`page.path`からページのパスを参照できます。`src/html/about.pug`の場合は`/about.html`になり、`src/html/index.pug`の場合は`index.html`が省略されて`/`になります。なお、データファイルに`path`フィールドが含まれていた場合はデータファイルの値は上書きされます。

#### `file`

`src/html/_data/`ディレクトリ直下のデータファイルを参照できます。

`src/html/_data/siteNavigation.yml`というファイルを作成した場合、ファイルのデータを`file.siteNavigation`から参照できます。

#### `__DEV__`

環境設定を参照できます。開発時は`true`になり、ビルド時は`false`になります。

#### `absPath(pagePath)`

ページのパスを与えると絶対パスを生成します。サブディレクトリの場合のパス解決をすることを目的としています。

ルート直下の場合、`absPath('about.html')`は`/about.html`になります。サブディレクトリの場合は`/path/to/subdir/about.html`になります。

`absPath(page.path)`のようにすることでページ自身への絶対パスを生成します。

#### `assetPath(pagePath)`

`assets/`ディレクトリから見たパスを与えると絶対パスを生成します。

ルート直下の場合、`assetPath('img/logo.svg')`は`/assets/img/logo.svg`になります。サブディレクトリの場合は`/path/to/subdir/assets/img/logo.svg`になります。

#### `absUrl(pagePath)`

ページのパスを与えると絶対URLを生成します。

ルート直下の場合、`absUrl('about.html')`は`http://example.com/about.html`になります。サブディレクトリの場合は`http://example.com/path/to/subdir/about.html`になります。

## CSS

`src/css/main.scss`をエントリーポイントとして、`assets/css/main.css`へ向けてビルドします。

`src/css/components/`ディレクトリの全てのファイルを自動で読み込むようになっています。

## JavaScript

`src/js/main.js`をエントリーポイントとして、`assets/js/main.js`へ向けてビルドします。

`__DEV__`という変数から環境設定を参照できます。開発時は`true`になり、ビルド時は`false`になります。

## 対象ブラウザ

ビルド時に対象とするブラウザを設定します。記述方法は[Browserslist](https://github.com/ai/browserslist)のドキュメントを参照してください。

デフォルト設定は次のようになっています。

`.browserslistrc`:

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

なお、[IE10以下をサポートする場合、Babelで問題が発生することがあります。](https://babeljs.io/docs/usage/caveats/)

## Server Side Includes

開発用サーバーでServer Side Includesを利用したい場合、Browsersyncのオプションである`rewriteRules`を設定することで有効になります。

読み込む外部ファイルを`root-public/`ディレクトリに配置する場合、次のような実装によって実現できます。

`gulpfile.js`:

```javascript
const serve = (done) => {
  const fs = require('fs')

  browserSync.init(
    {
      // 省略
      rewriteRules: [
        {
          match: /<!--#include virtual="(.+?)" -->/g,
          fn(_req, _res, _match, filePath) {
            const srcFilePath = path.join('root-public', filePath)

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
      // 省略
    },
    done,
  )
}
```

## 本番用ビルド

次のコマンドを実行することで、本番用にビルドされたファイルが`dist/`ディレクトリに出力されます。

```bash
yarn build
```

## ステージングサーバーへのデプロイ

`root-public/`ディレクトリのファイルは、ビルド時に`dist/`ディレクトリに含まれません。ステージングサーバーなどにデプロイする場合は、`dist/`ディレクトリおよび`root-public/`ディレクトリの両方のファイルをコピーしてください。

## 差分管理

### 準備

もし、納品ファイルの差分を管理する必要がある場合、`dist/`ディレクトリをGitにコミットします。加えて、ビルドで生成されるファイルとコミットを対応させるために、コミットごとにビルドを実行する設定をします。

#### ビルドによる生成ファイルをコミットさせる

`dist/`ディレクトリを除外しないように変更します。

`.gitignore`:

```diff
/yarn-error.log*

-/dist/
/tmp/
```

#### コミット前にビルドを実行させる

プリコミットフックにビルドコマンドを追加します。

`package.json`:

```diff
  "scripts": {
    "start": "gulp",
    "build": "gulp build",
-   "precommit": "pretty-quick --staged"
+   "precommit": "pretty-quick --staged && yarn build && git add dist/"
  },
```

### 差分ファイルZIPの生成

次の手順に沿って、差分ファイルをZIPとして生成するコマンドを追加できます。

#### スクリプトを追加

差分ファイルをZIPとして生成するためのスクリプトを追加します。

`task/archive.js`:

```javascript
// Usage:
// $ node task/archive.js <start-commit> [<end-commit>]
const path = require('path')
const fs = require('fs')
const cp = require('child_process')
const makeDir = require('make-dir')
const archiver = require('archiver')

const ARCHIVE_DIR = 'archive'
const FILE_PATH_PREFIX = 'dist/'

const args = process.argv.slice(2)
const startCommit = args[0]
const endCommit = args[1] || 'HEAD'

const getDateString = () => {
  const d = new Date()
  return (
    String(d.getFullYear()).padStart(4, 0) +
    String(d.getMonth() + 1).padStart(2, 0) +
    String(d.getDate()).padStart(2, 0) +
    String(d.getHours()).padStart(2, 0) +
    String(d.getMinutes()).padStart(2, 0) +
    String(d.getSeconds()).padStart(2, 0) +
    String(d.getMilliseconds()).padStart(3, 0)
  )
}

const git = (...args) => cp.execFileSync('git', [...args])

const archive = () => {
  makeDir.sync(ARCHIVE_DIR)

  const zip = archiver('zip')
  zip.on('error', (err) => {
    throw err
  })

  const archiveFilePath = path.resolve(ARCHIVE_DIR, `htdocs-${getDateString()}.zip`)
  const output = fs.createWriteStream(archiveFilePath)
  output.on('close', () => {
    console.log(`${zip.pointer()} total bytes`)
    console.log(
      'archiver has been finalized and the output file descriptor has closed.',
    )
  })
  zip.pipe(output)

  const changedFilePaths = String(
    git('diff', '--diff-filter=AMCR', '--name-only', startCommit, endCommit),
  )
    .split('\n')
    .filter((filePath) => filePath.startsWith(FILE_PATH_PREFIX))
  changedFilePaths.forEach((filePath) => {
    const resolvedFilePath = path.resolve(filePath)
    zip.append(fs.createReadStream(resolvedFilePath), {
      name: filePath.replace(FILE_PATH_PREFIX, ''),
      mode: fs.statSync(resolvedFilePath).mode,
    })
  })

  zip.finalize()
}

archive()
```

#### 依存パッケージを追加

スクリプトが依存しているパッケージを追加します。

```bash
yarn add --dev archiver make-dir
```

#### npm-scriptsに設定

スクリプトをnpm-scriptsとして実行できるように設定します。

`package.json`:

```diff
  "scripts": {
+   "archive": "node task/archive.js",
    "start": "gulp",
    "build": "gulp build",
    "precommit": "pretty-quick --staged && yarn build && git add dist/"
  },
```

#### 生成されるZIPファイルをGitから除外

`archive/`ディレクトリをGitから除外するように変更します。

`.gitignore`:

```diff
/yarn-error.log*

/tmp/
+/archive/
```

#### 使い方

次のコマンドによってZIPファイルを生成します。

```bash
yarn archive <start-commit> [<end-commit>]
```

`start-commit`には、差分を検出する基準になるコミットを指定します。例えば、前回リリース時のコミットです。

`end-commit`には、ZIPファイルに含める最新のコミットを指定します。省略した場合は`HEAD`になります。

### 差分ファイルリスト

Todo

## 参考

開発サーバーの仕組みは『[watch 時のビルドをもっと速くしたい](https://speakerdeck.com/ktsn/watch-shi-falsebirudowomotutosu-kusitai)』を参考にしています。
