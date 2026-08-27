import React, { useState } from 'react';
import { 
  RotateCw, 
  Hand, 
  Compass, 
  Plus, 
  Minus, 
  Maximize2, 
  Minimize2,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';

interface FloatingViewControlsProps {
  onRotate360: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPanToggle: () => void;
  onResetView?: () => void;
  onToggleFullscreen?: () => void;
  onSelectCameraPreset?: (preset: '360' | 'front' | 'side' | 'back' | 'top' | 'upper' | 'lower') => void;
  cameraPreset?: string;
  isFullscreen?: boolean;
  isPanning?: boolean;
  isAutoRotating?: boolean;
  className?: string;
}

export const FloatingViewControls: React.FC<FloatingViewControlsProps> = ({
  onRotate360,
  onZoomIn,
  onZoomOut,
  onPanToggle,
  onResetView,
  onToggleFullscreen,
  onSelectCameraPreset,
  cameraPreset = '360',
  isFullscreen = false,
  isPanning = false,
  isAutoRotating = false,
  className = '',
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const presets = [
    { id: '360' as const, label: '360° Perspective' },
    { id: 'front' as const, label: 'Front View' },
    { id: 'side' as const, label: 'Side Profile' },
    { id: 'back' as const, label: 'Dorsal / Back' },
    { id: 'top' as const, label: 'Top-Down / Crown' },
    { id: 'upper' as const, label: 'Upper Torso & Arms' },
    { id: 'lower' as const, label: 'Lower Pelvis & Legs' },
  ];

  return (
    <div
      id="floating-view-controls-panel"
      className={`flex flex-col items-center gap-1 select-none pointer-events-auto z-20 ${className}`}
    >
      {/* Top Header Gold Badge "VIEW CONTROLS" */}
      <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#947124] via-[#D9AE29] to-[#947124] text-[#0c0e12] font-mono text-[8.5px] font-black uppercase tracking-wider shadow-md border border-[#FDE047]/40 whitespace-nowrap">
        VIEW CONTROLS
      </div>

      {/* Main Compact Control Card */}
      <div className="w-[52px] p-1.5 rounded-xl bg-[#14100c]/90 dark:bg-[#071912]/92 backdrop-blur-xl border border-[#c59b27]/35 dark:border-[#D9AE29]/40 shadow-xl flex flex-col items-center gap-1.5 text-[#F5EFE5]">
        
        {/* 1. Orbit 360° Button */}
        <button
          id="view-orbit-360-btn"
          onClick={onRotate360}
          title="Orbit 360° around model"
          aria-label="Orbit 360°"
          className={`w-full py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border ${
            isAutoRotating
              ? 'bg-[#D9AE29] text-[#0c0e12] border-[#D9AE29] shadow-[0_0_10px_rgba(217,174,41,0.5)] font-bold'
              : 'bg-black/40 hover:bg-[#D9AE29]/20 text-[#F5EFE5] hover:text-[#D9AE29] border-[#c59b27]/20 hover:border-[#D9AE29]'
          }`}
        >
          <span className="text-[8px] font-mono font-bold tracking-tight text-[#D9AE29]">Orbit</span>
          <RotateCw className={`w-3 h-3 my-0.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
          <span className="text-[7.5px] font-mono font-semibold text-[#F5EFE5]/80">360°</span>
        </button>

        <div className="w-full h-px bg-[#c59b27]/20" />

        {/* 2. Zoom Controls (+ / -) */}
        <div className="w-full flex flex-col items-center bg-black/40 rounded-lg border border-[#c59b27]/20 p-0.5">
          <span className="text-[7.5px] font-mono font-bold tracking-tight text-[#D9AE29] mb-0.5">Zoom</span>
          <div className="w-full flex items-center justify-around gap-0.5">
            <button
              id="view-zoom-in-btn"
              onClick={onZoomIn}
              title="Zoom In (+)"
              aria-label="Zoom In"
              className="p-0.5 rounded hover:bg-[#D9AE29]/20 text-[#F5EFE5] hover:text-[#D9AE29] transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
            <div className="w-px h-2.5 bg-[#c59b27]/30" />
            <button
              id="view-zoom-out-btn"
              onClick={onZoomOut}
              title="Zoom Out (-)"
              aria-label="Zoom Out"
              className="p-0.5 rounded hover:bg-[#D9AE29]/20 text-[#F5EFE5] hover:text-[#D9AE29] transition-colors cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-[#c59b27]/20" />

        {/* 3. Pan Control */}
        <button
          id="view-pan-btn"
          onClick={onPanToggle}
          title={isPanning ? 'Pan mode active (drag canvas)' : 'Enable Pan / Drag Mode'}
          aria-label="Pan / Drag Perspective"
          className={`w-full py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border ${
            isPanning
              ? 'bg-[#D9AE29] text-[#0c0e12] border-[#D9AE29] shadow-[0_0_10px_rgba(217,174,41,0.5)] font-bold'
              : 'bg-black/40 hover:bg-[#D9AE29]/20 text-[#F5EFE5] hover:text-[#D9AE29] border-[#c59b27]/20 hover:border-[#D9AE29]'
          }`}
        >
          <span className="text-[8px] font-mono font-bold tracking-tight text-[#D9AE29]">Pan</span>
          <Hand className="w-3 h-3 my-0.5" />
        </button>

        {/* 4. Camera Presets Dropdown Trigger */}
        {onSelectCameraPreset && (
          <div className="relative w-full">
            <button
              id="view-camera-presets-btn"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              title="Camera Angles & Presets"
              aria-label="Camera Presets"
              className="w-full py-1 px-0.5 rounded bg-black/40 hover:bg-[#D9AE29]/20 text-stone-300 hover:text-[#D9AE29] text-[7.5px] font-mono border border-[#c59b27]/20 transition-all cursor-pointer flex flex-col items-center"
            >
              <Camera className="w-3 h-3 text-[#D9AE29]" />
              <span className="truncate max-w-[40px] uppercase font-bold">{cameraPreset}</span>
            </button>

            {showPresetsMenu && (
              <div className="absolute right-full top-0 mr-1.5 p-1.5 rounded-xl bg-[#14110e]/95 backdrop-blur-xl border border-[#c59b27]/40 shadow-2xl z-30 flex flex-col gap-1 min-w-36">
                <span className="text-[8.5px] font-mono text-[#D9AE29] px-2 py-0.5 uppercase font-bold border-b border-[#c59b27]/20">
                  Camera Angles
                </span>
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectCameraPreset(p.id);
                      setShowPresetsMenu(false);
                    }}
                    className={`px-2 py-1 rounded text-left font-mono text-[10px] font-semibold cursor-pointer transition-colors ${
                      cameraPreset === p.id
                        ? 'bg-[#D9AE29] text-[#0c0e12]'
                        : 'text-stone-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. Fullscreen Toggle */}
        {onToggleFullscreen && (
          <button
            id="view-fullscreen-btn"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Studio Mode'}
            aria-label="Toggle Fullscreen"
            className="w-full py-0.5 px-0.5 rounded bg-black/30 hover:bg-[#D9AE29]/20 text-[#F5EFE5]/80 hover:text-[#D9AE29] text-[7.5px] font-mono border border-transparent hover:border-[#c59b27]/30 transition-all cursor-pointer flex items-center justify-center gap-0.5"
          >
            {isFullscreen ? <Minimize2 className="w-2.5 h-2.5" /> : <Maximize2 className="w-2.5 h-2.5" />}
            <span>{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>
        )}

        {/* 6. Reset View */}
        {onResetView && (
          <button
            id="view-reset-btn"
            onClick={onResetView}
            title="Reset Camera & Orbit"
            aria-label="Reset View"
            className="w-full py-0.5 px-0.5 rounded bg-black/30 hover:bg-[#D9AE29]/20 text-[#F5EFE5]/70 hover:text-[#D9AE29] text-[7.5px] font-mono border border-transparent hover:border-[#c59b27]/30 transition-all cursor-pointer flex items-center justify-center gap-0.5"
          >
            <Compass className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
