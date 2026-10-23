import React, { useState } from 'react';
import {
  FolderOpen,
  X,
  Plus,
  Music,
  Trash2,
  Copy,
  Search,
  Sparkles,
  Layers,
  Clock,
} from 'lucide-react';
import { SongProject } from '../types/lyric';
import { SONG_TEMPLATES } from '../utils/templates';

interface ProjectsModalProps {
  currentProjectId: string;
  projects: SongProject[];
  onSelectProject: (id: string) => void;
  onCreateNewProject: () => void;
  onLoadTemplate: (template: SongProject) => void;
  onDeleteProject: (id: string) => void;
  onClose: () => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  currentProjectId,
  projects,
  onSelectProject,
  onCreateNewProject,
  onLoadTemplate,
  onDeleteProject,
  onClose,
}) => {
  const [tab, setTab] = useState<'my_songs' | 'templates'>('my_songs');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0e111a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FolderOpen size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Song Project Vault</h2>
              <p className="text-xs text-white/50">
                Manage your songs, drafts, and pre-built lyrical flow templates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onCreateNewProject();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1 shadow-sm transition"
            >
              <Plus size={14} />
              <span>New Song</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="p-4 border-b border-white/10 bg-white/[0.01] flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTab('my_songs')}
              className={`px-3 py-1.5 rounded-lg transition ${
                tab === 'my_songs'
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              My Songs ({projects.length})
            </button>
            <button
              onClick={() => setTab('templates')}
              className={`px-3 py-1.5 rounded-lg transition ${
                tab === 'templates'
                  ? 'bg-purple-500 text-white font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Genre Templates ({SONG_TEMPLATES.length})
            </button>
          </div>

          {tab === 'my_songs' && (
            <div className="relative min-w-[180px]">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs or genres..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {tab === 'my_songs' ? (
            filteredProjects.length === 0 ? (
              <div className="py-12 text-center text-xs text-white/30">
                No songs found matching "{searchQuery}".
              </div>
            ) : (
              filteredProjects.map((proj) => {
                const isActive = proj.id === currentProjectId;
                const totalLines = proj.sections.reduce((a, b) => a + b.lines.length, 0);

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer group ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-500/40'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isActive
                            ? 'bg-cyan-500 text-black'
                            : 'bg-white/10 text-white group-hover:bg-white/20'
                        }`}
                      >
                        <Music size={16} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-white truncate">{proj.title}</h3>
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-mono">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-white/50 block mt-0.5">
                          {proj.genre} &bull; {proj.bpm} BPM &bull; {proj.sections.length} sections &bull;{' '}
                          {totalLines} lines
                        </span>
                      </div>
                    </div>

                    {projects.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(proj.id);
                        }}
                        className="p-2 text-white/30 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                        title="Delete song"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })
            )
          ) : (
            // Templates tab
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SONG_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onLoadTemplate(tmpl.template);
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-white/5 hover:bg-purple-950/30 border border-white/5 hover:border-purple-500/40 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white group-hover:text-purple-300">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                        {tmpl.template.bpm} BPM
                      </span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-2">{tmpl.description}</p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-purple-400 font-semibold">
                    <span>Load Template</span>
                    <Sparkles size={13} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
