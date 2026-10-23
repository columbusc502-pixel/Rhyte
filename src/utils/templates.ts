import { SongProject } from '../types/lyric';
import { analyzeLine, processSectionRhymesAndCadence } from './phonetics';

export const SONG_TEMPLATES: { name: string; description: string; template: SongProject }[] = [
  {
    name: 'Classic Hip-Hop 16-Bar',
    description: '4-bar intro, 16-bar hard-hitting verse, and 8-bar chorus at 92 BPM.',
    template: createProjectFromDraft({
      title: 'Midnight Transmission',
      bpm: 92,
      keySignature: 'Fm',
      genre: 'Hip-Hop / Boom-Bap',
      mood: 'Introspective, Gritty',
      tags: ['Late Night', 'Storytelling', 'Hard Flow'],
      sections: [
        {
          name: 'Intro',
          type: 'intro',
          targetBars: 4,
          lines: [
            'Yeah, static on the frequency',
            'Turn the monitor up a little bit',
            'Look through the glass, midnight in the city',
            'Listen...',
          ],
        },
        {
          name: 'Verse 1',
          type: 'verse',
          targetBars: 16,
          lines: [
            'I walk through the fog where the streetlights hum',
            'Counting every shadow till the dawn light come',
            'Engine running cold, hear the iron heartbeat drum',
            'Staring at the skyline numb',
            'They try to calculate the speed of my descent',
            'Wasted every dollar on the promises they sent',
            'Now I am stuck inside an artificial monument',
            'Wondering where all the quiet went',
            'Ink in the notebook bleeding through the page',
            'Pacing back and forth like a tiger in a cage',
            'Turning all the sorrow into calculated rage',
            'Stepping on the platform, stepping on the stage',
            'Never look behind when the bridge begins to burn',
            'Every single lesson is a heavy wheel to turn',
            'Knowledge is the coin that you gotta bleed to earn',
            'Write it in the cipher, watch the city light return',
          ],
        },
        {
          name: 'Hook',
          type: 'hook',
          targetBars: 8,
          lines: [
            'Gold chains, cold veins, everything remains',
            'Bleeding through the ink until it washes out the stains',
            'Echoes in the alleyway, running through the rain',
            'Tryna find the peace inside the pressure and the pain',
          ],
        },
      ],
    }),
  },
  {
    name: 'Modern Trap / Drill Flow',
    description: 'Fast paced 140 BPM with triplet rhythms, aggressive hooks, and cadence shifts.',
    template: createProjectFromDraft({
      title: 'Obsidian Sky',
      bpm: 140,
      keySignature: 'Cm',
      genre: 'Trap / Drill',
      mood: 'High Energy, Menacing',
      tags: ['Fast Cadence', 'Dark Bass', 'Punchlines'],
      sections: [
        {
          name: 'Hook',
          type: 'hook',
          targetBars: 8,
          lines: [
            'Slide in the dark with the headlights off',
            'Step on the gas and they hear that cough',
            'Diamonds on ice and they look real soft',
            'Aiming for the penthouse way up aloft',
          ],
        },
        {
          name: 'Verse 1',
          type: 'verse',
          targetBars: 16,
          lines: [
            'Look at the clock, never tick back down',
            'Came from the mud, never seen no crown',
            'Heavyweight step when I hit this town',
            'Underwater flow and you finna drown',
            'Two phone lines buzzing in the coat',
            'Keep my head above water, keep the family afloat',
            'Every single syllable a dagger to the throat',
            'Signed my own name on the bottom of the note',
          ],
        },
      ],
    }),
  },
  {
    name: 'Pop Radio Anthem',
    description: 'Melodic verses, catchy pre-chorus, and explosive chorus at 120 BPM.',
    template: createProjectFromDraft({
      title: 'Neon Horizon',
      bpm: 120,
      keySignature: 'G',
      genre: 'Pop / Synthwave',
      mood: 'Euphoric, Driving',
      tags: ['Radio Ready', 'Anthem', 'Melodic'],
      sections: [
        {
          name: 'Verse 1',
          type: 'verse',
          targetBars: 8,
          lines: [
            'Summer air is slipping through our fingers tonight',
            'Chasing every shadow in the rearview light',
            'Tell me that you feel the spark ignite',
            'We were never built to lose this fight',
          ],
        },
        {
          name: 'Chorus',
          type: 'chorus',
          targetBars: 8,
          lines: [
            'Take me to the edge where the world falls away',
            'Nothing left to hold and there is nothing left to say',
            'Dancing in the ashes till the break of day',
            'We will find our way, we will find our way',
          ],
        },
      ],
    }),
  },
  {
    name: 'R&B / Late Night Session',
    description: 'Smooth syncopated bars, emotional vulnerability, and acoustic soul at 84 BPM.',
    template: createProjectFromDraft({
      title: 'Velvet Hour',
      bpm: 84,
      keySignature: 'Ebm',
      genre: 'R&B / Soul',
      mood: 'Vulnerable, Atmospheric',
      tags: ['Slow Jam', 'Late Night', 'Acoustic'],
      sections: [
        {
          name: 'Verse 1',
          type: 'verse',
          targetBars: 8,
          lines: [
            'Coffee getting cold on the counter again',
            'Wondering where the lover ends and stranger begins',
            'Shadows on the ceiling tracing out my sins',
            'Tell me where we lost what we were supposed to win',
          ],
        },
        {
          name: 'Hook',
          type: 'hook',
          targetBars: 8,
          lines: [
            'Stay for the night, let the morning arrive',
            'Look in my eyes, let me feel so alive',
            'Holding you close while the memories survive',
            'More than a habit, more than a drive',
          ],
        },
      ],
    }),
  },
];

// Helper to construct fully analyzed project from plain string inputs
function createProjectFromDraft(data: {
  title: string;
  bpm: number;
  keySignature: string;
  genre: string;
  mood: string;
  tags: string[];
  sections: {
    name: string;
    type: any;
    targetBars: number;
    lines: string[];
  }[];
}): SongProject {
  const analyzedSections = data.sections.map((sec, secIdx) => {
    const rawLines = sec.lines.map((l, lIdx) => analyzeLine(l, `line_${secIdx}_${lIdx}`));
    const rawSection = {
      id: `sec_${secIdx}_${Date.now()}`,
      name: sec.name,
      type: sec.type,
      positionIndex: secIdx,
      targetBars: sec.targetBars,
      lines: rawLines,
    };
    return processSectionRhymesAndCadence(rawSection);
  });

  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: data.title,
    bpm: data.bpm,
    keySignature: data.keySignature,
    genre: data.genre,
    mood: data.mood,
    tags: data.tags,
    sections: analyzedSections,
    notes: 'Drafted in Rhyte Studio. Keep the internal rhyme pockets tight.',
    favoriteLines: [
      'Ink in the notebook bleeding through the page',
      'Knowledge is the coin that you gotta bleed to earn',
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
