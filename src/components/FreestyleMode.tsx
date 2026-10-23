import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Minimize2,
  Clock,
  Music,
  Check,
  Disc,
} from 'lucide-react';
import { SongProject } from '../types/lyric';
import { metronome } from '../utils/metronome';
import { lookupRhymes } from '../utils/rhymeDictionary';

interface FreestyleModeProps {
  project: SongProject;
  onClose: () => void;
  onAddLineToProject: (lineText: string) => void;
}

export const FreestyleMode: React.FC<FreestyleModeProps> = ({
  project,
  onClose,
  onAddLineToProject,
}) => {
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentBar, setCurrentBar] = useState(1);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [freestyleLines, setFreestyleLines] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState('');
  const [rhymeHints, setRhymeHints] = useState<string[]>([]);

  // Voice memo recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Sync with metronome engine
  useEffect(() => {
    metronome.setBpm(project.bpm);
    metronome.setOnBeat((beat, bar) => {
      setCurrentBeat(beat);
      setCurrentBar(bar);
    });

    // Start metronome by default in freestyle stage
    metronome.start();
    setIsMetronomeActive(true);

    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);

    return () => {
      metronome.stop();
      clearInterval(timer);
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
    };
  }, []);

  // Update quick rhyme seeds whenever the user types or ends a line
  useEffect(() => {
    const lastWord = (activeInput || freestyleLines[freestyleLines.length - 1] || '')
      .trim()
      .split(/\s+/)
      .pop()
      ?.replace(/[^a-zA-Z]/g, '');

    if (lastWord && lastWord.length >= 2) {
      lookupRhymes(lastWord).then((data) => {
        const seeds = [
          ...data.perfect.slice(0, 4).map((d) => d.word),
          ...data.slant.slice(0, 3).map((d) => d.word),
          ...data.multi.slice(0, 2).map((d) => d.word),
        ];
        setRhymeHints(seeds);
      });
    } else {
      setRhymeHints(['hum', 'drum', 'numb', 'come', 'kingdom come']);
    }
  }, [activeInput, freestyleLines]);

  // Handle line submission in freestyle
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeInput.trim()) {
      e.preventDefault();
      const newLine = activeInput.trim();
      setFreestyleLines((prev) => [...prev, newLine]);
      onAddLineToProject(newLine);
      setActiveInput('');
    }
  };

  // Start Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone access denied or unsupported:', err);
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06070a] text-white flex flex-col p-4 sm:p-8 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Mic size={18} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Freestyle Stage</h1>
            <span className="text-xs text-white/50 font-mono">
              {project.title} &bull; {project.bpm} BPM &bull; Key: {project.keySignature}
            </span>
          </div>
        </div>

        {/* Center: BPM Flash & Bar Counter */}
        <div className="flex items-center gap-4">
          {/* Bar / Beat Counter */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 flex items-center gap-3 font-mono">
            <div>
              <span className="text-[10px] text-white/40 block">BAR</span>
              <span className="text-lg font-black text-cyan-400">{currentBar}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-[10px] text-white/40 block">BEAT</span>
              <div className="flex items-center gap-1.5 mt-1">
                {[0, 1, 2, 3].map((b) => (
                  <div
                    key={b}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentBeat === b
                        ? b === 0
                          ? 'bg-amber-400 scale-150 shadow-[0_0_12px_#fbbf24]'
                          : 'bg-cyan-400 scale-125 shadow-[0_0_8px_#22d3ee]'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Session Timer */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 font-mono text-xs text-white/70 hidden sm:flex">
            <Clock size={14} className="text-white/40" />
            <span>{formatTime(sessionSeconds)}</span>
          </div>
        </div>

        {/* Right: Exit Freestyle Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
        >
          <Minimize2 size={14} />
          <span>Exit Stage</span>
        </button>
      </div>

      {/* Main Teleprompter Display: Large Performance Text */}
      <div className="flex-1 overflow-y-auto my-6 flex flex-col justify-end max-w-4xl w-full mx-auto space-y-4 px-4 text-center">
        {freestyleLines.length === 0 ? (
          <div className="py-16 text-white/30 space-y-3">
            <Music size={36} className="mx-auto opacity-30" />
            <p className="text-lg font-medium">Stage is hot. Ride the beat and spit your bars.</p>
            <p className="text-xs text-white/40">
              Type lines below to save them directly to your active song verse.
            </p>
          </div>
        ) : (
          freestyleLines.slice(-6).map((line, idx) => (
            <div
              key={idx}
              className={`font-black tracking-tight transition-all ${
                idx === freestyleLines.slice(-6).length - 1
                  ? 'text-2xl sm:text-4xl text-white'
                  : 'text-xl sm:text-2xl text-white/40'
              }`}
            >
              {line}
            </div>
          ))
        )}
      </div>

      {/* Live Rhyme Seeds Dock (Float above input) */}
      <div className="max-w-3xl w-full mx-auto mb-3 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1 mr-1">
          <Sparkles size={12} /> Next Rhymes:
        </span>
        {rhymeHints.map((hint, idx) => (
          <button
            key={idx}
            onClick={() => setActiveInput((prev) => (prev ? `${prev} ${hint}` : hint))}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/10 transition"
          >
            {hint}
          </button>
        ))}
      </div>

      {/* Bottom Freestyle Input & Audio Recorder Dock */}
      <div className="max-w-3xl w-full mx-auto flex items-center gap-3">
        {/* Voice Memo Recording Toggle */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs shadow-lg transition active:scale-95 shrink-0 ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse shadow-red-500/30'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
          title={isRecording ? 'Stop Recording' : 'Record Voice Memo'}
        >
          {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
          <span>{isRecording ? 'Recording...' : 'Record Take'}</span>
        </button>

        {/* Live Typing Input */}
        <input
          type="text"
          value={activeInput}
          onChange={(e) => setActiveInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Spit a bar & hit Enter..."
          className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-5 py-3.5 text-base sm:text-lg font-semibold text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition shadow-inner"
        />

        {/* Audio Player if take recorded */}
        {audioBlobUrl && (
          <audio ref={audioPlayerRef} src={audioBlobUrl} controls className="h-10 max-w-[200px]" />
        )}
      </div>
    </div>
  );
};
