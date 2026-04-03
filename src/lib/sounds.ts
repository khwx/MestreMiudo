"use client"

type SoundType = 'click' | 'success' | 'error' | 'levelup' | 'gamewin';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.3;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled || !this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    oscillator.connect(envelope);
    envelope.connect(this.gainNode);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const now = this.audioContext.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(volume, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  play(sound: SoundType) {
    if (!this.enabled) return;

    switch (sound) {
      case 'click':
        this.playClick();
        break;
      case 'success':
        this.playSuccess();
        break;
      case 'error':
        this.playError();
        break;
      case 'levelup':
        this.playLevelUp();
        break;
      case 'gamewin':
        this.playGameWin();
        break;
    }
  }

  private playClick() {
    this.playTone(800, 0.05, 'sine', 0.2);
  }

  private playSuccess() {
    this.playTone(523, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.3), 200);
  }

  private playError() {
    this.playTone(200, 0.15, 'square', 0.2);
    setTimeout(() => this.playTone(150, 0.2, 'square', 0.2), 150);
  }

  private playLevelUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'sine', 0.25), i * 150);
    });
  }

  private playGameWin() {
    const notes = [392, 440, 494, 523, 587, 659, 784, 880];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.15, 'sine', 0.2), i * 100);
    });
  }
}

export const soundManager = new SoundManager();

export function useSound() {
  return {
    playClick: () => soundManager.play('click'),
    playSuccess: () => soundManager.play('success'),
    playError: () => soundManager.play('error'),
    playLevelUp: () => soundManager.play('levelup'),
    playGameWin: () => soundManager.play('gamewin'),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    setVolume: (volume: number) => soundManager.setVolume(volume),
  };
}