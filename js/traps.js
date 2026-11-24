/**
 * Dungeon Escape - Traps System
 * 4 Trap Types: Moving Platform, Crumbling Platform, Spikes, Rotating Saws & Pendulums.
 */

// 1. Moving Platform
class MovingPlatform {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 64;
        this.height = config.height || 12;
        this.waypoints = config.waypoints || [{ x: config.x, y: config.y }];
        this.speed = config.speed || 50;
        this.currentWaypointIndex = 0;
        this.targetWaypointIndex = 1 % this.waypoints.length;
        this.isSolid = true;
        this.type = 'moving_platform';
        this.vx = 0;
        this.vy = 0;
        this.isActive = config.isActive !== undefined ? config.isActive : true;
    }

    update(dt, game) {
        if (!this.isActive || this.waypoints.length <= 1) {
            this.vx = 0;
            this.vy = 0;
            return;
        }

        const target = this.waypoints[this.targetWaypointIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
            this.x = target.x;
            this.y = target.y;
            this.currentWaypointIndex = this.targetWaypointIndex;
            this.targetWaypointIndex = (this.targetWaypointIndex + 1) % this.waypoints.length;
            this.vx = 0;
            this.vy = 0;
        } else {
            const moveDist = this.speed * dt;
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;

            const nextX = this.x + (dx / dist) * Math.min(moveDist, dist);
            const nextY = this.y + (dy / dist) * Math.min(moveDist, dist);

            const deltaX = nextX - this.x;
            const deltaY = nextY - this.y;

            this.x = nextX;
            this.y = nextY;

            // Carry player if on top
            const player = game.player;
            if (
                player &&
                player.isGrounded &&
                player.y + player.height >= this.y - 2 &&
                player.y + player.height <= this.y + 6 &&
                player.x + player.width > this.x &&
                player.x < this.x + this.width
            ) {
                player.x += deltaX;
                player.y += deltaY;
            }

            // Carry crates if on top
            if (game.level && game.level.crates) {
                for (const crate of game.level.crates) {
                    if (
                        crate.isGrounded &&
                        crate.y + crate.height >= this.y - 2 &&
                        crate.y + crate.height <= this.y + 6 &&
                        crate.x + crate.width > this.x &&
                        crate.x < this.x + this.width
                    ) {
                        crate.x += deltaX;
                        crate.y += deltaY;
                    }
                }
            }
        }
    }

    render(ctx) {
        ctx.save();
        const platSpr = window.assets.sprites['tile_platform'];
        const numTiles = Math.ceil(this.width / 32);
        for (let i = 0; i < numTiles; i++) {
            const w = Math.min(32, this.width - i * 32);
            ctx.drawImage(platSpr, 0, 0, w, 12, this.x + i * 32, this.y, w, 12);
        }

        // Iron gear rivets
        ctx.fillStyle = '#cbd3d9';
        ctx.fillRect(this.x + 4, this.y + 3, 3, 3);
        ctx.fillRect(this.x + this.width - 7, this.y + 3, 3, 3);

        ctx.restore();
    }
}

// 2. Crumbling Platform
class CrumblingPlatform {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 48;
        this.height = config.height || 14;
        this.state = 'idle'; // idle, shaking, fallen, respawning
        this.timer = 0;
        this.shakeDuration = 0.6; // 0.6s before fall
        this.respawnDelay = 2.4;  // 2.4s to regenerate
        this.isSolid = true;
        this.shakeOffset = 0;
        this.alpha = 1.0;
        this.type = 'crumbling_platform';
    }

    onStepped(entity) {
        if (this.state === 'idle') {
            this.state = 'shaking';
            this.timer = this.shakeDuration;
            if (window.soundEngine) window.soundEngine.playCrumble();
        }
    }

    update(dt, game) {
        if (this.state === 'shaking') {
            this.timer -= dt;
            this.shakeOffset = (Math.random() * 4 - 2);
            if (Math.random() < 0.3) {
                window.particleSystem.addDust(this.x + Math.random() * this.width, this.y + this.height, 1);
            }
            if (this.timer <= 0) {
                this.state = 'fallen';
                this.isSolid = false;
                this.timer = this.respawnDelay;
                window.particleSystem.addCrumble(this.x, this.y, this.width, this.height);
            }
        } else if (this.state === 'fallen') {
            this.timer -= dt;
            if (this.timer <= 0.4) {
                this.state = 'respawning';
            }
        } else if (this.state === 'respawning') {
            this.timer -= dt;
            this.alpha = Math.min(1.0, 1.0 - (this.timer / 0.4));
            if (this.timer <= 0) {
                this.state = 'idle';
                this.isSolid = true;
                this.alpha = 1.0;
                this.shakeOffset = 0;
                window.particleSystem.addDust(this.x + this.width / 2, this.y, 4);
            }
        }
    }

    render(ctx) {
        if (this.state === 'fallen') return;

        ctx.save();
        ctx.globalAlpha = this.state === 'respawning' ? this.alpha : 1.0;
        const drawX = this.x + (this.state === 'shaking' ? this.shakeOffset : 0);
        const crumbSpr = window.assets.sprites['tile_crumble'];

        const numTiles = Math.ceil(this.width / 32);
        for (let i = 0; i < numTiles; i++) {
            const w = Math.min(32, this.width - i * 32);
            ctx.drawImage(crumbSpr, 0, 0, w, this.height, drawX + i * 32, this.y, w, this.height);
        }

        ctx.restore();
    }
}

