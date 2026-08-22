import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Activity, Shield, Wind } from 'lucide-react';
import { YogaHumanCanvas } from './3d/YogaHumanCanvas';
import { ASANAS } from '../data/asanas';
import { Asana, VisualLayerType } from '../types';

interface HeroScrollExperienceProps {
  onSelectAsana: (asana: Asana) => void;
  onExploreLibrary: () => void;
  isDark: boolean;
}

export const HeroScrollExperience: React.FC<HeroScrollExperienceProps> = ({
  onSelectAsana,
  onExploreLibrary,
  isDark,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStoryStage, setActiveStoryStage] = useState(0);

  // Pick demo asanas for scroll transitions - showcasing Tree Pose (Vrikshasana) as centerpiece
  const treePoseAsana = ASANAS.find((a) => a.slug === 'vrikshasana') || ASANAS[0];
  const warriorAsana = ASANAS.find((a) => a.slug === 'virabhadrasana-2') || ASANAS[0];
  const tadasanaAsana = ASANAS.find((a) => a.slug === 'tadasana') || ASANAS[1];

  // Scroll listener to update cinematic stage (0 to 8)
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const totalHeight = containerRef.current.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = Math.max(0, Math.min(1, currentScroll / (totalHeight || 1)));
      setScrollProgress(progress);

      // Determine stage
      const stage = Math.min(8, Math.floor(progress * 9));
      setActiveStoryStage(stage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute 3D parameters based on scroll stage
  const getActiveLayer = (): VisualLayerType => {
    if (activeStoryStage >= 4 && activeStoryStage <= 5) return 'muscles';
    if (activeStoryStage === 6) return 'chakras';
    if (activeStoryStage === 7) return 'breath';
    return 'skin';
  };

  const getActiveAsana = (): Asana => {
    // Keep Tree Pose (Vrikshasana) as the primary focal 3D model throughout the hero journey
    return treePoseAsana;
  };

  const handleStartExplore = () => {
    onExploreLibrary();
  };

  return (
    <div ref={containerRef} className="relative w-full bg-[#F5EFE5] dark:bg-[#06140e] text-[#272727] dark:text-[#F5EFE5] transition-colors duration-500">
      
      {/* Pinned Sticky 3D Human Viewport */}
      <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden z-10 pointer-events-none">
        
        {/* Subtle Ambient Background Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-[#F5EFE5]/40 to-[#F5EFE5] dark:via-[#06140e]/40 dark:to-[#06140e] z-0" />

        {/* 3D Human Anatomy Model Canvas (Pointer enabled for direct 360° drag) */}
        <div className="relative w-full h-full max-w-6xl max-h-[900px] flex items-center justify-center pointer-events-auto">
          <YogaHumanCanvas
            asana={getActiveAsana()}
            activeLayer={getActiveLayer()}
            isDark={isDark}
            autoRotate={activeStoryStage < 2}
            isBreathingActive={activeStoryStage === 7}
            showOrbitalTelemetry={false}
            className="w-full h-full"
          />
        </div>

        {/* Large Cinematic Typography Overlay (Changes based on stage 0-8) */}
        <div className="absolute top-24 left-8 md:left-16 pointer-events-none z-20 max-w-lg">
          {activeStoryStage === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#944426]/10 dark:bg-[#D9AE29]/20 border border-[#944426]/20 dark:border-[#D9AE29]/30 text-[#944426] dark:text-[#D9AE29] text-xs uppercase tracking-widest font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Hyper-Realistic 3D Yoga Anatomy
              </div>
              <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight text-[#00381F] dark:text-[#F5EFE5] leading-[0.95]">
                YOGA, SEEN FROM WITHIN.
              </h1>
              <p className="font-accent italic text-xl sm:text-2xl text-[#944426] dark:text-[#D9AE29]">
                Explore every asana through 3D kinematics, écorché muscle activation, and conscious breath.
              </p>
            </motion.div>
          )}

          {activeStoryStage === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[#944426] dark:text-[#D9AE29]">
                Stage 01 &bull; Unilateral Rooting
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold text-[#00381F] dark:text-[#F5EFE5]">
                VRIKSHASANA ROOTING
              </h2>
              <p className="text-sm font-sans-ui text-[#272727]/80 dark:text-[#F5EFE5]/80 max-w-sm">
                The grounded foot acts as a living root, dispersing gravitational force evenly across the tripod of the sole.
              </p>
            </motion.div>
          )}

          {activeStoryStage === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[#944426] dark:text-[#D9AE29]">
                Stage 02 &bull; 360° Spatial Depth
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold text-[#00381F] dark:text-[#F5EFE5]">
                EXPLORE IN 360°
              </h2>
              <p className="text-sm font-sans-ui text-[#272727]/80 dark:text-[#F5EFE5]/80 max-w-sm">
                Orbit around the anatomical structure in real time to inspect hip abduction and pelvic leveling.
              </p>
            </motion.div>
          )}

          {activeStoryStage === 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[#944426] dark:text-[#D9AE29]">
                Stage 03 &bull; Anjali Mudra
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold text-[#00381F] dark:text-[#F5EFE5]">
                HEART & BRANCHES
              </h2>
              <p className="font-accent italic text-xl text-[#944426] dark:text-[#D9AE29]">
                Palms gather at heart center to stabilize the midline and expand upward.
              </p>
            </motion.div>
          )}

          {activeStoryStage >= 4 && activeStoryStage <= 5 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[#944426] dark:text-[#D9AE29]">
                Stage 04 &bull; Écorché Anatomy
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold text-[#00381F] dark:text-[#F5EFE5]">
                MUSCLE ACTIVATION
              </h2>
              <p className="text-sm font-sans-ui text-[#272727]/80 dark:text-[#F5EFE5]/80 max-w-sm">
                Active isometric tension lights up the Peroneals (95%), Standing Gluteus Medius (90%), and Deep Rotators (80%).
              </p>
            </motion.div>
          )}

          {activeStoryStage === 6 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[#D9AE29]">
                Stage 05 &bull; Subtle Body
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold text-[#00381F] dark:text-[#F5EFE5]">
                CHAKRA CURRENTS
              </h2>
              <p className="text-sm font-sans-ui text-[#272727]/80 dark:text-[#F5EFE5]/80 max-w-sm">
                Muladhara anchors the standing sole to the earth, Anahata opens the chest, and Ajna stabilizes unbroken Drishti.
              </p>
            </motion.div>
          )}

          {activeStoryStage === 7 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[#3182CE]">
                Stage 06 &bull; Breath Synchronicity
              </div>
              <h2 className="font-display text-4xl sm:text-6xl font-bold text-[#00381F] dark:text-[#F5EFE5]">
                BREATHE WITH PURPOSE
              </h2>
              <p className="text-sm font-sans-ui text-[#272727]/80 dark:text-[#F5EFE5]/80 max-w-sm">
                Quiet nasal breathing balances autonomic tone, harmonizing micro-adjustments in the standing ankle.
              </p>
            </motion.div>
          )}
        </div>

        {/* Scroll Progress Indicator on the Right */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-30 pointer-events-auto">
          {['Stand', 'Depth', 'Morph', 'Anatomy', 'Muscles', 'Energy', 'Breath', 'Enter'].map((label, idx) => (
            <button
              key={label}
              id={`scroll-step-dot-${idx}`}
              onClick={() => {
                const targetY = (idx / 7) * ((containerRef.current?.scrollHeight || 3000) - window.innerHeight);
                window.scrollTo({ top: targetY, behavior: 'smooth' });
              }}
              className="group flex items-center gap-2 focus:outline-none"
            >
              <span className={`text-[10px] uppercase font-mono tracking-widest transition-opacity hidden md:inline ${
                activeStoryStage === idx ? 'opacity-100 font-bold text-[#00381F] dark:text-[#D9AE29]' : 'opacity-30 group-hover:opacity-70'
              }`}>
                {label}
              </span>
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeStoryStage === idx
                  ? 'bg-[#944426] dark:bg-[#D9AE29] scale-125 ring-2 ring-[#00381F]/20 dark:ring-[#D9AE29]/40'
                  : 'bg-black/20 dark:bg-white/20 hover:bg-black/40'
              }`} />
            </button>
          ))}
        </div>

        {/* Bottom Scroll Prompt */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto">
          {activeStoryStage === 0 ? (
            <button
              id="scroll-discover-btn"
              onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] text-xs font-semibold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
            >
              <span>Scroll to Discover</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#272727]/60 dark:text-[#F5EFE5]/60 bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
              Scroll Progress &bull; {Math.round(scrollProgress * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Invisible Scroll Track Spacer defining the scroll length */}
      <div className="relative z-0 h-[450vh] pointer-events-none" />

      {/* Post-Scroll Featured Section */}
      <section className="relative z-20 px-6 sm:px-12 py-24 bg-[#F5EFE5] dark:bg-[#061e13] border-t border-[#00381F]/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Featured 3D Asana Cards Grid */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-mono text-[#944426] dark:text-[#D9AE29] font-semibold">
                  Interactive Library
                </span>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#00381F] dark:text-[#F5EFE5]">
                  EXPLORE THE ASANA COLLECTION
                </h3>
              </div>

              <button
                id="view-all-library-btn"
                onClick={handleStartExplore}
                className="self-start md:self-auto flex items-center gap-2 px-6 py-3 rounded-full bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] font-semibold text-sm hover:scale-105 transition-all shadow-md"
              >
                <span>Explore All Asanas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                ASANAS.find((a) => a.slug === 'vrikshasana') || ASANAS[0],
                ASANAS.find((a) => a.slug === 'virabhadrasana-2') || ASANAS[0],
                ASANAS.find((a) => a.slug === 'adho-mukha-svanasana') || ASANAS[1],
              ].map((asana, idx) => (
                <div
                  key={asana.id}
                  id={`featured-card-${asana.slug}`}
                  onClick={() => onSelectAsana(asana)}
                  className="group relative rounded-3xl bg-white/80 dark:bg-[#071912]/80 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/25 overflow-hidden hover:shadow-2xl hover:border-[#944426] dark:hover:border-[#D9AE29] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Card Image Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-black/20">
                    {asana.imageUrl && (
                      <img
                        src={asana.imageUrl}
                        alt={asana.englishName}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
                    
                    {idx === 0 && (
                      <div className="absolute top-3 right-3 px-3 py-0.5 rounded-full bg-[#944426] dark:bg-[#D9AE29] text-white dark:text-[#00381F] text-[10px] font-bold uppercase tracking-wider shadow-md z-10">
                        Featured 3D Asana
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00381F]/90 dark:bg-[#D9AE29]/90 text-[#F5EFE5] dark:text-[#00381F] text-[10px] font-mono font-bold uppercase backdrop-blur-md">
                        {asana.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/80 text-[#272727] dark:text-[#F5EFE5] text-[10px] font-mono font-bold backdrop-blur-md">
                        {asana.difficulty}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-3 z-10 text-white/90 font-sans text-xs font-medium">
                      {asana.sanskritScript}
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="font-display text-2xl font-bold text-[#00381F] dark:text-[#F5EFE5] group-hover:text-[#944426] dark:group-hover:text-[#D9AE29] transition-colors">
                      {asana.englishName}
                    </h4>
                    
                    <div className="font-accent italic text-base text-[#944426] dark:text-[#D9AE29] mt-0.5">
                      {asana.sanskritName}
                    </div>

                    <p className="text-xs font-sans-ui text-[#272727]/80 dark:text-[#F5EFE5]/80 mt-3 line-clamp-2">
                      {asana.shortDescription}
                    </p>

                    <div className="mt-5 pt-4 border-t border-[#00381F]/10 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-[#272727]/70 dark:text-[#F5EFE5]/70">
                        <Activity className="w-3.5 h-3.5 text-[#944426] dark:text-[#D9AE29]" />
                        <span>{asana.muscles.length} Muscle Groups</span>
                      </div>

                      <span className="flex items-center gap-1 text-xs font-bold text-[#00381F] dark:text-[#D9AE29] group-hover:translate-x-1 transition-transform">
                        Enter Studio &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Highlights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            <div className="p-5 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#944426]/15 dark:bg-[#944426]/30 flex items-center justify-center text-[#944426] dark:text-[#D9AE29]">
                <Activity className="w-4 h-4" />
              </div>
              <h5 className="font-display font-bold text-sm text-[#00381F] dark:text-[#F5EFE5]">Muscular Kinesiology</h5>
              <p className="text-xs text-[#272727]/70 dark:text-[#F5EFE5]/70">Real-time activation percentages and joint biomechanics.</p>
            </div>

            <div className="p-5 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#D9AE29]/15 dark:bg-[#D9AE29]/30 flex items-center justify-center text-[#D9AE29]">
                <Shield className="w-4 h-4" />
              </div>
              <h5 className="font-display font-bold text-sm text-[#00381F] dark:text-[#F5EFE5]">7 Chakra Vortices</h5>
              <p className="text-xs text-[#272727]/70 dark:text-[#F5EFE5]/70">Sushumna Nadi alignments and Solfeggio frequencies.</p>
            </div>

            <div className="p-5 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#3182CE]/15 dark:bg-[#3182CE]/30 flex items-center justify-center text-[#3182CE]">
                <Wind className="w-4 h-4" />
              </div>
              <h5 className="font-display font-bold text-sm text-[#00381F] dark:text-[#F5EFE5]">Pranayama Guidance</h5>
              <p className="text-xs text-[#272727]/70 dark:text-[#F5EFE5]/70">Inhale, retain, and exhale cues synchronized with steps.</p>
            </div>

            <div className="p-5 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#00381F]/15 dark:bg-[#D9AE29]/30 flex items-center justify-center text-[#00381F] dark:text-[#D9AE29]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h5 className="font-display font-bold text-sm text-[#00381F] dark:text-[#F5EFE5]">AI Yoga Teacher</h5>
              <p className="text-xs text-[#272727]/70 dark:text-[#F5EFE5]/70">Ask Gemini anything about modifications, cues, and anatomy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
