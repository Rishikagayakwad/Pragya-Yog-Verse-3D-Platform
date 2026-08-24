import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Activity, 
  Shield, 
  Wind, 
  Layers, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Compass,
  X,
  Clock,
  Heart,
  BookOpen,
  ArrowLeft,
  Flame,
  Zap,
  User,
  Bot,
  Volume2,
  VolumeX,
  Target,
  SlidersHorizontal,
  Bookmark,
  Share2
} from 'lucide-react';
import { YogaHumanCanvas } from './3d/YogaHumanCanvas';
import type { Asana, VisualLayerType, ActiveStudioSection, MuscleActivation, BodySystemType } from '../types';
import { voiceGuidance } from '../utils/voiceGuidance';
import { AIYogaTeacherModal } from './AIYogaTeacherModal';
import { ASANAS, ALL_CHAKRAS } from '../data/asanas';

// Step Sequence Template for 7-step studio workflow
const DEFAULT_SEVEN_STEPS = [
  { step: '01', title: 'Tadasana', instruction: 'Stand tall with feet together, rooting through four corners and lengthening spine upward.' },
  { step: '02', title: 'Wide Stance', instruction: 'Step feet 3.5 to 4 feet apart, keeping heels aligned and arms resting on hips.' },
  { step: '03', title: 'Warrior II', instruction: 'Extend your arms outward until they are parallel to the floor, bending front knee over ankle.' },
  { step: '04', title: 'Reverse Warrior', instruction: 'Incline torso back, sweeping front arm overhead while keeping front knee deep and steady.' },
  { step: '05', title: 'Return to Center', instruction: 'Inhale back to Warrior II, settling pelvic weight evenly between front and back foot.' },
  { step: '06', title: 'Other Side', instruction: 'Pivot feet to opposite direction and repeat sequence with equal breath poise.' },
  { step: '07', title: 'Completion', instruction: 'Step back to mountain center, closing eyes and sensing circulating prana throughout the body.' },
];

interface AsanaStudioProps {
  asana: Asana;
  onSelectOtherAsana?: (slug: string) => void;
  onBack?: () => void;
  isDark: boolean;
}

