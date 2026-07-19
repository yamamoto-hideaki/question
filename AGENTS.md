# AGENTS.md

## プロジェクト概要
このリポジトリは、日本語の HTML 問題を出題する小規模な静的クイズアプリです。ブラウザ上で直接動作し、HTML・CSS・JavaScript だけで構成されています。

## 主要ファイル
- [index.html](index.html): 画面構造、クイズ用コンテナ、ボタンの定義。
- [script.js](script.js): クイズのロジック、問題表示、解答判定、得点計算、結果表示。
- [questions.json](questions.json): 問題データのソース。内容変更は基本的にここで行う。
- [style.css](style.css): クイズ UI の見た目を定義するスタイルシート。
- [qrcode.html](qrcode.html): QR 関連の出力用の補助ページ。
- [question.xlsm](question.xlsm): 問題の元データとなる表計算ファイル。実行時には未使用。

## 開発上の作法
- アプリは静的でブラウザ実行中心の構成です。ビルド手順やパッケージ管理の設定はありません。
- [index.html](index.html) と [script.js](script.js) で使う DOM ID は維持してください。ID を変更した場合は両方を更新しないと動作しません。
- [questions.json](questions.json) の内容は有効な JSON である必要があります。
- クイズは `radio`、`checkbox`、`fill-in` の 3 種類をサポートしています。新しい種類を追加する場合は、データ処理と UI ロジックの両方を [script.js](script.js) で対応させてください。
- 現在の UI 文言は日本語中心なので、新しいユーザー向けの文言も基本的に日本語で統一してください。

## 変更時のガイド
- 問題内容を更新する場合は、[script.js](script.js) に直接書き込むより [questions.json](questions.json) を編集する方針を優先してください。
- [index.html](index.html) のフォーム構造を変えた場合は、[script.js](script.js) 内の関連セレクタや要素参照がまだ一致するか確認してください。
- 得点や合否判定を変える場合は、既存の点数体系と合格基準と整合するようにしてください。

## 確認方法
- [index.html](index.html) をブラウザで開き、UI とクイズの流れを確認してください。
- JSON を変更した場合は、必ず有効な JSON であることを確認してからテストしてください。
- JavaScript を変更した場合は、構文エラーがないか確認し、クイズの流れを最後まで実際に試して確認してください。
- 可能であれば、次のような簡易チェックも行ってください: `node --check script.js` と `python -c "import json,sys; json.load(open('questions.json', encoding='utf-8'))"`。
