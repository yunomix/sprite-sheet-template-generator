# スプライトシートテンプレートジェネレータ

## プロジェクト構造

  sprite-sheet-template-generator/
  ├── index.html           # メインHTML
  ├── package.json         # npm設定
  ├── tsconfig.json        # TypeScript設定
  ├── vite.config.ts       # Vite設定
  ├── build.sh             # ビルドスクリプト
  ├── dev.sh               # 開発サーバー起動スクリプト
  ├── .gitignore
  └── src/
      ├── main.ts           # メインアプリケーション
      ├── styles.css        # スタイルシート
      ├── imageProcessor.ts # 画像処理の抽象化レイヤー
      ├── templateGenerator.ts # テンプレート生成機能
      └── autoAdjuster.ts   # 自動調整機能

 ## 実装機能

  1. テンプレート生成: 16タイル/47タイル形式の選択、タイルサイズ・パディング・オフセット・色・外周太さの設定
  2. プレビュー表示: グリッド線付きのリアルタイムプレビュー
  3. テンプレート保存: 透過PNGとしてダウンロード
  4. スプライトシート読み込み: 画像ファイルの読み込み
  5. 自動調整: タイル境界検出と位置・サイズの自動調整
  6. 調整済み画像保存: 透過PNGとしてダウンロード

  使用方法

  ### 依存関係インストール
  npm install

  ### 開発サーバー起動
  ./dev.sh  または npm run dev

  ### ビルド
  ./build.sh  または npm run build

