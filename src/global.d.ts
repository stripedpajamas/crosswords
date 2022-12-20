/// <reference types="svelte" />

export interface ParsedPuz {
    solution: string;
    state: string[]; // string is outputted by @confuzzle/readpuz
    title: string;
    author: string;
    copyright: string;
    width: number;
    height: number;
    clues: string[];
}
