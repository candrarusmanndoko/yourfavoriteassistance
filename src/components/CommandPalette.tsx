import React, { useState, useEffect, useRef } from 'react';
import { Note, TodoList, Task } from '../types';
import { Search, FileText, CheckSquare, List, Home, Plus, X, Command } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  lists: TodoList[];
  tasks: Task[];
  onSelectNote: (noteId: string) => void;
  onSelectTodoList: (listId: string) => void;
  onSelectDashboard: () => void;
  onCreateNote: () => void;
  onCreateTodoList: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  notes,
  lists,
  tasks,
  onSelectNote,
  onSelectTodoList,
  onSelectDashboard,
  onCreateNote,
  onCreateTodoList,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter items based on search query
  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const filteredLists = lists.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  // Combine items into a flat list for arrow key navigation
  interface CommandItem {
    type: 'action' | 'note' | 'list' | 'task';
    id: string;
    title: string;
    subtitle?: string;
    handler: () => void;
  }

  const items: CommandItem[] = [
    {
      type: 'action',
      id: 'go-home',
      title: 'Go to Dashboard',
      subtitle: 'Jump back to your workspace overview',
      handler: () => {
        onSelectDashboard();
        onClose();
      }
    },
    {
      type: 'action',
      id: 'create-note',
      title: 'Create New Page',
      subtitle: 'Add a new rich-text document to workspace',
      handler: () => {
        onCreateNote();
        onClose();
      }
    },
    {
      type: 'action',
      id: 'create-list',
      title: 'Create To-Do List',
      subtitle: 'Add a new dynamic checklist & Kanban tracker',
      handler: () => {
        onCreateTodoList();
        onClose();
      }
    },
    ...filteredNotes.map((n) => ({
      type: 'note' as const,
      id: `note-${n.id}`,
      title: n.title || 'Untitled Note',
      subtitle: n.tags.length > 0 ? n.tags.map(t => `#${t}`).join(' ') : 'Document',
      handler: () => {
        onSelectNote(n.id);
        onClose();
      }
    })),
    ...filteredLists.map((l) => ({
      type: 'list' as const,
      id: `list-${l.id}`,
      title: l.name,
      subtitle: 'To-Do List',
      handler: () => {
        onSelectTodoList(l.id);
        onClose();
      }
    })),
    ...filteredTasks.map((t) => {
      const parentList = lists.find(l => l.id === t.listId);
      return {
        type: 'task' as const,
        id: `task-${t.id}`,
        title: t.title,
        subtitle: `In list "${parentList?.name || 'Unknown'}" • Priority: ${t.priority} • Status: ${t.status}`,
        handler: () => {
          onSelectTodoList(t.listId);
          onClose();
        }
      };
    })
  ];

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].handler();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, items]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Dialog container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-xl bg-white border border-zinc-200 shadow-2xl rounded-xl overflow-hidden flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-100 bg-zinc-50/50">
          <Search className="h-4 w-4 text-zinc-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-zinc-800 placeholder-zinc-400 border-none outline-none text-sm"
            placeholder="Type a command or search workspace..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Results section */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              No results found for "{search}"
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.handler}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors text-sm ${
                    isSelected ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-md shrink-0 ${
                      isSelected ? 'text-zinc-100' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {item.type === 'action' && <Home className="h-4 w-4" />}
                      {item.type === 'note' && <FileText className="h-4 w-4" />}
                      {item.type === 'list' && <List className="h-4 w-4" />}
                      {item.type === 'task' && <CheckSquare className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className={`text-xs truncate ${
                          isSelected ? 'text-zinc-300' : 'text-zinc-400'
                        }`}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 shrink-0 text-xs text-zinc-300">
                      <span>Jump</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] border border-zinc-700">⏎</kbd>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-zinc-200">↑↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-zinc-200">⏎</kbd>
              <span>to select</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>K</span>
            <span className="ml-1 text-[10px] text-zinc-300">to toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
