// Audio Chime Service (Silent / No sound)
class AudioChimeService {
  playSingingBowl(_baseFreq: number = 432, _duration: number = 3.5) {
    // Sound disabled
  }

  playBreathCue(_type: 'inhale' | 'exhale' | 'hold') {
    // Sound disabled
  }

  playTelemetryClick(_frequency: number = 880, _duration: number = 0.08) {
    // Sound disabled
  }

  playRadarPing(_frequency: number = 659) {
    // Sound disabled
  }
}

export const audioChime = new AudioChimeService();

