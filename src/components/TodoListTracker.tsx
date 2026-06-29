import React, { useState } from 'react';
import { TodoList, Task, TaskStatus, TaskPriority } from '../types';
import { List, Kanban, Star, Trash2, Plus, Calendar, Tag, CheckSquare, Square, ChevronRight, ChevronLeft, CalendarDays, AlertCircle } from 'lucide-react';

interface TodoListTrackerProps {
  key?: string;
  list: TodoList;
  tasks: Task[];
  onSaveList: (updatedList: TodoList) => void;
  onDeleteList: (listId: string) => void;
  onSaveTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TodoListTracker({
  list,
  tasks,
  onSaveList,
  onDeleteList,
  onSaveTask,
  onDeleteTask,
}: TodoListTrackerProps) {
  const [listName, setListName] = useState(list.name);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Sync state if list switches
  React.useEffect(() => {
    setListName(list.name);
    setSelectedTagFilter(null);
  }, [list.id]);

  const handleListNameBlur = () => {
    if (listName.trim() && listName !== list.name) {
      onSaveList({ ...list, name: listName.trim() });
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      listId: list.id,
      userId: list.userId,
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || undefined,
      tags: [],
    };

    onSaveTask(newTask);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setNewTaskPriority('medium');
  };

  const handleTaskStatusToggle = (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    onSaveTask({ ...task, status: nextStatus });
  };

  const handleTaskPropertyChange = (task: Task, updates: Partial<Task>) => {
    onSaveTask({ ...task, ...updates });
  };

  const handleAddTagToTask = (task: Task, tag: string) => {
    const cleanTag = tag.trim().replace(/#/g, '');
    if (cleanTag && !task.tags.includes(cleanTag)) {
      onSaveTask({ ...task, tags: [...task.tags, cleanTag] });
    }
  };

  const handleRemoveTagFromTask = (task: Task, tagToRemove: string) => {
    onSaveTask({ ...task, tags: task.tags.filter(t => t !== tagToRemove) });
  };

  // Extract all unique tags in this list for filtering
  const allUniqueTags = Array.from(
    new Set(tasks.flatMap(t => t.tags))
  );

  // Filter tasks belonging to this list & matching selected tag filter
  const listTasks = tasks.filter(t => t.listId === list.id);
  const filteredTasks = selectedTagFilter
    ? listTasks.filter(t => t.tags.includes(selectedTagFilter))
    : listTasks;

  // Split tasks by status for Kanban Board
  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  const moveTaskKanban = (task: Task, direction: 'forward' | 'backward') => {
    const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];
    const currentIdx = statuses.indexOf(task.status);
    let nextIdx = currentIdx;

    if (direction === 'forward' && currentIdx < 2) nextIdx++;
    if (direction === 'backward' && currentIdx > 0) nextIdx--;

    if (nextIdx !== currentIdx) {
      onSaveTask({ ...task, status: statuses[nextIdx] });
    }
  };

  return (
    <div className="font-sans flex flex-col h-full bg-white text-[#37352F]">
      {/* List Header */}
      <div className="px-8 md:px-12 py-6 border-b border-[#EDEDEB] bg-[#F7F7F5]/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[#91918E] text-xs font-semibold uppercase tracking-wider mb-1">
              <span>To-Do List Pipeline</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Double click text to rename
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onBlur={handleListNameBlur}
                className="text-2xl font-bold text-[#37352F] border-none outline-none focus:ring-0 bg-transparent py-1 w-full font-sans tracking-tight focus:bg-white focus:px-2 rounded-lg transition-all"
                placeholder="List Name"
              />
              <button
                onClick={() => onSaveList({ ...list, isPinned: !list.isPinned })}
                className={`p-1.5 rounded-lg hover:bg-[#EFEFEF] transition-colors ${
                  list.isPinned ? 'text-amber-500 hover:text-amber-600' : 'text-[#91918E] hover:text-[#37352F]'
                }`}
                title={list.isPinned ? 'Unpin list' : 'Pin list to sidebar'}
              >
                <Star className="h-4.5 w-4.5 fill-current" />
              </button>
              <button
                onClick={() => onDeleteList(list.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-[#91918E] hover:text-red-600 transition-colors"
                title="Delete list and all tasks"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* View Toggles & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#F7F7F5] rounded-lg p-0.5 border border-[#EDEDEB]">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#37352F] shadow-xs'
                    : 'text-[#7E7D77] hover:text-[#37352F]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Checklist</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#37352F] shadow-xs'
                    : 'text-[#7E7D77] hover:text-[#37352F]'
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Kanban Board</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filters Section */}
        {allUniqueTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-4 border-t border-[#EDEDEB] text-xs">
            <span className="text-[#91918E] font-semibold uppercase tracking-wider text-[10px] mr-2">Filter by tag:</span>
            <button
              onClick={() => setSelectedTagFilter(null)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedTagFilter === null
                  ? 'bg-[#37352F] text-white'
                  : 'bg-[#F7F7F5] text-[#7E7D77] hover:bg-[#EFEFEF]'
              }`}
            >
              All
            </button>
            {allUniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedTagFilter === tag
                    ? 'bg-[#37352F] text-white'
                    : 'bg-[#F7F7F5] text-[#7E7D77] hover:bg-[#EFEFEF]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Task Area */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6">
        {/* Task Creator Inline Bar */}
        <form onSubmit={handleCreateTask} className="mb-6 flex flex-wrap gap-2.5 items-center bg-[#F7F7F5] border border-[#EDEDEB] p-3.5 rounded-xl">
          <input
            type="text"
            required
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 min-w-[200px] bg-transparent text-sm text-[#37352F] placeholder-[#91918E]/50 border-none outline-none focus:ring-0"
          />

          <div className="flex items-center gap-2">
            {/* Priority Selector */}
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
              className="bg-white border border-[#EDEDEB] rounded-lg text-xs font-semibold py-1.5 px-2.5 text-[#37352F] outline-none focus:border-[#91918E]/40 transition-all cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            {/* Due Date picker */}
            <div className="relative">
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-white border border-[#EDEDEB] rounded-lg text-xs font-semibold py-1.5 px-2.5 text-[#37352F] outline-none focus:border-[#91918E]/40 transition-all w-32 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="bg-[#37352F] hover:bg-[#52504a] text-white font-semibold text-xs py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* View Layout Router */}
        {viewMode === 'list' ? (
          /* Checklist List View */
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-[#91918E] border border-dashed border-[#EDEDEB] rounded-xl">
                <p className="text-sm font-semibold">No tasks found</p>
                <p className="text-xs text-[#91918E] mt-1">Get started by creating a task above or clearing your filters.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 border border-[#EDEDEB] rounded-xl hover:border-[#91918E]/50 hover:shadow-xs transition-all bg-white"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleTaskStatusToggle(task)}
                      className="mt-0.5 text-[#91918E] hover:text-[#37352F] transition-all"
                    >
                      {task.status === 'done' ? (
                        <CheckSquare className="h-5 w-5 text-[#37352F]" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleTaskPropertyChange(task, { title: e.target.value })}
                        className={`text-sm font-medium w-full bg-transparent border-none outline-none focus:bg-[#F7F7F5] px-1 rounded ${
                          task.status === 'done' ? 'line-through text-[#91918E] font-normal' : 'text-[#37352F]'
                        }`}
                      />

                      {/* Display task tags list */}
                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          {task.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center text-[10px] font-semibold text-[#7E7D77] bg-[#F7F7F5] px-1.5 py-0.2 rounded border border-[#EDEDEB]"
                            >
                              <span>#{tag}</span>
                              <button
                                onClick={() => handleRemoveTagFromTask(task, tag)}
                                className="hover:text-red-600 rounded-sm font-bold text-[9px] pl-1"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task attributes controllers */}
                  <div className="flex flex-wrap items-center justify-end gap-3 shrink-0 ml-8 md:ml-0">
                    {/* Tags inline adding input */}
                    <div className="flex items-center gap-1 border border-[#EDEDEB] rounded-lg px-2 py-0.5 bg-[#F7F7F5]/50">
                      <Tag className="h-3 w-3 text-[#91918E]" />
                      <input
                        type="text"
                        placeholder="Add tag"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                              handleAddTagToTask(task, val);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                        className="bg-transparent border-none text-[10px] outline-none w-14 placeholder-[#91918E]/60 text-[#37352F]"
                      />
                    </div>

                    {/* Status Select */}
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskPropertyChange(task, { status: e.target.value as TaskStatus })}
                      className="bg-[#F7F7F5] border border-[#EDEDEB] rounded-lg text-xs font-semibold py-1 px-2 text-[#37352F] outline-none hover:bg-[#EFEFEF] cursor-pointer"
                    >
                      <option value="todo">To-Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>

                    {/* Priority select */}
                    <select
                      value={task.priority}
                      onChange={(e) => handleTaskPropertyChange(task, { priority: e.target.value as TaskPriority })}
                      className={`border rounded-lg text-xs font-bold py-1 px-2 outline-none cursor-pointer ${
                        task.priority === 'high' ? 'bg-[#FDE7E7] text-[#EE4444] border-red-200' :
                        task.priority === 'medium' ? 'bg-[#E3F2FD] text-[#2196F3] border-blue-200' :
                        'bg-[#F1F0EF] text-[#7E7D77] border-[#EDEDEB]'
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>

                    {/* Due Date Picker */}
                    <div className="flex items-center gap-1.5 border border-[#EDEDEB] rounded-lg px-2 py-1 bg-[#F7F7F5]/50 text-[#7E7D77]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={(e) => handleTaskPropertyChange(task, { dueDate: e.target.value || undefined })}
                        className="bg-transparent border-none text-xs outline-none w-26 cursor-pointer"
                      />
                    </div>

                    {/* Delete single task button */}
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 hover:bg-red-50 text-[#91918E] hover:text-red-600 rounded-md transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* COLUMN 1: TODO */}
            <div className="bg-[#F7F7F5] rounded-xl p-4 border border-[#EDEDEB] flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-4 border-b border-[#EDEDEB] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7E7D77] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#91918E]"></span>
                  <span>To-Do</span>
                </span>
                <span className="text-xs font-bold bg-[#EFEFEF] text-[#37352F] px-2 py-0.5 rounded-full">{todoTasks.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-4">
                {todoTasks.length === 0 ? (
                  <div className="py-12 text-center text-[#91918E] text-xs italic border border-dashed border-[#EDEDEB] rounded-lg bg-white/50">
                    Column is empty
                  </div>
                ) : (
                  todoTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onMoveForward={() => moveTaskKanban(task, 'forward')}
                      onMoveBackward={() => moveTaskKanban(task, 'backward')}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS */}
            <div className="bg-[#F7F7F5] rounded-xl p-4 border border-[#EDEDEB] flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-4 border-b border-[#EDEDEB] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7E7D77] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>In Progress</span>
                </span>
                <span className="text-xs font-bold bg-[#EFEFEF] text-[#37352F] px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-4">
                {inProgressTasks.length === 0 ? (
                  <div className="py-12 text-center text-[#91918E] text-xs italic border border-dashed border-[#EDEDEB] rounded-lg bg-white/50">
                    Column is empty
                  </div>
                ) : (
                  inProgressTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onMoveForward={() => moveTaskKanban(task, 'forward')}
                      onMoveBackward={() => moveTaskKanban(task, 'backward')}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: DONE */}
            <div className="bg-[#F7F7F5] rounded-xl p-4 border border-[#EDEDEB] flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-4 border-b border-[#EDEDEB] pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7E7D77] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span>Done</span>
                </span>
                <span className="text-xs font-bold bg-[#EFEFEF] text-[#37352F] px-2 py-0.5 rounded-full">{doneTasks.length}</span>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-4">
                {doneTasks.length === 0 ? (
                  <div className="py-12 text-center text-[#91918E] text-xs italic border border-dashed border-[#EDEDEB] rounded-lg bg-white/50">
                    Column is empty
                  </div>
                ) : (
                  doneTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onMoveForward={() => moveTaskKanban(task, 'forward')}
                      onMoveBackward={() => moveTaskKanban(task, 'backward')}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Internal Sub-component: KanbanCard */
interface KanbanCardProps {
  key?: string;
  task: Task;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onDelete: () => void;
}

function KanbanCard({ task, onMoveForward, onMoveBackward, onDelete }: KanbanCardProps) {
  return (
    <div className="bg-white border border-[#EDEDEB] rounded-xl p-4 shadow-xs hover:border-[#91918E]/50 hover:shadow-md transition-all flex flex-col justify-between gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="min-w-0">
        <h4 className={`text-xs font-semibold leading-relaxed line-clamp-2 ${
          task.status === 'done' ? 'line-through text-[#91918E] font-normal' : 'text-[#37352F]'
        }`}>
          {task.title}
        </h4>

        {/* Due Date & tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#7E7D77] bg-[#F7F7F5] border border-[#EDEDEB] px-1.5 py-0.5 rounded">
              <Calendar className="h-2.5 w-2.5" />
              {task.dueDate}
            </span>
          )}

          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
            task.priority === 'high' ? 'bg-[#FDE7E7] text-[#EE4444] border-red-200' :
            task.priority === 'medium' ? 'bg-[#E3F2FD] text-[#2196F3] border-blue-200' :
            'bg-[#F1F0EF] text-[#7E7D77] border-[#EDEDEB]'
          }`}>
            {task.priority}
          </span>
        </div>

        {/* Tags row */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-2">
            {task.tags.map(tag => (
              <span key={tag} className="text-[9px] text-[#7E7D77] bg-[#F7F7F5] border border-[#EDEDEB] px-1 py-0.2 rounded font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between border-t border-[#EDEDEB] pt-2.5 mt-1.5 text-[#91918E]">
        <button
          onClick={onDelete}
          className="text-[10px] font-semibold text-[#91918E] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          Delete
        </button>

        <div className="flex items-center gap-1 ml-auto">
          {task.status !== 'todo' && (
            <button
              onClick={onMoveBackward}
              className="p-1 hover:bg-[#EFEFEF] rounded-md hover:text-[#37352F] transition-colors"
              title="Move backward"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          )}

          {task.status !== 'done' && (
            <button
              onClick={onMoveForward}
              className="p-1 hover:bg-[#EFEFEF] rounded-md hover:text-[#37352F] transition-colors"
              title="Move forward"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
