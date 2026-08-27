import React from 'react';
import { 
  Camera, 
  Bone, 
  Dumbbell, 
  Activity, 
  Grid3x3, 
  Box as BoxIcon, 
  RotateCcw,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import type { Asana } from '../../types';

interface ViewerHUDControlsProps {
  asana: Asana;
  viewMode: 'camera' | 'bone' | 'muscle';
  cameraPreset: '360' | 'front' | 'side' | 'back' | 'top';
  showAnatomyOverlay: boolean;
  showSkeleton: boolean;
  showAlignmentGrid: boolean;
  showProps: boolean;
  zoomLevel: number;
  onSetViewMode: (mode: 'camera' | 'bone' | 'muscle') => void;
  onSetCameraPreset: (preset: '360' | 'front' | 'side' | 'back' | 'top') => void;
  onToggleAnatomyOverlay: () => void;
  onToggleSkeleton: () => void;
  onToggleAlignmentGrid: () => void;
  onToggleProps: () => void;
  onSetZoomLevel: (zoom: number | ((prev: number) => number)) => void;
  onResetCamera: () => void;
}

export const ViewerHUDControls: React.FC<ViewerHUDControlsProps> = ({
  asana,
  viewMode,
  cameraPreset,
  showAnatomyOverlay,
  showSkeleton,
  showAlignmentGrid,
  showProps,
  zoomLevel,
  onSetViewMode,
  onSetCameraPreset,
  onToggleAnatomyOverlay,
  onToggleSkeleton,
  onToggleAlignmentGrid,
  onToggleProps,
  onSetZoomLevel,
  onResetCamera,
}) => {
  return (
    <>
      {/* 1. TOP-CENTER FOCUS TOOLBAR: Camera / Bone / Muscle */}
      <div 
        id="hud-focus-modes"
        className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 rounded-2xl bg-[#FAF6F0]/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/30 shadow-lg text-[#272727] dark:text-[#F5EFE5]"
      >
        {([
          { id: 'camera', label: 'Camera', Icon: Camera },
          { id: 'bone', label: 'Bone', Icon: Bone },
          { id: 'muscle', label: 'Muscle', Icon: Dumbbell },
        ] as const).map(({ id, label, Icon }) => {
          const isActive = viewMode === id;
          return (
            <button
              key={id}
              id={`hud-view-mode-${id}`}
              onClick={() => onSetViewMode(id)}
              title={
                id === 'camera'
                  ? 'Standard cinematic camera view'
                  : id === 'bone'
                    ? 'Fade skin to inspect skeletal alignment'
                    : 'Fade skin to inspect muscle engagement heatmap'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                  : 'text-[#272727]/80 dark:text-[#F5EFE5]/80 hover:text-[#00381F] hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. LEFT CAMERA ORIENTATION HUD */}
      <div 
        id="hud-camera-presets"
        className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-[#FAF6F0]/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/25 shadow-lg font-mono text-[10px] text-[#272727] dark:text-[#F5EFE5]"
      >
        <div className="text-[9px] text-[#944426] dark:text-[#D9AE29] font-bold px-1 mb-0.5 tracking-wider">VIEW</div>
        {[
          { id: '360', label: '360°' },
          { id: 'front', label: 'Front' },
          { id: 'side', label: 'Side' },
          { id: 'back', label: 'Back' },
          { id: 'top', label: 'Top' },
        ].map((cam) => {
          const isSelected = cameraPreset === cam.id;
          return (
            <button
              key={cam.id}
              id={`hud-camera-preset-${cam.id}`}
              onClick={() => onSetCameraPreset(cam.id as any)}
              className={`w-11 sm:w-12 py-1 sm:py-1.5 rounded-xl text-center font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                  : 'text-[#272727]/80 dark:text-[#F5EFE5]/80 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {cam.label}
            </button>
          );
        })}
      </div>

      {/* 3. RIGHT-EDGE VISUAL LAYERS SWITCHES */}
      <div 
        id="hud-visual-layers"
        className="hidden sm:block absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-44 p-2.5 rounded-2xl bg-[#FAF6F0]/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/25 shadow-lg space-y-1 text-[#272727] dark:text-[#F5EFE5]"
      >
        <div className="text-[9px] font-mono font-bold text-[#944426] dark:text-[#D9AE29] px-1 pb-0.5 tracking-widest uppercase">
          VISUAL LAYERS
        </div>

        {([
          {
            id: 'anatomy',
            label: 'Anatomy Overlay',
            hint: 'Muscle engagement heatmap',
            Icon: Activity,
            value: showAnatomyOverlay,
            toggle: onToggleAnatomyOverlay,
          },
          {
            id: 'skeleton',
            label: 'Skeleton',
            hint: 'Spine, ribcage and joints',
            Icon: Bone,
            value: showSkeleton,
            toggle: onToggleSkeleton,
          },
          {
            id: 'grid',
            label: 'Alignment Grid',
            hint: 'Plumb line and mat axes',
            Icon: Grid3x3,
            value: showAlignmentGrid,
            toggle: onToggleAlignmentGrid,
          },
          {
            id: 'props',
            label: 'Prop Toggle',
            hint: 'Cork yoga block',
            Icon: BoxIcon,
            value: showProps,
            toggle: onToggleProps,
          },
        ] as const).map(({ id, label, hint, Icon, value, toggle }) => (
          <button
            key={id}
            id={`hud-layer-toggle-${id}`}
            onClick={toggle}
            title={hint}
            className="w-full flex items-center gap-2 px-1.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <Icon
              className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                value ? 'text-[#00381F] dark:text-[#D9AE29]' : 'text-slate-400'
              }`}
            />
            <span
              className={`flex-1 text-[10px] font-semibold truncate transition-colors ${
                value ? 'text-[#00381F] dark:text-[#F5EFE5]' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {label}
            </span>

            {/* Custom Toggle Switch */}
            <span
              className={`relative w-7 h-4 rounded-full shrink-0 transition-colors duration-200 ${
                value ? 'bg-[#00381F] dark:bg-[#D9AE29]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white dark:bg-[#071912] shadow transition-all duration-200 ${
                  value ? 'left-3.5' : 'left-0.5'
                }`}
              />
            </span>
          </button>
        ))}
      </div>

      {/* 4. DRISHTI GAZE CALLOUT LEADER */}
      <div className="absolute top-14 sm:top-16 right-4 sm:right-16 z-20 flex items-center gap-2 pointer-events-none">
        <div className="text-right">
          <div className="text-[9px] font-mono uppercase font-bold text-[#944426] dark:text-[#D9AE29] tracking-wider">Drishti Gaze</div>
          <div className="text-xs font-semibold text-[#00381F] dark:text-[#F5EFE5] drop-shadow-sm">
            {asana.drishti ? asana.drishti.split('(')[0] : 'Over Fingertips'}
          </div>
        </div>
        <div className="relative flex items-center justify-center w-4 h-4">
          <span className="absolute w-full h-full rounded-full bg-[#D9AE29] opacity-75 animate-ping" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#D9AE29] shadow-sm ring-2 ring-[#00381F]" />
        </div>
      </div>

      {/* 5. BOTTOM-CENTER VIEWPORT STAGE UTILITIES: Drag, Zoom, Reset */}
      <div 
        id="hud-stage-utilities"
        className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF6F0]/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/25 shadow-lg text-xs text-[#272727] dark:text-[#F5EFE5]"
      >
        {/* Drag to rotate pill */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#272727] dark:text-[#F5EFE5] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
          <span>👆</span>
          <span className="hidden sm:inline">Drag to rotate</span>
          <span className="sm:hidden">Rotate</span>
        </div>

        <div className="h-3 w-px bg-[#00381F]/15 dark:bg-white/10 mx-0.5" />

        {/* Zoom Slider Control */}
        <div className="flex items-center gap-1.5 text-[#272727] dark:text-[#F5EFE5] font-mono text-xs">
          <button
            id="hud-zoom-out-btn"
            onClick={() => onSetZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="w-5 h-5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center font-bold cursor-pointer"
            title="Zoom Out"
          >
            -
          </button>
          
          <input
            id="hud-zoom-slider"
            type="range"
            min="0.6"
            max="1.6"
            step="0.05"
            value={zoomLevel}
            onChange={(e) => onSetZoomLevel(parseFloat(e.target.value))}
            className="w-12 sm:w-16 h-1 accent-[#944426] dark:accent-[#D9AE29] cursor-pointer"
            aria-label="Viewport zoom level"
          />

          <button
            id="hud-zoom-in-btn"
            onClick={() => onSetZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="w-5 h-5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center font-bold cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
        </div>

        <div className="h-3 w-px bg-[#00381F]/15 dark:bg-white/10 mx-0.5" />

        {/* Reset Camera */}
        <button
          id="hud-reset-cam-btn"
          onClick={onResetCamera}
          className="flex items-center gap-1 text-[11px] font-medium text-[#944426] dark:text-[#D9AE29] hover:opacity-80 px-2 py-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Reset Camera Preset to Default"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </>
  );
};
