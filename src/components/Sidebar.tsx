import React from 'react';

import { Note, TodoList, Profile } from '../types';

import { isSupabaseConfigured } from '../utils/supabase';

import {

Home,

FileText,

List,

Plus,

Star,

LogOut,

ChevronLeft,

ChevronRight,

Search,

Command,

User,

Sparkles,

Bookmark,

Database,

CloudLightning,

Calendar

} from 'lucide-react';


interface SidebarProps {

profile: Profile;

notes: Note[];

lists: TodoList[];

activeView: { type: 'dashboard' | 'note' | 'list' | 'calendar'; id?: string };

onSelectView: (view: { type: 'dashboard' | 'note' | 'list' | 'calendar'; id?: string }) => void;

onCreateNote: () => void;

onCreateTodoList: () => void;

onLogout: () => void;

onOpenSearch: () => void;

isCollapsed: boolean;

onToggleCollapse: () => void;

}


export default function Sidebar({

profile,

notes,

lists,

activeView,

onSelectView,

onCreateNote,

onCreateTodoList,

onLogout,

onOpenSearch,

isCollapsed,

onToggleCollapse,

}: SidebarProps) {

const pinnedNotes = notes.filter((n) => n.isPinned);

const pinnedLists = lists.filter((l) => l.isPinned);


if (isCollapsed) {

return (

<div className="w-14 bg-[#F7F7F5] border-r border-[#EDEDEB] flex flex-col items-center py-4 justify-between h-full font-sans transition-all duration-300 shrink-0">

<div className="flex flex-col items-center gap-4 w-full">

{/* Collapse toggle */}

<button

onClick={onToggleCollapse}

className="p-1.5 hover:bg-[#EFEFEF] rounded-md text-[#91918E] transition-colors"

title="Expand Sidebar"

>

<ChevronRight className="h-4.5 w-4.5" />

</button>


{/* Quick search Icon */}

<button

onClick={onOpenSearch}

className="p-2 bg-white hover:bg-[#EFEFEF] border border-[#EDEDEB] shadow-xs rounded-xl text-[#91918E]"

title="Search Workspace (Ctrl+K)"

>

<Search className="h-4 w-4" />

</button>


<hr className="border-t border-[#EDEDEB] w-8 my-1" />


{/* Core Navigation Icons */}

<button

onClick={() => onSelectView({ type: 'dashboard' })}

className={`p-2 rounded-lg transition-colors ${

activeView.type === 'dashboard' ? 'bg-[#37352F] text-white' : 'text-[#7E7D77] hover:bg-[#EFEFEF]'

}`}

title="Dashboard Overview"

>

<Home className="h-4 w-4" />

</button>


<button

onClick={() => onSelectView({ type: 'calendar' })}

className={`p-2 rounded-lg transition-colors ${

activeView.type === 'calendar' ? 'bg-[#37352F] text-white' : 'text-[#7E7D77] hover:bg-[#EFEFEF]'

}`}

title="Workspace Calendar"

>

<Calendar className="h-4 w-4" />

</button>


{/* Add actions shortcut */}

<button

onClick={onCreateNote}

className="p-2 rounded-lg text-[#7E7D77] hover:bg-[#EFEFEF] hover:text-[#37352F] transition-colors"

title="New Note Page"

>

<Plus className="h-4 w-4" />

</button>

</div>


{/* Bottom Profile / Logout actions */}

<div className="flex flex-col items-center gap-3">

<div className="relative">

<div className="h-8 w-8 rounded-full bg-[#37352F] text-white font-mono flex items-center justify-center font-bold text-xs" title={profile.fullName}>

{profile.fullName.charAt(0)}

</div>

<span 

className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white ${

isSupabaseConfigured ? 'bg-green-500 animate-pulse' : 'bg-amber-500'

}`}

title={isSupabaseConfigured ? 'Synced with Supabase Cloud' : 'Local storage fallback'}

/>

</div>

<button

onClick={onLogout}

className="p-1.5 text-[#91918E] hover:text-[#37352F] rounded-md hover:bg-[#EFEFEF] transition-colors"

title="Logout"

>

<LogOut className="h-4 w-4" />

</button>

</div>

</div>

);

}


return (

<div className="w-64 bg-[#F7F7F5] border-r border-[#EDEDEB] flex flex-col justify-between h-full font-sans transition-all duration-300 shrink-0">

<div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-6">

{/* Top Header & Collapse Button */}

<div className="flex items-center justify-between px-1.5">

<div className="flex items-center gap-2">

<div className="h-7 w-7 rounded bg-[#37352F] text-white flex items-center justify-center font-bold text-xs">

{profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'A'}

</div>

<span className="font-semibold text-[14px] text-[#37352F] tracking-tight">

{profile.fullName ? `${profile.fullName}'s Workspace` : 'Workspace'}

</span>

</div>

<button

onClick={onToggleCollapse}

className="p-1 hover:bg-[#EFEFEF] rounded-md text-[#91918E] hover:text-[#37352F] transition-colors"

title="Collapse Sidebar"

>

<ChevronLeft className="h-4 w-4" />

</button>

</div>


{/* Command Search Box Input Widget */}

<button

onClick={onOpenSearch}

className="w-full flex items-center justify-between px-3 py-1.5 bg-white border border-[#EDEDEB] shadow-2xs hover:border-[#EDEDEB] hover:bg-[#F7F7F5] rounded-lg transition-all group"

>

<div className="flex items-center gap-2 text-[#91918E]">

<Search className="h-3.5 w-3.5 group-hover:text-[#37352F]" />

<span className="text-[12px] font-medium tracking-wide">Search</span>

</div>

<div className="flex items-center gap-0.5 text-[9px] bg-white px-1 py-0.5 rounded text-[#91918E] border border-[#EDEDEB]">

<Command className="h-2 w-2" />

<span>K</span>

</div>

</button>


{/* Core Navigation Link */}

<div className="space-y-1">

<button

onClick={() => onSelectView({ type: 'dashboard' })}

className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all ${

activeView.type === 'dashboard'

? 'bg-[#EFEFEF] text-[#37352F] font-semibold'

: 'text-[#7E7D77] hover:bg-[#EFEFEF] hover:text-[#37352F]'

}`}

>

<Home className="h-4 w-4 text-[#7E7D77]" />

<span>Dashboard</span>

</button>


<button

onClick={() => onSelectView({ type: 'calendar' })}

className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all ${

activeView.type === 'calendar'

? 'bg-[#EFEFEF] text-[#37352F] font-semibold'

: 'text-[#7E7D77] hover:bg-[#EFEFEF] hover:text-[#37352F]'

}`}

>

<Calendar className="h-4 w-4 text-[#7E7D77]" />

<span>Kalender</span>

</button>

</div>


{/* FAVORITES (PINNED ITEMS) */}

{(pinnedNotes.length > 0 || pinnedLists.length > 0) && (

<div className="space-y-1">

<div className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#91918E] flex items-center gap-1.5">

<Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />

<span>Favorites</span>

</div>

<div className="space-y-0.5 pl-1">

{pinnedNotes.map((note) => (

<button

key={note.id}

onClick={() => onSelectView({ type: 'note', id: note.id })}

className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-md text-sm transition-colors truncate ${

activeView.type === 'note' && activeView.id === note.id

? 'bg-[#EFEFEF] text-[#37352F] font-semibold'

: 'text-[#7E7D77] hover:bg-[#EFEFEF] hover:text-[#37352F]'

}`}

>

<span className="text-xs">🚀</span>

<span className="truncate">{note.title || 'Untitled Note'}</span>

</button>

))}


{pinnedLists.map((list) => (

<button

key={list.id}

onClick={() => onSelectView({ type: 'list', id: list.id })}

className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-md text-sm transition-colors truncate ${

activeView.type === 'list' && activeView.id === list.id

? 'bg-[#EFEFEF] text-[#37352F] font-semibold'

: 'text-[#7E7D77] hover:bg-[#EFEFEF] hover:text-[#37352F]'

}`}

>

<span className="text-xs">📋</span>

<span className="truncate">{list.name}</span>

</button>

))}

</div>

</div>

)}


{/* NOTES SECTION */}

<div className="space-y-1">

<div className="flex items-center justify-between px-2.5">

<span className="text-[11px] font-semibold uppercase tracking-wider text-[#91918E]">Private</span>

<button

onClick={onCreateNote}

className="p-0.5 hover:bg-[#EFEFEF] rounded text-[#91918E] hover:text-[#37352F] transition-colors"

title="Add Page"

>

<Plus className="h-3.5 w-3.5" />

</button>

</div>

<div className="space-y-0.5 pl-1">

{notes.length === 0 ? (

<p className="px-2.5 py-1.5 text-xs text-[#91918E] italic">No pages created</p>

) : (

notes.map((note) => (

<button

key={note.id}

onClick={() => onSelectView({ type: 'note', id: note.id })}

className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors truncate ${

activeView.type === 'note' && activeView.id === note.id

? 'bg-[#EFEFEF] text-[#37352F] font-semibold'

: 'text-[#7E7D77] hover:bg-[#EFEFEF] hover:text-[#37352F]'

}`}

>

<span className="text-xs">📝</span>

<span className="truncate">{note.title || 'Untitled Note'}</span>

</button>

))

)}

</div>

</div>


{/* TO-DO LISTS SECTION */}

<div className="space-y-1">

<div className="flex items-center justify-between px-2.5">

<span className="text-[11px] font-semibold uppercase tracking-wider text-[#91918E]">To-Do Lists</span>

<button

onClick={onCreateTodoList}

className="p-0.5 hover:bg-[#EFEFEF] rounded text-[#91918E] hover:text-[#37352F] transition-colors"

title="Add List"

>

<Plus className="h-3.5 w-3.5" />

</button>

</div>

<div className="space-y-0.5 pl-1">

{lists.length === 0 ? (

<p className="px-2.5 py-1.5 text-xs text-[#91918E] italic">No active lists</p>

) : (

lists.map((list) => (

<button

key={list.id}

onClick={() => onSelectView({ type: 'list', id: list.id })}

className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors truncate ${

activeView.type === 'list' && activeView.id === list.id

? 'bg-[#EFEFEF] text-[#37352F] font-semibold'

: 'text-[#7E7D77] hover:bg-[#EFEFEF] hover:text-[#37352F]'

}`}

>

<span className="text-xs">📋</span>

<span className="truncate">{list.name}</span>

</button>

))

)}

