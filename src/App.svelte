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
</script>

<main style="--boardSize: {puzzle.width};">
  <div class="clue-bar">
    <h3>{currentClue.idx + 1}. {currentClue.clue}</h3>
  </div>
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
  <div class="clue-list">
    <div class="clue-list-across">
      <h3>Across</h3>
      <ul>
        {#each puzzle.clues[Direction.Across] as clue, idx}
          <li>
            <span
              class="clue-text"
              class:selected-clue={clueDirection === Direction.Across &&
                idx === currentClue.idx}>{idx + 1}. {clue}</span
            >
          </li>
        {/each}
      </ul>
    </div>
    <div class="clue-list-down">
      <h3>Down</h3>
      <ul>
        {#each puzzle.clues[Direction.Down] as clue, idx}
          <li>
            <span
              class="clue-text"
              class:selected-clue={clueDirection === Direction.Down &&
                idx === currentClue.idx}>{idx + 1}. {clue}</span
            >
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<style>
  * {
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

  .clue-bar {
    display: grid;
    align-items: center;
    justify-items: center;
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    text-align: center;
  }

  .clue-list {
    grid-column: 2 / 3;
    grid-row: 2 / 4;
    margin-left: 10px;
    display: grid;
    grid-template-rows: repeat(2, calc(var(--boardSize) * 50px / 2));
  }

  .clue-list > div > h3 {
    border-top: 2px solid black;
    border-bottom: 2px solid black;
    padding: 8px 0 8px 0;
  }

  .clue-list > div > ul > li {
    list-style: none;
  }

  .clue-list > div {
    overflow: hidden;
  }

  .clue-list > div > ul {
    height: 100%;
    overflow-y: scroll;
    list-style-position: inside;
  }

  .clue-list-across {
  }

  .clue-list-down {
  }

  .selected-clue {
    background-color: rgba(135, 206, 250, 0.4);
    padding: 0.1em 0.2em;
  }
</style>
