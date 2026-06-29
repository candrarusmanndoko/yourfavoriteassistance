import React, { useState } from 'react';
import { X, Image, Link, Sparkles } from 'lucide-react';

interface CoverImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

const PRESET_COVERS = [
  {
    name: 'Minimal Library',
    url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Monochrome Wave',
    url: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Slate Architecture',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Deep Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Warm Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Morning Fog',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Water Calmness',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop',
  },
  {
    name: 'Modernist lines',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
  }
];

export default function CoverImageModal({ isOpen, onClose, onSelectImage }: CoverImageModalProps) {
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim().startsWith('http')) {
      onSelectImage(customUrl.trim());
      setCustomUrl('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-[1px]" onClick={onClose} />
      
      <div className="relative bg-white border border-zinc-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Image className="h-4.5 w-4.5 text-zinc-500" />
            <h3 className="font-semibold text-zinc-800 text-sm">Choose Cover Image</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 px-3 bg-zinc-50/50">
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-3 py-2 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'preset'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-2 text-xs font-semibold tracking-wide border-b-2 transition-all ${
              activeTab === 'custom'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            Custom Link
          </button>
        </div>

        {/* Body content */}
        <div className="p-5">
          {activeTab === 'preset' ? (
            <div className="grid grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1">
              {PRESET_COVERS.map((cover) => (
                <button
                  key={cover.url}
                  onClick={() => {
                    onSelectImage(cover.url);
                    onClose();
                  }}
                  className="group relative h-20 rounded-lg overflow-hidden border border-zinc-200/50 hover:border-zinc-500 hover:shadow-sm text-left transition-all focus:outline-none"
                >
                  <img
                    src={cover.url}
                    alt={cover.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 referrerPolicy='no-referrer'"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-medium text-white line-clamp-1">{cover.name}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Unsplash or Custom Image URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <Link className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 text-zinc-800"
                  />
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 flex gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>We recommend using high-quality landscape photos from unsplash.com to give your note headers the best look.</span>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                Apply Cover Image
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
