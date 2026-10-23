import React, { useRef, useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Star,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  CornerDownLeft,
  Volume2,
} from 'lucide-react';
import { LyricLine, LyricSection, SongProject, UserSettings } from '../types/lyric';
import { analyzeLine, processSectionRhymesAndCadence } from '../utils/phonetics';

interface LyricEditorProps {
  project: SongProject;
  activeSectionId: string;
  onUpdateSections: (sections: LyricSection[]) => void;
  onSelectWord: (word: string, lineId: string, tokenIndex: number) => void;
  selectedWord: string | null;
  onOpenAssistantForLine?: (lineText: string, lineId: string) => void;
  onToggleFavoriteLine: (lineText: string) => void;
  settings: UserSettings;
}

export const LyricEditor: React.FC<LyricEditorProps> = ({
  project,
  activeSectionId,
  onUpdateSections,
  onSelectWord,
  selectedWord,
  onOpenAssistantForLine,
  onToggleFavoriteLine,
  settings,
}) => {
  const [focusMode, setFocusMode] = useState(false);
  const activeInputRef = useRef<HTMLInputElement | null>(null);

  const activeSection =
    project.sections.find((s) => s.id === activeSectionId) || project.sections[0];

  // Update a line in a section
  const handleLineChange = (sectionId: string, lineIndex: number, newText: string) => {
    const updatedSections = project.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;

      const newLines = [...sec.lines];
      const updatedLine = analyzeLine(newText, newLines[lineIndex]?.id || `line_${Date.now()}`);
      newLines[lineIndex] = updatedLine;

      return processSectionRhymesAndCadence({ ...sec, lines: newLines });
    });

    onUpdateSections(updatedSections);
  };

  // Add line below
  const handleAddLine = (sectionId: string, afterIndex: number) => {
    const updatedSections = project.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;

      const newLines = [...sec.lines];
      newLines.splice(
        afterIndex + 1,
        0,
        analyzeLine('', `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`)
      );

      return processSectionRhymesAndCadence({ ...sec, lines: newLines });
    });

    onUpdateSections(updatedSections);
  };

  // Delete line
  const handleDeleteLine = (sectionId: string, lineIndex: number) => {
    const updatedSections = project.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      if (sec.lines.length <= 1) return sec; // Keep at least one line

      const newLines = sec.lines.filter((_, idx) => idx !== lineIndex);
      return processSectionRhymesAndCadence({ ...sec, lines: newLines });
    });

    onUpdateSections(updatedSections);
  };

  // Keyboard navigation on line inputs
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    sectionId: string,
    lineIndex: number,
    lineText: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLine(sectionId, lineIndex);
      // Wait for next render to focus next input
      setTimeout(() => {
        const nextInput = document.getElementById(`line-input-${sectionId}-${lineIndex + 1}`);
        if (nextInput) nextInput.focus();
      }, 50);
    } else if (e.key === 'Backspace' && lineText === '') {
      e.preventDefault();
      const prevInput = document.getElementById(`line-input-${sectionId}-${lineIndex - 1}`);
      if (prevInput) prevInput.focus();
      handleDeleteLine(sectionId, lineIndex);
    } else if (e.key === 'ArrowUp' && lineIndex > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`line-input-${sectionId}-${lineIndex - 1}`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = document.getElementById(`line-input-${sectionId}-${lineIndex + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Quick rhyme family badge color styling
  const getFamilyBadge = (familyId?: number) => {
    if (familyId === undefined) return null;
    const colors = [
      'bg-amber-400 text-black border-amber-300',
      'bg-cyan-400 text-black border-cyan-300',
      'bg-purple-400 text-white border-purple-300',
      'bg-orange-500 text-white border-orange-400',
      'bg-lime-400 text-black border-lime-300',
      'bg-pink-500 text-white border-pink-400',
      'bg-yellow-400 text-black border-yellow-300',
      'bg-blue-400 text-black border-blue-300',
    ];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const colorClass = colors[familyId % colors.length];
    const letter = letters[familyId % letters.length];

    return (
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border shadow-sm ${colorClass}`}
        title={`Rhyme Family ${letter}`}
      >
        {letter}
      </span>
    );
  };

  return (
    <div
      className={`flex-1 flex flex-col overflow-y-auto px-4 sm:px-8 py-6 transition-colors ${
        settings.fontFamily === 'mono' ? 'font-mono' : 'font-sans'
      }`}
      style={{ fontSize: `${settings.fontSize}px` }}
    >
      {/* Top Bar inside Editor: Section Header & Focus Mode Switch */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
              {activeSection?.name}
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/60">
              {activeSection?.targetBars} Bars
            </span>
            {activeSection?.lockedSyllableBudget && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Target: {activeSection.lockedSyllableBudget} syl
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 mt-1">
            Type lyrics below. Syllables calculate instantly. Click any word to inspect rhymes.
          </p>
        </div>

        {/* Focus Mode & View toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              focusMode
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
            title="Focus mode dims other sections"
          >
            {focusMode ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="hidden sm:inline">Focus Mode</span>
          </button>
        </div>
      </div>

      {/* Main Sections Loop */}
      <div className="max-w-4xl w-full mx-auto space-y-10 pb-20">
        {project.sections.map((section) => {
          const isSectionActive = section.id === activeSectionId;
          if (focusMode && !isSectionActive) return null;

          return (
            <div
              key={section.id}
              className={`rounded-2xl transition-all ${
                isSectionActive
                  ? 'opacity-100 ring-1 ring-cyan-500/20 bg-white/[0.01] p-3 sm:p-5'
                  : 'opacity-50 hover:opacity-85 p-3 sm:p-5'
              }`}
            >
              {/* Section Header if in multi-section view */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <h3 className="font-bold text-sm tracking-wide text-white/80 uppercase">
                    [{section.name}]
                  </h3>
                  <span className="text-xs text-white/40">
                    {section.lines.filter((l) => l.rawText.trim().length > 0).length} /{' '}
                    {section.targetBars} bars
                  </span>
                </div>

                <div className="text-xs text-white/40 font-mono">
                  Total: {section.lines.reduce((a, b) => a + b.syllableCount, 0)} syllables
                </div>
              </div>

              {/* Lines Container */}
              <div className="space-y-2">
                {section.lines.map((line, lineIdx) => {
                  const isFavorited = project.favoriteLines?.includes(line.rawText.trim());

                  return (
                    <div
                      key={line.id}
                      className="group relative flex items-center gap-2 sm:gap-3 py-1 px-2 rounded-xl transition hover:bg-white/[0.04]"
                    >
                      {/* Bar / Line Number */}
                      <span className="w-6 sm:w-8 font-mono text-[11px] text-white/30 text-right select-none shrink-0 group-hover:text-white/60">
                        {lineIdx + 1}
                      </span>

                      {/* Line End Rhyme Family Badge */}
                      <div className="w-5 flex items-center justify-center shrink-0">
                        {getFamilyBadge(line.rhymeFamilyId)}
                      </div>

                      {/* Main Text Input Area with Word Tokens Display Mode on Inactive */}
                      <div className="flex-1 relative flex items-center min-w-0">
                        <input
                          id={`line-input-${section.id}-${lineIdx}`}
                          type="text"
                          value={line.rawText}
                          onChange={(e) =>
                            handleLineChange(section.id, lineIdx, e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, section.id, lineIdx, line.rawText)
                          }
                          placeholder={lineIdx === 0 ? 'Type your first bar here...' : 'Lay a bar...'}
                          className="w-full bg-transparent text-white font-medium outline-none py-1.5 px-2 rounded-lg border border-transparent focus:border-cyan-500/40 focus:bg-white/[0.05] transition"
                        />
                      </div>

                      {/* Word Inspector Quick Pills on Hover (Click any token) */}
                      {line.tokens.length > 0 && (
                        <div className="hidden xl:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity max-w-[200px] overflow-x-hidden">
                          {line.tokens.slice(-3).map((tok, tokIdx) => (
                            <button
                              key={tokIdx}
                              onClick={() => onSelectWord(tok.raw, line.id, tokIdx)}
                              className={`text-[10px] px-1.5 py-0.5 rounded border transition truncate ${
                                selectedWord?.toLowerCase() === tok.normalized
                                  ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/15'
                              }`}
                              title={`Inspect rhymes for "${tok.raw}" (${tok.syllables} syl)`}
                            >
                              {tok.raw}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Syllable Counter Gutter (Right) */}
                      <div className="shrink-0 flex items-center gap-1.5 select-none">
                        <div
                          className={`min-w-8 h-7 px-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition border ${
                            line.syllableCount === 0
                              ? 'bg-transparent text-white/20 border-transparent'
                              : line.isCadenceOutlier
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-white/5 text-white/80 border-white/10'
                          }`}
                          title={`Syllables: ${line.syllableCount}${
                            line.isCadenceOutlier ? ' (Cadence outlier compared to section)' : ''
                          }`}
                        >
                          {line.syllableCount > 0 ? line.syllableCount : '—'}
                        </div>
                      </div>

                      {/* Line Hover Tooling Bar */}
                      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Star / Favorite line */}
                        {line.rawText.trim() && (
                          <button
                            onClick={() => onToggleFavoriteLine(line.rawText.trim())}
                            className={`p-1.5 rounded-lg transition ${
                              isFavorited
                                ? 'text-amber-400 hover:text-amber-300'
                                : 'text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                            title="Save to Idea / Punchline Locker"
                          >
                            <Star size={13} fill={isFavorited ? 'currentColor' : 'none'} />
                          </button>
                        )}

                        {/* AI / Algorithmic Assistance for this specific line */}
                        {onOpenAssistantForLine && (
                          <button
                            onClick={() => onOpenAssistantForLine(line.rawText, line.id)}
                            className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition"
                            title="Suggest next line or rewrite in style"
                          >
                            <Sparkles size={13} />
                          </button>
                        )}

                        {/* Add line below */}
                        <button
                          onClick={() => handleAddLine(section.id, lineIdx)}
                          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition"
                          title="Add bar below"
                        >
                          <Plus size={13} />
                        </button>

                        {/* Delete line */}
                        {section.lines.length > 1 && (
                          <button
                            onClick={() => handleDeleteLine(section.id, lineIdx)}
                            className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete bar"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Line Adder */}
              <div className="mt-4 pt-2 flex items-center justify-between text-xs text-white/40">
                <button
                  onClick={() => handleAddLine(section.id, section.lines.length - 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                >
                  <Plus size={12} className="text-cyan-400" />
                  <span>Add Bar (Enter)</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono">
                    Cadence Average:{' '}
                    {Math.round(
                      section.lines.reduce((a, b) => a + b.syllableCount, 0) /
                        (section.lines.filter((l) => l.syllableCount > 0).length || 1)
                    )}{' '}
                    syl/bar
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
