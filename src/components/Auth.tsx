import React, { useState } from 'react';
import { StorageService } from '../utils/storage';
import { Profile } from '../types';
import { ArrowRight, Lock, Mail, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (profile: Profile) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('candrarusmanndoko@gmail.com');
  const [password, setPassword] = useState('password');
  const [fullName, setFullName] = useState('Candra Rusmanndoko');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        const profile = await StorageService.signup(email, password, fullName);
        onAuthSuccess(profile);
      } else {
        const profile = await StorageService.login(email, password);
        onAuthSuccess(profile);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setLoading(true);
    try {
      const profile = await StorageService.login('candrarusmanndoko@gmail.com', 'password');
      onAuthSuccess(profile);
    } catch (err: any) {
      // In case user deleted seed, let's register guest
      try {
        const profile = await StorageService.signup('candrarusmanndoko@gmail.com', 'password', 'Candra Rusmanndoko');
        onAuthSuccess(profile);
      } catch (err2) {
        setError('Could not start workspace. Try clearing browser cache.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-page" className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 text-white mb-4 shadow-sm">
          <span className="font-mono text-xl font-bold">W</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 font-sans">
          Welcome to Workspace
        </h2>
        <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
          A minimalist, Notion-inspired task tracker and rich note-taking environment.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-zinc-200/80 sm:rounded-xl sm:px-10 shadow-sm">
          {error && (
            <div className="mb-4 flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
                <div>
                  <span className="font-semibold">Error:</span> {error}
                </div>
              </div>
              
              {/* Custom Helpful Troubleshooting Guide for the Schema Cache Error */}
              {(error.toLowerCase().includes('password') || error.toLowerCase().includes('profiles') || error.toLowerCase().includes('schema cache') || error.toLowerCase().includes('column')) && !error.toLowerCase().includes('row-level security') && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 animate-in fade-in duration-300">
                  <h4 className="font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
                    💡 Cara Memperbaiki Error Kolom 'password' & Schema Cache:
                  </h4>
                  <p className="mb-2 leading-relaxed text-amber-900/90">
                    Error ini terjadi karena kolom <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-semibold text-amber-950">password</code> belum ada di tabel <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-semibold text-amber-950">profiles</code> Anda di Supabase, atau cache schema API Supabase Anda perlu di-refresh.
                  </p>
                  <p className="mb-2 font-semibold text-amber-950">Langkah penyelesaian:</p>
                  <ol className="list-decimal list-inside space-y-1.5 mb-3 text-amber-900/90 pl-1">
                    <li>Buka <strong>SQL Editor</strong> di Dashboard Supabase Anda.</li>
                    <li>Copy dan jalankan (Run) query SQL berikut untuk menambahkan kolom password dan memaksa reload cache API Supabase:</li>
                  </ol>
                  <div className="bg-[#1F1F1E] rounded-lg p-3 text-[10px] font-mono text-[#D4D4D4] border border-zinc-800 relative mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;
NOTIFY pgrst, 'reload schema';`);
                        alert('SQL berhasil disalin ke clipboard!');
                      }}
                      className="absolute top-1.5 right-1.5 px-2 py-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded text-[9px] transition-colors cursor-pointer"
                    >
                      Copy SQL
                    </button>
                    <pre className="whitespace-pre-wrap">{`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;
NOTIFY pgrst, 'reload schema';`}</pre>
                  </div>
                  <p className="leading-relaxed text-amber-800 font-medium">
                    Setelah berhasil menjalankan SQL tersebut di Supabase, silakan klik tombol pendaftaran atau masuk kembali!
                  </p>
                </div>
              )}

              {/* Custom Helpful Troubleshooting Guide for RLS Policy Violations */}
              {(error.toLowerCase().includes('row-level security') || error.toLowerCase().includes('row_level_security') || error.toLowerCase().includes('rls') || error.toLowerCase().includes('policy')) && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 animate-in fade-in duration-300">
                  <h4 className="font-bold text-rose-950 mb-1.5 flex items-center gap-1.5">
                    🛡️ Cara Memperbaiki Error RLS (Row-Level Security):
                  </h4>
                  <p className="mb-2 leading-relaxed text-rose-900/90">
                    Supabase mengaktifkan <strong>Row-Level Security (RLS)</strong> secara default untuk tabel baru Anda. Karena aplikasi ini menggunakan sistem autentikasi tabel custom, kita perlu menonaktifkan RLS agar klien dapat menyimpan data pengguna baru secara langsung, atau membuat policy permissive.
                  </p>
                  <p className="mb-2 font-semibold text-rose-950">Langkah penyelesaian (Sangat Mudah):</p>
                  <ol className="list-decimal list-inside space-y-1.5 mb-3 text-rose-900/90 pl-1">
                    <li>Buka <strong>SQL Editor</strong> di Dashboard Supabase Anda.</li>
                    <li>Jalankan (Run) query SQL berikut untuk menonaktifkan proteksi RLS pada tabel-tabel utama:</li>
                  </ol>
                  <div className="bg-[#1F1F1E] rounded-lg p-3 text-[10px] font-mono text-[#D4D4D4] border border-zinc-800 relative mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;`);
                        alert('SQL RLS berhasil disalin ke clipboard!');
                      }}
                      className="absolute top-1.5 right-1.5 px-2 py-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded text-[9px] transition-colors cursor-pointer"
                    >
                      Copy SQL
                    </button>
                    <pre className="whitespace-pre-wrap">{`ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;`}</pre>
                  </div>
                  <p className="leading-relaxed text-rose-800 font-medium">
                    Setelah Anda menjalankan SQL di atas di Supabase Anda, silakan coba daftar/masuk lagi! Proses penyimpanan profile akan berjalan lancar dan otomatis tersambung.
                  </p>
                </div>
              )}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-800"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-800"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-zinc-300 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Workspace' : 'Sign In'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400 font-medium">Or quick launch</span>
            </div>

            <div className="mt-4">
              <button
                onClick={handleGuestAccess}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 focus:outline-none transition-colors"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Continue as Guest (Demo Account)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setMessage('');
            }}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
          >
            {isSignUp ? 'Already have a workspace? Sign In' : 'Need a private space? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
