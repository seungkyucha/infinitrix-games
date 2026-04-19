/**
 * IX.Genre.Shooter — 슈터/탄막(Bullet Hell) 장르 공통 모듈
 *
 * Cycle 5 (painted-sky)에서 승격.
 * 극좌표 기반 탄막 패턴 생성 + 그레이즈(Near-miss) 시스템.
 *
 * 사용법:
 *   <script src="/engine/ix-engine.js"></script>
 *   <script src="/engine/genres/shooter.js"></script>
 *   <script>
 *     const { BulletPatterns, GrazeSystem } = IX.Genre.Shooter;
 *     const bp = new BulletPatterns({ speedScale: 100 });
 *     const graze = new GrazeSystem({ radius: 20, baseScore: 50 });
 *   </script>
 */
IX.Genre.Shooter = (() => {

/**
 * BulletPatterns — 극좌표 기반 탄막 패턴 생성기
 *
 * 각 메서드는 [{x, y, vx, vy}] 배열을 반환한다.
 * 게임은 이 배열을 순회하며 자체 풀(Pool.acquire)로 탄환을 스폰한다.
 * 풀/렌더링과 완전히 분리된 순수 데이터 생성기.
 *
 * speedScale: 내부 speed 값을 px/s로 변환하는 배율 (기본 100).
 *   예) speed=2, speedScale=100 → 200 px/s
 */
class BulletPatterns {
  constructor(opts = {}) {
    this.speedScale = opts.speedScale ?? 100;
    /** spiral 패턴의 누적 회전각. 매 호출마다 자동 증가. */
    this.spiralAngle = 0;
  }

  /**
   * radial — 원형 균등 방사
   * @param {number} ox 발사 원점 X
   * @param {number} oy 발사 원점 Y
   * @param {number} count 탄 수
   * @param {number} speed 속도 (×speedScale)
   * @returns {{x:number, y:number, vx:number, vy:number}[]}
   */
  radial(ox, oy, count, speed) {
    const s = speed * this.speedScale;
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 / count) * i;
      out.push({ x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s });
    }
    return out;
  }

  /**
   * fan — 부채꼴 발사 (대상 방향 중심)
   * @param {number} ox 원점 X
   * @param {number} oy 원점 Y
   * @param {number} targetAngle 중심 방향 (rad)
   * @param {number} count 탄 수
   * @param {number} spreadDeg 전체 부채꼴 각도 (도)
   * @param {number} speed 속도
   */
  fan(ox, oy, targetAngle, count, spreadDeg, speed) {
    const s = speed * this.speedScale;
    const sp = spreadDeg * Math.PI / 180;
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = targetAngle - sp / 2 + (sp / Math.max(1, count - 1)) * i;
      out.push({ x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s });
    }
    return out;
  }

  /**
   * doubleFan — 전방+후방 이중 부채꼴
   */
  doubleFan(ox, oy, targetAngle, count, spreadDeg, speed) {
    return [
      ...this.fan(ox, oy, targetAngle, count, spreadDeg, speed),
      ...this.fan(ox, oy, targetAngle + Math.PI, count, spreadDeg, speed),
    ];
  }

  /**
   * spiral — 나선형 회전 발사
   * spiralAngle을 매 호출마다 rotSpeed만큼 증가시킨다.
   * @param {number} arms 나선 팔 수
   * @param {number} bulletsPerArm 팔당 탄 수
   * @param {number} speed 기본 속도
   * @param {number} rotSpeed 프레임당 회전 증가량 (rad)
   */
  spiral(ox, oy, arms, bulletsPerArm, speed, rotSpeed) {
    const s = speed * this.speedScale;
    const out = [];
    for (let a = 0; a < arms; a++) {
      const baseAngle = (Math.PI * 2 / arms) * a + this.spiralAngle;
      for (let i = 0; i < bulletsPerArm; i++) {
        const ang = baseAngle + i * 0.15;
        const spd = (speed + i * 0.1) * this.speedScale;
        out.push({ x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd });
      }
    }
    this.spiralAngle += rotSpeed || 0.02;
    return out;
  }

  /**
   * aimed — 플레이어 조준 집중탄
   */
  aimed(ox, oy, targetAngle, count, spreadDeg, speed) {
    return this.fan(ox, oy, targetAngle, count, spreadDeg, speed);
  }

  /**
   * rain — 상단에서 랜덤 위치로 낙하
   * @param {number} areaW 화면 너비
   * @param {number} count 탄 수
   * @param {number} speed 낙하 속도
   */
  rain(areaW, count, speed) {
    const s = speed * this.speedScale;
    const out = [];
    for (let i = 0; i < count; i++) {
      const rx = Math.random() * areaW * 0.9 + areaW * 0.05;
      out.push({ x: rx, y: -10, vx: (Math.random() - 0.5) * 40, vy: s });
    }
    return out;
  }

  /**
   * wave — 사인파 물결 (원형 배치 후 하강)
   */
  wave(ox, oy, count, speed) {
    const s = speed * this.speedScale;
    const out = [];
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 / count) * i;
      out.push({
        x: ox + Math.cos(a) * 80,
        y: oy + Math.sin(a) * 40,
        vx: Math.cos(a) * s * 0.5,
        vy: s,
      });
    }
    return out;
  }

  /** 누적 spiralAngle 리셋 (게임 리셋 시 호출) */
  resetAngle() { this.spiralAngle = 0; }
}


