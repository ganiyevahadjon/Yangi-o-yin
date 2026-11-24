/**
 * Automated Verification Test for Dungeon Escape
 */
const fs = require('fs');
const path = require('path');

// Mock window and browser globals
global.window = global;
global.document = {
    createElement: () => ({
        width: 32,
        height: 32,
        getContext: () => ({
            fillRect: () => {},
            clearRect: () => {},
            drawImage: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            fill: () => {},
            stroke: () => {},
            strokeRect: () => {},
            arc: () => {},
            bezierCurveTo: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            scale: () => {},
            rotate: () => {},
            createRadialGradient: () => ({ addColorStop: () => {} }),
            imageSmoothingEnabled: false
        })
    })
};
global.localStorage = {
    _data: {},
    getItem(key) { return this._data[key] || null; },
    setItem(key, val) { this._data[key] = val; }
};

// Load modules
require('../js/physics.js');
require('../js/particles.js');
require('../js/assets.js');
require('../js/traps.js');
require('../js/puzzles.js');
require('../js/levels.js');
require('../js/storage.js');
require('../js/player.js');

console.log('Testing Assets Generation...');
window.assets.init();
const expectedSprites = [
    'tile_brick', 'tile_brick_top', 'tile_platform', 'tile_crumble', 'tile_bg',
    'spike_up', 'spike_down', 'saw_blade', 'pendulum_blade',
    'crate', 'plate_up', 'plate_down', 'key', 'door_closed', 'door_open',
    'checkpoint_off', 'checkpoint_on', 'gem', 'heart_full', 'heart_empty', 'star_full'
];
for (const s of expectedSprites) {
    if (!window.assets.sprites[s]) {
        throw new Error(`Missing sprite: ${s}`);
    }
}
console.log('✔ All procedural sprites generated successfully.');

console.log('Testing Player Animations...');
const anims = ['idle', 'walk', 'jump', 'fall', 'hurt', 'die'];
for (const a of anims) {
    if (!window.assets.sprites.player[a] || window.assets.sprites.player[a].length === 0) {
        throw new Error(`Missing player animation: ${a}`);
    }
}
console.log('✔ All player animations generated.');

console.log('Testing 8 Handcrafted Levels...');
if (window.LEVELS_DATA.length !== 8) {
    throw new Error(`Expected 8 levels, got ${window.LEVELS_DATA.length}`);
}

window.LEVELS_DATA.forEach((lvlData, idx) => {
    const lvl = new window.Level(lvlData);
    if (!lvl.playerSpawn || typeof lvl.playerSpawn.x !== 'number') {
        throw new Error(`Level ${lvlData.id} has invalid playerSpawn`);
    }
    if (!lvl.exitPortal) {
        throw new Error(`Level ${lvlData.id} missing exit portal`);
    }
    console.log(`✔ Level ${lvlData.id}: "${lvl.name}" initialized (Traps: ${lvl.traps.length}, Crates: ${lvl.crates.length}, Keys: ${lvl.keys.length}, Gems: ${lvl.gems.length})`);
});

console.log('Testing Physics & Collision...');
const boxA = { x: 10, y: 10, width: 20, height: 20 };
const boxB = { x: 20, y: 20, width: 20, height: 20 };
const boxC = { x: 50, y: 50, width: 20, height: 20 };

if (!window.Physics.AABBIntersect(boxA, boxB)) {
    throw new Error('AABBIntersect failed on overlapping boxes');
}
if (window.Physics.AABBIntersect(boxA, boxC)) {
    throw new Error('AABBIntersect false positive on distant boxes');
}
console.log('✔ Physics AABB math verified.');

console.log('Testing Save / Load System...');
window.saveSystem.recordLevelCompletion(1, 3, 14.5, 3);
if (window.saveSystem.data.unlockedLevel !== 2) {
    throw new Error('Level unlock failed');
}
const stats = window.saveSystem.getLevelStats(1);
if (stats.stars !== 3 || stats.bestTime !== 14.5) {
    throw new Error('Save stats mismatch');
}
console.log('✔ Save / Load persistence verified.');

console.log('\n======================================================');
console.log('  ALL AUTOMATED TESTS PASSED SUCCESSFULLY! (100%)');
console.log('======================================================\n');
