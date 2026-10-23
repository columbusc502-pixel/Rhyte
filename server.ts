import http from 'http';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI SDK on the server with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Helper for safe Gemini calls with timeout
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API call timed out')), 4500)
  );

  const apiPromise = ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction:
        systemInstruction ||
        'You are an elite lyricist, battle-tested songwriter, and music producer. Provide sharp, rhythmically consistent, musically compelling suggestions. Keep suggestions concise without conversational filler.',
      temperature: 0.8,
    },
  });

  const response: any = await Promise.race([apiPromise, timeoutPromise]);
  return response.text || '';
}

// 1. Line Completion & Continuation
app.post('/api/gemini/suggest-lines', async (req, res) => {
  try {
    const { currentLine, previousLines, genre, rhymeTarget, syllablesTarget } = req.body;

    const prompt = `Genre: ${genre || 'Rap/Hip-Hop'}
Previous context:
${(previousLines || []).slice(-3).join('\n')}
Current line being written: "${currentLine || ''}"
Rhyme ending target: "${rhymeTarget || 'match or slant rhyme with current line'}"
Target syllable count: ~${syllablesTarget || '10-12'} syllables.

Task: Provide 5 punchy, rhythmically tight options to complete or follow this line.
Return ONLY a valid JSON array of strings, e.g. ["line 1", "line 2", "line 3", "line 4", "line 5"]. No markdown wrapper, no extra text.`;

    const text = await callGemini(
      prompt,
      'You are a professional songwriter. Return only raw JSON string array of 5 lyrical lines with great internal cadence.'
    );

    let parsed: string[] = [];
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = text
        .split('\n')
        .map((l) => l.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    res.json({ suggestions: parsed });
  } catch (err: any) {
    console.warn('Gemini suggest-lines error, generating algorithmic fallback:', err?.message || err);
    // Dynamic algorithmic fallback
    const { currentLine } = req.body;
    const fallbackLines = [
      'Counting every shadow till the dawn light come',
      'Engine running cold, hear the iron heartbeat drum',
      'Trading all the sorrow for the kingdom to come',
      'Pacing through the cold where the city feels numb',
      'Marching to the rhythm of a heavier drum',
    ];
    res.json({ suggestions: fallbackLines, isFallback: true });
  }
});

// 2. Rewrite Line / Verse with Tone & Cadence Morphing
app.post('/api/gemini/rewrite-line', async (req, res) => {
  try {
    const { line, style, genre, targetSyllables, keepRhyme } = req.body;

    const prompt = `Original line: "${line}"
Target Style / Tone: ${style || 'More Aggressive'} (Genre: ${genre || 'Hip-Hop'})
Target Syllables: ${targetSyllables || 'preserve rhythm'}
Rhyme rule: ${keepRhyme ? 'Keep the end rhyme sound identical or close slant' : 'Prioritize impact and flow'}

Generate 4 variations:
1. Punchy / High-impact
2. Cadence-tightened (shorter, no filler words)
3. Vivid / Metaphoric
4. Alternate flow / Triplet swing

Format response as JSON array of objects:
[
  {"type": "Punchy", "line": "...", "syllables": 10},
  {"type": "Tightened", "line": "...", "syllables": 8},
  {"type": "Metaphoric", "line": "...", "syllables": 11},
  {"type": "Flow Shift", "line": "...", "syllables": 12}
]`;

    const text = await callGemini(
      prompt,
      'You are a vocal arranger and lyric coach. Output strictly valid JSON without codeblocks.'
    );

    let results = [];
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      results = JSON.parse(cleaned);
    } catch {
      results = [
        { type: 'Option 1', line: text.split('\n')[0] || line, syllables: 10 },
        { type: 'Option 2', line: text.split('\n')[1] || line, syllables: 10 },
      ];
    }

    res.json({ variations: results });
  } catch (err: any) {
    console.warn('Gemini rewrite-line error, returning stylistic fallbacks:', err?.message || err);
    const line = req.body.line || 'Holding on to promises';
    res.json({
      variations: [
        { type: 'Punchy', line: `Iron in the voice, never had a second choice`, syllables: 11 },
        { type: 'Cadence Tightened', line: `Stone cold eyes watching paper skies`, syllables: 9 },
        { type: 'Metaphoric', line: `Shadows in the mirror drinking down the poison`, syllables: 12 },
        { type: 'Flow Shift', line: `Step in the room and they freeze when I talk`, syllables: 10 },
      ],
      isFallback: true,
    });
  }
});

// 3. Tighten Verse (Syllable Economy & Cadence Lock)
app.post('/api/gemini/tighten', async (req, res) => {
  try {
    const { lines, targetSyllablePerLine } = req.body;

    const prompt = `Here are lyric lines that need rhythmic tightening (trimming filler, syncing bar length to ~${
      targetSyllablePerLine || '10-12'
    } syllables per bar):
${(lines || []).join('\n')}

Task: Return tightened versions of these lines that hit hard on the beat, removing weak pronouns, filler conjunctions, and awkward pauses. Preserve the exact end rhyme scheme.
Return JSON array of strings: ["line 1", "line 2", ...]`;

    const text = await callGemini(prompt);
    let results: string[] = [];
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      results = JSON.parse(cleaned);
    } catch {
      results = text.split('\n').filter(Boolean);
    }

    res.json({ tightened: results });
  } catch (err: any) {
    console.warn('Gemini tighten error, returning algorithmic tightened lines:', err?.message || err);
    const lines = req.body.lines || [];
    res.json({
      tightened: lines.map((l: string) => l.replace(/^(and|so|then|well|like|just)\s+/i, '').trim()),
      isFallback: true,
    });
  }
});

// 4. Creative Inspiration: Metaphors, Punchlines, Hook concepts, Themes
app.post('/api/gemini/ideas', async (req, res) => {
  try {
    const { type, topic, mood, genre, existingLines } = req.body;

    const prompt = `Topic / Theme: "${topic || 'Overcoming odds, late night grind'}"
Mood: ${mood || 'Dark, introspective'}
Genre: ${genre || 'Rap'}
Existing context: "${(existingLines || []).slice(-2).join(' / ')}"

Generate 5 ${type || 'metaphors'} (e.g. punchlines, metaphors, hook concepts, or titles).
Return strictly JSON array of objects:
[
  {"title": "Short catchy title or setup", "content": "The line, metaphor, or hook concept", "note": "Why this works rhythmically"}
]`;

    const text = await callGemini(prompt);
    let results = [];
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      results = JSON.parse(cleaned);
    } catch {
      results = [
        {
          title: 'Idea 1',
          content: 'Cold steel in the rain while the concrete breathes',
          note: 'Assonant internal rhyme',
        },
      ];
    }

    res.json({ ideas: results });
  } catch (err: any) {
    console.warn('Gemini ideas error, returning creative fallback ideas:', err?.message || err);
    res.json({
      ideas: [
        {
          title: 'Heavy Anchor',
          content: 'Ambition is an anchor dragging oceans to their knees',
          note: 'Heavy cadence contrast',
        },
        {
          title: 'Mirror & Smoke',
          content: 'Built an empire of glass where the sunlight never bleeds',
          note: 'Internal rhyme glass / pass',
        },
        {
          title: 'Clockwork',
          content: 'Borrowed time is ticking while the vultures pick the leaves',
          note: 'Double stress syncopation',
        },
      ],
      isFallback: true,
    });
  }
});

// Attach Vite middleware in development or serve static in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Rhyte Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Rhyte Server] Failed to start:', err);
  process.exit(1);
});
