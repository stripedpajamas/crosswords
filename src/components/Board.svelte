<script lang="ts">
  import { Puzzle } from "../data/puzzle";
  import type { Direction, PuzzleTile } from "../types";
  import Tile from "./Tile.svelte";

  export let puzzle: Puzzle;
  export let selectedTile: PuzzleTile;
  export let clueDirection: Direction;
  export let selectTile: (tile: PuzzleTile) => void;
  export let setTileValue: (tile: PuzzleTile, value: string) => void;
  export let tileElements: HTMLButtonElement[];

  function handleTileClick(tile: PuzzleTile): void {
    return selectTile(tile);
  }

  function handleTileKey(tile: PuzzleTile, event: KeyboardEvent): void {
    const key = event.key.toUpperCase();
    if (key.length === 1 && Puzzle.isAlpha(key)) {
      setTileValue(tile, key);
      selectTile(puzzle.getNextTile(tile, clueDirection));
    }

    switch (key) {
      case "ARROWRIGHT": {
        const nextTile = puzzle.getPlayTileRight(tile);
        if (nextTile) {
          selectTile(nextTile);
        }
        break;
      }
      case "ARROWLEFT": {
        const nextTile = puzzle.getPlayTileLeft(tile);
        if (nextTile) {
          selectTile(nextTile);
        }
        break;
      }
      case "ARROWDOWN": {
        const nextTile = puzzle.getPlayTileDown(tile);
        if (nextTile) {
          selectTile(nextTile);
        }
        break;
      }
      case "ARROWUP": {
        const nextTile = puzzle.getPlayTileUp(tile);
        if (nextTile) {
          selectTile(nextTile);
        }
        break;
      }
      case "BACKSPACE": {
        const prevTile = puzzle.getPreviousTile(tile, clueDirection);
        if (puzzle.isBlankTile(tile.idx) && prevTile) {
          setTileValue(prevTile, Puzzle.BLANK);
        } else {
          setTileValue(tile, Puzzle.BLANK);
        }
        if (prevTile) {
          selectTile(prevTile);
        }
        break;
      }
    }
  }
</script>

<div class="board">
  {#each puzzle.grid as tile, idx}
    <Tile
      value={puzzle.getState(idx)}
      filler={tile.isFiller}
      blank={puzzle.isBlankTile(idx)}
      selected={tile.idx === selectedTile.idx}
      inSelectedWord={selectedTile.wordIdxs[clueDirection].includes(idx)}
      on:click={() => handleTileClick(tile)}
      on:keyup={(e) => handleTileKey(tile, e)}
      bind:ref={tileElements[idx]}
    />
  {/each}
</div>

<style lang="scss">
  .board {
    display: grid;
    grid-column: 1 / 2;
    grid-row: 2 / 3;
    width: calc(var(--boardSize) * 50px);
    grid-template-columns: repeat(var(--boardSize), 50px);
    grid-template-rows: repeat(var(--boardSize), 50px);
  }
</style>
