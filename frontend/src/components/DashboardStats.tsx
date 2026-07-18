'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ListTodo, History, RefreshCw, CheckCircle, Database } from 'lucide-react';

interface Task {
  id: int;
  title: string;
  description: string;
  status: string;
  is_synced: boolean;
}

interface ActivityLog {
  id: int;
  task_id: int;
  duration_minutes: number;
  category: string;
  description: string;
  recorded_at: string;
  is_synced: boolean;
}

export default function DashboardStats() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // フォーム用ステート
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [logTaskId, setLogTaskId] = useState('');
  const [logDuration, setLogDuration] = useState('');
  const [logCategory, setLogCategory] = useState('development');
  const [logDesc, setLogDesc] = useState('');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);

  const API_HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchData = async () => {
    try {
      const [resTasks, resLogs] = await Promise.all([
        fetch(`${API_HOST}/api/tasks`),
        fetch(`${API_HOST}/api/logs`)
      ]);
      if (resTasks.ok) setTasks(await resTasks.json());
      if (resLogs.ok) setLogs(await resLogs.json());
    } catch (e) {
      console.error('Failed to fetch initial data', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    try {
      const res = await fetch(`${API_HOST}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, description: taskDesc }),
      });
      if (res.ok) {
        setTaskTitle('');
        setTaskDesc('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTaskId || !logDuration) return;

    try {
      const res = await fetch(`${API_HOST}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: parseInt(logTaskId),
          duration_minutes: parseInt(logDuration),
          category: logCategory,
          description: logDesc
        }),
      });
      if (res.ok) {
        setLogDuration('');
        setLogDesc('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`${API_HOST}/api/sync`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setSyncResult(result);
        fetchData(); // 同期後のis_syncedフラグ更新を反映
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* タスク登録と一覧 */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <ListTodo className="w-5 h-5 text-teal-400" />
          <h2 className="font-semibold text-slate-100">Tasks</h2>
        </div>
        
        {/* 新規タスク作成 */}
        <form onSubmit={handleCreateTask} className="space-y-3">
          <input
            type="text"
            placeholder="新規タスクのタイトル"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <textarea
            placeholder="タスクの説明 (任意)"
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 h-16"
          />
          <button
            type="submit"
            className="w-full bg-teal-600/80 hover:bg-teal-600 text-teal-100 rounded py-1.5 text-xs transition duration-200 flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>タスクを追加</span>
          </button>
        </form>

        {/* タスク一覧 */}
        <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded text-xs flex justify-between items-start">
              <div>
                <p className="font-semibold text-slate-200">{task.title}</p>
                <p className="text-slate-400 mt-1">{task.description || '説明なし'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] ${
                task.is_synced ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
              }`}>
                {task.is_synced ? 'Cloud Synced' : 'Local Only'}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">登録されたタスクはありません</p>
          )}
        </div>
      </div>

      {/* 作業ログの記録 */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <History className="w-5 h-5 text-teal-400" />
          <h2 className="font-semibold text-slate-100">Work Logs</h2>
        </div>

        {/* 新規ログ記録 */}
        <form onSubmit={handleCreateLog} className="space-y-3">
          <select
            value={logTaskId}
            onChange={(e) => setLogTaskId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="">対象タスクを選択...</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="作業時間 (分)"
              value={logDuration}
              onChange={(e) => setLogDuration(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <select
              value={logCategory}
              onChange={(e) => setLogCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="development">開発 (Dev)</option>
              <option value="debugging">デバッグ (Debug)</option>
              <option value="meeting">ミーティング</option>
              <option value="documentation">ドキュメント</option>
              <option value="other">その他</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="作業内容の説明"
            value={logDesc}
            onChange={(e) => setLogDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            className="w-full bg-teal-600/80 hover:bg-teal-600 text-teal-100 rounded py-1.5 text-xs transition duration-200 flex items-center justify-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>ログを追加</span>
          </button>
        </form>

        {/* ログ一覧 */}
        <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2">
          {logs.map((log) => {
            const task = tasks.find(t => t.id === log.task_id);
            return (
              <div key={log.id} className="p-3 bg-slate-950/60 border border-slate-850 rounded text-xs flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-200">{task?.title || 'Unknown Task'}</p>
                  <p className="text-slate-400 mt-1">{log.description}</p>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <span className="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded text-[9px] font-mono">{log.category}</span>
                    <span className="text-slate-400 text-[10px]">{log.duration_minutes} 分</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  log.is_synced ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
                }`}>
                  {log.is_synced ? 'Cloud Synced' : 'Local Only'}
                </span>
              </div>
            );
          })}
          {logs.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">登録されたログはありません</p>
          )}
        </div>
      </div>

      {/* クラウド同期制御 */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Database className="w-5 h-5 text-teal-400" />
            <h2 className="font-semibold text-slate-100">Cloud Sync Status</h2>
          </div>

          <div className="bg-slate-950/80 p-4 border border-slate-850 rounded-lg text-xs space-y-2">
            <p className="text-slate-300 flex justify-between">
              <span>ローカルタスク数:</span>
              <span className="font-mono text-teal-400 font-bold">{tasks.length}</span>
            </p>
            <p className="text-slate-300 flex justify-between">
              <span>ローカル作業ログ数:</span>
              <span className="font-mono text-teal-400 font-bold">{logs.length}</span>
            </p>
            <p className="text-slate-300 flex justify-between">
              <span>未同期のタスク:</span>
              <span className="font-mono text-amber-400 font-bold">
                {tasks.filter(t => !t.is_synced).length}
              </span>
            </p>
            <p className="text-slate-300 flex justify-between">
              <span>未同期の作業ログ:</span>
              <span className="font-mono text-amber-400 font-bold">
                {logs.filter(l => !l.is_synced).length}
              </span>
            </p>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed">
            ボタンをクリックすると、SQLiteに保存された未同期のデータがDocker上の模擬クラウドPostgreSQLに安全に転送され、SQLite側の同期フラグが同期済みに更新されます。
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-850 space-y-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full bg-teal-600 hover:bg-teal-500 text-teal-100 rounded-lg py-2.5 text-xs font-semibold tracking-wider transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '同期を実行中...' : 'クラウド PostgreSQL へ同期'}</span>
          </button>

          {syncResult && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-lg text-xs flex items-start space-x-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-emerald-400">同期が正常に完了しました</p>
                <ul className="text-slate-300 mt-1 list-disc list-inside">
                  <li>同期されたタスク: {syncResult.synced_tasks_count}</li>
                  <li>同期されたログ: {syncResult.synced_logs_count}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
