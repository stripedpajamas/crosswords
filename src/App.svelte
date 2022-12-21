<script lang="ts">
  import { Direction } from "./types";
  import { onMount } from "svelte";
  import { Puzzle } from "./data/puzzle";
  import examplePuz from './testdata/example';
  import Tile from "./components/Tile.svelte";

  // TODO probably fetch a parsedpuz object from backend based on current url
  // so like /asdfasdf calls the backend for puzzle id:asdfasdf and uses renders the response
  let puzzle = new Puzzle(examplePuz);
  let clueDirection = Direction.Across;
  let selectedTileIdx = puzzle.getFirstAcrossClueIdx();
  let selectedWordTileIdxs = puzzle.getWordBoundaryIdxs(selectedTileIdx, clueDirection);
  let tileElements = [];

  onMount(() => {
    // so typing works without clicking anything on first load
    tileElements[selectedTileIdx].focus();
  });

  function selectTile(tileIdx: number): void {
    if (!puzzle.idxInBounds(tileIdx) || puzzle.isFiller(tileIdx)) {
      return;
    }
    if (tileIdx === selectedTileIdx) {
      toggleClueDirection();
    }
    selectedWordTileIdxs = puzzle.getWordBoundaryIdxs(tileIdx, clueDirection);
    if (selectedWordTileIdxs.size <= 1) {
      toggleClueDirection();
      selectedWordTileIdxs = puzzle.getWordBoundaryIdxs(tileIdx, clueDirection);
    }
    selectedTileIdx = tileIdx;
    tileElements[tileIdx].focus();
  }

  function setTileValue(idx: number, value: string): void {
    puzzle.setStateValue(idx, value);
    puzzle = puzzle;
  }

  function handleTileClick(tileIdx: number): void {
    if (puzzle.isFiller(tileIdx)) {
      return;
    }
    return selectTile(tileIdx);
  }

  function handleTileKey(tileIdx: number, event: KeyboardEvent): void {
    const key = event.key.toUpperCase();
    if (key.length === 1 && Puzzle.isAlpha(key)) {
      setTileValue(tileIdx, key);
      selectTile(puzzle.getNextTileIdx(tileIdx, clueDirection));
    }

    switch (key) {
      case "BACKSPACE": {
        if (puzzle.isBlank(tileIdx)) {
          setTileValue(puzzle.getPreviousTileIdx(tileIdx, clueDirection), Puzzle.BLANK);
        } else {
          setTileValue(tileIdx, Puzzle.BLANK);
        }
        selectTile(puzzle.getPreviousTileIdx(tileIdx, clueDirection));
        break;
      }
      case " ": {
        toggleClueDirection();
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
    {#each puzzle.state as value, idx}
      <Tile
        {value}
        filler={puzzle.isFiller(idx)}
        blank={puzzle.isBlank(idx)}
        selected={selectedTileIdx === idx && !puzzle.isFiller(idx)}
        inSelectedWord={selectedWordTileIdxs.has(idx)}
        on:click={() => handleTileClick(idx)}
        on:keyup={(e) => handleTileKey(idx, e)}
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
