import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  ChevronLeft, 
  ChevronRight,
  Wind,
  Repeat,
  Repeat1,
  Sparkles,
  FastForward
} from 'lucide-react';
import type { Asana, PlaybackSpeed, LoopMode } from '../../types';

interface FloatingScrubberBarProps {
  asana: Asana;
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  loopMode: LoopMode;
  scrubberProgress: number;
  currentTimeSeconds: number;
  totalDurationSeconds: number;
  onTogglePlay: () => void;
  onSelectSpeed: (speed: PlaybackSpeed) => void;
  onToggleLoopMode: () => void;
  onResetPlayback: () => void;
  onStepChange: (index: number) => void;
  onScrubberChange: (progress: number) => void;
}

export const FloatingScrubberBar: React.FC<FloatingScrubberBarProps> = ({
  asana,
  currentStepIndex,
  totalSteps = 6,
  isPlaying,
  playbackSpeed = 1,
  loopMode = 'asana',
  scrubberProgress,
  currentTimeSeconds = 4,
  totalDurationSeconds = 24,
  onTogglePlay,
  onSelectSpeed,
  onToggleLoopMode,
  onResetPlayback,
  onStepChange,
  onScrubberChange,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const defaultSteps = [
    { title: 'Foundational Stance', instruction: 'Ground through both feet and establish spinal length.' },
    { title: 'Arm Extension', instruction: 'Extend arms parallel to floor with shoulders soft.' },
    { title: 'Transition to Pose II', instruction: 'Bend front knee to 90 degrees over ankle.' },
    { title: 'Core & Pelvic Lock', instruction: 'Engage Uddiyana Bandha and root pelvis evenly.' },
    { title: 'Drishti Focus', instruction: 'Gaze intently over front middle fingertip.' },
    { title: 'Completion & Release', instruction: 'Inhale to straighten leg and return to center.' },
  ];

  const currentStep = asana.steps?.[currentStepIndex] || defaultSteps[currentStepIndex] || defaultSteps[0];
  const stepLabel = currentStep?.title || `Step ${currentStepIndex + 1}`;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const speedOptions: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div
      id="floating-scrubber-bar"
      className="w-full rounded-2xl bg-[#14110e]/92 dark:bg-[#071912]/95 backdrop-blur-2xl border border-[#c59b27]/35 shadow-2xl p-2 sm:p-2.5 text-[#F5EFE5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 select-none"
    >
      {/* Left Controls: PLAY/PAUSE, RESET, SPEED, LOOP, STEP PREV/NEXT */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        {/* Play/Pause Button */}
        <button
          id="scrubber-play-pause-btn"
          onClick={onTogglePlay}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-[11px] uppercase font-bold tracking-wider transition-all duration-200 cursor-pointer shadow-md border ${
            isPlaying
              ? 'bg-[#D9AE29] text-[#0c0e12] border-[#D9AE29] shadow-[0_0_15px_rgba(217,174,41,0.4)]'
              : 'bg-black/50 hover:bg-[#D9AE29]/20 text-[#D9AE29] border-[#c59b27]/40 hover:border-[#D9AE29]'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current ml-0.5" />
              <span>PLAY</span>
            </>
          )}
        </button>

        {/* Reset / Replay */}
        <button
          id="scrubber-reset-btn"
          onClick={onResetPlayback}
          title="Reset Animation to Beginning (↺)"
          className="p-1.5 rounded-xl bg-black/40 hover:bg-[#D9AE29]/20 text-stone-300 hover:text-[#D9AE29] border border-[#c59b27]/25 transition-all cursor-pointer"
          aria-label="Reset playback"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Speed Selector Pill & Popup */}
        <div className="relative">
          <button
            id="scrubber-speed-btn"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            title="Playback Speed Selector"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-black/40 hover:bg-[#D9AE29]/20 text-stone-300 hover:text-[#D9AE29] border border-[#c59b27]/25 font-mono text-[10.5px] font-bold cursor-pointer transition-all"
          >
            <Gauge className="w-3 h-3 text-[#D9AE29]" />
            <span>{playbackSpeed}x</span>
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-full left-0 mb-1.5 p-1 rounded-xl bg-[#14110e]/95 backdrop-blur-xl border border-[#c59b27]/40 shadow-2xl z-30 flex flex-col gap-0.5 min-w-20">
              <span className="text-[8.5px] font-mono text-[#D9AE29] px-2 py-0.5 uppercase font-bold border-b border-[#c59b27]/20">
                Speed
              </span>
              {speedOptions.map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    onSelectSpeed(spd);
                    setShowSpeedMenu(false);
                  }}
                  className={`px-2 py-1 rounded text-left font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-[#D9AE29] text-[#0c0e12]'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {spd}x {spd === 1 ? '(Normal)' : spd < 1 ? '(Slow)' : '(Fast)'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loop Mode Toggle */}
        <button
          id="scrubber-loop-btn"
          onClick={onToggleLoopMode}
          title={`Loop Mode: ${loopMode === 'asana' ? 'Loop Full Sequence' : loopMode === 'step' ? 'Loop Current Step' : 'Play Once'}`}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border font-mono text-[10.5px] font-bold cursor-pointer transition-all ${
            loopMode !== 'once'
              ? 'bg-[#c59b27]/25 text-[#D9AE29] border-[#D9AE29]/50'
              : 'bg-black/40 text-stone-400 border-[#c59b27]/20 hover:text-stone-200'
          }`}
        >
          {loopMode === 'step' ? (
            <Repeat1 className="w-3 h-3 text-[#D9AE29]" />
          ) : (
            <Repeat className="w-3 h-3" />
          )}
          <span className="hidden md:inline capitalize">{loopMode}</span>
        </button>

        {/* Step Prev/Next Arrows */}
        <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-[#c59b27]/20">
          <button
            onClick={() => currentStepIndex > 0 && onStepChange(currentStepIndex - 1)}
            disabled={currentStepIndex === 0}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => currentStepIndex < totalSteps - 1 && onStepChange(currentStepIndex + 1)}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-1 rounded hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Next step"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center & Right: SCRUBBER TRACK WITH TIME, STEP READOUT, AND BREATH INDICATOR */}
      <div className="flex-1 flex flex-col justify-center space-y-0.5 px-0.5 sm:px-2 min-w-0">
        {/* Scrubber Header Info: Step Title, Time, Breath Indicator */}
        <div className="flex items-center justify-between text-[10px] font-mono leading-tight">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#D9AE29] uppercase tracking-wider">TIMELINE</span>
            <span className="text-[#F5EFE5] truncate font-medium">
              Step {currentStepIndex + 1}/{totalSteps}: {stepLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Exact Timestamp */}
            <span className="text-[9.5px] font-mono text-stone-400 font-semibold bg-black/30 px-1.5 py-0.5 rounded border border-[#c59b27]/20">
              {formatTime(currentTimeSeconds)} / {formatTime(totalDurationSeconds)}
            </span>

            {/* Breath Cue */}
            {currentStep?.breathCue && (
              <span className="text-[9px] text-[#D9AE29] px-1.5 py-0.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/30 shrink-0 font-sans hidden sm:inline-flex items-center">
                <Wind className="w-2.5 h-2.5 inline mr-0.5 text-[#D9AE29] animate-pulse" />
                {currentStep.breathCue}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Slider Track */}
        <div className="relative flex items-center h-4 group">
          {/* Background Bar */}
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-black/70 border border-[#c59b27]/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#944426] via-[#D9AE29] to-[#e8c85a] transition-all duration-75"
              style={{ width: `${Math.max(2, scrubberProgress)}%` }}
            />
          </div>

          {/* Range Input for continuous scrubbing */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={scrubberProgress}
            onChange={(e) => onScrubberChange(parseFloat(e.target.value))}
            className="relative z-10 w-full h-4 opacity-0 cursor-pointer"
            aria-label="Timeline Scrubber"
          />

          {/* Step Notches */}
          <div className="absolute inset-x-0 flex justify-between px-0.5 pointer-events-none z-0">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const stepPercent = (idx / (totalSteps - 1)) * 100;
              const isPast = scrubberProgress >= stepPercent - 2;
              const isCurrent = currentStepIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onStepChange(idx)}
                  className={`pointer-events-auto w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#D9AE29] ring-2 ring-[#D9AE29]/50 scale-125'
                      : isPast
                        ? 'bg-[#c59b27]'
                        : 'bg-stone-700 hover:bg-[#c59b27]'
                  }`}
                  title={`Jump to Step ${idx + 1}`}
                >
                  <span className={`w-0.5 h-0.5 rounded-full ${isCurrent ? 'bg-[#0c0e12]' : 'bg-white'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Track Footer Markers */}
        <div className="flex items-center justify-between text-[8.5px] font-mono text-stone-400">
          <span>0%</span>
          <span className="text-[#D9AE29]">{Math.round(scrubberProgress)}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};