/**
 * GrazeSystem — 그레이즈(Near-miss) 판정 + 콤보 관리
 *
 * 탄환이 히트박스를 빗겨갈 때 점수/콤보를 부여하는 시스템.
 * 탄막 슈터의 핵심 재미 요소.
 *
 * 사용법:
 *   const graze = new GrazeSystem({ radius: 20, baseScore: 50 });
 *   // 매 프레임:
 *   bullets.forEach(b => {
 *     const result = graze.check(px, py, 4, b.x, b.y, b.r, b._grazed);
 *     if (result.grazed) { b._grazed = true; score += result.score; }
 *     if (result.hit) { playerHit(); }
 *   });
 */
class GrazeSystem {
  /**
   * @param {object} opts
   * @param {number} opts.radius     그레이즈 감지 반경 (px)
   * @param {number} opts.baseScore  1회 기본 점수
   * @param {number} opts.comboStep  콤보당 배율 증가분 (기본 0.5)
   * @param {number} opts.maxComboMul 최대 콤보 배율 (기본 10)
   */
  constructor(opts = {}) {
    this.radius = opts.radius ?? 20;
    this.baseScore = opts.baseScore ?? 50;
    this.comboStep = opts.comboStep ?? 0.5;
    this.maxComboMul = opts.maxComboMul ?? 10;
    this.combo = 0;
    this.total = 0;
  }

  /**
   * 단일 탄환에 대해 히트/그레이즈 판정
   * @param {number} px 플레이어 X
   * @param {number} py 플레이어 Y
   * @param {number} hitR 히트박스 반경
   * @param {number} bx 탄환 X
   * @param {number} by 탄환 Y
   * @param {number} br 탄환 반경
   * @param {boolean} alreadyGrazed 이미 그레이즈된 탄환인지
   * @returns {{hit: boolean, grazed: boolean, score: number}}
   */
  check(px, py, hitR, bx, by, br, alreadyGrazed) {
    const dx = px - bx, dy = py - by;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 히트 판정 (히트박스 + 탄환 반경)
    if (dist < hitR + br) {
      return { hit: true, grazed: false, score: 0 };
    }

    // 그레이즈 판정 (그레이즈 범위 + 탄환 반경)
    if (!alreadyGrazed && dist < this.radius + br) {
      this.combo++;
      this.total++;
      const mul = Math.min(this.maxComboMul, 1 + this.combo * this.comboStep);
      const score = Math.round(this.baseScore * mul);
      return { hit: false, grazed: true, score };
    }

    return { hit: false, grazed: false, score: 0 };
  }

  /** 피격 시 콤보 리셋 */
  resetCombo() { this.combo = 0; }

  /** 전체 리셋 (게임 재시작 시) */
  reset() { this.combo = 0; this.total = 0; }
}

return { BulletPatterns, GrazeSystem };

})();
