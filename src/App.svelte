<script lang="ts">
  import type { ParsedPuz } from './global';
  import Tile from './components/Tile.svelte';

  enum Direction {
    Across,
    Down,
  }

  // TODO probably fetch a parsedpuz object from backend based on current url
  // so like /asdfasdf calls the backend for puzzle id:asdfasdf and uses renders the response
  let puzzle: ParsedPuz = {
    solution: '.H.P.F...A.T.F.MONOPOLY.CARBON.N.L.R.E.T.A.U.CONE.TALLORDERS.R...R.L.R.E.T.ASPIRE.OBSERVER...N.S.W...O.E..GUESS.B.MOURN..R.B...E.E.T...REPRISAL.TREATY.E.I.A.L.H...O.ANTARCTICA.DOWN.E.T.R.E.N.O.A.FREEZE.DROLLERY.Y.D.D...L.E.D.',
    state: '.-.-.-...-.-.-.--------.------.-.-.-.-.-.-.-.----.----------.-...-.-.-.-.-.------.--------...-.-.-...-.-..-----.-.-----..-.-...-.-.-...--------.------.-.-.-.-.-...-.----------.----.-.-.-.-.-.-.-.------.--------.-.-.-...-.-.-.'.split(''),
    title: 'cru cryptic 229',
    author: 'Dan Chall',
    copyright: 'Dan ©hall',
    width: 15,
    height: 15,
    clues: [
      'Switch on, or stop holding the right to drive? (6)',
      'Fishing gear with magnetic end (4)',
      "A stronghold for Rapunzel's pride (8)",
      'Editors ousting Red agents (6)',
      'A rude otter swimming where the merchant vessels go (5,5)',
      'A little Fresca? Our Peg? No, Seven and Seven (8)',
      'Monday, old parrot talking a good game (8)',
      `Lily-livered shout "it hurts!" by telephone's inventor that is a little dazed (6-7)`,
      'Oscar Bonavena embraces the basis of life on Earth (6)',
      'Tip of cue touches yellow ball (solid) (4)',
      "Story about God and radical socialist's difficult challenges (4,6)",
      "Aim for something high, a steeple's top (6)",
      'Stinko? Be daintier. Tipsy. (10)',
      'One seeing an obstetrical nurse? (8)',
      'Fancy segues in segues, segues (5)',
      'Magritte comes back, dressed in dreary vegetation (8)',
      "Grieve over Mom's half-full container of ashes (5)",
      'On the lam, sick from wood alcohol (8)',
      'Err, a slip, bombed in retaliation (8)',
      'Badly scared by Divine (6)',
      'A compact as a special gift? (6)',
      'Looking back, a period surrounding war is propitious (6)',
      'Art: I can act crazy in the deep deep South? (10)',
      'Feathers fell (4)',
      'Do the French pay in charity? (4)',
      'Fix a price of zero--half of zero (6)',
      'Sitcom actress in dry humor (8)'
    ],
  }

  let selectedTileIdx = 0;
  let clueDirection = Direction.Across

  function isAlpha(value: string): boolean {
    return value >= 'A' && value <= 'Z';
  }

  function handleTileUpdate(tileIdx: number, value: string): void {
    if (!isAlpha(value)) {
      return;
    }

    puzzle.state[tileIdx] = value;
    puzzle = puzzle;
  }

  function handleTileClick(tileIdx: number): void {
    if (isFiller(puzzle.state[tileIdx])) {
      return;
    }
    selectedTileIdx = tileIdx;
  }

  function handleTileKey(tileIdx: number, event: KeyboardEvent): void {
    const key = event.key.toUpperCase();
    if (key.length === 1 && isAlpha(key)) {
      puzzle.state[tileIdx] = key;
    }

    switch (key) {
      case 'BACKSPACE': {
        puzzle.state[tileIdx] = '-';
      }
    }

    puzzle = puzzle;
  }

  function getNextTileIdx(currentTileIdx: number): number {
    // TODO skip fillers, and respect current clue direction
    return 0;
  }

  function isBlank(tileValue: string): boolean {
    return tileValue === '-';
  }

  function isFiller(tileValue: string): boolean {
    return tileValue === '.';
  }
</script>

<main>
  <div class="board" style="--boardSize: {puzzle.width};">
    {#each puzzle.state as value, idx}
      <Tile
        value={value}
        filler={isFiller(value)}
        blank={isBlank(value)}
        selected={selectedTileIdx === idx && !isFiller(value)}
        on:click={() => handleTileClick(idx)}
        on:keyup={(e) => handleTileKey(idx, e)}
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
