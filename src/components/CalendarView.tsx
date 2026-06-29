import React, { useState } from 'react';

import { Note, TodoList, Task, TaskPriority, TaskStatus } from '../types';

import {

Calendar as CalendarIcon,

ChevronLeft,

ChevronRight,

Plus,

FileText,

CheckCircle,

Clock,

CheckSquare,

Square,

X,

Tag,

Search,

AlertCircle,

Trash2,

ExternalLink,

ClipboardList,

Sparkles,

ListTodo

} from 'lucide-react';


interface CalendarViewProps {

notes: Note[];

lists: TodoList[];

tasks: Task[];

onSelectNote: (noteId: string) => void;

onSelectTodoList: (listId: string) => void;

onSaveTask: (task: Task) => Promise<void>;

onDeleteTask: (taskId: string) => Promise<void>;

onCreateNoteWithDate: (title: string, dateStr: string) => Promise<void>;

}


// Utility to parse ISO date string to YYYY-MM-DD local timezone date

const getLocalDateString = (isoString: string) => {

try {

const d = new Date(isoString);

if (isNaN(d.getTime())) return '';

const year = d.getFullYear();

const month = String(d.getMonth() + 1).padStart(2, '0');

const day = String(d.getDate()).padStart(2, '0');

return `${year}-${month}-${day}`;

} catch (e) {

return '';

}

};


const formatFullDate = (dateStr: string) => {

try {

const d = new Date(dateStr);

return new Intl.DateTimeFormat('id-ID', {

weekday: 'long',

year: 'numeric',

month: 'long',

day: 'numeric'

}).format(d);

} catch {

return dateStr;

}

};


const INDONESIAN_MONTHS = [

'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',

'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'

];


const INDONESIAN_WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];


