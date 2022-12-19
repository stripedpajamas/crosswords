/// <reference types="svelte" />

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
