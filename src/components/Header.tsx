import React, { useState, useEffect } from 'react';
import {
  Mic,
  Activity,
  PenTool,
  Play,
  Square,
  Sparkles,
  Bookmark,
  History,
  Download,
  Settings,
  Sun,
  Moon,
  FolderOpen,
  Plus,
  Music,
  Sliders,
  Smartphone,
} from 'lucide-react';
import { SongProject, UserSettings } from '../types/lyric';
import { metronome } from '../utils/metronome';

interface HeaderProps {
  project: SongProject;
  onUpdateProject: (updated: Partial<SongProject>) => void;
  activeMode: 'write' | 'flow' | 'freestyle';
  setActiveMode: (mode: 'write' | 'flow' | 'freestyle') => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onOpenAssistant: () => void;
  onOpenIdeaLocker: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onOpenProjects: () => void;
  onNewProject: () => void;
  onOpenInstallApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProject,
  activeMode,
  setActiveMode,
  settings,
  onUpdateSettings,
  onOpenAssistant,
  onOpenIdeaLocker,
  onOpenHistory,
  onOpenExport,
  onOpenSettings,
  onOpenProjects,
  onNewProject,
  onOpenInstallApp,
}) => {
  const [isPlayingMetronome, setIsPlayingMetronome] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);

  useEffect(() => {
    metronome.setOnBeat((beat) => {
      setCurrentBeat(beat);
    });
  }, []);

  const toggleMetronome = () => {
    metronome.setBpm(project.bpm);
    metronome.setVolume(settings.metronomeVolume);
    const active = metronome.toggle();
    setIsPlayingMetronome(active);
  };

  const handleBpmChange = (delta: number) => {
    const nextBpm = Math.max(40, Math.min(240, project.bpm + delta));
    onUpdateProject({ bpm: nextBpm });
    metronome.setBpm(nextBpm);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0b0e]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Song Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="font-black text-sm tracking-tighter text-white">R</span>
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent hidden sm:inline-block">
              RHYTE
            </span>
          </div>

          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          {/* Project Title inline editor */}
          <div className="flex items-center gap-1.5 group">
            <input
              type="text"
              value={project.title}
              onChange={(e) => onUpdateProject({ title: e.target.value })}
              className="font-semibold text-sm sm:text-base bg-transparent hover:bg-white/5 focus:bg-white/10 px-2 py-1 rounded border border-transparent focus:border-cyan-500/50 outline-none transition text-white max-w-[140px] sm:max-w-[220px] truncate"
              placeholder="Song Title..."
              title="Click to rename song"
            />
            <button
              onClick={onOpenProjects}
              className="p-1 text-white/50 hover:text-white rounded hover:bg-white/10 transition"
              title="Open Project Library & Templates"
            >
              <FolderOpen size={16} />
            </button>
          </div>
        </div>

        {/* Center: Beat/Cadence Controls & Modes */}
        <div className="flex items-center gap-2 sm:gap-4 order-3 md:order-2">
          {/* BPM & Metronome */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1 text-xs">
            <button
              onClick={() => handleBpmChange(-2)}
              className="px-1.5 py-0.5 text-white/60 hover:text-white hover:bg-white/10 rounded font-mono"
            >
              -
            </button>
            <div className="px-2 font-mono font-medium text-white/90 flex items-center gap-1">
              <span>{project.bpm}</span>
              <span className="text-[10px] text-white/40">BPM</span>
            </div>
            <button
              onClick={() => handleBpmChange(2)}
              className="px-1.5 py-0.5 text-white/60 hover:text-white hover:bg-white/10 rounded font-mono"
            >
              +
            </button>

            {/* Metronome Play button */}
            <button
              onClick={toggleMetronome}
              className={`ml-1 px-2 py-1 rounded flex items-center gap-1.5 font-medium transition ${
                isPlayingMetronome
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Audio Metronome"
            >
              {isPlayingMetronome ? <Square size={12} fill="currentColor" /> : <Play size={12} />}
              <span className="hidden lg:inline text-[11px]">Click</span>
            </button>

            {/* 4-beat visual LED indicators */}
            {isPlayingMetronome && (
              <div className="flex items-center gap-1 px-1.5 border-l border-white/10 ml-1">
                {[0, 1, 2, 3].map((b) => (
                  <div
                    key={b}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      currentBeat === b
                        ? b === 0
                          ? 'bg-amber-400 scale-125 shadow-[0_0_8px_#fbbf24]'
                          : 'bg-cyan-400 scale-125 shadow-[0_0_6px_#22d3ee]'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mode Tabs: Write / Cadence Radar / Freestyle */}
          <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveMode('write')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                activeMode === 'write'
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <PenTool size={13} />
              <span>Studio</span>
            </button>
            <button
              onClick={() => setActiveMode('flow')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                activeMode === 'flow'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Activity size={13} />
              <span>Cadence</span>
            </button>
            <button
              onClick={() => setActiveMode('freestyle')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                activeMode === 'freestyle'
                  ? 'bg-red-500/20 text-red-400 font-semibold shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Mic size={13} />
              <span>Freestyle</span>
            </button>
          </div>
        </div>

        {/* Right: Actions, AI Copilot, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-2 md:order-3">
          {/* Smart Lyric Copilot trigger */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:text-purple-100 hover:border-purple-400/50 text-xs font-semibold shadow-sm transition active:scale-95"
            title="Open AI & Algorithmic Lyric Copilot"
          >
            <Sparkles size={14} className="text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Install on Phone Button */}
          <button
            onClick={onOpenInstallApp}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400/50 text-xs font-semibold shadow-sm transition active:scale-95"
            title="Install Rhyte App on Android Phone / Desktop"
          >
            <Smartphone size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Install App</span>
          </button>

          {/* Idea Locker / Punchline scratchpad */}
          <button
            onClick={onOpenIdeaLocker}
            className="relative p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Punchline Locker & Favorites"
          >
            <Bookmark size={16} />
            {project.favoriteLines?.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black font-bold text-[9px] rounded-full flex items-center justify-center">
                {project.favoriteLines.length}
              </span>
            )}
          </button>

          {/* Version History / Snapshots */}
          <button
            onClick={onOpenHistory}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Version History & Snapshots"
          >
            <History size={16} />
          </button>

          {/* Export Lyrics */}
          <button
            onClick={onOpenExport}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Export Lyrics (TXT, PDF, Print, Markdown)"
          >
            <Download size={16} />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="App Settings (Fonts, Theme, Cadence)"
          >
            <Settings size={16} />
          </button>

          {/* Theme Quick Toggle */}
          <button
            onClick={() =>
              onUpdateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
            }
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Toggle Dark / Light Theme"
          >
            {settings.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
