import { Direction } from "$lib/types";
import type { ParsedPuz, PuzzleTile } from "$lib/types";

export class Puzzle {
  static FILLER = ".";
  static BLANK = "-";

  private state: string[];

  readonly solution: string;
  readonly title: string;
  readonly author: string;
  readonly copyright: string;
  readonly width: number;
  readonly height: number;
  readonly clueList: string[];

  readonly clues: { [key in Direction]: string[] };
  readonly grid: PuzzleTile[];

  constructor(parsedPuz: ParsedPuz) {
    this.solution = parsedPuz.solution;
    this.state = parsedPuz.state.split("");
    this.title = parsedPuz.title;
    this.author = parsedPuz.author;
    this.copyright = parsedPuz.copyright;
    this.width = parsedPuz.width;
    this.height = parsedPuz.height;
    this.clueList = parsedPuz.clues;

    this.clues = {
      [Direction.Across]: [],
      [Direction.Down]: [],
    };
    this.grid = [];

    let clueIdx = 0;
    for (let i = 0; i < this.solution.length; i++) {
      const value = this.solution[i];

      if (this.isFillerTile(i)) {
        this.grid[i] = { idx: i, isFiller: true };
        continue;
      }

      const isStartOfWordAcross = this.isStartOfWord(i, Direction.Across);
      const isStartOfWordDown = this.isStartOfWord(i, Direction.Down);
      const isEndOfWordAcross = this.isEndOfWord(i, Direction.Across);
      const isEndOfWordDown = this.isEndOfWord(i, Direction.Down);
      const wordIdxsAcross = [
        ...this.getWordIdxs(i, Direction.Across).values(),
      ];
      const wordIdxsDown = [...this.getWordIdxs(i, Direction.Down).values()];
      wordIdxsAcross.sort((a, b) => a - b);
      wordIdxsDown.sort((a, b) => a - b);
      const wordIdxs = {
        [Direction.Across]: wordIdxsAcross,
        [Direction.Down]: wordIdxsDown,
      };

      const tileClueIdx = {
        [Direction.Across]:
          this.grid[Math.min(...wordIdxsAcross)]?.clueIdx.Across,
        [Direction.Down]: this.grid[Math.min(...wordIdxsDown)]?.clueIdx.Down,
      };

      // Not sure if this is always the case (hopefully it is), but when an A and D
      // clue both start on the same tile, it looks like .puz files list the A clue
      // first.
      if (isStartOfWordAcross) {
        tileClueIdx[Direction.Across] =
          this.clues[Direction.Across].push(this.clueList[clueIdx++]) - 1;
      }
      if (isStartOfWordDown) {
        tileClueIdx[Direction.Down] =
          this.clues[Direction.Down].push(this.clueList[clueIdx++]) - 1;
      }

      this.grid[i] = {
        idx: i,
        isFiller: false,
        isStartOfWord: {
          [Direction.Across]: isStartOfWordAcross,
          [Direction.Down]: isStartOfWordDown,
        },
        isEndOfWord: {
          [Direction.Across]: isEndOfWordAcross,
          [Direction.Down]: isEndOfWordDown,
        },
        clueIdx: tileClueIdx,
        wordIdxs,
      };
    }
  }

  static isAlpha(value: string): boolean {
    return value >= "A" && value <= "Z";
  }

  getInfo(): { title: string, author: string, copyright: string } {
    return {
      title: this.title,
      author: this.author,
      copyright: this.copyright,
    };
  }

  setStateValue(idx: number, value: string): void {
    this.state[idx] = value;
  }

  getState(idx: number): string | undefined {
    return this.state[idx];
  }

  isFillerTile(idx: number): boolean {
    return this.state[idx] === Puzzle.FILLER;
  }

  isBlankTile(idx: number): boolean {
    return this.state[idx] === Puzzle.BLANK;
  }

  clearPuzzle() {
    this.state = this.state.map(x => x !== Puzzle.FILLER ? Puzzle.BLANK : Puzzle.FILLER);
  }

  getStartingTileForClue(clueDirection: Direction, clueIdx: number): PuzzleTile {
    return this.grid.find((tile) => !tile.isFiller && tile.isStartOfWord && tile.clueIdx[clueDirection] === clueIdx);
  }

  getClueForTile(
    tile: PuzzleTile,
    clueDirection: Direction
  ): { clue: string; idx: number } | null {
    if (tile.isFiller) return null;
    return {
      clue: this.clues[clueDirection][tile.clueIdx[clueDirection]],
      idx: tile.clueIdx[clueDirection],
    };
  }

  getPlayTileRight(tile: PuzzleTile): PuzzleTile | undefined {
    let nextTile = this.grid[tile.idx + 1];
    if (this.onStartingEdge(nextTile.idx, Direction.Across)) {
      return;
    }
    while (nextTile.isFiller) {
      if (this.onEndingEdge(nextTile.idx, Direction.Across)) {
        return;
      }
      nextTile = this.grid[nextTile.idx + 1];
    }
    return nextTile;
  }

