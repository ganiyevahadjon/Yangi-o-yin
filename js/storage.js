/**
 * Dungeon Escape - Save / Load System & Local Storage Manager
 * Stores unlocked levels, best times, collected stars, and audio settings.
 * Supports JSON file export and import.
 */
class SaveSystem {
    constructor() {
        this.STORAGE_KEY = 'dungeon_escape_save_v1';
        this.data = this.getDefaults();
        this.load();
    }

    getDefaults() {
        return {
            unlockedLevel: 1,
            levels: {
                // 1: { stars: 0, bestTime: null, maxGems: 3, collectedGems: 0 }
            },
            settings: {
                bgmVolume: 0.5,
                sfxVolume: 0.7,
                isFullscreen: false
            }
        };
    }

    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.data = Object.assign(this.getDefaults(), parsed);
            }
        } catch (e) {
            console.warn('Could not read save data from localStorage:', e);
            this.data = this.getDefaults();
        }
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.error('Could not save progress to localStorage:', e);
        }
    }

    recordLevelCompletion(levelId, stars, timeTaken, gemsCount) {
        if (!this.data.levels[levelId]) {
            this.data.levels[levelId] = {
                stars: 0,
                bestTime: null,
                gems: 0
            };
        }

        const lvl = this.data.levels[levelId];
        lvl.stars = Math.max(lvl.stars || 0, stars);
        lvl.gems = Math.max(lvl.gems || 0, gemsCount);

        if (lvl.bestTime === null || timeTaken < lvl.bestTime) {
            lvl.bestTime = timeTaken;
        }

        // Unlock next level
        if (levelId + 1 > this.data.unlockedLevel) {
            this.data.unlockedLevel = levelId + 1;
        }

        this.save();
    }

    isLevelUnlocked(levelId) {
        return levelId <= this.data.unlockedLevel;
    }

    getLevelStats(levelId) {
        return this.data.levels[levelId] || { stars: 0, bestTime: null, gems: 0 };
    }

    exportJSON() {
        const jsonStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dungeon_escape_save_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed && typeof parsed.unlockedLevel === 'number') {
                this.data = parsed;
                this.save();
                return true;
            }
        } catch (e) {
            console.error('Failed to parse import JSON:', e);
        }
        return false;
    }

    unlockAllLevels() {
        this.data.unlockedLevel = 8;
        for (let i = 1; i <= 8; i++) {
            if (!this.data.levels[i]) {
                this.data.levels[i] = { stars: 1, bestTime: 30.0, gems: 2 };
            }
        }
        this.save();
    }

    resetAllProgress() {
        this.data = this.getDefaults();
        this.save();
    }
}

window.saveSystem = new SaveSystem();
