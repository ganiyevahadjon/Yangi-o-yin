/**
 * Dungeon Escape - Physics Engine & Collision Detection
 * Robust AABB collisions, smooth one-way platforms, tilemap queries, and dynamic separation.
 */
class Physics {
    static AABBIntersect(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    static pointInAABB(px, py, box) {
        return (
            px >= box.x &&
            px <= box.x + box.width &&
            py >= box.y &&
            py <= box.y + box.height
        );
    }

    /**
     * Resolve horizontal movement against solid obstacles (walls, ground, closed doors, crates)
     * One-way platforms never block horizontal movement.
     */
    static moveAndCollideX(entity, vx, dt, level) {
        if (!level) return false;
        const originalX = entity.x;
        entity.x += vx * dt;

        const bounds = {
            x: entity.x,
            y: entity.y,
            width: entity.width,
            height: entity.height
        };

        const collidedTiles = level.getSolidTilesInRect(bounds);
        let collided = false;

        for (const tile of collidedTiles) {
            if (vx > 0) {
                // Moving right, snap to left edge of solid block
                entity.x = tile.x - entity.width;
                entity.vx = 0;
                collided = true;
            } else if (vx < 0) {
                // Moving left, snap to right edge of solid block
                entity.x = tile.x + tile.width;
                entity.vx = 0;
                collided = true;
            }
        }

        return collided;
    }

    /**
     * Resolve vertical movement against solid tiles & one-way platforms
     */
    static moveAndCollideY(entity, vy, dt, level) {
        if (!level) return false;
        const originalY = entity.y;
        entity.y += vy * dt;

        const bounds = {
            x: entity.x,
            y: entity.y,
            width: entity.width,
            height: entity.height
        };

        let collided = false;

        // 1. Fully solid tiles (walls, ceilings, solid ground)
        const collidedTiles = level.getSolidTilesInRect(bounds);
        for (const tile of collidedTiles) {
            if (vy > 0) {
                // Falling down, land on top of solid tile
                entity.y = tile.y - entity.height;
                entity.vy = 0;
                entity.isGrounded = true;
                collided = true;
            } else if (vy < 0) {
                // Moving up, hit head on ceiling
                entity.y = tile.y + tile.height;
                entity.vy = 0;
                collided = true;
            }
        }

        // 2. One-way platform tiles ('=' type 2): only collide when falling downward
        if (vy >= 0 && !collided) {
            const platformTiles = level.getPlatformTilesInRect(bounds);
            for (const plat of platformTiles) {
                // Landing on platform top surface from above
                if (
                    originalY + entity.height <= plat.y + 8 &&
                    entity.y + entity.height >= plat.y &&
                    entity.x + entity.width > plat.x + 2 &&
                    entity.x < plat.x + plat.width - 2
                ) {
                    entity.y = plat.y - entity.height;
                    entity.vy = 0;
                    entity.isGrounded = true;
                    collided = true;
                    break;
                }
            }
        }

        // 3. Dynamic Platform entities check (crumbling & moving platforms)
        if (vy >= 0 && level.platforms && !collided) {
            for (const plat of level.platforms) {
                if (!plat.isSolid) continue;
                if (
                    originalY + entity.height <= plat.y + 8 &&
                    entity.y + entity.height >= plat.y &&
                    entity.x + entity.width > plat.x + 2 &&
                    entity.x < plat.x + plat.width - 2
                ) {
                    entity.y = plat.y - entity.height;
                    entity.vy = 0;
                    entity.isGrounded = true;
                    entity.currentPlatform = plat;
                    if (plat.onStepped) plat.onStepped(entity);
                    collided = true;
                    break;
                }
            }
        }

        return collided;
    }
}

window.Physics = Physics;
