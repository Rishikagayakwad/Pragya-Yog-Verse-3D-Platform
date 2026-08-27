import React, { useState } from 'react';
import { 
  Volume2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Bot, 
  Flame, 
  Wind, 
  ShieldAlert, 
  Send,
  Bone,
  Activity,
  Layers,
  Info,
  CheckCircle2,
  Zap
} from 'lucide-react';
import type { Asana, VisualLayerType, MuscleActivation, ChakraInfo, BoneInfo } from '../../types';
import { ALL_CHAKRAS, ALL_BONES } from '../../data/asanas';
import { voiceGuidance } from '../../utils/voiceGuidance';
import type { StudioViewMode } from './TopModeSwitcher';

interface RightDescriptionSidebarProps {
  asana: Asana;
  showAnatomyOverlay: boolean;
  showSkeleton: boolean;
  showAlignmentGrid: boolean;
  showProps: boolean;
  activeLayer: VisualLayerType;
  viewMode?: StudioViewMode;
  selectedMuscle: MuscleActivation | null;
  selectedBoneId?: string | null;
  selectedChakraIndex: number;
  currentStepIndex: number;
  onToggleAnatomyOverlay: () => void;
  onToggleSkeleton: () => void;
  onToggleAlignmentGrid: () => void;
  onToggleProps: () => void;
  onSetLayer: (layer: VisualLayerType) => void;
  onSetViewMode?: (mode: StudioViewMode) => void;
  onSelectMuscle: (muscle: MuscleActivation) => void;
  onSelectBone?: (bone: BoneInfo) => void;
  onSelectChakraIndex: (index: number) => void;
  onStepChange: (index: number) => void;
  onOpenAIModal?: () => void;
  isDark?: boolean;
}

