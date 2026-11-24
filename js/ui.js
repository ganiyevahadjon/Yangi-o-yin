/**
 * Dungeon Escape - UI & Screen Manager
 * Manages Title Screen, Level Select, HUD, Pause Menu, Level Complete, and Settings.
 */
class UIManager {
    constructor() {
        this.game = null;
        this.cacheDOM();
        this.bindEvents();
    }

    init(game) {
        this.game = game;
        this.applySettingsToDOM();
    }

    cacheDOM() {
        // Screens & Modals
        this.screenTitle = document.getElementById('screen-title');
        this.screenLevelSelect = document.getElementById('screen-level-select');
        this.hud = document.getElementById('hud');
        this.modalPause = document.getElementById('modal-pause');
        this.modalWin = document.getElementById('modal-win');
        this.modalSettings = document.getElementById('modal-settings');

        // HUD elements
        this.hudHearts = document.getElementById('hud-hearts');
        this.hudKeys = document.getElementById('hud-keys');
        this.hudGems = document.getElementById('hud-gems');
        this.hudTimer = document.getElementById('hud-timer');
        this.hudCheckpoint = document.getElementById('hud-checkpoint');
        this.hudHint = document.getElementById('hud-hint');
        this.btnPause = document.getElementById('btn-pause-hud');

        // Buttons
        this.btnPlay = document.getElementById('btn-play');
        this.btnLevels = document.getElementById('btn-levels');
        this.btnSettings = document.getElementById('btn-settings');

        // Level Select Grid
        this.levelGrid = document.getElementById('level-grid');
        this.btnBackFromLevels = document.getElementById('btn-back-levels');
        this.btnUnlockAll = document.getElementById('btn-unlock-all');

        // Pause Modal buttons
        this.btnResume = document.getElementById('btn-resume');
        this.btnRestart = document.getElementById('btn-restart');
        this.btnPauseSettings = document.getElementById('btn-pause-settings');
        this.btnPauseLevels = document.getElementById('btn-pause-levels');
        this.btnPauseMenu = document.getElementById('btn-pause-menu');

        // Level Complete elements
        this.winLevelName = document.getElementById('win-level-name');
        this.winTime = document.getElementById('win-time');
        this.winGems = document.getElementById('win-gems');
        this.winDeaths = document.getElementById('win-deaths');
        this.winStars = document.getElementById('win-stars');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnReplay = document.getElementById('btn-replay');
        this.btnWinLevels = document.getElementById('btn-win-levels');

        // Settings elements
        this.sliderBGM = document.getElementById('slider-bgm');
        this.sliderSFX = document.getElementById('slider-sfx');
        this.valBGM = document.getElementById('val-bgm');
        this.valSFX = document.getElementById('val-sfx');
        this.btnFullscreen = document.getElementById('btn-fullscreen');
        this.btnExport = document.getElementById('btn-export-save');
        this.btnImport = document.getElementById('btn-import-save');
        this.fileInput = document.getElementById('file-import');
        this.btnReset = document.getElementById('btn-reset-save');
        this.btnCloseSettings = document.getElementById('btn-close-settings');
    }

