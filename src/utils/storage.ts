import { Note, TodoList, Task, Profile, TaskStatus, TaskPriority } from '../types';
import { supabase, isSupabaseConfigured, setSupabaseError } from './supabase';

export function initializeStorage() {
  // Noop: removed local storage seeds to ensure direct Supabase database usage
}

// Low latency delay utility
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const StorageService = {
  // --- AUTH SECTION ---
  async getCurrentUser(): Promise<Profile | null> {
    const currentUserId = localStorage.getItem('ws_current_user_id');
    if (!currentUserId) return null;
    
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .maybeSingle();
      
      if (error) throw error;
      if (data) {
        const profile: Profile = {
          id: data.id,
          email: data.email || '',
          fullName: data.full_name || '',
        };
        localStorage.setItem('ws_profile', JSON.stringify(profile));
        setSupabaseError(null);
        return profile;
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async login(email: string, password: string): Promise<Profile> {
    await delay(300);
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (error) throw error;
      if (!data) {
        throw new Error('User not found in Supabase profiles. Please sign up.');
      }

      if (data.password && data.password !== password) {
        throw new Error('Incorrect password.');
      }

      const profile: Profile = {
        id: data.id,
        email: data.email || '',
        fullName: data.full_name || '',
      };
      localStorage.setItem('ws_current_user_id', profile.id);
      localStorage.setItem('ws_profile', JSON.stringify(profile));
      setSupabaseError(null);
      return profile;
    } catch (err) {
      console.error('Error login via Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async signup(email: string, password: string, fullName: string): Promise<Profile> {
    await delay(300);
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (checkError) throw checkError;
      if (existing) {
        throw new Error('A user with this email already exists in Supabase profiles.');
      }

      const newId = 'user_' + Math.random().toString(36).substr(2, 9);
      const profile: Profile = { id: newId, email, fullName };

      const { error: insertError } = await supabase.from('profiles').insert({
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName,
        password: password
      });
      if (insertError) throw insertError;

      localStorage.setItem('ws_current_user_id', newId);
      localStorage.setItem('ws_profile', JSON.stringify(profile));

      const defaultListId = 'list_welcome_' + newId;

      const { error: noteError } = await supabase.from('notes').insert({
        id: 'note_welcome_' + newId,
        user_id: newId,
        title: `👋 Welcome ${fullName}!`,
        content: `# Hello and welcome to your new Workspace!\n\nThis is your very first private note. All data is securely isolated for your account and stored in your Supabase cloud database.\n\n### Workspace tips:\n- Create new pages by clicking the **+ Add Page** button in the sidebar.\n- Track your goals and tasks in the **To-Do Lists** section.\n- Tag notes with #tags to organize them.\n- Pin notes to find them quickly under your Favorites!`,
        is_pinned: true,
        tags: ['Personal', 'Welcome'],
        updated_at: new Date().toISOString(),
      });
      if (noteError) throw noteError;

      const { error: listError } = await supabase.from('todo_lists').insert({
        id: defaultListId,
        user_id: newId,
        name: '🎯 Daily Planner',
        is_pinned: false,
        created_at: new Date().toISOString(),
      });
      if (listError) throw listError;

      const { error: tasksError } = await supabase.from('tasks').insert([
        {
          id: 'task_welcome_1_' + newId,
          list_id: defaultListId,
          user_id: newId,
          title: 'Create your first custom Note',
          status: 'todo',
          priority: 'high',
          due_date: new Date().toISOString().split('T')[0],
          tags: ['Onboarding'],
        },
        {
          id: 'task_welcome_2_' + newId,
          list_id: defaultListId,
          user_id: newId,
          title: 'Explore the Kanban Board view',
          status: 'todo',
          priority: 'medium',
          due_date: new Date().toISOString().split('T')[0],
          tags: ['Onboarding'],
        }
      ]);
      if (tasksError) throw tasksError;

      setSupabaseError(null);
      return profile;
    } catch (err) {
      console.error('Error signing up via Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('ws_current_user_id');
    localStorage.removeItem('ws_profile');
  },

  // --- NOTES SECTION ---
  async getNotes(userId: string): Promise<Note[]> {
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        const notes: Note[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          title: item.title || '',
          content: item.content || '',
          isPinned: item.is_pinned || false,
          tags: item.tags || [],
          coverImage: item.cover_image || undefined,
          updatedAt: item.updated_at,
        }));
        setSupabaseError(null);
        return notes;
      }
      return [];
    } catch (err) {
      console.error('Error fetching notes from Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async saveNote(userId: string, note: Note): Promise<Note> {
    await delay(100);
    const updatedNote = { ...note, userId, updatedAt: new Date().toISOString() };

    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { error } = await supabase.from('notes').upsert({
        id: updatedNote.id,
        user_id: userId,
        title: updatedNote.title,
        content: updatedNote.content,
        is_pinned: updatedNote.isPinned,
        tags: updatedNote.tags,
        cover_image: updatedNote.coverImage || null,
        updated_at: updatedNote.updatedAt
      });
      if (error) throw error;
      setSupabaseError(null);
      return updatedNote;
    } catch (err) {
      console.error('Error saving note to Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async deleteNote(noteId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;
      setSupabaseError(null);
      return;
    } catch (err) {
      console.error('Error deleting note from Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  // --- TODO LIST SECTION ---
  async getTodoLists(userId: string): Promise<TodoList[]> {
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data, error } = await supabase
        .from('todo_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      if (data) {
        const lists: TodoList[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          name: item.name || '',
          isPinned: item.is_pinned || false,
          createdAt: item.created_at,
        }));
        setSupabaseError(null);
        return lists;
      }
      return [];
    } catch (err) {
      console.error('Error fetching todo lists from Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async saveTodoList(userId: string, list: TodoList): Promise<TodoList> {
    const updatedList = { ...list, userId };

    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { error } = await supabase.from('todo_lists').upsert({
        id: updatedList.id,
        user_id: userId,
        name: updatedList.name,
        is_pinned: updatedList.isPinned,
        created_at: updatedList.createdAt || new Date().toISOString()
      });
      if (error) throw error;
      setSupabaseError(null);
      return updatedList;
    } catch (err) {
      console.error('Error saving todo list to Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async deleteTodoList(listId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      await supabase.from('tasks').delete().eq('list_id', listId);
      const { error } = await supabase.from('todo_lists').delete().eq('id', listId);
      if (error) throw error;
      setSupabaseError(null);
      return;
    } catch (err) {
      console.error('Error deleting todo list from Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  // --- TASKS SECTION ---
  async getTasks(userId: string): Promise<Task[]> {
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      if (data) {
        const tasks: Task[] = data.map(item => ({
          id: item.id,
          listId: item.list_id,
          userId: item.user_id,
          title: item.title || '',
          status: item.status as TaskStatus,
          priority: item.priority as TaskPriority,
          dueDate: item.due_date || undefined,
          tags: item.tags || [],
        }));
        setSupabaseError(null);
        return tasks;
      }
      return [];
    } catch (err) {
      console.error('Error fetching tasks from Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async saveTask(userId: string, task: Task): Promise<Task> {
    const updatedTask = { ...task, userId };

    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { error } = await supabase.from('tasks').upsert({
        id: updatedTask.id,
        list_id: updatedTask.listId,
        user_id: userId,
        title: updatedTask.title,
        status: updatedTask.status,
        priority: updatedTask.priority,
        due_date: updatedTask.dueDate || null,
        tags: updatedTask.tags
      });
      if (error) throw error;
      setSupabaseError(null);
      return updatedTask;
    } catch (err) {
      console.error('Error saving task to Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      const errorMsg = 'Supabase is not configured! Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
      setSupabaseError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setSupabaseError(null);
      return;
    } catch (err) {
      console.error('Error deleting task from Supabase:', err);
      setSupabaseError(err);
      throw err;
    }
  }
};
