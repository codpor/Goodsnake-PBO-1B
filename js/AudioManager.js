class AudioManager {
    constructor() {
        this.currentBGM = null;
        this.isSoundMuted = false;
    }

    toggleSound() {
        this.isSoundMuted = !this.isSoundMuted;
        if (this.currentBGM) {
            if (this.isSoundMuted) this.currentBGM.pause();
            else if (!this.currentBGM.isPlaying()) this.currentBGM.loop();
        }
    }

    playSound(soundName) {
        if (!USE_AUDIO || this.isSoundMuted || !assets.sfx[soundName]) return;
        assets.sfx[soundName].play();
    }

    playBGM(type) {
        if (!USE_AUDIO) return;
        if (this.currentBGM && this.currentBGM.isPlaying()) {
            this.currentBGM.stop();
        }

        const bgmMap = {
            'MENU': assets.sfx.bgmMenu,
            'SURVIVAL': assets.sfx.bgmSurvival,
            'CLASSIC': assets.sfx.bgmClassic
        };

        this.currentBGM = bgmMap[type];

        if (this.currentBGM && !this.isSoundMuted) {
            this.currentBGM.setVolume(0.3);
            this.currentBGM.loop();
        }
    }

    setBGMVolume(vol) {
        if (!this.isSoundMuted && this.currentBGM && this.currentBGM.isPlaying()) {
            this.currentBGM.setVolume(vol, 0.5);
        }
    }

    stopAll() {
        if (this.currentBGM) {
            this.currentBGM.stop();
        }
    }
}