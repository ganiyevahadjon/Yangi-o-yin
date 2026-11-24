/**
 * Dungeon Escape - Handcrafted Levels (Levels 1 to 8)
 * Full tilemaps, hazards, puzzles, checkpoints, crates, keys, and gems.
 * Enhanced with one-way platforms, clear progression, and hints.
 */

class Level {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.subtitle = data.subtitle || '';
        this.hint = data.hint || '';
        this.parTime = data.parTime || 40;
        this.cols = data.cols;
        this.rows = data.rows;
        this.tileSize = 32;
        this.pixelWidth = this.cols * this.tileSize;
        this.pixelHeight = this.rows * this.tileSize;

        this.tiles = data.tiles; // 1 = solid, 2 = one-way platform
        this.playerSpawn = data.playerSpawn || { x: 64, y: 120 };

        // Entities
        this.traps = [];
        this.platforms = [];
        this.crates = [];
        this.plates = [];
        this.doors = [];
        this.keys = [];
        this.checkpoints = [];
        this.gems = [];
        this.exitPortal = null;

        this.initEntities(data);
    }

    initEntities(data) {
        if (data.movingPlatforms) {
            data.movingPlatforms.forEach(cfg => {
                const mp = new MovingPlatform(cfg);
                this.platforms.push(mp);
                this.traps.push(mp);
            });
        }

        if (data.crumblingPlatforms) {
            data.crumblingPlatforms.forEach(cfg => {
                const cp = new CrumblingPlatform(cfg);
                this.platforms.push(cp);
                this.traps.push(cp);
            });
        }

        if (data.spikes) {
            data.spikes.forEach(cfg => {
                this.traps.push(new Spike(cfg));
            });
        }

        if (data.saws) {
            data.saws.forEach(cfg => {
                this.traps.push(new SawBlade(cfg));
            });
        }

        if (data.pendulums) {
            data.pendulums.forEach(cfg => {
                this.traps.push(new Pendulum(cfg));
            });
        }

        if (data.crates) {
            data.crates.forEach(cfg => {
                this.crates.push(new PushBox(cfg));
            });
        }

        if (data.plates) {
            data.plates.forEach(cfg => {
                this.plates.push(new PressurePlate(cfg));
            });
        }

        if (data.doors) {
            data.doors.forEach(cfg => {
                this.doors.push(new GateDoor(cfg));
            });
        }

        if (data.keys) {
            data.keys.forEach(cfg => {
                this.keys.push(new KeyItem(cfg));
            });
        }

        if (data.checkpoints) {
            data.checkpoints.forEach(cfg => {
                this.checkpoints.push(new Checkpoint(cfg));
            });
        }

        if (data.gems) {
            data.gems.forEach(cfg => {
                this.gems.push(new GemItem(cfg));
            });
        }

        if (data.exitPortal) {
            this.exitPortal = new ExitPortal(data.exitPortal);
        }
    }

    findEntityById(id) {
        return (
            this.doors.find(d => d.id === id) ||
            this.plates.find(p => p.id === id) ||
            this.crates.find(c => c.id === id) ||
            this.platforms.find(p => p.id === id)
        );
    }

    /**
     * Solid tiles: ONLY walls/solid ground (# = 1), closed doors, and crates.
     * Platform tiles (= = 2) are NOT solid obstacles, they are one-way platforms.
     */
    getSolidTilesInRect(rect) {
        const solidTiles = [];
        const startCol = Math.max(0, Math.floor(rect.x / this.tileSize));
        const endCol = Math.min(this.cols - 1, Math.floor((rect.x + rect.width) / this.tileSize));
        const startRow = Math.max(0, Math.floor(rect.y / this.tileSize));
        const endRow = Math.min(this.rows - 1, Math.floor((rect.y + rect.height) / this.tileSize));

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = this.tiles[r * this.cols + c];
                if (tile === 1) { // 1 = solid brick
                    solidTiles.push({
                        x: c * this.tileSize,
                        y: r * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize
                    });
                }
            }
        }

        // Closed Gate Doors act as solid obstacles
        for (const door of this.doors) {
            if (door.isSolid && Physics.AABBIntersect(rect, door)) {
                solidTiles.push(door);
            }
        }

        // Crates act as solid obstacles for player and other crates
        for (const crate of this.crates) {
            if (crate.isSolid && crate !== rect && Physics.AABBIntersect(rect, crate)) {
                solidTiles.push(crate);
            }
        }

        return solidTiles;
    }

    /**
     * One-way platform tiles (= = 2)
     */
    getPlatformTilesInRect(rect) {
        const platformTiles = [];
        const startCol = Math.max(0, Math.floor(rect.x / this.tileSize));
        const endCol = Math.min(this.cols - 1, Math.floor((rect.x + rect.width) / this.tileSize));
        const startRow = Math.max(0, Math.floor(rect.y / this.tileSize));
        const endRow = Math.min(this.rows - 1, Math.floor((rect.y + rect.height) / this.tileSize));

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = this.tiles[r * this.cols + c];
                if (tile === 2) {
                    platformTiles.push({
                        x: c * this.tileSize,
                        y: r * this.tileSize,
                        width: this.tileSize,
                        height: 10
                    });
                }
            }
        }
        return platformTiles;
    }

    update(dt, game) {
        for (const trap of this.traps) {
            trap.update(dt, game);
            if (trap.checkHit && trap.checkHit(game.player)) {
                game.player.takeDamage(1, 0, game);
            }
        }

        for (const crate of this.crates) {
            crate.update(dt, this);
        }

        for (const plate of this.plates) {
            plate.update(dt, game);
        }

        for (const door of this.doors) {
            door.update(dt);
        }

        for (const key of this.keys) {
            key.update(dt, game);
        }

        for (const cp of this.checkpoints) {
            cp.update(dt, game);
        }

        for (const gem of this.gems) {
            gem.update(dt, game);
        }

        if (this.exitPortal) {
            this.exitPortal.update(dt, game);
        }
    }

    render(ctx, camera) {
        const s = this.tileSize;

        const startCol = Math.max(0, Math.floor(camera.x / s));
        const endCol = Math.min(this.cols, Math.ceil((camera.x + camera.width) / s) + 1);
        const startRow = Math.max(0, Math.floor(camera.y / s));
        const endRow = Math.min(this.rows, Math.ceil((camera.y + camera.height) / s) + 1);

        const bgTile = window.assets.sprites['tile_bg'];
        const brickTile = window.assets.sprites['tile_brick'];
        const platTile = window.assets.sprites['tile_platform'];

        // 1. Background layer
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                ctx.drawImage(bgTile, c * s, r * s);
            }
        }

        // 2. Solid & Platform tiles
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const t = this.tiles[r * this.cols + c];
                if (t === 1) {
                    ctx.drawImage(brickTile, c * s, r * s);
                } else if (t === 2) {
                    // One-way platform beam
                    ctx.drawImage(platTile, c * s, r * s);
                }
            }
        }

        // 3. Interactive Doors
        for (const door of this.doors) {
            door.render(ctx);
        }

        // 4. Pressure Plates
        for (const plate of this.plates) {
            plate.render(ctx);
        }

        // 5. Exit Portal
        if (this.exitPortal) {
            this.exitPortal.render(ctx);
        }

        // 6. Checkpoints
        for (const cp of this.checkpoints) {
            cp.render(ctx);
        }

        // 7. Traps
        for (const trap of this.traps) {
            trap.render(ctx);
        }

        // 8. Pushable Crates
        for (const crate of this.crates) {
            crate.render(ctx);
        }

        // 9. Keys & Gems
        for (const key of this.keys) {
            key.render(ctx);
        }
        for (const gem of this.gems) {
            gem.render(ctx);
        }
    }
}

