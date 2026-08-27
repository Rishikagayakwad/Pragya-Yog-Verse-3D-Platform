import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2, Play, Check, Flame, Clock } from 'lucide-react';
import { ASANAS } from '../../data/asanas';
import type { Asana } from '../../types';

interface SequenceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsana: (asana: Asana) => void;
}

export const SequenceBuilderModal: React.FC<SequenceBuilderModalProps> = ({
  isOpen,
  onClose,
  onSelectAsana,
}) => {
  const [sequence, setSequence] = useState<Asana[]>([
    ASANAS[0], // Tadasana
    ASANAS[1], // Virabhadrasana II
    ASANAS[2], // Trikonasana
  ]);

  if (!isOpen) return null;

  const totalMinutes = sequence.length * 3;

  const handleAddAsana = (asana: Asana) => {
    setSequence([...sequence, asana]);
  };

  const handleRemoveIndex = (idx: number) => {
    setSequence(sequence.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#14110e]/95 backdrop-blur-2xl border border-[#c59b27]/40 rounded-3xl p-6 text-[#F5EFE5] shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#c59b27]/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D9AE29]" />
            <h2 className="font-display text-xl font-bold text-[#F5EFE5]">
              Vinyasa Sequence Builder
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#D9AE29] px-1">
          <div className="flex items-center gap-2">
            <span>{sequence.length} Asanas in Flow</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{totalMinutes} mins
            </span>
          </div>
          <span className="text-stone-400">Drag or click to jump into 3D</span>
        </div>

        {/* Current Sequence Strip */}
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {sequence.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-[#c59b27]/20 hover:border-[#D9AE29]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-[#D9AE29] text-[#0c0e12] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  0{idx + 1}
                </span>
                <div className="w-11 h-11 rounded-xl bg-[#c59b27]/20 border border-[#c59b27]/30 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.englishName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#D9AE29]" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#F5EFE5]">{item.englishName}</div>
                  <div className="text-[11px] font-accent italic text-[#D9AE29]">{item.sanskritName}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectAsana(item);
                    onClose();
                  }}
                  className="px-3 py-1 rounded-xl bg-[#c59b27]/20 hover:bg-[#D9AE29] text-[#D9AE29] hover:text-[#0c0e12] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Practice</span>
                </button>
                <button
                  onClick={() => handleRemoveIndex(idx)}
                  className="p-1.5 rounded-xl hover:bg-red-500/20 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add Postures */}
        <div className="space-y-2 pt-2 border-t border-[#c59b27]/20">
          <div className="text-xs font-mono font-bold text-[#D9AE29] uppercase">
            Add from Library:
          </div>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto no-scrollbar">
            {ASANAS.map((a) => (
              <button
                key={a.id}
                onClick={() => handleAddAsana(a)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/30 hover:bg-[#D9AE29]/20 border border-[#c59b27]/20 hover:border-[#D9AE29] text-[11px] text-[#F5EFE5] transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#D9AE29]" />
                <span>{a.englishName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#c59b27]/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (sequence[0]) onSelectAsana(sequence[0]);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#D9AE29] hover:bg-[#c59b27] text-[#0c0e12] font-bold text-xs shadow-md transition-transform hover:scale-102 cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Sequence Flow</span>
          </button>
        </div>
      </div>
    </div>
  );
};
