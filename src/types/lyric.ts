export type SectionType =
  | 'intro'
  | 'verse'
  | 'hook'
  | 'chorus'
  | 'pre-chorus'
  | 'bridge'
  | 'outro'
  | 'freestyle'
  | 'custom';

export type RhymeType = 'perfect' | 'slant' | 'multi' | 'internal' | 'assonant';

export interface TokenPhonetics {
  raw: string;
  normalized: string;
  syllables: number;
  rhymeKey: string; // Vowel nucleus + coda hash
  vowelSound: string;
  isEndWord?: boolean;
  rhymeFamilyId?: number; // 0 to 7
  isMultiSyllableMatch?: boolean;
}

export interface LyricLine {
  id: string;
  rawText: string;
  syllableCount: number;
  tokens: TokenPhonetics[];
  endRhymeKey?: string;
  rhymeFamilyId?: number; // 0 to 7 for deterministic color
  internalRhymeKeys?: string[];
  isCadenceOutlier?: boolean; // Warns if deviates too much from average
  voiceMemoUrl?: string;
  notes?: string;
}

export interface LyricSection {
  id: string;
  name: string;
  type: SectionType;
  positionIndex: number;
  targetBars: number;
  lockedSyllableBudget?: number; // Optional target e.g. 10 or 12
  lines: LyricLine[];
}

export interface SongProject {
  id: string;
  title: string;
  bpm: number;
  keySignature: string;
  genre: string;
  mood: string;
  tags: string[];
  sections: LyricSection[];
  notes: string;
  favoriteLines: string[]; // Punchline locker
  createdAt: number;
  updatedAt: number;
}

export interface ProjectSnapshot {
  id: string;
  timestamp: number;
  label: string;
  project: SongProject;
}

export interface RhymeWordItem {
  word: string;
  syllables: number;
  score?: number;
  type: 'perfect' | 'slant' | 'multi' | 'synonym' | 'related';
  definition?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'obsidian';
  fontSize: number; // 14 to 24
  fontFamily: 'sans' | 'mono';
  colorblindMode: boolean;
  highlightMode: 'all' | 'end-only' | 'internal-only' | 'heatmap' | 'none';
  metronomeVolume: number; // 0 to 1
  autoScroll: boolean;
  syllableTolerance: number; // variance before showing warning pill, default 3
}
