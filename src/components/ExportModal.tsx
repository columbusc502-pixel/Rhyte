import React, { useState } from 'react';
import { Download, X, Copy, Check, Printer, FileText, Code } from 'lucide-react';
import { SongProject } from '../types/lyric';
import {
  downloadTextFile,
  formatLyricsAsMarkdown,
  formatLyricsAsText,
  printFormattedLyrics,
} from '../utils/exportLyrics';

interface ExportModalProps {
  project: SongProject;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onClose }) => {
  const [includeSyllables, setIncludeSyllables] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopyClipboard = (withSyllables: boolean) => {
    const text = formatLyricsAsText(project, withSyllables);
    navigator.clipboard.writeText(text);
    setCopiedType(withSyllables ? 'syl' : 'clean');
    setTimeout(() => setCopiedType(null), 1500);
  };

  const handleDownloadTxt = () => {
    const content = formatLyricsAsText(project, includeSyllables);
    const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_lyrics.txt`;
    downloadTextFile(content, filename);
  };

  const handleDownloadMd = () => {
    const content = formatLyricsAsMarkdown(project);
    const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_lyrics.md`;
    downloadTextFile(content, filename);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0e111a] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight">Export & Share Lyrics</h2>
              <p className="text-xs text-white/50">
                Generate clean text, studio sheets, or copy straight to your notes.
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

        {/* Options */}
        <div className="p-5 space-y-4">
          {/* Include Syllables Checkbox */}
          <label className="flex items-center gap-2 text-xs font-semibold text-white/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSyllables}
              onChange={(e) => setIncludeSyllables(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-0"
            />
            <span>Include syllable metrics in export [e.g. "Line text [10]"]</span>
          </label>

          {/* Export Grid Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Copy Clean Lyrics */}
            <button
              onClick={() => handleCopyClipboard(false)}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
                {copiedType === 'clean' ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  {copiedType === 'clean' ? 'Copied to Clipboard!' : 'Copy Lyrics'}
                </span>
                <span className="text-[11px] text-white/40">Clean plain text ready to paste</span>
              </div>
            </button>

            {/* Copy With Syllables */}
            <button
              onClick={() => handleCopyClipboard(true)}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                {copiedType === 'syl' ? <Check size={18} className="text-emerald-400" /> : <FileText size={18} />}
              </div>
              <div>
                <span className="font-bold text-xs text-white block">
                  {copiedType === 'syl' ? 'Copied with Cadence!' : 'Copy with Syllables'}
                </span>
                <span className="text-[11px] text-white/40">Includes count tags for vocal timing</span>
              </div>
            </button>

            {/* Download TXT */}
            <button
              onClick={handleDownloadTxt}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                <Download size={18} />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Download .TXT</span>
                <span className="text-[11px] text-white/40">Universal text file</span>
              </div>
            </button>

            {/* Print / PDF Sheet */}
            <button
              onClick={() => printFormattedLyrics(project)}
              className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex items-start gap-3 group"
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                <Printer size={18} />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Print / Save as PDF</span>
                <span className="text-[11px] text-white/40">Studio lyric sheet layout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
