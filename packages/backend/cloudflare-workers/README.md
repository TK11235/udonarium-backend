# @udonarium-backend/cloudflare-workers

ユドナリウムバックエンドをCloudflare Workersで動作させるパッケージです。

## 開発者クイックスタート

### 環境設定ファイルの準備

`wrangler.toml`ファイルを編集して環境変数を設定してください。  
または、`.dev.vars`を[作成](https://developers.cloudflare.com/workers/wrangler/configuration/#secrets)してください。  
**※注意：wrangler.tomlや.dev.varsに記述した環境変数はGitにコミットしないでください。セキュリティリスクになります。**

### 依存パッケージのインストール

```bash
cd /your/download/directory/for/udonarium-backend
npm i
```

### 開発用ローカルサーバの開始

```bash
npm run cloudflare-workers:dev
```

### デプロイ

```bash
npm run cloudflare-workers:deploy
```
