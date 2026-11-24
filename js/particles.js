/**
 * Dungeon Escape - Particle System & Visual FX
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += (p.gravity || 0) * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / p.maxLife);
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
            }
            ctx.restore();
        }
    }

    addDust(x, y, count = 4) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() * 8 - 4),
                y: y + (Math.random() * 4 - 2),
                vx: (Math.random() * 60 - 30),
                vy: -(Math.random() * 20 + 10),
                gravity: 30,
                size: Math.random() * 3 + 2,
                color: '#655773',
                life: 0.35 + Math.random() * 0.2,
                maxLife: 0.5,
                shape: 'rect'
            });
        }
    }

    addCrumble(x, y, w, h) {
        for (let i = 0; i < 14; i++) {
            this.particles.push({
                x: x + Math.random() * w,
                y: y + Math.random() * h,
                vx: (Math.random() * 80 - 40),
                vy: (Math.random() * 60 - 20),
                gravity: 400,
                size: Math.random() * 4 + 2,
                color: ['#4a423b', '#665d54', '#26211c'][Math.floor(Math.random() * 3)],
                life: 0.8 + Math.random() * 0.5,
                maxLife: 1.2,
                shape: 'rect'
            });
        }
    }

    addSparkles(x, y, color = '#f1c40f', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 100 + 40;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 80,
                size: Math.random() * 3 + 2,
                color: color,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.8,
                shape: 'circle'
            });
        }
    }

    addHitSparks(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 120 + 30;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 250,
                size: Math.random() * 3 + 1.5,
                color: ['#e74c3c', '#ff7675', '#ffffff'][Math.floor(Math.random() * 3)],
                life: 0.35 + Math.random() * 0.2,
                maxLife: 0.55,
                shape: 'rect'
            });
        }
    }

    addDeathSouls(x, y) {
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 140 + 20;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 40,
                gravity: -30,
                size: Math.random() * 4 + 2,
                color: ['#48dbfb', '#a29bfe', '#e84393', '#ffffff'][Math.floor(Math.random() * 4)],
                life: 0.8 + Math.random() * 0.5,
                maxLife: 1.3,
                shape: 'circle'
            });
        }
    }

    clear() {
        this.particles = [];
    }
}

window.particleSystem = new ParticleSystem();
