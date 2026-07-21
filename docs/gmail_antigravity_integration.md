# 【完全ガイド】Gmail ✕ Antigravity リモート連携システム

本ガイドは、Gmailからメールを送受信することにより、スマホや外部PCから **Antigravity** をリモート起動し、タスクの実行・レポート受信を行う仕組みのセットアップ・運用マニュアルです。

---

## 🏗 システム構成図

```
┌───────────────────────────┐
│ ユーザー (スマホ/Gmailアプリ) │
└─────────────┬─────────────┘
              │ 1. 件名: [Antigravity] 分析レポートを作成して
              ▼
       ┌──────────────┐
       │   GmailApp   │
       └──────┬───────┘
              │ 2. 未読メールの保持
              ▼
   ┌──────────────────────┐
   │ GAS (Google Apps     │
   │ Script) WebApp       │
   └──────────┬───────────┘
              │ 3. GET/POST (HTTPS REST API)
              ▼
┌───────────────────────────┐
│ Antigravity (ローカルPC)  │
│ - scripts/check_gmail_and_run.ps1
│ - Smart Task Analyst / Ollama
└───────────────────────────┘
```

---

## 🛠 1. GAS (Google Apps Script) の初期セットアップ

### Step 1: GAS プロジェクトの作成
1. ブラウザで [Google Apps Script (script.google.com)](https://script.google.com/) にアクセスします。
2. 「新しいプロジェクト」をクリックします。
3. エディタ内の既存コードを削除し、[gas/gmail_trigger_code.js](file:///C:/Users/test/Documents/antigravity/fearless-salk/gas/gmail_trigger_code.js) の内容をコピー＆ペーストします。

### Step 2: スクリプトプロパティの設定 (認証トークン)
1. 左メニューの **歯車アイコン (プロジェクトの設定)** をクリックします。
2. 一番下の **「スクリプト プロパティ」** ＞ **「スクリプト プロパティを追加」** を選択。
3. 以下のプロパティを追加します：
   - **`API_TOKEN`**: あなたが決めた安全な英数字（例: `my_antigravity_pass_2026`）
   - **`USER_EMAIL`**: 通知を受け取るあなたのGmailアドレス（例: `yourname@gmail.com`）

### Step 3: Webアプリとしてのデプロイ
1. 右上の **「デプロイ」** ＞ **「新しいデプロイ」** をクリック。
2. 種類の選択（歯車）で **「ウェブアプリ」** を選択。
3. 設定項目：
   - **説明**: `Antigravity Gmail Trigger`
   - **次のユーザーとして実行**: `自分 (yourname@gmail.com)`
   - **アクセスできるユーザー**: `全員` (※トークン認証を行うため「全員」にします)
4. **「デプロイ」** ボタンを押し、初回認証（Gmailアクセス許可）を行います。
5. 発行された **ウェブアプリのURL**（例: `https://script.google.com/macros/s/AKfycb.../exec`）をコピーします。

---

## ⚙️ 2. ローカル環境（Antigravity）側の設定

環境変数として、上記で取得した GAS URL と API_TOKEN を設定します。

### PowerShellでの環境変数設定（一時設定または $PROFILE 登録）
```powershell
$env:GAS_WEBAPP_URL = "https://script.google.com/macros/s/YOUR_GAS_DEPLOYMENT_ID/exec"
$env:API_TOKEN = "my_antigravity_pass_2026"
$env:USER_EMAIL = "yourname@gmail.com"
```

---

## 📱 3. 実際の運用・メール指示の使い方

### ① スマホからメールで指示を送る
Gmailアプリを開き、以下のように自分宛てにメールを送信します。

- **宛先 (To)**: `yourname@gmail.com`
- **件名 (Subject)**: `[Antigravity] 今日のタスク作業ログを分析して`
- **本文 (Body)**: （空欄でも、追加の条件を書くでも可）

### ② 自動チェック＆処理の実行 (PowerShell / Schedule)
ローカルPCのターミナルまたは Antigravity で以下を実行します：

```powershell
.\scripts\check_gmail_and_run.ps1
```

1. スクリプトが GAS API を呼び出し、未読の `[Antigravity]` メールを取得します。
2. メール本文・件名の指示に従い、`Smart Task Analyst` (DuckDB ✕ Ollama) を実行。
3. 完了後、作成された分析レポートを**自動であなたのGmailへ返信メールとして送信**します！

---

## ⏰ 4. 定期自動チェック (定期ポーリング) の設定

Antigravity セッション内で `/schedule` を使用して以下のようにタイマー実行をセットできます。

- **コマンド**:
  ```text
  /schedule CronExpression="*/15 * * * *" Prompt="scripts/check_gmail_and_run.ps1 を実行してGmailからの指示メールがないかチェックしてください"
  ```
- これにより、15分おきに自動でGmailからの指示をチェック・実行・返信します。