export default function CalendarView({

notes,

lists,

tasks,

onSelectNote,

onSelectTodoList,

onSaveTask,

onDeleteTask,

onCreateNoteWithDate,

}: CalendarViewProps) {

const [currentDate, setCurrentDate] = useState<Date>(new Date());

const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

// Search & Filter state

const [searchQuery, setSearchQuery] = useState('');

const [filterType, setFilterType] = useState<'all' | 'tasks' | 'notes'>('all');

const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');


// Quick Task Creation state

const [quickTaskTitle, setQuickTaskTitle] = useState('');

const [quickTaskPriority, setQuickTaskPriority] = useState<TaskPriority>('medium');

const [quickTaskListId, setQuickTaskListId] = useState('');


// Handle month shifts

const handlePrevMonth = () => {

setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

};


const handleNextMonth = () => {

setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

};


const handleToday = () => {

setCurrentDate(new Date());

};


const year = currentDate.getFullYear();

const month = currentDate.getMonth();


// Create monthly grid cells

const firstDayOfMonth = new Date(year, month, 1);

const startDayOfWeek = firstDayOfMonth.getDay();

const totalDaysInMonth = new Date(year, month + 1, 0).getDate();


const prevMonthYear = month === 0 ? year - 1 : year;

const prevMonth = month === 0 ? 11 : month - 1;

const totalDaysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();


const dayCells = [];


// Previous month padding days

for (let i = startDayOfWeek - 1; i >= 0; i--) {

const d = totalDaysInPrevMonth - i;

const dateStr = `${prevMonthYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

dayCells.push({

dayNum: d,

dateStr,

isCurrentMonth: false,

date: new Date(prevMonthYear, prevMonth, d)

});

}


// Current month days

for (let d = 1; d <= totalDaysInMonth; d++) {

const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

dayCells.push({

dayNum: d,

dateStr,

isCurrentMonth: true,

date: new Date(year, month, d)

});

}


// Next month padding days to round up to complete grids (multiple of 7, i.e., 35 or 42)

const totalCells = dayCells.length <= 35 ? 35 : 42;

const remainingCells = totalCells - dayCells.length;

const nextMonthYear = month === 11 ? year + 1 : year;

const nextMonth = month === 11 ? 0 : month + 1;

for (let d = 1; d <= remainingCells; d++) {

const dateStr = `${nextMonthYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

dayCells.push({

dayNum: d,

dateStr,

isCurrentMonth: false,

date: new Date(nextMonthYear, nextMonth, d)

});

}


const todayStr = getLocalDateString(new Date().toISOString());


// Function to gather items for any specific date cell

const getItemsForDate = (dateStr: string) => {

const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

const dayNotes = notes.filter((n) => getLocalDateString(n.updatedAt) === dateStr);


// Apply Filters & Search

const filteredTasks = dayTasks.filter((t) => {

const matchesSearch = searchQuery ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;

const matchesPriority = filterPriority === 'all' ? true : t.priority === filterPriority;

const matchesType = filterType === 'all' || filterType === 'tasks';

return matchesSearch && matchesPriority && matchesType;

});


const filteredNotes = dayNotes.filter((n) => {

const matchesSearch = searchQuery ? (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())) : true;

const matchesType = filterType === 'all' || filterType === 'notes';

return matchesSearch && matchesType;

});


return {

tasks: filteredTasks,

notes: filteredNotes,

hasData: filteredTasks.length > 0 || filteredNotes.length > 0,

rawCount: dayTasks.length + dayNotes.length // pre-filter count

};

};


const selectedDateItems = selectedDateStr ? getItemsForDate(selectedDateStr) : { tasks: [], notes: [], hasData: false, rawCount: 0 };


// Quick Action: Add a new task on the selected date

const handleAddQuickTask = async (e: React.FormEvent) => {

e.preventDefault();

if (!selectedDateStr || !quickTaskTitle.trim()) return;


// Must belong to a list, try to find first list if none selected

let targetListId = quickTaskListId;

if (!targetListId && lists.length > 0) {

targetListId = lists[0].id;

}

if (!targetListId) {

alert('Silakan buat daftar tugas (To-Do List) terlebih dahulu di menu samping!');

return;

}


const newTask: Task = {

id: 'task_cal_' + Math.random().toString(36).substr(2, 9),

listId: targetListId,

userId: '', // Handled by backend/App

title: quickTaskTitle.trim(),

status: 'todo',

priority: quickTaskPriority,

dueDate: selectedDateStr,

tags: ['Calendar']

};


try {

await onSaveTask(newTask);

setQuickTaskTitle('');

} catch (err) {

console.error('Error adding task from calendar:', err);

}

};


// Quick Action: Add a new note for the selected date

const handleAddQuickNote = async () => {

if (!selectedDateStr) return;

const formattedDate = formatFullDate(selectedDateStr);

const title = `Catatan - ${formattedDate}`;

try {

await onCreateNoteWithDate(title, selectedDateStr);

setSelectedDateStr(null);

} catch (err) {

console.error('Error creating note from calendar:', err);

}

};


return (

<div id="calendar-full-view" className="flex flex-col h-full bg-[#FCFCFA] font-sans text-[#37352F]">

{/* Top Banner Control Panel */}

<div className="bg-white border-b border-[#EDEDEB] px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">

<div>

<div className="flex items-center gap-2 mb-1">

<div className="p-1.5 bg-[#F7F7F5] rounded-lg text-[#37352F] border border-[#EDEDEB]">

<CalendarIcon className="h-4.5 w-4.5" />

</div>

<h1 className="text-xl font-bold tracking-tight text-[#37352F]">Kalender Workspace</h1>

</div>

<p className="text-xs text-[#91918E]">

Jadwal kegiatan terpusat. Kelola dan rencanakan seluruh To-Do list dan catatan berdasarkan tenggat tanggal.

</p>

</div>


{/* Filter Toolbar */}

<div className="flex flex-wrap items-center gap-2 text-xs">

{/* Text Search */}

<div className="relative">

<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#91918E]" />

<input

type="text"

placeholder="Cari agenda..."

value={searchQuery}

onChange={(e) => setSearchQuery(e.target.value)}

className="pl-8 pr-3 py-1.5 bg-[#F7F7F5] border border-[#EDEDEB] hover:border-zinc-300 focus:border-zinc-400 focus:bg-white rounded-lg outline-none w-44 transition-all"

/>

</div>


{/* Type filter */}

<select

value={filterType}

onChange={(e) => setFilterType(e.target.value as any)}

className="px-2.5 py-1.5 bg-[#F7F7F5] border border-[#EDEDEB] rounded-lg text-zinc-600 outline-none hover:bg-zinc-100 cursor-pointer"

>

<option value="all">Semua Jenis</option>

<option value="tasks">📋 Hanya Tugas (To-Do)</option>

<option value="notes">📝 Hanya Catatan</option>

</select>


{/* Priority filter */}

<select

value={filterPriority}

onChange={(e) => setFilterPriority(e.target.value as any)}

className="px-2.5 py-1.5 bg-[#F7F7F5] border border-[#EDEDEB] rounded-lg text-zinc-600 outline-none hover:bg-zinc-100 cursor-pointer"

>

<option value="all">Semua Prioritas</option>

<option value="high">🔥 Tinggi</option>

<option value="medium">⚡ Sedang</option>

<option value="low">🌱 Rendah</option>

</select>

</div>

</div>


{/* Main Calendar Navigation Header */}

<div className="px-8 py-4 flex items-center justify-between bg-[#F7F7F5] border-b border-[#EDEDEB] shrink-0">

<div className="flex items-center gap-2">

<button

onClick={handlePrevMonth}

className="p-1.5 hover:bg-white border border-transparent hover:border-[#EDEDEB] rounded-lg text-zinc-600 transition-all cursor-pointer"

title="Bulan Sebelumnya"

>

<ChevronLeft className="h-4.5 w-4.5" />

</button>

<h2 className="text-sm font-bold text-[#37352F] min-w-32 text-center">

{INDONESIAN_MONTHS[month]} {year}

</h2>


<button

onClick={handleNextMonth}

className="p-1.5 hover:bg-white border border-transparent hover:border-[#EDEDEB] rounded-lg text-zinc-600 transition-all cursor-pointer"

title="Bulan Berikutnya"

>

<ChevronRight className="h-4.5 w-4.5" />

</button>


<button

onClick={handleToday}

className="ml-2 px-3 py-1 bg-white hover:bg-zinc-100 border border-[#EDEDEB] rounded-lg text-xs font-semibold text-zinc-600 shadow-3xs transition-all cursor-pointer"

>

Hari Ini

</button>

</div>


{/* Legend */}

<div className="hidden sm:flex items-center gap-4 text-[11px] text-[#7E7D77]">

<div className="flex items-center gap-1.5">

<span className="h-2 w-2 rounded-full bg-blue-500"></span>

<span>Tugas Aktif</span>

</div>

<div className="flex items-center gap-1.5">

<span className="h-2 w-2 rounded-full bg-green-500"></span>

<span>Catatan</span>

</div>

<div className="flex items-center gap-1.5">

<span className="h-2 w-2 rounded-full bg-zinc-300"></span>

<span>Tugas Selesai</span>

</div>

</div>

</div>


{/* Grid Content Wrapper */}

<div className="flex-1 overflow-hidden flex flex-row relative h-full">

<div className="flex-1 flex flex-col h-full overflow-y-auto">

{/* Week Days Names Row */}

<div className="grid grid-cols-7 bg-[#F7F7F5] border-b border-[#EDEDEB] text-center text-xs font-semibold text-[#91918E] py-2">

{INDONESIAN_WEEKDAYS.map((day) => (

<div key={day} className="py-1">{day}</div>

))}

</div>


{/* Day Cells Grid */}

<div className="grid grid-cols-7 grid-rows-6 flex-1 bg-[#EDEDEB] gap-[1px]">

{dayCells.map((cell, idx) => {

const { tasks: dayTasks, notes: dayNotes, hasData } = getItemsForDate(cell.dateStr);

const isToday = cell.dateStr === todayStr;


return (

<div

key={`${cell.dateStr}-${idx}`}

onClick={() => setSelectedDateStr(cell.dateStr)}

className={`min-h-20 sm:min-h-24 bg-white p-2 flex flex-col justify-between transition-all cursor-pointer group hover:bg-[#FDFDFD] relative ${

cell.isCurrentMonth ? 'text-[#37352F]' : 'text-zinc-300 bg-zinc-50/50'

} ${isToday ? 'bg-blue-50/30 ring-2 ring-blue-500/10 ring-inset' : ''}`}

>

{/* Cell Top Header */}

<div className="flex items-center justify-between mb-1">

<span

className={`text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full transition-all ${

isToday

? 'bg-blue-600 text-white shadow-xs'

: 'group-hover:bg-[#EFEFEF]'

}`}

>

{cell.dayNum}

</span>


{/* Quick indicator badges */}

{hasData && (

<span className="text-[10px] text-zinc-400 font-mono px-1">

{dayTasks.length + dayNotes.length}

</span>

)}

</div>


{/* Cell Scrollable Item Stack */}

<div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[140px] pr-0.5 scrollbar-thin">

{/* Render Day Notes */}

{dayNotes.slice(0, 2).map((note) => (

<div

key={note.id}

onClick={(e) => {

e.stopPropagation();

onSelectNote(note.id);

}}

className="text-[10px] leading-tight px-1.5 py-0.5 rounded bg-green-50 border border-green-100 hover:bg-green-100/75 text-green-800 font-medium truncate flex items-center gap-1 transition-all"

title={`Catatan: ${note.title || 'Tanpa Judul'}`}

>

<FileText className="h-2.5 w-2.5 shrink-0 text-green-600" />

<span className="truncate">{note.title || 'Untitled'}</span>

</div>

))}


{/* Render Day Tasks */}

{dayTasks.slice(0, 3).map((task) => (

<div

key={task.id}

onClick={(e) => {

e.stopPropagation();

setSelectedDateStr(cell.dateStr);

}}

className={`text-[10px] leading-tight px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all truncate ${

task.status === 'done'

? 'bg-zinc-50 border-zinc-200 text-zinc-400 line-through'

: task.priority === 'high'

? 'bg-red-50 border-red-100 hover:bg-red-100/50 text-red-700 font-medium'

: task.priority === 'medium'

? 'bg-blue-50 border-blue-100 hover:bg-blue-100/50 text-blue-700 font-medium'

: 'bg-zinc-50 border-zinc-150 hover:bg-zinc-100 text-[#37352F]'

}`}

title={`Tugas (${task.priority}): ${task.title}`}

>

<span className="shrink-0 text-[8px]">

{task.status === 'done' ? '✓' : '•'}

</span>

<span className="truncate">{task.title}</span>

</div>

))}


{/* Overflow indicator */}

{(dayTasks.length + dayNotes.length > 5) && (

<span className="text-[9px] font-bold text-zinc-400 pl-1 mt-0.5">

+{dayTasks.length + dayNotes.length - 5} lainnya

</span>

)}

</div>


{/* Add action hover helper icon */}

<div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#EFEFEF] rounded text-[#91918E] transition-all">

<Plus className="h-3 w-3" />

</div>

</div>

);

})}

</div>

</div>


{/* SIDE DETAIL DRAWER PANEL */}

{selectedDateStr && (

<div className="absolute md:relative inset-y-0 right-0 w-full md:w-96 bg-white border-l border-[#EDEDEB] shadow-2xl md:shadow-none flex flex-col z-20 animate-in slide-in-from-right duration-300">

{/* Drawer Header */}

<div className="p-5 border-b border-[#EDEDEB] flex items-center justify-between bg-[#F7F7F5]">

<div>

<span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-0.5">Detail Tanggal</span>

<h3 className="text-sm font-bold text-[#37352F]">

{formatFullDate(selectedDateStr)}

</h3>

</div>

<button

onClick={() => setSelectedDateStr(null)}

className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"

>

<X className="h-4 w-4" />

</button>

</div>


{/* Drawer Scrollable Content */}

<div className="flex-1 overflow-y-auto p-5 space-y-6">

{/* === SECTION A: TODAY'S CATATAN (NOTES) === */}

<div className="space-y-3">

<div className="flex items-center justify-between">

<h4 className="text-xs font-bold uppercase text-[#91918E] tracking-wider flex items-center gap-1.5">

<FileText className="h-3.5 w-3.5 text-green-600" />

<span>Catatan ({selectedDateItems.notes.length})</span>

</h4>

<button

onClick={handleAddQuickNote}

className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-lg transition-all"

>

<Plus className="h-3 w-3" />

<span>Catatan Baru</span>

</button>

</div>


{selectedDateItems.notes.length === 0 ? (

<div className="p-4 rounded-xl border border-dashed border-[#EDEDEB] text-center text-xs text-[#91918E] bg-[#FCFCFA] py-6">

Belum ada catatan untuk tanggal ini.

</div>

) : (

<div className="space-y-2">

{selectedDateItems.notes.map((note) => (

<div

key={note.id}

className="p-3 bg-white border border-[#EDEDEB] rounded-xl hover:border-green-300 transition-all flex flex-col gap-1.5 group cursor-pointer"

onClick={() => onSelectNote(note.id)}

>

<div className="flex items-start justify-between gap-2">

<h5 className="text-xs font-bold text-[#37352F] group-hover:text-green-700 transition-colors truncate">

{note.title || 'Untitled Note'}

</h5>

<ExternalLink className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />

</div>

<p className="text-[11px] text-[#7E7D77] line-clamp-2 leading-relaxed">

{note.content ? note.content.replace(/[#*`_]/g, '') : 'Tidak ada konten.'}

</p>

{note.tags && note.tags.length > 0 && (

<div className="flex flex-wrap gap-1 mt-1">

{note.tags.map((t) => (

<span

key={t}

className="text-[9px] px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded"

>

#{t}

</span>

))}

</div>

)}

</div>

))}

</div>

)}

</div>


{/* === SECTION B: TODAY'S TODOLIST (TASKS) === */}

<div className="space-y-3">

<h4 className="text-xs font-bold uppercase text-[#91918E] tracking-wider flex items-center gap-1.5">

<ListTodo className="h-3.5 w-3.5 text-blue-600" />

<span>Tugas To-Do ({selectedDateItems.tasks.length})</span>

</h4>


{selectedDateItems.tasks.length === 0 ? (

<div className="p-4 rounded-xl border border-dashed border-[#EDEDEB] text-center text-xs text-[#91918E] bg-[#FCFCFA] py-6">

Belum ada tugas untuk tanggal ini.

</div>

) : (

<div className="space-y-2">

{selectedDateItems.tasks.map((task) => {

const listName = lists.find(l => l.id === task.listId)?.name || 'Daftar Tugas';

return (

<div

key={task.id}

className={`p-3 border rounded-xl flex items-start gap-2.5 bg-white transition-all group ${

task.status === 'done' ? 'border-[#EDEDEB] bg-zinc-50/50' : 'border-zinc-200'

}`}

>

<button

type="button"

onClick={() => {

const updated: Task = {

...task,

status: task.status === 'done' ? 'todo' : 'done'

};

onSaveTask(updated);

}}

className="mt-0.5 text-[#91918E] hover:text-[#37352F] transition-colors"

>

{task.status === 'done' ? (

<CheckSquare className="h-4 w-4 text-blue-600" />

) : (

<Square className="h-4 w-4" />

)}

</button>


<div className="flex-1 min-w-0">

<input

type="text"

value={task.title}

onChange={(e) => {

const updated = { ...task, title: e.target.value };

onSaveTask(updated);

}}

className={`text-xs font-semibold block w-full bg-transparent border-none outline-none focus:bg-zinc-50 px-1 rounded ${

task.status === 'done' ? 'line-through text-[#91918E] font-normal' : 'text-[#37352F]'

}`}

/>


<div className="flex flex-wrap items-center gap-1.5 mt-2">

{/* Priority option */}

<select

value={task.priority}

onChange={(e) => {

const updated = { ...task, priority: e.target.value as TaskPriority };

onSaveTask(updated);

}}

className={`text-[9px] font-bold uppercase px-1 py-0.2 rounded border outline-none cursor-pointer ${

task.priority === 'high' ? 'bg-[#FDE7E7] text-[#EE4444] border-red-200' :

task.priority === 'medium' ? 'bg-[#E3F2FD] text-[#2196F3] border-blue-200' :

'bg-[#F1F0EF] text-[#7E7D77] border-[#EDEDEB]'

}`}

>

<option value="low">LOW</option>

<option value="medium">MEDIUM</option>

<option value="high">HIGH</option>

</select>


{/* List badge */}

<span className="text-[9px] text-[#91918E] font-mono max-w-28 truncate bg-[#F7F7F5] border border-[#EDEDEB] px-1.5 py-0.2 rounded">

{listName}

</span>

</div>

</div>


<button

onClick={() => onDeleteTask(task.id)}

className="text-zinc-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 rounded-md hover:bg-zinc-100 transition-all"

title="Hapus Tugas"

>

<Trash2 className="h-3.5 w-3.5" />

</button>

</div>

);

})}

</div>

)}

</div>


{/* === SECTION C: QUICK TASK CREATOR FORM === */}

<div className="p-4 rounded-xl bg-[#F7F7F5] border border-[#EDEDEB] space-y-3">

<h5 className="text-[11px] font-bold text-[#37352F] uppercase tracking-wide flex items-center gap-1.5">

<ClipboardList className="h-3.5 w-3.5 text-zinc-500" />

<span>Tambahkan Tugas Cepat</span>

</h5>


<form onSubmit={handleAddQuickTask} className="space-y-2.5">

<input

type="text"

required

placeholder="Apa yang ingin dicapai?"

value={quickTaskTitle}

onChange={(e) => setQuickTaskTitle(e.target.value)}

className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#EDEDEB] hover:border-zinc-300 focus:border-zinc-400 rounded-lg outline-none transition-all"

/>


<div className="grid grid-cols-2 gap-2">

<div>

<label className="block text-[9px] font-bold text-[#91918E] uppercase mb-1">Prioritas</label>

<select

value={quickTaskPriority}

onChange={(e) => setQuickTaskPriority(e.target.value as TaskPriority)}

className="w-full text-xs px-2 py-1 bg-white border border-[#EDEDEB] rounded-md outline-none cursor-pointer"

>

<option value="low">Rendah</option>

<option value="medium">Sedang</option>

<option value="high">Tinggi</option>

</select>

</div>


<div>

<label className="block text-[9px] font-bold text-[#91918E] uppercase mb-1">Target Daftar</label>

<select

value={quickTaskListId}

onChange={(e) => setQuickTaskListId(e.target.value)}

className="w-full text-xs px-2 py-1 bg-white border border-[#EDEDEB] rounded-md outline-none cursor-pointer"

>

{lists.map((l) => (

<option key={l.id} value={l.id}>

{l.name}

</option>

))}

</select>

</div>

</div>


<button

type="submit"

className="w-full text-xs py-1.5 bg-[#37352F] text-white hover:bg-black font-semibold rounded-lg flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"

>

<Plus className="h-3.5 w-3.5" />

Simpan Tugas

</button>

</form>

</div>

</div>

</div>

)}

</div>

</div>

);

}


