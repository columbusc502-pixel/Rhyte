import React, { useState } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Lock,
  Unlock,
  Check,
  MoreVertical,
  Music2,
} from 'lucide-react';
import { LyricSection, SectionType, SongProject } from '../types/lyric';
import { analyzeLine, processSectionRhymesAndCadence } from '../utils/phonetics';

interface SidebarSectionsProps {
  project: SongProject;
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  onUpdateSections: (sections: LyricSection[]) => void;
  rhymeDensity: number;
}

export const SidebarSections: React.FC<SidebarSectionsProps> = ({
  project,
  activeSectionId,
  onSelectSection,
  onUpdateSections,
  rhymeDensity,
}) => {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  // Add a new section
  const handleAddSection = (type: SectionType, name: string, targetBars = 16) => {
    const newSection: LyricSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      type,
      positionIndex: project.sections.length,
      targetBars,
      lines: [
        analyzeLine('', `line_${Date.now()}_0`),
        analyzeLine('', `line_${Date.now()}_1`),
        analyzeLine('', `line_${Date.now()}_2`),
        analyzeLine('', `line_${Date.now()}_3`),
      ],
    };

    const updated = [...project.sections, processSectionRhymesAndCadence(newSection)];
    onUpdateSections(updated);
    onSelectSection(newSection.id);
  };

  // Move section position
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.sections.length) return;

    const reordered = [...project.sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update position indices
    const updated = reordered.map((sec, i) => ({ ...sec, positionIndex: i }));
    onUpdateSections(updated);
  };

  // Duplicate a section
  const handleDuplicateSection = (section: LyricSection) => {
    const duplicated: LyricSection = {
      ...section,
      id: `sec_${Date.now()}_dup`,
      name: `${section.name} (Copy)`,
      lines: section.lines.map((l, i) =>
        analyzeLine(l.rawText, `line_${Date.now()}_dup_${i}`)
      ),
    };

    const updated = [...project.sections, processSectionRhymesAndCadence(duplicated)];
    onUpdateSections(updated);
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    if (project.sections.length <= 1) return; // Keep at least one section
    const updated = project.sections.filter((s) => s.id !== sectionId);
    onUpdateSections(updated);
    if (activeSectionId === sectionId) {
      onSelectSection(updated[0].id);
    }
  };

  // Rename section
  const startRename = (sec: LyricSection) => {
    setEditingSectionId(sec.id);
    setEditingName(sec.name);
  };

  const saveRename = (secId: string) => {
    if (!editingName.trim()) {
      setEditingSectionId(null);
      return;
    }
    const updated = project.sections.map((s) =>
      s.id === secId ? { ...s, name: editingName.trim() } : s
    );
    onUpdateSections(updated);
    setEditingSectionId(null);
  };

  // Copy entire section text to clipboard
  const handleCopySection = (sec: LyricSection) => {
    const text = sec.lines.map((l) => l.rawText).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSectionId(sec.id);
    setTimeout(() => setCopiedSectionId(null), 1500);
  };

  // Toggle Syllable Budget Lock
  const handleToggleSyllableLock = (sec: LyricSection) => {
    const nonZero = sec.lines.filter((l) => l.syllableCount > 0);
    const avg =
      nonZero.length > 0
        ? Math.round(nonZero.reduce((a, b) => a + b.syllableCount, 0) / nonZero.length)
        : 10;

    const newBudget = sec.lockedSyllableBudget ? undefined : avg;
    const updated = project.sections.map((s) =>
      s.id === sec.id
        ? processSectionRhymesAndCadence({ ...s, lockedSyllableBudget: newBudget })
        : s
    );
    onUpdateSections(updated);
  };

  return (
    <aside className="w-full lg:w-64 flex flex-col shrink-0 border-r border-white/10 bg-[#0d1017] p-3 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">
            Song Sections
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/40">
          {project.sections.length} blocks
        </span>
      </div>

      {/* Sections List */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
        {project.sections.map((sec, idx) => {
          const isActive = sec.id === activeSectionId;
          const activeLineCount = sec.lines.filter((l) => l.rawText.trim().length > 0).length;
          const isBarComplete = activeLineCount >= sec.targetBars;

          return (
            <div
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`group relative rounded-lg p-2.5 transition cursor-pointer border ${
                isActive
                  ? 'bg-white/10 border-cyan-500/50 shadow-md shadow-cyan-500/5'
                  : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Name / Rename Input */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-cyan-400' : 'bg-white/20'
                    }`}
                  />
                  {editingSectionId === sec.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => saveRename(sec.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename(sec.id)}
                      autoFocus
                      className="text-xs font-semibold bg-white/10 px-1 py-0.5 rounded outline-none w-full"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startRename(sec)}
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-white' : 'text-white/80'
                      }`}
                      title="Double click to rename"
                    >
                      {sec.name}
                    </span>
                  )}
                </div>

                {/* Bar progress counter */}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isBarComplete
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/5 text-white/50'
                  }`}
                  title={`${activeLineCount} of ${sec.targetBars} target bars`}
                >
                  {activeLineCount}/{sec.targetBars}b
                </span>
              </div>

              {/* Cadence lock status and quick actions on hover */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[10px] text-white/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSyllableLock(sec);
                  }}
                  className={`flex items-center gap-1 hover:text-white transition ${
                    sec.lockedSyllableBudget ? 'text-amber-400' : ''
                  }`}
                  title={
                    sec.lockedSyllableBudget
                      ? `Locked at ${sec.lockedSyllableBudget} syl/line. Click to unlock.`
                      : 'Lock syllable target for cadence warnings'
                  }
                >
                  {sec.lockedSyllableBudget ? (
                    <>
                      <Lock size={10} />
                      <span>{sec.lockedSyllableBudget} syl lock</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={10} />
                      <span>Free cadence</span>
                    </>
                  )}
                </button>

                {/* Section Quick Hover Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveSection(idx, 'up');
                    }}
                    disabled={idx === 0}
                    className="p-0.5 hover:text-white disabled:opacity-20"
                    title="Move up"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveSection(idx, 'down');
                    }}
                    disabled={idx === project.sections.length - 1}
                    className="p-0.5 hover:text-white disabled:opacity-20"
                    title="Move down"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySection(sec);
                    }}
                    className="p-0.5 hover:text-white"
                    title="Copy section lyrics"
                  >
                    {copiedSectionId === sec.id ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateSection(sec);
                    }}
                    className="p-0.5 hover:text-white"
                    title="Duplicate section"
                  >
                    <Layers size={12} />
                  </button>
                  {project.sections.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(sec.id);
                      }}
                      className="p-0.5 hover:text-red-400 text-red-400/60"
                      title="Delete section"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Section Presets */}
      <div className="pt-3 border-t border-white/10 mt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1.5">
          + Add Section
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() =>
              handleAddSection(
                'verse',
                `Verse ${
                  project.sections.filter((s) => s.type === 'verse').length + 1
                }`,
                16
              )
            }
            className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition text-left"
          >
            <Plus size={11} className="text-cyan-400" />
            <span>Verse (16b)</span>
          </button>
          <button
            onClick={() => handleAddSection('hook', 'Hook', 8)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition text-left"
          >
            <Plus size={11} className="text-purple-400" />
            <span>Hook (8b)</span>
          </button>
          <button
            onClick={() => handleAddSection('bridge', 'Bridge', 8)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition text-left"
          >
            <Plus size={11} className="text-amber-400" />
            <span>Bridge</span>
          </button>
          <button
            onClick={() => handleAddSection('intro', 'Outro', 4)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition text-left"
          >
            <Plus size={11} className="text-emerald-400" />
            <span>Outro</span>
          </button>
        </div>
      </div>

      {/* Mini Rhyme Density Stat */}
      <div className="mt-3 p-2.5 rounded-lg bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-white/5">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/60">Rhyme Density</span>
          <span className="font-mono font-bold text-cyan-400">{rhymeDensity}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, rhymeDensity)}%` }}
          />
        </div>
        <span className="text-[10px] text-white/40 block mt-1">
          {rhymeDensity >= 60 ? '🔥 High flow complexity' : 'Balanced lyrical pocket'}
        </span>
      </div>
    </aside>
  );
};
