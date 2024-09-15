# ユドナリウムバックエンド

ユドナリウムバックエンド（Udonarium-Backend）は、[ユドナリウム（Udonarium）][udonarium-repo]のバックエンド処理を行うアプリケーションです。

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)][License-url]

## 目次

- [機能](#機能)
- [サーバ設置](#サーバ設置)
- [開発者クイックスタート](#開発者クイックスタート)
- [開発に寄与する](#開発に寄与する)
- [License](#license)

## 機能

- **バックエンド機能、Web API**  
  - フロントエンドでは実装できない処理をバックエンドのWeb APIとして処理
  - [SkyWay][SkyWay-url]にアクセスするための認証トークン（SkyWay Auth Token）の発行

- **可能な限りデプロイする環境を選択可能にする**  
  - [Cloudflare Workers](https://www.cloudflare.com/ja-jp/developer-platform/workers/)
  - [AWS Lambda](https://aws.amazon.com/lambda/)
  - [Node.js](https://nodejs.org/)（ユーザ自身のサーバへのデプロイ等）

## サーバ設置

ユーザ自身で実行環境を用意し、その環境にユドナリウムバックエンドを設置して動作させることができます。  
以下では[Cloudflare Workers](https://dash.cloudflare.com/)に設置する例を説明します。

#### 1. WebブラウザからCloudflare Workersにjsファイルをデプロイ

ユドナリウムバックエンドの[リリース版（**udonarium-backend.zip**）](../../releases/latest)をダウンロードして展開し、`cloudflare-workers/index.js`を取得します。

[Cloudflare](https://dash.cloudflare.com/login)にアカウントを作成します。  
WebブラウザからCloudflareダッシュボードにログインし、[ダッシュボードから新しいWorkerを作成](https://developers.cloudflare.com/workers/get-started/dashboard/#setup)します。  
[WebブラウザからWorkerのコードを編集](https://developers.cloudflare.com/workers/get-started/dashboard/#dashboard)して前述の`index.js`のコードを反映・デプロイします。

#### 2. 環境変数の設定

Workerの設定ページからユドナリウムバックエンドで使用する環境変数を設定します。  
[SkyWay][SkyWay-url]のアカウントでアプリケーション作成し、必要な情報を取得してください。

- `SKYWAY_APP_ID`  
[SkyWay][SkyWay-url]から発行されたアプリケーションID。

- `SKYWAY_SECRET`  
[SkyWay][SkyWay-url]から発行されたシークレットキー。

- `ACCESS_CONTROL_ALLOW_ORIGIN`  
このWeb APIを利用する[ユドナリウム][udonarium-repo]のOrigin（URL）。設定したOrigin以外からのAPIリクエストは拒否されます。

```ini
# Example
SKYWAY_APP_ID = "aaaaaaaa-bbbb-4ccc-1234-xxxxxxxxxxxx"
SKYWAY_SECRET = "ab12....<中略>...="
ACCESS_CONTROL_ALLOW_ORIGIN = "https://your-udonarium-domain/"
```

#### 3. ユドナリウムにWorkerのURLを設定

[ユドナリウム][udonarium-repo]の`config.yaml`を編集し、`backend.url`の項目にWorkerのURLを記述します。

```yaml
backend:
  mode: skyway2023
  url: https://your-worker-name.xxxxxxxx.workers.dev/ # Example Cloudflare Workers URL
...
```

ユドナリウムにWebブラウザからアクセスしてエラーが発生しなければ完了です。

## 開発者クイックスタート

開発環境を用意するとソースコードの修正や機能追加を行うことができます。

### 開発環境

[Node.js](https://nodejs.org/)と[npm](https://www.npmjs.com/)が必要です。

開発言語はTypeScriptを使用し、[Hono](https://hono.dev/)のフレームワークで実装されています。  
リポジトリは[npm workspaces](https://github.com/npm/rfcs/blob/main/implemented/0026-workspaces.md)によるMonorepoになっており、ディレクトリ構成は以下の通りです。

- `packages/backend/*`: 各バックエンド環境ごとのコードがパッケージに実装されています。
- `packages/shared/*`: 共通で使用するコードがパッケージに実装されています。

#### バックエンド固有のCLIツールなど

バックエンド環境ごとに開発を効率化するCLIツールが存在する場合があります。  
例えば、

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)では[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)を利用します。
- [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)では[AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)を利用します。

バックエンド環境のツールの設定やインストール方法については、それぞれの公式ドキュメントを参照してください。

#### SkyWay

[SkyWay][SkyWay-url]の認証トークン（SkyWay Auth Token）を発行するためにはSkyWayのアプリケーション情報が必要です。

### Cloudflare Workers用コードの実行

Cloudflare Workers用のコードは`packages/backend/cloudflare-workers/`配下の`@udonarium-backend/cloudflare-workers`パッケージとして構成されています。  

このパッケージ自体に実装コードはほとんどありません。  
ユドナリウムバックエンドとしての主な機能は`packages/shared/core/`の`@udonarium-backend/core`の依存関係から使用します。

リポジトリをダウンロードした後、初回はリポジトリのディレクトリで以下のコマンドを実行してください。

```bash
npm i
```

#### 開発用ローカルサーバ

開発作業を行う際には、`wrangler.toml`を編集してユドナリウムバックエンドの環境変数を設定してください。  
`.dev.vars`を[作成して利用する](https://developers.cloudflare.com/workers/wrangler/configuration/#secrets)方法もあります。  
**※注意：wrangler.tomlや.dev.varsに記述した環境変数はGitにコミットしないでください。セキュリティリスクになります。**

リポジトリのルートディレクトリで以下のコマンドを実行すると`https://localhost:8787/`で開発用ローカルサーバを起動できます。

```bash
npm run cloudflare-workers:dev
```

#### 本番環境へのデプロイ

以下のコマンドで[本番環境へのデプロイを開始](https://developers.cloudflare.com/workers/get-started/guide/#4-deploy-your-project)します。  
表示される内容に従ってCloudflare Workersのデプロイ設定を行ってください。

```bash
npm run cloudflare-workers:deploy
```

## 開発に寄与する

バグを報告したり、ドキュメントを改善したり、開発の手助けをしたりしたいですか？

報告や要望の窓口として[GitHubのIssue](https://github.com/TK11235/udonarium-backend/issues)、または[X（Twitter）](https://x.com/TK11235)を利用できます。  
コードの[Pull Request](https://github.com/TK11235/udonarium-backend/pulls)も歓迎です。

ただ、難易度や優先度の都合によりそっとしたままになる可能性があります。

### 報告

バグ報告では、バグを再現できる必要十分な条件について、分かっている範囲で詳しく書いてください。  
基本的には「報告を受けて改修 → 次回更新時に反映」の流れで対応する予定です。

### 要望

機能要望では「何故それが必要なのか」について説明があると良いです。

### Pull Request

作成したコードやドキュメントをこのリポジトリに反映させたい時はPull Request（PR）を送ってください。

PRのコードが完全ではない場合でも作業中PRとして送ることができます。  
その場合、作業中である旨をPRタイトルか説明文に付け加えてください。

## License

[MIT License][License-url]

[udonarium-repo]: https://github.com/TK11235/udonarium
[SkyWay-url]: https://skyway.ntt.com/
[License-url]: https://github.com/TK11235/udonarium-backend/blob/master/LICENSE