export const RightDescriptionSidebar: React.FC<RightDescriptionSidebarProps> = ({
  asana,
  showAnatomyOverlay,
  showSkeleton,
  showAlignmentGrid,
  showProps,
  viewMode = 'camera',
  selectedMuscle,
  selectedBoneId,
  selectedChakraIndex,
  currentStepIndex,
  onToggleAnatomyOverlay,
  onToggleSkeleton,
  onToggleAlignmentGrid,
  onToggleProps,
  onSetViewMode,
  onSelectMuscle,
  onSelectBone,
  onSelectChakraIndex,
  onStepChange,
  onOpenAIModal,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  const [anatomyTab, setAnatomyTab] = useState<'bones' | 'muscles' | 'layers'>('bones');
  const [internalSelectedBoneId, setInternalSelectedBoneId] = useState<string>(
    selectedBoneId || 'spine-lumbar'
  );
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedChakra: ChakraInfo = ALL_CHAKRAS[selectedChakraIndex] || ALL_CHAKRAS[0];

  // Active highlighted bones for this step and asana
  const currentStep = asana.steps?.[currentStepIndex];
  const activeBoneIds = currentStep?.highlightedBones || [
    'spine-lumbar',
    'pelvis-sacrum',
    'femur-front',
    'patella',
    'scapulae-clavicle',
    'humerus-arms',
  ];

  const highlightedBones = ALL_BONES.filter(
    (b) => activeBoneIds.includes(b.id) || b.id === internalSelectedBoneId
  );
  const displayBones = highlightedBones.length > 0 ? highlightedBones : ALL_BONES.slice(0, 6);
  const currentSelectedBone =
    ALL_BONES.find((b) => b.id === internalSelectedBoneId) || displayBones[0];

  const handlePlayPronunciation = () => {
    setIsPlayingAudio(true);
    voiceGuidance.speak(
      `${asana.sanskritName}. ${asana.englishName}. ${asana.shortDescription || 'Classical posture'}`
    );
    setTimeout(() => setIsPlayingAudio(false), 3000);
  };

  const handleSelectBoneClick = (bone: BoneInfo) => {
    setInternalSelectedBoneId(bone.id);
    if (onSelectBone) {
      onSelectBone(bone);
    }
  };

  const handleAskAI = () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAiLoading(false);
      const q = aiQuestion.toLowerCase();
      if (q.includes('bone') || q.includes('joint') || q.includes('skeleton')) {
        setAiResponse(
          `In ${asana.englishName}, axial elongation of the Columna vertebralis (spine) protects the lumbar disks while grounding the pelvis and femur.`
        );
      } else if (q.includes('muscle') || q.includes('quad') || q.includes('core')) {
        setAiResponse(
          `Key muscle engagement in ${asana.englishName}: Quadriceps femoris contracts concentrically to stabilize knee flexion, while Rectus abdominis stabilizes pelvic tilt.`
        );
      } else if (q.includes('breath')) {
        setAiResponse(
          `Maintain steady Ujjayi breathing: inhale to expand chest and lengthen spine, exhale to stabilize joints and ground downward.`
        );
      } else {
        setAiResponse(
          `For ${asana.englishName}, anchor through the feet, lengthen the spine, keep shoulders soft, and gaze calmly forward.`
        );
      }
    }, 400);
  };

  return (
    <aside
      id="right-description-sidebar"
      aria-label="Asana Description & Anatomical Guide"
      className="w-full sm:w-[320px] lg:w-[340px] xl:w-[360px] rounded-2xl bg-[#14100c]/92 dark:bg-[#071912]/94 backdrop-blur-xl border border-[#c59b27]/40 dark:border-[#D9AE29]/45 shadow-2xl flex flex-col text-[#F5EFE5] select-text overflow-hidden max-h-[calc(100vh-140px)]"
    >
      {/* Scrollable Container with sleek compact padding */}
      <div 
        id="sidebar-compact-scroll"
        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar text-xs leading-relaxed"
      >
        {/* 1. Header: Sanskrit Name, English Name & Speaker Audio Icon */}
        <div className="flex items-start justify-between gap-2 border-b border-[#c59b27]/20 pb-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#F5EFE5] tracking-wide leading-tight drop-shadow-sm">
              {asana.sanskritName}
            </h2>
            <div className="text-xs sm:text-sm font-sans font-medium text-[#D9AE29] tracking-wide mt-0.5">
              ({asana.englishName})
            </div>
          </div>

          {/* Sound / Pronunciation Icon */}
          <button
            id="sidebar-audio-pronounce-btn"
            onClick={handlePlayPronunciation}
            title="Listen to Sanskrit Pronunciation"
            className={`p-2 rounded-xl transition-all cursor-pointer border shrink-0 ${
              isPlayingAudio
                ? 'bg-[#D9AE29] text-[#0c0e12] border-[#D9AE29] shadow-[0_0_12px_rgba(217,174,41,0.5)]'
              : 'bg-black/40 hover:bg-[#D9AE29]/20 text-[#D9AE29] border-[#c59b27]/30 hover:border-[#D9AE29]'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* 2. Description Section */}
        <div className="space-y-1">
          <div className="font-sans font-bold text-xs text-[#D9AE29]">
            Description
          </div>
          <p className="text-[11.5px] text-[#F5EFE5]/90 leading-relaxed font-sans">
            {asana.shortDescription || 
              `${asana.englishName} provides dynamic axial alignment and muscle engagement with skeletal stability.`}
          </p>
        </div>

        {/* 3. Benefits Section */}
        <div className="space-y-1">
          <div className="font-sans font-bold text-xs text-[#D9AE29]">
            Benefits
          </div>
          <div className="text-[11.5px] text-[#F5EFE5]/90 font-sans">
            {asana.benefits?.join(', ') || 'Strength, Balance, Spinal Alignment, Flexibility'}
          </div>
        </div>

        {/* 4. ANATOMY & LAYERS SECTION WITH DEDICATED TABS */}
        <div className="space-y-2 pt-1">
          {/* Gold Banner Header */}
          <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#947124] via-[#D9AE29] to-[#947124] text-[#0c0e12] font-mono text-[10.5px] font-black uppercase tracking-wider shadow-md text-center">
            ANATOMY & BIOMECHANICS
          </div>

          {/* Sub-tabs: Bones | Muscles | Layers */}
          <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-xl border border-[#c59b27]/25 text-[10.5px] font-mono font-bold">
            <button
              onClick={() => {
                setAnatomyTab('bones');
                if (onSetViewMode) onSetViewMode('bone');
              }}
              className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                anatomyTab === 'bones'
                  ? 'bg-[#D9AE29] text-[#0c0e12] shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bone className="w-3 h-3" />
              <span>Bones</span>
            </button>

            <button
              onClick={() => {
                setAnatomyTab('muscles');
                if (onSetViewMode) onSetViewMode('muscle');
              }}
              className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                anatomyTab === 'muscles'
                  ? 'bg-[#D9AE29] text-[#0c0e12] shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Muscles</span>
            </button>

            <button
              onClick={() => setAnatomyTab('layers')}
              className={`py-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                anatomyTab === 'layers'
                  ? 'bg-[#D9AE29] text-[#0c0e12] shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Layers</span>
            </button>
          </div>

          {/* TAB 1: BONES & SKELETAL SYSTEM */}
          {anatomyTab === 'bones' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#D9AE29]">
                <span className="font-semibold uppercase tracking-wider">Active Skeletal Structures ({displayBones.length})</span>
                <span className="text-stone-400">Step {currentStepIndex + 1}</span>
              </div>

              {/* Bones List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                {displayBones.map((bone) => {
                  const isSelected = bone.id === internalSelectedBoneId;
                  return (
                    <div
                      key={bone.id}
                      onClick={() => handleSelectBoneClick(bone)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D9AE29]/15 border-[#D9AE29] shadow-[0_0_10px_rgba(217,174,41,0.2)]'
                          : 'bg-black/35 hover:bg-black/60 border-[#c59b27]/20 hover:border-[#c59b27]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Bone className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#D9AE29]' : 'text-stone-400'}`} />
                          <span className="font-bold text-[11px] text-[#F5EFE5] truncate">
                            {bone.name}
                          </span>
                        </div>
                        <span className="text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/40 text-[#D9AE29] border border-[#c59b27]/30 shrink-0">
                          {bone.category || 'Joint'}
                        </span>
                      </div>

                      {/* Latin Name */}
                      {bone.latinName && (
                        <div className="text-[10px] font-mono italic text-[#D9AE29]/80 mt-0.5 pl-5">
                          {bone.latinName}
                        </div>
                      )}

                      {/* Description & Alignment Cue */}
                      {isSelected && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#c59b27]/20 pl-1 space-y-1 text-[10.5px]">
                          {bone.description && (
                            <p className="text-stone-300 leading-snug">
                              {bone.description}
                            </p>
                          )}
                          {bone.alignmentCue && (
                            <div className="flex items-start gap-1 text-[#D9AE29] text-[10px] bg-[#D9AE29]/10 p-1.5 rounded-lg border border-[#D9AE29]/20">
                              <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{bone.alignmentCue}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MUSCLES & HEATMAP ACTIVATION */}
          {anatomyTab === 'muscles' && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#D9AE29]">
                <span className="font-semibold uppercase tracking-wider">Engaged Muscles ({asana.muscles.length})</span>
                <span className="text-stone-400">Heatmap</span>
              </div>

              {/* Muscles List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                {asana.muscles.map((muscle) => {
                  const isSelected = selectedMuscle?.id === muscle.id;
                  const isPrimary = muscle.role === 'primary';
                  const isSecondary = muscle.role === 'secondary';

                  const badgeColor = isPrimary
                    ? 'bg-[#ea580c]/20 text-[#f97316] border-[#ea580c]/40'
                    : isSecondary
                      ? 'bg-[#c59b27]/20 text-[#D9AE29] border-[#D9AE29]/40'
                      : 'bg-[#0284c7]/20 text-[#38bdf8] border-[#0284c7]/40';

                  return (
                    <div
                      key={muscle.id}
                      onClick={() => onSelectMuscle(muscle)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#ea580c]/15 border-[#ea580c] shadow-[0_0_10px_rgba(234,88,12,0.2)]'
                          : 'bg-black/35 hover:bg-black/60 border-[#c59b27]/20 hover:border-[#c59b27]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Activity className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#f97316]' : 'text-stone-400'}`} />
                          <span className="font-bold text-[11px] text-[#F5EFE5] truncate">
                            {muscle.name}
                          </span>
                        </div>
                        <span className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${badgeColor}`}>
                          {muscle.role || 'Active'}
                        </span>
                      </div>

                      {/* Latin Name */}
                      {muscle.latinName && (
                        <div className="text-[10px] font-mono italic text-[#D9AE29]/80 mt-0.5 pl-5">
                          {muscle.latinName}
                        </div>
                      )}

                      {/* Function / Description */}
                      {isSelected && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#c59b27]/20 pl-1 space-y-1 text-[10.5px]">
                          {muscle.description && (
                            <p className="text-stone-300 leading-snug">
                              {muscle.description}
                            </p>
                          )}
                          {typeof muscle.percentage === 'number' && (
                            <div className="flex items-center justify-between text-[9.5px] font-mono text-stone-400 pt-0.5">
                              <span>Engagement Intensity:</span>
                              <span className="text-[#D9AE29] font-bold">{muscle.percentage}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: VISUAL LAYERS TOGGLES */}
          {anatomyTab === 'layers' && (
            <div className="space-y-2 bg-black/30 p-2.5 rounded-xl border border-[#c59b27]/20 animate-in fade-in duration-200">
              {/* 1. Anatomy Overlay */}
              <div className="flex items-center justify-between py-1">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-[#F5EFE5] text-[11.5px]">
                    Anatomy Overlay
                  </div>
                  <div className="text-[9.5px] text-[#D9AE29]/80 font-mono">
                    {showAnatomyOverlay ? 'On, showing muscle engagement heatmap' : 'Off'}
                  </div>
                </div>
                <button
                  id="sidebar-toggle-anatomy-overlay"
                  onClick={onToggleAnatomyOverlay}
                  aria-label="Toggle Anatomy Overlay"
                  className={`relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200 cursor-pointer ${
                    showAnatomyOverlay ? 'bg-[#D9AE29]' : 'bg-stone-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#0c0e12] shadow-md transition-all duration-200 ${
                      showAnatomyOverlay ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* 2. Skeleton */}
              <div className="flex items-center justify-between py-1 border-t border-white/5">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-[#F5EFE5] text-[11.5px]">
                    Skeleton
                  </div>
                  <div className="text-[9.5px] text-[#D9AE29]/80 font-mono">
                    {showSkeleton ? 'On, showing 3D joints & bones' : 'Off'}
                  </div>
                </div>
                <button
                  id="sidebar-toggle-skeleton"
                  onClick={onToggleSkeleton}
                  aria-label="Toggle Skeleton Layer"
                  className={`relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200 cursor-pointer ${
                    showSkeleton ? 'bg-[#D9AE29]' : 'bg-stone-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#0c0e12] shadow-md transition-all duration-200 ${
                      showSkeleton ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* 3. Alignment Grid */}
              <div className="flex items-center justify-between py-1 border-t border-white/5">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-[#F5EFE5] text-[11.5px]">
                    Alignment Grid
                  </div>
                  <div className="text-[9.5px] text-stone-400 font-mono">
                    Laser plumblines & horizon plane
                  </div>
                </div>
                <button
                  id="sidebar-toggle-alignment-grid"
                  onClick={onToggleAlignmentGrid}
                  aria-label="Toggle Alignment Grid"
                  className={`relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200 cursor-pointer ${
                    showAlignmentGrid ? 'bg-[#D9AE29]' : 'bg-stone-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#0c0e12] shadow-md transition-all duration-200 ${
                      showAlignmentGrid ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* 4. Prop Toggle */}
              <div className="flex items-center justify-between py-1 border-t border-white/5">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-[#F5EFE5] text-[11.5px]">
                    Prop Toggle
                  </div>
                  <div className="text-[9.5px] text-stone-400 font-mono">
                    Yoga block & mat props
                  </div>
                </div>
                <button
                  id="sidebar-toggle-props"
                  onClick={onToggleProps}
                  aria-label="Toggle Props Layer"
                  className={`relative w-9 h-5 rounded-full shrink-0 transition-colors duration-200 cursor-pointer ${
                    showProps ? 'bg-[#D9AE29]' : 'bg-stone-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-[#0c0e12] shadow-md transition-all duration-200 ${
                      showProps ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Alignment Highlights */}
        <div className="space-y-1 pt-1">
          <div className="font-sans font-bold text-xs text-[#D9AE29]">
            Alignment Highlights
          </div>
          <p className="text-[11px] text-[#F5EFE5]/90 leading-relaxed font-sans">
            Spine elongated, pelvis neutral, front knee stacked over ankle, shoulders broad and relaxed.
          </p>
        </div>

        {/* 6. Alignment Highlights Bullet Points */}
        <div className="space-y-1.5 pt-1">
          <div className="font-sans font-bold text-xs text-[#D9AE29]">
            Key Alignment Points
          </div>
          <ul className="space-y-1 text-[11px] text-[#F5EFE5]/90 font-sans">
            <li className="flex items-start gap-1.5">
              <span className="text-[#D9AE29] font-bold">•</span>
              <span>Ground evenly through both feet with arches lifted.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#D9AE29] font-bold">•</span>
              <span>Lengthen through the crown of the head while drawing scapulae down.</span>
            </li>
          </ul>
        </div>

        {/* 7. Expandable Deeper Analytics (Chakras, Breath, Steps, AI Teacher) */}
        <div className="pt-2 border-t border-[#c59b27]/20">
          <button
            onClick={() => setShowDeepAnalysis(!showDeepAnalysis)}
            className="w-full py-1.5 px-2 rounded-xl bg-black/40 hover:bg-white/5 border border-[#c59b27]/25 text-[10.5px] font-mono text-[#D9AE29] flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Chakras, Breath & AI Teacher</span>
            </span>
            {showDeepAnalysis ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDeepAnalysis && (
            <div className="mt-3 space-y-4 pt-2 border-t border-white/5">
              {/* Chakra Node */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#c59b27]/20 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#F5EFE5]">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-[#D9AE29]" />
                    <span>{selectedChakra.englishName} ({selectedChakra.sanskritName})</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#D9AE29]">
                    Seed: {selectedChakra.bijaMantra || 'RAM'}
                  </span>
                </div>
                <p className="text-[10px] text-[#F5EFE5]/80 font-sans">
                  {selectedChakra.activationRole || selectedChakra.meaning}
                </p>
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {ALL_CHAKRAS.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => onSelectChakraIndex(idx)}
                      className={`h-4 rounded-md flex items-center justify-center cursor-pointer border ${
                        selectedChakraIndex === idx ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: ch.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Breath Guidance */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#c59b27]/20 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#F5EFE5]">
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-3 h-3 text-[#D9AE29]" />
                    <span>Pranayama Wave</span>
                  </span>
                  <span className="text-[9px] font-mono text-[#D9AE29]">Inhale / Exhale</span>
                </div>
                <p className="text-[10px] text-[#F5EFE5]/80 font-sans">
                  Inhale to expand collarbones and spine; exhale to ground into pelvis.
                </p>
              </div>

              {/* Steps */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#c59b27]/20 space-y-1.5">
                <div className="text-[11px] font-semibold text-[#F5EFE5]">
                  Vinyasa Steps ({asana.steps.length})
                </div>
                <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                  {asana.steps.map((st, i) => (
                    <button
                      key={st.stepNumber}
                      onClick={() => onStepChange(i)}
                      className={`px-2 py-1 rounded-lg text-[9.5px] font-mono transition-all cursor-pointer shrink-0 border ${
                        currentStepIndex === i
                          ? 'bg-[#D9AE29] text-[#0c0e12] border-[#D9AE29] font-bold'
                          : 'bg-black/30 text-[#F5EFE5]/80 border-white/10'
                      }`}
                    >
                      Step {st.stepNumber}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#F5EFE5]/80 font-sans">
                  {asana.steps[currentStepIndex]?.instruction}
                </p>
              </div>

              {/* AI Question Box */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-[#c59b27]/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#D9AE29]">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3 h-3" />
                    <span>Ask Pragya AI Coach</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-[#c59b27]/25">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                    placeholder="Ask alignment question..."
                    className="flex-1 bg-transparent px-1.5 py-0.5 text-[10.5px] text-[#F5EFE5] placeholder-[#F5EFE5]/40 outline-none"
                  />
                  <button
                    onClick={handleAskAI}
                    disabled={isAiLoading || !aiQuestion.trim()}
                    className="p-1 rounded bg-[#D9AE29] text-[#0c0e12] hover:bg-[#e5c158] disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>

                {aiResponse && (
                  <div className="p-2 rounded-lg bg-black/60 border border-[#D9AE29]/30 text-[10px] text-[#F5EFE5]/90">
                    {aiResponse}
                  </div>
                )}

                {onOpenAIModal && (
                  <button
                    onClick={onOpenAIModal}
                    className="w-full py-1 text-center text-[9.5px] font-mono text-[#D9AE29] hover:underline cursor-pointer"
                  >
                    Open AI Dialogue Modal &rarr;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
