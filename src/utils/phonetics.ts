import { LyricLine, LyricSection, TokenPhonetics } from '../types/lyric';

// Slang and hip-hop custom syllable dictionary
const SLANG_SYLLABLES: Record<string, number> = {
  finna: 2,
  tryna: 2,
  boutta: 2,
  gonna: 2,
  wanna: 2,
  gotta: 2,
  kinda: 2,
  sorta: 2,
  shawty: 2,
  shorty: 2,
  skrrt: 1,
  skrr: 1,
  drip: 1,
  drippin: 2,
  "drippin'": 2,
  trap: 1,
  trappin: 2,
  "trappin'": 2,
  opps: 1,
  opp: 1,
  gang: 1,
  bando: 2,
  flex: 1,
  flexin: 2,
  "flexin'": 2,
  ballin: 2,
  "ballin'": 2,
  hustle: 2,
  hustlin: 2,
  "hustlin'": 2,
  aye: 1,
  yea: 1,
  yeah: 1,
  nah: 1,
  "hol'up": 2,
  holup: 2,
  bruh: 1,
  homie: 2,
  "y'all": 1,
  "ain't": 1,
  "can't": 1,
  "won't": 1,
  "don't": 1,
  "didn't": 2,
  "couldn't": 2,
  "shouldn't": 2,
  "wouldn't": 2,
  "haven't": 2,
  "hasn't": 2,
  "isn't": 2,
  "aren't": 1,
  "wasn't": 2,
  "weren't": 1,
};

// Common words syllable overrides for high accuracy
const KNOWN_WORDS: Record<string, number> = {
  fire: 1,
  hire: 1,
  wire: 1,
  tire: 1,
  higher: 2,
  liar: 2,
  prior: 2,
  choir: 2,
  hour: 1,
  our: 1,
  sour: 1,
  flower: 2,
  flour: 1,
  power: 2,
  tower: 2,
  shower: 2,
  poem: 2,
  poet: 2,
  poetry: 3,
  rhythm: 2,
  rhyme: 1,
  people: 2,
  every: 2,
  different: 2,
  family: 3,
  memory: 3,
  history: 3,
  mystery: 3,
  business: 2,
  chocolate: 2,
  camera: 2,
  diamond: 2,
  natural: 3,
  forever: 3,
  together: 3,
  beautiful: 3,
  paradise: 3,
  revolution: 4,
  elevation: 4,
  meditation: 4,
  hesitation: 4,
  generation: 4,
};

