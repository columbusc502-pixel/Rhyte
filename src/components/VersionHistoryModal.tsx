import React, { useState } from 'react';
import { History, X, RotateCcw, Clock, Plus, Check } from 'lucide-react';
import { ProjectSnapshot, SongProject } from '../types/lyric';

interface VersionHistoryModalProps {
  currentProject: SongProject;
  snapshots: ProjectSnapshot[];
  onCreateSnapshot: (label?: string) => void;
  onRestoreSnapshot: (snapshot: ProjectSnapshot) => void;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  currentProject,
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
  onClose,
}) => {
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const handleCreate = () => {
    onCreateSnapshot(snapshotLabel.trim() || undefined);
    setSnapshotLabel('');
  };

  const handleRestore = (snap: ProjectSnapshot) => {
    onRestoreSnapshot(snap);
    setRestoredId(snap.id);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0e111a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Version Snapshots</h2>
              <p className="text-xs text-white/50">
                Revert to previous takes, drafts, and editing checkpoints.
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

        {/* Create Manual Snapshot */}
        <div className="p-4 border-b border-white/10 bg-white/[0.01]">
          <div className="flex gap-2">
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Name this take (e.g. 'Tightened Hook take 2')..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleCreate}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition"
            >
              <Plus size={14} />
              <span>Snapshot</span>
            </button>
          </div>
        </div>

        {/* Snapshots Timeline */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {snapshots.length === 0 ? (
            <div className="py-12 text-center text-xs text-white/30 space-y-2">
              <Clock size={24} className="mx-auto opacity-30 text-cyan-400" />
              <p>No snapshots recorded yet.</p>
              <p className="text-[11px] text-white/20">
                Rhyte automatically creates snapshots every few minutes as you write.
              </p>
            </div>
          ) : (
            snapshots.map((snap) => {
              const dateStr = new Date(snap.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={snap.id}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition flex items-center justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white/90">{snap.label}</span>
                      <span className="text-[10px] font-mono text-white/40">{dateStr}</span>
                    </div>
                    <span className="text-[11px] text-white/50 block mt-0.5">
                      {snap.project.sections.length} sections &bull;{' '}
                      {snap.project.sections.reduce((a, b) => a + b.lines.length, 0)} lines
                    </span>
                  </div>

                  <button
                    onClick={() => handleRestore(snap)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs flex items-center gap-1 transition"
                  >
                    {restoredId === snap.id ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>Restored</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw size={12} />
                        <span>Revert</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
