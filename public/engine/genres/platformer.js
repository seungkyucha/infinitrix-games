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

/**
 * TileCollision — AABB 타일 기반 충돌 해결기
 *
 * 타일맵 기반 플랫포머/메트로배니아에서 엔티티(플레이어, 적)의
 * X→Y 순서 AABB 충돌을 해결한다. 타일 판정은 콜백으로 위임하여
 * 어떤 맵 데이터 형식(문자열, 2D 배열, 함수 등)이든 호환 가능.
 *
 * 사용법:
 *   const tc = new TileCollision({ cols: 16, rows: 10 });
 *   // entity: { x, y, w, h, vx, vy, grounded, prevY }
 *   const result = tc.resolve(entity, screenW, screenH, isSolid, {
 *     isPlatform: (c, r) => map[r]?.[c] === '=',
 *     isHazard:   (c, r) => map[r]?.[c] === '^',
 *   });
 *   // result === 'hazard' if entity touched a hazard tile, null otherwise
 *
 *   const wallDir = tc.checkWallTouch(entity, screenW, screenH, isSolid);
 *   // wallDir: 1 (right wall), -1 (left wall), 0 (no wall)
 */
class TileCollision {
  /**
   * @param {object} [opts]
   * @param {number} [opts.cols=16] 타일맵 열 수
   * @param {number} [opts.rows=10] 타일맵 행 수
   */
  constructor(opts = {}) {
    this.cols = opts.cols ?? 16;
    this.rows = opts.rows ?? 10;
  }

  /** 현재 화면 크기에서 타일 1칸의 픽셀 크기 반환 */
  tileSize(screenW, screenH) {
    return { tw: screenW / this.cols, th: screenH / this.rows };
  }

  /**
   * AABB 타일 충돌 해결 (X축 → Y축 순서)
   *
   * @param {object} entity   { x, y, w, h, vx, vy, grounded, prevY }
   * @param {number} screenW  화면 너비
   * @param {number} screenH  화면 높이
   * @param {function} isSolid  (col, row) => boolean — 완전 차단 타일 여부
   * @param {object} [opts]
   * @param {function} [opts.isPlatform]  (col, row) => boolean — 위에서만 착지 가능한 원웨이 플랫폼
   * @param {function} [opts.isHazard]    (col, row) => boolean — 접촉 시 피해를 주는 위험 타일
   * @returns {'hazard'|null} 위험 타일 접촉 시 'hazard', 아니면 null
   */
  resolve(entity, screenW, screenH, isSolid, opts = {}) {
    const isPlatform = opts.isPlatform || (() => false);
    const isHazard = opts.isHazard || (() => false);
    const { tw, th } = this.tileSize(screenW, screenH);
    entity.grounded = false;

    /* ── X축 충돌 ── */
    const sr = Math.floor(entity.y / th);
    const er = Math.floor((entity.y + entity.h - 1) / th);
    if (entity.vx > 0) {
      const col = Math.floor((entity.x + entity.w) / tw);
      for (let r = sr; r <= er; r++) {
        if (isSolid(col, r)) { entity.x = col * tw - entity.w; entity.vx = 0; break; }
      }
    } else if (entity.vx < 0) {
      const col = Math.floor(entity.x / tw);
      for (let r = sr; r <= er; r++) {
        if (isSolid(col, r)) { entity.x = (col + 1) * tw; entity.vx = 0; break; }
      }
    }

    /* ── Y축 충돌 ── */
    const sc = Math.floor(entity.x / tw);
    const ec = Math.floor((entity.x + entity.w - 1) / tw);
    if (entity.vy > 0) {
      const row = Math.floor((entity.y + entity.h) / th);
      for (let c = sc; c <= ec; c++) {
        if (isSolid(c, row)) {
          entity.y = row * th - entity.h; entity.vy = 0; entity.grounded = true; break;
        }
        if (isPlatform(c, row) && entity.prevY + entity.h <= row * th + 2) {
          entity.y = row * th - entity.h; entity.vy = 0; entity.grounded = true; break;
        }
      }
    } else if (entity.vy < 0) {
      const row = Math.floor(entity.y / th);
      for (let c = sc; c <= ec; c++) {
        if (isSolid(c, row)) { entity.y = (row + 1) * th; entity.vy = 0; break; }
      }
    }

    /* ── 위험 타일 접촉 체크 ── */
    for (let c = sc; c <= ec; c++) {
      const botRow = Math.floor((entity.y + entity.h - 1) / th);
      const topRow = Math.floor(entity.y / th);
      if (isHazard(c, botRow) || isHazard(c, topRow)) return 'hazard';
    }
    return null;
  }

  /**
   * 벽 접촉 방향 판정 (벽 슬라이드/점프용)
   *
   * @param {object} entity   { x, y, w, h }
   * @param {number} screenW  화면 너비
   * @param {number} screenH  화면 높이
   * @param {function} isSolid  (col, row) => boolean
   * @param {number} [margin=2]  벽 감지 마진 (px)
   * @returns {number} 1=오른쪽 벽, -1=왼쪽 벽, 0=없음
   */
  checkWallTouch(entity, screenW, screenH, isSolid, margin = 2) {
    const { tw, th } = this.tileSize(screenW, screenH);
    const midRow = Math.floor((entity.y + entity.h * 0.5) / th);
    if (isSolid(Math.floor((entity.x + entity.w + margin) / tw), midRow)) return 1;
    if (isSolid(Math.floor((entity.x - margin) / tw), midRow)) return -1;
    return 0;
  }
}

return { PlatformPhysics, CoyoteJump, OneWayPlatform, WallMechanics, TileCollision };

})();