export const AsanaStudio: React.FC<AsanaStudioProps> = ({
  asana,
  onSelectOtherAsana,
  onBack,
  isDark,
}) => {
  // Active selected card / Inspector Section (defaults to 'chakra')
  const [activeSection, setActiveSection] = useState<ActiveStudioSection | null>('chakra');
  const [activeLayer, setActiveLayer] = useState<VisualLayerType>('chakras');
  
  // Step navigation
  const [currentStepIndex, setCurrentStepIndex] = useState(2); // Step 03 default
  const [isPlayingSteps, setIsPlayingSteps] = useState(false);

  // Anatomical selection state
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleActivation | null>(asana.muscles[0] || null);
  const [selectedChakraIndex, setSelectedChakraIndex] = useState<number>(4); // Vishuddha default (index 4)
  const selectedChakra = ALL_CHAKRAS[selectedChakraIndex] || ALL_CHAKRAS[0];

  // 3D Model Viewport Controls
  const [cameraPreset, setCameraPreset] = useState<'360' | 'front' | 'side' | 'back' | 'top'>('side');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Breath Visualizer State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4);

  // AI Teacher Modal
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Voice Guidance State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(84); // 01:24

  // Audio wave animation counter for voice guidance widget
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVoiceActive) {
      interval = setInterval(() => {
        setVoiceSeconds((prev) => (prev >= 270 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVoiceActive]);

  // Step Auto-Player Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingSteps) {
      const currentStep = asana.steps[currentStepIndex] || DEFAULT_SEVEN_STEPS[currentStepIndex];
      const duration = 5000;

      if (isVoiceActive && currentStep) {
        voiceGuidance.speak(`Step ${currentStepIndex + 1}: ${currentStep.title}. ${currentStep.instruction}`);
      }

      timer = setTimeout(() => {
        if (currentStepIndex < 6) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlayingSteps(false);
        }
      }, duration);
    }

    return () => clearTimeout(timer);
  }, [isPlayingSteps, currentStepIndex, asana.steps, isVoiceActive]);

  // Handle Section Tab Selection
  const handleSelectSection = (section: ActiveStudioSection) => {
    if (activeSection === section) {
      // Toggle inspector open / close
      setActiveSection(null);
      return;
    }

    setActiveSection(section);

    if (section === 'chakra') {
      setActiveLayer('chakras');
    } else if (section === 'muscles') {
      setActiveLayer('muscles');
    } else if (section === 'breath') {
      setActiveLayer('breath');
      setIsBreathingActive(true);
    } else if (section === 'ai-teacher') {
      setIsAIOpen(true);
    } else if (section === 'steps' || section === 'position' || section === 'drishti') {
      setActiveLayer('skin');
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    if (isVoiceActive) {
      const step = DEFAULT_SEVEN_STEPS[index];
      if (step) voiceGuidance.speak(`Step ${step.step}: ${step.title}. ${step.instruction}`);
    }
  };

  const handleResetCamera = () => {
    setCameraPreset('360');
    setZoomLevel(1.0);
  };

  // Format mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Steps data normalized to 7 cards
  const stepsList = DEFAULT_SEVEN_STEPS.map((defStep, i) => {
    const actual = asana.steps[i];
    return {
      stepNumber: defStep.step,
      title: actual?.title || defStep.title,
      instruction: actual?.instruction || defStep.instruction,
    };
  });

  const activeStepData = stepsList[currentStepIndex] || stepsList[0];

  return (
    <div className="min-h-screen pt-20 pb-8 px-2 sm:px-4 lg:px-6 max-w-[1720px] mx-auto flex flex-col justify-between gap-3 select-none">
      
      {/* 1. TOP SUBHEADER BAR */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-2 px-3 sm:px-5 rounded-3xl bg-white/60 dark:bg-[#071912]/70 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/20 shadow-lg">
        
        {/* Left: Back Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <button
            id="studio-back-btn"
            onClick={onBack}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-[#00381F]/80 text-[#272727] dark:text-[#F5EFE5] hover:text-[#944426] dark:hover:text-[#D9AE29] border border-black/10 dark:border-white/10 hover:border-[#944426] dark:hover:border-[#D9AE29] transition-all text-xs font-semibold shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Asanas</span>
          </button>
        </div>

        {/* Center: Title & Sanskrit & Metadata Pills */}
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-widest text-[#00381F] dark:text-[#F5EFE5] uppercase">
            {asana.englishName}
          </h1>
          <div className="font-accent italic text-sm text-[#944426] dark:text-[#D9AE29] font-medium">
            {asana.sanskritName}
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-2.5 mt-1.5 text-[11px] font-mono text-stone-600 dark:text-stone-300">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              {asana.category} Pose
            </span>
            <span className="opacity-40">&bull;</span>
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              {asana.difficulty}
            </span>
            <span className="opacity-40">&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              30–60 sec
            </span>
          </div>
        </div>

        {/* Right: Save & Start Practice CTAs */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-center md:justify-end">
          <button
            id="studio-save-btn"
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
              isSaved
                ? 'bg-[#944426] text-white border-[#944426] dark:bg-[#D9AE29] dark:text-[#00381F] dark:border-[#D9AE29]'
                : 'bg-white/80 dark:bg-black/40 text-stone-700 dark:text-stone-300 border-black/10 dark:border-white/10 hover:border-[#944426] dark:hover:border-[#D9AE29]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            id="studio-start-practice-btn"
            onClick={() => setIsPlayingSteps(!isPlayingSteps)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#944426] to-[#b3532f] dark:from-[#D9AE29] dark:to-[#e8c148] text-white dark:text-[#00381F] text-xs font-bold shadow-lg hover:shadow-xl hover:scale-103 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlayingSteps ? 'Pause Practice' : 'Start Guided Practice'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 3D WORKSPACE GRID */}
      <div className="relative flex-1 grid grid-cols-12 gap-3 min-h-[460px] lg:min-h-[520px]">
        
        {/* LEFT ORBITAL DOCK (5 Interactive Cards + Voice Guidance) */}
        <div className="col-span-12 sm:col-span-4 lg:col-span-2 flex flex-col justify-between gap-2.5 z-20">
          <div className="flex flex-col gap-2">
            
            {/* Card 1: Chakra */}
            <button
              id="orbital-card-chakra"
              onClick={() => handleSelectSection('chakra')}
              className={`group flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left cursor-pointer ${
                activeSection === 'chakra'
                  ? 'bg-[#00381F]/90 text-[#F5EFE5] dark:bg-[#1a0f2e]/90 border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                  : 'bg-white/80 dark:bg-[#071912]/80 text-[#272727] dark:text-[#F5EFE5] border-black/10 dark:border-white/10 hover:border-purple-400/60 hover:bg-white/95'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300 border border-purple-500/40 shrink-0 group-hover:scale-108 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs">Chakra</div>
                <div className="text-[10px] opacity-70 font-sans">7 Energy Centers</div>
              </div>
            </button>

            {/* Card 2: Muscles */}
            <button
              id="orbital-card-muscles"
              onClick={() => handleSelectSection('muscles')}
              className={`group flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left cursor-pointer ${
                activeSection === 'muscles'
                  ? 'bg-[#00381F]/90 text-[#F5EFE5] dark:bg-[#0b2419]/90 border-[#D9AE29] shadow-[0_0_20px_rgba(217,174,41,0.3)] ring-1 ring-[#D9AE29]'
                  : 'bg-white/80 dark:bg-[#071912]/80 text-[#272727] dark:text-[#F5EFE5] border-black/10 dark:border-white/10 hover:border-[#D9AE29]/60 hover:bg-white/95'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 dark:bg-[#D9AE29]/25 flex items-center justify-center text-[#944426] dark:text-[#D9AE29] border border-[#D9AE29]/40 shrink-0 group-hover:scale-108 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs">Muscles</div>
                <div className="text-[10px] opacity-70 font-sans">Activation Map</div>
              </div>
            </button>

            {/* Card 3: Step Guide */}
            <button
              id="orbital-card-steps"
              onClick={() => handleSelectSection('steps')}
              className={`group flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left cursor-pointer ${
                activeSection === 'steps'
                  ? 'bg-[#00381F]/90 text-[#F5EFE5] dark:bg-[#071912]/90 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-blue-400'
                  : 'bg-white/80 dark:bg-[#071912]/80 text-[#272727] dark:text-[#F5EFE5] border-black/10 dark:border-white/10 hover:border-blue-400/60 hover:bg-white/95'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-300 border border-blue-500/40 shrink-0 group-hover:scale-108 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs">Step Guide</div>
                <div className="text-[10px] opacity-70 font-sans">Step by Step</div>
              </div>
            </button>

            {/* Card 4: Drishti */}
            <button
              id="orbital-card-drishti"
              onClick={() => handleSelectSection('drishti')}
              className={`group flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left cursor-pointer ${
                activeSection === 'drishti'
                  ? 'bg-[#00381F]/90 text-[#F5EFE5] dark:bg-[#071912]/90 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                  : 'bg-white/80 dark:bg-[#071912]/80 text-[#272727] dark:text-[#F5EFE5] border-black/10 dark:border-white/10 hover:border-emerald-400/60 hover:bg-white/95'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 shrink-0 group-hover:scale-108 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs">Drishti</div>
                <div className="text-[10px] opacity-70 font-sans">Point of Focus</div>
              </div>
            </button>

            {/* Card 5: Position */}
            <button
              id="orbital-card-position"
              onClick={() => handleSelectSection('position')}
              className={`group flex items-center gap-3 p-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left cursor-pointer ${
                activeSection === 'position'
                  ? 'bg-[#00381F]/90 text-[#F5EFE5] dark:bg-[#071912]/90 border-[#944426] dark:border-[#D9AE29] shadow-[0_0_20px_rgba(148,68,38,0.3)] ring-1 ring-[#944426]'
                  : 'bg-white/80 dark:bg-[#071912]/80 text-[#272727] dark:text-[#F5EFE5] border-black/10 dark:border-white/10 hover:border-[#944426]/60 hover:bg-white/95'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 dark:bg-amber-600/30 flex items-center justify-center text-amber-700 dark:text-amber-300 border border-amber-600/40 shrink-0 group-hover:scale-108 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs">Position</div>
                <div className="text-[10px] opacity-70 font-sans">Alignment & Form</div>
              </div>
            </button>
          </div>

          {/* Bottom-Left Voice Guidance Player Card */}
          <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#071912]/85 backdrop-blur-xl border border-black/10 dark:border-[#D9AE29]/25 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00381F] dark:text-[#D9AE29]">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Voice Guidance</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                {formatTime(voiceSeconds)} / 04:30
              </span>
            </div>

            {/* Animated Waveform Visualizer */}
            <div className="flex items-center gap-1 h-6 px-1">
              {[40, 75, 55, 90, 60, 100, 45, 80, 65, 95, 50, 85, 70, 45, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#944426] dark:bg-[#D9AE29] rounded-full transition-all duration-300"
                  style={{
                    height: isVoiceActive ? `${Math.max(15, (h * ((voiceSeconds % 5) + 1)) % 100)}%` : `${h * 0.3}%`,
                    opacity: isVoiceActive ? 0.9 : 0.4
                  }}
                />
              ))}
            </div>

            {/* Play Button & Progress Track */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  const next = !isVoiceActive;
                  setIsVoiceActive(next);
                  if (next) {
                    voiceGuidance.speak(`Starting voice guidance for ${asana.englishName}. ${activeStepData.instruction}`);
                  } else {
                    voiceGuidance.stop();
                  }
                }}
                className="w-6 h-6 rounded-full bg-[#00381F] text-white dark:bg-[#D9AE29] dark:text-[#00381F] flex items-center justify-center text-xs shrink-0 shadow-sm cursor-pointer"
              >
                {isVoiceActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
              </button>
              <div className="flex-1 h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div 
                  className="h-full bg-[#944426] dark:bg-[#D9AE29] transition-all"
                  style={{ width: `${(voiceSeconds / 270) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CENTER 3D STAGE (Pedestal, Camera HUD, Gaze Annotation) */}
        <div className={`col-span-12 ${activeSection ? 'sm:col-span-8 lg:col-span-6' : 'sm:col-span-8 lg:col-span-8'} relative rounded-3xl overflow-hidden bg-gradient-to-b from-transparent via-black/5 to-black/10 dark:via-black/20 dark:to-black/50 border border-[#00381F]/10 dark:border-[#D9AE29]/20 shadow-2xl flex items-center justify-center min-h-[460px]`}>
          
          {/* Subtle Glowing Pedestal Floor Rings in 3D backdrop */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[380px] h-[380px] rounded-full border border-[#944426]/10 dark:border-[#D9AE29]/15 animate-pulse pointer-events-none" />
            <div className="absolute w-[280px] h-[280px] rounded-full border border-[#00381F]/15 dark:border-[#D9AE29]/25 shadow-[0_0_50px_rgba(217,174,41,0.1)] pointer-events-none" />
            <div className="absolute bottom-10 w-64 h-16 rounded-[100%] bg-[#00381F]/10 dark:bg-[#D9AE29]/15 blur-xl pointer-events-none" />
          </div>

          {/* Left Camera Orientation HUD Pills */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-[#071912]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-lg font-mono text-[10px]">
            <div className="text-[9px] text-stone-400 font-bold px-1 mb-0.5">VIEW</div>
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
                  id={`camera-preset-${cam.id}`}
                  onClick={() => setCameraPreset(cam.id as any)}
                  className={`w-12 py-1 rounded-xl text-center font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {cam.label}
                </button>
              );
            })}
          </div>

          {/* Gaze Callout Leader on 3D avatar */}
          <div className="absolute top-16 right-16 z-20 hidden md:flex items-center gap-2 pointer-events-none">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase font-bold text-stone-400">Gaze</div>
              <div className="text-xs font-semibold text-[#00381F] dark:text-[#D9AE29]">
                {asana.drishti ? asana.drishti.split('(')[0] : 'Over Fingertips'}
              </div>
            </div>
            <div className="relative flex items-center justify-center w-4 h-4">
              <span className="absolute w-full h-full rounded-full bg-[#944426] dark:bg-[#D9AE29] opacity-75 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-[#944426] dark:bg-[#D9AE29]" />
            </div>
          </div>

          {/* Interactive 3D Human Model */}
          <YogaHumanCanvas
            asana={asana}
            currentStepIndex={currentStepIndex}
            activeLayer={activeLayer}
            selectedMuscleId={selectedMuscle?.id}
            selectedChakraId={selectedChakra?.id}
            cameraViewPreset={cameraPreset}
            zoomLevel={zoomLevel}
            isDark={isDark}
            className="w-full h-full"
          />

          {/* Bottom Center 3D Viewport Controls: Rotate Pill, Zoom Slider, Reset */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-black/10 dark:border-[#D9AE29]/30 shadow-xl text-xs">
            
            {/* Drag to rotate pill */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
              <span>👆</span>
              <span>Drag to rotate</span>
            </div>

            <div className="h-3 w-px bg-black/10 dark:bg-white/10 mx-0.5" />

            {/* Zoom Slider Control */}
            <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-mono text-xs">
              <button
                id="zoom-out-btn"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                className="w-5 h-5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center font-bold cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-16 h-1 accent-[#944426] dark:accent-[#D9AE29] cursor-pointer"
              />

              <button
                id="zoom-in-btn"
                onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                className="w-5 h-5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center font-bold cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
            </div>

            <div className="h-3 w-px bg-black/10 dark:bg-white/10 mx-0.5" />

            {/* Reset Camera */}
            <button
              id="reset-cam-btn"
              onClick={handleResetCamera}
              className="flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-[#944426] dark:hover:text-[#D9AE29] px-2 py-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ORBITAL DOCK (OR) SLIDE-OUT INSPECTOR PANEL */}
        {activeSection ? (
          /* RIGHT INSPECTOR SLIDE-OUT PANEL */
          <div className="col-span-12 sm:col-span-12 lg:col-span-4 rounded-3xl bg-white/90 dark:bg-[#071912]/95 backdrop-blur-2xl border border-[#00381F]/15 dark:border-[#D9AE29]/30 shadow-2xl p-5 flex flex-col justify-between gap-4 z-30 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-500/30">
                  {activeSection === 'chakra' && <Sparkles className="w-4 h-4" />}
                  {activeSection === 'muscles' && <Activity className="w-4 h-4" />}
                  {activeSection === 'benefits' && <Heart className="w-4 h-4" />}
                  {activeSection === 'contraindications' && <AlertTriangle className="w-4 h-4" />}
                  {activeSection === 'breath' && <Wind className="w-4 h-4" />}
                  {activeSection === 'significance' && <BookOpen className="w-4 h-4" />}
                  {activeSection === 'drishti' && <Eye className="w-4 h-4" />}
                  {activeSection === 'position' && <Compass className="w-4 h-4" />}
                  {activeSection === 'steps' && <Layers className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#00381F] dark:text-[#F5EFE5] capitalize">
                    {activeSection === 'chakra' ? 'Chakra' : activeSection}
                  </div>
                  <div className="text-[10px] text-stone-500 font-sans">
                    {activeSection === 'chakra' ? 'Energy Center' : 'Anatomical Intelligence'}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="close-inspector-btn"
                onClick={() => setActiveSection(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 dark:text-stone-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Section Content Body */}
            <div className="flex-1 space-y-4">
              
              {/* --- 1. CHAKRA INSPECTOR VIEW --- */}
              {activeSection === 'chakra' && (
                <div className="space-y-4">
                  {/* Chakra Name & Sacred Geometry Mandala Visual */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-[#00381F] dark:text-[#D9AE29]">
                        {selectedChakra.sanskritName}
                      </h2>
                      <div className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                        {selectedChakra.englishName}
                      </div>
                      <div className="text-xs font-accent italic text-[#944426] dark:text-purple-300 mt-0.5">
                        संस्कृत: {selectedChakra.bijaMantra}
                      </div>
                    </div>

                    {/* Sacred Yantra SVG Mandala Visual */}
                    <div className="relative w-20 h-20 rounded-2xl bg-blue-500/10 dark:bg-blue-600/20 border border-blue-400/40 flex items-center justify-center p-2 shadow-inner">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500 dark:text-blue-400 animate-spin-slow">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <polygon points="50,15 80,70 20,70" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <polygon points="50,85 80,30 20,30" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="50" cy="50" r="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <span className="absolute font-bold text-xs text-blue-600 dark:text-blue-200">
                        {selectedChakra.bijaMantra.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Chakra Metadata Attribute List */}
                  <div className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">📍</span>
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white">Location:</span> {selectedChakra.location}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">🔺</span>
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white">Element:</span> {selectedChakra.element}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">🎨</span>
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white">Color:</span> {selectedChakra.color} ({selectedChakra.englishName.split(' ')[0]})
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">⚙</span>
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white">Qualities:</span> {selectedChakra.activationRole}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">🕊</span>
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white">When Active:</span> {selectedChakra.meaning}
                      </div>
                    </div>
                  </div>

                  {/* View in Body Button */}
                  <button
                    onClick={() => setActiveLayer('chakras')}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#00381F] to-[#0a4d2c] dark:from-purple-900/60 dark:to-indigo-950/80 text-white border border-purple-400/30 flex items-center justify-center gap-2 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>View in Body</span>
                  </button>
                </div>
              )}

              {/* --- 2. MUSCLES INSPECTOR VIEW --- */}
              {activeSection === 'muscles' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl font-bold text-[#00381F] dark:text-[#D9AE29]">
                        {selectedMuscle?.name || 'Primary Activated Muscles'}
                      </h2>
                      <div className="text-xs font-mono text-stone-400">
                        {selectedMuscle?.latinName || 'Kinesiology Activation'}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#944426] dark:bg-[#D9AE29] text-white dark:text-[#00381F] text-xs font-bold font-mono">
                      {selectedMuscle?.percentage || 85}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                    <p className="leading-relaxed">{selectedMuscle?.description || asana.fullDescription}</p>
                    <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5">
                      <span className="font-bold text-stone-900 dark:text-white">Biomechanical Role: </span>
                      {selectedMuscle?.biomechanics || 'Provides isometric support and hip stabilization during hold.'}
                    </div>
                  </div>

                  {/* Muscle Selector Pills */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase font-bold text-stone-400">All Muscles in Pose:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {asana.muscles.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMuscle(m)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                            selectedMuscle?.id === m.id
                              ? 'bg-[#944426] text-white dark:bg-[#D9AE29] dark:text-[#00381F] font-bold'
                              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'
                          }`}
                        >
                          {m.name} ({m.percentage}%)
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- 3. BENEFITS VIEW --- */}
              {activeSection === 'benefits' && (
                <div className="space-y-3 text-xs">
                  <h2 className="font-display text-lg font-bold text-[#00381F] dark:text-[#D9AE29]">
                    Holistic Benefits
                  </h2>
                  <div className="space-y-2">
                    {asana.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 4. CONTRAINDICATIONS VIEW --- */}
              {activeSection === 'contraindications' && (
                <div className="space-y-3 text-xs">
                  <h2 className="font-display text-lg font-bold text-[#944426] dark:text-amber-400">
                    Precautions & Contraindications
                  </h2>
                  <div className="space-y-2">
                    {asana.contraindications.map((c, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 5. DRISHTI / POSITION / SIGNIFICANCE VIEWS --- */}
              {(activeSection === 'drishti' || activeSection === 'position' || activeSection === 'significance' || activeSection === 'steps' || activeSection === 'breath') && (
                <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
                  <h2 className="font-display text-lg font-bold text-[#00381F] dark:text-[#D9AE29] capitalize">
                    {activeSection} Details
                  </h2>
                  <p className="leading-relaxed">
                    {activeSection === 'drishti' && asana.drishti}
                    {activeSection === 'significance' && asana.historyAndSignificance}
                    {activeSection === 'position' && asana.fullDescription}
                    {activeSection === 'steps' && activeStepData.instruction}
                    {activeSection === 'breath' && asana.breathPattern.description}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Carousel Pagination for Chakras (< • ○ ○ ○ ○ ○ ○ >) */}
            {activeSection === 'chakra' && (
              <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/10">
                <button
                  onClick={() => setSelectedChakraIndex((i) => (i > 0 ? i - 1 : ALL_CHAKRAS.length - 1))}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {ALL_CHAKRAS.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChakraIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        selectedChakraIndex === idx
                          ? 'w-5 bg-purple-500 dark:bg-purple-400'
                          : 'bg-black/20 dark:bg-white/20 hover:bg-black/40'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setSelectedChakraIndex((i) => (i < ALL_CHAKRAS.length - 1 ? i + 1 : 0))}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* RIGHT ORBITAL DOCK (5 Cards when Inspector is closed) */
          <div className="col-span-12 sm:col-span-4 lg:col-span-2 flex flex-col gap-2 z-20">
            
            {/* Card 1: Benefits */}
            <button
              id="orbital-card-benefits"
              onClick={() => handleSelectSection('benefits')}
              className="group flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#071912]/80 border border-black/10 dark:border-white/10 hover:border-emerald-400/60 backdrop-blur-xl text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/30 shrink-0 group-hover:scale-108 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs text-[#00381F] dark:text-[#F5EFE5]">Benefits</div>
                <div className="text-[10px] opacity-70 font-sans">Physical & Mental</div>
              </div>
            </button>

            {/* Card 2: Contraindications */}
            <button
              id="orbital-card-contra"
              onClick={() => handleSelectSection('contraindications')}
              className="group flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#071912]/80 border border-black/10 dark:border-white/10 hover:border-red-400/60 backdrop-blur-xl text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/30 shrink-0 group-hover:scale-108 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs text-[#00381F] dark:text-[#F5EFE5]">Contraindications</div>
                <div className="text-[10px] opacity-70 font-sans">Precautions</div>
              </div>
            </button>

            {/* Card 3: Breath */}
            <button
              id="orbital-card-breath"
              onClick={() => handleSelectSection('breath')}
              className="group flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#071912]/80 border border-black/10 dark:border-white/10 hover:border-blue-400/60 backdrop-blur-xl text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center border border-blue-500/30 shrink-0 group-hover:scale-108 transition-transform">
                <Wind className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs text-[#00381F] dark:text-[#F5EFE5]">Breath</div>
                <div className="text-[10px] opacity-70 font-sans">Inhale & Exhale</div>
              </div>
            </button>

            {/* Card 4: AI Explanation */}
            <button
              id="orbital-card-ai"
              onClick={() => setIsAIOpen(true)}
              className="group flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#071912]/80 border border-black/10 dark:border-white/10 hover:border-purple-400/60 backdrop-blur-xl text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-500/30 shrink-0 group-hover:scale-108 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs text-[#00381F] dark:text-[#F5EFE5]">AI Explanation</div>
                <div className="text-[10px] opacity-70 font-sans">AI Yoga Guide</div>
              </div>
            </button>

            {/* Card 5: Significance */}
            <button
              id="orbital-card-significance"
              onClick={() => handleSelectSection('significance')}
              className="group flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-[#071912]/80 border border-black/10 dark:border-white/10 hover:border-amber-400/60 backdrop-blur-xl text-left transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-500/30 shrink-0 group-hover:scale-108 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-display font-bold text-xs text-[#00381F] dark:text-[#F5EFE5]">Significance</div>
                <div className="text-[10px] opacity-70 font-sans">History & Meaning</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 3. BOTTOM PRACTICE HUD (Step Timeline Scrubber + Telemetry Stats Grid) */}
      <div className="grid grid-cols-12 gap-3 z-20">
        
        {/* Left Step Timeline & Thumbnails Strip */}
        <div className="col-span-12 lg:col-span-8 p-3.5 sm:p-4 rounded-3xl bg-white/70 dark:bg-[#071912]/80 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Step Info Box */}
          <div className="w-full md:w-60 shrink-0 space-y-2">
            <div className="font-mono text-xs font-bold text-[#944426] dark:text-[#D9AE29]">
              Step 0{currentStepIndex + 1} <span className="opacity-40">/ 07</span>
            </div>
            <div className="text-xs font-sans text-stone-700 dark:text-stone-300 line-clamp-2">
              {activeStepData.instruction}
            </div>

            {/* Prev / Next Step Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                id="step-prev-btn"
                disabled={currentStepIndex === 0}
                onClick={() => handleStepClick(currentStepIndex - 1)}
                className="px-3 py-1 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold disabled:opacity-30 hover:bg-black/10 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                id="step-next-btn"
                disabled={currentStepIndex === 6}
                onClick={() => handleStepClick(currentStepIndex + 1)}
                className="px-3.5 py-1 rounded-xl bg-[#944426] dark:bg-[#D9AE29] text-white dark:text-[#00381F] text-xs font-bold shadow-sm disabled:opacity-30 hover:scale-103 transition-transform cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {/* 7-Step Sequence Strip */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto w-full pb-1">
            {stepsList.map((stepItem, idx) => {
              const isCurrent = currentStepIndex === idx;
              return (
                <button
                  key={stepItem.stepNumber}
                  id={`step-thumbnail-${stepItem.stepNumber}`}
                  onClick={() => handleStepClick(idx)}
                  className={`flex-1 min-w-[72px] p-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                    isCurrent
                      ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#00381F]/90 border-2 border-[#944426] dark:border-[#D9AE29] shadow-lg scale-103'
                      : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-stone-600 dark:text-stone-300 border border-transparent'
                  }`}
                >
                  {/* Miniature Yoga Silhouette Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isCurrent ? 'bg-[#944426] dark:bg-[#D9AE29] text-white dark:text-[#00381F]' : 'bg-black/10 dark:bg-white/10 text-stone-400'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  
                  <div className="font-mono text-[10px] font-bold opacity-70">
                    {stepItem.stepNumber}
                  </div>
                  <div className="font-sans text-[10px] font-bold truncate max-w-[70px]">
                    {stepItem.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2x3 Telemetry Stats Grid Card */}
        <div className="col-span-12 lg:col-span-4 p-3.5 sm:p-4 rounded-3xl bg-white/70 dark:bg-[#071912]/80 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/20 shadow-xl grid grid-cols-3 gap-2 text-xs">
          
          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              Level
            </div>
            <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
              {asana.difficulty}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
              <User className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              Type
            </div>
            <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
              {asana.category}
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              Duration
            </div>
            <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
              30–60 sec
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              Intensity
            </div>
            <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
              Medium
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
              <Target className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              Focus Area
            </div>
            <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
              Legs, Hips, Core
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1">
            <div className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
              Energy
            </div>
            <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
              Builds Strength
            </div>
          </div>
        </div>
      </div>

      {/* AI Yoga Teacher Modal */}
      <AIYogaTeacherModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        asana={asana}
      />
    </div>
  );
};
