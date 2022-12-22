<script lang="ts">
  import { Direction, PuzzleTile } from "./types";
  import { onMount } from "svelte";
  import { Puzzle } from "./data/puzzle";
  import examplePuz from "./testdata/example";
  import Tile from "./components/Tile.svelte";

  // TODO probably fetch a parsedpuz object from backend based on current url
  // so like /asdfasdf calls the backend for puzzle id:asdfasdf and uses renders the response
  let puzzle = new Puzzle(examplePuz);
  let clueDirection = Direction.Across;
  let selectedTile = puzzle.getStartOfFirstClue(clueDirection);
  let tileElements = [];

  onMount(() => {
    // so typing works without clicking anything on first load
    tileElements[selectedTile.idx].focus();
  });

  function selectTile(tile: PuzzleTile): void {
    if (tile.isFiller) {
      tileElements[selectedTile.idx].focus();
      return;
    }
    if (tile.idx === selectedTile.idx) {
      toggleClueDirection();
    }
    if (tile.wordIdxs[clueDirection].length <= 1) {
      toggleClueDirection();
    }
    selectedTile = tile;
    tileElements[tile.idx].focus();
    console.log(puzzle.clues[clueDirection][selectedTile.clueIdx[clueDirection]]);
  }

  function setTileValue(tile: PuzzleTile, value: string): void {
    puzzle.setStateValue(tile.idx, value);
    puzzle = puzzle;
  }

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

  function toggleClueDirection(): void {
    if (clueDirection === Direction.Across) {
      clueDirection = Direction.Down;
    } else {
      clueDirection = Direction.Across;
    }
  }
</script>

<main>
  <div class="board" style="--boardSize: {puzzle.width};">
    {#each puzzle.grid as tile, idx}
      <Tile
        value={puzzle.state[idx]}
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
</main>

<style>
  * {
    margin: 0;
    padding: 0;
  }

  .board {
    border: solid 1px black;
    display: grid;
    width: calc(var(--boardSize) * 50px);
    grid-template-columns: repeat(var(--boardSize), 50px);
    grid-template-rows: repeat(var(--boardSize), 50px);
  }
</style>
