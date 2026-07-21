---
name: ai-toolkit
description: "全社生成AI活用＆プロンプト自動セットアップスキル。業務種別（Role / Type: writing, coding, analysis）に応じた高精度プロンプトテンプレートと活用ルールを展開します。"
argument-hint: "業務種別（writing, coding, analysis のいずれか）"
user-invocable: true
---

# 全社AI活用推進スキル (`ai-toolkit`)

このスキルは、プロジェクトや各種業務において、**「ワンコマンドで高品質プロンプトテンプレートとガイドラインを適用する」**ための社内共通ツールです。

## エージェント（あなた）への指示

ユーザーから「AI活用設定をして」「プロンプトテンプレートを展開して」「writing用の型をセットして」といった指示を受けた際、本スキルを起動して以下のステップでセットアップを実行してください。

### 1. 業務種別（Type）の決定
指示の中で業務種別が指定されていない場合は、「`writing`（文章作成・要約用）」「`coding`（開発・コードレビュー用）」「`analysis`（リサーチ・分析用）」のいずれを適用するかを確認してください。

### 2. セットアップスクリプトの実行
決定された種別（Type）を引数に指定して、以下の PowerShell スクリプトを実行します。

```powershell
powershell -ExecutionPolicy Bypass -File ".agents/skills/ai-toolkit/scripts/setup-ai-env.ps1" -Type "coding"
```

### 3. スクリプトが実行する処理
- 選択された種別に対応するプロンプトテンプレート（`resources/[type].prompt.md`）を、プロジェクトのルートに `PROMPT_TEMPLATE.md` として自動コピーします。
