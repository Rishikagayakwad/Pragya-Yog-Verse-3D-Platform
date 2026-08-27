import React from 'react';
import { 
  Sparkles, 
  Activity, 
  Heart, 
  AlertTriangle, 
  Wind, 
  BookOpen, 
  Eye, 
  Compass, 
  Layers, 
  X, 
  ChevronLeft, 
  ChevronRight,
  User,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';
import type { Asana, ActiveStudioSection, MuscleActivation, ChakraInfo } from '../../types';
import { ALL_CHAKRAS } from '../../data/asanas';

interface FeatureInspectorPanelProps {
  asana: Asana;
  activeSection: ActiveStudioSection;
  selectedMuscle: MuscleActivation | null;
  selectedChakraIndex: number;
  onClose: () => void;
  onSelectMuscle: (muscle: MuscleActivation) => void;
  onSelectChakraIndex: (index: number | ((prev: number) => number)) => void;
  onSetLayer: (layer: 'chakras' | 'muscles' | 'breath' | 'skin') => void;
}

export const FeatureInspectorPanel: React.FC<FeatureInspectorPanelProps> = ({
  asana,
  activeSection,
  selectedMuscle,
  selectedChakraIndex,
  onClose,
  onSelectMuscle,
  onSelectChakraIndex,
  onSetLayer,
}) => {
  const selectedChakra: ChakraInfo = ALL_CHAKRAS[selectedChakraIndex] || ALL_CHAKRAS[0];

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'chakra': return 'Chakra Energy Center';
      case 'muscles': return 'Muscular Activation';
      case 'benefits': return 'Holistic Benefits';
      case 'contraindications': return 'Precautions & Contraindications';
      case 'breath': return 'Pranayama Breath Guidance';
      case 'significance': return 'History & Significance';
      case 'drishti': return 'Drishti Point of Focus';
      case 'position': return 'Alignment & Position';
      case 'steps': return 'Pose Step Sequence';
      default: return 'Anatomical Intelligence';
    }
  };

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'chakra': return <Sparkles className="w-4 h-4 text-[#620513] dark:text-[#D9AE29]" />;
      case 'muscles': return <Activity className="w-4 h-4 text-[#944426] dark:text-[#D9AE29]" />;
      case 'benefits': return <Heart className="w-4 h-4 text-[#00381F] dark:text-[#D9AE29]" />;
      case 'contraindications': return <AlertTriangle className="w-4 h-4 text-[#944426] dark:text-[#D9AE29]" />;
      case 'breath': return <Wind className="w-4 h-4 text-[#9D9D48] dark:text-[#D9AE29]" />;
      case 'significance': return <BookOpen className="w-4 h-4 text-[#D9AE29]" />;
      case 'drishti': return <Eye className="w-4 h-4 text-[#00381F] dark:text-[#D9AE29]" />;
      case 'position': return <Compass className="w-4 h-4 text-[#00381F] dark:text-[#D9AE29]" />;
      case 'steps': return <Layers className="w-4 h-4 text-[#944426] dark:text-[#D9AE29]" />;
      default: return <Info className="w-4 h-4 text-[#00381F] dark:text-[#D9AE29]" />;
    }
  };

  return (
    <div 
      id="studio-inspector-panel"
      className="w-full h-full rounded-2xl sm:rounded-3xl bg-[#FAF6F0]/95 dark:bg-[#071912]/95 backdrop-blur-2xl border border-[#00381F]/15 dark:border-[#D9AE29]/25 shadow-xl p-4 sm:p-5 flex flex-col justify-between gap-4 z-30 animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto text-[#272727] dark:text-[#F5EFE5]"
    >
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#00381F]/10 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-[#002816] flex items-center justify-center border border-[#00381F]/15 dark:border-[#D9AE29]/30 shadow-inner">
            {getSectionIcon()}
          </div>
          <div>
            <div className="font-display font-bold text-sm text-[#00381F] dark:text-[#F5EFE5] capitalize">
              {getSectionTitle()}
            </div>
            <div className="text-[10px] text-[#944426] dark:text-[#D9AE29] font-mono">
              {activeSection === 'chakra' ? '7 Metaphysical Centers' : 'Kinesiological Analysis'}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          id="close-inspector-btn"
          onClick={onClose}
          aria-label="Close Inspector Panel"
          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#272727]/60 dark:text-[#F5EFE5]/60 hover:text-[#00381F] dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        
        {/* --- 1. CHAKRA INSPECTOR VIEW --- */}
        {activeSection === 'chakra' && (
          <div className="space-y-4">
            {/* Chakra Name & Sacred Geometry Mandala Visual */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#620513]/10 dark:bg-[#620513]/25 border border-[#620513]/20 dark:border-[#620513]/40">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#620513] dark:text-[#D9AE29]">
                  {selectedChakra.sanskritName}
                </h2>
                <div className="text-sm font-semibold text-[#00381F] dark:text-[#F5EFE5]">
                  {selectedChakra.englishName}
                </div>
                <div className="text-xs font-accent italic text-[#944426] dark:text-[#D9AE29] mt-0.5">
                  Bīja Mantra: <span className="font-bold">{selectedChakra.bijaMantra}</span>
                </div>
              </div>

              {/* Sacred Yantra SVG Mandala Visual */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/80 dark:bg-[#071912] border border-[#620513]/30 dark:border-[#D9AE29]/40 flex items-center justify-center p-2 shadow-inner shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#620513] dark:text-[#D9AE29] animate-spin-slow">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="50,15 80,70 20,70" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="50,85 80,30 20,30" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="absolute font-bold text-xs text-[#620513] dark:text-[#D9AE29] font-serif">
                  {selectedChakra.bijaMantra.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Chakra Metadata Attribute List */}
            <div className="space-y-2 text-xs text-[#272727] dark:text-[#F5EFE5]">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20">
                <span className="w-5 h-5 rounded-md bg-[#620513]/15 text-[#620513] dark:text-[#D9AE29] flex items-center justify-center text-[10px] shrink-0 mt-0.5">📍</span>
                <div>
                  <span className="font-bold text-[#00381F] dark:text-[#F5EFE5]">Location:</span> {selectedChakra.location}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20">
                <span className="w-5 h-5 rounded-md bg-[#944426]/15 text-[#944426] dark:text-[#D9AE29] flex items-center justify-center text-[10px] shrink-0 mt-0.5">🔺</span>
                <div>
                  <span className="font-bold text-[#00381F] dark:text-[#F5EFE5]">Element:</span> {selectedChakra.element}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20">
                <span className="w-5 h-5 rounded-md bg-[#9D9D48]/20 text-[#00381F] dark:text-[#D9AE29] flex items-center justify-center text-[10px] shrink-0 mt-0.5">🎨</span>
                <div>
                  <span className="font-bold text-[#00381F] dark:text-[#F5EFE5]">Color:</span> {selectedChakra.color}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20">
                <span className="w-5 h-5 rounded-md bg-[#D9AE29]/20 text-[#944426] dark:text-[#D9AE29] flex items-center justify-center text-[10px] shrink-0 mt-0.5">⚙</span>
                <div>
                  <span className="font-bold text-[#00381F] dark:text-[#F5EFE5]">Qualities:</span> {selectedChakra.activationRole}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20">
                <span className="w-5 h-5 rounded-md bg-[#00381F]/15 text-[#00381F] dark:text-[#D9AE29] flex items-center justify-center text-[10px] shrink-0 mt-0.5">🕊</span>
                <div>
                  <span className="font-bold text-[#00381F] dark:text-[#F5EFE5]">When Active:</span> {selectedChakra.meaning}
                </div>
              </div>
            </div>

            {/* View in Body Button */}
            <button
              id="chakra-view-body-btn"
              onClick={() => onSetLayer('chakras')}
              className="w-full py-2.5 rounded-xl bg-[#00381F] hover:bg-[#002816] text-[#F5EFE5] border border-[#00381F] dark:border-[#D9AE29]/40 flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#D9AE29]" />
              <span>View in 3D Body Model</span>
            </button>
          </div>
        )}

        {/* --- 2. MUSCLES INSPECTOR VIEW --- */}
        {activeSection === 'muscles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#944426]/10 dark:bg-[#944426]/25 border border-[#944426]/20 dark:border-[#944426]/40">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#944426] dark:text-[#D9AE29]">
                  {selectedMuscle?.name || 'Primary Activated Muscles'}
                </h2>
                <div className="text-xs font-mono text-[#272727]/70 dark:text-[#F5EFE5]/70">
                  {selectedMuscle?.latinName || 'Kinesiology Activation'}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#944426] text-white text-xs font-bold font-mono shadow-sm">
                {selectedMuscle?.percentage || 85}%
              </span>
            </div>

            {/* Percentage Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#272727]/70 dark:text-[#F5EFE5]/70">
                <span>Activation Intensity</span>
                <span className="text-[#944426] dark:text-[#D9AE29] font-bold">{selectedMuscle?.percentage || 85}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden border border-[#00381F]/10 dark:border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-[#944426] to-[#D9AE29] transition-all duration-300"
                  style={{ width: `${selectedMuscle?.percentage || 85}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#272727] dark:text-[#F5EFE5]">
              <p className="leading-relaxed">{selectedMuscle?.description || asana.fullDescription}</p>
              <div className="p-3 rounded-xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20">
                <span className="font-bold text-[#944426] dark:text-[#D9AE29]">Biomechanical Role: </span>
                {selectedMuscle?.biomechanics || 'Provides isometric stabilization and active pelvic articulation.'}
              </div>
            </div>

            {/* Muscle Selector Pills */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-mono uppercase font-bold text-[#944426] dark:text-[#D9AE29]">All Muscles in Pose:</div>
              <div className="flex flex-wrap gap-1.5">
                {asana.muscles.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMuscle(m);
                      onSetLayer('muscles');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                      selectedMuscle?.id === m.id
                        ? 'bg-[#944426] text-white font-bold shadow-sm'
                        : 'bg-white/70 dark:bg-[#002816]/70 text-[#272727] dark:text-[#F5EFE5] hover:bg-white border border-[#00381F]/10 dark:border-[#D9AE29]/20'
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
              Holistic Physiological & Mental Benefits
            </h2>
            <div className="space-y-2">
              {asana.benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#00381F]/10 dark:bg-[#00381F]/25 border border-[#00381F]/20 dark:border-[#00381F]/40 text-[#00381F] dark:text-[#F5EFE5]">
                  <CheckCircle2 className="w-4 h-4 text-[#00381F] dark:text-[#D9AE29] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 4. CONTRAINDICATIONS VIEW --- */}
        {activeSection === 'contraindications' && (
          <div className="space-y-3 text-xs">
            <h2 className="font-display text-lg font-bold text-[#620513] dark:text-[#D9AE29]">
              Precautions & Contraindications
            </h2>
            <div className="space-y-2">
              {asana.contraindications.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#620513]/10 dark:bg-[#620513]/25 border border-[#620513]/20 dark:border-[#620513]/40 text-[#620513] dark:text-[#F5EFE5]">
                  <AlertTriangle className="w-4 h-4 text-[#620513] dark:text-[#D9AE29] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 5. BREATH VIEW --- */}
        {activeSection === 'breath' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-[#9D9D48]/15 dark:bg-[#9D9D48]/25 border border-[#9D9D48]/25 space-y-1">
              <div className="font-display text-base font-bold text-[#00381F] dark:text-[#D9AE29]">
                {asana.breathPattern?.name || 'Pranayama Synchronicity'}
              </div>
              <div className="font-mono text-[11px] text-[#944426] dark:text-[#D9AE29] font-bold">
                Ratio: {asana.breathPattern?.ratio || '4:2:4:2'}
              </div>
              <p className="text-[#272727] dark:text-[#F5EFE5] text-[11px] pt-1">
                {asana.breathPattern?.description || 'Sync each posture transition with smooth, continuous diaphragmatic expansion.'}
              </p>
            </div>

            {/* Breath Phases */}
            {asana.breathPattern?.phases && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase font-bold text-[#944426] dark:text-[#D9AE29]">Breath Phases:</div>
                {asana.breathPattern.phases.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20 space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#00381F] dark:text-[#F5EFE5]">
                      <span className="text-[#00381F] dark:text-[#D9AE29]">{p.phase}</span>
                      <span className="font-mono text-[11px] text-[#944426] dark:text-[#D9AE29]">{p.duration}s</span>
                    </div>
                    <p className="text-[#272727]/80 dark:text-[#F5EFE5]/80 text-[11px]">{p.instructions}</p>
                    <div className="text-[10px] text-[#944426] dark:text-[#D9AE29] font-mono">
                      Diaphragm: {p.diaphragmAction}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onSetLayer('breath')}
              className="w-full py-2.5 rounded-xl bg-[#00381F] hover:bg-[#002816] text-[#F5EFE5] border border-[#00381F] dark:border-[#D9AE29]/40 flex items-center justify-center gap-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Wind className="w-3.5 h-3.5 text-[#D9AE29]" />
              <span>Simulate Breath Expansion in 3D</span>
            </button>
          </div>
        )}

        {/* --- 6. SIGNIFICANCE / DRISHTI / POSITION VIEWS --- */}
        {(activeSection === 'significance' || activeSection === 'drishti' || activeSection === 'position' || activeSection === 'steps') && (
          <div className="space-y-3 text-xs text-[#272727] dark:text-[#F5EFE5]">
            <h2 className="font-display text-lg font-bold text-[#00381F] dark:text-[#D9AE29] capitalize">
              {activeSection} Intelligence
            </h2>
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20 leading-relaxed space-y-2">
              {activeSection === 'significance' && (
                <>
                  <p>{asana.historyAndSignificance}</p>
                  <div className="pt-2 text-[11px] text-[#944426] dark:text-[#D9AE29] font-mono">
                    Etymology: {asana.meaning}
                  </div>
                </>
              )}
              {activeSection === 'drishti' && (
                <>
                  <div className="font-bold text-[#00381F] dark:text-[#D9AE29] text-sm">{asana.drishti}</div>
                  <p>
                    Drishti provides ocular focus and pratyahara (sensory withdrawal), anchoring somatic equilibrium and calming parasympathetic tone.
                  </p>
                </>
              )}
              {activeSection === 'position' && (
                <>
                  <p>{asana.fullDescription}</p>
                  <div className="pt-2 text-[#944426] dark:text-[#D9AE29] font-mono text-[11px]">
                    Category: {asana.category} &bull; Difficulty: {asana.difficulty}
                  </div>
                </>
              )}
              {activeSection === 'steps' && (
                <p>{asana.shortDescription || 'Follow the interactive playback timeline below to step through posture progression.'}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Chakra Bottom Carousel Navigation */}
      {activeSection === 'chakra' && (
        <div className="flex items-center justify-between pt-3 border-t border-[#00381F]/10 dark:border-white/10 shrink-0">
          <button
            onClick={() => onSelectChakraIndex((i) => (i > 0 ? i - 1 : ALL_CHAKRAS.length - 1))}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#272727]/70 dark:text-[#F5EFE5]/70 transition-colors cursor-pointer"
            aria-label="Previous Chakra"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {ALL_CHAKRAS.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => onSelectChakraIndex(idx)}
                aria-label={`Select ${c.sanskritName}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  selectedChakraIndex === idx
                    ? 'w-6 bg-[#620513] dark:bg-[#D9AE29] shadow-sm'
                    : 'w-2 bg-black/20 dark:bg-white/20 hover:bg-black/40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => onSelectChakraIndex((i) => (i < ALL_CHAKRAS.length - 1 ? i + 1 : 0))}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#272727]/70 dark:text-[#F5EFE5]/70 transition-colors cursor-pointer"
            aria-label="Next Chakra"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

