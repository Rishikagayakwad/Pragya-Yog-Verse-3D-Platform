import type { Asana } from '../types';

export const CHAKRAS_UNIVERSAL = {
  root: {
    id: 'muladhara',
    sanskritName: 'Muladhara',
    englishName: 'Root Chakra',
    location: 'Base of spine, pelvic floor',
    position3D: [0, 0.45, 0] as [number, number, number],
    color: '#E53E3E',
    element: 'Earth (Prithvi)',
    bijaMantra: 'LAM',
    meaning: 'Foundation, grounding, physical stability and survival instincts.',
    activationRole: 'Establishes foundational rooting through feet and pelvic floor.',
    frequency: 396,
  },
  sacral: {
    id: 'svadhisthana',
    sanskritName: 'Svadhisthana',
    englishName: 'Sacral Chakra',
    location: 'Lower abdomen, sacrum',
    position3D: [0, 0.65, 0] as [number, number, number],
    color: '#ED8936',
    element: 'Water (Jala)',
    bijaMantra: 'VAM',
    meaning: 'Creativity, fluidity, emotional equilibrium and adaptability.',
    activationRole: 'Opens pelvic girdle, hip flexors, and reproductive energetic center.',
    frequency: 417,
  },
  solarPlexus: {
    id: 'manipura',
    sanskritName: 'Manipura',
    englishName: 'Solar Plexus Chakra',
    location: 'Navel to solar plexus',
    position3D: [0, 0.88, 0] as [number, number, number],
    color: '#D9AE29',
    element: 'Fire (Agni)',
    bijaMantra: 'RAM',
    meaning: 'Willpower, transformation, digestive heat and personal power.',
    activationRole: 'Ignites core stability and abdominal containment (Uddiyana Bandha).',
    frequency: 528,
  },
  heart: {
    id: 'anahata',
    sanskritName: 'Anahata',
    englishName: 'Heart Chakra',
    location: 'Center of chest',
    position3D: [0, 1.12, 0] as [number, number, number],
    color: '#38A169',
    element: 'Air (Vayu)',
    bijaMantra: 'YAM',
    meaning: 'Compassion, unconditional love, balance between physical and spiritual.',
    activationRole: 'Expands thoracic cage, elevates sternum, and dissolves emotional armor.',
    frequency: 639,
  },
  throat: {
    id: 'vishuddha',
    sanskritName: 'Vishuddha',
    englishName: 'Throat Chakra',
    location: 'Throat, cervical spine',
    position3D: [0, 1.35, 0] as [number, number, number],
    color: '#3182CE',
    element: 'Space / Ether (Akasha)',
    bijaMantra: 'HAM',
    meaning: 'Authentic expression, truth, refined communication and clarity.',
    activationRole: 'Lengthens cervical spine and harmonizes Jalandhara Bandha.',
    frequency: 741,
  },
  thirdEye: {
    id: 'ajna',
    sanskritName: 'Ajna',
    englishName: 'Third Eye Chakra',
    location: 'Between the eyebrows, pineal center',
    position3D: [0, 1.52, 0.05] as [number, number, number],
    color: '#553C9A',
    element: 'Light (Jyoti)',
    bijaMantra: 'OM / AUM',
    meaning: 'Intuition, mental clarity, spiritual vision and inward concentration.',
    activationRole: 'Anchors the Drishti (gaze point) into concentrated awareness.',
    frequency: 852,
  },
  crown: {
    id: 'sahasrara',
    sanskritName: 'Sahasrara',
    englishName: 'Crown Chakra',
    location: 'Crown of the head',
    position3D: [0, 1.72, 0] as [number, number, number],
    color: '#805AD5',
    element: 'Pure Consciousness',
    bijaMantra: 'Silence / MAHA OM',
    meaning: 'Universal connection, supreme wisdom, self-transcendence.',
    activationRole: 'Elevates prana upward through the central nadi column.',
    frequency: 963,
  },
};