// 3. Spikes (Hazard)
class Spike {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 32;
        this.height = config.height || 20;
        this.direction = config.direction || 'up'; // 'up', 'down', 'left', 'right'
        this.isDynamic = config.isDynamic || false;
        this.period = config.period || 2.0;
        this.activeTime = config.activeTime || 1.2;
        this.timer = 0;
        this.isExtended = true;
    }

    update(dt) {
        if (!this.isDynamic) return;
        this.timer = (this.timer + dt) % this.period;
        this.isExtended = this.timer < this.activeTime;
    }

    render(ctx) {
        if (this.isDynamic && !this.isExtended) {
            // Draw recessed trap slot
            ctx.fillStyle = '#1a1421';
            ctx.fillRect(this.x, this.y + 14, this.width, 6);
            return;
        }

        const spr = this.direction === 'down' ? window.assets.sprites['spike_down'] : window.assets.sprites['spike_up'];
        const num = Math.ceil(this.width / 32);
        for (let i = 0; i < num; i++) {
            ctx.drawImage(spr, this.x + i * 32, this.y);
        }
    }

    checkHit(entity) {
        if (this.isDynamic && !this.isExtended) return false;
        // Hitbox slightly inset for fair gameplay
        const hitbox = {
            x: this.x + 4,
            y: this.y + (this.direction === 'up' ? 6 : 0),
            width: this.width - 8,
            height: this.height - 6
        };
        return Physics.AABBIntersect(entity, hitbox);
    }
}

// 4. Rotating Traps (Saw Blade & Swinging Pendulum)
class SawBlade {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.radius = config.radius || 20;
        this.angle = 0;
        this.rotSpeed = config.rotSpeed || 8.0; // rad/s
        this.path = config.path || null; // e.g. [{x, y}, {x, y}]
        this.speed = config.speed || 60;
        this.targetIndex = 1;
    }

    update(dt) {
        this.angle += this.rotSpeed * dt;

        // Patrol along path if configured
        if (this.path && this.path.length > 1) {
            const target = this.path[this.targetIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 2) {
                this.targetIndex = (this.targetIndex + 1) % this.path.length;
            } else {
                this.x += (dx / dist) * this.speed * dt;
                this.y += (dy / dist) * this.speed * dt;
            }
        }
    }

    render(ctx) {
        ctx.save();
        // If on a rail, draw the metal guide rail
        if (this.path && this.path.length > 1) {
            ctx.strokeStyle = '#2b2333';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(this.path[0].x, this.path[0].y);
            for (let i = 1; i < this.path.length; i++) {
                ctx.lineTo(this.path[i].x, this.path[i].y);
            }
            ctx.stroke();
        }

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const spr = window.assets.sprites['saw_blade'];
        ctx.drawImage(spr, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        ctx.restore();
    }

    checkHit(entity) {
        // Circle vs AABB collision
        const closestX = Math.max(entity.x, Math.min(this.x, entity.x + entity.width));
        const closestY = Math.max(entity.y, Math.min(this.y, entity.y + entity.height));
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        return (dx * dx + dy * dy) < (this.radius * 0.85) * (this.radius * 0.85);
    }
}

class Pendulum {
    constructor(config) {
        this.pivotX = config.pivotX;
        this.pivotY = config.pivotY;
        this.length = config.length || 90;
        this.maxAngle = config.maxAngle || (Math.PI / 3); // 60 deg
        this.freq = config.freq || 2.2;
        this.phase = config.phase || 0;
        this.time = 0;
        this.bladeX = this.pivotX;
        this.bladeY = this.pivotY + this.length;
        this.radius = 18;
    }

    update(dt) {
        this.time += dt;
        const currentAngle = this.maxAngle * Math.sin(this.freq * this.time + this.phase);
        this.bladeX = this.pivotX + Math.sin(currentAngle) * this.length;
        this.bladeY = this.pivotY + Math.cos(currentAngle) * this.length;
        this.currentAngle = currentAngle;
    }

    render(ctx) {
        ctx.save();
        // Pivot base mount
        ctx.fillStyle = '#4a5359';
        ctx.beginPath();
        ctx.arc(this.pivotX, this.pivotY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Chain links
        ctx.strokeStyle = '#555f69';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(this.pivotX, this.pivotY);
        ctx.lineTo(this.bladeX, this.bladeY);
        ctx.stroke();

        // Axe blade at end
        ctx.translate(this.bladeX, this.bladeY);
        ctx.rotate(this.currentAngle);
        const spr = window.assets.sprites['pendulum_blade'];
        ctx.drawImage(spr, -18, -18, 36, 36);
        ctx.restore();
    }

    checkHit(entity) {
        const closestX = Math.max(entity.x, Math.min(this.bladeX, entity.x + entity.width));
        const closestY = Math.max(entity.y, Math.min(this.bladeY, entity.y + entity.height));
        const dx = this.bladeX - closestX;
        const dy = this.bladeY - closestY;
        return (dx * dx + dy * dy) < (this.radius * 0.85) * (this.radius * 0.85);
    }
}

window.MovingPlatform = MovingPlatform;
window.CrumblingPlatform = CrumblingPlatform;
window.Spike = Spike;
window.SawBlade = SawBlade;
window.Pendulum = Pendulum;
