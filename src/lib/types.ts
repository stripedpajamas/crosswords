export enum Direction {
	Across = 'Across',
	Down = 'Down'
}

export interface ParsedPuz {
	solution: string;
	state: string;
	title: string;
	author: string;
	copyright: string;
	width: number;
	height: number;
	clues: string[];
}

export type PuzzleTile =
	| {
			isFiller: false;
			idx: number;
			clueIdx: { [key in Direction]: number };
			wordIdxs: { [key in Direction]: number[] };
			isStartOfWord: { [key in Direction]: boolean };
			isEndOfWord: { [key in Direction]: boolean };
	  }
	| {
			isFiller: true;
			idx: number;
	  };

export type PuzzleMetadataShort = {
	title: string;
	author: string;
	imported: number;
};

export type PuzzleMetadataWithKey = PuzzleMetadataShort & {
	key: string;
};
