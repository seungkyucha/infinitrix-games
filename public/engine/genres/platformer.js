/**
 * IX.Genre.Platformer — 플랫포머/액션 장르 공통 모듈
 *
 * 사용법:
 *   <script src="/engine/ix-engine.js"></script>
 *   <script src="/engine/genres/platformer.js"></script>
 *   <script>
 *     const { PlatformPhysics, CoyoteJump, OneWayPlatform } = IX.Genre.Platformer;
 *   </script>
 */
IX.Genre.Platformer = (() => {

/** Platformer physics — gravity, jump, wall-slide */
class PlatformPhysics {
  constructor(opts = {}) {
    this.gravity    = opts.gravity    ?? 980;
    this.jumpForce  = opts.jumpForce  ?? -400;
    this.maxFallSpd = opts.maxFallSpd ?? 600;
    this.moveSpeed  = opts.moveSpeed  ?? 200;
    this.friction   = opts.friction   ?? 0.85;
  }

  applyGravity(entity, dt) {
    entity.vy = Math.min((entity.vy || 0) + this.gravity * dt / 1000, this.maxFallSpd);
  }

  jump(entity) {
    entity.vy = this.jumpForce;
    entity.grounded = false;
  }

  moveX(entity, dir, dt) {
    entity.vx = (entity.vx || 0) + dir * this.moveSpeed * dt / 1000;
  }

  applyFriction(entity) {
    entity.vx = (entity.vx || 0) * this.friction;
  }

  update(entity, dt) {
    this.applyGravity(entity, dt);
    this.applyFriction(entity);
    entity.x += (entity.vx || 0) * dt / 1000;
    entity.y += (entity.vy || 0) * dt / 1000;
  }
}

/** Coyote time — allows jump briefly after leaving edge */
class CoyoteJump {
  constructor(coyoteMs = 100, bufferMs = 80) {
    this._coyoteMs = coyoteMs;
    this._bufferMs = bufferMs;
    this._lastGrounded = 0;
    this._lastJumpPress = 0;
  }

  onGround(time) { this._lastGrounded = time; }
  onJumpPress(time) { this._lastJumpPress = time; }

  canJump(time, isGrounded) {
    if (isGrounded) return true;
    // Coyote: recently left ground
    if (time - this._lastGrounded < this._coyoteMs) return true;
    return false;
  }

  hasBufferedJump(time) {
    return time - this._lastJumpPress < this._bufferMs;
  }
}

/** One-way platform collision (pass through from below) */
class OneWayPlatform {
  static resolve(entity, platform) {
    const prevBottom = entity.prevY + entity.h;
    const platTop = platform.y;
    const currBottom = entity.y + entity.h;

    if (prevBottom <= platTop && currBottom > platTop &&
        entity.x + entity.w > platform.x && entity.x < platform.x + platform.w) {
      entity.y = platTop - entity.h;
      entity.vy = 0;
      entity.grounded = true;
      return true;
    }
    return false;
  }
}

/** Wall slide & wall jump */
class WallMechanics {
  constructor(opts = {}) {
    this.slideSpeed = opts.slideSpeed ?? 50;
    this.wallJumpX  = opts.wallJumpX  ?? 250;
    this.wallJumpY  = opts.wallJumpY  ?? -380;
  }

  wallSlide(entity, touchingWall, dt) {
    if (touchingWall && !entity.grounded && entity.vy > 0) {
      entity.vy = Math.min(entity.vy, this.slideSpeed);
      entity.wallSliding = true;
      return true;
    }
    entity.wallSliding = false;
    return false;
  }

  wallJump(entity, wallDir) {
    entity.vx = wallDir * this.wallJumpX;
    entity.vy = this.wallJumpY;
    entity.grounded = false;
    entity.wallSliding = false;
  }
}

return { PlatformPhysics, CoyoteJump, OneWayPlatform, WallMechanics };

})();
