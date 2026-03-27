/**
 * IX.Genre.Match3 — 매치3 퍼즐 장르 공통 모듈
 *
 * 로얄 매치 / 캔디 크러시급 매치3 게임을 위한 핵심 유틸리티.
 * 사이클 44~53 매치3 집중 모드에서 점진적으로 확장.
 *
 * 사용법:
 *   <script src="/engine/ix-engine.js"></script>
 *   <script src="/engine/genres/match3.js"></script>
 *   <script>
 *     const { Board, Matcher, Cascade, SpecialGem } = IX.Genre.Match3;
 *   </script>
 */
IX.Genre.Match3 = (() => {

/** 매치3 보드 — 2D 그리드 관리 */
class Board {
  constructor(cols, rows, gemTypes = 6) {
    this.cols = cols;
    this.rows = rows;
    this.gemTypes = gemTypes;
    this.grid = [];  // grid[row][col] = { type, special, x, y, ... }
  }

  /** 보드 초기화 (매치 없는 상태로) */
  fill(createGem) {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        let type;
        do {
          type = Math.floor(Math.random() * this.gemTypes);
        } while (this._wouldMatch(r, c, type));
        this.grid[r][c] = createGem ? createGem(r, c, type) : { type, special: null, row: r, col: c };
      }
    }
  }

  _wouldMatch(row, col, type) {
    // Horizontal check
    if (col >= 2 &&
        this.grid[row][col - 1]?.type === type &&
        this.grid[row][col - 2]?.type === type) return true;
    // Vertical check
    if (row >= 2 &&
        this.grid[row - 1]?.[col]?.type === type &&
        this.grid[row - 2]?.[col]?.type === type) return true;
    return false;
  }

  get(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
    return this.grid[row][col];
  }

  set(row, col, gem) {
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.grid[row][col] = gem;
    }
  }

  swap(r1, c1, r2, c2) {
    const temp = this.grid[r1][c1];
    this.grid[r1][c1] = this.grid[r2][c2];
    this.grid[r2][c2] = temp;
    if (this.grid[r1][c1]) { this.grid[r1][c1].row = r1; this.grid[r1][c1].col = c1; }
    if (this.grid[r2][c2]) { this.grid[r2][c2].row = r2; this.grid[r2][c2].col = c2; }
  }

  isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }
}

/** 매치 감지 — 3+매치, L/T자, 5자 감지 */
class Matcher {
  /** 전체 보드에서 매치 찾기 → [{cells:[{r,c}...], type, shape}] */
  static findMatches(board) {
    const matches = [];
    const visited = Array.from({ length: board.rows }, () => Array(board.cols).fill(false));

    // Horizontal matches
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c <= board.cols - 3; c++) {
        const gem = board.get(r, c);
        if (!gem || gem.type < 0) continue;
        let len = 1;
        while (c + len < board.cols && board.get(r, c + len)?.type === gem.type) len++;
        if (len >= 3) {
          const cells = [];
          for (let i = 0; i < len; i++) cells.push({ r, c: c + i });
          matches.push({ cells, type: gem.type, shape: len >= 5 ? '5+' : len === 4 ? '4h' : '3h' });
        }
      }
    }

    // Vertical matches
    for (let c = 0; c < board.cols; c++) {
      for (let r = 0; r <= board.rows - 3; r++) {
        const gem = board.get(r, c);
        if (!gem || gem.type < 0) continue;
        let len = 1;
        while (r + len < board.rows && board.get(r + len, c)?.type === gem.type) len++;
        if (len >= 3) {
          const cells = [];
          for (let i = 0; i < len; i++) cells.push({ r: r + i, c });
          matches.push({ cells, type: gem.type, shape: len >= 5 ? '5+' : len === 4 ? '4v' : '3v' });
        }
      }
    }

    return Matcher._mergeOverlapping(matches);
  }

  /** 겹치는 매치를 병합하여 L/T 자 감지 */
  static _mergeOverlapping(matches) {
    // Simple: just return as-is. L/T detection can be added in later cycles.
    return matches;
  }

  /** 스왑 후 매치 가능한지 미리 확인 */
  static wouldMatch(board, r1, c1, r2, c2) {
    board.swap(r1, c1, r2, c2);
    const matches = Matcher.findMatches(board);
    board.swap(r1, c1, r2, c2); // undo
    return matches.length > 0;
  }

  /** 가능한 이동이 존재하는지 확인 (힌트 시스템용) */
  static hasValidMove(board) {
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        if (c + 1 < board.cols && Matcher.wouldMatch(board, r, c, r, c + 1)) return { r1: r, c1: c, r2: r, c2: c + 1 };
        if (r + 1 < board.rows && Matcher.wouldMatch(board, r, c, r + 1, c)) return { r1: r, c1: c, r2: r + 1, c2: c };
      }
    }
    return null;
  }
}

/** 캐스케이드 — 매치 제거 후 낙하 + 새 보석 충전 */
class Cascade {
  /** 매치된 셀 제거 (null 처리) */
  static removeCells(board, matches) {
    const removed = new Set();
    for (const match of matches) {
      for (const { r, c } of match.cells) {
        if (!removed.has(`${r},${c}`)) {
          removed.add(`${r},${c}`);
          board.set(r, c, null);
        }
      }
    }
    return removed.size;
  }

  /** 중력 적용 — 빈 칸 위의 보석 낙하 */
  static applyGravity(board) {
    const drops = []; // [{gem, fromRow, toRow, col}]
    for (let c = 0; c < board.cols; c++) {
      let emptyRow = board.rows - 1;
      for (let r = board.rows - 1; r >= 0; r--) {
        const gem = board.get(r, c);
        if (gem) {
          if (r !== emptyRow) {
            drops.push({ gem, fromRow: r, toRow: emptyRow, col: c });
            board.set(emptyRow, c, gem);
            board.set(r, c, null);
            gem.row = emptyRow;
          }
          emptyRow--;
        }
      }
    }
    return drops;
  }

  /** 빈 칸에 새 보석 채우기 */
  static fillEmpty(board, createGem) {
    const fills = [];
    for (let c = 0; c < board.cols; c++) {
      let spawnRow = -1;
      for (let r = 0; r < board.rows; r++) {
        if (!board.get(r, c)) {
          const type = Math.floor(Math.random() * board.gemTypes);
          const gem = createGem ? createGem(r, c, type) : { type, special: null, row: r, col: c };
          board.set(r, c, gem);
          fills.push({ gem, spawnRow: spawnRow--, targetRow: r, col: c });
        }
      }
    }
    return fills;
  }
}

/** 스페셜 보석 타입 */
const SpecialGem = {
  NONE: null,
  LINE_H: 'line_h',     // 가로 줄 파괴 (4매치 가로)
  LINE_V: 'line_v',     // 세로 줄 파괴 (4매치 세로)
  BOMB: 'bomb',          // 3x3 폭발 (L/T매치)
  RAINBOW: 'rainbow',    // 전색 제거 (5매치)

  /** 매치 형태에 따라 스페셜 보석 결정 */
  fromMatch(shape) {
    if (shape === '5+') return SpecialGem.RAINBOW;
    if (shape === '4h') return SpecialGem.LINE_H;
    if (shape === '4v') return SpecialGem.LINE_V;
    return SpecialGem.NONE;
  }
};

return { Board, Matcher, Cascade, SpecialGem };

})();
