/**
 * Dungeon Escape - Puzzles & Interactive Objects
 * 3 Core Puzzle Types: Pressure Plates, Pushable/Pullable Crates, Locked Doors & Keys.
 * Also includes Exit Portals, Checkpoint Altars, and Collectible Gems.
 */

// 1. Pushable & Pullable Box / Crate
class PushBox {
    constructor(config) {
        this.id = config.id || ('crate_' + Math.random().toString(36).substr(2, 5));
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.mass = 1.0;
        this.isSolid = true;
        this.isBeingGrabbed = false;
        this.type = 'push_box';
    }

    update(dt, level) {
        // Gravity
        const gravity = 980;
        this.vy += gravity * dt;
        if (this.vy > 600) this.vy = 600;

        // Friction on horizontal velocity
        if (!this.isBeingGrabbed) {
            this.vx *= 0.7;
            if (Math.abs(this.vx) < 2) this.vx = 0;
        }

        // Horizontal movement & collision
        Physics.moveAndCollideX(this, this.vx, dt, level);

        // Check vertical movement & collision
        this.isGrounded = false;
        Physics.moveAndCollideY(this, this.vy, dt, level);
    }

    render(ctx) {
        ctx.save();
        const spr = window.assets.sprites['crate'];
        ctx.drawImage(spr, this.x, this.y, this.width, this.height);

        // Highlight if being grabbed with E
        if (this.isBeingGrabbed) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
}

// 2. Pressure Plate
class PressurePlate {
    constructor(config) {
        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 32;
        this.height = 10;
        this.targetId = config.targetId; // ID of door or platform to trigger
        this.isPressed = false;
        this.type = 'pressure_plate';
    }

    update(dt, game) {
        const triggerArea = {
            x: this.x + 2,
            y: this.y - 4,
            width: this.width - 4,
            height: 8
        };

        let pressedNow = false;

        // Check if player is on the plate
        if (game.player && Physics.AABBIntersect(game.player, triggerArea)) {
            pressedNow = true;
        }

        // Check if any crate is on the plate
        if (game.level && game.level.crates) {
            for (const crate of game.level.crates) {
                if (Physics.AABBIntersect(crate, triggerArea)) {
                    pressedNow = true;
                    break;
                }
            }
        }

        if (pressedNow !== this.isPressed) {
            this.isPressed = pressedNow;
            if (window.soundEngine) window.soundEngine.playPlate();

            // Notify target entity (e.g. door or moving platform)
            if (this.targetId && game.level) {
                const target = game.level.findEntityById(this.targetId);
                if (target && target.onPlateStateChange) {
                    target.onPlateStateChange(this.isPressed);
                }
            }
        }
    }

    render(ctx) {
        ctx.save();
        const spr = this.isPressed ? window.assets.sprites['plate_down'] : window.assets.sprites['plate_up'];
        ctx.drawImage(spr, this.x, this.y);
        ctx.restore();
    }
}

// 3. Locked Door / Gate
class GateDoor {
    constructor(config) {
        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.initialY = config.y;
        this.width = config.width || 32;
        this.height = config.height || 48;
        this.requiresKey = config.requiresKey || false;
        this.keyColor = config.keyColor || 'gold';
        this.isOpen = false;
        this.openHeight = this.height - 4;
        this.currentOpenOffset = 0; // 0 to openHeight
        this.isSolid = true;
        this.type = 'gate_door';
    }

    onPlateStateChange(isPressed) {
        // Only responds to plate if not a permanent key-locked door
        if (!this.requiresKey) {
            this.setOpen(isPressed);
        }
    }

    unlockWithKey() {
        if (!this.isOpen) {
            this.setOpen(true);
            if (window.soundEngine) window.soundEngine.playDoorOpen();
        }
    }

    setOpen(open) {
        if (this.isOpen !== open) {
            this.isOpen = open;
            if (window.soundEngine) window.soundEngine.playDoorOpen();
        }
    }

    update(dt) {
        const targetOffset = this.isOpen ? this.openHeight : 0;
        const speed = 120; // px/s

        if (this.currentOpenOffset < targetOffset) {
            this.currentOpenOffset = Math.min(targetOffset, this.currentOpenOffset + speed * dt);
        } else if (this.currentOpenOffset > targetOffset) {
            this.currentOpenOffset = Math.max(targetOffset, this.currentOpenOffset - speed * dt);
        }

        this.isSolid = this.currentOpenOffset < (this.openHeight * 0.7);
    }

    render(ctx) {
        ctx.save();
        // Background doorway dark cavity
        ctx.fillStyle = '#100c14';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Iron gate sliding upwards
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.clip();

        const spr = window.assets.sprites['door_closed'];
        ctx.drawImage(spr, this.x, this.y - this.currentOpenOffset, this.width, this.height);
        ctx.restore();

        // Stone frame borders
        ctx.strokeStyle = '#4f445c';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }
}

// 4. Golden Key
class KeyItem {
    constructor(config) {
        this.id = config.id || ('key_' + Math.random().toString(36).substr(2, 5));
        this.x = config.x;
        this.y = config.y;
        this.baseY = config.y;
        this.width = 20;
        this.height = 24;
        this.isCollected = false;
        this.bobTimer = Math.random() * Math.PI * 2;
        this.targetDoorId = config.targetDoorId || null;
        this.type = 'key';
    }

    update(dt, game) {
        if (this.isCollected) return;
        this.bobTimer += dt * 3.5;
        this.y = this.baseY + Math.sin(this.bobTimer) * 4;

        if (game.player && Physics.AABBIntersect(game.player, this)) {
            this.isCollected = true;
            game.player.keys++;
            if (window.soundEngine) window.soundEngine.playKey();
            window.particleSystem.addSparkles(this.x + 10, this.y + 12, '#ffd700', 16);

            // If key is tied to a specific door, unlock it
            if (this.targetDoorId && game.level) {
                const door = game.level.findEntityById(this.targetDoorId);
                if (door && door.unlockWithKey) {
                    door.unlockWithKey();
                }
            }
        }
    }

