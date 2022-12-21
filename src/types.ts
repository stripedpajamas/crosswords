export enum Direction {
  Across,
  Down,
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