export const ASANAS: Asana[] = [
  {
    id: 'virabhadrasana-2',
    slug: 'virabhadrasana-2',
    englishName: 'Warrior II',
    sanskritName: 'Virabhadrasana II',
    sanskritScript: 'वीरभद्रासन II',
    pronunciation: 'veer-ah-bhu-DRAHS-uh-nuh',
    meaning: 'Named after Virabhadra, a fierce warrior born from the hair of Shiva. Symbolizes spiritual strength and intense focus.',
    category: 'Standing',
    difficulty: 'Intermediate',
    movementTypes: ['Strength', 'Balance', 'Mobility'],
    featured: true,
    imageUrl: '/images/warrior-2.jpg',
    shortDescription: 'A dynamic standing pose cultivating fierce concentration, pelvic stability, and deep leg endurance.',
    fullDescription: 'Warrior II (Virabhadrasana II) demands unwavering grounding and simultaneous chest opening. As the front knee bends directly over the ankle and arms extend parallel to the horizon, the practitioner balances opposing forces: rooting down through the earth while expanding horizontally into infinite space.',
    historyAndSignificance: 'In classical yogic myth, Virabhadra rose from the ground with swords in both hands. In the modern practice, this symbolizes conquering our own internal doubts, ego, and physical distraction through calm, sovereign breath.',
    drishti: 'Over middle fingertip of front hand (Angustha Ma Dyai)',
    benefits: [
      'Builds explosive isometric endurance in quadriceps, glutes, and hips',
      'Stimulates abdominal organs and strengthens respiratory diaphragm',
      'Improves circulation throughout the lower extremities and pelvis',
      'Develops somatic poise, spatial awareness, and grounded balance',
      'Relieves mild backaches by strengthening spinal extensor muscles'
    ],
    contraindications: [
      'Recent knee ligament injuries or active meniscus inflammation',
      'High blood pressure (keep hands on hips rather than elevated)',
      'Acute neck strain (keep head neutral instead of turning over front fingers)'
    ],
    muscles: [
      {
        id: 'quadriceps-front',
        name: 'Quadriceps (Front Leg)',
        latinName: 'Rectus Femoris, Vastus Lateralis/Medialis',
        role: 'primary',
        percentage: 92,
        position3D: [0.35, 0.45, 0.25],
        description: 'Holds the front knee in a 90-degree flexion, resisting gravitational collapse.',
        biomechanics: 'Generates eccentric and isometric quad tension to stabilize the femorotibial joint without letting the knee collapse inward.'
      },
      {
        id: 'gluteus-maximus',
        name: 'Gluteus Maximus & Medius',
        latinName: 'Gluteus Maximus, Gluteus Medius',
        role: 'primary',
        percentage: 88,
        position3D: [0.15, 0.62, -0.15],
        description: 'Externally rotates front hip and abducts rear leg, leveling the pelvis.',
        biomechanics: 'Contracts forcefully to open the pelvic bowl while anchoring the posterior outer edge of the back foot.'
      },
      {
        id: 'deltoids',
        name: 'Deltoids & Trapezius',
        latinName: 'Deltoideus anterior, medius, posterior',
        role: 'secondary',
        percentage: 75,
        position3D: [0, 1.25, 0],
        description: 'Maintains arm elevation parallel to the ground without creeping into neck tension.',
        biomechanics: 'Middle deltoids hold horizontal abduction while lower trapezius draws the scapulae down the dorsal ribcage.'
      },
      {
        id: 'erector-spinae',
        name: 'Erector Spinae & Core',
        latinName: 'Erector Spinae, Transversus Abdominis',
        role: 'stabilizer',
        percentage: 80,
        position3D: [0, 0.95, -0.1],
        description: 'Maintains vertical axial elongation and prevents forward torso leaning.',
        biomechanics: 'Co-activates with deep abdominal wall to stack the shoulders precisely over the pelvic center of gravity.'
      },
      {
        id: 'hamstrings-back',
        name: 'Hamstrings & Calves (Rear Leg)',
        latinName: 'Biceps Femoris, Gastrocnemius',
        role: 'secondary',
        percentage: 70,
        position3D: [-0.45, 0.4, -0.2],
        description: 'Anchors the straight back leg through the knife edge of the foot.',
        biomechanics: 'Stabilizes knee extension and prevents hyperextension through calf and hamstring co-contraction.'
      }
    ],
    chakras: [
      CHAKRAS_UNIVERSAL.root,
      CHAKRAS_UNIVERSAL.solarPlexus,
      CHAKRAS_UNIVERSAL.heart,
      CHAKRAS_UNIVERSAL.thirdEye
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Establish Wide Stance',
        subtitle: 'Foundational Rooting',
        instruction: 'Step your feet 3.5 to 4 feet apart along the length of your mat. Extend both arms outward parallel to the floor.',
        breathCue: 'Inhale',
        durationSeconds: 5,
        drishti: 'Forward at horizon',
        alignmentTips: [
          'Align front heel with the arch of your back foot',
          'Turn back foot slightly inward (about 15 degrees)',
          'Distribute weight evenly between both feet'
        ],
        commonMistake: 'Stance is too narrow, forcing the front knee past the toes.',
        modification: 'Shorten stance by 3-4 inches if hip flexors or groins feel strained.',
        cameraTarget: [0, 0.7, 0],
        cameraPosition: [0, 1.1, 2.8],
        highlightedMuscles: ['quadriceps-front', 'hamstrings-back']
      },
      {
        stepNumber: 2,
        title: 'Bend Front Knee to 90°',
        subtitle: 'Pelvic Engagement',
        instruction: 'Exhale and bend your front knee directly over your front ankle, sinking your hips until the thigh approaches parallel with the floor.',
        breathCue: 'Exhale',
        durationSeconds: 6,
        drishti: 'Forward',
        alignmentTips: [
          'Stack front knee directly over ankle—never let it cave inward',
          'Press firmly into the outer edge of the back foot',
          'Keep pelvis level, opening hips laterally'
        ],
        commonMistake: 'Torso leans forward over the front leg rather than staying vertically centered.',
        modification: 'Place front knee at 110-120 degrees if quad strength or hip mobility is developing.',
        cameraTarget: [0.2, 0.6, 0],
        cameraPosition: [1.2, 0.9, 2.2],
        highlightedMuscles: ['quadriceps-front', 'gluteus-maximus']
      },
      {
        stepNumber: 3,
        title: 'Extend Arms & Gaze (Drishti)',
        subtitle: 'Horizontal Expansion & Focus',
        instruction: 'Broaden your collarbones, actively reach fingertips in opposite directions, and turn your gaze serenely over the front middle finger.',
        breathCue: 'Inhale',
        durationSeconds: 15,
        drishti: 'Front middle fingertip',
        alignmentTips: [
          'Draw shoulder blades down and toward each other',
          'Keep wrists relaxed, palms facing down',
          'Soften facial muscles while keeping gaze steady'
        ],
        commonMistake: 'Shoulders creeping upward to crunch the neck.',
        modification: 'Turn palms upward briefly to reset shoulder sockets, then rotate palms down.',
        cameraTarget: [0, 1.1, 0],
        cameraPosition: [0.8, 1.3, 1.9],
        highlightedMuscles: ['deltoids', 'erector-spinae']
      },
      {
        stepNumber: 4,
        title: 'Sustain & Deepen Breath',
        subtitle: 'Static Equilibrium',
        instruction: 'Hold the pose for 5 smooth, rhythmic Ujjayi breaths. Feel the stillness within the effort.',
        breathCue: 'Hold',
        durationSeconds: 20,
        drishti: 'Unbroken concentration',
        alignmentTips: [
          'Maintain equal energetic reach through front and back arms',
          'Draw lower belly gently upward on each exhalation',
          'Feel the grounding earth element beneath both arches'
        ],
        commonMistake: 'Holding the breath or collapsing the back leg.',
        modification: 'Rest hands on hips for a breath if shoulders fatigue.',
        cameraTarget: [0, 0.8, 0],
        cameraPosition: [0, 1.0, 2.6],
        highlightedMuscles: ['quadriceps-front', 'gluteus-maximus', 'deltoids', 'erector-spinae']
      },
      {
        stepNumber: 5,
        title: 'Graceful Release',
        subtitle: 'Return to Center',
        instruction: 'Inhale, press firmly into the front foot to straighten the leg, lower arms, and step feet together into Tadasana.',
        breathCue: 'Inhale',
        durationSeconds: 5,
        drishti: 'Horizon',
        alignmentTips: [
          'Move with slow mindfulness rather than rushing',
          'Pause in Tadasana to observe asymmetric sensations between sides'
        ],
        commonMistake: 'Jarring the front knee on exit.',
        modification: 'Use a block or wall for balance support if feeling unsteady.',
        cameraTarget: [0, 0.9, 0],
        cameraPosition: [0, 1.2, 3.0],
        highlightedMuscles: ['quadriceps-front']
      }
    ],
    breathPattern: {
      name: 'Warrior Ujjayi Breath (Victorious Breath)',
      ratio: '4:2:4:2 (Box Resonance)',
      description: 'A gentle constriction in the glottis creates an ocean-like whisper, calming the nervous system while sustaining muscular power.',
      phases: [
        {
          phase: 'Inhale',
          duration: 4,
          instructions: 'Fill the ribcage 360 degrees, expanding lateral ribs and lifting the sternum without raising the shoulders.',
          diaphragmAction: 'Diaphragm contracts and descends, increasing intra-abdominal pressure to stabilize spine.'
        },
        {
          phase: 'Internal Retention',
          duration: 2,
          instructions: 'Pause in serene fullness, feeling energetic charge through the fingertips.',
          diaphragmAction: 'Diaphragm remains steady; oxygen diffusion peaks in pulmonary capillaries.'
        },
        {
          phase: 'Exhale',
          duration: 4,
          instructions: 'Release breath slowly, sinking deeper into hip flexion and grounding outer back heel.',
          diaphragmAction: 'Diaphragm ascends; transversus abdominis contracts toward spine.'
        },
        {
          phase: 'External Retention',
          duration: 2,
          instructions: 'Rest in pure stillness before the next inhalation begins.',
          diaphragmAction: 'Deep pelvic floor maintains subtle upward tone (Mula Bandha).'
        }
      ]
    },
    bodySystems: [
      {
        system: 'musculoskeletal',
        name: 'Musculoskeletal System',
        iconName: 'Activity',
        physiologicalEffect: 'Isometric strengthening of lower body motor units while increasing hip joint synovial fluid circulation.',
        clinicalRelevance: 'Builds bone mineral density in femoral neck and lumbar vertebrae through sustained weight-bearing.',
        color: '#E53E3E'
      },
      {
        system: 'circulatory',
        name: 'Cardiovascular & Lymphatic',
        iconName: 'Heart',
        physiologicalEffect: 'Increases venous return from lower legs via the muscular calf pump mechanism.',
        clinicalRelevance: 'Lowers systemic vascular resistance over time and reduces lower limb edema.',
        color: '#944426'
      },
      {
        system: 'respiratory',
        name: 'Respiratory System',
        iconName: 'Wind',
        physiologicalEffect: 'Expands intercostal muscles and enhances vital lung capacity through lateral rib excursion.',
        clinicalRelevance: 'Optimizes ventilation-perfusion matching across pulmonary lobes.',
        color: '#3182CE'
      },
      {
        system: 'nervous',
        name: 'Central & Autonomic Nervous System',
        iconName: 'Zap',
        physiologicalEffect: 'Balances sympathetic activation (endurance) with parasympathetic calming through rhythmic breath.',
        clinicalRelevance: 'Reduces cortisol levels while sharpening neuro-motor proprioception and vestibular balance.',
        color: '#D9AE29'
      }
    ],
    // Reconciled with the hand-tuned Warrior II pose that YogaHumanCanvas used
    // to hardcode: the front hip is deeply abducted so the stance reads wide,
    // and the front knee tracks over the ankle at ~90 degrees. Elevation stays
    // at 0 — the rig is rooted at the pelvis with no foot IK, so a positive
    // offset lifts the model off the mat.
    poseParameters: {
      torsoAngle: [0, 0.12, 0],
      headAngle: [0, 1.35, 0],
      leftArm: [0, 0, 1.57],
      rightArm: [0, 0, -1.57],
      leftForearm: [0, 0, 0],
      rightForearm: [0, 0, 0],
      leftLeg: [0.25, 0.45, 1.15],
      rightLeg: [-0.18, -0.25, -0.92],
      leftShin: [-1.52, 0, 0],
      rightShin: [-0.06, 0, 0],
      elevation: 0,
      rotationY: 0.3
    },
    tags: ['Standing', 'Intermediate', 'Strength', 'Grounding', 'Hips', 'Shoulders']
  },
  {
    id: 'adho-mukha-svanasana',
    slug: 'adho-mukha-svanasana',
    englishName: 'Downward-Facing Dog',
    sanskritName: 'Adho Mukha Svanasana',
    sanskritScript: 'अधोमुखश्वानासन',
    pronunciation: 'AH-doh MOO-kuh shvah-NAHS-uh-nuh',
    meaning: 'Adho = Downward, Mukha = Face, Svana = Dog. Mimics the rejuvenating, whole-body stretch of a dog upon awakening.',
    category: 'Inversion',
    difficulty: 'Easy',
    movementTypes: ['Flexibility', 'Strength', 'Restorative'],
    featured: true,
    imageUrl: '/images/downward-dog.jpg',
    shortDescription: 'The foundational inverted pyramid that decompresses the spine, strengthens shoulders, and elongates the posterior chain.',
    fullDescription: 'Downward-Facing Dog is both an inversion and a full-body recalibration. With hands firmly gripping the earth and the sitting bones reaching toward the sky, the spine decompresses while blood flows gently toward the brain, offering mental rejuvenation without intense strain.',
    historyAndSignificance: 'A cornerstone of modern Vinyasa and Hatha yoga, this asana serves as an energetic reset between dynamic sequences, teaching the body how to rest in an active structure.',
    drishti: 'Toward the navel (Nabhi Chakra) or between the knees',
    benefits: [
      'Decompresses intervertebral discs through axial traction',
      'Deeply lengthens calves, hamstrings, and Achilles tendons',
      'Strengthens rotator cuff, serratus anterior, and wrists',
      'Boosts cerebral blood flow, calming mild anxiety and fatigue',
      'Therapeutic for flat feet and early-stage plantar fasciitis'
    ],
    contraindications: [
      'Carpal tunnel syndrome (use yoga wedge or forearms in Dolphin Pose)',
      'Unmedicated high blood pressure or detached retina',
      'Late-stage pregnancy (practice with feet wider than hips)'
    ],
    muscles: [
      {
        id: 'serratus-anterior',
        name: 'Serratus Anterior & Latissimus',
        latinName: 'Serratus anterior, Latissimus dorsi',
        role: 'primary',
        percentage: 90,
        position3D: [0.2, 1.1, 0.15],
        description: 'Upwardly rotates scapulae and wraps shoulder blades around the ribcage.',
        biomechanics: 'Prevents shoulder impingement by broadening the upper back and lifting armpits away from the floor.'
      },
      {
        id: 'hamstrings-chain',
        name: 'Posterior Hamstring Chain',
        latinName: 'Semimembranosus, Semitendinosus, Biceps Femoris',
        role: 'primary',
        percentage: 85,
        position3D: [0.15, 0.45, -0.1],
        description: 'Undergoes active eccentric lengthening as ischial tuberosities lift skyward.',
        biomechanics: 'Allows anterior pelvic tilt to maintain neutral lumbar lordosis.'
      },
      {
        id: 'triceps-brachii',
        name: 'Triceps & Forearms',
        latinName: 'Triceps brachii, Pronator teres',
        role: 'secondary',
        percentage: 78,
        position3D: [-0.2, 1.25, 0.1],
        description: 'Keeps elbows straight and presses through index finger knuckles.',
        biomechanics: 'Extends the elbow joint while resisting wrist compression.'
      },
      {
        id: 'gastrocnemius-soleus',
        name: 'Calves & Achilles',
        latinName: 'Gastrocnemius, Soleus',
        role: 'secondary',
        percentage: 72,
        position3D: [0.1, 0.2, -0.15],
        description: 'Lengthens as heels descend toward the earth.',
        biomechanics: 'Undergoes passive dorsiflexion stretch, enhancing ankle mobility.'
      }
    ],
    chakras: [
      CHAKRAS_UNIVERSAL.solarPlexus,
      CHAKRAS_UNIVERSAL.thirdEye,
      CHAKRAS_UNIVERSAL.crown
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Tabletop Foundation',
        subtitle: 'Hand Placement',
        instruction: 'Start on hands and knees with wrists under shoulders and knees under hips. Spread fingers wide, rooting through index knuckles.',
        breathCue: 'Natural',
        durationSeconds: 4,
        drishti: 'Floor between hands',
        alignmentTips: [
          'Press into the base of each finger (Hasta Bandha)',
          'Tuck toes under securely'
        ],
        commonMistake: 'Hands cupped with weight dumping into the outer wrists.',
        modification: 'Turn hands slightly outward (5-10 degrees) if wrists feel tight.',
        cameraTarget: [0, 0.4, 0],
        cameraPosition: [1.2, 0.8, 1.8],
        highlightedMuscles: ['triceps-brachii']
      },
      {
        stepNumber: 2,
        title: 'Lift Hips Up and Back',
        subtitle: 'Spinal Elongation',
        instruction: 'Exhale, press into your hands, and lift your knees off the mat. Send your sitting bones high toward the ceiling in an inverted V.',
        breathCue: 'Exhale',
        durationSeconds: 6,
        drishti: 'Toward feet',
        alignmentTips: [
          'Prioritize a long straight spine over straight legs',
          'Keep knees softly bent if hamstrings are tight'
        ],
        commonMistake: 'Rounding the lower back to force heels to the floor.',
        modification: 'Bend knees generously and lift heels high off the mat.',
        cameraTarget: [0, 0.6, 0],
        cameraPosition: [1.8, 0.9, 1.9],
        highlightedMuscles: ['serratus-anterior', 'hamstrings-chain']
      },
      {
        stepNumber: 3,
        title: 'Root Heels & Broaden Shoulders',
        subtitle: 'Active Stillness',
        instruction: 'Roll outer upper arms toward your face to widen your back. Gently guide heels toward the mat and breathe deeply.',
        breathCue: 'Inhale',
        durationSeconds: 20,
        drishti: 'Navel center',
        alignmentTips: [
          'Relax head and neck completely—nod yes and no softly',
          'Draw low ribs in toward the spine'
        ],
        commonMistake: 'Sinking chest toward the floor and hyperextending shoulders.',
        modification: 'Place hands on blocks or a chair for less wrist and hamstring load.',
        cameraTarget: [0, 0.6, 0],
        cameraPosition: [0, 0.8, 2.4],
        highlightedMuscles: ['serratus-anterior', 'hamstrings-chain', 'gastrocnemius-soleus']
      },
      {
        stepNumber: 4,
        title: 'Gentle Descent into Child’s Pose',
        subtitle: 'Restorative Transition',
        instruction: 'On an exhale, lower your knees gently back to the earth and slide hips to heels in Balasana.',
        breathCue: 'Exhale',
        durationSeconds: 5,
        drishti: 'Mat',
        alignmentTips: ['Take slow, unhurried deep breaths in recovery'],
        commonMistake: 'Collapsing onto knees with a thud.',
        modification: 'Rest forehead on a block or bolster.',
        cameraTarget: [0, 0.3, 0],
        cameraPosition: [1.0, 0.5, 1.8],
        highlightedMuscles: []
      }
    ],
    breathPattern: {
      name: 'Calming Diaphragmatic Breath',
      ratio: '4:0:6:0 (Extended Exhale)',
      description: 'Extending the exhalation engages the vagus nerve, reducing resting heart rate and arterial pressure.',
      phases: [
        {
          phase: 'Inhale',
          duration: 4,
          instructions: 'Feel breath fill the back of the lungs and the dorsal ribcage.',
          diaphragmAction: 'Spreads lateral ribcage without compressing the neck.'
        },
        {
          phase: 'Exhale',
          duration: 6,
          instructions: 'Draw the navel softly to the spine as sitting bones reach higher.',
          diaphragmAction: 'Complete abdominal release fostering mental quietude.'
        }
      ]
    },
    bodySystems: [
      {
        system: 'nervous',
        name: 'Autonomic Nervous System',
        iconName: 'Zap',
        physiologicalEffect: 'Vagal nerve stimulation via mild inversion promotes the parasympathetic relaxation response.',
        clinicalRelevance: 'Effective for relieving stress, mental fatigue, and sleep disturbances.',
        color: '#D9AE29'
      },
      {
        system: 'musculoskeletal',
        name: 'Musculoskeletal Spinal Traction',
        iconName: 'Activity',
        physiologicalEffect: 'Passive gravity traction creates negative intervertebral disc pressure.',
        clinicalRelevance: 'Improves spinal hydration and alleviates compressive lower back discomfort.',
        color: '#E53E3E'
      }
    ],
    poseParameters: {
      torsoAngle: [1.1, 0, 0],
      headAngle: [0.4, 0, 0],
      leftArm: [2.8, 0, 0.2],
      rightArm: [2.8, 0, -0.2],
      leftForearm: [0, 0, 0],
      rightForearm: [0, 0, 0],
      leftLeg: [1.4, 0, 0.1],
      rightLeg: [1.4, 0, -0.1],
      leftShin: [0.1, 0, 0],
      rightShin: [0.1, 0, 0],
      elevation: -0.3,
      rotationY: 0.8
    },
    tags: ['Inversion', 'Forward Fold', 'Easy', 'Spine', 'Hamstrings', 'Calming']
  },
  {
    id: 'tadasana',
    slug: 'tadasana',
    englishName: 'Mountain Pose',
    sanskritName: 'Tadasana / Samasthiti',
    sanskritScript: 'ताडासन / समस्थिति',
    pronunciation: 'tah-DAHS-uh-nuh',
    meaning: 'Tada = Mountain. Samasthiti = Equal standing. The blueprint of all standing postures, embodying unshakeable poise.',
    category: 'Standing',
    difficulty: 'Easy',
    movementTypes: ['Balance', 'Restorative'],
    featured: true,
    imageUrl: '/images/mountain-pose.jpg',
    shortDescription: 'The foundational standing posture cultivating vertical spinal stacking, postural symmetry, and mental stillness.',
    fullDescription: 'Tadasana looks simple from the outside, but internally it is a masterclass in dynamic micro-adjustments. Weight is evenly divided across the four corners of both feet, the arches lift, the pelvis levels, and the crown of the head floats toward the sky like a mountain peak piercing clouds.',
    historyAndSignificance: 'Described in classical texts as the archetype of physical honesty—revealing postural imbalances, lateral pelvic tilts, and internal mind fluctuations through pure stillness.',
    drishti: 'Straight ahead at eye level (Nasagrai or unmoving horizon)',
    benefits: [
      'Corrects postural deviations and restores neutral pelvic tilt',
      'Strengthens arches of the feet, calves, and inner thigh adductors',
      'Fosters somatic mindfulness and central nervous system grounding',
      'Relieves sciatica symptoms caused by asymmetric weight-bearing'
    ],
    contraindications: [
      'Acute vertigo or lightheadedness (practice with feet hip-width near a wall)'
    ],
    muscles: [
      {
        id: 'tibialis-anterior',
        name: 'Foot Arches & Tibialis',
        latinName: 'Tibialis anterior, Plantar fascia',
        role: 'primary',
        percentage: 85,
        position3D: [0.08, 0.05, 0.05],
        description: 'Lifts the medial longitudinal foot arch (Pada Bandha).',
        biomechanics: 'Activates deep intrinsic foot muscles to stabilize the ankle mortise.'
      },
      {
        id: 'quads-adductors',
        name: 'Quadriceps & Inner Thighs',
        latinName: 'Quadriceps, Adductor magnus',
        role: 'secondary',
        percentage: 65,
        position3D: [0.08, 0.45, 0.05],
        description: 'Lifts kneecaps and gently draws inner thighs toward the midline.',
        biomechanics: 'Maintains neutral femoral alignment and prevents hyperextension of the knee joints.'
      },
      {
        id: 'core-posture',
        name: 'Deep Core & Spinal Stabilizers',
        latinName: 'Transversus abdominis, Multifidus',
        role: 'primary',
        percentage: 75,
        position3D: [0, 0.9, -0.05],
        description: 'Acts as an internal anatomical corset supporting upright posture.',
        biomechanics: 'Maintains intra-abdominal pressure and stacks vertebrae in natural lordotic and kyphotic curves.'
      }
    ],
    chakras: [
      CHAKRAS_UNIVERSAL.root,
      CHAKRAS_UNIVERSAL.throat,
      CHAKRAS_UNIVERSAL.crown
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Anchor the Feet',
        subtitle: 'Pada Bandha',
        instruction: 'Stand with big toes touching and heels slightly apart, or feet hip-width. Lift all toes, spread them wide, and place them down one by one.',
        breathCue: 'Natural',
        durationSeconds: 5,
        drishti: 'Horizon',
        alignmentTips: [
          'Feel equal weight on big toe ball, little toe ball, inner heel, outer heel',
          'Engage the arches of your feet upward'
        ],
        commonMistake: 'Leaning all weight into the heels or collapsing into fallen arches.',
        modification: 'Separate feet hip-width for increased stability.',
        cameraTarget: [0, 0.2, 0],
        cameraPosition: [0, 0.6, 1.8],
        highlightedMuscles: ['tibialis-anterior']
      },
      {
        stepNumber: 2,
        title: 'Level Pelvis & Lift Ribs',
        subtitle: 'Axial Alignment',
        instruction: 'Firm your quadriceps to lift the kneecaps. Draw your tailbone down toward the heels while lifting the pubic bone toward the navel.',
        breathCue: 'Inhale',
        durationSeconds: 10,
        drishti: 'Horizon',
        alignmentTips: [
          'Keep pelvis in neutral—avoid excessive arching in lower back',
          'Broaden collarbones and let arms hang naturally by your sides'
        ],
        commonMistake: 'Thrusting ribcage forward and overarching lower back.',
        modification: 'Stand against a wall to feel head, upper back, and sacrum touch lightly.',
        cameraTarget: [0, 0.9, 0],
        cameraPosition: [0, 1.1, 2.2],
        highlightedMuscles: ['quads-adductors', 'core-posture']
      },
      {
        stepNumber: 3,
        title: 'Crown Elevation & Stillness',
        subtitle: 'The Unmoving Mountain',
        instruction: 'Tuck your chin slightly so the back of the neck is long. Feel the crown of your head floating weightlessly skyward. Breathe effortlessly.',
        breathCue: 'Natural',
        durationSeconds: 15,
        drishti: 'Internal / Horizon',
        alignmentTips: [
          'Soften tongue away from roof of mouth',
          'Experience the paradox of active engagement and complete relaxation'
        ],
        commonMistake: 'Tension in shoulders and clenched jaw.',
        modification: 'Close eyes to heighten internal proprioception.',
        cameraTarget: [0, 1.3, 0],
        cameraPosition: [0, 1.4, 1.9],
        highlightedMuscles: ['core-posture']
      }
    ],
    breathPattern: {
      name: 'Sama Vritti (Equal Ratio Breathing)',
      ratio: '4:4:4:4',
      description: 'Equalizing inhalation, internal hold, exhalation, and external pause induces deep mental stillness.',
      phases: [
        {
          phase: 'Inhale',
          duration: 4,
          instructions: 'Draw breath smoothly from the soles of the feet up to the crown.',
          diaphragmAction: 'Gentle 3-dimensional expansion of thoracic cavity.'
        },
        {
          phase: 'Internal Retention',
          duration: 4,
          instructions: 'Hold awareness at the crown of the head in clear stillness.',
          diaphragmAction: 'Diaphragm suspended in gentle fullness.'
        },
        {
          phase: 'Exhale',
          duration: 4,
          instructions: 'Release breath down from crown back into the earth.',
          diaphragmAction: 'Complete relaxation of accessory respiratory muscles.'
        },
        {
          phase: 'External Retention',
          duration: 4,
          instructions: 'Rest in pure grounded presence.',
          diaphragmAction: 'Natural baseline tonicity.'
        }
      ]
    },
    bodySystems: [
      {
        system: 'musculoskeletal',
        name: 'Skeletal Alignment & Gravity Response',
        iconName: 'Activity',
        physiologicalEffect: 'Reduces unnecessary muscle tonicity by aligning center of mass directly over the base of support.',
        clinicalRelevance: 'Prevents chronic postural syndrome, kyphosis, and text-neck syndrome.',
        color: '#E53E3E'
      }
    ],
    poseParameters: {
      torsoAngle: [0, 0, 0],
      headAngle: [0, 0, 0],
      leftArm: [0, 0, 0.15],
      rightArm: [0, 0, -0.15],
      leftForearm: [0, 0, 0],
      rightForearm: [0, 0, 0],
      leftLeg: [0, 0, 0.05],
      rightLeg: [0, 0, -0.05],
      leftShin: [0, 0, 0],
      rightShin: [0, 0, 0],
      elevation: 0,
      rotationY: 0
    },
    tags: ['Standing', 'Easy', 'Posture', 'Grounding', 'Alignment']
  },
  {
    id: 'vrikshasana',
    slug: 'vrikshasana',
    englishName: 'Tree Pose',
    sanskritName: 'Vrikshasana',
    sanskritScript: 'वृक्षासन',
    pronunciation: 'vrik-SHAH-suh-nuh',
    meaning: 'Vriksha = Tree. Cultivates the physical rootedness of a trunk with the graceful adaptability of branches swaying in the wind.',
    category: 'Balance',
    difficulty: 'Intermediate',
    movementTypes: ['Balance', 'Mobility'],
    featured: true,
    imageUrl: '/images/tree-pose.jpg',
    shortDescription: 'An elegant unilateral balance posture that strengthens ankles, opens hips, and trains single-pointed focus.',
    fullDescription: 'In Tree Pose, one leg becomes the strong, rooted trunk while the opposite foot presses firmly against the inner thigh or calf. Hands gather at the heart in Anjali Mudra or reach overhead like branches. Balance is discovered not through rigidity, but through micro-oscillations of steady awareness.',
    historyAndSignificance: 'Mentioned in ancient epic tales where hermits practiced one-legged balance (Tapasya) for mental purification, developing unwavering concentration of will.',
    drishti: 'Single unmoving point on the floor or wall 4-6 feet ahead',
    benefits: [
      'Strengthens ankles, peroneals, calves, and standing leg quadriceps',
      'Opens the external rotators of the lifted hip without torque on the knee',
      'Sharpens neuro-muscular pathways and cerebellar balance control',
      'Increases mental stamina, resilience against distractions, and poise'
    ],
    contraindications: [
      'Never place the lifted foot directly against the inner knee joint (place above or below knee)',
      'Severe ankle sprains in acute healing phase'
    ],
    muscles: [
      {
        id: 'peroneals-ankle',
        name: 'Peroneals & Ankle Stabilizers',
        latinName: 'Peroneus longus, brevis',
        role: 'primary',
        percentage: 95,
        position3D: [0.08, 0.15, 0.05],
        description: 'Fires continuous micro-contractions to maintain center of balance.',
        biomechanics: 'Controls inversion and eversion of the subtalar joint in real-time.'
      },
      {
        id: 'hip-abductors-standing',
        name: 'Gluteus Medius (Standing Leg)',
        latinName: 'Gluteus medius, Minimus',
        role: 'primary',
        percentage: 90,
        position3D: [-0.15, 0.65, -0.05],
        description: 'Prevents the standing hip from jutting out laterally (Trendelenburg sign).',
        biomechanics: 'Maintains a level pelvic rim against single-leg gravitational torque.'
      },
      {
        id: 'hip-rotators-lifted',
        name: 'External Rotators (Bent Leg)',
        latinName: 'Piriformis, Gemelli, Obturator internus',
        role: 'secondary',
        percentage: 80,
        position3D: [0.2, 0.62, -0.1],
        description: 'Opens the lifted knee out to the side in comfortable external rotation.',
        biomechanics: 'Abducts and rotates the femur without twisting the pelvic girdle.'
      }
    ],
    chakras: [
      CHAKRAS_UNIVERSAL.root,
      CHAKRAS_UNIVERSAL.heart,
      CHAKRAS_UNIVERSAL.thirdEye
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Shift Weight & Find Drishti',
        subtitle: 'Anchor the Foundation',
        instruction: 'From Tadasana, pick an unmoving point in front of you. Shift your weight onto your standing leg, feeling the sole expand.',
        breathCue: 'Inhale',
        durationSeconds: 5,
        drishti: 'Fixed eye-level focal point',
        alignmentTips: ['Lock gaze calmly before lifting the other foot'],
        commonMistake: 'Looking around the room which destabilizes balance.',
        modification: 'Keep fingertips lightly touching a wall for reassurance.',
        cameraTarget: [0, 0.5, 0],
        cameraPosition: [0, 0.9, 2.2],
        highlightedMuscles: ['peroneals-ankle']
      },
      {
        stepNumber: 2,
        title: 'Place Foot & Press Inward',
        subtitle: 'Equal Opposite Force',
        instruction: 'Bend your right knee, turning it out to the side. Place the sole of your right foot on your inner left calf or upper inner thigh.',
        breathCue: 'Exhale',
        durationSeconds: 8,
        drishti: 'Focal point',
        alignmentTips: [
          'Press foot and thigh firmly into each other (co-contraction)',
          'Ensure hips remain squared forward toward the front of the room'
        ],
        commonMistake: 'Resting foot directly on the side of the knee joint.',
        modification: 'Place toes on the floor like a kickstand with heel resting on ankle.',
        cameraTarget: [0, 0.7, 0],
        cameraPosition: [0.8, 1.0, 2.0],
        highlightedMuscles: ['hip-abductors-standing', 'hip-rotators-lifted']
      },
      {
        stepNumber: 3,
        title: 'Hands to Heart or Grow Branches',
        subtitle: 'Centering or Expansion',
        instruction: 'Bring palms together at chest center in Anjali Mudra. When stable, optionally sweep arms overhead like branches reaching for sun.',
        breathCue: 'Inhale',
        durationSeconds: 15,
        drishti: 'Unbroken Drishti',
        alignmentTips: [
          'Keep shoulders relaxed away from ears',
          'Ride small wobbles without tensing up'
        ],
        commonMistake: 'Holding breath when balance wavers.',
        modification: 'Keep hands at heart center if shoulder mobility is restricted.',
        cameraTarget: [0, 1.1, 0],
        cameraPosition: [0, 1.2, 2.2],
        highlightedMuscles: ['peroneals-ankle', 'hip-abductors-standing']
      }
    ],
    breathPattern: {
      name: 'Nadi Shodhana Rhythm (Smooth Equilibrium)',
      ratio: '4:0:4:0',
      description: 'Even, quiet nasal breathing that keeps the mind centered despite natural physical swaying.',
      phases: [
        {
          phase: 'Inhale',
          duration: 4,
          instructions: 'Draw stability upward from the rooted foot to the heart.',
          diaphragmAction: 'Gentle core engagement stabilizes lumbar spine.'
        },
        {
          phase: 'Exhale',
          duration: 4,
          instructions: 'Release tension in face and shoulders while maintaining root.',
          diaphragmAction: 'Smooth relaxation of thoracic wall.'
        }
      ]
    },
    bodySystems: [
      {
        system: 'nervous',
        name: 'Proprioceptive & Vestibular Integration',
        iconName: 'Zap',
        physiologicalEffect: 'Accelerates neuro-plastic feedback between mechanoreceptors in the ankle and vestibular balance centers in the brainstem.',
        clinicalRelevance: 'Significantly reduces risk of falls and strengthens joint stability.',
        color: '#D9AE29'
      }
    ],
    poseParameters: {
      torsoAngle: [0, 0, 0],
      headAngle: [0, 0, 0],
      leftArm: [-0.4, 0, 0.8],
      rightArm: [-0.4, 0, -0.8],
      leftForearm: [1.2, 0, -0.6],
      rightForearm: [1.2, 0, 0.6],
      leftLeg: [0, 0, 0],
      rightLeg: [0.35, 1.2, -0.8],
      leftShin: [0, 0, 0],
      rightShin: [-2.2, 0, 0],
      elevation: 0,
      rotationY: 0.1
    },
    tags: ['Balance', 'Intermediate', 'Standing', 'Ankles', 'Focus']
  },
  {
    id: 'dhanurasana',
    slug: 'dhanurasana',
    englishName: 'Bow Pose',
    sanskritName: 'Dhanurasana',
    sanskritScript: 'धनुरासन',
    pronunciation: 'dah-noo-RAHS-uh-nuh',
    meaning: 'Dhanu = Bow. The body forms the arch of an archer’s bow while the arms act as the taut string, radiating dynamic vitality.',
    category: 'Backbend',
    difficulty: 'Intermediate',
    movementTypes: ['Strength', 'Flexibility'],
    featured: true,
    imageUrl: '/images/bow-pose.jpg',
    shortDescription: 'A classic backbend where the practitioner grips ankles from prone, opening the heart, chest, and entire anterior chain.',
    fullDescription: 'Featured prominently in yogic anatomy study, Dhanurasana creates an expansive arc from knees to collarbones. Lying prone, the hands reach back to clasp the ankles. As the legs kick actively backward, the chest lifts high off the earth, massaging internal abdominal organs and opening the thoracic spine.',
    historyAndSignificance: 'Described in the Hatha Yoga Pradipika as an asana that kindles digestive fire (Jatharagni) and unblocks energy along the central Sushumna Nadi.',
    drishti: 'Upward and forward toward third eye (Bhrumadhya)',
    benefits: [
      'Massively stretches the entire front body: chest, throat, abdomen, psoas, and quads',
      'Strengthens posterior chain extensor muscles along the whole spine',
      'Massages abdominal organs, stimulating digestive enzymes and peristalsis',
      'Elevates mood and combats lethargy by expanding the thoracic cage',
      'Improves shoulder retraction and thoracic mobility'
    ],
    contraindications: [
      'Severe lumbar disc herniation or spondylolisthesis',
      'Recent abdominal surgery or active ulcer inflammation',
      'Pregnancy (avoid all prone postures)'
    ],
    muscles: [
      {
        id: 'erector-spinae-bow',
        name: 'Erector Spinae & Multifidus',
        latinName: 'Erector spinae (Iliocostalis, Longissimus, Spinalis)',
        role: 'primary',
        percentage: 95,
        position3D: [0, 0.45, 0.15],
        description: 'Contracts deeply to extend the vertebral column into a continuous arc.',
        biomechanics: 'Produces concentric extensor force along cervical, thoracic, and lumbar spine.'
      },
      {
        id: 'gluteus-hamstrings-bow',
        name: 'Gluteus Maximus & Hamstrings',
        latinName: 'Gluteus maximus, Biceps femoris',
        role: 'primary',
        percentage: 90,
        position3D: [0.12, 0.25, 0.1],
        description: 'Powers the backward and upward kick of the legs.',
        biomechanics: 'Extends the hip joint to pull the torso into higher thoracic expansion.'
      },
      {
        id: 'rhomboids-delts',
        name: 'Rhomboids & Rear Deltoids',
        latinName: 'Rhomboid major/minor, Posterior deltoid',
        role: 'secondary',
        percentage: 82,
        position3D: [0.15, 0.65, 0.15],
        description: 'Retracts shoulder blades to open the chest anteriorly.',
        biomechanics: 'Draws humerus heads into external rotation and retraction.'
      },
      {
        id: 'psoas-rectus-stretch',
        name: 'Psoas & Rectus Abdominis (Lengthening)',
        latinName: 'Iliopsoas, Rectus abdominis',
        role: 'stabilizer',
        percentage: 88,
        position3D: [0, 0.4, -0.08],
        description: 'Undergoes active eccentric stretch while resting on the abdomen.',
        biomechanics: 'Transfers intra-abdominal pressure into deep visceral massage.'
      }
    ],
    chakras: [
      CHAKRAS_UNIVERSAL.sacral,
      CHAKRAS_UNIVERSAL.solarPlexus,
      CHAKRAS_UNIVERSAL.heart,
      CHAKRAS_UNIVERSAL.throat
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Prone Setup & Bend Knees',
        subtitle: 'Ankle Clasp Preparation',
        instruction: 'Lie flat on your belly with arms along your torso. Exhale, bend your knees, and bring your heels as close to your buttocks as comfortable.',
        breathCue: 'Exhale',
        durationSeconds: 5,
        drishti: 'Mat in front',
        alignmentTips: [
          'Keep knees hip-width apart—do not let them splay widely',
          'Reach back with hands and grasp the outer ankles firmly'
        ],
        commonMistake: 'Grabbing toes instead of the bony ankles, compromising grip security.',
        modification: 'Use a yoga strap looped around ankles if hands do not reach comfortably.',
        cameraTarget: [0, 0.2, 0],
        cameraPosition: [1.2, 0.5, 1.8],
        highlightedMuscles: ['erector-spinae-bow']
      },
      {
        stepNumber: 2,
        title: 'Kick Legs Back & Lift Torso',
        subtitle: 'Drawing the Bow',
        instruction: 'Inhale powerfully. Press your shins and feet backward into your hands, letting that backward kick pull your chest and thighs off the floor.',
        breathCue: 'Inhale',
        durationSeconds: 8,
        drishti: 'Forward and up',
        alignmentTips: [
          'Draw shoulder blades toward the spine and down the back',
          'Keep neck long and gaze softly elevated without crunching cervical spine',
          'Rest your weight squarely on the soft belly'
        ],
        commonMistake: 'Trying to lift solely with arm strength rather than the leg kick.',
        modification: 'Lift only chest while keeping thighs on the ground for a gentler backbend.',
        cameraTarget: [0, 0.35, 0],
        cameraPosition: [1.8, 0.7, 1.5],
        highlightedMuscles: ['erector-spinae-bow', 'gluteus-hamstrings-bow', 'rhomboids-delts']
      },
      {
        stepNumber: 3,
        title: 'Sustain Arc & Rock with Breath',
        subtitle: 'Heart Opening',
        instruction: 'Hold for 4-5 breaths. Notice the natural gentle rocking motion of the body as your diaphragm expands and contracts against the floor.',
        breathCue: 'Natural',
        durationSeconds: 15,
        drishti: 'Third Eye',
        alignmentTips: [
          'Keep knees drawn toward the midline (imagining holding a block between knees)',
          'Breathe deeply into the belly despite the thoracic tension'
        ],
        commonMistake: 'Holding breath due to abdominal compression.',
        modification: 'Lower down slightly to allow breath to flow smoothly.',
        cameraTarget: [0, 0.4, 0],
        cameraPosition: [0, 0.8, 2.2],
        highlightedMuscles: ['erector-spinae-bow', 'gluteus-hamstrings-bow', 'psoas-rectus-stretch']
      },
      {
        stepNumber: 4,
        title: 'Gentle Release to Earth',
        subtitle: 'Integration & Relaxation',
        instruction: 'Exhale, slowly release your ankle grip, lower your legs and chest to the mat, turn one cheek to the floor, and rest completely.',
        breathCue: 'Exhale',
        durationSeconds: 6,
        drishti: 'Rest',
        alignmentTips: [
          'Allow hips to wiggle gently from side to side to release lumbar spine'
        ],
        commonMistake: 'Slingshotting the ankles on release.',
        modification: 'Press back into Child’s Pose (Balasana) as a gentle counter-posture.',
        cameraTarget: [0, 0.1, 0],
        cameraPosition: [0, 0.6, 2.0],
        highlightedMuscles: []
      }
    ],
    breathPattern: {
      name: 'Abdominal Surge Breathing (Agni Prana)',
      ratio: '4:2:4:2',
      description: 'Breathing into the abdomen against the floor provides dynamic internal visceral massage.',
      phases: [
        {
          phase: 'Inhale',
          duration: 4,
          instructions: 'Fill the abdomen, naturally lifting the torso higher as the belly pushes into the earth.',
          diaphragmAction: 'Diaphragm presses against internal viscera.'
        },
        {
          phase: 'Exhale',
          duration: 4,
          instructions: 'Maintain the arc through muscular engagement as the belly softens.',
          diaphragmAction: 'Spinal extensors sustain posture during exhalation.'
        }
      ]
    },
    bodySystems: [
      {
        system: 'digestive',
        name: 'Digestive & Visceral Stimulation',
        iconName: 'Sun',
        physiologicalEffect: 'Direct compression and rhythmic diaphragm excursion massage the liver, spleen, pancreas, and intestines.',
        clinicalRelevance: 'Stimulates bile release, improves bowel motility, and reduces chronic constipation.',
        color: '#D9AE29'
      },
      {
        system: 'endocrine',
        name: 'Endocrine & Adrenal Balancing',
        iconName: 'Shield',
        physiologicalEffect: 'Compresses adrenal glands and stimulates thyroid / parathyroid through neck extension.',
        clinicalRelevance: 'Assists in metabolic regulation and releases revitalizing endorphins.',
        color: '#620513'
      }
    ],
    poseParameters: {
      torsoAngle: [-0.6, 0, 0],
      headAngle: [-0.5, 0, 0],
      leftArm: [-1.8, 0, 0.4],
      rightArm: [-1.8, 0, -0.4],
      leftForearm: [-0.4, 0, 0],
      rightForearm: [-0.4, 0, 0],
      leftLeg: [-0.6, 0, 0.3],
      rightLeg: [-0.6, 0, -0.3],
      leftShin: [2.3, 0, 0],
      rightShin: [2.3, 0, 0],
      elevation: -0.4,
      rotationY: 1.4
    },
    tags: ['Backbend', 'Intermediate', 'Strength', 'Chest Opening', 'Digestion']
  },
  {
    id: 'balasana',
    slug: 'balasana',
    englishName: 'Child’s Pose',
    sanskritName: 'Balasana',
    sanskritScript: 'बालासन',
    pronunciation: 'bah-LAHS-uh-nuh',
    meaning: 'Bala = Child. A sanctuary posture of surrender, introspection, and somatic restoration.',
    category: 'Restorative',
    difficulty: 'Easy',
    movementTypes: ['Restorative', 'Flexibility'],
    featured: true,
    imageUrl: '/images/child-pose.jpg',
    shortDescription: 'The supreme resting sanctuary that releases lower back compression, soothes the nervous system, and grounds attention.',
    fullDescription: 'Balasana offers a safe harbor throughout any yoga practice. With knees wide, big toes touching, and torso folded forward between the thighs, the forehead rests softly on the earth. The spine gently curves in passive flexion, letting gravity melt tension from hips, neck, and shoulders.',
    historyAndSignificance: 'Embodying the innocence and natural surrender of a sleeping child, this asana invites the practitioner to turn senses inward (Pratyahara) and release all need to perform.',
    drishti: 'Third Eye / Inward awareness (eyes closed)',
    benefits: [
      'Gently decompresses the lumbar spine and opens the sacrum',
      'Stretches the hips, thighs, ankles, and latissimus dorsi',
      'Shifts the autonomic nervous system into parasympathetic dominance',
      'Provides a safe respite during vigorous physical sequences'
    ],
    contraindications: [
      'Recent knee ligament injuries or acute diarrhea',
      'Pregnancy (widen knees widely to prevent any abdominal pressure)'
    ],
    muscles: [
      {
        id: 'lumbar-fascia',
        name: 'Thoracolumbar Fascia & Spine',
        latinName: 'Thoracolumbar fascia, Latissimus dorsi',
        role: 'primary',
        percentage: 80,
        position3D: [0, 0.25, 0.1],
        description: 'Undergoes passive restorative elongation as the hips settle to heels.',
        biomechanics: 'Opens facet joints in lumbar and lower thoracic vertebrae without strain.'
      },
      {
        id: 'hip-flexors-glutes-release',
        name: 'Glutes & Hip Capsule Release',
        latinName: 'Gluteus maximus, Piriformis',
        role: 'primary',
        percentage: 75,
        position3D: [0.15, 0.15, 0.15],
        description: 'Deep passive flexion of the acetabulofemoral joints.',
        biomechanics: 'Encourages pelvic floor and hip capsule relaxation.'
      }
    ],
    chakras: [
      CHAKRAS_UNIVERSAL.root,
      CHAKRAS_UNIVERSAL.thirdEye
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Kneel with Big Toes Touching',
        subtitle: 'Sanctuary Setup',
        instruction: 'Kneel on the mat, bring your big toes together to touch, and sit back onto your heels. Separate your knees as wide as your mat or keep them together.',
        breathCue: 'Natural',
        durationSeconds: 5,
        drishti: 'Inward',
        alignmentTips: [
          'Place a folded blanket beneath knees or behind knees if knees feel sensitive'
        ],
        commonMistake: 'Forcing hips down if knees or ankles are tight.',
        modification: 'Place a bolster or pillow between heels and sitting bones.',
        cameraTarget: [0, 0.15, 0],
        cameraPosition: [1.2, 0.5, 1.6],
        highlightedMuscles: ['hip-flexors-glutes-release']
      },
      {
        stepNumber: 2,
        title: 'Fold Forward & Rest Forehead',
        subtitle: 'Surrender to Gravity',
        instruction: 'Exhale and fold your torso forward over your thighs. Rest your forehead gently on the mat, extending arms forward or resting them back by your feet.',
        breathCue: 'Exhale',
        durationSeconds: 20,
        drishti: 'Third Eye',
        alignmentTips: [
          'Feel the entire spine round in gentle, supported curvature',
          'Soften neck, jaw, and shoulders completely'
        ],
        commonMistake: 'Head hanging suspended in air without touching ground or support.',
        modification: 'Rest forehead on a yoga block or stacked fists.',
        cameraTarget: [0, 0.1, 0],
        cameraPosition: [0, 0.5, 2.0],
        highlightedMuscles: ['lumbar-fascia']
      }
    ],
    breathPattern: {
      name: 'Deep Dorsal Belly Breath',
      ratio: '4:0:4:0',
      description: 'Slow breath expanding into the back of the ribcage and kidney area.',
      phases: [
        {
          phase: 'Inhale',
          duration: 4,
          instructions: 'Feel breath inflate the lower back and broaden the shoulder blades.',
          diaphragmAction: 'Gentle expansion into the posterior chest cavity.'
        },
        {
          phase: 'Exhale',
          duration: 4,
          instructions: 'Allow sitting bones to melt deeper toward the heels.',
          diaphragmAction: 'Total muscular release.'
        }
      ]
    },
    bodySystems: [
      {
        system: 'nervous',
        name: 'Parasympathetic Reset (Vagal Tone)',
        iconName: 'Zap',
        physiologicalEffect: 'Forehead pressure (third eye grounding) triggers the oculocardiac and vagal reflex, downregulating heart rate.',
        clinicalRelevance: 'Relieves acute panic, high stress, and sensory overload.',
        color: '#D9AE29'
      }
    ],
    poseParameters: {
      torsoAngle: [1.5, 0, 0],
      headAngle: [0.3, 0, 0],
      leftArm: [2.5, 0, 0.1],
      rightArm: [2.5, 0, -0.1],
      leftForearm: [0, 0, 0],
      rightForearm: [0, 0, 0],
      leftLeg: [1.6, 0, 0.25],
      rightLeg: [1.6, 0, -0.25],
      leftShin: [-2.9, 0, 0],
      rightShin: [-2.9, 0, 0],
      elevation: -0.55,
      rotationY: 0.9
    },
    tags: ['Restorative', 'Forward Fold', 'Easy', 'Sanctuary', 'Calming', 'Lower Back']
  }
];
