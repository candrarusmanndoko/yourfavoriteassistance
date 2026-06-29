import React, { useState, useEffect } from 'react';

import { Profile, Note, TodoList, Task } from './types';

import { StorageService, initializeStorage } from './utils/storage';

import { getSupabaseError } from './utils/supabase';

import Auth from './components/Auth';

import Sidebar from './components/Sidebar';

import Dashboard from './components/Dashboard';

import NotesEditor from './components/NotesEditor';

import TodoListTracker from './components/TodoListTracker';

import CommandPalette from './components/CommandPalette';

import CoverImageModal from './components/CoverImageModal';

import CalendarView from './components/CalendarView';

import { Menu } from 'lucide-react';


export default function App() {

const [profile, setProfile] = useState<Profile | null>(null);

const [notes, setNotes] = useState<Note[]>([]);

const [lists, setLists] = useState<TodoList[]>([]);

const [tasks, setTasks] = useState<Task[]>([]);

const [supabaseError, setSupabaseError] = useState<string | null>(null);

const [activeView, setActiveView] = useState<{ type: 'dashboard' | 'note' | 'list' | 'calendar'; id?: string }>({

type: 'dashboard',

});


const [isSearchOpen, setIsSearchOpen] = useState(false);

const [isCoverSelectorOpen, setIsCoverSelectorOpen] = useState(false);

const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

const [initialLoading, setInitialLoading] = useState(true);


// Sync Supabase error state with the global tracker

useEffect(() => {

setSupabaseError(getSupabaseError());

}, [notes, lists, tasks]);


// Initialize storage and check for logged-in user on mount

useEffect(() => {

initializeStorage();

const checkUser = async () => {

try {

const user = await StorageService.getCurrentUser();

if (user) {

setProfile(user);

await loadUserData(user.id);

}

} catch (err) {

console.error('Error checking user session:', err);

} finally {

setInitialLoading(false);

}

};

checkUser();

}, []);


// Set up global Ctrl+K / Cmd+K listener

useEffect(() => {

const handleGlobalKey = (e: KeyboardEvent) => {

if ((e.ctrlKey || e.metaKey) && e.key === 'k') {

e.preventDefault();

setIsSearchOpen((prev) => !prev);

}

};

window.addEventListener('keydown', handleGlobalKey);

return () => window.removeEventListener('keydown', handleGlobalKey);

}, []);


const loadUserData = async (userId: string) => {

try {

const userNotes = await StorageService.getNotes(userId);

setNotes(userNotes);

} catch (err) {

console.error('Error loading notes:', err);

}


try {

const userLists = await StorageService.getTodoLists(userId);

setLists(userLists);

} catch (err) {

console.error('Error loading todo lists:', err);

}


try {

const userTasks = await StorageService.getTasks(userId);

setTasks(userTasks);

} catch (err) {

console.error('Error loading tasks:', err);

}


setSupabaseError(getSupabaseError());

};


const handleAuthSuccess = async (userProfile: Profile) => {

setProfile(userProfile);

await loadUserData(userProfile.id);

setActiveView({ type: 'dashboard' });

};


const handleLogout = async () => {

await StorageService.logout();

setProfile(null);

setNotes([]);

setLists([]);

setTasks([]);

setActiveView({ type: 'dashboard' });

};


// --- CONTROLLER ACTIONS ---


const handleCreateNote = async () => {

if (!profile) return;

const newNote: Note = {

id: 'note_' + Math.random().toString(36).substr(2, 9),

userId: profile.id,

title: '',

content: '',

isPinned: false,

tags: [],

updatedAt: new Date().toISOString(),

};


const saved = await StorageService.saveNote(profile.id, newNote);

setNotes((prev) => [saved, ...prev]);

setActiveView({ type: 'note', id: saved.id });

};


const handleCreateNoteWithDate = async (title: string, dateStr: string) => {

if (!profile) return;

const newNote: Note = {

id: 'note_' + Math.random().toString(36).substr(2, 9),

userId: profile.id,

title: title,

content: `# ${title}\n\nDibuat pada tanggal ${dateStr} melalui Kalender.`,

isPinned: false,

tags: ['Kalender'],

updatedAt: new Date(dateStr).toISOString(),

};


const saved = await StorageService.saveNote(profile.id, newNote);

setNotes((prev) => [saved, ...prev]);

setActiveView({ type: 'note', id: saved.id });

};


const handleCreateTodoList = async () => {

if (!profile) return;

const newList: TodoList = {

id: 'list_' + Math.random().toString(36).substr(2, 9),

userId: profile.id,

name: '🎯 Untitled List',

isPinned: false,

createdAt: new Date().toISOString(),

};


const saved = await StorageService.saveTodoList(profile.id, newList);

setLists((prev) => [...prev, saved]);

setActiveView({ type: 'list', id: saved.id });

};


const handleSaveNote = async (updatedNote: Note) => {

if (!profile) return;

const saved = await StorageService.saveNote(profile.id, updatedNote);

setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));

};