// Calculate syllables for a single word
export function countWordSyllables(word: string): number {
  if (!word) return 0;
  const lower = word.toLowerCase().trim();
  const cleaned = lower.replace(/[^a-z']/g, '');

  if (!cleaned) return 0;

  // Direct slang lookup
  if (SLANG_SYLLABLES[cleaned] !== undefined) {
    return SLANG_SYLLABLES[cleaned];
  }
  if (KNOWN_WORDS[cleaned] !== undefined) {
    return KNOWN_WORDS[cleaned];
  }

  // Strip apostrophe for generic processing
  const stripped = cleaned.replace(/'/g, '');
  if (stripped.length <= 3) return 1;

  // Rule-based heuristic
  let temp = stripped
    .replace(/(?:r|l)es$/, 'es')
    .replace(/ed$/, '')
    .replace(/n't$/, 'nt')
    .replace(/in'$/, 'ing');

  // Count vowel groups
  const vowelMatches = temp.match(/[aeiouy]{1,3}/g);
  let count = vowelMatches ? vowelMatches.length : 1;

  // Subtractive rules
  if (temp.endsWith('e') && !temp.endsWith('le') && !temp.endsWith('ee') && !temp.endsWith('oe')) {
    count--;
  }
  if (temp.match(/[^aeiouy]le$/)) {
    count++;
  }

  // Handle -ia-, -io-, -iu- hiatus (e.g. champion, radio, media)
  const hiatusMatches = temp.match(/[aeiouy][i][aeou]/g);
  if (hiatusMatches) {
    count += hiatusMatches.length;
  }

  return Math.max(1, count);
}

// Extract phonetic rhyme key (vowel sound + ending consonant pattern)
export function getRhymeKey(word: string): { key: string; vowel: string; coda: string } {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return { key: '', vowel: '', coda: '' };

  // Common suffix patterns for multi-syllabic & slant rhyme identification
  const patterns: [RegExp, string, string][] = [
    [/ation$/, 'EY_SH_AH_N', 'EY'],
    [/ition$/, 'IH_SH_AH_N', 'IH'],
    [/sion$/, 'ZH_AH_N', 'AH'],
    [/tion$/, 'SH_AH_N', 'AH'],
    [/ment$/, 'AH_M_T', 'AH'],
    [/ness$/, 'IH_S', 'IH'],
    [/ing$/, 'IH_NG', 'IH'],
    [/ight$/, 'AY_T', 'AY'],
    [/ite$/, 'AY_T', 'AY'],
    [/ime$/, 'AY_M', 'AY'],
    [/yme$/, 'AY_M', 'AY'],
    [/ind$/, 'AY_N_D', 'AY'],
    [/ine$/, 'AY_N', 'AY'],
    [/ound$/, 'AW_N_D', 'AW'],
    [/own$/, 'OW_N', 'OW'],
    [/one$/, 'OW_N', 'OW'],
    [/old$/, 'OW_L_D', 'OW'],
    [/all$/, 'AO_L', 'AO'],
    [/all$/, 'AO_L', 'AO'],
    [/eam$/, 'IY_M', 'IY'],
    [/eem$/, 'IY_M', 'IY'],
    [/eam$/, 'IY_M', 'IY'],
    [/eep$/, 'IY_P', 'IY'],
    [/eak$/, 'IY_K', 'IY'],
    [/eet$/, 'IY_T', 'IY'],
    [/ave$/, 'EY_V', 'EY'],
    [/ake$/, 'EY_K', 'EY'],
    [/ade$/, 'EY_D', 'EY'],
    [/ack$/, 'AE_K', 'AE'],
    [/ash$/, 'AE_SH', 'AE'],
    [/op$/, 'AA_P', 'AA'],
    [/ot$/, 'AA_T', 'AA'],
    [/ock$/, 'AA_K', 'AA'],
    [/ust$/, 'AH_S_T', 'AH'],
    [/um$/, 'AH_M', 'AH'],
    [/un$/, 'AH_N', 'AH'],
    [/ay$/, 'EY', 'EY'],
    [/ey$/, 'EY', 'EY'],
    [/ee$/, 'IY', 'IY'],
    [/y$/, 'IY', 'IY'],
    [/ow$/, 'OW', 'OW'],
    [/ue$/, 'UW', 'UW'],
    [/oo$/, 'UW', 'UW'],
  ];

  for (const [regex, k, v] of patterns) {
    if (regex.test(clean)) {
      return { key: k, vowel: v, coda: k.replace(v, '') };
    }
  }

  // Fallback: extract last vowel group and trailing consonants
  const match = clean.match(/([aeiouy]+)([^aeiouy]*)$/);
  if (match) {
    const vowel = match[1];
    const coda = match[2];
    return {
      key: `${vowel.toUpperCase()}_${coda.toUpperCase() || 'NONE'}`,
      vowel: vowel.toUpperCase(),
      coda: coda.toUpperCase(),
    };
  }

  return { key: clean.toUpperCase(), vowel: clean.toUpperCase(), coda: '' };
}

// Tokenize and analyze a line of lyrics
export function analyzeLine(rawText: string, lineId: string): LyricLine {
  const rawTokens = rawText.split(/\s+/).filter(Boolean);
  let totalSyllables = 0;

  const tokens: TokenPhonetics[] = rawTokens.map((tok, idx) => {
    const isEndWord = idx === rawTokens.length - 1;
    const syl = countWordSyllables(tok);
    totalSyllables += syl;

    const { key, vowel } = getRhymeKey(tok);

    return {
      raw: tok,
      normalized: tok.toLowerCase().replace(/[^a-z']/g, ''),
      syllables: syl,
      rhymeKey: key,
      vowelSound: vowel,
      isEndWord,
    };
  });

  const endToken = tokens[tokens.length - 1];
  const endRhymeKey = endToken ? endToken.rhymeKey : undefined;

  // Extract internal rhyme keys (words within the line with similar rhyme keys)
  const internalRhymeKeys: string[] = [];
  const keyCounts: Record<string, number> = {};

  tokens.forEach((t) => {
    if (t.rhymeKey && t.normalized.length >= 3) {
      keyCounts[t.rhymeKey] = (keyCounts[t.rhymeKey] || 0) + 1;
    }
  });

  Object.entries(keyCounts).forEach(([k, count]) => {
    if (count > 1) {
      internalRhymeKeys.push(k);
    }
  });

  return {
    id: lineId,
    rawText,
    syllableCount: totalSyllables,
    tokens,
    endRhymeKey,
    internalRhymeKeys,
  };
}

// Process an entire section to detect end rhymes, multi-syllables, and cadence outliers
export function processSectionRhymesAndCadence(section: LyricSection): LyricSection {
  const rhymeKeyToFamily = new Map<string, number>();
  let nextFamilyId = 0;

  // 1. First pass: find end rhyme keys that occur at least twice across lines
  const endKeyFrequencies: Record<string, number> = {};
  section.lines.forEach((line) => {
    if (line.endRhymeKey) {
      endKeyFrequencies[line.endRhymeKey] = (endKeyFrequencies[line.endRhymeKey] || 0) + 1;
    }
  });

  // Assign deterministic family ID (0 to 7) to repeated end keys
  Object.entries(endKeyFrequencies).forEach(([key, count]) => {
    if (count >= 2 && !rhymeKeyToFamily.has(key)) {
      rhymeKeyToFamily.set(key, nextFamilyId % 8);
      nextFamilyId++;
    }
  });

  // 2. Calculate average line syllable length for cadence balancing
  const nonZeroLines = section.lines.filter((l) => l.syllableCount > 0);
  const avgSyllables =
    nonZeroLines.length > 0
      ? nonZeroLines.reduce((acc, l) => acc + l.syllableCount, 0) / nonZeroLines.length
      : 10;

  // 3. Enrich lines
  const enrichedLines = section.lines.map((line) => {
    const familyId = line.endRhymeKey ? rhymeKeyToFamily.get(line.endRhymeKey) : undefined;

    // Check cadence outlier (+- 3.5 syllables from average, or locked budget)
    const target = section.lockedSyllableBudget || avgSyllables;
    const isOutlier = line.syllableCount > 0 && Math.abs(line.syllableCount - target) >= 4;

    // Mark tokens with familyId if they participate in end rhyme or internal rhyme
    const enrichedTokens = line.tokens.map((tok) => {
      let tokFamilyId = tok.isEndWord ? familyId : undefined;

      // Multi-syllabic detection: if word has >= 3 syllables and ends with a strong suffix
      const isMulti =
        tok.syllables >= 3 &&
        /(ation|ition|sion|tion|ment|ness|ology|able|ible)$/i.test(tok.normalized);

      return {
        ...tok,
        rhymeFamilyId: tokFamilyId,
        isMultiSyllableMatch: isMulti,
      };
    });

    return {
      ...line,
      rhymeFamilyId: familyId,
      isCadenceOutlier: isOutlier,
      tokens: enrichedTokens,
    };
  });

  return {
    ...section,
    lines: enrichedLines,
  };
}

// Calculate song-wide statistics
export function calculateSongMetrics(sections: LyricSection[]) {
  let totalWords = 0;
  let totalLines = 0;
  let totalSyllables = 0;
  let rhymingWordsCount = 0;
  const wordFrequency: Record<string, number> = {};

  sections.forEach((s) => {
    s.lines.forEach((l) => {
      if (l.rawText.trim().length > 0) {
        totalLines++;
      }
      totalSyllables += l.syllableCount;

      l.tokens.forEach((t) => {
        totalWords++;
        const norm = t.normalized;
        if (norm.length >= 3) {
          wordFrequency[norm] = (wordFrequency[norm] || 0) + 1;
        }
        if (t.rhymeFamilyId !== undefined || t.isMultiSyllableMatch) {
          rhymingWordsCount++;
        }
      });
    });
  });

  const rhymeDensity = totalWords > 0 ? Math.round((rhymingWordsCount / totalWords) * 100) : 0;

  // Crutch words / most repeated words (ignoring standard stopwords)
  const stopWords = new Set([
    'the',
    'and',
    'a',
    'an',
    'in',
    'on',
    'of',
    'to',
    'is',
    'it',
    'i',
    'my',
    'me',
    'you',
    'your',
    'that',
    'this',
    'with',
    'for',
    'but',
    'at',
    'by',
    'we',
    'be',
  ]);

  const frequentWords = Object.entries(wordFrequency)
    .filter(([w]) => !stopWords.has(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  return {
    totalWords,
    totalLines,
    totalSyllables,
    rhymeDensity,
    frequentWords,
  };
}
