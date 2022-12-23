<script lang="ts">
  import { Direction, PuzzleTile } from "./types";
  import { onMount } from "svelte";
  import { Puzzle } from "./data/puzzle";
  import examplePuz from "./testdata/example";
  import Tile from "./components/Tile.svelte";
  import ClueList from "./components/ClueList.svelte";
  import ClueBar from "./components/ClueBar.svelte";

  // TODO probably fetch a parsedpuz object from backend based on current url
  // so like /asdfasdf calls the backend for puzzle id:asdfasdf and uses renders the response
  let puzzle = new Puzzle(examplePuz);
  let clueDirection = Direction.Across;
  let selectedTile = puzzle.getStartOfFirstClue(clueDirection);
  let tileElements = [];

  let currentClue: { clue: string; idx: number } | undefined;
  $: currentClue = puzzle.getClueForTile(selectedTile, clueDirection);

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

  function selectClue(direction: Direction, clueIdx: number): void {
    // If they click a clue that we're already "on", don't try to select it (which would
    // toggle the clue direction).
    if (selectedTile.clueIdx[direction] === clueIdx && clueDirection === direction) {
      return;
    }
    selectTile(puzzle.getStartingTileForClue(direction, clueIdx));
  }
</script>

<main style="--boardSize: {puzzle.width};">
  <ClueBar currentClue={currentClue} />
  <div class="board">
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
  <ClueList
    selectClue={selectClue}
    clues={puzzle.clues}
    currentClue={currentClue}
    clueDirection={clueDirection}
  />
</main>

<style lang="scss">
  :global(*) {
    margin: 0;
    padding: 0;
  }

  main {
    display: grid;
    width: 100%;
    grid-template-columns: calc(var(--boardSize) * 50px) 300px;
    grid-template-rows: 50px calc(var(--boardSize) * 50px);
  }

  .board {
    display: grid;
    grid-column: 1 / 2;
    grid-row: 2 / 3;
    width: calc(var(--boardSize) * 50px);
    grid-template-columns: repeat(var(--boardSize), 50px);
    grid-template-rows: repeat(var(--boardSize), 50px);
  }
</style>
