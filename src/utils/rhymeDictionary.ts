import { countWordSyllables } from './phonetics';
import { RhymeWordItem } from '../types/lyric';

// Offline fallback dictionary for common lyric rhymes and words
const OFFLINE_RHYMES: Record<
  string,
  {
    perfect: string[];
    slant: string[];
    multi: string[];
    synonyms: string[];
  }
> = {
  night: {
    perfect: ['light', 'fight', 'sight', 'flight', 'bite', 'tight', 'height', 'white', 'bright', 'spite', 'knight'],
    slant: ['mind', 'blind', 'find', 'knife', 'life', 'strike', 'like', 'ice', 'rise', 'price'],
    multi: ['neon light', 'midnight flight', 'second sight', 'hold on tight', 'dying light'],
    synonyms: ['darkness', 'midnight', 'evening', 'dusk', 'shadow', 'blackout', 'twilight'],
  },
  light: {
    perfect: ['night', 'fight', 'sight', 'bright', 'white', 'tight', 'flight', 'ignite', 'polite', 'delight'],
    slant: ['shine', 'mine', 'life', 'guide', 'time', 'fire', 'glow'],
    multi: ['blinding light', 'morning bright', 'inner sight', 'guiding light'],
    synonyms: ['glow', 'beam', 'spark', 'flame', 'radiance', 'illumination', 'clarity'],
  },
  mind: {
    perfect: ['find', 'blind', 'grind', 'behind', 'remind', 'rewind', 'kind', 'signed', 'aligned', 'designed'],
    slant: ['time', 'rhyme', 'sign', 'line', 'shine', 'dime', 'mine', 'vibe'],
    multi: ['state of mind', 'left behind', 'hard to find', 'peace of mind', 'intertwined'],
    synonyms: ['brain', 'psyche', 'thoughts', 'soul', 'intellect', 'memory', 'vision'],
  },
  time: {
    perfect: ['rhyme', 'climb', 'prime', 'dime', 'sublime', 'crime', 'chime', 'slime'],
    slant: ['line', 'shine', 'mine', 'sign', 'mind', 'vibe', 'blind'],
    multi: ['wasted time', 'state of crime', 'in my prime', 'frozen time', 'pantorime'],
    synonyms: ['moment', 'era', 'second', 'tempo', 'clock', 'season', 'rhythm'],
  },
  cold: {
    perfect: ['bold', 'gold', 'hold', 'sold', 'told', 'fold', 'old', 'scold', 'behold', 'unfold'],
    slant: ['soul', 'stone', 'froze', 'chilled', 'slow', 'close'],
    multi: ['freezing cold', 'heart of gold', 'tales untold', 'iron hold'],
    synonyms: ['frozen', 'chilly', 'icy', 'numb', 'bleak', 'distant', 'hardened'],
  },
  fire: {
    perfect: ['wire', 'tire', 'desire', 'inspire', 'aspire', 'higher', 'liar', 'prior', 'empire'],
    slant: ['burn', 'ignite', 'wild', 'blaze', 'pyre', 'shine'],
    multi: ['wildfire', 'heart desire', 'building higher', 'burn like fire'],
    synonyms: ['flame', 'blaze', 'inferno', 'heat', 'passion', 'spark', 'combustion'],
  },
  rain: {
    perfect: ['pain', 'gain', 'train', 'drain', 'vein', 'stain', 'chain', 'brain', 'plain', 'remain', 'explain', 'insane'],
    slant: ['fade', 'name', 'flame', 'break', 'change', 'hate'],
    multi: ['pourin rain', 'numb the pain', 'break the chain', 'heavy rain', 'in my veins'],
    synonyms: ['storm', 'downpour', 'deluge', 'shower', 'tears', 'weather'],
  },
  pain: {
    perfect: ['rain', 'gain', 'vein', 'chain', 'drain', 'stain', 'brain', 'insane', 'remain', 'sustain', 'refrain'],
    slant: ['ache', 'break', 'scar', 'fade', 'bleed', 'hate'],
    multi: ['hidden pain', 'numb the pain', 'break the chain', 'drown in pain'],
    synonyms: ['agony', 'suffering', 'torment', 'ache', 'heartache', 'anguish', 'grief'],
  },
  heart: {
    perfect: ['start', 'part', 'art', 'smart', 'dart', 'chart', 'apart', 'depart'],
    slant: ['hard', 'scars', 'dark', 'spark', 'arms', 'far'],
    multi: ['torn apart', 'from the start', 'broken heart', 'state of art'],
    synonyms: ['soul', 'core', 'spirit', 'chest', 'pulse', 'vitality'],
  },
  soul: {
    perfect: ['whole', 'hole', 'roll', 'control', 'goal', 'toll', 'stole', 'patrol'],
    slant: ['cold', 'gold', 'know', 'flow', 'glow', 'slow'],
    multi: ['lost control', 'take a toll', 'broken soul', 'pay the toll'],
    synonyms: ['spirit', 'essence', 'psyche', 'ghost', 'heart', 'core'],
  },
  hum: {
    perfect: ['drum', 'come', 'sum', 'thumb', 'numb', 'crumb', 'plumb', 'strum', 'succumb'],
    slant: ['sun', 'done', 'run', 'gun', 'fun', 'one', 'son'],
    multi: ['hear it hum', 'kingdom come', 'feel so numb', 'city drum'],
    synonyms: ['buzz', 'drone', 'vibrate', 'murmur', 'whisper', 'ring'],
  },
  drum: {
    perfect: ['hum', 'come', 'numb', 'sum', 'crumb', 'thumb', 'strum', 'succumb'],
    slant: ['run', 'done', 'gun', 'sun', 'one', 'spun'],
    multi: ['hear the drum', 'heartbeat drum', 'kingdom come', 'feel so numb'],
    synonyms: ['beat', 'pulse', 'percussion', 'rhythm', 'thump', 'snare'],
  },
  descent: {
    perfect: ['sent', 'spent', 'bent', 'meant', 'rent', 'tent', 'monument', 'innocent', 'represent', 'content'],
    slant: ['end', 'trend', 'fall', 'death', 'breath'],
    multi: ['my descent', 'dollars spent', 'message sent', 'hours spent'],
    synonyms: ['fall', 'drop', 'decline', 'plunge', 'crash', 'slide'],
  },
};

