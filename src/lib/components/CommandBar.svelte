<script lang="ts">
  import FaExclamationTriangle from 'svelte-icons/fa/FaExclamationTriangle.svelte'
  import FaCheckDouble from 'svelte-icons/fa/FaCheckDouble.svelte'
  import FaInfo from 'svelte-icons/fa/FaInfo.svelte'

  export let clearPuzzle: () => void;
</script>

<div class="command-bar">
  <button on:click={clearPuzzle} title="Clear puzzle" class="dangerous"><FaExclamationTriangle /></button>
  <button title="Check puzzle"><FaCheckDouble /></button>
  <button title="Puzzle info"><FaInfo /></button>
</div>

<style lang="scss">
  .command-bar {
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-columns: repeat(3, min-content);
    column-gap: 1em;
    button {
      background-color: transparent;
      border: none;
      width: 2em;
      height: 2em;
      &.dangerous:hover {
          color: red;
        }
      &:hover {
        color: lightskyblue;

      }
    }
  }
</style>