// Level Definition Helper: converts simple ASCII row strings into tile arrays
function parseAsciiMap(asciiRows) {
    const rows = asciiRows.length;
    const cols = asciiRows[0].length;
    const tiles = new Array(rows * cols).fill(0);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const char = asciiRows[r][c];
            if (char === '#') tiles[r * cols + c] = 1;      // solid brick wall/ground
            else if (char === '=') tiles[r * cols + c] = 2;  // one-way platform (jump-through)
            else tiles[r * cols + c] = 0;                    // air
        }
    }
    return { rows, cols, tiles };
}

// -------------------------------------------------------------------------
// 8 Handcrafted Levels (Fully Playable, Tested, Clear Steps & Flow)
// -------------------------------------------------------------------------

const LEVELS_DATA = [
    // --- LEVEL 1: The Awakening ---
    {
        id: 1,
        name: "Level 1: The Awakening",
        subtitle: "Movement, One-Way Platforms & First Key",
        hint: "Oltin kalitni oling va o'ng tarafdagi portalga kiring!",
        parTime: 18,
        ...parseAsciiMap([
            "########################################",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#             ====                     #",
            "#                                      #",
            "#       ====                           #",
            "#                                      #",
            "#                                      #",
            "################    ####################",
            "################    ####################"
        ]),
        playerSpawn: { x: 48, y: 380 },
        keys: [
            { x: 440, y: 220 }
        ],
        gems: [
            { x: 240, y: 280 },
            { x: 490, y: 370 },
            { x: 800, y: 370 }
        ],
        exitPortal: { x: 1160, y: 368, requiredKeys: 1 }
    },

    // --- LEVEL 2: Spike Descent ---
    {
        id: 2,
        name: "Level 2: Spike Descent",
        subtitle: "Jump Buffering & Dangerous Spikes",
        hint: "Tikanlardan ehtiyot bo'ling! Sakrab o'ting va kalitni oling.",
        parTime: 25,
        ...parseAsciiMap([
            "########################################",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                 ====                 #",
            "#                                      #",
            "#         ====            ====         #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "######    ############    ##############",
            "######    ############    ##############"
        ]),
        playerSpawn: { x: 48, y: 380 },
        spikes: [
            { x: 192, y: 396, width: 128, direction: 'up' },
            { x: 704, y: 396, width: 128, direction: 'up' }
        ],
        checkpoints: [
            { x: 500, y: 376 }
        ],
        keys: [
            { x: 540, y: 160 }
        ],
        gems: [
            { x: 250, y: 230 },
            { x: 620, y: 370 },
            { x: 920, y: 230 }
        ],
        exitPortal: { x: 1180, y: 368, requiredKeys: 1 }
    },

    // --- LEVEL 3: The Heavy Burden ---
    {
        id: 3,
        name: "Level 3: The Heavy Burden",
        subtitle: "Push & Pull Box, Pressure Plates",
        hint: "Qutini [E] bilan torting yoki surib plita ustiga qo'ying!",
        parTime: 28,
        ...parseAsciiMap([
            "########################################",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                                      #",
            "#                   ######             #",
            "#                   #                  #",
            "#                   #                  #",
            "#                   #                  #",
            "#                   #                  #",
            "#                   #                  #",
            "########################################",
            "########################################"
        ]),
        playerSpawn: { x: 64, y: 380 },
        crates: [
            { id: 'crate_3_1', x: 260, y: 384, width: 32, height: 32 }
        ],
        plates: [
            { id: 'plate_3_1', x: 440, y: 406, targetId: 'gate_3_1' }
        ],
        doors: [
            { id: 'gate_3_1', x: 608, y: 368, width: 32, height: 48, requiresKey: false }
        ],
        gems: [
            { x: 300, y: 320 },
            { x: 500, y: 370 },
            { x: 850, y: 370 }
        ],
        exitPortal: { x: 1150, y: 368, requiredKeys: 0 }
    },

    // --- LEVEL 4: Crumbling Abyss ---
    {
        id: 4,
        name: "Level 4: Crumbling Abyss",
        subtitle: "Crumbling Platforms & Leap of Faith",
        hint: "Pollar bosgach 0.6 soniyada qulaydi, to'xtamasdan sakrang!",
        parTime: 32,
        ...parseAsciiMap([
            "############################################",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#                     ####                 #",
            "#                     ####                 #",
            "#                                          #",
            "#                                          #",
            "######                                ######",
            "######                                ######"
        ]),
        playerSpawn: { x: 48, y: 380 },
        crumblingPlatforms: [
            { x: 240, y: 390, width: 70, height: 14 },
            { x: 410, y: 360, width: 70, height: 14 },
            { x: 820, y: 360, width: 70, height: 14 },
            { x: 990, y: 390, width: 70, height: 14 }
        ],
        checkpoints: [
            { x: 672, y: 248 }
        ],
        keys: [
            { x: 688, y: 220 }
        ],
        gems: [
            { x: 275, y: 330 },
            { x: 445, y: 300 },
            { x: 855, y: 300 }
        ],
        spikes: [
            { x: 192, y: 460, width: 900, direction: 'up' }
        ],
        exitPortal: { x: 1300, y: 368, requiredKeys: 1 }
    },

    // --- LEVEL 5: Sawblade Alley ---
    {
        id: 5,
        name: "Level 5: Sawblade Alley",
        subtitle: "Spinning Blades & Upper Walkways",
        hint: "Arralar aylanayotganda yuqoridagi platformalar orqali o'ting!",
        parTime: 35,
        ...parseAsciiMap([
            "############################################",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#               ====       ====            #",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#                                          #",
            "#        ====                      ====    #",
            "#                                          #",
            "#                                          #",
            "############################################",
            "############################################"
        ]),
        playerSpawn: { x: 48, y: 380 },
        saws: [
            { x: 380, y: 396, radius: 20, rotSpeed: 8, path: [{ x: 380, y: 396 }, { x: 580, y: 396 }], speed: 70 },
            { x: 820, y: 396, radius: 20, rotSpeed: -8, path: [{ x: 820, y: 396 }, { x: 1020, y: 396 }], speed: 80 }
        ],
        checkpoints: [
            { x: 672, y: 376 }
        ],
        keys: [
            { x: 500, y: 130 }
        ],
        gems: [
            { x: 180, y: 280 },
            { x: 740, y: 130 },
            { x: 1200, y: 280 }
        ],
        exitPortal: { x: 1320, y: 368, requiredKeys: 1 }
    },

    // --- LEVEL 6: Pendulum Crypt ---
    {
        id: 6,
        name: "Level 6: Pendulum Crypt",
        subtitle: "Swinging Pendulum Axes & Moving Ledges",
        hint: "Mayatniklar tebranish vaqtini poylab sakrang!",
        parTime: 40,
        ...parseAsciiMap([
            "################################################",
            "#                                              #",
            "#                                              #",
            "#                                              #",
            "#                                              #",
            "#                                              #",
            "#                                              #",
            "#                                              #",
            "#                                              #",
            "#                 ####    ####                 #",
            "#                 ####    ####                 #",
            "#                                              #",
            "#                                              #",
            "########                                ########",
            "########                                ########"
        ]),
        playerSpawn: { x: 64, y: 380 },
        pendulums: [
            { pivotX: 380, pivotY: 60, length: 240, maxAngle: Math.PI / 3.4, freq: 1.8, phase: 0 },
            { pivotX: 1100, pivotY: 60, length: 240, maxAngle: Math.PI / 3.4, freq: 1.8, phase: Math.PI }
        ],
        movingPlatforms: [
            { x: 340, y: 400, width: 70, height: 12, waypoints: [{ x: 340, y: 400 }, { x: 480, y: 400 }], speed: 45 },
            { x: 920, y: 400, width: 70, height: 12, waypoints: [{ x: 920, y: 400 }, { x: 1060, y: 400 }], speed: 45 }
        ],
        checkpoints: [
            { x: 720, y: 248 }
        ],
        keys: [
            { x: 600, y: 240 },
            { x: 800, y: 240 }
        ],
        gems: [
            { x: 180, y: 340 },
            { x: 720, y: 180 },
            { x: 1000, y: 340 },
            { x: 1350, y: 340 }
        ],
        spikes: [
            { x: 256, y: 460, width: 960, direction: 'up' }
        ],
        exitPortal: { x: 1420, y: 368, requiredKeys: 2 }
    },

    // --- LEVEL 7: Labyrinth of Gears ---
    {
        id: 7,
        name: "Level 7: Labyrinth of Gears",
        subtitle: "Crate Transport on Moving Platform",
        hint: "Qutini harakatlanuvchi platformaga ortib tikanlar uzra o'tkazing!",
        parTime: 48,
        ...parseAsciiMap([
            "####################################################",
            "#                                                  #",
            "#                                                  #",
            "#                                                  #",
            "#                                                  #",
            "#                                                  #",
            "#                                                  #",
            "#                                                  #",
            "#                                                  #",
            "#                                      ######      #",
            "#                                      #           #",
            "#                                      #           #",
            "#                                      #           #",
            "############                           #############",
            "############                           #############"
        ]),
        playerSpawn: { x: 64, y: 380 },
        crates: [
            { id: 'crate_7_1', x: 240, y: 384, width: 32, height: 32 }
        ],
        movingPlatforms: [
            { id: 'plat_7_1', x: 420, y: 400, width: 80, height: 12, waypoints: [{ x: 420, y: 400 }, { x: 980, y: 400 }], speed: 60 }
        ],
        spikes: [
            { x: 384, y: 460, width: 736, direction: 'up' }
        ],
        plates: [
            { id: 'plate_7_1', x: 1180, y: 406, targetId: 'gate_7_1' }
        ],
        doors: [
            { id: 'gate_7_1', x: 1216, y: 368, width: 32, height: 48, requiresKey: false }
        ],
        saws: [
            { x: 700, y: 260, radius: 22, rotSpeed: 9 }
        ],
        checkpoints: [
            { x: 1140, y: 376 }
        ],
        gems: [
            { x: 200, y: 330 },
            { x: 700, y: 200 },
            { x: 1040, y: 330 },
            { x: 1450, y: 330 }
        ],
        exitPortal: { x: 1540, y: 368, requiredKeys: 0 }
    },

    // --- LEVEL 8: The Dungeon Core ---
    {
        id: 8,
        name: "Level 8: The Dungeon Core",
        subtitle: "The Final Escape: Master of Traps & Puzzles",
        hint: "Barcha 3 ta kalitni to'plab zindondan yakuniy qochishni amalga oshiring!",
        parTime: 65,
        ...parseAsciiMap([
            "############################################################",
            "#                                                          #",
            "#                                                          #",
            "#                                                          #",
            "#                                                          #",
            "#                                              ====        #",
            "#                            ====                          #",
            "#                                                          #",
            "#             ====                         ##########      #",
            "#                                          #               #",
            "#                                          #               #",
            "#     ====                                 #               #",
            "#                                          #               #",
            "########                                   #################",
            "########                                   #################"
        ]),
        playerSpawn: { x: 48, y: 380 },
        crates: [
            { id: 'crate_8_1', x: 220, y: 240, width: 32, height: 32 }
        ],
        crumblingPlatforms: [
            { x: 260, y: 400, width: 64, height: 14 },
            { x: 400, y: 380, width: 64, height: 14 }
        ],
        movingPlatforms: [
            { id: 'plat_8_1', x: 620, y: 380, width: 75, height: 12, waypoints: [{ x: 620, y: 380 }, { x: 840, y: 380 }], speed: 55 }
        ],
        pendulums: [
            { pivotX: 420, pivotY: 60, length: 220, maxAngle: Math.PI / 3.4, freq: 1.9, phase: 0 }
        ],
        saws: [
            { x: 960, y: 380, radius: 20, rotSpeed: 8, path: [{ x: 960, y: 380 }, { x: 1140, y: 380 }], speed: 65 }
        ],
        spikes: [
            { x: 256, y: 460, width: 960, direction: 'up' }
        ],
        plates: [
            { id: 'plate_8_1', x: 1400, y: 406, targetId: 'gate_8_1' }
        ],
        doors: [
            { id: 'gate_8_1', x: 1536, y: 368, width: 32, height: 48, requiresKey: false }
        ],
        checkpoints: [
            { x: 580, y: 248 },
            { x: 1350, y: 376 }
        ],
        keys: [
            { x: 440, y: 220 },
            { x: 960, y: 170 },
            { x: 1500, y: 120 }
        ],
        gems: [
            { x: 220, y: 200 },
            { x: 440, y: 160 },
            { x: 960, y: 110 },
            { x: 1400, y: 320 },
            { x: 1720, y: 320 }
        ],
        exitPortal: { x: 1800, y: 368, requiredKeys: 3 }
    }
];

window.LEVELS_DATA = LEVELS_DATA;
window.Level = Level;
