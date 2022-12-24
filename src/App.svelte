<script lang="ts">
  import { Direction, PuzzleTile } from "./types";
  import { onMount } from "svelte";
  import { Puzzle } from "./data/puzzle";
  import examplePuz from "./testdata/example";
  import ClueList from "./components/ClueList.svelte";
  import ClueBar from "./components/ClueBar.svelte";
  import Board from "./components/Board.svelte";
  import CommandBar from "./components/CommandBar.svelte";

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
    if (
      selectedTile.clueIdx[direction] === clueIdx &&
      clueDirection === direction
    ) {
      return;
    }
    selectTile(puzzle.getStartingTileForClue(direction, clueIdx));
  }

  function clearPuzzle() {
    puzzle.clearPuzzle();
    puzzle = puzzle;
  }
</script>

<main style="--boardSize: {puzzle.width};">
  <ClueBar {currentClue} />
  <CommandBar clearPuzzle={clearPuzzle} />
  <Board
    {puzzle}
    {clueDirection}
    {selectedTile}
    {tileElements}
    {selectTile}
    {setTileValue}
  />
  <ClueList {selectClue} clues={puzzle.clues} {currentClue} {clueDirection} />
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
</style>
