# 購入者用 納品マニュアル ＆ スタートガイド (Buyer Onboarding Guide)

本ドキュメントは、生成AI活用パッケージをご購入いただいたお客様（Buyer）が、納品後すぐに社内展開をスタート（Onboarding Guide）できるようにするためのセットアップマニュアルです。

---

## 1. 納品物の全体像

ご購入ありがとうございます。納品フォルダには以下の構成要素が含まれています。

1. **`docs/`**: 実務ドキュメント・フレームワーク
   - `ai_usage_governance_guideline.md` (ガバナンスガイドライン)
   - `ai_usecase_prompt_library.md` (プロンプトライブラリ)
   - `ai_enablement_presentation_outline.md` (研修用スライド構成)
   - `ai_roi_evaluation_framework.md` (ROI評価指標)
2. **`.agents/skills/ai-toolkit/`**: 自動化カスタムスキル
   - 社内プロジェクトの初期化コマンド。

---

## 2. 導入のクイックスタートステップ

### ステップ1: ガバナンスルールの社内共有
- `docs/ai_usage_governance_guideline.md` を自社の社内Wiki（Notion, Confluence等）に転記し、全社員へ周知します。

### ステップ2: カスタムスキルの適用
- 開発プロジェクトのディレクトリにて、以下のコマンドを実行し、社内標準プロンプトを展開します。
```powershell
powershell -ExecutionPolicy Bypass -File ".agents/skills/ai-toolkit/scripts/setup-ai-env.ps1" -Type "coding"
```

### ステップ3: 定期的なROI計測
- `docs/ai_roi_evaluation_framework.md` を活用し、四半期ごとに削減時間を社内報告します。