const handleDeleteNote = async (noteId: string) => {

await StorageService.deleteNote(noteId);

setNotes((prev) => prev.filter((n) => n.id !== noteId));

setActiveView({ type: 'dashboard' });

};


const handleSaveList = async (updatedList: TodoList) => {

if (!profile) return;

const saved = await StorageService.saveTodoList(profile.id, updatedList);

setLists((prev) => prev.map((l) => (l.id === saved.id ? saved : l)));

};


const handleDeleteList = async (listId: string) => {

await StorageService.deleteTodoList(listId);

setLists((prev) => prev.filter((l) => l.id !== listId));

setTasks((prev) => prev.filter((t) => t.listId !== listId));

setActiveView({ type: 'dashboard' });

};


const handleSaveTask = async (task: Task) => {

if (!profile) return;

const saved = await StorageService.saveTask(profile.id, task);

setTasks((prev) => {

const idx = prev.findIndex((t) => t.id === saved.id);

if (idx > -1) {

const copy = [...prev];

copy[idx] = saved;

return copy;

}

return [...prev, saved];

});

};


const handleDeleteTask = async (taskId: string) => {

await StorageService.deleteTask(taskId);

setTasks((prev) => prev.filter((t) => t.id !== taskId));

};


const handleToggleTaskStatus = async (taskId: string) => {

if (!profile) return;

const task = tasks.find((t) => t.id === taskId);

if (task) {

const updatedStatus = task.status === 'done' ? 'todo' : 'done';

const updatedTask = { ...task, status: updatedStatus as any };

await handleSaveTask(updatedTask);

}

};


const handleSelectCoverImage = (imageUrl: string) => {

if (activeView.type === 'note' && activeView.id) {

const activeNote = notes.find((n) => n.id === activeView.id);

if (activeNote) {

handleSaveNote({

...activeNote,

coverImage: imageUrl,

});

}

}

};


// Render Loader screen

if (initialLoading) {

return (

<div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center font-sans">

<div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 text-white mb-4 animate-pulse">

<span className="font-mono text-xl font-bold">W</span>

</div>

<p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Opening Workspace...</p>

</div>

);

}


// Auth Guard

if (!profile) {

return <Auth onAuthSuccess={handleAuthSuccess} />;

}


// Page routers

const activeNote = activeView.type === 'note' ? notes.find((n) => n.id === activeView.id) : null;

const activeList = activeView.type === 'list' ? lists.find((l) => l.id === activeView.id) : null;


return (

<div id="workspace-layout" className="flex h-screen bg-white overflow-hidden text-zinc-800 antialiased selection:bg-zinc-100 font-sans">

{/* LEFT SIDEBAR NAVIGATION */}

<Sidebar

profile={profile}

notes={notes}

lists={lists}

activeView={activeView}

onSelectView={setActiveView}

onCreateNote={handleCreateNote}

onCreateTodoList={handleCreateTodoList}

onLogout={handleLogout}

onOpenSearch={() => setIsSearchOpen(true)}

isCollapsed={isSidebarCollapsed}

onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}

