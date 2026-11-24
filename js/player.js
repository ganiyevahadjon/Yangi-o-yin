/**
 * Dungeon Escape - Player Controller (Flawless Step-by-Step "Qadama-qadam" Walking System)
 * Implements physical step-pulse mechanics, distinct foot contact sounds, dust puffs,
 * jump buffering (0.16s), coyote time (0.12s), variable jump, and box pushing.
 */
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 28;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1 = right, -1 = left

        // Physical Step-by-Step Walking Constants
        this.stepDuration = 0.18;   // Swing phase duration (seconds)
        this.plantPause = 0.04;     // Ground plant pause (seconds)
        this.stepTimer = 0;
        this.isStepping = false;
        this.stepDir = 0;
        this.stepFoot = 0;          // 0 = Right foot step, 1 = Left foot step
        this.stepSpeed = 160;       // Walking speed (px/s)
        this.dragSpeed = 100;       // Speed while pushing/pulling heavy box

        this.gravity = 920;         // px/s^2
        this.jumpForce = -420;      // px/s (~96px jump height = 3 full tiles)

        // State flags
        this.isGrounded = false;
        this.wasGrounded = false;
        this.isGrabbingBox = false;
        this.grabbedBox = null;
        this.isDead = false;

        // Jump mechanics timers
        this.coyoteTime = 0.12;      // 0.12s grace after leaving ledge
        this.coyoteTimer = 0;
        this.jumpBufferTime = 0.16;  // 0.16s buffer before landing
        this.jumpBufferTimer = 0;

        // Health & i-frames
        this.maxHealth = 3;
        this.health = 3;
        this.iFrames = 0;
        this.hurtTimer = 0;
        this.keys = 0;

        // Animations
        this.animState = 'idle';     // idle, walk, jump, fall, hurt, die
        this.animFrame = 0;
        this.animTimer = 0;
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.isDead = false;
        this.iFrames = 0;
        this.hurtTimer = 0;
        this.animState = 'idle';
        this.animFrame = 0;
        this.isStepping = false;
        this.stepTimer = 0;
        this.stepFoot = 0;
        this.grabbedBox = null;
        this.isGrabbingBox = false;
    }

    takeDamage(amount, knockbackDir = 0, game) {
        if (this.iFrames > 0 || this.isDead) return;

        this.health -= amount;
        this.iFrames = 1.3;
        this.hurtTimer = 0.25;
        this.animState = 'hurt';
        this.animFrame = 0;
        this.isStepping = false;

        if (this.grabbedBox) {
            this.grabbedBox.isBeingGrabbed = false;
            this.grabbedBox = null;
            this.isGrabbingBox = false;
        }

        this.vy = -200;
        this.vx = knockbackDir !== 0 ? knockbackDir * 160 : -this.facing * 140;

        if (this.health <= 0) {
            this.health = 0;
            this.die(game);
        } else {
            if (window.soundEngine) window.soundEngine.playHurt();
            window.particleSystem.addHitSparks(this.x + this.width / 2, this.y + this.height / 2);
        }
    }

    die(game) {
        if (this.isDead) return;
        this.isDead = true;
        this.animState = 'die';
        this.animFrame = 0;
        this.animTimer = 0;
        this.isStepping = false;
        this.vx = 0;
        this.vy = -140;
        if (window.soundEngine) window.soundEngine.playDie();
        window.particleSystem.addDeathSouls(this.x + this.width / 2, this.y + this.height / 2);

        setTimeout(() => {
            if (game) {
                game.onPlayerDeath();
            }
        }, 1000);
    }

    update(dt, input, game) {
        if (this.isDead) {
            this.vy += this.gravity * dt;
            this.y += this.vy * dt;
            this.updateDeathAnimation(dt);
            return;
        }

        // Timers
        if (this.iFrames > 0) this.iFrames -= dt;
        if (this.hurtTimer > 0) this.hurtTimer -= dt;

        // Coyote Time
        if (this.isGrounded) {
            this.coyoteTimer = this.coyoteTime;
        } else {
            this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        }

        // Jump Buffering
        if (input.isJumpPressed) {
            this.jumpBufferTimer = this.jumpBufferTime;
        } else {
            this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
        }

        // --- Box Grabbing & Interaction (E key) ---
        this.handleBoxInteraction(input, game);

        // --- Step-by-Step Walking vs Airborne Movement ---
        if (this.isGrounded) {
            // Grounded: Physical step-pulse cadence ("Qadama-qadam")
            this.handleStepWalking(dt, input);
        } else {
            // Airborne: Smooth horizontal steering in the air
            this.isStepping = false;
            this.stepTimer = 0;
            let airVx = 0;
            if (input.moveLeft && !input.moveRight) {
                airVx = -this.stepSpeed;
                this.facing = -1;
            } else if (input.moveRight && !input.moveLeft) {
                airVx = this.stepSpeed;
                this.facing = 1;
            }
            this.vx = airVx;
        }

        // --- Jump Execution ---
        if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
            this.isStepping = false;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            if (window.soundEngine) window.soundEngine.playJump();
            window.particleSystem.addDust(this.x + this.width / 2, this.y + this.height, 4);
        }

        // Variable Jump Cut (Short hop if Space released early)
        if (!input.isJumpHeld && this.vy < -120) {
            this.vy = -120;
        }

        // --- Gravity ---
        this.vy += this.gravity * dt;
        if (this.vy > 650) this.vy = 650; // Terminal velocity

        // --- Physics Movement & Collision Resolution ---
        const prevGrounded = this.isGrounded;

        // Move horizontally
        Physics.moveAndCollideX(this, this.vx, dt, game.level);

        // Move grabbed box horizontally along with player
        if (this.isGrabbingBox && this.grabbedBox) {
            this.grabbedBox.vx = this.vx;
        }

        // Move vertically
        this.isGrounded = false;
        Physics.moveAndCollideY(this, this.vy, dt, game.level);

        // Landing sound
        if (!prevGrounded && this.isGrounded && this.vy >= 0) {
            if (window.soundEngine) window.soundEngine.playLand();
            window.particleSystem.addDust(this.x + this.width / 2, this.y + this.height, 3);
        }

        // Fall into abyss / death floor check
        if (game.level && this.y > game.level.pixelHeight + 64) {
            this.takeDamage(this.maxHealth, 0, game);
        }

        // --- Animation State Selection ---
        this.determineAnimationState(dt);
    }

    /**
     * Flawless Step-by-Step Walking Controller:
     * - Tapping A/D advances exactly ONE STEP, plants the foot with sound, and stops.
     * - Holding A/D takes consecutive rhythmic steps (Right, Left, Right, Left...).
     * - Each step has a physical pulse: foot swings forward -> foot strikes ground -> short plant pause.
     */
    handleStepWalking(dt, input) {
        const moveLeft = input.moveLeft && !input.moveRight;
        const moveRight = input.moveRight && !input.moveLeft;
        const wantMove = moveLeft || moveRight;
        const wantDir = moveRight ? 1 : -1;

        if (!this.isStepping) {
            if (wantMove) {
                this.isStepping = true;
                this.stepTimer = 0;
                this.stepDir = wantDir;
                this.facing = wantDir;
            } else {
                this.vx = 0;
                this.animState = 'idle';
            }
        }

        if (this.isStepping) {
            this.stepTimer += dt;
            const fullStepTime = this.stepDuration + this.plantPause;
            const currentMaxSpeed = this.isGrabbingBox ? this.dragSpeed : this.stepSpeed;

            if (this.stepTimer < this.stepDuration) {
                // Swing phase: natural smooth pulse forward
                const tNorm = this.stepTimer / this.stepDuration;
                // Sinusoidal step velocity curve
                const speedMult = Math.sin(tNorm * Math.PI) * 1.5;
                this.vx = this.stepDir * currentMaxSpeed * speedMult;

                // Animation frames 0,1,2 (Right) or 3,4,5 (Left)
                const frameOffset = Math.min(2, Math.floor(tNorm * 3));
                this.animState = 'walk';
                this.animFrame = (this.stepFoot === 0 ? 0 : 3) + frameOffset;
            } else {
                // Plant phase: foot hits the stone!
                this.vx = 0;
                this.animState = 'walk';
                this.animFrame = this.stepFoot === 0 ? 2 : 5;

                // Trigger sound & dust exactly once at footfall plant
                if (this.stepTimer - dt < this.stepDuration) {
                    if (window.soundEngine) window.soundEngine.playFootstep();
                    window.particleSystem.addDust(this.x + this.width / 2, this.y + this.height, 1);
                }

                // Step fully completed
                if (this.stepTimer >= fullStepTime) {
                    this.stepTimer = 0;
                    this.stepFoot = 1 - this.stepFoot; // alternate to next foot

                    // Check if player is still holding move in the same direction
                    const stillHolding = (this.stepDir === 1 && moveRight) || (this.stepDir === -1 && moveLeft);

                    if (stillHolding) {
                        this.stepDir = wantDir;
                        this.facing = wantDir;
                    } else if (wantMove) {
                        this.stepDir = wantDir;
                        this.facing = wantDir;
                    } else {
                        // Key released: stop firmly on both feet!
                        this.isStepping = false;
                        this.vx = 0;
                        this.animState = 'idle';
                        this.animFrame = 0;
                    }
                }
            }
        }
    }

    handleBoxInteraction(input, game) {
        if (!game.level || !game.level.crates) return;

        if (input.interactHeld) {
            if (!this.grabbedBox) {
                for (const crate of game.level.crates) {
                    const isAdjacent = (
                        Math.abs(crate.y - this.y) < 28 &&
                        ((this.facing === 1 && crate.x >= this.x && crate.x <= this.x + this.width + 16) ||
                         (this.facing === -1 && crate.x + crate.width <= this.x && crate.x + crate.width >= this.x - 16))
                    );

                    if (isAdjacent) {
                        this.grabbedBox = crate;
                        this.grabbedBox.isBeingGrabbed = true;
                        this.isGrabbingBox = true;
                        break;
                    }
                }
            }
        } else {
            if (this.grabbedBox) {
                this.grabbedBox.isBeingGrabbed = false;
                this.grabbedBox = null;
                this.isGrabbingBox = false;
            }
        }

        if (!this.isGrabbingBox) {
            for (const crate of game.level.crates) {
                if (Physics.AABBIntersect(this, crate)) {
                    if (this.vx > 0 && this.x + this.width <= crate.x + 10) {
                        crate.vx = this.vx * 0.75;
                    } else if (this.vx < 0 && this.x >= crate.x + crate.width - 10) {
                        crate.vx = this.vx * 0.75;
                    }
                }
            }
        }
    }

    determineAnimationState(dt) {
        if (this.hurtTimer > 0) {
            this.animState = 'hurt';
            this.animFrame = 0;
        } else if (!this.isGrounded) {
            this.animState = this.vy < 0 ? 'jump' : 'fall';
            this.animFrame = 0;
        } else if (!this.isStepping) {
            this.animState = 'idle';
            this.animTimer += dt;
            if (this.animTimer >= 0.18) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        }
    }

    updateDeathAnimation(dt) {
        this.animTimer += dt;
        if (this.animTimer >= 0.15) {
            this.animTimer = 0;
            if (this.animFrame < 5) {
                this.animFrame++;
            }
        }
    }

    render(ctx) {
        if (this.iFrames > 0 && Math.floor(this.iFrames * 20) % 2 === 0) {
            return;
        }

        ctx.save();
        const frames = window.assets.sprites.player[this.animState] || window.assets.sprites.player.idle;
        const currentSprite = frames[Math.min(this.animFrame, frames.length - 1)];

        // Center on entity bounding box and ground line
        const drawX = Math.round(this.x + this.width / 2);
        const drawY = Math.round(this.y + this.height);

        ctx.translate(drawX, drawY);
        ctx.scale(this.facing, 1);

        if (currentSprite) {
            // Draw 40x40 sprite with boot soles resting directly on drawY (ground level)
            ctx.drawImage(currentSprite, -20, -34);
        }

        ctx.restore();
    }
}

window.Player = Player;
