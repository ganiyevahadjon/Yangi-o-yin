/**
 * Dungeon Escape - Procedural Pixel Art Asset Generator
 * Creates crisp, retro pixel-art sprites and tilemaps directly on offscreen canvases.
 */
class AssetManager {
    constructor() {
        this.sprites = {};
        this.tileSize = 32;
    }

    init() {
        this.generateTiles();
        this.generatePlayerAnimations();
        this.generateTraps();
        this.generateInteractiveObjects();
        this.generateHUDIcons();
    }

    createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        return { canvas: c, ctx: ctx };
    }

    // --- Tiles Generation ---
    generateTiles() {
        const s = this.tileSize;

        // 1. Brick Ground / Solid Wall
        const { canvas: brick, ctx: bctx } = this.createCanvas(s, s);
        bctx.fillStyle = '#2b2333';
        bctx.fillRect(0, 0, s, s);
        bctx.fillStyle = '#3c3247';
        // Draw stone bricks
        bctx.fillRect(1, 1, 14, 14);
        bctx.fillRect(17, 1, 14, 14);
        bctx.fillRect(1, 17, 22, 14);
        bctx.fillRect(25, 17, 6, 14);
        // Highlights & Shadows
        bctx.fillStyle = '#4f445c';
        bctx.fillRect(1, 1, 14, 2);
        bctx.fillRect(17, 1, 14, 2);
        bctx.fillRect(1, 17, 22, 2);
        bctx.fillStyle = '#1a1421';
        bctx.fillRect(0, 0, s, 1);
        bctx.fillRect(0, 15, s, 2);
        bctx.fillRect(15, 0, 2, 16);
        bctx.fillRect(23, 16, 2, 16);
        // Cracks
        bctx.fillStyle = '#16101c';
        bctx.fillRect(5, 5, 2, 4);
        bctx.fillRect(7, 9, 3, 1);
        this.sprites['tile_brick'] = brick;

        // 2. Brick Top Floor (with grass/moss edge)
        const { canvas: bTop, ctx: btctx } = this.createCanvas(s, s);
        btctx.drawImage(brick, 0, 0);
        btctx.fillStyle = '#4a5b3a'; // moss
        btctx.fillRect(0, 0, s, 3);
        btctx.fillStyle = '#687e4f'; // highlight moss
        btctx.fillRect(2, 0, 6, 2);
        btctx.fillRect(12, 0, 8, 2);
        btctx.fillRect(24, 0, 5, 2);
        btctx.fillStyle = '#26341d';
        btctx.fillRect(3, 3, 2, 2);
        btctx.fillRect(14, 3, 3, 1);
        btctx.fillRect(26, 3, 2, 2);
        this.sprites['tile_brick_top'] = bTop;

        // 3. Platform (Thin wooden/stone beam with metal brackets)
        const { canvas: plat, ctx: pctx } = this.createCanvas(s, s);
        pctx.fillStyle = '#4a3728';
        pctx.fillRect(0, 0, s, 10);
        pctx.fillStyle = '#6b513c';
        pctx.fillRect(0, 0, s, 2);
        pctx.fillStyle = '#2d1f14';
        pctx.fillRect(0, 8, s, 2);
        // Metal braces on edges
        pctx.fillStyle = '#7a8288';
        pctx.fillRect(2, 0, 4, 10);
        pctx.fillRect(s - 6, 0, 4, 10);
        pctx.fillStyle = '#cbd3d9';
        pctx.fillRect(3, 1, 2, 2);
        pctx.fillRect(s - 5, 1, 2, 2);
        this.sprites['tile_platform'] = plat;

        // 4. Crumbling Platform (cracked, jagged stone slab)
        const { canvas: crumb, ctx: cctx } = this.createCanvas(s, s);
        cctx.fillStyle = '#4a423b';
        cctx.fillRect(0, 0, s, 14);
        cctx.fillStyle = '#665d54';
        cctx.fillRect(0, 0, s, 3);
        cctx.fillStyle = '#26211c';
        cctx.fillRect(0, 11, s, 3);
        // Prominent cracks
        cctx.fillStyle = '#14110e';
        cctx.fillRect(6, 1, 2, 11);
        cctx.fillRect(8, 5, 4, 2);
        cctx.fillRect(19, 2, 2, 10);
        cctx.fillRect(21, 6, 5, 2);
        this.sprites['tile_crumble'] = crumb;

        // 5. Dungeon Background Wall
        const { canvas: bg, ctx: bgctx } = this.createCanvas(s, s);
        bgctx.fillStyle = '#141019';
        bgctx.fillRect(0, 0, s, s);
        bgctx.fillStyle = '#1d1724';
        bgctx.fillRect(2, 2, 13, 13);
        bgctx.fillRect(17, 2, 13, 13);
        bgctx.fillRect(2, 17, 28, 13);
        bgctx.fillStyle = '#0f0c13';
        bgctx.strokeRect(0.5, 0.5, s - 1, s - 1);
        this.sprites['tile_bg'] = bg;
    }

    // --- Traps Generation ---
    generateTraps() {
        const s = this.tileSize;

        // 1. Spikes (Up, Down, Left, Right)
        const drawSpikeTriangle = (ctx, x, y, w, h, dir) => {
            ctx.save();
            ctx.translate(x + w / 2, y + h / 2);
            if (dir === 'down') ctx.rotate(Math.PI);
            if (dir === 'left') ctx.rotate(-Math.PI / 2);
            if (dir === 'right') ctx.rotate(Math.PI / 2);

            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(w / 2, h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.closePath();
            ctx.fillStyle = '#7a8288';
            ctx.fill();

            // Highlight side
            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-w / 2, h / 2);
            ctx.lineTo(0, h / 2);
            ctx.closePath();
            ctx.fillStyle = '#bcc5cc';
            ctx.fill();

            // Blood tip accent
            ctx.fillStyle = '#9e1a1a';
            ctx.fillRect(-1, -h / 2, 2, 4);

            ctx.restore();
        };

        const { canvas: spU, ctx: uctx } = this.createCanvas(s, s);
        drawSpikeTriangle(uctx, 0, 12, 10, 20, 'up');
        drawSpikeTriangle(uctx, 11, 10, 10, 22, 'up');
        drawSpikeTriangle(uctx, 22, 12, 10, 20, 'up');
        this.sprites['spike_up'] = spU;

        const { canvas: spD, ctx: dctx } = this.createCanvas(s, s);
        drawSpikeTriangle(dctx, 0, 0, 10, 20, 'down');
        drawSpikeTriangle(dctx, 11, 0, 10, 22, 'down');
        drawSpikeTriangle(dctx, 22, 0, 10, 20, 'down');
        this.sprites['spike_down'] = spD;

        // 2. Rotating Saw Blade (40x40)
        const sawSize = 40;
        const { canvas: saw, ctx: sctx } = this.createCanvas(sawSize, sawSize);
        const center = sawSize / 2;
        const numTeeth = 8;
        const outerR = 18;
        const innerR = 13;

        sctx.save();
        sctx.translate(center, center);
        sctx.beginPath();
        for (let i = 0; i < numTeeth; i++) {
            const a1 = (i / numTeeth) * Math.PI * 2;
            const a2 = ((i + 0.5) / numTeeth) * Math.PI * 2;
            const a3 = ((i + 1) / numTeeth) * Math.PI * 2;
            sctx.lineTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
            sctx.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
            sctx.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
        }
        sctx.closePath();
        sctx.fillStyle = '#8f9aa3';
        sctx.fill();
        sctx.strokeStyle = '#3d444a';
        sctx.lineWidth = 1.5;
        sctx.stroke();

        // Inner blade plate
        sctx.beginPath();
        sctx.arc(0, 0, 8, 0, Math.PI * 2);
        sctx.fillStyle = '#555f69';
        sctx.fill();
        sctx.stroke();

        // Center axle screw
        sctx.beginPath();
        sctx.arc(0, 0, 3, 0, Math.PI * 2);
        sctx.fillStyle = '#d8e1e8';
        sctx.fill();
        sctx.restore();
        this.sprites['saw_blade'] = saw;

        // 3. Pendulum Axe Blade
        const { canvas: pend, ctx: pndctx } = this.createCanvas(36, 36);
        pndctx.save();
        pndctx.translate(18, 18);
        pndctx.beginPath();
        pndctx.arc(0, -6, 18, 0.2 * Math.PI, 0.8 * Math.PI, false);
        pndctx.lineTo(0, 16);
        pndctx.closePath();
        pndctx.fillStyle = '#8f9aa3';
        pndctx.fill();
        pndctx.strokeStyle = '#2b3036';
        pndctx.lineWidth = 2;
        pndctx.stroke();

        // Sharp edge highlight
        pndctx.beginPath();
        pndctx.arc(0, -6, 18, 0.25 * Math.PI, 0.75 * Math.PI, false);
        pndctx.strokeStyle = '#e6edf2';
        pndctx.lineWidth = 2;
        pndctx.stroke();

        pndctx.restore();
        this.sprites['pendulum_blade'] = pend;
    }

    // --- Interactive Objects Generation ---
    generateInteractiveObjects() {
        const s = this.tileSize;

        // 1. Pushable Box / Crate (32x32)
        const { canvas: crate, ctx: crctx } = this.createCanvas(s, s);
        crctx.fillStyle = '#7a5130';
        crctx.fillRect(0, 0, s, s);
        // Wood grain
        crctx.fillStyle = '#9e6d44';
        crctx.fillRect(2, 2, s - 4, s - 4);
        // Diagonal cross braces
        crctx.fillStyle = '#5c3b20';
        crctx.beginPath();
        crctx.moveTo(3, 3);
        crctx.lineTo(s - 3, s - 3);
        crctx.lineTo(s - 6, s - 3);
        crctx.lineTo(3, 6);
        crctx.fill();
        crctx.beginPath();
        crctx.moveTo(s - 3, 3);
        crctx.lineTo(3, s - 3);
        crctx.lineTo(6, s - 3);
        crctx.lineTo(s - 3, 6);
        crctx.fill();
        // Iron corners & studs
        crctx.fillStyle = '#4a5359';
        crctx.fillRect(0, 0, 7, 7);
        crctx.fillRect(s - 7, 0, 7, 7);
        crctx.fillRect(0, s - 7, 7, 7);
        crctx.fillRect(s - 7, s - 7, 7, 7);
        crctx.fillStyle = '#c5d1d9';
        crctx.fillRect(2, 2, 2, 2);
        crctx.fillRect(s - 4, 2, 2, 2);
        crctx.fillRect(2, s - 4, 2, 2);
        crctx.fillRect(s - 4, s - 4, 2, 2);
        // Outer dark border
        crctx.strokeStyle = '#2b1b0d';
        crctx.lineWidth = 2;
        crctx.strokeRect(1, 1, s - 2, s - 2);
        this.sprites['crate'] = crate;

        // 2. Pressure Plate (Up and Down)
        const { canvas: plUp, ctx: puctx } = this.createCanvas(s, 12);
        puctx.fillStyle = '#2b2333';
        puctx.fillRect(2, 6, s - 4, 6); // base
        puctx.fillStyle = '#a68032'; // brass top raised
        puctx.fillRect(4, 2, s - 8, 5);
        puctx.fillStyle = '#ffd700';
        puctx.fillRect(5, 2, s - 10, 2);
        this.sprites['plate_up'] = plUp;

        const { canvas: plDown, ctx: pdctx } = this.createCanvas(s, 12);
        pdctx.fillStyle = '#2b2333';
        pdctx.fillRect(2, 6, s - 4, 6);
        pdctx.fillStyle = '#7a5e24'; // brass pressed down
        pdctx.fillRect(4, 6, s - 8, 3);
        pdctx.fillStyle = '#b3903b';
        pdctx.fillRect(5, 6, s - 10, 1);
        this.sprites['plate_down'] = plDown;

        // 3. Golden Key (16x24)
        const { canvas: key, ctx: kctx } = this.createCanvas(20, 24);
        kctx.fillStyle = '#e6a817';
        // Key bow / loop
        kctx.beginPath();
        kctx.arc(10, 6, 5, 0, Math.PI * 2);
        kctx.fill();
        kctx.fillStyle = '#141019';
        kctx.beginPath();
        kctx.arc(10, 6, 2.5, 0, Math.PI * 2);
        kctx.fill();
        // Key stem & teeth
        kctx.fillStyle = '#ffc83b';
        kctx.fillRect(8, 10, 4, 12);
        kctx.fillRect(12, 17, 4, 2);
        kctx.fillRect(12, 21, 3, 2);
        // Golden glint
        kctx.fillStyle = '#fff4cc';
        kctx.fillRect(9, 3, 2, 2);
        kctx.fillRect(9, 12, 1, 8);
        this.sprites['key'] = key;

        // 4. Locked Door / Gate (32x48)
        const { canvas: doorC, ctx: dctx } = this.createCanvas(s, 48);
        dctx.fillStyle = '#1d1724';
        dctx.fillRect(0, 0, s, 48);
        // Stone Arch
        dctx.strokeStyle = '#4f445c';
        dctx.lineWidth = 3;
        dctx.strokeRect(1, 1, s - 2, 46);
        // Iron portcullis bars
        dctx.fillStyle = '#555f69';
        for (let x = 6; x < s - 4; x += 6) {
            dctx.fillRect(x, 4, 3, 40);
        }
        dctx.fillRect(4, 14, s - 8, 3);
        dctx.fillRect(4, 30, s - 8, 3);
        // Padlock in center
        dctx.fillStyle = '#c99a24';
        dctx.fillRect(12, 20, 8, 10);
        dctx.fillStyle = '#111';
        dctx.fillRect(15, 24, 2, 4);
        this.sprites['door_closed'] = doorC;

        // Open Exit Door (with glowing mystical portal)
        const { canvas: doorO, ctx: doctx } = this.createCanvas(s, 48);
        doctx.fillStyle = '#130d24';
        doctx.fillRect(0, 0, s, 48);
        // Swirling Portal Interior
        const grad = doctx.createRadialGradient(s / 2, 26, 2, s / 2, 26, 16);
        grad.addColorStop(0, '#58d5ff');
        grad.addColorStop(0.5, '#7b3fe4');
        grad.addColorStop(1, '#1b0c36');
        doctx.fillStyle = grad;
        doctx.fillRect(4, 8, s - 8, 36);
        // Outer arch
        doctx.strokeStyle = '#6f5e82';
        doctx.lineWidth = 3;
        doctx.strokeRect(1, 1, s - 2, 46);
        this.sprites['door_open'] = doorO;

        // 5. Checkpoint Altar (32x40)
        const generateCheckpoint = (active) => {
            const { canvas: cp, ctx: cpctx } = this.createCanvas(s, 40);
            // Stone base pedestal
            cpctx.fillStyle = '#3a3242';
            cpctx.fillRect(4, 24, 24, 16);
            cpctx.fillStyle = '#584c63';
            cpctx.fillRect(2, 34, 28, 6);
            // Rune carving
            cpctx.fillStyle = active ? '#5affb0' : '#455a75';
            cpctx.fillRect(14, 28, 4, 2);
            cpctx.fillRect(15, 26, 2, 6);
            // Crystal on top
            cpctx.beginPath();
            cpctx.moveTo(16, 4);
            cpctx.lineTo(22, 16);
            cpctx.lineTo(16, 23);
            cpctx.lineTo(10, 16);
            cpctx.closePath();
            cpctx.fillStyle = active ? '#38ef7d' : '#3498db';
            cpctx.fill();
            cpctx.strokeStyle = active ? '#eaffd0' : '#9ec5e8';
            cpctx.lineWidth = 1.5;
            cpctx.stroke();
            return cp;
        };
        this.sprites['checkpoint_off'] = generateCheckpoint(false);
        this.sprites['checkpoint_on'] = generateCheckpoint(true);

        // 6. Gem / Ruby (16x16)
        const { canvas: gem, ctx: gmctx } = this.createCanvas(16, 16);
        gmctx.beginPath();
        gmctx.moveTo(8, 2);
        gmctx.lineTo(14, 6);
        gmctx.lineTo(8, 14);
        gmctx.lineTo(2, 6);
        gmctx.closePath();
        gmctx.fillStyle = '#e74c3c';
        gmctx.fill();
        gmctx.fillStyle = '#f39c12';
        gmctx.beginPath();
        gmctx.moveTo(8, 2);
        gmctx.lineTo(14, 6);
        gmctx.lineTo(8, 7);
        gmctx.closePath();
        gmctx.fill();
        gmctx.fillStyle = '#ffffff';
        gmctx.fillRect(7, 4, 2, 2);
        this.sprites['gem'] = gem;
    }

    // --- Player Sprite Sheets & Animation Frames (40x40 High-Contrast) ---
    generatePlayerAnimations() {
        const fw = 40;
        const fh = 40;

        const drawPlayerBase = (ctx, frame, anim) => {
            ctx.save();

            let bob = 0;
            let legLx = -4, legLy = 5;
            let legRx = 2, legRy = 5;
            let armAngle = 0;

            if (anim === 'idle') {
                bob = Math.sin(frame * Math.PI / 2) * 1;
            } else if (anim === 'walk') {
                // Clear, distinct step-by-step walking cycle
                // 6 frames: 0-2 (Right step), 3-5 (Left step)
                const walkCycle = [
                    // Right foot steps forward, left foot pushes back
                    { bob: 0, lx: -7, ly: 5, rx: 7,  ry: 5, arm: -4 }, // Frame 0: Right heel contact
                    { bob: 1, lx: -2, ly: 1, rx: 3,  ry: 5, arm: -2 }, // Frame 1: Left knee bent/lifted, Right flat
                    { bob: 0, lx: 2,  ly: 2, rx: -3, ry: 5, arm: 1  }, // Frame 2: Left swinging forward
                    // Left foot steps forward, right foot pushes back
                    { bob: 0, lx: 7,  ly: 5, rx: -7, ry: 5, arm: 4  }, // Frame 3: Left heel contact
                    { bob: 1, lx: 3,  ly: 5, rx: -2, ry: 1, arm: 2  }, // Frame 4: Right knee bent/lifted, Left flat
                    { bob: 0, lx: -3, ly: 5, rx: 2,  ry: 2, arm: -1 }  // Frame 5: Right swinging forward
                ];
                const c = walkCycle[frame % 6];
                bob = c.bob;
                legLx = c.lx;
                legLy = c.ly;
                legRx = c.rx;
                legRy = c.ry;
                armAngle = c.arm;
            } else if (anim === 'jump') {
                bob = -3;
                legLx = -5; legLy = 2;
                legRx = 1; legRy = 2;
            } else if (anim === 'fall') {
                bob = 2;
                legLx = -6; legLy = 6;
                legRx = 3; legRy = 6;
            }

            const cx = fw / 2;
            const cy = 20 - bob;

            // 1. Cape behind (rich red)
            ctx.fillStyle = '#8a182b';
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy - 4);
            const capeWave = (anim === 'walk') ? (frame % 2 === 0 ? -3 : -1) : ((anim === 'jump') ? -5 : 0);
            ctx.lineTo(cx - 10 + capeWave, cy + 12);
            ctx.lineTo(cx + 2, cy + 12);
            ctx.lineTo(cx + 6, cy - 4);
            ctx.closePath();
            ctx.fill();

            // 2. Legs & Boots (High-contrast leather boots that are 100% visible on dungeon stone)
            const drawBoot = (lx, ly) => {
                // Dark pants
                ctx.fillStyle = '#1c1926';
                ctx.fillRect(cx + lx, cy + ly, 4, 6);

                // Bright leather boot
                ctx.fillStyle = '#d9822b';
                ctx.fillRect(cx + lx - 1, cy + ly + 4, 6, 4);

                // Boot highlight
                ctx.fillStyle = '#f5af5d';
                ctx.fillRect(cx + lx, cy + ly + 4, 4, 2);

                // Dark sole
                ctx.fillStyle = '#3d2109';
                ctx.fillRect(cx + lx - 1, cy + ly + 7, 7, 2);
            };

            // Draw back leg first, then front leg
            if (anim === 'walk' && frame >= 3) {
                drawBoot(legRx, legRy);
                drawBoot(legLx, legLy);
            } else {
                drawBoot(legLx, legLy);
                drawBoot(legRx, legRy);
            }

            // 3. Body / Tunic
            ctx.fillStyle = '#2d3748';
            ctx.fillRect(cx - 7, cy - 5, 14, 11);

            // Belt & buckle
            ctx.fillStyle = '#6b4f2c';
            ctx.fillRect(cx - 7, cy + 3, 14, 3);
            ctx.fillStyle = '#ffd700'; // Gold buckle
            ctx.fillRect(cx - 2, cy + 2, 5, 5);
            ctx.fillStyle = '#111';
            ctx.fillRect(cx - 1, cy + 3, 3, 3);

            // 4. Arms
            ctx.fillStyle = '#1c1926';
            ctx.fillRect(cx + 6, cy - 4 + armAngle, 4, 8);
            ctx.fillStyle = '#f0c294'; // hand
            ctx.fillRect(cx + 6, cy + 4 + armAngle, 4, 3);

            // 5. Head & Hood
            ctx.fillStyle = '#a62439'; // Red hood
            ctx.beginPath();
            ctx.arc(cx, cy - 9, 7.5, 0, Math.PI * 2);
            ctx.fill();

            // Face shadow inside hood
            ctx.fillStyle = '#140c12';
            ctx.fillRect(cx - 4, cy - 9, 9, 6);

            // Glowing hero eyes (bright cyan)
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(cx - 2, cy - 8, 2, 2);
            ctx.fillRect(cx + 2, cy - 8, 2, 2);

            ctx.restore();
        };

        const animations = {
            idle: 4,
            walk: 6,
            jump: 1,
            fall: 1,
            hurt: 2,
            die: 6
        };

        this.sprites.player = {};

        for (const [anim, count] of Object.entries(animations)) {
            this.sprites.player[anim] = [];
            for (let f = 0; f < count; f++) {
                const { canvas, ctx } = this.createCanvas(fw, fh);

                if (anim === 'hurt') {
                    drawPlayerBase(ctx, f, 'idle');
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = f === 0 ? 'rgba(255, 60, 60, 0.75)' : 'rgba(255, 255, 255, 0.85)';
                    ctx.fillRect(0, 0, fw, fh);
                } else if (anim === 'die') {
                    ctx.save();
                    const fade = 1 - f / 5.5;
                    ctx.globalAlpha = Math.max(0, fade);
                    drawPlayerBase(ctx, f, 'idle');
                    ctx.restore();
                } else {
                    drawPlayerBase(ctx, f, anim);
                }

                this.sprites.player[anim].push(canvas);
            }
        }
    }

    // --- HUD Icons ---
    generateHUDIcons() {
        // Heart Full (16x16)
        const { canvas: hFull, ctx: fctx } = this.createCanvas(16, 16);
        fctx.fillStyle = '#e74c3c';
        fctx.beginPath();
        fctx.moveTo(8, 14);
        fctx.bezierCurveTo(2, 9, 0, 5, 0, 3.5);
        fctx.bezierCurveTo(0, 1, 2, 0, 4.5, 0);
        fctx.bezierCurveTo(6.5, 0, 7.5, 1.5, 8, 2.5);
        fctx.bezierCurveTo(8.5, 1.5, 9.5, 0, 11.5, 0);
        fctx.bezierCurveTo(14, 0, 16, 1, 16, 3.5);
        fctx.bezierCurveTo(16, 5, 14, 9, 8, 14);
        fctx.fill();
        fctx.fillStyle = '#ff8d85'; // shine
        fctx.fillRect(3, 2, 2, 2);
        this.sprites['heart_full'] = hFull;

        // Heart Empty (16x16)
        const { canvas: hEmpty, ctx: ectx } = this.createCanvas(16, 16);
        ectx.drawImage(hFull, 0, 0);
        ectx.globalCompositeOperation = 'source-in';
        ectx.fillStyle = '#3a2d3e';
        ectx.fillRect(0, 0, 16, 16);
        this.sprites['heart_empty'] = hEmpty;

        // Star (24x24) for Level Complete / Select
        const { canvas: star, ctx: sctx } = this.createCanvas(24, 24);
        sctx.save();
        sctx.translate(12, 12);
        sctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const a1 = (i * 72 - 90) * Math.PI / 180;
            const a2 = ((i * 72 + 36) - 90) * Math.PI / 180;
            sctx.lineTo(Math.cos(a1) * 11, Math.sin(a1) * 11);
            sctx.lineTo(Math.cos(a2) * 5, Math.sin(a2) * 5);
        }
        sctx.closePath();
        sctx.fillStyle = '#f1c40f';
        sctx.fill();
        sctx.strokeStyle = '#d68910';
        sctx.lineWidth = 1.5;
        sctx.stroke();
        sctx.fillStyle = '#fff5a5';
        sctx.fillRect(-2, -6, 4, 3);
        sctx.restore();
        this.sprites['star_full'] = star;

        // Star Empty
        const { canvas: sEmpty, ctx: sectx } = this.createCanvas(24, 24);
        sectx.drawImage(star, 0, 0);
        sectx.globalCompositeOperation = 'source-in';
        sectx.fillStyle = '#443b4f';
        sectx.fillRect(0, 0, 24, 24);
        this.sprites['star_empty'] = sEmpty;
    }
}

window.assets = new AssetManager();