    render(ctx) {
        if (this.isCollected) return;
        ctx.save();
        const spr = window.assets.sprites['key'];

        // Glowing golden halo
        const haloGrad = ctx.createRadialGradient(this.x + 10, this.y + 12, 2, this.x + 10, this.y + 12, 14);
        haloGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
        haloGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(this.x + 10, this.y + 12, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(spr, this.x, this.y);
        ctx.restore();
    }
}

// 5. Exit Portal (Level Complete Door)
class ExitPortal {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 32;
        this.height = config.height || 48;
        this.requiredKeys = config.requiredKeys || 0;
        this.isUnlocked = this.requiredKeys === 0;
        this.portalTimer = 0;
        this.type = 'exit_portal';
    }

    update(dt, game) {
        this.portalTimer += dt * 4;

        // Check if player has collected required keys
        if (!this.isUnlocked && game.player && game.player.keys >= this.requiredKeys) {
            this.isUnlocked = true;
            if (window.soundEngine) window.soundEngine.playDoorOpen();
            window.particleSystem.addSparkles(this.x + 16, this.y + 24, '#58d5ff', 20);
        }

        // Check if player enters portal
        if (this.isUnlocked && game.player) {
            if (Physics.AABBIntersect(game.player, this)) {
                game.onLevelComplete();
            }
        }
    }

    render(ctx) {
        ctx.save();
        if (this.isUnlocked) {
            const spr = window.assets.sprites['door_open'];
            ctx.drawImage(spr, this.x, this.y, this.width, this.height);

            // Swirling portal aura
            ctx.strokeStyle = `hsl(${(this.portalTimer * 50) % 360}, 90%, 65%)`;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(this.x + 4, this.y + 6, this.width - 8, this.height - 10);

            // Portal prompt
            ctx.fillStyle = '#58d5ff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('PORTAL OCHIQ!', this.x + this.width / 2, this.y - 8);
        } else {
            const spr = window.assets.sprites['door_closed'];
            ctx.drawImage(spr, this.x, this.y, this.width, this.height);

            // Key requirement badge
            ctx.fillStyle = '#ffc83b';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`🔑 Kalit kerak! (${this.requiredKeys})`, this.x + this.width / 2, this.y - 8);
        }
        ctx.restore();
    }
}

// 6. Checkpoint Altar
class Checkpoint {
    constructor(config) {
        this.id = config.id || ('cp_' + Math.random().toString(36).substr(2, 5));
        this.x = config.x;
        this.y = config.y;
        this.width = 32;
        this.height = 40;
        this.isActivated = false;
        this.sparkleTimer = 0;
        this.type = 'checkpoint';
    }

    update(dt, game) {
        if (this.isActivated) {
            this.sparkleTimer += dt;
            if (this.sparkleTimer > 0.4) {
                this.sparkleTimer = 0;
                window.particleSystem.addSparkles(this.x + 16, this.y + 12, '#38ef7d', 2);
            }
            return;
        }

        // Check player overlap to activate
        if (game.player && Physics.AABBIntersect(game.player, this)) {
            this.activate(game);
        }
    }

    activate(game) {
        if (this.isActivated) return;
        this.isActivated = true;
        game.setActiveCheckpoint(this.x + 4, this.y + 4);
        if (window.soundEngine) window.soundEngine.playCheckpoint();
        window.particleSystem.addSparkles(this.x + 16, this.y + 12, '#38ef7d', 24);
    }

    render(ctx) {
        ctx.save();
        const spr = this.isActivated ? window.assets.sprites['checkpoint_on'] : window.assets.sprites['checkpoint_off'];
        ctx.drawImage(spr, this.x, this.y);

        if (this.isActivated) {
            // Magical glow aura
            const grad = ctx.createRadialGradient(this.x + 16, this.y + 14, 2, this.x + 16, this.y + 14, 18);
            grad.addColorStop(0, 'rgba(56, 239, 125, 0.45)');
            grad.addColorStop(1, 'rgba(56, 239, 125, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x + 16, this.y + 14, 18, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// 7. Collectible Gem
class GemItem {
    constructor(config) {
        this.id = config.id || ('gem_' + Math.random().toString(36).substr(2, 5));
        this.x = config.x;
        this.y = config.y;
        this.baseY = config.y;
        this.width = 16;
        this.height = 16;
        this.isCollected = false;
        this.bobTimer = Math.random() * Math.PI * 2;
        this.type = 'gem';
    }

    update(dt, game) {
        if (this.isCollected) return;
        this.bobTimer += dt * 4;
        this.y = this.baseY + Math.sin(this.bobTimer) * 3;

        if (game.player && Physics.AABBIntersect(game.player, this)) {
            this.isCollected = true;
            game.collectedGemsCount++;
            if (window.soundEngine) window.soundEngine.playCoin();
            window.particleSystem.addSparkles(this.x + 8, this.y + 8, '#e74c3c', 12);
        }
    }

    render(ctx) {
        if (this.isCollected) return;
        ctx.save();
        const spr = window.assets.sprites['gem'];
        ctx.drawImage(spr, this.x, this.y);
        ctx.restore();
    }
}

window.PushBox = PushBox;
window.PressurePlate = PressurePlate;
window.GateDoor = GateDoor;
window.KeyItem = KeyItem;
window.ExitPortal = ExitPortal;
window.Checkpoint = Checkpoint;
window.GemItem = GemItem;
