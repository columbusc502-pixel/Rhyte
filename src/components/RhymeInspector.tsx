import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Bookmark,
  Volume2,
  Copy,
  Check,
  Filter,
  Layers,
  ArrowRight,
  Flame,
  X,
} from 'lucide-react';
import { RhymeWordItem } from '../types/lyric';
import { lookupRhymes } from '../utils/rhymeDictionary';
import { countWordSyllables } from '../utils/phonetics';

interface RhymeInspectorProps {
  selectedWord: string | null;
  onSelectWord: (word: string) => void;
  onInsertWord?: (word: string) => void;
  onAddToFavorites?: (lineOrWord: string) => void;
  onClose?: () => void;
}

export const RhymeInspector: React.FC<RhymeInspectorProps> = ({
  selectedWord,
  onSelectWord,
  onInsertWord,
  onAddToFavorites,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState(selectedWord || 'night');
  const [activeTab, setActiveTab] = useState<'perfect' | 'slant' | 'multi' | 'synonyms'>('perfect');
  const [syllableFilter, setSyllableFilter] = useState<number | 'all'>('all');
  const [toneFilter, setToneFilter] = useState<'all' | 'rap' | 'poetic' | 'clean'>('all');
  const [loading, setLoading] = useState(false);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  const [rhymeData, setRhymeData] = useState<{
    perfect: RhymeWordItem[];
    slant: RhymeWordItem[];
    multi: RhymeWordItem[];
    synonyms: RhymeWordItem[];
  }>({
    perfect: [],
    slant: [],
    multi: [],
    synonyms: [],
  });

  // Whenever selectedWord changes from parent, sync search
  useEffect(() => {
    if (selectedWord && selectedWord.trim()) {
      setSearchTerm(selectedWord.trim().replace(/[^a-zA-Z']/g, ''));
    }
  }, [selectedWord]);

  // Fetch rhymes when searchTerm changes
  useEffect(() => {
    let isMounted = true;
    if (!searchTerm.trim()) return;

    setLoading(true);
    lookupRhymes(searchTerm.trim()).then((data) => {
      if (isMounted) {
        setRhymeData(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  const handleCopyWord = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  // Filter current active list
  const currentList = rhymeData[activeTab];
  const filteredWords = currentList.filter((item) => {
    if (syllableFilter !== 'all' && item.syllables !== syllableFilter) {
      return false;
    }
    // Tone filtering simulation (e.g. multi-syllables and gritty slants)
    if (toneFilter === 'rap' && item.syllables < 2 && activeTab === 'perfect') {
      return true; // Still include good words
    }
    return true;
  });

  // Group filtered words by syllable count
  const syllableGroups: Record<number, RhymeWordItem[]> = {};
  filteredWords.forEach((item) => {
    if (!syllableGroups[item.syllables]) {
      syllableGroups[item.syllables] = [];
    }
    syllableGroups[item.syllables].push(item);
  });

  const availableSyllables = Object.keys(syllableGroups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <aside className="w-full lg:w-80 flex flex-col shrink-0 border-l border-white/10 bg-[#0d1017] p-3.5 text-white select-none">
      {/* Top Bar with Search & Close */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">
            Rhyme Dictionary
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white rounded lg:hidden"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Word Search Bar */}
      <div className="relative mb-3">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search word or rhyme..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Current Active Word Pill */}
      {searchTerm && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-slate-900 border border-white/10 mb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white capitalize">
                "{searchTerm}"
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">
                {countWordSyllables(searchTerm)} syl
              </span>
            </div>
            <span className="text-[10px] text-white/50 block mt-0.5">
              Phonetic matches found: {rhymeData.perfect.length + rhymeData.slant.length}
            </span>
          </div>

          <button
            onClick={() => onAddToFavorites && onAddToFavorites(searchTerm)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400"
            title="Save to Idea Locker"
          >
            <Bookmark size={14} />
          </button>
        </div>
      )}

      {/* Rhyme Type Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-lg text-[11px] font-semibold mb-3">
        <button
          onClick={() => setActiveTab('perfect')}
          className={`py-1 rounded text-center transition ${
            activeTab === 'perfect'
              ? 'bg-cyan-500 text-black font-bold shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Exact
        </button>
        <button
          onClick={() => setActiveTab('slant')}
          className={`py-1 rounded text-center transition ${
            activeTab === 'slant'
              ? 'bg-purple-500 text-white font-bold shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Slant
        </button>
        <button
          onClick={() => setActiveTab('multi')}
          className={`py-1 rounded text-center transition ${
            activeTab === 'multi'
              ? 'bg-amber-500 text-black font-bold shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Multi
        </button>
        <button
          onClick={() => setActiveTab('synonyms')}
          className={`py-1 rounded text-center transition ${
            activeTab === 'synonyms'
              ? 'bg-emerald-500 text-black font-bold shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Syns
        </button>
      </div>

      {/* Syllable Filters (All, 1, 2, 3, 4+) */}
      <div className="flex items-center gap-1 mb-3 text-[10px] font-mono overflow-x-auto pb-1">
        <span className="text-white/40 mr-1 flex items-center gap-0.5">
          <Filter size={10} /> Syl:
        </span>
        <button
          onClick={() => setSyllableFilter('all')}
          className={`px-2 py-0.5 rounded transition ${
            syllableFilter === 'all'
              ? 'bg-white/20 text-white font-bold'
              : 'bg-white/5 text-white/50 hover:text-white'
          }`}
        >
          All
        </button>
        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => setSyllableFilter(s)}
            className={`px-2 py-0.5 rounded transition ${
              syllableFilter === s
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            {s}{s === 4 ? '+' : ''}syl
          </button>
        ))}
      </div>

      {/* Results Content Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-white/40 space-y-2">
            <Sparkles size={20} className="animate-spin text-cyan-400" />
            <span className="text-xs">Finding sonic matches...</span>
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/40">
            No matches found for "{searchTerm}". Try a different word or slant tab!
          </div>
        ) : (
          availableSyllables.map((syl) => (
            <div key={syl} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/40 border-b border-white/5 pb-1">
                <span>{syl} SYLLABLE{syl > 1 ? 'S' : ''}</span>
                <span>{syllableGroups[syl].length} words</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {syllableGroups[syl].map((item, idx) => (
                  <div
                    key={idx}
                    className="group/word relative flex items-center bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 rounded-lg py-1 px-2 transition cursor-pointer"
                    onClick={() => {
                      if (onInsertWord) onInsertWord(item.word);
                      else handleCopyWord(item.word);
                    }}
                  >
                    <span className="text-xs font-medium text-white/90 group-hover/word:text-cyan-300">
                      {item.word}
                    </span>

                    {/* Quick action buttons on word pill */}
                    <div className="ml-1.5 flex items-center gap-0.5 opacity-0 group-hover/word:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyWord(item.word);
                        }}
                        className="p-0.5 text-white/40 hover:text-white"
                        title="Copy word"
                      >
                        {copiedWord === item.word ? (
                          <Check size={10} className="text-emerald-400" />
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Helpful Hint Footer */}
      <div className="pt-2 border-t border-white/10 mt-2 text-[10px] text-white/40 flex items-center justify-between">
        <span>Click word to insert or copy</span>
        <span className="text-cyan-400 font-mono">Instant engine</span>
      </div>
    </aside>
  );
};
