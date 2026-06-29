import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'MY_SUPABASE_URL');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let lastError: string | null = null;

export function setSupabaseError(err: any) {
  if (!err) {
    lastError = null;
    return;
  }
  const msg = typeof err === 'string' 
    ? err 
    : err.message || err.details || err.hint || JSON.stringify(err);
  lastError = msg;
}

export function getSupabaseError(): string | null {
  return lastError;
}

// SQL instructions to paste into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- Create workspace tables to support your Workspace Notion clone!

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  password TEXT
);

-- 2. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  is_pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Todo Lists Table
CREATE TABLE IF NOT EXISTS todo_lists (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  list_id TEXT REFERENCES todo_lists(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT, -- 'todo', 'in-progress', 'done'
  priority TEXT, -- 'low', 'medium', 'high'
  due_date DATE,
  tags TEXT[] DEFAULT '{}'
);

-- Enable Row Level Security (RLS) if you want user separation, or disable them to allow direct client connections:
-- Option A: Disable RLS for all tables (Recommended for simple prototypes)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Option B: Or enable RLS and create public permissive policies (If you want them enabled)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read/write on profiles" ON profiles FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow public read/write on notes" ON notes FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow public read/write on todo_lists" ON todo_lists FOR ALL TO public USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow public read/write on tasks" ON tasks FOR ALL TO public USING (true) WITH CHECK (true);

-- Migration helper: Run these to upgrade your existing tables if they were created in an older version of the app
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;

ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE todo_lists ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
`;
