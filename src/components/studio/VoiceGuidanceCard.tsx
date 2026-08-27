import React from 'react';
import { Volume2, Play, Pause } from 'lucide-react';
import type { Asana } from '../../types';

interface VoiceGuidanceCardProps {
  asana: Asana;
  isVoiceActive: boolean;
  voiceSeconds: number;
  onToggleVoice: () => void;
}

export const VoiceGuidanceCard: React.FC<VoiceGuidanceCardProps> = ({
  asana,
  isVoiceActive,
  voiceSeconds,
  onToggleVoice,
}) => {
  // Format mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div 
      id="voice-guidance-player"
      className="p-3 rounded-2xl bg-[#FAF6F0]/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/25 shadow-md space-y-2 text-[#272727] dark:text-[#F5EFE5]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-[#00381F] dark:text-[#D9AE29]">
          <Volume2 className="w-3.5 h-3.5 text-[#944426] dark:text-[#D9AE29]" />
          <span>Voice Guidance</span>
        </div>
        <span className="text-[10px] font-mono text-[#272727]/60 dark:text-[#F5EFE5]/60">
          {formatTime(voiceSeconds)} / 04:30
        </span>
      </div>

      {/* Animated Waveform Visualizer */}
      <div className="flex items-center gap-1 h-6 px-1">
        {[40, 75, 55, 90, 60, 100, 45, 80, 65, 95, 50, 85, 70, 45, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-[#D9AE29] rounded-full transition-all duration-300"
            style={{
              height: isVoiceActive ? `${Math.max(20, (h * ((voiceSeconds % 5) + 1)) % 100)}%` : `${h * 0.3}%`,
              opacity: isVoiceActive ? 0.95 : 0.4
            }}
          />
        ))}
      </div>

      {/* Play Button & Progress Track */}
      <div className="flex items-center gap-2 pt-1">
        <button
          id="voice-guidance-toggle-btn"
          onClick={onToggleVoice}
          aria-label={isVoiceActive ? 'Pause Voice Guidance' : 'Play Voice Guidance'}
          className="w-6 h-6 rounded-full bg-[#944426] hover:bg-[#80391f] text-white flex items-center justify-center text-xs shrink-0 shadow-sm transition-colors cursor-pointer"
        >
          {isVoiceActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
        </button>
        <div className="flex-1 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#944426] to-[#D9AE29] transition-all duration-300"
            style={{ width: `${(voiceSeconds / 270) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