  getPlayTileLeft(tile: PuzzleTile): PuzzleTile | undefined {
    let nextTile = this.grid[tile.idx - 1];
    if (this.onEndingEdge(nextTile.idx, Direction.Across)) {
      return;
    }
    while (nextTile.isFiller) {
      if (this.onStartingEdge(nextTile.idx, Direction.Across)) {
        return;
      }
      nextTile = this.grid[nextTile.idx - 1];
    }
    return nextTile;
  }

  getPlayTileDown(tile: PuzzleTile): PuzzleTile | undefined {
    let nextTile = this.grid[(tile.idx + this.width) % this.grid.length];
    if (this.onStartingEdge(nextTile.idx, Direction.Down)) {
      return;
    }
    while (nextTile.isFiller) {
      if (this.onEndingEdge(nextTile.idx, Direction.Down)) {
        return;
      }
      nextTile = this.grid[(nextTile.idx + this.width) % this.grid.length];
    }
    return nextTile;
  }

  getPlayTileUp(tile: PuzzleTile): PuzzleTile | undefined {
    let nextTile =
      this.grid[(tile.idx - this.width + this.grid.length) % this.grid.length];
    if (this.onEndingEdge(nextTile.idx, Direction.Down)) {
      return;
    }
    while (nextTile.isFiller) {
      if (this.onStartingEdge(nextTile.idx, Direction.Down)) {
        return;
      }
      nextTile =
        this.grid[
          (nextTile.idx - this.width + this.grid.length) % this.grid.length
        ];
    }
    return nextTile;
  }

  getStartOfFirstClue(clueDirection: Direction): PuzzleTile {
    return this.grid.find(
      (tile) =>
        !tile.isFiller &&
        tile.isStartOfWord[clueDirection] &&
        tile.clueIdx[clueDirection] === 0
    );
  }

  getPreviousTile(
    currentTile: PuzzleTile,
    clueDirection: Direction
  ): PuzzleTile {
    let prevIdx =
      currentTile.wordIdxs[clueDirection][
        currentTile.wordIdxs[clueDirection].findIndex(
          (idx) => idx === currentTile.idx
        ) - 1
      ];
    if (prevIdx === undefined) {
      // at start of current word
      return this.getEndOfPrevClueTile(currentTile, clueDirection);
    }

    return this.grid[prevIdx];
  }

  getNextTile(currentTile: PuzzleTile, clueDirection: Direction): PuzzleTile {
    let nextIdx =
      currentTile.wordIdxs[clueDirection][
        currentTile.wordIdxs[clueDirection].findIndex(
          (idx) => idx === currentTile.idx
        ) + 1
      ];
    if (nextIdx === undefined) {
      // at end of current word
      return this.getStartOfNextClueTile(currentTile, clueDirection);
    }

    return this.grid[nextIdx];
  }

  getStartOfNextClueTile(
    currentTile: PuzzleTile,
    clueDirection: Direction
  ): PuzzleTile {
    const nextClueIdx =
      (currentTile.clueIdx[clueDirection] + 1) %
      this.clues[clueDirection].length;

    return this.grid.find((tile) => {
      return (
        !tile.isFiller &&
        tile.isStartOfWord[clueDirection] &&
        tile.clueIdx[clueDirection] === nextClueIdx
      );
    });
  }

  getEndOfPrevClueTile(
    currentTile: PuzzleTile,
    clueDirection: Direction
  ): PuzzleTile {
    const prevClueIdx =
      (currentTile.clueIdx[clueDirection] - 1) %
      this.clues[clueDirection].length;

    return this.grid.find((tile) => {
      return (
        !tile.isFiller &&
        tile.isEndOfWord[clueDirection] &&
        tile.clueIdx[clueDirection] === prevClueIdx
      );
    });
  }

  private isStartOfWord(idx: number, clueDirection: Direction): boolean {
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

  private isEndOfWord(idx: number, clueDirection: Direction): boolean {
    if (this.isFillerTile(idx) || this.onStartingEdge(idx, clueDirection)) {
      return false;
    }
    if (this.onEndingEdge(idx, clueDirection)) {
      return true;
    }
    return (
      this.isFillerTile(this.incIdx(idx, clueDirection)) &&
      !this.isFillerTile(this.decIdx(idx, clueDirection))
    );
  }

  private incIdx(i: number, clueDirection: Direction): number {
    return clueDirection === Direction.Across ? i + 1 : i + this.width; // Direction.Down
  }

  private decIdx(i: number, clueDirection: Direction): number {
    return clueDirection === Direction.Across ? i - 1 : i - this.width; // Direction.Down
  }

  private onStartingEdge(i: number, clueDirection: Direction): boolean {
    return clueDirection === Direction.Across
      ? i % this.width === 0 // leftmost column
      : i < this.width; // top row
  }

  private onEndingEdge(i: number, clueDirection: Direction): boolean {
    return clueDirection === Direction.Across
      ? i % this.width === this.width - 1 // rightmost column
      : i >= this.state.length - this.width; // bottom row
  }

  private getWordIdxs(idx: number, clueDirection: Direction): number[] {
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

    return [...idxs.values()];
  }
}
