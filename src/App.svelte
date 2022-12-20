<script lang="ts">
  import { onMount } from "svelte";
  import type { ParsedPuz } from "./global";
  import Tile from "./components/Tile.svelte";

  enum Direction {
    Across,
    Down,
  }

  // TODO probably fetch a parsedpuz object from backend based on current url
  // so like /asdfasdf calls the backend for puzzle id:asdfasdf and uses renders the response
  let puzzle: ParsedPuz = {
    solution:
      ".H.P.F...A.T.F.MONOPOLY.CARBON.N.L.R.E.T.A.U.CONE.TALLORDERS.R...R.L.R.E.T.ASPIRE.OBSERVER...N.S.W...O.E..GUESS.B.MOURN..R.B...E.E.T...REPRISAL.TREATY.E.I.A.L.H...O.ANTARCTICA.DOWN.E.T.R.E.N.O.A.FREEZE.DROLLERY.Y.D.D...L.E.D.",
    state:
      ".-.-.-...-.-.-.--------.------.-.-.-.-.-.-.-.----.----------.-...-.-.-.-.-.------.--------...-.-.-...-.-..-----.-.-----..-.-...-.-.-...--------.------.-.-.-.-.-...-.----------.----.-.-.-.-.-.-.-.------.--------.-.-.-...-.-.-.".split(
        ""
      ),
    title: "cru cryptic 229",
    author: "Dan Chall",
    copyright: "Dan ©hall",
    width: 15,
    height: 15,
    clues: [
      "Switch on, or stop holding the right to drive? (6)",
      "Fishing gear with magnetic end (4)",
      "A stronghold for Rapunzel's pride (8)",
      "Editors ousting Red agents (6)",
      "A rude otter swimming where the merchant vessels go (5,5)",
      "A little Fresca? Our Peg? No, Seven and Seven (8)",
      "Monday, old parrot talking a good game (8)",
      `Lily-livered shout "it hurts!" by telephone's inventor that is a little dazed (6-7)`,
      "Oscar Bonavena embraces the basis of life on Earth (6)",
      "Tip of cue touches yellow ball (solid) (4)",
      "Story about God and radical socialist's difficult challenges (4,6)",
      "Aim for something high, a steeple's top (6)",
      "Stinko? Be daintier. Tipsy. (10)",
      "One seeing an obstetrical nurse? (8)",
      "Fancy segues in segues, segues (5)",
      "Magritte comes back, dressed in dreary vegetation (8)",
      "Grieve over Mom's half-full container of ashes (5)",
      "On the lam, sick from wood alcohol (8)",
      "Err, a slip, bombed in retaliation (8)",
      "Badly scared by Divine (6)",
      "A compact as a special gift? (6)",
      "Looking back, a period surrounding war is propitious (6)",
      "Art: I can act crazy in the deep deep South? (10)",
      "Feathers fell (4)",
      "Do the French pay in charity? (4)",
      "Fix a price of zero--half of zero (6)",
      "Sitcom actress in dry humor (8)",
    ],
  };

  let clueDirection = Direction.Across;
  let selectedTileIdx = getFirstAcrossClueIdx();
  let selectedWordTileIdxs = getWordBoundaryIdxs(selectedTileIdx);
  let tileElements = [];

  onMount(() => {
    // so typing works without clicking anything on first load
    tileElements[selectedTileIdx].focus();
  });

  function isAlpha(value: string): boolean {
    return value >= "A" && value <= "Z";
  }

  function selectTile(tileIdx: number): void {
    if (tileIdx >= puzzle.state.length) {
      return selectTile(getFirstAcrossClueIdx());
    }
    if (!idxInBounds(tileIdx) || isFiller(puzzle[tileIdx])) {
      return;
    }
    if (tileIdx === selectedTileIdx) {
      toggleClueDirection();
    }
    selectedWordTileIdxs = getWordBoundaryIdxs(tileIdx);
    if (selectedWordTileIdxs.size <= 1) {
      toggleClueDirection();
      selectedWordTileIdxs = getWordBoundaryIdxs(tileIdx);
    }
    selectedTileIdx = tileIdx;
    tileElements[tileIdx].focus();
  }

  function getWordBoundaryIdxs(idx: number): Set<number> {
    const idxs = new Set<number>();
    const forward = (i: number): number =>
      clueDirection === Direction.Across ? i + 1 : i + puzzle.width; // Direction.Down
    const back = (i: number): number =>
      clueDirection === Direction.Across ? i - 1 : i - puzzle.width; // Direction.Down
    const onStartingEdge = (i: number): boolean =>
      clueDirection === Direction.Across
        ? i % puzzle.width === 0 // leftmost column
        : i < puzzle.width; // top row
    const onEndingEdge = (i: number): boolean =>
      clueDirection === Direction.Across
        ? i % puzzle.width === puzzle.width - 1 // rightmost column
        : i >= puzzle.state.length - puzzle.width; // bottom row

    idxs.add(idx);

    let start = idx;
    while (!isFiller(puzzle.state[start])) {
      idxs.add(start);
      if (onStartingEdge(start)) {
        break;
      }
      start = back(start);
    }

    let end = start === idx ? forward(idx) : idx;
    while (!isFiller(puzzle.state[end])) {
      idxs.add(end);
      if (onEndingEdge(end)) {
        break;
      }
      end = forward(end);
    }

    return idxs;
  }

  function idxInBounds(tileIdx: number): boolean {
    return tileIdx >= 0 && tileIdx <= puzzle.state.length;
  }

  function setTileValue(idx: number, value: string): void {
    if (idxInBounds(idx)) {
      puzzle.state[idx] = value;
      puzzle = puzzle;
    }
  }

  function handleTileClick(tileIdx: number): void {
    if (isFiller(puzzle.state[tileIdx])) {
      return;
    }
    return selectTile(tileIdx);
  }

  function handleTileKey(tileIdx: number, event: KeyboardEvent): void {
    const key = event.key.toUpperCase();
    if (key.length === 1 && isAlpha(key)) {
      setTileValue(tileIdx, key);
      selectTile(getNextTileIdx(tileIdx));
    }

    switch (key) {
      case "BACKSPACE": {
        if (isBlank(puzzle.state[tileIdx])) {
          setTileValue(getPreviousTileIdx(tileIdx), "-");
        } else {
          setTileValue(tileIdx, "-");
        }
        selectTile(getPreviousTileIdx(tileIdx));
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

  function getFirstAcrossClueIdx(): number {
    // find the first group of 2 consecutive chars in the solution string
    for (let i = 1; i < puzzle.state.length; i++) {
      if (!isFiller(puzzle.state[i]) && !isFiller(puzzle.state[i - 1])) {
        return i - 1;
      }
    }
  }

  // TODO these previous/next fns don't really work. they should go to the
  // next char in the current selected word in the current clue direction, or if
  // at the boundary of a word, they should go to the start of the next clue in
  // the current clue direction.
  function getPreviousTileIdx(currentTileIdx: number): number {
    switch (clueDirection) {
      case Direction.Across: {
        let prevIdx = currentTileIdx - 1;
        while (isFiller(puzzle.state[prevIdx])) {
          prevIdx--;
        }
        return prevIdx;
      }
      case Direction.Down: {
        let prevIdx = currentTileIdx - puzzle.width;
        while (isFiller(puzzle.state[prevIdx])) {
          prevIdx--;
        }
        return prevIdx;
      }
    }
  }

  function getNextTileIdx(currentTileIdx: number): number {
    switch (clueDirection) {
      case Direction.Across: {
        let nextIdx = currentTileIdx + 1;
        while (isFiller(puzzle.state[nextIdx])) {
          nextIdx++;
        }
        return nextIdx;
      }
      case Direction.Down: {
        let nextIdx = currentTileIdx + puzzle.width;
        while (isFiller(puzzle.state[nextIdx])) {
          nextIdx++;
        }
        return nextIdx;
      }
    }
  }

  function isBlank(tileValue: string): boolean {
    return tileValue === "-";
  }

  function isFiller(tileValue: string): boolean {
    return tileValue === ".";
  }
</script>

<main>
  <div class="board" style="--boardSize: {puzzle.width};">
    {#each puzzle.state as value, idx}
      <Tile
        {value}
        filler={isFiller(value)}
        blank={isBlank(value)}
        selected={selectedTileIdx === idx && !isFiller(value)}
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