/>


{/* MAIN SCREEN AREA */}

<div className="flex-1 flex flex-col min-w-0 h-full relative">

{/* Mobile sidebar header banner */}

<div className="md:hidden flex items-center px-4 py-3 border-b border-zinc-150 bg-zinc-50/50 justify-between shrink-0">

<div className="flex items-center gap-2">

<button

onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}

className="p-1 hover:bg-zinc-200 rounded-md text-zinc-600 focus:outline-none"

>

<Menu className="h-5 w-5" />

</button>

<span className="font-bold text-xs tracking-tight text-zinc-800 uppercase">Workspace</span>

</div>

<button

onClick={() => setIsSearchOpen(true)}

className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md"

>

🔍

</button>

</div>


{/* Dynamic Route Content Renders */}

<div className="flex-1 overflow-hidden h-full">

{activeView.type === 'dashboard' && (

<div className="h-full overflow-y-auto">

<Dashboard

profile={profile}

notes={notes}

lists={lists}

tasks={tasks}

supabaseError={supabaseError}

onSelectNote={(id) => setActiveView({ type: 'note', id })}

onSelectTodoList={(id) => setActiveView({ type: 'list', id })}

onCreateNote={handleCreateNote}

onCreateTodoList={handleCreateTodoList}

onToggleTaskStatus={handleToggleTaskStatus}

onOpenSearch={() => setIsSearchOpen(true)}

/>

</div>

)}


{activeView.type === 'note' && activeNote && (

<NotesEditor

key={activeNote.id}

note={activeNote}

onSaveNote={handleSaveNote}

onDeleteNote={handleDeleteNote}

onOpenCoverSelector={() => setIsCoverSelectorOpen(true)}

/>

)}


{activeView.type === 'note' && !activeNote && (

<div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8">

<p className="text-sm font-semibold">Note not found</p>

<button

onClick={() => setActiveView({ type: 'dashboard' })}

className="mt-3 px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800"

>

Go to Dashboard

</button>

</div>

)}


{activeView.type === 'list' && activeList && (

<TodoListTracker

key={activeList.id}

list={activeList}

tasks={tasks}

onSaveList={handleSaveList}

onDeleteList={handleDeleteList}

onSaveTask={handleSaveTask}

onDeleteTask={handleDeleteTask}

/>

)}


{activeView.type === 'list' && !activeList && (

<div className="h-full flex flex-col items-center justify-center text-zinc-400 p-8">

<p className="text-sm font-semibold">List not found</p>

<button

onClick={() => setActiveView({ type: 'dashboard' })}

className="mt-3 px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800"

>

Go to Dashboard

</button>

</div>

)}


{activeView.type === 'calendar' && (

<CalendarView

notes={notes}

lists={lists}

tasks={tasks}

onSelectNote={(id) => setActiveView({ type: 'note', id })}

onSelectTodoList={(id) => setActiveView({ type: 'list', id })}

onSaveTask={handleSaveTask}

onDeleteTask={handleDeleteTask}

onCreateNoteWithDate={handleCreateNoteWithDate}

/>

)}

</div>

</div>


{/* GLOBAL SEARCH COMMAND PALETTE MODAL */}

<CommandPalette

isOpen={isSearchOpen}

onClose={() => setIsSearchOpen(false)}

notes={notes}

lists={lists}

tasks={tasks}

onSelectNote={(id) => setActiveView({ type: 'note', id })}

onSelectTodoList={(id) => setActiveView({ type: 'list', id })}

onSelectDashboard={() => setActiveView({ type: 'dashboard' })}

onCreateNote={handleCreateNote}

onCreateTodoList={handleCreateTodoList}

/>


{/* COVER IMAGE SELECTOR MODAL */}

<CoverImageModal

isOpen={isCoverSelectorOpen}

onClose={() => setIsCoverSelectorOpen(false)}

onSelectImage={handleSelectCoverImage}

/>

</div>

);

}


