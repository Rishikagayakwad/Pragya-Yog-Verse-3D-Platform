import React from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Gauge, 
  Sparkles, 
  Wind,
  CheckCircle2
} from 'lucide-react';
import type { Asana } from '../../types';

interface PosePlaybackControllerProps {
  asana: Asana;
  currentStepIndex: number;
  totalSteps?: number;
  isPlaying: boolean;
  isSlowMotion: boolean;
  scrubberProgress: number; // 0 to 100
  onTogglePlay: () => void;
  onToggleSlowMotion: () => void;
  onStepChange: (index: number) => void;
  onScrubberChange: (progress: number) => void;
  isDark?: boolean;
}

export const PosePlaybackController: React.FC<PosePlaybackControllerProps> = ({
  asana,
  currentStepIndex,
  totalSteps = 7,
  isPlaying,
  isSlowMotion,
  scrubberProgress,
  onTogglePlay,
  onToggleSlowMotion,
  onStepChange,
  onScrubberChange,
}) => {
  // Steps fallback
  const defaultSteps = [
    { title: 'Tadasana', instruction: 'Stand tall with feet grounded and spine lengthened.' },
    { title: 'Wide Stance', instruction: 'Step feet 3.5 to 4 feet apart with heels aligned.' },
    { title: 'Warrior II', instruction: 'Extend arms parallel to floor, bend front knee over ankle.' },
    { title: 'Reverse Warrior', instruction: 'Incline torso back, sweeping front arm overhead.' },
    { title: 'Return to Center', instruction: 'Inhale back to Warrior II, settling pelvic weight evenly.' },
    { title: 'Other Side', instruction: 'Pivot feet to opposite direction and repeat sequence.' },
    { title: 'Completion', instruction: 'Step back to center, sensing circulating prana.' },
  ];

  const currentStepData = asana.steps?.[currentStepIndex] || defaultSteps[currentStepIndex] || defaultSteps[0];
  const stepNumberFormatted = `0${currentStepIndex + 1}`;
  const totalStepsFormatted = `0${totalSteps}`;

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onScrubberChange(val);
  };

  return (
    <div 
      id="pose-playback-controller"
      className="w-full rounded-2xl sm:rounded-3xl bg-[#FAF6F0]/95 dark:bg-[#071912]/95 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/30 shadow-lg p-3 sm:p-4 text-[#272727] dark:text-[#F5EFE5] transition-all duration-300 relative overflow-hidden"
    >
      {/* Top Brand Accent Gold Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#944426] via-[#D9AE29] to-[#00381F] transition-opacity" 
        style={{ opacity: isPlaying ? 1 : 0.6 }}
      />

      {/* Top Row: Controller Controls & Timeline Readout */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-[#00381F]/10 dark:border-[#D9AE29]/20">
        
        {/* Left Action Buttons: Play/Pause, Slow Mo, Step Prev/Next */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-2.5">
          
          {/* Main Primary Play/Pause Button */}
          <button
            id="playback-play-btn"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause Pose Playback' : 'Start Pose Playback'}
            className={`group relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 cursor-pointer shadow-md ${
              isPlaying
                ? 'bg-[#D9AE29] text-[#00381F] ring-2 ring-[#00381F] shadow-[0_0_20px_rgba(217,174,41,0.5)]'
                : 'bg-[#944426] hover:bg-[#80391f] text-white shadow-[0_4px_14px_rgba(148,68,38,0.35)]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span className="font-mono text-xs uppercase">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5 transition-transform group-hover:scale-110" />
                <span className="font-mono text-xs uppercase">Play</span>
              </>
            )}
            
            {/* Pulsing ring when active */}
            {isPlaying && (
              <span className="absolute -inset-1 rounded-xl bg-[#D9AE29]/30 animate-ping pointer-events-none" />
            )}
          </button>

          {/* Dedicated Slow Motion Control */}
          <button
            id="playback-slow-mo-btn"
            onClick={onToggleSlowMotion}
            aria-label="Toggle Slow Motion"
            title="Toggle Slow Motion Playback Speed (0.5x)"
            className={`flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border text-xs font-semibold font-mono tracking-wider transition-all duration-200 cursor-pointer ${
              isSlowMotion
                ? 'bg-[#9D9D48]/25 text-[#00381F] dark:text-[#D9AE29] border-[#9D9D48] ring-1 ring-[#9D9D48]/50 shadow-sm'
                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#272727] dark:text-[#F5EFE5] border-[#00381F]/15 dark:border-[#D9AE29]/20'
            }`}
          >
            <Gauge className={`w-3.5 h-3.5 ${isSlowMotion ? 'text-[#944426] dark:text-[#D9AE29] animate-pulse' : 'text-[#9D9D48]'}`} />
            <span>{isSlowMotion ? '0.5x SPEED' : 'SLOW MO'}</span>
          </button>

          {/* Prev / Next Step Buttons */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-[#00381F]/15 dark:border-[#D9AE29]/20">
            <button
              id="playback-prev-step-btn"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              aria-label="Previous Step"
              title="Previous Step"
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-[#272727] dark:text-[#F5EFE5] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="playback-next-step-btn"
              onClick={handleNext}
              disabled={currentStepIndex >= totalSteps - 1}
              aria-label="Next Step"
              title="Next Step"
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-[#272727] dark:text-[#F5EFE5] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Status / Scrubber Indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9AE29] animate-pulse shadow-sm" />
            <span className="text-[#00381F] dark:text-[#D9AE29] font-bold tracking-wider uppercase">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>

          <span className="text-[#272727] dark:text-[#F5EFE5] text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#00381F]/10 dark:bg-[#D9AE29]/15 border border-[#00381F]/20 dark:border-[#D9AE29]/30">
            {stepNumberFormatted} / {totalStepsFormatted}
          </span>
        </div>
      </div>

      {/* Middle: Horizontal Interactive Scrubber Timeline */}
      <div className="pt-3 pb-2 space-y-2">
        <div className="relative flex items-center">
          {/* Background Track */}
          <div className="absolute inset-x-0 h-2.5 rounded-full bg-[#E8DFD1] dark:bg-[#002414] overflow-hidden border border-[#00381F]/15 dark:border-[#D9AE29]/20">
            <div
              className="h-full bg-gradient-to-r from-[#944426] via-[#D9AE29] to-[#00381F] transition-all duration-150"
              style={{ width: `${Math.max(3, scrubberProgress)}%` }}
            />
          </div>

          {/* Interactive Range Input Scrubber */}
          <input
            id="pose-scrubber-slider"
            type="range"
            min="0"
            max="100"
            step="1"
            value={scrubberProgress}
            onChange={handleSliderChange}
            aria-label="Pose timeline scrubber"
            className="relative z-10 w-full h-5 opacity-0 cursor-pointer"
          />

          {/* Step Notch Markers along track */}
          <div className="absolute inset-x-0 flex justify-between px-1 pointer-events-none z-0">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const stepPercent = (idx / (totalSteps - 1)) * 100;
              const isPast = scrubberProgress >= stepPercent - 2;
              const isCurrent = currentStepIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onStepChange(idx)}
                  className={`pointer-events-auto w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${
                    isCurrent
                      ? 'bg-[#D9AE29] ring-4 ring-[#00381F]/30 dark:ring-[#D9AE29]/40 scale-125'
                      : isPast
                        ? 'bg-[#944426] scale-95'
                        : 'bg-[#C8BAA6] dark:bg-[#0f3d24] hover:bg-[#944426]'
                  }`}
                  title={`Step 0${idx + 1}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#00381F]' : 'bg-white'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Numbers & Title Tags Bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#272727]/70 dark:text-[#F5EFE5]/70 px-0.5 pt-0.5 overflow-x-auto gap-2 no-scrollbar">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const isCurrent = currentStepIndex === idx;
            const stepInfo = asana.steps?.[idx] || defaultSteps[idx];
            return (
              <button
                key={idx}
                id={`playback-step-notch-${idx + 1}`}
                onClick={() => onStepChange(idx)}
                className={`truncate max-w-[85px] sm:max-w-[110px] text-center px-1.5 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  isCurrent
                    ? 'text-[#00381F] dark:text-[#D9AE29] font-bold bg-[#00381F]/10 dark:bg-[#D9AE29]/20 border border-[#00381F]/30 dark:border-[#D9AE29]/40'
                    : 'hover:text-[#00381F] dark:hover:text-white'
                }`}
              >
                0{idx + 1} &bull; {stepInfo?.title || `Step ${idx + 1}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Readout Banner: Active Step Guidance */}
      <div className="mt-2.5 p-2.5 sm:p-3 rounded-xl bg-white/70 dark:bg-[#002b18]/60 border border-[#00381F]/15 dark:border-[#D9AE29]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
            {stepNumberFormatted}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-[#00381F] dark:text-[#F5EFE5] text-xs sm:text-sm flex items-center gap-2 truncate">
              <span>{currentStepData.title}</span>
              {currentStepData.breathCue && (
                <span className="px-2 py-0.5 rounded-full bg-[#9D9D48]/20 text-[#00381F] dark:text-[#D9AE29] text-[10px] font-mono border border-[#9D9D48]/40 font-semibold">
                  <Wind className="w-2.5 h-2.5 inline mr-1" />
                  {currentStepData.breathCue}
                </span>
              )}
            </div>
            <p className="text-[#272727]/90 dark:text-[#F5EFE5]/90 text-[11px] sm:text-xs line-clamp-1 sm:line-clamp-2 mt-0.5">
              {currentStepData.instruction}
            </p>
          </div>
        </div>

        {/* Alignment quick hint */}
        {currentStepData.alignmentTips && currentStepData.alignmentTips.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#944426] dark:text-[#D9AE29] font-medium shrink-0 px-2.5 py-1 rounded-lg bg-[#944426]/10 dark:bg-[#D9AE29]/10 border border-[#944426]/20 dark:border-[#D9AE29]/20">
            <Sparkles className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
            <span className="truncate max-w-[200px]">{currentStepData.alignmentTips[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