    bindEvents() {
        // Title Screen
        this.btnPlay.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            const unlocked = window.saveSystem.data.unlockedLevel;
            this.game.startLevel(Math.min(unlocked, 8));
        });

        this.btnLevels.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.showLevelSelect();
        });

        this.btnSettings.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.showSettings();
        });

        this.btnBackFromLevels.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.showTitleScreen();
        });

        if (this.btnUnlockAll) {
            this.btnUnlockAll.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playClick();
                window.saveSystem.unlockAllLevels();
                this.renderLevelGrid();
            });
        }

        // HUD Pause button
        this.btnPause.addEventListener('click', () => {
            if (this.game.state === 'playing') {
                this.game.pauseGame();
            }
        });

        // Pause Menu
        this.btnResume.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.game.resumeGame();
        });

        this.btnRestart.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.game.restartLevel();
        });

        this.btnPauseSettings.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.showSettings();
        });

        this.btnPauseLevels.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.modalPause.classList.add('hidden');
            this.showLevelSelect();
        });

        this.btnPauseMenu.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.modalPause.classList.add('hidden');
            this.showTitleScreen();
        });

        // Level Complete
        this.btnNextLevel.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.modalWin.classList.add('hidden');
            const nextLvlId = this.game.currentLevelId + 1;
            if (nextLvlId <= 8) {
                this.game.startLevel(nextLvlId);
            } else {
                this.showLevelSelect();
            }
        });

        this.btnReplay.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.modalWin.classList.add('hidden');
            this.game.restartLevel();
        });

        this.btnWinLevels.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.modalWin.classList.add('hidden');
            this.showLevelSelect();
        });

        // Settings Sliders
        this.sliderBGM.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.valBGM.textContent = Math.round(val * 100) + '%';
            window.soundEngine.setBGMVolume(val);
            window.saveSystem.data.settings.bgmVolume = val;
            window.saveSystem.save();
        });

        this.sliderSFX.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.valSFX.textContent = Math.round(val * 100) + '%';
            window.soundEngine.setSFXVolume(val);
            window.saveSystem.data.settings.sfxVolume = val;
            window.saveSystem.save();
        });

        this.btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        });

        this.btnExport.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            window.saveSystem.exportJSON();
        });

        this.btnImport.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const ok = window.saveSystem.importJSON(evt.target.result);
                if (ok) {
                    alert('Progress muvaffaqiyatli yuklandi!');
                    this.renderLevelGrid();
                    this.applySettingsToDOM();
                } else {
                    alert('Xato: JSON formati yaroqsiz!');
                }
            };
            reader.readAsText(file);
        });

        this.btnReset.addEventListener('click', () => {
            if (confirm('Barcha progressni tozalashni tasdiqlaysizmi?')) {
                window.saveSystem.resetAllProgress();
                this.renderLevelGrid();
                alert('Barcha progress tozalandi.');
            }
        });

        this.btnCloseSettings.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playClick();
            this.modalSettings.classList.add('hidden');
        });
    }

    applySettingsToDOM() {
        const s = window.saveSystem.data.settings;
        this.sliderBGM.value = s.bgmVolume;
        this.sliderSFX.value = s.sfxVolume;
        this.valBGM.textContent = Math.round(s.bgmVolume * 100) + '%';
        this.valSFX.textContent = Math.round(s.sfxVolume * 100) + '%';
        window.soundEngine.setBGMVolume(s.bgmVolume);
        window.soundEngine.setSFXVolume(s.sfxVolume);
    }

    showTitleScreen() {
        this.screenTitle.classList.remove('hidden');
        this.screenLevelSelect.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.modalPause.classList.add('hidden');
        this.modalWin.classList.add('hidden');
        this.modalSettings.classList.add('hidden');
        this.game.state = 'title';
    }

    showLevelSelect() {
        this.renderLevelGrid();
        this.screenTitle.classList.add('hidden');
        this.screenLevelSelect.classList.remove('hidden');
        this.hud.classList.add('hidden');
        this.modalPause.classList.add('hidden');
        this.modalWin.classList.add('hidden');
        this.game.state = 'menu';
    }

    showSettings() {
        this.modalSettings.classList.remove('hidden');
    }

    showHUD(hintText = '') {
        this.screenTitle.classList.add('hidden');
        this.screenLevelSelect.classList.add('hidden');
        this.hud.classList.remove('hidden');

        if (this.hudHint) {
            if (hintText) {
                this.hudHint.textContent = `💡 ${hintText}`;
                this.hudHint.style.display = 'block';
            } else {
                this.hudHint.style.display = 'none';
            }
        }
    }

    showPauseMenu() {
        this.modalPause.classList.remove('hidden');
    }

    hidePauseMenu() {
        this.modalPause.classList.add('hidden');
    }

    showLevelComplete(stats) {
        this.winLevelName.textContent = stats.levelName;
        this.winTime.textContent = stats.timeString;
        this.winGems.textContent = `${stats.gemsCollected} / ${stats.totalGems}`;
        this.winDeaths.textContent = stats.deaths;

        // Render stars
        this.winStars.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const span = document.createElement('span');
            span.className = i <= stats.stars ? 'star full' : 'star empty';
            span.textContent = '★';
            this.winStars.appendChild(span);
        }

        // Hide "Next Level" button if Level 8 completed
        if (this.game.currentLevelId >= 8) {
            this.btnNextLevel.style.display = 'none';
        } else {
            this.btnNextLevel.style.display = 'inline-block';
        }

        this.modalWin.classList.remove('hidden');
        if (window.soundEngine) window.soundEngine.playWin();
    }

    updateHUD(health, maxHealth, keys, gems, totalGems, timerSec, hasCheckpoint) {
        // Hearts
        let heartsHTML = '';
        for (let i = 0; i < maxHealth; i++) {
            heartsHTML += i < health ? '<span class="heart full">❤️</span>' : '<span class="heart empty">🖤</span>';
        }
        this.hudHearts.innerHTML = heartsHTML;

        // Keys & Gems
        this.hudKeys.textContent = `🔑 ${keys}`;
        this.hudGems.textContent = `💎 ${gems}/${totalGems}`;

        // Timer
        const m = Math.floor(timerSec / 60);
        const s = Math.floor(timerSec % 60);
        const ms = Math.floor((timerSec % 1) * 10);
        this.hudTimer.textContent = `⏱ ${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms}`;

        // Checkpoint indicator
        if (hasCheckpoint) {
            this.hudCheckpoint.innerHTML = '🚩 Checkpoint: <span class="active">FAOL</span>';
        } else {
            this.hudCheckpoint.innerHTML = '🚩 Checkpoint: <span class="dormant">Boshlanish</span>';
        }
    }

    renderLevelGrid() {
        this.levelGrid.innerHTML = '';
        const unlocked = window.saveSystem.data.unlockedLevel;

        window.LEVELS_DATA.forEach(lvl => {
            const card = document.createElement('div');
            const isUnlocked = lvl.id <= unlocked;
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;

            const stats = window.saveSystem.getLevelStats(lvl.id);

            let starsHTML = '';
            for (let i = 1; i <= 3; i++) {
                starsHTML += `<span class="star ${i <= stats.stars ? 'full' : 'empty'}">★</span>`;
            }

            const bestTimeStr = stats.bestTime ? `${stats.bestTime.toFixed(1)}s` : '--';

            card.innerHTML = `
                <div class="level-num">Level ${lvl.id}</div>
                <div class="level-title">${lvl.subtitle || lvl.name}</div>
                <div class="level-stars">${starsHTML}</div>
                <div class="level-best">⏱ Rekord: ${bestTimeStr}</div>
                ${!isUnlocked ? '<div class="lock-overlay">🔒 Qulflangan</div>' : ''}
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    if (window.soundEngine) window.soundEngine.playClick();
                    this.game.startLevel(lvl.id);
                });
            }

            this.levelGrid.appendChild(card);
        });
    }
}

window.uiManager = new UIManager();
