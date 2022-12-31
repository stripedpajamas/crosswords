import { Direction } from '$lib/types';
import type { ParsedPuz, PuzzleTile } from '$lib/types';

const { Across, Down } = Direction;

export class Puzzle {
	static FILLER = '.';
	static BLANK = '-';

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
		this.state = parsedPuz.state.split('');
		this.title = parsedPuz.title;
		this.author = parsedPuz.author;
		this.copyright = parsedPuz.copyright;
		this.width = parsedPuz.width;
		this.height = parsedPuz.height;
		this.clueList = parsedPuz.clues;

		this.clues = {
			[Across]: [],
			[Down]: []
		};
		this.grid = [];

		let clueIdx = 0;
		for (let i = 0; i < this.solution.length; i++) {
			const value = this.solution[i];

			if (this.isFillerTile(i)) {
				this.grid[i] = { idx: i, isFiller: true };
				continue;
			}

			const isStartOfWordAcross = this.isStartOfWord(i, Across);
			const isStartOfWordDown = this.isStartOfWord(i, Down);
			const isEndOfWordAcross = this.isEndOfWord(i, Across);
			const isEndOfWordDown = this.isEndOfWord(i, Down);
			const wordIdxsAcross = [...this.getWordIdxs(i, Across).values()];
			const wordIdxsDown = [...this.getWordIdxs(i, Down).values()];
			wordIdxsAcross.sort((a, b) => a - b);
			wordIdxsDown.sort((a, b) => a - b);
			const wordIdxs = { [Across]: wordIdxsAcross, [Down]: wordIdxsDown };

			const potentialClueStartAcross = this.grid[Math.min(...wordIdxsAcross)];
			const potentialClueStartDown = this.grid[Math.min(...wordIdxsDown)];

			const tileClueIdx = { [Across]: -1, [Down]: -1 };
			if (potentialClueStartAcross && !potentialClueStartAcross.isFiller) {
				tileClueIdx[Across] = potentialClueStartAcross.clueIdx.Across;
			}
			if (potentialClueStartDown && !potentialClueStartDown.isFiller) {
				tileClueIdx[Down] = potentialClueStartDown.clueIdx.Down;
			}

			// PUZ lists Across clues before Down clues when they start on the same tile.
			if (isStartOfWordAcross) {
				tileClueIdx[Across] = this.clues[Across].push(this.clueList[clueIdx++]) - 1;
			}
			if (isStartOfWordDown) {
				tileClueIdx[Down] = this.clues[Down].push(this.clueList[clueIdx++]) - 1;
			}

			this.grid[i] = {
				idx: i,
				isFiller: false,
				isStartOfWord: {
					[Across]: isStartOfWordAcross,
					[Down]: isStartOfWordDown
				},
				isEndOfWord: {
					[Across]: isEndOfWordAcross,
					[Down]: isEndOfWordDown
				},
				clueIdx: tileClueIdx,
				wordIdxs
			};
		}
	}

	static isAlpha(value: string): boolean {
		return value >= 'A' && value <= 'Z';
	}

	isFull(): boolean {
		return this.state.every((_, i) => !this.isBlankTile(i));
	}

	getErrors(): Set<number> {
		const errors = new Set<number>();
		for (let i = 0; i < this.solution.length; i++) {
			if (!this.isBlankTile(i) && this.solution[i] !== this.state[i]) {
				errors.add(i);
			}
		}
		return errors;
	}

	getInfo(): { title: string; author: string; copyright: string } {
		return {
			title: this.title,
			author: this.author,
			copyright: this.copyright
		};
	}

	checkPuzzle(): boolean {
		return this.state.every((x, i) => x === this.solution[i]);
	}

	setStateValue(idx: number, value: string): void {
		this.state[idx] = value;
	}

	getState(idx: number): string {
		return this.state[idx % this.state.length];
	}

	isFillerTile(idx: number): boolean {
		return this.state[idx] === Puzzle.FILLER;
	}

	isBlankTile(idx: number): boolean {
		return this.state[idx] === Puzzle.BLANK;
	}

	clearPuzzle() {
		this.state = this.state.map((x) => (x !== Puzzle.FILLER ? Puzzle.BLANK : Puzzle.FILLER));
	}

	getStartingTileForClue(clueDirection: Direction, clueIdx: number): PuzzleTile {
		return this.grid.find(
			(tile) => !tile.isFiller && tile.isStartOfWord && tile.clueIdx[clueDirection] === clueIdx
		)!;
	}

	getClueForTile(tile: PuzzleTile, clueDirection: Direction): { clue: string; idx: number } | null {
		if (tile.isFiller) return null;
		return {
			clue: this.clues[clueDirection][tile.clueIdx[clueDirection]],
			idx: tile.clueIdx[clueDirection]
		};
	}

	getPlayTileRight(tile: PuzzleTile): PuzzleTile | undefined {
		let nextTile = this.grid[tile.idx + 1];
		if (this.onStartingEdge(nextTile.idx, Across)) {
			return;
		}
		while (nextTile.isFiller) {
			if (this.onEndingEdge(nextTile.idx, Across)) {
				return;
			}
			nextTile = this.grid[nextTile.idx + 1];
		}
		return nextTile;
	}

	getPlayTileLeft(tile: PuzzleTile): PuzzleTile | undefined {
		let nextTile = this.grid[tile.idx - 1];
		if (this.onEndingEdge(nextTile.idx, Across)) {
			return;
		}
		while (nextTile.isFiller) {
			if (this.onStartingEdge(nextTile.idx, Across)) {
				return;
			}
			nextTile = this.grid[nextTile.idx - 1];
		}
		return nextTile;
	}

	getPlayTileDown(tile: PuzzleTile): PuzzleTile | undefined {
		let nextTile = this.grid[(tile.idx + this.width) % this.grid.length];
		if (this.onStartingEdge(nextTile.idx, Down)) {
			return;
		}
		while (nextTile.isFiller) {
			if (this.onEndingEdge(nextTile.idx, Down)) {
				return;
			}
			nextTile = this.grid[(nextTile.idx + this.width) % this.grid.length];
		}
		return nextTile;
	}

	getPlayTileUp(tile: PuzzleTile): PuzzleTile | undefined {
		let nextTile = this.grid[(tile.idx - this.width + this.grid.length) % this.grid.length];
		if (this.onEndingEdge(nextTile.idx, Down)) {
			return;
		}
		while (nextTile.isFiller) {
			if (this.onStartingEdge(nextTile.idx, Down)) {
				return;
			}
			nextTile = this.grid[(nextTile.idx - this.width + this.grid.length) % this.grid.length];
		}
		return nextTile;
	}

	getStartOfFirstClue(clueDirection: Direction): PuzzleTile {
		return this.getStartingTileForClue(clueDirection, 0)!;
	}

	getPreviousTile(currentTile: PuzzleTile, clueDirection: Direction): PuzzleTile {
		if (currentTile.isFiller) {
			throw new Error('unsupported to call getPreviousTile on a filler tile');
		}
		let prevIdx =
			currentTile.wordIdxs[clueDirection][
				currentTile.wordIdxs[clueDirection].findIndex((idx) => idx === currentTile.idx) - 1
			];
		if (prevIdx === undefined) {
			// at start of current word
			return this.getEndOfPrevClueTile(currentTile, clueDirection);
		}

		return this.grid[prevIdx];
	}

	getNextTile(currentTile: PuzzleTile, clueDirection: Direction): PuzzleTile {
		if (currentTile.isFiller) {
			throw new Error('unsupported to call getNextTile on a filler tile');
		}
		let nextIdx =
			currentTile.wordIdxs[clueDirection][
				currentTile.wordIdxs[clueDirection].findIndex((idx) => idx === currentTile.idx) + 1
			];
		if (nextIdx === undefined) {
			// at end of current word
			return this.getStartOfNextClueTile(currentTile, clueDirection);
		}

		return this.grid[nextIdx];
	}

	getStartOfNextClueTile(currentTile: PuzzleTile, clueDirection: Direction): PuzzleTile {
		if (currentTile.isFiller) {
			throw new Error('unsupported to call getStartOfNextClueTile on a filler tile');
		}
		const nextClueIdx = (currentTile.clueIdx[clueDirection] + 1) % this.clues[clueDirection].length;

		return this.grid.find((tile) => {
			return (
				!tile.isFiller &&
				tile.isStartOfWord[clueDirection] &&
				tile.clueIdx[clueDirection] === nextClueIdx
			);
		})!;
	}

	getEndOfPrevClueTile(currentTile: PuzzleTile, clueDirection: Direction): PuzzleTile {
		if (currentTile.isFiller) {
			throw new Error('unsupported to call getEndOfPrevClueTile on a filler tile');
		}
		const prevClueIdx = (currentTile.clueIdx[clueDirection] - 1) % this.clues[clueDirection].length;

		return this.grid.find((tile) => {
			return (
				!tile.isFiller &&
				tile.isEndOfWord[clueDirection] &&
				tile.clueIdx[clueDirection] === prevClueIdx
			);
		})!;
	}

	private isStartOfWord(idx: number, clueDirection: Direction): boolean {
		if (this.isFillerTile(idx) || this.onEndingEdge(idx, clueDirection)) {
			return false;
		}
		if (
			this.onStartingEdge(idx, clueDirection) &&
			!this.isFillerTile(this.incIdx(idx, clueDirection))
		) {
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
		if (
			this.onEndingEdge(idx, clueDirection) &&
			!this.isFillerTile(this.decIdx(idx, clueDirection))
		) {
			return true;
		}
		return (
			this.isFillerTile(this.incIdx(idx, clueDirection)) &&
			!this.isFillerTile(this.decIdx(idx, clueDirection))
		);
	}

	private incIdx(i: number, clueDirection: Direction): number {
		return clueDirection === Across ? i + 1 : i + this.width; // Down
	}

	private decIdx(i: number, clueDirection: Direction): number {
		return clueDirection === Across ? i - 1 : i - this.width; // Down
	}

	private onStartingEdge(i: number, clueDirection: Direction): boolean {
		return clueDirection === Across
			? i % this.width === 0 // leftmost column
			: i < this.width; // top row
	}

	private onEndingEdge(i: number, clueDirection: Direction): boolean {
		return clueDirection === Across
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
