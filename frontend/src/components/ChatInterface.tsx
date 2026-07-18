'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Terminal, Table as TableIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sql?: string;
  rawData?: any[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'こんにちは！AIデータアナリストです。SQLiteとDuckDBに蓄積された開発データから、ご質問に応じたクエリを安全にローカルで実行し、レポートを生成します。何について分析しますか？\n\n**質問例:**\n- `今週、一番開発時間のかかったタスクのカテゴリは？`\n- `ステータスが完了(done)したタスク一覧とそれぞれの所要時間を教えて`',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // 段階的なローディング表示シミュレーション
      setCurrentStep('LLMでSQLを生成中...');
      
      const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_HOST}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '分析リクエストに失敗しました');
      }

      setCurrentStep('DuckDBでSQLite内のデータをクエリ中...');
      const data = await response.json();
      
      setCurrentStep('分析結果から要約レポートを生成中...');
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.report,
          sql: data.sql,
          rawData: data.raw_data,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `エラーが発生しました: ${err.message || '接続に失敗しました'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  // 簡易的なMarkdownレンダラー（デモ用のため簡潔に実装）
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // 見出し
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-md font-bold mt-3 mb-1 text-teal-300">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-lg font-bold mt-4 mb-2 text-teal-400">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-xl font-bold mt-5 mb-3 text-teal-500">{line.replace('# ', '')}</h2>;
      }
      // リスト項目
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const boldParsed = parseBold(line.substring(2));
        return <li key={idx} className="ml-4 list-disc text-sm text-gray-300 my-1">{boldParsed}</li>;
      }
      // 強調表示（太字）の簡単な置換
      return <p key={idx} className="text-sm text-gray-300 leading-relaxed min-h-[1rem]">{parseBold(line)}</p>;
    });
  };

  const parseBold = (line: string) => {
    const parts = line.split('**');
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="text-teal-200 font-semibold">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-md">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/40 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
          <span className="font-semibold text-teal-100">AI Data Analyst (Ollama)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-xs text-emerald-400 font-mono">Local Host Connected</span>
        </div>
      </div>

      {/* メッセージ表示エリア */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-4 ${
              msg.role === 'user' 
                ? 'bg-teal-600/20 border border-teal-500/40 text-teal-100' 
                : 'bg-slate-800/80 border border-slate-700/60 text-slate-100'
            }`}>
              {/* テキストコンテンツ */}
              <div className="space-y-1 whitespace-pre-wrap">
                {msg.role === 'user' ? msg.text : renderMarkdown(msg.text)}
              </div>

              {/* 生成されたSQLクエリの表示 */}
              {msg.sql && (
                <div className="mt-4 border border-slate-700 rounded bg-slate-950 overflow-hidden">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-teal-400 font-mono">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Generated SQL (Executed on DuckDB)</span>
                  </div>
                  <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {msg.sql}
                  </pre>
                </div>
              )}

              {/* クエリ実行結果テーブルの表示 */}
              {msg.rawData && msg.rawData.length > 0 && (
                <div className="mt-3 border border-slate-700 rounded bg-slate-950/80 overflow-hidden">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-teal-400 font-mono">
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Query Output ({msg.rawData.length} rows)</span>
                  </div>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-xs text-left font-mono">
                      <thead className="bg-slate-900 text-teal-300 border-b border-slate-800">
                        <tr>
                          {Object.keys(msg.rawData[0]).map((key) => (
                            <th key={key} className="px-3 py-2">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {msg.rawData.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/40 text-slate-300">
                            {Object.values(row).map((val: any, cIdx) => (
                              <td key={cIdx} className="px-3 py-2">{String(val)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/40 border border-slate-800/80 rounded-lg p-4 max-w-[85%] text-slate-400 flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-medium">
                <span className="text-teal-400">{currentStep}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* フッター（入力欄） */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950/40 border-t border-slate-800/60 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="AIアナリストに質問を入力... (例: カテゴリ別の合計作業時間は？)"
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="p-2 bg-teal-600 hover:bg-teal-500 text-teal-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          disabled={isLoading}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
