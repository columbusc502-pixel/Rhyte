import React from 'react';
import { Settings, X, Sun, Moon, Type, Volume2, Eye } from 'lucide-react';
import { UserSettings } from '../types/lyric';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onClose: () => void;
  onOpenInstallApp?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onOpenInstallApp,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0e111a] border border-white/10 rounded-2xl w-full max-w-md flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Settings size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Studio Preferences</h2>
              <p className="text-xs text-white/50">Configure your writing canvas and audio settings.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5">
          {/* Theme Option */}
          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">Theme Mode</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  settings.theme === 'dark'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <Moon size={14} />
                <span>Obsidian Dark</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition ${
                  settings.theme === 'light'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <Sun size={14} />
                <span>Ivory Light</span>
              </button>
            </div>
          </div>

          {/* Typography Mode */}
          <div>
            <label className="text-xs font-semibold text-white/70 block mb-2">Typography</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => onUpdateSettings({ fontFamily: 'sans' })}
                className={`py-2 px-3 rounded-xl border transition ${
                  settings.fontFamily === 'sans'
                    ? 'bg-white/15 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                Proportional (Sans)
              </button>
              <button
                onClick={() => onUpdateSettings({ fontFamily: 'mono' })}
                className={`py-2 px-3 rounded-xl border font-mono transition ${
                  settings.fontFamily === 'mono'
                    ? 'bg-white/15 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                Monospace Grid
              </button>
            </div>
          </div>

          {/* Font Size Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-white/70">Font Size</span>
              <span className="font-mono text-cyan-400">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min={14}
              max={22}
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Metronome Volume */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-white/70">Metronome Audio Volume</span>
              <span className="font-mono text-cyan-400">
                {Math.round(settings.metronomeVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.metronomeVolume}
              onChange={(e) => onUpdateSettings({ metronomeVolume: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Colorblind Rhyme Highlights */}
          <div className="pt-2 border-t border-white/10">
            <label className="flex items-center justify-between text-xs font-semibold text-white/80 cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-purple-400" />
                <div>
                  <span>Colorblind Underline Mode</span>
                  <span className="text-[11px] text-white/40 block font-normal">
                    Adds distinctive underline patterns (dashed, dotted, double) to rhyme groups.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.colorblindMode}
                onChange={(e) => onUpdateSettings({ colorblindMode: e.target.checked })}
                className="rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-0 ml-3"
              />
            </label>
          </div>

          {/* Install on Android Section */}
          {onOpenInstallApp && (
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  onClose();
                  onOpenInstallApp();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Install Rhyte on Android Phone / Desktop</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
