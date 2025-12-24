/**
 * juiceService.ts
 * Manages "Game Juice" - SFX and Haptic Feedback
 */

class JuiceService {
    private audioContext: AudioContext | null = null;

    // Sound definitions (can be file paths or oscillator configurations)
    private sounds: Record<string, string> = {
        click: '/sounds/click.mp3',
        success: '/sounds/success.mp3',
        levelUp: '/sounds/levelup.mp3',
        denied: '/sounds/denied.mp3',
        bossHit: '/sounds/hit.mp3',
        defeat: '/sounds/defeat.mp3',
    };

    constructor() {
        // Audio Context is lazily initialized on first interaction to comply with browser policies
    }

    private initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    /**
     * Plays a sound effect.
     * If a file exists, it plays it. Otherwise, it falls back to a synthetic beep.
     */
    public async play(soundName: keyof typeof this.sounds | 'xp' | 'gold') {
        this.initAudio();

        // Attempt to play file
        const audio = new Audio(this.sounds[soundName] || '');
        audio.volume = 0.4;

        try {
            await audio.play();
        } catch (e) {
            // Fallback to synthetic sound if file fails/missing
            this.playSynthetic(soundName);
        }
    }

    /**
     * Synthetic sound generator using Web Audio API oscillators.
     * Useful when assets are missing.
     */
    private playSynthetic(type: string) {
        if (!this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        switch (type) {
            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'success':
            case 'xp':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'levelUp':
                // Arpeggio
                [440, 554.37, 659.25, 880].forEach((freq, i) => {
                    const o = this.audioContext!.createOscillator();
                    const g = this.audioContext!.createGain();
                    o.type = 'square';
                    o.frequency.setValueAtTime(freq, now + i * 0.1);
                    g.gain.setValueAtTime(0.05, now + i * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
                    o.connect(g);
                    g.connect(this.audioContext!.destination);
                    o.start(now + i * 0.1);
                    o.stop(now + i * 0.1 + 0.3);
                });
                break;
            case 'denied':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.3);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
        }
    }

    /**
     * Triggers device vibration (Haptic Feedback)
     */
    public vibrate(pattern: number | number[] = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * A "Heavy" feedback for important events (Boss hit, Level Up)
     */
    public flashScreen() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.inset = '0';
        flash.style.backgroundColor = 'white';
        flash.style.opacity = '0.2';
        flash.style.zIndex = '9999';
        flash.style.pointerEvents = 'none';
        document.body.appendChild(flash);

        setTimeout(() => {
            flash.style.transition = 'opacity 0.5s';
            flash.style.opacity = '0';
            setTimeout(() => document.body.removeChild(flash), 500);
        }, 50);
    }
}

export const juiceService = new JuiceService();
