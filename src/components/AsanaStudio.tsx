import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  Play, 
  Pause, 
  Sparkles, 
  Menu, 
  X, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { YogaHumanCanvas } from './3d/YogaHumanCanvas';
import type { Asana, VisualLayerType, MuscleActivation, ChakraInfo, PlaybackSpeed, LoopMode } from '../types';
import { voiceGuidance } from '../utils/voiceGuidance';
import { ALL_CHAKRAS, ALL_BONES } from '../data/asanas';
import { PragyaLogo } from './PragyaLogo';
import type { ScreenPin } from './3d/Anatomy3DOverlay';

// Modular Studio Components
import { LeftNavSidebar } from './studio/LeftNavSidebar';
import { TopModeSwitcher, type StudioViewMode } from './studio/TopModeSwitcher';
import { FloatingViewControls } from './studio/FloatingViewControls';
import { FloatingScrubberBar } from './studio/FloatingScrubberBar';
import { RightDescriptionSidebar } from './studio/RightDescriptionSidebar';
import { PoseLibraryDrawer } from './studio/PoseLibraryDrawer';
import { SequenceBuilderModal } from './studio/SequenceBuilderModal';
import { CommunityModal } from './studio/CommunityModal';
import { AIYogaTeacherModal } from './AIYogaTeacherModal';

interface AsanaStudioProps {
  asana: Asana;
  onSelectOtherAsana?: (asana: Asana) => void;
  onBack?: () => void;
  isDark: boolean;
}

