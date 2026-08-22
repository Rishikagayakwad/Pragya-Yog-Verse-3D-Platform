// Web Speech API Voice Teacher & Guidance Engine
class VoiceGuidanceService {
  private synth: SpeechSynthesis | null = null;
  private isSpeakingState = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Calm, meditative pace
    utterance.pitch = 0.95; // Warm, grounding pitch

    // Prefer calm natural voices if available
    const voices = this.synth.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Serena') || v.name.includes('Samantha') || v.name.includes('Google UK English Female'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
    }
  }

  isSpeaking() {
    return this.isSpeakingState;
  }
}

export const voiceGuidance = new VoiceGuidanceService();
