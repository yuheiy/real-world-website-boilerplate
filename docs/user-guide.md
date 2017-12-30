# ユーザーガイド

## 目次

- [HTMLテンプレート](#htmlテンプレート)
- [対象ブラウザの設定](#対象ブラウザの設定)
- [ステージング環境へのデプロイ](#ステージング環境へのデプロイ)
- [SSI](#ssi)
- [差分納品](#差分納品)

## HTMLテンプレート

`src/html/`ディレクトリのファイルは、同じ階層で`dist/`ディレクトリのプロジェクトルートに出力されます。`_`から始まるファイル、またはディレクトリは個別に出力されません。

`src/html/`ディレクトリのYAMLファイル及びJSONファイルは、HTMLテンプレートから参照できます。`src/html/_data`ディレクトリのファイルは全てのHTMLテンプレートから、HTMLテンプレートと同名のデータファイルは対応するファイルからのみ参照できます。同名のデータファイルは`.yml`、`.yaml`、`.json`の順に優先されます。

### 有効な変数

#### `isProd`

開発時は`false`、本番向けビルド時は`true`になります。

#### `absPath(pagePath)`

`pagePath`にプロジェクトルートからのパスを与えると、絶対パスが返ります。

例：`absPath('about.html')` => `/path/to/project/about.html`

#### `assetPath(pagePath)`

`pagePath`に`<project-root>/assets/`ディレクトリからのパスを与えると、絶対パスが返ります。

例：`assetPath('img/logo.svg')` => `/path/to/project/assets/img/logo.svg`

#### `absUrl(pagePath)`

`pagePath`にプロジェクトルートからのパスを与えると、絶対URLが返ります。

例：`absUrl('about.html')` => `http://example.com/path/to/project/about.html`

#### `file`

`src/html/_data/`ディレクトリ直下のYAMLファイルを参照できます。`src/html/_data/test.yml`の場合、`file.test`から参照できます。

#### `page`

テンプレートファイルと同名のYAMLファイルを参照できます。`src/html/about.pug`の場合、`src/html/about.yml`を参照できます。

`page.path`からプロジェクトルートからのパスを参照できます。`src/html/about.pug`の場合、`/about.html`になり、`src/html/index.pug`の場合、`/`になります。

## 対象ブラウザの設定

ビルドの対象にするブラウザを`.browserslistrc`に設定します。[Browserslist](https://github.com/ai/browserslist)を利用しています。

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

次のモジュールから参照されます。

- [Autoprefixer](https://github.com/postcss/autoprefixer)
- [babel-preset-env](https://github.com/babel/babel-preset-env)

[IE10以下をサポートする場合、Babelで問題が発生することがあります。](https://babeljs.io/docs/usage/caveats/)

## ステージング環境へのデプロイ

`yarn build`を実行すると本番向けにビルドされたファイルが`dist/`ディレクトリに出力されます。`vendor-public/`ディレクトリのファイルは含まれません。

ステージング環境などにデプロイする場合は、`dist/`ディレクトリと`vendor-public/`ディレクトリのファイルをコピーしてください。

## SSI

`vendor-public/`ディレクトリのファイルは開発用サーバーから参照できます。共通ヘッダーや共通CSSのファイルを配置して利用できます。

開発用サーバーでSSIを利用したい場合は、`gulpfile.babel.js`に以下の設定を追加します。

```javascript
const serve = (done) => {
    browserSync.init(
        {
            // 省略
            rewriteRules: [
                {
                    match: /<!--#include virtual="(.+?)" -->/g,
                    fn(_req, _res, _match, file) {
                        const includeFile = path.join("vendor-public", file);
                        if (fs.existsSync(includeFile) && fs.statSync(includeFile).isFile()) {
                            return fs.readFileSync(includeFile, "utf8");
                        } else {
                            return `<span style="color: red">\`${includeFile}\` could not be found</span>`;
                        }
                    },
                },
            ],
            // 省略
        },
        done,
    );
};
```

## 差分納品

### 差分管理

納品ファイルの差分を管理するために、`dist/`ディレクトリをGitで管理します。また生成ファイルをコミットと対応させるために、コミットごとにビルドを実行する設定にします。

#### `dist/`ディレクトリをGitに追加

`.gitignore`から`/dist`を取り除く。

```diff
/node_modules
/tmp
-/dist
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

#### `package.json`に`precommit`フックを追加

```diff
  "scripts": {
    "start": "gulp",
    "build": "gulp build",
-   "precommit": "lint-staged"
+   "precommit": "lint-staged && npm run build && git add dist/"
  },
```

### 差分ファイルZip

次の手順に沿って差分納品Zipを生成する仕組みを追加できます。

#### 依存モジュールをインストール

```bash
yarn add --dev archiver
```

#### `task/archive.js`を追加

```javascript
const path = require("path");
const fs = require("fs");
const cp = require("child_process");
const makeDir = require("make-dir");
const archiver = require("archiver");

const ARCHIVE_DIR = "archive";
const FILE_PATH_PREFIX = "dist/";

const args = process.argv.slice(2);
const startCommit = args[0];
const endCommit = args[1] || "HEAD";

const getDateString = () => {
    const d = new Date();
    return (
        String(d.getFullYear()).padStart(4, 0) +
        String(d.getMonth() + 1).padStart(2, 0) +
        String(d.getDate()).padStart(2, 0) +
        String(d.getHours()).padStart(2, 0) +
        String(d.getMinutes()).padStart(2, 0) +
        String(d.getSeconds()).padStart(2, 0) +
        String(d.getMilliseconds()).padStart(3, 0)
    );
};

const git = (...args) => cp.execFileSync("git", [...args]);

const archive = () => {
    makeDir.sync(ARCHIVE_DIR);

    const zip = archiver("zip");
    zip.on("error", (err) => {
        throw err;
    });

    const archiveFile = path.resolve(ARCHIVE_DIR, `htdocs-${getDateString()}.zip`);
    const output = fs.createWriteStream(archiveFile);
    output.on("close", () => {
        console.log(`${zip.pointer()} total bytes`);
        console.log("archiver has been finalized and the output file descriptor has closed.");
    });
    zip.pipe(output);

    const changedFiles = String(
        git("diff", "--diff-filter=AMCR", "--name-only", startCommit, endCommit),
    )
        .split("\n")
        .filter((file) => file.startsWith(FILE_PATH_PREFIX));
    changedFiles.forEach((file) => {
        const resolvedFile = path.resolve(file);
        zip.append(fs.createReadStream(resolvedFile), {
            name: file.replace(FILE_PATH_PREFIX, ""),
            mode: fs.statSync(resolvedFile).mode,
        });
    });

    zip.finalize();
};

archive();
```

#### `package.json`に`archive`スクリプトを追加

```diff
  "scripts": {
+   "archive": "node task/archive.js",
    "start": "gulp",
    "build": "gulp build",
    "precommit": "lint-staged"
  },
```

#### `archive/`ディレクトリをGitから除外

```diff
/node_modules
/tmp
+/archive
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

#### 使い方

次のコマンドで差分ファイルZipを生成します。

```bash
yarn archive <start-commit> [<end-commit>]
```

`<start-commit>`に前回納品時のコミット、`<end-commit>`に納品データに含める最新のコミットを指定します。`<end-commit>`を省略すると`HEAD`になります。

### 差分ファイルリスト

todo...
<!--
https://gist.github.com/yuheiy/28b8441a146c987b4514ce2da32ce8b1

 ```bash
yarn filelist <start-commit> [<end-commit>]
```
 -->
