import React, { useState } from 'react';
import { Note, TodoList, Task } from '../types';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from '../utils/supabase';
import { FileText, CheckCircle2, Calendar, Clock, Plus, Search, Sparkles, CheckSquare, Square, ChevronRight, Database, Code, Check, Copy } from 'lucide-react';

interface DashboardProps {
  profile: { fullName: string; email: string };
  notes: Note[];
  lists: TodoList[];
  tasks: Task[];
  supabaseError?: string | null;
  onSelectNote: (noteId: string) => void;
  onSelectTodoList: (listId: string) => void;
  onCreateNote: () => void;
  onCreateTodoList: () => void;
  onToggleTaskStatus: (taskId: string) => void;
  onOpenSearch: () => void;
}

export default function Dashboard({
  profile,
  notes,
  lists,
  tasks,
  supabaseError,
  onSelectNote,
  onSelectTodoList,
  onCreateNote,
  onCreateTodoList,
  onToggleTaskStatus,
  onOpenSearch,
}: DashboardProps) {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Greetings based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculations for widgets
  const completedTasks = tasks.filter(t => t.status === 'done');
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;

  // Filter dynamic high priority/recent tasks
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const highPriorityTasks = [...pendingTasks]
    .sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    })
    .slice(0, 3);

  // Filter recent notes (sorted by updatedAt)
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // Format dynamic relative time
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Edited just now';
      if (diffHours < 24) return `Edited ${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `Edited ${diffDays}d ago`;
    } catch {
      return 'Edited recently';
    }
  };

  return (
    <div id="dashboard-view" className="max-w-4xl mx-auto px-8 md:px-16 py-12 font-sans text-[#37352F]">
      {/* Welcome Banner */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">👋</span>
          <h1 className="text-4xl font-bold tracking-tight text-[#37352F]">
            {getGreeting()}, {profile.fullName.split(' ')[0]}.
          </h1>
        </div>
        <p className="text-[#7E7D77] text-lg">
          You have {pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'} to finish today. Let's make it productive.
        </p>
      </div>

      {/* Supabase Connection Status Badge */}
      {isSupabaseConfigured && !supabaseError && (
        <div className="mb-10 p-4 border border-emerald-100 rounded-xl bg-emerald-50/10 flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-emerald-950">Supabase Connected</span>
              <span className="text-[10px] text-emerald-600 font-mono">Cloud Synchronized</span>
            </div>
          </div>
          <span className="text-xs text-emerald-700/80 leading-none">All your data is saved directly to your remote database</span>
        </div>
      )}

      {/* Supabase Connection Setup Panel (Visible if not configured) */}
      {!isSupabaseConfigured && (
        <div className="mb-10 p-5 border border-amber-100 rounded-xl bg-amber-50/20 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-800 shrink-0">
              <Database className="h-5 w-5 animate-pulse text-amber-600" />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-1.5">
                <span>Database Sync Setup Required</span>
              </h3>
              <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                Connect your workspace to your real Supabase database! Currently running without active credentials. Once configured, all your notes and tasks will automatically synchronize with your cloud database.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 pt-1.5 pl-11">
            <button 
              onClick={() => setShowSql(!showSql)}
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Code className="h-3.5 w-3.5" />
              <span>{showSql ? 'Hide SQL Script' : 'Get Database SQL Schema'}</span>
            </button>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noreferrer"
              className="px-3.5 py-1.5 border border-amber-200 hover:bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Go to Supabase Dashboard</span>
              <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {showSql && (
            <div className="pl-11 mt-2 animate-in fade-in duration-200">
              <div className="bg-[#1F1F1E] rounded-lg p-3 text-[11px] font-mono text-[#D4D4D4] border border-zinc-800 relative max-h-56 overflow-y-auto">
                <button
                  onClick={handleCopySql}
                  className="absolute top-2 right-2 p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded transition-colors flex items-center gap-1 font-sans text-[10px] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
                <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
              </div>
              <p className="text-[10px] text-amber-700/70 mt-2 leading-relaxed">
                💡 Paste this SQL script into the <strong>SQL Editor</strong> on Supabase and run it to create your tables in one click! Then, add <code className="bg-amber-100/50 px-1 py-0.2 rounded font-semibold text-amber-900">VITE_SUPABASE_URL</code> and <code className="bg-amber-100/50 px-1 py-0.2 rounded font-semibold text-amber-900">VITE_SUPABASE_ANON_KEY</code> in your AI Studio Workspace Secrets to complete the connection.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Supabase Error Alert (Visible if configured but failing) */}
      {isSupabaseConfigured && supabaseError && (
        <div className="mb-10 p-5 border border-red-100 rounded-xl bg-red-50/20 flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-lg bg-red-50 text-red-800 shrink-0">
              <Database className="h-5 w-5 text-red-600 animate-pulse" />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-950 flex items-center gap-1.5">
                <span>Database Table Setup Required</span>
              </h3>
              <p className="text-xs text-red-700/80 mt-1 leading-relaxed">
                Your credentials are correct, but Supabase returned a connection error:
              </p>
              <div className="mt-2 bg-red-100/55 rounded-md p-2.5 text-xs font-mono text-red-900 break-words border border-red-200">
                {supabaseError}
              </div>
              
              {/* Specialized notification for the 'password' column missing / schema cache error */}
              {(supabaseError.toLowerCase().includes('password') || supabaseError.toLowerCase().includes('profiles') || supabaseError.toLowerCase().includes('schema cache')) && !supabaseError.toLowerCase().includes('row-level security') && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold text-amber-950 block mb-1">💡 Tips Solusi Cepat:</span>
                  Error ini menunjukkan tabel <code className="bg-amber-100 px-1 py-0.2 rounded font-mono font-semibold">profiles</code> belum memiliki kolom <code className="bg-amber-100 px-1 py-0.2 rounded font-mono font-semibold">password</code>, atau cache API Supabase Anda perlu disegarkan. 
                  Silakan copy script SQL di bawah ini, jalankan di <strong>SQL Editor</strong> Supabase Anda, lalu refresh halaman:
                  <pre className="mt-2 p-2 bg-[#1F1F1E] text-[#D4D4D4] rounded font-mono text-[10px] whitespace-pre-wrap">
                    {`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;\nNOTIFY pgrst, 'reload schema';`}
                  </pre>
                </div>
              )}

              {/* Specialized notification for Row-Level Security policy errors */}
              {(supabaseError.toLowerCase().includes('row-level security') || supabaseError.toLowerCase().includes('row_level_security') || supabaseError.toLowerCase().includes('rls') || supabaseError.toLowerCase().includes('policy')) && (
                <div className="mt-3 p-3.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-900">
                  <span className="font-bold text-rose-950 block mb-1 flex items-center gap-1.5">
                    🛡️ Proteksi RLS (Row-Level Security) Aktif:
                  </span>
                  Supabase secara default mengaktifkan proteksi Row-Level Security (RLS) pada tabel baru Anda. Silakan copy dan jalankan query SQL di bawah ini di <strong>SQL Editor</strong> Supabase Anda untuk menonaktifkannya (atau mengizinkan akses penuh):
                  <pre className="mt-2.5 p-2 bg-[#1F1F1E] text-[#D4D4D4] rounded font-mono text-[10px] whitespace-pre-wrap relative">
                    {`ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;`}
                  </pre>
                </div>
              )}

              <p className="text-xs text-red-700/80 mt-2.5 leading-relaxed">
                This usually means you haven't created the required tables in your Supabase database. Please copy the SQL script below and execute it inside the Supabase SQL Editor to initialize your workspace schema.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 pt-1.5 pl-11">
            <button 
              onClick={() => setShowSql(!showSql)}
              className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Code className="h-3.5 w-3.5" />
              <span>{showSql ? 'Hide SQL Script' : 'Get Database SQL Schema'}</span>
            </button>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noreferrer"
              className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Go to Supabase Dashboard</span>
              <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {showSql && (
            <div className="pl-11 mt-2 animate-in fade-in duration-200">
              <div className="bg-[#1F1F1E] rounded-lg p-3 text-[11px] font-mono text-[#D4D4D4] border border-zinc-800 relative max-h-56 overflow-y-auto">
                <button
                  onClick={handleCopySql}
                  className="absolute top-2 right-2 p-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded transition-colors flex items-center gap-1 font-sans text-[10px] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
                <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Task Progress Widget */}
        <div className="border border-[#EDEDEB] rounded-xl p-5 hover:bg-[#F7F7F5] transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xs text-[#91918E] uppercase tracking-wider">Task Progress</h3>
            <span className="text-[10px] bg-[#37352F] text-white px-2 py-0.5 rounded-full">Today</span>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#EDEDEB" strokeWidth="3"></circle>
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="#37352F" 
                  strokeWidth="3" 
                  strokeDasharray={`${completionRate}, 100`}
                  className="transition-all duration-500"
                ></circle>
              </svg>
              <span className="absolute text-lg font-bold text-[#37352F]">{completionRate}%</span>
            </div>
            <p className="mt-4 text-xs text-[#7E7D77]">
              {completedTasks.length} of {totalTasksCount} tasks completed
            </p>
          </div>
        </div>

        {/* Recent Notes Widget */}
        <div className="border border-[#EDEDEB] rounded-xl p-5 col-span-1 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-xs text-[#91918E] uppercase tracking-wider">Recent Notes</h3>
              <button 
                onClick={onCreateNote}
                className="text-xs text-[#37352F] hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="h-3 w-3" /> New Page
              </button>
            </div>
            <div className="space-y-4">
              {recentNotes.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#91918E] italic">
                  No notes available. Click New Page to get started.
                </div>
              ) : (
                recentNotes.map((note) => (
                  <div 
                    key={note.id}
                    onClick={() => onSelectNote(note.id)}
                    className="flex items-center justify-between group cursor-pointer hover:bg-[#F7F7F5] -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">📝</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#37352F] truncate">{note.title || 'Untitled Page'}</p>
                        <p className="text-xs text-[#91918E] truncate">
                          {formatTimeAgo(note.updatedAt)} {note.tags.length > 0 ? `• #${note.tags.join(' #')}` : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-[#91918E] transition-all" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tasks List Section */}
        <div className="col-span-1 md:col-span-3 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xs text-[#91918E] uppercase tracking-wider">High Priority Tasks</h3>
            {lists.length > 0 && (
              <button 
                onClick={() => onSelectTodoList(lists[0].id)}
                className="text-xs text-[#37352F] hover:underline"
              >
                View all
              </button>
            )}
          </div>
          <div className="space-y-2">
            {highPriorityTasks.length === 0 ? (
              <div className="p-8 border border-[#EDEDEB] rounded-lg text-center text-xs text-[#91918E] italic">
                {pendingTasks.length === 0 ? 'No pending tasks left!' : 'No tasks assigned yet.'}
              </div>
            ) : (
              highPriorityTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 border border-[#EDEDEB] rounded-lg group hover:bg-[#F7F7F5] transition-colors"
                >
                  <div 
                    onClick={() => onToggleTaskStatus(task.id)}
                    className="w-5 h-5 border-2 border-[#EDEDEB] rounded-md group-hover:border-[#37352F] cursor-pointer flex items-center justify-center transition-colors shrink-0"
                  >
                    {task.status === 'done' && <div className="w-2.5 h-2.5 bg-[#37352F] rounded-xs" />}
                  </div>
                  <span className={`text-sm font-medium text-[#37352F] truncate ${task.status === 'done' ? 'line-through text-[#91918E]' : ''}`}>
                    {task.title}
                  </span>
                  
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded font-semibold shrink-0 uppercase tracking-wider ${
                    task.priority === 'high' ? 'bg-[#FDE7E7] text-[#EE4444]' :
                    task.priority === 'medium' ? 'bg-[#E3F2FD] text-[#2196F3]' :
                    'bg-[#F1F0EF] text-[#7E7D77]'
                  }`}>
                    {task.priority === 'high' ? 'URGENT' : task.priority}
                  </span>

                  {task.dueDate && (
                    <span className="text-xs text-[#91918E] border-l border-[#EDEDEB] pl-3 ml-3 hidden sm:inline shrink-0">
                      Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Footer / Info / Quick Action bar */}
      <div className="mt-12 border-t border-[#EDEDEB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 rounded bg-white text-[#91918E] text-[10px] font-mono border border-[#EDEDEB]">Ctrl + K</kbd>
          <span className="text-xs text-[#91918E]">Launch workspace command search</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onOpenSearch}
            className="px-4 py-1.5 border border-[#EDEDEB] text-[#37352F] rounded-lg text-xs font-semibold hover:bg-[#F7F7F5] transition-all flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Workspace</span>
          </button>
          <button
            onClick={onCreateTodoList}
            className="px-4 py-1.5 bg-[#37352F] text-white rounded-lg text-xs font-semibold hover:bg-[#52504a] transition-all flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task Pipeline</span>
          </button>
        </div>
      </div>
    </div>
  );
}
