# 【完全マニュアル】Daily Autonomous Agent 設定 ＆ 自動実行ガイド

本ガイドは、Antigravityエージェントを**「毎日1回自動で起動させ、作業ログ分析と日報生成を完全無人・低頻度承認で全自動実行させる」**ためのセットアップ・運用マニュアルです。

---

## 🛠 1. アーキテクチャと自動化の仕組み

```
[Windows Task Scheduler / Cron]
         │ (毎日 朝9:00 起動)
         ▼
[scripts/start_daily_agent.ps1] ─── Antigravity (agy CLI / schedule ツール)
                                        │
                                        ▼ (自動認証 & AGENTS.md ガードレール)
                               [Local SQLite + DuckDB]
                                        │ (データ集計)
                                        ▼
                                 [Ollama (Local LLM)]
                                        │ (分析レポート自動生成)
                                        ▼
                   [docs/reports/daily_report_YYYY-MM-DD.md]
```

---

## ⚙️ 2. 定期実行 (Cron / Schedule) の設定方法

### 方法A: Antigravity 内の `schedule` ツールを使用する場合 (推奨)
Antigravity セッション内で以下を実行するか、プロンプトで指示します。

- **Cron式**: `0 9 * * *` (毎日朝9時)
- **指示プロンプト**:
  ```text
  DuckDBとOllamaを使用して、本日の作業ログとタスク集計を行い、docs/reports/daily_report_YYYY-MM-DD.md に分析レポートを作成してください。
  ```

### 方法B: Windows タスクスケジューラ / PowerShell で自動実行する場合
付属の `scripts/start_daily_agent.ps1` をWindowsタスクスケジューラに登録します。

1. **PowerShellでの手動実行テスト**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\start_daily_agent.ps1
   ```
2. **タスクスケジューラ登録コマンド**:
   ```powershell
   $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File C:\Users\test\Documents\antigravity\fearless-salk\scripts\start_daily_agent.ps1"
   $trigger = New-ScheduledTaskTrigger -Daily -At 9:00AM
   Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "AntigravityDailyAgent" -Description "Daily Task Analyst Agent"
   ```

---

## 🔐 3. 無人・全自動実行のためのパーミッション (AllowAll) 設定

エージェントが自動起動した際、ツールの承認ダイアログで停止（ブロック）されないようにするための設定手順です。

### 1. `AGENTS.md` のセキュリティガードレールの確認
プロジェクト直下の `AGENTS.md` に以下が記述されているため、システム全体の安全は保証されます。
- `rm -rf` などの危険コマンドの自動禁止
- 許可されていない外部ドメインへのデータ送信禁止
- 機密情報・APIキーの非開示

### 2. ツール自動許可 (Auto Approve) の設定
プロジェクト設定（`.gemini/config` や Antigravity の Permission 設定）にて、以下のツールアクションを事前許可します：
- `read_file`: `C:\Users\test\Documents\antigravity\fearless-salk\*`
- `write_file`: `C:\Users\test\Documents\antigravity\fearless-salk\docs\reports\*`
- `command`: `python`, `docker`, `powershell`

---

## 🔄 4. `/goal` および `goal-loop` スキルとの連携

レポート生成中に一時的なエラー（例: Ollamaの起動遅延、DuckDBロック）が発生した場合でも、エージェントが自律修復して完走するために `goal-loop` スキルを活用できます。

- **プロンプトへの組み込み例**:
  ```text
  /goal docs/reports/daily_report_YYYY-MM-DD.md が正常に生成され、内容が空でない状態になるまで検証・修正ループを実行してください。
  ```
- エージェントはSuccess Criteria（レポートファイルが正常生成されること）を達成するまで自動でコード修正や再試行を行います。
