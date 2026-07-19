---
name: org-setup
description: "組織内の初期セットアップ（Git設定、共通AIルール AGENTS.md の自動適用）を自動化するスキル。相手の属性（Role: executive / data-engineer / sier-se）に応じて最適化された AGENTS.md を生成し、コンテキストメモリの節約とセキュリティガバナンスの強制を両立します。"
argument-hint: "ターゲット属性（executive, data-engineer, sier-se のいずれか）"
user-invocable: true
---

# 組織標準セットアップスキル (`org-setup`)

このスキルは、新規プロジェクトやローカル開発環境の立ち上げ時に、**「ワンコマンドで仕事に使える安全かつ最適な開発環境を作る」**ための初期設定ツールです。

## エージェント（あなた）への指示

ユーザーから「初期設定をして」「属性に応じて環境構築して」「セキュリティルールを設定して」といった指示を受けた際、本スキルを起動して以下のステップでセットアップを実行してください。

### 1. 属性（Role）の決定
指示の中でターゲット属性が明記されていない場合は、ユーザーに「`executive`（経営層向け）」「`data-engineer`（データエンジニア向け）」「`sier-se`（SIer SE向け）」のいずれを適用するかを確認してください。

### 2. セットアップスクリプトの実行 (Low Freedom)
この処理は開発環境の整合性を保証するために手順が固定されています。**必ず以下のコマンドをそのまま実行し、フラグを追加したり改変したりしないでください。**

- **スクリプトパス**: `scripts/setup-org-env.ps1` (物理パス: `C:/Users/test/.gemini/config/skills/org-setup/scripts/setup-org-env.ps1`)
- **実行コマンド**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File "C:/Users/test/.gemini/config/skills/org-setup/scripts/setup-org-env.ps1" -Role "[選択したRole]"
  ```

### 3. スクリプトが実行する処理
- **Gitのグローバル設定適用**: 開発効率化のためのGitエイリアス（`st`, `co`, `br`, `ci`, `lg` など）をグローバル設定に追加します。
- **属性別 `AGENTS.md` の自動生成**: 選択された属性に対応するテンプレート（`resources/AGENTS.[role].md.template`）を、プロジェクトのルートディレクトリに `AGENTS.md` としてコピーします。これにより、余分なルールを除外した軽量なガードレールが適用され、**エージェントのコンテキストメモリ消費が節約**されます。

