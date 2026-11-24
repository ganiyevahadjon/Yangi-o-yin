/**
 * Dungeon Escape - Main Game Coordinator
 * Manages game loop, camera, lighting, state transitions, inputs, and scoring.
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.width = 640;
        this.height = 360;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.state = 'title'; // 'title', 'menu', 'playing', 'paused', 'win'
        this.currentLevelId = 1;
        this.level = null;
        this.player = null;

        // Camera
        this.camera = {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };

        // Level Tracking
        this.levelTimer = 0;
        this.levelDeaths = 0;
        this.collectedGemsCount = 0;
        this.totalGemsCount = 0;
        this.activeCheckpointPos = null;

        // Input state
        this.input = {
            moveLeft: false,
            moveRight: false,
            isJumpPressed: false,
            isJumpHeld: false,
            interactHeld: false
        };

        // Last timestamp
        this.lastTime = 0;
    }

    init() {
        // Init assets and audio
        window.assets.init();
        window.soundEngine.init();
        window.uiManager.init(this);

        this.bindInputEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Start BGM on first user interaction
        const startAudioOnce = () => {
            window.soundEngine.resume();
            window.soundEngine.startBGM();
            window.removeEventListener('keydown', startAudioOnce);
            window.removeEventListener('click', startAudioOnce);
        };
        window.addEventListener('keydown', startAudioOnce);
        window.addEventListener('click', startAudioOnce);

        // Start main loop
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        const container = document.getElementById('game-container');
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;

        const scale = Math.max(1, Math.min(containerW / this.width, containerH / this.height));
        this.canvas.style.width = `${Math.floor(this.width * scale)}px`;
        this.canvas.style.height = `${Math.floor(this.height * scale)}px`;
    }

    bindInputEvents() {
        window.addEventListener('keydown', (e) => {
            // Esc or P to toggle Pause
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.state === 'playing') {
                    this.pauseGame();
                } else if (this.state === 'paused') {
                    this.resumeGame();
                }
                return;
            }

            if (this.state !== 'playing') return;

            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                this.input.moveLeft = true;
            }
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                this.input.moveRight = true;
            }
            if (e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                if (!this.input.isJumpHeld) {
                    this.input.isJumpPressed = true;
                }
                this.input.isJumpHeld = true;
                e.preventDefault();
            }
            if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
                this.input.interactHeld = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                this.input.moveLeft = false;
            }
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                this.input.moveRight = false;
            }
            if (e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                this.input.isJumpHeld = false;
            }
            if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
                this.input.interactHeld = false;
            }
        });
    }

    startLevel(levelId) {
        this.currentLevelId = levelId;
        const levelData = window.LEVELS_DATA.find(l => l.id === levelId) || window.LEVELS_DATA[0];

        this.level = new Level(levelData);
        this.player = new Player(this.level.playerSpawn.x, this.level.playerSpawn.y);

        this.levelTimer = 0;
        this.levelDeaths = 0;
        this.collectedGemsCount = 0;
        this.totalGemsCount = this.level.gems.length;
        this.activeCheckpointPos = { x: this.level.playerSpawn.x, y: this.level.playerSpawn.y };

        window.particleSystem.clear();

        // Snap camera immediately to player spawn
        this.updateCamera(1.0);

        this.state = 'playing';
        window.uiManager.showHUD(this.level.hint);
        window.soundEngine.resume();
        window.soundEngine.startBGM();
    }

    restartLevel() {
        if (window.soundEngine) window.soundEngine.playClick();
        window.uiManager.hidePauseMenu();
        this.startLevel(this.currentLevelId);
    }

    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            window.uiManager.showPauseMenu();
        }
    }

    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            window.uiManager.hidePauseMenu();
        }
    }

    setActiveCheckpoint(x, y) {
        this.activeCheckpointPos = { x, y };
    }

    onPlayerDeath() {
        this.levelDeaths++;

        // Respawn at last activated checkpoint
        const spawnX = this.activeCheckpointPos ? this.activeCheckpointPos.x : this.level.playerSpawn.x;
        const spawnY = this.activeCheckpointPos ? this.activeCheckpointPos.y : this.level.playerSpawn.y;

        this.player.reset(spawnX, spawnY);
        this.updateCamera(1.0); // center camera immediately on respawn
    }

    onLevelComplete() {
        if (this.state !== 'playing') return;
        this.state = 'win';

        // Calculate Stars:
        // 1 Star: Just complete the level
        // 2 Stars: <= 1 death and >= 60% of gems collected
        // 3 Stars: 0 deaths, 100% of gems, and time <= parTime
        let stars = 1;

        const gemRatio = this.totalGemsCount > 0 ? (this.collectedGemsCount / this.totalGemsCount) : 1;
        const isFast = this.levelTimer <= this.level.parTime;

        if (this.levelDeaths <= 1 && gemRatio >= 0.6) {
            stars = 2;
        }

        if (this.levelDeaths === 0 && this.collectedGemsCount === this.totalGemsCount && isFast) {
            stars = 3;
        }

        // Save progress
        window.saveSystem.recordLevelCompletion(
            this.currentLevelId,
            stars,
            this.levelTimer,
            this.collectedGemsCount
        );

        // Format time string
        const m = Math.floor(this.levelTimer / 60);
        const s = Math.floor(this.levelTimer % 60);
        const ms = Math.floor((this.levelTimer % 1) * 10);
        const timeStr = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms} (Par: ${this.level.parTime}s)`;

        // Show UI Modal
        window.uiManager.showLevelComplete({
            levelName: this.level.name,
            timeString: timeStr,
            gemsCollected: this.collectedGemsCount,
            totalGems: this.totalGemsCount,
            deaths: this.levelDeaths,
            stars: stars
        });
    }

    updateCamera(lerpFactor = 0.12) {
        if (!this.player || !this.level) return;

        const targetX = this.player.x + this.player.width / 2 - this.width / 2;
        const targetY = this.player.y + this.player.height / 2 - this.height / 2;

        if (lerpFactor >= 1.0) {
            this.camera.x = targetX;
            this.camera.y = targetY;
        } else {
            this.camera.x += (targetX - this.camera.x) * lerpFactor;
            this.camera.y += (targetY - this.camera.y) * lerpFactor;
        }

        // Clamp camera to level bounds
        const maxCamX = Math.max(0, this.level.pixelWidth - this.width);
        const maxCamY = Math.max(0, this.level.pixelHeight - this.height);

        this.camera.x = Math.max(0, Math.min(this.camera.x, maxCamX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxCamY));
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // Clamp dt to prevent tunneling
        this.lastTime = timestamp;

        if (this.state === 'playing') {
            this.update(dt);
        }

        this.render();

        // Reset one-frame input triggers
        this.input.isJumpPressed = false;

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        this.levelTimer += dt;

        // Update player
        if (this.player) {
            this.player.update(dt, this.input, this);
        }

        // Update level entities
        if (this.level) {
            this.level.update(dt, this);
        }

        // Update particles
        window.particleSystem.update(dt);

        // Smooth camera follow
        this.updateCamera(0.12);

        // Update HUD
        if (this.player) {
            const hasCheckpoint = this.activeCheckpointPos &&
                (this.activeCheckpointPos.x !== this.level.playerSpawn.x || this.activeCheckpointPos.y !== this.level.playerSpawn.y);

            window.uiManager.updateHUD(
                this.player.health,
                this.player.maxHealth,
                this.player.keys,
                this.collectedGemsCount,
                this.totalGemsCount,
                this.levelTimer,
                hasCheckpoint
            );
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.state === 'title' || this.state === 'menu') {
            // Draw title background ambiance
            this.renderMenuBackground();
            return;
        }

        if (!this.level || !this.player) return;

        this.ctx.save();
        // Camera translation (rounded to avoid sub-pixel jitter)
        this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

        // 1. Render Level (Background, Tiles, Traps, Crates, Items, Doors)
        this.level.render(this.ctx, this.camera);

        // 2. Render Player
        this.player.render(this.ctx);

        // 3. Render Particle Effects
        window.particleSystem.render(this.ctx);

        this.ctx.restore();

        // 4. Render 2D Dynamic Lighting & Dungeon Vignette
        this.renderLighting();
    }

    renderLighting() {
        if (!this.player) return;

        const screenPlayerX = Math.round(this.player.x + this.player.width / 2 - this.camera.x);
        const screenPlayerY = Math.round(this.player.y + this.player.height / 2 - this.camera.y);

        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';

        // Dark dungeon darkness canvas
        const lightGrad = this.ctx.createRadialGradient(
            screenPlayerX, screenPlayerY, 15,
            screenPlayerX, screenPlayerY, 210
        );
        lightGrad.addColorStop(0, 'rgba(255, 235, 195, 1.0)');
        lightGrad.addColorStop(0.5, 'rgba(160, 130, 150, 0.85)');
        lightGrad.addColorStop(1, 'rgba(15, 10, 20, 0.88)');

        this.ctx.fillStyle = lightGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Screen edge vignette
        const vigGrad = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.height * 0.4,
            this.width / 2, this.height / 2, this.width * 0.65
        );
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, 'rgba(5, 2, 10, 0.65)');
        this.ctx.fillStyle = vigGrad;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.restore();
    }

    renderMenuBackground() {
        // Atmospheric title animation
        const t = performance.now() * 0.001;
        this.ctx.fillStyle = '#0f0c14';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Slow parallax brick pattern
        const bgTile = window.assets.sprites['tile_bg'];
        if (bgTile) {
            const offX = Math.floor((t * 15) % 32);
            for (let y = 0; y < this.height; y += 32) {
                for (let x = -32; x < this.width + 32; x += 32) {
                    this.ctx.drawImage(bgTile, x - offX, y);
                }
            }
        }

        // Soft ambient pulsing light in center
        const grad = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 20,
            this.width / 2, this.height / 2, 240
        );
        const pulse = 0.5 + Math.sin(t * 2) * 0.15;
        grad.addColorStop(0, `rgba(100, 50, 150, ${pulse})`);
        grad.addColorStop(1, 'rgba(10, 5, 15, 0.95)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.game.init();
});
