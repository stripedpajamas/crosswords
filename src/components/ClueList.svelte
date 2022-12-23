<script lang="ts">
  import { Direction } from "../types";

  export let clues: { [key in Direction]: string[] };
  export let clueDirection: Direction;
  export let currentClue: { clue: string; idx: number };

  export let selectClue: (direction: Direction, idx: number) => void;

  function handleKeyDown(event: KeyboardEvent, direction: Direction, clueIdx: number): void {
    // TODO
  }
</script>

<div class="clue-list">
  <div class="clue-list-across">
    <h3>Across</h3>
    <ul>
      {#each clues[Direction.Across] as clue, idx}
        <li>
          <span
            on:click={() => selectClue(Direction.Across, idx)}
            on:keydown={(e) => handleKeyDown(e, Direction.Across, idx)}
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
      {#each clues[Direction.Down] as clue, idx}
        <li>
          <span
            on:click={() => selectClue(Direction.Down, idx)}
            on:keydown={(e) => handleKeyDown(e, Direction.Across, idx)}
            class="clue-text"
            class:selected-clue={clueDirection === Direction.Down &&
              idx === currentClue.idx}>{idx + 1}. {clue}</span
          >
        </li>
      {/each}
    </ul>
  </div>
</div>

<style lang="scss">
  .clue-list {
    grid-column: 2 / 3;
    grid-row: 2 / 4;
    margin-left: 10px;
    display: grid;
    grid-template-rows: repeat(2, calc(var(--boardSize) * 50px / 2));

    div {
      overflow: hidden;
      h3 {
        border-top: 2px solid black;
        border-bottom: 2px solid black;
        padding: 8px 0 8px 0;
      }

      ul {
        height: 100%;
        overflow-y: scroll;
        list-style-position: inside;
        li {
          cursor: pointer;
          list-style: none;
        }
      }
    }
  }

  .selected-clue {
    background-color: rgba(135, 206, 250, 0.4);
    padding: 0.1em 0.2em;
  }
</style>
