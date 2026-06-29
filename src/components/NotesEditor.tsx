import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { Star, Image as ImageIcon, Trash2, Check, CloudLightning, RefreshCw, Eye, Edit2, Info } from 'lucide-react';

interface NotesEditorProps {
  key?: string;
  note: Note;
  onSaveNote: (updatedNote: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onOpenCoverSelector: () => void;
}

export default function NotesEditor({
  note,
  onSaveNote,
  onDeleteNote,
  onOpenCoverSelector,
}: NotesEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [tagInput, setTagInput] = useState('');
  const [savingState, setSavingState] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

  // Keep local state in sync when note switches
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setIsPinned(note.isPinned);
    setTags(note.tags);
    setSavingState('saved');
  }, [note.id]);

  // Handle auto-saving on debounce
  useEffect(() => {
    const isDifferent =
      title !== note.title ||
      content !== note.content ||
      isPinned !== note.isPinned ||
      JSON.stringify(tags) !== JSON.stringify(note.tags);

    if (!isDifferent) return;

    setSavingState('dirty');
    const timer = setTimeout(() => {
      setSavingState('saving');
      onSaveNote({
        ...note,
        title,
        content,
        isPinned,
        tags,
      });
      // Simulate real-time server saving response
      setTimeout(() => {
        setSavingState('saved');
      }, 500);
    }, 1000); // Debounce save after 1s of no typing

    return () => clearTimeout(timer);
  }, [title, content, isPinned, tags]);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInput.trim().replace(/#/g, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleRemoveCover = () => {
    onSaveNote({
      ...note,
      coverImage: undefined,
    });
  };

  // Basic markdown compiler function to display note as gorgeous styled text
  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      return <p className="text-[#91918E] italic text-sm">Empty document. Start typing under the "Write" tab...</p>;
    }

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-base font-semibold text-[#37352F] mt-4 mb-2">{line.slice(4)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-lg font-semibold text-[#37352F] mt-5 mb-2.5">{line.slice(3)}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-xl font-bold text-[#37352F] mt-6 mb-3">{line.slice(2)}</h2>;
      }

      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc list-inside pl-4 text-sm text-[#37352F] my-1">
            <li>{line.trim().slice(2)}</li>
          </ul>
        );
      }
      if (line.trim().match(/^\d+\.\s/)) {
        const index = line.indexOf(' ');
        return (
          <ol key={idx} className="list-decimal list-inside pl-4 text-sm text-[#37352F] my-1">
            <li>{line.trim().slice(index + 1)}</li>
          </ol>
        );
      }

      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-[#91918E] pl-4 py-1 my-3 text-[#7E7D77] italic text-sm bg-[#F7F7F5] rounded-r-md">
            {line.slice(2)}
          </blockquote>
        );
      }

      // Divider
      if (line.trim() === '---') {
        return <hr key={idx} className="border-t border-[#EDEDEB] my-6" />;
      }

      // Default paragraph with inline styling replacements
      let lineHtml = line;
      // Bold
      lineHtml = lineHtml.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      lineHtml = lineHtml.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Inline Code
      lineHtml = lineHtml.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-[#F7F7F5] text-red-600 font-mono text-xs font-semibold">$1</code>');

      return (
        <p
          key={idx}
          className="text-sm text-[#37352F] leading-relaxed min-h-[1.5rem] mb-2"
          dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
        />
      );
    });
  };

  return (
    <div className="font-sans flex flex-col h-full bg-white relative">
      {/* Cover Image Header */}
      {note.coverImage ? (
        <div className="relative h-44 md:h-52 w-full overflow-hidden group">
          <img
            src={note.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4 gap-2">
            <button
              onClick={onOpenCoverSelector}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-[#37352F] rounded-lg text-xs font-medium shadow-md transition-all flex items-center gap-1"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Change cover
            </button>
            <button
              onClick={handleRemoveCover}
              className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-medium shadow-md transition-all flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove cover
            </button>
          </div>
        </div>
      ) : (
        <div className="h-4 border-b border-[#F7F7F5]" />
      )}

      {/* Editor Main Content Area */}
      <div className="flex-1 overflow-y-auto px-8 md:px-12 py-6 max-w-3xl mx-auto w-full flex flex-col">
        {/* Top Control Toolbar */}
        <div className="flex items-center justify-between mb-6 text-[#91918E]">
          <div className="flex items-center gap-3">
            {/* Saving State Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {savingState === 'saved' && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> Saved
                </span>
              )}
              {savingState === 'saving' && (
                <span className="flex items-center gap-1 text-amber-500">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                </span>
              )}
              {savingState === 'dirty' && (
                <span className="flex items-center gap-1 text-[#91918E]">
                  <CloudLightning className="h-3.5 w-3.5 animate-pulse" /> Typings...
                </span>
              )}
            </div>

            {/* Split Writing vs Preview view toggler */}
            <div className="flex bg-[#F7F7F5] rounded-lg p-0.5 ml-2">
              <button
                onClick={() => setEditorMode('write')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  editorMode === 'write'
                    ? 'bg-white text-[#37352F] shadow-xs'
                    : 'text-[#7E7D77] hover:text-[#37352F]'
                }`}
              >
                <Edit2 className="h-3 w-3" />
                <span>Write</span>
              </button>
              <button
                onClick={() => setEditorMode('preview')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                  editorMode === 'preview'
                    ? 'bg-white text-[#37352F] shadow-xs'
                    : 'text-[#7E7D77] hover:text-[#37352F]'
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Preview</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Cover Image hover action */}
            {!note.coverImage && (
              <button
                onClick={onOpenCoverSelector}
                className="p-1.5 rounded-lg hover:bg-[#EFEFEF] text-[#91918E] hover:text-[#37352F] transition-colors flex items-center gap-1 text-xs font-medium"
                title="Add Cover Image"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Add cover</span>
              </button>
            )}

            {/* Favorite Pin toggle */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg hover:bg-[#EFEFEF] transition-colors ${
                isPinned ? 'text-amber-500 hover:text-amber-600' : 'text-[#91918E] hover:text-[#37352F]'
              }`}
              title={isPinned ? 'Unpin note' : 'Pin note to favorites'}
            >
              <Star className="h-4.5 w-4.5 fill-current" />
            </button>

            {/* Delete note */}
            <button
              onClick={() => onDeleteNote(note.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-[#91918E] hover:text-red-600 transition-colors"
              title="Delete page"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Note Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-bold text-[#37352F] border-none outline-none placeholder-[#EDEDEB] w-full mb-3 focus:ring-0 font-sans tracking-tight"
          placeholder="Untitled Note"
        />

        {/* Tags Section */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#EDEDEB] pb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-[#F7F7F5] text-[#7E7D77] px-2 py-0.5 rounded-md hover:bg-[#EFEFEF] transition-colors font-medium border border-[#EDEDEB]"
            >
              <span>#{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-600 rounded-sm font-bold text-[10px] pl-1"
              >
                ×
              </button>
            </span>
          ))}

          <form onSubmit={handleAddTag} className="inline-block">
            <input
              type="text"
              placeholder="+ add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="text-xs text-[#91918E] placeholder-[#91918E]/60 border-none outline-none focus:ring-0 py-0.5 w-20 focus:w-32 transition-all bg-transparent"
            />
          </form>
        </div>

        {/* Main Editor Text Canvas / Markdown Previewer */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          {editorMode === 'write' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 border-none outline-none resize-none placeholder-[#91918E]/50 text-sm leading-relaxed text-[#37352F] font-sans focus:ring-0"
              placeholder="Start writing ideas, tasks, or markdown guides here... (e.g., # Header, **bold**, - list)"
            />
          ) : (
            <div className="flex-1 prose-notion select-text">
              {renderMarkdown(content)}
            </div>
          )}
        </div>

        {/* Markdown Help Sheet at footer when writing */}
        {editorMode === 'write' && (
          <div className="mt-8 border-t border-[#EDEDEB] pt-4 flex items-center justify-between text-[11px] text-[#91918E] font-medium">
            <span className="flex items-center gap-1 bg-[#F7F7F5] px-2 py-1 rounded border border-[#EDEDEB]">
              <Info className="h-3.5 w-3.5 text-[#91918E]" />
              <span>Markdown Shortcuts Supported</span>
            </span>
            <div className="flex items-center gap-3">
              <span><code># Heading</code></span>
              <span><code>**bold**</code></span>
              <span><code>- List</code></span>
              <span><code>`code`</code></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
