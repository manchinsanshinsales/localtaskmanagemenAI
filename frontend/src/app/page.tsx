import React from 'react';
import { Shield, Sparkles, Cpu, Lock } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import DashboardStats from '../components/DashboardStats';

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      
      {/* プレミアムなヘッダーセクション */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-slate-800/80 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs text-teal-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Antigravity ✕ Local LLM Demo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-100 to-teal-400 bg-clip-text text-transparent">
              Smart Task Analyst
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              作業ログやタスク管理はセキュアにローカルで永続化（SQLite & DuckDB）し、
              ローカルLLM（Ollama）を用いて完全オフラインで自然言語による分析・レポート生成を行います。
              必要に応じて、明示的にクラウド（模擬PostgreSQL）にデータを同期・アップロード可能です。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[240px]">
            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center space-x-2">
              <Lock className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 font-medium">SECURITY</p>
                <p className="text-xs text-slate-200 font-bold">100% Local First</p>
              </div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 font-medium">AI MODEL</p>
                <p className="text-xs text-slate-200 font-bold">Ollama / Gemma</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ダッシュボードスタッツ（タスク、ログ、同期） */}
      <DashboardStats />

      {/* AIデータアナリスト チャットインターフェース */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Shield className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-slate-100">AI Data Analysis Sandbox</h2>
        </div>
        <ChatInterface />
      </div>

      {/* フッター */}
      <footer className="text-center text-xs text-slate-600 pt-8 border-t border-slate-900">
        <p>Smart Task Analyst © 2026. Made with Antigravity.</p>
      </footer>

    </main>
  );
}
