# neec-chat 2022年度版
日本工学院八王子専門学校 ゲームクリエイター科の実習用リポジトリのです。Socket.ioの実習として簡易的なチャットを作成します。

## インストール
### 環境の準備
Node.jsのLTS版をインストールします。<br>
https://nodejs.org/ja/

Node.jsをインストールすることで`node`, `npm`の2つのコマンドが利用可能になります。実際にPowerShellなどで確認してください。

### コードの準備
GitHubからクローン（もしくはZipファイルをダウンロード）し、必要なモジュールをインストールします。
```shellsession
$ git clone https://github.com/katsube/neec-chat-2022.git
```

先ほど準備したフォルダに入り、`npm install`で必要なモジュールをインターネット経由で取得します。必要なモジュールはファイル`pachakge.json`内の`dependencies`の部分に定義されています。
```shellsession
$ cd neec-chat-2022
$ npm install
```

## 実行方法
nodeコマンドを利用しサーバを起動します。
```shellsession
$ node serve.js
```

HTTPサーバが3000番で起動しますので、Webブラウザから`http://localhost:3000`へアクセスします。

## License
The MIT License<br>
Copyright 2022 M.Katsube <katsubemakito@gmail.com>
