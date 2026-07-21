# Google Workspace × 生成AI ＆ Antigravity 自動連携ガイド (Workspace Integration)

本ガイドは、Google Workspace（Gmail, Drive, Docs, Sheets, Slides）とAIエージェントを自動連携（Integration）させ、日常業務を全自動化するためのアーキテクチャおよび連携手順マニュアルです。

---

## 1. 連携の全体アーキテクチャ

```
[Google Workspace (Gmail / Sheets / Docs)]
                    │
                    ▼ (GAS API / Webhook)
[Google Apps Script (gas_workspace_toolkit.js)]
                    │
                    ▼ (OAuth2 / Secure Token)
[Antigravity / 生成AIエンジン] ──> [自動処理 ＆ スマホ通知 (Mobile)]
```

---

## 2. モジュール別 機能と設定

### ① Gmail連携 (メール要約 ＆ 返信下書き自動作成)
- 新着メールの本文を取得し、AIが要約。返信案をGmailの「下書き（Drafts）」に保存し、スマホ宛てに通知を送信。

### ② Google Sheets連携 (データ自動分析)
- スプレッドシートの指定範囲のデータを読み込み、データ分析・要約テキストを別シートまたはメールへ自動出力。

### ③ Google Docs / Slides連携 (AI成果物の自動ドキュメント/スライド生成)
- AIが生成したテキストやプレゼン構成を、GoogleドキュメントやスライドのAPI経由で綺麗な装飾付きファイルとして新規作成。
