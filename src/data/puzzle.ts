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

  isFiller(idx: number): boolean {
    return this.state[idx] === Puzzle.FILLER;
  }

  isBlank(idx: number): boolean {
    return this.state[idx] === Puzzle.BLANK;
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

  getWordBoundaryIdxs(idx: number, clueDirection: Direction): Set<number> {
    const idxs = new Set<number>();
    idxs.add(idx);

    let start = idx;
    while (!this.isFiller(start)) {
      idxs.add(start);
      if (this.onStartingEdge(start, clueDirection)) {
        break;
      }
      start = this.decIdx(start, clueDirection);
    }

    let end = start === idx ? this.incIdx(idx, clueDirection) : idx;
    while (!this.isFiller(end)) {
      idxs.add(end);
      if (this.onEndingEdge(end, clueDirection)) {
        break;
      }
      end = this.incIdx(end, clueDirection);
    }

    return idxs;
  }

  getFirstAcrossClueIdx(): number {
    // find the first group of 2 consecutive chars
    for (let i = 1; i < this.state.length; i++) {
      if (!this.isFiller(i) && !this.isFiller(i - 1)) {
        return i - 1;
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
        while (this.isFiller(prevIdx)) {
          prevIdx--;
        }
        return prevIdx;
      }
      case Direction.Down: {
        let prevIdx = currentTileIdx - this.width;
        while (this.isFiller(prevIdx)) {
          prevIdx--;
        }
        return prevIdx;
      }
    }
  }

  getNextTileIdx(currentTileIdx: number, clueDirection: Direction): number {
    switch (clueDirection) {
      case Direction.Across: {
        let nextIdx = currentTileIdx + 1;
        while (this.isFiller(nextIdx)) {
          nextIdx++;
        }
        return nextIdx;
      }
      case Direction.Down: {
        let nextIdx = currentTileIdx + this.width;
        while (this.isFiller(nextIdx)) {
          nextIdx++;
        }
        return nextIdx;
      }
    }
  }

  // function getStartOfNextClueIdx(currentIdx: number): number {
  //   // goto end of current word, then keep going until you reach
  //   // a tile with at least one neighbor
  //   switch (clueDirection) {
  //     case Direction.Across: {
  //       break;
  //     }
  //     case Direction.Down: {
  //       break;
  //     }
  //   }
  // }

  static isAlpha(value: string): boolean {
    return value >= "A" && value <= "Z";
  }
}
