import { Direction, ParsedPuz } from "../types";

export class Puzzle {
  static FILLER = ".";
  static BLANK = "-";

  readonly solution: string;
  readonly title: string;
  readonly author: string;
  readonly copyright: string;
  readonly width: number;
  readonly height: number;
  readonly state: string[];
  readonly clues: string[];

  constructor(parsedPuz: ParsedPuz) {
    this.solution = parsedPuz.solution;
    this.state = parsedPuz.state.split("");
    this.title = parsedPuz.title;
    this.author = parsedPuz.author;
    this.copyright = parsedPuz.copyright;
    this.width = parsedPuz.width;
    this.height = parsedPuz.height;
    this.clues = parsedPuz.clues;
  }

  setStateValue(idx: number, value: string): void {
    if (this.idxInBounds(idx)) {
      this.state[idx] = value;
    }
  }

  isFillerTile(idx: number): boolean {
    return this.state[idx] === Puzzle.FILLER;
  }

  isBlankTile(idx: number): boolean {
    return this.state[idx] === Puzzle.BLANK;
  }

  // A word is at least 2 tiles long
  isInWord(idx: number, clueDirection: Direction): boolean {
    if (this.isFillerTile(idx)) {
      return false;
    }
    if (this.onEndingEdge(idx, clueDirection)) {
      return !this.isFillerTile(this.decIdx(idx, clueDirection));
    }
    if (this.onStartingEdge(idx, clueDirection)) {
      return !this.isFillerTile(this.incIdx(idx, clueDirection));
    }
    return (
      !this.isFillerTile(this.decIdx(idx, clueDirection)) ||
      !this.isFillerTile(this.incIdx(idx, clueDirection))
    );
  }

  isStartOfWord(idx: number, clueDirection: Direction): boolean {
    if (this.isFillerTile(idx) || this.onEndingEdge(idx, clueDirection)) {
      return false;
    }
    if (this.onStartingEdge(idx, clueDirection)) {
      return true;
    }
    return (
      this.isFillerTile(this.decIdx(idx, clueDirection)) &&
      !this.isFillerTile(this.incIdx(idx, clueDirection))
    );
  }

  idxInBounds(tileIdx: number): boolean {
    return tileIdx >= 0 && tileIdx <= this.state.length;
  }

  incIdx(i: number, clueDirection: Direction): number {
    return clueDirection === Direction.Across ? i + 1 : i + this.width; // Direction.Down
  }

  decIdx(i: number, clueDirection: Direction): number {
    return clueDirection === Direction.Across ? i - 1 : i - this.width; // Direction.Down
  }

  onStartingEdge(i: number, clueDirection: Direction): boolean {
    return clueDirection === Direction.Across
      ? i % this.width === 0 // leftmost column
      : i < this.width; // top row
  }

  onEndingEdge(i: number, clueDirection: Direction): boolean {
    return clueDirection === Direction.Across
      ? i % this.width === this.width - 1 // rightmost column
      : i >= this.state.length - this.width; // bottom row
  }

  // TODO this is used by 'get start of next clue' and it doesn't work right.
  // we figure out potential start of next clue by starting at the top of the
  // current clue (in Down-mode) and scanning this.state for the start of a new
  // clue that also goes Down. but we short circuit if the end of the current
  // clue is the "last tile". sometimes there's a down clue that starts at an idx
  // higher than the idx of the clue that ends on the last tile (this happens in 229).
  isLastTile(i: number, clueDirection: Direction): boolean {
    return i === this.getEndOfLastClueIdx(clueDirection);
  }

  getWordBoundaryIdxs(idx: number, clueDirection: Direction): Set<number> {
    const idxs = new Set<number>();
    idxs.add(idx);

    let start = idx;
    while (!this.isFillerTile(start)) {
      idxs.add(start);
      if (this.onStartingEdge(start, clueDirection)) {
        break;
      }
      start = this.decIdx(start, clueDirection);
    }

    let end = start === idx ? this.incIdx(idx, clueDirection) : idx;
    while (!this.isFillerTile(end)) {
      idxs.add(end);
      if (this.onEndingEdge(end, clueDirection)) {
        break;
      }
      end = this.incIdx(end, clueDirection);
    }

    return idxs;
  }

  getStartOfFirstClueIdx(clueDirection: Direction): number {
    for (let i = 0; i < this.state.length; i++) {
      if (this.isInWord(i, clueDirection)) {
        return i;
      }
    }
  }

  getEndOfLastClueIdx(clueDirection: Direction): number {
    for (let i = this.state.length - 1; i >= 0; i--) {
      if (this.isInWord(i, clueDirection)) {
        return i;
      }
    }
  }

  // TODO these previous/next fns don't really work. they should go to the
  // next char in the current selected word in the current clue direction, or if
  // at the boundary of a word, they should go to the start of the next clue in
  // the current clue direction.
  getPreviousTileIdx(currentTileIdx: number, clueDirection: Direction): number {
    switch (clueDirection) {
      case Direction.Across: {
        let prevIdx = currentTileIdx - 1;
        while (this.isFillerTile(prevIdx)) {
          prevIdx--;
        }
        return prevIdx;
      }
      case Direction.Down: {
        let prevIdx = currentTileIdx - this.width;
        while (this.isFillerTile(prevIdx)) {
          prevIdx--;
        }
        return prevIdx;
      }
    }
  }

  getNextTileIdx(currentTileIdx: number, clueDirection: Direction): number {
    let nextIdx = this.incIdx(currentTileIdx, clueDirection);
    if (
      this.isFillerTile(nextIdx) ||
      this.onEndingEdge(currentTileIdx, clueDirection)
    ) {
      return this.getStartOfNextClueIdx(currentTileIdx, clueDirection);
    }

    return nextIdx;
  }

  getStartOfNextClueIdx(currentIdx: number, clueDirection: Direction): number {
    const currentWordIdxs = this.getWordBoundaryIdxs(currentIdx, clueDirection);
    const startOfCurrentWord = Math.min(...currentWordIdxs.values());
    const endOfCurrentWord = Math.max(...currentWordIdxs.values());

    if (this.isLastTile(endOfCurrentWord, clueDirection)) {
      return this.getStartOfFirstClueIdx(clueDirection);
    }

    // not using incIdx for this because it increments within a word
    // and here we are scanning linearally through the state array for
    // a word (2+ chars) that continues in the current clue direction
    let startOfNextClueIdx =
      clueDirection === Direction.Across
        ? endOfCurrentWord + 1
        : startOfCurrentWord + 1;

    while (!this.isStartOfWord(startOfNextClueIdx, clueDirection)) {
      startOfNextClueIdx++;
    }

    return startOfNextClueIdx;
  }

  static isAlpha(value: string): boolean {
    return value >= "A" && value <= "Z";
  }
}
