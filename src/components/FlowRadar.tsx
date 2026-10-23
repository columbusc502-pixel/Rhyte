import React from 'react';
import {
  Activity,
  Flame,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  Music,
  Compass,
} from 'lucide-react';
import { SongProject } from '../types/lyric';
import { calculateSongMetrics } from '../utils/phonetics';

interface FlowRadarProps {
  project: SongProject;
  activeSectionId: string;
}

export const FlowRadar: React.FC<FlowRadarProps> = ({ project, activeSectionId }) => {
  const activeSection =
    project.sections.find((s) => s.id === activeSectionId) || project.sections[0];

  const metrics = calculateSongMetrics(project.sections);

  // Line syllable distribution for the active section
  const lines = activeSection?.lines || [];
  const nonZeroLines = lines.filter((l) => l.syllableCount > 0);
  const avgSyllables =
    nonZeroLines.length > 0
      ? Math.round(
          nonZeroLines.reduce((acc, l) => acc + l.syllableCount, 0) / nonZeroLines.length
        )
      : 10;

  const targetBudget = activeSection?.lockedSyllableBudget || avgSyllables;

  // Syllable heatmap color calculator
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-white/10 text-white/30';
    const diff = Math.abs(count - targetBudget);
    if (diff <= 1) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (diff <= 3) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (count > targetBudget) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-5xl mx-auto text-white">
      {/* Title & Overview Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={22} className="text-cyan-400" />
            <h1 className="text-2xl font-black tracking-tight">Cadence & Flow Lab</h1>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Real-time vocal rhythm metrics, syllable balance radar, and repetition analysis for{' '}
            <span className="text-white font-semibold">[{activeSection?.name}]</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
            <span className="text-[10px] text-white/40 uppercase block font-mono">Target Pocket</span>
            <span className="text-sm font-bold font-mono text-cyan-400">
              {targetBudget} syl / bar
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
            <span className="text-[10px] text-white/40 uppercase block font-mono">Rhyme Density</span>
            <span className="text-sm font-bold font-mono text-purple-400">
              {metrics.rhymeDensity}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Cadence Bar Radar & Syllable Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Visual Cadence Bar Chart */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-cyan-400" />
              <h3 className="font-bold text-sm tracking-wide">Line-by-Line Syllable Radar</h3>
            </div>
            <span className="text-xs text-white/40 font-mono">
              Ideal Zone: {Math.max(4, targetBudget - 2)} - {targetBudget + 2} syl
            </span>
          </div>

          <div className="space-y-2 pt-2">
            {lines.map((l, idx) => {
              const maxScale = 20;
              const barWidth = Math.min(100, (l.syllableCount / maxScale) * 100);
              const isHeavy = l.syllableCount > targetBudget + 3;
              const isShort = l.syllableCount > 0 && l.syllableCount < targetBudget - 3;

              return (
                <div key={l.id} className="flex items-center gap-3 text-xs group">
                  {/* Line # */}
                  <span className="w-6 font-mono text-[11px] text-white/40 text-right">
                    {idx + 1}
                  </span>

                  {/* Visual Bar representation */}
                  <div className="flex-1 bg-white/5 h-6 rounded-lg relative overflow-hidden flex items-center px-2">
                    {/* Target corridor indicator line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-cyan-400/50 z-10"
                      style={{ left: `${(targetBudget / maxScale) * 100}%` }}
                      title={`Target cadence: ${targetBudget} syl`}
                    />

                    {/* Progress Bar fill */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-300 rounded-lg ${
                        isHeavy
                          ? 'bg-rose-500/30'
                          : isShort
                          ? 'bg-amber-500/30'
                          : 'bg-gradient-to-r from-cyan-500/20 to-purple-500/30'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />

                    {/* Line preview snippet */}
                    <span className="relative z-10 text-[11px] text-white/80 truncate font-medium">
                      {l.rawText || <span className="text-white/20 italic">Empty bar</span>}
                    </span>
                  </div>

                  {/* Syllable Count Badge */}
                  <div
                    className={`w-12 text-center py-1 rounded-md font-mono text-xs font-bold border transition ${getHeatmapColor(
                      l.syllableCount
                    )}`}
                  >
                    {l.syllableCount > 0 ? `${l.syllableCount}s` : '—'}
                  </div>

                  {/* Warning Pill if outlier */}
                  <div className="w-16 text-right shrink-0">
                    {isHeavy && (
                      <span className="text-[10px] text-rose-400 font-bold flex items-center justify-end gap-1">
                        <AlertTriangle size={10} /> +{l.syllableCount - targetBudget}
                      </span>
                    )}
                    {isShort && (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center justify-end gap-1">
                        Short
                      </span>
                    )}
                    {!isHeavy && !isShort && l.syllableCount > 0 && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 size={10} /> Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Repetition & Vocabulary Enhancer */}
        <div className="space-y-6">
          {/* Repetition & Crutch Word Tracker */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-purple-400" />
              <h3 className="font-bold text-sm tracking-wide">Repetition Detector</h3>
            </div>
            <p className="text-xs text-white/50">
              Words repeated multiple times across the song. Check if you are leaning on crutch words.
            </p>

            <div className="space-y-2 pt-2">
              {metrics.frequentWords.length === 0 ? (
                <div className="text-xs text-white/30 py-4 text-center">
                  Write more bars to see repetition patterns!
                </div>
              ) : (
                metrics.frequentWords.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-white/5 border border-white/5 text-xs"
                  >
                    <span className="font-semibold text-white/90 capitalize">"{item.word}"</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">
                        {item.count} &times;
                      </span>
                      {item.count >= 4 && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">
                          Frequent
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Genre Cadence Cheat Sheet */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Music size={16} className="text-amber-400" />
              <h3 className="font-bold text-sm tracking-wide">Genre Flow Profiles</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="flex justify-between font-bold text-white/90">
                  <span>Boom-Bap / 90s</span>
                  <span className="font-mono text-cyan-400">10–12 syl</span>
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Consistent bar weight, heavy 2 & 4 snare snaps, internal multi-syllable rhyme pockets.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="flex justify-between font-bold text-white/90">
                  <span>Trap / Drill</span>
                  <span className="font-mono text-cyan-400">12–16 syl</span>
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Fast triplet delivery, abrupt metric stops, heavy slant rhyme clusters.
                </p>
              </div>

              <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="flex justify-between font-bold text-white/90">
                  <span>Pop Anthem</span>
                  <span className="font-mono text-cyan-400">8–10 syl</span>
                </div>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Short, anthemic lines with strong vowel endings for maximum sing-along recall.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
