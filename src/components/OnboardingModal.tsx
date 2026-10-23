import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Activity, Mic, Layers, X } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Rhyte',
      subtitle: 'The intelligent studio for songwriters, rappers, and poets.',
      description:
        'Rhyte treats every line as a musical measure. Build verses, track vocal pockets, and find multi-syllabic rhymes without leaving your flow.',
      badge: 'Flow State',
      icon: <Sparkles size={28} className="text-cyan-400" />,
    },
    {
      title: 'Live Syllable & Cadence Gutter',
      subtitle: 'Zero-latency counting calibrated for hip-hop, pop, and slam poetry.',
      description:
        'The right gutter calculates syllables in real time as you type, handling slang like "finna", "tryna", and "skrrt". Yellow pills warn you when a line is dragging or too crowded for your rhythm.',
      badge: 'Meter Control',
      icon: <Activity size={28} className="text-purple-400" />,
    },
    {
      title: 'Harmonic Rhyme Families',
      subtitle: 'Phonetic end rhymes & multi-syllables grouped by color.',
      description:
        'Words that share vowel nuclei and coda sounds automatically pair into matching color families (A, B, C...). Click any word at any time to open the full Rhyme & Slant Dictionary.',
      badge: 'Acoustic Mapping',
      icon: <Layers size={28} className="text-amber-400" />,
    },
    {
      title: 'Freestyle Stage & Voice Memos',
      subtitle: 'Spit bars live to the beat and capture ideas instantly.',
      description:
        'Toggle Freestyle Mode for a large-type teleprompter, synchronized metronome flasher, and built-in voice memo audio recorder for your scratch takes.',
      badge: 'Performance Ready',
      icon: <Mic size={28} className="text-red-400" />,
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#0e111a] border border-white/15 rounded-3xl w-full max-w-lg p-6 sm:p-8 text-white shadow-2xl overflow-hidden flex flex-col justify-between min-h-[380px] animate-in fade-in zoom-in-95 duration-200">
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/10 text-cyan-300 border border-white/10">
              {current.badge} &bull; {step + 1} of {steps.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Icon & Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shrink-0">
              {current.icon}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{current.title}</h2>
              <p className="text-xs text-white/60 font-medium mt-0.5">{current.subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-white/70 leading-relaxed pt-2 border-t border-white/5">
            {current.description}
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  step === i ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Next / Start Button */}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <span>Enter Studio</span>
              <Check size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