export const AsanaStudio: React.FC<AsanaStudioProps> = ({
  asana,
  onSelectOtherAsana,
  onBack,
  isDark = true,
}) => {
  // Navigation & Modals state
  const [activeNav, setActiveNav] = useState<'library' | 'anatomy' | 'sequence' | 'community'>('library');
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState(false);
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isAITeacherModalOpen, setIsAITeacherModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 3D View Modes & Visual Layers
  const [viewMode, setViewMode] = useState<StudioViewMode>('camera');
  const [activeLayer, setActiveLayer] = useState<VisualLayerType>('chakras');
  const [showAnatomyOverlay, setShowAnatomyOverlay] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showAlignmentGrid, setShowAlignmentGrid] = useState(true);
  const [showProps, setShowProps] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'360' | 'front' | 'side' | 'back' | 'top' | 'upper' | 'lower' | 'skeleton' | 'muscle'>('360');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Step Timeline, Playback Engine, and Scrubber
  const TOTAL_STEPS = asana.steps?.length > 0 ? asana.steps.length : 6;
  const [currentStepIndex, setCurrentStepIndex] = useState(2); // Step 3/6 default
  const [isPlayingSteps, setIsPlayingSteps] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [loopMode, setLoopMode] = useState<LoopMode>('asana');
  const [scrubberProgress, setScrubberProgress] = useState(
    Math.round((2 / (TOTAL_STEPS - 1)) * 100)
  );

  // Duration calculation (sum of step durations or default 4s each)
  const totalDurationSeconds = asana.steps?.reduce(
    (acc, step) => acc + (step.durationSeconds || 4),
    0
  ) || TOTAL_STEPS * 4;

  const currentTimeSeconds = (scrubberProgress / 100) * totalDurationSeconds;

  // Anatomical selection state
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleActivation | null>(asana.muscles[0] || null);
  const [selectedBoneId, setSelectedBoneId] = useState<string | null>('spine-lumbar');
  const [selectedChakraIndex, setSelectedChakraIndex] = useState<number>(4); // Vishuddha
  const [selectedPin, setSelectedPin] = useState<ScreenPin | null>(null);

  // Continuous animation frame loop for smooth playback
  const lastTimeRef = useRef<number | null>(null);
  useEffect(() => {
    let animFrameId: number;

    const tick = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const deltaSeconds = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlayingSteps && totalDurationSeconds > 0) {
        setScrubberProgress((prev) => {
          const advance = ((deltaSeconds * playbackSpeed) / totalDurationSeconds) * 100;
          let nextProgress = prev + advance;

          if (loopMode === 'step') {
            const stepSpan = 100 / (TOTAL_STEPS - 1);
            const stepStart = currentStepIndex * stepSpan;
            const stepEnd = (currentStepIndex + 1) * stepSpan;
            if (nextProgress >= Math.min(100, stepEnd)) {
              nextProgress = stepStart;
            }
          } else if (nextProgress >= 100) {
            if (loopMode === 'asana') {
              nextProgress = 0;
            } else {
              nextProgress = 100;
              setIsPlayingSteps(false);
            }
          }

          const calcStep = Math.min(
            TOTAL_STEPS - 1,
            Math.floor((nextProgress / 100) * TOTAL_STEPS)
          );
          if (calcStep !== currentStepIndex) {
            setCurrentStepIndex(calcStep);
          }

          return nextProgress;
        });
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animFrameId);
      lastTimeRef.current = null;
    };
  }, [isPlayingSteps, playbackSpeed, loopMode, totalDurationSeconds, TOTAL_STEPS, currentStepIndex]);

  // Voice guidance on step change when playing
  const lastSpokenStep = useRef<number>(-1);
  useEffect(() => {
    if (isPlayingSteps && currentStepIndex !== lastSpokenStep.current) {
      lastSpokenStep.current = currentStepIndex;
      const step = asana.steps?.[currentStepIndex];
      if (step) {
        voiceGuidance.speak(`Step ${currentStepIndex + 1}: ${step.title}. ${step.instruction}`);
      }
    }
  }, [isPlayingSteps, currentStepIndex, asana.steps]);

  // Left Nav selector handler
  const handleSelectNav = (nav: 'library' | 'anatomy' | 'sequence' | 'community') => {
    setActiveNav(nav);
    if (nav === 'library') {
      setIsLibraryDrawerOpen(true);
    } else if (nav === 'anatomy') {
      setViewMode((prev) => (prev === 'muscle' ? 'bone' : 'muscle'));
      setShowAnatomyOverlay(true);
      setShowSkeleton(true);
    } else if (nav === 'sequence') {
      setIsSequenceModalOpen(true);
    } else if (nav === 'community') {
      setIsCommunityModalOpen(true);
    }
  };

  const handleSelectAsana = (newAsana: Asana) => {
    if (onSelectOtherAsana) {
      onSelectOtherAsana(newAsana);
    }
    setCurrentStepIndex(0);
    setScrubberProgress(0);
    setSelectedMuscle(newAsana.muscles[0] || null);
    setSelectedPin(null);
    lastSpokenStep.current = -1;
    voiceGuidance.speak(`${newAsana.sanskritName}. ${newAsana.englishName}`);
  };

  const handleStepChange = useCallback((index: number) => {
    const bounded = Math.max(0, Math.min(TOTAL_STEPS - 1, index));
    setCurrentStepIndex(bounded);
    const targetProgress = Math.round((bounded / (TOTAL_STEPS - 1)) * 100);
    setScrubberProgress(targetProgress);
    const step = asana.steps?.[bounded];
    if (step) {
      voiceGuidance.speak(`Step ${bounded + 1}: ${step.title}`);
    }
  }, [TOTAL_STEPS, asana.steps]);

  const handleScrubberChange = useCallback((progress: number) => {
    setScrubberProgress(progress);
    const step = Math.min(
      TOTAL_STEPS - 1,
      Math.floor((progress / 100) * TOTAL_STEPS)
    );
    if (step !== currentStepIndex) {
      setCurrentStepIndex(step);
    }
  }, [TOTAL_STEPS, currentStepIndex]);

  const handleResetPlayback = () => {
    setCurrentStepIndex(0);
    setScrubberProgress(0);
    setIsPlayingSteps(true);
    lastSpokenStep.current = -1;
  };

  const handleToggleLoopMode = () => {
    setLoopMode((prev) => {
      if (prev === 'asana') return 'step';
      if (prev === 'step') return 'once';
      return 'asana';
    });
  };

  const handleRotate360 = () => {
    setCameraPreset((prev) => (prev === '360' ? 'front' : '360'));
  };

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(2.0, z + 0.15));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(0.5, z - 0.15));
  };

  const handlePanToggle = () => {
    setIsPanning((p) => !p);
  };

  const handleResetView = () => {
    setCameraPreset('360');
    setZoomLevel(1.0);
    setIsPanning(false);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      id="asana-studio-fullscreen-container"
      className="h-screen w-screen overflow-hidden relative flex flex-col justify-between select-none bg-[#0c0e12] text-[#F5EFE5]"
    >
      {/* 3D CANVAS VIEWPORT (FILLS BACKGROUND/CENTER) */}
      <div className="absolute inset-0 z-0">
        <YogaHumanCanvas
          asana={asana}
          currentStepIndex={currentStepIndex}
          scrubberProgress={scrubberProgress}
          activeLayer={activeLayer}
          viewMode={viewMode}
          showAnatomyOverlay={showAnatomyOverlay}
          showSkeleton={showSkeleton}
          showAlignmentGrid={showAlignmentGrid}
          showProps={showProps}
          selectedMuscleId={selectedMuscle?.id}
          selectedBoneId={selectedBoneId}
          selectedChakraId={ALL_CHAKRAS[selectedChakraIndex]?.id}
          selectedPin={selectedPin}
          onSelectPin={(pin) => {
            setSelectedPin(pin);
            if (pin?.type === 'muscle') {
              const m = asana.muscles.find((item) => item.id === pin.id);
              if (m) setSelectedMuscle(m);
            }
          }}
          cameraViewPreset={cameraPreset}
          zoomLevel={zoomLevel}
          isPanning={isPanning}
          isAutoRotating={cameraPreset === '360'}
          isDark={isDark}
          className="w-full h-full"
        />
      </div>

      {/* TOP FLOATING HEADER ROW */}
      <header className="relative z-20 flex items-center justify-between p-3 sm:p-5 pointer-events-none">
        {/* Top-Left: Pragya Yog Verse Official Logo & Tagline */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-[#c59b27]/40 shadow-lg flex items-center">
            <PragyaLogo variant="horizontal" size="md" isDark={isDark} />
          </div>
        </div>

        {/* Top-Center: Floating Mode Switcher (Camera / Bone / Muscle / Combined) */}
        <div className="pointer-events-auto hidden md:block">
          <TopModeSwitcher
            viewMode={viewMode}
            onSetViewMode={setViewMode}
          />
        </div>

        {/* Top-Right: Mobile Sidebar Trigger / Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-[#c59b27]/30 text-[#D9AE29] shadow-lg cursor-pointer"
            aria-label="Toggle Details Sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* CENTER INTERACTIVE FLOATING PANELS */}
      <main className="relative flex-1 px-3 sm:px-5 pointer-events-none flex items-stretch justify-between gap-4 overflow-hidden">
        {/* Left Side: Navigation Sidebar Card & Floating View Controls */}
        <div className="pointer-events-auto self-start mt-1 flex flex-col gap-3 shrink-0 z-20">
          {/* Left Nav Menu */}
          <div className="hidden md:block w-48 lg:w-52">
            <LeftNavSidebar
              activeNav={activeNav}
              onSelectNav={handleSelectNav}
            />
          </div>

          {/* Floating VIEW CONTROLS - Positioned on the LEFT */}
          <div className="self-start">
            <FloatingViewControls
              onRotate360={handleRotate360}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onPanToggle={handlePanToggle}
              onResetView={handleResetView}
              onToggleFullscreen={handleToggleFullscreen}
              onSelectCameraPreset={(p) => setCameraPreset(p)}
              cameraPreset={cameraPreset}
              isFullscreen={isFullscreen}
              isPanning={isPanning}
              isAutoRotating={cameraPreset === '360'}
            />
          </div>
        </div>

        {/* Center Space */}
        <div className="relative flex-1 pointer-events-none" />

        {/* Right Side: Description Sidebar */}
        <div
          className={`pointer-events-auto w-full sm:w-[320px] lg:w-[340px] xl:w-[360px] shrink-0 h-full max-h-full pb-2 transition-all duration-300 ${
            isMobileSidebarOpen
              ? 'fixed inset-y-16 right-3 z-40 w-[calc(100vw-1.5rem)] sm:w-[340px] block'
              : 'hidden lg:flex justify-end'
          }`}
        >
          <RightDescriptionSidebar
            asana={asana}
            showAnatomyOverlay={showAnatomyOverlay}
            showSkeleton={showSkeleton}
            showAlignmentGrid={showAlignmentGrid}
            showProps={showProps}
            activeLayer={activeLayer}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            selectedMuscle={selectedMuscle}
            selectedBoneId={selectedBoneId}
            selectedChakraIndex={selectedChakraIndex}
            currentStepIndex={currentStepIndex}
            onToggleAnatomyOverlay={() => setShowAnatomyOverlay(!showAnatomyOverlay)}
            onToggleSkeleton={() => setShowSkeleton(!showSkeleton)}
            onToggleAlignmentGrid={() => setShowAlignmentGrid(!showAlignmentGrid)}
            onToggleProps={() => setShowProps(!showProps)}
            onSetLayer={(layer) => {
              setActiveLayer(layer);
              if (layer === 'muscles') {
                setViewMode('muscle');
                setShowAnatomyOverlay(true);
              } else if (layer === 'skeleton') {
                setViewMode('bone');
                setShowSkeleton(true);
              }
            }}
            onSelectMuscle={setSelectedMuscle}
            onSelectBone={(bone) => setSelectedBoneId(bone.id)}
            onSelectChakraIndex={setSelectedChakraIndex}
            onStepChange={handleStepChange}
            onOpenAIModal={() => setIsAITeacherModalOpen(true)}
            isDark={isDark}
          />
        </div>
      </main>

      {/* BOTTOM FLOATING CONTROLLER: PLAY/PAUSE, SPEED, LOOP, SCRUBBER */}
      <footer className="relative z-20 px-3 pb-3 pt-1 pointer-events-none">
        <div className="pointer-events-auto max-w-2xl mx-auto w-full">
          <FloatingScrubberBar
            asana={asana}
            currentStepIndex={currentStepIndex}
            totalSteps={TOTAL_STEPS}
            isPlaying={isPlayingSteps}
            playbackSpeed={playbackSpeed}
            loopMode={loopMode}
            scrubberProgress={scrubberProgress}
            currentTimeSeconds={currentTimeSeconds}
            totalDurationSeconds={totalDurationSeconds}
            onTogglePlay={() => setIsPlayingSteps(!isPlayingSteps)}
            onSelectSpeed={setPlaybackSpeed}
            onToggleLoopMode={handleToggleLoopMode}
            onResetPlayback={handleResetPlayback}
            onStepChange={handleStepChange}
            onScrubberChange={handleScrubberChange}
          />
        </div>
      </footer>

      {/* POSE LIBRARY SLIDE-OUT DRAWER */}
      <PoseLibraryDrawer
        isOpen={isLibraryDrawerOpen}
        onClose={() => setIsLibraryDrawerOpen(false)}
        currentAsana={asana}
        onSelectAsana={handleSelectAsana}
      />

      {/* SEQUENCE BUILDER MODAL */}
      <SequenceBuilderModal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
        onSelectAsana={handleSelectAsana}
      />

      {/* COMMUNITY FORUM MODAL */}
      <CommunityModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
      />

      {/* AI YOGA TEACHER MODAL */}
      <AIYogaTeacherModal
        isOpen={isAITeacherModalOpen}
        onClose={() => setIsAITeacherModalOpen(false)}
        asana={asana}
      />
    </div>
  );
};
