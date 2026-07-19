function createAntigravitySlides() {
  // 1. Create a new presentation (Default size is 16:9 - 720 x 405 pt)
  var presentation = SlidesApp.create("Antigravity導入・初期セットアップ戦略");
  var slides = presentation.getSlides();
  
  // Use the default first slide for the title
  var titleSlide = slides[0];
  titleSlide.getBackground().setSolidFill("#0F172A"); // Corrected to setSolidFill
  
  // Clean default shapes in the title slide to avoid duplicate overlaps
  var shapes = titleSlide.getShapes();
  shapes.forEach(function(shape) {
    shape.remove();
  });
  
  // Insert Title text box manually (Error-free coordinate layout)
  var titleBox = titleSlide.insertShape(SlidesApp.ShapeType.RECTANGLE, 36, 100, 648, 80);
  titleBox.getBorder().setTransparent();
  titleBox.getFill().setTransparent();
  var titleRange = titleBox.getText();
  titleRange.setText("Antigravity導入・初期セットアップ戦略");
  titleRange.getTextStyle().setForegroundColor("#F8FAFC").setFontSize(36).setFontFamily("Outfit").setBold(true);
  
  // Insert Subtitle text box manually
  var subBox = titleSlide.insertShape(SlidesApp.ShapeType.RECTANGLE, 36, 200, 648, 100);
  subBox.getBorder().setTransparent();
  subBox.getFill().setTransparent();
  var subRange = subBox.getText();
  subRange.setText("ガバナンスの技術的強制と開発速度の劇的向上を両立する新世代AIエージェント活用法\nプロジェクト推進チーム");
  subRange.getTextStyle().setForegroundColor("#94A3B8").setFontSize(16).setFontFamily("Inter");

  // Slide Data Definition
  var slideData = [
    {
      title: "スライド2：エグゼクティブ・サマリー",
      keyMessage: "エンジニアの自主性に頼るセキュリティ対策から、技術的に強制されるガバナンスへ。初期セットアップを一発で完了させ、オンボーディングコストを98%削減します。",
      bullets: [
        "AIエージェントの暴走や機密情報漏洩リスクを完全に抑え込む仕組みの導入。",
        "属性（Role）別の自動初期セットアップSKILLにより、エンジニアの環境構築コストを削減。",
        "セキュリティと生産性の両輪で、全社的な開発生産性を底上げします。"
      ]
    },
    {
      title: "スライド3：ビジネスが直面するAIエージェントの課題",
      keyMessage: "自律的なエージェントの導入にあたり、解決すべき3大課題とリスクがあります。",
      bullets: [
        "制御不全：エージェントが勝手にファイルを書き換え、破壊してしまう不安。",
        "ガバナンス漏れ：開発メンバーごとに異なるルールで動作し、セキュリティ設定が守られないリスク。",
        "リソース浪費：不要なファイルの読み込み（探索ノイズ）による処理の遅延とトークン消費の増大。"
      ]
    },
    {
      title: "スライド4：解決策：「技術的ガバナンス」の強制",
      keyMessage: "「org-setup」SKILLを実行するだけで、承認されたセキュリティ設定（AGENTS.md）がプロジェクトルートに自動適用されます。",
      bullets: [
        "危険なコマンド実行の抑止と、サンドボックスによる権限の局所化。",
        "大規模な書き換えは必ず「人間に承認を求める（Planning Mode）」ゲートを強制。",
        "暗黙のルールを明文化し、最初からエージェントに厳格に遵守させます。"
      ]
    },
    {
      title: "スライド5：メモリ節約と最適化（属性別出し分け）",
      keyMessage: "役割に応じた最小限のルールだけをエージェントに読み込ませることで、コンテキストメモリを節約し、精度を最大化します。",
      bullets: [
        "経営層（executive）：セキュリティと意思決定、承認プロセスに特化。",
        "データエンジニア（data-engineer）：SQL/ETL、DB接続、大容量データ除外（ノイズ排除）。",
        "SIer SE（sier-se）：設計書トレーサビリティ、厳格な品質・命名規約、コミット管理。"
      ]
    },
    {
      title: "スライド6：圧倒的な導入効果 (ROI)",
      keyMessage: "オンボーディング時間を「9時間」から「6分」へ短縮し、立ち上がりのリードタイムを劇的に改善します。",
      bullets: [
        "新規メンバーの環境構築とルール設定にかかる時間を98.8%削減。",
        "環境構築のトラブル（環境差異など）をほぼゼロにし、Time-to-Marketを短縮。",
        "組織全体での設定漏れによるセキュリティ事故を技術的に「ゼロ」にします。"
      ]
    },
    {
      title: "スライド7：段階的な導入ロードマップ",
      keyMessage: "以下のフェーズに沿って、安全かつ効果的に組織へAntigravityを展開します。",
      bullets: [
        "フェーズ1：評価・ポリシー策定（セキュリティ要件とルールの定義）",
        "フェーズ2：組織標準SKILLの作成・検証（テスト環境での動作確認）",
        "フェーズ3：ワンコマンド初期セットアップの実行（各プロジェクトでの自動適用）",
        "フェーズ4：実プロジェクト展開 & 定着化（継続的なルール調整）"
      ]
    },
    {
      title: "スライド8：意思決定・承認事項",
      keyMessage: "組織標準セットアップSKILLの採用、および全プロジェクトへのAGENTS.md自動配置ルールの義務化の承認をお願いいたします。",
      bullets: [
        "初期セットアップSKILL（org-setup）のグローバル開発環境への展開。",
        "新規および既存プロジェクトのテンプレートへの組み込み。",
        "データセキュリティ監査ポリシーとの連携。"
      ]
    }
  ];

  // Append each slide
  slideData.forEach(function(data) {
    // Append a blank slide to fully control the layout
    var slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    slide.getBackground().setSolidFill("#0F172A"); // Corrected to setSolidFill
    
    // Configure Slide Title (Manual Position)
    var titleBox = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 36, 36, 648, 50);
    titleBox.getBorder().setTransparent();
    titleBox.getFill().setTransparent();
    var titleRange = titleBox.getText();
    titleRange.setText(data.title);
    titleRange.getTextStyle().setForegroundColor("#F8FAFC").setFontSize(26).setFontFamily("Outfit").setBold(true);
    
    // Configure Slide Body (Manual Position)
    var bodyBox = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 36, 100, 648, 270);
    bodyBox.getBorder().setTransparent();
    bodyBox.getFill().setTransparent();
    var textRange = bodyBox.getText();
    
    var fullText = "■ キーメッセージ\n" + data.keyMessage + "\n\n■ 主なポイント\n";
    data.bullets.forEach(function(bullet) {
      fullText += "・ " + bullet + "\n";
    });
    
    textRange.setText(fullText);
    textRange.getTextStyle().setForegroundColor("#E2E8F0").setFontSize(14).setFontFamily("Inter");
    
    var textStr = textRange.asString();
    
    // Highlight headers using getRange instead of substring
    var keyMsgIndex = textStr.indexOf("■ キーメッセージ");
    if (keyMsgIndex !== -1) {
      textRange.getRange(keyMsgIndex, keyMsgIndex + 9).getTextStyle().setForegroundColor("#38BDF8").setBold(true);
    }
    
    var ptsIndex = textStr.indexOf("■ 主なポイント");
    if (ptsIndex !== -1) {
      textRange.getRange(ptsIndex, ptsIndex + 8).getTextStyle().setForegroundColor("#34D399").setBold(true);
    }
  });
  
  Logger.log("Presentation created successfully. URL: " + presentation.getUrl());
}
