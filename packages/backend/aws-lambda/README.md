# @udonarium-backend/aws-lambda

ユドナリウムバックエンドをAWS Lambdaで動作させるパッケージです。

**注意：このパッケージの実装は最低限のものです。**  
AWS CLIを使用した簡易的なコードとして実装されています。  
AWS CDKを利用してデプロイなどを行いたい場合は[Honoのドキュメント](https://hono.dev/docs/getting-started/aws-lambda)を参考にしてみて下さい。

## 開発者クイックスタート

### 環境設定ファイルの準備

`.env.example`ファイルをコピーして`.env`ファイルを作成し、環境変数を設定してください。

### 依存パッケージのインストール

```bash
cd /your/download/directory/for/udonarium-backend
npm i
```

### デプロイ

```bash
npm run aws-lambda:deploy
```

※Windows環境では`zip`コマンドが使用できないため`npm run zip`を実行するとエラーになります。zipファイル作成を手動で行うなど代替策を検討して下さい。
