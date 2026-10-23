import React, { useState } from 'react';
import { Bookmark, X, Plus, Trash2, Copy, Check, ArrowRight, Star } from 'lucide-react';
import { SongProject } from '../types/lyric';

interface IdeaLockerModalProps {
  project: SongProject;
  onUpdateProject: (updated: Partial<SongProject>) => void;
  onInsertLine: (lineText: string) => void;
  onClose: () => void;
}

export const IdeaLockerModal: React.FC<IdeaLockerModalProps> = ({
  project,
  onUpdateProject,
  onInsertLine,
  onClose,
}) => {
  const [newIdea, setNewIdea] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;
    const updated = [newIdea.trim(), ...(project.favoriteLines || [])];
    onUpdateProject({ favoriteLines: updated });
    setNewIdea('');
  };

  const handleRemoveIdea = (index: number) => {
    const updated = (project.favoriteLines || []).filter((_, i) => i !== index);
    onUpdateProject({ favoriteLines: updated });
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0e111a] border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Idea & Punchline Locker</h2>
              <p className="text-xs text-white/50">
                Saved bars, rhymes, and punchlines you can drop into any verse.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add Idea Input */}
        <div className="p-4 border-b border-white/10 bg-white/[0.01]">
          <div className="flex gap-2">
            <input
              type="text"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddIdea()}
              placeholder="Save a hot line or rhyme idea..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleAddIdea}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1 transition"
            >
              <Plus size={14} />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Ideas List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          {!project.favoriteLines || project.favoriteLines.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/30 space-y-2">
              <Star size={24} className="mx-auto opacity-30 text-amber-400" />
              <p>Your locker is empty.</p>
              <p className="text-[11px] text-white/20">
                Click the star icon next to any written bar to save it here.
              </p>
            </div>
          ) : (
            project.favoriteLines.map((line, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Star size={14} className="text-amber-400 shrink-0" fill="currentColor" />
                  <p className="text-xs font-medium text-white/90 truncate">{line}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(line, idx)}
                    className="p-1.5 text-white/40 hover:text-white rounded hover:bg-white/10"
                    title="Copy line"
                  >
                    {copiedIdx === idx ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onInsertLine(line);
                      onClose();
                    }}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[11px] font-semibold rounded flex items-center gap-1"
                    title="Insert into active section"
                  >
                    <span>Insert</span>
                    <ArrowRight size={11} />
                  </button>
                  <button
                    onClick={() => handleRemoveIdea(idx)}
                    className="p-1.5 text-white/30 hover:text-red-400 rounded hover:bg-red-500/10"
                    title="Delete idea"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
