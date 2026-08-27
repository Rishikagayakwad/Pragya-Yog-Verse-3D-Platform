import React from 'react';
import { Activity, Bone, Info, X, Sparkles, ShieldCheck } from 'lucide-react';
import type { MuscleActivation, BoneInfo } from '../../types';

export interface ScreenPin {
  id: string;
  type: 'muscle' | 'bone' | 'chakra';
  name: string;
  latinName?: string;
  role?: string;
  x: number; // Pixels relative to canvas container
  y: number; // Pixels relative to canvas container
  visible: boolean;
  color?: string;
  data: MuscleActivation | BoneInfo | any;
}

interface Anatomy3DOverlayProps {
  pins: ScreenPin[];
  selectedPin: ScreenPin | null;
  onSelectPin: (pin: ScreenPin | null) => void;
  showMuscles: boolean;
  showBones: boolean;
}

export const Anatomy3DOverlay: React.FC<Anatomy3DOverlayProps> = ({
  pins,
  selectedPin,
  onSelectPin,
  showMuscles,
  showBones,
}) => {
  if (!showMuscles && !showBones) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden select-none">
      {/* 3D Floating Labels / Pins */}
      {pins.map((pin) => {
        if (!pin.visible) return null;
        const isSelected = selectedPin?.id === pin.id;
        const isPrimary = pin.role === 'primary';
        const isBone = pin.type === 'bone';

        const badgeColor = isBone
          ? 'bg-[#D9AE29]/90 text-[#0c0e12] border-[#FDE047]'
          : isPrimary
            ? 'bg-[#ea580c]/90 text-white border-[#f97316]'
            : pin.role === 'secondary'
              ? 'bg-[#c59b27]/90 text-[#0c0e12] border-[#D9AE29]'
              : 'bg-[#0284c7]/90 text-white border-[#38bdf8]';

        return (
          <div
            key={pin.id}
            id={`anatomy-pin-${pin.id}`}
            style={{
              transform: `translate3d(${pin.x}px, ${pin.y}px, 0)`,
              left: 0,
              top: 0,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-75 ease-out"
          >
            <button
              type="button"
              onClick={() => onSelectPin(isSelected ? null : pin)}
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-xl backdrop-blur-md border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'scale-115 ring-2 ring-white ' + badgeColor
                  : 'hover:scale-105 opacity-90 hover:opacity-100 ' + badgeColor
              }`}
            >
              {isBone ? (
                <Bone className="w-3 h-3 text-[#0c0e12]" />
              ) : (
                <Activity className="w-3 h-3 text-white" />
              )}
              <span>{pin.name}</span>
              {pin.role && (
                <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-black/30 text-white/90">
                  {pin.role}
                </span>
              )}
            </button>
          </div>
        );
      })}

      {/* Interactive Floating Info Card when a Muscle or Bone Pin is Selected */}
      {selectedPin && (
        <div
          id="anatomy-selected-info-card"
          className="absolute bottom-24 left-4 sm:left-6 max-w-sm w-[calc(100%-2rem)] sm:w-84 p-3.5 rounded-2xl bg-[#14100c]/95 dark:bg-[#071912]/95 backdrop-blur-2xl border border-[#D9AE29]/40 shadow-2xl text-[#F5EFE5] pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-start justify-between gap-2 border-b border-[#c59b27]/20 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg ${
                  selectedPin.type === 'bone'
                    ? 'bg-[#D9AE29]/20 text-[#D9AE29]'
                    : 'bg-[#ea580c]/20 text-[#f97316]'
                }`}
              >
                {selectedPin.type === 'bone' ? (
                  <Bone className="w-4 h-4" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-[#F5EFE5] leading-tight">
                  {selectedPin.name}
                </h4>
                {selectedPin.latinName && (
                  <p className="text-[10px] font-mono italic text-[#D9AE29]/80">
                    {selectedPin.latinName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => onSelectPin(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {selectedPin.role && (
              <div className="flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-stone-400">Activation:</span>
                <span className="font-bold text-[#D9AE29] uppercase px-2 py-0.5 rounded bg-[#D9AE29]/15 border border-[#D9AE29]/30">
                  {selectedPin.role}
                </span>
              </div>
            )}

            {selectedPin.data?.description && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#c59b27] font-semibold block mb-0.5">
                  Role:
                </span>
                <p className="text-stone-300 leading-relaxed text-[11.5px]">
                  {selectedPin.data.description}
                </p>
              </div>
            )}

            {selectedPin.data?.biomechanics && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#c59b27] font-semibold block mb-0.5">
                  Biomechanical Action:
                </span>
                <p className="text-stone-300 leading-relaxed text-[11.5px]">
                  {selectedPin.data.biomechanics}
                </p>
              </div>
            )}

            {selectedPin.data?.alignmentCue && (
              <div>
                <span className="text-[10px] font-mono uppercase text-[#D9AE29] font-semibold block mb-0.5">
                  Alignment Cue:
                </span>
                <p className="text-[#fef08a] leading-relaxed text-[11.5px]">
                  {selectedPin.data.alignmentCue}
                </p>
              </div>
            )}

            <div className="pt-1.5 border-t border-[#c59b27]/15 flex items-center gap-1.5 text-[9.5px] font-mono text-stone-400">
              <ShieldCheck className="w-3 h-3 text-[#D9AE29] shrink-0" />
              <span>Biomechanical visualization for educational somatic alignment.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