</div>

</div>

</div>


{/* Supabase Integration Sync Banner */}

<div className="px-4 py-2.5 mx-3.5 mb-2 rounded-xl border border-dashed text-[11px] leading-relaxed transition-all">

{isSupabaseConfigured ? (

<div className="flex flex-col gap-1">

<div className="flex items-center gap-2 text-green-700 font-semibold">

<span className="relative flex h-2 w-2">

<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>

<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>

</span>

<span>Supabase Cloud Connected</span>

</div>

<p className="text-[10px] text-[#7E7D77]">All notes and tasks are securely synchronized with your cloud database.</p>

</div>

) : (

<div className="flex flex-col gap-1.5">

<div className="flex items-center gap-2 text-amber-700 font-semibold">

<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>

<span>Local Fallback Mode</span>

</div>

<p className="text-[10px] text-[#7E7D77] leading-tight">

To connect your real cloud database, configure <code className="px-1 py-0.2 rounded bg-amber-50/50 text-amber-800 font-mono text-[9px] border border-amber-100">VITE_SUPABASE_URL</code> in environment variables.

</p>

</div>

)}

</div>


{/* User profile footer bar */}

<div className="border-t border-[#EDEDEB] p-3 bg-[#F7F7F5] flex items-center justify-between">

<div className="flex items-center gap-2 min-w-0">

<div className="h-8 w-8 rounded bg-[#37352F] text-white font-semibold flex items-center justify-center text-xs shrink-0">

{profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'A'}

</div>

<div className="min-w-0">

<p className="text-xs font-semibold text-[#37352F] truncate leading-tight">{profile.fullName}</p>

<p className="text-[10px] text-[#91918E] truncate leading-normal">{profile.email}</p>

</div>

</div>

<button

onClick={onLogout}

className="p-1.5 text-[#91918E] hover:text-red-600 hover:bg-[#EFEFEF] rounded-md transition-colors"

title="Sign out of workspace"

>

<LogOut className="h-4 w-4" />

</button>

</div>

</div>

);

}


