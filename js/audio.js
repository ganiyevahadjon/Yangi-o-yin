/**
 * Dungeon Escape - Audio Engine (Web Audio API Synthesizer)
 * Zero external audio files needed; full procedural retro dungeon BGM & SFX.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.bgmGain = null;
        this.sfxGain = null;
        this.masterGain = null;
        this.bgmVolume = 0.5;
        this.sfxVolume = 0.7;
        this.isPlayingBGM = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.isMuted = false;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
    }

    resume() {
        if (!this.ctx) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setBGMVolume(val) {
        this.bgmVolume = Math.max(0, Math.min(1, val));
        if (this.bgmGain && this.ctx) {
            this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.05);
        }
    }

    setSFXVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, val));
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
        }
    }

    // --- Sound Effects (SFX) ---
    playJump() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(360, t + 0.12);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.15);
    }

    playLand() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.11);
    }

    playFootstep() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = 130 + (Math.random() * 25 - 12);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.05);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.06);
    }

    playHurt() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.23);
    }

    playDie() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.linearRampToValueAtTime(120, t + 0.2);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.6);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.7);
    }

    playCoin() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.setValueAtTime(1318.51, t + 0.07); // E6

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.26);
    }

    playKey() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(587.33, t); // D5
        osc1.frequency.setValueAtTime(880.00, t + 0.08); // A5
        osc2.frequency.setValueAtTime(1174.66, t + 0.08); // D6

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.36);
        osc2.stop(t + 0.36);
    }

    playPlate() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.11);
    }

    playDoorOpen() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.linearRampToValueAtTime(120, t + 0.3);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.52);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.55);
    }

    playCrumble() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        // White noise burst for stone cracking
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(t);
    }

    playCheckpoint() {
        if (!this.ctx) return;
        this.resume();
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
            const t = this.ctx.currentTime + idx * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    playWin() {
        if (!this.ctx) return;
        this.resume();
        const notes = [
            { f: 392.00, d: 0.12 }, // G4
            { f: 523.25, d: 0.12 }, // C5
            { f: 659.25, d: 0.12 }, // E5
            { f: 783.99, d: 0.35 }  // G5
        ];
        let delay = 0;
        notes.forEach(n => {
            const t = this.ctx.currentTime + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, t);

            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(t);
            osc.stop(t + n.d + 0.05);

            delay += n.d * 0.8;
        });
    }

    playClick() {
        if (!this.ctx) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    // --- Procedural Dungeon BGM ---
    startBGM() {
        if (this.isPlayingBGM) return;
        this.isPlayingBGM = true;
        this.resume();
        this.bgmStep = 0;
        this.scheduleBGM();
    }

    stopBGM() {
        this.isPlayingBGM = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    scheduleBGM() {
        if (!this.isPlayingBGM || !this.ctx) return;

        // Dark Atmospheric Dungeon Chord progression: Dm -> Bb -> Gm -> A
        const chords = [
            [146.83, 220.00, 261.63], // D3, A3, C4 (Dm7)
            [116.54, 174.61, 233.08], // Bb2, F3, Bb3
            [98.00, 146.83, 220.00],  // G2, D3, A3 (Gm9)
            [110.00, 164.81, 220.00]  // A2, E3, A3 (A)
        ];

        // Bassline pattern
        const bassNotes = [73.42, 58.27, 49.00, 55.00]; // D2, Bb1, G1, A1

        // Lead arp pattern
        const arpPatterns = [
            [293.66, 349.23, 440.00, 523.25], // D4, F4, A4, C5
            [233.08, 293.66, 349.23, 466.16], // Bb3, D4, F4, Bb4
            [196.00, 246.94, 293.66, 392.00], // G3, B3, D4, G4
            [220.00, 277.18, 329.63, 440.00]  // A3, C#4, E4, A4
        ];

        const bar = Math.floor(this.bgmStep / 8) % 4;
        const beatInBar = this.bgmStep % 8;
        const t = this.ctx.currentTime + 0.05;

        // Play Bass note on beat 0 and 4
        if (beatInBar === 0 || beatInBar === 4) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(bassNotes[bar], t);

            // Filter for deep sub rumble
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(260, t);

            gain.gain.setValueAtTime(0.22, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);

            osc.start(t);
            osc.stop(t + 0.48);
        }

        // Play soft pad on beat 0
        if (beatInBar === 0) {
            chords[bar].forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, t);

                gain.gain.setValueAtTime(0.001, t);
                gain.gain.linearRampToValueAtTime(0.06, t + 0.4);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

                osc.connect(gain);
                gain.connect(this.bgmGain);

                osc.start(t);
                osc.stop(t + 1.85);
            });
        }

        // Play Arpeggio on each eighth note
        const currentArp = arpPatterns[bar];
        const noteIdx = [0, 1, 2, 3, 2, 1, 0, 2][beatInBar];
        const leadFreq = currentArp[noteIdx];

        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(leadFreq, t);

        leadGain.gain.setValueAtTime(0.08, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);

        leadOsc.start(t);
        leadOsc.stop(t + 0.24);

        // Dungeon percussion tap (soft high tick)
        if (beatInBar % 2 === 0) {
            const tickOsc = this.ctx.createOscillator();
            const tickGain = this.ctx.createGain();
            tickOsc.type = 'square';
            tickOsc.frequency.setValueAtTime(beatInBar === 0 ? 80 : 1200, t);
            tickGain.gain.setValueAtTime(beatInBar === 0 ? 0.12 : 0.02, t);
            tickGain.gain.exponentialRampToValueAtTime(0.001, t + (beatInBar === 0 ? 0.15 : 0.04));

            tickOsc.connect(tickGain);
            tickGain.connect(this.bgmGain);

            tickOsc.start(t);
            tickOsc.stop(t + 0.16);
        }

        this.bgmStep++;
        const stepDurationMs = 240; // ~125 BPM 8th notes
        this.bgmTimer = setTimeout(() => this.scheduleBGM(), stepDurationMs);
    }
}

window.soundEngine = new SoundEngine();