// In-memory cache for live fetched rhymes
const cache = new Map<string, RhymeWordItem[]>();

export async function lookupRhymes(word: string): Promise<{
  perfect: RhymeWordItem[];
  slant: RhymeWordItem[];
  multi: RhymeWordItem[];
  synonyms: RhymeWordItem[];
}> {
  const clean = word.toLowerCase().trim().replace(/[^a-z']/g, '');
  if (!clean) {
    return { perfect: [], slant: [], multi: [], synonyms: [] };
  }

  // Check cache
  const cacheKey = `all_${clean}`;
  if (cache.has(cacheKey)) {
    const cachedItems = cache.get(cacheKey)!;
    return partitionRhymes(cachedItems);
  }

  // Check offline dictionary first
  const offlineMatch = OFFLINE_RHYMES[clean];

  try {
    // Attempt Datamuse API (free, fast, no auth needed)
    const [rhymesRes, slantsRes, synRes] = await Promise.allSettled([
      fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(clean)}&max=30`),
      fetch(`https://api.datamuse.com/words?rel_nry=${encodeURIComponent(clean)}&max=30`),
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(clean)}&max=20`),
    ]);

    const results: RhymeWordItem[] = [];

    // Parse Perfect Rhymes
    if (rhymesRes.status === 'fulfilled' && rhymesRes.value.ok) {
      const data = await rhymesRes.value.json();
      data.forEach((item: any) => {
        const syl = item.numSyllables || countWordSyllables(item.word);
        const isMulti = item.word.includes(' ') || syl >= 3;
        results.push({
          word: item.word,
          syllables: syl,
          score: item.score,
          type: isMulti ? 'multi' : 'perfect',
        });
      });
    }

    // Parse Near/Slant Rhymes
    if (slantsRes.status === 'fulfilled' && slantsRes.value.ok) {
      const data = await slantsRes.value.json();
      data.forEach((item: any) => {
        const syl = item.numSyllables || countWordSyllables(item.word);
        const isMulti = item.word.includes(' ') || syl >= 3;
        results.push({
          word: item.word,
          syllables: syl,
          score: item.score,
          type: isMulti ? 'multi' : 'slant',
        });
      });
    }

    // Parse Synonyms
    if (synRes.status === 'fulfilled' && synRes.value.ok) {
      const data = await synRes.value.json();
      data.forEach((item: any) => {
        results.push({
          word: item.word,
          syllables: countWordSyllables(item.word),
          score: item.score,
          type: 'synonym',
        });
      });
    }

    // If API returned good data, store in cache and return
    if (results.length > 0) {
      cache.set(cacheKey, results);
      return partitionRhymes(results);
    }
  } catch (err) {
    console.warn('Datamuse API offline or network unavailable, using algorithmic dictionary', err);
  }

  // Fallback to offline pre-computed words
  if (offlineMatch) {
    const offlineItems: RhymeWordItem[] = [
      ...offlineMatch.perfect.map((w) => ({
        word: w,
        syllables: countWordSyllables(w),
        type: 'perfect' as const,
      })),
      ...offlineMatch.slant.map((w) => ({
        word: w,
        syllables: countWordSyllables(w),
        type: 'slant' as const,
      })),
      ...offlineMatch.multi.map((w) => ({
        word: w,
        syllables: countWordSyllables(w),
        type: 'multi' as const,
      })),
      ...offlineMatch.synonyms.map((w) => ({
        word: w,
        syllables: countWordSyllables(w),
        type: 'synonym' as const,
      })),
    ];
    return partitionRhymes(offlineItems);
  }

  // Dynamic heuristic generation if completely unknown word
  const heuristicItems = generateHeuristicRhymes(clean);
  return partitionRhymes(heuristicItems);
}

function partitionRhymes(items: RhymeWordItem[]) {
  const seen = new Set<string>();
  const uniqueItems = items.filter((item) => {
    const lower = item.word.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  return {
    perfect: uniqueItems.filter((i) => i.type === 'perfect').sort((a, b) => a.syllables - b.syllables),
    slant: uniqueItems.filter((i) => i.type === 'slant').sort((a, b) => a.syllables - b.syllables),
    multi: uniqueItems.filter((i) => i.type === 'multi').sort((a, b) => a.syllables - b.syllables),
    synonyms: uniqueItems.filter((i) => i.type === 'synonym'),
  };
}

// Generate algorithmic phonetically matching words based on common endings
function generateHeuristicRhymes(word: string): RhymeWordItem[] {
  const clean = word.toLowerCase();
  const items: RhymeWordItem[] = [];

  // Match vowel sound endings
  if (clean.endsWith('ing')) {
    const stems = ['ring', 'king', 'sing', 'bring', 'fling', 'string', 'wing', 'spring'];
    stems.forEach((w) => items.push({ word: w, syllables: 1, type: 'perfect' }));
    items.push({ word: 'everything', syllables: 4, type: 'multi' });
    items.push({ word: 'in the ring', syllables: 3, type: 'multi' });
  } else if (clean.endsWith('ight') || clean.endsWith('ite')) {
    const stems = ['light', 'night', 'fight', 'sight', 'flight', 'tight', 'bright', 'white'];
    stems.forEach((w) => items.push({ word: w, syllables: 1, type: 'perfect' }));
    items.push({ word: 'out of sight', syllables: 3, type: 'multi' });
    items.push({ word: 'hold on tight', syllables: 3, type: 'multi' });
  } else if (clean.endsWith('ind') || clean.endsWith('ined')) {
    const stems = ['mind', 'find', 'blind', 'grind', 'signed', 'aligned', 'remind'];
    stems.forEach((w) => items.push({ word: w, syllables: countWordSyllables(w), type: 'perfect' }));
  } else {
    // Generic slant suggestions based on ending characters
    const last2 = clean.slice(-2);
    items.push(
      { word: `true ${clean}`, syllables: countWordSyllables(clean) + 1, type: 'multi' },
      { word: `free ${clean}`, syllables: countWordSyllables(clean) + 1, type: 'multi' }
    );
  }

  return items;
}
